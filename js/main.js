// ============================================
// HANDPAN WITH ARPIT — Global JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- LOGO: Scroll rotation ----
  const navLogoImg = document.querySelector('.nav-logo img');
  let currentRotation = 0;
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    currentRotation += delta * 0.3;
    if (navLogoImg) {
      navLogoImg.style.transition = 'none';
      navLogoImg.style.transform = `rotate(${currentRotation}deg)`;
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  // ---- NAV scroll effect ----
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav && nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ---- Active nav link ----
  const pathname = window.location.pathname;
  const currentPage = pathname.split('/').pop() || 'index.html';
  const isHome = currentPage === 'index.html' || currentPage === '' || pathname === '/' || pathname.endsWith('/');
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    const hrefPage = href.split('/').pop();
    if (isHome && (hrefPage === 'index.html' || href === 'index.html')) {
      link.classList.add('active');
    } else if (!isHome && hrefPage === currentPage) {
      link.classList.add('active');
    }
  });

  // ---- Mobile menu toggle ----
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    const spans = hamburger.querySelectorAll('span');
    const openMenu = () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
      hamburger.setAttribute('data-open', 'true');
      nav && nav.classList.add('menu-open');
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[1].style.transform = 'scaleX(0)';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    };
    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
      hamburger.setAttribute('data-open', 'false');
      nav && nav.classList.remove('menu-open');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[1].style.transform = '';
      spans[2].style.transform = '';
    };
    hamburger.addEventListener('click', () => {
      hamburger.getAttribute('data-open') === 'true' ? closeMenu() : openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // ---- Scroll-triggered fade-in ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ---- Newsletter form ----
  const nlForm = document.querySelector('.newsletter-form');
  if (nlForm) {
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = nlForm.querySelector('input');
      if (input && input.value) {
        input.value = '';
        const btn = nlForm.querySelector('button');
        if (btn) { btn.textContent = 'Subscribed!'; btn.disabled = true; }
      }
    });
  }

  // ---- Contact/booking form feedback ----
  document.querySelectorAll('form.contact-form, form.booking-form, form.enroll-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = "Sent! We'll be in touch.";
        btn.disabled = true;
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
      }
    });
  });

  // ---- Music card tap-to-reveal on mobile ----
  document.querySelectorAll('.music-card, .release-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (!window.matchMedia('(hover: none)').matches) return;
      const isOpen = this.classList.contains('tapped');
      if (!isOpen) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll('.music-card.tapped, .release-card.tapped').forEach(c => c.classList.remove('tapped'));
        this.classList.add('tapped');
        return;
      }
      if (e.target.tagName === 'A' || e.target.closest('a')) return;
      this.classList.remove('tapped');
      e.stopPropagation();
    });
  });

  document.addEventListener('click', function(e) {
    if (!window.matchMedia('(hover: none)').matches) return;
    if (e.target.closest('.music-card, .release-card')) return;
    document.querySelectorAll('.music-card.tapped, .release-card.tapped').forEach(c => c.classList.remove('tapped'));
  });

});
