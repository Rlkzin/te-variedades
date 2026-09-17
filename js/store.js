(function () {
  const LS = {
    products: 'te_products',
    users: 'te_users',
    session: 'te_session',
    cart: 'te_cart',
    orders: 'te_orders',
    shipping: 'te_shipping',
    banner: 'te_banner',
    coupons: 'te_coupons',
    woovi: 'te_woovi',
    email: 'te_email',
    reviews: 'te_reviews'
  };

  /* A senha da dona NÃO fica no site. Quando publicado (TE_API configurado),
     password é null e o login é validado no servidor (variável ADMIN_PASSWORD).
     "te123456" existe apenas no modo local de desenvolvimento (sem TE_API). */
  const ADMIN = { email: 'dona@te.com', password: window.TE_API ? null : 'te123456' };

const EMAIL_DEFAULTS = { serviceId: "1", templateId: "template_24ovzze", publicKey: "tVUkZu_f6VIreWiCn" };

  const seedCoupons = [
    { id: 1, code: "BEMVINDA10", type: "percent", value: 10, minSpend: 0, uses: 0, used: 0, active: true, grant: "welcome", threshold: 0, title: "Boas-vindas: 10% OFF na sua primeira compra 💖" },
    { id: 2, code: "TE150", type: "percent", value: 10, minSpend: 0, uses: 0, used: 0, active: true, grant: "threshold", threshold: 150, title: "Gastou R$150 → ganhou 10% OFF" },
    { id: 3, code: "TE300", type: "percent", value: 15, minSpend: 0, uses: 0, used: 0, active: true, grant: "threshold", threshold: 300, title: "Gastou R$300 → ganhou 15% OFF" }
  ];

const seedProducts = [
    { id: 1, name: "Kit Batom Matte Rosé", category: "maquiagem", price: 59.90, oldPrice: 79.90, emoji: "💄", image: "", desc: "Cores intensas, cobertura aveludada e longa duração." },
    { id: 2, name: "Base Líquida Hard", category: "maquiagem", price: 69.90, oldPrice: 89.90, emoji: "🧴", image: "", desc: "Acabamento natural, alta cobertura e toque seco." },
    { id: 3, name: "Paleta de Sombras Glam", category: "maquiagem", price: 89.90, oldPrice: 119.90, emoji: "🎨", image: "", desc: "12 tons vibrantes com alta pigmentação e fixação." },
    { id: 4, name: "Máscara de Cílios Volume", category: "maquiagem", price: 49.90, oldPrice: 64.90, emoji: "👁️", image: "", desc: "Cílios intensos e alongados o dia inteiro." },
    { id: 5, name: "Pó Compacto Premium", category: "maquiagem", price: 54.90, emoji: "🌬️", image: "", desc: "Controle de brilho e efeito matte impecável." },
    { id: 6, name: "Sérum Facial Glow", category: "skincare", price: 89.90, oldPrice: 119.90, emoji: "✨", image: "", desc: "Vitamina C com hidratação profunda e brilho natural." },
    { id: 7, name: "Creme Hidratante Facial", category: "skincare", price: 59.90, oldPrice: 79.90, emoji: "🧖‍♀️", image: "", desc: "Pele macia, viçosa e radiante todos os dias." },
    { id: 8, name: "Perfume Floral Bloom", category: "perfumaria", price: 149.90, oldPrice: 189.90, emoji: "🌸", image: "", desc: "Aroma floral envolvente que dura o dia todo." },
    { id: 9, name: "Protetor Solar FPS 60", category: "skincare", price: 79.90, oldPrice: 99.90, emoji: "☀️", image: "", desc: "Proteção alta, toque seco e leve na pele." },
    { id: 10, name: "Kit de Sabonetes Artesanais", category: "higiene", price: 44.90, emoji: "🌿", image: "", desc: "Sabonetes naturais com aromas que renovam os sentidos." },
    { id: 11, name: "Perfume Asa Negra Noturna", category: "perfumaria", price: 139.90, oldPrice: 179.90, emoji: "🌒", image: "", desc: "Amadeirado intenso para presença marcante." },
    { id: 12, name: "Água de Colônia Cítrica", category: "perfumaria", price: 79.90, emoji: "🍊", image: "", desc: "Refrescante e leve, perfeita para o dia a dia." },
    { id: 13, name: "Desodorante Corporal Suave", category: "higiene", price: 29.90, emoji: "🧼", image: "", desc: "Proteção 48h com toque delicado de algodão." },
    { id: 14, name: "Kit Higiene e Cuidados", category: "higiene", price: 74.90, oldPrice: 94.90, emoji: "🧺", image: "", desc: "Sabonetes, hidratante e acessórios para o dia a dia." },
    { id: 15, name: "Óleo Corporal Nutritivo", category: "skincare", price: 84.90, oldPrice: 109.90, emoji: "🫒", image: "", desc: "Nutrição e maciez com acabamento aveludado." },
    { id: 16, name: "Kit Skincare Glow Completo", category: "skincare", price: 139.90, oldPrice: 179.90, emoji: "🌟", image: "", desc: "Sérum, hidratante e protetor em um só kit." },
    { id: 17, name: "Batom Líquido Velvet Nude", category: "maquiagem", price: 49.90, emoji: "💋", image: "", desc: "Cor nude cremosa que não sai ao longo do dia." }
  ];

  const CAT_LABEL = { maquiagem: "Maquiagem", skincare: "Skincare", perfumaria: "Perfumaria", higiene: "Higiene" };

  function read(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  /* ===== Sincronização com o servidor =====
     O servidor é a fonte da verdade: quem entra puxa /api/db.
     Sem servidor (ex.: aberto via file://), tudo continua funcionando local. */
  const SHARED = ['products', 'users', 'orders', 'shipping', 'banner', 'coupons', 'woovi', 'reviews'];
  let remote = false;
  let lastPushAt = 0;
  let pollTimer = null;
  let liveSource = null;
  const watchers = [];

  function apiBase() {
    if (window.TE_API) return String(window.TE_API).replace(/\/+$/, '');
    if (location.protocol === 'http:' || location.protocol === 'https:') return location.origin;
    return 'http://localhost:3000';
  }

  function fetchJSON(url, opts, ms) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), ms || 2500) : null;
    const o = Object.assign({ cache: 'no-store' }, opts || {});
    if (ctrl) o.signal = ctrl.signal;
    return fetch(url, o).then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).finally(function () { if (timer) clearTimeout(timer); });
  }

  function applyRemote(db) {
    if (!db) return;
    SHARED.forEach(function (k) { if (db[k] !== undefined) write(LS[k], db[k]); });
  }

  function pushKey(key) {
    if (!remote) return;
    lastPushAt = Date.now();
    const headers = { 'Content-Type': 'application/json' };
    if (window.TE_API_TOKEN) headers['Authorization'] = 'Bearer ' + window.TE_API_TOKEN;
    fetchJSON(apiBase() + '/api/col/' + key, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(read(LS[key], null))
    }).catch(function () { });
  }
  function pushAll() { SHARED.forEach(pushKey); }

  function sync() {
    return fetchJSON(apiBase() + '/api/db', {}, 2500).then(function (db) {
      remote = true;
      const hasData = db && Object.keys(db).length > 0;
      if (hasData) applyRemote(db);
      else pushAll();
      return true;
    }).catch(function () { remote = false; return false; });
  }

  function snapshot() {
    const o = {};
    SHARED.forEach(function (k) { o[k] = localStorage.getItem(LS[k]); });
    return JSON.stringify(o);
  }

  function pull() {
    if (Date.now() - lastPushAt < 1200) return Promise.resolve(false);
    return fetchJSON(apiBase() + '/api/db', {}, 3000).then(function (db) {
      if (!db || Object.keys(db).length === 0) return false;
      const before = snapshot();
      applyRemote(db);
      const changed = snapshot() !== before;
      if (changed) watchers.forEach(function (cb) { try { cb(); } catch (e) { } });
      return changed;
    }).catch(function () { return false; });
  }

  function startAutoSync(ms) {
    startLive();
    if (pollTimer) return;
    pollTimer = setInterval(function () {
      if (!remote) return;
      if (Date.now() - lastPushAt < 4000) return;
      pull();
    }, ms || 15000);
  }

  /* Tempo real: o servidor avisa na hora que algo mudou */
  function startLive() {
    if (liveSource) return;
    if (typeof EventSource === 'undefined' || !remote) return;
    try {
      liveSource = new EventSource(apiBase() + '/api/events');
      liveSource.onmessage = function (ev) {
        if (!ev || !ev.data) return;
        var msg = null;
        try { msg = JSON.parse(ev.data); } catch (e) { return; }
        if (msg.type === 'change') pull();
      };
      liveSource.onerror = function () { /* o EventSource reconecta sozinho */ };
    } catch (e) { liveSource = null; }
  }

  const DEFAULT_CATS = { 6: "skincare", 7: "skincare", 8: "perfumaria", 9: "skincare", 10: "higiene" };
  function migrateProducts() {
    const list = read(LS.products, null);
    if (!Array.isArray(list)) return;
    let changed = false;
    list.forEach((p) => {
      if (DEFAULT_CATS[p.id] && p.category !== DEFAULT_CATS[p.id]) { p.category = DEFAULT_CATS[p.id]; changed = true; }
      else if (!DEFAULT_CATS[p.id] && p.category === "cosmeticos") { p.category = "skincare"; changed = true; }
    });
    seedProducts.forEach((s) => {
      if (!list.some((p) => p.id === s.id)) { list.push(JSON.parse(JSON.stringify(s))); changed = true; }
    });
    if (changed) write(LS.products, list);
  }

  function seed() {
    if (!localStorage.getItem(LS.products)) write(LS.products, seedProducts);
    else migrateProducts();
    if (!localStorage.getItem(LS.shipping)) write(LS.shipping, { percent: 8, text: "Envio via Frete Fácil", active: true });
    if (!localStorage.getItem(LS.banner)) write(LS.banner, "");
    if (!localStorage.getItem(LS.orders)) write(LS.orders, []);
    if (!localStorage.getItem(LS.users)) write(LS.users, []);
    if (!localStorage.getItem(LS.coupons)) write(LS.coupons, seedCoupons);
    if (!localStorage.getItem(LS.reviews)) write(LS.reviews, []);
  }
  seed();

  const Store = {
    LS, ADMIN, seedProducts, CAT_LABEL, SHARED,
    read, write,
    getProducts: function () { return read(LS.products, []); },
    saveProducts: function (p) { write(LS.products, p); pushKey('products'); },
    getUsers: function () { return read(LS.users, []); },
    saveUsers: function (u) { write(LS.users, u); pushKey('users'); },
    getSession: function () { return read(LS.session, null); },
    setSession: function (s) { write(LS.session, s); },
    clearSession: function () { localStorage.removeItem(LS.session); },
    getOrders: function () { return read(LS.orders, []); },
    saveOrders: function (o) { write(LS.orders, o); pushKey('orders'); },
    getShip: function () { return read(LS.shipping, { percent: 8, text: "Envio via Frete Fácil", active: true }); },
    saveShip: function (s) { write(LS.shipping, s); pushKey('shipping'); },
    getBanner: function () { return read(LS.banner, ""); },
    saveBanner: function (b) { write(LS.banner, b); pushKey('banner'); },
    getCoupons: function () { return read(LS.coupons, []); },
    saveCoupons: function (c) { write(LS.coupons, c); pushKey('coupons'); },
getWoovi: function () { return read(LS.woovi, { appId: "", pixKey: "" }); },
    saveWoovi: function (w) { write(LS.woovi, w || { appId: "", pixKey: "" }); pushKey('woovi'); },
    getEmail: function () {
      return { serviceId: EMAIL_DEFAULTS.serviceId, templateId: EMAIL_DEFAULTS.templateId, publicKey: EMAIL_DEFAULTS.publicKey };
    },
    saveEmail: function (e) { write(LS.email, e || EMAIL_DEFAULTS); },
    getReviews: function () { return read(LS.reviews, []); },
    reviewsFor: function (productId) { return read(LS.reviews, []).filter(function (r) { return r.productId === productId; }); },
    saveReviews: function (list) { write(LS.reviews, list); pushKey('reviews'); },
    addReview: function (productId, review) {
      const list = read(LS.reviews, []);
      const item = Object.assign({ id: Date.now() + Math.floor(Math.random() * 1000), productId: productId, date: new Date().toISOString() }, review || {});
      list.unshift(item);
      write(LS.reviews, list);
      pushKey('reviews');
      return item;
    },
    sync: sync,
    pushAll: pushAll,
    push: pushKey,
    isRemote: function () { return remote; },
    watch: function (cb) { if (typeof cb === 'function') watchers.push(cb); },
    startAutoSync: startAutoSync,
    startLive: startLive
  };

  window.Store = Store;
})();