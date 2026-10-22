
"use client";

import { useState } from "react";
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

export default function TambahBttPage() {
  const [form, setForm] = useState(formAwal);
  const [loading, setLoading] = useState(false);

  function ubahInput(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setForm((sebelumnya) => ({
      ...sebelumnya,
      [name]: value,
    }));
  }

  async function simpanBtt(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("btt").insert({
      nomor_btt: form.nomor_btt.trim(),
      tanggal: form.tanggal,
      isi_kiriman: form.isi_kiriman.trim(),
      jumlah_colli: Number(form.jumlah_colli),
      berat: form.berat === "" ? null : Number(form.berat),
      pembayaran: form.pembayaran || null,
      penerima: form.penerima.trim(),
      pengirim: form.pengirim.trim(),
      biaya: form.biaya === "" ? null : Number(form.biaya),
      petugas: form.petugas.trim() || null,
    });

    setLoading(false);

    if (error) {
      alert("Gagal menyimpan BTT: " + error.message);
      return;
    }

    alert("BTT berhasil disimpan!");
    setForm({ ...formAwal });
  }

  const inputStyle =
    "mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  const labelStyle = "block text-sm font-medium text-gray-700";

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

        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 border-b border-gray-200 pb-5">
            <h2 className="text-2xl font-bold">
              Input Bukti Tanda Terima
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Isi data pengiriman sesuai dengan dokumen BTT.
            </p>
          </div>

          <form onSubmit={simpanBtt} className="space-y-6">

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelStyle}>Nomor BTT *</label>
                <input
                  type="text"
                  name="nomor_btt"
                  value={form.nomor_btt}
                  onChange={ubahInput}
                  placeholder="Contoh: 019122"
                  required
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Tanggal *</label>
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
                placeholder="Masukkan isi kiriman"
                required
                className={inputStyle}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelStyle}>Jumlah Colli *</label>
                <input
                  type="number"
                  name="jumlah_colli"
                  min="1"
                  step="1"
                  value={form.jumlah_colli}
                  onChange={ubahInput}
                  placeholder="0"
                  required
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Berat (kg)</label>
                <input
                  type="number"
                  name="berat"
                  min="0"
                  step="any"
                  value={form.berat}
                  onChange={ubahInput}
                  placeholder="0"
                  className={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Pembayaran</label>
              <select
                name="pembayaran"
                value={form.pembayaran}
                onChange={ubahInput}
                className={inputStyle}
              >
                <option value="">Pilih pembayaran</option>
                <option value="Tunai">Tunai</option>
                <option value="Tagih">Tagih</option>
                <option value="Kredit">Kredit</option>
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelStyle}>Penerima *</label>
                <input
                  type="text"
                  name="penerima"
                  value={form.penerima}
                  onChange={ubahInput}
                  placeholder="Nama penerima"
                  required
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Pengirim *</label>
                <input
                  type="text"
                  name="pengirim"
                  value={form.pengirim}
                  onChange={ubahInput}
                  placeholder="Nama pengirim"
                  required
                  className={inputStyle}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelStyle}>Biaya (Rp)</label>
                <input
                  type="number"
                  name="biaya"
                  min="0"
                  step="1"
                  value={form.biaya}
                  onChange={ubahInput}
                  placeholder="Contoh: 500000"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Petugas</label>
                <input
                  type="text"
                  name="petugas"
                  value={form.petugas}
                  onChange={ubahInput}
                  placeholder="Nama petugas"
                  className={inputStyle}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-6">
              <Link
                href="/btt"
                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Kembali
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[#183B63] px-6 py-3 text-sm font-semibold text-white hover:bg-[#102C4D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan BTT"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}
