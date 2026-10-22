"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type SuratPengantar = {
  id: number;
  nomor_surat: string;
  dari: string | null;
  tujuan: string | null;
  tanggal_pengiriman: string;
  petugas: string | null;
};

type DetailKiriman = {
  id: number;
  surat_pengantar_id: number;
  stt: string | null;
  penerima: string | null;
  pengirim: string | null;
  jumlah_colli: number | null;
  berat: number | null;
  biaya: number | null;
  keterangan: string | null;
};

export default function DetailSuratPengantarPage() {
  const { id } = useParams<{ id: string }>();

  const [surat, setSurat] = useState<SuratPengantar | null>(null);
  const [kiriman, setKiriman] = useState<DetailKiriman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function ambilData() {
      setLoading(true);
      setError("");

      const { data: dataSurat, error: errorSurat } = await supabase
        .from("surat_pengantar")
        .select(
          "id, nomor_surat, dari, tujuan, tanggal_pengiriman, petugas"
        )
        .eq("id", id)
        .single();

      if (errorSurat || !dataSurat) {
        setError(
          errorSurat?.message || "Data Surat Pengantar tidak ditemukan."
        );
        setLoading(false);
        return;
      }

      const { data: dataKiriman, error: errorKiriman } = await supabase
        .from("surat_pengantar_detail")
        .select(
          "id, surat_pengantar_id, stt, penerima, pengirim, jumlah_colli, berat, biaya, keterangan"
        )
        .eq("surat_pengantar_id", id)
        .order("id", { ascending: true });

      if (errorKiriman) {
        setError(errorKiriman.message);
        setLoading(false);
        return;
      }

      setSurat(dataSurat);
      setKiriman(dataKiriman ?? []);
      setLoading(false);
    }

    ambilData();
  }, [id]);

  function formatTanggal(tanggal: string) {
    if (!tanggal) return "-";

    const [tahun, bulan, hari] = tanggal.split("-");

    return `${hari}/${bulan}/${tahun}`;
  }

  function formatRupiah(nilai: number | null) {
    if (nilai === null) return "-";

    return new Intl.NumberFormat("id-ID").format(nilai);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-gray-900">
        <p>Memuat detail Surat Pengantar...</p>
      </main>
    );
  }

  if (error || !surat) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-gray-900">
        <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm">
          <p className="text-red-600">
            {error || "Data Surat Pengantar tidak ditemukan."}
          </p>

          <Link
            href="/surat-pengantar"
            className="mt-4 inline-block text-blue-700"
          >
            Kembali ke Data Surat Pengantar
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-6xl">

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
              Detail Surat Pengantar
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Informasi Surat Pengantar dan daftar kiriman.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">
                Nomor Surat
              </p>

              <p className="mt-1 font-semibold">
                {surat.nomor_surat}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Tanggal Pengiriman
              </p>

              <p className="mt-1 font-semibold">
                {formatTanggal(surat.tanggal_pengiriman)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Dari
              </p>

              <p className="mt-1 font-semibold">
                {surat.dari || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Tujuan
              </p>

              <p className="mt-1 font-semibold">
                {surat.tujuan || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Petugas
              </p>

              <p className="mt-1 font-semibold">
                {surat.petugas || "-"}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">
                  Daftar Kiriman
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Daftar STT yang tercatat pada Surat Pengantar ini.
                </p>
              </div>

              <p className="text-sm text-gray-500">
                Total kiriman: {kiriman.length}
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-slate-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3">No.</th>
                    <th className="px-4 py-3">STT</th>
                    <th className="px-4 py-3">Penerima</th>
                    <th className="px-4 py-3">Pengirim</th>
                    <th className="px-4 py-3">Colli</th>
                    <th className="px-4 py-3">Berat</th>
                    <th className="px-4 py-3">Biaya</th>
                    <th className="px-4 py-3">Keterangan</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {kiriman.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {item.stt || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {item.penerima || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {item.pengirim || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {item.jumlah_colli ?? "-"}
                      </td>

                      <td className="px-4 py-3">
                        {item.berat ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        {item.biaya === null
                          ? "-"
                          : `Rp ${formatRupiah(item.biaya)}`}
                      </td>

                      <td className="px-4 py-3">
                        {item.keterangan || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {kiriman.length === 0 && (
                <p className="py-8 text-center text-gray-500">
                  Belum ada data kiriman.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Link
              href="/surat-pengantar"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Kembali
            </Link>

            <Link
              href={`/surat-pengantar/${surat.id}/edit`}
              className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
            >
              Edit
            </Link>

            <Link
              href={`/surat-pengantar/${surat.id}/print`}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Print Surat Pengantar
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
