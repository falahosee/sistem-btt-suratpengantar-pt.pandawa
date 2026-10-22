
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Btt = {
  id: number;
  nomor_btt: string;
  tanggal: string;
  isi_kiriman: string;
  jumlah_colli: number;
  berat: number | null;
  pembayaran: string | null;
  penerima: string;
  pengirim: string;
  biaya: number | null;
  petugas: string | null;
};

export default function DetailBttPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [btt, setBtt] = useState<Btt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function ambilBtt() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("btt")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Data BTT tidak ditemukan: " + error.message);
      } else {
        setBtt(data);
      }

      setLoading(false);
    }

    ambilBtt();
  }, [id]);

  function formatRupiah(nilai: number | null) {
    if (nilai === null) return "-";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nilai);
  }

  function formatTanggal(tanggal: string) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(tanggal + "T00:00:00Z"));
  }

  const dataDetail = btt
    ? [
        { label: "Nomor BTT", nilai: btt.nomor_btt },
        { label: "Tanggal", nilai: formatTanggal(btt.tanggal) },
        { label: "Pengirim", nilai: btt.pengirim },
        { label: "Penerima", nilai: btt.penerima },
        { label: "Isi Kiriman", nilai: btt.isi_kiriman },
        { label: "Jumlah Colli", nilai: String(btt.jumlah_colli) },
        {
          label: "Berat",
          nilai: btt.berat === null ? "-" : `${btt.berat} kg`,
        },
        { label: "Pembayaran", nilai: btt.pembayaran || "-" },
        { label: "Biaya", nilai: formatRupiah(btt.biaya) },
        { label: "Petugas", nilai: btt.petugas || "-" },
      ]
    : [];

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
            <h2 className="text-2xl font-bold">Detail BTT</h2>
            <p className="mt-1 text-sm text-gray-500">
              Informasi Bukti Tanda Terima pengiriman barang
            </p>
          </div>

          {loading ? (
            <p className="py-8 text-center text-gray-500">
              Memuat detail BTT...
            </p>
          ) : error ? (
            <div>
              <p className="mb-5 text-red-600">{error}</p>
              <Link
                href="/btt"
                className="text-sm font-medium text-blue-700"
              >
                Kembali ke Data BTT
              </Link>
            </div>
          ) : btt ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                {dataDetail.map((item) => (
                  <div key={item.label}>
                    <p className="mb-1 text-sm text-gray-500">
                      {item.label}
                    </p>
                    <p className="font-medium text-gray-900">
                      {item.nilai}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-6">
                <Link
                  href="/btt"
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium hover:bg-gray-50"
                >
                  Kembali
                </Link>

                <Link
                  href={`/btt/${btt.id}/edit`}
                  className="rounded-lg bg-amber-100 px-5 py-3 text-sm font-medium text-amber-800 hover:bg-amber-200"
                >
                  Edit BTT
                </Link>

                <Link
                  href={`/btt/${btt.id}/print`}
                  className="rounded-lg bg-green-100 px-5 py-3 text-sm font-medium text-green-800 hover:bg-green-200"
                >
                  Print BTT
                </Link>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Data BTT tidak ditemukan.</p>
          )}
        </section>
      </div>
    </main>
  );
}
