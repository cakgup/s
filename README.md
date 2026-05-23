# CakGup Short Link

**CakGup Short Link** adalah aplikasi shortlink sederhana berbasis **GitHub Pages**, **Google Apps Script**, dan **Google Sheets**. Aplikasi ini dapat digunakan untuk membuat tautan pendek.

> Made with ❤️ by CakGup — didedikasikan untuk ummat.

---

## 1. Gambaran Umum

Aplikasi ini terdiri dari dua bagian utama:

| Komponen | Fungsi |
|---|---|
| GitHub Pages | Menampilkan halaman shortlink, daftar tautan publik, form tambah shortlink, dan redirect pengguna |
| Google Apps Script | Menjadi API backend untuk menyimpan, mengambil, dan menonaktifkan shortlink |
| Google Sheets | Menjadi database sederhana untuk menyimpan daftar shortlink dan log klik |

Alur sederhananya:

```text
Pengguna membuka /link/nama-link
        ↓
GitHub Pages membaca nama-link
        ↓
GitHub Pages memanggil API Google Apps Script
        ↓
Google Apps Script mencari data di Google Sheets
        ↓
Jika ditemukan, pengguna diarahkan ke target URL
```

---

## 2. Fitur Utama

Fitur yang tersedia:

1. Halaman shortlink berbasis GitHub Pages.
2. Tema visual Majapahit dengan aset gunungan.
3. Tampilan responsif untuk handphone.
4. Password statis sederhana sebelum masuk halaman utama.
5. Daftar tautan publik.
6. Pencarian tautan berdasarkan judul, kategori, atau link name.
7. Form tambah shortlink.
8. Tombol buka tautan.
9. Tombol salin shortlink.
10. Tombol hapus/nonaktifkan shortlink.
11. Log klik pada Google Sheets.
12. API Google Apps Script untuk create, list, resolve, update, dan disable link.

---

## 3. Struktur Folder

Struktur utama source code:

```text
link/
├── .nojekyll
├── index.html
├── 404.html
├── README.md
├── Kode.gs
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

Penjelasan:

| File/Folder | Keterangan |
|---|---|
| `index.html` | Halaman utama aplikasi |
| `404.html` | Halaman fallback agar `/s/nama-link` tetap bisa diproses di GitHub Pages |
| `.nojekyll` | Agar GitHub Pages tidak memproses situs sebagai Jekyll |
| `assets/css/style.css` | Pengaturan tampilan dan tema Majapahit |
| `assets/img/gunungan.png` | Aset visual gunungan |
| `assets/js/config.js` | Konfigurasi endpoint API |
| `assets/js/auth.js` | Logika password statis halaman utama |
| `assets/js/app.js` | Logika redirect, daftar link, tambah link, salin, dan hapus |
| `Kode.gs` | Kode Google Apps Script untuk disalin langsung |
| `gas/Code.gs` | Salinan kode Apps Script dalam folder terpisah |

---

## 4. Persiapan

Sebelum menggunakan aplikasi, siapkan:

1. Akun GitHub.
2. Repository GitHub, misalnya `link`.
3. Akun Google.
4. Google Apps Script.
5. Google Sheets sebagai database, atau biarkan Apps Script membuat database otomatis.

---

## 5. Instalasi di GitHub Pages

### 5.1 Buat Repository

Buat repository baru di GitHub, misalnya:

```text
link
```

Jika username GitHub Anda adalah `username`, maka alamat GitHub Pages nantinya dapat menjadi:

```text
https://username.github.io/link/
```

### 5.2 Upload Source Code

Upload semua file source ke repository tersebut.

Pastikan struktur file di repository seperti ini:

```text
index.html
404.html
.nojekyll
assets/
gas/
Kode.gs
README.md
```

### 5.3 Aktifkan GitHub Pages

Masuk ke:

```text
Settings → Pages
```

Lalu gunakan pengaturan:

```text
Source : Deploy from a branch
Branch : main
Folder : /root
```

Simpan pengaturan tersebut.

Setelah aktif, buka:

```text
https://username.github.io/link/
```

---

## 6. Konfigurasi Google Apps Script

### 6.1 Buat Project Apps Script

Buka:

```text
https://script.google.com
```

Buat project baru, misalnya:

```text
shortlink
```

### 6.2 Salin Kode Apps Script

Buka file:

```text
Kode.gs
```

atau:

```text
gas/Code.gs
```

Salin seluruh isinya ke editor Apps Script.

### 6.3 Ubah Konfigurasi Token

Di bagian atas `Kode.gs`, cari konfigurasi berikut:

```javascript
const CONFIG = {
  SPREADSHEET_ID: "",
  SHEET_LINKS: "links",
  SHEET_LOGS: "click_logs",
  BASE_SHORTLINK: "https://username.github.io/link",
  API_TOKEN: "CHANGE_ME_API_TOKEN"
};
```

Ubah:

```javascript
BASE_SHORTLINK: "https://username.github.io/link"
```

menjadi alamat GitHub Pages Anda.

Ubah:

```javascript
API_TOKEN: "CHANGE_ME_API_TOKEN"
```

menjadi token pribadi yang kuat, misalnya:

```javascript
API_TOKEN: "token-panjang-acak-yang-anda-buat-sendiri"
```

Jangan gunakan token yang mudah ditebak untuk penggunaan produksi.

---

## 7. Menyiapkan Database Google Sheets

Ada dua pilihan.

### Pilihan A — Otomatis

Biarkan:

```javascript
SPREADSHEET_ID: ""
```

Lalu jalankan fungsi:

```javascript
testSetup
```

Apps Script akan otomatis membuat file Google Sheets baru sebagai database.

Setelah berhasil, hasil eksekusi akan menampilkan `spreadsheet_url`. Buka URL tersebut untuk melihat database.

### Pilihan B — Menggunakan Google Sheets Sendiri

Buat Google Sheets baru secara manual.

Ambil Spreadsheet ID dari URL.

Contoh URL Google Sheets:

```text
https://docs.google.com/spreadsheets/d/abcd/edit
```

Spreadsheet ID-nya adalah:

```text
abcd
```

Lalu isi pada konfigurasi:

```javascript
SPREADSHEET_ID: "abcd"
```

Kemudian jalankan:

```javascript
testSetup
```

Script akan membuat sheet:

```text
links
click_logs
```

---

## 8. Deploy Google Apps Script sebagai Web App

Klik:

```text
Deploy → New deployment
```

Pilih:

```text
Type        : Web app
Execute as  : Me
Access      : Anyone
```

Klik **Deploy**.

Setelah itu, salin URL Web App. Bentuknya seperti:

```text
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Jangan bagikan Script ID aktif atau token API Anda secara publik apabila repository akan digunakan orang lain.

---

## 9. Konfigurasi Frontend

Buka file:

```text
assets/js/config.js
```

Cari bagian endpoint API:

```javascript
API_BASE_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

Ganti dengan URL Web App milik Anda:

```javascript
API_BASE_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

Gunakan URL Web App dari deployment Apps Script Anda.

### Catatan Keamanan

Jangan menyimpan token API pada `config.js`.

Token API hanya dimasukkan saat menggunakan form tambah/hapus shortlink dan hanya disimpan sementara di browser session.

---

## 10. Konfigurasi Password Halaman Utama

Aplikasi ini menggunakan password statis sederhana di sisi frontend.

Buka:

```text
assets/js/auth.js
```

Cari konfigurasi password, misalnya:

```javascript
const STATIC_PASSWORD = "CHANGE_ME_PASSWORD";
```

Ganti dengan password yang Anda inginkan.

Contoh:

```javascript
const STATIC_PASSWORD = "password-akses-saya";
```

### Catatan Penting

Password statis di GitHub Pages bukan keamanan kuat karena source JavaScript dapat dilihat oleh pengguna teknis.

Fitur ini hanya berfungsi sebagai pembatas ringan agar halaman utama tidak langsung terbuka untuk umum.

---

## 11. Cara Menambahkan Shortlink

Buka halaman utama:

```text
https://username.github.io/link/
```

Masukkan password halaman utama.

Klik:

```text
Tambah Shortlink
```

Isi form:

| Field | Isi |
|---|---|
| API Token | Token yang sama dengan `API_TOKEN` di Apps Script |
| Link Name | Nama pendek link, misalnya `donasi` |
| Target URL | URL tujuan lengkap, misalnya `https://example.com/donasi` |
| Judul | Judul tautan |
| Deskripsi | Deskripsi singkat |
| Kategori | Kategori tautan |
| Tampilkan di halaman utama | Centang jika ingin tampil di daftar publik |

Klik:

```text
Simpan Shortlink
```

Jika berhasil, shortlink dapat diakses melalui:

```text
https://username.github.io/link/donasi
```

---

## 12. Cara Menghapus Shortlink

Pada daftar tautan publik, klik tombol:

```text
Hapus
```

Sistem akan meminta konfirmasi.

Jika disetujui, data di Google Sheets tidak dihapus permanen, tetapi statusnya diubah menjadi:

```text
nonaktif
```

Dengan demikian, tautan tidak tampil lagi di halaman utama dan tidak bisa digunakan untuk redirect.

---

## 13. Cara Mengedit Data Shortlink Manual

Buka Google Sheets database.

Pada sheet:

```text
links
```

Anda dapat mengubah:

| Kolom | Keterangan |
|---|---|
| `link_name` | Nama shortlink |
| `target_url` | URL tujuan |
| `title` | Judul |
| `description` | Deskripsi |
| `category` | Kategori |
| `public` | `TRUE` atau `FALSE` |
| `status` | `aktif` atau `nonaktif` |

Jika ingin menyembunyikan link dari halaman utama tetapi tetap bisa digunakan, isi:

```text
public = FALSE
status = aktif
```

Jika ingin menonaktifkan link:

```text
status = nonaktif
```

---

## 14. Cara Uji API

### 14.1 Ping API

Buka:

```text
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=ping
```

Hasil yang diharapkan:

```json
{
  "success": true,
  "message": "Shortlink API aktif"
}
```

### 14.2 Ambil Daftar Link Publik

Buka:

```text
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=list
```

### 14.3 Resolve Shortlink

Buka:

```text
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?link_name=donasi
```

Hasil sukses berisi `target_url`.

### 14.4 Tambah Shortlink melalui API

Contoh request `POST`:

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

## 15. Cara Modifikasi Tampilan

### 15.1 Mengubah Warna

Buka:

```text
assets/css/style.css
```

Cari bagian `:root`, misalnya:

```css
:root {
  --bg-dark: #0E0905;
  --gold: #D4AF37;
  --cream: #F5EDD8;
}
```

Ubah warna sesuai kebutuhan.

### 15.2 Mengubah Logo/Gunungan

Ganti file:

```text
assets/img/gunungan.png
```

dengan gambar lain menggunakan nama file yang sama.

Jika nama file berbeda, sesuaikan path gambar pada `index.html` dan `404.html`.

### 15.3 Mengubah Judul Halaman

Buka:

```text
index.html
404.html
```

Ubah teks seperti:

```text
Short Link
Made with love by ...
```

sesuai kebutuhan.

### 15.4 Mengubah Layout Kartu Link

Buka:

```text
assets/js/app.js
```

Cari fungsi yang menampilkan daftar link publik, lalu sesuaikan struktur HTML kartu.

---

## 16. Cara Menggunakan untuk Masjid/Komunitas Lain

Untuk menduplikasi aplikasi ini:

1. Fork atau download source code.
2. Buat repository GitHub Pages baru.
3. Buat Apps Script baru.
4. Buat token API sendiri.
5. Deploy Apps Script sebagai Web App.
6. Masukkan endpoint Web App ke `assets/js/config.js`.
7. Ubah `BASE_SHORTLINK` pada `Kode.gs`.
8. Ubah tema, logo, dan teks sesuai nama masjid/komunitas.
9. Upload ke GitHub Pages.
10. Gunakan untuk membuat shortlink.

Contoh penggunaan:

```text
https://namamasjid.github.io/link/kas-jumat
https://namamasjid.github.io/link/donasi
https://namamasjid.github.io/link/kajian
https://namamasjid.github.io/link/laporan
```

---

## 17. Keamanan

Hal-hal yang perlu diperhatikan:

1. Jangan menyimpan data rahasia di Google Sheets.
2. Jangan membagikan token API.
3. Jangan membagikan Script ID aktif jika tidak diperlukan.
4. Gunakan token API yang panjang dan sulit ditebak.
5. Password statis di frontend bukan autentikasi kuat.
6. Google Apps Script Web App dengan akses `Anyone` dapat diakses publik, sehingga validasi token pada `doPost` wajib digunakan.
7. Jika source code ingin dibagikan, gunakan placeholder:
   - `YOUR_SCRIPT_ID`
   - `CHANGE_ME_API_TOKEN`
   - `CHANGE_ME_PASSWORD`
   - `YOUR_SPREADSHEET_ID`
8. Jangan commit file yang berisi kredensial asli ke repository publik.

---

## 18. Troubleshooting

### 18.1 Shortlink Tidak Redirect

Cek:

1. `link_name` benar.
2. `status` pada Google Sheets bernilai `aktif`.
3. `target_url` diawali `http://` atau `https://`.
4. Endpoint di `assets/js/config.js` sudah benar.
5. Apps Script sudah di-deploy sebagai versi baru.

### 18.2 Muncul Pesan Token Tidak Valid

Cek:

1. Token yang diinput sama dengan `API_TOKEN` di `Kode.gs`.
2. Apps Script sudah di-save.
3. Apps Script sudah di-deploy ulang sebagai versi baru.
4. Browser tidak menggunakan cache lama.

### 18.3 URL Valid tetapi Dianggap Tidak Valid

Pastikan menggunakan versi `Kode.gs` terbaru yang memiliki fungsi validasi URL longgar dan kompatibel dengan Google Docs/Sheets.

### 18.4 Perubahan Frontend Tidak Muncul

Lakukan hard refresh:

```text
Ctrl + F5
```

Atau buka dengan cache buster:

```text
https://username.github.io/link/?v=2
```

### 18.5 Halaman `/link/nama-link` Tidak Terbuka

Pastikan file berikut ada:

```text
404.html
.nojekyll
```

GitHub Pages membutuhkan `404.html` agar routing statis seperti `/link/nama-link` tetap dapat diproses oleh JavaScript.

---

## 19. Lisensi dan Penggunaan

Source ini boleh digunakan, dimodifikasi, dan disesuaikan untuk kebutuhan pribadi, masjid, komunitas, pendidikan, atau kegiatan sosial.

Gunakan dengan bijak. Jangan digunakan untuk menyebarkan tautan berbahaya, phishing, penipuan, atau konten yang melanggar hukum.

---

## 20. Penutup

Aplikasi ini dibuat sederhana agar mudah dipelajari, digunakan, dan dikembangkan kembali.

Semoga bermanfaat untuk memudahkan pengelolaan tautan digital, publikasi kegiatan, laporan, donasi, kajian, dan kebutuhan informasi lainnya.

**Made with ❤️ by CakGup — didedikasikan untuk ummat.**
