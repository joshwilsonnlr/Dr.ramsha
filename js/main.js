// Site-wide behaviour: mobile menu, header shadow, scroll reveal.
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
    navToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();
      const shouldOpen = navToggle.getAttribute('aria-expanded') !== 'true';
      setMenu(shouldOpen);
    });

    mainNav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        setMenu(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setMenu(false);
        navToggle.focus();
      }
    });

    // Close when tapping dark overlay (not the toggle, not the menu)
    document.addEventListener('click', (event) => {
      if (!document.body.classList.contains('menu-open')) return;
      if (mainNav.contains(event.target)) return;
      if (navToggle.contains(event.target)) return;
      setMenu(false);
    });
  }

  if (siteHeader) {
    const updateHeaderState = () => {
      siteHeader.classList.toggle('scrolled', window.scrollY > 8);
    };
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
  }

  const revealItems = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealItems.forEach((item) => observer.observe(item));
})();
