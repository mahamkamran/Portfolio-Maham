function toggleMenu(forceClose = false) {
  const menu = document.getElementById("menuLinks");
  const btn = document.getElementById("hamburgerBtn");
  if (!menu || !btn) return;

  if (forceClose) menu.classList.remove("open");
  else menu.classList.toggle("open");

  const isOpen = menu.classList.contains("open");
  btn.setAttribute("aria-expanded", String(isOpen));
}

/* Hook button */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("hamburgerBtn");
  const menu = document.getElementById("menuLinks");

  if (btn) btn.addEventListener("click", () => toggleMenu());

  /* Close when clicking a link */
  if (menu) {
    menu.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => toggleMenu(true));
    });
  }

  /* Close when clicking outside */
  document.addEventListener("click", (e) => {
    if (!menu || !btn) return;
    const clickedInside = menu.contains(e.target) || btn.contains(e.target);
    if (!clickedInside) toggleMenu(true);
  });

  /* Close on ESC */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggleMenu(true);
  });

  /* ===================== LIGHT MODE ONLY ===================== */
  document.body.classList.remove("dark-mode");
  try { localStorage.removeItem("preferredTheme"); } catch (e) {}
});


/* ===================== PRINT / PDF: force lazy images to load ===================== */
(function () {
  function eagerLoadImages() {
    document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
      img.loading = "eager";
      if (img.decode) { try { img.decode().catch(function () {}); } catch (e) {} }
    });
  }
  // Fired by the browser right before the print/Save-as-PDF dialog renders.
  window.addEventListener("beforeprint", eagerLoadImages);
  // Safari/Firefox path via matchMedia.
  if (window.matchMedia) {
    var mql = window.matchMedia("print");
    if (mql.addEventListener) {
      mql.addEventListener("change", function (e) { if (e.matches) eagerLoadImages(); });
    }
  }
})();
