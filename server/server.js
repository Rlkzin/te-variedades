'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

/* ===== Armazenamento =====
   Com SUPABASE_URL + SUPABASE_KEY configurados, os dados vão para o
   PostgreSQL (REST). Sem eles, cai no arquivo db.json (modo local). */
const SUPABASE_URL = process.env.SUPABASE_URL ? String(process.env.SUPABASE_URL).replace(/\/+$/, '') : '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const STORE_TABLE = process.env.SUPABASE_TABLE || 'store';
const useSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

/* ===== Painel da dona (oculto) =====
   ADMIN_PATH  -> endereço secreto do painel (ex.: "adm-x9k2v7"). Quando
                  definido, /admin.html passa a responder 404 e o painel
                  só existe em /<ADMIN_PATH>.
   ADMIN_PASSWORD -> senha real da dona. Não fica em nenhum arquivo do site. */
const ADMIN_PATH = process.env.ADMIN_PATH ? String(process.env.ADMIN_PATH).replace(/^\/+|\/+$/g, '') : '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ? String(process.env.ADMIN_PASSWORD) : '';

const COLLECTIONS = ['products', 'users', 'orders', 'shipping', 'banner', 'coupons', 'woovi', 'reviews'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

let db = {};
if (!useSupabase) {
  try {
    if (fs.existsSync(DB_FILE)) db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) || {};
  } catch (e) {
    console.error('[db] arquivo corrompido, começando vazio:', e.message);
    db = {};
  }
}

function sbHeaders(extra) {
  return Object.assign({ 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' }, extra || {});
}

function sb(table, opts) {
  return fetch(SUPABASE_URL + '/rest/v1/' + table, Object.assign({ headers: sbHeaders() }, opts)).then((r) => {
    if (!r.ok) throw new Error('supabase ' + r.status + ': ' + r.statusText);
    return (r.status === 200 || r.status === 201) ? r.json() : null;
  });
}

/* Carrega todas as coleções do PostgreSQL para a memória */
function loadSupabase() {
  return sb(STORE_TABLE + '?select=key,value').then((rows) => {
    db = {};
    (rows || []).forEach((row) => { db[row.key] = row.value; });
    return db;
  }).catch((e) => {
    console.error('[db] falha ao carregar do Supabase:', e.message);
    db = {};
  });
}

let writeQueue = Promise.resolve();
function enqueue(job) {
  writeQueue = writeQueue.then(job).catch((e) => console.error('[db] falha ao salvar:', e.message));
  return writeQueue;
}
/* Grava uma coleção. name = null grava o arquivo inteiro (modo local). */
function persist(name) {
  if (useSupabase) {
    return enqueue(() => sb(STORE_TABLE, {
      method: 'POST',
      headers: sbHeaders({ Prefer: 'resolution=merge-duplicates' }),
      body: JSON.stringify([{ key: name, value: db[name] }])
    }));
  }
  const snapshot = JSON.stringify(db, null, 2);
  return enqueue(() => new Promise((resolve) => {
    fs.writeFile(DB_FILE, snapshot, (err) => {
      if (err) console.error('[db] falha ao salvar:', err.message);
      resolve();
    });
  }));
}

/* ===== Tempo real (SSE) ===== */
const clients = new Set();

function broadcast(key) {
  const payload = 'data: ' + JSON.stringify({ type: 'change', key: key || null, at: Date.now() }) + '\n\n';
  clients.forEach((res) => {
    try { res.write(payload); } catch (e) { clients.delete(res); }
  });
}

function handleSSE(req, res) {
  cors(res);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.write('retry: 2000\n\n');
  res.write('data: ' + JSON.stringify({ type: 'hello', time: new Date().toISOString() }) + '\n\n');
  clients.add(res);

  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch (e) { /* ignore */ }
  }, 25000);

  const cleanup = () => {
    clearInterval(heartbeat);
    clients.delete(res);
  };
  req.on('close', cleanup);
  req.on('error', cleanup);
  res.on('close', cleanup);
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/* Se API_TOKEN estiver configurado, toda gravação precisa de Authorization: Bearer <token> */
function authorized(req) {
  if (!process.env.API_TOKEN) return true;
  const h = req.headers['authorization'] || '';
  return h === 'Bearer ' + process.env.API_TOKEN;
}

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  cors(res);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 5 * 1024 * 1024) { reject(new Error('payload too large')); req.destroy(); return; }
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) return resolve(null);
      try { resolve(JSON.parse(raw)); } catch (e) { reject(new Error('invalid json')); }
    });
    req.on('error', reject);
  });
}

function serveFile(res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 - Não encontrado');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=300',
      'Content-Length': stat.size
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  const filePath = path.resolve(ROOT, '.' + rel);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  serveFile(res, filePath);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); res.end(); return; }

  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/health') {
      sendJSON(res, 200, { ok: true, storage: useSupabase ? 'supabase' : 'file', collections: Object.keys(db), time: new Date().toISOString() });
      return;
    }
    if (pathname === '/api/db' && req.method === 'GET') {
      sendJSON(res, 200, db);
      return;
    }
    if (pathname === '/api/events' && req.method === 'GET') {
      handleSSE(req, res);
      return;
    }
    if (pathname === '/api/admin/login' && req.method === 'POST') {
      if (!ADMIN_PASSWORD) { sendJSON(res, 404, { error: 'login não habilitado' }); return; }
      readBody(req).then((value) => {
        const body = value || {};
        if (String(body.password) === ADMIN_PASSWORD) sendJSON(res, 200, { ok: true });
        else sendJSON(res, 401, { error: 'credenciais inválidas' });
      }).catch((e) => sendJSON(res, 400, { error: e.message }));
      return;
    }
    const match = pathname.match(/^\/api\/col\/([a-z]+)$/);
    if (match) {
      const name = match[1];
      if (COLLECTIONS.indexOf(name) === -1) { sendJSON(res, 404, { error: 'coleção desconhecida' }); return; }
      if (req.method === 'GET') { sendJSON(res, 200, { [name]: db[name] === undefined ? null : db[name] }); return; }
      if (req.method === 'PUT') {
        if (!authorized(req)) { sendJSON(res, 401, { error: 'sem permissão para gravar' }); return; }
        readBody(req).then((value) => {
          db[name] = value;
          persist(name);
          broadcast(name);
          sendJSON(res, 200, { ok: true, key: name });
        }).catch((e) => sendJSON(res, 400, { error: e.message }));
        return;
      }
    }
    sendJSON(res, 404, { error: 'rota não encontrada' });
    return;
  }

  /* ===== Painel da dona (oculto) =====
     Com ADMIN_PATH, /admin.html não existe mais publicamente:
     o painel só vive em /<ADMIN_PATH>. */
  const panelUrl = ADMIN_PATH ? '/' + ADMIN_PATH : '';
  const isPanelRequest = !!panelUrl && (pathname === panelUrl || pathname === panelUrl + '/');
  const isPlainAdmin = pathname === '/admin.html' || pathname === '/admin';
  if (isPlainAdmin || isPanelRequest) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405); res.end('Method Not Allowed'); return;
    }
    if (isPanelRequest) { serveFile(res, path.join(ROOT, 'admin.html')); return; }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 - Não encontrado');
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405); res.end('Method Not Allowed'); return;
  }
  serveStatic(req, res, pathname);
});

function boot() {
  server.listen(PORT, HOST, () => {
    const nets = os.networkInterfaces();
    const ips = [];
    Object.keys(nets).forEach((n) => {
      (nets[n] || []).forEach((i) => { if (i.family === 'IPv4' && !i.internal) ips.push(i.address); });
    });
    console.log('');
    console.log('  T&E Variedades - servidor no ar!');
    console.log('  ------------------------------------------');
    console.log('  Loja .......... http://localhost:' + PORT + '/');
    console.log('  Painel ......... ' + (ADMIN_PATH ? 'http://localhost:' + PORT + '/' + ADMIN_PATH + '  (endereço secreto)' : 'http://localhost:' + PORT + '/admin.html'));
    ips.forEach((ip) => {
      console.log('  Celular/Wi-Fi . http://' + ip + ':' + PORT + '/');
    });
    console.log('  Banco ......... ' + (useSupabase ? 'Supabase (PostgreSQL)' : 'server/data/db.json'));
    console.log('  (Ctrl+C para parar)');
    console.log('');
  });
}

/* No modo Supabase, espera carregar os dados antes de abrir a porta */
if (useSupabase) loadSupabase().then(boot);
else boot();
