"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesanError, setPesanError] = useState("");

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setPesanError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setPesanError(error.message);
      return;
    }

    alert("Login berhasil!");

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        
          <div className="mb-6 flex flex-col items-center text-center">

            {/* Logo perusahaan */}
            <img
              src="/logo pandawa.jpg"
              alt="Logo PT Pandawa Jaya Transindo"
              className="mb-4 h-24 w-24 object-contain"
            />

            <h1 className="text-2xl font-bold text-gray-900">
              PT Pandawa Jaya Transindo
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Login Sistem Administrasi Pengiriman Barang
            </p>
          </div>

        <form onSubmit={login} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-1000">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Masukkan email"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-1000">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#183B63] px-4 py-3 text-sm font-semibold text-white hover:bg-[#102C4D] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}