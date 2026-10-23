/* ============================================================
   Theme unit: toggle, persistence, and circular reveal
   ============================================================ */
(function () {
  'use strict';

  var toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

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

  // On load: apply saved preference, or sync current theme to meta.
  var stored = savedTheme();
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
  } else {
    syncThemeColor();
  }

  // Sync if system color scheme changes and no override is stored.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!savedTheme()) {
      syncThemeColor();
    }
  });

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
})();

/* ============================================================
   Avatar unit: decode and fade-in over placeholder
   ============================================================ */
(function () {
  'use strict';

  var avatarImg = document.querySelector('.avatar img');
  if (!avatarImg) return;

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

  // A cached image can finish before this script runs, so its load event
  // is already gone. A missing image is complete with naturalWidth 0; the
  // inline onerror swaps in the placeholder, so leave it alone.
  if (avatarImg.complete && avatarImg.naturalWidth > 0) {
    showAvatar();
  } else if (!avatarImg.complete) {
    avatarImg.addEventListener('load', showAvatar);
  }
})();

/* ============================================================
   Hero unit: entrance, scroll progress, and name handoff
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var hero = document.querySelector('.hero');
  var name = document.querySelector('.hero-name');
  var nameSlot = document.querySelector('.hero-name-slot');
  var nameTarget = document.querySelector('.topbar-name-target');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!hero || !name || !nameSlot || !nameTarget) return;

  function measureHandoff() {
    var slotRect = nameSlot.getBoundingClientRect();
    var targetRect = nameTarget.getBoundingClientRect();
    var width = name.offsetWidth;
    var height = name.offsetHeight;
    var baseSize = parseFloat(getComputedStyle(root).getPropertyValue('--size-name')) || 30;
    var currentSize = parseFloat(getComputedStyle(name).fontSize) || 72;
    var scale = baseSize / currentSize;
    var startX = slotRect.left + (slotRect.width - width) / 2;
    var startY = slotRect.top + window.scrollY + (slotRect.height - height) / 2;
    var endX = targetRect.left;
    var endY = targetRect.top + (targetRect.height - height * scale) / 2;

    name.style.setProperty('--handoff-start-x', startX + 'px');
    name.style.setProperty('--handoff-start-y', startY + 'px');
    name.style.setProperty('--handoff-end-x', endX + 'px');
    name.style.setProperty('--handoff-end-y', endY + 'px');
    name.style.setProperty('--handoff-x', (endX - startX) + 'px');
    name.style.setProperty('--handoff-y', (endY - startY) + 'px');
    name.style.setProperty('--handoff-scale', String(scale));
    name.classList.add('handoff-ready');
  }

  function progressForScroll() {
    var distance = Math.max(1, hero.offsetHeight);
    return Math.max(0, Math.min(1, window.scrollY / distance));
  }

  function updateProgress() {
    var progress = progressForScroll();
    root.style.setProperty('--p', progress.toFixed(4));
    if (prefersReducedMotion.matches) {
      name.classList.toggle('is-handed-off', progress >= 0.5);
    }
  }

  var frame = 0;
  var scrollIdleTimer = 0;

  window.addEventListener('scroll', function () {
    if (!frame) {
      frame = window.requestAnimationFrame(function () {
        frame = 0;
        updateProgress();
      });
    }

    root.classList.add('is-scrolling');
    window.clearTimeout(scrollIdleTimer);
    scrollIdleTimer = window.setTimeout(function () {
      root.classList.remove('is-scrolling');
    }, 120);
  }, { passive: true });

  window.addEventListener('resize', function () {
    measureHandoff();
    updateProgress();
  }, { passive: true });

  measureHandoff();
  updateProgress();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measureHandoff);
    if (document.fonts.addEventListener) {
      document.fonts.addEventListener('loadingdone', measureHandoff);
    }
  }

  if (!prefersReducedMotion.matches) {
    [name, document.querySelector('.hero-title'), document.querySelector('.hero-quote'), document.querySelector('.hero-education')]
      .filter(Boolean)
      .forEach(function (element) {
        element.classList.add('is-entering');
        element.addEventListener('animationend', function () {
          element.classList.remove('is-entering');
        }, { once: true });
      });
  }
})();

/* ============================================================
   Nav unit: active nav item follows section entry
   ============================================================ */
(function () {
  'use strict';

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.section:not([hidden])'));

  function setActiveNav(id) {
    navLinks.forEach(function (link) {
      if (link.getAttribute('data-section') === id) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateActiveNav() {
    var line = window.innerHeight * 0.3;
    var active = sections[0];
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= line) active = section;
    });
    if (active) setActiveNav(active.id);
  }

  if (sections.length) setActiveNav(sections[0].id);

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(updateActiveNav, {
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0
    });
    sections.forEach(function (section) { navObserver.observe(section); });
  }
})();
