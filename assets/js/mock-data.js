/*
 * ETrama — data dummy untuk prototipe UI. Semua nama orang, perusahaan, rekening, dan nomor dokumen fiktif.
 * Tanggal: 'YYYY-MM-DD' (tanggal saja, WIB) atau ISO dengan offset WIB (+07:00).
 * ASUMSI: tanggal sistem prototipe dikunci ke 02/11/2026 (MOCK.today) agar SLA & umur piutang konsisten.
 */
window.MOCK = (function () {
  const today = '2026-11-02';

  /* ---------- Role & permission (PRD §3.4 d) ---------- */
  const roles = {
    super_admin: { key: 'super_admin', label: 'Super Admin', level: '—', portal: 'super-admin' },
    staf: { key: 'staf', label: 'Admin Finance · Staff', short: 'Staff', level: 'Staff', rank: 10, portal: 'finance' },
    lead: { key: 'lead', label: 'Admin Finance · Lead', short: 'Lead', level: 'Lead', rank: 20, portal: 'finance' },
    mgr_ops: { key: 'mgr_ops', label: 'Admin Finance · Manager', short: 'Manager', level: 'Manager', rank: 30, portal: 'finance' },
    direktur: { key: 'direktur', label: 'Admin Finance · Direktur', short: 'Direktur', level: 'Direktur', rank: 40, portal: 'finance' },
  };
  // Sesuai implementasi fe_etrama: 2 role sistem (Super Admin, Admin Finance); wewenang Finance ditentukan level hierarki
  // Staff (10) → Lead (20) → Manager (30) → Direktur (40). Key internal 'mgr_ops' dipertahankan untuk level Manager.
  const financeRoleOrder = ['staf', 'lead', 'mgr_ops', 'direktur'];
  const levels = ['Staff', 'Lead', 'Manager', 'Direktur'];

  const permissions = {
    super_admin: { master: 'kelola', userRole: 'kelola', sla: 'kelola', dokumen: 'kelola', report: 'lihat', log: 'semua' },
    staf: { master: 'lihat', so: 'buat', bast: 'buat', invoice: 'buat', approval: null, piutang: 'buat', piutangVerify: null, piutangDecide: null, vendor: 'buat', report: 'lihat', log: 'sendiri' },
    lead: { master: 'lihat', so: 'lihat', bast: 'lihat', invoice: 'lihat', approval: 'layer1', piutang: 'lihat', piutangVerify: 'verifikasi', piutangDecide: 'putuskan', vendor: 'lihat', report: 'lihat', log: 'tim' },
    mgr_ops: { master: 'lihat', so: 'lihat', bast: 'lihat', invoice: 'lihat', approval: 'layer2', piutang: 'lihat', piutangVerify: 'lihat', piutangDecide: 'lihat', vendor: 'lihat', report: 'lihat', log: 'tim' },
    direktur: { master: 'lihat', so: 'lihat', bast: 'lihat', invoice: 'lihat', approval: 'threshold', piutang: 'lihat', piutangVerify: 'lihat', piutangDecide: 'putuskan', vendor: 'lihat', report: 'lihat', log: 'semua' },
  };
  const permissionLabels = [
    { key: 'so', label: 'Input Sales Order & BAST' },
    { key: 'invoice', label: 'Buat, kirim, revisi invoice' },
    { key: 'approval', label: 'Review / approve invoice' },
    { key: 'piutang', label: 'Penagihan, On Hold, catat bayar' },
    { key: 'piutangVerify', label: 'Verifikasi laporan piutang' },
    { key: 'piutangDecide', label: 'Keputusan piutang bermasalah' },
    { key: 'vendor', label: 'PO, invoice & catatan bayar vendor' },
    { key: 'report', label: 'Report SO & laporan piutang' },
    { key: 'log', label: 'Log history' },
  ];

  /* ---------- Role akses (Role Management) ---------- */
  const MENU_KEYS = ['master', 'user', 'role', 'hierarki', 'approvalSla', 'dokumen', 'log', 'so', 'bast', 'invoice', 'piutang', 'po', 'vendorPay', 'approval', 'report'];
  const menuLabels = {
    master: 'Master Data', user: 'User Management', role: 'Role Management', hierarki: 'Hierarki Role', approvalSla: 'Approval & SLA',
    dokumen: 'Pengaturan Dokumen', log: 'Log History', so: 'Sales Order', bast: 'BAST', invoice: 'Invoice', piutang: 'Piutang',
    po: 'Purchase Order', vendorPay: 'Pembayaran Vendor', approval: 'Approval', report: 'Report',
  };
  const ACTIONS = ['lihat', 'buat', 'edit', 'hapus', 'approve', 'export'];
  const grant = (map) => Object.fromEntries(MENU_KEYS.map((k) => [k, map[k] || []]));
  const all = ['lihat', 'buat', 'edit', 'hapus', 'export'];
  const rolesList = [
    {
      id: 'R-01', name: 'Super Admin', builtin: true, desc: 'Mengelola konfigurasi sistem: master data, user, role, approval, SLA, pengaturan dokumen, dan log. Tidak ikut meng-approve transaksi.',
      perms: grant({ master: all, user: all, role: all, hierarki: ['lihat', 'edit'], approvalSla: ['lihat', 'edit'], dokumen: ['lihat', 'edit'], log: ['lihat', 'export'], report: ['lihat', 'export'] }),
    },
    {
      id: 'R-02', name: 'Admin Finance', builtin: true, desc: 'Pengguna operasional modul Finance. Wewenang submit & approve mengikuti level hierarki (Staff, Lead, Manager, Direktur).',
      perms: grant({ master: ['lihat'], log: ['lihat'], so: ['lihat', 'buat', 'edit'], bast: ['lihat', 'buat'], invoice: ['lihat', 'buat', 'edit', 'export'], piutang: ['lihat', 'buat', 'edit', 'export'], po: ['lihat', 'buat', 'edit'], vendorPay: ['lihat', 'buat', 'export'], approval: ['lihat', 'approve'], report: ['lihat', 'export'] }),
    },
    {
      id: 'R-03', name: 'Finance Viewer', builtin: false, desc: 'Hanya dapat melihat dan mengekspor report Sales Order dan laporan piutang.',
      perms: grant({ report: ['lihat', 'export'] }),
    },
  ];

  /* ---------- User ---------- */
  const users = [
    { id: 'U-001', name: 'Rina Kartikasari', email: 'rina.kartikasari@etrama.co.id', role: 'super_admin', roleId: 'R-01', supervisorId: null, status: 'Aktif', password: 'Admin#2026', lastLogin: '2026-11-02T08:02:00+07:00', sessions: 1 },
    { id: 'U-002', name: 'Dewi Anggraini', email: 'dewi.anggraini@etrama.co.id', role: 'staf', roleId: 'R-02', supervisorId: 'U-004', status: 'Aktif', password: 'Finance#2026', lastLogin: '2026-11-02T07:48:00+07:00', sessions: 2 },
    { id: 'U-003', name: 'Fajar Nugroho', email: 'fajar.nugroho@etrama.co.id', role: 'staf', roleId: 'R-02', supervisorId: 'U-004', status: 'Aktif', mustChangePassword: true, tempPassword: 'Sementara#81', lastLogin: null, sessions: 0 },
    { id: 'U-004', name: 'Hendra Wijaya', email: 'hendra.wijaya@etrama.co.id', role: 'lead', roleId: 'R-02', supervisorId: 'U-005', status: 'Aktif', password: 'Lead#2026', lastLogin: '2026-11-02T08:15:00+07:00', sessions: 1 },
    { id: 'U-005', name: 'Bambang Sutrisno', email: 'bambang.sutrisno@etrama.co.id', role: 'mgr_ops', roleId: 'R-02', supervisorId: 'U-007', status: 'Aktif', password: 'Manager#2026', lastLogin: '2026-10-30T16:20:00+07:00', sessions: 1 },
    { id: 'U-006', name: 'Ratna Permatasari', email: 'ratna.permatasari@etrama.co.id', role: 'mgr_ops', roleId: 'R-02', supervisorId: 'U-007', status: 'Aktif', password: 'Manager#2026', lastLogin: '2026-11-01T19:05:00+07:00', sessions: 0 },
    { id: 'U-007', name: 'Arief Rahman Hakim', email: 'arief.hakim@etrama.co.id', role: 'direktur', roleId: 'R-02', supervisorId: null, status: 'Aktif', password: 'Direktur#2026', lastLogin: '2026-11-01T15:22:00+07:00', sessions: 1 },
    { id: 'U-008', name: 'Yusuf Pratama', email: 'yusuf.pratama@etrama.co.id', role: 'staf', roleId: 'R-02', supervisorId: 'U-004', status: 'Nonaktif', password: 'Finance#2026', lastLogin: '2026-08-14T10:11:00+07:00', sessions: 0 },
  ];

  /* ---------- Master data (v1.0: kode, nama, PIC, status) ---------- */
  const clients = [
    { code: 'CL-0001', name: 'PT Surya Energi Nusantara', pic: 'Budi Santoso', status: 'Aktif' },
    { code: 'CL-0002', name: 'PT Mitra Logistik Prima', pic: 'Siti Rahmawati', status: 'Aktif' },
    { code: 'CL-0003', name: 'RS Harapan Sehat', pic: 'dr. Andi Kurniawan', status: 'Aktif' },
    { code: 'CL-0004', name: 'Hotel Samudra Indah', pic: 'Maya Puspitasari', status: 'Aktif' },
    { code: 'CL-0005', name: 'PT Agro Lestari Mandiri', pic: 'Joko Susilo', status: 'Aktif' },
    { code: 'CL-0006', name: 'Universitas Cahaya Bangsa', pic: 'Dr. Lestari Wulandari', status: 'Aktif' },
    { code: 'CL-0007', name: 'PT Tekstil Nusa Indah', pic: 'Agus Setiawan', status: 'Nonaktif' },
    { code: 'CL-0008', name: 'CV Berkah Pangan Sejahtera', pic: 'Nurul Hidayah', status: 'Aktif' },
    { code: 'CL-0009', name: 'PT Gudang Dingin Pratama', pic: 'Hadi Gunawan', status: 'Aktif' },
    { code: 'CL-0010', name: 'Sekolah Global Insani', pic: 'Rahmat Hidayat', status: 'Aktif' },
    { code: 'CL-0011', name: 'PT Kemasan Plastik Utama', pic: 'Fitri Handayani', status: 'Nonaktif' },
    { code: 'CL-0012', name: 'Resort Bukit Hijau', pic: 'Wayan Sudarma', status: 'Aktif' },
  ];
  const vendors = [
    { code: 'VD-0001', name: 'PT Panel Surya Mandiri', pic: 'Teguh Prasetyo', status: 'Aktif' },
    { code: 'VD-0002', name: 'PT Daya Inverter Indonesia', pic: 'Lina Marlina', status: 'Aktif' },
    { code: 'VD-0003', name: 'PT Kabel Prima Nusantara', pic: 'Dodi Firmansyah', status: 'Aktif' },
    { code: 'VD-0004', name: 'CV Teknik Instalasi Andalan', pic: 'Eko Purnomo', status: 'Aktif' },
    { code: 'VD-0005', name: 'PT Rangka Baja Solusindo', pic: 'Sri Mulyani Astuti', status: 'Aktif' },
    { code: 'VD-0006', name: 'PT Baterai Energi Hijau', pic: 'Irwan Saputra', status: 'Nonaktif' },
  ];
  const stafBD = [
    { id: 'BD-01', name: 'Galih Saputra', status: 'Aktif' },
    { id: 'BD-02', name: 'Intan Maharani', status: 'Aktif' },
    { id: 'BD-03', name: 'Rizky Ramadhan', status: 'Aktif' },
    { id: 'BD-04', name: 'Wulan Sari', status: 'Nonaktif' },
  ];

  /* ---------- Sales Order ---------- */
  // items: [deskripsi, qty, satuan, harga satuan, diskon (Rp)]
  const panel = (qty, price, disc) => [`Panel surya monocrystalline 550 Wp`, qty, 'pcs', price, disc || 0];
  const inverter = (kw, qty, price) => [`Inverter on-grid ${kw} kW`, qty, 'unit', price, 0];
  const bos = (price) => ['Mounting, kabel DC/AC & panel proteksi (BOS)', 1, 'lot', price, 0];
  const jasa = (price, disc) => ['Jasa instalasi, testing & commissioning', 1, 'lot', price, disc || 0];
  const TOP_STD = [
    { label: 'DP', pct: 30, trigger: 'date', triggerText: '14 hari setelah kontrak ditandatangani', dueText: '14 hari setelah invoice diterima', retention: '' },
    { label: 'Material tiba', pct: 60, trigger: 'milestone', triggerText: 'Seluruh material tiba di lokasi', dueText: '14 hari setelah invoice diterima', retention: '' },
    { label: 'Setelah BAST', pct: 10, trigger: 'milestone', triggerText: 'BAST ditandatangani kedua pihak', dueText: '30 hari setelah invoice diterima', retention: '' },
  ];
  const top = () => JSON.parse(JSON.stringify(TOP_STD)).map((t, i) => Object.assign({ no: i + 1 }, t));
  const salesOrders = [
    { no: 'SO/ETR/2026/06/0002', docType: 'Kontrak Kerja', clientDocNo: 'SEN/KTR/2026/031', approvedDate: '2026-06-01', receivedDate: '2026-06-02', clientCode: 'CL-0001', bdId: 'BD-01', project: 'PLTS Atap Kantor Pusat', location: 'Jl. Gatot Subroto Kav. 12, Jakarta Selatan', kwp: 60, items: [panel(110, 2300000), inverter(30, 2, 41000000), bos(90000000), jasa(65000000)], top: top(), status: 'Selesai', createdBy: 'U-002', createdAt: '2026-06-02T10:20:00+07:00', files: ['Kontrak_SEN_031.pdf'], guarantee: [] },
    { no: 'SO/ETR/2026/07/0004', docType: 'Kontrak Kerja', clientDocNo: 'SEN/KTR/2026/058', approvedDate: '2026-07-06', receivedDate: '2026-07-07', clientCode: 'CL-0001', bdId: 'BD-01', project: 'PLTS Atap Pabrik Cikarang', location: 'Kawasan Industri Jababeka, Cikarang, Bekasi', kwp: 450, items: [panel(820, 2250000, 45000000), inverter(110, 4, 152000000), bos(610000000), jasa(420000000)], top: top(), status: 'Aktif', createdBy: 'U-002', createdAt: '2026-07-07T14:02:00+07:00', files: ['Kontrak_SEN_058.pdf'], guarantee: ['Bank Garansi Uang Muka - BG-2026-0711.pdf'] },
    {
      no: 'SO/ETR/2026/07/0005', docType: 'PO Klien', clientDocNo: 'PO/RSHS/VII/2026/114', approvedDate: '2026-07-13', receivedDate: '2026-07-14', clientCode: 'CL-0003', bdId: 'BD-02', project: 'PLTS Atap Gedung Rawat Inap', location: 'Jl. Pemuda No. 45, Semarang', kwp: 150, items: [panel(273, 2300000), inverter(50, 3, 68000000), bos(215000000), jasa(160000000, 7900000)], status: 'Aktif', createdBy: 'U-002', createdAt: '2026-07-14T09:40:00+07:00', files: ['PO_RSHS_114.pdf'], guarantee: ['Jaminan Pelaksanaan - Asuransi.pdf'],
      top: [
        { no: 1, label: 'DP', pct: 20, trigger: 'date', triggerText: 'Setelah PO diterbitkan', dueText: '30 hari setelah invoice diterima', retention: '' },
        { no: 2, label: 'Material tiba', pct: 40, trigger: 'milestone', triggerText: 'Material tiba di lokasi', dueText: '30 hari setelah invoice diterima', retention: '' },
        { no: 3, label: 'Setelah BAST', pct: 35, trigger: 'milestone', triggerText: 'BAST ditandatangani', dueText: '30 hari setelah invoice diterima', retention: '' },
        { no: 4, label: 'Retensi', pct: 5, trigger: 'milestone', triggerText: 'Akhir masa pemeliharaan 6 bulan', dueText: '30 hari setelah invoice diterima', retention: '5% ditahan 6 bulan' },
      ],
    },
    { no: 'SO/ETR/2026/08/0009', docType: 'SPK', clientDocNo: 'SPK/HSI/2026/08/007', approvedDate: '2026-08-03', receivedDate: '2026-08-04', clientCode: 'CL-0004', bdId: 'BD-02', project: 'PLTS Atap Hotel Nusa Dua', location: 'Jl. Pratama No. 88, Nusa Dua, Bali', kwp: 120, items: [panel(218, 2300000, 1400000), inverter(60, 2, 80000000), bos(185000000), jasa(135000000)], top: top(), status: 'Aktif', createdBy: 'U-002', createdAt: '2026-08-04T11:15:00+07:00', files: ['SPK_HSI_007.pdf'], guarantee: [] },
    { no: 'SO/ETR/2026/08/0011', docType: 'Kontrak Kerja', clientDocNo: 'MLP/LGL/KTR/2026/022', approvedDate: '2026-08-17', receivedDate: '2026-08-18', clientCode: 'CL-0002', bdId: 'BD-01', project: 'PLTS Atap Gudang Surabaya', location: 'Jl. Margomulyo No. 21, Surabaya', kwp: 300, items: [panel(546, 2250000, 28500000), inverter(100, 3, 145000000), bos(410000000), jasa(300000000)], top: top(), status: 'Aktif', createdBy: 'U-002', createdAt: '2026-08-18T13:30:00+07:00', files: ['Kontrak_MLP_022.pdf'], guarantee: ['EAR - Polis 0815.pdf'] },
    { no: 'SO/ETR/2026/09/0014', docType: 'Kontrak Kerja', clientDocNo: 'ALM/KTR/IX/2026/09', approvedDate: '2026-09-07', receivedDate: '2026-09-08', clientCode: 'CL-0005', bdId: 'BD-03', project: 'PLTS Atap Pabrik Pakan Lampung', location: 'Jl. Lintas Sumatra Km 18, Lampung Selatan', kwp: 250, items: [panel(455, 2250000, 23750000), inverter(125, 2, 170000000), bos(355000000), jasa(255000000)], top: top(), status: 'Aktif', createdBy: 'U-002', createdAt: '2026-09-08T10:05:00+07:00', files: ['Kontrak_ALM_09.pdf'], guarantee: [] },
    { no: 'SO/ETR/2026/09/0016', docType: 'PO Klien', clientDocNo: 'PO-GDP-2026-0457', approvedDate: '2026-09-21', receivedDate: '2026-09-22', clientCode: 'CL-0009', bdId: 'BD-02', project: 'PLTS Atap Cold Storage Marunda', location: 'Kawasan Marunda Center Blok C, Jakarta Utara', kwp: 200, items: [panel(364, 2250000, 19000000), inverter(100, 2, 145000000), bos(300000000), jasa(216000000)], top: top(), status: 'Aktif', createdBy: 'U-003', createdAt: '2026-09-22T15:10:00+07:00', files: ['PO_GDP_0457.pdf'], guarantee: [] },
    { no: 'SO/ETR/2026/10/0018', docType: 'SPK', clientDocNo: 'SPK/RBH/X/2026/03', approvedDate: '2026-10-20', receivedDate: '2026-10-23', clientCode: 'CL-0012', bdId: 'BD-03', project: 'PLTS Atap Resort Ubud', location: 'Jl. Raya Sayan, Ubud, Gianyar', kwp: 80, items: [panel(146, 2300000, 5800000), inverter(40, 2, 52000000), bos(120000000), jasa(95000000)], top: top(), status: 'Aktif', createdBy: 'U-002', createdAt: '2026-10-23T16:45:00+07:00', files: ['SPK_RBH_03.pdf'], guarantee: [] },
    { no: 'SO/ETR/2026/10/0019', docType: 'Kontrak Kerja', clientDocNo: 'TNI/PRJ/2026/112', approvedDate: '2026-10-12', receivedDate: '2026-10-13', clientCode: 'CL-0007', bdId: 'BD-04', project: 'PLTS Atap Pabrik Tekstil Bandung', location: 'Jl. Raya Banjaran Km 9, Kab. Bandung', kwp: 500, items: [panel(910, 2200000, 52000000), inverter(125, 4, 170000000), bos(700000000), jasa(520000000)], top: top(), status: 'Aktif', createdBy: 'U-004', createdAt: '2026-10-13T09:00:00+07:00', files: ['Kontrak_TNI_112.pdf'], guarantee: ['Bank Garansi - BG-2026-1013.pdf'] },
    { no: 'SO/ETR/2026/10/0021', docType: 'SPK', clientDocNo: 'SPK/BPS/2026/015', approvedDate: '2026-10-21', receivedDate: '2026-10-22', clientCode: 'CL-0008', bdId: 'BD-01', project: 'PLTS Atap Pabrik Roti Bogor', location: 'Jl. Raya Tajur No. 210, Bogor', kwp: 60, items: [panel(110, 2300000, 3000000), inverter(30, 2, 41000000), bos(95000000), jasa(70000000)], top: top(), status: 'Aktif', createdBy: 'U-002', createdAt: '2026-10-22T10:30:00+07:00', files: ['SPK_BPS_015.pdf'], guarantee: [] },
    // ASUMSI: approval SO pernah diaktifkan Super Admin (US-FN-04 poin 1) — contoh status "Menunggu Approval" untuk toggle report.
    { no: 'SO/ETR/2026/10/0022', docType: 'Kontrak Kerja', clientDocNo: 'UCB/REK/KTR/2026/77', approvedDate: '2026-10-27', receivedDate: '2026-10-28', clientCode: 'CL-0006', bdId: 'BD-03', project: 'PLTS Atap Gedung Rektorat', location: 'Jl. Pendidikan No. 1, Depok', kwp: 180, items: [panel(328, 2250000, 18000000), inverter(90, 2, 130000000), bos(280000000), jasa(200000000)], top: top(), status: 'Menunggu Approval', createdBy: 'U-002', createdAt: '2026-10-28T13:00:00+07:00', files: ['Kontrak_UCB_77.pdf'], guarantee: [] },
    { no: 'SO/ETR/2026/11/0001', docType: 'SPK', clientDocNo: 'SPK/SGI/XI/2026/01', approvedDate: '2026-10-29', receivedDate: '2026-10-30', clientCode: 'CL-0010', bdId: 'BD-02', project: 'PLTS Atap Gedung Sekolah', location: 'Jl. Bintaro Utama Sektor 9, Tangerang Selatan', kwp: 50, items: [panel(91, 2300000, 4300000), inverter(50, 1, 68000000), bos(82000000), jasa(60000000)], top: top(), status: 'Aktif', createdBy: 'U-002', createdAt: '2026-11-02T08:30:00+07:00', files: ['SPK_SGI_01.pdf'], guarantee: [] },
  ];

  /* ---------- Invoice + piutang (ar) ---------- */
  const h = (at, by, action, note) => ({ at, by, action, note: note || '' });
  const paidOnce = (date, by) => ({ payments: [{ date, infoDate: date, amount: 'FULL', proof: 'Bukti_transfer.pdf', by: by || 'U-002', at: `${date}T15:00:00+07:00` }], reminders: [], notes: [], checked: { at: `${date}T17:00:00+07:00`, by: 'U-004' } });
  const invoices = [
    { no: 'INV/ETR/2026/06/0003', rev: 0, soNo: 'SO/ETR/2026/06/0002', term: 1, date: '2026-06-10', due: '2026-06-24', status: 'Terkirim', createdBy: 'U-002', bankId: 'BK-1', history: [h('2026-06-10T09:00:00+07:00', 'U-002', 'Dibuat'), h('2026-06-10T10:00:00+07:00', 'U-002', 'Diajukan ke Lead F&A'), h('2026-06-10T15:00:00+07:00', 'U-004', 'Disetujui Lead F&A'), h('2026-06-11T10:00:00+07:00', 'U-005', 'Disetujui Manager'), h('2026-06-11T14:00:00+07:00', 'U-002', 'Terkirim ke klien')], ar: paidOnce('2026-06-22') },
    { no: 'INV/ETR/2026/07/0008', rev: 0, soNo: 'SO/ETR/2026/06/0002', term: 2, date: '2026-07-15', due: '2026-07-29', status: 'Terkirim', createdBy: 'U-002', bankId: 'BK-1', history: [h('2026-07-15T09:00:00+07:00', 'U-002', 'Dibuat'), h('2026-07-16T14:00:00+07:00', 'U-002', 'Terkirim ke klien')], ar: paidOnce('2026-07-28') },
    { no: 'INV/ETR/2026/08/0010', rev: 0, soNo: 'SO/ETR/2026/06/0002', term: 3, date: '2026-08-20', due: '2026-09-19', status: 'Terkirim', createdBy: 'U-002', bankId: 'BK-1', basis: 'BAST-2026-0005', history: [h('2026-08-20T09:00:00+07:00', 'U-002', 'Dibuat dari BAST'), h('2026-08-21T14:00:00+07:00', 'U-002', 'Terkirim ke klien')], ar: paidOnce('2026-09-15') },
    { no: 'INV/ETR/2026/07/0011', rev: 0, soNo: 'SO/ETR/2026/07/0004', term: 1, date: '2026-07-20', due: '2026-08-03', status: 'Terkirim', createdBy: 'U-002', bankId: 'BK-1', history: [h('2026-07-20T09:00:00+07:00', 'U-002', 'Dibuat'), h('2026-07-23T11:00:00+07:00', 'U-002', 'Terkirim ke klien')], ar: paidOnce('2026-08-03') },
    {
      no: 'INV/ETR/2026/09/0021', rev: 0, soNo: 'SO/ETR/2026/07/0004', term: 2, date: '2026-09-01', due: '2026-09-15', status: 'Terkirim', createdBy: 'U-002', bankId: 'BK-1', basis: 'BAST-2026-0008',
      history: [h('2026-09-01T09:00:00+07:00', 'U-002', 'Dibuat dari BA material tiba'), h('2026-09-02T10:00:00+07:00', 'U-004', 'Disetujui Lead F&A'), h('2026-09-02T16:00:00+07:00', 'U-005', 'Disetujui Manager'), h('2026-09-03T08:30:00+07:00', 'U-007', 'Disetujui Direktur'), h('2026-09-03T14:00:00+07:00', 'U-002', 'Terkirim ke klien')],
      ar: {
        payments: [], escalated: { at: '2026-10-30T16:05:00+07:00', by: 'Sistem' }, lastNotice: '2026-09-18',
        reminders: [{ at: '2026-09-01T10:00:00+07:00', type: 'H-14', channel: 'Email', note: 'Klien mengonfirmasi jadwal bayar 15/09.', by: 'U-002' }, { at: '2026-09-08T10:00:00+07:00', type: 'H-7', channel: 'Telepon', note: 'PIC menyampaikan proses approval internal.', by: 'U-002' }],
        notes: [{ at: '2026-09-18T09:30:00+07:00', by: 'U-002', text: 'Pemberitahuan ulang via email & surat. Klien minta waktu karena arus kas tertahan.' }, { at: '2026-10-30T16:05:00+07:00', by: 'Sistem', text: 'Eskalasi otomatis ke Manager: belum dibayar H+30 hari kerja sejak pemberitahuan terakhir.' }],
      },
    },
    { no: 'INV/ETR/2026/07/0013', rev: 0, soNo: 'SO/ETR/2026/07/0005', term: 1, date: '2026-07-22', due: '2026-08-21', status: 'Terkirim', createdBy: 'U-002', bankId: 'BK-2', history: [h('2026-07-22T09:00:00+07:00', 'U-002', 'Dibuat'), h('2026-07-24T10:00:00+07:00', 'U-002', 'Terkirim ke klien')], ar: paidOnce('2026-08-19') },
    {
      no: 'INV/ETR/2026/09/0024', rev: 0, soNo: 'SO/ETR/2026/07/0005', term: 2, date: '2026-09-10', due: '2026-10-10', status: 'Terkirim', createdBy: 'U-002', bankId: 'BK-2', basis: 'BAST-2026-0009',
      history: [h('2026-09-10T09:00:00+07:00', 'U-002', 'Dibuat dari BA material tiba'), h('2026-09-11T14:00:00+07:00', 'U-002', 'Terkirim ke klien')],
      ar: { payments: [{ date: '2026-10-09', infoDate: '2026-10-09', amount: 266178000, proof: 'TF_RSHS_0910.pdf', by: 'U-002', at: '2026-10-09T15:30:00+07:00' }], reminders: [{ at: '2026-09-26T09:00:00+07:00', type: 'H-14', channel: 'WhatsApp', note: 'Bagian keuangan RS konfirmasi bayar bertahap.', by: 'U-002' }, { at: '2026-10-03T09:00:00+07:00', type: 'H-7', channel: 'Telepon', note: 'Pembayaran 50% dulu, sisanya akhir Oktober.', by: 'U-002' }], notes: [{ at: '2026-10-09T16:00:00+07:00', by: 'U-002', text: 'Diterima 50%. Sisa dijanjikan 30/10, belum masuk.' }] },
    },
    {
      no: 'INV/ETR/2026/10/0049', rev: 0, soNo: 'SO/ETR/2026/07/0005', term: 3, date: '2026-10-29', due: '2026-11-28', status: 'Review Manager', createdBy: 'U-002', bankId: 'BK-2', basis: 'BAST-2026-0014',
      history: [h('2026-10-29T10:00:00+07:00', 'U-002', 'Dibuat dari BAST'), h('2026-10-29T14:00:00+07:00', 'U-002', 'Diajukan ke Lead F&A'), h('2026-10-30T11:20:00+07:00', 'U-004', 'Disetujui Lead F&A')],
    },
    { no: 'INV/ETR/2026/08/0015', rev: 0, soNo: 'SO/ETR/2026/08/0009', term: 1, date: '2026-08-10', due: '2026-08-24', status: 'Terkirim', createdBy: 'U-002', bankId: 'BK-1', history: [h('2026-08-10T09:00:00+07:00', 'U-002', 'Dibuat'), h('2026-08-11T10:00:00+07:00', 'U-002', 'Terkirim ke klien')], ar: paidOnce('2026-08-24') },
    {
      no: 'INV/ETR/2026/09/0026', rev: 0, soNo: 'SO/ETR/2026/08/0009', term: 2, date: '2026-09-21', due: '2026-10-05', status: 'Terkirim', createdBy: 'U-002', bankId: 'BK-1', basis: 'BAST-2026-0010',
      history: [h('2026-09-21T09:00:00+07:00', 'U-002', 'Dibuat dari BA material tiba'), h('2026-09-22T10:00:00+07:00', 'U-002', 'Terkirim ke klien')],
      ar: { payments: [], hold: { at: '2026-10-07T10:00:00+07:00', by: 'U-002', note: 'Klien meminta penundaan sampai renovasi lobi selesai (estimasi 20/11). Surat permohonan terlampir.' }, reminders: [{ at: '2026-09-21T10:00:00+07:00', type: 'H-14', channel: 'Email', note: 'Terkirim bersama invoice.', by: 'U-002' }], notes: [{ at: '2026-10-07T10:00:00+07:00', by: 'U-002', text: 'Status diubah ke On Hold: klien meminta penundaan sampai renovasi lobi selesai (estimasi 20/11).' }] },
    },
    {
      no: 'INV/ETR/2026/10/0044', rev: 0, soNo: 'SO/ETR/2026/08/0009', term: 3, date: '2026-10-28', due: '2026-11-27', status: 'Disetujui', createdBy: 'U-002', bankId: 'BK-1', basis: 'BAST-2026-0013',
      history: [h('2026-10-28T09:00:00+07:00', 'U-002', 'Dibuat dari BAST'), h('2026-10-28T11:00:00+07:00', 'U-002', 'Diajukan ke Lead F&A'), h('2026-10-29T09:10:00+07:00', 'U-004', 'Disetujui Lead F&A'), h('2026-10-30T15:40:00+07:00', 'U-005', 'Disetujui Manager')],
    },
    { no: 'INV/ETR/2026/08/0017', rev: 0, soNo: 'SO/ETR/2026/08/0011', term: 1, date: '2026-08-24', due: '2026-09-07', status: 'Terkirim', createdBy: 'U-002', bankId: 'BK-1', history: [h('2026-08-24T09:00:00+07:00', 'U-002', 'Dibuat'), h('2026-08-25T10:00:00+07:00', 'U-002', 'Terkirim ke klien')], ar: paidOnce('2026-09-07') },
    {
      no: 'INV/ETR/2026/10/0031', rev: 1, soNo: 'SO/ETR/2026/08/0011', term: 2, date: '2026-10-06', due: '2026-10-20', status: 'Terkirim', createdBy: 'U-002', bankId: 'BK-3', basis: 'BAST-2026-0011', transmittalSigned: 'Transmittal_MLP_ttd.pdf',
      versions: [{ rev: 0, at: '2026-10-01T09:00:00+07:00', reason: 'Versi awal' }, { rev: 1, at: '2026-10-05T10:00:00+07:00', reason: 'Revisi dari klien: nama proyek di invoice harus sesuai PO ("Gudang Surabaya - Margomulyo").' }],
      history: [h('2026-10-01T09:00:00+07:00', 'U-002', 'Dibuat dari BA material tiba'), h('2026-10-01T10:00:00+07:00', 'U-002', 'Diajukan ke Lead F&A'), h('2026-10-01T15:00:00+07:00', 'U-004', 'Disetujui Lead F&A'), h('2026-10-02T09:00:00+07:00', 'U-005', 'Dikembalikan', 'Lampiran BA material tiba belum ada tanda tangan klien.'), h('2026-10-02T13:00:00+07:00', 'U-002', 'Diajukan ulang'), h('2026-10-02T16:00:00+07:00', 'U-004', 'Disetujui Lead F&A'), h('2026-10-03T08:00:00+07:00', 'U-005', 'Disetujui Manager'), h('2026-10-03T08:40:00+07:00', 'U-007', 'Disetujui Direktur'), h('2026-10-03T11:00:00+07:00', 'U-002', 'Terkirim ke klien'), h('2026-10-05T10:00:00+07:00', 'U-002', 'Revisi dari klien (Rev.1)', 'Nama proyek di invoice harus sesuai PO.'), h('2026-10-05T15:00:00+07:00', 'U-004', 'Disetujui Lead F&A'), h('2026-10-06T09:00:00+07:00', 'U-005', 'Disetujui Manager'), h('2026-10-06T10:00:00+07:00', 'U-007', 'Disetujui Direktur'), h('2026-10-06T14:00:00+07:00', 'U-002', 'Terkirim ke klien (Rev.1)')],
      ar: { payments: [], lastNotice: '2026-10-22', reminders: [{ at: '2026-10-06T14:00:00+07:00', type: 'H-14', channel: 'Email', note: 'Klien konfirmasi bayar sesuai jatuh tempo.', by: 'U-002' }, { at: '2026-10-13T09:00:00+07:00', type: 'H-7', channel: 'Telepon', note: 'Menunggu tanda tangan direksi klien.', by: 'U-002' }], notes: [{ at: '2026-10-22T10:00:00+07:00', by: 'U-002', text: 'Pemberitahuan ulang via email. PIC janji transfer minggu depan.' }] },
    },
    {
      no: 'INV/ETR/2026/10/0035', rev: 0, soNo: 'SO/ETR/2026/09/0014', term: 1, date: '2026-10-12', due: '2026-11-09', status: 'Terkirim', createdBy: 'U-002', bankId: 'BK-1',
      history: [h('2026-10-12T09:00:00+07:00', 'U-002', 'Dibuat'), h('2026-10-12T11:00:00+07:00', 'U-002', 'Diajukan ke Lead F&A'), h('2026-10-12T16:00:00+07:00', 'U-004', 'Disetujui Lead F&A'), h('2026-10-13T10:00:00+07:00', 'U-005', 'Disetujui Manager'), h('2026-10-13T15:00:00+07:00', 'U-007', 'Disetujui Direktur'), h('2026-10-14T10:00:00+07:00', 'U-002', 'Terkirim ke klien')],
      ar: { payments: [], reminders: [{ at: '2026-10-26T09:00:00+07:00', type: 'H-14', channel: 'Email', note: 'Klien konfirmasi jadwal bayar 09/11.', by: 'U-002' }], notes: [] },
    },
    {
      no: 'INV/ETR/2026/10/0050', rev: 0, soNo: 'SO/ETR/2026/09/0014', term: 2, date: '2026-10-28', due: '2026-11-11', status: 'Review Direktur', createdBy: 'U-002', bankId: 'BK-1', basis: 'BAST-2026-0012',
      history: [h('2026-10-28T10:00:00+07:00', 'U-002', 'Dibuat dari BA material tiba'), h('2026-10-28T13:00:00+07:00', 'U-002', 'Diajukan ke Lead F&A'), h('2026-10-29T10:00:00+07:00', 'U-004', 'Disetujui Lead F&A'), h('2026-11-01T15:20:00+07:00', 'U-005', 'Disetujui Manager')],
    },
    {
      no: 'INV/ETR/2026/10/0039', rev: 0, soNo: 'SO/ETR/2026/09/0016', term: 1, date: '2026-10-02', due: '2026-11-16', status: 'Terkirim', createdBy: 'U-003', bankId: 'BK-1',
      history: [h('2026-10-02T09:00:00+07:00', 'U-003', 'Dibuat'), h('2026-10-05T10:00:00+07:00', 'U-003', 'Terkirim ke klien')],
      ar: { payments: [], reminders: [], notes: [{ at: '2026-10-05T10:30:00+07:00', by: 'U-003', text: 'Klien meminta jatuh tempo 45 hari sesuai PO.' }] },
    },
    {
      no: 'INV/ETR/2026/10/0047', rev: 0, soNo: 'SO/ETR/2026/09/0016', term: 2, date: '2026-10-28', due: '2026-11-11', status: 'Review Lead F&A', createdBy: 'U-003', bankId: 'BK-1', basis: 'BAST-2026-0015',
      history: [h('2026-10-28T09:00:00+07:00', 'U-003', 'Dibuat dari BA material tiba'), h('2026-10-29T10:00:00+07:00', 'U-003', 'Diajukan ke Lead F&A')],
    },
    {
      no: 'INV/ETR/2026/10/0042', rev: 0, soNo: 'SO/ETR/2026/10/0021', term: 1, date: '2026-10-27', due: '2026-11-10', status: 'Dikembalikan', createdBy: 'U-002', bankId: 'BK-1', returnNote: 'Nilai DPP termin 1 tidak sesuai SPK: diskon panel belum diperhitungkan. Mohon cek ulang.',
      history: [h('2026-10-27T09:00:00+07:00', 'U-002', 'Dibuat'), h('2026-10-30T10:00:00+07:00', 'U-002', 'Diajukan ke Lead F&A'), h('2026-11-02T09:12:00+07:00', 'U-004', 'Dikembalikan', 'Nilai DPP termin 1 tidak sesuai SPK: diskon panel belum diperhitungkan. Mohon cek ulang.')],
    },
    // ASUMSI: dibuat Lead F&A saat Staf Finance cuti, sebelum aturan skip otomatis diaktifkan — contoh aturan "tidak bisa approve dokumen sendiri".
    {
      no: 'INV/ETR/2026/11/0003', rev: 0, soNo: 'SO/ETR/2026/10/0019', term: 1, date: '2026-11-02', due: '2026-11-16', status: 'Review Lead F&A', createdBy: 'U-004', bankId: 'BK-1',
      history: [h('2026-11-02T08:00:00+07:00', 'U-004', 'Dibuat'), h('2026-11-02T08:40:00+07:00', 'U-004', 'Diajukan ke Lead F&A')],
    },
    { no: 'INV/ETR/2026/11/0002', rev: 0, soNo: 'SO/ETR/2026/11/0001', term: 1, date: '2026-11-02', due: '2026-11-16', status: 'Draft', createdBy: 'U-002', bankId: 'BK-1', history: [h('2026-11-02T08:35:00+07:00', 'U-002', 'Draft dibuat otomatis dari jadwal termin')] },
  ];

  /* ---------- BAST & BA material ---------- */
  const bast = [
    { id: 'BAST-2026-0005', soNo: 'SO/ETR/2026/06/0002', term: 3, docType: 'BAST', docNo: 'BAST/SEN/2026/08/02', date: '2026-08-17', receivedDate: '2026-08-18', file: 'BAST_SEN_KP.pdf', by: 'U-002', at: '2026-08-18T10:00:00+07:00', invoiceNo: 'INV/ETR/2026/08/0010' },
    { id: 'BAST-2026-0008', soNo: 'SO/ETR/2026/07/0004', term: 2, docType: 'BA Material Tiba', docNo: 'BAM/SEN/2026/08/11', date: '2026-08-28', receivedDate: '2026-08-31', file: 'BA_Material_SEN_Cikarang.pdf', by: 'U-002', at: '2026-08-31T09:00:00+07:00', invoiceNo: 'INV/ETR/2026/09/0021' },
    { id: 'BAST-2026-0009', soNo: 'SO/ETR/2026/07/0005', term: 2, docType: 'BA Material Tiba', docNo: 'BAM/RSHS/2026/09/03', date: '2026-09-08', receivedDate: '2026-09-09', file: 'BA_Material_RSHS.pdf', by: 'U-002', at: '2026-09-09T11:00:00+07:00', invoiceNo: 'INV/ETR/2026/09/0024' },
    { id: 'BAST-2026-0010', soNo: 'SO/ETR/2026/08/0009', term: 2, docType: 'BA Material Tiba', docNo: 'BAM/HSI/2026/09/02', date: '2026-09-18', receivedDate: '2026-09-21', file: 'BA_Material_HSI.pdf', by: 'U-002', at: '2026-09-21T08:30:00+07:00', invoiceNo: 'INV/ETR/2026/09/0026' },
    { id: 'BAST-2026-0011', soNo: 'SO/ETR/2026/08/0011', term: 2, docType: 'BA Material Tiba', docNo: 'BAM/MLP/2026/09/05', date: '2026-09-29', receivedDate: '2026-09-30', file: 'BA_Material_MLP.pdf', by: 'U-002', at: '2026-09-30T14:00:00+07:00', invoiceNo: 'INV/ETR/2026/10/0031' },
    { id: 'BAST-2026-0012', soNo: 'SO/ETR/2026/09/0014', term: 2, docType: 'BA Material Tiba', docNo: 'BAM/ALM/2026/10/01', date: '2026-10-26', receivedDate: '2026-10-27', file: 'BA_Material_ALM.pdf', by: 'U-002', at: '2026-10-27T09:30:00+07:00', invoiceNo: 'INV/ETR/2026/10/0050' },
    { id: 'BAST-2026-0013', soNo: 'SO/ETR/2026/08/0009', term: 3, docType: 'BAST', docNo: 'BAST/HSI/2026/10/01', date: '2026-10-26', receivedDate: '2026-10-27', file: 'BAST_HSI.pdf', by: 'U-002', at: '2026-10-27T15:00:00+07:00', invoiceNo: 'INV/ETR/2026/10/0044' },
    { id: 'BAST-2026-0014', soNo: 'SO/ETR/2026/07/0005', term: 3, docType: 'BAST', docNo: 'BAST/RSHS/2026/10/02', date: '2026-10-23', receivedDate: '2026-10-28', file: 'BAST_RSHS.pdf', by: 'U-002', at: '2026-10-28T16:00:00+07:00', invoiceNo: 'INV/ETR/2026/10/0049' },
    { id: 'BAST-2026-0015', soNo: 'SO/ETR/2026/09/0016', term: 2, docType: 'BA Material Tiba', docNo: 'BAM/GDP/2026/10/04', date: '2026-10-26', receivedDate: '2026-10-27', file: 'BA_Material_GDP.pdf', by: 'U-003', at: '2026-10-27T10:00:00+07:00', invoiceNo: 'INV/ETR/2026/10/0047' },
  ];

  /* ---------- Purchase Order vendor ---------- */
  const purchaseOrders = [
    { id: 'PO-INT/2026/0012', procNo: 'PRC/PO/2026/0088', date: '2026-07-25', vendorCode: 'VD-0001', requestedBy: 'Agung Wicaksono · Procurement', soNo: 'SO/ETR/2026/07/0004', items: [['Panel surya monocrystalline 550 Wp', 'Tier-1, 21,3% efisiensi', 820, 'pcs', 1650000, 12000000]], pph: 0, top: 'DP 30%, pelunasan 70% 30 hari setelah barang diterima', file: 'PO_PRC_0088.pdf', createdBy: 'U-002', createdAt: '2026-07-25T10:00:00+07:00' },
    { id: 'PO-INT/2026/0015', procNo: 'PRC/PO/2026/0094', date: '2026-07-29', vendorCode: 'VD-0002', requestedBy: 'Agung Wicaksono · Procurement', soNo: 'SO/ETR/2026/07/0004', items: [['Inverter on-grid 110 kW', '3 phase, IP66', 4, 'unit', 118000000, 0]], pph: 0, top: 'DP 50%, pelunasan net 30 hari', file: 'PO_PRC_0094.pdf', createdBy: 'U-002', createdAt: '2026-07-29T13:00:00+07:00' },
    { id: 'PO-INT/2026/0018', procNo: 'PRC/PO/2026/0102', date: '2026-08-05', vendorCode: 'VD-0004', requestedBy: 'Taufik Hidayat · Project', soNo: 'SO/ETR/2026/07/0005', items: [['Jasa instalasi PLTS 150 kWp', 'Termasuk testing & commissioning', 1, 'lot', 98000000, 0]], pph: 2, top: 'Net 30 hari setelah BAST', file: 'PO_PRC_0102.pdf', createdBy: 'U-002', createdAt: '2026-08-05T09:00:00+07:00' },
    { id: 'PO-INT/2026/0021', procNo: 'PRC/PO/2026/0117', date: '2026-08-26', vendorCode: 'VD-0003', requestedBy: 'Agung Wicaksono · Procurement', soNo: 'SO/ETR/2026/08/0011', items: [['Kabel DC 6 mm²', 'Merah & hitam, TÜV', 4000, 'meter', 14500, 0], ['Kabel AC NYY 4×95 mm²', '', 350, 'meter', 410000, 3500000]], pph: 0, top: 'Net 14 hari', file: 'PO_PRC_0117.pdf', createdBy: 'U-002', createdAt: '2026-08-26T11:00:00+07:00' },
    { id: 'PO-INT/2026/0024', procNo: 'PRC/PO/2026/0131', date: '2026-09-15', vendorCode: 'VD-0005', requestedBy: 'Agung Wicaksono · Procurement', soNo: 'SO/ETR/2026/09/0014', items: [['Rangka mounting aluminium atap metal', 'Lengkap clamp & rail', 455, 'set', 520000, 0]], pph: 0, top: 'DP 40%, pelunasan 60% net 30', file: 'PO_PRC_0131.pdf', createdBy: 'U-003', createdAt: '2026-09-15T10:00:00+07:00' },
    { id: 'PO-INT/2026/0027', procNo: 'PRC/PO/2026/0146', date: '2026-10-05', vendorCode: 'VD-0001', requestedBy: 'Agung Wicaksono · Procurement', soNo: 'SO/ETR/2026/09/0016', items: [['Panel surya monocrystalline 550 Wp', 'Tier-1, 21,3% efisiensi', 364, 'pcs', 1650000, 0]], pph: 0, top: 'Net 30 hari setelah barang diterima', file: 'PO_PRC_0146.pdf', createdBy: 'U-003', createdAt: '2026-10-05T14:00:00+07:00' },
  ];
  // dpp/ppn diisi; total = dpp + ppn
  const vendorInvoices = [
    { no: 'PSM/INV/2026/0412', vendorCode: 'VD-0001', poId: 'PO-INT/2026/0012', term: 'DP 30%', date: '2026-07-28', due: '2026-08-04', dpp: 402300000, ppn: 44253000, taxNo: '010.000-26.12345678', file: 'INV_PSM_0412.pdf', by: 'U-002', at: '2026-07-28T10:00:00+07:00' },
    { no: 'PSM/INV/2026/0455', vendorCode: 'VD-0001', poId: 'PO-INT/2026/0012', term: 'Pelunasan 70%', date: '2026-09-02', due: '2026-10-02', dpp: 938700000, ppn: 103257000, taxNo: '010.000-26.12345912', file: 'INV_PSM_0455.pdf', by: 'U-002', at: '2026-09-02T10:00:00+07:00' },
    { no: 'DII-2026-0931', vendorCode: 'VD-0002', poId: 'PO-INT/2026/0015', term: 'DP 50%', date: '2026-08-01', due: '2026-08-08', dpp: 236000000, ppn: 25960000, taxNo: '', file: 'INV_DII_0931.pdf', by: 'U-002', at: '2026-08-01T09:00:00+07:00' },
    { no: 'KPN/26/10/077', vendorCode: 'VD-0003', poId: 'PO-INT/2026/0021', term: 'Penuh', date: '2026-09-10', due: '2026-09-24', dpp: 198000000, ppn: 21780000, taxNo: '010.000-26.22340011', file: 'INV_KPN_077.pdf', by: 'U-002', at: '2026-09-10T11:00:00+07:00' },
    { no: 'RBS-INV-0218', vendorCode: 'VD-0005', poId: 'PO-INT/2026/0024', term: 'DP 40%', date: '2026-09-20', due: '2026-09-30', dpp: 98000000, ppn: 10780000, taxNo: '', file: 'INV_RBS_0218.pdf', by: 'U-003', at: '2026-09-20T13:00:00+07:00', mismatch: 'Nominal DP 40% seharusnya Rp 94.640.000 (DPP); selisih Rp 3.360.000.' },
  ];
  const vendorPayments = [
    { id: 'PAY-V-0031', viNo: 'PSM/INV/2026/0412', date: '2026-08-03', amount: 446553000, account: 'Bank Mandiri 125-00-1188990-1 a.n. PT Panel Surya Mandiri', proof: 'TF_PSM_0803.pdf', note: '', by: 'U-002', at: '2026-08-03T15:00:00+07:00' },
    { id: 'PAY-V-0034', viNo: 'DII-2026-0931', date: '2026-08-07', amount: 261960000, account: 'BCA 572-0391-882 a.n. PT Daya Inverter Indonesia', proof: 'TF_DII_0807.pdf', note: '', by: 'U-002', at: '2026-08-07T10:00:00+07:00' },
    { id: 'PAY-V-0040', viNo: 'KPN/26/10/077', date: '2026-09-23', amount: 219780000, account: 'BNI 0812-334-561 a.n. PT Kabel Prima Nusantara', proof: 'TF_KPN_0923.pdf', note: 'Lunas', by: 'U-002', at: '2026-09-23T14:00:00+07:00' },
    { id: 'PAY-V-0044', viNo: 'PSM/INV/2026/0455', date: '2026-10-01', amount: 600000000, account: 'Bank Mandiri 125-00-1188990-1 a.n. PT Panel Surya Mandiri', proof: 'TF_PSM_1001.pdf', note: 'Pembayaran tahap 1 dari pelunasan', by: 'U-002', at: '2026-10-01T16:00:00+07:00' },
  ];

  /* ---------- Log history (read-only) ---------- */
  const L = (at, userId, action, docNo, module, reason, changes) => ({ at, userId, action, docNo, module, reason: reason || '', changes: changes || [] });
  const logs = [
    L('2026-11-02T09:12:00+07:00', 'U-004', 'Mengembalikan invoice', 'INV/ETR/2026/10/0042', 'Invoice', 'Nilai DPP termin 1 tidak sesuai SPK: diskon panel belum diperhitungkan.', [{ field: 'Status', before: 'Review Lead F&A', after: 'Dikembalikan' }]),
    L('2026-11-02T08:40:00+07:00', 'U-004', 'Mengajukan invoice', 'INV/ETR/2026/11/0003', 'Invoice', '', [{ field: 'Status', before: 'Draft', after: 'Review Lead F&A' }]),
    L('2026-11-02T08:35:00+07:00', 'U-002', 'Membuat draft invoice', 'INV/ETR/2026/11/0002', 'Invoice'),
    L('2026-11-02T08:30:00+07:00', 'U-002', 'Membuat Sales Order', 'SO/ETR/2026/11/0001', 'Sales Order'),
    L('2026-11-02T08:15:00+07:00', 'U-004', 'Login', '—', 'Akun'),
    L('2026-11-02T08:02:00+07:00', 'U-001', 'Login', '—', 'Akun'),
    L('2026-11-01T15:20:00+07:00', 'U-005', 'Menyetujui invoice', 'INV/ETR/2026/10/0050', 'Approval', '', [{ field: 'Status', before: 'Review Manager', after: 'Review Direktur' }]),
    L('2026-10-30T16:05:00+07:00', 'U-000', 'Eskalasi piutang otomatis', 'INV/ETR/2026/09/0021', 'Piutang', 'Belum dibayar H+30 hari kerja sejak pemberitahuan terakhir.', [{ field: 'Status penagihan', before: 'Overdue', after: 'Dieskalasi' }]),
    L('2026-10-30T15:40:00+07:00', 'U-005', 'Menyetujui invoice', 'INV/ETR/2026/10/0044', 'Approval', '', [{ field: 'Status', before: 'Review Manager', after: 'Disetujui' }]),
    L('2026-10-30T11:20:00+07:00', 'U-004', 'Menyetujui invoice', 'INV/ETR/2026/10/0049', 'Approval', '', [{ field: 'Status', before: 'Review Lead F&A', after: 'Review Manager' }]),
    L('2026-10-29T10:00:00+07:00', 'U-003', 'Mengajukan invoice', 'INV/ETR/2026/10/0047', 'Invoice', '', [{ field: 'Status', before: 'Draft', after: 'Review Lead F&A' }]),
    L('2026-10-28T16:00:00+07:00', 'U-002', 'Upload BAST', 'BAST/RSHS/2026/10/02', 'BAST', 'Diterima H+3 dari Lead Project.'),
    L('2026-10-28T13:00:00+07:00', 'U-002', 'Membuat Sales Order', 'SO/ETR/2026/10/0022', 'Sales Order'),
    L('2026-10-27T11:00:00+07:00', 'U-001', 'Mengubah budget threshold', 'Invoice', 'Approval & SLA', 'Penyesuaian kebijakan direksi Q4.', [{ field: 'Batas nominal', before: 'Rp 750.000.000', after: 'Rp 500.000.000' }]),
    L('2026-10-26T09:30:00+07:00', 'U-001', 'Menambah hari libur', '24/12/2026', 'Approval & SLA', '', [{ field: 'Hari libur', before: '—', after: '24/12/2026 Cuti bersama Natal' }]),
    L('2026-10-22T10:00:00+07:00', 'U-002', 'Mencatat pemberitahuan ulang', 'INV/ETR/2026/10/0031', 'Piutang'),
    L('2026-10-20T14:10:00+07:00', 'U-001', 'Mengubah data client', 'CL-0007', 'Master Data', 'Client menghentikan kerja sama baru.', [{ field: 'Status', before: 'Aktif', after: 'Nonaktif' }]),
    L('2026-10-15T10:00:00+07:00', 'U-001', 'Mengubah data client', 'CL-0009', 'Master Data', '', [{ field: 'Nama PIC', before: 'Hadi Gunawan, S.T.', after: 'Hadi Gunawan' }]),
    L('2026-10-14T09:00:00+07:00', 'U-001', 'Menambah user', 'fajar.nugroho@etrama.co.id', 'User Management', '', [{ field: 'Role', before: '—', after: 'Admin (Finance) · Staff' }]),
    L('2026-10-07T10:00:00+07:00', 'U-002', 'Mengubah status piutang', 'INV/ETR/2026/09/0026', 'Piutang', 'Klien meminta penundaan sampai renovasi lobi selesai.', [{ field: 'Status penagihan', before: 'Overdue', after: 'On Hold' }]),
    L('2026-10-05T10:00:00+07:00', 'U-002', 'Revisi invoice dari klien', 'INV/ETR/2026/10/0031', 'Invoice', 'Nama proyek di invoice harus sesuai PO.', [{ field: 'Versi', before: 'Rev.0', after: 'Rev.1' }]),
    L('2026-10-02T09:00:00+07:00', 'U-005', 'Mengembalikan invoice', 'INV/ETR/2026/10/0031', 'Invoice', 'Lampiran BA material tiba belum ada tanda tangan klien.', [{ field: 'Status', before: 'Review Manager', after: 'Dikembalikan' }]),
    L('2026-10-01T16:00:00+07:00', 'U-002', 'Mencatat pembayaran vendor', 'PSM/INV/2026/0455', 'Pembayaran Vendor', '', [{ field: 'Dibayar', before: 'Rp 0', after: 'Rp 600.000.000' }]),
    L('2026-09-01T11:00:00+07:00', 'U-001', 'Menonaktifkan user', 'yusuf.pratama@etrama.co.id', 'User Management', 'Resign per 31/08/2026.', [{ field: 'Status', before: 'Aktif', after: 'Nonaktif' }]),
    L('2026-08-20T10:00:00+07:00', 'U-001', 'Mengubah rekening default', 'BK-1', 'Pengaturan Dokumen', '', [{ field: 'Rekening default', before: 'BCA 588-0991-234', after: 'Bank Mandiri 124-00-0987654-3' }]),
  ];

  /* ---------- Notifikasi (lonceng header) ---------- */
  const notifications = [
    { id: 'N-101', type: 'dikembalikan', roles: ['staf'], title: 'Invoice dikembalikan oleh Lead F&A', docNo: 'INV/ETR/2026/10/0042', time: '2026-11-02T09:12:00+07:00', read: false, href: 'finance/invoice-detail.html?no=INV/ETR/2026/10/0042' },
    { id: 'N-102', type: 'reminder', roles: ['staf', 'lead'], title: 'Reminder H-7 jatuh tempo 09/11/2026', docNo: 'INV/ETR/2026/10/0035', time: '2026-11-02T07:00:00+07:00', read: false, href: 'finance/piutang-detail.html?no=INV/ETR/2026/10/0035' },
    { id: 'N-103', type: 'sla', roles: ['staf', 'lead'], title: 'Lewat SLA pembuatan invoice (H+3)', docNo: 'SO/ETR/2026/10/0018', time: '2026-11-02T07:00:00+07:00', read: false, href: 'finance/sales-order-detail.html?no=SO/ETR/2026/10/0018' },
    { id: 'N-104', type: 'reminder', roles: ['staf', 'lead'], title: 'Reminder H-14 jatuh tempo 16/11/2026', docNo: 'INV/ETR/2026/10/0039', time: '2026-11-02T07:00:00+07:00', read: true, href: 'finance/piutang-detail.html?no=INV/ETR/2026/10/0039' },
    { id: 'N-105', type: 'review', roles: ['lead'], title: 'Invoice menunggu review Anda', docNo: 'INV/ETR/2026/11/0003', time: '2026-11-02T08:40:00+07:00', read: false, href: 'finance/approval.html?no=INV/ETR/2026/11/0003' },
    { id: 'N-106', type: 'sla', roles: ['lead', 'mgr_ops'], title: 'Lewat SLA review Lead F&A (H+1)', docNo: 'INV/ETR/2026/10/0047', time: '2026-11-02T07:00:00+07:00', read: false, href: 'finance/approval.html?no=INV/ETR/2026/10/0047' },
    { id: 'N-107', type: 'eskalasi', roles: ['lead', 'mgr_ops', 'direktur'], title: 'Piutang dieskalasi (H+30 sejak pemberitahuan terakhir)', docNo: 'INV/ETR/2026/09/0021', time: '2026-10-30T16:05:00+07:00', read: false, href: 'finance/piutang-detail.html?no=INV/ETR/2026/09/0021' },
    { id: 'N-108', type: 'review', roles: ['mgr_ops'], title: 'Invoice menunggu review Manager', docNo: 'INV/ETR/2026/10/0049', time: '2026-10-30T11:20:00+07:00', read: false, href: 'finance/approval.html?no=INV/ETR/2026/10/0049' },
    { id: 'N-109', type: 'review', roles: ['direktur'], title: 'Invoice di atas threshold menunggu approval Direktur', docNo: 'INV/ETR/2026/10/0050', time: '2026-11-01T15:20:00+07:00', read: false, href: 'finance/approval.html?no=INV/ETR/2026/10/0050' },
    { id: 'N-110', type: 'dikembalikan', roles: ['staf'], title: 'Invoice dikembalikan oleh Manager', docNo: 'INV/ETR/2026/10/0031', time: '2026-10-02T09:00:00+07:00', read: true, href: 'finance/invoice-detail.html?no=INV/ETR/2026/10/0031' },
    { id: 'N-111', type: 'sla', roles: ['staf'], title: 'Batas SLA kirim invoice hari ini (H+1)', docNo: 'INV/ETR/2026/10/0044', time: '2026-11-02T07:00:00+07:00', read: false, href: 'finance/invoice-detail.html?no=INV/ETR/2026/10/0044' },
  ];

  /* ---------- Setting sistem (diatur Super Admin) ---------- */
  const settings = {
    // ASUMSI: nama badan hukum, alamat, dan NPWP ETrama belum diberikan — nilai di bawah adalah placeholder.
    company: { name: 'PT ETrama Energi Nusantara', address: 'Gedung Graha Surya Lt. 7, Jl. HR Rasuna Said Kav. 5, Jakarta Selatan 12940', npwp: '01.234.567.8-012.000', phone: '(021) 5290 1188', email: 'finance@etrama.co.id' },
    ppnRate: 11, ppnFrom: '2025-01-01',
    resetLinkMinutes: 30,
    banks: [
      { id: 'BK-1', bank: 'Bank Mandiri', account: '124-00-0987654-3', holder: 'PT ETrama Energi Nusantara', isDefault: true },
      { id: 'BK-2', bank: 'BCA', account: '588-0991-234', holder: 'PT ETrama Energi Nusantara', isDefault: false },
      { id: 'BK-3', bank: 'BNI', account: '0921-776-450', holder: 'PT ETrama Energi Nusantara', isDefault: false },
    ],
    stamp: true,
    signers: {
      invoice: { name: 'Arief Rahman Hakim', title: 'Direktur' },
      transmittal: { name: 'Hendra Wijaya', title: 'Lead Finance & Accounting' },
    },
    footer: 'Pembayaran dianggap sah setelah dana efektif diterima di rekening PT ETrama Energi Nusantara.',
    paymentTerms: 'Mohon cantumkan nomor invoice pada berita transfer. Keterlambatan pembayaran mengikuti ketentuan kontrak.',
    numbering: {
      so: 'SO/ETR/{YYYY}/{MM}/{####}', invoice: 'INV/ETR/{YYYY}/{MM}/{####}', client: 'CL-{####}', vendor: 'VD-{####}', po: 'PO-INT/{YYYY}/{####}', revision: 'Rev.{n}',
    },
    approval: {
      autoSkip: true,
      docs: [
        { key: 'so', label: 'Sales Order (SPK / PO Klien / Kontrak)', basis: 'SOP III.1 — dokumen sudah disetujui klien dan direview Staf BD', layers: [{ key: 'lead', label: 'Lead Finance & Accounting', active: false }], allowNone: true },
        {
          key: 'invoice', label: 'Invoice', basis: 'SOP III.1', allowNone: false,
          layers: [{ key: 'lead', label: 'Lead Finance & Accounting', status: 'Review Lead F&A', active: true }, { key: 'mgr_ops', label: 'Manager', status: 'Review Manager', active: true }],
          threshold: { enabled: true, tiers: [{ min: 500000000, approver: 'direktur' }] },
        },
        { key: 'revisi', label: 'Revisi invoice dari klien', basis: 'SOP Ketentuan Khusus A No. 7', followsInvoice: true, layers: [] },
        { key: 'vendorPay', label: 'Catatan pembayaran vendor', basis: 'Dicatat Staf Finance setelah transfer', layers: [{ key: 'mgr_ops', label: 'Manager', active: false }], allowNone: true },
      ],
    },
    sla: [
      { key: 'kirimDokumen', step: 'Mengirim SPK / PO Klien / Kontrak + master data klien', actor: 'Staf Business Development', days: 1, sign: '+', basis: 'setelah disetujui klien' },
      { key: 'buatInvoice', step: 'Membuat invoice', actor: 'Staf Finance', days: 3, sign: '+', basis: 'setelah dokumen lengkap' },
      { key: 'reviewLead', step: 'Review invoice', actor: 'Lead Finance & Accounting', days: 1, sign: '+', basis: 'setelah diterima' },
      { key: 'reviewMgr', step: 'Review invoice', actor: 'Manager', days: 1, sign: '+', basis: 'setelah diterima' },
      { key: 'infoTidakSesuai', step: 'Menginformasikan ketidaksesuaian invoice', actor: 'Lead F&A / Manager', days: 0, sign: '+', basis: 'hari yang sama' },
      { key: 'kirimInvoice', step: 'Mengirim invoice + form transmittal ke klien', actor: 'Staf Finance', days: 1, sign: '+', basis: 'setelah invoice disetujui' },
      { key: 'kirimBast', step: 'Mengirim BAST yang disetujui klien', actor: 'Lead Project', days: 1, sign: '+', basis: 'setelah BAST ditandatangani' },
      { key: 'eskalasi', step: 'Eskalasi piutang ke Manager', actor: 'Staf Finance', days: 30, sign: '+', basis: 'dari pemberitahuan terakhir' },
      { key: 'catatBayar', step: 'Mencatat penerimaan pembayaran', actor: 'Staf Finance', days: 1, sign: '+', basis: 'setelah informasi pembayaran' },
    ],
    reminders: [14, 7],
    holidays: [
      { date: '2026-01-01', name: 'Tahun Baru 2026 Masehi' },
      { date: '2026-03-20', name: 'Idul Fitri 1447 H' },
      { date: '2026-03-23', name: 'Cuti bersama Idul Fitri' },
      { date: '2026-04-03', name: 'Wafat Yesus Kristus' },
      { date: '2026-05-01', name: 'Hari Buruh Internasional' },
      { date: '2026-05-14', name: 'Kenaikan Yesus Kristus' },
      { date: '2026-05-27', name: 'Idul Adha 1447 H' },
      { date: '2026-06-01', name: 'Hari Lahir Pancasila' },
      { date: '2026-08-17', name: 'Hari Kemerdekaan RI' },
      { date: '2026-12-24', name: 'Cuti bersama Natal' },
      { date: '2026-12-25', name: 'Hari Raya Natal' },
      { date: '2027-01-01', name: 'Tahun Baru 2027 Masehi' },
    ],
  };

  return {
    today, roles, financeRoleOrder, levels, permissions, permissionLabels, rolesList, menuLabels, MENU_KEYS, ACTIONS,
    users, clients, vendors, stafBD, salesOrders, invoices, bast, purchaseOrders, vendorInvoices, vendorPayments,
    logs, notifications, settings,
  };
})();
