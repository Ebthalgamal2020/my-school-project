/* ==========================================================================
   Meridian — interactions
   Five small, independent features. Each is wrapped in its own function so
   one breaking never stops the others.
   ========================================================================== */

// Does the visitor's OS ask for reduced motion? Check once, respect everywhere.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* --------------------------------------------------------------------------
   1. MOBILE NAVIGATION
   The button's aria-expanded attribute is the single source of truth —
   CSS reads it for the X animation, screen readers read it aloud.
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-links');
  if (!toggle || !menu) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    menu.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setOpen(!isOpen);
  });

  // Tapping a link should close the menu, or it covers the section you jumped to.
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  // Escape closes the menu and returns focus to the button — expected keyboard behaviour.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  // If the window is resized up to desktop while open, reset to a clean state.
  window.matchMedia('(min-width: 821px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}


/* --------------------------------------------------------------------------
   2. STICKY HEADER BORDER
   Adds a hairline under the header only after you start scrolling.
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 12);

  update();
  // passive:true tells the browser we won't call preventDefault, so it can
  // keep scrolling smooth instead of waiting on our handler.
  window.addEventListener('scroll', update, { passive: true });
}


/* --------------------------------------------------------------------------
   3. BUTTON RIPPLE
   A <span> is inserted at the click point and animated by CSS (.ripple).
   -------------------------------------------------------------------------- */
function initRipple() {
  if (prefersReducedMotion) return;

  document.querySelectorAll('.btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      const rect = button.getBoundingClientRect();
      const circle = document.createElement('span');

      circle.className = 'ripple';
      circle.style.left = `${event.clientX - rect.left}px`;
      circle.style.top = `${event.clientY - rect.top}px`;

      button.appendChild(circle);
      // Remove it when the CSS animation finishes, so ripples don't pile up.
      circle.addEventListener('animationend', () => circle.remove());
    });
  });
}


/* --------------------------------------------------------------------------
   4. SCROLL REVEAL + COUNTERS
   IntersectionObserver tells us when an element enters the viewport. It is
   far cheaper than listening to every scroll event and measuring positions.
   -------------------------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');

  // No support (or motion turned off)? Show everything immediately.
  // The HTML already contains the final numbers, so counters need no work here.
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);   // animate once, then stop watching
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px',      // trigger slightly before it's fully in view
  });

  items.forEach((el) => observer.observe(el));

  // Hero numbers count up the first time they're seen. The final value lives
  // in the HTML (so it survives a JS failure); we reset to 0 only now that we
  // know the animation will actually run.
  const counters = document.querySelectorAll('.counter');
  counters.forEach((el) => { el.textContent = '0'; });

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => counterObserver.observe(el));
}

function animateCount(el) {
  const target = Number(el.dataset.countTo) || 0;
  const duration = 1100;
  let startTime = null;

  function tick(now) {
    if (startTime === null) startTime = now;
    const progress = Math.min((now - startTime) / duration, 1);
    // easeOutCubic — fast at first, gently settling. Feels less mechanical.
    const eased = 1 - Math.pow(1 - progress, 3);

    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}


/* --------------------------------------------------------------------------
   5. HERO POINTER GLOW
   Moves a decorative radial gradient toward the cursor via CSS variables.
   -------------------------------------------------------------------------- */
function initHeroGlow() {
  const hero = document.querySelector('.hero');
  const glow = document.querySelector('.hero-glow');
  if (!hero || !glow || prefersReducedMotion) return;

  // Skip on touch devices — there's no hovering pointer to follow.
  if (!window.matchMedia('(hover: hover)').matches) return;

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    // Offset from the hero's centre, damped to 30% so the glow drifts subtly.
    const x = (event.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (event.clientY - rect.top) * 0.3 + 120;

    glow.style.setProperty('--glow-x', `${x}px`);
    glow.style.setProperty('--glow-y', `${y}px`);
  });
}


/* --------------------------------------------------------------------------
   6. SIGN-UP FORM
   Demo only: validates the email and shows a message. There is no server,
   so nothing is actually sent or stored.
   -------------------------------------------------------------------------- */
function initForm() {
  const form = document.querySelector('#signup-form');
  const status = document.querySelector('#form-status');
  if (!form || !status) return;

  const input = form.querySelector('#email');

  form.addEventListener('submit', (event) => {
    event.preventDefault();           // stop the page reloading
    const value = input.value.trim();

    // Deliberately loose: "something @ something . something".
    // Strict email regexes reject valid addresses far more often than they help.
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

    if (!looksLikeEmail) {
      input.setAttribute('aria-invalid', 'true');
      status.textContent = 'Please enter a valid email address.';
      status.className = 'form-status is-error';
      input.focus();
      return;
    }

    input.removeAttribute('aria-invalid');
    status.textContent = `Thanks! We'll email ${value} when the beta opens.`;
    status.className = 'form-status is-success';
    form.reset();
  });

  // Clear the error as soon as they start fixing it.
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') {
      input.removeAttribute('aria-invalid');
      status.textContent = '';
      status.className = 'form-status';
    }
  });
}


/* --------------------------------------------------------------------------
   START
   -------------------------------------------------------------------------- */
initMobileNav();
initHeaderScroll();
initRipple();
initReveal();
initHeroGlow();
initForm();
