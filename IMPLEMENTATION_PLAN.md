# Final Implementation Plan: ERP PT. RNF (On-Premise Enterprise Stack)

Ini adalah *blueprint* final dari sistem ERP PT. RNF. Arsitektur ini menggabungkan ketangguhan sistem kelas *Enterprise* (ala SAP/Accurate) dengan efisiensi infrastruktur modern.

## 🏆 Kesepakatan Arsitektur Akhir (The Final Deal)

- **TIDAK ADA** biaya langganan VPS Cloud bulanan.
- **TIDAK ADA** sistem sinkronisasi dua arah yang berisiko data bentrok.
- **TIDAK ADA** ketergantungan pada internet untuk operasional harian di dalam kantor.

> [!IMPORTANT]
> **Kebutuhan Fisik (Hardware & Listrik):**
> Anda wajib menyediakan **1 PC Server (Mini PC)** di kantor Balikpapan yang menyala 24 jam dan dilindungi oleh UPS. Jika listrik kantor mati total, maka akses sistem dari luar kota akan terputus hingga PC Server menyala kembali.

---

## 🛠️ The Tech Stack (Standar SAP & Accurate)

1.  **Backend (Core Logic):** **Java Spring Boot**. Sangat aman, tangguh, dan didesain untuk memproses transaksi finansial tingkat tinggi.
2.  **Frontend (The UI):** **React.js**. *Framework* modern yang menghasilkan tampilan mulus tanpa *loading* ulang halaman.
3.  **Database:** **PostgreSQL**. Database terkuat untuk sistem relasional ERP.
4.  **Aplikasi Kantor (LAN):** **Electron**. Kode React akan dibungkus menjadi **Aplikasi Desktop Asli (.exe / .dmg)** agar admin kantor bisa langsung buka dari *Desktop* tanpa browser.
    *   *(Note: Pada saat pembungkusan Electron nanti, pastikan untuk menyuntikkan kode `Menu.buildFromTemplate()` agar menu Berkas, Persiapan, Daftar ter-render sebagai Native OS Menu Bar yang menyatu dengan Windows/Mac).*
5.  **Akses Luar Kota (Cloud):** **Cloudflare Tunnels**. Terowongan aman untuk mengakses server kantor dari HP/Laptop via domain internet.

---

## 💻 Cara Kerja Lingkungan PT. RNF

### A. Karyawan di Dalam Kantor (Offline dari Internet Global)
Karyawan membuka Aplikasi Desktop (`.exe`) dari PC mereka. Aplikasi ini menembak IP lokal Server Mini PC (contoh: `192.168.1.100`) via kabel LAN.
*   **Hasil:** Kecepatan instan, operasional jalan terus 100% meskipun koneksi Indihome/Telkom di depan kantor Anda putus total.

### B. Bos & Staf Lapangan (Akses Luar Kantor)
Dari luar kota, Anda membuka browser di HP/Laptop dan mengetik `erp.rnf.com`. Trafik ini ditangkap oleh Cloudflare Tunnels dan dilemparkan secara aman langsung ke Server Mini PC di atas meja kantor Anda.
*   **Hasil:** Laporan *real-time*, melihat stok persis seperti yang dilihat oleh admin di detik yang sama.

---

## 📦 Modul Prioritas (Tahap 1: General Ledger / Buku Besar)

Berdasarkan diskusi terakhir, kita akan mengubah fokus pengerjaan pertama. Kita tidak lagi memulai dari *Inventory*, melainkan langsung masuk ke jantung akuntansi: **Buku Besar (General Ledger)**.

### 1. Master Data Keuangan
- **Mata Uang (Currency):** Pendaftaran mata uang (IDR, USD) & *Exchange Rate*.
- **Daftar Akun (Chart of Accounts / COA):** Pembuatan struktur *tree* akun (Aktiva, Pasiva, Modal, Pendapatan, Biaya).

### 2. Transaksi Jurnal
- **Bukti Jurnal Umum (Journal Voucher):** Form *double-entry* untuk memasukkan transaksi debit/kredit manual.
- **Buku Besar (General Ledger):** Melihat mutasi per-akun.

### 3. Arsitektur Antarmuka (UI/UX) ala Accurate 4
- Tampilan akan mengadopsi **struktur tata letak Accurate 4** (Sidebar "Penjelajah" di kiri, Tab Windows di atas, dan Diagram Navigasi *Flowchart* di tengah).
- Meskipun *layout*-nya sama persis dengan Accurate 4 agar pengguna familiar, kita akan memolesnya menggunakan teknologi desain modern (rata, bersih, elegan) sehingga terlihat seperti *software* tahun 2026.
- **Halaman Beranda (Dashboard Overview):** Halaman utama yang langsung tampil saat aplikasi dibuka, berisi:
  - 4 Kartu Ringkasan (Total Pendapatan, Barang Terjual, Total Pengeluaran, Jurnal Bulan Ini) dengan mini chart.
  - Grafik Statistik Keuangan (Area Chart: Pendapatan vs Pengeluaran per bulan).
  - Tabel Transaksi Jurnal Terbaru (5 transaksi terakhir).
  - Panel Peringatan Stok Persediaan (status AMAN / RENDAH / KRITIS).

### 4. Status Data & Strategi Koneksi API

> [!IMPORTANT]
> **Saat ini seluruh data yang tampil di frontend (Dashboard Overview, Flowchart, dll.) masih berupa data *dummy/simulasi*.** Data ini sengaja dipasang untuk keperluan prototyping UI agar tampilan terlihat hidup dan realistis.

**Rencana Integrasi API Backend (Spring Boot):**

| Komponen Frontend | Endpoint API (Rencana) | Keterangan |
|---|---|---|
| Kartu Total Pendapatan | `GET /api/v1/dashboard/summary` | Mengambil total pendapatan, pengeluaran, jumlah barang terjual, dan jumlah jurnal bulan berjalan |
| Grafik Statistik Keuangan | `GET /api/v1/dashboard/statistics?period=12m` | Data bulanan pendapatan vs pengeluaran untuk chart |
| Tabel Jurnal Terbaru | `GET /api/v1/journals?limit=5&sort=date,desc` | 5 jurnal terakhir dari modul Bukti Jurnal Umum |
| Peringatan Stok | `GET /api/v1/inventory/alerts` | Item persediaan dengan stok di bawah batas minimum |
| Daftar Akun (COA) | `GET /api/v1/accounts` | Struktur *tree* akun untuk modul Buku Besar |
| Bukti Jurnal Umum | `POST /api/v1/journals` | Membuat entri jurnal *double-entry* baru |
| Mata Uang | `GET /api/v1/currencies` | Daftar mata uang dan *exchange rate* |

> [!NOTE]
> Setelah backend Spring Boot dan database PostgreSQL siap, semua data *dummy* akan diganti dengan panggilan API nyata menggunakan **Axios**. Koneksi akan menggunakan *base URL* yang bisa diatur:
> - **LAN (Kantor):** `http://192.168.1.100:8080/api/v1/`
> - **Cloud (Luar Kota):** `https://erp.rnf.com/api/v1/`

---

## 🔍 Audit Kesesuaian Standar SAP & Accurate

### ✅ Yang Sudah Sesuai Standar

| Aspek | SAP/Accurate | RNF Enterprise | Status |
|---|---|---|---|
| Arsitektur 3-Tier (Client → Server → DB) | ✅ | ✅ Spring Boot + React + PostgreSQL | ✅ Sama |
| Double-Entry Accounting (Debit = Kredit) | ✅ | ✅ Direncanakan di Fase 2 | ✅ Sama |
| Chart of Accounts (COA) Hierarki | ✅ | ✅ Tree: Aktiva → Kas → Kas Kecil | ✅ Sama |
| Aplikasi Desktop (bukan web biasa) | ✅ | ✅ Electron (.exe) | ✅ Sama |
| UI Explorer / Penjelajah + Flowchart | ✅ Accurate | ✅ Sudah dibangun | ✅ Sama |
| Dashboard Overview | ✅ SAP Fiori | ✅ Sudah dibangun | ✅ Sama |
| REST API untuk integrasi | ✅ SAP OData | ✅ Spring Boot REST | ✅ Sama |

### ⚠️ Fitur Kritis yang Wajib Dibangun (Belum Ada)

#### 🔴 Prioritas TINGGI (Wajib ada sebelum Go-Live)

| # | Fitur | Deskripsi | Standar |
|---|---|---|---|
| 1 | **Periode Fiskal & Tutup Buku** | Sistem periode akuntansi (bulan/tahun). Setelah ditutup, tidak bisa lagi membuat/edit jurnal di periode tersebut. | SAP + Accurate |
| 2 | **Audit Trail** | Setiap perubahan data (buat, edit, hapus) tercatat: siapa, kapan, apa yang berubah. Tidak bisa dihapus. | SAP + Accurate |
| 3 | **Hak Akses / RBAC** | Role-Based Access Control. Contoh: Admin bisa edit COA, Operator hanya bisa input jurnal, Bos hanya bisa lihat laporan. | SAP + Accurate |
| 4 | **Nomor Dokumen Otomatis** | Auto-numbering dengan format kustom. Contoh: `JU-2026-0001`, `JU-2026-0002`, dst. Reset per tahun/bulan. | SAP + Accurate |
| 5 | **Laporan Keuangan** | Minimal 3 laporan wajib: **Neraca (Balance Sheet)**, **Laba/Rugi (Income Statement)**, dan **Trial Balance**. Bisa di-export ke PDF/Excel. | SAP + Accurate |
| 6 | **Validasi Jurnal Seimbang** | Sistem MENOLAK menyimpan jurnal jika total Debit ≠ total Kredit. Ini inti dari *double-entry*. | SAP + Accurate |
| 7 | **System Configuration (SPRO)** | Modul sentral khusus Super Admin untuk mengatur Format Penomoran Dokumen (Sequence), *Global Templates*, dan Pemetaan Akun Inti secara terpusat, dijauhkan dari layar transaksi staf. | SAP + Odoo |

#### 🟡 Prioritas SEDANG (Penting untuk operasional penuh)

| # | Fitur | Deskripsi | Standar |
|---|---|---|---|
| 7 | **Multi-Cabang / Multi-Perusahaan** | Satu instalasi bisa menangani beberapa entitas bisnis / cabang dengan COA terpisah. | SAP |
| 8 | **Pajak (PPN & PPh)** | Perhitungan otomatis PPN 11% pada penjualan/pembelian. Potongan PPh pada pembayaran vendor. | Accurate |
| 9 | **Approval Workflow** | Persetujuan berjenjang. Contoh: Jurnal > Rp 50jt harus disetujui oleh Manager sebelum diproses. | SAP |
| 10 | **Backup & Restore Database** | Fitur bawaan untuk backup database secara terjadwal dan restore jika terjadi bencana. | SAP + Accurate |
| 11 | **Cetak Dokumen** | Template cetak untuk Bukti Jurnal, Invoice, Faktur, dll. dengan logo perusahaan. | Accurate |
| 12 | **Import/Export Data** | Import data massal dari Excel (misal: COA awal, saldo awal). Export laporan ke Excel/PDF. | SAP + Accurate |

#### 🟢 Prioritas RENDAH (Nice-to-have, bisa ditambahkan bertahap)

| # | Fitur | Deskripsi | Standar |
|---|---|---|---|
| 13 | **Multi-Bahasa** | Antarmuka bisa diubah ke Bahasa Inggris untuk investor/auditor asing. | SAP |
| 14 | **Dashboard Kustomisasi** | User bisa mengatur widget mana yang tampil di Dashboard Overview mereka. | SAP Fiori |
| 15 | **Notifikasi Real-time** | Pemberitahuan saat stok kritis, jurnal menunggu approval, atau periode akan tutup. | SAP |
| 16 | **Integrasi Bank** | Rekonsiliasi otomatis antara mutasi bank dan catatan di sistem. | Accurate |

---

## 🚀 Peta Jalan Pembangunan (Roadmap)

1.  **Fase 1 — Frontend Prototyping (✅ SELESAI):**
    - ✅ Struktur layout Accurate 4 (Header, Sidebar Penjelajah, Tab, Footer).
    - ✅ Flowchart navigasi Buku Besar (6 modul dengan panah SVG).
    - ✅ Dashboard Overview (Beranda) dengan kartu ringkasan, grafik, tabel jurnal, dan peringatan stok.
    - ✅ Komponen dipisah modular sesuai Feature-Sliced Design (bukan monolitik).
    - ⚠️ Semua data masih *dummy/simulasi*.

2.  **Fase 1.5 — System Configuration Module (SPRO/Technical Settings):**
    - Membangun UI terpusat untuk Manajemen Nomor Dokumen (Sequence Prefix).
    - Membangun antarmuka Master Template Jurnal (Global Memorize list).
    - Membangun *Account Mapping Settings* (Akun Default Laba Ditahan, PPN, dll).

3.  **Fase 2 — Backend Development (Java Spring Boot):**
    - Merancang skema database PostgreSQL (tabel `accounts`, `journals`, `journal_lines`, `currencies`, `inventory_items`, `audit_logs`, `users`, `roles`).
    - Membuat REST API endpoints sesuai tabel di atas.
    - Implementasi *double-entry accounting* logic + validasi Debit = Kredit.
    - Implementasi Periode Fiskal & mekanisme Tutup Buku.
    - Implementasi Audit Trail (log otomatis setiap perubahan data).
    - Implementasi RBAC (Spring Security + JWT).
    - Auto-numbering dokumen.

3.  **Fase 3 — Integrasi Frontend ↔ Backend:**
    - Mengganti seluruh data *dummy* dengan panggilan API menggunakan Axios.
    - Implementasi *state management* (Zustand/Redux) untuk data global.
    - Error handling, loading states, dan validasi form.
    - Membangun halaman Laporan Keuangan (Neraca, Laba/Rugi, Trial Balance).
    - Implementasi fitur Export ke PDF/Excel.

4.  **Fase 4 — Deployment & Packaging:**
    - Membungkus React ke dalam Electron (.exe) untuk akses LAN kantor.
    - Setup Cloudflare Tunnels untuk akses luar kota.
    - Konfigurasi PC Server Mini di kantor Balikpapan.
    - Setup Backup Database otomatis terjadwal.
