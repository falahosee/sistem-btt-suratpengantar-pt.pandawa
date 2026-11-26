
# Skenario Demonstrasi Sistem Informasi BTT dan Surat Pengantar

## PT Pandawa Jaya Transindo

**Tanggal penyusunan:** 26 November 2026

**Status sistem:** Prototipe pengembangan Kerja Praktik (KP), belum diterapkan dalam operasional perusahaan.

## 1. Tujuan Demonstrasi

Demonstrasi ini bertujuan memperlihatkan hasil pengembangan Sistem Informasi Pengelolaan Bukti Tanda Terima (BTT) dan Surat Pengantar Berbasis Web pada PT Pandawa Jaya Transindo.

Demonstrasi berfokus pada fungsi utama aplikasi, alur administrasi dokumen, pengaturan hak akses, dan pengelolaan arsip.

## 2. Persiapan Demonstrasi

Sebelum demonstrasi, pastikan:

- Aplikasi Next.js berjalan dengan baik.
- Koneksi internet dan Supabase tersedia.
- Akun admin dan staff dapat digunakan.
- Data dummy yang diperlukan sudah tersedia.
- Browser dapat membuka halaman aplikasi.
- Dokumen yang digunakan tidak mengandung data operasional asli atau informasi sensitif.

Gunakan data dummy yang sudah tersedia untuk menghindari pembuatan dokumen baru yang tidak diperlukan.

## 3. Urutan Demonstrasi

### Tahap 1 — Login dan Dashboard

1. Buka halaman login.
2. Masuk menggunakan akun admin.
3. Tampilkan halaman dashboard.
4. Jelaskan ringkasan jumlah BTT dan Surat Pengantar aktif.
5. Tunjukkan daftar dokumen terbaru serta tombol aksi cepat.

**Tujuan:** Memperlihatkan autentikasi pengguna dan ringkasan informasi administrasi.

### Tahap 2 — Pengelolaan BTT

1. Buka menu BTT.
2. Tampilkan daftar BTT.
3. Demonstrasikan pencarian dan filter tanggal.
4. Buka detail salah satu BTT dummy.
5. Tampilkan fitur cetak dokumen.
6. Jelaskan fungsi tambah dan edit BTT tanpa harus menyimpan data baru.

**Tujuan:** Memperlihatkan pengelolaan dokumen Bukti Tanda Terima secara digital.

### Tahap 3 — Pengelolaan Surat Pengantar

1. Buka menu Surat Pengantar.
2. Tampilkan daftar Surat Pengantar.
3. Jelaskan bahwa Surat Pengantar digunakan untuk rekap BTT secara mingguan.
4. Buka detail Surat Pengantar dummy yang sudah tersedia.
5. Tunjukkan daftar rincian kiriman dan informasi STT.
6. Tampilkan fitur cetak Surat Pengantar.
7. Jelaskan validasi STT duplikat pada form tanpa menyimpan dokumen baru.

**Tujuan:** Memperlihatkan pengelolaan Surat Pengantar dan rincian kiriman yang berkaitan dengan BTT.

### Tahap 4 — Ekspor Data

1. Buka daftar BTT.
2. Tunjukkan fitur ekspor CSV.
3. Jelaskan bahwa fitur ekspor mempermudah pengolahan data administrasi.
4. Buka daftar Surat Pengantar dan tunjukkan fitur ekspor yang tersedia.

**Tujuan:** Memperlihatkan penyediaan data untuk kebutuhan pengolahan lanjutan.

### Tahap 5 — Pengarsipan Dokumen

1. Buka halaman arsip BTT.
2. Tampilkan dokumen yang sudah diarsipkan.
3. Jelaskan perbedaan dokumen aktif dan arsip.
4. Buka halaman arsip Surat Pengantar.
5. Jelaskan bahwa admin dapat mengarsipkan dan memulihkan dokumen.
6. Tunjukkan bahwa dokumen arsip dapat dilihat dan dicetak tanpa perlu melakukan perubahan.

**Tujuan:** Memperlihatkan perlindungan dan pengelolaan dokumen yang tidak lagi berstatus aktif.

### Tahap 6 — Hak Akses Admin dan Staff

1. Jelaskan perbedaan kewenangan admin dan staff.
2. Tunjukkan bahwa penghapusan seluruh dokumen dibatasi untuk admin.
3. Jelaskan bahwa staff dapat mengelola rincian kiriman pada Surat Pengantar aktif.
4. Sampaikan bahwa penghapusan rincian tersimpan oleh staff telah diuji dan diverifikasi melalui Supabase pada 25 November 2026.

**Tujuan:** Memperlihatkan penerapan pembatasan akses pengguna.

## 4. Hasil yang Diharapkan

Demonstrasi diharapkan dapat menunjukkan bahwa aplikasi menyediakan:

- Pengelolaan BTT berbasis web.
- Pengelolaan Surat Pengantar beserta rincian kiriman.
- Pencarian dan penyaringan data.
- Pencetakan dokumen.
- Ekspor data CSV.
- Pengarsipan dan pemulihan dokumen.
- Pengaturan hak akses admin dan staff.
- Perlindungan dokumen arsip melalui mekanisme database.

## 5. Keterbatasan Sistem

Beberapa keterbatasan yang perlu disampaikan secara objektif:

1. Sistem masih dalam tahap prototipe dan belum digunakan secara resmi dalam operasional perusahaan.
2. Data yang digunakan selama pengembangan dan pengujian merupakan data dummy.
3. Pengujian yang dilakukan belum merupakan pengujian penerimaan pengguna secara menyeluruh.
4. Pembaruan beberapa rincian Surat Pengantar belum menggunakan satu transaksi database atomik.
5. Penggunaan sistem secara operasional masih memerlukan evaluasi, persetujuan, serta penyesuaian dengan prosedur perusahaan.

## 6. Penutup Demonstrasi

Sistem Informasi Pengelolaan BTT dan Surat Pengantar dikembangkan sebagai langkah awal digitalisasi administrasi dokumen pengiriman barang di PT Pandawa Jaya Transindo.

Hasil pengembangan menunjukkan tersedianya fungsi-fungsi utama pengelolaan dokumen berbasis web. Namun, penerapan sistem dalam kegiatan operasional perusahaan masih memerlukan evaluasi dan pengembangan lebih lanjut.
