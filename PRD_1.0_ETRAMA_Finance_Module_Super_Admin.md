# PRODUCT REQUIREMENTS DOCUMENT
## ETRAMA — FINANCE MODULE 1.0 & SUPER ADMIN

**Dibuat oleh Chameleon (PT. Anak Muda Digital)**

| | |
|---|---|
| Versi | 1.0 |
| Fase | 1 |
| Tanggal Mulai | 29/10/2026 |
| Terakhir Diperbarui | 29/10/2026 |
| Penulis (metadata PDF) | Wianda Rafa Afifah |

### Informasi Dokumen

| Unit | Deskripsi |
|---|---|
| Format | Product Requirements Document |
| Area Bisnis | Sistem Keuangan Perusahaan Solar Panel |
| Status Dokumen | Draft |

---

## Daftar Isi

1. [Pengenalan](#1-pengenalan)
2. [Gambaran Umum](#2-gambaran-umum)
   - 2.1 [Solusi Teknologi Sistem yang Diusulkan](#21-solusi-teknologi-sistem-yang-diusulkan)
   - 2.2 [Latar Belakang dan Tujuan](#22-latar-belakang-dan-tujuan)
   - 2.3 [Ruang Lingkup Finance Module 1.0](#23-ruang-lingkup-finance-module-10)
   - 2.4 [Peta Modul ETrama](#24-peta-modul-etrama)
   - 2.5 [Timeline Pengerjaan](#25-timeline-pengerjaan)
3. [Desain Sistem](#3-desain-sistem)
   - 3.1 [Sitemap Menu](#31-sitemap-menu)
   - 3.2 [Alur Fitur](#32-alur-fitur)
   - 3.3 [Master Data](#33-master-data)
   - 3.4 [Role, Hierarki, dan Approval](#34-role-hierarki-dan-approval)
   - 3.5 [SLA Proses Penagihan](#35-sla-proses-penagihan)
   - 3.6 [Kebutuhan Fitur](#36-kebutuhan-fitur)
   - 3.7 [Kebutuhan Non-Fungsional](#37-kebutuhan-non-fungsional)
   - 3.8 [Wireframe](#38-wireframe)
4. [Persetujuan Klien](#4-persetujuan-klien)

---

## 1. Pengenalan

Product Requirements Document (PRD) adalah dokumen yang menguraikan semua persyaratan untuk produk tertentu. Dokumen ini dibuat untuk memastikan bahwa semua pemangku kepentingan memahami dengan jelas apa yang dimaksudkan oleh produk tersebut. Secara umum, PRD harus mengantisipasi dan mendefinisikan produk secara cukup rinci untuk memungkinkan desainer antarmuka dan engineer menerapkan keahlian mereka dalam menghasilkan solusi optimal yang memenuhi kebutuhan yang telah diidentifikasi.

Dokumen ini menguraikan ruang lingkup dan persyaratan sistem dengan cara yang secara efektif merepresentasikan solusi yang diusulkan. Dokumen ini ditujukan untuk digunakan oleh klien maupun Chameleon, vendor terpilih yang berkolaborasi dalam pengembangan sistem baru. PRD juga berfungsi bagi para pengguna yang berkontribusi dalam proses desain sistem. Pengguna diwajibkan untuk meninjau dan menyetujui spesifikasi desain berdasarkan kebutuhan masing-masing.

Tujuan utama PRD adalah sebagai referensi dasar dalam proses pengembangan produk, mengomunikasikan kapabilitas yang diperlukan untuk disertakan dalam rilis produk kepada tim pengembangan dan pengujian. PRD ini akan menjadi dasar bagi proses manajemen proyek berikut:

- Perencanaan proyek;
- Pengembangan sistem;
- Perencanaan implementasi dan pengujian;
- Penyempurnaan sistem.

---

## 2. Gambaran Umum

### 2.1 Solusi Teknologi Sistem yang Diusulkan

Solusi yang diusulkan ini merupakan hasil dari pemikiran dan analisis yang cermat, yang bertujuan untuk mengatasi tantangan-tantangan yang ada saat ini secara efektif. Solusi ini dirancang untuk memberikan pendekatan yang praktis dan berkelanjutan dalam menyelesaikan permasalahan yang ada dengan memanfaatkan alat dan metodologi terkini. Solusi ini berupaya menawarkan jalur yang efisien dan andal ke depannya, guna memastikan kelancaran operasional dan peningkatan hasil yang lebih baik. Chameleon menawarkan solusi pengembangan sistem dengan spesifikasi teknologi sebagai berikut:

| Kategori | Teknologi | Deskripsi |
|---|---|---|
| Hardware | Server (Back End) | _(kosong di dokumen asli)_ |
| Hardware | Server Operating System | _(kosong di dokumen asli)_ |
| Software | User Programming Language Platform (Front End) | _(kosong di dokumen asli)_ |
| Software | Admin Programming Language Platform (Front End) | _(kosong di dokumen asli)_ |
| Software | User and Admin Programming Language Platform (Back-end) | _(kosong di dokumen asli)_ |
| Software | Database | _(kosong di dokumen asli)_ |
| Kerangka Tata Letak | Platform Admin | _(kosong di dokumen asli)_ |
| Kerangka Tata Letak | Platform User | _(kosong di dokumen asli)_ |

### 2.2 Latar Belakang dan Tujuan

ETrama adalah perusahaan solar panel. Proses penagihan saat ini mengikuti **SOP 01.001-00 Pembuatan & Penagihan Invoice (Juni 2025)**: Staf Business Development mengirim SPK, PO Klien, atau Kontrak Kerja beserta master data klien ke Staf Finance via WA Grup, Lead Project mengirim BAST via email, lalu Staf Finance membuat invoice yang direview Lead Finance & Accounting dan Manager Operational sebelum dikirim ke klien.

Seluruh langkah tersebut masih berjalan manual: data diketik ulang, SLA (batas waktu per langkah) dipantau sendiri, reminder jatuh tempo dilakukan satu per satu, dan laporan piutang diperbarui terpisah. Finance Module 1.0 mendigitalkan alur SOP tersebut. Di v1.0 dokumen dari divisi lain tetap dikirim via WA Grup dan email; yang berubah, Finance menginputnya ke sistem dan proses selanjutnya berjalan terlacak dan otomatis.

Tujuan Finance Module 1.0 adalah sebagai berikut:

1. Finance cukup menginput dokumen SPK, PO Klien, atau Kontrak Kerja satu kali, lalu invoice per termin terbentuk otomatis.
2. Term of Payment (ToP) di dokumen kontrak dibaca oleh AI sehingga jadwal tagihan tidak perlu diketik ulang.
3. Review invoice dua lapis (Lead Finance & Accounting dan Manager Operational) berjalan di sistem sesuai SOP, lengkap dengan SLA per langkah.
4. Data tetap seperti rekening bank, stempel, dan tanda tangan terisi otomatis setiap kali dokumen di-generate.
5. Penagihan terkontrol: reminder H-14 dan H-7, pemberitahuan ulang, eskalasi H+30, serta laporan umur piutang yang selalu terkini.
6. Pembayaran ke vendor tercatat rapi berdasarkan PO dan invoice vendor.
7. Setiap aksi di sistem tercatat (siapa, apa, kapan) untuk kebutuhan audit.

### 2.3 Ruang Lingkup Finance Module 1.0

Ruang lingkup Finance Module 1.0 mencakup fitur-fitur berikut:

- **Finance (penagihan ke klien):** input Sales Order dari SPK / PO Klien / Kontrak Kerja dengan AI pembaca ToP dan upload dokumen jaminan, upload BAST sebagai dasar penagihan, invoice otomatis dengan review dua lapis, form transmittal, revisi invoice dari klien, laporan umur piutang, reminder, status On Hold, eskalasi penagihan, serta pencatatan pembayaran.
- **Finance (pembayaran ke vendor):** PO vendor, invoice vendor, dan catatan pembayaran vendor.
- **Report dan notifikasi:** report Sales Order, laporan piutang, serta notifikasi in-app melalui ikon di header.
- **Super Admin:** master data client, vendor, dan Staf Business Development, pengaturan dokumen (rekening, stempel, tanda tangan), user management, role management, hierarki role, approval layer, budget threshold, pengaturan SLA dan reminder, serta log history.

Hal-hal berikut berada **di luar** ruang lingkup Finance Module 1.0:

- Modul Procurement penuh (purchase request, perbandingan vendor, penerimaan barang).
- Modul CRM penuh (lead, pipeline, quotation). Di v1.0 SPK, PO Klien, atau Kontrak Kerja masih diterima dari Staf Business Development via WA Grup.
- Akses sistem untuk Staf Business Development dan Lead Project. Di v1.0 keduanya tetap mengirim dokumen via WA Grup dan email.
- Modul Cost Control (budget per proyek, realisasi biaya terhadap RAB).
- Modul Engineering, modul HR, dan Management Dashboard.
- Pembuatan jurnal akuntansi dan integrasi dengan sistem jurnal yang digunakan ETrama saat ini.
- Transfer dana otomatis ke bank dan integrasi e-Faktur.

### 2.4 Peta Modul ETrama

Sistem ETrama dirancang menjadi tujuh modul yang berbagi satu core Super Admin: master data, role, approval engine, dan log history. Finance dibangun lebih dulu karena menjadi muara dokumen dari modul lain, sedangkan Management Dashboard menjadi tempat manajemen melihat keseluruhan data kantor.

![Gambar 1. Peta modul ETrama](images/gambar-1-peta-modul.png)

*Gambar 1. Peta modul ETrama (teks hijau menandakan pengiriman file via WhatsApp di v1.0)*

**Ringkasan isi diagram:**

| Modul | Status | Keterangan |
|---|---|---|
| Management Dashboard | Roadmap | Membaca data semua modul: penjualan, keuangan, proyek, dan SDM dalam satu layar |
| CRM | Fase 2 | Lead, Quotation, Sales Order; pengelolaan client & penjualan |
| Procurement | Fase 2 | Purchase Request, PO; penerimaan barang dari vendor |
| Engineering | Roadmap | Proyek instalasi solar panel; jadwal, progres, BAST |
| **Finance Module** | **v1.0 — dibangun sekarang** | F1 Sales Order (input + AI baca ToP), F2 Invoice (generate otomatis), F3 Report SO (jumlah & nilai SO), F4 PO & vendor (catatan pembayaran) |
| Cost Control | Fase 3 | RAB, budget vs actual per proyek instalasi |
| HR | Roadmap | Data karyawan, absensi, cuti, struktur organisasi |
| **Super Admin (core sistem)** | v1.0 | Master data client & vendor, role & hierarki, approval engine & threshold, log history 5W1H |

Aliran data ke Finance: SPK / PO / Kontrak masuk via WA Grup (dari CRM), Purchase Order via WhatsApp (dari Procurement), BAST via email (dari Engineering). Finance mengirim pendapatan & biaya per proyek ke Cost Control.

Cara data masuk ke Finance pada v1.0 dan fase berikutnya:

| Data | v1.0 (sekarang) | Fase berikutnya |
|---|---|---|
| SPK / PO Klien / Kontrak Kerja + master data klien | Staf Business Development mengirim via WA Grup (maks. H+1 setelah disetujui klien), Staf Finance menginput ke sistem | Otomatis dari modul CRM |
| BAST (dasar penagihan) | Lead Project mengirim BAST yang disetujui klien via email (maks. H+1), Staf Finance meng-upload ke sistem | Otomatis dari modul Engineering |
| Purchase Order vendor | Procurement mengirim file via WhatsApp, Finance menginput ke sistem | Otomatis dari modul Procurement |
| Data ke Cost Control | — | Nilai SO (pendapatan) dan pembayaran vendor (biaya) per proyek |
| Data ke Management Dashboard | — | Ringkasan seluruh modul: penjualan, keuangan, proyek, SDM |

### 2.5 Timeline Pengerjaan

Pengerjaan Finance Module 1.0 dan Super Admin membutuhkan total **71 jam kerja**, dengan tahap development sekitar 2 minggu sebagai porsi terbesar.

![Gambar 2. Timeline pengerjaan Finance Module 1.0](images/gambar-2-timeline.png)

*Gambar 2. Timeline pengerjaan Finance Module 1.0*

| No | Tahap | Estimasi | Cakupan |
|---|---|---|---|
| 1 | PRD + Confirmation Meeting | 3 jam | Finalisasi PRD dan konfirmasi kebutuhan bersama ETrama |
| 2 | UI/UX | 3 jam | Desain alur dan layar Finance Module serta Super Admin |
| 3 | Development | 60 jam (sekitar 2 minggu) | Pengembangan fitur Finance, Super Admin, approval engine, dan log history |
| 4 | Testing | 5 jam | Pengujian fitur dan perbaikan sebelum rilis |
| | **Total** | **71 jam** | |

---

## 3. Desain Sistem

Desain sistem memainkan peran yang sangat penting dalam pengembangan dan implementasi solusi perangkat lunak yang andal dan skalabel. Ini melibatkan proses pendefinisian arsitektur, komponen, modul, antarmuka, dan data dari suatu sistem untuk memenuhi persyaratan yang telah ditentukan. Desain sistem yang efektif memerlukan pemahaman yang komprehensif tentang tantangan yang dihadapi, pertimbangan yang cermat terhadap kebutuhan pengguna, serta integrasi algoritma dan struktur data yang efisien.

Dengan berfokus pada interaksi antara berbagai komponen sistem dan fungsinya, para desainer sistem dapat menciptakan solusi yang tidak hanya memenuhi kebutuhan saat ini, tetapi juga mendukung skalabilitas dan adaptabilitas di masa mendatang. Melalui proses yang rumit ini, kompleksitas permasalahan dunia nyata diurai secara sistematis, membuka jalan bagi pengembangan sistem perangkat lunak yang canggih dan andal. Bagian berikut menguraikan ruang lingkup pekerjaan.

### 3.1 Sitemap Menu

#### a. Sitemap Menu Super Admin

![Gambar 3. Sitemap menu Super Admin](images/gambar-3-sitemap-super-admin.png)

*Gambar 3. Sitemap menu Super Admin*

| Menu | Submenu |
|---|---|
| Master Data | Client, Vendor, Staf BD |
| User Management | Daftar user, Tambah / edit user, Reset password |
| Role Management | Daftar role, Atur permission |
| Hierarki Role | Atur level jabatan, Atasan langsung |
| Approval & SLA | Layer approval, Budget threshold, SLA & reminder, Hari libur |
| Pengaturan Dokumen | Rekening bank, Stempel & TTD, Kop & alamat, Format nomor |
| Log History | Daftar log, Filter & export |
| Akun | Login, Profil, Logout |

#### b. Sitemap Menu Finance (Staf, Lead, Manager, Direktur)

![Gambar 4. Sitemap menu Finance](images/gambar-4-sitemap-finance.png)

*Gambar 4. Sitemap menu Finance*

| Menu | Submenu |
|---|---|
| Sales Order | Daftar SO, Input SPK/PO/Kontrak, AI baca ToP, Dokumen jaminan |
| BAST | Upload BAST, Riwayat BAST |
| Invoice | Daftar invoice, Review invoice, Form transmittal, Revisi invoice |
| Piutang | Laporan umur piutang, Reminder H-14 / H-7, On Hold & catatan, Eskalasi, Catat pembayaran |
| Purchase Order | Daftar PO, Tambah PO + upload, Invoice vendor |
| Pembayaran Vendor | Catat pembayaran, Riwayat pembayaran |
| Approval | Menunggu persetujuan, Riwayat approval |
| Report | Report Sales Order, Laporan piutang, Export Excel / PDF |
| Akun | Login, Notifikasi (ikon header), Profil |

### 3.2 Alur Fitur

#### a. Alur Pembuatan Invoice (SOP III.1)

![Gambar 5. Alur pembuatan invoice](images/gambar-5-alur-invoice.png)

*Gambar 5. Alur pembuatan invoice sesuai SOP III.1. Invoice baru dikirim ke klien setelah lolos review Lead Finance & Accounting dan Manager Operational.*

Ringkasan alur (swimlane: Staf BD · Staf Finance · Lead F&A · Manager Operational · Klien):

1. Staf BD mengirim SPK / PO / Kontrak + data klien via WA Grup (H+1).
2. Staf Finance input Sales Order + upload dokumen, AI baca ToP.
3. (Opsional) Upload dokumen jaminan BG / EAR jika ada.
4. Staf Finance membuat invoice, draft dari sistem (maks. H+3).
5. Review Lead F&A (maks. H+1). Jika tidak sesuai → info ke Staf Finance (H+0), kembali ke langkah 4.
6. Review Manager Operational (maks. H+1). Jika tidak sesuai → info (H+0), kembali ke langkah 4.
7. Staf Finance mengirim invoice + form transmittal (maks. H+1).
8. Klien memeriksa invoice. Jika tidak sesuai → revisi invoice & kirim ulang. Jika sesuai → bayar sesuai kesepakatan.
9. Pembayaran diterima → laporan piutang ter-update otomatis → Lead F&A cek laporan piutang.

#### b. Alur Penagihan Invoice ke Klien (SOP III.2)

![Gambar 6. Alur penagihan invoice ke klien](images/gambar-6-alur-penagihan.png)

*Gambar 6. Alur penagihan invoice ke klien sesuai SOP III.2, dari BAST hingga pembayaran, On Hold, atau eskalasi.*

Ringkasan alur (swimlane: Lead Project · Staf Finance · Lead F&A · Manager Finance & Direksi · Klien):

1. Lead Project mengirim BAST yang disetujui klien via email (H+1).
2. Staf Finance upload BAST; draft invoice terbentuk otomatis.
3. Staf Finance membuat & mengirim invoice sesuai BAST; Lead F&A memeriksa kesesuaian penagihan (jika tidak sesuai, kembali ke langkah 3).
4. Reminder H-14 & H-7: konfirmasi jadwal bayar ke klien.
5. Jika klien tidak bayar sesuai jatuh tempo → pemberitahuan ulang atau On Hold + catatan.
6. Belum bayar H+30 → eskalasi ke Manager Finance & Direksi: koordinasi internal, surat teguran, atau stop pekerjaan.
7. Jika klien bayar & konfirmasi → Staf Finance catat pembayaran (maks. H+1), piutang ter-update → Lead F&A cek laporan piutang.

#### c. Alur PO hingga Catatan Pembayaran Vendor

![Gambar 7. Alur PO hingga catatan pembayaran vendor](images/gambar-7-alur-po-vendor.png)

*Gambar 7. Alur PO hingga catatan pembayaran vendor. File PO dari procurement dikirim via WhatsApp lalu diinput Finance; invoice vendor harus cocok dengan PO sebelum pembayaran dicatat.*

Ringkasan alur (swimlane: Procurement · Staf Finance · Vendor · Sistem):

1. Procurement mengirim file PO via WhatsApp.
2. Staf Finance input PO + upload file PO.
3. Vendor mengirim invoice ke Finance.
4. Staf Finance input invoice vendor + tautkan ke PO.
5. Sistem memeriksa kecocokan dengan PO. Jika tidak cocok → cek ulang (kembali ke langkah 4).
6. Jika cocok → Staf Finance transfer via internet banking.
7. Staf Finance catat pembayaran + upload bukti → Sistem: status Paid, PO ikut ter-update.

#### d. Alur Approval Invoice

![Gambar 8. Alur approval invoice](images/gambar-8-alur-approval.png)

*Gambar 8. Alur approval invoice dua lapis sesuai SOP, dengan budget threshold opsional (contoh Rp500.000.000).*

Ringkasan alur:

1. Staf Finance submit invoice.
2. Review Lead F&A (layer 1, maks. H+1) → jika sesuai lanjut; jika tidak → **Dikembalikan** ke Staf Finance dengan catatan (maks. H+0), lalu perbaiki dan submit ulang.
3. Review Manager Operational (layer 2, maks. H+1) → jika sesuai lanjut; jika tidak → Dikembalikan.
4. Cek: budget threshold aktif dan nilai di atas batas? **Tidak** → Disetujui. **Ya** → Direktur approve (opsional) → Disetujui.
5. **Disetujui** = siap dikirim ke klien.

### 3.3 Master Data

#### a. Master Data Client

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| Kode client | Auto | Auto | Format `CL-0001` |
| Nama perusahaan | Teks | Ya | Unik; sistem memberi peringatan jika duplikat |
| Nama PIC | Teks | Ya | Terisi otomatis di form Sales Order |
| Status | Aktif / Nonaktif | Ya | Data nonaktif tidak muncul di transaksi baru |
| Kontak PIC, alamat, NPWP | Teks | — | Disiapkan untuk fase berikutnya |

#### b. Master Data Vendor

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| Kode vendor | Auto | Auto | Format `VD-0001` |
| Nama perusahaan | Teks | Ya | Unik; sistem memberi peringatan jika duplikat |
| Nama PIC | Teks | Ya | Terisi otomatis di form PO |
| Status | Aktif / Nonaktif | Ya | Data nonaktif tidak muncul di transaksi baru |
| Kontak PIC, alamat, NPWP, rekening bank | Teks | — | Disiapkan untuk fase berikutnya |

#### c. Master Data Staf Business Development

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| Nama | Teks | Ya | Dipilih di form Sales Order sebagai pengirim dokumen |
| Status | Aktif / Nonaktif | Ya | Nama nonaktif tidak muncul di Sales Order baru |

### 3.4 Role, Hierarki, dan Approval

Akses sistem diatur dengan dua lapis: **role** menentukan menu dan fitur yang bisa dibuka, sedangkan **level hierarki** menentukan wewenang submit dan approve. Nama jabatan mengikuti SOP 01.001-00 Pembuatan & Penagihan Invoice.

#### a. Role Akses Sistem

| Role | Deskripsi |
|---|---|
| Super Admin | Mengelola konfigurasi: master data, user, role, approval rule, budget threshold, SLA, dan log. Tidak ikut meng-approve transaksi (pemisahan tugas). |
| Admin (Finance) | Pengguna operasional modul Finance sesuai level hierarkinya: Staf Finance, Lead Finance & Accounting, Manager, dan Direktur. |
| Custom role | Dibuat Super Admin melalui Role Management, misalnya "Finance Viewer" yang hanya dapat melihat report. |

#### b. Level Hierarki

| Level | Jabatan (SOP) | Wewenang |
|---|---|---|
| Staff | Staf Finance | Input Sales Order, membuat dan mengirim invoice, penagihan, mencatat pembayaran, input PO dan invoice vendor |
| Lead | Lead Finance & Accounting | Review dan approve invoice (layer 1), memastikan penagihan sesuai BAST, memverifikasi laporan piutang |
| Manager | Manager Operational, Manager Finance | Manager Operational: review dan approve invoice (layer 2). Manager Finance: menerima eskalasi piutang |
| Direktur | Direksi | Approver tertinggi bila budget threshold aktif; bersama Lead Finance & Accounting memutuskan tindakan atas piutang bermasalah |

#### c. Pihak di Luar Sistem (v1.0)

| Pihak | Peran dalam alur |
|---|---|
| Staf Business Development | Mengirim SPK / PO Klien / Kontrak Kerja dan master data klien ke Staf Finance via WA Grup |
| Lead Project | Mengirim BAST yang disetujui klien via email sebagai dasar penagihan |
| Klien | Menerima invoice beserta form transmittal, mengajukan revisi bila tidak sesuai, dan melakukan pembayaran |

#### d. Permission Matrix

| Fitur | Super Admin | Staf Finance | Lead F&A | Manager | Direktur |
|---|---|---|---|---|---|
| Master data client, vendor & Staf BD | Kelola | Lihat | Lihat | Lihat | Lihat |
| User, role & SLA setting | Kelola | — | — | — | — |
| Pengaturan dokumen | Kelola | — | — | — | — |
| Input Sales Order & BAST | — | Buat | Lihat | Lihat | Lihat |
| Buat, kirim, revisi invoice | — | Buat | Lihat | Lihat | Lihat |
| Review / approve invoice | — | — | Layer 1 | Layer 2 (Ops) | Opsional |
| Penagihan, On Hold, catat bayar | — | Buat | Lihat | Lihat | Lihat |
| Verifikasi laporan piutang | — | — | Verifikasi | Lihat | Lihat |
| Keputusan piutang bermasalah | — | — | Putuskan | Lihat (Finance) | Putuskan |
| PO, invoice & catatan bayar vendor | — | Buat | Lihat | Lihat | Lihat |
| Report SO & laporan piutang | Lihat | Lihat | Lihat | Lihat | Lihat |
| Log history | Lihat semua | Milik sendiri | Lihat tim | Lihat tim | Lihat semua |

#### e. Approval per Jenis Dokumen

| Dokumen | Alur approval default | Dasar |
|---|---|---|
| Sales Order (SPK / PO Klien / Kontrak) | Tanpa approval; dokumen sudah disetujui klien dan direview Staf BD | SOP III.1 |
| Invoice | Staf Finance → Lead Finance & Accounting → Manager Operational; lanjut ke Direktur bila budget threshold aktif dan nilai di atas batas | SOP III.1 |
| Revisi invoice dari klien | Mengikuti alur invoice | SOP Ketentuan Khusus A No. 7 |
| Catatan pembayaran vendor | Tanpa approval; dicatat Staf Finance setelah transfer | — |

Seluruh alur di atas dapat diubah Super Admin per jenis dokumen. Threshold dapat berbeda per jenis dokumen dan dapat ditambah tier baru tanpa perubahan kode.

### 3.5 SLA Proses Penagihan

SLA berikut diambil dari SOP 01.001-00 Pembuatan & Penagihan Invoice dan menjadi nilai default di sistem. Super Admin dapat mengubah nilainya, dan seluruh SLA dihitung dalam **hari kerja**.

| Langkah (SOP 01.001-00) | Pelaku | SLA |
|---|---|---|
| Mengirim SPK / PO Klien / Kontrak Kerja + master data klien | Staf Business Development | Maks. H+1 hari kerja setelah disetujui klien |
| Membuat invoice | Staf Finance | Maks. H+3 hari kerja setelah dokumen lengkap |
| Review invoice | Lead Finance & Accounting | Maks. H+1 hari kerja setelah diterima |
| Review invoice | Manager Operational | Maks. H+1 hari kerja setelah diterima |
| Menginformasikan ketidaksesuaian invoice | Lead F&A / Manager Operational | Maks. H+0 (hari yang sama) |
| Mengirim invoice + form transmittal ke klien | Staf Finance | Maks. H+1 setelah invoice disetujui |
| Mengirim BAST yang disetujui klien | Lead Project | Maks. H+1 |
| Reminder jadwal pembayaran | Staf Finance | H-14 dan H-7 sebelum jatuh tempo |
| Eskalasi piutang ke Manager Finance | Staf Finance | H+30 dari pemberitahuan terakhir |
| Mencatat penerimaan pembayaran | Staf Finance | Maks. H+1 setelah informasi pembayaran |

### 3.6 Kebutuhan Fitur

#### 3.6.1 Fitur Super Admin

##### a. Modul Login Super Admin

**US-SA-01** — Sebagai super admin, saya dapat login menggunakan email dan password, sehingga saya dapat mengakses panel konfigurasi sistem.

1. Form login menampilkan field email dan password.
2. Login gagal jika email tidak terdaftar. Akan tampil pesan *'Email belum terdaftar'*.
3. Login gagal jika email atau password salah. Akan tampil pesan *'Email atau password salah'*.
4. Login berhasil mengarahkan ke halaman utama Super Admin.
5. Setiap login dan logout tercatat di log history.

**US-SA-02** — Sebagai super admin, saya ingin mereset password ketika lupa, sehingga saya tetap bisa mengakses sistem.

1. Di halaman login terdapat link "Lupa Password?".
2. Sistem mengirim link reset password ke email yang terdaftar; link memiliki masa berlaku terbatas dan hanya bisa digunakan satu kali.
3. Halaman reset menampilkan form password baru dan konfirmasi password baru.
4. Setelah berhasil, semua sesi aktif otomatis logout dan user diarahkan ke halaman login.

##### b. Modul Master Data Client, Vendor & Staf BD

**US-SA-03** — Sebagai super admin, saya ingin menambahkan data client, sehingga client dapat dipilih saat Finance menginput sales order. *(v1.0 hanya menyimpan nama dan PIC)*

1. Form tambah client mencakup: Nama perusahaan (wajib), Nama PIC (wajib).
2. Kode client dibuat otomatis dengan format CL-0001.
3. Sistem memberi peringatan jika nama perusahaan sudah ada.
4. Client baru berstatus aktif dan langsung muncul di dropdown form Sales Order.

**US-SA-04** — Sebagai super admin, saya ingin menambahkan data vendor, sehingga vendor dapat dipilih saat Finance menginput PO. *(v1.0 hanya menyimpan nama dan PIC)*

1. Form tambah vendor mencakup: Nama perusahaan (wajib), Nama PIC (wajib).
2. Kode vendor dibuat otomatis dengan format VD-0001.
3. Sistem memberi peringatan jika nama perusahaan sudah ada.
4. Vendor baru berstatus aktif dan langsung muncul di dropdown form PO.

**US-SA-05** — Sebagai super admin, saya ingin mengubah atau menonaktifkan data client dan vendor, sehingga master data tetap rapi.

1. Super admin dapat mengubah nama perusahaan dan nama PIC.
2. Data yang sudah dipakai di transaksi tidak bisa dihapus, hanya dinonaktifkan.
3. Data nonaktif tidak muncul di dropdown transaksi baru, tetapi transaksi lama tetap menampilkannya.
4. Setiap perubahan tercatat di log history beserta nilai sebelum dan sesudah.

**US-SA-06** — Sebagai super admin, saya ingin menambahkan nama Staf Business Development, sehingga pengirim dokumen kontrak dapat dipilih di Sales Order. *(Hanya nama)*

1. Form tambah hanya berisi nama Staf Business Development.
2. Nama baru berstatus aktif dan langsung muncul di dropdown form Sales Order.
3. Nama dapat diubah atau dinonaktifkan; nama yang sudah dipakai di Sales Order tidak bisa dihapus.

##### c. Modul User Management

**US-SA-07** — Sebagai super admin, saya ingin menambahkan user baru, sehingga staf finance dan manajemen dapat menggunakan sistem.

1. Form tambah user mencakup: Nama lengkap; Email (unik); Role; Level hierarki (Staff / Manager / Direktur); Atasan langsung.
2. Sistem mengirim akun beserta password sementara ke email user.
3. User wajib mengganti password saat login pertama.

**US-SA-08** — Sebagai super admin, saya ingin mengelola akun user yang sudah ada, sehingga akses selalu sesuai kondisi terkini.

1. Super admin dapat mengubah role, level, dan atasan langsung user.
2. Super admin dapat menonaktifkan user; user nonaktif tidak bisa login.
3. Super admin dapat mereset password dan memaksa logout sesi aktif user.
4. Setiap perubahan tercatat di log history.

##### d. Modul Role Management & Hierarki

**US-SA-09** — Sebagai super admin, saya ingin membuat role dan mengatur permission-nya, sehingga setiap user hanya mengakses menu yang dibutuhkan.

1. Super admin dapat membuat role baru dengan nama dan deskripsi.
2. Permission diatur per menu: lihat, buat, edit, hapus, approve, dan export.
3. Role bawaan (Super Admin dan Admin) tidak dapat dihapus.
4. Perubahan permission berlaku pada login berikutnya.

**US-SA-10** — Sebagai super admin, saya ingin mengatur hierarki Staff, Lead, Manager, dan Direktur, sehingga sistem tahu siapa yang berhak submit, review, dan approve. *(Mengikuti jabatan di SOP 01.001-00)*

1. Staff (Staf Finance) membuat dan men-submit dokumen.
2. Lead (Lead Finance & Accounting) me-review dan meng-approve invoice sebagai layer 1 serta memverifikasi laporan piutang.
3. Manager (Manager Operational dan Manager Finance) me-review invoice sebagai layer 2, menerima eskalasi piutang, dan meng-approve pembayaran vendor sampai batas nominal.
4. Direktur menjadi approver tertinggi dan ikut memutuskan tindakan atas piutang bermasalah.
5. Relasi atasan langsung dipakai sistem untuk menentukan reviewer dan approver.

##### e. Modul Approval Setting, Budget Threshold & SLA

**US-SA-11** — Sebagai super admin, saya ingin mengatur layer approval per jenis dokumen, sehingga alur persetujuan sesuai SOP perusahaan.

1. Default sesuai SOP:
   - Sales Order: tanpa approval
   - Invoice: Lead Finance & Accounting → Manager Operational
   - Catatan pembayaran vendor: tanpa approval
2. Setiap layer dapat diaktifkan atau di-skip melalui toggle.
3. Minimal satu layer approver harus aktif untuk invoice.

**US-SA-12** — Sebagai super admin, saya ingin menetapkan budget threshold, sehingga invoice bernilai besar otomatis diteruskan ke Direktur.

1. Budget threshold bersifat opsional dan dapat diaktifkan per jenis dokumen.
2. Super admin mengisi batas nominal, misalnya Rp500.000.000.
3. Invoice ≤ batas selesai di Manager Operational; invoice > batas wajib lanjut ke Direktur.
4. Threshold dapat ditambah tier baru tanpa perubahan kode.

**US-SA-13** — Sebagai super admin, saya ingin mengatur SLA dan jadwal reminder, sehingga sistem dapat memantau ketepatan waktu setiap langkah. *(Sumber: SOP 01.001-00)*

1. Nilai default mengikuti SOP:
   - Pembuatan invoice: H+3
   - Review Lead F&A dan Manager Operational: masing-masing H+1
   - Info ketidaksesuaian: H+0
   - Pengiriman invoice: H+1
   - Reminder jatuh tempo: H-14 dan H-7
   - Eskalasi piutang: H+30
   - Pencatatan pembayaran: H+1
2. SLA dihitung dalam hari kerja; super admin dapat mengatur daftar hari libur.
3. Langkah yang melewati SLA ditandai merah dan memicu notifikasi ke pelaku serta atasannya.
4. Setiap perubahan setting tercatat di log history.

**US-SA-14** — Sebagai super admin, saya ingin sistem menerapkan aturan skip otomatis, sehingga tidak ada dokumen yang di-approve oleh pembuatnya sendiri.

1. Jika pembuat dokumen memiliki level yang sama dengan layer approval, layer tersebut diteruskan ke level di atasnya.
2. Setiap perubahan setting tercatat di log history.

##### f. Modul Pengaturan Dokumen

**US-SA-15** — Sebagai super admin, saya ingin mengatur data tetap yang selalu muncul di dokumen, sehingga invoice dan form transmittal terisi otomatis saat di-generate.

1. Data yang diatur:
   - Nama, alamat, NPWP, dan logo / kop perusahaan
   - Rekening bank: nama bank, nomor rekening, atas nama (bisa lebih dari satu, dengan satu rekening default)
   - Stempel perusahaan (upload gambar PNG transparan)
   - Tanda tangan, nama, dan jabatan penandatangan
   - Catatan kaki dan syarat pembayaran default
   - Format penomoran dokumen
2. Saat invoice dan form transmittal di-generate, data tersebut otomatis terisi tanpa input manual.
3. Staf Finance dapat memilih rekening lain dari daftar, tetapi tidak dapat mengetik nomor rekening secara bebas.
4. Perubahan pengaturan hanya berlaku untuk dokumen baru; dokumen yang sudah terbit tidak berubah.
5. Setiap perubahan tercatat di log history.

**US-SA-16** — Sebagai super admin, saya ingin stempel dan tanda tangan dibubuhkan otomatis, sehingga dokumen siap kirim tanpa proses cetak dan tanda tangan manual.

1. Stempel dan tanda tangan hanya muncul di PDF setelah invoice disetujui sesuai alur approval.
2. Draft invoice yang belum disetujui ditandai watermark "DRAFT" tanpa stempel dan tanda tangan.
3. Super admin menentukan penandatangan default untuk invoice dan form transmittal.

##### g. Modul Log History

**US-SA-17** — Sebagai super admin, saya ingin melihat riwayat seluruh aktivitas di sistem, sehingga setiap perubahan dapat diaudit.

1. Setiap log mencatat:
   - **Siapa:** nama user, role, level
   - **Apa:** aksi dan nomor dokumen
   - **Kapan:** tanggal dan jam (WIB)
   - **Di mana:** modul atau menu
   - **Kenapa:** alasan (wajib untuk reject, cancel, revisi)
   - Nilai sebelum dan sesudah untuk field yang berubah
2. Log tidak dapat diedit atau dihapus, termasuk oleh super admin.
3. Log dapat difilter berdasarkan user, modul, aksi, dan periode, serta diekspor ke Excel.
4. Setiap dokumen memiliki tab Riwayat berisi timeline log dokumen tersebut.

#### 3.6.2 Fitur Finance (Staf, Lead, Manager, Direktur)

##### a. Modul Login

**US-FN-01** — Sebagai user finance, saya ingin login menggunakan akun yang dikirim via email, sehingga saya dapat mulai menggunakan sistem.

1. Halaman login menampilkan field email dan password.
2. Jika ini login pertama (password sementara), sistem menampilkan halaman ganti password sebelum masuk.
3. Login berhasil mengarahkan ke halaman sesuai role dan level user.
4. Tersedia link "Lupa Password?" dengan alur yang sama seperti Super Admin.

##### b. Modul Sales Order (SPK / PO Klien / Kontrak Kerja)

**US-FN-02** — Sebagai Staf Finance, saya ingin menginput SPK, PO Klien, atau Kontrak Kerja yang dikirim Staf Business Development, sehingga dasar penagihan tercatat di sistem. *(Dokumen dan master data klien diterima dari Staf BD via WA Grup. Dokumen jaminan cukup di-upload — SOP Ketentuan Khusus poin A No. 2.)*

1. Form header mencakup:
   - Jenis dokumen: SPK / PO Klien / Kontrak Kerja
   - No. dokumen klien dan tanggal disetujui klien
   - Tanggal diterima dari Staf Business Development
   - No. SO internal (otomatis, format usulan `SO/ETR/YYYY/MM/0001`)
   - Client (dropdown master data; PIC terisi otomatis)
   - Staf Business Development (dropdown master data)
   - Project / reference dan lokasi instalasi
   - Kapasitas sistem dalam kWp (opsional)
   - Upload dokumen (PDF, JPG, PNG, DOCX, XLSX; maks. 10 MB)
   - Upload dokumen jaminan Bank Garansi / Asuransi / EAR (opsional)
2. Item mencakup: Item / deskripsi; Qty dan satuan; Harga satuan dan diskon; Subtotal otomatis.
3. DPP, PPN, dan nilai kontrak dihitung otomatis; tarif PPN diatur super admin.
4. Sistem menandai jika dokumen diterima lebih dari H+1 hari kerja setelah disetujui klien.

**US-FN-03** — Sebagai admin finance, saya ingin AI membaca Term of Payment dari file SO, sehingga saya tidak perlu mengetik ulang jadwal termin. *(Contoh ToP: DP 30%, 60% setelah material tiba, 10% setelah BAST)*

1. Setelah file di-upload, AI mengekstrak termin, persentase, pemicu (tanggal atau milestone), jatuh tempo, dan retensi.
2. Hasil tampil sebagai draft tabel ToP yang dapat diedit, dengan potongan teks asli di samping setiap field.
3. Field dengan tingkat keyakinan rendah diberi tanda kuning dan wajib dicek.
4. SO tidak dapat di-submit jika total persentase termin ≠ 100% atau total nominal ≠ Total SO.
5. Finance wajib klik tombol Konfirmasi ToP; AI tidak pernah membuat invoice tanpa konfirmasi.
6. Jika AI gagal membaca file, form ToP manual terbuka.
7. Hasil AI dan nilai final yang dikonfirmasi disimpan untuk audit.

**US-FN-04** — Sebagai Staf Finance, saya ingin menyimpan Sales Order sebagai dasar penagihan, sehingga jadwal invoice dapat dibentuk.

1. Sales Order disimpan dengan status Aktif tanpa approval, karena dokumen sudah disetujui klien; approval dapat diaktifkan Super Admin bila diperlukan.
2. Setelah ToP dikonfirmasi, sistem membentuk jadwal invoice untuk setiap termin.
3. Perubahan Sales Order tercatat sebagai revisi di log history.

##### c. Modul Dokumen BAST

**US-FN-05** — Sebagai Staf Finance, saya ingin meng-upload BAST yang disetujui klien, sehingga invoice termin terkait terbentuk otomatis. *(BAST dikirim Lead Project via email)*

1. Staf Finance memilih termin, meng-upload BAST atau laporan lain yang ditandatangani kedua belah pihak, dan mengisi tanggal BAST.
2. Setelah BAST di-upload, sistem membuat draft invoice untuk termin tersebut.
3. Sistem mencatat tanggal BAST diterima dan menandai jika melewati H+1.

##### d. Modul Invoice

**US-FN-06** — Sebagai Staf Finance, saya ingin draft invoice terbentuk otomatis dari jadwal termin, sehingga invoice dibuat tepat waktu.

1. Termin dengan pemicu tanggal: draft dibuat otomatis pada tanggal termin atau H-N (diatur super admin).
2. Termin dengan pemicu milestone: draft dibuat setelah BAST di-upload.
3. Data invoice terisi otomatis:
   - No. invoice (format usulan `INV/ETR/YYYY/MM/0001`)
   - Tanggal invoice dan jatuh tempo
   - Client, PIC, no. dokumen klien, project
   - Termin, persentase, DPP, PPN, total tagihan
   - Rekening tujuan, stempel, dan tanda tangan (otomatis dari Pengaturan Dokumen)
4. Sistem menampilkan hitung mundur SLA pembuatan invoice (H+3 hari kerja sejak dokumen lengkap).

**US-FN-07** — Sebagai Staf Finance, saya ingin mengajukan invoice untuk direview, sehingga invoice yang dikirim ke klien sudah benar. *(SOP III.1)*

1. Invoice beserta dokumen kelengkapan dikirim ke Lead Finance & Accounting (layer 1), lalu ke Manager Operational (layer 2).
2. Setiap reviewer memiliki SLA H+1 hari kerja; dokumen yang melewati SLA ditandai merah.
3. Jika tidak sesuai, reviewer mengembalikan invoice ke Staf Finance beserta catatan pada hari yang sama (H+0).
4. Status invoice: Draft → Review Lead F&A → Review Manager Operational → Disetujui, atau Dikembalikan.

**US-FN-08** — Sebagai Staf Finance, saya ingin mengirim invoice beserta form transmittal, sehingga ada bukti tanda terima dari klien. *(v1.0: invoice dikirim manual oleh Staf Finance)*

1. Setelah disetujui, sistem membuat PDF invoice dengan template ETrama yang terisi otomatis dari Pengaturan Dokumen dan form transmittal (daftar dokumen yang dikirim dan kolom tanda terima).
2. Staf Finance menandai invoice Terkirim; sistem menandai jika pengiriman melewati H+1 setelah disetujui.
3. Form transmittal yang sudah ditandatangani klien dapat di-upload sebagai bukti terima.

**US-FN-09** — Sebagai Staf Finance, saya ingin mencatat revisi invoice dari klien, sehingga invoice yang benar dapat dikirim ulang. *(SOP Ketentuan Khusus poin A No. 7)*

1. Staf Finance mencatat permintaan revisi dari klien beserta alasannya.
2. Sistem membuat versi revisi (Rev.1, Rev.2, dan seterusnya) dengan riwayat versi sebelumnya tetap tersimpan.
3. Invoice revisi melalui alur review yang sama sebelum dikirim ulang ke klien.

##### e. Modul Piutang & Penagihan

**US-FN-10** — Sebagai Staf Finance, saya ingin laporan piutang ter-update otomatis, sehingga umur piutang dapat dipantau setiap hari. *(Menggantikan update manual daftar piutang — SOP: maks. H+1)*

1. Invoice yang terkirim otomatis masuk ke laporan piutang.
2. Laporan menampilkan:
   - Client, no. invoice, nilai, tanggal jatuh tempo
   - Periode umur piutang: belum jatuh tempo, 1–30, 31–60, 61–90, dan lebih dari 90 hari
   - Status penagihan: Belum Jatuh Tempo, Overdue, On Hold, Dieskalasi, Partially Paid, Paid
   - Catatan terakhir dan tanggal reminder terakhir
3. Laporan dapat difilter dan diekspor ke Excel.

**US-FN-11** — Sebagai Staf Finance, saya ingin diingatkan H-14 dan H-7 sebelum jatuh tempo, sehingga jadwal pembayaran terkonfirmasi ke klien. *(SOP III.2)*

1. Sistem membuat tugas reminder untuk Staf Finance pada H-14 dan H-7 sebelum jatuh tempo.
2. Staf Finance mencatat hasil konfirmasi: tanggal, kanal (telepon, email, WhatsApp), dan catatan.
3. Lead Finance & Accounting dapat melihat status reminder setiap invoice.

**US-FN-12** — Sebagai Staf Finance, saya ingin menindaklanjuti piutang yang belum dibayar, sehingga penagihan tidak berhenti di tengah jalan. *(SOP III.2)*

1. Invoice yang lewat jatuh tempo berstatus Overdue dan Staf Finance mencatat setiap pemberitahuan ulang ke klien.
2. Jika belum dibayar H+30 hari kerja dari pemberitahuan terakhir, sistem mengeskalasi otomatis ke Manager Finance.
3. Lead Finance & Accounting bersama Direksi mencatat keputusan: koordinasi internal, surat teguran, atau pemberhentian pekerjaan proyek sementara.

**US-FN-13** — Sebagai Staf Finance, saya ingin memberi status On Hold dan catatan pada piutang, sehingga kondisi khusus setiap tagihan tercatat jelas.

1. Staf Finance dapat mengubah status piutang menjadi On Hold, misalnya karena klien meminta penundaan atau menunggu dokumen tambahan.
2. Catatan keterangan wajib diisi saat mengubah status menjadi On Hold.
3. Selama On Hold, reminder jatuh tempo dan hitungan eskalasi H+30 dijeda.
4. Staf Finance dapat mengembalikan status ke penagihan aktif kapan saja, dengan catatan.
5. Staf Finance dapat menambahkan catatan di setiap piutang kapan saja; riwayat catatan tampil berurutan lengkap dengan nama dan waktu.
6. Lead Finance & Accounting dapat melihat seluruh piutang berstatus On Hold beserta catatannya.

**US-FN-14** — Sebagai Staf Finance, saya ingin mencatat pembayaran dari klien, sehingga laporan piutang selalu akurat. *(Jurnal penerimaan tetap dibuat di sistem jurnal ETrama)*

1. Staf Finance mengisi tanggal bayar, nominal, dan upload bukti transfer; sistem menandai jika melewati H+1 sejak informasi pembayaran diterima.
2. Pembayaran sebagian mengubah status menjadi Partially Paid; pembayaran penuh menjadi Paid.
3. Lead Finance & Accounting memverifikasi setiap pembaruan laporan piutang dengan menandai "Sudah dicek".

##### f. Modul Approval Dokumen

**US-FN-15** — Sebagai Lead Finance & Accounting, Manager, atau Direktur, saya ingin melihat dan memproses dokumen yang menunggu persetujuan, sehingga transaksi tidak tertahan.

1. Menu Approval menampilkan daftar dokumen yang menunggu persetujuan user tersebut beserta sisa waktu SLA.
2. Reviewer dapat membuka detail dokumen beserta file lampirannya.
3. Reviewer dapat memilih Approve atau Kembalikan; pengembalian wajib disertai catatan.
4. Reviewer tidak dapat meng-approve dokumen yang ia buat sendiri.
5. Setiap perpindahan status mengirim notifikasi in-app ke pihak berikutnya.

##### g. Modul Notifikasi

**US-FN-16** — Sebagai user, saya ingin melihat notifikasi melalui ikon di header, sehingga saya tidak melewatkan tugas dan pengingat. *(Email dapat diaktifkan sebagai kanal tambahan)*

1. Ikon notifikasi (lonceng) tampil di header pada semua halaman, dengan badge jumlah notifikasi yang belum dibaca.
2. Klik ikon menampilkan daftar notifikasi terbaru: judul, nomor dokumen, dan waktu.
3. Klik salah satu notifikasi membuka dokumen terkait dan menandainya sudah dibaca.
4. Tersedia tombol "Tandai semua dibaca" dan halaman berisi seluruh riwayat notifikasi.
5. Notifikasi dikirim untuk:
   - Dokumen menunggu review atau approval
   - Invoice dikembalikan beserta catatan
   - Reminder H-14 dan H-7 jatuh tempo
   - Langkah yang melewati SLA
   - Eskalasi piutang

##### h. Modul Report

**US-FN-17** — Sebagai manajemen, saya ingin melihat jumlah dan nilai sales order per periode, sehingga saya dapat memantau penjualan.

1. Report menampilkan: Jumlah SO; Total nilai SO (Rp); Rata-rata nilai per SO; Grafik tren jumlah dan nilai SO per bulan; Tabel detail SO beserta status penagihan.
2. Filter periode: rentang tanggal, bulan, dan tahun, ditambah filter client, sales person, dan status SO.
3. Default hanya menghitung SO berstatus Approved, dengan opsi menyertakan SO yang menunggu approval.
4. Report dapat diekspor ke Excel dan PDF sesuai filter yang aktif.

**US-FN-18** — Sebagai Lead Finance & Accounting atau manajemen, saya ingin melihat ringkasan piutang, sehingga risiko penagihan terpantau.

1. Report menampilkan: Total piutang dan total overdue; Piutang per periode umur (belum jatuh tempo, 1–30, 31–60, 61–90, lebih dari 90 hari); Piutang per client; Daftar piutang On Hold dan yang dieskalasi.
2. Report dapat difilter per periode dan client, serta diekspor ke Excel dan PDF.

##### i. Modul Purchase Order & Invoice Vendor

**US-FN-19** — Sebagai admin finance, saya ingin menginput PO dari file yang dikirim procurement, sehingga setiap pembayaran vendor memiliki dasar PO. *(File PO diterima dari procurement via WhatsApp)*

1. Form PO mencakup:
   - No. PO dari procurement dan ID internal otomatis
   - Tanggal PO
   - Vendor (dropdown master data; PIC terisi otomatis)
   - Diajukan oleh / divisi
   - Project / reference (dapat ditautkan ke SO)
   - Item: nama, spesifikasi, qty, satuan, harga, diskon
   - DPP, PPN, PPh (jika ada), total PO
   - ToP vendor (DP, termin, atau net X hari)
   - Upload file PO
2. Status PO: Open → Partially Invoiced → Fully Invoiced → Closed.

**US-FN-20** — Sebagai admin finance, saya ingin mencatat invoice vendor yang terhubung ke PO, sehingga tagihan vendor dapat dicek kewajarannya.

1. Form invoice vendor mencakup:
   - No. invoice vendor, tanggal, jatuh tempo
   - PO terkait dan termin yang ditagih
   - DPP, PPN, total
   - No. faktur pajak (opsional)
   - Upload file invoice vendor
2. Sistem menolak invoice jika total invoice melebihi sisa nilai PO.
3. Selisih nominal atau vendor yang berbeda dari PO ditandai merah untuk dicek Finance.

##### j. Modul Catatan Pembayaran Vendor

**US-FN-21** — Sebagai Staf Finance, saya ingin mencatat pembayaran yang sudah ditransfer ke vendor, sehingga status utang vendor selalu terkini. *(Rekening vendor diinput manual di v1.0)*

1. Catatan pembayaran dibuat dari invoice vendor yang sudah tercatat dan lolos pengecekan PO.
2. Form catatan pembayaran mencakup: Invoice vendor dan PO terkait (terisi otomatis); Tanggal bayar; Nominal dibayar; Rekening tujuan vendor; Upload bukti transfer; Catatan (opsional).
3. Tidak memerlukan approval; transfer tetap dilakukan melalui internet banking di luar sistem.
4. Status invoice vendor berubah menjadi Partially Paid atau Paid, dan status PO ikut ter-update.

**US-FN-22** — Sebagai Staf Finance, saya ingin melihat riwayat pembayaran vendor, sehingga mudah dicek saat rekonsiliasi.

1. Daftar pembayaran dapat difilter per vendor, PO, dan periode.
2. Setiap baris menampilkan tanggal, nominal, invoice vendor, PO, dan bukti transfer.
3. Daftar dapat diekspor ke Excel.

### 3.7 Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| Platform | Web app |
| Keamanan | Akses berbasis role, password policy, sesi timeout |
| File | Penyimpanan terenkripsi dan hanya dapat diakses user yang berwenang |
| AI | Dokumen client tidak dipakai untuk melatih model pihak ketiga; hasil AI selalu direview manusia |
| Performa | Report data 1 tahun tampil di bawah 3 detik (tergantung pada jumlah data) |
| Zona waktu & format | WIB, format Rupiah, dan tanggal DD/MM/YYYY |
| Hari kerja | SLA dihitung dalam hari kerja (Senin–Jumat); daftar hari libur diatur Super Admin |
| Notifikasi | Notifikasi in-app melalui ikon lonceng di header dengan badge jumlah belum dibaca |

### 3.8 Wireframe

Wireframe untuk halaman Super Admin dan Finance akan dilampirkan pada bagian ini setelah tahap UI/UX selesai, sesuai timeline pengerjaan di bagian 2.5.

---

## 4. Persetujuan Klien

Para pihak dengan ini mengakui dan menyetujui bahwa rincian yang diuraikan di atas secara akurat mencerminkan kesepahaman bersama mengenai keterlibatan dengan Chameleon. Dengan menandatangani dokumen ini, kami menegaskan persetujuan kami atas desain sistem, ruang lingkup proyek, alur sistem, dan persyaratan fungsional sebagaimana yang ditetapkan di dalamnya.

Kami selanjutnya mengakui bahwa setiap perubahan terhadap rincian keterlibatan yang dijelaskan dalam perjanjian ini memerlukan konfirmasi tertulis terlebih dahulu dari kedua belah pihak.

Selain itu, kami memahami bahwa setiap permintaan baru di luar ruang lingkup yang telah ditetapkan atau penyesuaian terhadap rencana proyek secara keseluruhan yang dilakukan setelah pelaksanaan perjanjian ini akan dianggap sebagai perintah perubahan dan dapat mengakibatkan revisi anggaran serta jadwal proyek.
