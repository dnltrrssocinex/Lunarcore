/* Start a project - 3 steps (contact, what you want done, timing), posted to the webhook.
   Step 2 leads with the services: role pills reorder the cards (popular first),
   up to 3 picks with a live meter and a running summary in the footer. */
(() => {
  const root = document.querySelector('.survey');
  if (!root || !window.LC) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  };
  const ic = (k, w = 2) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[k] + '</svg>';
  /* name, icon, plural for the "Popular for" tag, goals that suit it most */
  const roles = [
    ['Business owner', 'store', 'business owners', [1, 2, 4]],
    ['Marketing lead', 'mega', 'marketing leads', [1, 4, 5]],
    ['Event organiser', 'mic', 'event organisers', [0, 3, 1]],
    ['Restaurant or cafe', 'food', 'restaurants and cafes', [2, 1, 4]],
    ['Agency', 'agency', 'agencies', [1, 2, 5]],
    ['Creator', 'creator', 'creators', [1, 5, 4]],
  ];
  const goals = [
    ['Event coverage', 'Multi-cam, live feed, highlights', 'cam'],
    ['Reels and video ads', 'Short-form for feeds and paid media', 'reel'],
    ['Product and food photos', 'Studio or on location', 'photo'],
    ['Live stream', 'Online plus LED wall feed', 'live'],
    ['Social media management', 'Strategy, posting, reporting', 'social'],
    ['Graphic design', 'Posters, menus, ad creatives', 'design'],
  ];
  const timing = ['This month', 'Next month', 'In 3 months or more', 'Not sure yet'];
  const MAX = 3;

  $('.roles').innerHTML = roles.map(([n, k]) => '<button type="button" class="role" role="radio" aria-checked="false"><span class="ri">' + ic(k) + '</span><span class="rk">' + ic('check', 3) + '</span><span>' + n + '</span></button>').join('');
  $('.goals').innerHTML = goals.map(([t, s, k]) => '<button type="button" class="goal" aria-pressed="false"><span class="gi">' + ic(k) + '</span><span class="tk">' + ic('check', 3) + '</span><b>' + t + '</b><small>' + s + '</small><em class="tag" hidden></em><span class="lim"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>Limit reached · unpick one to swap</span></button>').join('');
  $('.timing').innerHTML = timing.map((t) => '<button type="button" class="chip" role="radio" aria-checked="false">' + t + '</button>').join('');

  const panes = $$('.pane'), bars = $$('.steps i'), stepNum = $('.steps em'), steps = $('.steps');
  const back = $('.back'), go = $('.go'), goLbl = $('.go .lbl'), meter = $$('.meter i');
  const picksEl = $('.picks'), picksSm = $('.picks small'), picksB = $('.picks b');
  const goalsBox = $('.goals'), roleEls = $$('.role'), goalEls = $$('.goal'), chipEls = $$('.chip');
  let step = 0, role = -1, when = -1, busy = false;
  const picked = [];

  /* every field is required: contact details, role, at least one goal, timing and notes */
  const checks = {
    name: (v) => v.length > 1,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    phone: (v) => v.replace(/\D/g, '').length >= 7,
    company: (v) => v.length > 1,
    notes: (v) => v.length > 2,
  };
  const ok = (k) => checks[k]($('[name=' + k + ']').value.trim());
  const valid = () => {
    if (step === 0) return ok('name') && ok('email') && ok('phone') && ok('company');
    if (step === 1) return role >= 0 && picked.length > 0;
    return when >= 0 && ok('notes');
  };
  const flag = () => $$('.pane.on .field').forEach((f) => { const i = f.querySelector('input,textarea'); if (i && checks[i.name] && !checks[i.name](i.value.trim())) f.classList.add('bad'); });

  /* reorder the cards for the chosen role, animating each card from where it was (FLIP) */
  const order = () => {
    const top = role >= 0 ? roles[role][3] : [];
    const seq = top.concat(goals.map((_, i) => i).filter((i) => !top.includes(i)));
    const before = goalEls.map((el) => el.getBoundingClientRect());
    seq.forEach((i) => goalsBox.appendChild(goalEls[i]));
    goalEls.forEach((el, i) => {
      const tag = el.querySelector('.tag');
      tag.hidden = !top.includes(i);
      if (!tag.hidden) tag.textContent = 'Popular for ' + roles[role][2];
    });
    if (reduced || !panes[1].classList.contains('on')) return;
    goalEls.forEach((el, i) => {
      const a = before[i], b = el.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (!dx && !dy) return;
      el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
  };

  const render = () => {
    const last = step === panes.length - 1;
    panes.forEach((p, i) => p.classList.toggle('on', i === step));
    bars.forEach((b, i) => b.classList.toggle('on', i <= step));
    stepNum.textContent = step + 1;
    steps.setAttribute('aria-valuenow', step + 1);
    steps.setAttribute('aria-label', 'Step ' + (step + 1) + ' of ' + panes.length);
    back.disabled = step === 0 || busy;
    roleEls.forEach((b, i) => { b.setAttribute('aria-checked', String(i === role)); b.tabIndex = i === role || (role < 0 && i === 0) ? 0 : -1; });
    const full = picked.length >= MAX;
    goalEls.forEach((b, i) => {
      const on = picked.includes(i);
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('dim', !on && full);
      if (!on && full) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
    });
    chipEls.forEach((c, i) => { c.setAttribute('aria-checked', String(i === when)); c.tabIndex = i === when || (when < 0 && i === 0) ? 0 : -1; });
    meter.forEach((m, i) => m.classList.toggle('on', i < picked.length));
    $('.cnt').textContent = full ? MAX + ' of ' + MAX + ' · limit reached' : picked.length + ' of ' + MAX + ' picked';
    $('.cnt').classList.toggle('full', full);
    /* running summary in the footer once the picks matter */
    const showPicks = step > 0;
    picksEl.classList.toggle('on', showPicks);
    picksSm.textContent = 'Your picks · ' + picked.length + ' of ' + MAX;
    picksB.textContent = picked.length ? picked.map((i) => goals[i][0]).join(' + ') : 'Nothing picked yet';
    picksB.classList.toggle('none', !picked.length);
    goLbl.innerHTML = (last ? 'Send' : 'Continue') + ' ' + ic('arrow', 2.2);
    /* step 2 locks Continue until a role and a goal are in; steps 1 and 3 explain on click */
    go.disabled = busy;
    go.setAttribute('aria-disabled', String(step === 1 && !valid()));
    go.classList.toggle('incomplete', !valid());
  };

  const hint = (msg) => { const h = $('.need'); if (!h) return; h.textContent = msg; h.classList.remove('show'); if (msg) { void h.offsetWidth; h.classList.add('show'); } };
  const pickRole = (i) => { const changed = i !== role; role = i; render(); if (changed) order(); };
  roleEls.forEach((b, i) => b.addEventListener('click', () => pickRole(i)));
  goalEls.forEach((b, i) => b.addEventListener('click', () => {
    const at = picked.indexOf(i);
    if (at > -1) picked.splice(at, 1);
    else if (picked.length < MAX) picked.push(i);
    else { hint('You can pick up to 3. Unpick one to swap it for this.'); return; }
    hint(''); render();
  }));
  chipEls.forEach((c, i) => c.addEventListener('click', () => { when = when === i ? -1 : i; render(); }));
  /* arrow keys move through radio groups */
  const roving = (els, pick) => els.forEach((b, i) => b.addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const n = (i + d + els.length) % els.length;
    pick(n); els[n].focus();
  }));
  roving(roleEls, pickRole);
  roving(chipEls, (n) => { when = n; render(); });
  $$('input,textarea').forEach((el) => el.addEventListener('input', () => { el.closest('.field').classList.remove('bad'); render(); }));
  back.addEventListener('click', () => { if (step > 0) { step -= 1; hint(''); render(); } });

  const payload = () => ({
    kind: 'survey',
    name: $('[name=name]').value.trim(),
    email: $('[name=email]').value.trim(),
    phone: $('[name=phone]').value.trim(),
    company: $('[name=company]').value.trim(),
    role: roles[role] ? roles[role][0] : '',
    goals: picked.map((i) => goals[i][0]),
    timing: when >= 0 ? timing[when] : '',
    notes: $('[name=notes]').value.trim(),
  });

  go.addEventListener('click', async () => {
    if (busy) return;
    if (!valid()) {
      flag();
      hint(step === 0 ? 'Fill in your name, email, phone and business to continue.' : step === 1 ? 'Pick at least one thing you want done and who you are booking as.' : 'Pick a timing and add a short note to send.');
      return;
    }
    hint('');
    if (step < panes.length - 1) {
      step += 1; render();
      const top = $('.cardx').getBoundingClientRect().top;
      if (top < 80) $('.cardx').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    busy = true; render();
    go.classList.add('loading');
    const p = payload();
    p.reference = LC.ref();
    const res = await LC.submitLead(p);
    go.classList.replace('loading', 'ok');
    await new Promise((r) => setTimeout(r, 900));
    $('.cardx').hidden = true;
    const rows = [['Name', p.name], ['Email', p.email], ['Business', p.company], ['You are', p.role], ['Looking for', p.goals.join(', ')], ['Timing', p.timing], ['Reference', p.reference, true]];
    const fallback = res.fallback ? LC.mailto('Project brief from ' + p.name + ' (' + p.reference + ')', ['Name: ' + p.name, 'Email: ' + p.email, 'Phone: ' + p.phone, 'Business: ' + p.company, 'Role: ' + p.role, 'Goals: ' + p.goals.join(', '), 'Timing: ' + p.timing, '', p.notes]) : null;
    LC.success($('.flow'), {
      title: 'Brief received',
      text: 'Thanks, ' + p.name.split(' ')[0] + '. A copy goes to ' + p.email + ' and a producer replies within the day.',
      rows,
      fallbackHref: fallback,
      again: { label: 'Hold a date on the calendar', href: 'book' },
    });
  });
  render();
})();
