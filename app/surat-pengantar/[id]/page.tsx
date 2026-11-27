"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ADMIN_USER_ID = "6b28a63b-1771-4f75-9eb8-845413237e89";

const KOLOM_SURAT =
  "id, nomor_surat, dari, tujuan, tanggal_pengiriman, petugas, is_archived, archived_at";

const formatWaktuArsip = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const formatAngka = new Intl.NumberFormat("id-ID");

const tombolNetral =
  "rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50";

const tombolBiru =
  "rounded-lg bg-[#183B63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#102C4D] disabled:opacity-50";

const tombolMerah =
  "rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50";

type SuratPengantar = {
  id: number;
  nomor_surat: string;
  dari: string | null;
  tujuan: string | null;
  tanggal_pengiriman: string;
  petugas: string | null;
  is_archived: boolean;
  archived_at: string | null;
};

type DetailKiriman = {
  id: number;
  stt: string | null;
  penerima: string | null;
  pengirim: string | null;
  jumlah_colli: number | null;
  berat: number | null;
  biaya: number | null;
  keterangan: string | null;
};

type Aksi = "arsipkan" | "pulihkan" | "hapus";

const labelAksi: Record<Aksi, string> = {
  arsipkan: "Arsipkan Surat Pengantar",
  pulihkan: "Pulihkan Surat Pengantar",
  hapus: "Hapus Surat Pengantar",
};

const deskripsiAksi: Record<Aksi, string> = {
  arsipkan: "Surat dan seluruh detail kirimannya tetap tersimpan.",
  pulihkan: "Surat akan kembali berstatus Aktif.",
  hapus: "Surat dan seluruh detail kirimannya akan dihapus secara permanen.",
};

function formatTanggal(tanggal: string) {
  if (!tanggal) return "-";

  const [tahun, bulan, hari] = tanggal.split("-");
  return `${hari}/${bulan}/${tahun}`;
}

export default function DetailSuratPengantarPage() {
  const { id } = useParams<{ id: string }>();

  return <DetailSuratPengantar key={id} id={id} />;
}

function DetailSuratPengantar({ id }: { id: string }) {
  const router = useRouter();

  const [surat, setSurat] = useState<SuratPengantar | null>(null);
  const [kiriman, setKiriman] = useState<DetailKiriman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [aksi, setAksi] = useState<Aksi | null>(null);
  const [sedangMemproses, setSedangMemproses] = useState(false);
  const [errorAksi, setErrorAksi] = useState("");
  const [pesanSukses, setPesanSukses] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const admin = session?.user.id === ADMIN_USER_ID;
      setIsAdmin(admin);

      if (!admin) {
        setAksi(null);
        setErrorAksi("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let aktif = true;

    async function ambilData() {
      const [hasilSurat, hasilKiriman] = await Promise.all([
        supabase
          .from("surat_pengantar")
          .select(KOLOM_SURAT)
          .eq("id", id)
          .single(),
        supabase
          .from("surat_pengantar_detail")
          .select(
            "id, stt, penerima, pengirim, jumlah_colli, berat, biaya, keterangan"
          )
          .eq("surat_pengantar_id", id)
          .order("id", { ascending: true }),
      ]);

      if (!aktif) return;

      if (hasilSurat.error || !hasilSurat.data || hasilKiriman.error) {
        setError(
          hasilSurat.error?.message ||
            hasilKiriman.error?.message ||
            "Data Surat Pengantar tidak ditemukan."
        );
      } else {
        setSurat(hasilSurat.data);
        setKiriman(hasilKiriman.data ?? []);
      }

      setLoading(false);
    }

    void ambilData();

    return () => {
      aktif = false;
    };
  }, [id]);

  function bukaKonfirmasi(aksiBaru: Aksi) {
    if (!isAdmin || sedangMemproses) return;

    setErrorAksi("");
    setPesanSukses("");
    setAksi(aksiBaru);
  }

  async function prosesAksi() {
    if (!surat || !aksi || !isAdmin || sedangMemproses) return;

    setSedangMemproses(true);
    setErrorAksi("");

    try {
      const {
        data: { user },
        error: errorAuth,
      } = await supabase.auth.getUser();

      if (errorAuth || user?.id !== ADMIN_USER_ID) {
        throw new Error("Tindakan ini hanya dapat dilakukan oleh admin.");
      }

      if (aksi === "hapus") {
        const { data, error: errorHapus } = await supabase
          .from("surat_pengantar")
          .delete()
          .eq("id", id)
          .eq("is_archived", false)
          .select("id");

        if (errorHapus) throw new Error(errorHapus.message);

        if (!data || data.length !== 1) {
          throw new Error(
            "Surat tidak berhasil dihapus. Muat ulang halaman dan cek status surat."
          );
        }

        setAksi(null);
        router.replace("/surat-pengantar");
        return;
      }

      const arsipkan = aksi === "arsipkan";

      const { data, error: errorUpdate } = await supabase
        .from("surat_pengantar")
        .update({ is_archived: arsipkan })
        .eq("id", id)
        .eq("is_archived", !arsipkan)
        .select(KOLOM_SURAT)
        .maybeSingle();

      if (errorUpdate) throw new Error(errorUpdate.message);

      if (!data || data.is_archived !== arsipkan) {
        throw new Error(
          "Perubahan status belum terkonfirmasi. Muat ulang halaman dan cek status surat."
        );
      }

      setSurat(data);
      setAksi(null);
      setPesanSukses(
        arsipkan
          ? "Surat Pengantar berhasil diarsipkan."
          : "Surat Pengantar berhasil dipulihkan."
      );
    } catch (err) {
      setErrorAksi(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses Surat Pengantar."
      );
    } finally {
      setSedangMemproses(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-gray-900">
        <p role="status">Memuat detail Surat Pengantar...</p>
      </main>
    );
  }

  if (error || !surat) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-gray-900">
        <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm">
          <p role="alert" className="text-red-600">
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

  const informasiSurat = [
    { label: "Nomor Surat", nilai: surat.nomor_surat },
    {
      label: "Tanggal Pengiriman",
      nilai: formatTanggal(surat.tanggal_pengiriman),
    },
    { label: "Dari", nilai: surat.dari || "-" },
    { label: "Tujuan", nilai: surat.tujuan || "-" },
    { label: "Petugas", nilai: surat.petugas || "-" },
  ];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-xl bg-[#183B63] p-6 text-white shadow">
          <h1 className="text-xl font-bold">Informasi Surat Pengantar</h1>
          <p className="mt-1 text-sm text-blue-100">
            Tinjau informasi dokumen dan rincian kiriman yang tercatat
          </p>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 border-b border-gray-200 pb-5">
            <h2 className="text-2xl font-bold">Detail Surat Pengantar</h2>
            <p className="mt-1 text-sm text-gray-500">
              Informasi Surat Pengantar dan daftar kiriman.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                surat.is_archived
                  ? "bg-slate-200 text-slate-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {surat.is_archived ? "Diarsipkan" : "Aktif"}
            </span>

            {surat.is_archived && surat.archived_at && (
              <p className="text-sm text-gray-600">
                {formatWaktuArsip.format(new Date(surat.archived_at))} WIB
              </p>
            )}
          </div>

          {pesanSukses && (
            <p
              role="status"
              className="mb-6 rounded-lg bg-green-50 p-3 text-sm text-green-800"
            >
              {pesanSukses}
            </p>
          )}

          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {informasiSurat.map(({ label, nilai }) => (
              <div key={label}>
                <dt className="text-sm text-gray-500">{label}</dt>
                <dd className="mt-1 font-semibold">{nilai}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold">Daftar Kiriman</h3>
              <p className="text-sm text-gray-500">
                Total kiriman: {kiriman.length}
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-262.5 text-left text-sm">
                <thead className="bg-slate-100 text-gray-700">
                  <tr>
                    {[
                      "No.",
                      "STT",
                      "Penerima",
                      "Pengirim",
                      "Colli",
                      "Berat",
                      "Biaya",
                      "Keterangan",
                    ].map((kolom) => (
                      <th key={kolom} scope="col" className="px-4 py-3">
                        {kolom}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {kiriman.map((item, index) => (
                    <tr key={item.id} className="hover:bg-blue-50">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3 font-medium">{item.stt || "-"}</td>
                      <td className="px-4 py-3">{item.penerima || "-"}</td>
                      <td className="px-4 py-3">{item.pengirim || "-"}</td>
                      <td className="px-4 py-3">{item.jumlah_colli ?? "-"}</td>
                      <td className="px-4 py-3">{item.berat ?? "-"}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {item.biaya === null
                          ? "-"
                          : `Rp ${formatAngka.format(item.biaya)}`}
                      </td>
                      <td className="px-4 py-3">{item.keterangan || "-"}</td>
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

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Link href="/surat-pengantar" className={tombolNetral}>
              Kembali
            </Link>

            {!surat.is_archived && (
              <Link
                href={`/surat-pengantar/${surat.id}/edit`}
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
              >
                Edit
              </Link>
            )}

            <Link
              href={`/surat-pengantar/${surat.id}/print`}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Print Surat Pengantar
            </Link>

            {isAdmin && (
              <button
                type="button"
                className={tombolBiru}
                disabled={sedangMemproses}
                onClick={() =>
                  bukaKonfirmasi(surat.is_archived ? "pulihkan" : "arsipkan")
                }
              >
                {surat.is_archived ? labelAksi.pulihkan : labelAksi.arsipkan}
              </button>
            )}

            {isAdmin && !surat.is_archived && (
              <button
                type="button"
                className={tombolMerah}
                disabled={sedangMemproses}
                onClick={() => bukaKonfirmasi("hapus")}
              >
                {labelAksi.hapus}
              </button>
            )}
          </div>
        </section>
      </div>

      {isAdmin && aksi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="judul-konfirmasi"
            aria-describedby="deskripsi-konfirmasi"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h3 id="judul-konfirmasi" className="text-xl font-bold">
              {labelAksi[aksi]}?
            </h3>
            <div id="deskripsi-konfirmasi" className="mt-3 space-y-2 text-sm">
              <p>
                Surat nomor <strong>{surat.nomor_surat}</strong> berisi{" "}
                <strong>{kiriman.length} kiriman</strong>.
              </p>
              <p className={aksi === "hapus" ? "text-red-700" : "text-gray-600"}>
                {deskripsiAksi[aksi]}
              </p>
            </div>

            {errorAksi && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {errorAksi}
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className={tombolNetral}
                disabled={sedangMemproses}
                onClick={() => setAksi(null)}
              >
                Batal
              </button>

              <button
                type="button"
                className={aksi === "hapus" ? tombolMerah : tombolBiru}
                disabled={sedangMemproses}
                onClick={prosesAksi}
              >
                {sedangMemproses ? "Memproses..." : `Ya, ${labelAksi[aksi]}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}