export function StatCard({ label, value, sub, color }) {
  return (
    <div className="glass glass-hover rounded-2xl p-5 fade-in">
      <div className="text-white/45 text-xs font-medium mb-1">{label}</div>
      <div className="font-display text-2xl font-bold" style={{ color }}>{value}</div>
      {sub && <div className="text-white/35 text-[11px] mt-1">{sub}</div>}
    </div>
  )
}
