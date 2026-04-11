import { AppShell } from "@/app/app-shell";

export default function PlayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
