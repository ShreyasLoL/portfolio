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
  var underline = tablist.querySelector('.work-tab-underline');

  function panelFor(tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  }

  function moveUnderline(tab, instant) {
    if (!tab || !underline) return;
    if (instant) {
      tablist.classList.remove('is-ready');
    }
    underline.style.setProperty('--tab-x', tab.offsetLeft + 'px');
    underline.style.setProperty('--tab-scale', String(tab.offsetWidth));
    if (instant) {
      void underline.offsetWidth;
      tablist.classList.add('is-ready');
    }
  }

  function syncPanelState(panel, selected) {
    panel.classList.toggle('is-current', selected);
    panel.setAttribute('aria-hidden', String(!selected));
    panel.tabIndex = selected ? 0 : -1;
  }

  function setTab(tab, moveFocus) {
    if (!tab || tab === activeTab) {
      if (moveFocus && tab) tab.focus();
      return;
    }

    var oldTab = activeTab;
    var oldPanel = panelFor(oldTab);
    var nextPanel = panelFor(tab);
    var dir = tabs.indexOf(tab) > tabs.indexOf(oldTab) ? 1 : -1;
    activeTab = tab;

    tabs.forEach(function (item) {
      var selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    if (oldPanel) {
      oldPanel.style.setProperty('--panel-x', String(-dir));
      syncPanelState(oldPanel, false);
    }
    if (nextPanel) {
      if (parseFloat(getComputedStyle(nextPanel).opacity) <= 0.05) {
        nextPanel.classList.add('is-staging');
        nextPanel.style.setProperty('--panel-x', String(dir));
        void nextPanel.offsetWidth;
        nextPanel.classList.remove('is-staging');
      }
      syncPanelState(nextPanel, true);
    }

    moveUnderline(tab, false);
    if (moveFocus) tab.focus();
  }

  panels.classList.add('is-enhanced');
  panels.querySelectorAll('.work-panel').forEach(function (panel) {
    var selected = panel.id === activeTab.getAttribute('aria-controls');
    panel.hidden = false;
    syncPanelState(panel, selected);
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

  window.addEventListener('resize', function () { moveUnderline(activeTab, true); }, { passive: true });
  moveUnderline(activeTab, true);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { moveUnderline(activeTab, true); });
  }

  panels.querySelectorAll('.work-link[data-url]').forEach(function (link) {
    var url = link.getAttribute('data-url').trim();
    if (!url) return;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.hidden = false;
  });

  document.querySelectorAll('.minor-row').forEach(function (row) {
    var url = (row.getAttribute('data-url') || row.getAttribute('href') || '').trim();
    if (!url) return;
    var anchor = row.tagName === 'A' ? row : document.createElement('a');
    if (anchor !== row) {
      anchor.className = row.className;
      anchor.setAttribute('data-url', url);
      while (row.firstChild) anchor.appendChild(row.firstChild);
      row.parentNode.replaceChild(anchor, row);
    }
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.classList.add('is-linked');
    if (!anchor.querySelector('.minor-arrow')) {
      var arrow = document.createElement('span');
      arrow.className = 'minor-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '\u2197';
      var meta = anchor.querySelector('.minor-meta');
      if (meta) meta.appendChild(arrow);
      else anchor.appendChild(arrow);
    }
  });
})();

/* ============================================================
   Reveal unit: scroll-reveal via IntersectionObserver
   ============================================================ */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  function revealTarget(target) {
    if (target.hasAttribute('data-reveal-group')) {
      target.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('visible');
      });
    } else {
      target.classList.add('visible');
    }
  }

  if (!prefersReducedMotion.matches && 'IntersectionObserver' in window) {
    var targets = [];
    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      targets.push(group);
    });
    elements.forEach(function (el) {
      if (!el.closest('[data-reveal-group]')) targets.push(el);
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            revealTarget(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    targets.forEach(function (target) {
      observer.observe(target);
    });
  } else {
    elements.forEach(function (el) {
      el.classList.add('visible');
    });
  }
})();

/* Enable :active press states on iOS Safari without blocking scroll. */
document.addEventListener('touchstart', function () {}, { passive: true });

/* Heatmap integration point; repo highlighting is intentionally unimplemented. */
window.highlightRepo = function highlightRepo(repo) {
  void repo;
};

/* ============================================================
   Hero unit: entrance and snap-distance progress
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var hero = document.querySelector('.hero');
  var name = document.querySelector('.hero-name');
  var topbar = document.querySelector('.topbar');
  var work = document.querySelector('#work');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!hero || !name || !topbar || !work) return;

  var workTargets = [
    document.getElementById('work-heading'),
    work.querySelector('.work-tablist'),
    work.querySelector('.work-panels')
  ].filter(Boolean);

  var snapDistance = 1;
  var targetP = 0;
  var currentP = 0;
  var frame = 0;
  var lastFrameTime = 0;
  var scrollIdleTimer = 0;
  var lastWrittenP = null;
  var lastWrittenW = null;

  function writeProgress(value) {
    var progress = Math.max(0, Math.min(1, value));
    var pStr = progress.toFixed(4);
    if (pStr !== lastWrittenP) {
      lastWrittenP = pStr;
      hero.style.setProperty('--p', pStr);
      topbar.style.setProperty('--p', pStr);
      root.classList.toggle('is-past-hero', progress >= (prefersReducedMotion.matches ? 0.5 : 0.6));
    }
    var workReveal = Math.max(0, Math.min(1, (progress - 0.4) / 0.6));
    var wStr = workReveal.toFixed(4);
    if (wStr !== lastWrittenW) {
      lastWrittenW = wStr;
      workTargets.forEach(function (el) {
        el.style.setProperty('--w', wStr);
      });
    }
  }

  function animateProgress(now) {
    var dt = lastFrameTime ? Math.min(now - lastFrameTime, 100) : 16.6667;
    lastFrameTime = now;
    var factor = 1 - Math.pow(1 - 0.14, dt / 16.6667);
    currentP += (targetP - currentP) * factor;
    if (Math.abs(targetP - currentP) <= 0.001) {
      currentP = targetP;
      frame = 0;
      lastFrameTime = 0;
      writeProgress(currentP);
      if (currentP >= 1) hero.classList.remove('is-scrolling');
      return;
    }
    writeProgress(currentP);
    frame = window.requestAnimationFrame(animateProgress);
  }

  function measureSnapDistance() {
    var topbarHeight = parseFloat(getComputedStyle(root).getPropertyValue('--height-topbar')) || 0;
    snapDistance = Math.max(1, work.offsetTop - topbarHeight);
  }

  function updateTarget() {
    targetP = Math.max(0, Math.min(1, window.scrollY / snapDistance));
    if (prefersReducedMotion.matches) {
      currentP = targetP;
      writeProgress(currentP);
    } else if (Math.abs(targetP - currentP) > 0.001 && !frame) {
      lastFrameTime = 0;
      frame = window.requestAnimationFrame(animateProgress);
    } else if (Math.abs(targetP - currentP) <= 0.001) {
      currentP = targetP;
      writeProgress(currentP);
    }
  }

  function remeasureAndSync() {
    measureSnapDistance();
    updateTarget();
  }

  window.addEventListener('scroll', function () {
    updateTarget();
    if (!prefersReducedMotion.matches && (currentP < 1 || targetP < 1)) {
      hero.classList.add('is-scrolling');
      window.clearTimeout(scrollIdleTimer);
      scrollIdleTimer = window.setTimeout(function () { hero.classList.remove('is-scrolling'); }, 120);
    }
  }, { passive: true });
  window.addEventListener('resize', remeasureAndSync, { passive: true });
  remeasureAndSync();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(remeasureAndSync);
    if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', remeasureAndSync);
  }

  if (!prefersReducedMotion.matches && window.scrollY === 0) {
    [name, document.querySelector('.hero-title'), document.querySelector('.hero-quote')].filter(Boolean).forEach(function (element) {
      element.classList.add('is-entering');
      element.addEventListener('animationend', function () { element.classList.remove('is-entering'); }, { once: true });
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
