/* =============================================================================
   OUR VALUES — interactions
   -----------------------------------------------------------------------------
   V1  Two strands of the DEO curve start apart and, across five values,
       converge until they trace the complete mark. Nothing here is decorative
       motion: the geometry IS the argument the page is making.

   V2  The same five values as a field rather than a sequence — one lemniscate,
       five nodes, explored in any order.

   Both halves are guarded by element checks, so this one file serves both
   pages and does nothing on a page that has neither.

   Depends on js/deo-mark.js (geometry) and js/site.js (shared scroll loop).
   ============================================================================= */
(function () {
  'use strict';

  var REDUCE = SITE.REDUCE;
  var TAU = Math.PI * 2;

  /* ===========================================================================
     THE STRAND
     ---------------------------------------------------------------------------
     Every shape on this page is one curve under different transforms: the
     lemniscate the DEO mark is built from. A strand is a slice of it.

       t0, t1   which part of the curve this strand traces. The full curve runs
                0..2pi; the right loop is -pi/2..pi/2, the left loop the rest.
       sx, sy   half-width and height scale — fitted separately, because the
                pure curve is far flatter than the logo's loops
       rot      rotation, in radians
       dx, dy   offset from the centre of the 100x100 figure box

     Interpolating these SEVEN NUMBERS between states is what morphs the shape.
     Interpolating the points themselves would let the curve pass through
     shapes that are not lemniscates at all.
     =========================================================================== */
  function strandPoints(prm, steps) {
    steps = steps || 150;
    var pts = [];
    var cos = Math.cos(prm.rot), sin = Math.sin(prm.rot);

    for (var i = 0; i <= steps; i++) {
      var t = prm.t0 + (prm.t1 - prm.t0) * (i / steps);
      var d = 1 + Math.sin(t) * Math.sin(t);
      var x = (Math.cos(t) / d) * prm.sx;
      var y = (Math.sin(t) * Math.cos(t) / d) * prm.sy;
      pts.push([
        50 + prm.dx + x * cos - y * sin,
        50 + prm.dy + x * sin + y * cos
      ]);
    }
    return pts;
  }

  function mixPrm(a, b, t) {
    var out = {};
    for (var k in a) { if (Object.prototype.hasOwnProperty.call(a, k)) out[k] = a[k] + (b[k] - a[k]) * t; }
    return out;
  }

  /* ---------------------------------------------------------------------------
     THE FIVE STATES
     -----------------------------------------------------------------------------
     01 Connection  two arcs facing each other across a gap — reaching, not yet
                    touching
     02 Curiosity   both open outward and lean apart, exploring
     03 Community   the ranges run past the crossing point, so the strands
                    genuinely overlap for the first time
     04 Creativity  deliberately off balance: tilted, unequal, the one state
                    that refuses symmetry
     05 Future      the exact left and right loops of one lemniscate, same
                    transform, no offset. Two strands, one mark.
     --------------------------------------------------------------------------- */
  var STATES = [
    { a: { t0: 0.62 * Math.PI, t1: 1.38 * Math.PI, sx: 30, sy: 52, rot: 0,     dx: -14, dy: 0,  w: 7.0 },
      b: { t0: -0.38 * Math.PI, t1: 0.38 * Math.PI, sx: 30, sy: 52, rot: 0,     dx: 14,  dy: 0,  w: 7.0 } },

    { a: { t0: 0.55 * Math.PI, t1: 1.45 * Math.PI, sx: 32, sy: 58, rot: -0.16, dx: -11, dy: 2,  w: 7.8 },
      b: { t0: -0.45 * Math.PI, t1: 0.45 * Math.PI, sx: 32, sy: 58, rot: 0.16,  dx: 11,  dy: -2, w: 7.8 } },

    { a: { t0: 0.50 * Math.PI, t1: 1.54 * Math.PI, sx: 38, sy: 64, rot: -0.06, dx: -5,  dy: 0,  w: 8.6 },
      b: { t0: -0.54 * Math.PI, t1: 0.50 * Math.PI, sx: 38, sy: 64, rot: 0.06,  dx: 5,   dy: 0,  w: 8.6 } },

    { a: { t0: 0.44 * Math.PI, t1: 1.56 * Math.PI, sx: 42, sy: 60, rot: 0.19,  dx: -3,  dy: -4, w: 9.4 },
      b: { t0: -0.56 * Math.PI, t1: 0.44 * Math.PI, sx: 39, sy: 76, rot: 0.19,  dx: 3,   dy: 4,  w: 9.4 } },

    { a: { t0: 0.50 * Math.PI + 0.07, t1: 1.50 * Math.PI - 0.07, sx: 44, sy: 70, rot: 0, dx: 0, dy: 0, w: 11 },
      b: { t0: -0.50 * Math.PI + 0.07, t1: 0.50 * Math.PI - 0.07, sx: 44, sy: 70, rot: 0, dx: 0, dy: 0, w: 11 } }
  ];

  /* Cream, warming a step per value. Small enough that nobody consciously
     notices; large enough that Future does not feel like Connection. */
  var TINTS = ['#FAF7F1', '#FAF5EC', '#F8F2E7', '#F6EFE2', '#F4EDE0'];

  /* ===========================================================================
     V1 · HERO — the two strands enter
     =========================================================================== */
  function heroStrands() {
    var svg = document.getElementById('vw-hero-svg');
    if (!svg) return;

    var left = svg.querySelector('.vw-hero-a');
    var right = svg.querySelector('.vw-hero-b');
    if (!left || !right) return;

    SITE.onResize(function () {
      var r = svg.getBoundingClientRect();
      var w = Math.max(r.width, 1), h = Math.max(r.height, 1);
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);

      /* Each strand sits mostly off its own edge of the screen, so only the
         inner shoulder of a big, bold loop is visible: the page opens with two
         things reaching for each other and not touching. Keeping the loops
         off-canvas is also what stops the shape from cutting across the
         headline — the mark is a presence here, never a scribble over type. */
      var boxH = Math.min(h * 0.95, 760);
      var top = h / 2 - boxH / 2;
      left.setAttribute('d', DEO.lemniscate(
        { x: -w * 0.62, y: top, w: w * 0.88, h: boxH }, { open: 0.24, steps: 130 }));
      right.setAttribute('d', DEO.lemniscate(
        { x: w * 0.74, y: top, w: w * 0.88, h: boxH }, { open: 0.24, steps: 130 }));

      if (REDUCE) return;
      [left, right].forEach(function (p) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len;
        /* Only prime the draw the first time; re-measuring on resize must not
           replay the animation under the visitor. */
        if (!p.dataset.drawn) {
          p.style.strokeDashoffset = len;
          p.dataset.drawn = '1';
          requestAnimationFrame(function () {
            p.style.transition = 'stroke-dashoffset 2600ms cubic-bezier(.22,1,.36,1)';
            p.style.strokeDashoffset = '0';
          });
        } else {
          p.style.strokeDashoffset = '0';
        }
      });
    });
  }

  /* ===========================================================================
     V1 · THE STAGE
     =========================================================================== */
  function stage() {
    var track = document.getElementById('vw-track');
    var stageEl = document.getElementById('vw-stage');
    var pathA = document.getElementById('vw-thread-a');
    var pathB = document.getElementById('vw-thread-b');
    if (!track || !stageEl || !pathA || !pathB) return;

    var values = Array.prototype.slice.call(track.querySelectorAll('.vw-value'));
    var railLinks = Array.prototype.slice.call(document.querySelectorAll('.vw-rail a'));
    var ghost = document.getElementById('vw-ghost');
    var copy = document.getElementById('vw-copy');
    if (!values.length) return;

    /* Draw the closing state immediately, so the figure is never empty — it is
       what a visitor with JavaScript disabled sees too. */
    render(STATES[4].a, STATES[4].b);

    /* The sticky stage is a scroll-driven narrative. Under reduced motion, or
       on a viewport too short to hold a headline and a figure at once, the page
       keeps its stacked editorial form instead — which says the same thing. */
    var canStage = !REDUCE && window.innerHeight >= 520;
    if (!canStage) {
      values.forEach(function (v) { v.classList.add('is-current'); });
      return;
    }
    document.documentElement.classList.add('stage-on');

    var current = -1;

    /* The tallest value decides the stage's copy height, so the figure beside
       it never shifts when the text changes — including after a switch to
       German, where every line is longer. */
    SITE.onResize(function () {
      if (!copy) return;
      copy.style.minHeight = '';
      var tallest = 0;
      values.forEach(function (v) { tallest = Math.max(tallest, v.offsetHeight); });
      if (tallest) copy.style.minHeight = tallest + 'px';
    });

    SITE.onScroll(function (y) {
      var rect = track.getBoundingClientRect();
      var top = rect.top + y;
      var span = track.offsetHeight - stageEl.offsetHeight;
      if (span <= 0) return;

      var p = SITE.clamp((y - top) / span, 0, 1);

      /* p across five values: i is the value being read, t how far through it.
         The last value must not fall off the end at p === 1. */
      var f = p * STATES.length;
      var i = Math.min(Math.floor(f), STATES.length - 1);
      var t = SITE.clamp(f - i, 0, 1);

      /* Hold each value still for its first third, then travel to the next.
         Without the hold, the shape never rests and nothing feels arrived at. */
      var travel = SITE.easeInOut(SITE.clamp((t - 0.34) / 0.66, 0, 1));
      var next = STATES[Math.min(i + 1, STATES.length - 1)];

      render(mixPrm(STATES[i].a, next.a, travel), mixPrm(STATES[i].b, next.b, travel));
      stageEl.style.setProperty('--t', t.toFixed(3));

      if (i !== current) {
        current = i;
        values.forEach(function (v, n) {
          v.classList.toggle('is-current', n === i);
          v.classList.toggle('is-past', n < i);
        });
        railLinks.forEach(function (a, n) { a.classList.toggle('is-active', n === i); });
        stageEl.style.setProperty('--stage-tint', TINTS[i]);
        if (ghost) ghost.textContent = '0' + (i + 1);
      }
    });

    /* Rail links are real anchors, so they work without JavaScript. With it,
       they scroll to the point in the track where that value is centred. */
    railLinks.forEach(function (a, n) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var span = track.offsetHeight - stageEl.offsetHeight;
        var top = track.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: top + span * ((n + 0.42) / STATES.length),
          behavior: REDUCE ? 'auto' : 'smooth'
        });
      });
    });

    function render(a, b) {
      pathA.setAttribute('d', DEO.toPath(strandPoints(a)));
      pathB.setAttribute('d', DEO.toPath(strandPoints(b)));
      pathA.setAttribute('stroke-width', a.w.toFixed(2));
      pathB.setAttribute('stroke-width', b.w.toFixed(2));
    }
  }

  /* ===========================================================================
     V1 · THE PAYOFF — the drawn strands hand over to the real mark
     ---------------------------------------------------------------------------
     The curve the whole page has been building does not simply stop: scrolling
     through this section cross-fades it into the actual DEO logo, in its own
     three colours, at the size the identity deserves.
     =========================================================================== */
  function payoff() {
    var frame = document.getElementById('vw-payoff');
    var svg = document.getElementById('vw-payoff-svg');
    if (!frame || !svg) return;

    var strokeG = document.getElementById('vw-payoff-stroke');
    var stroke = strokeG && strokeG.querySelector('path');
    var chorus = Array.prototype.slice.call(document.querySelectorAll('.vw-chorus li'));

    /* The finished mark, built from the real outlines rather than approximated. */
    var markSlot = document.getElementById('vw-payoff-mark');
    if (markSlot && !markSlot.firstChild) {
      markSlot.appendChild(DEO.markGroup({ classPrefix: 'vw-mark' }));
    }

    /* The stroke is state 05: the complete curve, fitted to the mark's own
       artboard, so the two layers sit exactly on top of each other. */
    if (stroke) {
      stroke.setAttribute('d', DEO.lemniscate(
        { x: 14, y: 12, w: 128, h: 64 }, { open: 0.055, steps: 200 }));
    }

    if (REDUCE) {
      frame.style.setProperty('--handover-in', 1);
      frame.style.setProperty('--handover-out', 0);
      chorus.forEach(function (li) { li.classList.add('is-lit'); });
      return;
    }

    SITE.onScroll(function (y) {
      var rect = frame.getBoundingClientRect();
      var vh = window.innerHeight;
      /* 0 as the frame reaches the lower third, 1 once it is comfortably
         centred — the handover happens while the mark is fully in view. */
      var p = SITE.clamp((vh * 0.82 - rect.top) / (vh * 0.5), 0, 1);

      frame.style.setProperty('--handover-in', p.toFixed(3));
      frame.style.setProperty('--handover-out', (1 - p).toFixed(3));

      var lit = Math.round(p * chorus.length);
      chorus.forEach(function (li, n) { li.classList.toggle('is-lit', n < lit); });
    });
  }

  /* ===========================================================================
     V2 · THE CONSTELLATION
     ---------------------------------------------------------------------------
     One curve, five nodes, no prescribed order. The nodes are real buttons
     placed over the drawing, so the field is operable from the keyboard and
     each value is announced by name; the written list below carries the same
     content in reading order and is the whole page when JavaScript is off.
     =========================================================================== */
  function constellation() {
    var stageEl = document.getElementById('vc-stage');
    var svg = document.getElementById('vc-svg');
    var curve = document.getElementById('vc-curve');
    var panel = document.getElementById('vc-panel');
    if (!stageEl || !svg || !curve || !panel) return;

    var sources = Array.prototype.slice.call(document.querySelectorAll('.vc-written .vc-body'));
    var names = Array.prototype.slice.call(document.querySelectorAll('.vc-written .vc-name'));
    var numbers = Array.prototype.slice.call(document.querySelectorAll('.vc-written .vw-num'));
    if (!sources.length) return;

    var COUNT = sources.length;
    var SAMPLES = COUNT * 90;
    var COLOURS = ['#DB1F26', '#E85C1E', '#F58220', '#FFA400', '#FFCE03'];

    var nodes = [];
    var arcs = [];
    var active = -1;
    var points = [];

    /* Two input models, decided once and never mixed:
         a real pointer  → hovering a node reveals its card, leaving hides it
         a touch screen  → tapping a node reveals its card, tapping another
                           switches, tapping the same one or the background
                           puts it away
       Nothing is "committed" by a click on a mouse any more, so a card can
       never be left hanging open behind the visitor. */
    var HOVERS = window.matchMedia('(hover: hover) and (pointer: fine)');

    /* The grace period is what makes the node and its card behave as one
       target: the pointer has to cross open stage to reach the card, and
       hiding the instant it leaves the node would close it mid-journey. */
    var GRACE = 420;
    var hideTimer = null;
    /* Set for the length of one Escape press, so returning focus to the node
       does not immediately reopen what the visitor just dismissed. */
    var dismissed = false;

    function cancelHide() {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    }

    function scheduleHide() {
      cancelHide();
      hideTimer = setTimeout(function () { hideTimer = null; select(-1); }, GRACE);
    }

    /* Build the arcs first so they paint under the nodes. */
    for (var i = 0; i < COUNT; i++) {
      var arc = document.createElementNS(DEO.SVGNS, 'path');
      arc.setAttribute('class', 'vc-arc');
      arc.setAttribute('stroke', COLOURS[i % COLOURS.length]);
      svg.appendChild(arc);
      arcs.push(arc);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vc-node';
      btn.setAttribute('aria-pressed', 'false');
      /* The value's own text is what a screen reader gets from the button, so
         the visual panel never has to be read twice. */
      btn.setAttribute('aria-describedby', sources[i].id);
      btn.innerHTML = '<i aria-hidden="true"></i><b aria-hidden="true"></b>';
      btn.appendChild(labelFor(names[i], i));
      stageEl.appendChild(btn);
      nodes.push(btn);

      bind(btn, i);
    }

    function labelFor(nameEl, n) {
      var sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = (nameEl ? nameEl.textContent : 'Value ' + (n + 1));
      return sr;
    }

    function bind(btn, n) {
      btn.addEventListener('pointerenter', function (e) {
        /* A touch generates pointerenter too, immediately before the click —
           ignoring it here is what keeps the two models from fighting. */
        if (e.pointerType === 'touch' || !HOVERS.matches) return;
        cancelHide();
        select(n);
      });

      btn.addEventListener('pointerleave', function (e) {
        if (e.pointerType === 'touch' || !HOVERS.matches) return;
        scheduleHide();
      });

      btn.addEventListener('click', function () {
        /* With a mouse the card is already open from the hover; a click must
           not toggle it shut. On a touch screen the tap is the whole
           interaction: same node closes, a different node switches. */
        if (HOVERS.matches) { cancelHide(); select(n); return; }
        select(active === n ? -1 : n);
      });

      /* Keyboard follows focus, with the same grace on the way out. */
      btn.addEventListener('focus', function () {
        if (dismissed) return;      // Escape put the card away; focus must not reopen it
        cancelHide();
        select(n);
      });
      btn.addEventListener('blur', function () { scheduleHide(); });
    }

    /* The card is the second half of the node's hover target. */
    panel.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'touch' || !HOVERS.matches) return;
      cancelHide();
    });
    panel.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'touch' || !HOVERS.matches) return;
      scheduleHide();
    });

    /* Touch only: a tap anywhere else puts the card away. */
    document.addEventListener('click', function (e) {
      if (HOVERS.matches || active < 0) return;
      if (e.target.closest('.vc-node') || e.target.closest('#vc-panel')) return;
      select(-1);
    });

    function select(n) {
      if (n === active) { hintOff(); return; }   // re-entering the same node changes nothing
      active = n;
      nodes.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === n)); });
      arcs.forEach(function (a, k) { a.classList.toggle('is-lit', k === n); });
      panel.classList.toggle('is-open', n >= 0);
      if (n >= 0) {
        /* Open away from the chosen node: left half selected, panel goes right. */
        panel.classList.toggle('is-right', parseFloat(nodes[n].style.left) < stageEl.clientWidth / 2);
        syncPanel();
      }
      hintOff();
    }

    /* The panel mirrors the written list rather than duplicating its words in
       the markup — which also means it follows the EN/DE toggle for free, as
       long as it is re-synced whenever the language changes. */
    function syncPanel() {
      if (active < 0) return;
      panel.innerHTML = (numbers[active] ? numbers[active].outerHTML : '') +
                        sources[active].innerHTML;
    }

    /* Node captions are copies of the written list's headings, so they have to
       be re-copied whenever the language changes. */
    function syncLabels() {
      nodes.forEach(function (btn, n) {
        var text = names[n] ? names[n].textContent : String(n + 1);
        btn.querySelector('b').textContent = text;
        btn.querySelector('.sr-only').textContent = text;
      });
    }

    function hintOff() {
      if (nodes[0]) nodes[0].classList.remove('is-hinting');
    }

    /* Escape closes, matching every other dismissible thing on the site. */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && active >= 0) {
        var was = nodes[active];
        cancelHide();
        select(-1);
        dismissed = true;
        if (was) was.focus();       // focus() is synchronous, so the flag covers it
        dismissed = false;
      }
    });

    SITE.onResize(function () {
      var r = stageEl.getBoundingClientRect();
      var w = Math.max(Math.round(r.width), 1);
      var h = Math.max(Math.round(r.height), 1);

      /* The viewBox is set in CSS pixels, so a point on the curve is already a
         position for a node — no coordinate conversion, nothing to drift. */
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);

      /* Portrait viewports get the mark stood on end rather than a squashed
         version of the landscape one. */
      var upright = h > w * 1.15;

      /* Nudged left of dead centre, and only when lying down. Two reasons:
         the figure's ink sits left of its own bounding box, because the right
         loop is open and that side is largely negative space; and the page's
         type is all flush to the left of this same container, so a
         bounding-box-centred mark reads as indented from that edge. Standing
         upright the figure is symmetrical about its own middle and needs none
         of this. A share of the stage, never a pixel count, so it holds at
         every width. */
      var NUDGE = upright ? 0 : 0.035;
      var box = upright
        ? { x: w * 0.20, y: h * 0.10, w: w * 0.60, h: h * 0.80 }
        : { x: w * (0.09 - NUDGE), y: h * 0.14, w: w * 0.82, h: h * 0.72 };

      points = DEO.lemniscatePoints(box, {
        steps: SAMPLES, open: 0.05, rotate: upright ? Math.PI / 2 : 0
      });
      curve.setAttribute('d', DEO.toPath(points));

      var per = Math.floor(points.length / COUNT);
      for (var n = 0; n < COUNT; n++) {
        /* Arcs overlap by one sample so the lit segments join cleanly. */
        arcs[n].setAttribute('d', DEO.toPath(points.slice(n * per, (n + 1) * per + 1)));
        var mid = points[Math.min(Math.floor((n + 0.5) * per), points.length - 1)];
        nodes[n].style.left = mid[0] + 'px';
        nodes[n].style.top = mid[1] + 'px';
      }

      /* SITE.onResize also fires after an EN/DE switch, which is exactly when
         the copied labels and the open panel have gone stale. */
      syncLabels();
      syncPanel();
    });

    /* -------------------------------------------------------------------
       THE TRAVELLING LIGHT
       -------------------------------------------------------------------
       The grey curve stays exactly as it is and remains the permanent base.
       Over it runs one bold, glowing stroke that never stops: a dashed
       segment of the figure itself, so the light is physically confined to
       the curve. It threads every node, crosses the middle and carries on
       into the other loop because that is simply where the path goes next.

       The drawn curve is open at the right, the way the DEO mark is. Left
       open, the light would vanish at one tip and reappear at the other, so
       the light's own path continues around that mouth on the tangents of
       the two ends — the only stretch it travels where the grey does not.
       The mark is never redrawn; only the light closes the loop.

       The red-orange-gold ramp is re-anchored to the segment's own chord on
       every frame, so the colour travels WITH the light instead of the light
       sliding through a ramp pinned to the stage.
       ------------------------------------------------------------------- */
    var FLOW_SEG = 0.40;      // share of the loop the light occupies
    var FLOW_MS = 9000;       // one circuit
    var FLOW_N = 44;          // sub-strokes the band is built from
    /* The DEO ramp, tail to head. A gradient cannot do this job: an SVG
       gradient runs along a straight axis, and the band is a long curve, so
       everything bulging away from that axis falls outside the ramp and gets
       the padded end stop. Colour has to follow ARC LENGTH instead, which is
       what the sub-strokes below are for. */
    /* The tail starts near the ground colour and warms into the ramp. The fade
       is carried by the COLOUR, not by opacity: neighbouring slices overlap so
       their round caps meet without seams, and two different opacities in that
       overlap would blend twice and show as banding down the whole tail. */
    var FLOW_RAMP = ['#1E1512', '#7E1418', '#DB1F26', '#E85C1E', '#F58220', '#FFA400', '#FFCE03'];

    function rampAt(u) {
      var x = Math.max(0, Math.min(1, u)) * (FLOW_RAMP.length - 1);
      var i = Math.min(Math.floor(x), FLOW_RAMP.length - 2), t = x - i;
      function ch(h, k) { return parseInt(h.substr(1 + k * 2, 2), 16); }
      var a = FLOW_RAMP[i], b = FLOW_RAMP[i + 1], out = '#';
      for (var k = 0; k < 3; k++) {
        var v = Math.round(ch(a, k) + (ch(b, k) - ch(a, k)) * t);
        out += (v < 16 ? '0' : '') + v.toString(16);
      }
      return out;
    }

    /* Above the base, below the arcs: a value selected by hand still wins. */
    var flowGlow = document.createElementNS(DEO.SVGNS, 'path');
    flowGlow.setAttribute('class', 'vc-flow-glow');
    svg.insertBefore(flowGlow, curve.nextSibling);

    var segs = [], after = flowGlow;
    for (var s2 = 0; s2 < FLOW_N; s2++) {
      var sp = document.createElementNS(DEO.SVGNS, 'path');
      sp.setAttribute('class', 'vc-flow');
      var u = s2 / (FLOW_N - 1);
      sp.setAttribute('stroke', rampAt(u));
      svg.insertBefore(sp, after.nextSibling);
      after = sp;
      segs.push(sp);
    }

    var FLOW_LEN = 0, head = 0, flowRaf = 0, flowT0 = 0, flowSeen = false;

    /* Continue the curve past its two open ends, along their own tangents,
       so the light has somewhere to go instead of jumping the gap. */
    function closedPath(pts) {
      var n = pts.length;
      if (n < 4) return DEO.toPath(pts);
      var a = pts[n - 1], a1 = pts[n - 2], b = pts[0], b1 = pts[1];
      var ta = [a[0] - a1[0], a[1] - a1[1]], tb = [b1[0] - b[0], b1[1] - b[1]];
      var na = Math.hypot(ta[0], ta[1]) || 1, nb = Math.hypot(tb[0], tb[1]) || 1;
      var k = Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.62;
      return DEO.toPath(pts) +
        'C' + (a[0] + ta[0] / na * k) + ' ' + (a[1] + ta[1] / na * k) +
        ' ' + (b[0] - tb[0] / nb * k) + ' ' + (b[1] - tb[1] / nb * k) +
        ' ' + b[0] + ' ' + b[1] + 'Z';
    }

    /* Each sub-stroke shows one slice of the band, so the colour steps along
       the CURVE rather than along a straight axis — every part of the band is
       painted no matter how far it bends away from its own endpoints. Only a
       dash offset is written per stroke per frame, so nothing re-lays-out. */
    function paintFlow() {
      if (!FLOW_LEN) return;
      var band = FLOW_LEN * FLOW_SEG;
      var slice = band / FLOW_N;
      var at = head * FLOW_LEN;
      for (var i = 0; i < FLOW_N; i++) {
        // i = 0 is the tail, i = FLOW_N-1 the head
        segs[i].style.strokeDashoffset = -(at - band + i * slice);
      }
      flowGlow.style.strokeDashoffset = -(at - band);
    }

    /* Motion off: rather than parking the band on one side of the figure,
       spread the whole ramp evenly around the path. The mark reads as fully
       DEO-coloured and completely still. */
    function restFlow() {
      if (!FLOW_LEN) return;
      var slice = FLOW_LEN / FLOW_N;
      for (var i = 0; i < FLOW_N; i++) {
        segs[i].style.strokeDasharray = (slice * 1.35) + ' ' + (FLOW_LEN - slice * 1.35);
        segs[i].style.strokeDashoffset = -(i * slice);
        /* Skip the ramp's dark head-start: with nothing moving, a stretch that
           fades into the background would just look like a gap in the mark. */
        segs[i].setAttribute('stroke', rampAt(0.3 + 0.7 * (i / (FLOW_N - 1))));
      }
      flowGlow.style.strokeDasharray = 'none';
      flowGlow.style.strokeDashoffset = 0;
    }

    function flowFrame(now) {
      if (!flowT0) flowT0 = now - head * FLOW_MS;
      head = ((now - flowT0) / FLOW_MS) % 1;
      paintFlow();
      flowRaf = requestAnimationFrame(flowFrame);
    }

    /* A loop repainting a figure nobody is looking at is just battery. */
    function flowPump() {
      var want = flowSeen && !REDUCE && FLOW_LEN > 0;
      if (want && !flowRaf) { flowT0 = 0; flowRaf = requestAnimationFrame(flowFrame); }
      else if (!want && flowRaf) { cancelAnimationFrame(flowRaf); flowRaf = 0; }
    }

    /* Six nodes on a figure this tight put two of them either side of the
       crossing, close enough that their captions overlap once the mark stands
       upright. Rather than hard-code which pair and at what width, measure:
       any two captions that intersect get the upper one lifted above its own
       dot. That also covers the German words, which are longer. */
    function resolveLabels() {
      nodes.forEach(function (n) { n.classList.remove('label-above'); });
      for (var pass = 0; pass < 2; pass++) {
        var r = nodes.map(function (n) { return n.querySelector('b').getBoundingClientRect(); });
        var moved = false;
        for (var i = 0; i < nodes.length; i++) {
          for (var j = i + 1; j < nodes.length; j++) {
            var a = r[i], c2 = r[j];
            if (!(a.left < c2.right - 2 && c2.left < a.right - 2 &&
                  a.top < c2.bottom - 2 && c2.top < a.bottom - 2)) continue;
            // Lift whichever sits higher, so each caption stays with its dot
            var up = parseFloat(nodes[i].style.top) <= parseFloat(nodes[j].style.top) ? i : j;
            if (!nodes[up].classList.contains('label-above')) {
              nodes[up].classList.add('label-above');
              moved = true;
            }
          }
        }
        if (!moved) break;
      }
    }

    /* Registered after the handler above, so `points` is already current. */
    SITE.onResize(function () {
      resolveLabels();
      if (!points.length) return;
      var d = closedPath(points);
      flowGlow.setAttribute('d', d);
      for (var i = 0; i < FLOW_N; i++) segs[i].setAttribute('d', d);

      FLOW_LEN = segs[0].getTotalLength();
      if (REDUCE) { restFlow(); return; }

      var band = FLOW_LEN * FLOW_SEG;
      var slice = band / FLOW_N;
      // Each slice overlaps the next slightly, so no seams show between them.
      for (var j = 0; j < FLOW_N; j++) {
        segs[j].style.strokeDasharray = (slice * 1.28) + ' ' + (FLOW_LEN - slice * 1.28);
      }
      flowGlow.style.strokeDasharray = band + ' ' + (FLOW_LEN - band);

      paintFlow();          // hold position across a resize or a language switch
      flowPump();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        flowSeen = es[0].isIntersecting;
        flowPump();
      }, { rootMargin: '140px 0px' }).observe(stageEl);
    } else {
      flowSeen = true;
      flowPump();
    }

    if (!REDUCE && nodes[0]) nodes[0].classList.add('is-hinting');
  }

  heroStrands();
  stage();
  payoff();
  constellation();
})();
