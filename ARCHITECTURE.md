# RNF ERP - Enterprise Architecture Guidelines 🏛️

Dokumen ini adalah "Buku Suci" standar penulisan kode untuk menjamin sistem ini bisa dibaca, dikembangkan, dan dirawat hingga puluhan tahun ke depan, sesuai dengan standar *Enterprise Software* (SAP, Accurate, Oracle).

## 1. Aturan Emas (The Golden Rules)
1. **Strictly Typed:** Tidak ada variabel siluman. Semua data di Backend (Java) dan Frontend (TypeScript) wajib memiliki tipe data yang jelas.
2. **Decoupling (Pemisahan Total):** *Controller* tidak boleh berisi logika perhitungan. Logika HANYA boleh ada di *Service Layer*.
3. **No Magic Strings:** Semua konstanta, status, dan *role* harus menggunakan `Enum`.
4. **Resilience:** Jika terjadi *error* di database, sistem tidak boleh mati. Harus ada *Global Exception Handler* yang memberikan pesan JSON rapi ke Frontend.

---

## 2. Struktur Backend (Java Spring Boot)
Kita menggunakan pola **Domain-Driven Design (DDD)** yang dimodifikasi. Setiap modul bisnis hidup mandiri.

```text
src/main/java/com/rnf/erp/
├── core/                   # Logika sistem global
│   ├── config/             # (Security, CORS, Swagger)
│   ├── exception/          # (GlobalErrorHandler)
│   └── security/           # (JWT Filters)
├── modules/                # Jantung Bisnis RNF
│   ├── inventory/          # Domain: Gudang & Barang
│   │   ├── controller/     # API Endpoints (Menerima request)
│   │   ├── service/        # Business Logic (Perhitungan, Validasi)
│   │   ├── repository/     # Database Queries (JPA)
│   │   ├── domain/         # Entities (Tabel Database)
│   │   └── dto/            # Data Transfer Object (Input/Output JSON)
│   ├── wip/                # Domain: Work In Progress
│   └── finance/            # Domain: Keuangan
```

---

## 3. Struktur Frontend (React TypeScript)
Kita menggunakan arsitektur **Feature-Sliced Design (FSD)** yang terbukti mampu menangani ratusan halaman UI tanpa membuat struktur folder berantakan.

```text
src/
├── app/                    # Entry point, Global Providers (Zustand/Redux), Router
├── shared/                 # Komponen umum yang dipakai di mana saja
│   ├── components/         # (Buttons, Tables, Modals - Shadcn UI)
│   ├── utils/              # (Formatters mata uang, Helper tanggal)
│   └── api/                # (Axios base instance)
├── features/               # Potongan bisnis yang independen
│   ├── inventory/          
│   │   ├── api/            # API calls khusus inventory
│   │   ├── components/     # (FormItem, StockTable)
│   │   └── types/          # (Interface TypeScript)
├── pages/                  # Halaman spesifik yang menggabungkan berbagai feature
│   ├── InventoryMasterPage.tsx
│   └── DashboardPage.tsx
```

Dengan pedoman tata letak kode seketat ini, ribuan baris kode tidak akan kusut (*spaghetti code*), dan puluhan *programmer* baru di masa depan bisa dengan mudah memahami cara kerja ERP PT. RNF.

---

## 4. Centralized System Configuration (SPRO / Technical Settings)
Standar emas arsitektur *Enterprise* (berkaca pada SAP SPRO dan Odoo Technical Settings) mewajibkan **Segregation of Duties** yang ketat antara "Layar Transaksi" dan "Layar Konfigurasi".

**Dilarang Keras:** Menempatkan tombol "Edit Format Nomor" atau "Konfigurasi Template Global" di dalam layar operasional harian (seperti *Form Journal Voucher*). 

Seluruh elemen yang bersifat makro dan mengatur perilaku sistem HANYA boleh diletakkan di dalam modul **System Configuration / Master Data Management**. Elemen-elemen tersebut meliputi:
1.  **Document Numbering Sequence:** Pengaturan format nomor bukti (Contoh: `JV-2026-0004`), *prefix/suffix*, panjang digit, dan mekanisme *reset* bulanan/tahunan.
2.  **Global Templates (Memorize):** Manajemen terpusat untuk mengedit, menghapus, atau meninjau seluruh *template* jurnal rutin (Gaji, Sewa, Penyusutan) milik seluruh divisi.
3.  **Financial Core Mapping:** Penentuan *Default Account* untuk Laba Ditahan, Selisih Kurs, PPN Masukan/Keluaran, dan Saldo Awal.
4.  **User Roles & Security:** Pengaturan hak akses (*Read, Write, Approve, Post*) per modul untuk setiap entitas karyawan.

Dengan pemusatan ini, layar transaksi (*Frontend*) akan tetap sangat cepat, bersih (*Clean UI*), dan terhindar dari ketidaksengajaan staf yang merusak format sistem global.

---

## 5. Enterprise Reporting Architecture (Strategy Pattern)
Untuk menangani puluhan hingga ratusan variasi laporan keuangan (seperti *Balance Sheet*, *Profit & Loss*, dan visualisasi *Dashboard*), kita diharamkan membuat ratusan file React UI (*hardcoding*) atau meletakkan tumpukan logika `if-else` dalam satu *file viewer*.

Kita mengadopsi kerangka kerja layaknya **SAP ALV (ABAP List Viewer)** dan **Odoo XML Views**:
1.  **Universal Viewer Engine (`EnterpriseReportViewer.tsx`)**: Satu-satunya file yang bertugas menggambar tabel, melakukan *pagination*, dan mengekspor ke PDF. Mesin ini dibuat "buta" terhadap logika bisnis akuntansi.
2.  **Report Definitions (Cetak Biru)**: Logika untuk setiap laporan (berapa kolom, data apa yang ditarik, apakah ini grafik atau tabel) diekstraksi ke dalam *file TypeScript* statis di dalam folder `definitions/`.
3.  **Dynamic Definition Loader**: Ketika *user* membuka suatu laporan, mesin akan mencari cetak biru dari *Registry*, lalu memuat tata letak dan fungsi penarikan datanya secara dinamis saat di-*runtime* (tanpa beban memori yang tidak perlu).

Pemisahan ini memastikan bahwa penambahan 100 laporan baru di masa depan dapat dilakukan hanya dengan membuat 100 *file* cetak biru kecil (konfigurasi data), tanpa sedikit pun merusak kode *User Interface* atau mengorbankan kecepatan aplikasi (*Zero Overhead*).
