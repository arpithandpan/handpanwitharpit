// ============================================
// HANDPAN WITH ARPIT — Global JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

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

  // Mobile menu toggle
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = mobileMenu.classList.contains('open') ? 'rotate(45deg) translate(4px, 4.5px)' : '';
      spans[1].style.opacity  = mobileMenu.classList.contains('open') ? '0' : '1';
      spans[2].style.transform = mobileMenu.classList.contains('open') ? 'rotate(-45deg) translate(4px, -4.5px)' : '';
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
      // Only intercept if it's a touch device and click isn't on a link
      if (e.target.tagName === 'A') return;
      if (window.matchMedia('(hover: none)').matches) {
        const isOpen = this.classList.contains('tapped');
        document.querySelectorAll('.music-card.tapped, .release-card.tapped').forEach(c => c.classList.remove('tapped'));
        if (!isOpen) this.classList.add('tapped');
        e.stopPropagation();
      }
    });
  });

  // Dismiss tapped card when tapping outside
  document.addEventListener('click', function() {
    if (window.matchMedia('(hover: none)').matches) {
      document.querySelectorAll('.music-card.tapped, .release-card.tapped').forEach(c => c.classList.remove('tapped'));
    }
  });

});
