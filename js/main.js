// Site-wide: mobile menu, header shadow, scroll reveal
(function () {
  const htmlRoot = document.documentElement;
  htmlRoot.classList.add('js');

  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  const siteHeader = document.getElementById('site-header');

  function setMenu(isOpen) {
    if (!mainNav || !navToggle) return;
    mainNav.classList.toggle('open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function (event) {
      event.stopPropagation();
      event.preventDefault();
      var shouldOpen = navToggle.getAttribute('aria-expanded') !== 'true';
      setMenu(shouldOpen);
    });

    mainNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setMenu(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        setMenu(false);
        navToggle.focus();
      }
    });

    // Close when tapping outside (dark overlay area)
    document.addEventListener('click', function (event) {
      if (!document.body.classList.contains('menu-open')) return;
      if (mainNav.contains(event.target)) return;
      if (navToggle.contains(event.target)) return;
      setMenu(false);
    });
  }

  if (siteHeader) {
    var updateHeaderState = function () {
      siteHeader.classList.toggle('scrolled', window.scrollY > 8);
    };
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
  }

  // Reveal: make all visible immediately, then optional soft fade
  var revealItems = document.querySelectorAll('.reveal');
  revealItems.forEach(function (item) {
    item.classList.add('in');
  });
})();
