import AuthGuard from "@/component/AuthGuard";

export default function SuratPengantarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}