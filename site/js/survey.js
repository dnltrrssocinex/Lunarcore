/* Start a project - role and goal pickers (3 steps), posted to the webhook. */
(() => {
  const root = document.querySelector('.survey');
  if (!root || !window.LC) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const ICONS = {
    store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9v11h18V9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M9 20v-6h6v6"/>',
    mega: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6"/><path d="M18 6a8 8 0 0 1 0 12"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v5"/>',
    food: '<path d="M3 11h18l-1.5 9h-15z"/><path d="M12 11V4"/><path d="M8 4h8"/>',
    agency: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8"/><path d="M12 18v4"/>',
    creator: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    cam: '<path d="M15 10l4.55-2.28A1 1 0 0 1 21 8.62v6.76a1 1 0 0 1-1.45.9L15 14"/><rect x="3" y="6" width="12" height="12" rx="2"/>',
    reel: '<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    photo: '<path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="12.5" r="3.5"/>',
    live: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4"/><path d="M7.8 16.2a6 6 0 0 1 0-8.4"/><path d="M19 5a10 10 0 0 1 0 14"/><path d="M5 19A10 10 0 0 1 5 5"/>',
    social: '<path d="M4 4h16v12H7l-3 3z"/><path d="M8 9h8"/><path d="M8 12h5"/>',
    design: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
  };
  const ic = (k, w = 2) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[k] + '</svg>';
  const roles = [['Business owner', 'store'], ['Marketing lead', 'mega'], ['Event organiser', 'mic'], ['Restaurant or cafe', 'food'], ['Agency', 'agency'], ['Creator', 'creator']];
  const goals = [
    ['Event coverage', 'Multi-cam, live feed, highlights', 'cam'],
    ['Reels and video ads', 'Short-form for feeds and paid media', 'reel'],
    ['Product and food photos', 'Studio or on location', 'photo'],
    ['Live stream', 'Online plus LED wall feed', 'live'],
    ['Social media management', 'Strategy, posting, reporting', 'social'],
    ['Graphic design', 'Posters, menus, ad creatives', 'design'],
  ];
  const timing = ['This month', 'Next month', 'In 3 months or more', 'Not sure yet'];

  $('.roles').innerHTML = roles.map(([n, k]) => '<button type="button" class="role" role="radio" aria-checked="false">' + ic(k) + '<span>' + n + '</span></button>').join('');
  $('.goals').innerHTML = goals.map(([t, s, k]) => '<button type="button" class="goal" aria-pressed="false"><span class="gi">' + ic(k) + '</span><span><b>' + t + '</b><small>' + s + '</small></span><span class="tk">' + ic('check', 3) + '</span></button>').join('');
  $('.timing').innerHTML = timing.map((t) => '<button type="button" class="chip" aria-pressed="false">' + t + '</button>').join('');

  const panes = $$('.pane'), bars = $$('.steps i'), stepLbl = $('.steps b');
  const back = $('.back'), go = $('.go');
  const roleEls = $$('.role'), goalEls = $$('.goal'), chipEls = $$('.chip');
  let step = 0, role = -1, when = -1, busy = false;
  const picked = new Set();

  const valid = () => {
    if (step === 0) { const f = $('[name=name]'), e = $('[name=email]'); return f.value.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.value.trim()); }
    if (step === 1) return role >= 0 && picked.size > 0;
    return true;
  };
  const render = () => {
    panes.forEach((p, i) => p.classList.toggle('on', i === step));
    bars.forEach((b, i) => b.classList.toggle('on', i <= step));
    stepLbl.textContent = 'Step ' + (step + 1) + ' of ' + panes.length;
    back.disabled = step === 0 || busy;
    roleEls.forEach((b, i) => { b.setAttribute('aria-checked', String(i === role)); b.tabIndex = i === role ? 0 : -1; });
    goalEls.forEach((b, i) => { const on = picked.has(i); b.setAttribute('aria-pressed', String(on)); b.classList.toggle('dim', !on && picked.size >= 3); });
    chipEls.forEach((c, i) => c.setAttribute('aria-pressed', String(i === when)));
    $('.cnt').textContent = picked.size + ' of 3 picked';
    $('.go .lbl').textContent = step === panes.length - 1 ? 'Send' : 'Continue';
    go.disabled = !valid() || busy;
  };
  roleEls.forEach((b, i) => b.addEventListener('click', () => { role = i; render(); }));
  goalEls.forEach((b, i) => b.addEventListener('click', () => { if (picked.has(i)) picked.delete(i); else if (picked.size < 3) picked.add(i); render(); }));
  chipEls.forEach((c, i) => c.addEventListener('click', () => { when = when === i ? -1 : i; render(); }));
  $$('input').forEach((el) => el.addEventListener('input', () => { el.closest('.field').classList.remove('bad'); render(); }));
  back.addEventListener('click', () => { if (step > 0) { step -= 1; render(); } });

  const payload = () => ({
    kind: 'survey',
    name: $('[name=name]').value.trim(),
    email: $('[name=email]').value.trim(),
    phone: $('[name=phone]').value.trim(),
    company: $('[name=company]').value.trim(),
    role: roles[role] ? roles[role][0] : '',
    goals: [...picked].map((i) => goals[i][0]),
    timing: when >= 0 ? timing[when] : '',
    notes: $('[name=notes]').value.trim(),
  });

  go.addEventListener('click', async () => {
    if (busy || !valid()) { if (step === 0) $$('.pane.on .field').forEach((f) => { const i = f.querySelector('input'); if (i.required && !i.checkValidity()) f.classList.add('bad'); }); return; }
    if (step < panes.length - 1) { step += 1; render(); $('.cardx').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    busy = true; render();
    go.classList.add('loading');
    const p = payload();
    p.reference = LC.ref();
    const res = await LC.submitLead(p);
    go.classList.replace('loading', 'ok');
    await new Promise((r) => setTimeout(r, 900));
    $('.cardx').hidden = true;
    $('.steps').hidden = true;
    const rows = [['Name', p.name], ['Email', p.email], ['Business', p.company], ['You are', p.role], ['Looking for', p.goals.join(', ')], ['Timing', p.timing], ['Reference', p.reference, true]];
    const fallback = res.fallback ? LC.mailto('Project brief from ' + p.name + ' (' + p.reference + ')', ['Name: ' + p.name, 'Email: ' + p.email, 'Phone: ' + p.phone, 'Business: ' + p.company, 'Role: ' + p.role, 'Goals: ' + p.goals.join(', '), 'Timing: ' + p.timing, '', p.notes]) : null;
    LC.success($('.flow'), {
      title: 'Brief received',
      text: 'Thanks, ' + p.name.split(' ')[0] + '. A copy goes to ' + p.email + ' and a producer replies within the day.',
      rows,
      fallbackHref: fallback,
      again: { label: 'Hold a date on the calendar', href: 'book.html' },
    });
  });
  render();
})();
