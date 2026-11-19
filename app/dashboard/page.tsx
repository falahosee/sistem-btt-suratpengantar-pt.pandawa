"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavigasiUtama from "@/component/NavigasiUtama";
import { supabase } from "@/lib/supabase";

type BttTerbaru = {
  id: number;
  nomor_btt: string;
  tanggal: string;
  penerima: string;
};

type SuratTerbaru = {
  id: number;
  nomor_surat: string;
  tanggal_pengiriman: string | null;
  tujuan: string | null;
};

function formatTanggal(tanggal: string | null) {
  if (!tanggal) return "-";

  const [tahun, bulan, hari] = tanggal.split("-");
  return `${hari}/${bulan}/${tahun}`;
}

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalBtt, setTotalBtt] = useState(0);
  const [totalSurat, setTotalSurat] = useState(0);
  const [bttBulanIni, setBttBulanIni] = useState(0);
  const [suratBulanIni, setSuratBulanIni] = useState(0);
  const [bttTerbaru, setBttTerbaru] = useState<BttTerbaru[]>([]);
  const [suratTerbaru, setSuratTerbaru] = useState<SuratTerbaru[]>([]);

  useEffect(() => {
    let aktif = true;

    async function ambilDataDashboard() {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (!aktif) return;

      if (userError || !userData.user) {
        router.replace("/login");
        return;
      }

      setEmail(userData.user.email || "");

      const sekarang = new Date();
      const tahun = sekarang.getFullYear();
      const bulan = sekarang.getMonth() + 1;
      const awalBulan = `${tahun}-${String(bulan).padStart(2, "0")}-01`;

      const bulanBerikut = bulan === 12 ? 1 : bulan + 1;
      const tahunBerikut = bulan === 12 ? tahun + 1 : tahun;
      const awalBulanBerikut =
        `${tahunBerikut}-${String(bulanBerikut).padStart(2, "0")}-01`;

      try {
        const [totalBtt, totalSurat, bttBulan, suratBulan, btt, surat] =
          await Promise.all([
            supabase
              .from("btt")
              .select("*", { count: "exact", head: true })
              .eq("is_archived", false),

            supabase
              .from("surat_pengantar")
              .select("*", { count: "exact", head: true })
              .eq("is_archived", false),

            supabase
              .from("btt")
              .select("*", { count: "exact", head: true })
              .eq("is_archived", false)
              .gte("tanggal", awalBulan)
              .lt("tanggal", awalBulanBerikut),

            supabase
              .from("surat_pengantar")
              .select("*", { count: "exact", head: true })
              .eq("is_archived", false)
              .gte("tanggal_pengiriman", awalBulan)
              .lt("tanggal_pengiriman", awalBulanBerikut),

            supabase
              .from("btt")
              .select("id, nomor_btt, tanggal, penerima")
              .eq("is_archived", false)
              .order("id", { ascending: false })
              .limit(5),

            supabase
              .from("surat_pengantar")
              .select("id, nomor_surat, tanggal_pengiriman, tujuan")
              .eq("is_archived", false)
              .order("id", { ascending: false })
              .limit(5),
          ]);

        if (!aktif) return;

        const hasil = [totalBtt, totalSurat, bttBulan, suratBulan, btt, surat];
        const errorQuery = hasil.find((item) => item.error)?.error;

        if (errorQuery) throw new Error(errorQuery.message);

        setTotalBtt(totalBtt.count ?? 0);
        setTotalSurat(totalSurat.count ?? 0);
        setBttBulanIni(bttBulan.count ?? 0);
        setSuratBulanIni(suratBulan.count ?? 0);
        setBttTerbaru(btt.data ?? []);
        setSuratTerbaru(surat.data ?? []);
      } catch (err) {
        if (aktif) {
          setError(
            err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data."
          );
        }
      } finally {
        if (aktif) setLoading(false);
      }
    }

    void ambilDataDashboard();

    return () => {
      aktif = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
        <p role="status">Memuat dashboard...</p>
      </main>
    );
  }

  const statistik = [
    { label: "Total BTT Aktif", jumlah: totalBtt },
    { label: "Total Surat Pengantar Aktif", jumlah: totalSurat },
    { label: "BTT Aktif Bulan Ini", jumlah: bttBulanIni },
    { label: "Surat Pengantar Aktif Bulan Ini", jumlah: suratBulanIni },
  ];

  const dataTerbaru = [
    {
      judul: "BTT Terbaru",
      href: "/btt",
      pesanKosong: "Belum ada BTT aktif.",
      dokumen: bttTerbaru.map((item) => ({
        href: `/btt/${item.id}`,
        nomor: `BTT ${item.nomor_btt}`,
        keterangan: `Penerima: ${item.penerima}`,
        tanggal: item.tanggal,
      })),
    },
    {
      judul: "Surat Pengantar Terbaru",
      href: "/surat-pengantar",
      pesanKosong: "Belum ada Surat Pengantar aktif.",
      dokumen: suratTerbaru.map((item) => ({
        href: `/surat-pengantar/${item.id}`,
        nomor: `Surat ${item.nomor_surat}`,
        keterangan: `Tujuan: ${item.tujuan || "-"}`,
        tanggal: item.tanggal_pengiriman,
      })),
    },
  ];

  return (
    <>
      <NavigasiUtama />

      <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="mt-1 break-all text-sm text-slate-600">
                Login sebagai: {email}
              </p>
            </div>

            <div className="flex flex-wrap gap-2" aria-label="Aksi cepat">
              <Link
                href="/btt/tambah"
                className="inline-flex min-h-11 items-center rounded-lg bg-[#183B63] px-4 text-sm font-semibold text-white hover:bg-[#102f51] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B63]"
              >
                + Buat BTT
              </Link>
              <Link
                href="/surat-pengantar/tambah"
                className="inline-flex min-h-11 items-center rounded-lg border border-[#183B63] bg-white px-4 text-sm font-semibold text-[#183B63] hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B63]"
              >
                + Buat Surat Pengantar
              </Link>
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              Gagal mengambil data dashboard: {error}
            </p>
          ) : (
            <>
              <section className="mb-6">
                <h2 className="mb-3 text-lg font-bold">Ringkasan Data Aktif</h2>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {statistik.map(({ label, jumlah }) => (
                    <div key={label} className="rounded-xl bg-white p-5 shadow-sm">
                      <dt className="text-sm text-slate-600">{label}</dt>
                      <dd className="mt-2 text-3xl font-bold tabular-nums text-[#183B63]">
                        {jumlah}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section>
                <h2 className="mb-3 text-lg font-bold">Data Aktif Terbaru</h2>

                <div className="grid gap-5 lg:grid-cols-2">
                  {dataTerbaru.map(({ judul, href, pesanKosong, dokumen }) => (
                    <div key={href} className="rounded-xl bg-white p-5 shadow-sm">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold text-[#183B63]">{judul}</h3>
                        <Link
                          href={href}
                          aria-label={`Lihat semua ${judul === "BTT Terbaru" ? "BTT" : "Surat Pengantar"}`}
                          className="text-sm font-medium text-blue-700 hover:underline"
                        >
                          Lihat Semua
                        </Link>
                      </div>

                      {dokumen.length === 0 ? (
                        <p className="text-sm text-slate-600">{pesanKosong}</p>
                      ) : (
                        <ul className="space-y-2">
                          {dokumen.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                              >
                                <div className="min-w-0">
                                  <p className="font-semibold">{item.nomor}</p>
                                  <p className="wrap-break-words text-sm text-slate-600">
                                    {item.keterangan}
                                  </p>
                                </div>
                                <span className="text-sm tabular-nums text-slate-600">
                                  {formatTanggal(item.tanggal)}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}