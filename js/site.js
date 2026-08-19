/* =============================================================================
   DEO Kairo — SHARED CHROME BEHAVIOUR
   -----------------------------------------------------------------------------
   Header, mobile menu, language toggle, reveals, scroll progress, back-to-top.
   Loaded by the six concept pages (values / school-path / community, V1 and V2).

   It also publishes a small toolkit the concept scripts build on:

     SITE.REDUCE          honours prefers-reduced-motion
     SITE.onScroll(fn)    subscribe to ONE shared rAF-throttled scroll loop, so
                          three or four scroll-driven effects on a page still
                          cost a single listener and a single frame of work
     SITE.onResize(fn)    the same, debounced, for layout measurement
     SITE.clamp/lerp/ease helpers used by every concept

   Classic script, no modules — the pages must also work opened from disk.
   ============================================================================= */
(function (global) {
  'use strict';

  var REDUCE = global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Shared scroll loop -------------------------------------------------
     Every scroll-driven effect on a page registers here. One listener, one
     requestAnimationFrame per frame, no matter how many effects are running.
     -------------------------------------------------------------------------- */
  var scrollSubs = [];
  var ticking = false;

  function runScroll() {
    ticking = false;
    var y = global.scrollY || global.pageYOffset || 0;
    for (var i = 0; i < scrollSubs.length; i++) {
      try { scrollSubs[i](y); } catch (e) { /* one broken effect must not stop the rest */ }
    }
  }

  function onScroll(fn) {
    scrollSubs.push(fn);
    fn(global.scrollY || 0);
  }

  global.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(runScroll); }
  }, { passive: true });

  /* ---- Shared resize loop -------------------------------------------------
     Debounced, because the concept pages re-measure geometry here and doing it
     on every resize event during a window drag is wasteful.
     -------------------------------------------------------------------------- */
  var resizeSubs = [];
  var resizeTimer = null;

  function onResize(fn) {
    resizeSubs.push(fn);
    fn();
  }

  function fireResize() {
    for (var i = 0; i < resizeSubs.length; i++) {
      try { resizeSubs[i](); } catch (e) { /* keep going */ }
    }
    runScroll();          // geometry moved, so scroll-derived values are stale
  }

  global.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fireResize, 120);
  }, { passive: true });

  /* On phones the address bar collapsing fires resize constantly while
     scrolling; orientationchange is the event that actually needs a re-measure. */
  global.addEventListener('orientationchange', function () {
    setTimeout(fireResize, 200);
  });

  /* Scripts run before web fonts and images have settled, so every geometry
     measured at that point can be a few hundred pixels out. One re-measure once
     the page has genuinely finished loading fixes the scroll-driven effects for
     anyone who lands mid-page and never scrolls. */
  global.addEventListener('load', function () { setTimeout(fireResize, 0); });

  /* ---- Maths --------------------------------------------------------------- */
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* Progress of an element through the viewport, 0 before it starts, 1 after
     it finishes. The single most reused number on these pages. */
  function progressThrough(el, y, vh) {
    var rect = el.getBoundingClientRect();
    var top = rect.top + y;
    var span = el.offsetHeight - vh;
    if (span <= 0) return clamp((y + vh - top) / (vh + el.offsetHeight), 0, 1);
    return clamp((y - top) / span, 0, 1);
  }

  /* ---- 1. Mobile menu ------------------------------------------------------ */
  function initMenu() {
    var btn = document.getElementById('menu-toggle');
    var nav = document.getElementById('main-nav');
    if (!btn || !nav) return;

    function set(open) {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    }

    btn.addEventListener('click', function () {
      set(btn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        set(false); btn.focus();
      }
    });
    /* Crossing back to the desktop layout with the panel open would leave
       aria-expanded lying about a menu that is no longer a menu. */
    var wide = global.matchMedia('(min-width: 901px)');
    if (wide.addEventListener) {
      wide.addEventListener('change', function (e) { if (e.matches) set(false); });
    }
  }

  /* ---- 2. Language toggle (EN / DE) ---------------------------------------
     Values are author-written markup in data-en / data-de, so innerHTML is the
     intended assignment here — nothing user-supplied ever reaches it.
     -------------------------------------------------------------------------- */
  function initLang() {
    var btn = document.getElementById('lang-toggle');
    if (!btn) return;
    var nodes = document.querySelectorAll('[data-en]');
    var cur = 'en';

    function apply(next) {
      Array.prototype.forEach.call(nodes, function (el) {
        var v = el.getAttribute('data-' + next);
        if (v !== null) el.innerHTML = v;
      });
      document.documentElement.setAttribute('lang', next);
      btn.querySelector('.lang-current').textContent = next.toUpperCase();
      btn.querySelector('.lang-other').textContent = next === 'en' ? 'DE' : 'EN';
      btn.setAttribute('aria-label', next === 'en'
        ? 'Switch language to German'
        : 'Zur englischen Sprache wechseln');
      /* German copy is longer; the page just changed height, so anything
         measuring the layout needs to measure again. */
      fireResize();
    }

    btn.addEventListener('click', function () {
      cur = cur === 'en' ? 'de' : 'en';
      if (REDUCE) { apply(cur); return; }
      var root = document.documentElement;
      root.classList.add('lang-switching');
      setTimeout(function () { apply(cur); root.classList.remove('lang-switching'); }, 180);
    });
  }

  /* ---- 3. Reveals ---------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal], [data-reveal-mask]');
    if (!items.length) return;

    if (REDUCE || !('IntersectionObserver' in global)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        io.unobserve(en.target);        // reveal once, then stop watching
      });
    }, { threshold: .1, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ---- 4. Header state, progress bar, back-to-top -------------------------- */
  function initChrome() {
    var header = document.getElementById('site-header');
    var bar = document.getElementById('scroll-bar');
    var toTop = document.getElementById('to-top');

    onScroll(function (y) {
      if (header) header.classList.toggle('is-scrolled', y > 16);
      if (bar) {
        var max = document.documentElement.scrollHeight - global.innerHeight;
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      }
      if (toTop) toTop.classList.toggle('is-shown', y > 700);
    });

    if (toTop) {
      toTop.addEventListener('click', function () {
        global.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
        var skip = document.querySelector('.skip-link');
        if (skip) skip.focus({ preventScroll: true });
      });
    }
  }

  global.SITE = {
    REDUCE: REDUCE,
    onScroll: onScroll,
    onResize: onResize,
    refresh: fireResize,
    clamp: clamp,
    lerp: lerp,
    easeInOut: easeInOut,
    easeOut: easeOut,
    progressThrough: progressThrough
  };

  initMenu();
  initLang();
  initReveal();
  initChrome();
})(window);
