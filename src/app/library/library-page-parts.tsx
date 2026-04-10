interface StatCardProps {
  label: string;
  value: string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/76 p-4">
      <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
