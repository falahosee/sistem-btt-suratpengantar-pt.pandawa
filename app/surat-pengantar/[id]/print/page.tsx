"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type SuratPengantar = {
  id: number;
  nomor_surat: string;
  dari: string | null;
  tujuan: string | null;
  tanggal_pengiriman: string;
  petugas: string | null;
};

type DetailKiriman = {
  id: number;
  surat_pengantar_id: number;
  stt: string | null;
  penerima: string | null;
  pengirim: string | null;
  jumlah_colli: number | null;
  berat: number | null;
  biaya: number | null;
  keterangan: string | null;
};

export default function PrintSuratPengantarPage() {
  const { id } = useParams<{ id: string }>();

  const [surat, setSurat] = useState<SuratPengantar | null>(null);
  const [kiriman, setKiriman] = useState<DetailKiriman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function ambilData() {
      setLoading(true);
      setError("");

      const { data: dataSurat, error: errorSurat } = await supabase
        .from("surat_pengantar")
        .select(
          "id, nomor_surat, dari, tujuan, tanggal_pengiriman, petugas"
        )
        .eq("id", id)
        .single();

      if (errorSurat || !dataSurat) {
        setError(
          errorSurat?.message || "Data Surat Pengantar tidak ditemukan."
        );
        setLoading(false);
        return;
      }

      const { data: dataKiriman, error: errorKiriman } = await supabase
        .from("surat_pengantar_detail")
        .select(
          "id, surat_pengantar_id, stt, penerima, pengirim, jumlah_colli, berat, biaya, keterangan"
        )
        .eq("surat_pengantar_id", id)
        .order("id", { ascending: true });

      if (errorKiriman) {
        setError(errorKiriman.message);
        setLoading(false);
        return;
      }

      setSurat(dataSurat);
      setKiriman(dataKiriman ?? []);
      setLoading(false);
    }

    ambilData();
  }, [id]);

  function formatTanggal(tanggal: string) {
    if (!tanggal) return "-";

    const [tahun, bulan, hari] = tanggal.split("-");

    return `${hari}/${bulan}/${tahun}`;
  }

  function formatRupiah(nilai: number | null) {
    if (nilai === null) return "-";

    return new Intl.NumberFormat("id-ID").format(nilai);
  }

  if (loading) {
    return <p className="p-8">Memuat Surat Pengantar...</p>;
  }

  if (error || !surat) {
    return (
      <main className="p-8">
        <p className="text-red-600">
          {error || "Data Surat Pengantar tidak ditemukan."}
        </p>
      </main>
    );
  }

  async function downloadPDF() {
  if (!surat) return;

  const elemen = document.getElementById("lembar-surat-pengantar");

  if (!elemen) {
    alert("Layout Surat Pengantar tidak ditemukan.");
    return;
  }

  try {
    const canvas = await html2canvas(elemen, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fffef8",
    });

    const gambar = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const lebarPdf = 190;
    const tinggiPdf =
      (canvas.height * lebarPdf) / canvas.width;

    const posisiX = (210 - lebarPdf) / 2;
    const posisiY = 10;

    pdf.addImage(
      gambar,
      "PNG",
      posisiX,
      posisiY,
      lebarPdf,
      tinggiPdf
    );

    pdf.save(`Surat-Pengantar-${surat.nomor_surat.replaceAll("/", "-")}.pdf`);
  } catch (error) {
    console.error(error);
    alert("Gagal membuat PDF.");
  }
}

  const jumlahBarisKosong = Math.max(0, 15 - kiriman.length);

  return (
    <main className="min-h-screen bg-gray-200 px-4 py-8 text-black">

      {/* Tombol di luar print */}
      <div className="no-print mx-auto mb-4 flex max-w-[190mm] justify-between">
          <Link
            href={`/surat-pengantar/${surat.id}`}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm"
          >
            Kembali
          </Link>

          <div className="flex gap-3">
            <button
              onClick={downloadPDF}
              className="rounded bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Download PDF
            </button>

            <button
              onClick={() => window.print()}
              className="rounded bg-[#183B63] px-5 py-2 text-sm font-semibold text-white"
            >
              Print Surat Pengantar
            </button>
          </div>
        </div>

      {/* Lembar Surat Pengantar */}
      <section id="lembar-surat-pengantar">

        {/* HEADER */}
        <div className="header-perusahaan">
          <div className="logo-area">
            <img
              src="/logo pandawa.jpg"
              alt="Logo perusahaan"
              className="logo-surat"
            />
          </div>

          <div className="nama-perusahaan">
            PT. OSAKA JAYA TRANSINDO
          </div>
        </div>

        <div className="judul-surat">
          SURAT PENGANTAR
        </div>

        <div className="nomor-surat">
          No. : {surat.nomor_surat}
        </div>

        {/* INFORMASI */}
        <div className="info-surat">
          <div className="info-kiri">
            <div>
              <span>DARI</span>
              <span className="titik">:</span>
              <strong>{surat.dari || "-"}</strong>
            </div>

            <div>
              <span>TUJUAN</span>
              <span className="titik">:</span>
              <strong>{surat.tujuan || "-"}</strong>
            </div>
          </div>

          <div className="info-kanan">
            <div className="label-tanggal">
              TGL. PENGIRIMAN :
            </div>

            <div className="nilai-tanggal">
              {formatTanggal(surat.tanggal_pengiriman)}
            </div>
          </div>
        </div>

        {/* TABEL */}
        <table className="tabel-surat">
          <thead>
            <tr>
              <th rowSpan={2} className="kol-no">
                NO.
              </th>

              <th rowSpan={2} className="kol-stt">
                STT
              </th>

              <th rowSpan={2} className="kol-penerima">
                PENERIMA
              </th>

              <th rowSpan={2} className="kol-pengirim">
                PENGIRIM
              </th>

              <th colSpan={2} className="kol-jumlah">
                JUMLAH
              </th>

              <th rowSpan={2} className="kol-biaya">
                BIAYA
              </th>

              <th rowSpan={2} className="kol-keterangan">
                KETERANGAN
              </th>
            </tr>

            <tr>
              <th className="kol-colli">
                COLLY
              </th>

              <th className="kol-berat">
                BERAT
              </th>
            </tr>
          </thead>

          <tbody>
            {kiriman.map((item, index) => (
              <tr key={item.id}>
                <td className="text-center">
                  {String(index + 1).padStart(2, "0")}
                </td>

                <td className="text-center">
                  {item.stt || "-"}
                </td>

                <td>
                  {item.penerima || "-"}
                </td>

                <td>
                  {item.pengirim || "-"}
                </td>

                <td className="text-center">
                  {item.jumlah_colli ?? "-"}
                </td>

                <td className="text-center">
                  {item.berat ?? "-"}
                </td>

                <td className="text-right">
                  {item.biaya === null
                    ? "-"
                    : formatRupiah(item.biaya)}
                </td>

                <td>
                  {item.keterangan || "-"}
                </td>
              </tr>
            ))}

            {Array.from({ length: jumlahBarisKosong }).map((_, index) => (
              <tr key={`kosong-${index}`} className="baris-kosong">
                <td>&nbsp;</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TANDA TANGAN */}
        <div className="ttd-area">
          <div className="ttd-box">
            <p>PENERIMA :</p>
            <div className="ruang-ttd" />
          </div>

          <div className="ttd-box">
            <p>PEMBAWA :</p>
            <div className="ruang-ttd" />
          </div>

          <div className="ttd-box">
            <p>PETUGAS :</p>
            <div className="ruang-ttd" />

            <p className="nama-petugas">
              {surat.petugas || ""}
            </p>
          </div>
        </div>
      </section>

      <style jsx global>{`
      #lembar-surat-pengantar {
        width: 190mm;
        min-height: 270mm;
        margin: 0 auto;
        padding: 7mm 7mm 6mm 7mm;
        background: #fffef8;
        border: 1px solid #999;
        font-family: Arial, Helvetica, sans-serif;
        box-sizing: border-box;
      }

      .header-perusahaan {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        min-height: 28mm;
      }

      .logo-area {
        position: absolute;
        left: 9mm;
        top: 6mm;
      }

      .logo-surat {
        width: 16mm;
        height: 16mm;
        object-fit: contain;
      }

      .nama-perusahaan {
        font-size: 24px;
        font-weight: 800;
        letter-spacing: 0.6px;
        color: #255b96;
        text-align: center;
      }

      .judul-surat {
        margin-top: -3mm;
        text-align: center;
        font-size: 24px;
        font-weight: 800;
        text-decoration: underline;
        letter-spacing: 1.5px;
        color: #315b8c;
      }

      .nomor-surat {
        margin-top: 0.5mm;
        text-align: center;
        font-size: 13px;
      }

      .info-surat {
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin-top: 4mm;
        margin-bottom: 3mm;
        font-size: 13px;
      }

      .info-kiri > div {
        display: grid;
        grid-template-columns: 20mm 5mm 1fr;
        margin-bottom: 2mm;
      }

      .info-kiri .titik {
        text-align: center;
      }

      .info-kanan {
        text-align: right;
        padding-right: 3mm;
      }

      .label-tanggal {
        font-size: 11px;
        font-weight: 700;
      }

      .nilai-tanggal {
        margin-top: 1mm;
        font-size: 14px;
        font-weight: 600;
      }

      .tabel-surat {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 11px;
      }

      .tabel-surat th,
      .tabel-surat td {
        border: 1px solid #444;
        padding: 2.2mm 1.5mm;
        vertical-align: middle;
      }

      .tabel-surat th {
        text-align: center;
        font-weight: 700;
      }

      .tabel-surat tbody tr {
        height: 9mm;
      }

      .tabel-surat .baris-kosong {
        height: 9mm;
      }

      .kol-no {
        width: 7%;
      }

      .kol-stt {
        width: 10%;
      }

      .kol-penerima {
        width: 20%;
      }

      .kol-pengirim {
        width: 20%;
      }

      .kol-jumlah {
        width: 14%;
      }

      .kol-colli {
        width: 7%;
      }

      .kol-berat {
        width: 7%;
      }

      .kol-biaya {
        width: 14%;
      }

      .kol-keterangan {
        width: 15%;
      }

      .text-center {
        text-align: center;
      }

      .text-right {
        text-align: right;
      }

      .ttd-area {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        margin-top: 4mm;
        font-size: 11px;
      }

      .ttd-box {
        min-height: 34mm;
        text-align: center;
      }

      .ttd-box p {
        margin: 0;
        font-weight: 600;
      }

      .ruang-ttd {
        height: 23mm;
      }

      .nama-petugas {
        margin-top: 1mm !important;
        text-decoration: underline;
        font-weight: 600;
      }

      @media print {
        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }

        .no-print {
          display: none !important;
        }

        main {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }

        #lembar-surat-pengantar {
          width: 190mm;
          min-height: 270mm;
          margin: 0 auto;
          padding: 7mm 7mm 6mm 7mm;
          border: none;
        }

        @page {
          size: A4 portrait;
          margin: 8mm;
        }
      }
    `}</style>
    </main>
  );
}