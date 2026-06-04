/* ============================================================
   Tools and Methods — section behavior
   Self-contained. Replicates the dxn.is theme + nav chrome (same
   localStorage key, so a visitor's choice carries across the site)
   and runs the accordion. The method pages are read-only; the
   take-away is the printout, so there is no in-page tool logic.

   Every lookup is guarded, so any page that lacks an element here
   runs the same file without errors.
   ============================================================ */
(function () {
  "use strict";

  /* ---- Section identity (SINGLE SOURCE of name + tagline) ----
     PROVISIONAL working name. Brent may rename. Change these two
     strings and every page updates (header, hero, tab title). */
  var TM = {
    name: "Tools and Methods",
    tagline: "Practical AI-strategy methods for credit union and community bank leaders."
  };

  function fill(attr, value) {
    document.querySelectorAll("[" + attr + "]").forEach(function (el) { el.textContent = value; });
  }
  fill("data-tm-name", TM.name);
  fill("data-tm-tagline", TM.tagline);
  var titleTpl = document.documentElement.getAttribute("data-tm-title");
  if (titleTpl) document.title = titleTpl.replace("{name}", TM.name);

  /* ---- Theme toggle (mirrors js/main.js, shared storage key) -- */
  (function () {
    var btn = document.querySelector(".theme-toggle");
    var sun = document.querySelector(".theme-icon-sun");
    var moon = document.querySelector(".theme-icon-moon");
    var html = document.documentElement;

    function paintIcons(theme) {
      if (sun) sun.style.display = theme === "dark" ? "block" : "none";
      if (moon) moon.style.display = theme === "dark" ? "none" : "block";
    }
    function setTheme(theme) {
      html.setAttribute("data-theme", theme);
      try { localStorage.setItem("theme-preference", theme); } catch (e) {}
      paintIcons(theme);
    }
    // The inline head script already set data-theme; sync the icons.
    paintIcons(html.getAttribute("data-theme") || "dark");
    if (btn) {
      btn.addEventListener("click", function () {
        var cur = html.getAttribute("data-theme") || "dark";
        setTheme(cur === "dark" ? "light" : "dark");
      });
    }
  })();

  /* ---- Mobile nav toggle (mirrors js/main.js) ---------------- */
  (function () {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  })();

  /* ---- Sticky header "scrolled" state ----------------------- */
  (function () {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 20); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  })();

  /* ---- Accordion (levels) — CSS grid-rows handles the motion - */
  document.querySelectorAll(".tm-level-head").forEach(function (head) {
    head.addEventListener("click", function () {
      var level = head.closest(".tm-level");
      if (!level) return;
      var open = level.classList.toggle("open");
      head.setAttribute("aria-expanded", String(open));
    });
  });
})();
