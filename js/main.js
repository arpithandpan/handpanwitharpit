// ---- ACCOUNT (Log in / initial + menu) ----
// Logged out: the "Log in" pill in the nav. Logged in (the person opened their
// personal link on this device): the first letter of their name, with a menu
// for My bookings and Log out. Nothing here talks to the
// server. The page my.html saves the login, this only reads it.
window.hpAcct = (function () {
  const WA = 'https://wa.me/919019576583';
  const I = {
    cal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    doc: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></svg>',
    wa: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/></svg>',
    out: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>'
  };
  function get(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function who() {
    const token = get('hp_my_token'), name = get('hp_my_name');
    return token && name ? { name, role: get('hp_my_role') } : null;
  }

  let docClick = null;
  function close() {
    document.querySelectorAll('.acct-menu').forEach(m => { m.hidden = true; });
    document.querySelectorAll('.nav-avatar').forEach(b => b.setAttribute('aria-expanded', 'false'));
  }

  function logout() {
    del('hp_my_token'); del('hp_my_name'); del('hp_my_role');
    close();
    render();
    document.dispatchEvent(new Event('hp:logout'));
  }

  function render() {
    const me = who();
    document.querySelectorAll('.nav-account-li').forEach(li => {
      const link = li.querySelector('.nav-account');
      if (!link) return;
      const href = link.getAttribute('href');
      li.querySelectorAll('.nav-avatar, .acct-menu').forEach(x => x.remove());
      link.hidden = !!me;
      if (!me) return;
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'nav-avatar';
      btn.setAttribute('aria-haspopup', 'true'); btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Account menu for ' + me.name);
      btn.textContent = me.name.charAt(0).toUpperCase();
      const menu = document.createElement('div');
      menu.className = 'acct-menu'; menu.hidden = true;
      menu.innerHTML = '<div class="acct-head"><b>' + esc(me.name) + '</b>' + (me.role ? '<span>' + esc(me.role) + '</span>' : '') + '</div>'
        + '<a href="' + esc(href) + '">' + I.cal + 'My bookings</a>'
        + '<div class="acct-sep"></div><button type="button" class="out js-acct-out">' + I.out + 'Log out</button>';
      btn.onclick = (e) => {
        e.stopPropagation();
        const open = menu.hidden;
        close();
        menu.hidden = !open; btn.setAttribute('aria-expanded', String(open));
      };
      menu.querySelector('.js-acct-out').onclick = logout;
      li.appendChild(btn); li.appendChild(menu);
    });
    document.querySelectorAll('.mobile-menu-inner').forEach(box => {
      const link = box.querySelector('.mm-account');
      if (!link) return;
      const href = link.getAttribute('href');
      box.querySelectorAll('.mm-acct').forEach(x => x.remove());
      link.hidden = !!me;
      if (!me) return;
      const d = document.createElement('div');
      d.className = 'mm-acct';
      d.innerHTML = '<span class="who">Logged in as ' + esc(me.name) + '</span><a href="' + esc(href) + '">My bookings</a><button type="button" class="out js-acct-out">Log out</button>';
      d.querySelector('.js-acct-out').onclick = logout;
      box.appendChild(d);
    });
  }

  function init() {
    render();
    if (!docClick) {
      docClick = (e) => { if (!e.target.closest('.acct-menu')) close(); };
      document.addEventListener('click', docClick);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  return { refresh: render, logout };
})();

// ============================================
// HANDPAN WITH ARPIT — Global JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- LOGO: Scroll rotation + press effect ----
  const navLogoImg = document.querySelector('.nav-logo img');
  const navLogoEl = document.querySelector('.nav-logo');
  let currentRotation = parseFloat(sessionStorage.getItem('logoRotation') || '0');
  let lastScrollY = window.scrollY;
  let releaseTimer = null;

  if (navLogoImg) {
    navLogoImg.style.transition = 'none';
    navLogoImg.style.transform = `rotate(${currentRotation}deg) scale(1)`;
  }

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    currentRotation += delta * 0.3;
    if (navLogoImg) {
      navLogoImg.style.transition = 'none';
      navLogoImg.style.transform = `rotate(${currentRotation}deg) scale(1)`;
    }
    sessionStorage.setItem('logoRotation', currentRotation);
    lastScrollY = currentScrollY;
  }, { passive: true });

  if (navLogoEl && navLogoImg) {
    const press = () => {
      if (releaseTimer) { clearTimeout(releaseTimer); releaseTimer = null; }
      navLogoImg.style.transition = 'none';
      navLogoImg.style.transform = `rotate(${currentRotation}deg) scale(0.88)`;
    };
    const release = () => {
      if (releaseTimer) clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => {
        navLogoImg.style.transition = 'transform 0.15s ease';
        navLogoImg.style.transform = `rotate(${currentRotation}deg) scale(1)`;
      }, 80);
    };
    navLogoEl.addEventListener('mousedown', press);
    navLogoEl.addEventListener('mouseup', release);
    navLogoEl.addEventListener('mouseleave', release);
    navLogoEl.addEventListener('touchstart', press, { passive: true });
    navLogoEl.addEventListener('touchend', release);
    navLogoEl.addEventListener('click', () => {
      sessionStorage.setItem('logoRotation', currentRotation);
    });
  }

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

    // Close the mobile menu if the window is widened back to desktop layout
    const desktopMQ = window.matchMedia('(min-width: 1081px)');
    const handleDesktopSwitch = (e) => {
      if (e.matches && hamburger.getAttribute('data-open') === 'true') {
        closeMenu();
      }
    };
    if (desktopMQ.addEventListener) {
      desktopMQ.addEventListener('change', handleDesktopSwitch);
    } else if (desktopMQ.addListener) {
      desktopMQ.addListener(handleDesktopSwitch); // older Safari fallback
    }
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
