/*
 * ETrama — helper UI bersama: format Rupiah/tanggal WIB, ikon, badge status, SLA badge,
 * toast, modal & modal konfirmasi, tab, tooltip, empty state, tabel data, storage aman.
 * Tidak bergantung pada library lain selain Tailwind (CDN).
 */
window.UI = (function () {
  const TZ = 'Asia/Jakarta';

  /* ---------- Escape ---------- */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- Format ---------- */
  const numberFmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
  const partsFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });

  /** 1250000000 → "Rp 1.250.000.000" */
  function formatRupiah(value) {
    const n = Math.round(Number(value) || 0);
    return (n < 0 ? '-' : '') + 'Rp ' + numberFmt.format(Math.abs(n));
  }
  /**
   * Nilai ringkas untuk tabel daftar: 460650000 → "Rp 460,7 jt", 4273500000 → "Rp 4,27 M".
   * ASUMSI: dipakai hanya di daftar/KPI agar mudah dipindai; nilai penuh tetap di tooltip (title) dan halaman detail.
   */
  function formatRupiahShort(value) {
    const n = Math.round(Number(value) || 0); const a = Math.abs(n); const sign = n < 0 ? '-' : '';
    const dec = (v, d) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: d }).format(v);
    if (a >= 1e9) return `${sign}Rp ${dec(a / 1e9, 2)} M`;
    if (a >= 1e6) return `${sign}Rp ${dec(a / 1e6, 1)} jt`;
    return formatRupiah(n);
  }
  /** 1250000 → "1.250.000" */
  function formatNumber(value) { return numberFmt.format(Math.round(Number(value) || 0)); }

  function dateParts(d) {
    const out = {};
    partsFmt.formatToParts(d instanceof Date ? d : new Date(d)).forEach((p) => { out[p.type] = p.value; });
    return out;
  }
  /** → "02/11/2026" (WIB) */
  function formatDate(d) { const p = dateParts(d); return `${p.day}/${p.month}/${p.year}`; }
  /** → "14:30 WIB" */
  function formatTime(d) { const p = dateParts(d); return `${p.hour}:${p.minute} WIB`; }
  /** → "02/11/2026 14:30 WIB" */
  function formatDateTime(d) { return `${formatDate(d)} ${formatTime(d)}`; }
  /** "02/11/2026" → Date (00:00 WIB) atau null */
  function parseDate(str) {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(str || '').trim());
    return m ? new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00+07:00`) : null;
  }

  /* ---------- Storage aman (localStorage bisa diblokir) ---------- */
  const memory = {};
  const store = {
    get(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) { return key in memory ? memory[key] : fallback; }
    },
    set(key, value) {
      memory[key] = value;
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* abaikan */ }
    },
    remove(key) {
      delete memory[key];
      try { window.localStorage.removeItem(key); } catch (e) { /* abaikan */ }
    },
  };

  /* ---------- Ikon (path Lucide, inline SVG) ---------- */
  const ICONS = {
    dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    stamp: '<path d="M5 22h14"/><path d="M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77Z"/><path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-3-3c-1.66 0-3 1-3 3s1 2 1 3.5V13"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
    badgeCheck: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronsUpDown: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCheck: '<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>',
    checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
    xCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="M2 2l20 20"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    circle: '<circle cx="12" cy="12" r="9"/>',
    half: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
    key: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
    briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    filterX: '<path d="M13.013 3H2l8 9.46V19l4 2v-8.54l.9-1.055"/><path d="m22 3-5 5"/><path d="m17 3 5 5"/>',
    loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    pencil: '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    table: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    filePlus: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6M12 12v6"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    sliders: '<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',
  };
  function icon(name, cls) {
    return `<svg class="${cls || 'w-4 h-4'} shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.circle}</svg>`;
  }

  /* ---------- Badge status (warna semantik CLAUDE.md §9 + ikon agar tidak hanya warna) ---------- */
  // Pill lembut seperti referensi (tanpa border). Status selalu berupa teks, tidak hanya warna.
  const TONES = {
    green: 'bg-[#E0FAEC] text-[#178C4E]',
    yellow: 'bg-[#FFF3D6] text-[#9A6400]',
    red: 'bg-[#FFEBEC] text-[#D02533]',
    gray: 'bg-slate-100 text-slate-600',
    blue: 'bg-[#ECEEF8] text-[#293173]',
    orange: 'bg-[#FFF1EB] text-[#C2410C]',
  };
  const STATUS = {
    // Invoice
    'Draft': ['gray', 'file'],
    'Review Lead F&A': ['blue', 'eye'],
    'Review Manager': ['blue', 'eye'],
    'Review Direktur': ['blue', 'eye'],
    'Disetujui': ['green', 'check'],
    'Dikembalikan': ['red', 'undo'],
    'Dibatalkan': ['gray', 'xCircle'],
    'Terkirim': ['blue', 'send'],
    // Piutang
    'Belum Jatuh Tempo': ['gray', 'clock'],
    'Overdue': ['red', 'alert'],
    'On Hold': ['yellow', 'pause'],
    'Dieskalasi': ['orange', 'arrowUp'],
    'Partially Paid': ['yellow', 'half'],
    'Paid': ['green', 'check'],
    // PO vendor
    'Open': ['blue', 'circle'],
    'Partially Invoiced': ['yellow', 'half'],
    'Fully Invoiced': ['green', 'check'],
    'Closed': ['gray', 'lock'],
    // Master data
    'Aktif': ['green', 'check'],
    'Nonaktif': ['gray', 'minus'],
    // Invoice vendor
    'Belum Dibayar': ['yellow', 'clock'],
    // Sales Order & status penagihan SO
    'Selesai': ['green', 'checkCheck'],
    'Menunggu Approval': ['yellow', 'clock'],
    'Belum ditagih': ['gray', 'minus'],
    'Dalam proses': ['blue', 'clock'],
    'Sebagian ditagih': ['yellow', 'half'],
    'Lunas': ['green', 'check'],
    // Umum
    'Menunggu': ['yellow', 'clock'],
    'Lewat SLA': ['red', 'alert'],
    'Sudah dicek': ['green', 'checkCheck'],
    'Belum dicek': ['yellow', 'clock'],
  };
  /** badge('Overdue') atau badge('Teks bebas', { tone: 'blue', icon: 'info' }) */
  function badge(status, opts) {
    const o = opts || {};
    const def = STATUS[status] || (/^Review /.test(status) ? ['blue', 'eye'] : [o.tone || 'gray', o.icon || 'circle']);
    const tone = o.tone || def[0];
    const ic = o.icon || def[1];
    return `<span class="pill inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[tone]}" data-ic="${ic}">${esc(status)}</span>`;
  }

  /**
   * Countdown SLA dalam hari kerja. remaining > 1 → hijau, 0–1 → kuning, < 0 → merah.
   * slaBadge(2) → "Sisa 2 hari kerja"; slaBadge(0) → "Batas hari ini"; slaBadge(-3) → "Lewat 3 hari kerja"
   */
  function slaBadge(remaining, opts) {
    const o = opts || {};
    let tone, ic, text;
    if (remaining < 0) { tone = 'red'; ic = 'alert'; text = `Lewat ${Math.abs(remaining)} hari kerja`; }
    else if (remaining === 0) { tone = 'yellow'; ic = 'clock'; text = 'Batas hari ini'; }
    else if (remaining === 1) { tone = 'yellow'; ic = 'clock'; text = 'Sisa 1 hari kerja'; }
    else { tone = 'green'; ic = 'clock'; text = `Sisa ${remaining} hari kerja`; }
    const prefix = o.label ? `${esc(o.label)} · ` : '';
    return `<span class="pill inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap num ${TONES[tone]}">${icon(ic, 'w-3 h-3')}${prefix}${text}</span>`;
  }

  /* ---------- Tombol disabled + tooltip alasan ---------- */
  function disabledButton(label, reason, cls) {
    return `<span class="tip" tabindex="0" data-tip="${esc(reason)}"><button type="button" disabled aria-disabled="true" class="${cls || 'inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white'} cursor-not-allowed opacity-50">${label}</button><span class="sr-only">${esc(reason)}</span></span>`;
  }

  /**
   * Menu aksi sekunder (⋯) — menjaga satu aksi utama per baris (Hick's law).
   * items: [{ label, attrs: 'data-act="x" data-id="1"', danger, disabled, reason, icon }]
   */
  function menuButton(items, label) {
    return `<div class="relative inline-block text-left" data-menu>
      <button type="button" class="btn btn-ghost btn-sm btn-icon" data-menu-btn aria-haspopup="true" aria-expanded="false" aria-label="${esc(label || 'Aksi lainnya')}">${icon('more', 'w-4 h-4')}</button>
      <div class="absolute right-0 z-[70] mt-1 hidden w-52 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-lg" role="menu" data-menu-panel>
        ${items.filter(Boolean).map((it) => it.disabled
          ? `<span class="tip block" tabindex="0" data-tip="${esc(it.reason || '')}"><span class="flex cursor-not-allowed items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-400">${it.icon ? icon(it.icon, 'w-4 h-4') : ''}${esc(it.label)}</span></span>`
          : `<button type="button" role="menuitem" class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${it.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'}" ${it.attrs || ''}>${it.icon ? icon(it.icon, 'w-4 h-4') : ''}${esc(it.label)}</button>`).join('')}
      </div></div>`;
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-menu-btn]');
    document.querySelectorAll('[data-menu-panel]').forEach((p) => {
      const mine = btn && p.parentElement.contains(btn);
      const open = mine ? p.classList.contains('hidden') : false;
      p.classList.toggle('hidden', !open);
      p.parentElement.querySelector('[data-menu-btn]').setAttribute('aria-expanded', open);
      if (open) {
        // Posisi fixed agar tidak terpotong container tabel yang overflow.
        const r = btn.getBoundingClientRect();
        Object.assign(p.style, { position: 'fixed', right: 'auto', left: `${Math.max(8, r.right - 208)}px`, top: `${r.bottom + 4}px` });
        const pr = p.getBoundingClientRect();
        if (pr.bottom > window.innerHeight - 8) p.style.top = `${r.top - pr.height - 4}px`;
      }
    });
  });

  /** Salin teks ke clipboard + toast. */
  async function copyText(text, what) {
    try { await navigator.clipboard.writeText(text); toast(`${what || 'Teks'} disalin.`, { title: 'Disalin' }); }
    catch (e) { toast('Browser menolak akses clipboard. Salin manual.', { type: 'error', title: 'Gagal menyalin' }); }
  }

  /* ---------- Empty state ---------- */
  function emptyState(o) {
    const opt = o || {};
    const action = opt.action
      ? (opt.action.href
        ? `<a href="${esc(opt.action.href)}" class="btn btn-secondary mt-5">${opt.action.icon ? icon(opt.action.icon) : ''}${esc(opt.action.label)}</a>`
        : `<button type="button" id="${esc(opt.action.id || '')}" class="btn btn-secondary mt-5">${opt.action.icon ? icon(opt.action.icon) : ''}${esc(opt.action.label)}</button>`)
      : '';
    return `<div class="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div class="mb-4 grid h-12 w-12 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm">${icon(opt.icon || 'inbox', 'w-5 h-5')}</div>
      <p class="text-sm font-medium text-slate-900">${esc(opt.title || 'Belum ada data')}</p>
      ${opt.description ? `<p class="mt-1 max-w-md text-sm text-slate-600">${esc(opt.description)}</p>` : ''}
      ${action}
    </div>`;
  }

  /* ---------- Toast ---------- */
  const TOAST_STYLE = {
    success: { ic: 'checkCircle', color: 'text-emerald-600', title: 'Berhasil' },
    error: { ic: 'xCircle', color: 'text-red-600', title: 'Gagal' },
    warning: { ic: 'alert', color: 'text-amber-600', title: 'Perhatian' },
    info: { ic: 'info', color: 'text-brand-blue', title: 'Informasi' },
  };
  function toastRoot() {
    let root = document.getElementById('toast-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'toast-root';
      root.setAttribute('aria-live', 'polite');
      root.setAttribute('aria-atomic', 'false');
      root.className = 'pointer-events-none fixed right-4 top-4 z-[70] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2';
      document.body.appendChild(root);
    }
    return root;
  }
  /** toast('Data tersimpan') · toast('Gagal menyimpan', { type: 'error', title: '...' }) */
  function toast(message, opts) {
    const o = opts || {};
    const s = TOAST_STYLE[o.type || 'success'];
    const el = document.createElement('div');
    el.className = 'toast-in pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 pr-2.5 shadow-xl';
    el.setAttribute('role', o.type === 'error' ? 'alert' : 'status');
    el.innerHTML = `<span class="${s.color} mt-0.5">${icon(s.ic, 'w-5 h-5')}</span>
      <div class="min-w-0 flex-1"><p class="text-sm font-medium text-slate-900">${esc(o.title || s.title)}</p><p class="mt-0.5 text-sm text-slate-600">${esc(message)}</p></div>
      <button type="button" class="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup notifikasi">${icon('x')}</button>`;
    const close = () => { el.classList.add('toast-out'); setTimeout(() => el.remove(), 160); };
    el.querySelector('button').addEventListener('click', close);
    toastRoot().appendChild(el);
    setTimeout(close, o.duration || 4500);
  }

  /* ---------- Modal ---------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const openStack = [];

  function trapKeydown(e) {
    const top = openStack[openStack.length - 1];
    if (!top) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(top.el); return; }
    if (e.key !== 'Tab') return;
    const items = [...top.el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /** Buka elemen modal statis: <div id="x" class="hidden" data-modal>…</div> */
  function openModal(target, opts) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;
    openStack.push({ el, returnFocus: document.activeElement, onClose: opts && opts.onClose });
    el.classList.remove('hidden');
    document.body.classList.add('no-scroll');
    if (openStack.length === 1) document.addEventListener('keydown', trapKeydown);
    const auto = el.querySelector('[autofocus]') || el.querySelector(FOCUSABLE);
    setTimeout(() => auto && auto.focus(), 20);
  }
  function closeModal(target) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    const idx = openStack.findIndex((m) => m.el === el);
    if (idx === -1) return;
    const [entry] = openStack.splice(idx, 1);
    el.classList.add('hidden');
    if (!openStack.length) {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', trapKeydown);
    }
    if (entry.onClose) entry.onClose();
    if (entry.returnFocus && entry.returnFocus.focus) entry.returnFocus.focus();
  }

  let modalSeq = 0;
  /**
   * Modal konfirmasi. Mengembalikan Promise<{ confirmed: boolean, note: string }>.
   * opts: title, message, confirmText, cancelText, tone ('primary'|'danger'|'warning'),
   *       note: { required: true, label, placeholder, hint } → textarea wajib; tombol konfirmasi disabled sampai terisi.
   */
  function confirmDialog(opts) {
    const o = Object.assign({ title: 'Konfirmasi', message: '', confirmText: 'Konfirmasi', cancelText: 'Batal', tone: 'primary' }, opts);
    const id = `confirm-${++modalSeq}`;
    const toneBtn = {
      primary: 'bg-brand-blue hover:bg-brand-blue-hover',
      danger: 'bg-red-600 hover:bg-red-700',
      warning: 'bg-amber-600 hover:bg-amber-700',
    }[o.tone];
    const toneIcon = {
      primary: ['info', 'border border-slate-200 bg-white text-slate-600 shadow-sm'],
      danger: ['alert', 'bg-[#FFEBEC] text-[#D02533]'],
      warning: ['alert', 'bg-[#FFF3D6] text-[#9A6400]'],
    }[o.tone];
    const note = o.note;
    const wrap = document.createElement('div');
    wrap.id = id;
    wrap.className = 'fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center';
    wrap.innerHTML = `
      <div class="absolute inset-0 bg-slate-900/50" data-backdrop></div>
      <div class="modal-panel relative w-full max-w-md rounded-[20px] bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="${id}-title" aria-describedby="${id}-desc">
        <div class="flex gap-4 p-6">
          <div class="grid h-10 w-10 shrink-0 place-items-center rounded-full ${toneIcon[1]}">${icon(toneIcon[0], 'w-5 h-5')}</div>
          <div class="min-w-0 flex-1">
            <h2 id="${id}-title" class="text-base font-medium text-slate-900">${esc(o.title)}</h2>
            <p id="${id}-desc" class="mt-1.5 text-sm leading-relaxed text-slate-600">${esc(o.message)}</p>
            ${note ? `
            <div class="mt-4">
              <label for="${id}-note" class="block text-sm font-medium text-slate-800">${esc(note.label || 'Catatan')}${note.required ? ' <span class="text-red-600" aria-hidden="true">*</span>' : ''}</label>
              <textarea id="${id}-note" rows="3" ${note.required ? 'required aria-required="true"' : ''} aria-describedby="${id}-hint" placeholder="${esc(note.placeholder || '')}"
                class="input" autofocus></textarea>
              <p id="${id}-hint" class="mt-1 text-xs text-slate-500">${esc(note.hint || (note.required ? 'Catatan wajib diisi sebelum melanjutkan.' : 'Opsional.'))}</p>
            </div>` : ''}
          </div>
        </div>
        <div class="flex flex-col-reverse gap-2 rounded-b-[20px] border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          <button type="button" data-cancel class="btn btn-secondary">${esc(o.cancelText)}</button>
          <button type="button" data-confirm class="btn text-white ${toneBtn}" ${note && note.required ? 'disabled' : ''}>${esc(o.confirmText)}</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    return new Promise((resolve) => {
      let result = { confirmed: false, note: '' };
      const textarea = wrap.querySelector('textarea');
      const confirmBtn = wrap.querySelector('[data-confirm]');
      if (textarea && note.required) {
        textarea.addEventListener('input', () => { confirmBtn.disabled = !textarea.value.trim(); });
      }
      const finish = (confirmed) => {
        result = { confirmed, note: textarea ? textarea.value.trim() : '' };
        closeModal(wrap);
      };
      wrap.querySelector('[data-cancel]').addEventListener('click', () => finish(false));
      wrap.querySelector('[data-backdrop]').addEventListener('click', () => finish(false));
      confirmBtn.addEventListener('click', () => finish(true));
      openModal(wrap, { onClose: () => { wrap.remove(); resolve(result); } });
    });
  }

  /* ---------- Tab (role=tablist, panah kiri/kanan) ---------- */
  function initTabs(root) {
    const list = root.querySelector('[role="tablist"]');
    if (!list || list.dataset.ready) return;
    list.dataset.ready = '1';
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle('border-brand-blue', on);
        t.classList.toggle('text-brand-navy', on);
        t.classList.toggle('border-transparent', !on);
        t.classList.toggle('text-slate-500', !on);
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        select(tabs[(i + dir + tabs.length) % tabs.length], true);
      });
    });
    select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
  }

  /* ---------- Tabel data: search + filter + sort + pagination ---------- */
  /**
   * new UI.DataTable(el, {
   *   columns: [{ key, label, align: 'right', numeric: true, sortable: true, render: (row) => html, className }],
   *   data, pageSize: 10, searchKeys: ['name'], searchPlaceholder,
   *   filters: [{ key, label, options: ['Aktif','Nonaktif'] }],
   *   empty: { title, description, icon }, actions: html (tombol di toolbar kanan)
   * })
   */
  function DataTable(el, cfg) {
    this.el = el;
    this.cfg = Object.assign({ pageSize: 10, filters: [], empty: {} }, cfg);
    this.data = cfg.data || [];
    this.state = { q: '', filters: {}, sort: null, dir: 1, page: 1, pageSize: this.cfg.pageSize };
    this.uid = `dt-${++modalSeq}`;
    this.mount();
  }
  DataTable.prototype.mount = function () {
    const c = this.cfg;
    const id = this.uid;
    const filterHtml = c.filters.map((f, i) => {
      const opts = f.options || [...new Set(this.data.map((r) => r[f.key]))];
      return `<div><label for="${id}-f${i}" class="sr-only">${esc(f.label)}</label>
        <select id="${id}-f${i}" data-filter="${esc(f.key)}" class="input !mt-0 !h-9 !w-auto !py-0 !pl-3 !pr-8 text-slate-700">
          <option value="">${esc(f.allLabel || 'Semua ' + f.label.toLowerCase())}</option>
          ${opts.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('')}
        </select></div>`;
    }).join('');

    this.el.innerHTML = `
      <div class="card dt-card">
        <div class="flex flex-wrap items-center gap-2 px-4 pb-3 pt-4 no-print">
          <div class="relative min-w-[220px] flex-1 sm:max-w-xs">
            <label for="${id}-q" class="sr-only">Cari</label>
            <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">${icon('search')}</span>
            <input id="${id}-q" type="search" placeholder="${esc(c.searchPlaceholder || 'Cari…')}" class="input !mt-0 !h-9 !py-0 !pl-9">
          </div>
          ${filterHtml}
          <button type="button" data-reset class="hidden h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">${icon('filterX')}Reset</button>
          <div class="ml-auto flex items-center gap-2">${c.actions || ''}</div>
        </div>
        <div class="overflow-x-auto px-4">
          <table class="tbl min-w-full">
            <thead>
              <tr>${c.columns.map((col) => this.th(col)).join('')}</tr>
            </thead>
            <tbody data-body></tbody>
          </table>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500" data-footer></div>
      </div>`;

    const q = this.el.querySelector(`#${id}-q`);
    q.addEventListener('input', () => { this.state.q = q.value.trim().toLowerCase(); this.state.page = 1; this.render(); });
    this.el.querySelectorAll('[data-filter]').forEach((s) => s.addEventListener('change', () => {
      this.state.filters[s.dataset.filter] = s.value; this.state.page = 1; this.render();
    }));
    this.el.querySelector('[data-reset]').addEventListener('click', () => {
      q.value = ''; this.state.q = ''; this.state.filters = {}; this.state.page = 1;
      this.el.querySelectorAll('[data-filter]').forEach((s) => { s.value = ''; });
      this.render();
    });
    this.el.querySelectorAll('[data-sort]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.sort;
      this.state.dir = this.state.sort === k ? -this.state.dir : 1;
      this.state.sort = k;
      this.render();
    }));
    this.render();
  };
  DataTable.prototype.th = function (col) {
    const align = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
    if (!col.sortable) return `<th scope="col" class="${align}">${esc(col.label)}</th>`;
    return `<th scope="col" class="${align}" data-th="${esc(col.key)}" aria-sort="none">
      <button type="button" data-sort="${esc(col.key)}" class="inline-flex items-center gap-1 rounded hover:text-slate-900">${esc(col.label)}<span data-sort-icon class="opacity-60">${icon('chevronsUpDown', 'w-3.5 h-3.5')}</span></button></th>`;
  };
  DataTable.prototype.setData = function (data) { this.data = data; this.render(); };
  DataTable.prototype.filtered = function () {
    const { q, filters, sort, dir } = this.state;
    const keys = this.cfg.searchKeys || this.cfg.columns.map((c) => c.key);
    let rows = this.data.filter((r) => {
      if (q && !keys.some((k) => String(r[k] == null ? '' : r[k]).toLowerCase().includes(q))) return false;
      return Object.entries(filters).every(([k, v]) => !v || String(r[k]) === v);
    });
    if (sort) {
      rows = rows.slice().sort((a, b) => {
        const x = a[sort]; const y = b[sort];
        if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
        return String(x).localeCompare(String(y), 'id') * dir;
      });
    }
    return rows;
  };
  DataTable.prototype.render = function () {
    const c = this.cfg;
    const s = this.state;
    const rows = this.filtered();
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / s.pageSize));
    s.page = Math.min(s.page, pages);
    const start = (s.page - 1) * s.pageSize;
    const view = rows.slice(start, start + s.pageSize);
    const body = this.el.querySelector('[data-body]');
    const hasFilter = s.q || Object.values(s.filters).some(Boolean);

    this.el.querySelector('[data-reset]').classList.toggle('hidden', !hasFilter);
    this.el.querySelector('[data-reset]').classList.toggle('inline-flex', !!hasFilter);
    this.el.querySelectorAll('[data-th]').forEach((th) => {
      const active = th.dataset.th === s.sort;
      th.setAttribute('aria-sort', active ? (s.dir === 1 ? 'ascending' : 'descending') : 'none');
      th.querySelector('[data-sort-icon]').innerHTML = active
        ? icon('arrowUp', `w-3.5 h-3.5 ${s.dir === -1 ? 'rotate-180' : ''}`)
        : icon('chevronsUpDown', 'w-3.5 h-3.5');
      th.querySelector('[data-sort-icon]').classList.toggle('opacity-60', !active);
    });

    if (!view.length) {
      const e = hasFilter
        ? { icon: 'search', title: 'Tidak ada hasil', description: 'Tidak ada data yang cocok dengan pencarian atau filter. Coba ubah kata kunci atau reset filter.' }
        : Object.assign({ title: 'Belum ada data' }, c.empty);
      body.innerHTML = `<tr><td colspan="${c.columns.length}">${emptyState(e)}</td></tr>`;
    } else {
      body.innerHTML = view.map((r) => `<tr class="${c.rowClass ? c.rowClass(r) : ''}">${c.columns.map((col) => {
        const align = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
        const v = col.render ? col.render(r) : esc(r[col.key]);
        return `<td class="whitespace-nowrap ${align} ${col.numeric ? 'num' : ''} ${col.className || ''}">${v}</td>`;
      }).join('')}</tr>`).join('');
    }

    const id = this.uid;
    const from = total ? start + 1 : 0;
    const to = Math.min(start + s.pageSize, total);
    const nums = pageList(s.page, pages).map((p) => p === '…'
      ? '<span class="px-1.5 text-slate-400">…</span>'
      : `<button type="button" data-page="${p}" class="h-8 min-w-8 rounded-md px-2 text-sm font-medium num ${p === s.page ? 'border border-slate-200 bg-slate-50 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}" ${p === s.page ? 'aria-current="page"' : ''} aria-label="Halaman ${p}">${p}</button>`).join('');
    this.el.querySelector('[data-footer]').innerHTML = `
      <div class="flex items-center gap-3">
        <p class="num">Menampilkan <span class="text-slate-900">${from}–${to}</span> dari <span class="text-slate-900">${total}</span> data</p>
        <label for="${id}-ps" class="sr-only">Baris per halaman</label>
        <select id="${id}-ps" data-pagesize class="input !mt-0 !h-8 !w-auto !py-0 !pl-2.5 !pr-7 text-sm">
          ${[10, 25, 50].map((n) => `<option value="${n}" ${n === s.pageSize ? 'selected' : ''}>${n} / halaman</option>`).join('')}
        </select>
      </div>
      <nav class="flex items-center gap-1" aria-label="Pagination">
        <button type="button" data-page="${s.page - 1}" class="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent" ${s.page <= 1 ? 'disabled' : ''} aria-label="Halaman sebelumnya">${icon('chevronLeft')}</button>
        ${nums}
        <button type="button" data-page="${s.page + 1}" class="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent" ${s.page >= pages ? 'disabled' : ''} aria-label="Halaman berikutnya">${icon('chevronRight')}</button>
      </nav>`;
    this.el.querySelectorAll('[data-page]').forEach((b) => b.addEventListener('click', () => { s.page = Number(b.dataset.page); this.render(); }));
    if (c.onRender) c.onRender(this.el, view);
    this.el.querySelector('[data-pagesize]').addEventListener('change', (e) => { s.pageSize = Number(e.target.value); s.page = 1; this.render(); });
  };
  function pageList(cur, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const out = [1];
    const lo = Math.max(2, cur - 1);
    const hi = Math.min(total - 1, cur + 1);
    if (lo > 2) out.push('…');
    for (let i = lo; i <= hi; i++) out.push(i);
    if (hi < total - 1) out.push('…');
    out.push(total);
    return out;
  }

  /* ---------- Password ---------- */
  // ASUMSI password policy (PRD §3.7 hanya menyebut "password policy"): min. 8 karakter, huruf besar & kecil, angka.
  function passwordRules(pw) {
    const v = pw || '';
    return [
      { id: 'len', label: 'Minimal 8 karakter', ok: v.length >= 8 },
      { id: 'case', label: 'Huruf besar dan huruf kecil', ok: /[a-z]/.test(v) && /[A-Z]/.test(v) },
      { id: 'num', label: 'Minimal satu angka', ok: /\d/.test(v) },
    ];
  }
  /** Render checklist aturan password ke dalam elemen <ul>. */
  function renderPasswordRules(ul, pw) {
    ul.innerHTML = passwordRules(pw).map((r) => `<li class="flex items-center gap-2 ${r.ok ? 'text-emerald-700' : 'text-slate-500'}">
      ${icon(r.ok ? 'checkCircle' : 'circle', 'w-3.5 h-3.5')}<span>${r.label}</span><span class="sr-only">${r.ok ? '(terpenuhi)' : '(belum terpenuhi)'}</span></li>`).join('');
  }
  /** Tombol tampil/sembunyi: <button data-toggle-password="inputId"> */
  function initPasswordToggles(root) {
    (root || document).querySelectorAll('[data-toggle-password]').forEach((btn) => {
      const input = document.getElementById(btn.dataset.togglePassword);
      const sync = () => {
        const shown = input.type === 'text';
        btn.setAttribute('aria-pressed', shown);
        btn.setAttribute('aria-label', shown ? 'Sembunyikan password' : 'Tampilkan password');
        btn.innerHTML = icon(shown ? 'eyeOff' : 'eye');
      };
      btn.addEventListener('click', () => { input.type = input.type === 'password' ? 'text' : 'password'; sync(); });
      sync();
    });
  }

  /** Tampilkan/hapus pesan error inline di bawah field. */
  function fieldError(input, message) {
    const errId = `${input.id}-error`;
    let err = document.getElementById(errId);
    if (!message) {
      if (err) err.remove();
      input.removeAttribute('aria-invalid');
      input.classList.remove('border-red-500');
      return;
    }
    if (!err) {
      err = document.createElement('p');
      err.id = errId;
      err.className = 'mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600';
      (input.closest('[data-field]') || input.parentElement).appendChild(err);
    }
    err.innerHTML = `${icon('alert', 'w-3.5 h-3.5')}${esc(message)}`;
    input.setAttribute('aria-invalid', 'true');
    const described = (input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    if (!described.includes(errId)) input.setAttribute('aria-describedby', [...described, errId].join(' '));
    input.classList.add('border-red-500');
  }


  /* ---------- Modal form dinamis ---------- */
  /**
   * UI.formModal({ title, description, body: html, submitText, tone, size: 'md'|'lg'|'xl',
   *   onOpen(el), onSubmit(form, el) → true untuk menutup / false untuk tetap terbuka })
   */
  function formModal(opts) {
    const o = Object.assign({ submitText: 'Simpan', cancelText: 'Batal', tone: 'primary', size: 'md' }, opts);
    const id = `fm-${++modalSeq}`;
    const width = { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[o.size];
    const btn = { primary: 'btn-primary', danger: 'btn-danger', navy: 'btn-navy', success: 'btn-success', warning: 'btn-primary' }[o.tone];
    const wrap = document.createElement('div');
    wrap.className = 'fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center';
    wrap.innerHTML = `<div class="absolute inset-0 bg-slate-900/50" data-backdrop></div>
      <form novalidate class="modal-panel relative flex max-h-[92vh] w-full ${width} flex-col rounded-[20px] bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="${id}-t">
        <div class="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div><h2 id="${id}-t" class="text-base font-medium text-slate-900">${esc(o.title)}</h2>${o.description ? `<p class="mt-0.5 text-sm text-slate-600">${esc(o.description)}</p>` : ''}</div>
          <button type="button" data-cancel class="btn btn-ghost btn-sm btn-icon -mr-2" aria-label="Tutup">${icon('x')}</button>
        </div>
        <div class="flex-1 space-y-4 overflow-y-auto px-6 py-5">${o.body}</div>
        <div class="flex flex-col-reverse gap-2 rounded-b-[20px] border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          <button type="button" data-cancel class="btn btn-secondary">${esc(o.cancelText)}</button>
          ${o.submitText ? `<button type="submit" data-submit class="btn ${btn}">${esc(o.submitText)}</button>` : ''}
        </div>
      </form>`;
    document.body.appendChild(wrap);
    const form = wrap.querySelector('form');
    const close = () => closeModal(wrap);
    wrap.querySelectorAll('[data-cancel]').forEach((b) => b.addEventListener('click', close));
    wrap.querySelector('[data-backdrop]').addEventListener('click', close);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!o.onSubmit || o.onSubmit(form, wrap) !== false) close();
    });
    openModal(wrap, { onClose: () => { wrap.remove(); if (o.onClose) o.onClose(); } });
    if (o.onOpen) o.onOpen(wrap, form);
    return { el: wrap, form, close };
  }

  /** Validasi field wajib di dalam form ([required]); tampilkan error inline. */
  function validateRequired(form) {
    let first = null;
    form.querySelectorAll('[required]').forEach((f) => {
      if (f.type === 'file') return;
      const empty = !String(f.value || '').trim();
      const lbl = form.querySelector(`label[for="${f.id}"]`);
      fieldError(f, empty ? `${lbl ? lbl.textContent.replace('*', '').trim() : 'Field'} wajib diisi` : '');
      if (empty && !first) first = f;
    });
    if (first) first.focus();
    return !first;
  }

  /* ---------- Drawer detail ---------- */
  function drawer(opts) {
    const o = opts || {};
    const id = `dr-${++modalSeq}`;
    const wrap = document.createElement('div');
    wrap.className = 'fixed inset-0 z-[55]';
    wrap.innerHTML = `<div class="absolute inset-0 bg-slate-900/40" data-backdrop></div>
      <aside class="drawer-panel absolute inset-y-2 right-2 flex w-[calc(100%-1rem)] ${o.width || 'max-w-xl'} flex-col overflow-hidden rounded-[20px] bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="${id}-t">
        <div class="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div class="min-w-0"><h2 id="${id}-t" class="truncate text-base font-medium text-slate-900">${esc(o.title || '')}</h2>${o.subtitle ? `<div class="mt-1 text-sm text-slate-600">${o.subtitle}</div>` : ''}</div>
          <button type="button" data-close class="btn btn-ghost btn-sm btn-icon -mr-2" aria-label="Tutup">${icon('x')}</button>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-5" data-body>${o.body || ''}</div>
        ${o.footer ? `<div class="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-6 py-4" data-footer>${o.footer}</div>` : ''}
      </aside>`;
    document.body.appendChild(wrap);
    const close = () => closeModal(wrap);
    wrap.querySelector('[data-close]').addEventListener('click', close);
    wrap.querySelector('[data-backdrop]').addEventListener('click', close);
    openModal(wrap, { onClose: () => { wrap.remove(); if (o.onClose) o.onClose(); } });
    if (o.onOpen) o.onOpen(wrap);
    return { el: wrap, close };
  }

  /* ---------- Upload dropzone ---------- */
  /**
   * UI.dropzone(container, { id, label, required, accept: ['pdf','jpg'], maxMB: 10, multiple, hint, onChange(files) })
   * → { files(): [{name,size}], clear(), set([{name,size}]) }
   */
  function dropzone(container, opts) {
    const o = Object.assign({ accept: ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'xlsx'], maxMB: 10, multiple: false }, opts);
    const id = o.id || `dz-${++modalSeq}`;
    let files = [];
    container.innerHTML = `
      ${o.label ? `<p class="label" id="${id}-lbl">${esc(o.label)}${o.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</p>` : ''}
      <label for="${id}" class="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center transition hover:bg-slate-50" data-zone>
        <span class="mb-1 text-slate-400">${icon('file', 'w-6 h-6')}</span>
        <span class="text-sm"><span class="font-medium text-slate-900 underline underline-offset-2">Pilih file</span> <span class="text-slate-600">atau seret ke sini</span></span>
        <span class="text-xs text-slate-500">${o.hint || `${o.accept.filter((a) => a !== 'jpeg').map((a) => a.toUpperCase()).join(', ')} · maks. ${o.maxMB} MB`}</span>
      </label>
      <input id="${id}" type="file" class="sr-only" ${o.multiple ? 'multiple' : ''} accept="${o.accept.map((a) => '.' + a).join(',')}" ${o.label ? `aria-labelledby="${id}-lbl"` : ''}>
      <p class="mt-1.5 hidden text-xs font-medium text-red-600" role="alert" data-err></p>
      <ul class="mt-2 space-y-1.5" data-list></ul>`;
    const input = container.querySelector('input');
    const zone = container.querySelector('[data-zone]');
    const err = container.querySelector('[data-err]');
    const list = container.querySelector('[data-list]');
    const zoneDefault = zone.innerHTML;
    const render = () => {
      // File gambar tunggal: preview langsung di dalam kotak seret (sesuai fe_etrama).
      const img = !o.multiple && files[0] && files[0].url;
      zone.innerHTML = img
        ? `<img src="${files[0].url}" alt="Preview ${esc(files[0].name)}" class="max-h-32 rounded-lg object-contain"><span class="text-xs text-slate-500">Klik atau seret file lain untuk mengganti</span>`
        : zoneDefault;
      list.innerHTML = files.map((f, i) => `<li class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
        ${icon('file', 'w-4 h-4 text-brand-blue')}<span class="min-w-0 flex-1 truncate font-medium text-slate-800">${esc(f.name)}</span>
        <span class="text-xs text-slate-500 num">${(f.size / 1048576).toFixed(1).replace('.', ',')} MB</span>
        <button type="button" data-rm="${i}" class="btn btn-ghost btn-sm btn-icon" aria-label="Hapus ${esc(f.name)}">${icon('x', 'w-3.5 h-3.5')}</button></li>`).join('');
      list.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => { files.splice(Number(b.dataset.rm), 1); render(); if (o.onChange) o.onChange(files); }));
    };
    const add = (fileList) => {
      err.classList.add('hidden');
      for (const f of fileList) {
        const ext = f.name.split('.').pop().toLowerCase();
        if (!o.accept.includes(ext)) { err.textContent = `Format file "${f.name}" tidak didukung.`; err.classList.remove('hidden'); continue; }
        if (f.size > o.maxMB * 1048576) { err.textContent = `Ukuran "${f.name}" melebihi ${o.maxMB} MB.`; err.classList.remove('hidden'); continue; }
        const item = { name: f.name, size: f.size };
        if (/^(png|jpe?g|svg|webp)$/.test(ext) && window.URL && URL.createObjectURL) item.url = URL.createObjectURL(f);
        if (o.multiple) files.push(item); else files = [item];
      }
      render();
      if (o.onChange) o.onChange(files);
    };
    input.addEventListener('change', () => { add(input.files); input.value = ''; });
    ['dragover', 'dragenter'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('border-brand-blue'); }));
    ['dragleave', 'drop'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove('border-brand-blue'); }));
    zone.addEventListener('drop', (e) => add(e.dataTransfer.files));
    return {
      files: () => files.slice(),
      clear() { files = []; render(); },
      set(arr) { files = arr.slice(); render(); if (o.onChange) o.onChange(files); },
      error(msg) { err.textContent = msg; err.classList.toggle('hidden', !msg); },
    };
  }

  /* ---------- Export ---------- */
  // ASUMSI: "Export Excel" pada prototipe menghasilkan file CSV (bisa dibuka di Excel); "Export PDF" memakai dialog cetak browser.
  function exportCsv(filename, rows) {
    const csv = rows.map((r) => r.map((v) => {
      const s = String(v == null ? '' : v);
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename.replace(/\.xlsx?$/, '') + '.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 100);
    toast(`File ${a.download} diunduh.`, { title: 'Export Excel' });
  }
  function exportPdf() { window.print(); }

  /** Toggle switch aksesibel: <button class="switch" role="switch" aria-checked="true"> */
  function switchHtml(id, on, label, disabled) {
    return `<button type="button" id="${id}" class="switch" role="switch" aria-checked="${!!on}" aria-label="${esc(label)}" ${disabled ? 'disabled' : ''}></button>`;
  }

  /* ---------- Auto-init ---------- */
  function autoInit() {
    document.querySelectorAll('[data-tabs]').forEach(initTabs);
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-modal-open]');
      if (opener) { openModal(opener.dataset.modalOpen); return; }
      const closer = e.target.closest('[data-modal-close]');
      if (closer) closeModal(closer.closest('[data-modal]'));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoInit);
  else autoInit();

  return {
    esc, formatRupiah, formatRupiahShort, formatNumber, formatDate, formatTime, formatDateTime, parseDate,
    store, icon, badge, slaBadge, disabledButton, menuButton, copyText, emptyState, toast,
    openModal, closeModal, confirm: confirmDialog, initTabs, DataTable,
    passwordRules, renderPasswordRules, initPasswordToggles, fieldError,
    formModal, validateRequired, drawer, dropzone, exportCsv, exportPdf, switchHtml,
  };
})();
