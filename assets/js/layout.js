/*
 * ETrama — komponen bersama: session simulasi (Auth), sidebar + header (Layout), shell halaman auth.
 * Membutuhkan: mock-data.js, ui.js (dimuat lebih dulu).
 *
 * Pemakaian di halaman berlayout:
 *   <main id="page-content">…</main>
 *   <script>Layout.init({ portal: 'finance', active: 'dashboard', title: 'Dashboard', breadcrumb: ['Finance', 'Dashboard'], perm: 'so' })</script>
 */
(function () {
  const { icon, esc, store } = UI;
  // Root proyek dihitung dari lokasi file ini (assets/js/layout.js) agar link benar dari folder mana pun.
  const ROOT = new URL('../../', document.currentScript.src).href;
  const url = (path) => ROOT + path;

  // Halaman yang sudah dibangun. Link ke halaman lain menampilkan toast "tahap berikutnya" alih-alih 404.
  // ASUMSI: daftar ini diperbarui tiap tahap dan dihapus saat semua halaman selesai.
  const BUILT_PAGES = new Set([
    'index.html', 'portal.html', 'komponen.html',
    'auth/login.html', 'auth/lupa-password.html', 'auth/reset-password.html', 'auth/ganti-password.html',
    ...['dashboard', 'master-client', 'master-vendor', 'master-staf-bd', 'user-management', 'role-management', 'hierarki-role',
      'approval-setting', 'sla-reminder', 'pengaturan-dokumen', 'log-history', 'profil'].map((p) => `super-admin/${p}.html`),
    ...['dashboard', 'sales-order-list', 'sales-order-form', 'sales-order-detail', 'bast', 'invoice-list', 'invoice-detail', 'piutang',
      'piutang-detail', 'approval', 'notifikasi', 'report-sales-order', 'report-piutang', 'po-list', 'po-form', 'invoice-vendor',
      'pembayaran-vendor', 'profil'].map((p) => `finance/${p}.html`),
  ]);
  const isBuilt = (href) => BUILT_PAGES.has(String(href).split('?')[0].split('#')[0]);

  /* =====================================================================
   * Auth (simulasi) — tidak ada server; password override disimpan di localStorage.
   * ===================================================================== */
  const K = { session: 'etrama.session', viewAs: 'etrama.viewAs', pw: 'etrama.passwords', reset: 'etrama.resetToken', read: 'etrama.notif.read' };

  // User dibaca dari DB (domain.js) bila tersedia, agar user baru dari User Management bisa login.
  const allUsers = () => (window.DB ? DB.all('users') : MOCK.users);
  const Auth = {
    findByEmail(email) {
      const e = String(email || '').trim().toLowerCase();
      return allUsers().find((u) => u.email.toLowerCase() === e) || null;
    },
    byId(id) { return allUsers().find((u) => u.id === id) || null; },
    overrides() { return store.get(K.pw, {}); },
    needsPasswordChange(user) { return !!user.mustChangePassword && !this.overrides()[user.id]; },
    currentPassword(user) {
      const o = this.overrides()[user.id];
      if (o) return o;
      return user.mustChangePassword ? user.tempPassword : user.password;
    },
    checkPassword(user, pw) { return this.currentPassword(user) === pw; },
    setPassword(userId, pw) { const o = this.overrides(); o[userId] = pw; store.set(K.pw, o); },
    login(user) {
      store.set(K.session, { userId: user.id, at: new Date().toISOString() });
      if (window.DB) {
        DB.log({ action: 'Login', module: 'Akun' }, user);
        DB.update('users', (u) => u.id === user.id, (u) => { u.lastLogin = Cal.nowIso(); u.sessions = (u.sessions || 0) + 1; });
      }
      if (MOCK.roles[user.role].portal === 'finance') store.set(K.viewAs, user.role);
    },
    logout(user) {
      const u = user || this.sessionUser();
      if (u && window.DB) DB.log({ action: 'Logout', module: 'Akun' }, u);
      store.remove(K.session);
    },
    sessionUser() { const s = store.get(K.session, null); return s ? this.byId(s.userId) : null; },
    homeFor(user) { return url(MOCK.roles[user.role].portal === 'super-admin' ? 'super-admin/dashboard.html' : 'finance/dashboard.html'); },
    url,
    keys: K,
  };

  /* =====================================================================
   * User aktif per portal
   * ASUMSI: prototipe tidak memaksa login — jika belum ada session, halaman memakai user demo
   * (Super Admin: Rina; Finance: user representatif dari role "Lihat sebagai").
   * ===================================================================== */
  function representative(roleKey) {
    const list = allUsers();
    return list.find((u) => u.role === roleKey && u.status === 'Aktif' && !u.mustChangePassword)
      || list.find((u) => u.role === roleKey);
  }
  function resolveUser(portal) {
    const sess = Auth.sessionUser();
    if (portal === 'super-admin') return sess && sess.role === 'super_admin' ? sess : representative('super_admin');
    let role = store.get(K.viewAs, null);
    if (!MOCK.financeRoleOrder.includes(role)) role = sess && MOCK.financeRoleOrder.includes(sess.role) ? sess.role : 'staf';
    return sess && sess.role === role ? sess : representative(role);
  }

  /* =====================================================================
   * Menu per section (CLAUDE.md §5). perm = kunci di MOCK.permissions; need: 'buat' → hanya role pembuat.
   * ===================================================================== */
  const MENUS = {
    'super-admin': [
      { section: 'Utama', items: [{ id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'super-admin/dashboard.html' }] },
      {
        section: 'Master Data', items: [
          { id: 'master-client', label: 'Client', icon: 'briefcase', href: 'super-admin/master-client.html' },
          { id: 'master-vendor', label: 'Vendor', icon: 'cart', href: 'super-admin/master-vendor.html' },
          { id: 'master-staf-bd', label: 'Staf BD', icon: 'user', href: 'super-admin/master-staf-bd.html' },
        ],
      },
      {
        section: 'Akses', items: [
          { id: 'user-management', label: 'User Management', icon: 'users', href: 'super-admin/user-management.html' },
          { id: 'role-management', label: 'Role Management', icon: 'shield', href: 'super-admin/role-management.html' },
          { id: 'hierarki-role', label: 'Hierarki Role', icon: 'network', href: 'super-admin/hierarki-role.html' },
        ],
      },
      {
        section: 'Approval & SLA', items: [
          { id: 'approval-setting', label: 'Layer Approval', icon: 'badgeCheck', href: 'super-admin/approval-setting.html' },
          { id: 'sla-reminder', label: 'SLA & Hari Libur', icon: 'clock', href: 'super-admin/sla-reminder.html' },
        ],
      },
      {
        section: 'Sistem', items: [
          { id: 'pengaturan-dokumen', label: 'Pengaturan Dokumen', icon: 'stamp', href: 'super-admin/pengaturan-dokumen.html' },
          { id: 'log-history', label: 'Log History', icon: 'history', href: 'super-admin/log-history.html' },
        ],
      },
    ],
    finance: [
      {
        section: 'Utama', items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'finance/dashboard.html' },
          { id: 'approval', label: 'Approval', icon: 'badgeCheck', perm: 'approval', href: 'finance/approval.html', count: 'approval' },
        ],
      },
      {
        section: 'Penagihan', items: [
          { id: 'sales-order-list', label: 'Sales Order', icon: 'fileText', perm: 'so', href: 'finance/sales-order-list.html' },
          { id: 'bast', label: 'BAST', icon: 'clipboard', perm: 'bast', href: 'finance/bast.html' },
          { id: 'invoice', label: 'Invoice', icon: 'receipt', perm: 'invoice', need: 'buat', href: 'finance/invoice-list.html' },
          { id: 'piutang', label: 'Piutang', icon: 'coins', perm: 'piutang', href: 'finance/piutang.html' },
        ],
      },
      {
        section: 'Vendor', items: [
          { id: 'po-list', label: 'Purchase Order', icon: 'cart', perm: 'vendor', href: 'finance/po-list.html' },
          { id: 'invoice-vendor', label: 'Invoice Vendor', icon: 'file', perm: 'vendor', href: 'finance/invoice-vendor.html' },
          { id: 'pembayaran-vendor', label: 'Pembayaran Vendor', icon: 'card', perm: 'vendor', href: 'finance/pembayaran-vendor.html' },
        ],
      },
      {
        section: 'Report', items: [
          { id: 'report-sales-order', label: 'Report Sales Order', icon: 'chart', perm: 'report', href: 'finance/report-sales-order.html' },
          { id: 'report-piutang', label: 'Laporan Piutang', icon: 'coins', perm: 'report', href: 'finance/report-piutang.html' },
        ],
      },
    ],
  };
  // Halaman turunan yang menyorot item menu induknya.
  const ACTIVE_ALIAS = { 'po-form': 'po-list', 'sales-order-form': 'sales-order-list' };

  const ctx = { portal: null, user: null, perms: {} };

  function allowed(item, perms) {
    if (!item.perm) return true;
    const v = perms[item.perm];
    if (!v) return false;
    return item.need ? v === item.need : true;
  }
  function initials(name) { return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase(); }
  function roleLabel(user) { const r = MOCK.roles[user.role]; return r.short || r.label; }
  const avatar = (u, size) => `<span class="grid ${size || 'h-10 w-10'} shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">${esc(initials(u.name))}</span>`;

  /* ---------- Sidebar ---------- */
  function navLink(item, active) {
    const isActive = item.id === (ACTIVE_ALIAS[active] || active);
    let trail = '';
    if (item.count === 'approval' && window.DB && Flow.myReviewStatus(ctx.user.role)) {
      const n = DB.all('invoices').filter((i) => i.status === Flow.myReviewStatus(ctx.user.role)).length;
      if (n) trail = `<span class="ml-auto rounded-full bg-brand-blue px-1.5 text-2xs font-medium leading-5 text-white num">${n}</span>`;
    } else if (ctx.portal === 'finance' && item.perm && ctx.perms[item.perm] === 'lihat') {
      trail = '<span class="ml-auto text-2xs font-medium text-slate-400" title="Role ini hanya dapat melihat">Lihat</span>';
    }
    if (isActive && !trail) trail = icon('chevronRight', 'ml-auto w-4 h-4 text-slate-400');
    return `<a href="${url(item.href)}" data-path="${esc(item.href)}" class="nav-item" ${isActive ? 'aria-current="page"' : ''}>
      ${icon(item.icon, 'nav-ic w-5 h-5')}<span class="truncate">${esc(item.label)}</span>${trail}</a>`;
  }

  function renderSidebar(portal, active) {
    const sections = MENUS[portal].map((s) => {
      const items = s.items.filter((m) => allowed(m, ctx.perms));
      if (!items.length) return '';
      return `<p class="nav-section">${esc(s.section)}</p><ul class="space-y-1">${items.map((m) => `<li>${navLink(m, active)}</li>`).join('')}</ul>`;
    }).join('');
    const u = ctx.user;
    const profileHref = portal === 'super-admin' ? 'super-admin/profil.html' : 'finance/profil.html';
    return `
      <div class="px-4 pt-6">
        <div class="flex items-center justify-between gap-3 px-2">
          <img src="${url('assets/img/etrama-logo.png')}" alt="ETrama Energy Company" class="h-9 w-auto">
          <button type="button" class="btn btn-ghost btn-sm btn-icon lg:hidden" data-sidebar-close aria-label="Tutup menu">${icon('x', 'w-5 h-5')}</button>
        </div>
        <a href="${url('portal.html')}" class="mt-5 flex items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-2.5 hover:bg-slate-50" title="Ganti portal">
          <span class="min-w-0 flex-1 leading-tight"><span class="block truncate text-sm font-bold text-slate-900">${portal === 'super-admin' ? 'Super Admin' : 'Finance'}</span><span class="block truncate text-xs text-slate-500">${portal === 'super-admin' ? 'Konfigurasi' : 'Finance Module 1.0'}</span></span>
          <span class="text-slate-500">${icon('chevronsUpDown', 'w-4 h-4')}</span><span class="sr-only">Ganti portal</span>
        </a>
      </div>
      <nav class="sidebar-scroll flex-1 overflow-y-auto px-4 pb-4" aria-label="Menu utama">${sections}</nav>
      <div class="px-4 pb-4">
        <div class="h-px bg-line"></div>
        <div class="relative pt-4">
          <button type="button" id="profile-btn" class="flex w-full items-center gap-3 rounded-[10px] p-1.5 text-left hover:bg-slate-50" aria-haspopup="true" aria-expanded="false" aria-controls="profile-panel">
            ${avatar(u)}
            <span class="min-w-0 flex-1 leading-tight"><span class="flex items-center gap-1 text-sm font-medium text-slate-900"><span class="truncate">${esc(u.name)}</span>${icon('badgeCheck', 'w-4 h-4 text-brand-blue')}</span><span class="mt-0.5 block truncate text-xs text-slate-500">${esc(u.email)}</span></span>
            ${icon('chevronRight', 'w-4 h-4 text-slate-400')}
          </button>
          <div id="profile-panel" class="absolute bottom-full left-0 z-40 mb-2 hidden w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            <div class="px-2.5 pb-2.5 pt-1.5"><p class="text-xs text-slate-500">Masuk sebagai</p><p class="text-sm font-medium text-slate-900">${esc(MOCK.roles[u.role].label)}</p><p class="text-xs text-slate-500">Level ${esc(MOCK.roles[u.role].level)}</p></div>
            <div class="h-px bg-slate-200"></div>
            <a href="${url(profileHref)}" class="mt-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50">${icon('user', 'w-4 h-4 text-slate-500')}Profil & password</a>
            <a href="${url('portal.html')}" class="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50">${icon('chevronsUpDown', 'w-4 h-4 text-slate-500')}Ganti portal</a>
            <button type="button" data-logout class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-700">${icon('logout', 'w-4 h-4 text-slate-500')}Keluar</button>
          </div>
        </div>
        <p class="mt-3 flex items-center justify-between gap-2 px-1.5 text-xs text-slate-500">Data simulasi<button type="button" data-reset-demo class="btn btn-secondary btn-sm !h-7 !px-2.5 !text-xs">Reset data</button></p>
      </div>`;
  }

  /* ---------- Header ---------- */
  function renderHeader(opts) {
    const u = ctx.user;
    // Headline 20 · bold, sub 14 (greeting) / breadcrumb 12.
    const lead = opts.greeting
      ? `${avatar(u, 'h-14 w-14 !text-base')}<div class="min-w-0"><h1 class="truncate text-xl font-bold text-slate-900">${esc(u.name)}</h1><p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500"><span>Selamat datang kembali di ETrama</span>${typeof opts.meta === 'function' ? opts.meta(ctx) : (opts.meta || '')}</p></div>`
      : `<span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-line bg-white text-slate-700">${icon(opts.icon || 'dashboard', 'w-5 h-5')}</span>
         <div class="min-w-0"><h1 class="truncate text-xl font-bold text-slate-900">${esc(opts.title || '')}</h1>
         <nav aria-label="Breadcrumb"><ol class="flex items-center gap-1 truncate text-xs text-slate-500">${(opts.breadcrumb || []).map((c, i, arr) => `<li class="flex items-center gap-1">${i ? '<span aria-hidden="true" class="text-slate-300">/</span>' : ''}<span ${i === arr.length - 1 ? 'aria-current="page" class="font-medium text-slate-700"' : ''}>${esc(c)}</span></li>`).join('')}</ol></nav></div>`;
    const viewAs = ctx.portal === 'finance' ? `
      <label class="relative hidden h-11 items-center rounded-xl border border-line bg-white pl-3 text-sm text-slate-600 hover:bg-slate-50 md:flex" title="Simulasi: lihat sebagai level lain">
        ${icon('users', 'w-[18px] h-[18px] text-slate-500')}<span class="sr-only">Lihat sebagai</span>
        <select id="view-as" class="h-full appearance-none rounded-xl border-0 bg-transparent py-0 pl-2 pr-8 text-sm font-semibold text-slate-800 focus:ring-0">
          ${MOCK.financeRoleOrder.map((k) => `<option value="${k}" ${k === u.role ? 'selected' : ''}>Lihat sebagai: ${esc(MOCK.roles[k].short || MOCK.roles[k].label)}</option>`).join('')}
        </select>
      </label>` : '';
    return `
      <div class="flex flex-wrap items-center gap-x-3 gap-y-3 px-4 py-6 sm:px-6 lg:px-8">
        <button type="button" class="btn btn-secondary btn-icon lg:hidden" data-sidebar-open aria-controls="sidebar" aria-expanded="false" aria-label="Buka menu">${icon('menu', 'w-5 h-5')}</button>
        <div class="flex min-w-0 flex-1 items-center gap-3.5">${lead}</div>
        <div class="flex items-center gap-2">
          <button type="button" id="search-btn" class="btn-tile" aria-label="Cari menu atau dokumen (Ctrl+K)" title="Cari (Ctrl+K)">${icon('search', 'w-5 h-5')}</button>
          <div class="relative">
            <button type="button" id="notif-btn" class="btn-tile" aria-haspopup="true" aria-expanded="false" aria-controls="notif-panel">
              ${icon('bell', 'w-5 h-5')}<span id="notif-count" class="absolute -right-1.5 -top-1.5 hidden min-w-[18px] rounded-full bg-red-500 px-1 text-center text-2xs font-bold leading-[18px] text-white ring-2 ring-white num"></span>
            </button>
            <div id="notif-panel" class="absolute right-0 top-[52px] z-40 hidden w-[400px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl" role="region" aria-label="Notifikasi"></div>
          </div>
          ${viewAs}
          ${typeof opts.actions === 'function' ? opts.actions(ctx) : (opts.actions || '')}
        </div>
      </div>
      ${ctx.portal === 'finance' ? `<div class="px-4 pb-3 sm:px-6 md:hidden"><label for="view-as-mobile" class="sr-only">Lihat sebagai</label><select id="view-as-mobile" class="input !mt-0">${MOCK.financeRoleOrder.map((k) => `<option value="${k}" ${k === u.role ? 'selected' : ''}>Lihat sebagai: ${esc(MOCK.roles[k].short || MOCK.roles[k].label)}</option>`).join('')}</select></div>` : ''}`;
  }

  /**
   * Header navy untuk halaman detail dokumen (varian 'detail', tanpa sidebar).
   * ASUMSI: mengikuti mockup Detail Sales Order — navigasi kembali lewat breadcrumb.
   */
  function renderDetailHeader(opts) {
    const u = ctx.user;
    const crumbs = opts.breadcrumb || [];
    const links = opts.breadcrumbLinks || [];
    return `
      <div class="border-b border-white/10 bg-brand-navy text-white">
        <div class="mx-auto flex h-[60px] w-full max-w-[1288px] items-center gap-3 px-4 sm:px-6">
          <nav aria-label="Breadcrumb" class="min-w-0 flex-1"><ol class="flex items-center gap-2 truncate text-sm">${crumbs.map((c, i) => `<li class="flex items-center gap-2">${i ? '<span aria-hidden="true" class="text-white/40">/</span>' : ''}${i === crumbs.length - 1 ? `<span aria-current="page" class="font-[700] text-white">${esc(c)}</span>` : links[i] ? `<a href="${url(links[i])}" class="text-blue-100/85 hover:text-white">${esc(c)}</a>` : `<span class="text-blue-100/85">${esc(c)}</span>`}</li>`).join('')}</ol></nav>
          <button type="button" id="search-btn" class="grid h-9 w-9 place-items-center rounded-lg text-white/85 hover:bg-white/10" aria-label="Cari menu atau dokumen (Ctrl+K)" title="Cari (Ctrl+K)">${icon('search', 'w-[18px] h-[18px]')}</button>
          <div class="relative">
            <button type="button" id="notif-btn" class="relative grid h-9 w-9 place-items-center rounded-lg text-white/85 hover:bg-white/10" aria-haspopup="true" aria-expanded="false" aria-controls="notif-panel">
              ${icon('bell', 'w-[18px] h-[18px]')}<span id="notif-count" class="absolute right-0.5 top-0.5 hidden min-w-[16px] rounded-full bg-[#FBBF24] px-1 text-center text-2xs font-[700] leading-4 text-brand-navy num"></span>
            </button>
            <div id="notif-panel" class="absolute right-0 top-11 z-40 hidden w-[400px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl" role="region" aria-label="Notifikasi"></div>
          </div>
          ${ctx.portal === 'finance' ? `<span class="mx-1 hidden h-6 w-px bg-white/15 sm:block" aria-hidden="true"></span>
          <label for="view-as" class="hidden text-xs text-blue-100/80 sm:block">Lihat sebagai</label>
          <div class="relative">
            <select id="view-as" class="h-9 appearance-none rounded-lg border border-white/15 bg-white/10 py-0 pl-3 pr-8 text-sm font-[700] text-white focus:border-white/40 focus:ring-0">
              ${MOCK.financeRoleOrder.map((k) => `<option class="text-slate-900" value="${k}" ${k === u.role ? 'selected' : ''}>${esc(MOCK.roles[k].short || MOCK.roles[k].label)}</option>`).join('')}
            </select>
            <span class="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-white/80">${icon('chevronDown', 'w-4 h-4')}</span>
          </div>` : ''}
        </div>
      </div>`;
  }

  /* ---------- Notifikasi ---------- */
  const NOTIF_TYPE = {
    review: { ic: 'eye', cls: 'bg-blue-50 text-blue-700', label: 'Menunggu review' },
    dikembalikan: { ic: 'undo', cls: 'bg-red-50 text-red-600', label: 'Dikembalikan' },
    reminder: { ic: 'bell', cls: 'bg-amber-50 text-amber-700', label: 'Reminder' },
    sla: { ic: 'alert', cls: 'bg-red-50 text-red-600', label: 'Lewat SLA' },
    eskalasi: { ic: 'arrowUp', cls: 'bg-orange-50 text-orange-700', label: 'Eskalasi' },
  };
  function myNotifications() {
    const readIds = new Set(store.get(K.read, []));
    if (ctx.portal !== 'finance') return [];
    return (window.DB ? DB.all('notifications') : MOCK.notifications)
      .filter((n) => n.roles.includes(ctx.user.role))
      .map((n) => Object.assign({}, n, { read: n.read || readIds.has(n.id) }))
      .sort((a, b) => new Date(b.time) - new Date(a.time));
  }
  function markRead(ids) {
    const set = new Set(store.get(K.read, []));
    ids.forEach((i) => set.add(i));
    store.set(K.read, [...set]);
  }
  function renderNotifications() {
    const list = myNotifications();
    const unread = list.filter((n) => !n.read).length;
    const count = document.getElementById('notif-count');
    const btn = document.getElementById('notif-btn');
    count.textContent = unread > 9 ? '9+' : String(unread);
    count.classList.toggle('hidden', !unread);
    btn.setAttribute('aria-label', unread ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi, tidak ada yang belum dibaca');

    const items = list.slice(0, 6).map((n) => {
      const t = NOTIF_TYPE[n.type];
      return `<li>
        <a href="${url(n.href)}" data-notif="${n.id}" data-path="${esc(n.href)}" class="flex gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
          <span class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${t.cls}">${icon(t.ic)}</span>
          <span class="min-w-0 flex-1">
            <span class="flex items-start gap-2">
              <span class="flex-1 text-sm ${n.read ? 'text-slate-600' : 'font-medium text-slate-900'}">${esc(n.title)}</span>
              ${n.read ? '' : '<span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden="true"></span><span class="sr-only">(belum dibaca)</span>'}
            </span>
            <span class="mt-0.5 block font-mono text-xs text-slate-600">${esc(n.docNo)}</span>
            <span class="mt-1 block text-xs text-slate-400 num">${esc(t.label)} · ${UI.formatDateTime(n.time)}</span>
          </span>
        </a></li>`;
    }).join('');

    document.getElementById('notif-panel').innerHTML = `
      <div class="flex items-center justify-between px-4 pb-2 pt-4">
        <p class="text-base font-medium text-slate-900">Notifikasi ${unread ? `<span class="ml-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 num">${unread} baru</span>` : ''}</p>
        <button type="button" id="notif-read-all" class="btn btn-ghost btn-sm !px-2 !text-brand-blue disabled:!text-slate-400" ${unread ? '' : 'disabled'}>${icon('checkCheck', 'w-4 h-4')}Tandai semua dibaca</button>
      </div>
      ${list.length
    ? `<ul class="max-h-[420px] space-y-0.5 overflow-y-auto px-1.5 pb-1.5">${items}</ul>`
    : UI.emptyState({ icon: 'bell', title: 'Tidak ada notifikasi', description: ctx.portal === 'super-admin' ? 'Super Admin tidak menerima notifikasi transaksi.' : 'Notifikasi tugas dan pengingat akan muncul di sini.' })}
      ${ctx.portal === 'finance' ? `<div class="border-t border-slate-200 p-2"><a href="${url('finance/notifikasi.html')}" data-path="finance/notifikasi.html" class="btn btn-secondary w-full">Lihat semua notifikasi</a></div>` : ''}`;

    document.getElementById('notif-read-all').addEventListener('click', () => {
      markRead(list.map((n) => n.id));
      renderNotifications();
      UI.toast('Semua notifikasi ditandai sudah dibaca.');
      document.getElementById('notif-read-all').focus();
    });
    document.querySelectorAll('[data-notif]').forEach((a) => a.addEventListener('click', () => markRead([a.dataset.notif])));
  }

  /* ---------- Pencarian cepat (menu & nomor dokumen) ---------- */
  // ASUMSI: elemen pencarian dari referensi desain dipakai sebagai navigasi cepat ke menu & dokumen yang sudah ada (bukan fitur baru).
  function openSearch() {
    const menu = MENUS[ctx.portal].flatMap((s) => s.items).filter((m) => allowed(m, ctx.perms)).map((m) => ({ title: m.label, sub: 'Menu', href: m.href, ic: m.icon }));
    const docs = ctx.portal === 'finance' && window.DB ? [
      ...DB.all('salesOrders').map((s) => ({ title: s.no, sub: `${DB.client(s.clientCode).name} · ${s.project}`, href: `finance/sales-order-detail.html?no=${encodeURIComponent(s.no)}`, ic: 'fileText' })),
      ...DB.all('invoices').map((i) => ({ title: i.no + (i.rev ? ` Rev.${i.rev}` : ''), sub: `Invoice · ${i.status}`, href: `finance/invoice-detail.html?no=${encodeURIComponent(i.no)}`, ic: 'receipt' })),
      ...DB.all('purchaseOrders').map((p) => ({ title: p.id, sub: `PO · ${DB.vendor(p.vendorCode).name}`, href: 'finance/po-list.html', ic: 'cart' })),
    ] : window.DB ? [
      ...DB.all('clients').map((c) => ({ title: c.name, sub: `Client ${c.code}`, href: 'super-admin/master-client.html', ic: 'briefcase' })),
      ...DB.all('users').map((u) => ({ title: u.name, sub: `User · ${u.email}`, href: 'super-admin/user-management.html', ic: 'user' })),
    ] : [];
    const all = menu.concat(docs);
    const m = UI.formModal({
      title: 'Cari', submitText: '', cancelText: 'Tutup',
      body: `<label for="q-search" class="sr-only">Cari menu atau dokumen</label><div class="relative"><span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">${icon('search')}</span><input id="q-search" class="input !mt-0 !pl-9" placeholder="${ctx.portal === 'finance' ? 'Cari menu, no. SO, no. invoice, client…' : 'Cari menu, client, user…'}" autocomplete="off" autofocus></div><ul id="q-res" class="-mx-2 max-h-[50vh] space-y-0.5 overflow-y-auto" role="listbox"></ul>`,
      onOpen(w) {
        const input = w.querySelector('#q-search'); const res = w.querySelector('#q-res');
        const draw = () => {
          const q = input.value.trim().toLowerCase();
          const hits = (q ? all.filter((x) => (x.title + ' ' + x.sub).toLowerCase().includes(q)) : menu).slice(0, 10);
          res.innerHTML = hits.length ? hits.map((h) => `<li><a href="${url(h.href)}" class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 focus-visible:bg-slate-50"><span class="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500">${icon(h.ic, 'w-4 h-4')}</span><span class="min-w-0"><span class="block truncate text-sm font-medium text-slate-900">${esc(h.title)}</span><span class="block truncate text-xs text-slate-500">${esc(h.sub)}</span></span></a></li>`).join('')
            : `<li class="px-2 py-6 text-center text-sm text-slate-500">Tidak ada hasil untuk "${esc(input.value)}"</li>`;
        };
        input.addEventListener('input', draw);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); const a = res.querySelector('a'); if (a) a.click(); } });
        draw();
      },
    });
    return m;
  }

  /* ---------- Dropdown & sidebar mobile ---------- */
  const dropdowns = [];
  function bindDropdown(btn, panel) {
    const set = (open) => { panel.classList.toggle('hidden', !open); btn.setAttribute('aria-expanded', open); };
    dropdowns.push({ btn, panel, set });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = panel.classList.contains('hidden');
      dropdowns.forEach((d) => d.set(false));
      set(open);
    });
    panel.addEventListener('click', (e) => e.stopPropagation());
  }
  document.addEventListener('click', () => dropdowns.forEach((d) => d.set(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const open = dropdowns.find((d) => !d.panel.classList.contains('hidden'));
      if (open) { open.set(false); open.btn.focus(); }
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && ctx.portal) { e.preventDefault(); openSearch(); }
  });

  function bindSidebar() {
    const aside = document.getElementById('sidebar');
    if (!aside) return;
    const overlay = document.getElementById('sidebar-overlay');
    const opener = document.querySelector('[data-sidebar-open]');
    const set = (open) => {
      aside.classList.toggle('-translate-x-full', !open);
      overlay.classList.toggle('hidden', !open);
      opener.setAttribute('aria-expanded', open);
      if (open) aside.querySelector('a, button').focus();
    };
    opener.addEventListener('click', () => set(true));
    overlay.addEventListener('click', () => set(false));
    aside.querySelector('[data-sidebar-close]').addEventListener('click', () => { set(false); opener.focus(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) { set(false); opener.focus(); }
    });
  }

  // Link ke halaman yang belum dibangun → toast, bukan 404.
  function interceptPending() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-path]');
      if (!a || isBuilt(a.dataset.path)) return;
      e.preventDefault();
      UI.toast('Halaman ini dibangun pada tahap berikutnya.', { type: 'info', title: 'Belum tersedia' });
    });
  }

  function bindLogout() {
    document.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', async () => {
      const { confirmed } = await UI.confirm({ title: 'Keluar dari ETrama?', message: 'Sesi Anda akan diakhiri dan aktivitas logout tercatat di log history.', confirmText: 'Keluar' });
      if (!confirmed) return;
      Auth.logout(ctx.user);
      window.location.href = url('auth/login.html?logout=1');
    }));
  }

  // ASUMSI: alat bantu demo — mengembalikan seluruh data simulasi (localStorage) ke kondisi awal.
  function bindResetDemo() {
    const b = document.querySelector('[data-reset-demo]');
    if (b) b.addEventListener('click', async () => {
      const r = await UI.confirm({ title: 'Reset data demo?', message: 'Semua perubahan simulasi (SO, invoice, master data, log, setting) dikembalikan ke data awal. Anda tetap login.', confirmText: 'Reset', tone: 'warning' });
      if (!r.confirmed) return;
      const sess = store.get(K.session, null); const view = store.get(K.viewAs, null);
      if (window.DB) DB.reset();
      if (sess) store.set(K.session, sess); if (view) store.set(K.viewAs, view);
      window.location.reload();
    });
  }

  function bindViewAs() {
    ['view-as', 'view-as-mobile'].forEach((id) => {
      const sel = document.getElementById(id);
      if (!sel) return;
      sel.addEventListener('change', () => { store.set(K.viewAs, sel.value); window.location.reload(); });
    });
  }

  /* =====================================================================
   * Layout.init — bingkai aplikasi: sidebar + header + konten.
   * opts: { portal, active, title, breadcrumb, icon, greeting, actions (html header kanan), perm, need,
   *         variant: 'detail' (header navy tanpa sidebar), breadcrumbLinks }
   * ===================================================================== */
  function init(opts) {
    ctx.portal = opts.portal;
    ctx.user = resolveUser(opts.portal);
    ctx.perms = MOCK.permissions[ctx.user.role] || {};
    if (!opts.icon) {
      const item = MENUS[opts.portal].flatMap((s) => s.items).find((m) => m.id === (ACTIVE_ALIAS[opts.active] || opts.active));
      opts.icon = item ? item.icon : (opts.active === 'profil' ? 'user' : opts.active === 'notifikasi' ? 'bell' : 'dashboard');
    }
    document.body.classList.add('bg-canvas');
    // Tema "flat" monokrom untuk kedua portal (tombol hitam, kartu abu tanpa border, status titik + teks).
    if (opts.variant !== 'detail') document.body.classList.add('theme-flat');

    const content = document.getElementById('page-content');
    const shell = document.createElement('div');
    if (opts.variant === 'detail') {
      document.body.classList.remove('bg-slate-100');
      document.body.classList.add('bg-[#F4F6FA]');
      shell.innerHTML = `
      <a href="#main" class="skip-link rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white">Lewati ke konten utama</a>
      <header id="app-header">${renderDetailHeader(opts)}</header>
      <main id="main" tabindex="-1" class="min-h-[calc(100vh-60px)] pb-12"><div id="page-slot"></div></main>`;
    } else shell.innerHTML = `
      <a href="#main" class="skip-link rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white">Lewati ke konten utama</a>
      <div id="sidebar-overlay" class="fixed inset-0 z-40 hidden bg-slate-900/40 lg:hidden"></div>
      <div class="min-h-screen">
        <div id="app-frame" class="relative flex min-h-screen bg-canvas">
          <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 flex w-[272px] shrink-0 -translate-x-full flex-col border-r border-line bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0" aria-label="Sidebar">
            ${renderSidebar(opts.portal, opts.active)}
          </aside>
          <div class="flex min-w-0 flex-1 flex-col">
            <header id="app-header">${renderHeader(opts)}</header>
            <main id="main" tabindex="-1" class="flex-1">
              <div id="page-slot" class="mx-auto w-full max-w-content px-4 pb-8 sm:px-6 lg:px-8"></div>
            </main>
          </div>
        </div>
      </div>`;
    document.body.prepend(...shell.childNodes);

    const slot = document.getElementById('page-slot');
    const pageAllowed = !opts.perm || (opts.need ? ctx.perms[opts.perm] === opts.need : !!ctx.perms[opts.perm]);
    ctx.allowed = !!pageAllowed;
    if (pageAllowed) slot.appendChild(content);
    else {
      content.remove();
      slot.innerHTML = `<div class="card">${UI.emptyState({ icon: 'lock', title: 'Anda tidak memiliki akses ke halaman ini', description: opts.need ? `Halaman ini hanya untuk role dengan akses "${opts.need}". ${MOCK.roles[ctx.user.role].label} memiliki akses ${ctx.perms[opts.perm] || 'tidak ada'}.` : `Role ${MOCK.roles[ctx.user.role].label} tidak memiliki izin untuk menu ini. Hubungi Super Admin bila perlu akses.`, action: { label: 'Kembali ke Dashboard', href: url(`${opts.portal}/dashboard.html`) } })}</div>`;
    }

    document.title = `${opts.title} · ETrama ${opts.portal === 'super-admin' ? 'Super Admin' : 'Finance'}`;

    bindSidebar();
    bindDropdown(document.getElementById('notif-btn'), document.getElementById('notif-panel'));
    if (document.getElementById('profile-btn')) bindDropdown(document.getElementById('profile-btn'), document.getElementById('profile-panel'));
    document.getElementById('search-btn').addEventListener('click', openSearch);
    renderNotifications();
    bindLogout();
    bindViewAs();
    bindResetDemo();
    interceptPending();
    return ctx;
  }

  /* =====================================================================
   * Layout.initAuth — shell dua kolom untuk halaman login / password.
   * Halaman berisi <main id="auth-content">…</main>.
   * ===================================================================== */
  function initAuth() {
    const content = document.getElementById('auth-content');
    const shell = document.createElement('div');
    shell.className = 'flex min-h-screen';
    shell.innerHTML = `
      <section class="relative hidden w-[44%] max-w-[640px] flex-col justify-between overflow-hidden bg-brand-navy p-10 text-white lg:flex xl:p-14" aria-label="Tentang ETrama">
        <div class="solar-grid solar-fade pointer-events-none absolute inset-0"></div>
        <div class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl"></div>
        <a href="${url('portal.html')}" class="relative flex items-center gap-3 self-start rounded-lg">
          <img src="${url('assets/img/etrama-logo-white.png')}" alt="ETrama Energy Company" class="h-9 w-auto">
          <span class="border-l border-white/20 pl-3 text-xs font-medium uppercase tracking-[0.1em] text-blue-200">Finance Module 1.0</span>
        </a>
        <div class="relative max-w-md">
          <p class="text-2xl font-semibold leading-tight tracking-tight xl:text-3xl">Dari Sales Order sampai pembayaran, setiap tagihan terlacak.</p>
          <ol class="mt-8 space-y-0 text-sm text-blue-100">
            ${[
    ['Sales Order & ToP', 'Input SPK / PO Klien / Kontrak, termin dibaca AI lalu dikonfirmasi Finance.'],
    ['Review dua lapis', 'Lead F&A dan Manager, lengkap dengan SLA per langkah.'],
    ['Piutang & reminder', 'Reminder H-14 & H-7, On Hold, eskalasi H+30, catat pembayaran.'],
  ].map(([t, d], i, a) => `<li class="relative flex gap-4 pb-6 last:pb-0">
              ${i < a.length - 1 ? '<span class="absolute left-[13px] top-7 h-[calc(100%-20px)] w-px bg-white/15" aria-hidden="true"></span>' : ''}
              <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/25 bg-white/5 text-xs font-semibold num">${i + 1}</span>
              <span><span class="block font-semibold text-white">${t}</span><span class="mt-0.5 block text-blue-200/90">${d}</span></span></li>`).join('')}
          </ol>
        </div>
        <p class="relative text-xs text-blue-200/80">Mengikuti SOP 01.001-00 Pembuatan &amp; Penagihan Invoice</p>
      </section>
      <div class="flex flex-1 flex-col bg-white">
        <div class="flex items-center justify-between px-6 pt-6 lg:hidden">
          <a href="${url('portal.html')}" class="flex items-center gap-2.5 rounded-lg"><img src="${url('assets/img/etrama-logo.png')}" alt="ETrama Energy Company" class="h-7 w-auto"></a>
        </div>
        <div id="auth-slot" class="flex flex-1 items-center justify-center px-6 py-10 sm:px-10"></div>
        <p class="px-6 pb-6 text-center text-xs text-slate-500">© 2026 ETrama · Prototipe UI dengan data simulasi</p>
      </div>`;
    document.body.prepend(shell);
    document.getElementById('auth-slot').appendChild(content);
    UI.initPasswordToggles(content);
  }

  window.Auth = Auth;
  window.Layout = {
    init, initAuth, url, isBuilt,
    user: () => ctx.user,
    perms: () => ctx.perms,
    /** Layout.can('invoice', 'buat') → true untuk Staf Finance */
    can: (perm, level) => (level ? ctx.perms[perm] === level : !!ctx.perms[perm]),
    roleLabel,
  };
})();
