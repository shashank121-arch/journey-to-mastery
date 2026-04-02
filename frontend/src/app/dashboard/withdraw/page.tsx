"use client"
import { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import Navbar from '@/components/ui/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import WalletConnect from '@/components/ui/WalletConnect'
import { withdrawFromVault, getUserPosition, getSharePrice } from '@/lib/stellar'
import { toast } from 'sonner'
import { ArrowUpFromLine, AlertTriangle, Info } from 'lucide-react'

export default function WithdrawPage() {
  const { publicKey, isConnected, refreshBalance, signTransaction } = useWallet()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [userShares, setUserShares] = useState(0)
  const [userDeposited, setUserDeposited] = useState(0)
  const [sharePrice, setSharePrice] = useState(1.0)
  const [totalYield, setTotalYield] = useState(0)

  useEffect(() => {
    async function load() {
      if (!publicKey) return
      try {
        const pos = await getUserPosition(publicKey)
        if (pos) {
          setUserShares(Number(pos.shares || 0) / 1e7)
          setUserDeposited(Number(pos.deposited || 0) / 1e7)
          setTotalYield(Number(pos.total_yield_earned || 0) / 1e7)
        }
        const sp = await getSharePrice()
        setSharePrice(sp)
      } catch {
        // Mock fallback
        setUserShares(0) // Default to 0 instead of mock for real testing
        setUserDeposited(0)
        setSharePrice(1.0)
      }
    }
    load()
  }, [publicKey])

  const numAmount = parseFloat(amount) || 0
  const xlmToReceive = numAmount * sharePrice
  const yieldOnWithdrawal = Math.max(xlmToReceive - numAmount, 0)

  const handleWithdraw = async () => {
    if (!publicKey) return
    if (numAmount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    if (numAmount > userShares) {
      toast.error('Insufficient shares')
      return
    }

    setLoading(true)
    try {
      const result = await withdrawFromVault(publicKey, numAmount * 1e7, signTransaction)
      if (result) {
        toast.success(`Withdrew ${xlmToReceive.toFixed(4)} XLM successfully!`)
        setAmount('')
        await refreshBalance()
        // Reload position
        const pos = await getUserPosition(publicKey)
        if (pos) {
          setUserShares(Number(pos.shares || 0) / 1e7)
        }
      } else {
        toast.error('Withdrawal failed — check contract connection')
      }
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error?.message || 'Withdrawal transaction failed')
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
              Withdraw XLM
            </h1>
            <p className="text-slate-400 mb-8">
              Redeem your vault shares to withdraw XLM including earned yield.
            </p>

            {/* Position overview */}
            <div className="p-5 rounded-2xl glass mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Your Shares</p>
                  <p className="text-2xl font-bold text-white">{userShares.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Share Value</p>
                  <p className="text-lg font-semibold text-indigo-400">
                    {(userShares * sharePrice).toFixed(4)} XLM
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Original Deposit</p>
                  <p className="text-white font-medium">{userDeposited.toFixed(4)} XLM</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Yield Earned</p>
                  <p className="text-emerald-400 font-medium">{totalYield.toFixed(4)} XLM</p>
                </div>
              </div>
            </div>

            {/* Withdraw form */}
            <div className="p-6 rounded-2xl glass mb-6">
              <label className="block text-white font-medium mb-3">
                Shares to Redeem
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
                  <span className="text-slate-400">shares</span>
                  <button
                    onClick={() => setAmount(userShares.toString())}
                    className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-medium hover:bg-indigo-500/30 transition"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {numAmount > 0 && (
                <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Current Share Price</span>
                    <span className="text-white">{sharePrice.toFixed(4)} XLM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">XLM to Receive</span>
                    <span className="text-emerald-400 font-medium">
                      {xlmToReceive.toFixed(4)} XLM
                    </span>
                  </div>
                  {yieldOnWithdrawal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Yield Included</span>
                      <span className="text-emerald-400">+{yieldOnWithdrawal.toFixed(4)} XLM</span>
                    </div>
                  )}
                </div>
              )}

              {numAmount > userShares && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-red-300 text-sm">Insufficient shares</span>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={loading || numAmount <= 0 || numAmount > userShares}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ArrowUpFromLine className="w-5 h-5" />
                    Withdraw {numAmount > 0 ? `${xlmToReceive.toFixed(2)} XLM` : ''}
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-xl glass">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-400 text-sm">
                  Withdrawals are processed instantly. You receive XLM proportional to
                  your shares multiplied by the current share price, which includes
                  all compounded yield.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
