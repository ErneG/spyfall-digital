import { LanguageToggle } from "@/components/language-toggle";
import { AuthButton } from "@/features/auth/components/auth-button";

export default function ShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="sticky top-0 z-20 px-3 py-3 sm:px-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-white/62 px-3 py-2 shadow-[0_18px_60px_rgba(148,163,184,0.16)] backdrop-blur-xl">
          <div className="px-2 text-[11px] font-semibold tracking-[0.24em] text-slate-500 uppercase">
            Spyfall Digital
          </div>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <AuthButton />
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
