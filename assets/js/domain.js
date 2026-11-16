/*
 * ETrama — lapisan domain prototipe (tanpa server):
 *   DB   : koleksi data di localStorage (salinan awal dari MOCK), log history, notifikasi.
 *   Cal  : hari kerja & SLA (Senin–Jumat, minus hari libur dari setting).
 *   Calc : total SO, nominal termin & invoice, status piutang & umur, status PO / invoice vendor.
 *   Flow : alur invoice (ajukan, approve, kembalikan, kirim, revisi) sesuai setting approval.
 *   Docs : render preview PDF invoice & form transmittal (HTML).
 * ASUMSI: file tambahan di luar daftar CLAUDE.md §4 agar logika tidak diduplikasi di setiap halaman.
 * Membutuhkan: mock-data.js, ui.js.
 */
(function () {
  const { store, esc, formatRupiah, formatDate } = UI;

  /* =====================================================================
   * DB
   * ===================================================================== */
  const PREFIX = 'etrama.db.v3.';
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const cache = {};
  const DB = {
    all(c) {
      if (!cache[c]) cache[c] = store.get(PREFIX + c, null) || clone(MOCK[c]);
      return cache[c];
    },
    save(c, data) { cache[c] = data; store.set(PREFIX + c, data); },
    find(c, fn) { return DB.all(c).find(fn) || null; },
    /** Ubah satu record via fungsi mutasi, lalu simpan. */
    update(c, fn, mutate) {
      const arr = DB.all(c);
      const item = arr.find(fn);
      if (!item) return null;
      mutate(item);
      DB.save(c, arr);
      return item;
    },
    insert(c, obj, atStart) { const arr = DB.all(c); if (atStart) arr.unshift(obj); else arr.push(obj); DB.save(c, arr); return obj; },
    remove(c, fn) { DB.save(c, DB.all(c).filter((x) => !fn(x))); },
    settings() { return DB.all('settings'); },
    saveSettings(s) { DB.save('settings', s); },
    reset() {
      Object.keys(cache).forEach((k) => delete cache[k]);
      try { Object.keys(localStorage).filter((k) => k.startsWith('etrama.')).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* abaikan */ }
    },
    /** Catat log history (read-only). user default = user aktif di layout. */
    log(entry, user) {
      const u = user || (window.Layout && Layout.user && Layout.user()) || (window.Auth && Auth.sessionUser());
      DB.insert('logs', Object.assign({ at: Cal.nowIso(), userId: u ? u.id : 'U-000', docNo: '—', module: '—', reason: '', changes: [] }, entry), true);
    },
    /** Kirim notifikasi in-app ke role penerima. */
    notify(n) {
      DB.insert('notifications', Object.assign({ id: 'N-' + Date.now() + Math.floor(Math.random() * 99), time: Cal.nowIso(), read: false }, n), true);
    },
    user(id) {
      if (id === 'U-000' || id === 'Sistem') return { id: 'U-000', name: 'Sistem', role: null };
      return DB.find('users', (u) => u.id === id) || { id, name: id, role: null };
    },
    client(code) { return DB.find('clients', (c) => c.code === code); },
    vendor(code) { return DB.find('vendors', (v) => v.code === code); },
    bd(id) { return DB.find('stafBD', (b) => b.id === id); },
    so(no) { return DB.find('salesOrders', (s) => s.no === no); },
    invoice(no) { return DB.find('invoices', (i) => i.no === no); },
    po(id) { return DB.find('purchaseOrders', (p) => p.id === id); },
    bank(id) { return (DB.settings().banks || []).find((b) => b.id === id) || null; },
    /** Nomor urut berikutnya untuk pola seperti SO/ETR/{YYYY}/{MM}/{####}. */
    nextNo(pattern, existing, date) {
      const d = date || MOCK.today;
      const [Y, M] = d.split('-');
      const head = pattern.replace('{YYYY}', Y).replace('{MM}', M).split('{####}')[0];
      const nums = existing.filter((x) => x.startsWith(head)).map((x) => parseInt(x.slice(head.length), 10) || 0);
      return head + String(Math.max(0, ...nums) + 1).padStart(4, '0');
    },
  };

  /* =====================================================================
   * Cal — hari kerja (WIB)
   * ===================================================================== */
  const D = (s) => new Date(String(s).slice(0, 10) + 'T00:00:00Z');
  const iso = (d) => d.toISOString().slice(0, 10);
  const Cal = {
    today: () => MOCK.today,
    /** ISO datetime "sekarang": tanggal prototipe + jam WIB saat ini. */
    nowIso() {
      const t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
      return `${MOCK.today}T${t}:00+07:00`;
    },
    /** 'YYYY-MM-DD' (WIB) dari ISO datetime / date. */
    dateOf(v) {
      if (!v) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
      const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(v));
      return p;
    },
    holidays() { return new Set((DB.settings().holidays || []).map((h) => h.date)); },
    isWorkday(s) { const d = D(s); const w = d.getUTCDay(); return w !== 0 && w !== 6 && !Cal.holidays().has(iso(d)); },
    addDays(s, n) { const d = D(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); },
    addWorkdays(s, n) {
      let d = Cal.dateOf(s);
      let left = n;
      while (left > 0) { d = Cal.addDays(d, 1); if (Cal.isWorkday(d)) left--; }
      return d;
    },
    /** Selisih hari kerja dari a ke b (positif jika b setelah a). */
    workdaysBetween(a, b) {
      let x = Cal.dateOf(a); const y = Cal.dateOf(b);
      if (x === y) return 0;
      const sign = x < y ? 1 : -1;
      let n = 0;
      while (x !== y) { x = Cal.addDays(x, sign); if (Cal.isWorkday(x)) n += sign; }
      return n;
    },
    daysBetween(a, b) { return Math.round((D(b) - D(a)) / 86400000); },
    slaDays(key) { const s = (DB.settings().sla || []).find((x) => x.key === key); return s ? s.days : 0; },
    /** Sisa hari kerja menuju batas SLA (negatif = lewat). */
    slaRemaining(start, key) {
      const cfg = (DB.settings().sla || []).find((x) => x.key === key);
      const deadline = cfg && cfg.unit === 'kalender' ? Cal.addDays(String(start).slice(0, 10), Cal.slaDays(key)) : Cal.addWorkdays(start, Cal.slaDays(key));
      return { deadline, remaining: Cal.workdaysBetween(MOCK.today, deadline) };
    },
  };

  /* =====================================================================
   * Calc
   * ===================================================================== */
  const sum = (arr, fn) => arr.reduce((s, x) => s + (fn ? fn(x) : x), 0);
  const Calc = {
    sum,
    line(it) { const [desc, qty, unit, price, disc] = it; return { desc, qty, unit, price, disc: disc || 0, subtotal: qty * price - (disc || 0) }; },
    soTotals(so) {
      const lines = so.items.map(Calc.line);
      const dpp = sum(lines, (l) => l.subtotal);
      const rate = so.ppnRate != null ? so.ppnRate : DB.settings().ppnRate;
      const ppn = Math.round(dpp * rate / 100);
      return { lines, dpp, ppn, rate, total: dpp + ppn };
    },
    /** Nominal per termin; termin terakhir menyerap selisih pembulatan. */
    terms(so) {
      const t = Calc.soTotals(so);
      let acc = 0;
      return so.top.map((term, i) => {
        const last = i === so.top.length - 1;
        let amount;
        if (term.amount != null) amount = term.amount;
        else amount = last && sum(so.top, (x) => x.pct) === 100 && so.top.every((x) => x.amount == null) ? t.total - acc : Math.round(t.total * term.pct / 100);
        acc += amount;
        return Object.assign({}, term, { amount, dpp: Math.round(t.dpp * term.pct / 100) });
      });
    },
    /** Invoice + data turunan (SO, client, termin, nominal, label nomor). */
    inv(inv) {
      const so = DB.so(inv.soNo);
      const term = Calc.terms(so).find((t) => t.no === inv.term);
      const client = DB.client(so.clientCode);
      const total = term.amount;
      const dpp = term.dpp;
      return Object.assign({}, inv, {
        so, term, client, dpp, ppn: total - dpp, total,
        label: inv.no + (inv.rev ? ` Rev.${inv.rev}` : ''),
        creator: DB.user(inv.createdBy),
      });
    },
    paid(inv, total) {
      const ar = inv.ar || {};
      return sum(ar.payments || [], (p) => (p.amount === 'FULL' ? total : p.amount));
    },
    /** Status penagihan piutang (PRD US-FN-10). */
    arStatus(x) {
      const paid = Calc.paid(x, x.total);
      const ar = x.ar || {};
      if (paid >= x.total) return 'Paid';
      if (ar.hold) return 'On Hold';
      if (ar.escalated) return 'Dieskalasi';
      if (paid > 0) return 'Partially Paid';
      if (x.due < MOCK.today) return 'Overdue';
      return 'Belum Jatuh Tempo';
    },
    overdueDays(x) { return Math.max(0, Cal.daysBetween(x.due, MOCK.today)); },
    agingBucket(x) {
      const d = Calc.overdueDays(x);
      if (d <= 0) return 'Belum jatuh tempo';
      if (d <= 30) return '1–30 hari';
      if (d <= 60) return '31–60 hari';
      if (d <= 90) return '61–90 hari';
      return '>90 hari';
    },
    BUCKETS: ['Belum jatuh tempo', '1–30 hari', '31–60 hari', '61–90 hari', '>90 hari'],
    /** Semua piutang (invoice terkirim) dengan field turunan. */
    receivables() {
      return DB.all('invoices').filter((i) => i.status === 'Terkirim').map((i) => {
        const x = Calc.inv(i);
        const paid = Calc.paid(i, x.total);
        const ar = i.ar || {};
        const lastRem = (ar.reminders || []).slice(-1)[0];
        const lastNote = (ar.notes || []).slice(-1)[0];
        return Object.assign(x, {
          paid, outstanding: x.total - paid, arStatus: Calc.arStatus(x), bucket: Calc.agingBucket(x), overdue: Calc.overdueDays(x),
          lastReminder: lastRem ? lastRem.at : null, lastNote: lastNote ? lastNote.text : '', clientName: x.client.name,
        });
      });
    },
    /** Status penagihan Sales Order. */
    soBilling(so) {
      const invs = DB.all('invoices').filter((i) => i.soNo === so.no);
      const total = Calc.soTotals(so).total;
      const sent = invs.filter((i) => i.status === 'Terkirim').map(Calc.inv);
      const billed = sum(sent, (x) => x.total);
      const paid = sum(sent, (x) => Calc.paid(x, x.total));
      let status = 'Belum ditagih';
      if (paid >= total) status = 'Lunas';
      else if (billed > 0) status = 'Sebagian ditagih';
      else if (invs.length) status = 'Dalam proses';
      return { status, billed, paid, total, invoices: invs };
    },
    /** SLA aktif untuk invoice berdasarkan status & waktu langkah terakhir. */
    invoiceSla(inv) {
      const last = (inv.history || []).slice(-1)[0];
      const start = last ? last.at : inv.date;
      const map = { 'Draft': ['buatInvoice', 'Buat invoice'], 'Dikembalikan': ['buatInvoice', 'Perbaikan invoice'], 'Review Lead F&A': ['reviewLead', 'Review Lead F&A'], 'Review Manager': ['reviewMgr', 'Review Manager'], 'Review Direktur': ['reviewMgr', 'Review Direktur'], 'Disetujui': ['kirimInvoice', 'Kirim invoice'] };
      const m = map[inv.status];
      if (!m) return null;
      return Object.assign({ label: m[1], key: m[0] }, Cal.slaRemaining(start, m[0]));
    },
    /** Reminder jatuh tempo yang perlu dilakukan hari ini (mis. 'H-7') atau null. Dijeda saat On Hold. */
    reminderDue(x) {
      if (['Paid', 'On Hold'].includes(x.arStatus || Calc.arStatus(x))) return null;
      const toDue = Cal.daysBetween(MOCK.today, x.due);
      if (toDue < 0) return null;
      const done = new Set(((x.ar || {}).reminders || []).map((r) => r.type));
      const days = DB.settings().reminders.slice().sort((a, b) => a - b);
      const d = days.find((r) => toDue <= r);
      return d && !done.has(`H-${d}`) ? `H-${d}` : null;
    },
    /** Termin berpemicu tanggal pada SO aktif yang belum punya invoice (SLA buat invoice H+3 dari dokumen lengkap). */
    pendingTerms() {
      const invs = DB.all('invoices').filter((i) => i.status !== 'Dibatalkan');
      return DB.all('salesOrders').filter((so) => so.status === 'Aktif').flatMap((so) => Calc.terms(so)
        .filter((t) => t.trigger === 'date' && !invs.some((i) => i.soNo === so.no && i.term === t.no))
        .map((t) => Object.assign({ so, sla: Cal.slaRemaining(so.receivedDate, 'buatInvoice') }, t)));
    },
    /** Termin milestone yang belum ada BAST / BA-nya. */
    awaitingBast() {
      const docs = DB.all('bast');
      return DB.all('salesOrders').filter((so) => so.status === 'Aktif').flatMap((so) => Calc.terms(so)
        .filter((t) => t.trigger === 'milestone' && !docs.some((b) => b.soNo === so.no && b.term === t.no))
        .map((t) => Object.assign({ so }, t)));
    },
    /* --- Vendor --- */
    poTotals(po) {
      const lines = po.items.map(([name, spec, qty, unit, price, disc]) => ({ name, spec, qty, unit, price, disc: disc || 0, subtotal: qty * price - (disc || 0) }));
      const dpp = sum(lines, (l) => l.subtotal);
      const ppn = Math.round(dpp * DB.settings().ppnRate / 100);
      const pph = Math.round(dpp * (po.pph || 0) / 100);
      return { lines, dpp, ppn, pph, total: dpp + ppn - pph };
    },
    viTotal(vi) { return vi.dpp + vi.ppn; },
    viPaid(vi) { return sum(DB.all('vendorPayments').filter((p) => p.viNo === vi.no), (p) => p.amount); },
    viStatus(vi) {
      const paid = Calc.viPaid(vi);
      if (paid >= Calc.viTotal(vi)) return 'Paid';
      if (paid > 0) return 'Partially Paid';
      return 'Belum Dibayar';
    },
    poSummary(po) {
      const t = Calc.poTotals(po);
      const vis = DB.all('vendorInvoices').filter((v) => v.poId === po.id);
      const invoicedDpp = sum(vis, (v) => v.dpp);
      const invoiced = sum(vis, Calc.viTotal);
      const paid = sum(vis, Calc.viPaid);
      let status = 'Open';
      if (vis.length && invoicedDpp >= t.dpp) status = vis.every((v) => Calc.viStatus(v) === 'Paid') ? 'Closed' : 'Fully Invoiced';
      else if (vis.length) status = 'Partially Invoiced';
      return Object.assign(t, { vis, invoiced, invoicedDpp, paid, remainingDpp: t.dpp - invoicedDpp, status, vendor: DB.vendor(po.vendorCode) });
    },
  };

  /* =====================================================================
   * Flow — alur invoice
   * ===================================================================== */
  const ROLE_STATUS = { lead: 'Review Lead F&A', mgr_ops: 'Review Manager', direktur: 'Review Direktur' };
  const LEVEL_RANK = { staf: 1, lead: 2, mgr_ops: 3, direktur: 4 };
  const Flow = {
    ROLE_STATUS,
    config() { return DB.settings().approval.docs.find((d) => d.key === 'invoice'); },
    /** Urutan status review untuk sebuah invoice (layer aktif + threshold + skip otomatis). */
    route(x) {
      const cfg = Flow.config();
      const creator = DB.user(x.createdBy);
      const autoSkip = DB.settings().approval.autoSkip;
      // Per step: "wajib" (active) dan "lewati otomatis jika pembuat setara/lebih tinggi" (skipIfEqual, default = setting global).
      const steps = cfg.layers.filter((l) => l.active)
        .filter((l) => !((l.skipIfEqual != null ? l.skipIfEqual : autoSkip) && creator.role && LEVEL_RANK[creator.role] >= LEVEL_RANK[l.key]))
        .map((l) => ROLE_STATUS[l.key] || l.status);
      if (cfg.threshold && cfg.threshold.enabled && cfg.threshold.tiers.some((t) => t.active !== false && x.total >= t.min)) steps.push(ROLE_STATUS.direktur);
      return [...new Set(steps)];
    },
    /** Langkah stepper untuk tampilan. */
    stepper(x) {
      const route = Flow.route(x);
      return ['Draft', ...route, 'Disetujui', 'Terkirim'];
    },
    myReviewStatus(role) { return ROLE_STATUS[role] || null; },
    canReview(inv, user) { return ROLE_STATUS[user.role] === inv.status; },
    isOwn(inv, user) { return inv.createdBy === user.id; },
    _push(no, status, action, note, user, notify) {
      const u = user || Layout.user();
      let before;
      const inv = DB.update('invoices', (i) => i.no === no, (i) => {
        before = i.status;
        i.status = status;
        i.history = i.history || [];
        i.history.push({ at: Cal.nowIso(), by: u.id, action, note: note || '' });
        if (status === 'Dikembalikan') i.returnNote = note;
      });
      DB.log({ action, docNo: no + (inv.rev ? ` Rev.${inv.rev}` : ''), module: action.includes('etuju') || action.includes('engembali') ? 'Approval' : 'Invoice', reason: note || '', changes: [{ field: 'Status', before, after: status }] });
      if (notify) DB.notify(Object.assign({ docNo: no }, notify));
      return inv;
    },
    submit(no) {
      const x = Calc.inv(DB.invoice(no));
      const route = Flow.route(x);
      const next = route[0] || 'Disetujui';
      const target = Object.keys(ROLE_STATUS).find((k) => ROLE_STATUS[k] === next);
      return Flow._push(no, next, x.status === 'Dikembalikan' ? 'Diajukan ulang' : `Diajukan ke ${next.replace('Review ', '')}`, '', null,
        target ? { type: 'review', roles: [target], title: `Invoice menunggu review ${next.replace('Review ', '')}`, href: `finance/approval.html?no=${no}` } : null);
    },
    approve(no) {
      const x = Calc.inv(DB.invoice(no));
      const route = Flow.route(x);
      const idx = route.indexOf(x.status);
      const next = route[idx + 1] || 'Disetujui';
      const target = Object.keys(ROLE_STATUS).find((k) => ROLE_STATUS[k] === next);
      const by = x.status.replace('Review ', '');
      return Flow._push(no, next, `Disetujui ${by}`, '', null, target
        ? { type: 'review', roles: [target], title: `Invoice menunggu review ${next.replace('Review ', '')}`, href: `finance/approval.html?no=${no}` }
        : { type: 'review', roles: ['staf'], title: 'Invoice disetujui — siap dikirim ke klien', href: `finance/invoice-detail.html?no=${no}` });
    },
    returnBack(no, note) {
      const x = DB.invoice(no);
      return Flow._push(no, 'Dikembalikan', 'Dikembalikan', note, null, { type: 'dikembalikan', roles: ['staf'], title: `Invoice dikembalikan oleh ${x.status.replace('Review ', '')}`, href: `finance/invoice-detail.html?no=${no}` });
    },
    send(no, opts) {
      const inv = Flow._push(no, 'Terkirim', `Terkirim ke klien${DB.invoice(no).rev ? ` (Rev.${DB.invoice(no).rev})` : ''}`, opts && opts.note);
      DB.update('invoices', (i) => i.no === no, (i) => { i.sentAt = Cal.nowIso(); i.ar = i.ar || { payments: [], reminders: [], notes: [] }; });
      return inv;
    },
    revise(no, reason) {
      let rev;
      DB.update('invoices', (i) => i.no === no, (i) => {
        i.versions = i.versions && i.versions.length ? i.versions : [{ rev: 0, at: i.history[0].at, reason: 'Versi awal' }];
        i.rev = (i.rev || 0) + 1;
        rev = i.rev;
        i.versions.push({ rev: i.rev, at: Cal.nowIso(), reason });
        i.transmittalSigned = null;
      });
      DB.log({ action: 'Revisi invoice dari klien', docNo: no, module: 'Invoice', reason, changes: [{ field: 'Versi', before: `Rev.${rev - 1}`, after: `Rev.${rev}` }] });
      return Flow._push(no, 'Draft', `Revisi dari klien (Rev.${rev})`, reason);
    },
  };

  /* =====================================================================
   * Docs — preview PDF invoice & transmittal
   * ===================================================================== */
  function terbilangFallback() { return ''; }
  const Docs = {
    stampSvg() {
      return `<svg viewBox="0 0 120 120" class="h-24 w-24 -rotate-12 opacity-80" aria-label="Stempel perusahaan"><circle cx="60" cy="60" r="55" fill="none" stroke="#1E2557" stroke-width="4"/><circle cx="60" cy="60" r="42" fill="none" stroke="#1E2557" stroke-width="1.5"/><text x="60" y="56" text-anchor="middle" font-size="13" font-weight="700" fill="#1E2557" font-family="Plus Jakarta Sans">ETRAMA</text><text x="60" y="72" text-anchor="middle" font-size="7" fill="#1E2557" font-family="Plus Jakarta Sans">ENERGI NUSANTARA</text><path d="M28 60h8M84 60h8" stroke="#1E2557" stroke-width="2"/></svg>`;
    },
    signSvg() {
      return '<svg viewBox="0 0 160 60" class="h-12 w-36" aria-label="Tanda tangan"><path d="M8 42c14-22 22-30 28-20s-6 22 4 18 18-30 26-24-8 26 2 22 14-14 22-12 6 10 14 6 18-10 40-12" fill="none" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round"/></svg>';
    },
    /** opts: { draft: bool, bankId, settings (override untuk preview Pengaturan Dokumen) } */
    invoice(x, opts) {
      const o = opts || {};
      const s = o.settings || DB.settings();
      const bank = (s.banks || []).find((b) => b.id === (o.bankId || x.bankId)) || (s.banks || []).find((b) => b.isDefault);
      const signed = !o.draft;
      return `<div class="relative mx-auto w-full max-w-[794px] overflow-hidden bg-white p-8 text-xs leading-relaxed text-slate-800 shadow-lg ring-1 ring-slate-200 sm:p-10">
        ${o.draft ? '<div class="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true"><span class="-rotate-[28deg] select-none text-9xl font-black tracking-[0.15em] text-slate-900/[0.07]">DRAFT</span></div>' : ''}
        <div class="flex items-start justify-between gap-6 border-b-2 border-brand-navy pb-4">
          <div class="flex items-start gap-4"><img src="${Layout.url('assets/img/etrama-logo.png')}" alt="ETrama Energy Company" class="h-11 w-auto">
            <div><p class="text-base font-bold text-brand-navy">${esc(s.company.name)}</p><p class="max-w-xs text-2xs text-slate-600">${esc(s.company.address)}</p><p class="text-2xs text-slate-600">NPWP ${esc(s.company.npwp)} · ${esc(s.company.phone)}</p></div></div>
          <div class="text-right"><p class="text-2xl font-bold tracking-wide text-brand-navy">INVOICE</p><p class="font-mono text-2xs text-slate-700">${esc(x.label)}</p>${o.draft ? '<p class="mt-1 inline-block rounded bg-slate-100 px-1.5 text-2xs font-semibold text-slate-600">DRAFT — belum disetujui</p>' : ''}</div>
        </div>
        <div class="mt-5 grid grid-cols-2 gap-6">
          <div><p class="text-2xs font-semibold uppercase tracking-wide text-slate-500">Ditagihkan kepada</p><p class="mt-1 font-semibold">${esc(x.client.name)}</p><p>u.p. ${esc(x.client.pic)}</p><p class="text-slate-600">${esc(x.so.location)}</p></div>
          <table class="ml-auto text-2xs"><tbody>
            <tr><td class="pr-3 text-slate-500">Tanggal invoice</td><td class="num font-medium">${formatDate(x.date)}</td></tr>
            <tr><td class="pr-3 text-slate-500">Jatuh tempo</td><td class="num font-medium">${formatDate(x.due)}</td></tr>
            <tr><td class="pr-3 text-slate-500">No. dokumen klien</td><td class="font-medium">${esc(x.so.clientDocNo)}</td></tr>
            <tr><td class="pr-3 text-slate-500">No. SO</td><td class="font-mono">${esc(x.so.no)}</td></tr>
          </tbody></table>
        </div>
        <table class="mt-6 w-full text-2xs">
          <thead><tr class="bg-brand-navy text-left text-white"><th class="px-3 py-2">Uraian</th><th class="px-3 py-2 text-right">%</th><th class="px-3 py-2 text-right">Jumlah (Rp)</th></tr></thead>
          <tbody>
            <tr class="border-b border-slate-200 align-top"><td class="px-3 py-3"><p class="font-medium">Termin ${x.term.no} — ${esc(x.term.label)}</p><p class="text-slate-600">${esc(x.so.project)} (${x.so.kwp ? x.so.kwp + ' kWp' : '—'})</p><p class="text-slate-500">Dasar: ${esc(x.term.triggerText)}</p></td><td class="num px-3 py-3 text-right">${x.term.pct}%</td><td class="num px-3 py-3 text-right">${UI.formatNumber(x.dpp)}</td></tr>
          </tbody>
          <tfoot class="num">
            <tr><td></td><td class="px-3 pt-3 text-right text-slate-500">DPP</td><td class="px-3 pt-3 text-right">${UI.formatNumber(x.dpp)}</td></tr>
            <tr><td></td><td class="px-3 text-right text-slate-500">PPN ${x.so.ppnRate != null ? x.so.ppnRate : s.ppnRate}%</td><td class="px-3 text-right">${UI.formatNumber(x.ppn)}</td></tr>
            <tr><td></td><td class="px-3 pt-1 text-right font-semibold">Total tagihan</td><td class="px-3 pt-1 text-right text-xs font-bold text-brand-navy">${formatRupiah(x.total)}</td></tr>
          </tfoot>
        </table>
        <div class="mt-6 grid grid-cols-2 gap-6">
          <div class="rounded-md bg-slate-50 p-3 text-2xs"><p class="font-semibold text-slate-700">Pembayaran ditransfer ke</p>${bank ? `<p class="mt-1">${esc(bank.bank)} · <span class="font-mono">${esc(bank.account)}</span></p><p>a.n. ${esc(bank.holder)}</p>` : '<p>—</p>'}<p class="mt-2 text-slate-600">${esc(s.paymentTerms)}</p></div>
          <div class="relative flex flex-col items-center text-center text-2xs">
            <p>Jakarta, ${formatDate(x.date)}</p><p class="text-slate-600">${esc(s.company.name)}</p>
            <div class="relative my-1 grid h-24 w-40 place-items-center">${signed ? `<div class="absolute left-0 top-0">${s.stamp ? Docs.stampSvg() : ''}</div><div class="relative">${Docs.signSvg()}</div>` : '<span class="rounded border border-dashed border-slate-300 px-2 py-1 text-2xs text-slate-400">Stempel & TTD muncul setelah disetujui</span>'}</div>
            <p class="font-semibold underline">${esc(s.signers.invoice.name)}</p><p class="text-slate-600">${esc(s.signers.invoice.title)}</p>
          </div>
        </div>
        <p class="mt-8 border-t border-slate-200 pt-3 text-center text-2xs text-slate-500">${esc(s.footer)}</p>
      </div>`;
    },
    transmittal(x, opts) {
      const s = DB.settings();
      const o = opts || {};
      const docs = [`Invoice ${x.label}`, `Faktur Pajak (PPN ${x.so.ppnRate != null ? x.so.ppnRate : s.ppnRate}%)`, x.basis ? `Salinan ${x.basis}` : `Salinan ${x.so.docType} ${x.so.clientDocNo}`, 'Kuitansi'];
      return `<div class="mx-auto w-full max-w-[794px] bg-white p-8 text-xs text-slate-800 shadow-lg ring-1 ring-slate-200 sm:p-10">
        <div class="flex items-center justify-between border-b-2 border-brand-navy pb-3"><div class="flex items-center gap-3"><img src="${Layout.url('assets/img/etrama-logo.png')}" alt="ETrama Energy Company" class="h-9 w-auto"><p class="text-sm font-bold text-brand-navy">${esc(s.company.name)}</p></div><p class="text-base font-bold tracking-wide text-brand-navy">FORM TRANSMITTAL</p></div>
        <div class="mt-4 grid grid-cols-2 gap-4 text-2xs"><div><p class="text-slate-500">Kepada</p><p class="font-semibold">${esc(x.client.name)}</p><p>u.p. ${esc(x.client.pic)}</p></div><div class="text-right"><p class="text-slate-500">Tanggal kirim</p><p class="num font-medium">${formatDate(o.date || MOCK.today)}</p></div></div>
        <table class="mt-5 w-full text-2xs"><thead><tr class="bg-brand-navy text-left text-white"><th class="w-10 px-3 py-2">No</th><th class="px-3 py-2">Dokumen yang dikirim</th><th class="px-3 py-2 text-center">Jumlah</th></tr></thead>
          <tbody>${docs.map((d, i) => `<tr class="border-b border-slate-200"><td class="px-3 py-2">${i + 1}</td><td class="px-3 py-2">${esc(d)}</td><td class="px-3 py-2 text-center">1</td></tr>`).join('')}</tbody></table>
        <div class="mt-8 grid grid-cols-2 gap-6 text-center text-2xs">
          <div><p>Dikirim oleh,</p><div class="my-2 grid h-16 place-items-center">${Docs.signSvg()}</div><p class="font-semibold underline">${esc(s.signers.transmittal.name)}</p><p class="text-slate-600">${esc(s.signers.transmittal.title)}</p></div>
          <div><p>Diterima oleh (klien),</p><div class="my-2 h-16 rounded border border-dashed border-slate-300"></div><p>Nama: ........................................</p><p>Tanggal: ....../....../..........</p></div>
        </div>
      </div>`;
    },
    terbilang: terbilangFallback,
  };

  /* =====================================================================
   * Helper tampilan bersama
   * ===================================================================== */
  const View = {
    userName(id) { return DB.user(id).name; },
    /** Link nomor dokumen (monospace). */
    docLink(href, text) { return `<a href="${Layout.url(href)}" class="rounded font-mono text-xs font-medium text-brand-blue hover:underline">${esc(text)}</a>`; },
    soLink(no) { return View.docLink(`finance/sales-order-detail.html?no=${encodeURIComponent(no)}`, no); },
    invLink(no, label) { return View.docLink(`finance/invoice-detail.html?no=${encodeURIComponent(no)}`, label || no); },
    arLink(no) { return View.docLink(`finance/piutang-detail.html?no=${encodeURIComponent(no)}`, no); },
    /** Timeline riwayat: items = [{ at, title, by, note, tone }] */
    timeline(items) {
      if (!items.length) return UI.emptyState({ icon: 'history', title: 'Belum ada riwayat' });
      const dot = { red: 'bg-red-500', green: 'bg-emerald-500', blue: 'bg-brand-blue', yellow: 'bg-amber-500', orange: 'bg-orange-500', gray: 'bg-slate-400' };
      return `<ol class="relative space-y-5 border-l border-dashed border-slate-300 pl-6">${items.map((t) => `<li class="relative">
        <span class="absolute -left-[29px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${dot[t.tone || 'blue']}"></span>
        <p class="text-sm font-medium text-slate-900">${esc(t.title)}</p>
        <p class="mt-0.5 text-xs text-slate-500 num">${t.by ? esc(t.by) + ' · ' : ''}${UI.formatDateTime(t.at)}</p>
        ${t.note ? `<p class="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">${esc(t.note)}</p>` : ''}
        ${t.extra || ''}
      </li>`).join('')}</ol>`;
    },
    toneOf(action) {
      if (/kembali|tolak|batal/i.test(action)) return 'red';
      if (/setuju|lunas|terkirim|paid/i.test(action)) return 'green';
      if (/hold|reminder/i.test(action)) return 'yellow';
      if (/eskalasi/i.test(action)) return 'orange';
      return 'blue';
    },
    /** Timeline log history untuk satu dokumen (tab Riwayat). */
    docLogs(docNoPrefix) {
      return DB.all('logs').filter((l) => String(l.docNo).startsWith(docNoPrefix))
        .map((l) => ({ at: l.at, title: l.action, by: DB.user(l.userId).name, note: l.reason || l.changes.map((c) => `${c.field}: ${c.before} → ${c.after}`).join('; '), tone: View.toneOf(l.action) }));
    },
    /** Stepper status horizontal. steps = array label; current = label; returned = bool */
    stepper(steps, current, opts) {
      const o = opts || {};
      const idx = steps.indexOf(current);
      return `<ol class="flex flex-wrap items-center gap-y-3">${steps.map((s, i) => {
        const done = idx > i || (current === 'Terkirim' && i <= idx);
        const active = i === idx;
        const cls = done ? 'bg-[#1FA35A] text-white' : active ? (o.returned ? 'bg-[#E5484D] text-white' : 'bg-brand-blue text-white ring-4 ring-brand-soft') : 'border border-slate-200 bg-white text-slate-500';
        return `<li class="flex items-center">
          <span class="flex items-center gap-2"><span class="grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${cls}">${done ? UI.icon('check', 'w-3.5 h-3.5') : i + 1}</span>
          <span class="text-xs font-medium ${active ? 'text-slate-900' : 'text-slate-500'}">${esc(s)}${active && o.returned ? ' · Dikembalikan' : ''}</span></span>
          ${i < steps.length - 1 ? `<span class="mx-3 h-px w-6 sm:w-10 ${done ? 'bg-[#1FA35A]' : 'bg-slate-200'}" aria-hidden="true"></span>` : ''}
        </li>`;
      }).join('')}</ol>`;
    },
    /** Kartu KPI gaya referensi: judul abu + tombol "Detail", angka besar + pill opsional, keterangan. */
    kpi(label, value, sub, opts) {
      const o = opts || {};
      // Angka besar 40 / 32 / 24 menyesuaikan panjang agar tidak terpotong (skala font baku).
      const len = String(value).replace(/<[^>]*>/g, '').length;
      const size = len <= 4 ? 'text-4xl' : len <= 9 ? 'text-3xl' : 'text-2xl';
      return `<section class="card flex flex-col p-6">
        <div class="flex items-start justify-between gap-3">
          <h3 class="pt-1 text-sm font-medium text-slate-600">${esc(label)}</h3>
          ${o.href ? `<a href="${Layout.url(o.href)}" class="kpi-link btn btn-secondary btn-sm shrink-0" aria-label="Detail ${esc(label)}">Detail</a>` : ''}
        </div>
        <p class="mt-4 ${size} font-extrabold leading-none text-slate-900 num ${o.valueCls || ''}">${value}</p>
        ${(o.badge || sub) ? `<div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 num">${o.badge || ''}${sub ? `<span>${sub}</span>` : ''}</div>` : ''}
      </section>`;
    },
    /** Nominal dengan "Rp" kecil abu di depan angka. size: 'lg' (KPI) | 'md' (tabel). */
    money(v, o) {
      const opt = o || {}; const digits = UI.formatRupiah(v).replace(/^-?Rp /, ''); const neg = Number(v) < 0 ? '-' : '';
      return opt.size === 'lg'
        ? `<span class="mr-1 text-xl font-medium text-slate-500">Rp</span><span class="text-4xl font-extrabold leading-none num ${opt.cls || ''}">${neg}${digits}</span>`
        : `<span class="whitespace-nowrap"><span class="text-xs font-medium text-slate-500">Rp</span> <span class="${opt.weight || 'font-bold'} num ${opt.cls || ''}">${neg}${digits}</span></span>`;
    },
    /** KPI dengan tile ikon di samping judul (halaman vendor). */
    kpiIcon(label, valueHtml, sub, o) {
      const opt = o || {}; const T = { amber: 'bg-amber-50 text-amber-600', red: 'bg-red-50 text-red-600', green: 'bg-emerald-50 text-emerald-600', blue: 'bg-blue-50 text-blue-600', gray: 'bg-slate-100 text-slate-500' };
      return `<section class="card flex flex-col p-6">
        <div class="flex items-center gap-3"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl ${T[opt.tone || 'gray']}">${UI.icon(opt.icon || 'circle', 'w-5 h-5')}</span><h3 class="min-w-0 flex-1 text-sm font-medium text-slate-700">${esc(label)}</h3>${opt.side ? `<span class="text-xs font-medium text-slate-500">${opt.side}</span>` : ''}</div>
        <p class="mt-5 flex items-baseline">${valueHtml}</p>
        ${sub ? `<p class="mt-3 text-sm text-slate-600 num">${sub}</p>` : ''}
      </section>`;
    },
    /** Pill perubahan (+2% hijau, -1,4% merah) seperti referensi. */
    delta(text, tone) { return `<span class="pill rounded-full px-2 py-0.5 text-xs font-medium num ${tone === 'red' ? 'bg-[#FFEBEC] text-[#D02533]' : tone === 'gray' ? 'bg-slate-100 text-slate-600' : tone === 'yellow' ? 'bg-[#FFF3D6] text-[#9A6400]' : 'bg-[#E0FAEC] text-[#178C4E]'}">${esc(text)}</span>`; },
    fileChip(name) { return `<span class="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm">${UI.icon('file', 'w-3.5 h-3.5 text-slate-500')}<span class="truncate">${esc(name)}</span></span>`; },
  };


  /* =====================================================================
   * MasterCrud — halaman master data Super Admin (client, vendor, Staf BD)
   * ===================================================================== */
  /**
   * View.masterCrud(el, { coll, keyField, codePrefix, entityLabel, nameLabel, hasPic, futureFields, usage(row) → n, usageLabel })
   */
  View.masterCrud = function (el, cfg) {
    const norm = (v) => String(v || '').toLowerCase().replace(/^(pt|cv|rs|ud)\.?\s+/, '').replace(/[^a-z0-9]/g, '');
    const rows = () => DB.all(cfg.coll).map((r) => Object.assign({}, r, { usage: cfg.usage(r) }));
    const nextCode = () => {
      if (!cfg.codePrefix) return null;
      const nums = DB.all(cfg.coll).map((r) => parseInt(String(r[cfg.keyField]).replace(cfg.codePrefix, ''), 10) || 0);
      return cfg.codePrefix + String(Math.max(0, ...nums) + 1).padStart(cfg.pad || 4, '0');
    };
    const columns = [
      { key: cfg.keyField, label: 'Kode', sortable: true, render: (r) => `<span class="font-mono text-xs text-slate-600">${esc(r[cfg.keyField])}</span>` },
      { key: 'name', label: cfg.nameLabel, sortable: true, render: (r) => `<span class="font-medium text-slate-900">${esc(r.name)}</span>` },
    ];
    if (cfg.hasPic) columns.push({ key: 'pic', label: 'Nama PIC', sortable: true });
    columns.push(
      { key: 'status', label: 'Status', render: (r) => UI.badge(r.status) },
      { key: 'usage', label: `Dipakai di ${cfg.usageLabel}`, align: 'right', numeric: true, sortable: true, render: (r) => (r.usage ? `${r.usage} dokumen` : '<span class="text-slate-400">Belum dipakai</span>') },
      // Satu aksi per baris (Hick's law): Edit. Nonaktifkan = soft delete lewat switch status di modal edit.
      { key: 'aksi', label: '', align: 'right', render: (r) => `<button type="button" class="btn btn-secondary btn-sm" data-edit="${esc(r[cfg.keyField])}">${UI.icon('pencil', 'w-3.5 h-3.5')}Edit</button>` },
    );
    let activeOnly = true;
    const view = () => rows().filter((r) => !activeOnly || r.status === 'Aktif');
    const table = new UI.DataTable(el, {
      data: view(), columns, pageSize: 10, rowClass: () => 'cursor-pointer hover:bg-slate-50',
      searchPlaceholder: `Cari ${cfg.hasPic ? 'kode, nama, atau PIC' : 'nama'}…`,
      searchKeys: [cfg.keyField, 'name', 'pic'],
      actions: `<label class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[10px] border border-slate-200 px-3 text-sm text-slate-700">${UI.switchHtml('active-only', true, 'Hanya tampilkan data aktif')}Hanya aktif</label><button type="button" class="btn btn-primary" data-add>${UI.icon('plus')}Tambah ${esc(cfg.entityLabel)}</button>`,
      empty: { icon: 'database', title: `Belum ada data ${cfg.entityLabel.toLowerCase()}`, description: `Tambahkan ${cfg.entityLabel.toLowerCase()} agar dapat dipilih di transaksi.` },
      onRender(root) {
        root.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => openForm(b.dataset.edit)));
      },
    });
    el.querySelector('[data-add]').addEventListener('click', () => openForm(null));
    const sw = el.querySelector('#active-only');
    sw.addEventListener('click', () => { activeOnly = !activeOnly; sw.setAttribute('aria-checked', activeOnly); refresh(); });
    el.addEventListener('click', (e) => {
      if (e.target.closest('a, button, input, select, label')) return;
      const b = e.target.closest('tr') && e.target.closest('tr').querySelector('[data-edit]');
      if (b) openForm(b.dataset.edit);
    });
    const refresh = () => table.setData(view());

    function openForm(key) {
      const rec = key ? DB.find(cfg.coll, (r) => r[cfg.keyField] === key) : null;
      const code = rec ? rec[cfg.keyField] : nextCode();
      const future = (cfg.futureFields || []).map((f) => `<div><label class="label text-slate-500">${esc(f)} <span class="ml-1 rounded bg-slate-100 px-1.5 py-px text-2xs font-semibold uppercase tracking-wide text-slate-500">Fase berikutnya</span></label><input class="input" disabled placeholder="Tersedia pada fase berikutnya"></div>`).join('');
      UI.formModal({
        title: rec ? `Edit ${cfg.entityLabel}` : `Tambah ${cfg.entityLabel}`,
        description: rec ? 'Perubahan tercatat di log history beserta nilai sebelum dan sesudah.' : `${cfg.entityLabel} baru berstatus Aktif dan langsung muncul di dropdown transaksi.`,
        body: `${code ? `<div><label class="label" for="m-code">Kode ${cfg.entityLabel.toLowerCase()}</label><input id="m-code" class="input font-mono" value="${esc(code)}" readonly><p class="hint">Dibuat otomatis oleh sistem.</p></div>` : ''}
          <div data-field><label class="label" for="m-name">${esc(cfg.nameLabel)} <span class="req">*</span></label><input id="m-name" class="input" required value="${esc(rec ? rec.name : '')}" autocomplete="off" aria-describedby="m-dup"><p id="m-dup" class="mt-1.5 hidden rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-900 ring-1 ring-inset ring-amber-300" role="status"></p></div>
          ${cfg.hasPic ? `<div data-field><label class="label" for="m-pic">Nama PIC <span class="req">*</span></label><input id="m-pic" class="input" required value="${esc(rec ? rec.pic : '')}" autocomplete="off"></div>` : ''}
          ${rec ? `<div class="flex items-start justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3"><div><p class="label !mb-0" id="m-status-l">Status aktif</p><p class="hint" id="m-status-h">${cfg.usage(rec) ? `Dipakai di ${cfg.usage(rec)} ${esc(cfg.usageLabel)} — tidak dapat dihapus, hanya dinonaktifkan. ` : ''}Data nonaktif tidak muncul di dropdown transaksi baru.</p></div><button type="button" id="m-status" class="switch mt-1" role="switch" aria-checked="${rec.status === 'Aktif'}" aria-labelledby="m-status-l" aria-describedby="m-status-h"></button></div>
          <div><label class="label" for="m-reason">Alasan perubahan</label><textarea id="m-reason" rows="2" class="input" placeholder="Opsional, tercatat di log history"></textarea></div>` : ''}
          ${future ? `<fieldset class="space-y-3 rounded-lg border border-dashed border-slate-300 p-3"><legend class="px-1 text-xs font-medium text-slate-500">Data tambahan</legend>${future}</fieldset>` : ''}`,
        onOpen(wrap) {
          const name = wrap.querySelector('#m-name');
          const dup = wrap.querySelector('#m-dup');
          const submit = wrap.querySelector('[data-submit]');
          const check = () => {
            const v = norm(name.value);
            const others = DB.all(cfg.coll).filter((r) => r[cfg.keyField] !== key);
            const exact = v && others.find((r) => norm(r.name) === v);
            const similar = !exact && v.length >= 4 && others.find((r) => norm(r.name).includes(v) || v.includes(norm(r.name)));
            const hit = exact || similar;
            dup.classList.toggle('hidden', !hit);
            name.classList.toggle('warn', !!hit);
            if (hit) dup.innerHTML = `${UI.icon('alert', 'inline w-3.5 h-3.5 -mt-0.5 mr-1')}${exact ? 'Nama sudah terdaftar' : 'Nama mirip dengan data yang ada'}: <span class="font-mono">${esc(hit[cfg.keyField])}</span> ${esc(hit.name)}${hit.status === 'Nonaktif' ? ' (nonaktif — pertimbangkan mengaktifkan kembali)' : ''}.${exact ? ' Nama harus unik.' : ''}`;
            submit.disabled = !!exact;
          };
          name.addEventListener('input', check);
          check();
          const st = wrap.querySelector('#m-status');
          if (st) st.addEventListener('click', () => st.setAttribute('aria-checked', st.getAttribute('aria-checked') !== 'true'));
        },
        onSubmit(form) {
          if (!UI.validateRequired(form)) return false;
          const name = form.querySelector('#m-name').value.trim();
          const pic = cfg.hasPic ? form.querySelector('#m-pic').value.trim() : undefined;
          if (!rec) {
            const obj = cfg.codePrefix ? { [cfg.keyField]: code, name, status: 'Aktif' } : { [cfg.keyField]: nextId(), name, status: 'Aktif' };
            if (cfg.hasPic) obj.pic = pic;
            DB.insert(cfg.coll, obj);
            DB.log({ action: `Menambah ${cfg.entityLabel.toLowerCase()}`, docNo: obj[cfg.keyField], module: 'Master Data', changes: [{ field: cfg.nameLabel, before: '—', after: name }].concat(cfg.hasPic ? [{ field: 'Nama PIC', before: '—', after: pic }] : []) });
            UI.toast(`${cfg.entityLabel} ${name} ditambahkan dan aktif.`);
          } else {
            const status = form.querySelector('#m-status').getAttribute('aria-checked') === 'true' ? 'Aktif' : 'Nonaktif';
            const changes = [];
            if (rec.name !== name) changes.push({ field: cfg.nameLabel, before: rec.name, after: name });
            if (cfg.hasPic && rec.pic !== pic) changes.push({ field: 'Nama PIC', before: rec.pic, after: pic });
            if (rec.status !== status) changes.push({ field: 'Status', before: rec.status, after: status });
            if (!changes.length) { UI.toast('Tidak ada perubahan.', { type: 'info' }); return true; }
            DB.update(cfg.coll, (r) => r[cfg.keyField] === key, (r) => { r.name = name; if (cfg.hasPic) r.pic = pic; r.status = status; });
            DB.log({ action: `Mengubah data ${cfg.entityLabel.toLowerCase()}`, docNo: key, module: 'Master Data', reason: form.querySelector('#m-reason').value.trim(), changes });
            UI.toast(`Perubahan ${name} disimpan.`);
          }
          refresh();
          return true;
        },
      });
    }
    function nextId() {
      const nums = DB.all(cfg.coll).map((r) => parseInt(String(r[cfg.keyField]).replace(/\D/g, ''), 10) || 0);
      return (cfg.idPrefix || 'ID-') + String(Math.max(0, ...nums) + 1).padStart(2, '0');
    }
    async function toggle(key) {
      const rec = DB.find(cfg.coll, (r) => r[cfg.keyField] === key);
      const to = rec.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
      const res = await UI.confirm({
        title: `${to === 'Nonaktif' ? 'Nonaktifkan' : 'Aktifkan'} ${rec.name}?`,
        message: to === 'Nonaktif' ? 'Data tidak akan muncul di dropdown transaksi baru. Transaksi lama tetap menampilkan data ini.' : 'Data akan kembali muncul di dropdown transaksi baru.',
        confirmText: to === 'Nonaktif' ? 'Nonaktifkan' : 'Aktifkan', tone: to === 'Nonaktif' ? 'warning' : 'primary',
        note: { required: false, label: 'Alasan', placeholder: 'Opsional, tercatat di log history' },
      });
      if (!res.confirmed) return;
      DB.update(cfg.coll, (r) => r[cfg.keyField] === key, (r) => { r.status = to; });
      DB.log({ action: `Mengubah data ${cfg.entityLabel.toLowerCase()}`, docNo: key, module: 'Master Data', reason: res.note, changes: [{ field: 'Status', before: rec.status, after: to }] });
      UI.toast(`${rec.name} ${to === 'Aktif' ? 'diaktifkan' : 'dinonaktifkan'}.`);
      refresh();
    }
    async function remove(key) {
      const rec = DB.find(cfg.coll, (r) => r[cfg.keyField] === key);
      const res = await UI.confirm({ title: `Hapus ${rec.name}?`, message: 'Data belum dipakai di transaksi sehingga dapat dihapus. Tindakan ini tercatat di log history.', confirmText: 'Hapus', tone: 'danger' });
      if (!res.confirmed) return;
      DB.remove(cfg.coll, (r) => r[cfg.keyField] === key);
      DB.log({ action: `Menghapus ${cfg.entityLabel.toLowerCase()}`, docNo: key, module: 'Master Data', changes: [{ field: cfg.nameLabel, before: rec.name, after: '—' }] });
      UI.toast(`${rec.name} dihapus.`);
      refresh();
    }
    return table;
  };


  /* =====================================================================
   * Aksi review invoice (dipakai di Detail Invoice & Approval)
   * ===================================================================== */
  /** Tombol Approve / Kembalikan untuk reviewer. Mengembalikan HTML; ikat dengan View.bindReview. */
  View.reviewButtons = function (x, user, size) {
    if (!Flow.canReview(x, user)) return '';
    const sm = size === 'sm' ? 'btn-sm' : '';
    const approve = Flow.isOwn(x, user)
      ? UI.disabledButton(UI.icon('check') + 'Approve', 'Anda tidak dapat menyetujui dokumen yang Anda buat sendiri.', `btn btn-success ${sm}`)
      : `<button type="button" class="btn btn-success ${sm}" data-approve="${UI.esc(x.no)}">${UI.icon('check')}Approve</button>`;
    return `<button type="button" class="btn btn-secondary ${sm} text-red-700" data-return="${UI.esc(x.no)}">${UI.icon('undo')}Kembalikan</button>${approve}`;
  };
  View.bindReview = function (root, onDone) {
    root.querySelectorAll('[data-approve]').forEach((b) => b.addEventListener('click', async () => {
      const x = Calc.inv(DB.invoice(b.dataset.approve));
      const route = Flow.route(x);
      const next = route[route.indexOf(x.status) + 1] || 'Disetujui';
      const r = await UI.confirm({ title: `Approve ${x.label}?`, message: `${x.client.name} · ${UI.formatRupiah(x.total)}. ${next === 'Disetujui' ? 'Invoice akan berstatus Disetujui dan siap dikirim ke klien (stempel & TTD dibubuhkan).' : `Invoice diteruskan ke ${next.replace('Review ', '')}${next === 'Review Direktur' ? ' karena nilainya di atas budget threshold' : ''}.`}`, confirmText: 'Approve', tone: 'primary' });
      if (!r.confirmed) return;
      Flow.approve(x.no);
      UI.toast(next === 'Disetujui' ? `${x.label} disetujui. Staf Finance diberi notifikasi untuk mengirim.` : `${x.label} diteruskan ke ${next.replace('Review ', '')}.`);
      onDone();
    }));
    root.querySelectorAll('[data-return]').forEach((b) => b.addEventListener('click', async () => {
      const x = Calc.inv(DB.invoice(b.dataset.return));
      const r = await UI.confirm({ title: `Kembalikan ${x.label}?`, message: 'Invoice dikembalikan ke Staf Finance untuk diperbaiki (SLA info ketidaksesuaian H+0, hari yang sama).', confirmText: 'Kembalikan', tone: 'danger', note: { required: true, label: 'Catatan pengembalian', placeholder: 'Jelaskan bagian yang tidak sesuai' } });
      if (!r.confirmed) return;
      Flow.returnBack(x.no, r.note);
      UI.toast(`${x.label} dikembalikan ke Staf Finance.`, { type: 'warning' });
      onDone();
    }));
  };

  window.DB = DB;
  window.Cal = Cal;
  window.Calc = Calc;
  window.Flow = Flow;
  window.Docs = Docs;
  window.View = View;
})();
