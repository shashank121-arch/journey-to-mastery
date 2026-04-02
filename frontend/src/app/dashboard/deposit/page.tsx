"use client"
import { useState } from 'react'
import { useWallet } from '@/context/WalletContext'
import Navbar from '@/components/ui/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import WalletConnect from '@/components/ui/WalletConnect'
import { depositToVault, getVaultApy } from '@/lib/stellar'
import { toast } from 'sonner'
import { ArrowDownToLine, Coins, TrendingUp, AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export default function DepositPage() {
  const { publicKey, isConnected, xlmBalance, refreshBalance, signTransaction } = useWallet()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [apy, setApy] = useState(12.6)

  useEffect(() => {
    getVaultApy().then(setApy).catch(() => {})
  }, [])

  const numAmount = parseFloat(amount) || 0
  const maxDeposit = Math.max(xlmBalance - 2, 0) // Keep 2 XLM for fees
  const yearlyEarning = numAmount * (apy / 100)
  const vaultTokenReward = numAmount / 10

  const handleDeposit = async () => {
    if (!publicKey) return
    if (numAmount < 1) {
      toast.error('Minimum deposit is 1 XLM')
      return
    }
    if (numAmount > maxDeposit) {
      toast.error('Insufficient balance')
      return
    }

    setLoading(true)
    try {
      const result = await depositToVault(publicKey, numAmount * 1e7, signTransaction)
      if (result) {
        toast.success(`Deposited ${numAmount} XLM successfully!`)
        toast.success(`Earned ${vaultTokenReward.toFixed(2)} VAULT tokens!`)
        await refreshBalance()
        setAmount('')
      } else {
        toast.error('Deposit failed — check contract connection')
      }
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error?.message || 'Deposit transaction failed')
      console.error(err)
    }
    setLoading(false)
  }

  if (!isConnected) {
    return (
      <>
        <Navbar />
        <WalletConnect />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Deposit XLM
            </h1>
            <p className="text-slate-400 mb-8">
              Deposit into the yield vault to earn auto-compounding yield and VAULT tokens.
            </p>

            {/* Balance card */}
            <div className="p-5 rounded-2xl glass mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-sm">Available Balance</p>
                  <p className="text-2xl font-bold text-white">{xlmBalance.toFixed(2)} XLM</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Max Deposit</p>
                  <p className="text-lg font-semibold text-indigo-400">{maxDeposit.toFixed(2)} XLM</p>
                </div>
              </div>
            </div>

            {/* Deposit form */}
            <div className="p-6 rounded-2xl glass mb-6">
              <label className="block text-white font-medium mb-3">
                Amount to Deposit
              </label>
              <div className="relative mb-4">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-lg placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ fontSize: '18px' }}
                  min="0"
                  step="0.01"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-slate-400">XLM</span>
                  <button
                    onClick={() => setAmount(maxDeposit.toString())}
                    className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-medium hover:bg-indigo-500/30 transition"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Preview */}
              {numAmount > 0 && (
                <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Current APY</span>
                    <span className="text-emerald-400 font-medium">{apy.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Estimated Yearly Earning</span>
                    <span className="text-white">{yearlyEarning.toFixed(4)} XLM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">VAULT Tokens Earned</span>
                    <span className="text-cyan-400 font-medium flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      {vaultTokenReward.toFixed(2)} VAULT
                    </span>
                  </div>
                </div>
              )}

              {numAmount > 0 && numAmount < 1 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-amber-300 text-sm">Minimum deposit is 1 XLM</span>
                </div>
              )}

              <button
                onClick={handleDeposit}
                disabled={loading || numAmount < 1 || numAmount > maxDeposit}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ArrowDownToLine className="w-5 h-5" />
                    Deposit {numAmount > 0 ? `${numAmount} XLM` : ''}
                  </>
                )}
              </button>
            </div>

            {/* Info */}
            <div className="p-4 rounded-xl glass">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium mb-1">Auto-Compounding</p>
                  <p className="text-slate-400 text-sm">
                    Your deposit automatically compounds yield. Share price increases
                    over time, meaning your shares are worth more XLM when you withdraw.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
