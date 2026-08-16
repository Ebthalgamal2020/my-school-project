/* =============================================================================
   DEO Kairo — interactions
   The `js` class is set by an inline script in <head>, before first paint,
   so CSS knows JavaScript is alive without a flash of hidden content.
   Each feature is its own function; one failing never stops the rest.
   ============================================================================= */

const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ---- 1. Mobile menu ------------------------------------------------------ */
function initMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
}


/* ---- 2. Scroll-driven chrome --------------------------------------------
   Header state, progress bar, and the back-to-top button all depend on
   scroll position, so they share ONE listener throttled to a frame.
   -------------------------------------------------------------------------- */
function initScrollChrome() {
  const header = document.getElementById('site-header');
  const bar = document.getElementById('scroll-bar');
  const toTop = document.getElementById('to-top');
  let ticking = false;

  function update() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    if (header) header.classList.toggle('is-scrolled', y > 20);
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (toTop) toTop.classList.toggle('is-shown', y > 600);

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });

  window.addEventListener('resize', update, { passive: true });
  update();

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
      // Send focus somewhere sensible instead of leaving it on a hidden button.
      const skip = document.querySelector('.skip-link');
      if (skip) skip.focus({ preventScroll: true });
    });
  }
}


/* ---- 3. Scroll reveal ----------------------------------------------------
   One observer for every [data-reveal]. Stagger comes from the --i custom
   property in the markup, applied as a CSS transition-delay.
   -------------------------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (REDUCE || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);          // reveal once, then stop watching
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach((el) => io.observe(el));
}


/* ---- 4. Hero entrance ---------------------------------------------------- */
function initHero() {
  const parts = document.querySelectorAll('.hero-anim');
  if (!parts.length) return;

  if (REDUCE) { parts.forEach((el) => el.classList.add('is-in')); return; }

  // Next frame, so the browser paints the "before" state first and the
  // animation actually runs instead of being skipped.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => parts.forEach((el) => el.classList.add('is-in')));
  });
}


/* ---- 5. Counting stats ---------------------------------------------------
   The final number lives in the HTML so it survives a JS failure; we only
   reset to zero once we know the animation will run.
   -------------------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length || REDUCE || !('IntersectionObserver' in window)) return;

  counters.forEach((el) => { el.textContent = '0'; });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => io.observe(el));
}

function countUp(el) {
  const target = Number(el.dataset.countTo) || 0;
  const duration = 1400;
  let start = null;

  function tick(now) {
    if (start === null) start = now;
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);       // easeOutCubic
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}


/* ---- 6. Hero pointer parallax -------------------------------------------
   Writes normalised -1..1 offsets to CSS variables; the CSS does the moving.
   -------------------------------------------------------------------------- */
function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero || REDUCE) return;
  if (!window.matchMedia('(hover: hover)').matches) return;  // skip on touch

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  });

  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--px', 0);
    hero.style.setProperty('--py', 0);
  });
}


/* ---- 7. Button ripple ---------------------------------------------------- */
function initRipple() {
  if (REDUCE) return;

  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const r = btn.getBoundingClientRect();
      const dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.left = (e.clientX - r.left) + 'px';
      dot.style.top = (e.clientY - r.top) + 'px';
      btn.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove());
    });
  });
}


/* ---- 8. Language toggle (EN / DE) ---------------------------------------
   Fades the translatable text out, swaps it, fades back in.
   -------------------------------------------------------------------------- */
function initLang() {
  const toggle = document.getElementById('lang-toggle');
  if (!toggle) return;

  const nodes = document.querySelectorAll('[data-en]');
  let lang = 'en';

  function apply(next) {
    nodes.forEach((el) => {
      const text = el.getAttribute('data-' + next);
      if (text !== null) el.innerHTML = text;    // values are author-written markup
    });
    document.documentElement.setAttribute('lang', next);

    toggle.querySelector('.lang-current').textContent = next.toUpperCase();
    toggle.querySelector('.lang-other').textContent = next === 'en' ? 'DE' : 'EN';
    toggle.setAttribute('aria-label',
      next === 'en' ? 'Switch language to German' : 'Zur englischen Sprache wechseln');
  }

  toggle.addEventListener('click', () => {
    lang = lang === 'en' ? 'de' : 'en';

    if (REDUCE) { apply(lang); return; }

    const root = document.documentElement;
    root.classList.add('lang-switching');        // fade out
    setTimeout(() => {
      apply(lang);
      root.classList.remove('lang-switching');   // fade back in
    }, 180);
  });
}


/* ---- 9. Visit form (demo only — nothing is sent) ------------------------- */
function initForm() {
  const form = document.getElementById('visit-form');
  const status = document.getElementById('form-status');
  const email = document.getElementById('email');
  const error = document.getElementById('email-error');
  if (!form || !email) return;

  const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = email.value.trim();

    if (!looksLikeEmail(value)) {
      email.setAttribute('aria-invalid', 'true');
      error.textContent = 'Please enter a valid email address.';
      status.textContent = '';
      email.focus();
      return;
    }

    email.removeAttribute('aria-invalid');
    error.textContent = '';
    status.textContent = 'Thanks — we\'ll be in touch within one working day.';
    form.reset();
  });

  email.addEventListener('input', () => {
    if (email.getAttribute('aria-invalid') === 'true') {
      email.removeAttribute('aria-invalid');
      error.textContent = '';
    }
  });
}


/* ---- start --------------------------------------------------------------- */
initMenu();
initScrollChrome();
initReveal();
initHero();
initCounters();
initParallax();
initRipple();
initLang();
initForm();
