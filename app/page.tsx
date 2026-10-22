import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { error } = await supabase
    .from("btt")
    .select("*")
    .limit(1);

  return (
    <main style={{ padding: "30px" }}>
      <h1>PT Pandawa Jaya Transindo</h1>
      <h2>Sistem BTT</h2>

      {error ? (
        <p>Koneksi gagal: {error.message}</p>
      ) : (
        <p>Koneksi Supabase berhasil ✅</p>
      )}
    </main>
  );
}