"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const kirimanAwal: Kiriman = {
  id: 1,
  stt: "",
  penerima: "",
  pengirim: "",
  jumlah_colli: "",
  berat: "",
  biaya: "",
  keterangan: "",
};

export default function TambahSuratPengantarPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    dari: "",
    tujuan: "",
    tanggal_pengiriman: "",
    petugas: "",
  });

  const [daftarKiriman, setDaftarKiriman] = useState<Kiriman[]>([
    kirimanAwal,
  ]);

  const [menyimpan, setMenyimpan] = useState(false);
  const [pesanError, setPesanError] = useState("");

  function ubahForm(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;

    setForm((sebelumnya) => ({
      ...sebelumnya,
      [name]: value,
    }));
  }

  function tambahKiriman() {
    setDaftarKiriman((sebelumnya) => [
      ...sebelumnya,
      {
        id: Date.now(),
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

  function ubahKiriman(
    id: number,
    field: keyof Omit<Kiriman, "id">,
    value: string
  ) {
    setDaftarKiriman((sebelumnya) =>
      sebelumnya.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function hapusKiriman(id: number) {
    if (daftarKiriman.length === 1) {
      alert("Minimal harus ada satu kiriman.");
      return;
    }

    setDaftarKiriman((sebelumnya) =>
      sebelumnya.filter((item) => item.id !== id)
    );
  }

  async function simpanSuratPengantar(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setPesanError("");

    const kirimanTidakLengkap = daftarKiriman.some(
      (item) =>
        !item.stt.trim() ||
        !item.penerima.trim() ||
        !item.pengirim.trim() ||
        !item.jumlah_colli ||
        Number(item.jumlah_colli) <= 0
    );

    if (kirimanTidakLengkap) {
      alert(
        "Lengkapi STT, penerima, pengirim, dan jumlah colli pada setiap kiriman."
      );
      return;
    }

    setMenyimpan(true);

    const { data: surat, error: errorSurat } = await supabase
      .from("surat_pengantar")
      .insert({
        dari: form.dari.trim() || null,
        tujuan: form.tujuan.trim() || null,
        tanggal_pengiriman: form.tanggal_pengiriman,
        petugas: form.petugas.trim() || null,
      })
      .select("id, nomor_surat")
      .single();

    if (errorSurat || !surat) {
      setMenyimpan(false);

      setPesanError(
        "Gagal menyimpan Surat Pengantar: " +
          (errorSurat?.message || "Data tidak ditemukan.")
      );

      return;
    }

    const detailKiriman = daftarKiriman.map((item) => ({
      surat_pengantar_id: surat.id,
      stt: item.stt.trim(),
      penerima: item.penerima.trim(),
      pengirim: item.pengirim.trim(),
      jumlah_colli: Number(item.jumlah_colli),

      berat:
        item.berat === ""
          ? null
          : Number(item.berat),

      biaya:
        item.biaya === ""
          ? null
          : Number(item.biaya),

      keterangan:
        item.keterangan.trim() || null,
    }));

    const { error: errorDetail } = await supabase
      .from("surat_pengantar_detail")
      .insert(detailKiriman);

    setMenyimpan(false);

    if (errorDetail) {
      setPesanError(
        "Surat Pengantar tersimpan, tetapi detail kiriman gagal disimpan: " +
          errorDetail.message
      );

      return;
    }

    alert(
      `Surat Pengantar berhasil disimpan!\nNomor Surat: ${surat.nomor_surat}`
    );

    router.push("/surat-pengantar");
    router.refresh();
  }

  const inputStyle =
    "mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  const labelStyle =
    "block text-sm font-medium text-gray-700";

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
          onSubmit={simpanSuratPengantar}
          className="rounded-xl bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6 border-b border-gray-200 pb-5">
            <h2 className="text-2xl font-bold">
              Input Surat Pengantar
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Isi data Surat Pengantar sesuai dokumen fisik perusahaan.
            </p>
          </div>

          {pesanError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {pesanError}
            </div>
          )}

          <div className="mb-8">
            <h3 className="mb-5 text-lg font-semibold">
              Informasi Surat Pengantar
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className={labelStyle}>
                  Nomor Surat
                </label>

                <input
                  type="text"
                  value="Otomatis"
                  readOnly
                  className="mt-2 w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-3 text-sm text-gray-500"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Nomor Surat Pengantar dibuat otomatis saat data disimpan.
                </p>
              </div>

              <div>
                <label className={labelStyle}>
                  Tanggal Pengiriman *
                </label>

                <input
                  type="date"
                  name="tanggal_pengiriman"
                  value={form.tanggal_pengiriman}
                  onChange={ubahForm}
                  required
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>
                  Dari
                </label>

                <input
                  type="text"
                  name="dari"
                  value={form.dari}
                  onChange={ubahForm}
                  placeholder="Contoh: Jakarta"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>
                  Tujuan
                </label>

                <input
                  type="text"
                  name="tujuan"
                  value={form.tujuan}
                  onChange={ubahForm}
                  placeholder="Contoh: Bandar Lampung"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>
                  Petugas
                </label>

                <input
                  type="text"
                  name="petugas"
                  value={form.petugas}
                  onChange={ubahForm}
                  placeholder="Nama petugas"
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

              <div>
                <h3 className="text-lg font-semibold">
                  Daftar Kiriman
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Tambahkan data STT sesuai Surat Pengantar.
                </p>
              </div>

              <button
                type="button"
                onClick={tambahKiriman}
                className="rounded-lg bg-[#183B63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#102C4D]"
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
                      disabled={daftarKiriman.length === 1}
                      className="text-sm font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                    <div>
                      <label className={labelStyle}>
                        STT *
                      </label>

                      <input
                        type="text"
                        value={item.stt}
                        onChange={(e) =>
                          ubahKiriman(
                            item.id,
                            "stt",
                            e.target.value
                          )
                        }
                        placeholder="Nomor STT"
                        required
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>
                        Penerima *
                      </label>

                      <input
                        type="text"
                        value={item.penerima}
                        onChange={(e) =>
                          ubahKiriman(
                            item.id,
                            "penerima",
                            e.target.value
                          )
                        }
                        placeholder="Nama penerima"
                        required
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>
                        Pengirim *
                      </label>

                      <input
                        type="text"
                        value={item.pengirim}
                        onChange={(e) =>
                          ubahKiriman(
                            item.id,
                            "pengirim",
                            e.target.value
                          )
                        }
                        placeholder="Nama pengirim"
                        required
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>
                        Jumlah Colli *
                      </label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.jumlah_colli}
                        onChange={(e) =>
                          ubahKiriman(
                            item.id,
                            "jumlah_colli",
                            e.target.value
                          )
                        }
                        required
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>
                        Berat
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.berat}
                        onChange={(e) =>
                          ubahKiriman(
                            item.id,
                            "berat",
                            e.target.value
                          )
                        }
                        placeholder="Berat"
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>
                        Biaya
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.biaya}
                        onChange={(e) =>
                          ubahKiriman(
                            item.id,
                            "biaya",
                            e.target.value
                          )
                        }
                        placeholder="Biaya"
                        className={inputStyle}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelStyle}>
                        Keterangan
                      </label>

                      <input
                        type="text"
                        value={item.keterangan}
                        onChange={(e) =>
                          ubahKiriman(
                            item.id,
                            "keterangan",
                            e.target.value
                          )
                        }
                        placeholder="Keterangan"
                        className={inputStyle}
                      />
                    </div>
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
              href="/surat-pengantar"
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium hover:bg-gray-50"
            >
              Kembali
            </Link>

            <button
              type="submit"
              disabled={menyimpan}
              className="rounded-lg bg-[#183B63] px-6 py-3 text-sm font-semibold text-white hover:bg-[#102C4D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {menyimpan
                ? "Menyimpan..."
                : "Simpan Surat Pengantar"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}