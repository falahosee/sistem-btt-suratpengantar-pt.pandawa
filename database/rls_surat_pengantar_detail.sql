-- =====================================================
-- PT PANDAWA JAYA TRANSINDO
-- Dokumentasi Kebijakan RLS Surat Pengantar Detail
-- Tanggal: 24 November 2026
-- =====================================================
--
-- Tujuan:
-- Mengizinkan pengguna terautentikasi (admin/staff)
-- menghapus rincian kiriman dari Surat Pengantar aktif.
--
-- Batasan:
-- 1. Rincian Surat Pengantar arsip tidak boleh dihapus.
-- 2. Penghapusan dokumen utama tetap khusus admin.
-- 3. Trigger perlindungan arsip tetap digunakan.
--
-- Catatan:
-- Skrip ini mendokumentasikan kebijakan yang
-- sudah diterapkan langsung melalui Supabase SQL Editor.
-- Tidak perlu menjalankannya kembali jika policy
-- sudah sesuai.
--
-- Kebijakan ini berlaku untuk seluruh pengguna
-- dengan role Supabase "authenticated".
-- =====================================================

BEGIN;

DROP POLICY IF EXISTS
  "Authenticated delete surat_pengantar_detail"
ON public.surat_pengantar_detail;

DROP POLICY IF EXISTS
  "Authenticated delete active surat_pengantar_detail"
ON public.surat_pengantar_detail;

CREATE POLICY
  "Authenticated delete active surat_pengantar_detail"
ON public.surat_pengantar_detail
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.surat_pengantar AS sp
    WHERE sp.id = surat_pengantar_id
      AND sp.is_archived = false
  )
);

COMMIT;
