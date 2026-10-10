(function () {
  'use strict';

  /* ==========================================================
     Theme toggle
     ========================================================== */

  var toggle = document.querySelector('.theme-toggle');
  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isSwitching = false;

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

  var themeColorMetas = document.querySelectorAll('meta[name="theme-color"]');

  /** Point the browser chrome at the active --color-bg (single source: CSS). */
  function syncThemeColor() {
    var bg = getComputedStyle(root).getPropertyValue('--color-bg').trim();
    if (!bg) return;
    themeColorMetas.forEach(function (meta) {
      meta.setAttribute('content', bg);
    });
  }

  /** Apply a theme by name ('light' | 'dark'). */
  function applyTheme(name) {
    root.setAttribute('data-theme', name);
    // Same tick as the attribute, so inside the View Transition callback the
    // browser chrome switches with the page.
    syncThemeColor();
  }

  // On load: apply saved preference, or leave to system default.
  var stored = savedTheme();
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
  }

  toggle.addEventListener('click', function () {
    // Ignore clicks while a switch is running: a second startViewTransition
    // would skip the current one (instant jump) and race its cleanup.
    if (isSwitching) return;

    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';

    // No View Transitions or reduced motion — instant switch.
    if (!document.startViewTransition || prefersReducedMotion.matches) {
      applyTheme(next);
      saveTheme(next);
      return;
    }

    isSwitching = true;
    var toDark = next === 'dark';

    // Toggle button center is the origin light spreads from / is pulled into.
    var rect = toggle.getBoundingClientRect();
    var x = rect.left + rect.width / 2;
    var y = rect.top + rect.height / 2;
    var radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    var atButton = 'circle(0px at ' + x + 'px ' + y + 'px)';
    var fullPage = 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)';

    // Both classes must be on <html> before the snapshot is taken so the
    // z-index order is correct from the first frame.
    root.classList.add('theme-switching');
    root.classList.toggle('theme-transition-dark', toDark);

    var transition = document.startViewTransition(function () {
      applyTheme(next);
      saveTheme(next);
    });

    var reveal = null;

    transition.ready
      .then(function () {
        // To light: new layer spreads outward from the button like rays.
        // To dark: old (light) layer on top is pulled back into the button.
        // fill: 'forwards' holds the end frame until the pseudo tree is torn down.
        reveal = root.animate(
          { clipPath: toDark ? [fullPage, atButton] : [atButton, fullPage] },
          {
            duration: 600,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'forwards',
            pseudoElement: toDark
              ? '::view-transition-old(root)'
              : '::view-transition-new(root)'
          }
        );
      })
      .catch(function () {});

    function cleanup() {
      // Cancel the animation on cleanup so fill: forwards does not leak
      // onto pseudo-elements of subsequent transitions.
      if (reveal) {
        reveal.cancel();
      }
      root.classList.remove('theme-switching', 'theme-transition-dark');
      isSwitching = false;
    }

    transition.finished.then(cleanup, cleanup);
  });

  /* ==========================================================
     Avatar fade-in
     ========================================================== */

  var avatarImg = document.querySelector('.avatar img');

  /** Fade the photo in over its placeholder once it can paint in one go. */
  function showAvatar() {
    function reveal() {
      avatarImg.classList.add('loaded');
    }
    // decode() waits for the pixels, so the fade never starts on a blank image.
    if (avatarImg.decode) {
      avatarImg.decode().then(reveal, reveal);
    } else {
      reveal();
    }
  }

  if (avatarImg) {
    // A cached image can finish before this script runs, so its load event
    // is already gone. A missing image is complete with naturalWidth 0; the
    // inline onerror swaps in the placeholder, so leave it alone.
    if (avatarImg.complete && avatarImg.naturalWidth > 0) {
      showAvatar();
    } else if (!avatarImg.complete) {
      avatarImg.addEventListener('load', showAvatar);
    }
  }

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
  var sections = Array.prototype.slice.call(document.querySelectorAll('.section:not([hidden])'));

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
