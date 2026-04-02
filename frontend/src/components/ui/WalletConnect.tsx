"use client"
import { useWallet } from '@/context/WalletContext'
import { Wallet } from 'lucide-react'

export default function WalletConnect() {
  const { isConnected, connectFreighter } = useWallet()

  if (isConnected) return null

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
        <Wallet className="w-8 h-8 text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
      <p className="text-slate-400 mb-8 text-center max-w-md">
        Connect your Stellar wallet to access StellarVault dashboards, deposit into vaults, and earn yield.
      </p>
      <button
        onClick={connectFreighter}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium hover:opacity-90 transition"
      >
        Connect Freighter
      </button>
    </div>
  )
}
