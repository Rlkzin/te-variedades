(function () {
  function block(e) {
    e.preventDefault();
  }

  document.addEventListener("contextmenu", block);
  document.addEventListener("copy", function (e) {
    if (e.target && e.target.isContentEditable) return;
  });

  window.addEventListener("keydown", function (e) {
    const k = (e.key || "").toUpperCase();
    const blocked =
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (k === "I" || k === "J" || k === "C")) ||
      (e.ctrlKey && k === "U") ||
      (e.ctrlKey && e.shiftKey && k === "U");
    if (blocked) {
      e.preventDefault();
      return false;
    }
  }, true);

  setInterval(function () {
    const w = window.outerWidth - window.innerWidth;
    const h = window.outerHeight - window.innerHeight;
    if (w > 200 || h > 200) {
      document.body.style.outline = "5px solid #e74c3c";
    }
  }, 1000);
})();