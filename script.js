(function () {
  'use strict';

  /* ==========================================================
     Theme toggle
     ========================================================== */

  var toggle = document.querySelector('.theme-toggle');
  var root = document.documentElement;

  /** Read saved theme, falling back to null (system default). */
  function savedTheme() {
    try {
      return localStorage.getItem('theme');
    } catch (e) {
      return null;
    }
  }

  /** Persist theme choice. */
  function saveTheme(name) {
    try {
      localStorage.setItem('theme', name);
    } catch (e) {
      // Storage unavailable — silently ignore.
    }
  }

  /** Apply a theme by name ('light' | 'dark'). */
  function applyTheme(name) {
    root.setAttribute('data-theme', name);
    toggle.textContent = name === 'dark' ? 'light mode' : 'dark mode';
  }

  // On load: apply saved preference, or leave to system default.
  var stored = savedTheme();
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
  } else {
    // Detect system preference for toggle label.
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    toggle.textContent = prefersDark ? 'light mode' : 'dark mode';
  }

  toggle.addEventListener('click', function () {
    var current = root.getAttribute('data-theme');
    if (!current) {
      // First click: detect current effective theme from system.
      current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  });

  /* ==========================================================
     Scroll-reveal (IntersectionObserver)
     ========================================================== */

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // No animation — show everything immediately.
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ==========================================================
     Active nav item follows scroll position
     ========================================================== */

  var navLinks = document.querySelectorAll('.nav-link');
  var sections = document.querySelectorAll('.section');

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              link.classList.toggle('active', link.getAttribute('data-section') === id);
            });
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    sections.forEach(function (sec) {
      navObserver.observe(sec);
    });
  }
})();
