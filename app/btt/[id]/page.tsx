"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Pemeriksaan di frontend hanya untuk UI; trigger dan RLS database tetap wajib.
const ADMIN_USER_ID = "6b28a63b-1771-4f75-9eb8-845413237e89";

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
  is_archived: boolean;
  archived_at: string | null;
};

type AksiArsip = "arsip" | "pulihkan";

export default function DetailBttPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [btt, setBtt] = useState<Btt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);
  const [sedangMenghapus, setSedangMenghapus] = useState(false);
  const [errorHapus, setErrorHapus] = useState("");

  const [konfirmasiArsip, setKonfirmasiArsip] = useState<AksiArsip | null>(null);
  const [sedangMemprosesArsip, setSedangMemprosesArsip] = useState(false);
  const [errorArsip, setErrorArsip] = useState("");
  const [pesanSukses, setPesanSukses] = useState("");

  useEffect(() => {
    let aktif = true;

    async function cekAdmin() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!aktif) return;
      setIsAdmin(!authError && !!user && user.id === ADMIN_USER_ID);
      setCheckingAdmin(false);
    }

    void cekAdmin();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (!aktif) return;
      setIsAdmin(false);
      setCheckingAdmin(true);
      void cekAdmin();
    });

    return () => {
      aktif = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let aktif = true;

    async function ambilBtt() {
      setLoading(true);
      setError("");
      const { data, error: fetchError } = await supabase
        .from("btt")
        .select("*")
        .eq("id", id)
        .single();

      if (!aktif) return;
      if (fetchError) {
        setBtt(null);
        setError("Data BTT tidak ditemukan: " + fetchError.message);
      } else {
        setBtt(data as Btt);
      }
      setLoading(false);
    }

    void ambilBtt();
    return () => { aktif = false; };
  }, [id]);

  function formatRupiah(nilai: number | null) {
    if (nilai === null) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", maximumFractionDigits: 0,
    }).format(nilai);
  }

  function formatTanggal(tanggal: string) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
    }).format(new Date(tanggal + "T00:00:00Z"));
  }

  function formatWaktuArsip(tanggal: string | null) {
    if (!tanggal) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
    }).format(new Date(tanggal));
  }

  async function pastikanAdmin() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== ADMIN_USER_ID) {
      setIsAdmin(false);
      throw new Error("Akses ditolak. Hanya admin yang dapat melakukan tindakan ini.");
    }
  }

  function bukaKonfirmasiHapus() {
    if (!isAdmin || checkingAdmin || !btt || btt.is_archived) return;
    setErrorHapus("");
    setKonfirmasiHapus(true);
  }

  function batalHapus() {
    if (sedangMenghapus) return;
    setKonfirmasiHapus(false);
    setErrorHapus("");
  }

  async function hapusBtt() {
    if (!btt || sedangMenghapus || !isAdmin || btt.is_archived) return;
    setSedangMenghapus(true);
    setErrorHapus("");
    try {
      await pastikanAdmin();
      const { data, error: deleteError } = await supabase
        .from("btt")
        .delete()
        .eq("id", btt.id)
        .eq("is_archived", false)
        .select("id");

      if (deleteError) throw new Error(deleteError.message);
      if (!data || data.length !== 1) {
        throw new Error("Penghapusan tidak terkonfirmasi. Periksa izin DELETE dan SELECT pada Supabase.");
      }
      setKonfirmasiHapus(false);
      router.push("/btt");
      router.refresh();
    } catch (err) {
      setErrorHapus(err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus BTT.");
    } finally {
      setSedangMenghapus(false);
    }
  }

  function bukaKonfirmasiArsip(aksi: AksiArsip) {
    if (!isAdmin || checkingAdmin || !btt) return;
    if (aksi === "arsip" && btt.is_archived) return;
    if (aksi === "pulihkan" && !btt.is_archived) return;
    setPesanSukses("");
    setErrorArsip("");
    setKonfirmasiArsip(aksi);
  }

  function batalArsip() {
    if (sedangMemprosesArsip) return;
    setKonfirmasiArsip(null);
    setErrorArsip("");
  }

  async function prosesArsip() {
    if (!btt || !konfirmasiArsip || !isAdmin || sedangMemprosesArsip) return;
    const aksi = konfirmasiArsip;
    const statusAwal = aksi === "arsip" ? false : true;
    const statusBaru = !statusAwal;
    if (btt.is_archived !== statusAwal) {
      setErrorArsip("Status dokumen sudah berubah. Muat ulang halaman sebelum melanjutkan.");
      return;
    }

    setSedangMemprosesArsip(true);
    setErrorArsip("");
    try {
      await pastikanAdmin();
      // archived_at diatur oleh trigger database, bukan oleh browser.
      const { data, error: updateError } = await supabase
        .from("btt")
        .update({ is_archived: statusBaru })
        .eq("id", btt.id)
        .eq("is_archived", statusAwal)
        .select("*");

      if (updateError) throw new Error(updateError.message);
      if (!data || data.length !== 1) {
        throw new Error("Perubahan status tidak terkonfirmasi. Periksa hak akses atau status terbaru dokumen.");
      }

      const hasil = data[0] as Btt;
      if (hasil.is_archived !== statusBaru) {
        throw new Error("Status dokumen tidak sesuai dengan hasil yang diharapkan.");
      }

      setBtt(hasil);
      setKonfirmasiArsip(null);
      setPesanSukses(
        aksi === "arsip"
          ? "BTT berhasil diarsipkan. Data tetap tersimpan di database."
          : "BTT berhasil dipulihkan menjadi dokumen aktif."
      );
      router.refresh();
    } catch (err) {
      setErrorArsip(err instanceof Error ? err.message : "Gagal mengubah status arsip BTT.");
    } finally {
      setSedangMemprosesArsip(false);
    }
  }

  const dataDetail = btt ? [
    { label: "Nomor BTT", nilai: btt.nomor_btt },
    { label: "Tanggal", nilai: formatTanggal(btt.tanggal) },
    { label: "Pengirim", nilai: btt.pengirim },
    { label: "Penerima", nilai: btt.penerima },
    { label: "Isi Kiriman", nilai: btt.isi_kiriman },
    { label: "Jumlah Colli", nilai: String(btt.jumlah_colli) },
    { label: "Berat", nilai: btt.berat === null ? "-" : `${btt.berat} kg` },
    { label: "Pembayaran", nilai: btt.pembayaran || "-" },
    { label: "Biaya", nilai: formatRupiah(btt.biaya) },
    { label: "Petugas", nilai: btt.petugas || "-" },
  ] : [];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 rounded-xl bg-[#183B63] p-6 text-white shadow">
          <h1 className="text-xl font-bold">PT Pandawa Jaya Transindo</h1>
          <p className="mt-1 text-sm text-blue-100">Sistem Administrasi Pengiriman Barang</p>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 border-b border-gray-200 pb-5">
            <h2 className="text-2xl font-bold">Detail BTT</h2>
            <p className="mt-1 text-sm text-gray-500">Informasi Bukti Tanda Terima pengiriman barang</p>
          </div>

          {loading ? (
            <p className="py-8 text-center text-gray-500">Memuat detail BTT...</p>
          ) : error ? (
            <div>
              <p className="mb-5 text-red-600">{error}</p>
              <Link href="/btt" className="text-sm font-medium text-blue-700">Kembali ke Data BTT</Link>
            </div>
          ) : btt ? (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${btt.is_archived ? "bg-slate-200 text-slate-800" : "bg-green-100 text-green-800"}`}>
                  {btt.is_archived ? "Diarsipkan" : "Aktif"}
                </span>
                {btt.is_archived && (
                  <span className="text-sm text-gray-600">Diarsipkan pada {formatWaktuArsip(btt.archived_at)}</span>
                )}
              </div>

              {btt.is_archived && (
                <p className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  Dokumen ini sedang diarsipkan. Informasi tetap bisa dilihat dan dicetak, tetapi tidak dapat diedit atau dihapus permanen.
                </p>
              )}

              {pesanSukses && (
                <p role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  {pesanSukses}
                </p>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                {dataDetail.map((item) => (
                  <div key={item.label}>
                    <p className="mb-1 text-sm text-gray-500">{item.label}</p>
                    <p className="font-medium text-gray-900">{item.nilai}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-6">
                <Link href="/btt" className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium hover:bg-gray-50">
                  Kembali
                </Link>

                {!btt.is_archived && (
                  <Link href={`/btt/${btt.id}/edit`} className="rounded-lg bg-amber-100 px-5 py-3 text-sm font-medium text-amber-800 hover:bg-amber-200">
                    Edit BTT
                  </Link>
                )}

                <Link href={`/btt/${btt.id}/print`} className="rounded-lg bg-green-100 px-5 py-3 text-sm font-medium text-green-800 hover:bg-green-200">
                  Print BTT
                </Link>

                {!checkingAdmin && isAdmin && (
                  <>
                    {btt.is_archived ? (
                      <button type="button" onClick={() => bukaKonfirmasiArsip("pulihkan")} className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-medium text-white hover:bg-blue-800">
                        Pulihkan BTT
                      </button>
                    ) : (
                      <>
                        <button type="button" onClick={() => bukaKonfirmasiArsip("arsip")} className="rounded-lg bg-slate-700 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
                          Arsipkan BTT
                        </button>
                        <button type="button" onClick={bukaKonfirmasiHapus} className="rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700">
                          Hapus BTT
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Data BTT tidak ditemukan.</p>
          )}
        </section>
      </div>

      {konfirmasiArsip && btt && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="judul-konfirmasi-arsip" aria-describedby="deskripsi-konfirmasi-arsip" className="w-full max-w-md rounded-xl bg-white p-6 text-gray-900 shadow-xl">
            <h3 id="judul-konfirmasi-arsip" className="mb-3 text-xl font-bold">
              {konfirmasiArsip === "arsip" ? "Konfirmasi Arsip BTT" : "Konfirmasi Pemulihan BTT"}
            </h3>
            <p id="deskripsi-konfirmasi-arsip" className="text-sm leading-6 text-gray-600">
              {konfirmasiArsip === "arsip"
                ? <>Arsipkan BTT nomor <strong>{btt.nomor_btt}</strong>? Data tidak akan dihapus dan dapat dipulihkan kembali.</>
                : <>Pulihkan BTT nomor <strong>{btt.nomor_btt}</strong> menjadi dokumen aktif?</>}
            </p>
            {errorArsip && (
              <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorArsip}</p>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={batalArsip} disabled={sedangMemprosesArsip} className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Batal</button>
              <button type="button" onClick={prosesArsip} disabled={sedangMemprosesArsip} className="rounded-lg bg-[#183B63] px-5 py-3 text-sm font-semibold text-white hover:bg-[#102C4D] disabled:opacity-50">
                {sedangMemprosesArsip ? "Memproses..." : konfirmasiArsip === "arsip" ? "Ya, Arsipkan BTT" : "Ya, Pulihkan BTT"}
              </button>
            </div>
          </div>
        </div>
      )}

      {konfirmasiHapus && btt && isAdmin && !btt.is_archived && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="judul-konfirmasi-hapus" aria-describedby="deskripsi-konfirmasi-hapus" className="w-full max-w-md rounded-xl bg-white p-6 text-gray-900 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl text-red-600" aria-hidden="true">!</span>
            </div>
            <h3 id="judul-konfirmasi-hapus" className="mb-3 text-xl font-bold">Konfirmasi Hapus BTT</h3>
            <p id="deskripsi-konfirmasi-hapus" className="text-sm leading-6 text-gray-600">
              Apakah Anda yakin ingin menghapus BTT nomor <strong className="text-gray-900">{btt.nomor_btt}</strong>?
            </p>
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              Perhatian: Data BTT akan dihapus secara permanen dari database. Tindakan ini tidak dapat dibatalkan.
            </p>
            {errorHapus && (
              <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Gagal menghapus BTT: {errorHapus}
              </div>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={batalHapus} disabled={sedangMenghapus} className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Batal</button>
              <button type="button" onClick={hapusBtt} disabled={sedangMenghapus} className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {sedangMenghapus ? "Menghapus..." : "Ya, Hapus BTT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
