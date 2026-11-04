-- =========================================================
-- BACKUP AUTO NUMBER
-- PT Pandawa Jaya Transindo
-- BTT dan Surat Pengantar
-- =========================================================


-- =========================================================
-- 1. AUTO NUMBER BTT
-- =========================================================

CREATE SEQUENCE IF NOT EXISTS public.btt_nomor_seq
START WITH 1
INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_nomor_btt()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.nomor_btt IS NULL OR TRIM(NEW.nomor_btt) = '' THEN
    NEW.nomor_btt :=
      LPAD(
        nextval('public.btt_nomor_seq')::text,
        5,
        '0'
      );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generate_nomor_btt
ON public.btt;

CREATE TRIGGER trigger_generate_nomor_btt
BEFORE INSERT ON public.btt
FOR EACH ROW
EXECUTE FUNCTION public.generate_nomor_btt();


-- =========================================================
-- 2. UNIQUE NOMOR BTT
-- =========================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'btt_nomor_btt_unique'
  ) THEN

    ALTER TABLE public.btt
    ADD CONSTRAINT btt_nomor_btt_unique
    UNIQUE (nomor_btt);

  END IF;
END;
$$;


-- =========================================================
-- 3. AUTO NUMBER SURAT PENGANTAR
-- =========================================================

CREATE SEQUENCE IF NOT EXISTS public.surat_pengantar_nomor_seq
START WITH 1
INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_nomor_surat_pengantar()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.nomor_surat IS NULL OR TRIM(NEW.nomor_surat) = '' THEN
    NEW.nomor_surat :=
      LPAD(
        nextval('public.surat_pengantar_nomor_seq')::text,
        5,
        '0'
      );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generate_nomor_surat_pengantar
ON public.surat_pengantar;

CREATE TRIGGER trigger_generate_nomor_surat_pengantar
BEFORE INSERT ON public.surat_pengantar
FOR EACH ROW
EXECUTE FUNCTION public.generate_nomor_surat_pengantar();


-- =========================================================
-- 4. CATATAN UNIQUE SURAT PENGANTAR
-- =========================================================

-- Kolom nomor_surat sudah memiliki UNIQUE constraint:
-- surat_pengantar_nomor_surat_key
--
-- Tidak perlu membuat UNIQUE constraint tambahan.


-- =========================================================
-- 5. RESET SEQUENCE
-- Gunakan hanya jika database masih kosong / data test
-- sudah dihapus.
-- =========================================================

-- SELECT setval(
--   'public.btt_nomor_seq',
--   1,
--   false
-- );

-- SELECT setval(
--   'public.surat_pengantar_nomor_seq',
--   1,
--   false
-- );