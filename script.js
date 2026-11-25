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


/* ===================== RESEARCH LIGHTBOX ===================== */
(function () {
  var targets = Array.prototype.slice.call(
    document.querySelectorAll(".research-media img, .research-media video")
  );
  if (!targets.length) return;

  var overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Enlarged media");
  overlay.hidden = true;

  var closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "lightbox__close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.innerHTML = "&times;";

  var stage = document.createElement("div");
  stage.className = "lightbox__stage";

  overlay.appendChild(closeBtn);
  overlay.appendChild(stage);
  document.body.appendChild(overlay);

  var openSource = null;   // the inline element that opened the lightbox
  var resumeSource = false; // whether to resume an inline video on close

  function open(source) {
    var media;
    if (source.tagName === "VIDEO") {
      media = document.createElement("video");
      media.src = source.currentSrc || source.src;
      media.autoplay = true;
      media.loop = true;
      media.controls = true;
      media.playsInline = true;
      media.muted = true; // reliable autoplay on mobile; users can unmute via controls
      media.currentTime = source.currentTime || 0;
      resumeSource = !source.paused;
      source.pause(); // avoid decoding the same 4K video twice
    } else {
      media = document.createElement("img");
      media.src = source.currentSrc || source.src;
      media.alt = source.alt || "";
    }
    media.className = "lightbox__media";
    stage.innerHTML = "";
    stage.appendChild(media);

    openSource = source;
    overlay.hidden = false;
    document.body.classList.add("lightbox-open");
    closeBtn.focus();
    if (media.tagName === "VIDEO") {
      var p = media.play();
      if (p && p.catch) p.catch(function () {});
    }
  }

  function close() {
    if (overlay.hidden) return;
    var v = stage.querySelector("video");
    if (v) v.pause();
    stage.innerHTML = "";
    overlay.hidden = true;
    document.body.classList.remove("lightbox-open");
    if (openSource) {
      if (openSource.tagName === "VIDEO" && resumeSource) {
        var p = openSource.play();
        if (p && p.catch) p.catch(function () {});
      }
      openSource.focus();
    }
    openSource = null;
    resumeSource = false;
  }

  targets.forEach(function (el) {
    el.classList.add("lightbox-trigger");
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    if (!el.getAttribute("aria-label")) {
      el.setAttribute("aria-label", (el.alt || "Research media") + " (click to enlarge)");
    }
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(el); }
    });
  });

  // Whole research card is clickable. Links and buttons (e.g. Journal Publication)
  // keep their own behaviour, and dragging to select text does not open the lightbox.
  Array.prototype.slice.call(document.querySelectorAll(".research-box")).forEach(function (card) {
    var media = card.querySelector(".research-media img, .research-media video");
    if (!media) return;
    card.classList.add("lightbox-card");
    card.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) return;
      var sel = window.getSelection && window.getSelection();
      if (sel && String(sel).length) return;
      open(media);
    });
  });

  closeBtn.addEventListener("click", close);

  // Click on the dimmed background (not on the media itself) closes the view
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay || e.target === stage) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
})();
