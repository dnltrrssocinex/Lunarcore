/* Booking calendar (client-facing port of the studio booking snippet).
   Pick a shoot type, click a free half-hour in the week grid to hold it,
   then send the request. Reserved blocks are placeholders until the
   calendar is wired to a real source. */
(() => {
  const root = document.querySelector('.book');
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const types = {
    event: ['Event coverage', 'Multi-cam, live feed, highlights', 4],
    brand: ['Brand reels', 'Short-form for social', 2],
    product: ['Product photos', 'Studio or on location', 2],
    live: ['Live stream', 'Online + LED wall feed', 4],
  };
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const H0 = 8, H1 = 17; /* 8 AM - 5 PM, 9 rows */
  let pick = 'event';
  let held = null; /* {d: Date, h: number} */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monday = (d) => { const m = new Date(d); const day = (m.getDay() + 6) % 7; m.setDate(m.getDate() - day); m.setHours(0, 0, 0, 0); return m; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  /* late in the week, open on next week so there are free days to pick */
  let week = monday(today);
  if ((today.getDay() + 6) % 7 >= 4) week = addDays(week, 7);
  const fmtMonth = (d) => d.toLocaleDateString(undefined, { month: 'short' });
  const t12 = (h) => { const m = Math.round((h % 1) * 60); const hh = Math.floor(h); return ((hh + 11) % 12) + 1 + ':' + String(m).padStart(2, '0') + ' ' + (hh >= 12 ? 'PM' : 'AM'); };
  const hm = (h) => ((Math.floor(h) + 11) % 12) + 1 + ':' + String(Math.round((h % 1) * 60)).padStart(2, '0');
  const span = (s, du) => hm(s) + ' - ' + hm(s + du) + ' ' + (s + du >= 12 ? 'PM' : 'AM');
  const same = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  /* deterministic placeholder "reserved" blocks per week */
  const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };
  const reserved = (d) => {
    const key = d.toISOString().slice(0, 10);
    const out = [];
    const a = hash(key + 'a'), b = hash(key + 'b');
    if (a > 0.3) out.push([H0 + Math.floor(a * 6) * 0.5 + 1, a > 0.7 ? 2 : 1]);
    if (b > 0.55) out.push([H0 + 4 + Math.floor(b * 6) * 0.5, b > 0.8 ? 3 : 1.5]);
    return out.filter((x) => x[0] + x[1] <= H1);
  };

  /* types */
  $('.types').innerHTML = Object.keys(types).map((k) => '<li><button class="ty' + (k === pick ? ' pick' : '') + '" type="button" data-ty="' + k + '" aria-pressed="' + (k === pick) + '"><span class="sw s-' + k + '"></span><p><b>' + types[k][0] + '</b><small>' + types[k][1] + '</small></p><em>' + types[k][2] + ' h</em></button></li>').join('');
  $('.types').addEventListener('click', (e) => {
    const b = e.target.closest('.ty');
    if (!b) return;
    pick = b.dataset.ty;
    $$('.ty').forEach((x) => { x.classList.toggle('pick', x.dataset.ty === pick); x.setAttribute('aria-pressed', String(x.dataset.ty === pick)); });
    if (held) place(held.d, held.h, true);
    summary();
  });

  const toast = document.querySelector('.toast');
  let toastT = 0;
  const say = (m) => { toast.lastElementChild.textContent = m; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 2800); };
  const bump = (el) => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };

  const evHtml = (cls, s, du, title, extra) => '<div class="evb ' + cls + (du <= 0.5 ? ' sm' : '') + '" style="--t:' + (s - H0) / 9 + ';--h:' + du / 9 + '"' + (extra || '') + '><b>' + title + '</b><small>' + span(s, du) + '</small></div>';

  const render = () => {
    const days = DAYS.map((n, i) => [n, addDays(week, i)]);
    const end = days[4][1];
    $('.cal-head h3').textContent = fmtMonth(week) + ' ' + week.getDate() + ' - ' + (week.getMonth() === end.getMonth() ? '' : fmtMonth(end) + ' ') + end.getDate() + ', ' + end.getFullYear();
    $('.cal-head .sub').textContent = 'Philippine time. Click a free half-hour to hold it.';
    $('.dhd').innerHTML = '<span></span>' + days.map(([n, d]) => '<div class="dd' + (same(d, today) ? ' today' : '') + '">' + n + '<b>' + d.getDate() + '</b></div>').join('');
    $('.gut').innerHTML = Array.from({ length: 9 }, (_, i) => '<span style="--i:' + i + '">' + t12(H0 + i).replace(':00', '') + '</span>').join('');
    const now = new Date();
    const nowFrac = (now.getHours() + now.getMinutes() / 60 - H0) / 9;
    $('.cols').innerHTML = days.map(([n, d], i) => {
      const past = d < today;
      const blocks = past ? [[H0, 9]] : reserved(d);
      let html = blocks.map(([s, du]) => evHtml('busy', s, du, past ? 'Past' : 'Reserved')).join('');
      if (held && same(d, held.d)) html += evHtml('mine', held.h, types[pick][2], 'Your slot', ' data-mine="1"');
      if (same(d, now) && nowFrac > 0 && nowFrac < 1) html += '<i class="nowl" style="--now:' + (nowFrac * 100).toFixed(2) + '%"></i>';
      return '<div class="dc" data-d="' + i + '">' + html + '</div>';
    }).join('');
  };

  const free = (d, h, du) => {
    if (h < H0 || h + du > H1) return false;
    if (d < today) return false;
    return !reserved(d).some(([s, l]) => h < s + l && h + du > s);
  };

  const place = async (d, h, silent) => {
    const du = types[pick][2];
    if (!free(d, h, du)) { say('That time is not free for ' + types[pick][0].toLowerCase()); return; }
    held = { d, h };
    render();
    const el = root.querySelector('[data-mine]');
    if (el && !silent) {
      el.classList.add('pend');
      el.innerHTML = '<b>Holding</b><small>Checking the calendar</small>';
      await new Promise((r) => setTimeout(r, 900));
      el.classList.remove('pend');
      el.classList.add('land');
      el.innerHTML = '<b>Your slot</b><small>' + span(h, du) + '</small>';
      say('Held: ' + DAYS[(d.getDay() + 6) % 7] + ' ' + d.getDate() + ' ' + fmtMonth(d) + ', ' + t12(h));
    }
    summary();
  };

  $('.cols').addEventListener('click', (e) => {
    const mine = e.target.closest('[data-mine]');
    if (mine) { held = null; render(); summary(); say('Slot released'); return; }
    const col = e.target.closest('.dc');
    if (!col || e.target.closest('.evb')) return;
    const r = col.getBoundingClientRect();
    const y = (e.clientY - r.top) / r.height;
    const h = H0 + Math.floor(y * 18) / 2;
    place(addDays(week, +col.dataset.d), h);
  });

  $('.prev').addEventListener('click', () => { week = addDays(week, -7); render(); });
  $('.next').addEventListener('click', () => { week = addDays(week, 7); render(); });
  $('.today').addEventListener('click', () => { week = monday(today); render(); });

  /* summary + form */
  const form = document.querySelector('.form');
  const summary = () => {
    $('.s-type').textContent = types[pick][0];
    $('.s-dur').textContent = types[pick][2] + ' hours';
    const when = held ? held.d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + ', ' + t12(held.h) : 'Pick a slot';
    const big = $('.s-when');
    if (big.textContent !== when) { big.textContent = when; bump(big); }
    if (form) {
      form.querySelector('[name="type"]').value = types[pick][0];
      form.querySelector('[name="slot"]').value = held ? when + ' (' + types[pick][2] + ' h)' : '';
    }
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const to = form.dataset.email || '';
      const subject = 'Booking request: ' + f.get('type') + (f.get('slot') ? ' on ' + f.get('slot') : '');
      const body = ['Name: ' + f.get('name'), 'Email: ' + f.get('email'), 'Company / event: ' + f.get('company'), 'Shoot type: ' + f.get('type'), 'Preferred slot: ' + (f.get('slot') || 'flexible'), '', f.get('notes')].join('\n');
      location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      say('Opening your mail app');
    });
  }
  render();
  summary();
})();
