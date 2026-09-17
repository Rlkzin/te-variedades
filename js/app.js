(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const el = {
    loader: $("#pageLoader"), navbar: $("#navbar"), annBar: $("#annBar"),
    burger: $("#burger"), navLinks: $("#navLinks"),
    navLinkItems: $$(".nav-links li a"),
    userBtn: $("#userBtn"), cartBtn: $("#cartBtn"), cartCount: $("#cartCount"),
    cartOverlay: $("#cartOverlay"), cartSidebar: $("#cartSidebar"), closeCart: $("#closeCart"),
    cartItems: $("#cartItems"), cartBreakdown: $("#cartBreakdown"), cartTotal: $("#cartTotal"),
    checkoutBtn: $("#checkoutBtn"),
    authModal: $("#authModal"), closeModal: $("#closeModal"),
    loginForm: $("#loginForm"), registerForm: $("#registerForm"),
    authTabs: $$(".auth-tab"), goLogin: $("#goLogin"), goRegister: $("#goRegister"), goLogin2: $("#goLogin2"),
    registerFields: $("#registerFields"), verifyStep: $("#verifyStep"),
    verifyEmail: $("#verifyEmail"), verifyCodeInput: $("#verifyCodeInput"), verifyMsg: $("#verifyMsg"),
    verifySubmit: $("#verifySubmit"), verifyResend: $("#verifyResend"), verifyBack: $("#verifyBack"),
    toast: $("#toast"),
    productsGrid: $("#productsGrid"), offersGrid: $("#offersGrid"),
    searchInput: $("#searchInput"), filterBar: $("#filterBar"), filterBtns: $$(".filter-btn"),
    noUserNotice: $("#noUserNotice"), noUserLogin: $("#noUserLogin"),
    noResults: $("#noResults"), statsRow: $("#statsRow"),
    offersEmpty: $("#offersEmpty"), noUserNoticeOffers: $("#noUserNoticeOffers"),
    newsForm: $("#newsForm"),
    checkoutModal: $("#checkoutModal"), closeCheckout: $("#closeCheckout"),
    checkoutForm: $("#checkoutForm"), checkoutSummary: $("#checkoutSummary"), shippingBox: $("#shippingBox"),
    pixBox: $("#pixBox"), pixAmount: $("#pixAmount"), pixQr: $("#pixQr"), pixCode: $("#pixCode"), pixCopy: $("#pixCopy"), pixStatus: $("#pixStatus"),
    successModal: $("#successModal"), closeSuccess: $("#closeSuccess"),
    successName: $("#successName"), successOrder: $("#successOrder"), successDone: $("#successDone"),
    ordersBtn: $("#ordersBtn"),
    ordersDashModal: $("#ordersDashModal"), closeOrdersDash: $("#closeOrdersDash"),
    dashStats: $("#dashStats"), dashPending: $("#dashPending"), dashBought: $("#dashBought"),
    dashTabs: $$(".dash-tab"), ordersDashDone: $("#ordersDashDone"),
    footerLogin: $("#footerLogin"), footerTrack: $("#footerTrack"),
    profileModal: $("#profileModal"), closeProfile: $("#closeProfile"),
    profileAvatar: $("#profileAvatar"), profilePhoto: $("#profilePhoto"),
    profileStats: $("#profileStats"), profileRealName: $("#profileRealName"),
    profileNickname: $("#profileNickname"), profileEmail: $("#profileEmail"), profilePhone: $("#profilePhone"),
    saveProfile: $("#saveProfile"), logoutProfile: $("#logoutProfile"),
    adminViewStore: $("#adminViewStore"),
    testimonialsRow: $("#testimonialsRow"), tPrev: $("#tPrev"), tNext: $("#tNext"), tDots: $("#tDots"),
    themeToggle: $("#themeToggle"), themeIcon: $("#themeIcon"),
    couponInput: $("#couponInput"), couponApply: $("#couponApply"), couponMsg: $("#couponMsg"),
    couponApplied: $("#couponApplied"), couponCodeLabel: $("#couponCodeLabel"), couponValueLabel: $("#couponValueLabel"),
    couponRemove: $("#couponRemove"), profileCoupons: $("#profileCoupons"),
    notifBtn: $("#notifBtn"), notifBadge: $("#notifBadge"), notifPanel: $("#notifPanel"),
    notifList: $("#notifList"), notifMarkAll: $("#notifMarkAll"), notifClear: $("#notifClear"),
    notifClose: $("#notifClose"), notifOverlay: $("#notifOverlay"),
    productModal: $("#productModal"), closeProduct: $("#closeProduct"),
    pmMedia: $("#pmMedia"), pmCat: $("#pmCat"), pmName: $("#pmName"), pmStars: $("#pmStars"),
    pmPrice: $("#pmPrice"), pmOld: $("#pmOld"), pmDesc: $("#pmDesc"), pmAdd: $("#pmAdd"),
    pmReviewsList: $("#pmReviewsList"), pmReviewCount: $("#pmReviewCount"), pmReviewForm: $("#pmReviewForm"),
    pmStarsInput: $("#pmStarsInput"), pmReviewText: $("#pmReviewText"),
    pmReviewPhoto: $("#pmReviewPhoto"), pmPhotoPreview: $("#pmPhotoPreview"), pmPhotoImg: $("#pmPhotoImg"),
    pmPhotoRemove: $("#pmPhotoRemove"), pmSubmitReview: $("#pmSubmitReview"), pmLoginHint: $("#pmLoginHint"),
    photoLightbox: $("#photoLightbox"), photoLightboxImg: $("#photoLightboxImg")
  };

  let currentFilter = "all";
  let activeProductId = null;
  let reviewStars = 0;
  let reviewPhotoData = "";

  /* ===== Toast ===== */
  function showToast(msg, type = "success", duration = 3200) {
    el.toast.textContent = msg;
    el.toast.className = "toast show " + type;
    setTimeout(() => el.toast.classList.remove("show"), duration);
  }

  const fmt = (v) => "R$ " + v.toFixed(2).replace(".", ",");

  const SUPPORT = {
    whats: "5511999999999",
    whatsDisplay: "(11) 99999-9999",
    email: "contato@tevariedades.com"
  };

  /* ===== Loader ===== */
  window.addEventListener("load", () => {
    setTimeout(() => { el.loader.classList.add("hidden"); }, 600);
  });

  /* ===== Navbar ===== */
  window.addEventListener("scroll", () => {
    el.navbar.classList.toggle("scrolled", window.scrollY > 50);
  });
  el.burger.addEventListener("click", () => {
    el.navLinks.classList.toggle("open");
    el.burger.classList.toggle("active");
  });
  el.navLinkItems.forEach((a) => a.addEventListener("click", () => {
    el.navLinks.classList.remove("open");
    el.burger.classList.remove("active");
  }));

  /* ===== Smooth scroll ===== */
  $$("a[href^='#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = $(a.getAttribute("href"));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
    });
  });

  $$("[data-toast]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showToast(a.dataset.toast, "info");
    });
  });

  $$("[data-filter-jump]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      $("#shop").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => { setFilter(a.dataset.filterJump); }, 400);
    });
  });

  /* ===== Support ===== */
  function openSupportUrl(type) {
    if (type === "whats") window.open("https://wa.me/" + SUPPORT.whats + "?text=" + encodeURIComponent("Olá! Vim pelo site da T&E Variedades e gostaria de ajuda 💖"), "_blank");
    if (type === "mail") window.location.href = "mailto:" + SUPPORT.email;
  }
  [["#supportWhats", "whats"], ["#footerSupportWhats", "whats"], ["#supportMail", "mail"], ["#footerSupportMail", "mail"]].forEach(([sel, type]) => {
    const node = $(sel);
    if (node) node.addEventListener("click", (e) => {
      e.preventDefault();
      openSupportUrl(type);
      showToast(type === "whats" ? "WhatsApp: " + SUPPORT.whatsDisplay : "E-mail: " + SUPPORT.email, "info");
    });
  });

  /* ===== Botão flutuante do WhatsApp ===== */
  const waFloat = $("#waFloat");
  if (waFloat) waFloat.addEventListener("click", (e) => {
    e.preventDefault();
    openSupportUrl("whats");
    showToast("Abrindo o WhatsApp da loja 💬", "info");
  });

  $$("[data-open-orders]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    if (Auth.isLoggedIn()) openOrdersDash();
    else openAuth("login");
  }));

  /* ===== FAQ accordion ===== */
  $$(".faq-q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.parentElement;
      const wasOpen = item.classList.contains("open");
      $$(".faq-item").forEach((i) => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });

  function setActiveLink() {
    const sections = ["home", "offers", "shop", "about", "how", "team", "support", "contact"];
    let current = "home";
    sections.forEach((s) => {
      const sec = $("#" + s);
      if (sec && window.scrollY >= sec.offsetTop - 140) current = s;
    });
    el.navLinkItems.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === "#" + current));
  }
  window.addEventListener("scroll", setActiveLink);

  /* ===== Reveal on scroll ===== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((node) => revealObserver.observe(node));

  /* ===== Announcement bar (marquee) ===== */
  function renderAnn() {
    const txt = Store.getBanner();
    if (txt) {
      const item = `<span class="ann-item">${txt}</span>`;
      const group = `<div class="ann-group">${item}${item}${item}${item}</div>`;
      el.annBar.innerHTML = `<div class="ann-track">${group}${group}</div>`;
      el.annBar.style.display = "block";
    } else el.annBar.style.display = "none";
  }

  /* ===== Product card render ===== */
  function productCard(p) {
    const media = p.image
      ? `<img src="${p.image}" alt="${p.name}" class="product-img">`
      : `<span class="product-emoji">${p.emoji}</span>`;
    let pct = "";
    if (p.oldPrice > p.price) pct = Math.round((1 - p.price / p.oldPrice) * 100);
    const rate = ratingOf(p.id);
    return `
      <article class="product-card" data-id="${p.id}">
        ${pct ? `<span class="badge">-${pct}%</span>` : ""}
        ${media}
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        ${rate.count ? `<div class="card-rating">${starIcons(rate.avg)} <span>${rate.avg.toFixed(1)} (${rate.count})</span></div>` : ""}
        <div class="price-row">
          <span class="price">${fmt(p.price)}</span>
          ${p.oldPrice > p.price ? `<span class="old-price">${fmt(p.oldPrice)}</span>` : ""}
        </div>
        <button class="btn btn-primary add-cart" data-id="${p.id}">Adicionar ao carrinho</button>
      </article>`;
  }

  /* ===== Products render ===== */
  function getFiltered() {
    const q = el.searchInput.value.trim().toLowerCase();
    return Store.getProducts().filter((p) => {
      const matchCat = currentFilter === "all" || p.category === currentFilter;
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }

  function renderProducts() {
    const list = getFiltered();
    el.productsGrid.innerHTML = list.map(productCard).join("");
    el.noResults.classList.toggle("hidden", list.length > 0);
    bindAddButtons(el.productsGrid);
  }

  function renderOffers() {
    const offers = Store.getProducts().filter((p) => p.oldPrice > p.price);
    if (offers.length === 0) {
      el.offersEmpty.textContent = "Em breve novas ofertas 🔥 Fique de olho!";
      el.offersGrid.innerHTML = "";
      return;
    }
    el.offersEmpty.textContent = "Corra, os preços quentinhos são por tempo limitado!";
    el.offersGrid.innerHTML = offers.map(productCard).join("");
    bindAddButtons(el.offersGrid);
  }

  function bindAddButtons(container) {
    container.querySelectorAll(".add-cart").forEach((btn) => {
      btn.addEventListener("click", (e) => { e.stopPropagation(); addToCart(parseInt(btn.dataset.id)); });
    });
    container.querySelectorAll(".product-card").forEach((card) => {
      card.addEventListener("click", () => openProduct(parseInt(card.dataset.id)));
    });
  }

  /* ===== Avaliações (média + estrelas) ===== */
  function ratingOf(productId) {
    const rs = Store.reviewsFor(productId);
    if (!rs.length) return { avg: 0, count: 0 };
    const sum = rs.reduce((a, r) => a + (Number(r.rating) || 0), 0);
    return { avg: sum / rs.length, count: rs.length };
  }
  function starIcons(avg) {
    const full = Math.round(avg);
    let s = "";
    for (let i = 1; i <= 5; i++) s += i <= full ? "★" : "☆";
    return s;
  }
  const escapeHtml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ===== Product modal (detalhe + avaliações com foto) ===== */
  function compressImage(file, maxSize, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let w = img.naturalWidth, h = img.naturalHeight;
          const scale = Math.min(1, maxSize / Math.max(w, h));
          w = Math.round(w * scale); h = Math.round(h * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function openProduct(id) {
    const p = Store.getProducts().find((x) => x.id === id);
    if (!p) return;
    activeProductId = id;
    el.pmMedia.innerHTML = p.image
      ? `<img src="${p.image}" alt="${escapeHtml(p.name)}">`
      : `<span class="product-emoji">${p.emoji}</span>`;
    el.pmCat.textContent = Store.CAT_LABEL[p.category] || p.category || "";
    el.pmName.textContent = p.name;
    el.pmPrice.textContent = fmt(p.price);
    if (p.oldPrice > p.price) { el.pmOld.textContent = fmt(p.oldPrice); el.pmOld.style.display = ""; }
    else { el.pmOld.textContent = ""; el.pmOld.style.display = "none"; }
    el.pmDesc.textContent = p.desc || "";
    const rate = ratingOf(id);
    el.pmStars.innerHTML = rate.count
      ? starIcons(rate.avg) + `<span>${rate.avg.toFixed(1)} · ${rate.count} avaliação(ões)</span>`
      : `<span>Seja a primeira a avaliar ✨</span>`;
    resetReviewForm();
    renderProductReviews(id);
    el.productModal.classList.add("open");
  }
  function closeProduct() { el.productModal.classList.remove("open"); activeProductId = null; }

  function resetReviewForm() {
    reviewStars = 0; reviewPhotoData = "";
    el.pmStarsInput.querySelectorAll("button").forEach((b) => b.classList.remove("on"));
    el.pmReviewText.value = "";
    el.pmReviewPhoto.value = "";
    el.pmPhotoPreview.classList.add("hidden");
    el.pmPhotoImg.removeAttribute("src");
    el.pmLoginHint.classList.toggle("hidden", Auth.isLoggedIn());
  }

  function reviewCardHtml(r) {
    const user = Store.getUsers().find((u) => u.id === r.userId);
    const name = r.userName || (user && (user.nickname || user.fullName)) || "Cliente";
    const avatar = r.userAvatar || (user && user.avatar) || "";
    const photo = avatar ? `<img src="${avatar}" alt="">` : escapeHtml(String(name).trim().charAt(0)).toUpperCase();
    const img = r.photo ? `<img src="${r.photo}" class="review-photo" alt="Foto da avaliação">` : "";
    const date = r.date ? new Date(r.date).toLocaleDateString("pt-BR") : "";
    return `<div class="review-card">
      <div class="review-avatar">${photo}</div>
      <div class="review-body">
        <div class="review-head">
          <strong>${escapeHtml(name)}</strong>
          <span class="review-stars">${starIcons(Number(r.rating) || 0)}</span>
          <span class="review-date">${date}</span>
        </div>
        ${r.text ? `<div class="review-text">${escapeHtml(r.text)}</div>` : ""}
        ${img}
      </div>
    </div>`;
  }

  function renderProductReviews(id) {
    const rs = Store.reviewsFor(id);
    const rate = ratingOf(id);
    el.pmReviewCount.textContent = rs.length ? `(${rs.length}) · média ${rate.avg.toFixed(1)}` : "";
    el.pmReviewsList.innerHTML = rs.length
      ? rs.map(reviewCardHtml).join("")
      : `<div class="pm-reviews-empty">Ainda não há avaliações deste produto. Conte como foi a sua! 💬</div>`;
    el.pmReviewsList.querySelectorAll(".review-photo").forEach((img) => {
      img.addEventListener("click", () => { el.photoLightboxImg.src = img.src; el.photoLightbox.classList.add("open"); });
    });
  }

  el.closeProduct.addEventListener("click", closeProduct);
  el.productModal.addEventListener("click", (e) => { if (e.target === el.productModal) closeProduct(); });
  el.photoLightbox.addEventListener("click", () => el.photoLightbox.classList.remove("open"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeProduct(); el.photoLightbox.classList.remove("open"); }
  });
  el.pmAdd.addEventListener("click", () => { if (activeProductId != null) addToCart(activeProductId); });

  el.pmStarsInput.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => {
      reviewStars = Number(b.dataset.star);
      el.pmStarsInput.querySelectorAll("button").forEach((x) => x.classList.toggle("on", Number(x.dataset.star) <= reviewStars));
    });
  });

  el.pmReviewPhoto.addEventListener("change", () => {
    const file = el.pmReviewPhoto.files && el.pmReviewPhoto.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) { showToast("Escolha um arquivo de imagem 📷", "error"); return; }
    showToast("Preparando sua foto...", "info", 1500);
    compressImage(file, 800, 0.68).then((dataUrl) => {
      reviewPhotoData = dataUrl;
      el.pmPhotoImg.src = dataUrl;
      el.pmPhotoPreview.classList.remove("hidden");
    }).catch(() => showToast("Não consegui ler essa imagem 😕", "error"));
  });
  el.pmPhotoRemove.addEventListener("click", () => {
    reviewPhotoData = ""; el.pmReviewPhoto.value = "";
    el.pmPhotoPreview.classList.add("hidden"); el.pmPhotoImg.removeAttribute("src");
  });

  el.pmSubmitReview.addEventListener("click", () => {
    if (!Auth.isLoggedIn()) {
      closeProduct(); openAuth("login");
      showToast("Entre na sua conta para avaliar 💖", "info");
      return;
    }
    if (!reviewStars) { showToast("Escolha de 1 a 5 estrelas ⭐", "error"); return; }
    const user = Auth.currentUser() || {};
    Store.addReview(activeProductId, {
      userId: user.id || null,
      userName: user.nickname || user.name || "Cliente",
      userAvatar: user.avatar || "",
      rating: reviewStars,
      text: el.pmReviewText.value.trim(),
      photo: reviewPhotoData
    });
    renderProductReviews(activeProductId);
    resetReviewForm();
    renderProducts();
    renderOffers();
    showToast("Avaliação enviada. Obrigada! 💖");
  });

  /* ===== Filters + search ===== */
  function setFilter(f) {
    currentFilter = f;
    el.filterBtns.forEach((b) => b.classList.toggle("active", b.dataset.filter === f));
    renderProducts();
  }
  function renderFilterBar() {
    const cats = [];
    Store.getProducts().forEach((p) => { if (p.category && !cats.includes(p.category)) cats.push(p.category); });
    el.filterBar.innerHTML =
      `<button class="filter-btn${currentFilter === "all" ? " active" : ""}" data-filter="all">Todos</button>` +
      cats.map((c) => `<button class="filter-btn${currentFilter === c ? " active" : ""}" data-filter="${c}">${Store.CAT_LABEL[c] || c}</button>`).join("");
    el.filterBtns = $$(".filter-btn");
    el.filterBtns.forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)));
  }
  el.searchInput.addEventListener("input", renderProducts);

  /* ===== Nav auth: cart & compras só aparecem logado ===== */
  function updateNavAuth() {
    const logged = Auth.isLoggedIn();
    $$(".logged-only").forEach((btn) => btn.classList.toggle("hidden", !logged));
  }

  /* ===== Cart UI ===== */
  function updateCartUI() {
    el.cartCount.textContent = Cart.count();
    const items = Cart.getItems();
    if (items.length === 0) {
      el.cartItems.innerHTML = `<div class="empty-cart">🛒<p>Seu carrinho está vazio</p></div>`;
      el.cartBreakdown.innerHTML = "";
    } else {
      el.cartItems.innerHTML = items.map((item) => `
        <div class="cart-item">
          ${item.image ? `<img src="${item.image}" class="cart-img">` : `<span class="ci-emoji">${item.emoji}</span>`}
          <div class="ci-info">
            <strong>${item.name}</strong>
            <span>${fmt(item.price)}</span>
            <div class="qty">
              <button class="qty-btn minus" data-id="${item.id}">−</button>
              <span>${item.qty}</span>
              <button class="qty-btn plus" data-id="${item.id}">+</button>
            </div>
          </div>
          <button class="remove-item" data-id="${item.id}">✕</button>
        </div>`).join("");
      const sub = Cart.subtotal();
      const ship = Cart.calcShipping(sub);
      el.cartBreakdown.innerHTML = `
        <div class="cb-row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
        <div class="cb-row"><span>${ship.method} (${ship.pct}%)</span><span>${fmt(ship.value)}</span></div>`;
      el.cartItems.querySelectorAll(".qty-btn").forEach((b) => b.addEventListener("click", () => {
        const id = parseInt(b.dataset.id);
        const item = Cart.getItems().find((i) => i.id === id);
        if (!item) return;
        const nq = item.qty + (b.classList.contains("plus") ? 1 : -1);
        if (nq < 1) Cart.remove(id); else Cart.updateQty(id, nq);
        updateCartUI();
      }));
      el.cartItems.querySelectorAll(".remove-item").forEach((b) => b.addEventListener("click", () => {
        Cart.remove(parseInt(b.dataset.id));
        updateCartUI();
        showToast("Produto removido", "info");
      }));
    }
    el.cartTotal.textContent = fmt(Cart.total());
  }

  function addToCart(id) {
    if (!Auth.isLoggedIn()) {
      openAuth("login");
      showToast("Faça login para comprar 💖", "info");
      return;
    }
    const product = Store.getProducts().find((p) => p.id === id);
    if (!product) return;
    Cart.add(product);
    updateCartUI();
    showToast(product.name + " adicionado ao carrinho! 💖");
  }

  el.cartBtn.addEventListener("click", () => {
    el.cartSidebar.classList.add("open");
    el.cartOverlay.classList.add("open");
  });
  function closeCart() {
    el.cartSidebar.classList.remove("open");
    el.cartOverlay.classList.remove("open");
  }
  el.closeCart.addEventListener("click", closeCart);
  el.cartOverlay.addEventListener("click", closeCart);

  /* ===== Auth modal ===== */
  function openAuth(tab = "login") {
    el.authModal.classList.add("open");
    switchTab(tab);
  }
  function closeAuth() { el.authModal.classList.remove("open"); }
  function switchTab(tab) {
    el.authTabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
    el.loginForm.classList.toggle("active", tab === "login");
    el.registerForm.classList.toggle("active", tab === "register");
    exitVerifyStep();
  }
  function enterVerifyStep() {
    if (!el.registerFields || !el.verifyStep) return;
    el.registerFields.classList.add("hidden");
    el.verifyStep.classList.remove("hidden");
    el.verifyCodeInput.value = "";
    el.verifyMsg.textContent = "";
    el.verifyMsg.className = "verify-msg";
    setTimeout(() => el.verifyCodeInput.focus(), 50);
  }
  function exitVerifyStep() {
    if (!el.registerFields || !el.verifyStep) return;
    el.verifyStep.classList.add("hidden");
    el.registerFields.classList.remove("hidden");
    el.verifyMsg.textContent = "";
    el.verifyMsg.className = "verify-msg";
  }
  function showVerifyMsg(text, kind) {
    if (!el.verifyMsg) return;
    el.verifyMsg.textContent = text;
    el.verifyMsg.className = "verify-msg" + (kind ? " " + kind : "");
  }
  el.userBtn.addEventListener("click", () => {
    if (Auth.isAdmin()) {
      enterAdminMode();
      return;
    }
    if (Auth.isLoggedIn()) openProfile();
    else openAuth();
  });

  /* ===== Modo admin (painel da dona na própria página) ===== */
  function enterAdminMode() {
    document.body.classList.add("admin-mode");
    if (window.AdminPanel) window.AdminPanel.show();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function exitAdminMode() {
    document.body.classList.remove("admin-mode");
    if (window.AdminPanel) window.AdminPanel.hide();
    renderAnn();
    renderProducts();
    renderOffers();
    renderStats();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (el.adminViewStore) el.adminViewStore.addEventListener("click", (e) => {
    e.preventDefault();
    exitAdminMode();
  });

  /* ===== Profile dashboard ===== */
  function renderNavAvatar() {
    const u = Auth.isLoggedIn() ? Auth.currentUser() : null;
    if (u && u.avatar) {
      el.userBtn.innerHTML = `<img src="${u.avatar}" alt="avatar" class="nav-avatar">`;
    } else {
      el.userBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    }
  }

  function openProfile() {
    const u = Auth.refreshSession();
    if (!u) return openAuth();
    el.profileRealName.value = u.name || "";
    el.profileEmail.value = u.email || "";
    el.profileNickname.value = u.nickname || "";
    el.profilePhone.value = u.phone || "";
    el.profileAvatar.src = u.avatar || "";
    el.profileAvatar.style.display = u.avatar ? "block" : "none";

    const orders = Store.getOrders().filter((o) => o.customer.email === u.email);
    const spent = orders.filter((o) => o.status !== "Pendente").reduce((s, o) => s + o.total, 0);
    el.profileStats.innerHTML = `
      <div class="p-stat"><strong>${orders.length}</strong><span>pedidos</span></div>
      <div class="p-stat"><strong>${fmt(spent)}</strong><span>pagos</span></div>
      <div class="p-stat"><strong>${u.since || "—"}</strong><span>na T&E</span></div>`;

    renderProfileCoupons(u);

    el.profileModal.classList.add("open");
  }

  function renderProfileCoupons(u) {
    if (!el.profileCoupons) return;
    const coupons = Store.getCoupons();
    const mine = (u.coupons || []).filter((m) => !m.usedAt);
    const used = u.coupons || [];
    let html = "";

    coupons.filter((c) => c.active && (c.grant === "welcome" || c.grant === "threshold")).forEach((c) => {
      const granted = mine.find((m) => m.code.toUpperCase() === c.code.toUpperCase());
      if (granted) {
        html += `<div class="coupon-chip"><span class="cc-code">${c.code}</span><span class="cc-label">${c.title || c.code}</span><span class="cc-status">Disponível 🟢</span></div>`;
      } else if (used.some((m) => m.code.toUpperCase() === c.code.toUpperCase())) {
        html += `<div class="coupon-chip used"><span class="cc-code">${c.code}</span><span class="cc-label">${c.title || c.code}</span><span class="cc-status">Usado ✅</span></div>`;
      } else if (c.grant === "threshold") {
        const paidTotal = Store.getOrders().filter((o) => o.customer.email === u.email && o.status !== "Pendente").reduce((s, o) => s + o.total, 0);
        const pct = paidTotal >= c.threshold ? 100 : Math.min(100, Math.round((paidTotal / c.threshold) * 100));
        html += `<div class="coupon-chip locked"><span class="cc-code">${c.code}</span><span class="cc-label">${c.title || c.code}</span><div class="cc-bar"><i style="width:${pct}%"></i></div><span class="cc-status">${pct >= 100 ? "Vai liberar no próximo pagamento confirmado 🎉" : "Falta " + fmt(Math.max(0, c.threshold - paidTotal)) + " p/ liberar"}</span></div>`;
      } else if (c.grant === "welcome") {
        html += `<div class="coupon-chip locked"><span class="cc-code">${c.code}</span><span class="cc-label">${c.title || c.code}</span><span class="cc-status">Liberado no cadastro 🎟️</span></div>`;
      }
    });

    coupons.filter((c) => c.active && c.grant === "manual").forEach((c) => {
      if (c.uses > 0 && c.used >= c.uses) return;
      html += `<div class="coupon-chip manual"><span class="cc-code">${c.code}</span><span class="cc-label">${c.title || "Cupom público"}${c.minSpend > 0 ? " · mín. " + fmt(c.minSpend) : ""}</span><span class="cc-status">Digite no checkout ✍️</span></div>`;
    });

    el.profileCoupons.innerHTML = html || `<p class="coupon-hint">Sem cupons disponíveis no momento.</p>`;
  }

  el.profilePhoto.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    resizeImage(file, 220, (dataUrl) => {
      el.profileAvatar.src = dataUrl;
      el.profileAvatar.style.display = "block";
    });
  });

  function resizeImage(file, maxW, cb) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        cb(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  el.saveProfile.addEventListener("click", () => {
    const u = Auth.currentUser();
    if (!u) return closeProfile();
    const nickname = el.profileNickname.value.trim();
    if (!nickname) return showToast("Preencha seu apelido", "error");
    Auth.updateProfile(u.id, {
      nickname,
      phone: el.profilePhone.value.trim(),
      avatar: el.profileAvatar.style.display === "none" ? "" : el.profileAvatar.src
    });
    renderNavAvatar();
    showToast("Perfil atualizado! 💖");
  });

  const closeProfile = () => el.profileModal.classList.remove("open");
  el.closeProfile.addEventListener("click", closeProfile);
  el.profileModal.addEventListener("click", (e) => { if (e.target === el.profileModal) closeProfile(); });
  el.logoutProfile.addEventListener("click", () => {
    closeProfile();
    Auth.logout();
    Cart.clear();
    updateCartUI();
    updateNavAuth();
    renderNavAvatar();
    renderNotifBadge();
    showToast("Você saiu da conta", "info");
  });
  el.closeModal.addEventListener("click", closeAuth);
  el.authModal.addEventListener("click", (e) => { if (e.target === el.authModal) closeAuth(); });
  el.goRegister.addEventListener("click", (e) => { e.preventDefault(); switchTab("register"); });
  el.goLogin.addEventListener("click", (e) => { e.preventDefault(); switchTab("login"); });
  el.noUserLogin.addEventListener("click", (e) => { e.preventDefault(); openAuth("login"); });
  el.authTabs.forEach((t) => t.addEventListener("click", () => switchTab(t.dataset.tab)));
  el.footerLogin.addEventListener("click", (e) => { e.preventDefault(); openAuth(); });

  el.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("#loginEmail").value.trim();
    const password = $("#loginPassword").value;
    if (email.toLowerCase() === Store.ADMIN.email) {
      const res = await Auth.loginAdmin(email, password);
      if (res.error) return showToast(res.error, "error");
      closeAuth(); el.loginForm.reset();
      showToast("Bem-vinda, Dona! Painel aberto 💝");
      enterAdminMode();
      return;
    }
    const res = Auth.login(email, password);
    if (res.error) return showToast(res.error, "error");
    closeAuth(); el.loginForm.reset();
    updateCartUI();
    updateNavAuth();
    renderNavAvatar();
    renderNotifBadge();
    showToast("Bem-vinda de volta, " + Auth.displayName(Auth.currentUser()) + "! 💖");
  });
  el.registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (el.verifyStep && !el.verifyStep.classList.contains("hidden")) {
      el.verifySubmit.click();
      return;
    }
    const fullName = $("#regFullName").value.trim();
    const email = $("#regEmail").value.trim();
    const password = $("#regPassword").value;
    const nickname = $("#regNickname").value.trim();
    const phone = $("#regPhone").value.trim();
    if (fullName.length < 3) return showToast("Informe seu nome completo real", "error");
    if (password.length < 6) return showToast("Senha deve ter no mínimo 6 caracteres", "error");
    if (email.toLowerCase() === Store.ADMIN.email) return showToast("Este e-mail pertence à conta da dona", "error");
    pendingRegData = { fullName, email, password, nickname, phone };
    const sent = await Auth.sendVerifyCode(email, nickname || fullName.split(" ")[0]);
    if (sent.error) return showToast(sent.error, "error");
    pendingVerifyEmail = email;
    el.verifyEmail.textContent = email;
    enterVerifyStep();
    if (sent.sent) {
      showVerifyMsg("📩 Código enviado para " + email + ". Confira sua caixa de entrada (e o spam).", "ok");
    } else {
      showVerifyMsg("⚠️ Envio por e-mail ainda não foi configurado na loja. Código de teste (demo): " + sent.code, "warn");
    }
  });
  el.verifySubmit.addEventListener("click", (e) => {
    e.preventDefault();
    const code = el.verifyCodeInput.value.trim();
    if (!/^\d{6}$/.test(code)) return showVerifyMsg("Digite o código de 6 dígitos que foi enviado.", "warn");
    if (!Auth.verifyCode(pendingVerifyEmail, code)) return showVerifyMsg("Código incorreto ou expirado. Toque em \"Reenviar código\".", "warn");
    el.verifySubmit.disabled = true;
    const res = Auth.register(pendingRegData);
    if (res.error) {
      el.verifySubmit.disabled = false;
      return showVerifyMsg(res.error, "warn");
    }
    pendingRegData = null;
    pendingVerifyEmail = null;
    closeAuth();
    exitVerifyStep();
    el.registerForm.reset();
    updateCartUI();
    updateNavAuth();
    renderNavAvatar();
    renderNotifBadge();
    showToast("Conta criada! Bem-vinda, " + Auth.displayName(Auth.currentUser()) + "! 💖");
    const welcome = Auth.currentUser().coupons || [];
    if (welcome.length) showToast("🎟️ Você ganhou o cupom " + welcome.map((c) => c.code).join(" e ") + "! Veja no seu perfil.", "info", 4500);
  });
  el.verifyResend.addEventListener("click", async () => {
    if (!pendingVerifyEmail) return;
    const sent = await Auth.sendVerifyCode(pendingVerifyEmail);
    if (sent.error) return showToast(sent.error, "error");
    if (sent.sent) showVerifyMsg("📩 Novo código enviado! Confira seu e-mail (e o spam).", "ok");
    else {
      showVerifyMsg("⚠️ Envio por e-mail não configurado. Código de teste (demo): " + sent.code, "warn");
      el.verifyCodeInput.value = sent.code;
    }
  });
  el.verifyBack.addEventListener("click", exitVerifyStep);
  el.goLogin2.addEventListener("click", (e) => { e.preventDefault(); switchTab("login"); });
  el.verifyCodeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); el.verifySubmit.click(); } });

  /* ===== Pix ===== */
  const PIX = {
    key: "a4f8b1c2d3e4f5a6789012345678abcd11",
    name: "T&E Variedades",
    city: "Fortaleza-CE"
  };

  function calcCrc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  function emvField(id, value) {
    const v = String(value);
    return id + String(v.length).padStart(2, "0") + v;
  }

  function makePixPayload(amount, txid, key) {
    const gui = emvField("00", "BR.GOV.BCB.PIX");
    const chave = emvField("01", key || PIX.key);
    const payload = [
      emvField("00", "01"),
      emvField("26", gui + chave),
      emvField("52", "0000"),
      emvField("53", "986"),
      emvField("54", Number(amount).toFixed(2)),
      emvField("58", "BR"),
      emvField("59", PIX.name.slice(0, 25)),
      emvField("60", PIX.city.slice(0, 15)),
      emvField("62", emvField("05", String(txid || "***").slice(0, 25)))
    ].join("");
    return payload + "6304" + calcCrc16(payload + "6304");
  }

  function checkoutTotal() {
    const sub = Cart.subtotal();
    const disc = appliedCoupon ? appliedCoupon.discount : 0;
    return Math.round((sub - disc + Cart.calcShipping(sub - disc).value) * 100) / 100;
  }

  const WOOVI_BASE = "https://api.openpix.com.br";
  let pixWoovi = null;
  let pendingRegData = null;
  let pendingVerifyEmail = null;

  function drawLocalQr(payload) {
    el.pixCode.value = payload;
    el.pixQr.removeAttribute("onerror");
    try {
      if (typeof qrcode === "undefined") throw "lib-ausente";
      const qr = qrcode(0, "M");
      qr.addData(payload);
      qr.make();
      el.pixQr.src = qr.createDataURL(4, 3);
      el.pixQr.className = "";
    } catch (e) {
      el.pixQr.src = "";
      el.pixQr.className = "pix-qr-fallback";
      el.pixQr.alt = "Não foi possível gerar o QR. Use o código copia-e-cola.";
    }
  }

  function setPixStatus(text, kind) {
    if (!el.pixStatus) return;
    el.pixStatus.textContent = text;
    el.pixStatus.className = "pix-status" + (kind ? " " + kind : "");
  }

  function showNoPix() {
    el.pixCode.value = "";
    el.pixQr.removeAttribute("onerror");
    el.pixQr.src = "";
    el.pixQr.className = "pix-qr-fallback";
    el.pixQr.alt = "";
    setPixStatus("Pix real indisponível: a loja ainda não ativou a cobrança por aplicativo. Fale com a loja. ⚠️", "bad");
  }

  async function wooviCreateCharge(orderId, value, name, email) {
    const appId = Store.getWoovi().appId;
    const res = await fetch(WOOVI_BASE + "/api/openpix/v1/charge", {
      method: "POST",
      headers: { Authorization: appId, "Content-Type": "application/json" },
      body: JSON.stringify({
        correlationID: orderId,
        value: value,
        comment: "Pedido " + orderId + " - T&E Variedades",
        customer: { name: name, email: email }
      })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body.error && (body.error.message || body.error)) || ("HTTP " + res.status));
    }
    const data = await res.json();
    const ch = (data && data.charge) || data || {};
    return { id: ch.identifier, brCode: ch.brCode, corr: ch.correlationID || orderId };
  }

  async function renderPix() {
    const pay = document.querySelector('input[name="pay"]:checked');
    if (!pay || pay.value !== "Pix") return el.pixBox.classList.add("hidden");
    el.pixBox.classList.remove("hidden");
    const total = checkoutTotal();
    el.pixAmount.textContent = fmt(total);
    const cents = Math.max(1, Math.round(total * 100));
    const wc = Store.getWoovi();
    if (wc.appId) {
      try {
        if (!pixWoovi || pixWoovi.cents !== cents) {
          const user = Auth.currentUser();
          const corr = "TE-" + Date.now().toString().slice(-8);
          const charge = await wooviCreateCharge(corr, cents, Auth.displayName(user), user.email);
          pixWoovi = { cents: cents, corr: charge.corr, id: charge.id };
          drawLocalQr(charge.brCode);
          setPixStatus("Cobrança emitida pela Woovi (Pix real) ✅", "ok");
        }
        return;
      } catch (e) {
        pixWoovi = null;
      }
    }
    const localKey = wc.pixKey;
    if (localKey) {
      drawLocalQr(makePixPayload(total, "TE" + Date.now().toString().slice(-6), localKey));
      setPixStatus("Pix da chave da loja (cobrança avulsa)", "ok");
    } else {
      showNoPix();
    }
  }

  el.pixCopy.addEventListener("click", () => {
    const code = el.pixCode.value;
    if (!code) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => showToast("Código Pix copiado! ✅"))
        .catch(() => copyOld(code));
    } else copyOld(code);
  });
  function copyOld(text) {
    el.pixCode.select();
    el.pixCode.setSelectionRange(0, 99999);
    try { document.execCommand("copy"); showToast("Código Pix copiado! ✅"); }
    catch (e) { showToast("Selecione o código acima e copie manualmente.", "info"); }
  }
  el.pixCode.addEventListener("click", () => el.pixCode.select());
  document.querySelectorAll('#payMethods input[name="pay"]').forEach((r) => {
    r.addEventListener("change", () => renderPix());
  });

  /* ===== Checkout ===== */
  let appliedCoupon = null;

  function couponDiscount(def, sub) {
    return def.type === "percent" ? Math.round(sub * def.value / 100 * 100) / 100 : Math.min(def.value, sub);
  }
  function couponValueLabel(def, sub) {
    return def.type === "percent" ? def.value + "%" : fmt(couponDiscount(def, sub));
  }

  el.checkoutBtn.addEventListener("click", () => {
    if (!Auth.isLoggedIn()) return openAuth("login");
    if (Cart.count() === 0) return showToast("Seu carrinho está vazio", "error");
    el.couponInput.value = "";
    el.couponMsg.textContent = "";
    appliedCoupon = null;
    renderCouponUI();
    renderCheckoutSummary();
    el.checkoutModal.classList.add("open");
  });

  function renderCouponUI() {
    const has = !!appliedCoupon;
    el.couponApplied.classList.toggle("hidden", !has);
    if (has) {
      el.couponCodeLabel.textContent = appliedCoupon.code;
      el.couponValueLabel.textContent = appliedCoupon.valueLabel;
    }
  }

  function renderCheckoutSummary() {
    const items = Cart.getItems();
    el.checkoutSummary.innerHTML = items.map((i) =>
      `<div class="co-row"><span>${i.emoji} ${i.name} × ${i.qty}</span><span>${fmt(i.price * i.qty)}</span></div>`).join("");
    let sub = Cart.subtotal();
    const disc = appliedCoupon ? appliedCoupon.discount : 0;
    const paySub = sub - disc;
    const ship = Cart.calcShipping(paySub);
    el.shippingBox.innerHTML = (disc > 0 ? `<div class="shipping-row co-disc"><span>🎟️ Cupom ${appliedCoupon.code}</span><span>-${fmt(disc)}</span></div>` : "") +
      `<div class="shipping-row"><strong>${ship.method}</strong><span>${fmt(ship.value)} (${ship.pct}%)</span></div>
      <div class="cart-total"><span>Total</span><span>${fmt(paySub + ship.value)}</span></div>`;
    renderPix();
  }

  function validateCoupon(code) {
    const raw = String(code || "").trim().toUpperCase();
    if (!raw) return { error: "Digite um código de cupom." };
    const def = Store.getCoupons().find((c) => c.code.toUpperCase() === raw);
    if (!def) return { error: "Cupom não encontrado. Confira o código." };
    if (!def.active) return { error: "Este cupom está pausado no momento." };
    const user = Auth.currentUser();
    const sub = Cart.subtotal();
    if (def.minSpend > 0 && sub < def.minSpend) return { error: "Compra mínima de " + fmt(def.minSpend) + " para este cupom." };
    if (def.grant === "welcome" || def.grant === "threshold") {
      const mine = ((user && user.coupons) || []).find((x) => x.code.toUpperCase() === raw);
      if (!mine) {
        if (def.grant === "welcome") return { error: "Este cupom é liberado automaticamente no seu cadastro. 🎟️" };
        return { error: "Este cupom libera ao atingir R$" + (Number(def.threshold) || 0).toFixed(2).replace(".", ",") + " em compras pagas." };
      }
      if (mine.usedAt) return { error: "Este cupom já foi usado. 💔" };
    }
    if (def.grant === "manual" && def.uses > 0 && def.used >= def.uses) return { error: "Este cupom atingiu o limite de usos." };
    return { def, discount: couponDiscount(def, sub) };
  }

  el.couponApply.addEventListener("click", () => {
    const res = validateCoupon(el.couponInput.value);
    el.couponMsg.textContent = res.error || "";
    if (res.error) return;
    appliedCoupon = { ...res.def, discount: res.discount, valueLabel: couponValueLabel(res.def, Cart.subtotal()) };
    el.couponMsg.textContent = "";
    renderCouponUI();
    renderCheckoutSummary();
    showToast("Cupom aplicado: " + res.def.code + " 🎉", "success");
  });
  el.couponRemove.addEventListener("click", () => {
    appliedCoupon = null;
    el.couponMsg.textContent = "";
    renderCouponUI();
    renderCheckoutSummary();
  });
  el.couponInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); el.couponApply.click(); } });

  const closeCheckout = () => { el.checkoutModal.classList.remove("open"); appliedCoupon = null; renderCouponUI(); };
  el.closeCheckout.addEventListener("click", closeCheckout);
  el.checkoutModal.addEventListener("click", (e) => { if (e.target === el.checkoutModal) closeCheckout(); });

  el.checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = Auth.currentUser();
    const sub = Cart.subtotal();
    const disc = appliedCoupon ? appliedCoupon.discount : 0;
    const paySub = sub - disc;
    const ship = Cart.calcShipping(paySub);
    const items = Cart.getItems().map((i) => ({
      id: i.id, name: i.name, qty: i.qty, price: i.price, emoji: i.emoji, image: i.image
    }));
    const orderId = (pixWoovi && pixWoovi.corr) ? pixWoovi.corr : "TE-" + Date.now().toString().slice(-8);
    const order = {
      id: orderId,
      date: new Date().toLocaleString("pt-BR"),
      customer: {
        name: $("#checkoutForm input[placeholder='Nome completo']").value.trim(),
        address: $("#checkoutForm input[placeholder='Endereço completo']").value.trim(),
        cep: $("#checkoutCep").value.trim(),
        city: $("#checkoutForm input[placeholder='Cidade / Estado']").value.trim(),
        email: user.email
      },
      payment: (document.querySelector('input[name="pay"]:checked') || {}).value || "Pix",
      items,
      subtotal: sub, couponCode: appliedCoupon ? appliedCoupon.code : "", discount: disc,
      shippingPct: ship.pct, shippingValue: ship.value, total: Math.round((paySub + ship.value) * 100) / 100,
      status: "Pendente", tracking: "",
      wooviChargeId: (pixWoovi && pixWoovi.id) || ""
    };
    pixWoovi = null;
    const orders = Store.getOrders();
    orders.unshift(order);
    Store.saveOrders(orders);
    if (appliedCoupon) consumeCoupon(appliedCoupon);

    el.successName.textContent = Auth.displayName(user);
    el.successOrder.innerHTML = `
      <p><strong>Pedido:</strong> ${order.id}</p>
      ${disc > 0 ? `<p><strong>Cupom:</strong> ${order.couponCode} (-${fmt(disc)})</p>` : ""}
      <p><strong>Valor total:</strong> ${fmt(order.total)} (inclui ${ship.method} de ${fmt(ship.value)})</p>
      <p><strong>Pagamento:</strong> ${order.payment === "Pix" ? "Pix 💸" : order.payment}</p>
      <p class="track-hint">📦 Assim que a loja confirmar o pagamento, o pedido aparece em "Minhas compras", com o status e o rastreio do Frete Fácil.</p>`;

    Cart.clear();
    updateCartUI();
    closeCheckout();
    el.checkoutForm.reset();
    el.successModal.classList.add("open");
  });

  function consumeCoupon(cDef) {
    let coupons = Store.getCoupons();
    const idx = coupons.findIndex((c) => c.id === cDef.id);
    if (idx !== -1) { coupons[idx].used = (coupons[idx].used || 0) + 1; Store.saveCoupons(coupons); }
    const user = Auth.currentUser();
    if (!user) return;
    let users = Store.getUsers();
    const u = users.find((x) => x.email === user.email);
    if (u && (cDef.grant === "welcome" || cDef.grant === "threshold")) {
      const mine = u.coupons.find((c) => c.code.toUpperCase() === cDef.code && !c.usedAt);
      if (mine) mine.usedAt = new Date().toISOString();
      Store.saveUsers(users);
    }
  }
  const closeSuccess = () => el.successModal.classList.remove("open");
  el.closeSuccess.addEventListener("click", closeSuccess);
  el.successDone.addEventListener("click", closeSuccess);
  el.successModal.addEventListener("click", (e) => { if (e.target === el.successModal) closeSuccess(); });

  /* ===== Minhas Compras (dashboard separada) ===== */
  function orderCard(o) {
    const paid = o.status !== "Pendente";
    return `
      <div class="order-mini ${paid ? "paid" : ""}">
        <div class="order-mini-head"><strong>${o.id}</strong><span>${o.date}</span></div>
        <p>${o.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}</p>
        <p class="order-total">${fmt(o.total)}</p>
        <div class="status-badge ${(o.status || "pendente").toLowerCase()}">${o.status}${o.tracking ? " · " + o.tracking : ""}</div>
      </div>`;
  }

  function openOrdersDash() {
    if (!Auth.isLoggedIn()) return openAuth("login");
    const u = Auth.refreshSession();
    const orders = Store.getOrders().filter((o) => o.customer.email === u.email);
    const pending = orders.filter((o) => o.status === "Pendente");
    const bought = orders.filter((o) => o.status !== "Pendente");
    const spent = bought.reduce((s, o) => s + o.total, 0);

    el.dashStats.innerHTML = `
      <div class="d-stat"><strong>${orders.length}</strong><span>pedidos</span></div>
      <div class="d-stat"><strong>${fmt(spent)}</strong><span>em compras</span></div>
      <div class="d-stat"><strong>${pending.length}</strong><span>aguardando</span></div>`;

    el.dashPending.innerHTML = pending.length
      ? pending.map(orderCard).join("")
      : `<p class="empty-orders">Nenhum pedido aguardando pagamento. 😌</p>`;

    el.dashBought.innerHTML = bought.length
      ? bought.map(orderCard).join("")
      : `<p class="empty-orders">Nada por aqui ainda. Assim que você comprar e a loja confirmar o pagamento, seus itens aparecem aqui! 💖</p>`;

    setDashTab("pending");
    el.ordersDashModal.classList.add("open");
  }

  function setDashTab(tab) {
    el.dashTabs.forEach((t) => t.classList.toggle("active", t.dataset.dashtab === tab));
    el.dashPending.classList.toggle("hidden", tab !== "pending");
    el.dashBought.classList.toggle("hidden", tab !== "bought");
  }
  el.dashTabs.forEach((t) => t.addEventListener("click", () => setDashTab(t.dataset.dashtab)));

  const closeOrdersDash = () => el.ordersDashModal.classList.remove("open");
  el.closeOrdersDash.addEventListener("click", closeOrdersDash);
  el.ordersDashDone.addEventListener("click", closeOrdersDash);
  el.ordersDashModal.addEventListener("click", (e) => { if (e.target === el.ordersDashModal) closeOrdersDash(); });

  el.ordersBtn.addEventListener("click", () => {
    if (Auth.isLoggedIn()) openOrdersDash();
    else openAuth("login");
  });
  el.footerTrack.addEventListener("click", (e) => {
    e.preventDefault();
    if (Auth.isLoggedIn()) openOrdersDash();
    else openAuth("login");
  });

  /* ===== Newsletter ===== */
  el.newsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    el.newsForm.reset();
    showToast("Assinatura confirmada! Novidades a caminho 💌");
  });

  /* ===== Stats ===== */
  function renderStats() {
    const prods = Store.getProducts().length;
    const orders = Store.getOrders().length;
    const sales = Store.getOrders().reduce((s, o) => s + o.total, 0);
    el.statsRow.innerHTML = `
      <div class="stat"><h3>+${prods}</h3><p>Produtos</p></div>
      <div class="stat"><h3>${orders}</h3><p>Pedidos</p></div>
      <div class="stat"><h3>${fmt(sales)}</h3><p>Em vendas</p></div>`;
  }

  /* ===== Testimonials carousel ===== */
  const TESTIMONIALS = [
    { stars: "★★★★★", text: "O batom matte chegou rapidinho pelo Frete Fácil e tem uma duração incrível. Amei!", name: "Marina", tag: "Maquiagem diária", bg: "#ff6fa5" },
    { stars: "★★★★★", text: "A base é maravilhosa, cobertura perfeita. O atendimento da T&E é super atencioso.", name: "Carlos", tag: "Presente para a esposa", bg: "#a855f7" },
    { stars: "★★★★★", text: "Sérum chegou embalado com muito cuidado. Qualidade de loja grande, carinho de loja pequena.", name: "Juliana", tag: "Skincare", bg: "#f59e0b" },
    { stars: "★★★★★", text: "O rímel a prova d'água aguentou meu dia inteiro de trabalho. Virei cliente fiel!", name: "Ana Paula", tag: "Maquiagem diária", bg: "#06b6d4" },
    { stars: "★★★★★", text: "Meu esmalte veio direitinho, sem quebrar nada. Embalaram super bem, tomara que sempre seja assim.", name: "Débora", tag: "Unhas perfeitas", bg: "#10b981" },
    { stars: "★★★★☆", text: "O perfume chegou numa caixinha toda caprichada, cheiro doce que dura a noite toda.", name: "Rafaela", tag: "Perfumes", bg: "#ec4899" },
    { stars: "★★★★★", text: "Comprei o hidratante no domingo e na sexta já estava na minha casa, no interior de SC. Frete Fácil nota 10.", name: "Letícia", tag: "Skincare", bg: "#6366f1" },
    { stars: "★★★★★", text: "Atendimento de gente para gente. Tive uma dúvida e responderam rapidinho no WhatsApp.", name: "Fernanda", tag: "Rastreio & suporte", bg: "#f97316" }
  ];

  let tIndex = 0;
  let tTimer = null;

  function perPageTestimonials() {
    return window.innerWidth < 768 ? 1 : 3;
  }
  function totalPages() { return Math.max(1, TESTIMONIALS.length - perPageTestimonials() + 1); }

  function renderTestimonials() {
    el.testimonialsRow.innerHTML = TESTIMONIALS.map((t) =>
      `<div class="testimonial">` +
        `<div class="stars">${t.stars}</div>` +
        `<p>"${t.text}"</p>` +
        `<div class="t-user"><div class="avatar" style="background:${t.bg}">${t.name[0]}</div><div><strong>${t.name}</strong><small>${t.tag}</small></div></div>` +
      `</div>`
    ).join("");
    el.tDots.innerHTML = Array.from({ length: totalPages() }, (_, i) =>
      `<button class="t-dot${i === tIndex ? " active" : ""}" data-tdot="${i}" aria-label="Depoimento ${i + 1}"></button>`
    ).join("");
  }

  function showTestimonials() {
    const per = perPageTestimonials();
    const cards = el.testimonialsRow.children;
    Array.from(cards).forEach((card, i) => {
      card.classList.toggle("active", i >= tIndex && i < tIndex + per);
    });
    Array.from(el.tDots.children).forEach((d, i) => d.classList.toggle("active", i === tIndex));
  }

  function nextTestimonials() { tIndex = (tIndex + 1 >= totalPages()) ? 0 : tIndex + 1; restartT(); showTestimonials(); }
  function prevTestimonials() { tIndex = (tIndex - 1 < 0) ? totalPages() - 1 : tIndex - 1; restartT(); showTestimonials(); }
  function restartT() { if (tTimer) clearInterval(tTimer); tTimer = setInterval(nextTestimonials, 5000); }

  el.tPrev.addEventListener("click", prevTestimonials);
  el.tNext.addEventListener("click", nextTestimonials);
  el.tDots.addEventListener("click", (e) => {
    const dot = e.target.closest("[data-tdot]");
    if (!dot) return;
    tIndex = parseInt(dot.dataset.tdot, 10);
    restartT(); showTestimonials();
  });
  restartT();

  /* ===== Theme toggle ===== */
  function applyTheme(saved) {
    document.body.classList.toggle("dark", saved === "dark");
    if (el.themeIcon) el.themeIcon.textContent = saved === "dark" ? "☀️" : "🌙";
  }
  applyTheme(localStorage.getItem("te_theme"));
  if (el.themeToggle) {
    el.themeToggle.addEventListener("click", () => {
      const dark = !document.body.classList.contains("dark");
      localStorage.setItem("te_theme", dark ? "dark" : "light");
      applyTheme(dark ? "dark" : "light");
      showToast(dark ? "Tema escuro ativado 🌙" : "Tema claro ativado ☀️", "info");
    });
  }

  /* ===== Notifications ===== */
  const NOTIF_ICON = { coupon: "🎟️", order: "📦", product: "🛍️", promo: "💖" };

  function renderNotifBadge() {
    const u = Auth.isLoggedIn() ? Auth.currentUser() : null;
    if (!u) { el.notifBadge.classList.add("hidden"); return; }
    const unread = (u.notifications || []).filter((n) => !n.read).length;
    el.notifBadge.textContent = unread > 99 ? "99+" : unread;
    el.notifBadge.classList.toggle("hidden", unread === 0);
  }

  function fmtNotifTime(iso) {
    try {
      return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch (e) { return ""; }
  }

  function renderNotifList() {
    const u = Auth.currentUser();
    const list = (u.notifications || []).slice(0, 30);
    el.notifList.innerHTML = list.length
      ? list.map((n) => `
        <div class="notif-item ${n.read ? "read" : ""}">
          <span class="notif-icon">${NOTIF_ICON[n.type] || "🔔"}</span>
          <div class="notif-body">
            <p>${n.text}</p>
            <small>${fmtNotifTime(n.date)}</small>
          </div>
          ${n.read ? "" : '<span class="notif-dot"></span>'}
        </div>`).join("")
      : `<p class="empty-txt">Nenhuma notificação por aqui. 🔕</p>`;
  }

  function openNotifPanel() {
    if (!Auth.isLoggedIn()) return openAuth("login");
    const u = Auth.refreshSession();
    Auth.markAllRead(u.id);
    Auth.refreshSession();
    renderNotifList();
    renderNotifBadge();
    el.notifPanel.classList.add("open");
    el.notifOverlay.classList.add("open");
  }
  function closeNotifPanel() {
    el.notifPanel.classList.remove("open");
    el.notifOverlay.classList.remove("open");
  }

  el.notifBtn.addEventListener("click", () => {
    if (el.notifPanel.classList.contains("open")) return closeNotifPanel();
    openNotifPanel();
  });
  el.notifClose.addEventListener("click", closeNotifPanel);
  el.notifOverlay.addEventListener("click", closeNotifPanel);
  el.notifMarkAll.addEventListener("click", () => {
    const u = Auth.refreshSession();
    Auth.markAllRead(u.id);
    Auth.refreshSession();
    renderNotifList();
    renderNotifBadge();
  });
  el.notifClear.addEventListener("click", () => {
    const u = Auth.currentUser();
    let users = Store.getUsers();
    users = users.map((x) => x.id === u.id ? { ...x, notifications: [] } : x);
    Store.saveUsers(users);
    Auth.refreshSession();
    renderNotifList();
    renderNotifBadge();
  });
  el.notifPanel.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", (e) => {
    if (el.notifPanel.classList.contains("open") && !e.target.closest(".notif-panel") && !e.target.closest("#notifBtn")) closeNotifPanel();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNotifPanel(); });

  /* ===== Init ===== */
  function refreshData() {
    renderAnn();
    renderFilterBar();
    renderProducts();
    renderOffers();
    renderStats();
    renderTestimonials();
    showTestimonials();
    updateCartUI();
    updateNavAuth();
    renderNavAvatar();
    renderNotifBadge();
    if (activeProductId != null && el.productModal.classList.contains("open")) renderProductReviews(activeProductId);
  }

  if (Auth.isAdmin()) {
    enterAdminMode();
  }
  renderAnn();
  renderFilterBar();
  renderProducts();
  renderOffers();
  renderStats();
  renderTestimonials();
  showTestimonials();
  updateCartUI();
  updateNavAuth();
  renderNavAvatar();
  renderNotifBadge();
  window.addEventListener("resize", () => { tIndex = 0; renderTestimonials(); showTestimonials(); });

  /* ===== Sincroniza com o servidor e acompanha mudanças da dona ===== */
  Store.watch(refreshData);
  Store.sync().then((ok) => {
    if (ok) refreshData();
    Store.startAutoSync(15000);
  });
})();