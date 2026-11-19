"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const menu = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/btt", label: "BTT" },
  { href: "/surat-pengantar", label: "Surat Pengantar" },
];

export default function NavigasiUtama() {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname || /\/print\/?$/.test(pathname)) {
    return null;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Gagal logout: " + error.message);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="bg-[#183B63] text-white print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/logo%20pandawa.jpg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-md bg-white object-contain p-0.5"
          />
          <p className="text-sm font-bold sm:text-base">
            PT Pandawa Jaya Transindo
          </p>
        </div>

        <nav
          aria-label="Navigasi utama"
          className="order-last flex w-full flex-wrap gap-1 sm:order-0 sm:ml-auto sm:w-auto"
        >
          {menu.map(({ href, label }) => {
            const halamanIni = pathname === href;
            const aktif = halamanIni || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={
                  halamanIni ? "page" : aktif ? "location" : undefined
                }
                className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 ${
                  aktif
                    ? "bg-white text-[#183B63]"
                    : "text-white hover:bg-white/15"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="ml-auto inline-flex min-h-11 items-center rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 sm:ml-0"
        >
          Logout
        </button>
      </div>
    </header>
  );
}