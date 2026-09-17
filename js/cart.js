(function () {
  const LS = Store.LS;

  function getCart() {
    return Store.read(LS.cart, []);
  }
  function saveCart(cart) { Store.write(LS.cart, cart); }

  function calcShipping(subtotal) {
    const ship = Store.getShip();
    const pct = ship && ship.active !== false ? (Number(ship.percent) || 8) : 0;
    const value = subtotal * pct / 100;
    return { pct, value, method: ship?.text || "Envio via Frete Fácil" };
  }

  const Cart = {
    getItems: getCart,
    add: function (product) {
      const cart = getCart();
      const existing = cart.find(i => i.id === product.id);
      if (existing) existing.qty += 1;
      else cart.push({ ...product, qty: 1 });
      saveCart(cart);
      return cart;
    },
    remove: function (id) {
      saveCart(getCart().filter(i => i.id !== id));
      return getCart();
    },
    updateQty: function (id, qty) {
      const cart = getCart();
      const item = cart.find(i => i.id === id);
      if (item) { item.qty = Math.max(1, qty); saveCart(cart); }
      return cart;
    },
    clear: function () { saveCart([]); },
    count: function () { return getCart().reduce((s, i) => s + i.qty, 0); },
    subtotal: function () { return getCart().reduce((s, i) => s + i.price * i.qty, 0); },
    total: function () {
      return getCart().reduce((s, i) => s + i.price * i.qty, 0) + calcShipping(Cart.subtotal()).value;
    },
    calcShipping: calcShipping
  };

  window.Cart = Cart;
})();