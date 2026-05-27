# CakGup Short Link

<p align="center">
  <strong>Aplikasi shortlink sederhana, ringan, dan mudah diduplikasi</strong><br>
  Dibangun dengan GitHub Pages, Google Apps Script, dan Google Sheets.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-GitHub%20Pages-222222?style=for-the-badge&logo=github" alt="GitHub Pages">
  <img src="https://img.shields.io/badge/Backend-Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google" alt="Google Apps Script">
  <img src="https://img.shields.io/badge/Database-Google%20Sheets-34A853?style=for-the-badge&logo=googlesheets" alt="Google Sheets">
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge" alt="GPL-3.0">
</p>

---

## Tentang Aplikasi

**CakGup Short Link** adalah aplikasi untuk membuat, menyimpan, menampilkan, dan mengelola tautan pendek secara sederhana tanpa server berbayar.

Aplikasi ini cocok digunakan untuk:

- tautan kegiatan komunitas;
- tautan kajian, pendaftaran, formulir, dan publikasi;
- tautan donasi atau informasi sosial;
- tautan internal organisasi;
- halaman daftar link publik sederhana;
- pembelajaran integrasi GitHub Pages, Google Apps Script, dan Google Sheets.

> Made with ❤️ by CakGup — didedikasikan untuk ummat.

---

## Gambaran Arsitektur

Aplikasi ini terdiri dari tiga komponen utama:

| Komponen | Fungsi |
|---|---|
| **GitHub Pages** | Menampilkan halaman utama, daftar shortlink, form tambah shortlink, dan proses redirect. |
| **Google Apps Script** | Bertindak sebagai API/backend untuk membuat, membaca, menyelesaikan, dan menonaktifkan shortlink. |
| **Google Sheets** | Menjadi database sederhana untuk menyimpan data link dan log klik. |

Alur sederhananya:

```text
Pengguna membuka /s/nama-link
        ↓
GitHub Pages membaca nama-link
        ↓
Frontend memanggil API Google Apps Script
        ↓
Apps Script mencari data pada Google Sheets
        ↓
Jika ditemukan dan aktif, pengguna diarahkan ke URL tujuan
```

---

## Fitur Utama

- Shortlink berbasis **GitHub Pages**.
- Backend sederhana menggunakan **Google Apps Script**.
- Database ringan menggunakan **Google Sheets**.
- Tema visual **Majapahit** dengan aset gunungan.
- Tampilan responsif untuk desktop dan handphone.
- Halaman utama dengan password statis sederhana.
- Daftar tautan publik.
- Pencarian tautan berdasarkan judul, kategori, atau nama link.
- Form tambah shortlink.
- Tombol buka tautan.
- Tombol salin shortlink.
- Tombol hapus/nonaktifkan shortlink.
- Log klik pada Google Sheets.
- API untuk `create`, `list`, `resolve`, `update`, dan `disable` link.
- Dapat diduplikasi dan dimodifikasi untuk kebutuhan pribadi, komunitas, masjid, pendidikan, atau kegiatan sosial.

---

## Struktur Repository

```text
s/
├── .nojekyll
├── 404.html
├── LICENSE
├── README.md
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── img/
│   │   └── gunungan.png
│   └── js/
│       ├── app.js
│       ├── auth.js
│       └── config.js
└── gas/
    └── Code.gs
```

Penjelasan file utama:

| File/Folder | Keterangan |
|---|---|
| `index.html` | Halaman utama aplikasi. |
| `404.html` | Fallback routing agar URL seperti `/s/nama-link` tetap dapat diproses oleh JavaScript. |
| `.nojekyll` | Mencegah GitHub Pages memproses repo sebagai Jekyll. |
| `assets/css/style.css` | Pengaturan tampilan, layout, warna, dan tema visual. |
| `assets/img/gunungan.png` | Aset visual tema Majapahit. |
| `assets/js/config.js` | Konfigurasi endpoint API Google Apps Script. |
| `assets/js/auth.js` | Logika password statis pada halaman utama. |
| `assets/js/app.js` | Logika aplikasi: daftar link, redirect, tambah link, salin, pencarian, dan hapus. |
| `gas/Code.gs` | Kode backend Google Apps Script. |
| `LICENSE` | Lisensi penggunaan source code. |

---

## Kebutuhan Awal

Sebelum menggunakan aplikasi, siapkan:

1. akun GitHub;
2. repository GitHub;
3. akun Google;
4. Google Apps Script;
5. Google Sheets sebagai database;
6. browser modern seperti Chrome, Edge, Safari, atau Firefox.

---

## Cara Duplikasi Repository

### 1. Fork Repository

Buka repository ini, lalu klik:

```text
Fork
```

Setelah itu, repository akan tersalin ke akun GitHub Anda.

### 2. Clone ke Komputer Lokal

```bash
git clone https://github.com/username/s.git
cd s
```

Ganti `username` dengan username GitHub Anda.

### 3. Ubah Konfigurasi

File yang biasanya perlu disesuaikan:

```text
assets/js/config.js
assets/js/auth.js
gas/Code.gs
```

---

## Cara Deploy ke GitHub Pages

Masuk ke halaman repository Anda, lalu buka:

```text
Settings → Pages
```

Gunakan konfigurasi berikut:

```text
Source : Deploy from a branch
Branch : main
Folder : /root
```

Setelah tersimpan, GitHub Pages akan membuat alamat seperti:

```text
https://username.github.io/s/
```

---

## Konfigurasi Google Apps Script

### 1. Buat Project Apps Script

Buka:

```text
https://script.google.com
```

Buat project baru, misalnya:

```text
CakGup Short Link API
```

### 2. Salin Kode Backend

Buka file:

```text
gas/Code.gs
```

Salin seluruh isinya ke editor Google Apps Script.

### 3. Sesuaikan Konfigurasi

Pada bagian konfigurasi Apps Script, sesuaikan nilai berikut:

```javascript
const CONFIG = {
  SPREADSHEET_ID: "",
  SHEET_LINKS: "links",
  SHEET_LOGS: "click_logs",
  BASE_SHORTLINK: "https://username.github.io/s",
  API_TOKEN: "CHANGE_ME_API_TOKEN"
};
```

Ubah:

```javascript
BASE_SHORTLINK: "https://username.github.io/s"
```

menjadi alamat GitHub Pages milik Anda.

Ubah juga:

```javascript
API_TOKEN: "CHANGE_ME_API_TOKEN"
```

menjadi token pribadi yang kuat, misalnya:

```javascript
API_TOKEN: "token-panjang-acak-yang-sulit-ditebak"
```

> Jangan gunakan token pendek seperti `admin`, `123456`, atau `password`.

---

## Menyiapkan Google Sheets sebagai Database

Terdapat dua pilihan.

### Pilihan A — Otomatis

Biarkan:

```javascript
SPREADSHEET_ID: ""
```

Lalu jalankan fungsi berikut dari Google Apps Script:

```javascript
testSetup
```

Apps Script akan membuat file Google Sheets baru sebagai database.

### Pilihan B — Manual

Buat Google Sheets baru, lalu ambil Spreadsheet ID dari URL.

Contoh URL:

```text
https://docs.google.com/spreadsheets/d/abcd1234/edit
```

Spreadsheet ID-nya adalah:

```text
abcd1234
```

Masukkan ke konfigurasi:

```javascript
SPREADSHEET_ID: "abcd1234"
```

Kemudian jalankan:

```javascript
testSetup
```

Script akan menyiapkan sheet:

```text
links
click_logs
```

---

## Deploy Google Apps Script sebagai Web App

Pada Google Apps Script, klik:

```text
Deploy → New deployment
```

Pilih:

```text
Type       : Web app
Execute as : Me
Access     : Anyone
```

Klik **Deploy**, lalu salin URL Web App yang dihasilkan.

Contoh:

```text
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

---

## Konfigurasi Frontend

Buka file:

```text
assets/js/config.js
```

Cari konfigurasi endpoint API, lalu sesuaikan dengan URL Web App Google Apps Script Anda:

```javascript
API_BASE_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

Simpan, lalu commit dan push perubahan ke GitHub.

---

## Konfigurasi Password Halaman Utama

Aplikasi ini memakai password statis sederhana di sisi frontend.

Buka:

```text
assets/js/auth.js
```

Cari konfigurasi password, misalnya:

```javascript
const STATIC_PASSWORD = "CHANGE_ME_PASSWORD";
```

Ganti dengan password yang Anda inginkan.

> Catatan penting: password statis pada GitHub Pages bukan mekanisme keamanan kuat, karena source JavaScript tetap dapat dilihat oleh pengguna teknis. Gunakan fitur ini hanya sebagai pembatas ringan.

---

## Cara Menggunakan Aplikasi

### 1. Membuka Halaman Utama

Buka alamat GitHub Pages:

```text
https://username.github.io/s/
```

Masukkan password halaman utama apabila diminta.

### 2. Menambahkan Shortlink

Klik tombol tambah shortlink, lalu isi form:

| Field | Contoh Isi |
|---|---|
| API Token | Token yang sama dengan `API_TOKEN` di Apps Script. |
| Link Name | `donasi`, `kajian`, `formulir`, `daftar` |
| Target URL | `https://example.com/formulir` |
| Judul | `Formulir Pendaftaran Kajian` |
| Deskripsi | `Link pendaftaran peserta kajian pekanan.` |
| Kategori | `kajian`, `donasi`, `pendidikan`, `internal` |
| Public | Centang jika ingin tampil pada halaman utama. |

Klik **Simpan Shortlink**.

### 3. Mengakses Shortlink

Jika `link_name` adalah:

```text
donasi
```

maka shortlink dapat diakses melalui:

```text
https://username.github.io/s/donasi
```

### 4. Menyalin Shortlink

Pada daftar link, klik tombol **Salin** untuk menyalin tautan pendek ke clipboard.

### 5. Menonaktifkan Shortlink

Klik tombol **Hapus** pada daftar link. Data tidak langsung dihapus permanen, tetapi statusnya diubah menjadi nonaktif.

---

## Format Data Google Sheets

Sheet `links` umumnya berisi data seperti:

| Kolom | Keterangan |
|---|---|
| `id` | ID unik link. |
| `link_name` | Nama pendek yang dipakai pada URL. |
| `target_url` | URL tujuan asli. |
| `title` | Judul link. |
| `description` | Deskripsi singkat. |
| `category` | Kategori link. |
| `public` | `TRUE` atau `FALSE`. |
| `status` | `aktif` atau `nonaktif`. |
| `created_at` | Waktu pembuatan. |
| `created_by` | Pembuat link. |

Sheet `click_logs` menyimpan catatan akses/klik untuk kebutuhan monitoring sederhana.

---

## Contoh Uji API

### Ping API

```text
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=ping
```

Respons yang diharapkan:

```json
{
  "success": true,
  "message": "Shortlink API aktif"
}
```

### Ambil Daftar Link Publik

```text
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=list
```

### Resolve Shortlink

```text
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?link_name=donasi
```

### Tambah Shortlink via API

```json
{
  "token": "CHANGE_ME_API_TOKEN",
  "action": "create",
  "link_name": "donasi",
  "target_url": "https://example.com/donasi",
  "title": "Donasi",
  "description": "Link donasi resmi",
  "category": "donasi",
  "public": true,
  "created_by": "admin"
}
```

---

## Tips Modifikasi Tampilan

Untuk mengubah warna, font, ukuran kartu, tombol, atau layout, buka:

```text
assets/css/style.css
```

Untuk mengganti gambar tema, ubah file pada:

```text
assets/img/
```

Untuk mengubah teks, label tombol, atau perilaku frontend, sesuaikan:

```text
assets/js/app.js
index.html
```

---

## Catatan Keamanan

Aplikasi ini dibuat agar sederhana dan mudah dipelajari. Namun, ada beberapa hal penting yang perlu diperhatikan:

- Jangan menggunakan token API yang mudah ditebak.
- Jangan menyimpan rahasia penting di frontend.
- Password statis pada JavaScript hanya pembatas ringan, bukan autentikasi kuat.
- Jangan gunakan aplikasi ini untuk tautan phishing, malware, penipuan, spam, atau konten ilegal.
- Untuk kebutuhan produksi serius, pertimbangkan backend dengan autentikasi yang lebih kuat.
- Periksa secara berkala isi Google Sheets agar tidak ada tautan yang disalahgunakan.

---

## Troubleshooting

### Halaman GitHub Pages belum muncul

Cek pengaturan:

```text
Settings → Pages
```

Pastikan branch dan folder sudah benar.

### Shortlink tidak redirect

Periksa:

- URL Google Apps Script pada `assets/js/config.js`;
- deployment Apps Script sudah aktif;
- `link_name` ada di sheet `links`;
- status link masih `aktif`;
- file `404.html` tersedia di root repository.

### Token tidak valid

Periksa:

- token yang diinput sama dengan `API_TOKEN` di `gas/Code.gs`;
- Apps Script sudah disimpan;
- Apps Script sudah di-deploy ulang setelah perubahan;
- browser tidak memakai cache lama.

### Perubahan tampilan tidak muncul

Lakukan hard refresh:

```text
Ctrl + F5
```

Atau tambahkan query cache buster:

```text
https://username.github.io/s/?v=2
```

---

## Rekomendasi Pengembangan Lanjutan

Beberapa ide pengembangan:

- login admin berbasis Google OAuth;
- dashboard statistik klik;
- QR Code otomatis untuk setiap shortlink;
- kategori link yang lebih rapi;
- ekspor laporan klik ke CSV/Excel;
- validasi domain tujuan;
- custom alias dengan aturan tertentu;
- halaman publik per kategori;
- integrasi notifikasi Telegram atau WhatsApp.

---

## Lisensi

Repository ini menggunakan lisensi **GPL-3.0**.

Anda dapat menggunakan, mempelajari, memodifikasi, dan mendistribusikan ulang source code ini dengan tetap memperhatikan ketentuan lisensi yang berlaku.

---

## Dedikasi

Aplikasi ini didedikasikan untuk **ummat** sebagai ikhtiar kecil dalam memudahkan pengelolaan tautan digital untuk kegiatan dakwah, pendidikan, sosial, kemanusiaan, komunitas, dan kebaikan lainnya.

Semoga aplikasi ini menjadi jalan manfaat, memudahkan urusan banyak orang, dan menjadi amal jariyah bagi siapa pun yang mengembangkan serta menggunakannya untuk kebaikan.

<p align="center">
  <strong>Made with ❤️ by CakGup</strong><br>
  <em>Didedikasikan untuk ummat.</em>
</p>
