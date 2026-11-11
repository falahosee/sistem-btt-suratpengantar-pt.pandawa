"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// UUID admin yang sudah diverifikasi di Supabase.
// Digunakan untuk tampilan, bukan pengganti RLS.
const ADMIN_USER_ID =
  "6b28a63b-1771-4f75-9eb8-845413237e89";

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
  const router = useRouter();
  const id = params.id;

  const [btt, setBtt] = useState<Btt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Hak akses tampilan pengguna
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] =
    useState(true);

  // State konfirmasi penghapusan
  const [konfirmasiHapus, setKonfirmasiHapus] =
    useState(false);
  const [sedangMenghapus, setSedangMenghapus] =
    useState(false);
  const [errorHapus, setErrorHapus] = useState("");

  // Memeriksa identitas pengguna login
  useEffect(() => {
    let aktif = true;

    async function cekAdmin() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!aktif) return;

      if (error || !user) {
        setIsAdmin(false);
      } else {
        setIsAdmin(user.id === ADMIN_USER_ID);
      }

      setCheckingAdmin(false);
    }

    cekAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
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

  // Mengambil detail BTT
  useEffect(() => {
    let aktif = true;

    async function ambilBtt() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("btt")
        .select("*")
        .eq("id", id)
        .single();

      if (!aktif) return;

      if (error) {
        setBtt(null);
        setError(
          "Data BTT tidak ditemukan: " + error.message
        );
      } else {
        setBtt(data);
      }

      setLoading(false);
    }

    void ambilBtt();

    return () => {
      aktif = false;
    };
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

  function bukaKonfirmasiHapus() {
    if (!isAdmin || checkingAdmin) return;

    setErrorHapus("");
    setKonfirmasiHapus(true);
  }

  function batalHapus() {
    if (sedangMenghapus) return;

    setKonfirmasiHapus(false);
    setErrorHapus("");
  }

  // Penghapusan hanya dicoba oleh akun admin.
  // RLS Supabase tetap menjadi pengaman utama.
  async function hapusBtt() {
    if (!btt || sedangMenghapus || !isAdmin) {
      return;
    }

    setSedangMenghapus(true);
    setErrorHapus("");

    try {
      // Periksa lagi identitas sebelum DELETE
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (
        authError ||
        !user ||
        user.id !== ADMIN_USER_ID
      ) {
        setIsAdmin(false);
        setKonfirmasiHapus(false);

        throw new Error(
          "Akses ditolak. Hanya admin yang " +
            "dapat menghapus dokumen BTT."
        );
      }

      const { data, error } = await supabase
        .from("btt")
        .delete()
        .eq("id", btt.id)
        .select("id");

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length !== 1) {
        throw new Error(
          "Penghapusan tidak terkonfirmasi. " +
            "Periksa izin DELETE dan SELECT " +
            "pada Supabase."
        );
      }

      setKonfirmasiHapus(false);

      router.push("/btt");
      router.refresh();
    } catch (err) {
      setErrorHapus(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus BTT."
      );
    } finally {
      setSedangMenghapus(false);
    }
  }

  const dataDetail = btt
    ? [
        {
          label: "Nomor BTT",
          nilai: btt.nomor_btt,
        },
        {
          label: "Tanggal",
          nilai: formatTanggal(btt.tanggal),
        },
        {
          label: "Pengirim",
          nilai: btt.pengirim,
        },
        {
          label: "Penerima",
          nilai: btt.penerima,
        },
        {
          label: "Isi Kiriman",
          nilai: btt.isi_kiriman,
        },
        {
          label: "Jumlah Colli",
          nilai: String(btt.jumlah_colli),
        },
        {
          label: "Berat",
          nilai:
            btt.berat === null
              ? "-"
              : `${btt.berat} kg`,
        },
        {
          label: "Pembayaran",
          nilai: btt.pembayaran || "-",
        },
        {
          label: "Biaya",
          nilai: formatRupiah(btt.biaya),
        },
        {
          label: "Petugas",
          nilai: btt.petugas || "-",
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <header className="mb-6 rounded-xl bg-[#183B63] p-6 text-white shadow">
          <h1 className="text-xl font-bold">
            PT Pandawa Jaya Transindo
          </h1>

          <p className="mt-1 text-sm text-blue-100">
            Sistem Administrasi Pengiriman Barang
          </p>
        </header>

        {/* DETAIL BTT */}
        <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 border-b border-gray-200 pb-5">
            <h2 className="text-2xl font-bold">
              Detail BTT
            </h2>

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
              <p className="mb-5 text-red-600">
                {error}
              </p>

              <Link
                href="/btt"
                className="text-sm font-medium text-blue-700"
              >
                Kembali ke Data BTT
              </Link>
            </div>
          ) : btt ? (
            <>
              {/* INFORMASI BTT */}
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

              {/* TOMBOL AKSI */}
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

                {/* HANYA ADMIN MELIHAT TOMBOL HAPUS */}
                {!checkingAdmin && isAdmin && (
                  <button
                    type="button"
                    onClick={bukaKonfirmasiHapus}
                    className="rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Hapus BTT
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">
              Data BTT tidak ditemukan.
            </p>
          )}
        </section>
      </div>

      {/* MODAL KONFIRMASI KHUSUS ADMIN */}
      {konfirmasiHapus && btt && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="judul-konfirmasi-hapus"
            aria-describedby="deskripsi-konfirmasi-hapus"
            className="w-full max-w-md rounded-xl bg-white p-6 text-gray-900 shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span
                className="text-2xl text-red-600"
                aria-hidden="true"
              >
                !
              </span>
            </div>

            <h3
              id="judul-konfirmasi-hapus"
              className="mb-3 text-xl font-bold"
            >
              Konfirmasi Hapus BTT
            </h3>

            <p
              id="deskripsi-konfirmasi-hapus"
              className="text-sm leading-6 text-gray-600"
            >
              Apakah Anda yakin ingin menghapus BTT
              nomor{" "}
              <strong className="text-gray-900">
                {btt.nomor_btt}
              </strong>
              ?
            </p>

            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              Perhatian: Data BTT akan dihapus
              secara permanen dari database.
              Tindakan ini tidak dapat dibatalkan.
            </p>

            {errorHapus && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                Gagal menghapus BTT: {errorHapus}
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={batalHapus}
                disabled={sedangMenghapus}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={hapusBtt}
                disabled={sedangMenghapus}
                className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sedangMenghapus
                  ? "Menghapus..."
                  : "Ya, Hapus BTT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
