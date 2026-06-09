// THETRIPBEATS — SCRIPTS

// =============================================
// DARK / LIGHT MODE
// =============================================
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('ttb-theme', theme);
}

// Load saved preference; default to light
const savedTheme = localStorage.getItem('ttb-theme') ?? 'light';
applyTheme(savedTheme);

themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// =============================================
// HERO SLIDESHOW
// =============================================
const slides     = Array.from(document.querySelectorAll('.hero-slide'));
const dots       = Array.from(document.querySelectorAll('.hero-dot'));
const slideLabel = document.getElementById('hero-slide-label');
const INTERVAL   = 4800; // ms between transitions
const FADE_OUT   = 1400; // ms for leave fade (must match CSS .leaving transition)

let currentIndex = 0;
let slideshowTimer = null;
let isTransitioning = false;

function goToSlide(next) {
  if (isTransitioning || next === currentIndex) return;
  isTransitioning = true;

  const prev = currentIndex;
  currentIndex = next;

  // Update dots
  dots.forEach((d, i) => {
    d.classList.toggle('active', i === currentIndex);
    d.setAttribute('aria-selected', String(i === currentIndex));
  });

  // Update label
  if (slideLabel) {
    const label = slides[currentIndex].dataset.label ?? '';
    slideLabel.style.opacity = '0';
    setTimeout(() => {
      slideLabel.textContent = label;
      slideLabel.style.opacity = '1';
    }, 400);
  }

  // Bring next slide in
  slides[next].classList.add('active');

  // Fade out previous slide after a brief overlap
  setTimeout(() => {
    slides[prev].classList.add('leaving');
    slides[prev].classList.remove('active');
  }, 80);

  // Clean up 'leaving' class after the CSS transition finishes
  setTimeout(() => {
    slides[prev].classList.remove('leaving');
    isTransitioning = false;
  }, FADE_OUT + 120);
}

function startSlideshow() {
  slideshowTimer = setTimeout(() => {
    goToSlide((currentIndex + 1) % slides.length);
    startSlideshow();
  }, INTERVAL);
}

function resetSlideshow() {
  if (slideshowTimer) clearTimeout(slideshowTimer);
  startSlideshow();
}

// Manual dot clicks
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    goToSlide(i);
    resetSlideshow();
  });
});

// Pause on hover / resume on leave
const heroBg = document.querySelector('.hero-bg');
heroBg?.addEventListener('mouseenter', () => {
  if (slideshowTimer) clearTimeout(slideshowTimer);
});
heroBg?.addEventListener('mouseleave', () => {
  startSlideshow();
});

// Pause when tab is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (slideshowTimer) clearTimeout(slideshowTimer);
  } else {
    startSlideshow();
  }
});

// Kick it off
if (slides.length > 1) startSlideshow();

// =============================================
// HEADER SCROLL EFFECT
// =============================================
const header = document.getElementById('site-header');

function handleHeaderScroll() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 60);
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

// =============================================
// SMOOTH ANCHOR SCROLL
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset - 12;
      window.scrollTo({ top, behavior: 'smooth' });
      closeMobileNav();
    }
  });
});

// =============================================
// MOBILE NAV
// =============================================
const navToggle = document.getElementById('nav-toggle');
const mainNav   = document.getElementById('main-nav');

function closeMobileNav() {
  if (!mainNav || !navToggle) return;
  mainNav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  const spans = navToggle.querySelectorAll('span');
  spans[0].style.transform = '';
  spans[1].style.opacity   = '';
  spans[2].style.transform = '';
}

navToggle?.addEventListener('click', () => {
  if (!mainNav || !navToggle) return;
  const isOpen = mainNav.classList.contains('open');
  if (isOpen) {
    closeMobileNav();
  } else {
    mainNav.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }
});

document.addEventListener('click', (e) => {
  if (!mainNav || !navToggle) return;
  const target = e.target;
  if (mainNav.classList.contains('open') && !mainNav.contains(target) && !navToggle.contains(target)) {
    closeMobileNav();
  }
});

// =============================================
// SCROLL REVEAL — INTERSECTION OBSERVER
// =============================================
const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const parent = entry.target.parentElement;
      const siblings = parent
        ? Array.from(parent.querySelectorAll('.reveal:not(.revealed)'))
        : [];
      const idx = siblings.indexOf(entry.target);
      const delay = idx >= 0 ? idx * 90 : 0;

      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, delay);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.10, rootMargin: '0px 0px -40px 0px' }
);

reveals.forEach(el => revealObserver.observe(el));

// =============================================
// FAQ ACCORDION
// =============================================
document.querySelectorAll('.faq-item').forEach(item => {
  const btn    = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  if (!btn || !answer) return;

  btn.addEventListener('click', () => {
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';

    // Close all others
    document.querySelectorAll('.faq-item').forEach(other => {
      if (other === item) return;
      const ob = other.querySelector('.faq-question');
      const oa = other.querySelector('.faq-answer');
      if (ob && oa && ob.getAttribute('aria-expanded') === 'true') {
        ob.setAttribute('aria-expanded', 'false');
        slideUp(oa);
      }
    });

    if (isExpanded) {
      btn.setAttribute('aria-expanded', 'false');
      slideUp(answer);
    } else {
      btn.setAttribute('aria-expanded', 'true');
      slideDown(answer);
    }
  });
});

function slideDown(el) {
  el.hidden = false;
  el.style.maxHeight = '0';
  el.style.overflow  = 'hidden';
  el.style.transition = 'max-height 0.38s ease';
  requestAnimationFrame(() => {
    el.style.maxHeight = el.scrollHeight + 'px';
  });
  el.addEventListener('transitionend', () => {
    el.style.maxHeight = '';
    el.style.overflow  = '';
  }, { once: true });
}

function slideUp(el) {
  el.style.maxHeight = el.scrollHeight + 'px';
  el.style.overflow  = 'hidden';
  el.style.transition = 'max-height 0.30s ease';
  requestAnimationFrame(() => {
    el.style.maxHeight = '0';
  });
  el.addEventListener('transitionend', () => {
    el.hidden = true;
    el.style.maxHeight = '';
    el.style.overflow  = '';
  }, { once: true });
}

// =============================================
// LAZY IMAGE FADE-IN
// =============================================
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.55s ease';
  if (img.complete && img.naturalWidth > 0) {
    img.style.opacity = '1';
  } else {
    img.addEventListener('load', () => { img.style.opacity = '1'; });
    img.addEventListener('error', () => { img.style.opacity = '1'; });
  }
});
