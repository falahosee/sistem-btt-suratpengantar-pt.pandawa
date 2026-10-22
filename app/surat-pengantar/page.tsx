"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function SuratPengantarPage() {
  const [dataSurat, setDataSurat] = useState<SuratPengantar[]>([]);
  const [pencarian, setPencarian] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function ambilData() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("surat_pengantar")
        .select(
          "id, nomor_surat, dari, tujuan, tanggal_pengiriman, petugas"
        )
        .order("id", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setDataSurat(data ?? []);
      }

      setLoading(false);
    }

    ambilData();
  }, []);

  const hasilPencarian = useMemo(() => {
    const kata = pencarian.toLowerCase().trim();

    if (!kata) return dataSurat;

    return dataSurat.filter((item) => {
      return (
        item.nomor_surat.toLowerCase().includes(kata) ||
        (item.dari ?? "").toLowerCase().includes(kata) ||
        (item.tujuan ?? "").toLowerCase().includes(kata) ||
        (item.petugas ?? "").toLowerCase().includes(kata)
      );
    });
  }, [dataSurat, pencarian]);

  function formatTanggal(tanggal: string) {
    if (!tanggal) return "-";

    const [tahun, bulan, hari] = tanggal.split("-");

    return `${hari}/${bulan}/${tahun}`;
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

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Data Surat Pengantar
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Daftar Surat Pengantar pengiriman barang
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Dashboard
              </Link>

              <Link
                href="/surat-pengantar/tambah"
                className="rounded-lg bg-[#183B63] px-5 py-3 text-sm font-semibold text-white hover:bg-[#102C4D]"
              >
                + Tambah Surat Pengantar
              </Link>
            </div>
          </div>

          <div className="mb-5">
            <input
              type="search"
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
              placeholder="Cari nomor surat, dari, tujuan, atau petugas..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:max-w-md"
            />
          </div>

          {loading ? (
            <p className="py-8 text-center text-gray-500">
              Memuat data Surat Pengantar...
            </p>
          ) : error ? (
            <p className="py-8 text-center text-red-600">
              Gagal mengambil data: {error}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="bg-slate-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-4">No.</th>
                      <th className="px-4 py-4">Nomor Surat</th>
                      <th className="px-4 py-4">
                        Tanggal Pengiriman
                      </th>
                      <th className="px-4 py-4">Dari</th>
                      <th className="px-4 py-4">Tujuan</th>
                      <th className="px-4 py-4">Petugas</th>
                      <th className="px-4 py-4">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {hasilPencarian.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50"
                      >
                        <td className="px-4 py-4">
                          {index + 1}
                        </td>

                        <td className="px-4 py-4 font-semibold text-[#183B63]">
                          {item.nomor_surat}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          {formatTanggal(
                            item.tanggal_pengiriman
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {item.dari || "-"}
                        </td>

                        <td className="px-4 py-4">
                          {item.tujuan || "-"}
                        </td>

                        <td className="px-4 py-4">
                          {item.petugas || "-"}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/surat-pengantar/${item.id}`}
                              className="rounded bg-blue-100 px-3 py-2 text-xs font-medium text-blue-700"
                            >
                              Detail
                            </Link>

                            <Link
                              href={`/surat-pengantar/${item.id}/print`}
                              className="rounded bg-green-100 px-3 py-2 text-xs font-medium text-green-700"
                            >
                              Print
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {hasilPencarian.length === 0 && (
                  <p className="py-8 text-center text-gray-500">
                    {pencarian
                      ? "Data Surat Pengantar tidak ditemukan."
                      : "Belum ada data Surat Pengantar."}
                  </p>
                )}
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Menampilkan {hasilPencarian.length} dari{" "}
                {dataSurat.length} data Surat Pengantar
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}