/* Lunarcore Studios - site.js
   Shared motion modules. Each module only runs when its markup exists. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const sm = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  /* ---------- Loader: dot bounce ---------- */
  const loader = $('.loader');
  if (loader) {
    let gone = false;
    const done = () => { if (gone) return; gone = true; loader.classList.add('off'); document.body.classList.add('ready'); };
    if (document.readyState === 'complete') setTimeout(done, 350);
    else addEventListener('load', () => setTimeout(done, 350));
    setTimeout(done, 2800);
  }

  /* ---------- Nav ---------- */
  const nav = $('.nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', scrollY > 12);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
  const toggle = $('.nav-toggle');
  if (toggle) toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  $$('.nav-links a, .menu a').forEach((a) => {
    const h = (a.getAttribute('href') || '').split('#')[0].toLowerCase();
    if (h === here) a.setAttribute('aria-current', 'page');
  });

  /* ---------- Fade through: page transitions ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || a.target === '_blank' || /^(https?:|mailto:|tel:)/i.test(href)) return;
    if (a.hasAttribute('data-video') || a.hasAttribute('download') || /\.(mp4|webm|mov|pdf|ics|zip)(\?|$)/i.test(href)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const page = $('.page');
    const [path, hash] = href.split('#');
    if (path.toLowerCase() === here && hash) return; /* same page anchor */
    e.preventDefault();
    document.body.classList.remove('menu-open');
    if (!page || reduced) { location.href = href; return; }
    page.classList.add('leaving');
    setTimeout(() => { location.href = href; }, 300);
  });
  addEventListener('pageshow', (e) => { if (e.persisted) { const p = $('.page'); if (p) p.classList.remove('leaving'); } });

  /* ---------- Reveal on scroll ---------- */
  const rv = $$('.rv');
  if (rv.length) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    /* anything already in the first viewport shows at once; the observer handles the rest */
    rv.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight * 0.95 && r.bottom > 0) el.classList.add('in'); else io.observe(el); });
    setTimeout(() => rv.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('in'); }), 1500);
  }

  /* ---------- Cursor label (zones: .cz, labels: [data-cursor]) ---------- */
  if (fine && $('.cz')) {
    const cl = document.createElement('div');
    cl.className = 'cl';
    cl.innerHTML = '<i class="dt"></i><span class="pl"><span class="t">View</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></span>';
    document.body.appendChild(cl);
    const t = $('.t', cl);
    const st = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2 };
    let inZone = false;
    const read = (target) => {
      const zone = target && target.closest ? target.closest('.cz') : null;
      const lab = target && target.closest ? target.closest('[data-cursor]') : null;
      inZone = !!zone;
      document.body.classList.toggle('cl-active', inZone);
      cl.classList.toggle('show', inZone);
      cl.classList.toggle('on', inZone && !!lab);
      if (lab) t.textContent = lab.dataset.cursor || 'View';
    };
    addEventListener('pointermove', (e) => { st.tx = e.clientX; st.ty = e.clientY; read(e.target); }, { passive: true });
    document.addEventListener('mouseleave', () => { cl.classList.remove('show', 'on'); document.body.classList.remove('cl-active'); });
    addEventListener('scroll', () => { const el = document.elementFromPoint(st.tx, st.ty); read(el); }, { passive: true });
    const loop = () => {
      requestAnimationFrame(loop);
      const k = 0.32;
      st.x += (st.tx - st.x) * k;
      st.y += (st.ty - st.y) * k;
      cl.style.transform = 'translate(' + st.x.toFixed(1) + 'px,' + st.y.toFixed(1) + 'px)';
    };
    requestAnimationFrame(loop);
  }

  /* ---------- Magnetic buttons ---------- */
  const mags = $$('.magnet');
  if (fine && !reduced && mags.length) {
    const M = mags.map((btn) => ({ btn, lb: $('.lb', btn), s: { x: 0, y: 0, vx: 0, vy: 0 }, live: false }));
    let px = -9999, py = -9999;
    addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; }, { passive: true });
    const frame = () => {
      requestAnimationFrame(frame);
      for (const m of M) {
        const r = m.btn.getBoundingClientRect();
        if (!r.width) continue;
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = px - cx, dy = py - cy;
        const near = Math.hypot(dx, dy) < Math.max(70, r.width * 0.75);
        const tx = near ? dx * 0.32 : 0, ty = near ? dy * 0.32 : 0;
        m.s.vx += (tx - m.s.x) * 0.14; m.s.vy += (ty - m.s.y) * 0.14;
        m.s.vx *= 0.76; m.s.vy *= 0.76;
        m.s.x += m.s.vx; m.s.y += m.s.vy;
        const moving = near || Math.abs(m.s.x) + Math.abs(m.s.y) > 0.05;
        if (moving || m.live) {
          m.btn.style.transform = 'translate(' + m.s.x.toFixed(2) + 'px,' + m.s.y.toFixed(2) + 'px)';
          if (m.lb) m.lb.style.transform = 'translate(' + (m.s.x * 0.55).toFixed(2) + 'px,' + (m.s.y * 0.55).toFixed(2) + 'px)';
        }
        m.live = moving;
      }
    };
    requestAnimationFrame(frame);
  }

  /* ---------- Footer: link arrow nudge ---------- */
  const flinks = $$('.footer .col a');
  if (flinks.length && !reduced) {
    let hover = false;
    const f = $('.footer');
    f.addEventListener('pointerenter', () => (hover = true));
    f.addEventListener('pointerleave', () => (hover = false));
    const order = [0, 4, 8, 1, 3, 7, 2, 5, 6, 9, 10, 11].filter((i) => i < flinks.length);
    let n = 0;
    const tick = () => {
      flinks.forEach((a) => a.classList.remove('is-auto'));
      if (!hover && document.visibilityState === 'visible') { flinks[order[n % order.length]].classList.add('is-auto'); n += 1; }
      setTimeout(tick, 900);
    };
    setTimeout(tick, 1200);
  }

  /* ---------- Hero: depth parallax planes (CSS 3D port) ---------- */
  const hero = $('.hero');
  if (hero && !reduced) {
    const wrap = hero.parentElement;
    const stage = $('.stage', hero);
    const planes = $$('.plane', hero);
    const texts = $$('.tx', hero);
    const dots = $$('.rail i', hero);
    const fill = $('.rail b', hero);
    const hint = $('.hint', hero);
    const N = texts.length;
    const cfg = planes.map((el, i) => {
      const side = i % 2 ? 1 : -1;
      const last = i === planes.length - 1;
      const x = last ? 0 : side * (1.55 + ((i * 37) % 5) * 0.12);
      const y = last ? 0.15 : (((i * 53) % 5) - 2) * 0.3;
      return { el, x, y, z: -(1.5 + i * 1.7) };
    });
    let prog = 0, mx = 0, my = 0, tmx = 0, tmy = 0, last = performance.now(), active = -1;
    if (fine) addEventListener('pointermove', (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });
    const loop = (t) => {
      requestAnimationFrame(loop);
      const dt = Math.min(0.1, Math.max(0, (t - last) / 1000));
      last = t;
      const r = wrap.getBoundingClientRect();
      if (r.bottom < -200) return;
      const max = wrap.offsetHeight - innerHeight;
      const target = max > 0 ? clamp01(-r.top / max) : 0;
      prog += (target - prog) * (1 - Math.exp(-dt * 6));
      mx += (tmx - mx) * (1 - Math.exp(-dt * 3));
      my += (tmy - my) * (1 - Math.exp(-dt * 3));
      const u = Math.min(300, innerWidth * 0.27);
      const xu = innerWidth * 0.42;
      const P = u * 4.2;
      stage.style.perspective = P.toFixed(0) + 'px';
      const camZ = 5 - prog * 17.4;
      const camX = Math.sin(prog * 6.2) * 0.25 + mx * 0.4;
      const camY = Math.cos(prog * 5) * 0.18 - my * 0.3;
      let nearest = -1, nd = 1e9;
      cfg.forEach((c, i) => {
        const dist = (camZ - c.z) * u;
        if (dist < 80) { c.el.style.visibility = 'hidden'; return; }
        const tz = P - dist;
        const x = c.x * xu - camX * u, y = -(c.y - camY) * u;
        let fog = sm(7 * u, 26 * u, dist);
        if (i === cfg.length - 1) fog = Math.max(fog, sm(0.82, 1, prog) * 0.62);
        const fadeNear = sm(80, 420, dist);
        c.el.style.visibility = 'visible';
        c.el.style.opacity = (fadeNear * (1 - sm(22 * u, 27 * u, dist))).toFixed(3);
        c.el.style.setProperty('--fog', (fog * 0.9).toFixed(3));
        c.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + tz.toFixed(1) + 'px) rotateY(' + (-c.x * 7).toFixed(2) + 'deg)';
        c.el.style.zIndex = String(Math.round(2000 - dist / 10));
        if (dist > 300 && dist < nd) { nd = dist; nearest = i; }
      });
      cfg.forEach((c, i) => c.el.classList.toggle('near', i === nearest));
      const idx = prog * (N - 1);
      for (let i = 0; i < N; i++) {
        const o = 1 - sm(0.1, 0.5, Math.abs(idx - i));
        const e = texts[i];
        e.style.setProperty('--o', o.toFixed(3));
        e.style.setProperty('--y', ((idx < i ? 1 : -1) * 26 * (1 - o)).toFixed(1) + 'px');
        e.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      }
      if (fill) fill.style.transform = 'scaleY(' + prog.toFixed(4) + ')';
      const ai = Math.round(idx);
      if (ai !== active) { active = ai; dots.forEach((d, i) => d.classList.toggle('on', i === ai)); }
      if (hint) hint.style.opacity = (1 - sm(0.01, 0.08, prog)).toFixed(2);
    };
    requestAnimationFrame(loop);
  } else if (hero) {
    /* reduced motion: static stack */
    $$('.tx', hero).forEach((e, i) => { e.style.visibility = i ? 'hidden' : 'visible'; e.style.setProperty('--o', '1'); });
    $$('.plane', hero).forEach((p, i) => { p.style.transform = 'translate(' + ((i % 2 ? 1 : -1) * 30) + '%,' + ((i % 3) - 1) * 20 + '%) scale(.7)'; p.style.opacity = i < 4 ? '.9' : '0'; });
  }

  /* ---------- How we work: section colour shift ---------- */
  const how = $('.how');
  if (how) {
    const steps = $$('.step', how);
    const imgs = $$('.phone img', how);
    const dots = $$('.dots i', how);
    let cur = -1;
    const upd = () => {
      const r = how.getBoundingClientRect();
      const max = how.offsetHeight - innerHeight;
      const p = max > 0 ? clamp01(-r.top / max) : 0;
      const i = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
      if (i === cur) return;
      cur = i;
      how.dataset.t = String(i);
      steps.forEach((s, n) => { s.classList.toggle('on', n === i); s.classList.toggle('before', n > i); s.classList.toggle('after', n < i); });
      imgs.forEach((im, n) => im.classList.toggle('on', n === i));
      dots.forEach((d, n) => d.classList.toggle('on', n === i));
      const num = $('.num', how);
      if (num) num.textContent = String(i + 1).padStart(2, '0');
    };
    addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
  }

  /* ---------- Clients: logo grid cycle ---------- */
  const logos = $('.logos');
  if (logos && !reduced) {
    const slots = $$('.cl2', logos).filter((s) => s.offsetParent !== null);
    const cts = slots.map((s) => $('.ct', s));
    const pool = $$('.pool img', logos).map((n) => n.outerHTML);
    const V = cts.length;
    if (pool.length > V) {
      let cur = cts.map((_, i) => i);
      let spare = pool.map((_, i) => i).slice(V);
      cts.forEach((ct, i) => (ct.innerHTML = pool[i]));
      const order = [4, 0, 7, 2, 5, 1, 6, 3].filter((i) => i < V);
      let k = 0, hov = false;
      logos.addEventListener('pointerenter', () => (hov = true));
      logos.addEventListener('pointerleave', () => (hov = false));
      const swap = () => {
        const c = order[k++ % order.length];
        const ct = cts[c];
        ct.classList.add('out');
        setTimeout(() => {
          const next = spare.shift();
          spare.push(cur[c]);
          cur[c] = next;
          ct.innerHTML = pool[next];
          ct.classList.remove('out');
          ct.classList.add('pre');
          void ct.offsetWidth;
          ct.classList.remove('pre');
        }, 300);
      };
      let vis = true;
      new IntersectionObserver((es) => es.forEach((e) => (vis = e.isIntersecting))).observe(logos);
      const tick = () => { if (vis && !hov && document.visibilityState === 'visible') swap(); setTimeout(tick, 1400); };
      setTimeout(tick, 1200);
    }
  }

  /* ---------- FAQ: chat style ---------- */
  const chat = $('.chat');
  if (chat) {
    const th = $('.th', chat);
    const btns = $$('.chips button', chat);
    const QA = btns.map((b) => [b.dataset.q || b.textContent.trim(), b.dataset.a || '']);
    let busy = false, hold = 0, gen = 0, vis = true;
    new IntersectionObserver((es) => es.forEach((e) => (vis = e.isIntersecting))).observe(chat);
    const wait = (ms) => new Promise((res) => {
      const t0 = Date.now();
      const step = () => { if (document.visibilityState !== 'visible') return setTimeout(step, 250); if (Date.now() - t0 >= ms) return res(); setTimeout(step, Math.min(40, ms)); };
      step();
    });
    const bubble = (cls, txt) => {
      const m = document.createElement('div');
      m.className = 'm ' + cls;
      m.textContent = txt;
      th.appendChild(m);
      while (th.children.length > 4) th.removeChild(th.firstChild);
      return m;
    };
    const ask = async (i) => {
      busy = true;
      const my = ++gen;
      bubble('u', QA[i][0]);
      await wait(500);
      const r = bubble('r', '');
      r.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
      await wait(900);
      if (my !== gen) return;
      r.textContent = '';
      for (let c = 1; c <= QA[i][1].length; c++) {
        if (my !== gen) return;
        r.textContent = QA[i][1].slice(0, c);
        await wait(reduced ? 0 : 18);
      }
      busy = false;
    };
    btns.forEach((b, i) => b.addEventListener('click', () => { if (busy) return; hold = Date.now() + 12000; ask(i); }));
    let k = 0;
    (async () => {
      await wait(800);
      while (true) {
        if (vis && !busy && Date.now() > hold) {
          if (k % 2 === 0) th.textContent = '';
          await ask(k++ % QA.length);
          await wait(3200);
        } else await wait(400);
      }
    })();
  }

  /* ---------- Photos: thumbnail strip sync ---------- */
  $$('.gallery').forEach((g) => {
    const sl = $$('.sl', g);
    const tb = $$('.tb', g);
    const ind = $('.ind', g);
    const cap = $('.cap span', g);
    let n = 0, user = 0, vis = true;
    new IntersectionObserver((es) => es.forEach((e) => (vis = e.isIntersecting))).observe(g);
    const go = (i) => {
      n = (i + sl.length) % sl.length;
      ind.style.setProperty('--n', n);
      sl.forEach((s, j) => s.classList.toggle('on', j === n));
      tb.forEach((t, j) => t.classList.toggle('on', j === n));
      if (cap) cap.textContent = tb[n].getAttribute('aria-label') || '';
    };
    tb.forEach((t, j) => t.addEventListener('click', () => { user = performance.now() + 4000; go(j); }));
    go(0);
    const tick = () => { if (vis && !reduced && performance.now() > user && document.visibilityState === 'visible') go(n + 1); setTimeout(tick, 2400); };
    setTimeout(tick, 1800);
  });

  /* ---------- Video modal with dot-bounce loader ---------- */
  const modal = $('.modal');
  if (modal) {
    const box = $('.box', modal), ld = $('.ld', modal), x = $('.x', modal);
    let media = null;
    const close = () => { modal.classList.remove('on'); setTimeout(() => { if (media) media.remove(); media = null; const em = $('.empty', modal); if (em) em.remove(); }, 350); };
    const open = (src, title, orient) => {
      modal.classList.toggle('vert', orient === 'v');
      modal.classList.add('on');
      ld.classList.remove('off');
      if (!src) {
        ld.classList.add('off');
        const em = document.createElement('div');
        em.className = 'empty';
        em.innerHTML = '<div><p style="font:600 20px/1.3 var(--font);color:#fff;letter-spacing:-.02em;margin-bottom:10px">' + (title || 'This piece') + ' is on our feed.</p><p>Add the video link to this card to play it here.</p></div>';
        box.appendChild(em);
        return;
      }
      if (/\.(mp4|webm|mov)(\?|$)/i.test(src)) {
        media = document.createElement('video');
        media.src = src; media.controls = true; media.autoplay = true; media.playsInline = true;
        media.addEventListener('canplay', () => ld.classList.add('off'));
      } else {
        media = document.createElement('iframe');
        media.src = src; media.allow = 'autoplay; fullscreen; picture-in-picture'; media.allowFullscreen = true;
        media.addEventListener('load', () => ld.classList.add('off'));
      }
      box.appendChild(media);
      setTimeout(() => ld.classList.add('off'), 6000);
    };
    document.addEventListener('click', (e) => {
      const v = e.target.closest('[data-video]');
      if (v) { e.preventDefault(); if (v.dataset.dragged === '1') return; open(v.dataset.video, v.dataset.name, v.dataset.orient); }
    });
    x.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('on')) close(); });
  }

  /* ---------- Year ---------- */
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
