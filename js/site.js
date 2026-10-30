/* ==========================================================================
   ARPIT PANDEY · HANDPAN · site.js (redesign 2026)
   Shared behaviour for every public page. No dependencies.
   ========================================================================== */
(function () {
  'use strict';
  var API = 'https://handpan-webhook-server-production.up.railway.app';
  var WA = '919380140907';
  var doc = document, root = doc.documentElement;
  root.classList.add('js');
  window.HP = window.HP || {};
  HP.API = API;

  function $(s, el) { return (el || doc).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k) || ''; if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return ''; } }
  HP.esc = esc;

  /* ---------- tracking: only completed outcomes call this ---------- */
  HP.track = function (name, props) {
    try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, props || {})); } catch (e) {}
    try { if (window.fbq) { var std = { lead: 'Lead', contact: 'Contact', schedule: 'Schedule', subscribe: 'CompleteRegistration' }[props && props.fb]; if (std) window.fbq('track', std, props && props.value ? { value: props.value, currency: props.currency || 'INR' } : {}); window.fbq('trackCustom', name, props || {}); } } catch (e) {}
  };
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="https://wa.me"], a[href^="mailto:"], a[href^="tel:"]');
    if (a) HP.track(a.href.indexOf('wa.me') > -1 ? 'whatsapp_click' : a.href.indexOf('mailto') === 0 ? 'email_click' : 'call_click', { page: location.pathname });
  });

  /* ---------- nav ---------- */
  var nav = $('.nav'), mnav = $('#mnav'), burger = $('.nav-burger');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    if (!nav || !mnav || !burger) return;
    if (open) { nav.setAttribute('data-open', ''); mnav.setAttribute('data-open', ''); doc.body.style.overflow = 'hidden'; }
    else { nav.removeAttribute('data-open'); mnav.removeAttribute('data-open'); doc.body.style.overflow = ''; }
    burger.setAttribute('aria-expanded', String(!!open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!mnav.hasAttribute('data-open')); });
  if (mnav) mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeAcct(); } });
  var mq = window.matchMedia('(min-width: 1081px)');
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function (m) { if (m.matches) setMenu(false); });

  /* ---------- account (kept compatible with my.html: window.hpAcct + 'hp:logout') ---------- */
  function who() { var t = ls('hp_my_token'), n = ls('hp_my_name'); return t && n ? { name: n, role: ls('hp_my_role') } : null; }
  function closeAcct() { $$('.acctm').forEach(function (m) { m.removeAttribute('data-open'); }); $$('.acct-btn').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); }); }
  function logout() { ls('hp_my_token', null); ls('hp_my_name', null); ls('hp_my_role', null); closeAcct(); renderAcct(); doc.dispatchEvent(new Event('hp:logout')); }
  function renderAcct() {
    var me = who();
    $$('[data-acct]').forEach(function (slot) {
      var login = $('.nav-login', slot), href = slot.getAttribute('data-acct');
      $$('.acct', slot).forEach(function (x) { x.remove(); });
      if (login) login.hidden = !!me;
      if (!me) return;
      var wrap = doc.createElement('div'); wrap.className = 'acct';
      wrap.innerHTML = '<button type="button" class="acct-btn" aria-haspopup="true" aria-expanded="false" aria-label="Account menu for ' + esc(me.name) + '">' + esc(me.name.charAt(0).toUpperCase()) + '</button>'
        + '<div class="acctm"><p>Logged in as <b>' + esc(me.name) + '</b></p><a href="' + esc(href) + '">My classes and bookings</a><button type="button" data-logout>Log out</button></div>';
      slot.appendChild(wrap);
    });
    $$('[data-macct]').forEach(function (box) {
      var href = box.getAttribute('data-macct');
      box.innerHTML = me
        ? '<span>Logged in as ' + esc(me.name) + '</span><a href="' + esc(href) + '">My classes</a><a href="#" data-logout>Log out</a>'
        : '<a href="' + esc(href) + '">Student login</a>';
    });
  }
  doc.addEventListener('click', function (e) {
    var b = e.target.closest('.acct-btn');
    if (b) { e.stopPropagation(); var m = b.nextElementSibling, open = !m.hasAttribute('data-open'); closeAcct(); if (open) { m.setAttribute('data-open', ''); b.setAttribute('aria-expanded', 'true'); } return; }
    if (e.target.closest('[data-logout]')) { e.preventDefault(); setMenu(false); logout(); return; }
    if (!e.target.closest('.acctm')) closeAcct();
  });
  window.hpAcct = { refresh: renderAcct, render: renderAcct, logout: logout, init: renderAcct };
  renderAcct();

  /* ---------- reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in', 'visible'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.rv, .reveal').forEach(function (el) { io.observe(el); });
  } else $$('.rv, .reveal').forEach(function (el) { el.classList.add('in', 'visible'); });

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- YouTube: thumbnail first, player only on click ---------- */
  $$('.yt[data-yt]').forEach(function (b) {
    var id = b.getAttribute('data-yt');
    b.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)';
    b.addEventListener('click', function () {
      if (b.dataset.on) return; b.dataset.on = '1';
      var f = doc.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = b.getAttribute('aria-label') || 'YouTube video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true;
      var box = doc.createElement('div'); box.className = 'yt'; box.appendChild(f); b.replaceWith(box); HP.track('video_play', { id: id });
    });
  });

  /* ---------- phone field helper ---------- */
  var DIALS = [['91', 'IN', 10, 10], ['1', 'US/CA', 10, 10], ['44', 'UK', 10, 10], ['61', 'AU', 9, 9], ['971', 'AE', 9, 9], ['65', 'SG', 8, 8], ['49', 'DE', 9, 11], ['33', 'FR', 9, 9], ['31', 'NL', 9, 9], ['41', 'CH', 9, 9], ['64', 'NZ', 8, 9], ['977', 'NP', 10, 10], ['', 'Other', 6, 15]];
  function guessDial() { try { var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; if (/Kolkata|Calcutta/.test(tz)) return '91'; if (/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Toronto|Vancouver|Edmonton|Winnipeg|Halifax|Regina|St_Johns|Montreal|Indiana|Kentucky|Boise)/.test(tz) || /^(US|Canada)\//.test(tz) || /Honolulu/.test(tz)) return '1'; if (/London/.test(tz)) return '44'; if (/Australia/.test(tz)) return '61'; if (/Dubai/.test(tz)) return '971'; if (/Singapore/.test(tz)) return '65'; if (/Berlin/.test(tz)) return '49'; if (/Paris/.test(tz)) return '33'; if (/Amsterdam/.test(tz)) return '31'; if (/Zurich/.test(tz)) return '41'; if (/Auckland/.test(tz)) return '64'; if (/Kathmandu/.test(tz)) return '977'; return tz ? '' : '91'; } catch (e) { return '91'; } }
  HP.fillDial = function (sel) {
    if (!sel || sel.options.length) return;
    var g = guessDial();
    DIALS.forEach(function (d) { var o = doc.createElement('option'); o.value = d[0]; o.textContent = d[0] ? '+' + d[0] + ' ' + d[1] : d[1]; if (d[0] === g) o.selected = true; sel.appendChild(o); });
  };
  function normPhone(dial, num) { var d = String(num || '').replace(/\D/g, ''); if (dial && d.indexOf(dial) === 0 && d.length > 10) d = d.slice(dial.length); return d.replace(/^0+/, ''); }
  HP.normPhone = normPhone;
  function phoneOk(dial, num) {
    var d = normPhone(dial, num); var r = DIALS.filter(function (x) { return x[0] === dial; })[0] || DIALS[DIALS.length - 1];
    if (dial === '91' && d.length === 10 && !/^[6-9]/.test(d)) return false;
    return d.length >= r[2] && d.length <= r[3];
  }
  $$('select[data-dial]').forEach(HP.fillDial);

  /* ---------- forms: validation + submit ---------- */
  function fieldOf(el) { return el.closest('.field'); }
  function setErr(el, msg) { var f = fieldOf(el); if (!f) return; var e = $('.err', f); if (!e) { e = doc.createElement('span'); e.className = 'err'; e.setAttribute('role', 'alert'); f.appendChild(e); } e.textContent = msg || ''; f.classList.toggle('invalid', !!msg); el.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
  function validate(form) {
    var bad = null;
    $$('input, select, textarea', form).forEach(function (el) {
      if (el.type === 'hidden' || el.name === 'website' || el.disabled) return;
      var v = (el.value || '').trim(), msg = '';
      if (el.type === 'radio') { if (el.required && !form.querySelector('input[name="' + el.name + '"]:checked')) msg = el.getAttribute('data-msg') || 'Please choose one.'; }
      else if (el.required && !v) msg = el.getAttribute('data-msg') || 'This is needed.';
      else if (v && el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Please enter a valid email address.';
      else if (v && el.hasAttribute('data-phone')) { var dial = $('select[data-dial]', fieldOf(el)); if (!phoneOk(dial ? dial.value : '', v)) msg = 'Please check the number' + (dial && dial.value === '91' ? ' (10 digits, starting 6 to 9).' : '.'); }
      else if (v && el.minLength > 0 && v.length < el.minLength) msg = el.getAttribute('data-msg') || 'A little more detail, please.';
      if (el.type === 'radio') { if (el === form.querySelector('input[name="' + el.name + '"]')) setErr(el, msg); }
      else setErr(el, msg);
      if (msg && !bad) bad = el;
    });
    if (bad) { try { bad.focus({ preventScroll: true }); } catch (e) { bad.focus(); } bad.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    return !bad;
  }
  doc.addEventListener('input', function (e) { var f = e.target.closest && e.target.closest('.field.invalid'); if (f) { f.classList.remove('invalid'); e.target.setAttribute('aria-invalid', 'false'); } });
  doc.addEventListener('change', function (e) { var f = e.target.closest && e.target.closest('.field.invalid'); if (f) f.classList.remove('invalid'); });

  function busy(btn, on, label) {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spin" aria-hidden="true"></span>' + esc(label || 'Sending…'); }
    else { btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; }
  }
  function showAlert(form, msg) {
    var a = $('.alert', form);
    if (!a) { a = doc.createElement('div'); a.className = 'alert bad'; a.setAttribute('role', 'alert'); var foot = $('.form-foot', form); form.insertBefore(a, foot || null); }
    a.innerHTML = msg; a.hidden = !msg;
  }
  function donePanel(form, title, text) {
    var box = doc.createElement('div'); box.className = 'done'; box.setAttribute('role', 'status'); box.tabIndex = -1;
    box.innerHTML = '<div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h3>' + title + '</h3><p>' + text + '</p>';
    form.replaceWith(box); box.focus();
  }
  function source() { try { var p = new URLSearchParams(location.search); return p.get('utm_source') || p.get('src') || (doc.referrer && doc.referrer.indexOf(location.host) < 0 ? doc.referrer.split('/')[2] : '') || ''; } catch (e) { return ''; } }

  /* Enquiry (performance / contact) */
  doc.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches('form[data-enquiry]')) return;
    e.preventDefault();
    showAlert(form, '');
    if (!validate(form)) return;
    var fd = new FormData(form), body = { kind: form.getAttribute('data-enquiry'), page: location.pathname, source: source() };
    fd.forEach(function (v, k) { if (k !== 'dial') body[k] = String(v).trim(); });
    if (body.phone) { var dial = fd.get('dial') || ''; body.phone = (dial ? '+' + dial + ' ' : '+') + normPhone(dial, body.phone); }
    var btn = $('button[type="submit"]', form); busy(btn, true);
    fetch(API + '/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { r: r, j: j }; }); })
      .then(function (x) {
        if (x.r.ok && x.j.ok) {
          HP.track(body.kind === 'performance' ? 'performance_enquiry_sent' : 'contact_sent', { fb: body.kind === 'performance' ? 'lead' : 'contact' });
          var first = (body.name || '').split(' ')[0];
          donePanel(form, 'Thank you' + (first ? ', ' + esc(first) : ''), body.kind === 'performance'
            ? 'Your enquiry has reached Arpit. He reads every one himself and will reply to ' + esc(body.email) + (body.phone ? ' or on WhatsApp' : '') + ' with availability and a quote.'
            : 'Your message has reached Arpit. He reads every message himself and will reply to ' + esc(body.email) + '.');
          return;
        }
        if (x.j.fields) Object.keys(x.j.fields).forEach(function (k) { var el = form.elements[k]; if (el) setErr(el.length && !el.tagName ? el[0] : el, x.j.fields[k]); });
        showAlert(form, esc(x.j.error || 'Something went wrong. Please try again.'));
        busy(btn, false);
      })
      .catch(function () { showAlert(form, 'Could not reach the server. Check your connection and try again, or email <a class="inline-link" href="mailto:arpithandpan@gmail.com">arpithandpan@gmail.com</a>.'); busy(btn, false); });
  });

  /* Workshop notify list */
  doc.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches('form[data-notify]')) return;
    e.preventDefault(); showAlert(form, '');
    if (!validate(form)) return;
    var fd = new FormData(form), dial = fd.get('dial') || '';
    var body = { name: String(fd.get('name') || '').trim(), phone: '+' + dial + normPhone(dial, fd.get('phone')), email: String(fd.get('email') || '').trim() || null, website: fd.get('website') || '' };
    var btn = $('button[type="submit"]', form); busy(btn, true, 'Saving…');
    fetch(API + '/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error(); HP.track('workshop_notify_signup', { fb: 'subscribe' }); donePanel(form, 'You’re on the list', 'Thanks, ' + esc(body.name.split(' ')[0]) + '. Arpit will message you on WhatsApp as soon as the next workshop opens for booking.'); })
      .catch(function () { showAlert(form, 'Something went wrong. Please try again, or <a class="inline-link" href="https://wa.me/' + WA + '">message Arpit on WhatsApp</a>.'); busy(btn, false); });
  });

  /* ---------- workshops from the server ---------- */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function istToday() { return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); }
  function hours(t) {
    var m = String(t || '').match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i); if (!m) return ''; if (!m[3]) m[3] = m[6];
    var a = (+m[1] % 12 + (/pm/i.test(m[3]) ? 12 : 0)) * 60 + (+m[2] || 0), b = (+m[4] % 12 + (/pm/i.test(m[6]) ? 12 : 0)) * 60 + (+m[5] || 0), d = (b - a) / 60;
    return d > 0 ? (d % 1 ? d.toFixed(1) : d) + (d === 1 ? ' hour' : ' hours') : '';
  }
  function wsRow(w) {
    var today = istToday();
    var title = w.title || 'Handpan Workshop';
    var meta = [WD[new Date(w.date + 'T12:00:00Z').getUTCDay()] + (w.time ? ', ' + w.time : ''), w.venue || 'Venue in Bengaluru, shared on booking', hours(w.time)].filter(Boolean).map(esc).join(' · ');
    var left = typeof w.participantsRemaining === 'number' ? w.participantsRemaining : null, obs = typeof w.observersRemaining === 'number' ? w.observersRemaining : null;
    var state, act;
    if (!w.bookingOpen) { state = 'soon'; act = '<span class="pill mute">Booking opens soon</span>'; }
    else if (w.date <= today) { state = 'closed'; act = '<span class="pill mute">Booking closed</span>'; }
    else if (left !== null && left <= 0) { state = 'full'; act = '<span class="pill warn">Sold out</span><span class="micro">Join the list below for the next one</span>'; }
    else { state = 'open'; act = '<a class="btn" href="/pages/book?ws=' + encodeURIComponent(w.id) + '" data-ws-book>Book your spot</a>'; }
    var seats = '';
    if (state === 'open' && left !== null) seats = '<div class="ws-seats"><span class="pill ' + (left <= 3 ? 'warn' : 'ok') + '">' + left + ' spot' + (left === 1 ? '' : 's') + ' left</span>' + (obs !== null && obs > 0 ? '<span class="pill mute">Audience passes available</span>' : '') + '</div>';
    else if (state === 'open') seats = '<div class="ws-seats"><span class="pill ok">Registration open</span></div>';
    return '<article class="ws' + (state === 'open' ? '' : ' is-closed') + '"><div class="ws-date"><b>' + (+w.date.slice(8, 10)) + '</b><span>' + MON[+w.date.slice(5, 7) - 1] + ' ' + w.date.slice(0, 4) + '</span></div>'
      + '<div><h3>' + esc(title) + '</h3><p class="ws-meta">' + meta + '</p>' + seats + '</div><div class="ws-act">' + act + '</div></article>';
  }
  HP.loadWorkshops = function () {
    $$('[data-workshops]').forEach(function (box) {
      var mode = box.getAttribute('data-workshops'), limit = +box.getAttribute('data-limit') || 6;
      fetch(API + '/api/workshops/upcoming', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(); return r.json(); }).then(function (j) {
        var today = istToday();
        var list = (j.workshops || []).filter(function (w) { return w && w.date && w.date >= today; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; }).slice(0, limit);
        if (!list.length) throw { empty: true };
        box.innerHTML = '<div class="ws-list">' + list.map(wsRow).join('') + '</div>';
        $$('[data-ws-when]').forEach(function (el) { el.hidden = false; });
        $$('[data-ws-none]').forEach(function (el) { el.hidden = true; });
        var first = list.filter(function (w) { return w.bookingOpen && w.date > today && !(typeof w.participantsRemaining === 'number' && w.participantsRemaining <= 0); })[0] || list[0];
        $$('[data-ws-next]').forEach(function (el) { var d = new Date(first.date + 'T12:00:00Z'); el.textContent = WD[d.getUTCDay()] + ', ' + d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + (first.venue ? ' · ' + first.venue.split(',')[0] : ''); });
        $$('[data-ws-next-link]').forEach(function (el) { if (first.bookingOpen) el.href = '/pages/book?ws=' + encodeURIComponent(first.id); });
        try { injectEvents(list); } catch (e) {}
      }).catch(function () {
        box.innerHTML = '';
        $$('[data-ws-when]').forEach(function (el) { el.hidden = true; });
        $$('[data-ws-none]').forEach(function (el) { el.hidden = false; });
        if (mode === 'hide') { var sec = box.closest('section'); if (sec) sec.hidden = true; }
      });
    });
  };
  function injectEvents(list) {
    if (!$('[data-workshops="full"]')) return;
    var ev = list.filter(function (w) { return w.bookingOpen; }).map(function (w) {
      return { '@type': 'Event', name: w.title || 'Handpan Workshop', startDate: w.date, eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', eventStatus: 'https://schema.org/EventScheduled',
        location: { '@type': 'Place', name: w.venue || 'Bengaluru', address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' } },
        organizer: { '@type': 'Person', name: 'Arpit Pandey', url: 'https://arpitpandey.com' }, url: 'https://arpitpandey.com/pages/book?ws=' + w.id };
    });
    if (!ev.length) return;
    var s = doc.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': ev }); doc.head.appendChild(s);
  }
  if ($('[data-workshops]')) HP.loadWorkshops();

  /* ---------- pricing (Learn page) ---------- */
  var cur = $('[data-cur]');
  if (cur) {
    var P = { inr: 1500, usd: 18, cad: 25 };
    var SYM = { inr: '₹', usd: '$', cad: 'C$' };
    var fmt = function (c, n) { return SYM[c] + Math.round(n).toLocaleString(c === 'inr' ? 'en-IN' : 'en-US'); };
    var pick = ls('hp_region');
    if (!/^(inr|usd|cad)$/.test(pick)) { try { var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; pick = /Kolkata|Calcutta/.test(tz) || !tz ? 'inr' : /Toronto|Vancouver|Edmonton|Winnipeg|Halifax|Regina|St_Johns|Montreal|Canada\//.test(tz) ? 'cad' : 'usd'; } catch (e) { pick = 'inr'; } }
    var paint = function () {
      $$('button', cur).forEach(function (b) { b.setAttribute('aria-pressed', String(b.value === pick)); });
      var per = P[pick];
      $$('[data-p]').forEach(function (el) {
        var k = el.getAttribute('data-p');
        var v = k === 'per' ? per : k === 'm' ? per * 4 : k === 'q' ? Math.round(per * 12 * .9) : k === 'qlist' ? per * 12 : k === 'qper' ? per * .9 : 0;
        el.textContent = k === 'qper' ? (pick === 'inr' ? fmt(pick, v) : SYM[pick] + (v % 1 ? v.toFixed(2) : String(v))) : fmt(pick, v);
      });
      $$('[data-cur-note]').forEach(function (el) { el.hidden = el.getAttribute('data-cur-note') !== pick; });
    };
    cur.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; pick = b.value; ls('hp_region', pick); paint(); });
    paint();
    fetch(API + '/api/trial/slots', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.prices) { if (+j.prices.inr > 0) P.inr = +j.prices.inr; if (+j.prices.usd > 0) P.usd = +j.prices.usd; paint(); }
      if (j && Array.isArray(j.slots)) $$('[data-trial-slots]').forEach(function (el) { var n = j.slots.length; if (j.open === false || !n) return; el.textContent = n + ' free trial times open right now'; el.hidden = false; });
    }).catch(function () {});
  }

  /* ---------- home: per-class price in the visitor's currency ---------- */
  $$('[data-home-price]').forEach(function (el) {
    var r = ls('hp_region'); if (!/^(inr|usd|cad)$/.test(r)) { try { var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; r = /Kolkata|Calcutta/.test(tz) || !tz ? 'inr' : /Toronto|Vancouver|Edmonton|Winnipeg|Halifax|Regina|St_Johns|Montreal/.test(tz) ? 'cad' : 'usd'; } catch (e) { r = 'inr'; } }
    el.textContent = { inr: '₹1,500', usd: '$18', cad: 'C$25' }[r];
  });

  /* ---------- enquiry: preselect event type from ?type= ---------- */
  try { var qt = new URLSearchParams(location.search).get('type'); if (qt) $$('input[name="eventType"]').forEach(function (r) { if (r.value === qt) r.checked = true; }); } catch (e) {}

  /* ---------- small helpers ---------- */
  $$('a[href^="http"]').forEach(function (a) { if (a.host !== location.host && !a.target) { a.target = '_blank'; a.rel = 'noopener'; } });
})();
