
-- ======================================================
-- PT PANDAWA JAYA TRANSINDO
-- Pembaruan Surat Pengantar secara atomik
-- SECURITY INVOKER: mengikuti RLS pengguna
-- ======================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.update_surat_pengantar_atomic(
    p_surat_id bigint,
    p_dari text,
    p_tujuan text,
    p_tanggal date,
    p_petugas text,
    p_details jsonb,
    p_expected_detail_ids bigint[]
)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    v_item jsonb;
    v_id bigint;
    v_old_id bigint;
    v_parent_id bigint;

    v_db_ids bigint[];
    v_expected_ids bigint[];
    v_existing_ids bigint[] := ARRAY[]::bigint[];
    v_seen_ids bigint[] := ARRAY[]::bigint[];
    v_seen_stt text[] := ARRAY[]::text[];

    v_stt text;
    v_penerima text;
    v_pengirim text;
    v_colli_text text;
    v_berat_text text;
    v_biaya_text text;

    v_affected integer;
BEGIN
    -- 1. Pengguna wajib terautentikasi.
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Pengguna belum login';
    END IF;

    IF p_surat_id IS NULL OR p_surat_id <= 0 THEN
        RAISE EXCEPTION 'ID Surat Pengantar tidak valid';
    END IF;

    IF p_tanggal IS NULL THEN
        RAISE EXCEPTION 'Tanggal pengiriman wajib diisi';
    END IF;

    IF p_details IS NULL
       OR jsonb_typeof(p_details) <> 'array'
       OR jsonb_array_length(p_details) = 0 THEN
        RAISE EXCEPTION 'Minimal harus ada satu kiriman';
    END IF;

    IF p_expected_detail_ids IS NULL THEN
        RAISE EXCEPTION 'Daftar ID detail awal wajib dikirim';
    END IF;

    -- 2. Kunci dokumen induk selama transaksi.
    -- Dokumen arsip tidak boleh diedit.
    SELECT sp.id
    INTO v_parent_id
    FROM public.surat_pengantar AS sp
    WHERE sp.id = p_surat_id
      AND sp.is_archived = false
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
          'Surat Pengantar tidak ditemukan atau sudah diarsipkan';
    END IF;

    -- 3. Periksa apakah rincian berubah sejak form dibuka.
    SELECT COALESCE(
        array_agg(d.id ORDER BY d.id),
        ARRAY[]::bigint[]
    )
    INTO v_db_ids
    FROM public.surat_pengantar_detail AS d
    WHERE d.surat_pengantar_id = p_surat_id;

    SELECT COALESCE(
        array_agg(x ORDER BY x),
        ARRAY[]::bigint[]
    )
    INTO v_expected_ids
    FROM unnest(p_expected_detail_ids) AS t(x);

    IF v_db_ids IS DISTINCT FROM v_expected_ids THEN
        RAISE EXCEPTION
          'Data rincian telah berubah. Muat ulang halaman sebelum menyimpan';
    END IF;

    -- 4. Validasi seluruh kiriman sebelum perubahan data.
    FOR v_item IN
        SELECT value
        FROM jsonb_array_elements(p_details) AS t(value)
    LOOP
        IF jsonb_typeof(v_item) <> 'object' THEN
            RAISE EXCEPTION 'Format rincian kiriman tidak valid';
        END IF;

        v_id := (v_item->>'id')::bigint;

        IF v_id IS NULL OR v_id = 0 THEN
            RAISE EXCEPTION 'ID rincian tidak valid';
        END IF;

        IF v_id = ANY(v_seen_ids) THEN
            RAISE EXCEPTION 'ID rincian digunakan berulang';
        END IF;

        v_seen_ids := array_append(v_seen_ids, v_id);

        IF v_id > 0 THEN
            IF NOT (v_id = ANY(v_expected_ids)) THEN
                RAISE EXCEPTION
                  'Rincian ID % bukan bagian dari surat ini',
                  v_id;
            END IF;

            v_existing_ids :=
                array_append(v_existing_ids, v_id);
        END IF;

        v_stt := trim(COALESCE(v_item->>'stt', ''));
        v_penerima :=
            trim(COALESCE(v_item->>'penerima', ''));
        v_pengirim :=
            trim(COALESCE(v_item->>'pengirim', ''));
        v_colli_text :=
            trim(COALESCE(v_item->>'jumlah_colli', ''));
        v_berat_text :=
            trim(COALESCE(v_item->>'berat', ''));
        v_biaya_text :=
            trim(COALESCE(v_item->>'biaya', ''));

        IF v_stt = ''
           OR v_penerima = ''
           OR v_pengirim = '' THEN
            RAISE EXCEPTION
              'STT, penerima, dan pengirim wajib diisi';
        END IF;

        IF upper(v_stt) = ANY(v_seen_stt) THEN
            RAISE EXCEPTION
              'STT % digunakan lebih dari satu kali',
              v_stt;
        END IF;

        v_seen_stt :=
            array_append(v_seen_stt, upper(v_stt));

        IF v_colli_text !~ '^[0-9]+$'
           OR length(v_colli_text) > 10 THEN
            RAISE EXCEPTION
              'Jumlah colli tidak valid';
        END IF;

        IF v_colli_text::numeric < 1
           OR v_colli_text::numeric > 2147483647 THEN
            RAISE EXCEPTION
              'Jumlah colli harus lebih dari nol';
        END IF;

        IF v_berat_text <> ''
           AND v_berat_text !~ '^[0-9]+(\.[0-9]+)?$' THEN
            RAISE EXCEPTION 'Berat tidak valid';
        END IF;

        IF v_biaya_text <> ''
           AND (
               v_biaya_text !~ '^[0-9]+$'
               OR length(v_biaya_text) > 15
           ) THEN
            RAISE EXCEPTION 'Biaya tidak valid';
        END IF;
    END LOOP;

    -- 5. Perbarui informasi utama surat.
    UPDATE public.surat_pengantar
    SET
        dari = NULLIF(trim(p_dari), ''),
        tujuan = NULLIF(trim(p_tujuan), ''),
        tanggal_pengiriman = p_tanggal,
        petugas = NULLIF(trim(p_petugas), '')
    WHERE id = p_surat_id
      AND is_archived = false;

    GET DIAGNOSTICS v_affected = ROW_COUNT;

    IF v_affected <> 1 THEN
        RAISE EXCEPTION
          'Gagal memperbarui informasi Surat Pengantar';
    END IF;

    -- 6. Update detail lama atau insert detail baru.
    FOR v_item IN
        SELECT value
        FROM jsonb_array_elements(p_details) AS t(value)
    LOOP
        v_id := (v_item->>'id')::bigint;

        IF v_id > 0 THEN
            UPDATE public.surat_pengantar_detail
            SET
                stt = trim(v_item->>'stt'),
                penerima = trim(v_item->>'penerima'),
                pengirim = trim(v_item->>'pengirim'),
                jumlah_colli =
                    (v_item->>'jumlah_colli')::integer,
                berat = NULLIF(
                    trim(COALESCE(v_item->>'berat', '')),
                    ''
                )::numeric,
                biaya = NULLIF(
                    trim(COALESCE(v_item->>'biaya', '')),
                    ''
                )::numeric,
                keterangan = NULLIF(
                    trim(COALESCE(v_item->>'keterangan', '')),
                    ''
                )
            WHERE id = v_id
              AND surat_pengantar_id = p_surat_id;

            GET DIAGNOSTICS v_affected = ROW_COUNT;

            IF v_affected <> 1 THEN
                RAISE EXCEPTION
                  'Gagal memperbarui rincian ID %',
                  v_id;
            END IF;
        ELSE
            INSERT INTO public.surat_pengantar_detail (
                surat_pengantar_id,
                stt,
                penerima,
                pengirim,
                jumlah_colli,
                berat,
                biaya,
                keterangan
            )
            VALUES (
                p_surat_id,
                trim(v_item->>'stt'),
                trim(v_item->>'penerima'),
                trim(v_item->>'pengirim'),
                (v_item->>'jumlah_colli')::integer,
                NULLIF(
                    trim(COALESCE(v_item->>'berat', '')),
                    ''
                )::numeric,
                NULLIF(
                    trim(COALESCE(v_item->>'biaya', '')),
                    ''
                )::numeric,
                NULLIF(
                    trim(COALESCE(v_item->>'keterangan', '')),
                    ''
                )
            );
        END IF;
    END LOOP;

    -- 7. Hapus rincian lama yang dikeluarkan dari form.
    FOREACH v_old_id IN ARRAY v_db_ids
    LOOP
        IF NOT (v_old_id = ANY(v_existing_ids)) THEN
            DELETE FROM public.surat_pengantar_detail
            WHERE id = v_old_id
              AND surat_pengantar_id = p_surat_id;

            GET DIAGNOSTICS v_affected = ROW_COUNT;

            IF v_affected <> 1 THEN
                RAISE EXCEPTION
                  'Gagal menghapus rincian ID %',
                  v_old_id;
            END IF;
        END IF;
    END LOOP;

    -- Seluruh perubahan berhasil.
    RETURN jsonb_array_length(p_details);
END;
$function$;

-- Batasi siapa yang boleh memanggil RPC.
REVOKE ALL ON FUNCTION
public.update_surat_pengantar_atomic(
    bigint, text, text, date, text, jsonb, bigint[]
)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
public.update_surat_pengantar_atomic(
    bigint, text, text, date, text, jsonb, bigint[]
)
TO authenticated;

COMMIT;
