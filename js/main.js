// Progressive enhancement flag — CSS uses .js to know JS is active.
// If this line never runs (JS disabled/blocked), nothing on the page hides.
document.documentElement.classList.add('js');

// ---- Mobile menu ----
const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu after clicking a link (mobile)
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---- Scroll reveal for pillar cards ----
const revealTargets = document.querySelectorAll('.pillar-card');

if ('IntersectionObserver' in window && revealTargets.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => observer.observe(el));
} else {
  // Fallback: just show them
  revealTargets.forEach(el => el.classList.add('reveal'));
}

// ---- Language toggle (EN / DE) ----
const langToggle = document.getElementById('lang-toggle');
const translatable = document.querySelectorAll('[data-en]');
let currentLang = 'en';

function applyLanguage(lang) {
  translatable.forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text !== null) {
      el.innerHTML = text;
    }
  });
  document.documentElement.setAttribute('lang', lang);
}

if (langToggle) {
  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'de' : 'en';
    applyLanguage(currentLang);

    const currentSpan = langToggle.querySelector('.lang-current');
    const otherSpan = langToggle.querySelector('.lang-other');
    currentSpan.textContent = currentLang.toUpperCase();
    otherSpan.textContent = currentLang === 'en' ? 'DE' : 'EN';
    langToggle.setAttribute(
      'aria-label',
      currentLang === 'en' ? 'Switch language to German' : 'Zur englischen Sprache wechseln'
    );
  });
}

// ---- Visit form validation ----
const form = document.getElementById('visit-form');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('email-error');
const formStatus = document.getElementById('form-status');

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailValue = emailInput.value.trim();
    const valid = isValidEmail(emailValue);

    if (!valid) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailError.textContent = 'Please enter a valid email address.';
      emailInput.focus();
      formStatus.textContent = '';
      return;
    }

    emailInput.removeAttribute('aria-invalid');
    emailError.textContent = '';
    formStatus.textContent = 'Thanks — we\'ll be in touch within one working day.';
    form.reset();
  });
}
