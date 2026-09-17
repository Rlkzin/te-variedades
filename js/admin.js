(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const page = document.body.dataset.page || "admin";

  const toast = $("#toast");

  function showToast(msg, type = "success", duration = 3200) {
    if (!toast) return;
    toast.textContent = msg;
    toast.className = "toast show " + type;
    setTimeout(() => toast.classList.remove("show"), duration);
  }

  const fmt = (v) => "R$ " + v.toFixed(2).replace(".", ",");
  const CAT_LABEL = Store.CAT_LABEL;

  let editingId = null;
  let editingCouponId = null;

  /* ===== Helpers arriscados de não existirem na loja ===== */
  const el = {
    panel: $("#adminPanel"),
    login: $("#adminLogin"),
    statProducts: $("#statProducts"),
    statOrders: $("#statOrders"),
    statRevenue: $("#statRevenue"),
    statOffers: $("#statOffers"),
    newProductBtn: $("#newProductBtn"),
    productForm: $("#productForm"),
    productFormTitle: $("#productFormTitle"),
    productCancel: $("#productCancel"),
    pName: $("#pName"), pCategory: $("#pCategory"), pPrice: $("#pPrice"),
    pOldPrice: $("#pOldPrice"), pDesc: $("#pDesc"), pImage: $("#pImage"),
    pEmoji: $("#pEmoji"), pImagePreview: $("#pImagePreview"),
    pImagePreviewImg: $("#pImagePreviewImg"), pClearImage: $("#pClearImage"),
    productsList: $("#adminProductsList"),
    ordersList: $("#adminOrdersList"),
    shipPercent: $("#shipPercent"), shipText: $("#shipText"),
    shipActive: $("#shipActive"), saveShip: $("#saveShip"),
    bannerText: $("#bannerText"), saveBanner: $("#saveBanner"),
    newCouponBtn: $("#newCouponBtn"),
    couponForm: $("#couponForm"), couponFormTitle: $("#couponFormTitle"),
    couponCancel: $("#couponCancel"),
    cCode: $("#cCode"), cType: $("#cType"), cValue: $("#cValue"), cMinSpend: $("#cMinSpend"),
    cUses: $("#cUses"), cGrant: $("#cGrant"), cThresholdWrap: $("#cThresholdWrap"),
    cThreshold: $("#cThreshold"), cTitle: $("#cTitle"),
    couponsList: $("#adminCouponsList"),
    wooviAppId: $("#wooviAppId"), wooviPixKey: $("#wooviPixKey"), saveWoovi: $("#saveWoovi"),
    logoutBtn: $("#logoutBtn")
  };

  /* ===== Dashboard ===== */
  function renderDashboard() {
    if (!el.panel) return;
    const prods = Store.getProducts();
    const orders = Store.getOrders();
    if (el.statProducts) el.statProducts.textContent = prods.length;
    if (el.statOrders) el.statOrders.textContent = orders.length;
    if (el.statRevenue) el.statRevenue.textContent = fmt(orders.reduce((s, o) => s + o.total, 0));
    if (el.statOffers) el.statOffers.textContent = prods.filter((p) => p.oldPrice > p.price).length;
  }

  /* ===== Products ===== */
  function openProductForm(product) {
    editingId = product ? product.id : null;
    el.productFormTitle.textContent = product ? "Editar produto" : "Novo produto";
    el.pName.value = product ? product.name : "";
    el.pCategory.value = product ? product.category : "maquiagem";
    el.pPrice.value = product ? product.price : "";
    el.pOldPrice.value = product && product.oldPrice > product.price ? product.oldPrice : "";
    el.pDesc.value = product ? product.desc : "";
    el.pEmoji.value = product ? (product.emoji || "🧴") : "🧴";
    el.pImage.value = "";
    if (product && product.image) {
      el.pImagePreviewImg.src = product.image;
      el.pImagePreview.classList.remove("hidden");
    } else el.pImagePreview.classList.add("hidden");
    el.productForm.classList.remove("hidden");
    el.productForm.scrollIntoView({ behavior: "smooth" });
  }

  function resizeImage(file, maxW, cb) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        cb(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function renderProducts() {
    if (!el.productsList) return;
    const list = Store.getProducts();
    if (list.length === 0) {
      el.productsList.innerHTML = `<p class="empty-txt">Nenhum produto ainda. Clique em "Novo produto" para começar. 🧴</p>`;
      return;
    }
    el.productsList.innerHTML = list.map((p) => `
      <div class="admin-product">
        <div class="ap-media">${p.image ? `<img src="${p.image}" alt="">` : `<span class="ap-emoji">${p.emoji}</span>`}</div>
        <div class="ap-info">
          <h4>${p.name} ${p.oldPrice > p.price ? `<span class="offer-chip">Oferta</span>` : ""}</h4>
          <p>${CAT_LABEL[p.category] || p.category} · ${fmt(p.price)} ${p.oldPrice > p.price ? `<s>${fmt(p.oldPrice)}</s>` : ""}</p>
          <small>${p.desc}</small>
        </div>
        <div class="ap-actions">
          <button class="btn btn-outline ap-edit" data-id="${p.id}">✏️ Editar</button>
          <button class="btn btn-outline ap-offer" data-id="${p.id}">${p.oldPrice > p.price ? "✨ Tirar da oferta" : "🔥 Colocar em oferta"}</button>
          <button class="btn btn-danger ap-del" data-id="${p.id}">🗑️ Excluir</button>
        </div>
      </div>`).join("");

    el.productsList.querySelectorAll(".ap-edit").forEach((b) => b.addEventListener("click", () => {
      openProductForm(Store.getProducts().find((p) => p.id === parseInt(b.dataset.id)));
    }));

    el.productsList.querySelectorAll(".ap-offer").forEach((b) => b.addEventListener("click", () => {
      const id = parseInt(b.dataset.id);
      let products = Store.getProducts();
      const idx = products.findIndex((p) => p.id === id);
      if (idx === -1) return;
      if (products[idx].oldPrice > products[idx].price) {
        products[idx].oldPrice = 0;
        showToast("Produto fora da oferta.");
      } else {
        const disc = prompt("Desconto em % (ex.: 25):", "20");
        const pct = parseFloat(disc);
        if (isNaN(pct) || pct <= 0) return;
        products[idx].oldPrice = Math.round(products[idx].price / (1 - pct / 100) * 100) / 100;
        showToast("Produto em oferta! -" + pct + "% 🔥");
      }
      Store.saveProducts(products);
      renderProducts();
      renderDashboard();
    }));

    el.productsList.querySelectorAll(".ap-del").forEach((b) => b.addEventListener("click", () => {
      const id = parseInt(b.dataset.id);
      const p = Store.getProducts().find((x) => x.id === id);
      if (!confirm("Excluir '" + p.name + "'?")) return;
      Store.saveProducts(Store.getProducts().filter((x) => x.id !== id));
      showToast("Produto excluído.");
      renderProducts();
      renderDashboard();
    }));
  }

  /* ===== Orders ===== */
  function renderOrders() {
    if (!el.ordersList) return;
    const orders = Store.getOrders();
    if (orders.length === 0) {
      el.ordersList.innerHTML = `<p class="empty-txt">Nenhum pedido por enquanto. 🛍️</p>`;
      return;
    }
    el.ordersList.innerHTML = orders.map((o) => `
      <div class="admin-order">
        <div class="ao-head">
          <div>
            <strong>${o.id}</strong>
            <span class="ao-date">${o.date}</span>
          </div>
          <span class="status-badge ${(o.status || "").toLowerCase()}">${o.status}</span>
        </div>
        <div class="ao-body">
          <p><strong>${o.customer.name}</strong> · ${o.customer.email}</p>
          <p class="ao-addr">${o.customer.address} · CEP ${o.customer.cep} · ${o.customer.city}</p>
          <p class="ao-items">${o.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}</p>
          <div class="ao-money">
            <span>Subtotal: ${fmt(o.subtotal)}</span>
            <span>Frete (${o.shippingPct}%): ${fmt(o.shippingValue)}</span>
            <span><strong>${fmt(o.total)}</strong> · ${o.payment}</span>
          </div>
        </div>
        <div class="ao-track">
          <div class="form-field">
            <label>Status do pedido</label>
            <select class="order-status" data-id="${o.id}">
              <option ${o.status === "Pendente" ? "selected" : ""}>Pendente</option>
              <option ${o.status === "Pago" ? "selected" : ""}>Pago</option>
              <option ${o.status === "Enviado" ? "selected" : ""}>Enviado</option>
              <option ${o.status === "Entregue" ? "selected" : ""}>Entregue</option>
            </select>
          </div>
          <div class="form-field">
            <label>Código de rastreio (Frete Fácil)</label>
            <input type="text" class="order-track" data-id="${o.id}" value="${o.tracking || ""}" placeholder="ex.: PQ123456789BR">
          </div>
          <button class="btn btn-primary ao-save" data-id="${o.id}">Salvar status</button>
          ${o.payment === "Pix" && o.wooviChargeId ? `<button class="btn btn-outline ao-verify" data-id="${o.id}" data-charge-id="${o.wooviChargeId}">Verificar Pix</button>` : ""}
        </div>
      </div>`).join("");

    el.ordersList.querySelectorAll(".ao-save").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.id;
      const orders = Store.getOrders();
      const order = orders.find((o) => o.id === id);
      if (!order) return;
      const newStatus = el.ordersList.querySelector(`.order-status[data-id="${id}"]`).value;
      const wasPaid = order.status !== "Pago" && newStatus === "Pago";
      order.status = newStatus;
      order.tracking = el.ordersList.querySelector(`.order-track[data-id="${id}"]`).value.trim();
      Store.saveOrders(orders);
      Auth.notify(order.customer.email, "order",
        "Seu pedido " + id + " agora está: " + newStatus + (order.tracking ? " · Rastreio: " + order.tracking : "") + " 📦");
      let rewardMsg = "";
      if (wasPaid) rewardMsg = grantThresholdCoupons(order.customer.email);
      renderOrders();
      renderDashboard();
      showToast("Status do pedido " + id + " atualizado 📦" + (rewardMsg ? " " + rewardMsg : ""));
    }));

    el.ordersList.querySelectorAll(".ao-verify").forEach((b) => b.addEventListener("click", async () => {
      const id = b.dataset.id;
      const chargeId = b.dataset.chargeId;
      const appId = Store.getWoovi().appId;
      if (!appId) return showToast("Configure a AppID da Woovi na aba Frete & Loja.", "error");
      b.disabled = true;
      b.textContent = "Verificando…";
      try {
        const res = await fetch("https://api.openpix.com.br/api/v1/charge/" + encodeURIComponent(chargeId), {
          headers: { Authorization: appId }
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        const st = ((data && data.charge) || data || {}).status;
        const orders = Store.getOrders();
        const order = orders.find((o) => o.id === id);
        if (!order) return;
        if (st === "COMPLETED" && order.status !== "Pago") {
          order.status = "Pago";
          Store.saveOrders(orders);
          Auth.notify(order.customer.email, "order",
            "Pagamento Pix confirmado! Seu pedido " + id + " está Pago ✅");
          const rewardMsg = grantThresholdCoupons(order.customer.email);
          renderOrders();
          renderDashboard();
          showToast("Pagamento confirmado! Pedido marcado como Pago ✅" + (rewardMsg ? " " + rewardMsg : ""));
        } else if (st === "COMPLETED") {
          showToast("Este pedido já estava marcado como Pago. ✅", "info");
        } else {
          showToast("Cobrança ainda não paga. Status Woovi: " + st + (st === "EXPIRED" ? " (expirou — peça para gerar outro Pix no checkout)" : ""), "info");
        }
      } catch (e) {
        showToast("Falha ao consultar a Woovi: " + (e.message || e), "error");
      } finally {
        b.disabled = false;
        b.textContent = "Verificar Pix";
      }
    }));
  }

  /* ===== Coupons ===== */
  function grantThresholdCoupons(email) {
    const users = Store.getUsers();
    const u = users.find((x) => x.email === email);
    if (!u) return "";
    const coupons = Store.getCoupons().filter((c) => c.active && c.grant === "threshold");
    if (coupons.length === 0) return "";
    const paidTotal = Store.getOrders()
      .filter((o) => o.customer.email === email && o.status !== "Pendente")
      .reduce((s, o) => s + o.total, 0);
    u.coupons = u.coupons || [];
    let granted = [];
    coupons.forEach((c) => {
      if (paidTotal >= c.threshold && !u.coupons.some((x) => x.code === c.code && !x.usedAt)) {
        u.coupons.push({ code: c.code, grantedAt: new Date().toISOString(), usedAt: null });
        granted.push(c.code);
      }
    });
    if (granted.length) {
      Store.saveUsers(users);
      granted.forEach((code) => {
        Auth.notify(email, "coupon", "Cupom liberado: " + code + "! Ele já está no seu perfil 🎉");
      });
      return "Cupom liberado: " + granted.join(", ") + " 🎉";
    }
    return "";
  }

  function openCouponForm(coupon) {
    editingCouponId = coupon ? coupon.id : null;
    el.couponFormTitle.textContent = coupon ? "Editar cupom" : "Novo cupom";
    el.cCode.value = coupon ? coupon.code : "";
    el.cType.value = coupon ? coupon.type : "percent";
    el.cValue.value = coupon ? coupon.value : "";
    el.cMinSpend.value = coupon ? (coupon.minSpend || 0) : 0;
    el.cUses.value = coupon ? (coupon.uses || 0) : 0;
    el.cGrant.value = coupon ? coupon.grant : "manual";
    el.cThreshold.value = coupon ? (coupon.threshold || 0) : 0;
    el.cTitle.value = coupon ? (coupon.title || "") : "";
    updateThresholdWrap();
    el.couponForm.classList.remove("hidden");
    el.couponForm.scrollIntoView({ behavior: "smooth" });
  }

  function updateThresholdWrap() {
    el.cThresholdWrap.style.display = el.cGrant.value === "threshold" ? "block" : "none";
  }

  function resetCouponForm() {
    el.couponForm.classList.add("hidden");
    editingCouponId = null;
  }

  function renderCoupons() {
    if (!el.couponsList) return;
    const list = Store.getCoupons();
    if (list.length === 0) {
      el.couponsList.innerHTML = `<p class="empty-txt">Nenhum cupom ainda. Crie um para começar 🎟️</p>`;
      return;
    }
    const GRANT_LABEL = { manual: "Manual", welcome: "Boas-vindas", threshold: "Meta de compra" };
    el.couponsList.innerHTML = list.map((c) => `
      <div class="admin-coupon">
        <div class="ac-main">
          <strong class="ac-code">${c.code}</strong>
          <span class="ac-grant">${GRANT_LABEL[c.grant] || c.grant}${c.grant === "threshold" ? " (R$" + (Number(c.threshold) || 0).toFixed(2).replace(".", ",") + ")" : ""}</span>
          <span class="ac-value">${c.type === "percent" ? c.value + "%" : fmt(c.value)} OFF ${c.minSpend > 0 ? "· mín. " + fmt(c.minSpend) : ""}</span>
          <small>${c.title || ""}</small>
        </div>
        <div class="ac-meta">
          <span class="ac-uses">${c.used}${c.uses > 0 ? "/" + c.uses : ""} usos</span>
          <span class="status-badge ${c.used >= c.uses && c.uses > 0 || !c.active ? "pendente" : "pago"}">${c.active ? (c.used >= c.uses && c.uses > 0 ? "Esgotado" : "Ativo") : "Pausado"}</span>
        </div>
        <div class="ac-actions">
          <button class="btn btn-outline ac-edit" data-id="${c.id}">✏️ Editar</button>
          <button class="btn btn-outline ac-toggle" data-id="${c.id}">${c.active ? "⏸️ Pausar" : "▶️ Ativar"}</button>
          <button class="btn btn-danger ac-del" data-id="${c.id}">🗑️ Excluir</button>
        </div>
      </div>`).join("");

    el.couponsList.querySelectorAll(".ac-edit").forEach((b) => b.addEventListener("click", () => {
      openCouponForm(Store.getCoupons().find((c) => c.id === parseInt(b.dataset.id)));
    }));
    el.couponsList.querySelectorAll(".ac-toggle").forEach((b) => b.addEventListener("click", () => {
      let coupons = Store.getCoupons();
      const idx = coupons.findIndex((c) => c.id === parseInt(b.dataset.id));
      if (idx === -1) return;
      coupons[idx].active = !coupons[idx].active;
      Store.saveCoupons(coupons);
      showToast(coupons[idx].active ? "Cupom ativado ▶️" : "Cupom pausado ⏸️");
      renderCoupons();
    }));
    el.couponsList.querySelectorAll(".ac-del").forEach((b) => b.addEventListener("click", () => {
      const c = Store.getCoupons().find((x) => x.id === parseInt(b.dataset.id));
      if (!confirm("Excluir o cupom '" + c.code + "'?")) return;
      Store.saveCoupons(Store.getCoupons().filter((x) => x.id !== c.id));
      showToast("Cupom excluído.");
      renderCoupons();
    }));
  }

  function bindCoupons() {
    if (!el.couponForm) return;
    if (el.cGrant) el.cGrant.addEventListener("change", updateThresholdWrap);
    if (el.newCouponBtn) el.newCouponBtn.addEventListener("click", () => openCouponForm());
    if (el.couponCancel) el.couponCancel.addEventListener("click", resetCouponForm);
    el.couponForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = el.cCode.value.trim().toUpperCase().replace(/\s+/g, "");
      const value = parseFloat(el.cValue.value);
      const minSpend = parseFloat(el.cMinSpend.value) || 0;
      const uses = parseInt(el.cUses.value) || 0;
      const threshold = parseFloat(el.cThreshold.value) || 0;
      if (!code || isNaN(value) || value <= 0) return showToast("Informe código e valor válidos", "error");
      const coupons = Store.getCoupons();
      const dup = coupons.find((c) => c.code.toUpperCase() === code && c.id !== editingCouponId);
      if (dup) return showToast("Já existe um cupom com este código", "error");

      const payload = {
        code, type: el.cType.value, value, minSpend,
        uses, used: 0, active: true,
        grant: el.cGrant.value,
        threshold: el.cGrant.value === "threshold" ? threshold : 0,
        title: el.cTitle.value.trim()
      };
      if (editingCouponId) {
        const idx = coupons.findIndex((c) => c.id === editingCouponId);
        if (idx !== -1) { payload.used = coupons[idx].used || 0; coupons[idx] = { ...coupons[idx], ...payload }; }
        showToast("Cupom atualizado!");
      } else {
        payload.id = Date.now();
        coupons.unshift(payload);
        showToast("Cupom cadastrado 🎟️");
      }
      Store.saveCoupons(coupons);
      resetCouponForm();
      renderCoupons();
    });
  }

  /* ===== Settings ===== */
  function fillSettings() {
    if (!el.shipPercent) return;
    const ship = Store.getShip();
    el.shipPercent.value = ship.percent;
    el.shipText.value = ship.text || "Envio via Frete Fácil";
    el.shipActive.checked = ship.active !== false;
    el.bannerText.value = Store.getBanner();
    if (el.wooviAppId) {
      el.wooviAppId.value = Store.getWoovi().appId;
      if (el.wooviPixKey) el.wooviPixKey.value = Store.getWoovi().pixKey;
    }
  }

  function bindSettings() {
    if (!el.saveShip) return;
    el.saveShip.addEventListener("click", () => {
      const percent = parseFloat(el.shipPercent.value);
      if (isNaN(percent) || percent < 0) return showToast("Percentual inválido", "error");
      Store.saveShip({
        percent,
        text: el.shipText.value.trim() || "Envio via Frete Fácil",
        active: el.shipActive.checked
      });
      showToast("Frete atualizado 🚚");
    });
    el.saveBanner.addEventListener("click", () => {
      Store.saveBanner(el.bannerText.value.trim());
      showToast("Aviso da loja atualizado 🛍️");
    });
    if (el.saveWoovi) {
      el.saveWoovi.addEventListener("click", () => {
        const appId = el.wooviAppId.value.trim();
        if (!appId) return showToast("Cole a AppID da Woovi antes de salvar.", "error");
        Store.saveWoovi({
          appId: appId,
          pixKey: el.wooviPixKey ? el.wooviPixKey.value.trim() : ""
        });
        showToast("Woovi configurada! O checkout Pix agora gera QR real na sua conta. ✅");
      });
    }
  }

  /* ===== Bind panel events ===== */
  function bindPanel() {
    if (!el.panel) return;

    $$(".admin-tab").forEach((t) => t.addEventListener("click", () => {
      $$(".admin-tab").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      $$(".tab-panel").forEach((p) => p.classList.remove("active"));
      const target = $("#tab-" + t.dataset.tab);
      if (target) target.classList.add("active");
    }));

    $$(".qa-btn[data-goto]").forEach((b) => b.addEventListener("click", () => {
      $$(".admin-tab").forEach((x) => x.classList.toggle("active", x.dataset.tab === b.dataset.goto));
      $$(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === "tab-" + b.dataset.goto));
      if (b.dataset.action === "new") openProductForm();
      else if (b.dataset.action === "new-coupon") openCouponForm();
      else if (b.dataset.goto === "products") renderProducts();
      else if (b.dataset.goto === "orders") renderOrders();
      else if (b.dataset.goto === "coupons") renderCoupons();
      else if (b.dataset.goto === "settings") fillSettings();
    }));

    if (el.newProductBtn) el.newProductBtn.addEventListener("click", () => openProductForm());
    if (el.productCancel) el.productCancel.addEventListener("click", () => {
      el.productForm.classList.add("hidden");
      editingId = null;
    });
    if (el.pClearImage) el.pClearImage.addEventListener("click", () => {
      el.pImagePreview.classList.add("hidden");
      el.pImagePreviewImg.src = "";
      el.pImage.value = "";
    });
    if (el.pImage) el.pImage.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      resizeImage(file, 500, (dataUrl) => {
        el.pImagePreviewImg.src = dataUrl;
        el.pImagePreview.classList.remove("hidden");
        showToast("Foto pronta! Salve o produto para confirmar 💾");
      });
    });
    if (el.productForm) el.productForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = el.pName.value.trim();
      const price = parseFloat(el.pPrice.value);
      const oldPrice = parseFloat(el.pOldPrice.value) || 0;
      if (!name || isNaN(price) || price <= 0) return showToast("Informe título e preço válidos", "error");

      const payload = {
        name,
        category: el.pCategory.value,
        price,
        oldPrice: oldPrice > price ? oldPrice : 0,
        desc: el.pDesc.value.trim(),
        emoji: el.pEmoji.value.trim() || "🧴",
        image: el.pImagePreview.classList.contains("hidden") ? "" : el.pImagePreviewImg.src
      };

      let products = Store.getProducts();
      if (editingId) {
        products = products.map((p) => p.id === editingId ? { ...p, ...payload } : p);
        showToast("Produto atualizado!");
      } else {
        payload.id = Date.now();
        products.unshift(payload);
        showToast("Produto cadastrado!");
        Auth.notifyAll("product", "Novidade na vitrine: " + payload.name + " já está na loja! 🛍️");
      }
      Store.saveProducts(products);
      el.productForm.classList.add("hidden");
      editingId = null;
      renderAll();
    });

    if (el.logoutBtn) el.logoutBtn.addEventListener("click", () => {
      Auth.logout();
      location.reload();
    });

    bindSettings();
    bindCoupons();
  }

  /* ===== API pública ===== */
  window.AdminPanel = {
    show: function () {
      if (!el.panel) return;
      el.panel.classList.remove("hidden");
      renderAll();
    },
    hide: function () {
      if (el.panel) el.panel.classList.add("hidden");
    },
    isShown: function () {
      return el.panel && !el.panel.classList.contains("hidden");
    }
  };

  function renderAll() {
    renderDashboard();
    renderProducts();
    renderOrders();
    renderCoupons();
    fillSettings();
  }

  /* ===== Init ===== */
  function init() {
    bindPanel();
    if (page === "admin") {
      if (Auth.isAdmin()) {
        AdminPanel.show();
      } else {
        if (el.login) el.login.classList.remove("hidden");
        if (el.panel) el.panel.classList.add("hidden");
        const form = $("#adminLoginForm");
        if (form) {
          form.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = $("#adminEmail").value.trim();
            const password = $("#adminPassword").value;
            if (email.toLowerCase() === Store.ADMIN.email && password === Store.ADMIN.password) {
              Auth.loginAdmin(Store.ADMIN.email, Store.ADMIN.password);
              showToast("Bem-vinda, Dona! 💖");
              if (el.login) el.login.classList.add("hidden");
              AdminPanel.show();
            } else if (email.toLowerCase() === Store.ADMIN.email) {
              showToast("Senha errada. A senha da dona é: te123456", "error");
            } else if (password === Store.ADMIN.password) {
              showToast("E-mail errado. O e-mail da dona é: dona@te.com", "error");
            } else {
              showToast("E-mail e senha errados. Use dona@te.com / te123456", "error");
            }
          });
        }
        const fill = $("#fillAdminHint");
        if (fill) fill.addEventListener("click", () => {
          $("#adminEmail").value = Store.ADMIN.email;
          $("#adminPassword").value = Store.ADMIN.password;
          showToast("Preenchido! É só clicar em Entrar 💖");
        });
      }
    } else {
      if (el.panel) el.panel.classList.add("hidden");
    }
  }

  init();

  /* ===== Sincronização: reflete no painel o que vier do servidor ===== */
  function refreshPanel() {
    if (page === "admin" && Auth.isAdmin()) renderAll();
  }
  Store.watch(refreshPanel);
  Store.sync().then(function () {
    refreshPanel();
    Store.startAutoSync(10000);
  });
})();