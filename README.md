# SEAPEDIA 🌊

Selamat datang di repositori resmi **SEAPEDIA** - *Platform E-Commerce Inovatif dengan Dukungan Multi-Role*.

Sistem ini didesain sebagai prototipe standar *Enterprise* yang mendemonstrasikan implementasi RBAC (Role-Based Access Control), Single-Store Checkout, serta sistem Split Payout terintegrasi untuk Penjual dan Kurir/Driver.

## Fitur Unggulan

- 🎭 **Sistem Peran Fleksibel (Multi-Role):** Satu akun dapat memiliki banyak peran (Pembeli, Penjual, Driver), namun hanya satu peran yang dapat diaktifkan dalam satu waktu (*Session-based Active Role*).
- 🛒 **Single-Store Checkout:** Keranjang belanja secara ketat memisahkan barang berdasarkan toko. Pengguna hanya dapat melakukan *checkout* dari satu toko dalam satu resi pesanan.
- 🚚 **Split Payout (Distribusi Uang):** Saat Driver menekan "Selesaikan Pesanan", pembayaran dari Pembeli dipotong secara otomatis:
  - Penjual menerima *Subtotal - Diskon*
  - Driver menerima biaya *Ongkos Kirim* (Delivery Fee)
- 💰 **Kalkulator Dinamis & PPN 12%:** Biaya administrasi/PPN dan opsi tarif ongkos kirim ditarik secara dinamis dari *Backend Configuration*, bukan *hardcode*.
- 🛡️ **Keamanan Tingkat Tinggi:** Meliputi pengamanan anti SQL-Injection (menggunakan *Parameterized Queries* murni) serta *Sanitizer* Anti-XSS (*Cross-Site Scripting*) untuk input publik.

## Cara Menjalankan Aplikasi

Aplikasi ini dibagi menjadi 2 *folder* utama: `backend` (Express.js) dan `frontend` (Next.js).

### 1. Konfigurasi Backend
1. Masuk ke direktori backend: `cd backend`
2. Instal dependensi: `npm install`
4. Inisialisasi Database: Jalankan `node --env-file=.env database/setup.js` untuk mereset seluruh tabel, menjalankan migrasi, dan mengisi data dummy (pastikan Node.js versi 20+).
5. Jalankan Server: `npm run dev` (Server akan berjalan di port `4000`).

### 2. Konfigurasi Frontend
1. Masuk ke direktori frontend: `cd frontend`
2. Instal dependensi: `npm install`
3. Jalankan *Client*: `npm run dev` (Akses melalui `http://localhost:3000`).

## Panduan Akun Demo (Seeding)

Jika Anda sudah menjalankan skrip `setup.js`, berikut adalah daftar akun demo yang langsung dapat digunakan:

| Peran (Role) | Email | Password | Keterangan |
|--------------|-------|----------|------------|
| **Admin** | admin@seapedia.com | `password123` | Akses penuh dashboard admin |
| **Penjual (Seller)** | budi@seapedia.com | `password123` | Toko Elektronik Maju |
| **Penjual (Seller)** | siti@seapedia.com | `password123` | Warung Sembako Bu Siti |
| **Pembeli (Buyer)** | andi@seapedia.com | `password123` | Saldo Rp 5.000.000 |
| **Pembeli (Buyer)** | rina@seapedia.com | `password123` | Saldo Rp 5.000.000 |
| **Kurir (Driver)** | joko@seapedia.com | `password123` | Saldo Rp 5.000.000 |
| **Kurir (Driver)** | hendra@seapedia.com | `password123` | Saldo Rp 5.000.000 |

*Catatan: Selain saldo dan toko, database juga sudah otomatis terisi dengan beberapa simulasi produk dan pesanan aktif untuk memudahkan Anda menguji aplikasi.*

## Panduan Simulasi Overdue/SLA

Aplikasi ini menggunakan sistem otomatis (CRON / Background Process) untuk mendeteksi pesanan yang kedaluwarsa atau melewati batas pengiriman (*SLA - Service Level Agreement*).

Jika Anda ingin mempercepat proses validasinya (tanpa harus menunggu berjam-jam/berhari-hari), Anda dapat menjalankan *Endpoint* rahasia ini:

```bash
# Menjalankan pembersihan pesanan kedaluwarsa (Kadaluwarsa Pembayaran atau Kadaluwarsa Pengemasan/Pengiriman SLA)
curl -X POST http://localhost:4000/api/admin/trigger-overdue \
  -H "Authorization: Bearer <TOKEN_ADMIN_ANDA>"
```

*Endpoint ini akan memicu Cron Process secara manual.*