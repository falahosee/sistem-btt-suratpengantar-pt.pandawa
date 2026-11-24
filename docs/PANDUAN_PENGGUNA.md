# Panduan Penggunaan Sistem Informasi BTT dan Surat Pengantar

## PT Pandawa Jaya Transindo

### 1. Pendahuluan

Sistem Informasi Pengelolaan Bukti Tanda Terima (BTT) dan Surat Pengantar merupakan aplikasi berbasis web yang dikembangkan sebagai upaya awal digitalisasi administrasi pengiriman barang di PT Pandawa Jaya Transindo.

Aplikasi ini menyediakan fitur pengelolaan BTT, pengelolaan Surat Pengantar, pencarian dan penyaringan data, ekspor CSV, pencetakan dokumen, serta pengarsipan.

**Status implementasi:** Sistem masih dalam tahap pengembangan dan pengujian. Sistem belum digunakan secara resmi untuk operasional perusahaan. Data yang digunakan dalam pengujian merupakan data dummy.

### 2. Pengguna Sistem

Sistem memiliki dua jenis pengguna:

**Admin**
- Mengakses dashboard.
- Menambah, melihat, dan mengedit data BTT.
- Menambah, melihat, dan mengedit Surat Pengantar.
- Mencetak serta mengekspor dokumen.
- Mengarsipkan dan memulihkan dokumen.
- Menghapus dokumen aktif sesuai hak akses.

**Staff**
- Mengakses dashboard.
- Menambah, melihat, dan mengedit data BTT.
- Menambah, melihat, dan mengedit Surat Pengantar.
- Mencetak serta mengekspor dokumen.
- Melihat dan mencetak dokumen yang telah diarsipkan.
- Tidak memiliki kewenangan mengarsipkan, memulihkan, atau menghapus keseluruhan dokumen.

### 3. Login

1. Buka alamat aplikasi melalui browser.
2. Masukkan email dan kata sandi akun yang tersedia.
3. Klik tombol Login.
4. Setelah berhasil, pengguna diarahkan ke dashboard.

Untuk keluar dari aplikasi, klik tombol Logout pada navigasi utama.

### 4. Dashboard

Dashboard menampilkan ringkasan data aktif BTT dan Surat Pengantar, termasuk informasi jumlah dokumen dan daftar dokumen terbaru.

Pengguna juga dapat mengakses fitur tambah BTT dan tambah Surat Pengantar melalui tombol aksi cepat.

Data dokumen yang telah diarsipkan tidak dihitung dalam ringkasan dokumen aktif.

### 5. Pengelolaan Bukti Tanda Terima (BTT)

#### 5.1 Menambah BTT

1. Buka menu BTT.
2. Klik tombol Tambah BTT.
3. Isi tanggal, isi kiriman, jumlah colli, serta informasi pengirim dan penerima.
4. Lengkapi berat, pembayaran, biaya, dan petugas sesuai kebutuhan.
5. Klik tombol Simpan.
6. Sistem menghasilkan nomor BTT secara otomatis.

#### 5.2 Melihat dan Mengedit BTT

1. Buka daftar BTT.
2. Pilih dokumen yang ingin diperiksa.
3. Buka halaman detail untuk melihat informasi.
4. Gunakan tombol Edit untuk memperbarui dokumen aktif.

#### 5.3 Mencetak BTT

1. Buka detail BTT.
2. Pilih fitur cetak.
3. Periksa tampilan dokumen sebelum mencetak.

### 6. Pengelolaan Surat Pengantar

Surat Pengantar digunakan sebagai dokumen rekap kiriman BTT dalam periode mingguan.

#### 6.1 Menambah Surat Pengantar

1. Buka menu Surat Pengantar.
2. Klik tombol Tambah Surat Pengantar.
3. Isi tanggal pengiriman, asal, tujuan, dan petugas.
4. Tambahkan rincian kiriman.
5. Isi STT, penerima, pengirim, jumlah colli, berat, biaya, dan keterangan.
6. Gunakan tombol Tambah Kiriman jika terdapat lebih dari satu kiriman.
7. Klik Simpan Surat Pengantar.

Nomor Surat Pengantar dihasilkan secara otomatis.

Sistem melakukan validasi untuk mencegah nomor STT yang sama digunakan lebih dari satu kali dalam Surat Pengantar yang sedang dibuat.

#### 6.2 Mengedit Surat Pengantar

1. Buka detail Surat Pengantar aktif.
2. Klik tombol Edit.
3. Perbarui informasi surat atau rincian kiriman.
4. Klik Simpan Perubahan.

Pada halaman Edit, sistem memeriksa duplikasi STT sebelum proses penyimpanan.

Rincian yang sudah ada diperbarui berdasarkan ID detail. Rincian baru ditambahkan dan rincian yang dihapus dari form diproses sesuai izin database.

#### 6.3 Mencetak Surat Pengantar

1. Buka halaman detail Surat Pengantar.
2. Klik fitur cetak.
3. Periksa isi dokumen sebelum mencetak.

### 7. Pencarian, Filter Tanggal, dan Ekspor CSV

Daftar BTT dan Surat Pengantar menyediakan fasilitas pencarian dan penyaringan berdasarkan tanggal.

Pengguna dapat mengekspor data ke format CSV sesuai opsi ekspor yang tersedia pada halaman daftar.

Fitur ekspor digunakan untuk memudahkan pengolahan dan penyimpanan data di luar aplikasi.

### 8. Pengarsipan Dokumen

Admin dapat mengarsipkan dokumen BTT dan Surat Pengantar.

Dokumen yang diarsipkan dipindahkan dari daftar aktif ke halaman arsip tanpa harus dihapus secara permanen.

Dokumen arsip tetap dapat dilihat dan dicetak oleh pengguna yang memiliki akses.

Admin dapat memulihkan dokumen arsip menjadi aktif kembali.

Dokumen yang berstatus arsip dilindungi dari perubahan isi melalui mekanisme database.

### 9. Aturan Hak Akses

- Penghapusan seluruh dokumen Surat Pengantar dibatasi untuk admin.
- Admin dan staff diizinkan mengelola rincian kiriman pada Surat Pengantar aktif.
- Penghapusan rincian Surat Pengantar aktif dibatasi melalui kebijakan Row Level Security (RLS).
- Rincian Surat Pengantar yang telah diarsipkan dilindungi melalui trigger database.

**Catatan pengujian:** Izin staff untuk menghapus rincian yang sudah tersimpan setelah pembaruan RLS masih memerlukan verifikasi langsung melalui aplikasi.

### 10. Catatan Penggunaan

Sistem saat ini masih berada dalam tahap pengembangan dan pengujian.

Pengguna perlu memeriksa kembali kesesuaian data sebelum menyimpan atau mencetak dokumen.

Dokumentasi ini menggambarkan fitur yang telah dikembangkan dan bukan merupakan pernyataan bahwa sistem telah diterapkan secara resmi dalam kegiatan operasional perusahaan.
