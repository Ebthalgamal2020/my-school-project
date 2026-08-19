/* =============================================================================
   COMMUNITY — interactions
   -----------------------------------------------------------------------------
   V1  A page that gets busier as you read it, and then resolves: two hundred
       dots scattered across a field travel into the DEO mark, in the mark's own
       three colours, on a light ground because black only exists on paper.

   V2  The same people as a wall you can sort. Filtering re-lays the grid and
       every card is animated from where it used to be (FLIP), so a change of
       view reads as movement rather than a flicker.

   Depends on js/deo-mark.js and js/site.js.
   ============================================================================= */
(function () {
  'use strict';

  var REDUCE = SITE.REDUCE;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------------------------------------------------------------------
     A section's progress across the viewport, published as a CSS variable.
     Used by the students (scattered to aligned) and the families (apart to
     met) — the movement is described in CSS; this only supplies the number.
     --------------------------------------------------------------------------- */
  function scrollVar(el, name, opts) {
    if (!el) return;
    opts = opts || {};
    var from = opts.from == null ? 0.9 : opts.from;   // starts when the top hits 90% down
    var to = opts.to == null ? 0.35 : opts.to;        // done by 35%

    if (REDUCE) { el.style.setProperty(name, '1'); return; }

    SITE.onScroll(function () {
      var vh = window.innerHeight;
      var rect = el.getBoundingClientRect();
      var p = SITE.clamp((vh * from - rect.top) / (vh * (from - to)), 0, 1);
      el.style.setProperty(name, SITE.easeInOut(p).toFixed(3));
    });
  }

  /* ===========================================================================
     V1 · HERO
     =========================================================================== */
  function hero() {
    var cutout = document.querySelector('.cm-cutout');
    var orbs = Array.prototype.slice.call(document.querySelectorAll('.cm-orb'));
    var heroEl = document.querySelector('.cm-hero');
    if (!heroEl) return;

    if (cutout && !REDUCE) {
      SITE.onScroll(function (y) {
        /* Only while the hero is on screen — beyond that the value is wasted
           work and the element is not visible anyway. */
        if (y > heroEl.offsetHeight) return;
        cutout.style.setProperty('--py', (y * 0.14).toFixed(1));
      });
    }

    if (!orbs.length || REDUCE || !FINE) return;

    heroEl.addEventListener('pointermove', function (e) {
      var r = heroEl.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      orbs.forEach(function (orb, i) {
        /* Alternating depths: some fragments lead the pointer, some lag it. */
        var depth = [26, -18, 34][i % 3];
        orb.style.setProperty('--dx', (nx * depth).toFixed(1));
        orb.style.setProperty('--dy', (ny * depth).toFixed(1));
      });
    });

    heroEl.addEventListener('pointerleave', function () {
      orbs.forEach(function (orb) {
        orb.style.setProperty('--dx', 0);
        orb.style.setProperty('--dy', 0);
      });
    });
  }

  /* ===========================================================================
     V1 · TOGETHER — the crowd becomes the mark
     ---------------------------------------------------------------------------
     Every dot is a person: it starts somewhere of its own and ends on the
     mark. The dots are spread across the width of the stroke rather than
     strung along a hairline, because the DEO logo is a bold form, not an
     outline.
     =========================================================================== */
  function together() {
    var wrap = document.querySelector('.cm-canvas-wrap');
    var canvas = document.getElementById('cm-canvas');
    if (!wrap || !canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    /* Enough people that the assembled mark reads as a solid form rather than a
       dotted outline, few enough that a phone still draws it in one frame. */
    var COUNT = 320;
    var dots = [];
    var W = 0, H = 0;
    var progress = 0;
    var pointer = null;
    var loop = null;

    /* A tiny deterministic generator: the scatter must be identical before and
       after a resize, or the crowd visibly reshuffles when a phone rotates.

       An integer hash rather than one step of a linear congruential generator.
       An LCG fed consecutive seeds returns consecutive outputs — the values
       walk in a straight line — so neighbouring dots got neighbouring offsets
       and the assembled crowd combed itself into little radial dashes instead
       of reading as people. Mixing the bits decorrelates them while staying
       entirely a function of the index. */
    function rand(seed) {
      var s = (seed | 0) + 0x9E3779B9;
      s = Math.imul(s ^ (s >>> 16), 0x21F0AAAD);
      s = Math.imul(s ^ (s >>> 15), 0x735A2D97);
      s = s ^ (s >>> 15);
      return (s >>> 0) / 4294967296;
    }

    /* Resample a point list to even spacing along its length. Parameter
       spacing on a lemniscate bunches up near the crossing; arc length does
       not, and evenly spread people look deliberate rather than clumped. */
    function resample(pts, n) {
      var acc = [0];
      var total = 0;
      for (var i = 1; i < pts.length; i++) {
        total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        acc.push(total);
      }
      var out = [];
      var j = 1;
      for (var k = 0; k < n; k++) {
        var want = (k / n) * total;
        while (j < acc.length - 1 && acc[j] < want) j++;
        var span = acc[j] - acc[j - 1] || 1;
        var t = (want - acc[j - 1]) / span;
        out.push([
          SITE.lerp(pts[j - 1][0], pts[j][0], t),
          SITE.lerp(pts[j - 1][1], pts[j][1], t)
        ]);
      }
      return out;
    }

    function build() {
      var r = wrap.getBoundingClientRect();
      W = Math.max(Math.round(r.width), 1);
      H = Math.max(Math.round(r.height), 1);

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var box = { x: W * 0.08, y: H * 0.14, w: W * 0.84, h: H * 0.72 };
      var spine = resample(DEO.lemniscatePoints(box, { steps: 900, open: 0.05 }), COUNT);
      var thickness = Math.max(Math.min(H * 0.09, 46), 14);

      dots = spine.map(function (p, i) {
        /* Perpendicular to the curve, so the band of dots has the mark's
           weight instead of being a thread. */
        var prev = spine[(i - 1 + spine.length) % spine.length];
        var nextP = spine[(i + 1) % spine.length];
        var tx = nextP[0] - prev[0], ty = nextP[1] - prev[1];
        var len = Math.hypot(tx, ty) || 1;
        var off = (rand(i * 3 + 1) - 0.5) * thickness;

        var tX = p[0] + (-ty / len) * off;
        var tY = p[1] + (tx / len) * off;

        /* The logo's own colour order: black loop on the left, gold on the
           right, red where the two cross. */
        var rel = (tX - W / 2) / W;
        var colour = rel < -0.11 ? '#141414' : rel > 0.11 ? '#FFCE03' : '#DB1F26';

        return {
          sx: rand(i * 7 + 3) * W,
          sy: rand(i * 11 + 5) * H,
          tx: tX, ty: tY,
          r: 2.2 + rand(i * 13 + 7) * 2.6,
          delay: (i % 9) / 9 * 0.28,
          colour: colour,
          ox: 0, oy: 0
        };
      });

      draw();
    }

    function draw() {
      if (!dots.length) return;
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        var t = SITE.easeOut(SITE.clamp((progress - d.delay) / (1 - 0.28), 0, 1));
        var x = SITE.lerp(d.sx, d.tx, t);
        var y = SITE.lerp(d.sy, d.ty, t);

        /* Once assembled, the crowd parts a little around the pointer — the
           only thing on this page that reacts to being looked at. */
        if (pointer && t > 0.85) {
          var dx = x - pointer.x, dy = y - pointer.y;
          var dist = Math.hypot(dx, dy);
          if (dist < 110 && dist > 0.01) {
            var push = (1 - dist / 110) * 26;
            x += (dx / dist) * push;
            y += (dy / dist) * push;
          }
        }

        ctx.globalAlpha = 0.25 + t * 0.75;
        ctx.fillStyle = d.colour;
        ctx.beginPath();
        ctx.arc(x, y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    SITE.onResize(build);

    if (REDUCE) {
      progress = 1;
      draw();
      return;
    }

    SITE.onScroll(function () {
      var rect = wrap.getBoundingClientRect();
      var vh = window.innerHeight;
      progress = SITE.clamp((vh * 0.92 - rect.top) / (vh * 0.62), 0, 1);
      draw();
    });

    /* The pointer loop only runs while the pointer is actually over the
       canvas; the rest of the time nothing is scheduled at all. */
    if (FINE) {
      canvas.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
        if (!loop) tick();
      });
      canvas.addEventListener('pointerleave', function () {
        pointer = null;
        draw();
        if (loop) { cancelAnimationFrame(loop); loop = null; }
      });
    }

    function tick() {
      draw();
      loop = pointer ? requestAnimationFrame(tick) : null;
    }
  }

  /* ===========================================================================
     V1 · CURSOR
     A light that follows the pointer and swells over anything worth looking at.
     =========================================================================== */
  function cursor() {
    var el = document.querySelector('.cm-cursor');
    if (!el || !FINE || REDUCE) return;

    var x = 0, y = 0, cx = 0, cy = 0, raf = null;

    document.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      el.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(follow);
    });
    document.addEventListener('pointerleave', function () { el.classList.remove('is-on'); });

    /* Trailing rather than pinned: the light is a presence, not a second
       cursor competing with the real one. */
    function follow() {
      cx += (x - cx) * 0.16;
      cy += (y - cy) * 0.16;
      el.style.setProperty('--cx', cx.toFixed(1) + 'px');
      el.style.setProperty('--cy', cy.toFixed(1) + 'px');
      raf = (Math.abs(x - cx) > 0.4 || Math.abs(y - cy) > 0.4) ? requestAnimationFrame(follow) : null;
    }

    document.querySelectorAll('a, button, .cm-orb, .cm-alum, figure').forEach(function (t) {
      t.addEventListener('pointerenter', function () { el.style.setProperty('--cs', 3.4); });
      t.addEventListener('pointerleave', function () { el.style.setProperty('--cs', 1); });
    });
  }

  /* ===========================================================================
     V2 · THE WALL
     ---------------------------------------------------------------------------
     FLIP: measure where every card is, change the layout, measure again, then
     start each card from its old position and let it travel. The browser lays
     the grid out; we only animate the difference.
     =========================================================================== */
  function wall() {
    var grid = document.getElementById('cw-grid');
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.cw-card'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.cw-filters button'));
    var count = document.getElementById('cw-count');
    if (!cards.length) return;

    function setCount(n) {
      if (!count) return;
      var de = document.documentElement.getAttribute('lang') === 'de';
      count.textContent = n + (de ? ' Personen' : ' people');
    }

    function show(group) {
      var first = new Map();
      cards.forEach(function (c) {
        if (!c.classList.contains('is-hidden')) first.set(c, c.getBoundingClientRect());
      });

      var shown = 0;
      cards.forEach(function (c) {
        var match = group === 'all' || c.getAttribute('data-group') === group;
        c.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      setCount(shown);

      if (REDUCE) return;

      cards.forEach(function (c) {
        if (c.classList.contains('is-hidden')) return;
        var last = c.getBoundingClientRect();
        var was = first.get(c);

        c.classList.remove('is-moving');
        if (was) {
          var dx = was.left - last.left;
          var dy = was.top - last.top;
          if (!dx && !dy) return;
          c.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
        } else {
          /* Arriving from nowhere: fade up in place rather than flying in from
             a position it never had. */
          c.style.opacity = '0';
          c.style.transform = 'scale(.95)';
        }

        requestAnimationFrame(function () {
          c.classList.add('is-moving');
          c.style.transform = '';
          c.style.opacity = '';
        });
      });
    }

    grid.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'transform') e.target.classList.remove('is-moving');
    });

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        buttons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        show(b.getAttribute('data-filter') || 'all');
      });
    });

    /* Keeps the counter honest after an EN/DE switch. */
    SITE.onResize(function () {
      setCount(cards.filter(function (c) { return !c.classList.contains('is-hidden'); }).length);
    });
  }

  hero();
  scrollVar(document.querySelector('.cm-scatter'), '--align');
  scrollVar(document.querySelector('.cm-meet'), '--meet', { from: 0.85, to: 0.3 });
  together();
  cursor();
  wall();
})();
