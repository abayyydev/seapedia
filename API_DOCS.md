# API Documentation (SEAPEDIA)

## Base URL
`http://localhost:4000/api`

## Authentication (`/auth`)
- `POST /auth/register` : Mendaftarkan akun (beserta array of roles).
- `POST /auth/login` : Autentikasi dan mendapatkan *Access Token*.
- `GET /auth/me` : Mendapatkan profil pengguna berdasarkan sesi (*Bearer Token*).
- `PATCH /auth/select-role` : Mengganti `active_role` dalam satu sesi kerja.
- `POST /auth/add-role` : Menambahkan peran tambahan ke akun pengguna.

## Public Config & Data (`/public`)
- `GET /public/config` : Mendapatkan nilai PPN dan opsi jasa kurir secara dinamis.
- `GET /public/products` : Menampilkan seluruh katalog produk di beranda.
- `GET /public/products/:id` : Menampilkan detail produk spesifik beserta *Review*-nya.
- `POST /public/products/:id/reviews` : Menambahkan *Review* (Anti-XSS).

## Pembeli (`/buyer`) - *Membutuhkan Role BUYER*
- `GET /buyer/cart` : Menampilkan isi keranjang belanja.
- `POST /buyer/cart` : Memasukkan produk ke keranjang.
- `DELETE /buyer/cart/:itemId` : Menghapus produk.
- `POST /buyer/checkout` : *Checkout* dan pembuatan Pesanan (Order).
- `GET /buyer/orders` : Lacak riwayat pesanan (*Status Tracking*).
- `GET /buyer/wallet` : Melihat saldo dompet.
- `POST /buyer/wallet/topup` : Mengisi saldo dompet (Top up).

## Penjual (`/seller`) - *Membutuhkan Role SELLER*
- `POST /seller/store` : Membuka toko (*Anti-XSS*).
- `POST /seller/products` : Menambahkan produk baru (*Anti-XSS*).
- `GET /seller/orders` : Mengelola pesanan yang masuk.
- `PATCH /seller/orders/:id/status` : Memperbarui status pesanan menjadi `PACKED` atau memanggil Driver `WAITING_DRIVER`.

## Pengemudi (`/driver`) - *Membutuhkan Role DRIVER*
- `GET /driver/jobs/available` : Memantau orderan masuk berstatus `WAITING_DRIVER`.
- `POST /driver/jobs/:id/accept` : Mengambil pekerjaan dan merubahnya ke `DELIVERING`.
- `POST /driver/jobs/:id/complete` : Mengonfirmasi pengiriman selesai, dan mengeksekusi logika *Split Payout*.
- `GET /driver/jobs/my` : Memantau riwayat pengiriman (*History* & *Earnings*).

## Admin (`/admin`) - *Membutuhkan Role ADMIN*
- `GET /admin/users` : Menampilkan seluruh pengguna dalam sistem beserta *array* perannya.
- `POST /admin/trigger-overdue` : [DEBUG ONLY] Memicu sistem *Cron Job* secara manual untuk membatalkan pesanan yang melebihi batas waktu (SLA).
