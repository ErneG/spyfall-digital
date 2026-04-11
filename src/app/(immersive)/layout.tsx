export default function ImmersiveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(94,234,212,0.12),transparent_24%),linear-gradient(180deg,#081019_0%,#0b1622_46%,#0f1d2d_100%)] text-slate-50">
      <div className="min-h-dvh px-[max(env(safe-area-inset-left),0px)] pt-[max(env(safe-area-inset-top),0px)] pr-[max(env(safe-area-inset-right),0px)] pb-[max(env(safe-area-inset-bottom),0px)]">
        {children}
      </div>
    </div>
  );
}
