import { TrendingUp, Shield } from 'lucide-react'

interface VaultCardProps {
  name: string
  apy: string
  tvl: string
  risk: 'Low' | 'Medium' | 'High'
  strategy: string
  userDeposit?: string
}

export default function VaultCard({ name, apy, tvl, risk, strategy, userDeposit }: VaultCardProps) {
  const riskColors = {
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    High: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <div className="p-6 rounded-2xl glass glass-hover transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg">{name}</h3>
          <p className="text-slate-400 text-sm">{strategy}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${riskColors[risk]}`}>
          {risk} Risk
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-slate-500 text-xs mb-1">APY</p>
          <p className="text-emerald-400 font-bold text-xl flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {apy}
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-xs mb-1">TVL</p>
          <p className="text-white font-semibold text-xl">{tvl}</p>
        </div>
      </div>

      {userDeposit && (
        <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mb-4">
          <p className="text-slate-400 text-xs">Your Deposit</p>
          <p className="text-indigo-400 font-semibold">{userDeposit}</p>
        </div>
      )}

      <div className="flex items-center gap-2 text-slate-500 text-xs">
        <Shield className="w-3.5 h-3.5" />
        Audited Soroban Contract
      </div>
    </div>
  )
}
