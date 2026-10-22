
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Btt = {
  id: number;
  nomor_btt: string;
  tanggal: string;
  pengirim: string;
  penerima: string;
  isi_kiriman: string;
  jumlah_colli: number;
  berat: number | null;
  pembayaran: string | null;
  biaya: number | null;
  petugas: string | null;
};

export default function BttPage() {
  const [dataBtt, setDataBtt] = useState<Btt[]>([]);
  const [pencarian, setPencarian] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function ambilData() {
      const { data, error } = await supabase
        .from("btt")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setDataBtt(data ?? []);
      }

      setLoading(false);
    }

    ambilData();
  }, []);

  const hasilPencarian = dataBtt.filter((item) => {
    const kata = pencarian.toLowerCase();

    return (
      item.nomor_btt.toLowerCase().includes(kata) ||
      item.pengirim.toLowerCase().includes(kata) ||
      item.penerima.toLowerCase().includes(kata)
    );
  });

  function formatRupiah(nilai: number | null) {
    if (nilai === null) return "-";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nilai);
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
              <h2 className="text-2xl font-bold">Data BTT</h2>
              <p className="mt-1 text-sm text-gray-500">
                Daftar Bukti Tanda Terima pengiriman barang
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
                href="/btt/tambah"
                className="rounded-lg bg-[#183B63] px-5 py-3 text-sm font-semibold text-white hover:bg-[#102C4D]"
              >
                + Tambah BTT
              </Link>
            </div>
          </div>

          <div className="mb-5">
            <input
              type="search"
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
              placeholder="Cari nomor BTT, pengirim, atau penerima..."
              aria-label="Cari data BTT"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:max-w-md"
            />
          </div>

          {loading ? (
            <p className="py-8 text-center text-gray-500">
              Memuat data BTT...
            </p>
          ) : error ? (
            <p className="py-8 text-center text-red-600">
              Gagal mengambil data: {error}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-312.5 border-collapse text-left text-sm">  

                  <thead className="bg-slate-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-4">No.</th>
                      <th className="px-4 py-4">Nomor BTT</th>
                      <th className="px-4 py-4">Tanggal</th>
                      <th className="px-4 py-4">Pengirim</th>
                      <th className="px-4 py-4">Penerima</th>
                      <th className="px-4 py-4">Isi Kiriman</th>
                      <th className="px-4 py-4">Colli</th>
                      <th className="px-4 py-4">Berat</th>
                      <th className="px-4 py-4">Pembayaran</th>
                      <th className="px-4 py-4">Biaya</th>
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
                          {item.nomor_btt}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          {item.tanggal}
                        </td>

                        <td className="px-4 py-4">
                          {item.pengirim}
                        </td>

                        <td className="px-4 py-4">
                          {item.penerima}
                        </td>

                        <td className="px-4 py-4">
                          {item.isi_kiriman}
                        </td>

                        <td className="px-4 py-4">
                          {item.jumlah_colli}
                        </td>

                        <td className="px-4 py-4">
                          {item.berat ?? "-"}
                        </td>

                        <td className="px-4 py-4">
                          {item.pembayaran || "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          {formatRupiah(item.biaya)}
                        </td>

                        <td className="px-4 py-4">
                          {item.petugas || "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex items-center gap-2">

                            <Link
                              href={`/btt/${item.id}`}
                              className="rounded-md bg-blue-100 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-200"
                            >
                              Detail
                            </Link>

                            <Link
                              href={`/btt/${item.id}/edit`}
                              className="rounded-md bg-amber-100 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-200"
                            >
                              Edit
                            </Link>

                            <Link
                              href={`/btt/${item.id}/print`}
                              className="rounded-md bg-green-100 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-200"
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
                      ? "Data BTT tidak ditemukan."
                      : "Belum ada data BTT."}
                  </p>
                )}
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Menampilkan {hasilPencarian.length} dari{" "}
                {dataBtt.length} data BTT
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
