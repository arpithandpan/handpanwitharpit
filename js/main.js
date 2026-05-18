// ============================================
// HANDPAN WITH ARPIT — Global JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // Scroll-based logo rotation
  const navLogoImg = document.querySelector('.nav-logo img');
  let currentRotation = 0;
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    currentRotation += delta * 0.3;
    if (navLogoImg) {
      navLogoImg.style.transform = `rotate(${currentRotation}deg)`;
      navLogoImg.style.transition = 'none';
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  // Nav logo rotation on scroll
  const navLogo = document.querySelector('.nav-logo svg');
  if (navLogo) {
    let lastScrollY = window.scrollY;
    let rotation = 0;
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      rotation += delta * 0.15;
      navLogo.style.transform = `rotate(${rotation}deg)`;
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // Nav scroll effect
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav && nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  // Active nav link based on current page
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

  // Logo press effect
  const navLogo = document.querySelector('.nav-logo');
  let isPressed = false;
  if (navLogo && navLogoImg) {
    navLogo.addEventListener('mousedown', () => { isPressed = true; navLogoImg.style.transition = 'transform 0.1s ease'; navLogoImg.style.transform = `rotate(${currentRotation}deg) scale(0.85)`; });
    navLogo.addEventListener('touchstart', () => { isPressed = true; navLogoImg.style.transition = 'transform 0.1s ease'; navLogoImg.style.transform = `rotate(${currentRotation}deg) scale(0.85)`; }, { passive: true });
    const releasePress = () => { if (isPressed) { isPressed = false; navLogoImg.style.transition = 'transform 0.15s ease'; navLogoImg.style.transform = `rotate(${currentRotation}deg) scale(1)`; } };
    navLogo.addEventListener('mouseup', releasePress);
    navLogo.addEventListener('mouseleave', releasePress);
    navLogo.addEventListener('touchend', releasePress);
  }

  // Mobile menu toggle
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

  // Scroll-triggered fade-in for sections
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Newsletter form
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

  // Generic form submit feedback
  document.querySelectorAll('form.contact-form, form.booking-form, form.enroll-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Sent! We\'ll be in touch.';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
      }
    });
  });

  // Music card tap-to-reveal on mobile
  document.querySelectorAll('.music-card, .release-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (!window.matchMedia('(hover: none)').matches) return;

      const isOpen = this.classList.contains('tapped');

      // If card is not yet open, always open it first — even if tapping a link
      if (!isOpen) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll('.music-card.tapped, .release-card.tapped').forEach(c => c.classList.remove('tapped'));
        this.classList.add('tapped');
        return;
      }

      // Card is already open — if tapping a link, let it navigate
      if (e.target.tagName === 'A' || e.target.closest('a')) return;

      // Tapping non-link area while open — close it
      this.classList.remove('tapped');
      e.stopPropagation();
    });
  });

  // Dismiss tapped card when tapping outside the card
  document.addEventListener('click', function(e) {
    if (!window.matchMedia('(hover: none)').matches) return;
    if (e.target.closest('.music-card, .release-card')) return;
    document.querySelectorAll('.music-card.tapped, .release-card.tapped').forEach(c => c.classList.remove('tapped'));
  });

});
