/* =============================================================================
   SCHOOL PATH — interactions
   -----------------------------------------------------------------------------
   V1  Vertical scrolling drives a horizontal journey. A thick road, generated
       from the same curve as the DEO mark, runs beneath five eras and draws
       itself as you travel; the early eras arrive in monochrome and gain their
       colour as they reach the middle of the frame.

   V2  The same five eras on a dial you drag. History as an instrument.

   Both are guarded by element checks, so this file serves both pages.
   Depends on js/deo-mark.js and js/site.js.
   ============================================================================= */
(function () {
  'use strict';

  var REDUCE = SITE.REDUCE;

  /* ===========================================================================
     V1 · THE ROAD AND THE RAIL
     =========================================================================== */
  function rail() {
    var track = document.getElementById('sp-track');
    var viewport = document.getElementById('sp-viewport');
    var railEl = document.getElementById('sp-rail');
    var road = document.getElementById('sp-road');
    if (!track || !viewport || !railEl || !road) return;

    var bed = road.querySelector('.sp-road-bed');
    var live = road.querySelector('.sp-road-live');
    var dots = document.getElementById('sp-road-dots');
    var grad = document.getElementById('sp-road-grad');
    var chapters = Array.prototype.slice.call(railEl.querySelectorAll('.sp-chapter'));
    var navBtns = Array.prototype.slice.call(document.querySelectorAll('.sp-nav button'));
    var scale = document.getElementById('sp-scale-fill');
    if (!chapters.length || !bed || !live) return;

    /* The horizontal journey needs a wide, tall viewport and a visitor who has
       not asked for less motion. Everything else gets the stacked version,
       which tells the same story reading downwards. */
    var horizontal = !REDUCE &&
      window.matchMedia('(min-width: 901px)').matches &&
      window.innerHeight >= 540;

    if (horizontal) document.documentElement.classList.add('rail-on');

    var liveLen = 0;
    var current = -1;

    SITE.onResize(function () {
      if (horizontal) {
        /* clientWidth, not 100vw: vw includes the scrollbar, and a panel a few
           pixels too wide accumulates into a visible drift by the fifth era. */
        var pw = document.documentElement.clientWidth;
        railEl.style.setProperty('--panel-w', pw + 'px');
      }

      var w = railEl.offsetWidth;
      var h = railEl.offsetHeight;
      if (!w || !h) return;

      road.setAttribute('viewBox', '0 0 ' + w + ' ' + h);

      var pts;
      if (horizontal) {
        /* A road that swings across the full height of the frame and gains
           amplitude as it travels — the journey visibly gathers momentum. */
        pts = DEO.wavePoints(
          { x: 0, y: h * 0.16, w: w, h: h * 0.62 },
          { cycles: 1.35, grow: 1.5, steps: 320 }
        );
        setStroke(13);
        if (grad) { grad.setAttribute('x1', 0); grad.setAttribute('y1', 0);
                    grad.setAttribute('x2', w); grad.setAttribute('y2', 0); }
      } else {
        /* Stood on end for the stacked layout: the same wave, transposed, so
           it runs down the gutter beside the eras. */
        var band = Math.min(Math.max(w * 0.13, 46), 120);
        pts = DEO.wavePoints(
          { x: 0, y: 0, w: h, h: band },
          { cycles: 1.6, grow: 1.35, steps: 320 }
        ).map(function (p) { return [p[1] + band * 0.12, p[0]]; });
        setStroke(9);
        if (grad) { grad.setAttribute('x1', 0); grad.setAttribute('y1', 0);
                    grad.setAttribute('x2', 0); grad.setAttribute('y2', h); }
      }

      var d = DEO.toPath(pts);
      bed.setAttribute('d', d);
      live.setAttribute('d', d);

      liveLen = live.getTotalLength();
      live.style.strokeDasharray = liveLen;
      live.style.strokeDashoffset = liveLen;

      placeDots(pts);
    });

    function setStroke(base) {
      bed.setAttribute('stroke-width', base + 4);
      live.setAttribute('stroke-width', base);
    }

    /* One node per era, sitting on the road where that era begins. */
    function placeDots(pts) {
      if (!dots) return;
      while (dots.firstChild) dots.removeChild(dots.firstChild);
      chapters.forEach(function (ch, n) {
        var at = pts[Math.min(Math.round(((n + 0.5) / chapters.length) * (pts.length - 1)), pts.length - 1)];
        var c = document.createElementNS(DEO.SVGNS, 'circle');
        c.setAttribute('cx', at[0]);
        c.setAttribute('cy', at[1]);
        c.setAttribute('r', 7);
        c.setAttribute('class', 'sp-road-dot');
        c.setAttribute('fill', ch.getAttribute('data-era') || '#DB1F26');
        dots.appendChild(c);
      });
    }

    SITE.onScroll(function (y) {
      var p;

      if (horizontal) {
        var top = track.getBoundingClientRect().top + y;
        var span = track.offsetHeight - viewport.offsetHeight;
        if (span <= 0) return;
        p = SITE.clamp((y - top) / span, 0, 1);

        var shift = railEl.scrollWidth - viewport.clientWidth;
        var x = -p * shift;
        railEl.style.transform = 'translate3d(' + x.toFixed(1) + 'px, 0, 0)';

        /* Distance from the centre of the frame, per chapter: drives both the
           parallax and the arrival of colour. */
        var mid = viewport.clientWidth / 2;
        chapters.forEach(function (ch) {
          var centre = ch.offsetLeft + ch.offsetWidth / 2 + x;
          var off = centre - mid;
          ch.style.setProperty('--px', off.toFixed(1));
          ch.style.setProperty('--near',
            SITE.clamp(1 - Math.abs(off) / (ch.offsetWidth * 0.62), 0, 1).toFixed(3));
        });
      } else {
        p = SITE.progressThrough(track, y, window.innerHeight);
        chapters.forEach(function (ch) {
          var r = ch.getBoundingClientRect();
          var off = (r.top + r.height / 2) - window.innerHeight / 2;
          ch.style.setProperty('--near',
            SITE.clamp(1 - Math.abs(off) / (window.innerHeight * 0.6), 0, 1).toFixed(3));
        });
      }

      if (liveLen) live.style.strokeDashoffset = (liveLen * (1 - p)).toFixed(1);
      if (scale) scale.style.width = (p * 100).toFixed(2) + '%';

      var i = SITE.clamp(Math.round(p * (chapters.length - 1)), 0, chapters.length - 1);
      if (i !== current) {
        current = i;
        navBtns.forEach(function (b, n) { b.setAttribute('aria-current', String(n === i)); });
      }
    });

    /* The era buttons scroll the journey rather than jumping it, so the road
       is seen to travel to the era you asked for. */
    navBtns.forEach(function (btn, n) {
      btn.addEventListener('click', function () {
        if (horizontal) {
          var span = track.offsetHeight - viewport.offsetHeight;
          var top = track.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: top + span * (n / (chapters.length - 1)),
            behavior: REDUCE ? 'auto' : 'smooth'
          });
        } else if (chapters[n]) {
          chapters[n].scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'center' });
        }
      });
    });
  }

  /* ===========================================================================
     V1 · WHERE THE ROAD LANDS
     ---------------------------------------------------------------------------
     The mark is not faded in over the page. A stroke following the same curve
     the road was built from widens from nothing, and the logo is only visible
     where that stroke has already passed — so the mark grows out of the road.
     =========================================================================== */
  function landing() {
    var frame = document.getElementById('sp-mark');
    if (!frame) return;

    var slot = document.getElementById('sp-mark-slot');
    var bloom = document.getElementById('sp-bloom');
    if (slot && !slot.firstChild) slot.appendChild(DEO.markGroup({ classPrefix: 'sp-mark' }));

    if (bloom) {
      bloom.setAttribute('d', DEO.lemniscate(
        { x: 16, y: 14, w: 124, h: 60 }, { open: 0.055, steps: 180 }));
    }

    if (REDUCE || !bloom) {
      if (bloom) bloom.setAttribute('stroke-width', 200);
      return;
    }

    SITE.onScroll(function (y) {
      var rect = frame.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = SITE.clamp((vh * 0.88 - rect.top) / (vh * 0.55), 0, 1);
      /* 0 to 120 in the mark's own units is enough to cover the whole
         artboard from the curve outward. */
      bloom.setAttribute('stroke-width', (SITE.easeOut(p) * 120).toFixed(1));
    });
  }

  /* ===========================================================================
     V2 · THE DIAL
     ---------------------------------------------------------------------------
     A range input is the honest control here: draggable, arrow-key operable and
     announced as a slider without a line of extra ARIA. The eras are layers in
     one frame; the value picks which is showing and how far the archival
     treatment has been wiped from the photograph.
     =========================================================================== */
  function dial() {
    var stage = document.getElementById('sp2-stage');
    var range = document.getElementById('sp2-range');
    if (!stage || !range) return;

    var eras = Array.prototype.slice.call(stage.querySelectorAll('.sp2-era'));
    var slider = document.getElementById('sp2-slider');
    var yearOut = document.getElementById('sp2-year');
    var labelOut = document.getElementById('sp2-label');
    var ticks = Array.prototype.slice.call(document.querySelectorAll('.sp2-ticks button'));
    var prev = document.getElementById('sp2-prev');
    var next = document.getElementById('sp2-next');
    if (eras.length < 2) return;

    var LAST = eras.length - 1;
    var STEP = 100;                       // sub-steps per era, for smooth dragging
    var current = -1;
    var tween = null;

    document.documentElement.classList.add('dial-on');
    range.max = String(LAST * STEP);
    range.value = '0';

    /* Reserve the tallest era's height so the dial does not jump as the frame
       changes. Re-measured after an EN/DE switch, where every line grows. */
    SITE.onResize(function () {
      stage.style.setProperty('--stage-h', '');
      var tallest = 0;
      eras.forEach(function (e) { tallest = Math.max(tallest, e.offsetHeight); });
      if (tallest) stage.style.setProperty('--stage-h', tallest + 'px');
      /* Also the hook for an EN/DE switch, where the readout needs rebuilding
         even though the era has not changed. */
      current = -1;
      apply(Number(range.value));
    });

    /* The readout is written by script, so it cannot carry data-en/data-de like
       ordinary copy — it picks the right attribute for the current language. */
    function label(el, name) {
      var de = document.documentElement.getAttribute('lang') === 'de';
      return (de && el.getAttribute(name + '-de')) || el.getAttribute(name) || '';
    }

    function apply(v) {
      var pos = v / STEP;
      var i = SITE.clamp(Math.round(pos), 0, LAST);
      var through = LAST ? pos / LAST : 0;

      if (slider) slider.style.setProperty('--fill', through.toFixed(3));

      /* One wipe value for the whole journey: fully archival at 1873, fully
         present by the last era. */
      eras.forEach(function (e) { e.style.setProperty('--wipe', through.toFixed(3)); });

      if (i === current) return;
      current = i;

      eras.forEach(function (e, n) { e.classList.toggle('is-current', n === i); });
      ticks.forEach(function (b, n) { b.setAttribute('aria-current', String(n === i)); });

      var era = eras[i];
      var year = label(era, 'data-year');
      var name = label(era, 'data-label');
      if (yearOut) yearOut.textContent = year;
      if (labelOut) labelOut.textContent = name;
      range.setAttribute('aria-valuetext', year + ' — ' + name);

      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === LAST;
    }

    /* Jumping between eras is animated rather than instant, so the wipe and the
       filled road are seen to move — the point of a dial is that it travels. */
    function goTo(i, animate) {
      var target = SITE.clamp(i, 0, LAST) * STEP;
      if (!animate || REDUCE) { range.value = String(target); apply(target); return; }

      var from = Number(range.value);
      var start = null;
      if (tween) cancelAnimationFrame(tween);

      (function step(now) {
        if (start === null) start = now;
        var t = SITE.clamp((now - start) / 460, 0, 1);
        var v = SITE.lerp(from, target, SITE.easeOut(t));
        range.value = String(Math.round(v));
        apply(v);
        if (t < 1) tween = requestAnimationFrame(step);
      })(performance.now());
    }

    range.addEventListener('input', function () {
      if (tween) { cancelAnimationFrame(tween); tween = null; }
      apply(Number(range.value));
    });

    /* A single arrow press should move an era, not one hundredth of one. */
    range.addEventListener('keydown', function (e) {
      var dir = (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'PageUp') ? 1
              : (e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'PageDown') ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      goTo(Math.round(Number(range.value) / STEP) + dir, true);
    });

    ticks.forEach(function (b, n) { b.addEventListener('click', function () { goTo(n, true); }); });
    if (prev) prev.addEventListener('click', function () { goTo(current - 1, true); });
    if (next) next.addEventListener('click', function () { goTo(current + 1, true); });

    apply(0);
  }

  rail();
  landing();
  dial();
})();
