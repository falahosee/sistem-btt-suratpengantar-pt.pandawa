import AuthGuard from "@/component/AuthGuard";
import NavigasiUtama from "@/component/NavigasiUtama";

export default function BttLayout({
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