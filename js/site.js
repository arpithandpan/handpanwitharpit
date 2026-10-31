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

  /* ---------- header logo turns with scroll (as on the old site) ----------
     The saved angle is applied in <head> before first paint (--lr), so a new page never
     shows the logo at 0 and then jumps. Rotation and press use separate CSS properties
     (rotate, scale), so the press animation never drags the rotation along. */
  (function () {
    var img = $('.nav .brand img');
    if (!img || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var rot = 0, lastY = null, ticking = false;
    try { rot = parseFloat(sessionStorage.getItem('logoRot')) || 0; } catch (e) {}
    function paint() { img.style.rotate = rot.toFixed(1) + 'deg'; ticking = false; }
    function save() { try { sessionStorage.setItem('logoRot', (rot % 360).toFixed(1)); } catch (e) {} }
    paint();
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (lastY === null) { lastY = y; return; }              // first event after load: just take the position
      var dy = y - lastY; lastY = y;
      if (Math.abs(dy) > window.innerHeight * 1.5) return;   // a jump (refresh restore, anchor), not a scroll
      rot += dy * 0.3;
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });
    var a = img.closest('a');
    if (a) {
      var down = function () { img.style.scale = '.88'; };
      var up = function () { img.style.scale = ''; };
      a.addEventListener('pointerdown', down);
      a.addEventListener('pointerup', up);
      a.addEventListener('pointerleave', up);
      a.addEventListener('pointercancel', up);
      a.addEventListener('click', save);
    }
  })();

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
    var x = $('.mnav-x', mnav);
    if (open && x) setTimeout(function () { x.focus(); }, 30);
    if (!open && doc.activeElement && mnav.contains(doc.activeElement)) burger.focus();
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!mnav.hasAttribute('data-open')); });
  if (mnav) mnav.addEventListener('click', function (e) { if (e.target.closest('a, .mnav-x')) setMenu(false); });
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
      if (/^\/pages\/my/.test(location.pathname)) wrap.querySelector('.acct-btn').classList.add('on');
      slot.appendChild(wrap);
    });
    $$('[data-macct]').forEach(function (box) {
      var href = box.getAttribute('data-macct');
      box.innerHTML = me
        ? '<a class="btn btn-soft" href="' + esc(href) + '">My classes</a><span class="who">Logged in as ' + esc(me.name) + ' · <a class="inline-link" href="#" data-logout>Log out</a></span>'
        : '<a class="btn btn-soft" href="' + esc(href) + '">Student login</a>';
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

  /* ---------- phone field: country picker (same list and behaviour as the booking pages) ---------- */
  var CC = [['IN','India','91',10,10],['US','United States','1',10,10],['GB','United Kingdom','44',10,10],['CA','Canada','1',10,10],['AU','Australia','61',9,9],
    ['AE','United Arab Emirates','971',9,9],['SG','Singapore','65',8,8],['DE','Germany','49',9,11],['FR','France','33',9,9],['NL','Netherlands','31',9,9],['CH','Switzerland','41',9,9],
    ['NZ','New Zealand','64',8,9],['NP','Nepal','977',10,10],['IE','Ireland','353',7,9],['ES','Spain','34',9,9],['IT','Italy','39',9,10],['PT','Portugal','351',9,9],['BE','Belgium','32',8,9],
    ['AT','Austria','43',7,13],['SE','Sweden','46',7,9],['NO','Norway','47',8,8],['DK','Denmark','45',8,8],['FI','Finland','358',6,10],['PL','Poland','48',9,9],['GR','Greece','30',10,10],
    ['IL','Israel','972',8,9],['SA','Saudi Arabia','966',9,9],['QA','Qatar','974',8,8],['KW','Kuwait','965',8,8],['BH','Bahrain','973',8,8],['OM','Oman','968',8,8],['ZA','South Africa','27',9,9],
    ['KE','Kenya','254',9,9],['JP','Japan','81',9,10],['KR','South Korea','82',8,10],['HK','Hong Kong','852',8,8],['MY','Malaysia','60',9,10],['TH','Thailand','66',9,9],['ID','Indonesia','62',9,12],
    ['PH','Philippines','63',10,10],['LK','Sri Lanka','94',9,9],['BD','Bangladesh','880',10,10],['MV','Maldives','960',7,7],['MX','Mexico','52',10,10],['BR','Brazil','55',10,11],['AR','Argentina','54',10,10]];
  var TZC = { 'Asia/Kolkata':'IN','Asia/Calcutta':'IN','Europe/London':'GB','Europe/Dublin':'IE','Europe/Berlin':'DE','Europe/Paris':'FR','Europe/Amsterdam':'NL','Europe/Madrid':'ES','Europe/Rome':'IT','Europe/Lisbon':'PT','Europe/Brussels':'BE','Europe/Zurich':'CH','Europe/Vienna':'AT','Europe/Stockholm':'SE','Europe/Oslo':'NO','Europe/Copenhagen':'DK','Europe/Helsinki':'FI','Europe/Warsaw':'PL','Europe/Athens':'GR','Asia/Jerusalem':'IL','Asia/Dubai':'AE','Asia/Riyadh':'SA','Asia/Qatar':'QA','Asia/Tokyo':'JP','Asia/Seoul':'KR','Asia/Hong_Kong':'HK','Asia/Singapore':'SG','Asia/Kuala_Lumpur':'MY','Asia/Bangkok':'TH','Asia/Jakarta':'ID','Asia/Manila':'PH','Asia/Colombo':'LK','Asia/Kathmandu':'NP','Asia/Katmandu':'NP','Asia/Dhaka':'BD','Pacific/Auckland':'NZ','America/Toronto':'CA','America/Vancouver':'CA','America/Edmonton':'CA','America/Winnipeg':'CA','America/Halifax':'CA','America/Mexico_City':'MX','America/Sao_Paulo':'BR','America/Argentina/Buenos_Aires':'AR','Africa/Johannesburg':'ZA','Africa/Nairobi':'KE' };
  function flagOf(iso) { return iso.replace(/./g, function (c) { return String.fromCodePoint(127397 + c.charCodeAt(0)); }); }
  function guessIso() { try { var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; if (TZC[tz]) return TZC[tz]; if (/^America\//.test(tz) || /^US\//.test(tz) || /Honolulu/.test(tz)) return 'US'; if (/^Australia\//.test(tz)) return 'AU'; } catch (e) {} return 'IN'; }
  function ccByIso(iso) { return CC.filter(function (c) { return c[0] === iso; })[0] || CC[0]; }
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  function buildPicker(old) {
    var field = old.closest('.field'), row = old.parentNode, iso = guessIso(), c = ccByIso(iso), uid = 'cc' + Math.random().toString(36).slice(2, 7);
    var hidden = doc.createElement('input'); hidden.type = 'hidden'; hidden.name = 'dial'; hidden.value = c[2]; hidden.setAttribute('data-dial', ''); hidden.setAttribute('data-iso', c[0]);
    var btn = doc.createElement('button'); btn.type = 'button'; btn.className = 'cc-btn'; btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', uid);
    var paint = function () { var k = ccByIso(hidden.getAttribute('data-iso')); btn.innerHTML = '<span class="cc-flag" aria-hidden="true">' + flagOf(k[0]) + '</span><span>+' + k[2] + '</span>' + CHEV; btn.setAttribute('aria-label', 'Country code: ' + k[1] + ' +' + k[2]); };
    paint();
    var pop = doc.createElement('div'); pop.className = 'cc-pop'; pop.id = uid; pop.hidden = true;
    pop.innerHTML = '<input type="text" class="cc-search" placeholder="Search country" aria-label="Search country" autocomplete="off"><div class="cc-list" role="listbox"></div>';
    var list = pop.querySelector('.cc-list'), search = pop.querySelector('.cc-search');
    var render = function (q) {
      q = String(q || '').trim().toLowerCase().replace('+', '');
      var items = CC.filter(function (k) { return !q || k[1].toLowerCase().indexOf(q) > -1 || k[2].indexOf(q) === 0; });
      list.innerHTML = items.length ? items.map(function (k) { return '<button type="button" role="option" class="cc-item" data-iso="' + k[0] + '" aria-selected="' + (k[0] === hidden.getAttribute('data-iso')) + '"><span class="cc-name"><span aria-hidden="true">' + flagOf(k[0]) + '</span>' + esc(k[1]) + '</span><span class="cc-code">+' + k[2] + '</span></button>'; }).join('') : '<p class="cc-none">No country found</p>';
    };
    var open = function (on) { pop.hidden = !on; btn.setAttribute('aria-expanded', String(on)); btn.classList.toggle('open', on); if (on) { render(''); search.value = ''; setTimeout(function () { search.focus(); }, 20); } };
    btn.addEventListener('click', function () { open(pop.hidden); });
    search.addEventListener('input', function () { render(search.value); });
    search.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); var f = list.querySelector('.cc-item'); if (f) f.click(); } if (e.key === 'ArrowDown') { e.preventDefault(); var g = list.querySelector('.cc-item'); if (g) g.focus(); } });
    list.addEventListener('click', function (e) { var it = e.target.closest('.cc-item'); if (!it) return; var k = ccByIso(it.getAttribute('data-iso')); hidden.value = k[2]; hidden.setAttribute('data-iso', k[0]); paint(); open(false); var ph = field.querySelector('[data-phone]'); if (ph) { ph.focus(); if (field.classList.contains('invalid')) validateField(ph); } });
    pop.addEventListener('keydown', function (e) { if (e.key === 'Escape') { open(false); btn.focus(); } });
    doc.addEventListener('click', function (e) { if (!pop.hidden && !pop.contains(e.target) && !btn.contains(e.target)) open(false); });
    row.replaceChild(btn, old); row.appendChild(hidden); row.insertAdjacentElement('afterend', pop);
  }
  function normPhone(dial, num) { var d = String(num || '').replace(/\D/g, ''); if (dial && d.indexOf(dial) === 0 && d.length > 10) d = d.slice(dial.length); return d.replace(/^0+/, ''); }
  HP.normPhone = normPhone;
  function phoneRule(iso) { var c = ccByIso(iso || 'IN'); return { min: c[3], max: c[4], name: c[1] }; }
  function phoneMsg(dialEl, num) {
    var iso = dialEl ? dialEl.getAttribute('data-iso') : 'IN', dial = dialEl ? dialEl.value : '91', d = normPhone(dial, num), r = phoneRule(iso);
    if (/[^\d\s()+-]/.test(String(num))) return 'Phone number should contain digits only.';
    if (iso === 'IN' && d.length === 10 && !/^[6-9]/.test(d)) return 'Enter a valid Indian mobile number. Landline numbers are not accepted.';
    if (d.length < r.min || d.length > r.max) return 'Enter a valid mobile number (' + (r.min === r.max ? r.min : r.min + ' to ' + r.max) + ' digits for ' + r.name + ').';
    return '';
  }
  $$('select[data-dial]').forEach(buildPicker);

  /* ---------- our own select (no browser dropdowns) ---------- */
  function closeAllPops(except) { $$('.xs-pop:not([hidden]), .dp-pop:not([hidden])').forEach(function (p) { if (p !== except && p._close) p._close(); }); }
  function buildSelect(sel) {
    var field = sel.closest('.field'), uid = 'xs' + Math.random().toString(36).slice(2, 7);
    var opts = Array.prototype.map.call(sel.options, function (o) { return { v: o.value, t: o.textContent }; });
    var hidden = doc.createElement('input'); hidden.type = 'hidden'; hidden.name = sel.name; hidden.value = sel.value;
    var btn = doc.createElement('button'); btn.type = 'button'; btn.className = 'xs-btn'; btn.id = sel.id; btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', uid);
    var pop = doc.createElement('div'); pop.className = 'xs-pop'; pop.id = uid; pop.hidden = true; pop.setAttribute('role', 'listbox');
    var paint = function () { var o = opts.filter(function (x) { return x.v === hidden.value; })[0] || opts[0]; btn.innerHTML = '<span class="' + (o.v ? '' : 'xs-ph') + '">' + esc(o.t) + '</span>' + CHEV; };
    var render = function () { pop.innerHTML = opts.map(function (o, i) { return '<button type="button" role="option" class="xs-item" data-i="' + i + '" aria-selected="' + (o.v === hidden.value) + '">' + esc(o.t) + '</button>'; }).join(''); };
    var open = function (on) { if (on) closeAllPops(pop); pop.hidden = !on; btn.setAttribute('aria-expanded', String(on)); btn.classList.toggle('open', on); if (on) { render(); var s = pop.querySelector('[aria-selected="true"]') || pop.querySelector('.xs-item'); setTimeout(function () { s.focus(); }, 10); } };
    pop._close = function () { open(false); };
    btn.addEventListener('click', function () { open(pop.hidden); });
    btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(true); } });
    pop.addEventListener('click', function (e) { var it = e.target.closest('.xs-item'); if (!it) return; hidden.value = opts[+it.getAttribute('data-i')].v; paint(); open(false); btn.focus(); if (field) field.classList.remove('invalid'); });
    pop.addEventListener('keydown', function (e) {
      var items = $$('.xs-item', pop), i = items.indexOf(doc.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (items[i - 1] || items[items.length - 1]).focus(); }
      else if (e.key === 'Escape' || e.key === 'Tab') { open(false); if (e.key === 'Escape') btn.focus(); }
    });
    paint();
    var wrap = doc.createElement('div'); wrap.className = 'xs-wrap';
    sel.parentNode.replaceChild(wrap, sel); wrap.appendChild(btn); wrap.appendChild(hidden); wrap.appendChild(pop);
  }
  $$('.field select:not([data-dial])').forEach(buildSelect);

  /* ---------- our own date picker (no browser calendar) ---------- */
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
  var ARR = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function buildDate(inp) {
    var field = inp.closest('.field'), uid = 'dp' + Math.random().toString(36).slice(2, 7), today = new Date(); today.setHours(0, 0, 0, 0);
    var hidden = doc.createElement('input'); hidden.type = 'hidden'; hidden.name = inp.name; hidden.value = inp.value || '';
    var btn = doc.createElement('button'); btn.type = 'button'; btn.className = 'xs-btn dp-btn'; btn.id = inp.id; btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', uid);
    var pop = doc.createElement('div'); pop.className = 'dp-pop'; pop.id = uid; pop.hidden = true; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Choose a date');
    var view = new Date(today.getFullYear(), today.getMonth(), 1);
    var label = function (v) { var p = v.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); };
    var paint = function () { btn.innerHTML = '<span class="' + (hidden.value ? '' : 'xs-ph') + '">' + (hidden.value ? label(hidden.value) : 'Choose a date') + '</span>' + CAL; };
    var render = function () {
      var y = view.getFullYear(), m = view.getMonth(), first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), t = ymd(today);
      var canPrev = new Date(y, m, 1) > new Date(today.getFullYear(), today.getMonth(), 1);
      var h = '<div class="dp-head"><button type="button" class="dp-nav" data-go="-1" aria-label="Previous month"' + (canPrev ? '' : ' disabled') + '>' + ARR('M15 6l-6 6 6 6') + '</button><b>' + MONTHS[m] + ' ' + y + '</b><button type="button" class="dp-nav" data-go="1" aria-label="Next month">' + ARR('M9 6l6 6-6 6') + '</button></div>';
      h += '<div class="dp-grid" role="grid">' + ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(function (d) { return '<span class="dp-dow" aria-hidden="true">' + d + '</span>'; }).join('');
      for (var i = 0; i < first; i++) h += '<span></span>';
      for (var d = 1; d <= days; d++) {
        var v = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'), past = v < t;
        h += '<button type="button" class="dp-day' + (v === t ? ' today' : '') + '" data-v="' + v + '" aria-label="' + label(v) + '"' + (v === hidden.value ? ' aria-pressed="true"' : '') + (past ? ' disabled' : '') + '>' + d + '</button>';
      }
      h += '</div><div class="dp-foot"><button type="button" class="dp-link" data-clear>Clear</button><button type="button" class="dp-link" data-close>Done</button></div>';
      pop.innerHTML = h;
    };
    var open = function (on) {
      if (on) { closeAllPops(pop); if (hidden.value) { var p = hidden.value.split('-'); view = new Date(+p[0], +p[1] - 1, 1); } render(); }
      pop.hidden = !on; btn.setAttribute('aria-expanded', String(on)); btn.classList.toggle('open', on);
      if (on) setTimeout(function () { var f = pop.querySelector('.dp-day[aria-pressed="true"]') || pop.querySelector('.dp-day.today') || pop.querySelector('.dp-day:not([disabled])'); if (f) f.focus(); }, 10);
    };
    pop._close = function () { open(false); };
    btn.addEventListener('click', function () { open(pop.hidden); });
    pop.addEventListener('click', function (e) {
      var nav = e.target.closest('.dp-nav'), day = e.target.closest('.dp-day');
      if (nav && !nav.disabled) { view = new Date(view.getFullYear(), view.getMonth() + (+nav.getAttribute('data-go')), 1); render(); var n = pop.querySelector('.dp-nav[data-go="' + nav.getAttribute('data-go') + '"]'); if (n && !n.disabled) n.focus(); return; }
      if (day && !day.disabled) { hidden.value = day.getAttribute('data-v'); paint(); open(false); btn.focus(); if (field) field.classList.remove('invalid'); return; }
      if (e.target.closest('[data-clear]')) { hidden.value = ''; paint(); open(false); btn.focus(); return; }
      if (e.target.closest('[data-close]')) { open(false); btn.focus(); }
    });
    pop.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { open(false); btn.focus(); return; }
      var a = doc.activeElement; if (!a || !a.classList.contains('dp-day')) return;
      var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]; if (!step) return;
      e.preventDefault(); var p = a.getAttribute('data-v').split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] + step); if (d < today) return;
      if (d.getMonth() !== view.getMonth()) { view = new Date(d.getFullYear(), d.getMonth(), 1); render(); }
      var nb = pop.querySelector('.dp-day[data-v="' + ymd(d) + '"]'); if (nb) nb.focus();
    });
    paint();
    var wrap = doc.createElement('div'); wrap.className = 'xs-wrap';
    inp.parentNode.replaceChild(wrap, inp); wrap.appendChild(btn); wrap.appendChild(hidden); wrap.appendChild(pop);
  }
  $$('.field input[type="date"]').forEach(buildDate);
  doc.addEventListener('click', function (e) { if (!e.target.isConnected || e.target.closest('.xs-wrap')) return; closeAllPops(); });

  /* ---------- forms: validation + submit ---------- */
  function fieldOf(el) { return el.closest('.field'); }
  function setErr(el, msg) { var f = fieldOf(el); if (!f) return; var e = $('.err', f); if (!e) { e = doc.createElement('span'); e.className = 'err'; e.setAttribute('role', 'alert'); f.appendChild(e); } e.textContent = msg || ''; f.classList.toggle('invalid', !!msg); el.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
  function validateField(el) { var f = fieldOf(el); if (!f) return; var m = phoneMsg($('[data-dial]', f), el.value); setErr(el, el.value.trim() ? m : ''); }
  function validate(form) {
    var bad = null;
    $$('input, select, textarea', form).forEach(function (el) {
      if (el.type === 'hidden' || el.name === 'website' || el.disabled || el.classList.contains('cc-search')) return;
      var v = (el.value || '').trim(), msg = '';
      if (el.type === 'radio') { if (el.required && !form.querySelector('input[name="' + el.name + '"]:checked')) msg = el.getAttribute('data-msg') || 'Please choose one.'; }
      else if (el.required && !v) msg = el.getAttribute('data-msg') || 'This is needed.';
      else if (v && el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Please enter a valid email address.';
      else if (v && el.hasAttribute('data-phone')) { msg = phoneMsg($('[data-dial]', fieldOf(el)), v); }
      else if (v && el.minLength > 0 && v.length < el.minLength) msg = el.getAttribute('data-msg') || 'A little more detail, please.';
      if (el.type === 'radio') { if (el === form.querySelector('input[name="' + el.name + '"]')) setErr(el, msg); }
      else setErr(el, msg);
      if (msg && !bad) bad = el;
    });
    if (bad) { try { bad.focus({ preventScroll: true }); } catch (e) { bad.focus(); } bad.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    return !bad;
  }
  doc.addEventListener('input', function (e) { if (e.target.classList && e.target.classList.contains('cc-search')) return; var f = e.target.closest && e.target.closest('.field.invalid'); if (f) { f.classList.remove('invalid'); e.target.setAttribute('aria-invalid', 'false'); } });
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
        var isOpen = first.bookingOpen && first.date > today && !(typeof first.participantsRemaining === 'number' && first.participantsRemaining <= 0);
        $$('[data-ws-bar]').forEach(function (el) { el.hidden = !isOpen; });
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
    if (pick === 'cad') pick = 'usd';
    if (!/^(inr|usd)$/.test(pick)) { try { var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; pick = /Kolkata|Calcutta/.test(tz) || !tz ? 'inr' : 'usd'; } catch (e) { pick = 'inr'; } }
    var paint = function () {
      $$('button', cur).forEach(function (b) { b.setAttribute('aria-pressed', String(b.value === pick)); });
      var per = P[pick];
      $$('[data-p]').forEach(function (el) {
        var k = el.getAttribute('data-p');
        var v = k === 'per' ? per : k === 'm' ? per * 4 : k === 'q' ? Math.round(per * 12 * .9) : k === 'qlist' ? per * 12 : k === 'qper' ? per * .9 : 0;
        var txt = k === 'qper' ? (pick === 'inr' ? fmt(pick, v) : SYM[pick] + (v % 1 ? v.toFixed(2) : String(v))) : fmt(pick, v);
        if (el.tagName === 'B') el.innerHTML = '<span class="cs">' + SYM[pick] + '</span>' + esc(txt.slice(SYM[pick].length)); else el.textContent = txt;
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
