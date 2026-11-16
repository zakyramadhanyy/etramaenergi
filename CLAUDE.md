# CLAUDE.md — ETrama Finance Module 1.0 & Super Admin (UI Only)

Dokumen ini adalah panduan untuk Claude Code saat membangun **antarmuka (UI) saja** dari sistem ETrama berdasarkan PRD 1.0 (Chameleon / PT. Anak Muda Digital, 29/10/2026).

## 1. Ringkasan Proyek

ETrama adalah perusahaan solar panel. Finance Module 1.0 mendigitalkan SOP 01.001-00 "Pembuatan & Penagihan Invoice": input Sales Order (SPK / PO Klien / Kontrak) → AI baca Term of Payment (ToP) → invoice per termin otomatis → review dua lapis → kirim ke klien + form transmittal → piutang, reminder, eskalasi → catat pembayaran. Ada juga sisi vendor: PO → invoice vendor → catatan pembayaran vendor. **Super Admin** adalah core konfigurasi (master data, user, role, approval, SLA, pengaturan dokumen, log history).

Platform: **web app**, bahasa UI **Bahasa Indonesia**.

## 2. Ruang Lingkup Pekerjaan Ini

- **Hanya UI/front-end statis.** Tidak ada backend, database, auth sungguhan, atau AI sungguhan.
- Semua data adalah **mock data** (JS array / JSON di file `assets/js/mock-data.js`).
- Interaksi cukup disimulasikan dengan JS ringan (buka/tutup modal, tab, filter tabel, hitung total, toggle). Jangan bangun logika server.
- Tahap PRD yang dikerjakan: **UI/UX (tahap 2)** — wireframe di PRD §3.8 belum ada, jadi layout mengikuti sitemap & user story di bawah.

## 3. Tech Stack

| Aspek | Pilihan |
|---|---|
| Markup | HTML5, satu file per halaman |
| Styling | **Tailwind CSS via CDN** (`<script src="https://cdn.tailwindcss.com">`) + `assets/css/custom.css` untuk hal kecil yang tidak praktis di utility class |
| Script | Vanilla JS (tanpa framework). Alpine.js via CDN boleh untuk dropdown/modal/tab |
| Chart | Chart.js via CDN (hanya untuk Report) |
| Ikon | Lucide atau Heroicons (inline SVG / CDN) |
| Font | Inter (Google Fonts) |
| Preview | `python3 -m http.server 8000` dari root proyek |

Jangan pakai build step (npm/webpack) kecuali diminta. Jangan tambah library lain tanpa alasan kuat.

## 4. Struktur Folder

```
etrama-ui/
├── CLAUDE.md
├── index.html                  # pilih portal: Super Admin / Finance
├── assets/
│   ├── css/custom.css
│   ├── js/
│   │   ├── mock-data.js        # semua data dummy
│   │   ├── layout.js           # inject sidebar + header (komponen bersama)
│   │   └── ui.js               # modal, tab, toast, format Rupiah/tanggal
│   └── img/                    # logo, stempel, tanda tangan (placeholder PNG)
├── auth/
│   ├── login.html
│   ├── lupa-password.html
│   ├── reset-password.html
│   └── ganti-password.html     # login pertama (password sementara)
├── super-admin/
│   ├── dashboard.html
│   ├── master-client.html
│   ├── master-vendor.html
│   ├── master-staf-bd.html
│   ├── user-management.html
│   ├── role-management.html
│   ├── hierarki-role.html
│   ├── approval-setting.html   # layer approval + budget threshold
│   ├── sla-reminder.html       # SLA, reminder, hari libur
│   ├── pengaturan-dokumen.html
│   ├── log-history.html
│   └── profil.html
└── finance/
    ├── dashboard.html
    ├── sales-order-list.html
    ├── sales-order-form.html   # + panel AI baca ToP
    ├── sales-order-detail.html # tab: Ringkasan, ToP, Invoice, Dokumen, Riwayat
    ├── bast.html
    ├── invoice-list.html
    ├── invoice-detail.html     # preview PDF, status stepper, revisi, transmittal
    ├── piutang.html            # laporan umur piutang
    ├── piutang-detail.html     # reminder, On Hold, eskalasi, catat bayar
    ├── approval.html           # menunggu persetujuan
    ├── notifikasi.html
    ├── report-sales-order.html
    ├── report-piutang.html
    ├── po-list.html
    ├── po-form.html
    ├── invoice-vendor.html
    ├── pembayaran-vendor.html  # catat + riwayat
    └── profil.html
```

## 5. Sitemap Menu

**Super Admin** (sidebar): Master Data (Client, Vendor, Staf BD) · User Management · Role Management · Hierarki Role · Approval & SLA (Layer approval, Budget threshold, SLA & reminder, Hari libur) · Pengaturan Dokumen (Rekening bank, Stempel & TTD, Kop & alamat, Format nomor) · Log History · Akun (Login, Profil, Logout).

**Finance** (sidebar): Sales Order · BAST · Invoice · Piutang · Purchase Order · Pembayaran Vendor · Approval · Report · Akun. Notifikasi lewat **ikon lonceng di header** (badge jumlah belum dibaca), bukan menu sidebar.

Sidebar Finance harus bisa menyembunyikan menu sesuai role (lihat §7) — cukup disimulasikan dengan switcher role di mock (mis. dropdown "Lihat sebagai: Staf Finance / Lead F&A / Manager / Direktur").

## 6. Aturan Domain yang Harus Tercermin di UI

### Format & lokalisasi
- Mata uang **Rupiah**: `Rp 1.250.000.000` (titik ribuan, tanpa desimal).
- Tanggal **DD/MM/YYYY**, zona waktu **WIB**. Jam: `14:30 WIB`.
- Semua label, tombol, pesan error, dan placeholder berbahasa Indonesia.

### Penomoran (usulan PRD)
- Client `CL-0001` · Vendor `VD-0001` (auto, read-only di form)
- Sales Order `SO/ETR/YYYY/MM/0001`
- Invoice `INV/ETR/YYYY/MM/0001`; revisi `Rev.1`, `Rev.2`, riwayat versi tetap tersimpan

### Status yang dipakai (jadikan badge berwarna konsisten)
- **Invoice:** Draft → Review Lead F&A → Review Manager Operational → Disetujui · Dikembalikan · Terkirim
- **Piutang:** Belum Jatuh Tempo · Overdue · On Hold · Dieskalasi · Partially Paid · Paid
- **PO vendor:** Open → Partially Invoiced → Fully Invoiced → Closed
- **Invoice vendor / pembayaran:** Partially Paid · Paid
- **Master data:** Aktif / Nonaktif (data nonaktif tidak muncul di dropdown transaksi baru; data terpakai tidak bisa dihapus, hanya dinonaktifkan)
- **Umur piutang:** Belum jatuh tempo, 1–30, 31–60, 61–90, >90 hari

### SLA (hari kerja) — tampilkan sebagai countdown / badge, merah jika lewat
Buat invoice H+3 · Review Lead F&A H+1 · Review Manager Ops H+1 · Info ketidaksesuaian H+0 · Kirim invoice H+1 · Reminder H-14 & H-7 · Eskalasi piutang H+30 · Catat pembayaran H+1 · Dokumen dari BD / BAST dari Lead Project H+1.

### Aturan khusus yang perlu terlihat di UI
- **Draft invoice** → PDF preview ber-watermark **"DRAFT"**, tanpa stempel & TTD. Stempel + TTD baru muncul setelah status Disetujui.
- **Kembalikan** invoice / **On Hold** / reject / cancel / revisi → **catatan wajib** (textarea required, tombol disabled sampai terisi).
- Reviewer **tidak bisa approve dokumen buatannya sendiri** (tombol Approve disabled + tooltip).
- Rekening di invoice: Staf Finance **hanya memilih dari daftar** (dropdown), tidak bisa mengetik nomor bebas.
- **Log history read-only**: tidak ada tombol edit/hapus sama sekali, bahkan untuk Super Admin.
- Budget threshold: invoice ≤ batas selesai di Manager Operational; > batas lanjut ke Direktur (contoh Rp 500.000.000). Tier bisa ditambah (UI repeater).
- Minimal satu layer approval invoice harus aktif (toggle terakhir tidak bisa dimatikan).
- Peringatan duplikat nama saat tambah client/vendor (inline warning kuning).
- Banner/penanda jika dokumen SO / BAST diterima > H+1 hari kerja.

### Sales Order + AI baca ToP (layar paling kompleks)
1. Form header: jenis dokumen (SPK / PO Klien / Kontrak Kerja), no. dokumen klien, tgl disetujui klien, tgl diterima dari BD, No. SO internal (auto), Client (dropdown, PIC auto-isi), Staf BD (dropdown), project/reference, lokasi instalasi, kapasitas kWp (opsional), upload dokumen (PDF/JPG/PNG/DOCX/XLSX, maks 10 MB), upload dokumen jaminan Bank Garansi/Asuransi/EAR (opsional).
2. Tabel item: deskripsi, qty, satuan, harga satuan, diskon, subtotal otomatis. Ringkasan DPP, PPN (tarif dari setting), Nilai Kontrak.
3. Panel **ToP hasil AI**: tabel termin (termin, %, pemicu tanggal/milestone, jatuh tempo, retensi) yang **bisa diedit**, dengan **potongan teks asli di samping tiap field**; field keyakinan rendah ditandai **kuning**; tombol **Konfirmasi ToP** wajib; fallback **form ToP manual** bila AI gagal.
4. Validasi tampil: submit disabled jika Σ% termin ≠ 100% atau Σ nominal ≠ Total SO. Tampilkan indikator "Total termin: 90% ⚠".
5. Teks pada UI harus jelas bahwa hasil AI **wajib direview manusia**.

### Notifikasi
Dropdown lonceng: judul, no. dokumen, waktu; klik → buka dokumen & tandai dibaca; tombol "Tandai semua dibaca"; halaman riwayat penuh. Jenis: menunggu review/approval, invoice dikembalikan, reminder H-14/H-7, lewat SLA, eskalasi piutang.

### Report
- **Sales Order:** jumlah SO, total nilai, rata-rata per SO, grafik tren bulanan, tabel detail + status penagihan; filter rentang tanggal/bulan/tahun, client, sales person, status SO; toggle "sertakan SO menunggu approval"; tombol Export Excel & PDF.
- **Piutang:** total piutang & overdue, per periode umur, per client, daftar On Hold & Dieskalasi; filter periode & client; export Excel & PDF.

## 7. Role & Permission (untuk switcher role / visibilitas tombol)

| Fitur | Super Admin | Staf Finance | Lead F&A | Manager | Direktur |
|---|---|---|---|---|---|
| Master data client/vendor/Staf BD | Kelola | Lihat | Lihat | Lihat | Lihat |
| User, role & SLA setting | Kelola | — | — | — | — |
| Pengaturan dokumen | Kelola | — | — | — | — |
| Input SO & BAST | — | Buat | Lihat | Lihat | Lihat |
| Buat, kirim, revisi invoice | — | Buat | Lihat | Lihat | Lihat |
| Review/approve invoice | — | — | Layer 1 | Layer 2 (Ops) | Opsional (threshold) |
| Penagihan, On Hold, catat bayar | — | Buat | Lihat | Lihat | Lihat |
| Verifikasi laporan piutang | — | — | Verifikasi | Lihat | Lihat |
| Keputusan piutang bermasalah | — | — | Putuskan | Lihat (Finance) | Putuskan |
| PO, invoice & catatan bayar vendor | — | Buat | Lihat | Lihat | Lihat |
| Report SO & piutang | Lihat | Lihat | Lihat | Lihat | Lihat |
| Log history | Lihat semua | Milik sendiri | Lihat tim | Lihat tim | Lihat semua |

Super Admin **tidak ikut approve** transaksi (pemisahan tugas). Custom role (mis. "Finance Viewer") dibuat Super Admin; permission per menu: lihat, buat, edit, hapus, approve, export (matriks checkbox di Role Management).

## 8. Detail Per Modul Super Admin

- **Login / Lupa password / Reset:** pesan error persis — `Email belum terdaftar` dan `Email atau password salah`. Reset: password baru + konfirmasi; link sekali pakai dan kedaluwarsa. Login pertama → halaman ganti password wajib.
- **Master Client / Vendor:** field v1.0 hanya Kode (auto), Nama perusahaan (wajib), Nama PIC (wajib), Status. Kontak PIC/alamat/NPWP/rekening = fase berikutnya (jangan tampilkan, atau tampilkan disabled berlabel "Fase berikutnya"). Edit menampilkan histori nilai sebelum/sesudah ke log.
- **Master Staf BD:** hanya Nama + Status.
- **User Management:** nama lengkap, email (unik), role, level hierarki (Staff / Manager / Direktur; Lead sebagai level di matriks), atasan langsung. Aksi: edit, nonaktifkan, reset password, paksa logout. Info: password sementara dikirim via email.
- **Role Management:** daftar role, buat role (nama + deskripsi), matriks permission per menu. Role bawaan (Super Admin, Admin) tidak bisa dihapus. Perubahan berlaku saat login berikutnya.
- **Hierarki Role:** Staff → Lead → Manager → Direktur, relasi atasan langsung menentukan reviewer/approver.
- **Approval Setting:** per jenis dokumen (Sales Order: tanpa approval; Invoice: Lead F&A → Manager Operational; Catatan bayar vendor: tanpa approval), toggle aktif/skip per layer, budget threshold opsional + nominal + tambah tier, aturan skip otomatis jika pembuat sama level dengan layer.
- **SLA & Reminder:** tabel nilai SLA editable, jadwal reminder, **daftar hari libur** (tambah/hapus tanggal), SLA dihitung Senin–Jumat.
- **Pengaturan Dokumen:** nama/alamat/NPWP/logo-kop; rekening bank (multi, satu default); upload stempel (PNG transparan); penandatangan (TTD, nama, jabatan) default untuk invoice & transmittal; catatan kaki & syarat pembayaran; format penomoran; **preview invoice live**. Catatan: "Perubahan hanya berlaku untuk dokumen baru."
- **Log History:** kolom Siapa (nama, role, level) · Apa (aksi + no. dokumen) · Kapan (WIB) · Di mana (modul) · Kenapa · Nilai sebelum/sesudah. Filter user/modul/aksi/periode, export Excel. Setiap dokumen punya tab **Riwayat** berisi timeline.

## 9. Panduan Desain

- **Gaya:** dashboard admin profesional, bersih, padat informasi (aplikasi keuangan). Sidebar kiri tetap, header atas (judul halaman/breadcrumb, lonceng notifikasi, menu profil), konten di tengah dengan lebar maks ±1440px.
- **Warna (sesuai diagram sitemap di PRD):** navy sebagai warna utama (`#0B2559` header tabel/sidebar aktif), biru muda sebagai latar aksen (`#E8F0FE`), biru interaktif (`#2563EB`). Definisikan di `tailwind.config` sebagai `brand.navy`, `brand.blue`, `brand.soft`.
- **Semantik status:** hijau = Disetujui/Paid/Aktif, kuning = menunggu/low-confidence AI/On Hold, merah = Overdue/lewat SLA/Dikembalikan/error, abu = Draft/Nonaktif, biru = Review/Terkirim, oranye = Dieskalasi.
- **Komponen yang dipakai berulang** (buat sebagai pola konsisten): tabel dengan filter + search + pagination, badge status, modal konfirmasi, drawer detail, stepper status invoice/approval, timeline riwayat, upload dropzone, empty state, toast, tooltip untuk tombol disabled, countdown SLA.
- **Tabel uang:** angka rata kanan, `tabular-nums`.
- **Responsif:** prioritas desktop (≥1024px); tablet harus tetap usable; sidebar collapse di layar kecil.
- **Aksesibilitas:** kontras cukup, label pada setiap input, fokus terlihat, status tidak hanya dibedakan lewat warna (sertakan teks/ikon).

## 10. Mock Data (isi realistis, bukan lorem ipsum)

- Client: PT Surya Energi Nusantara, PT Mitra Logistik Prima, RS Harapan Sehat, Hotel Samudra Indah, dll. (PIC bernama Indonesia).
- Vendor: pemasok panel surya, inverter, kabel, jasa instalasi.
- Staf BD, Staf Finance, Lead F&A, Manager Operational, Manager Finance, Direktur: nama fiktif.
- Proyek: instalasi PLTS atap (kapasitas kWp 50–500), nilai kontrak Rp 150 juta – 5 miliar.
- ToP contoh: **DP 30%, 60% setelah material tiba, 10% setelah BAST**.
- Sertakan variasi status agar semua badge & kondisi SLA merah/kuning/hijau terlihat di layar.
- Jangan gunakan data atau nama perusahaan nyata.

## 11. Di Luar Ruang Lingkup (jangan dibuat)

Modul Procurement/CRM/Cost Control/Engineering/HR/Management Dashboard · akses untuk Staf BD & Lead Project (di v1.0 mereka kirim via WA Grup & email) · jurnal akuntansi · transfer bank otomatis · integrasi e-Faktur · field kontak/alamat/NPWP/rekening di master data (fase berikutnya).

## 12. Cara Kerja

- Kerjakan **per modul**, mulai dari komponen bersama (`layout.js`, `ui.js`, `mock-data.js`), lalu: Auth → Super Admin → Finance (urutan: Sales Order, BAST, Invoice, Approval, Piutang, PO/Vendor, Report, Notifikasi).
- Satu halaman = satu file HTML; sidebar/header diinject dari `layout.js` agar tidak diduplikasi.
- Setelah tiap modul selesai, buka di browser (`python3 -m http.server`) dan cek tampilan serta tidak ada error console.
- Jika PRD ambigu, pilih interpretasi paling masuk akal dan catat sebagai komentar `<!-- ASUMSI: ... -->`; jangan menambah fitur di luar PRD.
- Jangan commit/push kecuali diminta.
