"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const formAwal = {
  nomor_btt: "",
  tanggal: "",
  isi_kiriman: "",
  jumlah_colli: "",
  berat: "",
  pembayaran: "",
  penerima: "",
  pengirim: "",
  biaya: "",
  petugas: "",
};

export default function EditBttPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState(formAwal);
  const [loading, setLoading] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [error, setError] = useState("");

  // Ambil data BTT saat halaman edit dibuka
  useEffect(() => {
    async function ambilBtt() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("btt")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError(
          error?.message || "Data BTT tidak ditemukan."
        );

        setLoading(false);
        return;
      }

      setForm({
        nomor_btt: data.nomor_btt ?? "",
        tanggal: data.tanggal ?? "",
        isi_kiriman: data.isi_kiriman ?? "",
        jumlah_colli: String(data.jumlah_colli ?? ""),
        berat: String(data.berat ?? ""),
        pembayaran: data.pembayaran ?? "",
        penerima: data.penerima ?? "",
        pengirim: data.pengirim ?? "",
        biaya: String(data.biaya ?? ""),
        petugas: data.petugas ?? "",
      });

      setLoading(false);
    }

    ambilBtt();
  }, [id]);

  function ubahInput(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((sebelumnya) => ({
      ...sebelumnya,
      [name]: value,
    }));
  }

  async function simpanPerubahan(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMenyimpan(true);

    const { data, error } = await supabase
      .from("btt")
      .update({
        nomor_btt: form.nomor_btt.trim(),
        tanggal: form.tanggal,
        isi_kiriman: form.isi_kiriman.trim(),
        jumlah_colli: Number(form.jumlah_colli),

        berat:
          form.berat === ""
            ? null
            : Number(form.berat),

        pembayaran:
          form.pembayaran || null,

        penerima: form.penerima.trim(),
        pengirim: form.pengirim.trim(),

        biaya:
          form.biaya === ""
            ? null
            : Number(form.biaya),

        petugas:
          form.petugas.trim() || null,

        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    setMenyimpan(false);

    if (error) {
      alert(
        "Gagal memperbarui BTT: " +
          error.message
      );
      return;
    }

    if (!data) {
      alert(
        "Data tidak berhasil diperbarui. Cek policy UPDATE di Supabase."
      );
      return;
    }

    alert("Data BTT berhasil diperbarui!");

    router.push(`/btt/${id}`);
    router.refresh();
  }

  const inputStyle =
    "mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  const labelStyle =
    "block text-sm font-medium text-gray-700";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 rounded-xl bg-[#183B63] p-6 text-white shadow">
          <h1 className="text-xl font-bold">
            PT Pandawa Jaya Transindo
          </h1>

          <p className="mt-1 text-sm text-blue-100">
            Sistem Administrasi Pengiriman Barang
          </p>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 border-b border-gray-200 pb-5">
            <h2 className="text-2xl font-bold">
              Edit BTT
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Perbarui informasi Bukti Tanda Terima.
            </p>
          </div>

          {loading ? (
            <p className="py-8 text-center text-gray-500">
              Memuat data BTT...
            </p>
          ) : error ? (
            <div>
              <p className="mb-4 text-red-600">
                {error}
              </p>

              <Link
                href="/btt"
                className="text-blue-700"
              >
                Kembali ke Data BTT
              </Link>
            </div>
          ) : (
            <form
              onSubmit={simpanPerubahan}
              className="space-y-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelStyle}>
                    Nomor BTT *
                  </label>

                  <input
                    type="text"
                    name="nomor_btt"
                    value={form.nomor_btt}
                    onChange={ubahInput}
                    required
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Tanggal *
                  </label>

                  <input
                    type="date"
                    name="tanggal"
                    value={form.tanggal}
                    onChange={ubahInput}
                    required
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className={labelStyle}>
                  Isi Kiriman Menurut Pengakuan *
                </label>

                <input
                  type="text"
                  name="isi_kiriman"
                  value={form.isi_kiriman}
                  onChange={ubahInput}
                  required
                  className={inputStyle}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelStyle}>
                    Jumlah Colli *
                  </label>

                  <input
                    type="number"
                    name="jumlah_colli"
                    min="1"
                    step="1"
                    value={form.jumlah_colli}
                    onChange={ubahInput}
                    required
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Berat (kg)
                  </label>

                  <input
                    type="number"
                    name="berat"
                    min="0"
                    step="any"
                    value={form.berat}
                    onChange={ubahInput}
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className={labelStyle}>
                  Pembayaran
                </label>

                <select
                  name="pembayaran"
                  value={form.pembayaran}
                  onChange={ubahInput}
                  className={inputStyle}
                >
                  <option value="">
                    Pilih pembayaran
                  </option>

                  <option value="Tunai">
                    Tunai
                  </option>

                  <option value="Tagih">
                    Tagih
                  </option>

                  <option value="Kredit">
                    Kredit
                  </option>
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelStyle}>
                    Penerima *
                  </label>

                  <input
                    type="text"
                    name="penerima"
                    value={form.penerima}
                    onChange={ubahInput}
                    required
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Pengirim *
                  </label>

                  <input
                    type="text"
                    name="pengirim"
                    value={form.pengirim}
                    onChange={ubahInput}
                    required
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelStyle}>
                    Biaya (Rp)
                  </label>

                  <input
                    type="number"
                    name="biaya"
                    min="0"
                    step="1"
                    value={form.biaya}
                    onChange={ubahInput}
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
                    onChange={ubahInput}
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-6">
                <Link
                  href={`/btt/${id}`}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium hover:bg-gray-50"
                >
                  Batal
                </Link>

                <button
                  type="submit"
                  disabled={menyimpan}
                  className="rounded-lg bg-[#183B63] px-6 py-3 text-sm font-semibold text-white hover:bg-[#102C4D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {menyimpan
                    ? "Menyimpan..."
                    : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}