"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      setLoading(true);
      setError("");

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

      const awalBulan =
        `${tahun}-${String(bulan).padStart(2, "0")}-01`;

      const bulanBerikut = bulan === 12 ? 1 : bulan + 1;
      const tahunBerikut = bulan === 12 ? tahun + 1 : tahun;

      const awalBulanBerikut =
        `${tahunBerikut}-${String(bulanBerikut).padStart(2, "0")}-01`;

      try {
        const [
          totalBttResult,
          totalSuratResult,
          bttBulanResult,
          suratBulanResult,
          bttTerbaruResult,
          suratTerbaruResult,
        ] = await Promise.all([
          // Total BTT aktif
          supabase
            .from("btt")
            .select("*", { count: "exact", head: true })
            .eq("is_archived", false),

          // Total Surat Pengantar aktif
          supabase
            .from("surat_pengantar")
            .select("*", { count: "exact", head: true })
            .eq("is_archived", false),

          // BTT aktif bulan ini
          supabase
            .from("btt")
            .select("*", { count: "exact", head: true })
            .eq("is_archived", false)
            .gte("tanggal", awalBulan)
            .lt("tanggal", awalBulanBerikut),

          // Surat Pengantar aktif bulan ini
          supabase
            .from("surat_pengantar")
            .select("*", { count: "exact", head: true })
            .eq("is_archived", false)
            .gte("tanggal_pengiriman", awalBulan)
            .lt("tanggal_pengiriman", awalBulanBerikut),

          // Lima BTT aktif terbaru
          supabase
            .from("btt")
            .select("id, nomor_btt, tanggal, penerima")
            .eq("is_archived", false)
            .order("id", { ascending: false })
            .limit(5),

          // Lima Surat Pengantar aktif terbaru
          supabase
            .from("surat_pengantar")
            .select(
              "id, nomor_surat, tanggal_pengiriman, tujuan"
            )
            .eq("is_archived", false)
            .order("id", { ascending: false })
            .limit(5),
        ]);

        if (!aktif) return;

        const semuaHasil = [
          totalBttResult,
          totalSuratResult,
          bttBulanResult,
          suratBulanResult,
          bttTerbaruResult,
          suratTerbaruResult,
        ];

        const errorQuery = semuaHasil.find(
          (hasil) => hasil.error
        )?.error;

        if (errorQuery) {
          throw new Error(errorQuery.message);
        }

        setTotalBtt(totalBttResult.count ?? 0);
        setTotalSurat(totalSuratResult.count ?? 0);
        setBttBulanIni(bttBulanResult.count ?? 0);
        setSuratBulanIni(suratBulanResult.count ?? 0);

        setBttTerbaru(bttTerbaruResult.data ?? []);
        setSuratTerbaru(suratTerbaruResult.data ?? []);
      } catch (err) {
        if (!aktif) return;

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data dashboard."
        );
      } finally {
        if (aktif) setLoading(false);
      }
    }

    void ambilDataDashboard();

    return () => {
      aktif = false;
    };
  }, [router]);

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Gagal logout: " + error.message);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  function formatTanggal(tanggal: string | null) {
    if (!tanggal) return "-";

    const [tahun, bulan, hari] = tanggal.split("-");
    return `${hari}/${bulan}/${tahun}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-gray-900">
        <p>Memuat dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#183B63] p-6 text-white">
          <div>
            <h1 className="text-xl font-bold">
              PT Pandawa Jaya Transindo
            </h1>
            <p className="mt-1 text-sm text-blue-100">
              Dashboard Sistem Administrasi Pengiriman Barang
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        {/* SELAMAT DATANG */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">
            Selamat Datang!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Login sebagai: {email}
          </p>
        </section>

        {/* PESAN ERROR */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Gagal mengambil data dashboard: {error}
          </div>
        )}

        {/* RINGKASAN DATA */}
        {!error && (
          <section className="mb-6">
            <h2 className="mb-4 text-lg font-bold">
              Ringkasan Data Aktif
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total BTT Aktif
                </p>
                <p className="mt-2 text-3xl font-bold text-[#183B63]">
                  {totalBtt}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Surat Pengantar Aktif
                </p>
                <p className="mt-2 text-3xl font-bold text-[#183B63]">
                  {totalSurat}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  BTT Aktif Bulan Ini
                </p>
                <p className="mt-2 text-3xl font-bold text-[#183B63]">
                  {bttBulanIni}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Surat Pengantar Aktif Bulan Ini
                </p>
                <p className="mt-2 text-3xl font-bold text-[#183B63]">
                  {suratBulanIni}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* MENU UTAMA */}
        <section className="mb-6">
          <h2 className="mb-4 text-lg font-bold">
            Menu Utama
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Link
              href="/btt"
              className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-[#183B63]">
                Bukti Tanda Terima (BTT)
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Kelola, tambah, edit, dan cetak dokumen BTT.
              </p>
            </Link>

            <Link
              href="/surat-pengantar"
              className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-[#183B63]">
                Surat Pengantar
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Kelola dokumen Surat Pengantar dan daftar kiriman.
              </p>
            </Link>
          </div>
        </section>

        {/* DATA TERBARU */}
        {!error && (
          <section>
            <h2 className="mb-4 text-lg font-bold">
              Data Aktif Terbaru
            </h2>

            <div className="grid gap-5 lg:grid-cols-2">
              {/* BTT TERBARU */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-[#183B63]">
                    BTT Terbaru
                  </h3>

                  <Link
                    href="/btt"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Lihat Semua
                  </Link>
                </div>

                {bttTerbaru.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Belum ada BTT aktif.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bttTerbaru.map((item) => (
                      <Link
                        key={item.id}
                        href={`/btt/${item.id}`}
                        className="block rounded-lg border border-gray-200 p-3 hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold">
                              BTT {item.nomor_btt}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Penerima: {item.penerima}
                            </p>
                          </div>

                          <p className="text-sm text-gray-500">
                            {formatTanggal(item.tanggal)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* SURAT PENGANTAR TERBARU */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-[#183B63]">
                    Surat Pengantar Terbaru
                  </h3>

                  <Link
                    href="/surat-pengantar"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Lihat Semua
                  </Link>
                </div>

                {suratTerbaru.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Belum ada Surat Pengantar aktif.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {suratTerbaru.map((item) => (
                      <Link
                        key={item.id}
                        href={`/surat-pengantar/${item.id}`}
                        className="block rounded-lg border border-gray-200 p-3 hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold">
                              Surat {item.nomor_surat}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Tujuan: {item.tujuan || "-"}
                            </p>
                          </div>

                          <p className="text-sm text-gray-500">
                            {formatTanggal(
                              item.tanggal_pengiriman
                            )}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
