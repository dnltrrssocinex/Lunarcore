/* Draggable card ring (CSS 3D port of the studio motion snippet).
   Drag with pointer capture, release velocity feeds a spring that snaps
   to the nearest card. Auto-advances while idle. */
(() => {
  const root = document.querySelector('.ring-wrap');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ring = root.querySelector('.ring');
  const cards = [...ring.querySelectorAll('.card')];
  const capB = root.querySelector('.cap b');
  const capS = root.querySelector('.cap span');
  const dotsEl = root.querySelector('.dots');
  const gh = root.querySelector('.gh');
  const N = cards.length;
  const STEP = (Math.PI * 2) / N;
  cards.forEach(() => dotsEl.appendChild(document.createElement('i')));
  const dots = [...dotsEl.children];
  const pad = (n) => String(n).padStart(2, '0');

  const R = () => {
    const cw = Math.max(150, Math.min(240, innerWidth * 0.17));
    root.style.setProperty('--cw', cw + 'px');
    return Math.max(cw * 1.35, (N * (cw + 28)) / (Math.PI * 2));
  };

  let ang = 0, av = 0, target = 0, down = false, sx = 0, sy = 0, lx = 0, dragPx = 0, acc = 0, lastMove = 0, userUntil = 0;
  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    down = true;
    sx = lx = e.clientX; sy = e.clientY;
    dragPx = acc = 0; av = 0;
    lastMove = performance.now();
    try { root.setPointerCapture(e.pointerId); } catch (_) {}
    root.classList.add('drag');
    userUntil = performance.now() + 3000;
    gh.classList.add('on', 'dn');
    gh.style.transform = 'translate(' + (e.clientX - root.getBoundingClientRect().left) + 'px,' + (e.clientY - root.getBoundingClientRect().top) + 'px)';
  };
  const onMove = (e) => {
    const b = root.getBoundingClientRect();
    gh.style.transform = 'translate(' + (e.clientX - b.left) + 'px,' + (e.clientY - b.top) + 'px)';
    if (!down) return;
    acc += e.clientX - lx;
    lx = e.clientX;
    dragPx = Math.max(dragPx, Math.hypot(e.clientX - sx, e.clientY - sy));
    lastMove = performance.now();
    userUntil = lastMove + 3000;
  };
  const onUp = (e) => {
    gh.classList.remove('dn');
    if (!down) return;
    down = false;
    try { root.releasePointerCapture(e.pointerId); } catch (_) {}
    root.classList.remove('drag');
    const now = performance.now();
    userUntil = now + 3000;
    if (now - lastMove > 90) av = 0;
    target = Math.round((ang + av * 0.3) / STEP) * STEP;
    cards.forEach((c) => (c.dataset.dragged = dragPx > 6 ? '1' : '0'));
    setTimeout(() => cards.forEach((c) => (c.dataset.dragged = '0')), 50);
  };
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onUp);
  root.addEventListener('pointerenter', () => gh.classList.add('on'));
  root.addEventListener('pointerleave', () => gh.classList.remove('on'));
  root.addEventListener('click', (e) => { if (dragPx > 6) { e.stopPropagation(); e.preventDefault(); } }, true);
  addEventListener('keydown', (e) => {
    if (!root.matches(':hover') && document.activeElement !== root) return;
    if (e.key === 'ArrowRight') { target = Math.round(ang / STEP) * STEP - STEP; userUntil = performance.now() + 3000; }
    if (e.key === 'ArrowLeft') { target = Math.round(ang / STEP) * STEP + STEP; userUntil = performance.now() + 3000; }
  });

  let vis = true;
  new IntersectionObserver((es) => es.forEach((e) => (vis = e.isIntersecting))).observe(root);

  const t0 = performance.now();
  let last = t0, nextAuto = t0 + 1800, active = -1;
  const K = 55, C = 2 * Math.sqrt(K) * 0.92;
  const loop = (t) => {
    requestAnimationFrame(loop);
    const dt = Math.min(0.033, (t - last) / 1000);
    last = t;
    if (!vis) return;
    if (down) {
      const da = acc * 0.0058;
      acc = 0;
      ang += da;
      if (dt > 0) av += (da / dt - av) * 0.35;
      if (t - lastMove > 90) av *= 0.6;
    } else {
      if (!reduced && t > userUntil && t > nextAuto) { target = Math.round(ang / STEP) * STEP - STEP; nextAuto = t + 2800; }
      av += (K * (target - ang) - C * av) * dt;
      ang += av * dt;
    }
    if (down || t <= userUntil) nextAuto = Math.max(nextAuto, t + 1200);
    const r = R();
    ring.style.transform = 'translate3d(0,0,' + (-r * 0.8).toFixed(0) + 'px) rotateX(-6deg)';
    let idx = 0, best = -2;
    cards.forEach((m, i) => {
      const a = i * STEP + ang;
      const cs = Math.cos(a), sn = Math.sin(a);
      const s = 0.88 + 0.16 * Math.pow(Math.max(0, cs), 3);
      m.style.transform = 'translate3d(' + (sn * r).toFixed(1) + 'px,0,' + (cs * r).toFixed(1) + 'px) rotateY(' + a.toFixed(4) + 'rad) scale(' + s.toFixed(3) + ')';
      m.style.setProperty('--dim', ((1 - Math.max(0, cs)) * 0.42).toFixed(3));
      m.style.zIndex = String(Math.round(cs * 100 + 200));
      if (cs > best) { best = cs; idx = i; }
    });
    if (idx !== active) {
      active = idx;
      capB.textContent = cards[idx].dataset.name || '';
      capS.textContent = pad(idx + 1) + ' / ' + pad(N);
      dots.forEach((d, i) => d.classList.toggle('on', i === idx));
    }
  };
  requestAnimationFrame(loop);
})();
