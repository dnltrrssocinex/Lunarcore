/* Lunarcore Studios - forms.js
   Shared lead plumbing: webhook submit, review and success panels
   (ported from the success-confirmation and coming-soon snippets),
   and an .ics generator for "Add to calendar". */
(() => {
  const CFG = window.LUNARCORE || {};
  const ICONS = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    bolt: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  };
  const ic = (k, s = 18, w = 2) => '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[k] || ICONS.check) + '</svg>';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ref = () => 'LC-' + Date.now().toString(36).toUpperCase().slice(-6);

  /* ---------- Webhook ---------- */
  const submitLead = async (payload) => {
    const body = JSON.stringify(Object.assign({ source: 'lunarcore-site', page: location.pathname, submittedAt: new Date().toISOString() }, payload, {
      /* flat, GHL-friendly extras */
      firstName: String(payload.name || '').trim().split(/\s+/)[0] || '',
      lastName: String(payload.name || '').trim().split(/\s+/).slice(1).join(' '),
      goalsText: Array.isArray(payload.goals) ? payload.goals.join(', ') : '',
    }));
    if (!CFG.webhook) {
      console.warn('[Lunarcore] No webhook configured in js/config.js. Falling back to mailto.');
      return { ok: false, fallback: true };
    }
    try {
      const r = await fetch(CFG.webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      return { ok: r.ok || r.type === 'opaque' };
    } catch (_) {
      /* CORS-locked endpoints: fire-and-forget without reading the response */
      /* CORS-locked endpoint: resend as form fields (a CORS-safe content type every webhook parser reads) */
      try {
        const form = new URLSearchParams();
        Object.entries(JSON.parse(body)).forEach(([k, v]) => form.append(k, Array.isArray(v) ? v.join(', ') : v == null ? '' : String(v)));
        await fetch(CFG.webhook, { method: 'POST', mode: 'no-cors', body: form });
        return { ok: true, opaque: true };
      } catch (e) { return { ok: false }; }
    }
  };

  const mailto = (subject, lines) => 'mailto:' + (CFG.email || '') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));

  /* ---------- .ics ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = (d) => d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  const icsEsc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const downloadIcs = ({ title, start, hours, description, id }) => {
    const end = new Date(start.getTime() + hours * 3600000);
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lunarcore Studios//Booking//EN', 'BEGIN:VEVENT', 'UID:' + id + '@lunarcorestudios', 'DTSTAMP:' + stamp(new Date()), 'DTSTART:' + stamp(start), 'DTEND:' + stamp(end), 'SUMMARY:' + icsEsc(title), 'DESCRIPTION:' + icsEsc(description || ''), 'LOCATION:' + icsEsc(CFG.location || ''), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'lunarcore-' + id + '.ics';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* ---------- Panels ---------- */
  const rows = (list) => '<dl class="sumr">' + list.filter((r) => r[1]).map(([k, v, mono]) => '<div><dt>' + esc(k) + '</dt><dd' + (mono ? ' class="mono"' : '') + '>' + esc(v) + '</dd></div>').join('') + '</dl>';

  const nextPanel = () => {
    const steps = CFG.next || [];
    return '<section class="card pv" aria-label="What happens next"><span class="pill bt">What happens next</span>' +
      steps.map(([k, t, i], n) => (n ? '<span class="wr w' + n + '"><i></i></span>' : '') + '<div class="nd n' + (n + 1) + '"><span class="ni">' + ic(i) + '</span><p><small>' + esc(k) + '</small><b>' + esc(t) + '</b></p></div>').join('') +
      '</section>';
  };

  /* review(host, opts) -> Promise<boolean>  (true = confirmed) */
  const review = (host, { title, text, rows: list, confirmLabel }) => new Promise((resolve) => {
    host.innerHTML = '<section class="card box flow-box" data-s="rev"><div class="pnl rev"><span class="okc big q">' + ic('cal', 30) + '</span><h2>' + esc(title) + '</h2><p class="txt">' + esc(text) + '</p>' + rows(list) +
      '<div class="acts"><button class="btn btn-primary cf" type="button"><span>' + esc(confirmLabel || 'Confirm') + '</span></button><button class="btn btn-ghost cn" type="button">Go back</button></div></div></section>';
    host.hidden = false;
    host.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const cf = host.querySelector('.cf');
    cf.addEventListener('click', () => { cf.classList.add('busy'); cf.querySelector('span').textContent = 'Sending'; resolve(true); });
    host.querySelector('.cn').addEventListener('click', () => resolve(false));
  });

  const success = (host, { title, text, rows: list, ics, again, fallbackHref }) => {
    host.innerHTML = '<div class="flow-grid"><section class="card box flow-box" data-s="done" aria-live="polite"><div class="pnl done"><span class="okring"></span><span class="okc big">' +
      '<svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path pathLength="1" d="M20 6 9 17l-5-5"/></svg></span>' +
      '<h2>' + esc(title) + '</h2><p class="txt">' + esc(text) + '</p>' + rows(list) +
      '<div class="acts">' + (ics ? '<button class="btn btn-primary addcal" type="button">' + ic('cal', 16) + '<span>Add to calendar</span></button>' : '') +
      (fallbackHref ? '<a class="btn btn-primary" href="' + fallbackHref + '">' + ic('mail', 16) + '<span>Send by email</span></a>' : '') +
      '<a class="btn btn-ghost" href="index.html">Back to home</a></div>' +
      (again ? '<a class="lk again" href="' + esc(again.href) + '">' + esc(again.label) + '</a>' : '') +
      '</div></section>' + nextPanel() + '</div>';
    host.hidden = false;
    host.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const cal = host.querySelector('.addcal');
    if (cal) cal.addEventListener('click', () => { downloadIcs(ics); cal.classList.add('ok'); cal.querySelector('span').textContent = 'Added to calendar'; });
  };

  window.LC = { submitLead, mailto, review, success, downloadIcs, ref, ic };
})();
