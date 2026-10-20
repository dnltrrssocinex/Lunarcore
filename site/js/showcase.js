/* Lunarcore Studios - showcase.js
   Video manifest + renderer. Cards show a poster, play muted on hover,
   and open the modal (with sound) on click. Add a clip: drop the mp4 and
   webp poster in assets/video/ and add a line to VIDEOS. */
(() => {
  const V = 'assets/video/';
  const VIDEOS = [
    /* id, client, title, kind, orientation, seconds */
    ['swaadisht-01', 'swaadisht', 'Swaadisht, reel 01', 'reel', 'v', 11],
    ['swaadisht-02', 'swaadisht', 'Swaadisht, reel 02', 'reel', 'v', 14],
    ['swaadisht-03', 'swaadisht', 'Swaadisht, reel 03', 'reel', 'v', 15],
    ['swaadisht-04', 'swaadisht', 'Swaadisht, reel 04', 'reel', 'v', 14],
    ['swaadisht-05', 'swaadisht', 'Swaadisht, reel 05', 'reel', 'v', 12],
    ['swaadisht-06', 'swaadisht', 'Swaadisht, reel 06', 'reel', 'v', 11],
    ['swaadisht-07', 'swaadisht', 'Swaadisht, reel 07', 'reel', 'v', 11],
    ['swaadisht-08', 'swaadisht', 'Swaadisht, reel 08', 'reel', 'v', 12],
    ['swaadisht-09', 'swaadisht', 'Swaadisht, reel 09', 'reel', 'v', 9],
    ['swaadisht-10', 'swaadisht', 'Swaadisht, reel 10', 'reel', 'v', 9],
    ['crazycurry-grand-opening', 'crazycurry', 'Grand opening, SM Center Imus', 'film', 'h', 90],
    ['crazycurry-reel-1', 'crazycurry', 'Grand opening reel', 'reel', 'v', 27],
    ['crazycurry-reel-2', 'crazycurry', 'Sandro at SM Imus', 'reel', 'v', 26],
    ['crazycurry-sandro-rosario', 'crazycurry', 'Sandro at SM Rosario', 'reel', 'v', 63],
    ['moms-kai-mall', 'moms', 'Moms, Kai Mall', 'reel', 'v', 90],
    ['moms-sm-sta-mesa', 'moms', 'Moms opening, SM Sta. Mesa', 'reel', 'v', 90],
    ['medispa-ultherapy-1', 'medispa', 'Ultherapy procedure demo, take 1', 'film', 'v', 61],
    ['medispa-ultherapy-2', 'medispa', 'Ultherapy procedure demo, take 2', 'film', 'v', 59],
    ['banwa-pause', 'banwa', 'When was the last time you paused?', 'reel', 'v', 26],
    ['banwa-signature-massage', 'banwa', 'Signature massage', 'reel', 'v', 26],
    ['banwa-lymphatic', 'banwa', 'Lymphatic massage', 'reel', 'v', 26],
    ['banwa-loyalty-card', 'banwa', 'Loyalty card', 'reel', 'v', 23],
    ['kendi-beauty-session', 'kendi', 'Your next beauty session', 'reel', 'v', 21],
    ['kendi-skin-time', 'kendi', 'Your skin deserves time', 'reel', 'v', 25],
    ['kendi-blackdoll', 'kendi', 'Blackdoll', 'reel', 'v', 23],
    ['morimill-reel-07', 'morimill', 'Mori & Mill, reel 07', 'reel', 'v', 16],
    ['morimill-reel-33', 'morimill', 'Mori & Mill, reel 33', 'reel', 'v', 16],
    ['morimill-reel-35', 'morimill', 'Mori & Mill, reel 35', 'reel', 'v', 19],
    ['morimill-reel-36', 'morimill', 'Mori & Mill, reel 36', 'reel', 'v', 19],
    ['bluepost-reel-1', 'bluepost', 'Blue Post, reel 01', 'reel', 'v', 8],
    ['bluepost-reel-2', 'bluepost', 'Blue Post, reel 02', 'reel', 'v', 11],
  ].map(([id, client, title, kind, orient, dur]) => ({ id, client, title, kind, orient, dur, src: V + id + '.mp4', poster: V + id + '.webp' }));
  const CLIENTS = { swaadisht: 'Swaadisht', crazycurry: 'Crazy Curry', moms: 'Moms', medispa: 'MediSpa', banwa: 'Banwa Wellness Spa', kendi: 'Kendi', morimill: 'Mori & Mill', bluepost: 'Blue Post' };
  const byId = Object.fromEntries(VIDEOS.map((v) => [v.id, v]));
  const mmss = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const card = (v, extra) => '<a class="reel ph-hover' + (v.orient === 'h' ? ' wide' : '') + (extra || '') + '" href="' + v.src + '" data-video="' + v.src + '" data-name="' + esc(v.title) + '" data-orient="' + v.orient + '" data-preview data-cursor="Play">' +
    '<img class="ph" src="' + v.poster + '" alt="' + esc(v.title) + '" width="' + (v.orient === 'h' ? 1280 : 720) + '" height="' + (v.orient === 'h' ? 720 : 1280) + '" loading="lazy" decoding="async">' +
    '<span class="play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>' +
    '<span class="dur" aria-hidden="true">' + mmss(v.dur) + '</span>' +
    '<span class="nm">' + esc(v.title) + '</span></a>';

  /* fill [data-showcase="client"] grids and [data-showcase-ids="a,b,c"] rows */
  document.querySelectorAll('[data-showcase]').forEach((el) => {
    const list = VIDEOS.filter((v) => v.client === el.dataset.showcase);
    el.innerHTML = list.map((v, i) => card(v, ' rv" data-delay="' + Math.min(4, i % 5))).join('');
    const n = el.closest('section') && el.closest('section').querySelector('[data-count]');
    if (n) n.textContent = String(list.length).padStart(2, '0');
  });
  document.querySelectorAll('[data-showcase-ids]').forEach((el) => {
    const ids = el.dataset.showcaseIds.split(',').map((s) => s.trim()).filter((s) => byId[s]);
    el.innerHTML = ids.map((id, i) => card(byId[id], ' rv" data-delay="' + Math.min(4, i))).join('');
  });
  /* ring cards declared in HTML reference the manifest by id */
  document.querySelectorAll('[data-vid]').forEach((el) => {
    const v = byId[el.dataset.vid];
    if (!v) return;
    el.dataset.video = v.src; el.dataset.name = v.title; el.dataset.orient = v.orient;
    el.setAttribute('data-preview', '');
    el.setAttribute('data-cursor', 'Watch');
    const img = el.querySelector('img');
    if (img) { img.src = v.poster; img.alt = v.title; }
    const nm = el.querySelector('.nm');
    if (nm) nm.textContent = v.title;
  });
  /* newly rendered .rv elements need the reveal pass */
  if (window.IntersectionObserver) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('[data-showcase] .rv, [data-showcase-ids] .rv').forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('in'); else io.observe(el); });
  }

  /* hover preview: muted inline playback on fine pointers */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let active = null;
    const stop = (el) => { const vd = el.querySelector('video'); if (vd) { vd.pause(); vd.remove(); } el.classList.remove('playing'); if (active === el) active = null; };
    document.addEventListener('pointerover', (e) => {
      const el = e.target.closest('[data-preview][data-video]');
      if (!el || el === active || !el.dataset.video) return;
      if (active) stop(active);
      active = el;
      const vd = document.createElement('video');
      vd.muted = true; vd.loop = true; vd.playsInline = true; vd.preload = 'auto';
      vd.src = el.dataset.video + '#t=0.1';
      el.appendChild(vd);
      vd.addEventListener('playing', () => el.classList.add('playing'), { once: true });
      const p = vd.play(); if (p && p.catch) p.catch(() => {});
    });
    document.addEventListener('pointerout', (e) => {
      const el = e.target.closest('[data-preview][data-video]');
      if (el && !el.contains(e.relatedTarget)) stop(el);
    });
  }
  /* highlight reels: load and play muted only while on screen (saves data on phones) */
  const autos = [...document.querySelectorAll('video[data-autoplay]')];
  if (autos.length && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      const vd = en.target, card = vd.closest('.vhl');
      if (en.isIntersecting) {
        if (!vd.src && vd.dataset.src) vd.src = vd.dataset.src;
        const p = vd.play(); if (p && p.catch) p.catch(() => {});
        if (card) card.classList.add('live');
      } else {
        vd.pause();
        if (card) card.classList.remove('live');
      }
    }), { threshold: 0.35 });
    autos.forEach((vd) => io.observe(vd));
  }

  window.LC_VIDEOS = { all: VIDEOS, byId, clients: CLIENTS };
})();
