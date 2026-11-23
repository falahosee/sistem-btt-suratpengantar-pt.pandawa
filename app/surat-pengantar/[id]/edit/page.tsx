"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Kiriman = {
  id: number;
  stt: string;
  penerima: string;
  pengirim: string;
  jumlah_colli: string;
  berat: string;
  biaya: string;
  keterangan: string;
};

type FormSurat = {
  nomor_surat: string;
  dari: string;
  tujuan: string;
  tanggal_pengiriman: string;
  petugas: string;
};

const inputStyle =
  "mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function EditSuratPengantarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const idSurat = Number(id);
  const idBaru = useRef(-1);
  const idDetailAwal = useRef<number[]>([]);

  const [form, setForm] = useState<FormSurat>({
    nomor_surat: "",
    dari: "",
    tujuan: "",
    tanggal_pengiriman: "",
    petugas: "",
  });

  const [daftarKiriman, setDaftarKiriman] = useState<Kiriman[]>([]);
  const [loading, setLoading] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let aktif = true;

    async function ambilData() {
      setLoading(true);
      setError("");

      if (!Number.isSafeInteger(idSurat) || idSurat <= 0) {
        setError("ID Surat Pengantar tidak valid.");
        setLoading(false);
        return;
      }

      const { data: surat, error: errorSurat } = await supabase
        .from("surat_pengantar")
        .select(
          "id, nomor_surat, dari, tujuan, tanggal_pengiriman, petugas, is_archived"
        )
        .eq("id", idSurat)
        .single();

      if (!aktif) return;

      if (errorSurat || !surat) {
        setError(
          errorSurat?.message || "Surat Pengantar tidak ditemukan."
        );
        setLoading(false);
        return;
      }

      if (surat.is_archived) {
        setError(
          "Surat Pengantar yang diarsipkan tidak dapat diedit. Pulihkan terlebih dahulu."
        );
        setLoading(false);
        return;
      }

      const { data: detail, error: errorDetail } = await supabase
        .from("surat_pengantar_detail")
        .select(
          "id, stt, penerima, pengirim, jumlah_colli, berat, biaya, keterangan"
        )
        .eq("surat_pengantar_id", idSurat)
        .order("id", { ascending: true });

      if (!aktif) return;

      if (errorDetail) {
        setError(errorDetail.message);
        setLoading(false);
        return;
      }

      setForm({
        nomor_surat: surat.nomor_surat || "",
        dari: surat.dari || "",
        tujuan: surat.tujuan || "",
        tanggal_pengiriman: surat.tanggal_pengiriman || "",
        petugas: surat.petugas || "",
      });

      const rincian = (detail ?? []).map((item) => ({
        id: item.id,
        stt: item.stt || "",
        penerima: item.penerima || "",
        pengirim: item.pengirim || "",
        jumlah_colli:
          item.jumlah_colli == null
            ? ""
            : String(item.jumlah_colli),
        berat:
          item.berat == null
            ? ""
            : String(item.berat),
        biaya:
          item.biaya == null
            ? ""
            : String(item.biaya),
        keterangan: item.keterangan || "",
      }));

      idDetailAwal.current = rincian.map((item) => item.id);
      setDaftarKiriman(rincian);
      setLoading(false);
    }

    void ambilData();

    return () => {
      aktif = false;
    };
  }, [idSurat]);

  function ubahForm(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;

    setError("");

    setForm((sebelumnya) => ({
      ...sebelumnya,
      [name]: value,
    }));
  }

  function ubahKiriman(
    idKiriman: number,
    field: keyof Omit<Kiriman, "id">,
    value: string
  ) {
    setError("");

    setDaftarKiriman((sebelumnya) =>
      sebelumnya.map((item) =>
        item.id === idKiriman
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function tambahKiriman() {
    setError("");

    const idSementara = idBaru.current--;

    setDaftarKiriman((sebelumnya) => [
      ...sebelumnya,
      {
        id: idSementara,
        stt: "",
        penerima: "",
        pengirim: "",
        jumlah_colli: "",
        berat: "",
        biaya: "",
        keterangan: "",
      },
    ]);
  }

  function hapusKiriman(idKiriman: number) {
    if (daftarKiriman.length <= 1) {
      setError("Minimal harus ada satu kiriman.");
      return;
    }

    setError("");

    setDaftarKiriman((sebelumnya) =>
      sebelumnya.filter(
        (item) => item.id !== idKiriman
      )
    );
  }

  function validasi(): string | null {
    if (daftarKiriman.length === 0) {
      return "Minimal harus ada satu kiriman.";
    }

    if (!form.tanggal_pengiriman) {
      return "Tanggal Pengiriman wajib diisi.";
    }

    const sttTerdaftar = new Set<string>();

    for (const item of daftarKiriman) {
      if (
        !item.stt.trim() ||
        !item.penerima.trim() ||
        !item.pengirim.trim()
      ) {
        return "STT, penerima, dan pengirim harus diisi pada setiap kiriman.";
      }

      const jumlah = Number(item.jumlah_colli);

      if (
        !item.jumlah_colli.trim() ||
        !Number.isSafeInteger(jumlah) ||
        jumlah <= 0
      ) {
        return "Jumlah colli harus berupa bilangan bulat lebih dari nol.";
      }

      // Validasi STT duplikat.
      const sttNormal = item.stt.trim().toUpperCase();

      if (sttTerdaftar.has(sttNormal)) {
        return (
          `STT "${item.stt.trim()}" digunakan lebih dari satu kali. ` +
          "Setiap kiriman harus memiliki STT berbeda."
        );
      }

      sttTerdaftar.add(sttNormal);

      if (
        item.berat.trim() &&
        (
          !Number.isFinite(Number(item.berat)) ||
          Number(item.berat) < 0
        )
      ) {
        return "Berat harus berupa angka yang tidak negatif.";
      }

      if (
        item.biaya.trim() &&
        (
          !Number.isSafeInteger(Number(item.biaya)) ||
          Number(item.biaya) < 0
        )
      ) {
        return "Biaya harus berupa bilangan bulat yang tidak negatif.";
      }
    }

    return null;
  }

  async function simpanPerubahan(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (menyimpan) return;

    const pesan = validasi();

    if (pesan) {
      setError(pesan);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setMenyimpan(true);
    setError("");

    try {
      // Perbarui informasi utama Surat Pengantar.
      const {
        data: suratDiperbarui,
        error: errorSurat,
      } = await supabase
        .from("surat_pengantar")
        .update({
          dari: form.dari.trim() || null,
          tujuan: form.tujuan.trim() || null,
          tanggal_pengiriman:
            form.tanggal_pengiriman,
          petugas: form.petugas.trim() || null,
        })
        .eq("id", idSurat)
        .eq("is_archived", false)
        .select("id");

      if (errorSurat) throw errorSurat;

      if (suratDiperbarui?.length !== 1) {
        throw new Error(
          "Surat tidak berhasil diperbarui. Periksa izin akses dan status arsip."
        );
      }

      // Perbarui detail lama berdasarkan ID.
      // Tidak lagi menghapus semua detail lama.
      for (const item of daftarKiriman.filter(
        (kiriman) => kiriman.id > 0
      )) {
        const dataDetail = {
          stt: item.stt.trim(),
          penerima: item.penerima.trim(),
          pengirim: item.pengirim.trim(),
          jumlah_colli: Number(item.jumlah_colli),
          berat:
            item.berat.trim() === ""
              ? null
              : Number(item.berat),
          biaya:
            item.biaya.trim() === ""
              ? null
              : Number(item.biaya),
          keterangan:
            item.keterangan.trim() || null,
        };

        const {
          data,
          error: errorUpdate,
        } = await supabase
          .from("surat_pengantar_detail")
          .update(dataDetail)
          .eq("id", item.id)
          .eq("surat_pengantar_id", idSurat)
          .select("id");

        if (errorUpdate) throw errorUpdate;

        if (data?.length !== 1) {
          throw new Error(
            `Detail ID ${item.id} gagal diperbarui. ` +
            "Periksa kebijakan akses Supabase."
          );
        }
      }

      // Tambahkan hanya detail yang baru dibuat.
      const kirimanBaru = daftarKiriman.filter(
        (item) => item.id < 0
      );

      if (kirimanBaru.length > 0) {
        const dataBaru = kirimanBaru.map((item) => ({
          surat_pengantar_id: idSurat,
          stt: item.stt.trim(),
          penerima: item.penerima.trim(),
          pengirim: item.pengirim.trim(),
          jumlah_colli: Number(item.jumlah_colli),
          berat:
            item.berat.trim() === ""
              ? null
              : Number(item.berat),
          biaya:
            item.biaya.trim() === ""
              ? null
              : Number(item.biaya),
          keterangan:
            item.keterangan.trim() || null,
        }));

        const {
          data,
          error: errorInsert,
        } = await supabase
          .from("surat_pengantar_detail")
          .insert(dataBaru)
          .select("id");

        if (errorInsert) throw errorInsert;

        if (data?.length !== dataBaru.length) {
          throw new Error(
            "Sebagian detail baru tidak dapat diverifikasi. " +
            "Periksa database sebelum mengulang penyimpanan."
          );
        }
      }

      // Hapus hanya kiriman yang dihapus dari form.
      const idSaatIni = new Set(
        daftarKiriman
          .filter((item) => item.id > 0)
          .map((item) => item.id)
      );

      const idDihapus = idDetailAwal.current.filter(
        (detailId) => !idSaatIni.has(detailId)
      );

      if (idDihapus.length > 0) {
        const {
          data,
          error: errorHapus,
        } = await supabase
          .from("surat_pengantar_detail")
          .delete()
          .eq("surat_pengantar_id", idSurat)
          .in("id", idDihapus)
          .select("id");

        if (errorHapus) throw errorHapus;

        if (data?.length !== idDihapus.length) {
          throw new Error(
            "Sebagian detail tidak terhapus. " +
            "Periksa izin DELETE pada Supabase."
          );
        }
      }

      alert("Surat Pengantar berhasil diperbarui!");

      router.push(`/surat-pengantar/${idSurat}`);
      router.refresh();
    } catch (err) {
      setError(
        "Proses pembaruan belum selesai: " +
        (
          err instanceof Error
            ? err.message
            : String(err)
        ) +
        ". Jangan tekan Simpan berulang kali; periksa data terlebih dahulu."
      );

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setMenyimpan(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        Memuat data Surat Pengantar...
      </main>
    );
  }

  if (!daftarKiriman.length && error) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-red-600">
        {error}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-xl bg-[#183B63] p-6 text-white shadow">
          <h1 className="text-xl font-bold">
            PT Pandawa Jaya Transindo
          </h1>
          <p className="mt-1 text-sm text-blue-100">
            Sistem Administrasi Pengiriman Barang
          </p>
        </header>

        <form
          onSubmit={simpanPerubahan}
          className="rounded-xl bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6 border-b border-gray-200 pb-5">
            <h2 className="text-2xl font-bold">
              Edit Surat Pengantar
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Perbarui data Surat Pengantar dan daftar kiriman.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="nomor-surat"
                className="block text-sm font-medium text-gray-700"
              >
                Nomor Surat
              </label>
              <input
                id="nomor-surat"
                type="text"
                value={form.nomor_surat}
                readOnly
                className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-3 text-sm text-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nomor Surat dibuat otomatis dan tidak dapat diubah.
              </p>
            </div>

            {(
              [
                [
                  "tanggal_pengiriman",
                  "Tanggal Pengiriman *",
                  "date",
                ],
                ["dari", "Dari", "text"],
                ["tujuan", "Tujuan", "text"],
                ["petugas", "Petugas", "text"],
              ] as const
            ).map(([name, label, type]) => (
              <div key={name}>
                <label
                  htmlFor={name}
                  className="block text-sm font-medium text-gray-700"
                >
                  {label}
                </label>
                <input
                  id={name}
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={ubahForm}
                  required={name === "tanggal_pengiriman"}
                  className={inputStyle}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">
                Daftar Kiriman
              </h3>
              <button
                type="button"
                onClick={tambahKiriman}
                disabled={menyimpan}
                className="rounded-lg bg-[#183B63] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                + Tambah Kiriman
              </button>
            </div>

            <div className="space-y-4">
              {daftarKiriman.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-200 bg-slate-50 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold">
                      Kiriman {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => hapusKiriman(item.id)}
                      disabled={
                        menyimpan ||
                        daftarKiriman.length <= 1
                      }
                      className="text-sm text-red-600 disabled:opacity-40"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {(
                      [
                        ["stt", "STT *", "text", true],
                        ["penerima", "Penerima *", "text", true],
                        ["pengirim", "Pengirim *", "text", true],
                        [
                          "jumlah_colli",
                          "Jumlah Colli *",
                          "number",
                          true,
                        ],
                        ["berat", "Berat", "number", false],
                        ["biaya", "Biaya", "number", false],
                        [
                          "keterangan",
                          "Keterangan",
                          "text",
                          false,
                        ],
                      ] as const
                    ).map(
                      ([field, label, type, required]) => (
                        <div
                          key={field}
                          className={
                            field === "keterangan"
                              ? "md:col-span-2"
                              : ""
                          }
                        >
                          <label
                            htmlFor={`${item.id}-${field}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            {label}
                          </label>
                          <input
                            id={`${item.id}-${field}`}
                            type={type}
                            value={item[field]}
                            onChange={(e) =>
                              ubahKiriman(
                                item.id,
                                field,
                                e.target.value
                              )
                            }
                            placeholder={label.replace(
                              " *",
                              ""
                            )}
                            required={required}
                            min={
                              field === "jumlah_colli"
                                ? "1"
                                : type === "number"
                                  ? "0"
                                  : undefined
                            }
                            step={
                              field === "berat"
                                ? "any"
                                : type === "number"
                                  ? "1"
                                  : undefined
                            }
                            className={inputStyle}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Total kiriman: {daftarKiriman.length}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-6">
            <Link
              href={`/surat-pengantar/${idSurat}`}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={menyimpan}
              className="rounded-lg bg-[#183B63] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {menyimpan
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
