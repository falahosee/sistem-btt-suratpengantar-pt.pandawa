"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type BttArsip = {
  id: number;
  nomor_btt: string;
  pengirim: string;
  penerima: string;
  archived_at: string | null;
};

const formatWaktu = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export default function ArsipBttPage() {
  const [data, setData] = useState<BttArsip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let aktif = true;

    async function ambilArsip() {
      const { data, error } = await supabase
        .from("btt")
        .select("id, nomor_btt, pengirim, penerima, archived_at")
        .eq("is_archived", true)
        .order("archived_at", { ascending: false, nullsFirst: false })
        .order("id", { ascending: false });

      if (!aktif) return;

      if (error) {
        setError(error.message);
      } else {
        setData(data ?? []);
      }

      setLoading(false);
    }

    void ambilArsip();

    return () => {
      aktif = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-xl bg-[#183B63] p-6 text-white shadow">
          <p className="text-xl font-bold">PT Pandawa Jaya Transindo</p>
          <p className="mt-1 text-sm text-blue-100">
            Sistem Administrasi Pengiriman Barang
          </p>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Arsip BTT</h1>
            <Link
              href="/btt"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Kembali ke Data BTT
            </Link>
          </div>

          {loading ? (
            <p role="status" className="py-8 text-center text-gray-500">
              Memuat arsip BTT...
            </p>
          ) : error ? (
            <p role="alert" className="py-8 text-center text-red-600">
              Gagal memuat arsip BTT: {error}
            </p>
          ) : data.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              Belum ada BTT yang diarsipkan.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-100 text-gray-700">
                  <tr>
                    <th scope="col" className="px-4 py-3">Nomor BTT</th>
                    <th scope="col" className="px-4 py-3">Pengirim</th>
                    <th scope="col" className="px-4 py-3">Penerima</th>
                    <th scope="col" className="px-4 py-3">Diarsipkan (WIB)</th>
                    <th scope="col" className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {data.map((item) => (
                    <tr key={item.id}>
                      <th scope="row" className="px-4 py-3 font-semibold">
                        {item.nomor_btt}
                      </th>
                      <td className="px-4 py-3">{item.pengirim}</td>
                      <td className="px-4 py-3">{item.penerima}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {item.archived_at
                          ? formatWaktu.format(new Date(item.archived_at))
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/btt/${item.id}`}
                          className="inline-block rounded-md bg-blue-100 px-3 py-2 font-medium text-blue-700 hover:bg-blue-200"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}