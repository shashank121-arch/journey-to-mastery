interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
}

export default function StatCard({ title, value, subtitle, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="p-5 rounded-2xl glass glass-hover transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl bg-white/5">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trendUp
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
    </div>
  )
}
