/* Rhythm practice (students). Timing engine from Handpan Metronome v5, in the site's brand.
   Exercises and patterns are plain data, so they can later come from the dashboard. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var NS = 'http://www.w3.org/2000/svg';

  var EX = [
    { t: 'One per click', p: 'Play one note on every click. Clapping works too.', g: '4 bars without a slip at 60 BPM', bpm: 60, beats: 4, sub: 1, accent: false, gap: null, min: '3 min' },
    { t: 'Two per click', p: 'Count "1 & 2 &" out loud and play on every count.', g: '4 clean rounds at 60 BPM', bpm: 60, beats: 4, sub: 2, accent: false, gap: null, min: '4 min' },
    { t: 'Lean on beat 1', p: 'Play beat 1 a little louder. The higher click marks it.', g: '8 bars, beat 1 always clear', bpm: 65, beats: 4, sub: 2, accent: true, gap: null, min: '4 min' },
    { t: 'Three per click', p: 'Count "1 trip let" and spread three notes evenly.', g: '8 bars of even triplets', bpm: 55, beats: 4, sub: 3, accent: true, gap: null, min: '5 min' },
    { t: 'Silent bars', p: 'The click stops for 2 bars. Keep going and land back on beat 1.', g: 'Land on beat 1 after the gap', bpm: 60, beats: 4, sub: 2, accent: true, gap: [2, 2], min: '5 min' },
    { t: 'On your own', p: '1 bar of click, 3 bars silent. Your inner clock does the work.', g: 'Land on beat 1 three times in a row', bpm: 60, beats: 4, sub: 1, accent: true, gap: [1, 3], min: '5 min' }
  ];
  var PRESETS = [
    { name: 'Ding 1 5 6 / Ding 2 5 6', steps: ['D', '1', '5', '6', 'D', '2', '5', '6'] },
    { name: 'Scale up', steps: ['1', '2', '3', '4', '5', '6', '7', '8'] }
  ];

  // ---- pure timing rules (also used by the automatic test)
  function tickInfo(s, tick) {
    var per = s.beats * s.sub, isBeat = tick % s.sub === 0, beat = Math.floor(tick / s.sub) % s.beats, bar = Math.floor(tick / per);
    var muted = !!s.gap && (bar % (s.gap[0] + s.gap[1])) >= s.gap[0];
    var kind = isBeat ? (beat === 0 && s.accent ? 'accent' : 'beat') : 'sub';
    return { isBeat: isBeat, beat: beat, bar: bar, muted: muted, kind: kind, step: s.pat && s.pat.length ? tick % s.pat.length : -1 };
  }
  function interval(s) { return 60 / s.bpm / s.sub; }
  // Note 1 nearest the player (bottom), then 2 left, 3 right, 4 left … the last one at the top.
  function noteAngle(i, n) { var st = 360 / n; if (i === 1) return 90; var j = Math.floor(i / 2); return i % 2 === 0 ? 90 + st * j : 90 - st * j; }
  window.__met = { tickInfo: tickInfo, interval: interval, noteAngle: noteAngle, EX: EX };

  // ---- who can open it: students with weekly classes (soft gate: the page holds no private data)
  var token = '', role = '';
  try {
    if (location.hash === '#teacher') { localStorage.setItem('hp_practice_teacher', '1'); history.replaceState(null, '', location.pathname); }
    token = localStorage.getItem('hp_my_token') || ''; role = localStorage.getItem('hp_my_role') || '';
    if (localStorage.getItem('hp_practice_teacher') === '1') { token = token || 'teacher'; role = 'Student'; }
  } catch (e) {}
  if (!token || role !== 'Student') {
    $('app').hidden = true; $('gate').hidden = false;
    if (token && role) $('gateMsg').textContent = 'Practice is part of weekly classes. Ask Arpit about joining.';
    return;
  }

  // ---- saved settings (this device)
  var STORE = 'hp_practice_v1';
  var S = { ex: 1, done: [], bpm: 60, beats: 4, sub: 2, accent: false, gap: null, size: 8, pat: PRESETS[0].steps.slice(), hp: true, vol: 80 };
  try { var saved = JSON.parse(localStorage.getItem(STORE) || '{}'); for (var k in saved) S[k] = saved[k]; } catch (e) {}
  if (!(S.ex >= 0 && S.ex < EX.length)) S.ex = 0;
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }

  // ---- exercises
  function renderList() {
    var L = $('exList'); Array.prototype.forEach.call(L.querySelectorAll('.ex'), function (e) { e.remove(); });
    EX.forEach(function (e, i) {
      var b = document.createElement('button'), done = S.done.indexOf(i) >= 0, on = i === S.ex;
      b.type = 'button'; b.className = 'ex' + (on ? ' on' : '') + (done && !on ? ' done' : '');
      b.setAttribute('aria-current', on ? 'true' : 'false');
      b.innerHTML = '<span class="n">' + (done && !on ? '✓' : i + 1) + '</span><span><b></b><small></small></span><span class="t"></span>';
      b.querySelector('b').textContent = e.t; b.querySelector('small').textContent = e.g; b.querySelector('.t').textContent = e.min;
      b.onclick = function () { pick(i, true); };
      L.appendChild(b);
    });
    var cur = L.querySelector('.ex.on'); if (cur && L.scrollWidth > L.clientWidth) L.scrollLeft = cur.offsetLeft - 16;
  }
  function pick(i, fromTap) {
    var e = EX[i]; S.ex = i;
    if (fromTap) { S.bpm = e.bpm; S.beats = e.beats; S.sub = e.sub; S.accent = e.accent; S.gap = e.gap; }
    $('exK').textContent = 'Exercise ' + (i + 1); $('exT').textContent = e.t; $('exP').textContent = e.p; $('exG').textContent = 'Goal: ' + e.g;
    setBpm(S.bpm); drawDial(); renderChips(); renderList(); renderDone(); save();
  }
  function renderChips() {
    var c = $('chips'); c.innerHTML = '';
    var add = function (txt) { var s = document.createElement('span'); s.className = 'chip'; s.textContent = txt; c.appendChild(s); };
    add(S.beats + ' beats'); add(S.sub + ' per click'); if (S.accent) add('Accent on 1'); if (S.gap) add(S.gap[0] + ' on · ' + S.gap[1] + ' off');
  }
  function renderDone() {
    var d = S.done.indexOf(S.ex) >= 0, b = $('doneBtn');
    b.classList.toggle('is-done', d); b.querySelector('span').textContent = d ? 'Goal reached' : 'I reached the goal';
  }
  $('doneBtn').onclick = function () {
    var i = S.done.indexOf(S.ex);
    if (i >= 0) S.done.splice(i, 1); else S.done.push(S.ex);
    renderDone(); renderList(); save();
  };

  function setBpm(v) { S.bpm = Math.max(30, Math.min(200, Math.round(v))); $('bpm').value = S.bpm; $('bpmText').textContent = S.bpm; save(); }
  $('bpm').oninput = function (e) { setBpm(+e.target.value); };
  $('minus').onclick = function () { setBpm(S.bpm - 1); };
  $('plus').onclick = function () { setBpm(S.bpm + 1); };
  $('vol').value = S.vol; $('vol').oninput = function (e) { S.vol = +e.target.value; save(); };

  // ---- beat dial
  var fields = [], ding;
  function drawDial() {
    var svg = $('svg'); svg.innerHTML = ''; fields = [];
    var mk = function (t, a) { var el = document.createElementNS(NS, t); for (var k in a) el.setAttribute(k, a[k]); svg.appendChild(el); return el; };
    mk('circle', { cx: 150, cy: 150, r: 144, class: 'shell' }); ding = mk('circle', { cx: 150, cy: 150, r: 64, class: 'ding' });
    var n = S.beats, r = n > 5 ? 24 : 28;
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n, x = 150 + 105 * Math.cos(a), y = 150 + 105 * Math.sin(a);
      fields.push(mk('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.82, transform: 'rotate(' + (a * 180 / Math.PI + 90) + ' ' + x + ' ' + y + ')', class: 'field' + (i === 0 && S.accent ? ' one' : '') }));
    }
  }

  // ---- handpan map
  var pan = {}, panShell, stripEls = [];
  function drawPan() {
    var svg = $('panSvg'); svg.innerHTML = ''; pan = {};
    var used = {}; S.pat.forEach(function (x) { used[x] = 1; });
    var mk = function (t, a, tx) { var el = document.createElementNS(NS, t); for (var k in a) el.setAttribute(k, a[k]); if (tx) el.textContent = tx; svg.appendChild(el); return el; };
    panShell = mk('circle', { cx: 150, cy: 142, r: 128, class: 'pshell' });
    var place = function (k, x, y, rx, ry, rot) {
      var u = used[k] ? ' use' : '';
      pan[k] = [mk('ellipse', { cx: x, cy: y, rx: rx, ry: ry, class: 'pf' + u, transform: 'rotate(' + rot + ' ' + x + ' ' + y + ')' }), mk('text', { x: x, y: y, class: 'pl' + u }, k === 'D' ? 'Ding' : k)];
    };
    place('D', 150, 142, 40, 40, 0);
    var n = S.size, rx = n > 8 ? 21 : 25;
    for (var i = 1; i <= n; i++) { var d = noteAngle(i, n), a = d * Math.PI / 180; place(String(i), 150 + 86 * Math.cos(a), 142 + 86 * Math.sin(a), rx, rx * 0.84, d + 90); }
    mk('text', { x: 150, y: 292, class: 'you' }, 'YOU SIT HERE');
  }
  function renderStrip() {
    var el = $('strip'); el.innerHTML = ''; stripEls = [];
    el.style.gridTemplateColumns = 'repeat(' + Math.min(S.pat.length, 8) + ',1fr)';
    S.pat.forEach(function (s) { var d = document.createElement('div'); d.className = 'note' + (s === 'D' ? ' d' : ''); d.textContent = s; el.appendChild(d); stripEls.push(d); });
  }
  function lightPan(k) {
    for (var n in pan) { var on = n === k; pan[n][0].classList.toggle('on', on); pan[n][1].classList.toggle('on', on); }
  }
  function renderPats() {
    var box = $('pats'); box.innerHTML = '';
    PRESETS.forEach(function (p, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = p.name;
      b.setAttribute('aria-pressed', String(p.steps.join() === S.pat.join()));
      b.onclick = function () { S.pat = p.steps.slice(); renderStrip(); drawPan(); renderPats(); save(); };
      box.appendChild(b);
    });
  }
  function renderSizes() {
    var box = $('sizes'); box.innerHTML = '';
    [7, 8, 9, 10].forEach(function (n) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = n;
      b.setAttribute('aria-pressed', String(S.size === n));
      b.onclick = function () { S.size = n; drawPan(); renderSizes(); save(); };
      box.appendChild(b);
    });
  }
  function setHp(on) { S.hp = on; $('hpTog').setAttribute('aria-checked', String(on)); $('hpBox').hidden = !on; save(); }
  $('hpTog').onclick = function () { setHp(!S.hp); };

  // ---- audio (iPhone silent switch: silent <audio> loop + playback session)
  var ctx, running = false, nextTime = 0, tick = 0, timer = null, queue = [], wake = null, keepAlive = null;
  function silentWav() {
    var n = 4000, b = new Uint8Array(44 + n), v = new DataView(b.buffer), w = function (o, s) { for (var i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
    b.fill(128, 44); var s = ''; for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return 'data:audio/wav;base64,' + btoa(s);
  }
  function unlock() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try { if (!keepAlive) { keepAlive = new Audio(silentWav()); keepAlive.loop = true; keepAlive.setAttribute('playsinline', ''); } var p = keepAlive.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    try { var s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(ctx.destination); s.start(0); } catch (e) {}
  }
  function click(time, kind) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    var f = { accent: 1600, beat: 1050, sub: 720 }[kind], v = (S.vol / 100) * ({ accent: 1, beat: 0.75, sub: 0.4 }[kind]);
    if (v <= 0) return;
    o.type = 'triangle'; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0, time); g.gain.linearRampToValueAtTime(v, time + 0.003); g.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
    o.start(time); o.stop(time + 0.08);
  }
  function schedule() {
    while (nextTime < ctx.currentTime + 0.12) {
      var q = tickInfo(S, tick);
      if (!q.muted) click(nextTime, q.kind);
      q.time = nextTime; queue.push(q);
      nextTime += interval(S); tick++;
    }
  }
  function draw() {
    if (!running) return;
    while (queue.length && queue[0].time <= ctx.currentTime) {
      var q = queue.shift();
      if (S.pat.length && q.step >= 0) { stripEls.forEach(function (n, j) { n.classList.toggle('on', j === q.step); }); lightPan(S.pat[q.step]); }
      if (q.isBeat) {
        fields.forEach(function (f, i) { f.classList.toggle('on', i === q.beat); f.classList.toggle('muted', q.muted); });
        ding.classList.add('pulse'); setTimeout(function () { ding.classList.remove('pulse'); }, 90);
        $('gapNote').textContent = q.muted ? 'silent · keep going' : '';
      }
    }
    requestAnimationFrame(draw);
  }
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg><span>Start</span>';
  var STOP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><span>Stop</span>';
  async function start() {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = ctx || new AC();
    unlock(); try { await ctx.resume(); } catch (e) {}
    running = true; tick = 0; queue = []; nextTime = ctx.currentTime + 0.08;
    schedule(); timer = setInterval(schedule, 25); requestAnimationFrame(draw);
    $('play').innerHTML = STOP;
    try { wake = await navigator.wakeLock.request('screen'); } catch (e) { wake = null; }
  }
  function stop() {
    running = false; clearInterval(timer); queue = [];
    fields.forEach(function (f) { f.classList.remove('on', 'muted'); }); stripEls.forEach(function (n) { n.classList.remove('on'); }); lightPan(null);
    $('gapNote').textContent = ''; $('play').innerHTML = PLAY;
    try { if (wake) wake.release(); } catch (e) {} wake = null;
    try { if (keepAlive) keepAlive.pause(); } catch (e) {}
  }
  function toggle() { if (running) stop(); else start(); }
  $('play').onclick = toggle;
  document.querySelector('.dial').onclick = toggle;
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && !/INPUT|SELECT|BUTTON|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); toggle(); }
  });
  document.addEventListener('visibilitychange', async function () {
    if (running && document.visibilityState === 'visible' && !wake) { try { wake = await navigator.wakeLock.request('screen'); } catch (e) {} }
  });

  // ---- start
  $('play').innerHTML = PLAY;
  renderStrip(); drawPan(); renderPats(); renderSizes(); setHp(S.hp !== false);
  pick(S.ex, false);

  // works offline after the first visit
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('/pages/practice-sw.js', { scope: '/pages/practice' }).catch(function () {}); });
})();
