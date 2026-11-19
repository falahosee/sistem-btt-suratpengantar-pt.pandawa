import AuthGuard from "@/component/AuthGuard";
import NavigasiUtama from "@/component/NavigasiUtama";

export default function SuratPengantarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <NavigasiUtama />
      {children}
    </AuthGuard>
  );
}