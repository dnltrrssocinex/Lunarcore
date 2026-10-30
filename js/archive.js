/* Off-canvas collections sidebar with edge peek (Photos, Videos, Events).
   Desktop: the panel pushes content; hide it and it tucks off the left edge,
   hover the edge to peek, or use the floating button. Mobile: a drawer. */
(() => {
  const app = document.querySelector('.archive');
  if (!app) return;
  const $ = (s, r = app) => r.querySelector(s);
  const pn = $('.oc-pn'), ez = $('.oc-ez'), cl = $('.oc-cl'), fb = $('.oc-fb'), bk = $('.oc-bk'), ttl = $('.oc-br b');
  const items = [...app.querySelectorAll('.oc-it[href^="#"]')];
  const mobile = () => matchMedia('(max-width:900px)').matches;
  let t = 0;
  const off = (v) => { clearTimeout(t); app.classList.remove('peek'); app.classList.toggle('off', v); try { localStorage.setItem('lc-oc', v ? '1' : '0'); } catch (_) {} };
  const peek = (v) => {
    clearTimeout(t);
    if (!app.classList.contains('off') || mobile()) return;
    if (v) app.classList.add('peek');
    else t = setTimeout(() => app.classList.remove('peek'), 300);
  };
  let saved = null;
  try { saved = localStorage.getItem('lc-oc'); } catch (_) {}
  app.classList.toggle('off', mobile() ? true : saved === '1');
  cl.addEventListener('click', () => off(true));
  fb.addEventListener('click', () => off(false));
  if (bk) bk.addEventListener('click', () => off(true));
  [ez, pn].forEach((el) => { if (!el) return; el.addEventListener('pointerenter', () => peek(true)); el.addEventListener('pointerleave', () => peek(false)); });
  addEventListener('resize', () => { if (mobile() && !app.classList.contains('off')) app.classList.add('off'); });

  /* which collection is in view */
  const secs = items.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  let cur = -1;
  const setOn = (i) => {
    if (i === cur) return;
    cur = i;
    items.forEach((a, n) => a.classList.toggle('on', n === i));
    if (ttl && items[i]) {
      ttl.classList.add('out');
      setTimeout(() => { ttl.textContent = items[i].dataset.t || items[i].textContent.trim(); ttl.classList.remove('out'); }, 150);
    }
  };
  const spy = () => {
    const line = innerHeight * 0.38;
    /* the section whose top most recently crossed the line wins, whatever order the sidebar lists them in */
    let best = 0, bestTop = -Infinity;
    secs.forEach((s, i) => { const t = s.getBoundingClientRect().top; if (t <= line && t > bestTop) { bestTop = t; best = i; } });
    setOn(best);
  };
  addEventListener('scroll', spy, { passive: true });
  spy();
  items.forEach((a, i) => a.addEventListener('click', (e) => {
    e.preventDefault();
    secs[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (mobile()) off(true);
  }));

  /* edge zone and floating button only while the archive is on screen */
  new IntersectionObserver((es) => es.forEach((en) => app.classList.toggle('in-view', en.isIntersecting)), { rootMargin: '-80px 0px 0px 0px' }).observe(app);
})();
