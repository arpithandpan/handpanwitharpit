/* Rhythm practice (students). Timing engine from Handpan Metronome v5, in the site's brand.
   Exercises and patterns are plain data, so they can later come from the dashboard. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var NS = 'http://www.w3.org/2000/svg';

  var EX = [
    { t: 'One per beat', p: 'One click on every beat. Play one note on each click. Clapping works too.', g: '4 clean bars at 60 BPM', bpm: 60, beats: 4, sub: 1, accent: false, gap: null, min: '3 min' },
    { t: 'Two per beat', p: 'Every beat has 2 clicks. Play on each click and count "1 & 2 &" out loud.', g: '4 clean rounds at 60 BPM', bpm: 60, beats: 4, sub: 2, accent: false, gap: null, min: '4 min' },
    { t: 'Lean on beat 1', p: 'Play beat 1 a little louder. The higher click marks it.', g: '8 bars, beat 1 always clear', bpm: 65, beats: 4, sub: 2, accent: true, gap: null, min: '4 min' },
    { t: 'Four per beat', p: 'Every beat has 4 clicks. Play on each click and count "1 e & a". Keep all four evenly spaced.', g: '4 clean rounds at 45 BPM', bpm: 45, beats: 4, sub: 4, accent: true, gap: null, min: '5 min' },
    { t: 'Silent bars', p: 'The click stops for 2 bars. Keep going and land back on beat 1.', g: 'Land on 1 after the gap', bpm: 60, beats: 4, sub: 2, accent: true, gap: [2, 2], min: '5 min' },
    { t: 'On your own', p: '1 bar of click, 3 bars silent. Your inner clock does the work.', g: 'Land on 1, three times', bpm: 60, beats: 4, sub: 1, accent: true, gap: [1, 3], min: '5 min' }
  ];
  var PRESETS = [
    { name: 'Scale up', steps: ['1', '2', '3', '4', '5', '6', '7', '8'] }
  ];

  // Pieces Arpit teaches. One word per beat: 4R = note 4 right hand, DR = Ding right hand, T = Tak,
  // 4+6 = two notes together, D,D = two notes inside one beat. Each line is played lineRep times, each part secRep times.
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
    { id: 'pingpong', t: 'Ping Pong', sum: 'Two hands · coming later', tag: 'later', soon: true }
  ];
  function parseBeat(tok) {
    return tok.split(',').map(function (h) {
      if (h === 'T') return { keys: [], hands: [], tak: true, h: null };
      var xm = /^X([RL]?)$/.exec(h);
      if (xm) return { keys: [], hands: [], free: true, opts: ['6', '7', '8', '1'], h: xm[1] || null };
      // each note of a pair can have its own hand: 4L+6R
      var parts = h.split('+').map(function (x) { return /^(.+?)([RL]?)$/.exec(x); });
      var hands = parts.map(function (m) { return m[2] || null; });
      var same = hands.every(function (x) { return x === hands[0]; });
      return { keys: parts.map(function (m) { return m[1]; }), hands: hands, tak: false, h: same ? hands[0] : 'mix' };
    });
  }
  // the whole piece as one list of ticks, in playing order
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
    var kind = isBeat ? (beat === 0 && s.accent ? 'accent' : 'beat') : 'sub';
    return { isBeat: isBeat, beat: beat, bar: bar, muted: muted, kind: kind, step: s.pat && s.pat.length ? tick % s.pat.length : -1 };
  }
  function interval(s) { return 60 / s.bpm / s.sub; }
  // Note 1 nearest the player (bottom), then 2 left, 3 right, 4 left … the last one at the top.
  function noteAngle(i, n) { var st = 360 / n; if (i === 1) return 90; var j = Math.floor(i / 2); return i % 2 === 0 ? 90 + st * j : 90 - st * j; }
  window.__met = { pieceInfo: function (t) { return pieceInfo(t); }, tickInfo: tickInfo, interval: interval, noteAngle: noteAngle, EX: EX, PIECES: PIECES, pieceSeq: pieceSeq };

  // ---- who can open it: students with weekly classes (soft gate: the page holds no private data)
  var token = '', role = '';
  try {
    if (location.hash === '#teacher') { localStorage.setItem('hp_practice_teacher', '1'); history.replaceState(null, '', location.pathname); }
    var jump = location.hash === '#play' || location.hash === '#start' ? location.hash.slice(1) : '';
    if (jump) history.replaceState(null, '', location.pathname);
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
  var S = { ex: 1, piece: null, pcSec: 0, done: [], bpm: 60, beats: 4, sub: 2, accent: false, gap: null, notes: 9, pat: PRESETS[0].steps.slice(), hp: true, vol: 80 };
  var fixPat = function () { var ok = PRESETS.some(function (q) { return q.steps.join() === (S.pat || []).join(); }); if (!ok) S.pat = PRESETS[0].steps.slice(); };
  try { var saved = JSON.parse(localStorage.getItem(STORE) || '{}'); for (var k in saved) S[k] = saved[k]; } catch (e) {}
  if (!(S.ex >= 0 && S.ex < EX.length)) S.ex = 0;
  var pieceOf = function (id) { for (var i = 0; i < PIECES.length; i++) if (PIECES[i].id === id && !PIECES[i].soon) return PIECES[i]; return null; };
  if (S.piece && !pieceOf(S.piece)) S.piece = null;
  fixPat();
  // the handpan is chosen by its total notes, Ding included, as makers name them (9, 10, 12 …)
  // the pieces use notes 1 to 8, so the smallest pan is 9 (Ding + 8)
  var LAYOUTS = { 9: { ring: 8, inner: 0 }, 10: { ring: 9, inner: 0 }, 12: { ring: 9, inner: 2 } };
  if (!LAYOUTS[S.notes]) S.notes = S.size === 9 ? 10 : 9;   // older saves kept notes around the Ding
  delete S.size;
  // text with **bold** parts (our own data only)
  function setRich(el, txt) {
    el.textContent = '';
    txt.split('**').forEach(function (part, i) { if (!part) return; var n = i % 2 ? document.createElement('b') : document.createTextNode(part); if (i % 2) n.textContent = part; el.appendChild(n); });
  }
  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify(S));
      if (S.played) {
        var pc = S.piece && pieceOf(S.piece), last = pc ? { t: pc.t, s: pc.secs[Math.min(S.pcSec || 0, pc.secs.length - 1)].n.replace('Variation ', 'Var ') } : { t: EX[S.ex].t, s: 'Exercise ' + (S.ex + 1) };
        last.bpm = S.bpm; localStorage.setItem('hp_practice_last', JSON.stringify(last));
      }
    } catch (e) {}
  }
  // phones: a list screen and a player screen instead of one long page
  var MQ = window.matchMedia ? window.matchMedia('(max-width: 899px)') : { matches: false };
  var isPhone = function () { return !!MQ.matches; };
  if (S.lib !== 'ex') S.lib = 'pc';
  if (S.mview !== 'map') S.mview = 'dial';

  // ---- exercises
  // ---- the library: a Continue card, then shelves. Each shelf shows 3 and "See all";
  // a new shelf or a new item is only data, the layout never changes.
  var SHOW = 3;
  function itemBtn(isPc, idx, t, sub, tag, on, done, soon) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ex' + (isPc ? ' pc' : '') + (on ? ' on' : '') + (done && !on ? ' done' : '') + (soon ? ' soon' : '');
    b.setAttribute('aria-current', on ? 'true' : 'false'); if (soon) b.disabled = true;
    b.innerHTML = '<span class="n">' + (done && !on ? '✓' : idx + 1) + '</span><span><b></b><small></small></span><span class="t"></span>';
    b.querySelector('b').textContent = t; b.querySelector('small').textContent = sub; b.querySelector('.t').textContent = tag;
    return b;
  }
  function renderList() {
    var L = $('exList'); L.innerHTML = '';
    // Continue: where this student stopped last time
    var lib = $('lib'); lib.innerHTML = '';
    if (S.played) {
      var pc0 = S.piece && pieceOf(S.piece), c = document.createElement('button');
      c.type = 'button'; c.className = 'cont'; c.id = 'contP';
      c.innerHTML = '<span class="cont-t"><span class="ck">Continue</span><b></b></span><span class="cbtn"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg></span>';
      c.querySelector('b').textContent = pc0 ? pc0.t + ' · ' + pc0.secs[Math.min(S.pcSec, pc0.secs.length - 1)].n.replace('Variation ', 'Var ') : EX[S.ex].t + ' · ' + S.bpm + ' BPM';
      c.onclick = function () { openPlayer(); };
      lib.appendChild(c);
    }
    var shelves = [
      { id: 'pc', t: 'Your class patterns', sub: 'What Arpit teaches in your lessons', n: PIECES.filter(function (x) { return !x.soon; }).length,
        items: PIECES.map(function (pc, pi) {
          var b = itemBtn(true, pi, pc.t, pc.sum, pc.tag, S.piece === pc.id, S.done.indexOf('p:' + pc.id) >= 0, pc.soon);
          if (!pc.soon) b.onclick = function () { pickPiece(pc.id, true); openPlayer(); };
          return b;
        }) },
      { id: 'ex', t: 'Timing drills', sub: 'Build steady time · any instrument', n: EX.length,
        items: EX.map(function (e, i) {
          var b = itemBtn(false, i, e.t, e.g, e.min, !S.piece && i === S.ex, S.done.indexOf(i) >= 0, false);
          b.onclick = function () { pick(i, true); openPlayer(); };
          return b;
        }) }
    ];
    var only = S.shelf === 'pc' || S.shelf === 'ex' ? S.shelf : null;
    if (only) {
      var bk = document.createElement('button'); bk.type = 'button'; bk.className = 'shback';
      bk.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>All practice';
      bk.onclick = function () { S.shelf = null; save(); renderList(); window.scrollTo(0, 0); };
      L.appendChild(bk);
    }
    shelves.forEach(function (sh) {
      if (only && sh.id !== only) return;
      var h = document.createElement('div'); h.className = 'shh'; h.setAttribute('data-shelf', sh.id);
      h.innerHTML = '<div><h2><span></span> <i></i></h2><small></small></div>';
      h.querySelector('span').textContent = sh.t; h.querySelector('i').textContent = sh.n; h.querySelector('small').textContent = sh.sub;
      if (!only && sh.items.length > SHOW) {
        var see = document.createElement('button'); see.type = 'button'; see.className = 'see';
        see.textContent = 'See all ›';
        see.onclick = function () { S.shelf = sh.id; save(); renderList(); window.scrollTo(0, 0); };
        h.appendChild(see);
      }
      L.appendChild(h);
      sh.items.forEach(function (b, k) { if (!only && k >= SHOW) b.classList.add('more'); L.appendChild(b); });
    });
  }
  function pick(i, fromTap) {
    var e = EX[i]; S.ex = i; if (running && S.piece) stop(); S.piece = null;
    // the exercise always sets its own beats, clicks, accent and gap; a tap also resets the tempo, a reopen keeps the student's tempo
    if (fromTap) S.bpm = e.bpm;
    S.beats = e.beats; S.sub = e.sub; S.accent = e.accent; S.gap = e.gap;
    $('exK').textContent = 'Exercise ' + (i + 1); $('exT').textContent = e.t; $('exP').textContent = e.p; $('exG').textContent = 'Goal: ' + e.g;
    setBpm(S.bpm); drawDial(); renderChips(); renderList(); renderDone(); applyMode(); if (pan.D) drawPan(); playerHead(); save();
  }
  // ---- pieces
  var PC = null, pcCells = {}, pcHeads = [], pcAt = null, pcHalf = -1;
  function pickPiece(id, fromTap) {
    var pc = pieceOf(id); if (!pc) return;
    if (running) stop();
    S.piece = id; PC = pieceSeq(pc); PC.pc = pc; PC.split = pc.secs.map(function (x) { return x.lines.join(' ').indexOf(',') >= 0; }); PC.hands = /\d[RL]|D[RL]/.test(pc.secs.map(function (x) { return x.lines.join(' '); }).join(' '));
    if (fromTap) { S.bpm = pc.bpm; S.pcSec = 0; }
    if (!(S.pcSec >= 0 && S.pcSec < pc.secs.length)) S.pcSec = 0;
    S.beats = pc.secs[0].lines[0].split(' ').length; S.sub = pc.sub; S.accent = true; S.gap = null;
    $('exK').textContent = 'Piece from Arpit'; $('exT').textContent = pc.t; setRich($('exP'), pc.p); $('exG').textContent = 'Goal: ' + pc.g;
    setBpm(S.bpm); drawDial(); renderChips(); renderList(); renderDone(); applyMode(); renderPiece(null); drawPan(); playerHead(); save();
  }
  function applyMode() {
    var pc = !!S.piece;
    $('pcBox').hidden = !pc; $('hpTog').hidden = pc; $('strip').hidden = pc; $('pats').hidden = pc || PRESETS.length < 2;
    $('hpBox').hidden = pc ? false : !S.hp;
    if (!pc) PC = null;
  }
  var label = function (k) { return k === 'D' ? 'Ding' : k; };
  function beatText(halves) {
    return halves.map(function (e) { return e.free ? '?' + (e.h || '') : e.tak ? 'Tak' : e.keys.map(function (k, i) { return e.hands[i] ? (k === 'D' ? 'D' : k) + e.hands[i] : label(k); }).join('+'); }).join(' ');
  }
  function renderPiece(pos) {
    var pc = PC.pc, si = pos ? pos.si : S.pcSec, sec = pc.secs[si];
    var tabs = $('pcTabs'); tabs.innerHTML = '';
    pc.secs.forEach(function (x, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = x.n.replace('Variation ', 'Var '); b.setAttribute('aria-label', x.n);
      b.setAttribute('aria-pressed', String(i === si));
      b.onclick = function () { var was = running; if (was) stop(); S.pcSec = i; save(); renderPiece(null); if (was) start(); };
      tabs.appendChild(b);
    });
    var onTab = tabs.children[si]; if (onTab && tabs.scrollWidth > tabs.clientWidth) tabs.scrollLeft = onTab.offsetLeft - (tabs.clientWidth - onTab.offsetWidth) / 2;
    if (!pos) { var nb0 = sec.lines[0].split(' ').length; if (nb0 !== S.beats) { S.beats = nb0; drawDial(); renderChips(); } }
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
    var curLi = pos ? pos.li : 0;
    // long parts show a window around the current line, so the map stays in view
    var lo = 0, hi = sec.lines.length - 1;
    if (sec.lines.length > 6) { lo = Math.max(0, Math.min(curLi - 1, sec.lines.length - 5)); hi = lo + 4; }
    sec.lines.forEach(function (line, li) {
      if (li < lo || li > hi) return;
      var beats = line.split(' ').map(parseBeat), row = document.createElement('div');
      if (li !== curLi) { row.className = 'pc-ln' + (pos && li < curLi ? ' past' : ''); row.textContent = beats.map(beatText).join('  '); box.appendChild(row); return; }
      row.className = 'pc-now';
      var cellsN = beats.reduce(function (a, h) { return a + h.length; }, 0), half = Math.ceil(beats.length / 2);
      pcHalf = cellsN > 8 ? (pos && pos.b >= half ? 1 : 0) : -1;
      var b0 = pcHalf === 1 ? half : 0, b1 = pcHalf === 0 ? half : beats.length;
      row.style.gridTemplateColumns = 'repeat(' + (b1 - b0) + ',minmax(0,1fr))';
      beats.forEach(function (halves, b) {
        if (b < b0 || b >= b1) return;
        var cell = document.createElement('div'); cell.className = 'pc-bt';
        var n = document.createElement('small'); n.className = 'bh'; n.textContent = b + 1; n.setAttribute('data-b', b); cell.appendChild(n); pcHeads.push(n);
        var wrap = document.createElement('div'); wrap.className = 'pc-in';
        halves.forEach(function (e, j) {
          var d = document.createElement('div');
          if (!e.free && !e.tak && !e.h && PC.hands) anyHand = true;
          d.className = 'pc-n' + (e.free ? ' free' : e.tak ? ' tak' : e.h === 'L' ? ' l' : e.h === 'mix' ? ' mix' : e.h === 'R' || !PC.hands ? ' r' : ' any') + (sec.root && e.keys.length === 1 && e.keys[0] === sec.root ? ' root' : '');
          var big = document.createElement('b');
          if (e.h === 'mix') e.keys.forEach(function (k, i) { if (i) big.appendChild(document.createTextNode('+')); var sp = document.createElement('i'); sp.className = e.hands[i] === 'L' ? 'hl' : 'hr'; sp.textContent = k; big.appendChild(sp); });
          else big.textContent = e.free ? '?' : e.tak ? 'Tak' : e.keys.map(halves.length > 1 ? String : label).join('+');
          d.appendChild(big);
          if (e.free) { var fs = document.createElement('span'); fs.textContent = 'Your note'; d.appendChild(fs); }
          if (!e.free) { var hs = document.createElement('span'); hs.textContent = e.h === 'mix' ? e.hands.map(function (x) { return x === 'L' ? 'L' : 'R'; }).join(' + ') : e.h === 'L' ? 'Left' : e.h === 'R' ? 'Right' : e.tak ? 'Knock' : PC.hands ? 'Any' : '\u00a0'; d.appendChild(hs); }
          wrap.appendChild(d); pcCells[b + '.' + j] = d;
        });
        cell.appendChild(wrap); row.appendChild(cell);
      });
      box.appendChild(row);
    });
    if (hi < sec.lines.length - 1) { var more = document.createElement('div'); more.className = 'pc-ln past'; more.textContent = '+ ' + (sec.lines.length - 1 - hi) + ' more lines'; box.appendChild(more); }
    // key: only what this piece uses
    var all = pc.secs.map(function (x) { return x.lines.join(' '); }).join(' '), key = [];
    if (PC.hands) key.push('<i class="r"></i>Right', '<i class="l"></i>Left');
    if (anyHand) key.push('<i class="a"></i>Any finger');
    var here = sec.lines.join(' ');
    if (/(^| )T( |$)/.test(here)) key.push('<i class="t"></i>Tak');
    if (/(^| )X( |$)/.test(here)) key.push('<i class="o"></i>Your choice');
    if (sec.root) key.push('<i class="o"></i>Back to ' + sec.root);
    $('pcKey').innerHTML = key.join(' ') || '\u00a0';
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
    else if ((PC.pc.secs[pos.si].lineRep || PC.pc.lineRep) > 1 && pos.b === 0 && pos.part === 0) renderPiece(pos);   // new time through the same line
    else if (pcHalf >= 0 && pcHalf !== (pos.b >= Math.ceil(pos.nb / 2) ? 1 : 0)) renderPiece(pos);   // long bar: second half
    if (pos.h === 0) pcHeads.forEach(function (x) { x.classList.toggle('on', +x.getAttribute('data-b') === pos.b); });
    if (pos.nb !== S.beats) { S.beats = pos.nb; drawDial(); renderChips(); }
    if (!pos.ev) return;
    for (var k in pcCells) pcCells[k].classList.toggle('cur', k === pos.b + '.' + pos.part);
    // notes inside one beat (two quick Dings) flash on and off, so each hit shows as its own flash
    lightEv(pos.ev, pos.k > 1 ? interval(S) * 1000 * 0.6 : 0);
  }
  function renderChips() {
    var c = $('chips'); c.innerHTML = '';
    var add = function (txt) { var s = document.createElement('span'); s.className = 'chip'; s.textContent = txt; c.appendChild(s); };
    add(S.beats + ' beats'); add(S.sub === 1 ? '1 click per beat' : S.sub + ' clicks per beat'); if (S.accent) add('Accent on 1'); if (S.gap) add(S.gap[0] + ' on · ' + S.gap[1] + ' off');
  }
  function doneKey() { return S.piece ? 'p:' + S.piece : S.ex; }
  function renderDone() {
    var d = S.done.indexOf(doneKey()) >= 0, b = $('doneBtn'); if (!b) return;
    b.classList.toggle('is-done', d); b.querySelector('span').textContent = d ? 'Goal reached' : 'I reached the goal';
  }
  if ($('doneBtn')) $('doneBtn').onclick = function () {
    var i = S.done.indexOf(doneKey());
    if (i >= 0) S.done.splice(i, 1); else S.done.push(doneKey());
    renderDone(); renderList(); save();
  };

  function setBpm(v) { S.bpm = Math.max(30, Math.min(200, Math.round(v))); $('bpm').value = S.bpm; if (document.activeElement !== $('bpmText')) $('bpmText').value = S.bpm; if (document.activeElement !== $('pBpm')) $('pBpm').value = S.bpm; $('pRange').value = S.bpm; save(); }
  $('bpm').oninput = function (e) { setBpm(+e.target.value); };
  // the tempo number is a field: tap, type, Done (or tap away) sets it
  var toastT = null;
  function toast(msg) { var t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2200); }
  [$('bpmText'), $('pBpm')].forEach(function (f) {
    f.addEventListener('focus', function () { setTimeout(function () { try { f.select(); } catch (e) {} }, 0); });
    f.addEventListener('click', function (e) { e.stopPropagation(); });
    f.addEventListener('input', function () { f.value = f.value.replace(/[^0-9]/g, '').slice(0, 3); });
    var commit = function () {
      var v = parseInt(f.value, 10);
      if (isNaN(v)) { f.value = S.bpm; return; }
      if (v > 200) toast('Max is 200. Set to 200.'); else if (v < 30) toast('Lowest is 30. Set to 30.');
      setBpm(v); f.value = S.bpm; renderLib();
    };
    f.commit = commit;
    if (f.id === 'bpmText') { f.addEventListener('change', commit); f.addEventListener('blur', commit); }
    f.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { commit(); f.blur(); } if (e.key === 'Escape') { f.value = S.bpm; f.blur(); } });
  });
  // phone keypads have no Done key: while typing, the Start button becomes "Set N BPM" with Cancel beside it
  (function () {
    var f = $('pBpm'), setB = $('pSetB'), cancel = $('pCancel'), hint = $('pHint'), setting = false;
    var label = function () {
      var v = parseInt(f.value, 10), c = isNaN(v) ? null : Math.max(30, Math.min(200, v));
      setB.querySelector('span').textContent = c === null ? 'Type a tempo' : 'Set ' + c + ' BPM';
      setB.disabled = c === null;
      hint.textContent = isNaN(v) ? '30 to 200' : v > 200 ? 'Max is 200' : v < 30 ? 'Lowest is 30' : '30 to 200';
      hint.classList.toggle('warn', !isNaN(v) && (v > 200 || v < 30));
    };
    f.addEventListener('focus', function () { document.body.classList.add('bpm-edit'); label(); });
    f.addEventListener('input', label);
    f.addEventListener('blur', function () { setTimeout(function () { if (!setting) f.value = S.bpm; setting = false; document.body.classList.remove('bpm-edit'); }, 0); });
    [setB, cancel].forEach(function (b) { b.addEventListener('mousedown', function (e) { e.preventDefault(); }); b.addEventListener('touchstart', function () { setting = b === setB; }, { passive: true }); });
    setB.onclick = function () { setting = true; f.commit(); f.blur(); document.body.classList.remove('bpm-edit'); };
    cancel.onclick = function () { setting = false; f.value = S.bpm; f.blur(); document.body.classList.remove('bpm-edit'); };
  })();
  $('minus').onclick = function () { setBpm(S.bpm - 1); };
  $('plus').onclick = function () { setBpm(S.bpm + 1); };
  $('vol').value = S.vol; $('vol').oninput = function (e) { S.vol = +e.target.value; save(); };

  // ---- beat dial
  var fields = [], ding;
  function drawDial() {
    if ($('exBar')) drawExBar();
    var pd = $('pDots'); pd.innerHTML = ''; for (var di = 0; di < S.beats; di++) pd.appendChild(document.createElement('i'));
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
    svg.setAttribute('viewBox', '14 8 272 272');
    var used = {}; if (S.piece && PC) PC.seq.forEach(function (q) { if (q.ev) (q.ev.opts || q.ev.keys).forEach(function (x) { used[x] = 1; }); }); else S.pat.forEach(function (x) { used[x] = 1; });
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
    // 12-note pans: two smaller notes inside the ring, above the Ding (left, then right)
    if (inner) [[n + 1, 236], [n + 2, 304]].forEach(function (q) { var a = q[1] * Math.PI / 180; place(String(q[0]), 150 + 57 * Math.cos(a), 142 + 57 * Math.sin(a), 15, 13, q[1] + 90); });
    mk('text', { x: 150, y: 292, class: 'you' }, 'YOU SIT HERE');
    var sm = $('sMap'); if (sm) { var c = svg.cloneNode(true); c.removeAttribute('id'); c.setAttribute('aria-hidden', 'true'); sm.innerHTML = ''; sm.appendChild(c); }
  }
  function renderStrip() {
    var el = $('strip'); el.innerHTML = ''; stripEls = [];
    el.style.gridTemplateColumns = 'repeat(' + Math.min(S.pat.length, 8) + ',1fr)';
    S.pat.forEach(function (s) { var d = document.createElement('div'); d.className = 'note' + (s === 'D' ? ' d' : ''); d.textContent = s; el.appendChild(d); stripEls.push(d); });
  }
  function lightPan(k) {
    for (var n in pan) { var on = n === k; pan[n][0].classList.toggle('on', on); pan[n][1].classList.toggle('on', on); pan[n][0].classList.remove('l', 'opt', 'any'); }
    if (panShell) panShell.classList.remove('on');
  }
  // a piece step: one or more notes in one hand's colour, or a Tak on the rim; the same note twice in a row flashes again
  var offT = null;
  function lightEv(ev, dur) {
    clearTimeout(offT); lightPan(null);
    if (dur) offT = setTimeout(function () { lightPan(null); }, dur);
    if (ev.tak) { panShell.classList.add('on'); return; }
    if (ev.free) { ev.opts.forEach(function (k) { if (pan[k]) pan[k][0].classList.add('opt'); }); return; }
    ev.keys.forEach(function (k, i) { if (!pan[k]) return; pan[k][0].classList.add('on'); pan[k][1].classList.add('on'); var hd = ev.hands[i]; if (hd === 'L') pan[k][0].classList.add('l'); else if (!hd && PC && PC.hands) pan[k][0].classList.add('any'); });
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
    [9, 10, 12].forEach(function (n) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = n;
      b.setAttribute('aria-pressed', String(S.notes === n));
      b.onclick = function () { S.notes = n; drawPan(); renderSizes(); save(); };
      box.appendChild(b);
    });
  }
  function setHp(on) { S.hp = on; $('hpTog').setAttribute('aria-checked', String(on)); $('hpBox').hidden = !on && !S.piece; save(); }
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
  // in a piece every line is one bar: the strong click starts each line, whatever its length
  function pieceInfo(t) {
    var pos = PC.seq[(PC.starts[S.pcSec] + t) % PC.seq.length];
    return { isBeat: pos.h === 0, beat: pos.b, bar: 0, muted: false, kind: pos.h ? 'sub' : (pos.b === 0 ? 'accent' : 'beat'), step: -1, quiet: pos.h > 0 && !PC.split[pos.si] };
  }
  function schedule() {
    while (nextTime < ctx.currentTime + 0.12) {
      var q = S.piece && PC ? pieceInfo(tick) : tickInfo(S, tick);
      if (!q.muted && !q.quiet) click(nextTime, q.kind);
      q.time = nextTime; q.tick = tick; queue.push(q);
      nextTime += interval(S); tick++;
    }
  }
  function draw() {
    if (!running) return;
    while (queue.length && queue[0].time <= ctx.currentTime) {
      var q = queue.shift();
      if (S.piece && PC) pieceTick(q.tick);
      else if (S.pat.length && q.step >= 0) { stripEls.forEach(function (n, j) { n.classList.toggle('on', j === q.step); }); lightPan(S.pat[q.step]); }
      if (q.isBeat) {
        Array.prototype.forEach.call($('pDots').children, function (d, i) { d.classList.toggle('on', i === q.beat); });
        fields.forEach(function (f, i) { f.classList.toggle('on', i === q.beat); f.classList.toggle('muted', q.muted); });
        ding.classList.add('pulse'); setTimeout(function () { ding.classList.remove('pulse'); }, 90);
        $('gapNote').textContent = q.muted ? 'silent · keep going' : '';
        $('pSilent').textContent = q.muted ? 'Silent bar · keep going' : '';
        showBeat(q.beat, q.muted);
      }
    }
    requestAnimationFrame(draw);
  }
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg><span>Start</span>';
  var STOP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><span>Stop</span>';
  // After the app was in the background, iPhones can leave the audio clock stopped for good ("interrupted").
  // Start makes a fresh clock in the same tap when the old one is not running, and never waits forever.
  var starting = false;
  function fresh(AC) { try { if (ctx && ctx.close) ctx.close(); } catch (e) {} ctx = new AC(); }
  function wakeUp() { return Promise.race([Promise.resolve().then(function () { return ctx.resume(); }).then(function () { return true; }, function () { return false; }), new Promise(function (z) { setTimeout(function () { z(false); }, 600); })]); }
  var alive = function () { return !ctx.state || ctx.state === 'running'; };
  async function start() {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC || starting) return;
    starting = true;
    if (!ctx || (ctx.state && ctx.state !== 'running')) fresh(AC);
    unlock();
    if (!(await wakeUp()) || !alive()) { fresh(AC); unlock(); await wakeUp(); }
    starting = false;
    if (!alive()) { toast('Tap Start again'); return; }
    S.played = true; save();
    running = true; tick = 0; queue = []; nextTime = ctx.currentTime + 0.08;
    schedule(); timer = setInterval(schedule, 25); requestAnimationFrame(draw);
    $('play').innerHTML = STOP; $('pPlay').innerHTML = STOP; $('pPlay').setAttribute('aria-label', 'Stop');
    try { wake = await navigator.wakeLock.request('screen'); } catch (e) { wake = null; }
  }
  function stop() {
    running = false; clearInterval(timer); queue = [];
    clearTimeout(offT); fields.forEach(function (f) { f.classList.remove('on', 'muted'); }); stripEls.forEach(function (n) { n.classList.remove('on'); }); lightPan(null);
    $('gapNote').textContent = ''; $('play').innerHTML = PLAY; $('pPlay').innerHTML = PLAY; $('pPlay').setAttribute('aria-label', 'Start');
    Array.prototype.forEach.call($('pDots').children, function (d) { d.classList.remove('on'); });
    showBeat(-1, false); $('pSilent').textContent = '';
    if (S.piece && PC) renderPiece(null);
    try { if (wake) wake.release(); } catch (e) {} wake = null;
    try { if (keepAlive) keepAlive.pause(); } catch (e) {}
  }
  function toggle() { if (running) stop(); else start(); }
  $('play').onclick = toggle;
  document.querySelector('.dial').onclick = toggle;
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && !/INPUT|SELECT|BUTTON|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); toggle(); }
  });
  // leaving the app stops the click cleanly, so Start works on return
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && running) stop(); });
  window.addEventListener('pagehide', function () { if (running) stop(); });

  // ---- beat bar for exercises (pieces show the beat on the strip above the boxes)
  function drawExBar() {
    var bar = $('exBar'); bar.innerHTML = ''; bar.style.gridTemplateColumns = 'repeat(' + S.beats + ',minmax(0,1fr))';
    for (var j = 0; j < S.beats; j++) { var sp = document.createElement('span'); sp.textContent = j + 1; bar.appendChild(sp); }
  }
  function showBeat(beat, muted) {
    Array.prototype.forEach.call($('exBar').children, function (x, i) { x.classList.toggle('on', i === beat); });
    $('exBar').classList.toggle('mu', !!muted);
    if (beat < 0) pcHeads.forEach(function (x) { x.classList.remove('on'); });
  }

  // ---- phone layout: list screen, player screen, settings sheet
  function renderLib() {}
  function playerHead() {
    var pc = S.piece && pieceOf(S.piece), b = document.body;
    $('pTitle').textContent = pc ? pc.t : EX[S.ex].t;
    $('pSub').textContent = pc ? 'Class pattern ' + (PIECES.indexOf(pc) + 1) + ' of ' + PIECES.filter(function (x) { return !x.soon; }).length : 'Timing drill ' + (S.ex + 1) + ' of ' + EX.length;
    b.classList.toggle('pv-piece', !!pc); b.classList.toggle('pv-ex', !pc);
    b.classList.toggle('pv-map', S.mview === 'map'); b.classList.toggle('pv-dial', S.mview !== 'map');
    Array.prototype.forEach.call($('pMode').children, function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-v') === S.mview)); });
  }
  Array.prototype.forEach.call($('pMode').children, function (x) {
    x.onclick = function () { S.mview = x.getAttribute('data-v'); save(); playerHead(); };
  });
  function openPlayer() {
    if (!isPhone()) { playerHead(); return; }
    if (document.body.classList.contains('pv')) return;
    playerHead(); document.body.classList.add('pv');
    if (!pendingBack) { try { history.pushState({ pv: 1 }, ''); } catch (e) {} }
  }
  function closePlayer(fromHistory) {
    if (!document.body.classList.contains('pv')) return;
    if (running) stop();
    closeSheet(); document.body.classList.remove('pv'); renderList();
    if (!fromHistory && history.state && history.state.pv) { pendingBack = true; try { history.back(); } catch (e) { pendingBack = false; } }
  }
  // the phone's back button closes the player; a back we started ourselves is only bookkeeping
  var pendingBack = false;
  window.addEventListener('popstate', function () {
    if (pendingBack) { pendingBack = false; if (document.body.classList.contains('pv')) { try { history.pushState({ pv: 1 }, ''); } catch (e) {} } return; }
    closePlayer(true);
  });
  $('pBack').onclick = function () { closePlayer(false); };
  $('pMinus').onclick = function () { setBpm(S.bpm - 1); };
  $('pPlus').onclick = function () { setBpm(S.bpm + 1); };
  $('pPlay').onclick = toggle;
  $('pRange').oninput = function (e) { setBpm(+e.target.value); };
  function openSheet() { $('sheet').hidden = false; document.body.classList.add('sv'); $('sX').focus(); }
  function closeSheet() { $('sheet').hidden = true; document.body.classList.remove('sv'); }
  $('pInfo').onclick = openSheet; $('pSet').onclick = openSheet;
  $('sBg').onclick = closeSheet; $('sX').onclick = closeSheet;
  (function () {   // swipe the sheet down to close it
    var panel = document.querySelector('.spanel'), y0 = null, dy = 0;
    panel.addEventListener('touchstart', function (e) { if (panel.scrollTop > 0) return; y0 = e.touches[0].clientY; dy = 0; panel.style.transition = 'none'; }, { passive: true });
    panel.addEventListener('touchmove', function (e) { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); panel.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
    panel.addEventListener('touchend', function () { if (y0 === null) return; panel.style.transition = ''; panel.style.transform = ''; if (dy > 70) closeSheet(); y0 = null; });
  })();
  function applyTheme() {
    if (S.theme === 'light' || S.theme === 'dark') document.documentElement.setAttribute('data-theme', S.theme); else document.documentElement.removeAttribute('data-theme');
    // until the student picks one, the page follows the phone
    var cur = S.theme === 'light' || S.theme === 'dark' ? S.theme : (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    // the button shows where a tap takes you: a sun in dark, a moon in light
    var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>';
    var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
    [$('thBar'), $('thP')].forEach(function (b) { b.innerHTML = cur === 'dark' ? SUN : MOON; b.setAttribute('aria-label', cur === 'dark' ? 'Switch to light' : 'Switch to dark'); b.setAttribute('data-cur', cur); });
  }
  [$('thBar'), $('thP')].forEach(function (b) { b.onclick = function () { S.theme = b.getAttribute('data-cur') === 'dark' ? 'light' : 'dark'; save(); applyTheme(); }; });
  applyTheme();
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!$('sheet').hidden) closeSheet(); else closePlayer(false); } });
  // the same elements move between the desktop columns and the phone screens, so nothing is duplicated
  var moved = [];
  function move(node, parent) { var ph = document.createComment('slot'); node.parentNode.insertBefore(ph, node); moved.push([node, ph]); parent.appendChild(node); }
  // one layout for every screen: the parts live in the player and the sheet;
  // phones show the player as its own screen, wide screens next to the list
  function layout() {
    if (!moved.length) {
      var pb = $('pBody'), sb = $('sBody');
      move($('chips'), pb); move($('pcBox'), pb); move($('strip'), pb); move(document.querySelector('.pan'), pb);
      move($('hpSel'), sb); move($('sizes'), $('sizesSlot')); move(document.querySelector('.task'), sb);
      $('app').appendChild($('player'));
      drawPan();
    }
    if (!isPhone()) closePlayer(true);
  }
  if (MQ.addEventListener) MQ.addEventListener('change', layout); else if (MQ.addListener) MQ.addListener(layout);
  layout();

  // ---- start
  $('play').innerHTML = PLAY; $('pPlay').innerHTML = PLAY;
  renderStrip(); drawPan(); renderPats(); renderSizes(); setHp(S.hp !== false);
  if (S.piece) { var keepBpm = S.bpm; pickPiece(S.piece, false); setBpm(keepBpm); drawPan(); } else pick(S.ex, false);
  // arriving from My classes: Start opens piece 1, Continue opens where the student left off
  if (jump === 'start') { S.lib = 'pc'; pickPiece('scale', true); renderList(); }
  if (jump) openPlayer();

  // works offline after the first visit
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('/pages/practice-sw.js', { scope: '/pages/practice' }).catch(function () {}); });
})();
