(function () {
  let pendingVerify = { email: "", code: "", expiresAt: 0 };

  const Auth = {
    isLoggedIn: function () {
      const s = Store.getSession();
      return !!s && !s.admin;
    },
    isAdmin: function () {
      const s = Store.getSession();
      return !!s && s.admin === true;
    },
    currentUser: function () {
      return Store.getSession();
    },
    findUser: function (id) {
      return Store.getUsers().find(u => u.id === id) || null;
    },
    refreshSession: function () {
      const sess = Store.getSession();
      if (!sess || sess.admin) return sess;
      const u = Auth.findUser(sess.id);
      if (u) {
        const fresh = { id: u.id, name: u.fullName, email: u.email, nickname: u.nickname, phone: u.phone, avatar: u.avatar, realNameLocked: u.realNameLocked, since: u.since, coupons: u.coupons || [], notifications: u.notifications || [] };
        Store.setSession(fresh);
        return fresh;
      }
      return sess;
    },
    displayName: function (user) {
      if (!user) return "";
      return user.nickname || String(user.name || "").split(" ")[0] || "cliente";
    },
    loginAdmin: function (email, password) {
      if (email === Store.ADMIN.email && password === Store.ADMIN.password) {
        Store.setSession({ admin: true, name: "Dona T&E", email });
        return { success: true };
      }
      return { error: "Acesso negado. Verifique suas credenciais de dona." };
    },
    register: function (data) {
      const users = Store.getUsers();
      if (users.some(u => u.email === data.email)) {
        return { error: "Este e-mail já está cadastrado." };
      }
      const rewards = Store.getCoupons()
        .filter(c => c.active && c.grant === "welcome")
        .map(c => ({ code: c.code, grantedAt: new Date().toISOString(), usedAt: null }));
      const notifications = rewards.map((r) => ({
        id: Date.now() + Math.random(),
        type: "coupon",
        text: "Você ganhou o cupom " + r.code + "! Use no checkout e economize 🎟️"
      }));
      const user = {
        id: Date.now(),
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        nickname: data.nickname || String(data.fullName || "").split(" ")[0],
        phone: data.phone || "",
        avatar: data.avatar || "",
        realNameLocked: true,
        since: new Date().toISOString().slice(0, 10),
        coupons: rewards,
        notifications
      };
      users.push(user);
      Store.saveUsers(users);
      Store.setSession({ id: user.id, name: user.fullName, email: user.email, nickname: user.nickname, phone: user.phone, avatar: user.avatar, realNameLocked: true, since: user.since, coupons: user.coupons, notifications: user.notifications });
      return { success: true, user };
    },
    login: function (email, password) {
      const users = Store.getUsers();
      const user = users.find(u => u.email === email);
      if (!user) return { error: "E-mail não encontrado. Faça seu cadastro." };
      if (user.password !== password) return { error: "Senha incorreta." };
      Store.setSession({ id: user.id, name: user.fullName, email: user.email, nickname: user.nickname, phone: user.phone, avatar: user.avatar, realNameLocked: user.realNameLocked, since: user.since, coupons: user.coupons || [], notifications: user.notifications || [] });
      return { success: true, user };
    },
    updateProfile: function (id, changes) {
      let users = Store.getUsers();
      let updated = null;
      users = users.map(u => {
        if (u.id !== id) return u;
        const merged = { ...u };
        if (changes.nickname !== undefined) merged.nickname = changes.nickname;
        if (changes.phone !== undefined) merged.phone = changes.phone;
        if (changes.avatar !== undefined) merged.avatar = changes.avatar;
        updated = { ...merged };
        return merged;
      });
      if (!updated) return { error: "Usuário não encontrado." };
      Store.saveUsers(users);
      Store.setSession({ id: updated.id, name: updated.fullName, email: updated.email, nickname: updated.nickname, phone: updated.phone, avatar: updated.avatar, realNameLocked: updated.realNameLocked, since: updated.since, coupons: updated.coupons || [], notifications: updated.notifications || [] });
      return { success: true, user: updated };
    },
    sendVerifyCode: async function (email, name) {
      const target = String(email || "").trim().toLowerCase();
      if (!target) return { error: "Informe um e-mail válido." };
      if (Store.getUsers().some(u => String(u.email).toLowerCase() === target)) {
        return { error: "Este e-mail já está cadastrado." };
      }
      const code = String(Math.floor(100000 + Math.random() * 900000));
      pendingVerify = { email: target, code, expiresAt: Date.now() + 5 * 60 * 1000 };
      const cfg = Store.getEmail();
      if (cfg && cfg.serviceId && cfg.templateId && cfg.publicKey && typeof emailjs !== "undefined") {
        try {
          await emailjs.send(cfg.serviceId, cfg.templateId, {
            to_name: name || String(target).split("@")[0],
            to_email: target,
            code,
            store_name: "T&E Variedades"
          }, { publicKey: cfg.publicKey });
          return { success: true, sent: true };
        } catch (e) {
          return { success: true, sent: false, code };
        }
      }
      return { success: true, sent: false, code };
    },
    verifyCode: function (email, code) {
      const target = String(email || "").trim().toLowerCase();
      if (!pendingVerify || pendingVerify.email !== target) return false;
      if (Date.now() > pendingVerify.expiresAt) return false;
      return pendingVerify.code === String(code || "").trim();
    },
    emailReady: function () {
      const cfg = Store.getEmail();
      return !!(cfg && cfg.serviceId && cfg.templateId && cfg.publicKey && typeof emailjs !== "undefined");
    },
    logout: function () {
      Store.clearSession();
    },
    notify: function (email, type, text) {
      let users = Store.getUsers();
      let changed = false;
      users = users.map(u => {
        if (u.email !== email) return u;
        changed = true;
        u.notifications = u.notifications || [];
        u.notifications.unshift({ id: Date.now() + Math.random(), type, text, date: new Date().toISOString(), read: false });
        if (u.notifications.length > 40) u.notifications = u.notifications.slice(0, 40);
        return u;
      });
      if (changed) Store.saveUsers(users);
      return changed;
    },
    notifyAll: function (type, text) {
      let users = Store.getUsers();
      users = users.map(u => {
        u.notifications = u.notifications || [];
        u.notifications.unshift({ id: Date.now() + Math.random(), type, text, date: new Date().toISOString(), read: false });
        if (u.notifications.length > 40) u.notifications = u.notifications.slice(0, 40);
        return u;
      });
      Store.saveUsers(users);
      return users.length;
    },
    markAllRead: function (id) {
      let users = Store.getUsers();
      let updated = null;
      users = users.map(u => {
        if (u.id !== id) return u;
        u.notifications = (u.notifications || []).map(n => ({ ...n, read: true }));
        updated = u;
        return u;
      });
      if (updated) { Store.saveUsers(users); return updated; }
      return null;
    }
  };
  window.Auth = Auth;
})();