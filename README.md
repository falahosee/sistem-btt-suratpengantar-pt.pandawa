# Sistem Informasi Pengelolaan BTT dan Surat Pengantar

Sistem informasi berbasis web untuk membantu pengelolaan Bukti Tanda Terima (BTT) dan Surat Pengantar pada PT Pandawa Jaya Transindo.

Sistem ini dikembangkan sebagai bagian dari kegiatan Kerja Praktik dengan tujuan membantu proses administrasi pengiriman yang sebelumnya masih dilakukan secara manual.

## Fitur Utama

- Login dan logout pengguna internal
- Dashboard sistem
- Pengelolaan data BTT
- Tambah, lihat detail, dan edit BTT
- Print BTT
- Download BTT dalam format PDF
- Pengelolaan Surat Pengantar
- Penambahan lebih dari satu detail kiriman
- Lihat detail dan edit Surat Pengantar
- Print Surat Pengantar
- Download Surat Pengantar dalam format PDF
- Proteksi halaman internal
- Row Level Security pada database

## Pengguna Sistem

Sistem digunakan secara internal oleh:

- 1 Admin
- 3 Staff Operasional

## Teknologi

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security
- html2canvas
- jsPDF

## Struktur Utama Project

```text
app/
├── btt/
├── dashboard/
├── login/
└── surat-pengantar/

component/
lib/
public/