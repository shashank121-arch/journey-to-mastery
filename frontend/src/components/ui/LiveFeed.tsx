"use client"
import { useEffect, useState } from 'react'
import { useWallet } from '@/context/WalletContext'
import { streamTransactions, getRecentTransactions } from '@/lib/stellar'
import { Activity, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TxEvent {
  hash: string
  createdAt: string
  memo: string
  successful: boolean
}

export default function LiveFeed() {
  const { publicKey, isConnected } = useWallet()
  const [events, setEvents] = useState<TxEvent[]>([])
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (!publicKey || !isConnected) return

    // Load recent transactions
    getRecentTransactions(publicKey, 5).then(txs => {
      setEvents(txs)
    })

    // Start streaming
    setIsLive(true)
    const cleanup = streamTransactions(publicKey, (tx) => {
      setEvents(prev => [tx, ...prev.slice(0, 9)])
    })

    return () => {
      cleanup()
      setIsLive(false)
    }
  }, [publicKey, isConnected])

  if (!isConnected) {
    return (
      <div className="p-6 rounded-2xl glass">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-400" />
          Live Feed
        </h3>
        <p className="text-slate-500 text-sm">Connect wallet to see live transactions</p>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-2xl glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          Live Feed
        </h3>
        {isLive && (
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">LIVE</span>
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-slate-500 text-sm">No transactions yet</p>
        ) : (
          events.map((tx, i) => (
            <div
              key={tx.hash + i}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  tx.successful ? 'bg-emerald-400' : 'bg-red-400'
                }`} />
                <div className="min-w-0">
                  <p className="text-white text-sm font-mono truncate">
                    {tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {tx.createdAt
                      ? formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })
                      : 'Just now'}
                  </p>
                </div>
              </div>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-white/10 transition flex-shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
