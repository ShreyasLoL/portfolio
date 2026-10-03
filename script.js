(function () {
  'use strict';

  /* ==========================================================
     Theme toggle
     ========================================================== */

  var toggle = document.querySelector('.theme-toggle');
  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

  /** Get the currently effective theme. */
  function effectiveTheme() {
    var explicit = root.getAttribute('data-theme');
    if (explicit === 'dark' || explicit === 'light') return explicit;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /** Apply a theme by name ('light' | 'dark'). */
  function applyTheme(name) {
    root.setAttribute('data-theme', name);
  }

  // On load: apply saved preference, or leave to system default.
  var stored = savedTheme();
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
  }

  toggle.addEventListener('click', function () {
    var current = effectiveTheme();
    var next = current === 'dark' ? 'light' : 'dark';

    // If View Transitions API is available and motion is allowed, use circle-clip.
    if (
      document.startViewTransition &&
      !prefersReducedMotion.matches
    ) {
      // Compute the toggle button center as the animation origin.
      var rect = toggle.getBoundingClientRect();
      var x = rect.left + rect.width / 2;
      var y = rect.top + rect.height / 2;

      // Radius that covers the farthest corner from the origin.
      var endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      // Add direction class so CSS can set z-index ordering.
      if (next === 'dark') {
        root.classList.add('theme-transition-dark');
      }

      var transition = document.startViewTransition(function () {
        applyTheme(next);
        saveTheme(next);
      });

      transition.ready.then(function () {
        if (next === 'light') {
          // Light: new layer circles in.
          document.documentElement.animate(
            {
              clipPath: [
                'circle(0px at ' + x + 'px ' + y + 'px)',
                'circle(' + endRadius + 'px at ' + x + 'px ' + y + 'px)'
              ]
            },
            {
              duration: 500,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              pseudoElement: '::view-transition-new(root)'
            }
          );
        } else {
          // Dark: old layer circles out (shrinks away).
          document.documentElement.animate(
            {
              clipPath: [
                'circle(' + endRadius + 'px at ' + x + 'px ' + y + 'px)',
                'circle(0px at ' + x + 'px ' + y + 'px)'
              ]
            },
            {
              duration: 500,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              pseudoElement: '::view-transition-old(root)'
            }
          );
        }
      });

      transition.finished.then(function () {
        root.classList.remove('theme-transition-dark');
      });
    } else {
      // No View Transitions or reduced motion — instant switch.
      applyTheme(next);
      saveTheme(next);
    }
  });

  /* ==========================================================
     Scroll-reveal (IntersectionObserver)
     ========================================================== */

  if (!prefersReducedMotion.matches && 'IntersectionObserver' in window) {
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
  var sections = Array.prototype.slice.call(document.querySelectorAll('.section'));

  /** Set the active nav link by section id. */
  function setActiveNav(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-section') === id);
    });
  }

  // At scroll position 0, first section is active.
  if (sections.length) {
    setActiveNav(sections[0].getAttribute('id'));
  }

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.getAttribute('id'));
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    sections.forEach(function (sec) {
      navObserver.observe(sec);
    });
  }
})();
