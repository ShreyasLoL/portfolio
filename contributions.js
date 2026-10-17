/* ============================================================
   Contribution grid unit (section 01)
   ============================================================

   Data contract (GitHub GraphQL contributionCalendar shape):
     {
       totalContributions: number,
       weeks: [ { contributionDays: [ { date: "YYYY-MM-DD",
                                        contributionCount: number,
                                        weekday: 0-6 } ] } ]
     }
   Any other fields (e.g. "mock") are ignored. Swapping mock data for real
   data is a file replacement; only loadCalendar() knows where it lives. */
(function () {
  'use strict';

  var root = document.querySelector('.contrib');
  if (!root) return;

  var grid = root.querySelector('.contrib-grid');
  var scroller = root.querySelector('.contrib-scroll');
  var monthsContainer = root.querySelector('.contrib-months');
  var tooltip = root.querySelector('.contrib-tooltip');
  var totalEl = root.querySelector('.contrib-total');
  var live = root.querySelector('.contrib-live');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var TOOLTIP_GAP = 6;

  /* ---- Data layer ---- */

  /** Resolve to a calendar object in the documented shape. */
  function loadCalendar() {
    return fetch(root.getAttribute('data-src'), { cache: 'no-cache' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  /* ---- Helpers ---- */

  /** "1 contribution" / "12 contributions" */
  function countLabel(n) {
    return n.toLocaleString('en-US') + (n === 1 ? ' contribution' : ' contributions');
  }

  /** "2026-10-07" -> "Oct 07, 2026" (string-based, so no timezone drift). */
  function formatDate(iso) {
    var p = iso.split('-');
    return MONTHS[Number(p[1]) - 1] + ' ' + p[2] + ', ' + p[0];
  }

  /** Quartile thresholds of the non-zero counts. */
  function thresholds(days) {
    var nz = days
      .map(function (d) { return d.count; })
      .filter(function (c) { return c > 0; })
      .sort(function (a, b) { return a - b; });
    if (!nz.length) return [Infinity, Infinity, Infinity];
    function q(p) { return nz[Math.floor(p * (nz.length - 1))]; }
    return [q(0.25), q(0.5), q(0.75)];
  }

  function levelFor(count, t) {
    if (count <= 0) return 0;
    if (count <= t[0]) return 1;
    if (count <= t[1]) return 2;
    if (count <= t[2]) return 3;
    return 4;
  }

  /* ---- Rendering ---- */

  var days = [];     // flat list in date order
  var byPos = {};    // "col:weekday" -> index into days

  function render(cal) {
    if (!cal || !Array.isArray(cal.weeks) || !cal.weeks.length) {
      throw new Error('Unexpected calendar shape');
    }

    cal.weeks.forEach(function (week, col) {
      (week.contributionDays || []).forEach(function (day) {
        var weekday = Number(day.weekday);
        if (!(weekday >= 0 && weekday <= 6)) {
          weekday = new Date(day.date + 'T00:00:00Z').getUTCDay();
        }
        byPos[col + ':' + weekday] = days.length;
        days.push({
          date: day.date,
          count: Number(day.contributionCount) || 0,
          weekday: weekday,
          col: col,
          el: null
        });
      });
    });

    if (!days.length) throw new Error('No days');

    var t = thresholds(days);
    var frag = document.createDocumentFragment();

    days.forEach(function (d, i) {
      var el = document.createElement('span');
      el.className = 'contrib-cell';
      el.setAttribute('data-level', levelFor(d.count, t));
      el.setAttribute('data-i', i);
      el.style.gridColumn = d.col + 1;
      el.style.gridRow = d.weekday + 1;
      el.style.setProperty('--col', d.col);
      if (d.count > 0) {
        el.classList.add('is-clickable');
      }
      d.el = el;
      frag.appendChild(el);
    });

    // Today marker: most recent cell gets a 1px outline
    days[days.length - 1].el.classList.add('is-today');

    grid.appendChild(frag);

    // Month labels: position above first week of each month, avoid collisions
    if (monthsContainer) {
      monthsContainer.innerHTML = '';
      var lastCol = -10;
      cal.weeks.forEach(function (week, col) {
        var daysInWeek = week.contributionDays || [];
        if (!daysInWeek.length) return;
        var firstDayOfMonth = null;
        for (var k = 0; k < daysInWeek.length; k++) {
          var dateParts = daysInWeek[k].date.split('-');
          var dayNum = Number(dateParts[2]);
          if (dayNum === 1 || (col === 0 && k === 0)) {
            firstDayOfMonth = daysInWeek[k];
            break;
          }
        }
        if (firstDayOfMonth) {
          if (col - lastCol >= 3 && col <= 50) {
            var mParts = firstDayOfMonth.date.split('-');
            var mName = MONTHS[Number(mParts[1]) - 1];
            var mSpan = document.createElement('span');
            mSpan.className = 'contrib-month';
            mSpan.textContent = mName;
            mSpan.style.gridColumnStart = col + 1;
            monthsContainer.appendChild(mSpan);
            lastCol = col;
          }
        }
      });
    }

    var total = typeof cal.totalContributions === 'number'
      ? cal.totalContributions
      : days.reduce(function (s, d) { return s + d.count; }, 0);

    totalEl.textContent = countLabel(total) + ', past year';
    grid.setAttribute('role', 'img');
    grid.setAttribute('aria-label', countLabel(total) + ' in the past year');
    grid.tabIndex = 0;

    updateFit();
    // When the grid scrolls (narrow screens), start at the most recent weeks.
    scroller.scrollLeft = scroller.scrollWidth;
  }

  /** Size cells from container width on desktop so it fills 640px edge-to-edge. */
  function updateFit() {
    var isDesktop = window.matchMedia('(min-width: 721px)').matches;
    var colW = root.clientWidth;
    if (isDesktop && colW >= 633) {
      var cellW = (colW - 52 * 3) / 53;
      root.style.setProperty('--cg-cell', cellW + 'px');
      scroller.classList.add('is-fit');
    } else {
      root.style.removeProperty('--cg-cell');
      scroller.classList.remove('is-fit');
    }
  }

  /* ---- Tooltip (fade only, no movement) ---- */

  function tooltipText(d) {
    return countLabel(d.count) + ' \u00B7 ' + formatDate(d.date);
  }

  /** Show the tooltip for a day, clamped inside the column. */
  function showTooltip(i) {
    var d = days[i];
    if (!d) return;
    tooltip.textContent = tooltipText(d);

    var wrap = root.getBoundingClientRect();
    var cell = d.el.getBoundingClientRect();
    var tip = tooltip.getBoundingClientRect();
    var tw = tip.width;
    var th = tip.height;

    // Centered on the cell, clamped to the column's left and right edges.
    var x = cell.left - wrap.left + cell.width / 2 - tw / 2;
    x = Math.floor(Math.max(0, Math.min(x, wrap.width - tw)));

    // Above the cell; below it only if the viewport top would cut it off.
    var y = cell.top - wrap.top - th - TOOLTIP_GAP;
    if (cell.top - th - TOOLTIP_GAP < 0) {
      y = cell.bottom - wrap.top + TOOLTIP_GAP;
    }

    tooltip.style.transform = 'translate(' + x + 'px, ' + Math.round(y) + 'px)';
    tooltip.classList.add('is-active');
  }

  function hideTooltip() {
    tooltip.classList.remove('is-active');
  }

  /* ---- External link navigation ---- */

  function openDay(d) {
    if (d && d.count > 0) {
      var url = 'https://github.com/ShreyasLoL?tab=overview&from=' + d.date + '&to=' + d.date;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /* ---- Interaction ---- */

  var active = -1; // keyboard position

  function setActive(i) {
    if (active >= 0 && days[active]) days[active].el.classList.remove('is-active');
    active = i;
    var el = days[i].el;
    el.classList.add('is-active');

    // Keep the cell inside the scroll box without scrolling the page.
    var s = scroller.getBoundingClientRect();
    var c = el.getBoundingClientRect();
    if (c.left < s.left + 4) {
      scroller.scrollLeft -= s.left + 4 - c.left;
    } else if (c.right > s.right - 4) {
      scroller.scrollLeft += c.right - (s.right - 4);
    }

    showTooltip(i);
    live.textContent = tooltipText(days[i]);
  }

  function clearActive() {
    if (active >= 0 && days[active]) days[active].el.classList.remove('is-active');
  }

  function bindInteractions() {
    // Pointer: delegated hover over cells.
    grid.addEventListener('pointerover', function (e) {
      var cell = e.target.closest('.contrib-cell');
      if (cell && grid.contains(cell)) showTooltip(Number(cell.getAttribute('data-i')));
    });

    // Touch fires pointerleave right after the tap; keep the tooltip until
    // the next tap elsewhere. With keyboard focus, fall back to its cell.
    grid.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'touch') return;
      if (document.activeElement === grid && active >= 0 && grid.matches(':focus-visible')) {
        showTooltip(active);
      } else {
        hideTooltip();
      }
    });

    document.addEventListener('pointerdown', function (e) {
      if (!grid.contains(e.target)) hideTooltip();
    });

    // Click: open GitHub overview for days with > 0 contributions
    grid.addEventListener('click', function (e) {
      var cell = e.target.closest('.contrib-cell');
      if (cell && grid.contains(cell)) {
        var idx = Number(cell.getAttribute('data-i'));
        openDay(days[idx]);
      }
    });

    // Keyboard: one tab stop, arrows move between days.
    grid.addEventListener('focus', function () {
      if (!grid.matches(':focus-visible')) return;
      setActive(active >= 0 ? active : days.length - 1);
    });

    grid.addEventListener('blur', function () {
      clearActive();
      hideTooltip();
    });

    grid.addEventListener('keydown', function (e) {
      if (active < 0) active = days.length - 1;
      var d = days[active];
      var next;

      switch (e.key) {
        case 'ArrowRight': next = byPos[(d.col + 1) + ':' + d.weekday]; break;
        case 'ArrowLeft':  next = byPos[(d.col - 1) + ':' + d.weekday]; break;
        case 'ArrowDown':  next = byPos[d.col + ':' + (d.weekday + 1)]; break;
        case 'ArrowUp':    next = byPos[d.col + ':' + (d.weekday - 1)]; break;
        case 'Home':       next = 0; break;
        case 'End':        next = days.length - 1; break;
        case 'Enter':      openDay(d); return;
        case 'Escape':     hideTooltip(); return;
        default: return;
      }

      e.preventDefault();
      if (next !== undefined) setActive(next);
    });

    // Legend filter swatches
    var swatches = root.querySelectorAll('.contrib-swatches .contrib-cell');
    swatches.forEach(function (swatch) {
      var lvl = swatch.getAttribute('data-level');
      function startFilter() {
        root.setAttribute('data-filter-level', lvl);
      }
      function stopFilter() {
        root.removeAttribute('data-filter-level');
      }
      swatch.addEventListener('pointerenter', startFilter);
      swatch.addEventListener('pointerleave', stopFilter);
      swatch.addEventListener('focus', startFilter);
      swatch.addEventListener('blur', stopFilter);
      swatch.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          stopFilter();
          swatch.blur();
        }
      });
    });

    // Positions go stale when the grid scrolls or the layout changes.
    scroller.addEventListener('scroll', function () {
      if (document.activeElement === grid && active >= 0 && tooltip.classList.contains('is-active')) {
        showTooltip(active);
      } else {
        hideTooltip();
      }
    }, { passive: true });

    window.addEventListener('resize', function () {
      hideTooltip();
      updateFit();
    });
  }

  /* ---- Entrance ---- */

  function bindEntrance() {
    function reveal() {
      root.classList.add('is-visible');
    }

    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
      reveal();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        reveal();
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(root);
  }

  /* ---- Boot ---- */

  loadCalendar()
    .then(function (cal) {
      render(cal);
      bindInteractions();
      bindEntrance();
    })
    .catch(function () {
      // On any failure, render nothing.
      root.hidden = true;
    });
})();
