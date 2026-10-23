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
   Work unit: progressively enhanced tabs and optional links
   ============================================================ */
(function () {
  'use strict';

  var tablist = document.querySelector('.work-tablist');
  var panels = document.querySelector('.work-panels');
  if (!tablist || !panels) return;

  var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  var activeTab = tabs.filter(function (tab) {
    return tab.getAttribute('aria-selected') === 'true';
  })[0] || tabs[0];
  var hideTimers = Object.create(null);
  var underline = tablist.querySelector('.work-tab-underline');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function panelFor(tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  }

  function moveUnderline(tab) {
    if (!tab || !underline) return;
    underline.style.setProperty('--tab-x', tab.offsetLeft + 'px');
    underline.style.setProperty('--tab-scale', String(tab.offsetWidth));
  }

  function setTab(tab, moveFocus) {
    if (!tab || tab === activeTab) {
      if (moveFocus && tab) tab.focus();
      return;
    }

    var oldTab = activeTab;
    var oldPanel = panelFor(oldTab);
    var nextPanel = panelFor(tab);
    activeTab = tab;

    tabs.forEach(function (item) {
      var selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    if (oldPanel) {
      oldPanel.classList.remove('is-current');
      window.clearTimeout(hideTimers[oldPanel.id]);
      if (prefersReducedMotion.matches) {
        oldPanel.hidden = true;
      } else {
        hideTimers[oldPanel.id] = window.setTimeout(function () {
          if (panelFor(activeTab) !== oldPanel) oldPanel.hidden = true;
        }, 200);
      }
    }

    if (nextPanel) {
      window.clearTimeout(hideTimers[nextPanel.id]);
      nextPanel.hidden = false;
      nextPanel.classList.remove('is-current');
      var showPanel = function () {
        nextPanel.classList.add('is-current');
      };
      if (prefersReducedMotion.matches) showPanel();
      else window.requestAnimationFrame(showPanel);
    }

    moveUnderline(tab);
    if (moveFocus) tab.focus();
  }

  panels.classList.add('is-enhanced');
  panels.querySelectorAll('.work-panel').forEach(function (panel) {
    var selected = panel.id === activeTab.getAttribute('aria-controls');
    panel.hidden = !selected;
    panel.classList.toggle('is-current', selected);
  });

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { setTab(tab, false); });
  });

  tablist.addEventListener('keydown', function (event) {
    var index = tabs.indexOf(document.activeElement);
    if (index < 0) return;

    var next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;

    event.preventDefault();
    setTab(tabs[next], true);
    tabs[next].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });

  window.addEventListener('resize', function () { moveUnderline(activeTab); }, { passive: true });
  moveUnderline(activeTab);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { moveUnderline(activeTab); });
  }

  panels.querySelectorAll('.work-link[data-url]').forEach(function (link) {
    var url = link.getAttribute('data-url').trim();
    if (!url) return;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.hidden = false;
  });
})();

/* Heatmap integration point; repo highlighting is intentionally unimplemented. */
window.highlightRepo = function highlightRepo(repo) {
  void repo;
};

/* ============================================================
   Hero unit: entrance, scroll progress, and name handoff
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var hero = document.querySelector('.hero');
  var name = document.querySelector('.hero-name');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!hero || !name) return;

  function updateProgress() {
    var progress = Math.max(0, Math.min(1, window.scrollY / Math.max(1, hero.offsetHeight)));
    root.style.setProperty('--p', progress.toFixed(4));
  }

  var frame = 0;
  var scrollIdleTimer = 0;
  window.addEventListener('scroll', function () {
    if (!frame) frame = window.requestAnimationFrame(function () { frame = 0; updateProgress(); });
    root.classList.add('is-scrolling');
    window.clearTimeout(scrollIdleTimer);
    scrollIdleTimer = window.setTimeout(function () { root.classList.remove('is-scrolling'); }, 120);
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  if (!prefersReducedMotion.matches) {
    [name, document.querySelector('.hero-title'), document.querySelector('.hero-quote')].filter(Boolean).forEach(function (element) {
      element.classList.add('is-entering');
      element.addEventListener('animationend', function () { element.classList.remove('is-entering'); }, { once: true });
    });
  }

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
