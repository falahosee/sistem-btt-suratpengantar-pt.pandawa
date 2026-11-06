
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
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // MENGAMBIL DATA SURAT PENGANTAR
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

  // PENCARIAN DAN FILTER TANGGAL
  const hasilFilter = useMemo(() => {
    const kata = pencarian.toLowerCase().trim();

    return dataSurat.filter((item) => {
      const cocokPencarian =
        item.nomor_surat.toLowerCase().includes(kata) ||
        (item.dari ?? "").toLowerCase().includes(kata) ||
        (item.tujuan ?? "").toLowerCase().includes(kata) ||
        (item.petugas ?? "").toLowerCase().includes(kata);

      const cocokTanggalAwal =
        !tanggalAwal ||
        item.tanggal_pengiriman >= tanggalAwal;

      const cocokTanggalAkhir =
        !tanggalAkhir ||
        item.tanggal_pengiriman <= tanggalAkhir;

      return (
        cocokPencarian &&
        cocokTanggalAwal &&
        cocokTanggalAkhir
      );
    });
  }, [dataSurat, pencarian, tanggalAwal, tanggalAkhir]);

  // RESET FILTER
  function resetFilter() {
    setPencarian("");
    setTanggalAwal("");
    setTanggalAkhir("");
  }

  // FORMAT TANGGAL
  function formatTanggal(tanggal: string) {
    if (!tanggal) return "-";

    const [tahun, bulan, hari] = tanggal.split("-");
    return `${hari}/${bulan}/${tahun}`;
  }

  // EXPORT CSV SURAT PENGANTAR
  function exportCSV() {
    if (loading || error || hasilFilter.length === 0) {
      return;
    }

    const headers = [
      "Nomor Surat",
      "Tanggal Pengiriman",
      "Dari",
      "Tujuan",
      "Petugas",
    ];

    // Melindungi data teks dari formula spreadsheet
    function amanCSV(nilai: unknown) {
      const teks = String(nilai ?? "");

      const teksAman = /^[\s]*[=+\-@\t\r\n]/.test(teks)
        ? "'" + teks
        : teks;

      return `"${teksAman.replace(/"/g, '""')}"`;
    }

    const rows = hasilFilter.map((item) => [
      item.nomor_surat,
      formatTanggal(item.tanggal_pengiriman),
      item.dari ?? "",
      item.tujuan ?? "",
      item.petugas ?? "",
    ]);

    const isiCSV = [headers, ...rows]
      .map((row) => row.map(amanCSV).join(";"))
      .join("\r\n");

    // UTF-8 BOM untuk kompatibilitas Excel
    const blob = new Blob(["\uFEFF", isiCSV], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const tanggalFile = new Date()
      .toLocaleDateString("en-CA");

    link.href = url;
    link.download = `rekap-surat-pengantar-${tanggalFile}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // STATUS FILTER
  const filterAktif =
    pencarian !== "" ||
    tanggalAwal !== "" ||
    tanggalAkhir !== "";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-6 rounded-xl bg-[#183B63] p-6 text-white shadow">
          <h1 className="text-xl font-bold">
            PT Pandawa Jaya Transindo
          </h1>

          <p className="mt-1 text-sm text-blue-100">
            Sistem Administrasi Pengiriman Barang
          </p>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-sm">

          {/* JUDUL DAN TOMBOL AKSI */}
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

              {/* TOMBOL EXPORT CSV */}
              <button
                type="button"
                onClick={exportCSV}
                disabled={
                  loading ||
                  !!error ||
                  hasilFilter.length === 0
                }
                className="rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Export CSV
              </button>

            </div>
          </div>

          {/* PENCARIAN DAN FILTER */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-slate-50 p-4">
            <div className="grid gap-4 lg:grid-cols-4">

              {/* PENCARIAN */}
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Pencarian
                </label>

                <input
                  type="search"
                  value={pencarian}
                  onChange={(e) =>
                    setPencarian(e.target.value)
                  }
                  placeholder="Cari nomor surat, dari, tujuan, atau petugas..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* DARI TANGGAL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Dari Tanggal
                </label>

                <input
                  type="date"
                  value={tanggalAwal}
                  onChange={(e) =>
                    setTanggalAwal(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* SAMPAI TANGGAL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Sampai Tanggal
                </label>

                <input
                  type="date"
                  value={tanggalAkhir}
                  min={tanggalAwal || undefined}
                  onChange={(e) =>
                    setTanggalAkhir(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                Filter dapat digunakan bersamaan dengan pencarian.
              </p>

              <button
                type="button"
                onClick={resetFilter}
                disabled={!filterAktif}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reset Filter
              </button>
            </div>
          </div>

          {/* DATA SURAT PENGANTAR */}
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
                      <th className="px-4 py-4">
                        No.
                      </th>

                      <th className="px-4 py-4">
                        Nomor Surat
                      </th>

                      <th className="px-4 py-4">
                        Tanggal Pengiriman
                      </th>

                      <th className="px-4 py-4">
                        Dari
                      </th>

                      <th className="px-4 py-4">
                        Tujuan
                      </th>

                      <th className="px-4 py-4">
                        Petugas
                      </th>

                      <th className="px-4 py-4">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {hasilFilter.map((item, index) => (
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
                              className="rounded bg-blue-100 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-200"
                            >
                              Detail
                            </Link>

                            <Link
                              href={`/surat-pengantar/${item.id}/print`}
                              className="rounded bg-green-100 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-200"
                            >
                              Print
                            </Link>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {hasilFilter.length === 0 && (
                  <p className="py-8 text-center text-gray-500">
                    {filterAktif
                      ? "Data Surat Pengantar tidak ditemukan sesuai pencarian atau periode yang dipilih."
                      : "Belum ada data Surat Pengantar."}
                  </p>
                )}
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Menampilkan {hasilFilter.length} dari{" "}
                {dataSurat.length} data Surat Pengantar
              </p>
            </>
          )}

        </section>
      </div>
    </main>
  );
}
