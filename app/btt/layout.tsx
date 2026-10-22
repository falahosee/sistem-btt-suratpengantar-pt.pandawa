import AuthGuard from "@/component/AuthGuard";

export default function BttLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}