interface StatCardProps {
  label: string;
  value: string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
      <p className="text-xs font-semibold tracking-[0.16em] text-white/40 uppercase">{label}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}
