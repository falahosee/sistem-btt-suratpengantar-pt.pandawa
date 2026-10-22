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

export default function PrintBttPage() {
  const { id } = useParams<{ id: string }>();

  const [btt, setBtt] = useState<Btt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function ambilBtt() {
      const { data, error } = await supabase
        .from("btt")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setBtt(data);
      }

      setLoading(false);
    }

    ambilBtt();
  }, [id]);

  function formatRupiah(nilai: number | null) {
    if (nilai === null) return "-";

    return new Intl.NumberFormat("id-ID").format(nilai);
  }

  function formatTanggal(tanggal: string) {
    if (!tanggal) return "-";

    const [tahun, bulan, hari] = tanggal.split("-");

    return `${hari}/${bulan}/${tahun}`;
  }

  function tampilPembayaran(pembayaran: string | null) {
    if (!pembayaran) return "-";

    return pembayaran.toUpperCase();
  }

  async function downloadPdf() {
    if (!btt) {
      alert("Data BTT belum tersedia.");
      return;
    }

    const lembarBtt = document.getElementById("lembar-btt");

    if (!lembarBtt) {
      alert("Layout BTT tidak ditemukan.");
      return;
    }

    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    const canvas = await html2canvas(lembarBtt, {
      scale: 2,
      backgroundColor: "#fffdf4",
      useCORS: true,

      onclone: (documentClone) => {
        const lembar =
          documentClone.getElementById("lembar-btt");

        if (lembar) {
          lembar.style.backgroundColor = "#fffdf4";
          lembar.style.color = "#000000";
        }

        documentClone
          .querySelectorAll("*")
          .forEach((item) => {
            const el = item as HTMLElement;

            const style =
              documentClone.defaultView?.getComputedStyle(el);

            if (!style) return;

            if (style.color.includes("oklch")) {
              el.style.color = "#000000";
            }

            if (style.backgroundColor.includes("oklch")) {
              el.style.backgroundColor = "transparent";
            }

            if (style.borderColor.includes("oklch")) {
              el.style.borderColor = "#000000";
            }
          });

        const tulisanMerah =
          documentClone.getElementById(
            "isi-tidak-diperiksa"
          );

        if (tulisanMerah) {
          tulisanMerah.style.color = "#dc2626";
        }
      },
    });

    const gambar = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const lebarPdf = 190;

    const tinggiPdf =
      (canvas.height * lebarPdf) / canvas.width;

    const posisiX = (297 - lebarPdf) / 2;
    const posisiY = (210 - tinggiPdf) / 2;

    pdf.addImage(
      gambar,
      "PNG",
      posisiX,
      posisiY,
      lebarPdf,
      tinggiPdf
    );

    pdf.save(`BTT-${btt.nomor_btt}.pdf`);
  }

  if (loading) {
    return (
      <p className="p-8">
        Memuat data BTT...
      </p>
    );
  }

  if (!btt) {
    return (
      <p className="p-8">
        Data BTT tidak ditemukan.
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-gray-200 px-4 py-8 text-black">

      {/* Tombol */}
      <div className="no-print mx-auto mb-4 flex max-w-[190mm] items-center justify-between">
        <Link
          href={`/btt/${btt.id}`}
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm"
        >
          Kembali
        </Link>

        <div className="flex gap-3">
          <button
            onClick={downloadPdf}
            className="rounded bg-green-600 px-5 py-2 text-sm font-semibold text-white"
          >
            Download PDF
          </button>

          <button
            onClick={() => window.print()}
            className="rounded bg-[#183B63] px-5 py-2 text-sm font-semibold text-white"
          >
            Print BTT
          </button>
        </div>
      </div>

      {/* Lembar BTT */}
      <section
        id="lembar-btt"
        className="mx-auto"
        style={{
          backgroundColor: "#fffdf4",
          color: "#000000",
        }}
      >

        {/* HEADER */}
        <div
          className="border-b border-black"
          style={{
            display: "grid",
            gridTemplateColumns: "48% 32% 20%",
            minHeight: "72px",
          }}
        >

          {/* Logo + Nama Perusahaan */}
          <div className="flex items-center gap-3 p-2">
            <img
              src="/logo pandawa.jpg"
              alt="Logo PT Pandawa Jaya Transindo"
              className="h-14 w-14 shrink-0 object-contain"
            />

            <div>
              <h1 className="text-[18px] font-bold leading-[19px]">
                PT. PANDAWA JAYA
                <br />
                TRANSINDO
              </h1>

              <p className="mt-1 text-[10px] font-semibold">
                (PT. OSAKA JAYA TRANSINDO)
              </p>
            </div>
          </div>

          {/* NIB + Judul BTT */}
          <div className="flex flex-col items-center justify-center border-l border-black px-2 text-center">
            <p className="text-[12px]">
              NIB : 1301220038175
            </p>

            <p className="mt-2 whitespace-nowrap text-[12px] font-bold">
              BUKTI TANDA TERIMA (BTT)
            </p>
          </div>

          {/* A + NPWP + Nomor */}
          <div
            className="border-l border-black"
            style={{
              display: "grid",
              gridTemplateRows: "34px 38px",
            }}
          >
            <div
              className="border-b border-black"
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr",
              }}
            >
              <div className="flex items-center justify-center border-r border-black">
                <span className="text-[17px] font-bold leading-none">
                  A
                </span>
              </div>

              <div className="flex flex-col justify-center px-2 text-[10px] leading-[12px]">
                <span>N.P.W.P.</span>
                <span>1.777.953.9-032</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2">
              <span className="text-[11px]">
                No.
              </span>

              <span className="text-[17px] font-bold">
                {btt.nomor_btt}
              </span>
            </div>
          </div>
        </div>

        {/* ISI KIRIMAN */}
        <div
          className="border-b border-black"
          style={{
            display: "grid",
            gridTemplateColumns:
              "52% 17% 16% 15%",
          }}
        >
          <div className="min-h-[76px] border-r border-black p-2">
            <p className="text-[10px] font-semibold">
              ISI KIRIMAN MENURUT PENGAKUAN :
            </p>

            <p className="mt-4 text-center text-[17px]">
              {btt.isi_kiriman}
            </p>
          </div>

          <div className="border-r border-black p-2 text-center">
            <p className="text-[10px] font-semibold">
              JUMLAH COLLI
            </p>

            <p className="mt-4 text-[18px]">
              {btt.jumlah_colli}
            </p>
          </div>

          <div className="border-r border-black p-2 text-center">
            <p className="text-[10px] font-semibold">
              BERAT
            </p>

            <p className="mt-4 text-[18px]">
              {btt.berat ?? "-"}
            </p>
          </div>

          <div className="flex items-center justify-center p-2 text-center">
            <p className="text-[13px] font-bold">
              {tampilPembayaran(
                btt.pembayaran
              )}
            </p>
          </div>
        </div>

        {/* PENERIMA / PENGIRIM */}
        <div
          className="border-b border-black"
          style={{
            display: "grid",
            gridTemplateColumns: "50% 50%",
          }}
        >
          <div className="min-h-[92px] border-r border-black p-2">
            <p className="text-[11px] font-semibold">
              PENERIMA :
            </p>

            <p className="mt-5 text-center text-[17px]">
              {btt.penerima}
            </p>
          </div>

          <div className="min-h-[92px] p-2">
            <p className="text-[11px] font-semibold">
              PENGIRIM :
            </p>

            <p className="mt-5 text-center text-[17px]">
              {btt.pengirim}
            </p>
          </div>
        </div>

        {/* BIAYA */}
        <div
          className="border-b border-black"
          style={{
            display: "grid",
            gridTemplateColumns: "50% 50%",
          }}
        >
          <div className="flex items-center px-2 py-2 text-[13px]">
            <span>
              Biaya Rp.
            </span>

            <span className="ml-8 text-[18px]">
              {formatRupiah(btt.biaya)}
            </span>
          </div>

          <div className="flex items-center justify-center px-2 py-2">
            <span
              id="isi-tidak-diperiksa"
              className="text-[18px] font-bold"
              style={{
                color: "#dc2626",
              }}
            >
              ISI TIDAK DIPERIKSA
            </span>
          </div>
        </div>

        {/* BAGIAN BAWAH */}
        <div
          className="border-b border-black"
          style={{
            display: "grid",
            gridTemplateColumns: "60% 40%",
          }}
        >
          <div className="min-h-[108px] border-r border-black p-2">
            <p className="text-[11px] leading-5">
              Kiriman ini telah saya / kami terima dengan
              <br />
              baik & benar pada tanggal
              ........................ 20 ........
            </p>

            <p className="mt-9 text-[11px]">
              Tanda tangan / Nama Terang / Cap
            </p>
          </div>

          <div className="relative min-h-[108px] p-2">
            <p className="text-[11px]">
              Tgl : {formatTanggal(btt.tanggal)}
            </p>

            <p className="mt-3 text-[11px]">
              Petugas : {btt.petugas || "-"}
            </p>

            <div className="absolute bottom-5 left-8 right-8 border-b border-black" />
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-2 py-2 text-center text-[9px] font-semibold">
          SYARAT-SYARAT PENGANGKUTAN TERTERA PADA HALAMAN BELAKANG
          SURAT PENGANGKUTAN INI
        </div>
      </section>

      <style jsx global>{`
        #lembar-btt {
          width: 190mm;
          min-height: 112mm;
          border: 1px solid #000000;
          font-family: Arial, Helvetica, sans-serif;
          box-sizing: border-box;
        }

        @media print {
          html,
          body {
            width: 297mm;
            height: 210mm;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          .no-print {
            display: none !important;
          }

          main {
            width: 297mm !important;
            min-height: 210mm !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: #ffffff !important;
            box-sizing: border-box;
          }

          #lembar-btt {
            width: 190mm !important;
            min-height: 112mm;
            margin: 0 auto !important;
            border: 1px solid #000000;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>
    </main>
  );
}