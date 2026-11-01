/* Rhythm practice (students). Timing engine from Handpan Metronome v5, in the site's brand.
   Exercises and patterns are plain data, so they can later come from the dashboard. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var NS = 'http://www.w3.org/2000/svg';

  var EX = [
    { t: 'One per beat', p: 'One click on every beat. Play one note on each click. Clapping works too.', g: '4 bars without a slip at 60 BPM', bpm: 60, beats: 4, sub: 1, accent: false, gap: null, min: '3 min' },
    { t: 'Two per beat', p: 'Every beat has 2 clicks. Play on each click and count "1 & 2 &" out loud.', g: '4 clean rounds at 60 BPM', bpm: 60, beats: 4, sub: 2, accent: false, gap: null, min: '4 min' },
    { t: 'Lean on beat 1', p: 'Play beat 1 a little louder. The higher click marks it.', g: '8 bars, beat 1 always clear', bpm: 65, beats: 4, sub: 2, accent: true, gap: null, min: '4 min' },
    { t: 'Four per beat', p: 'Every beat has 4 clicks. Play on each click and count "1 e & a". Keep all four evenly spaced.', g: '4 clean rounds at 45 BPM', bpm: 45, beats: 4, sub: 4, accent: true, gap: null, min: '5 min' },
    { t: 'Silent bars', p: 'The click stops for 2 bars. Keep going and land back on beat 1.', g: 'Land on beat 1 after the gap', bpm: 60, beats: 4, sub: 2, accent: true, gap: [2, 2], min: '5 min' },
    { t: 'On your own', p: '1 bar of click, 3 bars silent. Your inner clock does the work.', g: 'Land on beat 1 three times in a row', bpm: 60, beats: 4, sub: 1, accent: true, gap: [1, 3], min: '5 min' }
  ];
  var PRESETS = [
    { name: 'Ding 1 5 6 / Ding 2 5 6', steps: ['D', '1', '5', '6', 'D', '2', '5', '6'] },
    { name: 'Scale up', steps: ['1', '2', '3', '4', '5', '6', '7', '8'] }
  ];

  // Pieces Arpit teaches. One word per beat: 4R = note 4 right hand, DR = Ding right hand, T = Tak,
  // 4+6 = two notes together, D,D = two notes inside one beat. Each line is played lineRep times, each part secRep times.
  var PIECES = [
    { id: 'sparrow', t: 'Golden Sparrow', sum: 'Start, Part 1, Part 2 · each line 4 times', tag: '4 beats', bpm: 60, sub: 1, lineRep: 4, secRep: 2,
      p: 'R is your right hand, L your left. Ding is always the right hand. Each line 4 times, each part 2 times, then the next part. After Part 2 it goes back to Start.',
      g: 'The full piece in one go, then send Arpit a video',
      secs: [
        { n: 'Start', lines: ['4R 2L 6R 2L', '5R 3L 7R 3L', '3R 1L 5R 1L', '4R 2L 6R 2L'] },
        { n: 'Part 1', lines: ['DR 1L 6R 1L', 'DR 2L 7R 2L', 'DR 1L 5R 1L', 'DR 2L 6R 2L'] },
        { n: 'Part 2', lines: ['DR 1L 8R 4L', 'DR 2L 7R 4L', 'DR 1L 5R 4L', 'DR 2L 6R 4L'] }
      ] },
    { id: 'scale', t: 'Scale up and down', sum: '3 variations · the scale, then every note back to 4', tag: '60', bpm: 60, sub: 1, lineRep: 1, secRep: 1,
      p: 'R is your right hand, L your left. Variation 1 is the scale up and down with hands taking turns. In Variation 2 every note (right hand) comes back to 4 (left hand). Variation 3 plays three notes in a row, each one back to 4, then moves up by one. Play slow first, keep it steady, then raise the tempo.',
      g: 'All three variations with no stop, at a steady tempo',
      secs: [
        { n: 'Variation 1', lines: ['1R 2L 3R 4L', '5R 6L 7R 8L', '8L 7R 6L 5R', '4L 3R 2L 1R'] },
        { n: 'Variation 2', lines: ['1R 4L 2R 4L', '3R 4L 4R 4L', '5R 4L 6R 4L', '7R 4L 8R 4L', '8R 4L 7R 4L', '6R 4L 5R 4L', '4R 4L 3R 4L', '2R 4L 1R 4L'] },
        { n: 'Variation 3', lines: ['1R 4L 2R 4L 3R 4L', '2R 4L 3R 4L 4R 4L', '3R 4L 4R 4L 5R 4L', '4R 4L 5R 4L 6R 4L', '5R 4L 6R 4L 7R 4L', '6R 4L 7R 4L 8R 4L', '8R 4L 7R 4L 6R 4L', '7R 4L 6R 4L 5R 4L', '6R 4L 5R 4L 4R 4L', '5R 4L 4R 4L 3R 4L', '4R 4L 3R 4L 2R 4L', '3R 4L 2R 4L 1R 4L'] }
      ] },
    { id: 'pairs', t: 'Note Pair Progressions', sum: 'Two notes together, Tak, two quick Dings', tag: '4 beats', bpm: 70, sub: 2, lineRep: 1, secRep: 2,
      p: 'Play both notes of a pair together, cleanly. Beat 3 has two quick Dings. In Step 3 the note 8 takes the place of the first Tak.',
      g: 'All three steps, soft and even',
      secs: [
        { n: 'Step 1', lines: ['4+6 T D,D T', '3+5 T D,D T'] },
        { n: 'Step 2', lines: ['2+4 T D,D T', '3+5 T D,D T'] },
        { n: 'Step 3', lines: ['4+6 8 D,D T', '3+5 8 D,D T', '2+4 8 D,D T', '3+5 8 D,D T'] }
      ] },
    { id: 'pingpong', t: 'Ping Pong', sum: 'Two hands at once · coming later', tag: 'later', soon: true }
  ];
  function parseBeat(tok) {
    return tok.split(',').map(function (h) {
      if (h === 'T') return { keys: [], tak: true, h: null };
      var m = /^(.+?)([RL]?)$/.exec(h);
      return { keys: m[1].split('+'), tak: false, h: m[2] || null };
    });
  }
  // the whole piece as one list of ticks, in playing order
  function pieceSeq(pc) {
    var seq = [], starts = [];
    pc.secs.forEach(function (sec, si) {
      starts.push(seq.length);
      for (var sr = 0; sr < pc.secRep; sr++) sec.lines.forEach(function (line, li) {
        var beats = line.split(' ').map(parseBeat);
        for (var lr = 0; lr < pc.lineRep; lr++) beats.forEach(function (halves, b) {
          for (var h = 0; h < pc.sub; h++) {
            var k = halves.length, ev = (h * k) % pc.sub === 0 ? halves[h * k / pc.sub] : null;
            seq.push({ si: si, sr: sr, li: li, lr: lr, b: b, part: ev ? h * k / pc.sub : -1, ev: ev });
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
  window.__met = { tickInfo: tickInfo, interval: interval, noteAngle: noteAngle, EX: EX, PIECES: PIECES, pieceSeq: pieceSeq };

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
  var S = { ex: 1, piece: null, pcSec: 0, done: [], bpm: 60, beats: 4, sub: 2, accent: false, gap: null, notes: 9, pat: PRESETS[0].steps.slice(), hp: true, vol: 80 };
  try { var saved = JSON.parse(localStorage.getItem(STORE) || '{}'); for (var k in saved) S[k] = saved[k]; } catch (e) {}
  if (!(S.ex >= 0 && S.ex < EX.length)) S.ex = 0;
  var pieceOf = function (id) { for (var i = 0; i < PIECES.length; i++) if (PIECES[i].id === id && !PIECES[i].soon) return PIECES[i]; return null; };
  if (S.piece && !pieceOf(S.piece)) S.piece = null;
  // the handpan is chosen by its total notes, Ding included, as makers name them (9, 10, 12 …)
  // the pieces use notes 1 to 8, so the smallest pan is 9 (Ding + 8)
  var LAYOUTS = { 9: { ring: 8, inner: 0 }, 10: { ring: 9, inner: 0 }, 12: { ring: 9, inner: 2 } };
  if (!LAYOUTS[S.notes]) S.notes = S.size === 9 ? 10 : 9;   // older saves kept notes around the Ding
  delete S.size;
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }

  // ---- exercises
  function renderList() {
    var L = $('exList'); L.innerHTML = '';
    var head = function (t) { var h = document.createElement('h2'); h.textContent = t; L.appendChild(h); };
    head('Pieces from Arpit');
    PIECES.forEach(function (pc) {
      var b = document.createElement('button'), done = S.done.indexOf('p:' + pc.id) >= 0, on = S.piece === pc.id;
      b.type = 'button'; b.className = 'ex pc' + (on ? ' on' : '') + (done && !on ? ' done' : '') + (pc.soon ? ' soon' : '');
      b.setAttribute('aria-current', on ? 'true' : 'false'); if (pc.soon) b.disabled = true;
      b.innerHTML = '<span class="n">' + (done && !on ? '✓' : '♪') + '</span><span><b></b><small></small></span><span class="t"></span>';
      b.querySelector('b').textContent = pc.t; b.querySelector('small').textContent = pc.sum; b.querySelector('.t').textContent = pc.tag;
      if (!pc.soon) b.onclick = function () { pickPiece(pc.id, true); };
      L.appendChild(b);
    });
    head('Exercises');
    EX.forEach(function (e, i) {
      var b = document.createElement('button'), done = S.done.indexOf(i) >= 0, on = !S.piece && i === S.ex;
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
    var e = EX[i]; S.ex = i; if (running && S.piece) stop(); S.piece = null;
    // the exercise always sets its own beats, clicks, accent and gap; a tap also resets the tempo, a reopen keeps the student's tempo
    if (fromTap) S.bpm = e.bpm;
    S.beats = e.beats; S.sub = e.sub; S.accent = e.accent; S.gap = e.gap;
    $('exK').textContent = 'Exercise ' + (i + 1); $('exT').textContent = e.t; $('exP').textContent = e.p; $('exG').textContent = 'Goal: ' + e.g;
    setBpm(S.bpm); drawDial(); renderChips(); renderList(); renderDone(); applyMode(); if (pan.D) drawPan(); save();
  }
  // ---- pieces
  var PC = null, pcCells = {}, pcAt = null;
  function pickPiece(id, fromTap) {
    var pc = pieceOf(id); if (!pc) return;
    if (running) stop();
    S.piece = id; PC = pieceSeq(pc); PC.pc = pc;
    if (fromTap) { S.bpm = pc.bpm; S.pcSec = 0; }
    if (!(S.pcSec >= 0 && S.pcSec < pc.secs.length)) S.pcSec = 0;
    S.beats = pc.secs[0].lines[0].split(' ').length; S.sub = pc.sub; S.accent = true; S.gap = null;
    $('exK').textContent = 'Piece from Arpit'; $('exT').textContent = pc.t; $('exP').textContent = pc.p; $('exG').textContent = 'Goal: ' + pc.g;
    setBpm(S.bpm); drawDial(); renderChips(); renderList(); renderDone(); applyMode(); renderPiece(null); drawPan(); save();
  }
  function applyMode() {
    var pc = !!S.piece;
    $('pcBox').hidden = !pc; $('hpTog').hidden = pc; $('strip').hidden = pc; $('pats').hidden = pc;
    $('hpBox').hidden = pc ? false : !S.hp;
    if (!pc) PC = null;
  }
  var label = function (k) { return k === 'D' ? 'Ding' : k; };
  function beatText(halves) {
    return halves.map(function (e) { return e.tak ? 'Tak' : e.keys.map(label).join('+') + (e.h || ''); }).join(' ');
  }
  function renderPiece(pos) {
    var pc = PC.pc, si = pos ? pos.si : S.pcSec, sec = pc.secs[si];
    var tabs = $('pcTabs'); tabs.innerHTML = '';
    pc.secs.forEach(function (x, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = x.n;
      b.setAttribute('aria-pressed', String(i === si));
      b.onclick = function () { var was = running; if (was) stop(); S.pcSec = i; save(); renderPiece(null); if (was) start(); };
      tabs.appendChild(b);
    });
    var c = [];
    if (pos) {
      c.push('Line <b>' + (pos.li + 1) + '</b> of ' + sec.lines.length);
      if (pc.lineRep > 1) c.push('time <b>' + (pos.lr + 1) + '</b> of ' + pc.lineRep);
      if (pc.secRep > 1) c.push('round <b>' + (pos.sr + 1) + '</b> of ' + pc.secRep);
    } else {
      c.push(pc.lineRep > 1 ? 'Each line ' + pc.lineRep + ' times' : sec.lines.length + ' lines');
      if (pc.secRep > 1) c.push('each part ' + pc.secRep + ' times');
      if (pc.secs.length > 1) c.push('then the next part');
    }
    $('pcCount').innerHTML = c.join(' · ');
    var box = $('pcLines'); box.innerHTML = ''; pcCells = {};
    var curLi = pos ? pos.li : 0;
    // long parts show a window around the current line, so the map stays in view
    var lo = 0, hi = sec.lines.length - 1;
    if (sec.lines.length > 6) { lo = Math.max(0, Math.min(curLi - 1, sec.lines.length - 5)); hi = lo + 4; }
    sec.lines.forEach(function (line, li) {
      if (li < lo || li > hi) return;
      var beats = line.split(' ').map(parseBeat), row = document.createElement('div');
      if (li !== curLi) { row.className = 'pc-ln' + (pos && li < curLi ? ' past' : ''); row.textContent = beats.map(beatText).join('  '); box.appendChild(row); return; }
      row.className = 'pc-now'; row.style.gridTemplateColumns = beats.map(function (h) { return h.length > 1 ? '1.4fr' : '1fr'; }).join(' ');
      beats.forEach(function (halves, b) {
        var cell = document.createElement('div'); cell.className = 'pc-bt';
        if (pc.sub > 1) { var n = document.createElement('small'); n.textContent = b + 1; cell.appendChild(n); }
        var wrap = document.createElement('div'); wrap.className = 'pc-in';
        halves.forEach(function (e, j) {
          var d = document.createElement('div');
          d.className = 'pc-n' + (e.tak ? ' tak' : e.h === 'L' ? ' l' : ' r') + (sec.root && e.keys.length === 1 && e.keys[0] === sec.root ? ' root' : '');
          var big = document.createElement('b'); big.textContent = e.tak ? 'Tak' : e.keys.map(halves.length > 1 ? String : label).join('+'); d.appendChild(big);
          if (e.h) { var hs = document.createElement('span'); hs.textContent = e.h === 'L' ? 'Left' : 'Right'; d.appendChild(hs); }
          wrap.appendChild(d); pcCells[b + '.' + j] = d;
        });
        cell.appendChild(wrap); row.appendChild(cell);
      });
      box.appendChild(row);
    });
    if (hi < sec.lines.length - 1) { var more = document.createElement('div'); more.className = 'pc-ln past'; more.textContent = '+ ' + (sec.lines.length - 1 - hi) + ' more lines'; box.appendChild(more); }
    // key: only what this piece uses
    var all = pc.secs.map(function (x) { return x.lines.join(' '); }).join(' '), key = [];
    if (/\d[RL]|D[RL]/.test(all)) key.push('<i class="r"></i>Right hand', '<i class="l"></i>Left hand');
    if (/(^| )T( |$)/.test(all)) key.push('<i class="t"></i>Tak');
    if (sec.root) key.push('<i class="o"></i>Back to ' + sec.root);
    $('pcKey').innerHTML = key.join(' '); $('pcKey').hidden = !key.length;
    pcAt = pos ? pos.si + '.' + pos.sr + '.' + pos.li : null;
  }
  function pieceTick(t) {
    var pos = PC.seq[(PC.starts[S.pcSec] + t) % PC.seq.length];
    if (pcAt !== pos.si + '.' + pos.sr + '.' + pos.li) renderPiece(pos);
    else if (PC.pc.lineRep > 1 && pos.b === 0 && pos.part === 0) renderPiece(pos);   // new time through the same line
    if (!pos.ev) return;
    for (var k in pcCells) pcCells[k].classList.toggle('cur', k === pos.b + '.' + pos.part);
    lightEv(pos.ev);
  }
  function renderChips() {
    var c = $('chips'); c.innerHTML = '';
    var add = function (txt) { var s = document.createElement('span'); s.className = 'chip'; s.textContent = txt; c.appendChild(s); };
    add(S.beats + ' beats'); add(S.sub === 1 ? '1 click per beat' : S.sub + ' clicks per beat'); if (S.accent) add('Accent on 1'); if (S.gap) add(S.gap[0] + ' on · ' + S.gap[1] + ' off');
  }
  function doneKey() { return S.piece ? 'p:' + S.piece : S.ex; }
  function renderDone() {
    var d = S.done.indexOf(doneKey()) >= 0, b = $('doneBtn');
    b.classList.toggle('is-done', d); b.querySelector('span').textContent = d ? 'Goal reached' : 'I reached the goal';
  }
  $('doneBtn').onclick = function () {
    var i = S.done.indexOf(doneKey());
    if (i >= 0) S.done.splice(i, 1); else S.done.push(doneKey());
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
    var used = {}; if (S.piece && PC) PC.seq.forEach(function (q) { if (q.ev) q.ev.keys.forEach(function (x) { used[x] = 1; }); }); else S.pat.forEach(function (x) { used[x] = 1; });
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
  }
  function renderStrip() {
    var el = $('strip'); el.innerHTML = ''; stripEls = [];
    el.style.gridTemplateColumns = 'repeat(' + Math.min(S.pat.length, 8) + ',1fr)';
    S.pat.forEach(function (s) { var d = document.createElement('div'); d.className = 'note' + (s === 'D' ? ' d' : ''); d.textContent = s; el.appendChild(d); stripEls.push(d); });
  }
  function lightPan(k) {
    for (var n in pan) { var on = n === k; pan[n][0].classList.toggle('on', on); pan[n][1].classList.toggle('on', on); pan[n][0].classList.remove('l'); }
    if (panShell) panShell.classList.remove('on');
  }
  // a piece step: one or more notes in one hand's colour, or a Tak on the rim; the same note twice in a row flashes again
  function lightEv(ev) {
    lightPan(null); if (panShell) panShell.getBoundingClientRect();
    if (ev.tak) { panShell.classList.add('on'); return; }
    ev.keys.forEach(function (k) { if (!pan[k]) return; pan[k][0].classList.add('on'); pan[k][1].classList.add('on'); if (ev.h === 'L') pan[k][0].classList.add('l'); });
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
  function schedule() {
    while (nextTime < ctx.currentTime + 0.12) {
      var q = tickInfo(S, tick);
      if (!q.muted) click(nextTime, q.kind);
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
  document.addEventListener('visibilitychange', async function () {
    if (running && document.visibilityState === 'visible' && !wake) { try { wake = await navigator.wakeLock.request('screen'); } catch (e) {} }
  });

  // ---- start
  $('play').innerHTML = PLAY;
  renderStrip(); drawPan(); renderPats(); renderSizes(); setHp(S.hp !== false);
  if (S.piece) { var keepBpm = S.bpm; pickPiece(S.piece, false); setBpm(keepBpm); drawPan(); } else pick(S.ex, false);

  // works offline after the first visit
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('/pages/practice-sw.js', { scope: '/pages/practice' }).catch(function () {}); });
})();
