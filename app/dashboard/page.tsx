"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cekLogin() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setEmail(data.user.email || "");
      setLoading(false);
    }

    cekLogin();
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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <p>Memeriksa sesi login...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-5xl">
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
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">
            Selamat Datang!
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Login sebagai: {email}
          </p>
        </section>

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

            <p className="mt-2 text-sm text.-gray-600">
              Kelola dokumen Surat Pengantar dan daftar kiriman.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}