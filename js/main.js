/* Dr. Ramsha Ramzan — site interactions */
(function () {
  "use strict";

  // Sticky header shadow
  var header = document.getElementById("site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Mobile menu
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("main-nav");
  function setMenu(open) {
    if (!toggle || !nav) return;
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setMenu(!document.body.classList.contains("menu-open"));
    });
    document.addEventListener("click", function (e) {
      if (document.body.classList.contains("menu-open") && !nav.contains(e.target) && e.target !== toggle) {
        setMenu(false);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  // Reveal on scroll (respect reduced motion)
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && reveals.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  // Chat widget toggle
  (function () {
    var fab = document.getElementById("chat-fab");
    var panel = document.getElementById("chat-panel");
    var closeBtn = document.getElementById("chat-close");
    if (!fab || !panel) return;
    function setOpen(open) {
      fab.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
    }
    fab.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(panel.hidden);
    });
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        setOpen(false);
      });
    }
    document.addEventListener("click", function (e) {
      if (!panel.hidden && !panel.contains(e.target) && e.target !== fab && !fab.contains(e.target)) {
        setOpen(false);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) setOpen(false);
    });
  })();
})();
