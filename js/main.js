// Site-wide behaviour: mobile menu, header shadow, scroll reveal.
(function () {
  const htmlRoot = document.documentElement;
  htmlRoot.classList.add('js');

  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  const siteHeader = document.getElementById('site-header');

  if (!navToggle || !mainNav || !siteHeader) {
    return;
  }

  function setMenu(isOpen) {
    mainNav.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  navToggle.addEventListener('click', () => {
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

  const updateHeaderState = () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 8);
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

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
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealItems.forEach((item) => observer.observe(item));
})();

