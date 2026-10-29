"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Kiriman = {
  id: number;
  stt: string;
  penerima: string;
  pengirim: string;
  jumlah_colli: string;
  berat: string;
  biaya: string;
  keterangan: string;
};

export default function EditSuratPengantarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    nomor_surat: "",
    dari: "",
    tujuan: "",
    tanggal_pengiriman: "",
    petugas: "",
  });

  const [daftarKiriman, setDaftarKiriman] = useState<Kiriman[]>([]);
  const [loading, setLoading] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function ambilData() {
      setLoading(true);
      setError("");

      const { data: surat, error: errorSurat } = await supabase
        .from("surat_pengantar")
        .select(
          "id, nomor_surat, dari, tujuan, tanggal_pengiriman, petugas"
        )
        .eq("id", id)
        .single();

      if (errorSurat || !surat) {
        setError(
          errorSurat?.message ||
            "Data Surat Pengantar tidak ditemukan."
        );
        setLoading(false);
        return;
      }

      const { data: detail, error: errorDetail } = await supabase
        .from("surat_pengantar_detail")
        .select(
          "id, stt, penerima, pengirim, jumlah_colli, berat, biaya, keterangan"
        )
        .eq("surat_pengantar_id", id)
        .order("id", { ascending: true });

      if (errorDetail) {
        setError(errorDetail.message);
        setLoading(false);
        return;
      }

      setForm({
        nomor_surat: surat.nomor_surat || "",
        dari: surat.dari || "",
        tujuan: surat.tujuan || "",
        tanggal_pengiriman: surat.tanggal_pengiriman || "",
        petugas: surat.petugas || "",
      });

      setDaftarKiriman(
        (detail ?? []).map((item) => ({
          id: item.id,
          stt: item.stt || "",
          penerima: item.penerima || "",
          pengirim: item.pengirim || "",
          jumlah_colli:
            item.jumlah_colli === null
              ? ""
              : String(item.jumlah_colli),
          berat:
            item.berat === null
              ? ""
              : String(item.berat),
          biaya:
            item.biaya === null
              ? ""
              : String(item.biaya),
          keterangan: item.keterangan || "",
        }))
      );

      setLoading(false);
    }

    ambilData();
  }, [id]);

  function ubahForm(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;

    setForm((sebelumnya) => ({
      ...sebelumnya,
      [name]: value,
    }));
  }

  function ubahKiriman(
    idKiriman: number,
    field: keyof Omit<Kiriman, "id">,
    value: string
  ) {
    setDaftarKiriman((sebelumnya) =>
      sebelumnya.map((item) =>
        item.id === idKiriman
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function tambahKiriman() {
    setDaftarKiriman((sebelumnya) => [
      ...sebelumnya,
      {
        id: -Date.now(),
        stt: "",
        penerima: "",
        pengirim: "",
        jumlah_colli: "",
        berat: "",
        biaya: "",
        keterangan: "",
      },
    ]);
  }

  function hapusKiriman(idKiriman: number) {
    if (daftarKiriman.length === 1) {
      alert("Minimal harus ada satu kiriman.");
      return;
    }

    setDaftarKiriman((sebelumnya) =>
      sebelumnya.filter(
        (item) => item.id !== idKiriman
      )
    );
  }

  async function simpanPerubahan(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const kirimanTidakLengkap = daftarKiriman.some(
      (item) =>
        !item.stt.trim() ||
        !item.penerima.trim() ||
        !item.pengirim.trim() ||
        !item.jumlah_colli ||
        Number(item.jumlah_colli) <= 0
    );

    if (kirimanTidakLengkap) {
      alert(
        "Lengkapi STT, penerima, pengirim, dan jumlah colli pada setiap kiriman."
      );
      return;
    }

    setMenyimpan(true);
    setError("");

    const { error: errorSurat } = await supabase
      .from("surat_pengantar")
      .update({
        dari: form.dari.trim() || null,
        tujuan: form.tujuan.trim() || null,
        tanggal_pengiriman: form.tanggal_pengiriman,
        petugas: form.petugas.trim() || null,
      })
      .eq("id", id);

    if (errorSurat) {
      setMenyimpan(false);

      setError(
        "Gagal memperbarui Surat Pengantar: " +
          errorSurat.message
      );

      return;
    }

    const { error: errorHapus } = await supabase
      .from("surat_pengantar_detail")
      .delete()
      .eq("surat_pengantar_id", id);

    if (errorHapus) {
      setMenyimpan(false);

      setError(
        "Gagal memperbarui detail kiriman: " +
          errorHapus.message
      );

      return;
    }

    const detailBaru = daftarKiriman.map((item) => ({
      surat_pengantar_id: Number(id),
      stt: item.stt.trim(),
      penerima: item.penerima.trim(),
      pengirim: item.pengirim.trim(),
      jumlah_colli: Number(item.jumlah_colli),

      berat:
        item.berat === ""
          ? null
          : Number(item.berat),

      biaya:
        item.biaya === ""
          ? null
          : Number(item.biaya),

      keterangan:
        item.keterangan.trim() || null,
    }));

    const { error: errorInsert } = await supabase
      .from("surat_pengantar_detail")
      .insert(detailBaru);

    setMenyimpan(false);

    if (errorInsert) {
      setError(
        "Surat Pengantar diperbarui, tetapi detail kiriman gagal disimpan: " +
          errorInsert.message
      );

      return;
    }

    alert("Surat Pengantar berhasil diperbarui!");

    router.push(`/surat-pengantar/${id}`);
    router.refresh();
  }

  const inputStyle =
    "mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  const labelStyle =
    "block text-sm font-medium text-gray-700";

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <p>Memuat data Surat Pengantar...</p>
      </main>
    );
  }

  if (error && daftarKiriman.length === 0) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-7xl">

        <header className="mb-6 rounded-xl bg-[#183B63] p-6 text-white shadow">
          <h1 className="text-xl font-bold">
            PT Pandawa Jaya Transindo
          </h1>

          <p className="mt-1 text-sm text-blue-100">
            Sistem Administrasi Pengiriman Barang
          </p>
        </header>

        <form
          onSubmit={simpanPerubahan}
          className="rounded-xl bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6 border-b border-gray-200 pb-5">
            <h2 className="text-2xl font-bold">
              Edit Surat Pengantar
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Perbarui data Surat Pengantar dan daftar kiriman.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <label className={labelStyle}>
                Nomor Surat
              </label>

              <input
                type="text"
                value={form.nomor_surat}
                readOnly
                className="mt-2 w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-3 text-sm text-gray-600"
              />

              <p className="mt-1 text-xs text-gray-500">
                Nomor Surat Pengantar dibuat otomatis dan tidak dapat diubah.
              </p>
            </div>

            <div>
              <label className={labelStyle}>
                Tanggal Pengiriman *
              </label>

              <input
                type="date"
                name="tanggal_pengiriman"
                value={form.tanggal_pengiriman}
                onChange={ubahForm}
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>
                Dari
              </label>

              <input
                type="text"
                name="dari"
                value={form.dari}
                onChange={ubahForm}
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>
                Tujuan
              </label>

              <input
                type="text"
                name="tujuan"
                value={form.tujuan}
                onChange={ubahForm}
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>
                Petugas
              </label>

              <input
                type="text"
                name="petugas"
                value={form.petugas}
                onChange={ubahForm}
                className={inputStyle}
              />
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="mb-5 flex items-center justify-between gap-3">

              <h3 className="text-lg font-semibold">
                Daftar Kiriman
              </h3>

              <button
                type="button"
                onClick={tambahKiriman}
                className="rounded-lg bg-[#183B63] px-4 py-2 text-sm font-semibold text-white"
              >
                + Tambah Kiriman
              </button>
            </div>

            <div className="space-y-4">
              {daftarKiriman.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-200 bg-slate-50 p-4"
                >
                  <div className="mb-4 flex justify-between">

                    <h4 className="font-semibold">
                      Kiriman {index + 1}
                    </h4>

                    <button
                      type="button"
                      onClick={() =>
                        hapusKiriman(item.id)
                      }
                      disabled={daftarKiriman.length === 1}
                      className="text-sm text-red-600 disabled:opacity-40"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                    <input
                      type="text"
                      value={item.stt}
                      onChange={(e) =>
                        ubahKiriman(
                          item.id,
                          "stt",
                          e.target.value
                        )
                      }
                      placeholder="STT"
                      required
                      className={inputStyle}
                    />

                    <input
                      type="text"
                      value={item.penerima}
                      onChange={(e) =>
                        ubahKiriman(
                          item.id,
                          "penerima",
                          e.target.value
                        )
                      }
                      placeholder="Penerima"
                      required
                      className={inputStyle}
                    />

                    <input
                      type="text"
                      value={item.pengirim}
                      onChange={(e) =>
                        ubahKiriman(
                          item.id,
                          "pengirim",
                          e.target.value
                        )
                      }
                      placeholder="Pengirim"
                      required
                      className={inputStyle}
                    />

                    <input
                      type="number"
                      value={item.jumlah_colli}
                      onChange={(e) =>
                        ubahKiriman(
                          item.id,
                          "jumlah_colli",
                          e.target.value
                        )
                      }
                      placeholder="Colli"
                      required
                      className={inputStyle}
                    />

                    <input
                      type="number"
                      value={item.berat}
                      onChange={(e) =>
                        ubahKiriman(
                          item.id,
                          "berat",
                          e.target.value
                        )
                      }
                      placeholder="Berat"
                      className={inputStyle}
                    />

                    <input
                      type="number"
                      value={item.biaya}
                      onChange={(e) =>
                        ubahKiriman(
                          item.id,
                          "biaya",
                          e.target.value
                        )
                      }
                      placeholder="Biaya"
                      className={inputStyle}
                    />

                    <input
                      type="text"
                      value={item.keterangan}
                      onChange={(e) =>
                        ubahKiriman(
                          item.id,
                          "keterangan",
                          e.target.value
                        )
                      }
                      placeholder="Keterangan"
                      className={`${inputStyle} md:col-span-2`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">

            <Link
              href={`/surat-pengantar/${id}`}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={menyimpan}
              className="rounded-lg bg-[#183B63] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {menyimpan
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}