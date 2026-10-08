# Deploy RNF ERP ke Hostinger Shared Hosting

Stack: **React SPA + Laravel (PHP) + MySQL/MariaDB**. Backend Java di `backend/` tidak dipakai di Hostinger.

Modul yang sudah terhubung ke database: **Manajemen User** dan **Persediaan** (master barang, kategori, satuan, customer, barang masuk/keluar, laporan stok dari data yang sama).

## Arsitektur di server

```
~/domains/namadomain.com/
├── laravel/                 ← seluruh folder backend-laravel (di luar public_html)
│   ├── app/
│   ├── .env
│   └── public/              ← isinya disalin / di-symlink ke public_html
└── public_html/             ← Document Root
    ├── index.php            ← dari laravel/public
    ├── .htaccess
    ├── index.html           ← hasil npm run build (React)
    └── assets/
```

## 1. Database MySQL (hPanel)

1. Buat database + user MySQL.
2. Catat: host (biasanya `localhost`), nama database, username, password.

## 2. Upload Laravel

1. Upload isi `backend-laravel/` ke folder `laravel/` (bukan langsung ke `public_html`).
2. Folder `vendor/` boleh di-upload, atau jalankan `composer install --no-dev` via SSH.
3. Salin isi `laravel/public/` ke `public_html/` (`index.php`, `.htaccess`).
4. Edit `public_html/index.php`: pastikan path `__DIR__.'/../laravel/...'` mengarah ke folder Laravel (sesuaikan jika struktur Hostinger berbeda).

Contoh `public_html/index.php` jika Laravel ada di `~/laravel`:

```php
require __DIR__.'/../laravel/vendor/autoload.php';
$app = require_once __DIR__.'/../laravel/bootstrap/app.php';
```

Pastikan `public_html/.htaccess` tetap meneruskan header `Authorization` (sudah ada di `backend-laravel/public/.htaccess`).

## 3. File `.env`

Salin `.env.example` menjadi `.env` lalu isi:

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://namadomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=user_mysql
DB_PASSWORD=password_mysql

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

Via SSH:

```bash
cd ~/laravel
php artisan key:generate
php artisan jwt:secret
php artisan migrate --force
php artisan db:seed --force
chmod -R 775 storage bootstrap/cache
```

Tanpa SSH: generate `APP_KEY` dan `JWT_SECRET` di komputer lokal, tempel ke `.env` di File Manager, lalu import `database/hostinger.sql` via phpMyAdmin.

## 4. Build & upload frontend

```bash
cd frontend
npm install
npm run build
```

Salin seluruh isi `frontend/dist/` ke `public_html/` (jangan menimpa `index.php` dan `.htaccess` Laravel).

React memanggil API relatif ke `/api` (contoh: `/api/auth/login`).

## 5. Akun awal (setelah seed)

| Nama | Username | Password | Hak Akses |
|---|---|---|---|
| adm | `adm` | `123` | ADMIN |
| Tambahan | `Tambahan` | `123` | ADMINISTRATOR |
| Admin | `admin` | `123` | ADMINISTRATOR |
| Kepala Gudang | `kepala gudang` | `123` | KEPALA GUDANG |
| Admin Gudang | `admin gudang` | `123` | ADMIN |
| Direktur Utama | `direktur` | `fharyadi78` | CFO |

Password disimpan bcrypt, bukan plaintext.

## 6. Tes lokal sebelum upload

Terminal 1:

```bash
cd backend-laravel
php artisan serve
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Vite mem-proxy `/api` ke `http://127.0.0.1:8000`.

## Troubleshooting

- **500 setelah upload:** `storage/` dan `bootstrap/cache` harus writable; `APP_KEY` wajib terisi.
- **401 terus-menerus:** `.htaccess` harus meneruskan header Authorization; cek `JWT_SECRET`.
- **SPA blank di sub-path:** pastikan `index.html` React ada di `public_html` dan rewrite Laravel tidak menimpa file statis.
- **Tabel kosong:** jalankan migrate + seed, atau import SQL.
