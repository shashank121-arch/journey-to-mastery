import { Coins } from 'lucide-react'

interface TokenBadgeProps {
  symbol: string
  amount: string
  className?: string
}

export default function TokenBadge({ symbol, amount, className = '' }: TokenBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass ${className}`}>
      <Coins className="w-4 h-4 text-indigo-400" />
      <span className="text-white font-medium text-sm">{amount}</span>
      <span className="text-slate-400 text-sm">{symbol}</span>
    </div>
  )
}
