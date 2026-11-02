/* Handpan Metronome. Three parts: the metronome itself, timing drills for everyone,
   and the patterns from class for students. One player plays all three. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---- timing drills: generic, they work with any note and any pattern. Fixed content.
  var LEVELS = [
    { n: 'Beginner', lead: 'Stay with the click. Start slow, and go 5 BPM faster when it feels easy.' },
    { n: 'Intermediate', lead: 'Beats split into smaller parts, and the click starts to step away.' },
    { n: 'Advanced', lead: 'Less click, more you. Your inner clock does the work.' }
  ];
  var EX = [
    { id: 'one', lv: 0, t: 'One per beat', sum: 'Find the pulse', p: 'One click on every beat. Play one note on each click. Any note works, the Ding is a good start.', g: '4 clean bars at 60 BPM', bpm: 60, beats: 4, sub: 1, accent: false, gap: null },
    { id: 'two', lv: 0, t: 'Two per beat', sum: 'Count 1 & 2 &', p: 'Every beat has 2 clicks. Play on each click and count "1 & 2 &" out loud.', g: '4 clean rounds at 60 BPM', bpm: 60, beats: 4, sub: 2, accent: false, gap: null },
    { id: 'lean', lv: 0, t: 'Lean on beat 1', sum: 'A strong first beat', p: 'Play beat 1 a little louder. The Ding marks it, the other clicks are softer.', g: '8 bars, beat 1 always clear', bpm: 65, beats: 4, sub: 2, accent: true, gap: null },
    { id: 'four', lv: 1, t: 'Four per beat', sum: 'Count 1 e & a', p: 'Every beat has 4 clicks. Play on each click and count "1 e & a". Keep all four evenly spaced.', g: '4 clean rounds at 45 BPM', bpm: 45, beats: 4, sub: 4, accent: true, gap: null },
    { id: 'three', lv: 1, t: 'Three per beat', sum: 'Triplets, 1 trip let', p: 'Every beat has 3 clicks. Count "1 trip let, 2 trip let" and keep all three even.', g: '4 clean rounds at 50 BPM', bpm: 50, beats: 4, sub: 3, accent: true, gap: null },
    { id: 'off', lv: 1, t: 'Off the beat', sum: 'Play only on the &', p: 'Two clicks in every beat. Stay quiet on the beat and play only on the second click, the "&".', g: '4 bars, only on the &', bpm: 60, beats: 4, sub: 2, accent: true, gap: null },
    { id: 'silent', lv: 1, t: 'Silent bars', sum: 'Click stops, you keep going', p: 'The click plays 2 bars, then stops for 2 bars. Keep playing and land back on beat 1.', g: 'Land on 1 after the gap', bpm: 60, beats: 4, sub: 2, accent: true, gap: [2, 2] },
    { id: 'own', lv: 2, t: 'On your own', sum: '1 bar of click, 3 bars silent', p: 'One bar of click, then three bars of silence. Keep the beat yourself and land on beat 1.', g: 'Land on 1, three times', bpm: 60, beats: 4, sub: 1, accent: true, gap: [1, 3] },
    { id: 'twofour', lv: 2, t: 'Click on 2 and 4', sum: 'The groove feel', p: 'The click plays only on beats 2 and 4. Count 1 2 3 4 and play on every beat.', g: '8 bars, steady on 1 and 3', bpm: 80, beats: 4, sub: 1, accent: false, gap: null, only: [1, 3] },
    { id: 'five', lv: 2, t: 'Five beats', sum: 'A longer bar', p: 'Five beats in every bar. The Ding marks beat 1. Play on every beat and feel where the bar starts again.', g: '4 bars, land on 1 each time', bpm: 70, beats: 5, sub: 1, accent: true, gap: null },
    { id: 'seven', lv: 2, t: 'Seven beats', sum: 'Count 1 2 3 4, 5 6 7', p: 'Seven beats in every bar. Think 1 2 3 4, then 5 6 7, to keep your place.', g: '4 bars, land on 1 each time', bpm: 70, beats: 7, sub: 1, accent: true, gap: null }
  ];

  // ---- patterns Arpit teaches. One word per beat: 4R = note 4 right hand, DR = Ding right hand, T = Tak,
  // 4L+6R = two notes together, D,D = two notes inside one beat. Each line is played lineRep times, each part secRep times.
  var PIECES = [
    { id: 'scale', t: 'The Ladder', sum: 'Up and down · 3 variations', tag: '60', bpm: 60, sub: 2, lineRep: 1, secRep: 1,
      p: 'R is your right hand, L your left. Variation 1 is the scale up and down with hands taking turns. In Variation 2 every note (right hand) comes back to 4 (left hand). Variation 3 is counted in 3: on each beat a note and the 4, three notes in a row, then move up by one. Play slow first, keep it steady, then raise the tempo.',
      g: 'All three variations with no stop, at a steady tempo',
      secs: [
        { n: 'Variation 1', lines: ['1R 2L 3R 4L', '5R 6L 7R 8L', '8L 7R 6L 5R', '4L 3R 2L 1R'] },
        { n: 'Variation 2', lines: ['1R 4L 2R 4L', '3R 4L 4R 4L', '5R 4L 6R 4L', '7R 4L 8R 4L', '8R 4L 7R 4L', '6R 4L 5R 4L', '4R 4L 3R 4L', '2R 4L 1R 4L'] },
        { n: 'Variation 3', lines: ['1R,4L 2R,4L 3R,4L', '2R,4L 3R,4L 4R,4L', '3R,4L 4R,4L 5R,4L', '4R,4L 5R,4L 6R,4L', '5R,4L 6R,4L 7R,4L', '6R,4L 7R,4L 8R,4L', '8R,4L 7R,4L 6R,4L', '7R,4L 6R,4L 5R,4L', '6R,4L 5R,4L 4R,4L', '5R,4L 4R,4L 3R,4L', '4R,4L 3R,4L 2R,4L', '3R,4L 2R,4L 1R,4L'] }
      ] },
    { id: 'groove', t: 'Meditative Groove', sum: 'Ding 1 5 6 · 5 variations', tag: '60', bpm: 60, sub: 1, lineRep: 1, secRep: 1,
      p: 'In this pattern the **Ding is your right hand**. Then 1 or 2 with the left, 5 with the right, 6 with the left. One note on every beat, each one ringing clearly. In Variation 4, Tak is a knock or a slap. In Variation 5 the last note changes: 6, 8, 7, then 4. Start slow and stay relaxed.',
      g: 'All five variations with an even, relaxed flow',
      secs: [
        { n: 'Variation 1', lineRep: 4, lines: ['DR 1L 5R 6L', 'DR 2L 5R 6L'] },
        { n: 'Variation 2', lineRep: 2, lines: ['DR 1L 5R 6L', 'DR 2L 5R 6L'] },
        { n: 'Variation 3', lines: ['DR 1L 5R 6L', 'DR 2L 5R 6L'] },
        { n: 'Variation 4', lines: ['DR 1L 5R 6L', 'DR 1L T 6L', 'DR 1L 5R 6L', 'DR 1L T 6L', 'DR 2L 5R 6L', 'DR 2L T 6L', 'DR 2L 5R 6L', 'DR 2L T 6L'] },
        { n: 'Variation 5', lines: ['DR 1L 5R 6L', 'DR 1L 5R 8L', 'DR 1L 5R 7L', 'DR 1L 5R 4L', 'DR 2L 5R 6L', 'DR 2L 5R 8L', 'DR 2L 5R 7L', 'DR 2L 5R 4L'] }
      ] },
    { id: 'pairs', t: 'Twin Steps', sum: 'Pairs, Tak, quick Dings', tag: '70', bpm: 70, sub: 2, lineRep: 1, secRep: 2,
      p: 'Play both notes of a pair together, cleanly. The lower note is the left hand, the higher note the right: 4 left with 6 right, 3 left with 5 right, 2 left with 4 right. Tak is a knock or a slap. Beat 3 has two quick Dings, with your thumb or any finger that feels easy. In Step 2 the note 8 takes the place of the first Tak.',
      g: 'Both steps, soft and even',
      secs: [
        { n: 'Step 1', lines: ['4L+6R T D,D T', '3L+5R T D,D T', '2L+4R T D,D T', '3L+5R T D,D T'] },
        { n: 'Step 2', lines: ['4L+6R 8 D,D T', '3L+5R 8 D,D T', '2L+4R 8 D,D T', '3L+5R 8 D,D T'] }
      ] },
    { id: 'sparrow', t: 'Golden Sparrow', sum: 'A composition in 3 parts', tag: '60', bpm: 60, sub: 1, lineRep: 4, secRep: 2,
      p: 'R is your right hand, L your left. In this piece the **Ding is played with the right hand**. Each line 4 times, each part 2 times, then the next part. After Part 2 it goes back to Start.',
      g: 'The full piece in one go, then send Arpit a video',
      secs: [
        { n: 'Start', lines: ['4R 2L 6R 2L', '5R 3L 7R 3L', '3R 1L 5R 1L', '4R 2L 6R 2L'] },
        { n: 'Part 1', lines: ['DR 1L 6R 1L', 'DR 2L 7R 2L', 'DR 1L 5R 1L', 'DR 2L 6R 2L'] },
        { n: 'Part 2', lines: ['DR 1L 8R 4L', 'DR 2L 7R 4L', 'DR 1L 5R 4L', 'DR 2L 6R 4L'] }
      ] },
    { id: 'pingpong', t: 'Ping Pong', sum: 'Coming in class', tag: '', soon: true }
  ];
  function parseBeat(tok) {
    return tok.split(',').map(function (h) {
      if (h === 'T') return { keys: [], hands: [], tak: true, h: null };
      var xm = /^X([RL]?)$/.exec(h);
      if (xm) return { keys: [], hands: [], free: true, opts: ['6', '7', '8', '1'], h: xm[1] || null };
      var parts = h.split('+').map(function (x) { return /^(.+?)([RL]?)$/.exec(x); });
      var hands = parts.map(function (m) { return m[2] || null; });
      var same = hands.every(function (x) { return x === hands[0]; });
      return { keys: parts.map(function (m) { return m[1]; }), hands: hands, tak: false, h: same ? hands[0] : 'mix' };
    });
  }
  function pieceSeq(pc) {
    var seq = [], starts = [];
    pc.secs.forEach(function (sec, si) {
      starts.push(seq.length);
      var SR = sec.secRep || pc.secRep, LR = sec.lineRep || pc.lineRep;
      for (var sr = 0; sr < SR; sr++) sec.lines.forEach(function (line, li) {
        var beats = line.split(' ').map(parseBeat);
        for (var lr = 0; lr < LR; lr++) beats.forEach(function (halves, b) {
          for (var h = 0; h < pc.sub; h++) {
            var k = halves.length, ev = (h * k) % pc.sub === 0 ? halves[h * k / pc.sub] : null;
            seq.push({ si: si, sr: sr, li: li, lr: lr, b: b, nb: beats.length, h: h, part: ev ? h * k / pc.sub : -1, k: k, ev: ev });
          }
        });
      });
    });
    return { seq: seq, starts: starts };
  }

  // ---- pure timing rules (also used by the automatic test)
  function tickInfo(s, tick) {
    var per = s.beats * s.sub, isBeat = tick % s.sub === 0, beat = Math.floor(tick / s.sub) % s.beats, bar = Math.floor(tick / per);
    var muted = !!s.gap && (bar % (s.gap[0] + s.gap[1])) >= s.gap[0];
    var off = !!s.only && s.only.indexOf(beat) < 0;
    var kind = isBeat ? (beat === 0 && s.accent ? 'accent' : 'beat') : 'sub';
    return { isBeat: isBeat, beat: beat, bar: bar, muted: muted, off: off, kind: kind };
  }
  function interval(s) { return 60 / s.bpm / s.sub; }
  function noteAngle(i, n) { var st = 360 / n; if (i === 1) return 90; var j = Math.floor(i / 2); return i % 2 === 0 ? 90 + st * j : 90 - st * j; }
  window.__met = { pieceInfo: function (t) { return pieceInfo(t); }, tickInfo: tickInfo, interval: interval, noteAngle: noteAngle, EX: EX, LEVELS: LEVELS, PIECES: PIECES, pieceSeq: pieceSeq };

  // ---- who sees what. For now the whole page is for students; the public version only needs GATED = false
  var GATED = true;
  var token = '', role = '', jump = '';
  try {
    if (location.hash === '#teacher') { localStorage.setItem('hp_practice_teacher', '1'); history.replaceState(null, '', location.pathname); }
    jump = /^#(play|start|lessons|timing)$/.test(location.hash) ? location.hash.slice(1) : '';
    if (jump) history.replaceState(null, '', location.pathname);
    token = localStorage.getItem('hp_my_token') || ''; role = localStorage.getItem('hp_my_role') || '';
    if (localStorage.getItem('hp_practice_teacher') === '1') { token = token || 'teacher'; role = 'Student'; }
  } catch (e) {}
  var STUDENT = !!token && role === 'Student';
  if (GATED && !STUDENT) {
    $('app').hidden = true; $('tabs').hidden = true; $('gate').hidden = false;
    if (token && role) $('gateMsg').textContent = 'Practice is part of weekly classes. Ask Arpit about joining.';
    return;
  }
  document.body.classList.toggle('stu', STUDENT);

  // ---- saved settings (this device)
  var STORE = 'hp_practice_v2';
  var S = { tab: 'met', list: 'timing', lvl: 0, mode: 'free', drill: 'one', piece: null, pcSec: 0,
    free: { beats: 4, sub: 1, accent: true, bpm: 80 }, bpm: 80, beats: 4, sub: 1, accent: true, gap: null, only: null,
    sound: 'knock', notes: 9, played: false };
  try { var saved = JSON.parse(localStorage.getItem(STORE) || '{}'); for (var k in saved) S[k] = saved[k]; } catch (e) {}
  // students who used the older page keep their theme and handpan size
  try { if (!localStorage.getItem(STORE)) { var old = JSON.parse(localStorage.getItem('hp_practice_v1') || '{}'); if (old.theme) S.theme = old.theme; if (old.notes) S.notes = old.notes; } } catch (e) {}
  var exOf = function (id) { for (var i = 0; i < EX.length; i++) if (EX[i].id === id) return EX[i]; return null; };
  var pieceOf = function (id) { for (var i = 0; i < PIECES.length; i++) if (PIECES[i].id === id && !PIECES[i].soon) return PIECES[i]; return null; };
  var LAYOUTS = { 9: { ring: 8, inner: 0 }, 10: { ring: 9, inner: 0 }, 12: { ring: 9, inner: 2 } };
  if (!LAYOUTS[S.notes]) S.notes = 9;
  if (!exOf(S.drill)) S.drill = 'one';
  if (S.mode === 'lesson' && (!STUDENT || !pieceOf(S.piece))) S.mode = 'free';
  if (['free', 'drill', 'lesson'].indexOf(S.mode) < 0) S.mode = 'free';
  if (['knock', 'slap', 'beep'].indexOf(S.sound) < 0) S.sound = 'knock';
  if (!(S.lvl >= 0 && S.lvl < LEVELS.length)) S.lvl = 0;
  if (S.list !== 'lessons' || !STUDENT) S.list = 'timing';
  var MQ = window.matchMedia ? window.matchMedia('(max-width: 899px)') : { matches: false };
  var isPhone = function () { return !!MQ.matches; };

  function setRich(el, txt) {
    el.textContent = '';
    txt.split('**').forEach(function (part, i) { if (!part) return; var n = i % 2 ? document.createElement('b') : document.createTextNode(part); if (i % 2) n.textContent = part; el.appendChild(n); });
  }
  function lastText() {
    var pc = S.mode === 'lesson' && pieceOf(S.piece), ex = S.mode === 'drill' && exOf(S.drill);
    return pc ? { t: pc.t, s: pc.secs[Math.min(S.pcSec || 0, pc.secs.length - 1)].n.replace('Variation ', 'Var ') }
      : ex ? { t: ex.t, s: LEVELS[ex.lv].n } : { t: 'Metronome', s: S.beats + ' beats' };
  }
  function save() {
    try {
      if (S.mode === 'free') { S.free.bpm = S.bpm; S.free.beats = S.beats; S.free.sub = S.sub; S.free.accent = S.accent; }
      localStorage.setItem(STORE, JSON.stringify(S));
      if (S.played) { var last = lastText(); last.bpm = S.bpm; localStorage.setItem('hp_practice_last', JSON.stringify(last)); }
    } catch (e) {}
  }
  var toastT = null;
  function toast(msg) { var t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2400); }
  var PLAYI = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
  var PLAY = PLAYI + '<span>Start</span>';
  var STOP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><span>Stop</span>';

  // ---- tabs: Metronome, Timing, My lessons (phones); wide screens show the list next to the player
  var TITLES = { met: 'Handpan <i>Metronome</i>', timing: 'Timing', lessons: 'My <i>lessons</i>' };
  function goTab(t, push) {
    if (t === 'lessons' && !STUDENT) t = 'timing';
    if (t !== 'met') S.list = t;
    if (isPhone() && t !== S.tab && push) { try { history.pushState({ tab: t }, ''); } catch (e) {} }
    S.tab = t; save(); if (t !== 'met') renderLists(); showTab();
  }
  function showTab() {
    var phone = isPhone(), side = phone ? S.tab : S.list;
    document.body.setAttribute('data-tab', S.tab);
    $('vTiming').hidden = side !== 'timing'; $('vLessons').hidden = side !== 'lessons';
    $('side').classList.toggle('cur', phone && S.tab !== 'met');
    $('vMet').classList.toggle('cur', !phone || S.tab === 'met');
    $('hTitle').innerHTML = phone ? TITLES[S.tab] : TITLES.met;
    Array.prototype.forEach.call(document.querySelectorAll('#tabs button'), function (b) { var on = b.getAttribute('data-tab') === S.tab; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
    Array.prototype.forEach.call(document.querySelectorAll('#sideSeg button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-tab') === S.list)); });
    if (phone && S.tab !== 'met') $('side').scrollTop = 0;
  }
  Array.prototype.forEach.call(document.querySelectorAll('#tabs button,#sideSeg button'), function (b) { b.onclick = function () { goTab(b.getAttribute('data-tab'), false); }; });
  window.addEventListener('popstate', function () { if (!$('sheet').hidden) { closeSheet(); return; } if (isPhone() && S.tab === 'met') { S.tab = S.list; save(); showTab(); } });

  // ---- lists
  function row(n, t, sub, tag, on, soon) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'it' + (on ? ' on' : '') + (soon ? ' soon' : '');
    b.innerHTML = '<span class="n"></span><span class="tx"><b></b><small></small></span><span class="tg"></span>';
    b.querySelector('.n').textContent = n; b.querySelector('b').textContent = t; b.querySelector('small').textContent = sub; b.querySelector('.tg').innerHTML = tag;
    if (on) b.setAttribute('aria-current', 'true'); if (soon) b.disabled = true;
    return b;
  }
  var LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-label="Locked"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  function renderLists() {
    // timing
    Array.prototype.forEach.call($('lvlSeg').children, function (b, i) { b.setAttribute('aria-pressed', String(i === S.lvl)); });
    $('lvlLead').textContent = LEVELS[S.lvl].lead;
    var L = $('drillList'); L.innerHTML = ''; var n = 0;
    EX.forEach(function (e) {
      if (e.lv !== S.lvl) return; n++;
      var b = row(n, e.t, e.sum, String(e.bpm), S.mode === 'drill' && S.drill === e.id, false);
      b.setAttribute('data-id', e.id);
      b.onclick = function () { loadDrill(e.id, true); goTab('met', true); };
      L.appendChild(b);
    });
    // lessons
    var C = $('contBox'); C.innerHTML = '';
    var lp = pieceOf(S.lastPiece);
    if (lp) {
      var c = document.createElement('button'); c.type = 'button'; c.className = 'cont'; c.id = 'contP';
      c.innerHTML = '<span class="ct"><span class="ck">Continue</span><b></b></span><span class="cgo">' + PLAYI + '</span>';
      c.querySelector('b').textContent = lp.t + ' · ' + lp.secs[Math.min(S.lastSec || 0, lp.secs.length - 1)].n.replace('Variation ', 'Var ');
      c.onclick = function () { loadPiece(lp.id, false, S.lastSec || 0); goTab('met', true); };
      C.appendChild(c);
    }
    var P = $('lessonList'); P.innerHTML = '';
    PIECES.forEach(function (pc, i) {
      var b = row(i + 1, pc.t, pc.sum, pc.soon ? LOCK : pc.tag, S.mode === 'lesson' && S.piece === pc.id, pc.soon);
      b.setAttribute('data-id', pc.id);
      if (!pc.soon) b.onclick = function () { loadPiece(pc.id, true); goTab('met', true); };
      P.appendChild(b);
    });
  }
  Array.prototype.forEach.call($('lvlSeg').children, function (b, i) { b.onclick = function () { S.lvl = i; save(); renderLists(); }; });
  $('toTiming').onclick = function () { goTab('timing', false); };
  $('ctaGo').hidden = STUDENT; $('cta').hidden = STUDENT;

  // ---- modes: free metronome, a drill, a lesson
  var PC = null, pcCells = {}, pcHeads = [], pcAt = null, pcHalf = -1;
  function setMode(m) {
    S.mode = m; var b = document.body;
    b.classList.toggle('m-free', m === 'free'); b.classList.toggle('m-drill', m === 'drill'); b.classList.toggle('m-lesson', m === 'lesson');
    $('free').hidden = m !== 'free'; $('drill').hidden = m !== 'drill'; $('lesson').hidden = m !== 'lesson'; $('loaded').hidden = m === 'free';
    if (m !== 'lesson') PC = null;
  }
  function loadFree() {
    if (running) stop();
    var f = S.free; S.beats = f.beats; S.sub = f.sub; S.accent = f.accent; S.gap = null; S.only = null; setBpm(f.bpm || 80);
    setMode('free'); drawBoxes(); renderOpts(); renderLists(); save();
  }
  function loadDrill(id, fromTap) {
    var e = exOf(id); if (!e) return; if (running) stop();
    if (S.mode === 'free') save();
    S.drill = id; S.lvl = e.lv;
    S.beats = e.beats; S.sub = e.sub; S.accent = e.accent; S.gap = e.gap; S.only = e.only || null;
    setMode('drill'); if (fromTap || !S.bpm) setBpm(e.bpm); else setBpm(S.bpm);
    $('ldK').textContent = 'Timing · ' + LEVELS[e.lv].n; $('ldT').textContent = e.t;
    $('dHow').textContent = e.p; $('dGoal').textContent = 'Goal: ' + e.g;
    $('ldInfo').hidden = true;
    drawBoxes(); drillStat(null); renderLists(); save();
  }
  function loadPiece(id, fromTap, sec) {
    var pc = pieceOf(id); if (!pc || !STUDENT) return; if (running) stop();
    if (S.mode === 'free') save();
    S.piece = id; PC = pieceSeq(pc); PC.pc = pc; PC.split = pc.secs.map(function (x) { return x.lines.join(' ').indexOf(',') >= 0; }); PC.hands = /\d[RL]|D[RL]/.test(pc.secs.map(function (x) { return x.lines.join(' '); }).join(' '));
    if (fromTap) { S.pcSec = 0; setBpm(pc.bpm); } else { if (sec !== undefined) S.pcSec = sec; setBpm(S.bpm); }
    if (!(S.pcSec >= 0 && S.pcSec < pc.secs.length)) S.pcSec = 0;
    S.beats = pc.secs[0].lines[0].split(' ').length; S.sub = pc.sub; S.accent = true; S.gap = null; S.only = null;
    setMode('lesson');
    var live = PIECES.filter(function (x) { return !x.soon; });
    $('ldK').textContent = 'My lessons · ' + (live.indexOf(pc) + 1) + ' of ' + live.length; $('ldT').textContent = pc.t;
    $('ldInfo').hidden = false;
    S.lastPiece = id; S.lastSec = S.pcSec;
    drawPan(); renderPiece(null); renderLists(); save();
  }
  $('ldX').onclick = function () { loadFree(); };
  $('ldInfo').onclick = function () { openInfo(); };

  // ---- beat boxes (free metronome and drills)
  function drawBoxes() {
    var n = S.beats, cols = n <= 4 ? n : n <= 6 ? 3 : 4;
    [['dots', 'd'], ['bb', 'b']].forEach(function (q) {
      var box = $(q[0]); box.innerHTML = ''; box.setAttribute('data-n', n);
      if (q[1] === 'b') box.style.gridTemplateColumns = 'repeat(' + cols + ',minmax(0,1fr))';
      for (var i = 0; i < n; i++) {
        var sp = document.createElement('span'); sp.className = 'bx' + (i === 0 && S.accent ? ' a' : '') + (S.only && S.only.indexOf(i) < 0 ? ' off' : '');
        var b = document.createElement('b'); b.textContent = i + 1; sp.appendChild(b);
        if (q[1] === 'b' && S.sub > 1) { var d = document.createElement('em'); for (var k2 = 0; k2 < S.sub; k2++) d.appendChild(document.createElement('u')); sp.appendChild(d); }
        box.appendChild(sp);
      }
    });
  }
  function lightBox(beat, muted) {
    ['dots', 'bb'].forEach(function (id) {
      Array.prototype.forEach.call($(id).children, function (x, i) { x.classList.toggle('on', i === beat); });
      $(id).classList.toggle('mu', !!muted);
    });
  }
  function drillStat(q) {
    var e = exOf(S.drill), el = $('dStat'); if (!e) return;
    if (!q) { el.textContent = 'Goal: ' + e.g; el.className = 'dstat'; $('dGoal').hidden = true; return; }
    $('dGoal').hidden = true;
    var txt = '';
    if (e.gap) {
      var cyc = e.gap[0] + e.gap[1], pos = q.bar % cyc;
      txt = pos < e.gap[0] ? 'Click · bar ' + (pos + 1) + ' of ' + e.gap[0] + (pos === e.gap[0] - 1 ? ' · silent next' : '') : 'Silent · keep going';
    } else if (e.only) txt = 'Count 1 2 3 4 · click on 2 and 4';
    else txt = 'Bar ' + (q.bar + 1);
    el.textContent = txt; el.className = 'dstat' + (q.muted ? ' mu' : '');
  }

  // ---- free metronome options: Beats, Clicks, Sound
  var SOUNDS = { knock: { t: 'Ding and Knock', s: 'Sharp, easy to hear while you play' }, slap: { t: 'Ding and Slap', s: 'Soft and warm' }, beep: { t: 'Classic beep', s: 'A normal metronome click' } };
  var SHORT = { knock: 'Knock', slap: 'Slap', beep: 'Beep' };
  function renderOpts() {
    $('oBeats').querySelector('b').textContent = S.beats;
    $('oClicks').querySelector('b').textContent = S.sub + ' / beat';
    $('oSound').querySelector('b').textContent = SHORT[S.sound];
  }
  function segRow(vals, cur, set, label) {
    var box = document.createElement('div'); box.className = 'sseg'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', label);
    vals.forEach(function (v) { var b = document.createElement('button'); b.type = 'button'; b.textContent = v; b.setAttribute('aria-pressed', String(v === cur)); b.onclick = function () { set(v); Array.prototype.forEach.call(box.children, function (x) { x.setAttribute('aria-pressed', String(+x.textContent === v)); }); }; box.appendChild(b); });
    return box;
  }
  function openBeats() {
    var body = document.createElement('div'); body.className = 'sgrp';
    body.appendChild(segRow([2, 3, 4, 5, 6, 7], S.beats, function (v) { S.beats = v; drawBoxes(); renderOpts(); save(); }, 'Beats in a bar'));
    var acc = document.createElement('button'); acc.type = 'button'; acc.className = 'toggle'; acc.id = 'mAcc'; acc.setAttribute('role', 'switch');
    acc.innerHTML = '<span><b>Ding on beat 1</b><small>So you always hear where the bar starts</small></span><span class="sw"></span>';
    acc.setAttribute('aria-checked', String(!!S.accent));
    acc.onclick = function () { S.accent = !S.accent; acc.setAttribute('aria-checked', String(S.accent)); drawBoxes(); save(); };
    body.appendChild(acc);
    openSheet('Beats in a bar', body);
  }
  function openClicks() {
    var body = document.createElement('div'); body.className = 'sgrp';
    body.appendChild(segRow([1, 2, 3, 4], S.sub, function (v) { S.sub = v; drawBoxes(); renderOpts(); save(); }, 'Clicks per beat'));
    var p = document.createElement('p'); p.className = 'snote'; p.textContent = '1 is a click on every beat. 2 adds a click in between (1 & 2 &), 3 gives triplets, 4 gives 1 e & a.';
    body.appendChild(p);
    openSheet('Clicks per beat', body);
  }
  function openSound() {
    var body = document.createElement('div'); body.className = 'sgrp';
    Object.keys(SOUNDS).forEach(function (k) {
      var r = document.createElement('div'); r.className = 'so' + (S.sound === k ? ' sel' : ''); r.setAttribute('data-k', k);
      r.innerHTML = '<button type="button" class="sopick" role="radio"><span class="rad"></span><span class="tx"><b></b><small></small></span></button><button type="button" class="ic pv" aria-label="Listen">' + PLAYI + '</button>';
      r.querySelector('b').textContent = SOUNDS[k].t; r.querySelector('small').textContent = SOUNDS[k].s;
      r.querySelector('.sopick').setAttribute('aria-checked', String(S.sound === k));
      r.querySelector('.sopick').onclick = function () { S.sound = k; save(); renderOpts(); Array.prototype.forEach.call(body.querySelectorAll('.so'), function (x) { var on = x.getAttribute('data-k') === k; x.classList.toggle('sel', on); x.querySelector('.sopick').setAttribute('aria-checked', String(on)); }); };
      r.querySelector('.pv').onclick = function () { preview(k); };
      body.appendChild(r);
    });
    var p = document.createElement('p'); p.className = 'snote'; p.textContent = 'Recorded on Arpit\'s handpan. The Ding plays on beat 1, the other sound on every other click.';
    body.appendChild(p);
    openSheet('Sound', body);
  }
  $('oBeats').onclick = openBeats; $('oClicks').onclick = openClicks; $('oSound').onclick = openSound;
  function openInfo() {
    var pc = PC && PC.pc; if (!pc) return;
    var body = document.createElement('div'); body.className = 'sgrp';
    var h = document.createElement('b'); h.className = 'sk'; h.textContent = 'How to play'; body.appendChild(h);
    var p = document.createElement('p'); p.className = 'show'; setRich(p, pc.p); body.appendChild(p);
    var g = document.createElement('p'); g.className = 'sgoal'; g.textContent = 'Goal: ' + pc.g; body.appendChild(g);
    var h2 = document.createElement('b'); h2.className = 'sk'; h2.textContent = 'Your handpan'; body.appendChild(h2);
    var rowEl = document.createElement('div'); rowEl.className = 'hprow';
    rowEl.innerHTML = '<div class="smap" id="sMap"></div><div class="hpc"><b>Notes, with Ding</b></div>';
    rowEl.querySelector('.hpc').appendChild(segRow([9, 10, 12], S.notes, function (v) { S.notes = v; save(); drawPan(); }, 'Notes on your handpan'));
    body.appendChild(rowEl);
    openSheet(pc.t, body); drawPan();
  }

  // ---- sheet
  var lastFocus = null;
  function openSheet(title, body) {
    lastFocus = document.activeElement;
    $('shT').textContent = title; var sb = $('sBody'); sb.innerHTML = ''; sb.appendChild(body);
    $('sheet').hidden = false; document.body.classList.add('sv'); $('sX').focus();
  }
  function closeSheet() { if ($('sheet').hidden) return; $('sheet').hidden = true; document.body.classList.remove('sv'); $('sBody').innerHTML = ''; try { if (lastFocus) lastFocus.focus(); } catch (e) {} }
  $('sBg').onclick = closeSheet; $('sX').onclick = closeSheet;
  (function () {   // swipe the sheet down to close it
    var panel = document.querySelector('.spanel'), y0 = null, dy = 0;
    panel.addEventListener('touchstart', function (e) { if (panel.scrollTop > 0) return; y0 = e.touches[0].clientY; dy = 0; panel.style.transition = 'none'; }, { passive: true });
    panel.addEventListener('touchmove', function (e) { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); panel.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
    panel.addEventListener('touchend', function () { if (y0 === null) return; panel.style.transition = ''; panel.style.transform = ''; if (dy > 70) closeSheet(); y0 = null; });
  })();

  // ---- lesson view (the part, the current line, the map)
  var label = function (k) { return k === 'D' ? 'Ding' : k; };
  function beatText(halves) {
    return halves.map(function (e) { return e.free ? '?' + (e.h || '') : e.tak ? 'Tak' : e.keys.map(function (k, i) { return e.hands[i] ? (k === 'D' ? 'D' : k) + e.hands[i] : label(k); }).join('+'); }).join(' ');
  }
  function renderPiece(pos) {
    var pc = PC.pc, si = pos ? pos.si : S.pcSec, sec = pc.secs[si];
    var tabs = $('pcTabs'); tabs.innerHTML = '';
    pc.secs.forEach(function (x, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = x.n.replace('Variation ', 'Var '); b.setAttribute('aria-label', x.n);
      b.setAttribute('aria-pressed', String(i === si));
      b.onclick = function () { var was = running; if (was) stop(); S.pcSec = i; S.lastSec = i; save(); renderPiece(null); if (was) start(); };
      tabs.appendChild(b);
    });
    if (!pos) { var nb0 = sec.lines[0].split(' ').length; if (nb0 !== S.beats) S.beats = nb0; }
    var c = [], LR = sec.lineRep || pc.lineRep, SR = sec.secRep || pc.secRep;
    if (pos) {
      c.push('Line <b>' + (pos.li + 1) + '</b> of ' + sec.lines.length);
      if (LR > 1) c.push('time <b>' + (pos.lr + 1) + '</b> of ' + LR);
      if (SR > 1) c.push('round <b>' + (pos.sr + 1) + '</b> of ' + SR);
    } else {
      c.push(sec.lines.length + (sec.lines.length === 1 ? ' line' : ' lines'));
      if (LR > 1) c.push('each ' + LR + ' times');
      if (SR > 1) c.push(SR + ' rounds');
    }
    $('pcCount').innerHTML = c.join(' · ');
    var box = $('pcLines'); box.innerHTML = ''; pcCells = {}; pcHeads = []; var anyHand = false;
    var li0 = pos ? pos.li : 0, line = sec.lines[li0];
    var beats = line.split(' ').map(parseBeat), rowEl = document.createElement('div');
    rowEl.className = 'pc-now';
    var cellsN = beats.reduce(function (a, h) { return a + h.length; }, 0), half = Math.ceil(beats.length / 2);
    pcHalf = cellsN > 8 ? (pos && pos.b >= half ? 1 : 0) : -1;
    var b0 = pcHalf === 1 ? half : 0, b1 = pcHalf === 0 ? half : beats.length;
    rowEl.style.gridTemplateColumns = 'repeat(' + (b1 - b0) + ',minmax(0,1fr))';
    beats.forEach(function (halves, b) {
      if (b < b0 || b >= b1) return;
      var cell = document.createElement('div'); cell.className = 'pc-bt';
      var n = document.createElement('small'); n.className = 'bh'; n.textContent = b + 1; n.setAttribute('data-b', b); cell.appendChild(n); pcHeads.push(n);
      var wrap = document.createElement('div'); wrap.className = 'pc-in';
      halves.forEach(function (e, j) {
        var d = document.createElement('div');
        if (!e.free && !e.tak && !e.h && PC.hands) anyHand = true;
        d.className = 'pc-n' + (e.free ? ' free' : e.tak ? ' tak' : e.h === 'L' ? ' l' : e.h === 'mix' ? ' mix' : e.h === 'R' || !PC.hands ? ' r' : ' any');
        var big = document.createElement('b');
        if (e.h === 'mix') e.keys.forEach(function (k, i) { if (i) big.appendChild(document.createTextNode('+')); var sp = document.createElement('i'); sp.className = e.hands[i] === 'L' ? 'hl' : 'hr'; sp.textContent = k; big.appendChild(sp); });
        else big.textContent = e.free ? '?' : e.tak ? 'Tak' : e.keys.map(halves.length > 1 ? String : label).join('+');
        d.appendChild(big);
        var hs = document.createElement('span'); hs.textContent = e.h === 'mix' ? e.hands.map(function (x) { return x === 'L' ? 'L' : 'R'; }).join(' + ') : e.h === 'L' ? 'Left' : e.h === 'R' ? 'Right' : e.tak ? 'Knock' : PC.hands ? 'Any' : ' '; d.appendChild(hs);
        wrap.appendChild(d); pcCells[b + '.' + j] = d;
      });
      cell.appendChild(wrap); rowEl.appendChild(cell);
    });
    box.appendChild(rowEl);
    var key = [];
    if (PC.hands) key.push('<i class="r"></i>Right', '<i class="l"></i>Left');
    if (anyHand) key.push('<i class="a"></i>Any finger');
    if (/(^| )T( |$)/.test(sec.lines.join(' '))) key.push('<i class="t"></i>Tak');
    $('pcKey').innerHTML = key.join(' ') || ' ';
    $('pcNext').textContent = nextText(pos);
    pcAt = pos ? pos.si + '.' + pos.sr + '.' + pos.li : null;
  }
  function nextText(pos) {
    var pc = PC.pc, si = pos ? pos.si : S.pcSec, sec = pc.secs[si], li = pos ? pos.li : 0, lr = pos ? pos.lr : 0, sr = pos ? pos.sr : 0;
    var LR = sec.lineRep || pc.lineRep, SR = sec.secRep || pc.secRep, last = sec.lines.length - 1;
    var text = function (line) { return line.split(' ').map(parseBeat).map(beatText).join(' · '); };
    if (pcHalf === 0) return 'Next: the rest of this line';
    if (lr < LR - 1) return 'Next: the same line again';
    if (li < last) return 'Next: ' + text(sec.lines[li + 1]);
    if (sr < SR - 1) return 'Next: round ' + (sr + 2) + ' · back to line 1';
    if (pc.secs.length === 1) return 'Next: from the top';
    var ns = (si + 1) % pc.secs.length;
    return 'Next: ' + pc.secs[ns].n + (ns === 0 ? ', from the top' : '');
  }
  function pieceTick(t) {
    var pos = PC.seq[(PC.starts[S.pcSec] + t) % PC.seq.length];
    if (pcAt !== pos.si + '.' + pos.sr + '.' + pos.li) renderPiece(pos);
    else if ((PC.pc.secs[pos.si].lineRep || PC.pc.lineRep) > 1 && pos.b === 0 && pos.part === 0) renderPiece(pos);
    else if (pcHalf >= 0 && pcHalf !== (pos.b >= Math.ceil(pos.nb / 2) ? 1 : 0)) renderPiece(pos);
    if (pos.h === 0) pcHeads.forEach(function (x) { x.classList.toggle('on', +x.getAttribute('data-b') === pos.b); });
    if (pos.nb !== S.beats) S.beats = pos.nb;
    if (!pos.ev) return;
    for (var k in pcCells) pcCells[k].classList.toggle('cur', k === pos.b + '.' + pos.part);
    lightEv(pos.ev, pos.k > 1 ? interval(S) * 1000 * 0.6 : 0);
  }
  var pan = {}, panShell;
  function drawPan() {
    var svg = $('panSvg'); svg.innerHTML = ''; pan = {};
    svg.setAttribute('viewBox', '14 8 272 272');
    var used = {}; if (PC) PC.seq.forEach(function (q) { if (q.ev) (q.ev.opts || q.ev.keys).forEach(function (x) { used[x] = 1; }); });
    var mk = function (t, a, tx) { var el = document.createElementNS(NS, t); for (var k in a) el.setAttribute(k, a[k]); if (tx) el.textContent = tx; svg.appendChild(el); return el; };
    panShell = mk('circle', { cx: 150, cy: 142, r: 128, class: 'pshell' });
    var place = function (k, x, y, rx, ry, rot) {
      var u = used[k] ? ' use' : '';
      pan[k] = [mk('ellipse', { cx: x, cy: y, rx: rx, ry: ry, class: 'pf' + u, transform: 'rotate(' + rot + ' ' + x + ' ' + y + ')' }), mk('text', { x: x, y: y, class: 'pl' + u }, k === 'D' ? 'Ding' : k)];
    };
    var L = LAYOUTS[S.notes], n = L.ring, inner = L.inner > 0;
    var dr = inner ? 32 : 40, R = inner ? 92 : 86, rx = inner ? 19 : (n > 8 ? 21 : 25);
    place('D', 150, 142, dr, dr, 0);
    for (var i = 1; i <= n; i++) { var d = noteAngle(i, n), a = d * Math.PI / 180; place(String(i), 150 + R * Math.cos(a), 142 + R * Math.sin(a), rx, rx * 0.84, d + 90); }
    if (inner) [[n + 1, 236], [n + 2, 304]].forEach(function (q) { var a = q[1] * Math.PI / 180; place(String(q[0]), 150 + 57 * Math.cos(a), 142 + 57 * Math.sin(a), 15, 13, q[1] + 90); });
    var sm = $('sMap'); if (sm) { var c = svg.cloneNode(true); c.removeAttribute('id'); c.setAttribute('aria-hidden', 'true'); sm.innerHTML = ''; sm.appendChild(c); }
  }
  function lightPan(k) {
    for (var n in pan) { var on = n === k; pan[n][0].classList.toggle('on', on); pan[n][1].classList.toggle('on', on); pan[n][0].classList.remove('l', 'opt', 'any'); }
    if (panShell) panShell.classList.remove('on');
  }
  var offT = null;
  function lightEv(ev, dur) {
    clearTimeout(offT); lightPan(null);
    if (dur) offT = setTimeout(function () { lightPan(null); }, dur);
    if (ev.tak) { panShell.classList.add('on'); return; }
    if (ev.free) { ev.opts.forEach(function (k) { if (pan[k]) pan[k][0].classList.add('opt'); }); return; }
    ev.keys.forEach(function (k, i) { if (!pan[k]) return; pan[k][0].classList.add('on'); pan[k][1].classList.add('on'); var hd = ev.hands[i]; if (hd === 'L') pan[k][0].classList.add('l'); else if (!hd && PC && PC.hands) pan[k][0].classList.add('any'); });
  }

  // ---- tempo: big card (free), compact row (drills and lessons), typed value with Set / Cancel
  function setBpm(v) {
    S.bpm = Math.max(30, Math.min(200, Math.round(v)));
    if (document.activeElement !== $('pBpm')) $('pBpm').value = S.bpm;
    $('mBig').textContent = S.bpm; $('mRange').value = S.bpm; save();
  }
  $('mMinus').onclick = $('pMinus').onclick = function () { setBpm(S.bpm - 1); };
  $('mPlus').onclick = $('pPlus').onclick = function () { setBpm(S.bpm + 1); };
  $('mRange').oninput = function (e) { setBpm(+e.target.value); };
  (function () {
    var f = $('pBpm'), setB = $('pSetB'), cancel = $('pCancel'), hint = $('pHint'), setting = false;
    var lbl = function () {
      var v = parseInt(f.value, 10), c = isNaN(v) ? null : Math.max(30, Math.min(200, v));
      setB.querySelector('span').textContent = c === null ? 'Type a tempo' : 'Set ' + c + ' BPM';
      setB.disabled = c === null;
      hint.textContent = isNaN(v) ? '30 to 200' : v > 200 ? 'Max is 200' : v < 30 ? 'Lowest is 30' : '30 to 200';
      hint.classList.toggle('warn', !isNaN(v) && (v > 200 || v < 30));
    };
    var commit = function () {
      var v = parseInt(f.value, 10);
      if (isNaN(v)) { f.value = S.bpm; return; }
      if (v > 200) toast('Max is 200. Set to 200.'); else if (v < 30) toast('Lowest is 30. Set to 30.');
      setBpm(v); f.value = S.bpm;
    };
    f.addEventListener('focus', function () { document.body.classList.add('bpm-edit'); lbl(); setTimeout(function () { try { f.select(); } catch (e) {} }, 0); });
    f.addEventListener('input', function () { f.value = f.value.replace(/[^0-9]/g, '').slice(0, 3); lbl(); });
    f.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { setting = true; commit(); f.blur(); } if (e.key === 'Escape') { f.value = S.bpm; f.blur(); } });
    f.addEventListener('blur', function () { setTimeout(function () { if (!setting) f.value = S.bpm; setting = false; document.body.classList.remove('bpm-edit'); }, 0); });
    [setB, cancel].forEach(function (b) { b.addEventListener('mousedown', function (e) { e.preventDefault(); }); b.addEventListener('touchstart', function () { setting = b === setB; }, { passive: true }); });
    setB.onclick = function () { setting = true; commit(); f.blur(); document.body.classList.remove('bpm-edit'); };
    cancel.onclick = function () { setting = false; f.value = S.bpm; f.blur(); document.body.classList.remove('bpm-edit'); };
    // the big number in the metronome opens the same editor
    $('mEdit').onclick = function () { document.body.classList.add('bpm-edit'); f.focus(); };
  })();
  var taps = [];
  $('mTap').onclick = function () {
    var t = performance.now();
    if (taps.length && t - taps[taps.length - 1] > 2000) taps = [];
    taps.push(t); if (taps.length > 5) taps.shift();
    if (taps.length >= 2) { var gaps = 0; for (var i = 1; i < taps.length; i++) gaps += taps[i] - taps[i - 1]; setBpm(60000 / (gaps / (taps.length - 1))); }
    $('mTap').querySelector('span').textContent = taps.length >= 2 ? 'Tap tempo · ' + S.bpm : 'Tap again in time';
    clearTimeout($('mTap').t); $('mTap').t = setTimeout(function () { $('mTap').querySelector('span').textContent = 'Tap tempo'; }, 2500);
  };

  // ---- audio: Arpit's recorded Ding, Knock and Slap, or a classic beep
  var ctx, running = false, nextTime = 0, tick = 0, timer = null, queue = [], wake = null, keepAlive = null, out = null;
  var RAW = {}, BUF = {}, decoding = null;
  ['ding', 'knock', 'slap'].forEach(function (k) {
    try { fetch('/audio/' + k + '.mp3').then(function (r) { return r.ok ? r.arrayBuffer() : null; }).then(function (b) { if (b) RAW[k] = b; }).catch(function () {}); } catch (e) {}
  });
  // recordings start with a little silence (and mp3 adds some): play each from its first sound
  function onsetOf(buf) {
    var d = buf.getChannelData(0), pk = 0, i; for (i = 0; i < d.length; i++) if (Math.abs(d[i]) > pk) pk = Math.abs(d[i]);
    for (i = 0; i < d.length; i++) if (Math.abs(d[i]) > pk * 0.05) break;
    return Math.max(0, i - 48) / buf.sampleRate;
  }
  function decodeAll() {
    if (!ctx || !ctx.decodeAudioData) return Promise.resolve();
    var c = ctx;
    decoding = Promise.all(['ding', 'knock', 'slap'].map(function (k) {
      if ((BUF[k] && BUF[k].ctx === c) || !RAW[k]) return null;
      return new Promise(function (res) {
        try { var p = c.decodeAudioData(RAW[k].slice(0), function (b) { BUF[k] = { buf: b, off: onsetOf(b), ctx: c }; res(); }, function () { res(); }); if (p && p.catch) p.catch(function () { res(); }); } catch (e) { res(); }
      });
    }));
    return decoding;
  }
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
  function outNode() {
    if (out && out.ctx === ctx) return out.node;
    var node = ctx.destination;
    try { if (ctx.createDynamicsCompressor) { var cp = ctx.createDynamicsCompressor(); cp.threshold.value = -8; cp.knee.value = 4; cp.ratio.value = 12; cp.attack.value = 0.001; cp.release.value = 0.12; cp.connect(ctx.destination); node = cp; } } catch (e) { node = ctx.destination; }
    out = { ctx: ctx, node: node }; return node;
  }
  function beep(time, kind) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    var f = { accent: 1600, beat: 1050, sub: 720 }[kind], v = 0.8 * ({ accent: 1, beat: 0.75, sub: 0.4 }[kind]);
    o.type = 'triangle'; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0, time); g.gain.linearRampToValueAtTime(v, time + 0.003); g.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
    o.start(time); o.stop(time + 0.08);
  }
  var GAIN = { ding: 0.75, knock: { beat: 1.5, sub: 0.85 }, slap: { beat: 1.2, sub: 0.7 } };
  function hit(time, kind, snd) {
    snd = snd || S.sound;
    var name = kind === 'accent' ? 'ding' : snd, b = BUF[name];
    if (snd === 'beep' || !b || b.ctx !== ctx) { beep(time, kind); return; }
    var src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = b.buf; g.gain.value = name === 'ding' ? GAIN.ding : GAIN[name][kind === 'sub' ? 'sub' : 'beat'];
    src.connect(g); g.connect(outNode()); src.start(time, b.off);
  }
  function pieceInfo(t) {
    var pos = PC.seq[(PC.starts[S.pcSec] + t) % PC.seq.length];
    return { isBeat: pos.h === 0, beat: pos.b, bar: 0, muted: false, off: false, kind: pos.h ? 'sub' : (pos.b === 0 ? 'accent' : 'beat'), quiet: pos.h > 0 && !PC.split[pos.si] };
  }
  function schedule() {
    while (nextTime < ctx.currentTime + 0.12) {
      var q = S.mode === 'lesson' && PC ? pieceInfo(tick) : tickInfo(S, tick);
      if (!q.muted && !q.off && !q.quiet) hit(nextTime, q.kind);
      q.time = nextTime; q.tick = tick; queue.push(q);
      nextTime += interval(S); tick++;
    }
  }
  function draw() {
    if (!running) return;
    while (queue.length && queue[0].time <= ctx.currentTime) {
      var q = queue.shift();
      if (S.mode === 'lesson' && PC) pieceTick(q.tick);
      if (q.isBeat && S.mode !== 'lesson') { lightBox(q.beat, q.muted); if (S.mode === 'drill') drillStat(q); }
    }
    requestAnimationFrame(draw);
  }
  var starting = false;
  function fresh(AC) { try { if (ctx && ctx.close) ctx.close(); } catch (e) {} ctx = new AC(); }
  function wakeUp() { return Promise.race([Promise.resolve().then(function () { return ctx.resume(); }).then(function () { return true; }, function () { return false; }), new Promise(function (z) { setTimeout(function () { z(false); }, 600); })]); }
  var alive = function () { return !ctx.state || ctx.state === 'running'; };
  // After the app was in the background, iPhones can leave the audio clock stopped for good.
  // Start makes a fresh clock in the same tap when the old one is not running, and never waits forever.
  async function ready() {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    if (!ctx || (ctx.state && ctx.state !== 'running')) fresh(AC);
    unlock();
    if (!(await wakeUp()) || !alive()) { fresh(AC); unlock(); await wakeUp(); }
    if (!alive()) return false;
    await Promise.race([decodeAll(), new Promise(function (z) { setTimeout(z, 800); })]);
    return true;
  }
  async function start() {
    if (starting || running) return;
    starting = true; var ok = await ready(); starting = false;
    if (!ok) { toast('Tap Start again'); return; }
    S.played = true; if (S.mode === 'lesson') { S.lastPiece = S.piece; S.lastSec = S.pcSec; } save();
    running = true; tick = 0; queue = []; nextTime = ctx.currentTime + 0.08;
    schedule(); timer = setInterval(schedule, 25); requestAnimationFrame(draw);
    $('pPlay').innerHTML = STOP; $('pPlay').setAttribute('aria-label', 'Stop'); document.body.classList.add('playing');
    try { wake = await navigator.wakeLock.request('screen'); } catch (e) { wake = null; }
  }
  function stop() {
    running = false; clearInterval(timer); queue = [];
    clearTimeout(offT); lightPan(null); lightBox(-1, false);
    $('pPlay').innerHTML = PLAY; $('pPlay').setAttribute('aria-label', 'Start'); document.body.classList.remove('playing');
    pcHeads.forEach(function (x) { x.classList.remove('on'); });
    if (S.mode === 'lesson' && PC) renderPiece(null);
    if (S.mode === 'drill') drillStat(null);
    try { if (wake) wake.release(); } catch (e) {} wake = null;
    try { if (keepAlive) keepAlive.pause(); } catch (e) {}
  }
  function toggle() { if (running) stop(); else start(); }
  $('pPlay').onclick = toggle;
  async function preview(k) {
    if (running) stop();
    if (!(await ready())) { toast('Tap again to listen'); return; }
    var t = ctx.currentTime + 0.05;
    if (k === 'beep') { beep(t, 'accent'); beep(t + 0.5, 'beat'); beep(t + 1, 'beat'); return; }
    hit(t, 'accent', k); hit(t + 0.5, 'beat', k); hit(t + 1, 'beat', k);
  }
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && !/INPUT|SELECT|BUTTON|TEXTAREA/.test(e.target.tagName) && $('sheet').hidden) { e.preventDefault(); toggle(); }
    if (e.key === 'Escape' && !$('sheet').hidden) closeSheet();
  });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && running) stop(); });
  window.addEventListener('pagehide', function () { if (running) stop(); });

  // ---- theme: only this page has a dark mode
  function applyTheme() {
    if (S.theme === 'light' || S.theme === 'dark') document.documentElement.setAttribute('data-theme', S.theme); else document.documentElement.removeAttribute('data-theme');
    var cur = S.theme === 'light' || S.theme === 'dark' ? S.theme : (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>';
    var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
    var b = $('th'); b.innerHTML = cur === 'dark' ? SUN : MOON; b.setAttribute('aria-label', cur === 'dark' ? 'Switch to light' : 'Switch to dark'); b.setAttribute('data-cur', cur);
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', cur === 'dark' ? '#1a1214' : '#f5eee5');
  }
  $('th').onclick = function () { S.theme = $('th').getAttribute('data-cur') === 'dark' ? 'light' : 'dark'; save(); applyTheme(); };
  applyTheme();
  if (MQ.addEventListener) MQ.addEventListener('change', showTab); else if (MQ.addListener) MQ.addListener(showTab);

  // ---- start
  $('pPlay').innerHTML = PLAY; $('back').hidden = !STUDENT;
  var keep = S.bpm;
  if (S.mode === 'lesson') loadPiece(S.piece, false);
  else if (S.mode === 'drill') loadDrill(S.drill, false);
  else loadFree();
  setBpm(keep);
  // arriving from My classes: Start opens pattern 1, Continue opens where the student stopped, Choose opens the lessons
  if (jump === 'start' && STUDENT) loadPiece('scale', true);
  S.tab = jump === 'lessons' ? (STUDENT ? 'lessons' : 'timing') : jump === 'timing' ? 'timing' : 'met';
  if (S.tab !== 'met') S.list = S.tab;
  renderLists(); renderOpts(); showTab();

  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('/pages/practice-sw.js', { scope: '/pages/practice' }).catch(function () {}); });
})();
