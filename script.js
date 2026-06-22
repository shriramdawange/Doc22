(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.classList.toggle('is-active', isOpen);

      // Inline fallback styling for the open state, since the base
      // stylesheet hides nav-links below the desktop breakpoint.
      if (isOpen) {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = 'rgba(10,31,51,0.98)';
        navLinks.style.padding = '20px 24px 28px';
        navLinks.style.gap = '18px';
        navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
      } else {
        navLinks.removeAttribute('style');
      }
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.removeAttribute('style');
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Signature interaction: diagnostic magnifier ---------- */
  const magnifier = document.getElementById('magnifier');
  const lens = document.getElementById('magnifier-lens');
  const hint = document.getElementById('scope-hint');

  if (magnifier && lens) {
    const ZOOM = 2.6;
    const LENS_SIZE = 160;
    let rect = null;
    let imgSrc = magnifier.dataset.image;

    const refreshRect = () => { rect = magnifier.getBoundingClientRect(); };
    refreshRect();
    window.addEventListener('resize', refreshRect);

    lens.style.width = LENS_SIZE + 'px';
    lens.style.height = LENS_SIZE + 'px';
    lens.style.backgroundImage = `url("${imgSrc}")`;

    const positionLens = (clientX, clientY) => {
      if (!rect) refreshRect();
      let x = clientX - rect.left;
      let y = clientY - rect.top;

      // Clamp within bounds so the lens never travels outside the frame
      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));

      const bgSizeW = rect.width * ZOOM;
      const bgSizeH = rect.height * ZOOM;

      lens.style.backgroundSize = `${bgSizeW}px ${bgSizeH}px`;
      lens.style.backgroundPosition =
        `${-(x * ZOOM - LENS_SIZE / 2)}px ${-(y * ZOOM - LENS_SIZE / 2)}px`;
      lens.style.transform = `translate(${x - LENS_SIZE / 2}px, ${y - LENS_SIZE / 2}px)`;

      magnifier.classList.add('is-active');
      if (hint) hint.style.opacity = '0';
    };

    const handleImageError = () => {
      imgSrc = magnifier.dataset.fallback;
      lens.style.backgroundImage = `url("${imgSrc}")`;
    };
    const baseImg = magnifier.querySelector('.magnifier-base');
    if (baseImg) baseImg.addEventListener('error', handleImageError);

    // Desktop: mouse
    magnifier.addEventListener('mousemove', (e) => positionLens(e.clientX, e.clientY));
    magnifier.addEventListener('mouseleave', () => magnifier.classList.remove('is-active'));

    // Touch: follow the finger while dragging
    magnifier.addEventListener('touchstart', (e) => {
      refreshRect();
      const t = e.touches[0];
      if (t) positionLens(t.clientX, t.clientY);
    }, { passive: true });

    magnifier.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) positionLens(t.clientX, t.clientY);
    }, { passive: true });

    magnifier.addEventListener('touchend', () => magnifier.classList.remove('is-active'));
  }

  /* ---------- Sticky nav: subtle shrink after scroll ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    let lastState = false;
    const onScroll = () => {
      const scrolled = window.scrollY > 8;
      if (scrolled !== lastState) {
        nav.style.boxShadow = scrolled ? '0 10px 30px -16px rgba(0,0,0,.5)' : 'none';
        lastState = scrolled;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();

