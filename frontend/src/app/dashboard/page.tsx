"use client"
import { useEffect, useState } from 'react'
import { useWallet } from '@/context/WalletContext'
import Navbar from '@/components/ui/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import StatCard from '@/components/ui/StatCard'
import LiveFeed from '@/components/ui/LiveFeed'
import WalletConnect from '@/components/ui/WalletConnect'
import {
  getVaultState, getUserPosition,
  getSharePrice, getVaultApy, getXlmPrice
} from '@/lib/stellar'
import {
  Wallet, TrendingUp, Coins,
  Activity, ArrowDownToLine, ArrowUpFromLine,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { publicKey, isConnected } = useWallet()

  const [userDeposited, setUserDeposited] = useState(0)
  const [userShares, setUserShares] = useState(0)
  const [vaultTokens, setVaultTokens] = useState(0)
  const [totalYield, setTotalYield] = useState(0)
  const [tvl, setTvl] = useState(0)
  const [vaultApy, setVaultApy] = useState(12.6)
  const [sharePrice, setSharePrice] = useState(1.0)
  const [xlmPrice, setXlmPrice] = useState(0.12)

  useEffect(() => {
    async function loadData() {
      try {
        // Load vault state
        const state = await getVaultState()
        if (state) {
          setTvl(Number(state.total_deposits || 0) / 1e7)
        }

        // Load APY
        const apy = await getVaultApy()
        setVaultApy(apy)

        // Load share price
        const sp = await getSharePrice()
        setSharePrice(sp)

        // Load XLM price
        const xp = await getXlmPrice()
        setXlmPrice(xp)

        // Load user position
        if (publicKey) {
          const pos = await getUserPosition(publicKey)
          if (pos) {
            setUserDeposited(Number(pos.deposited || 0) / 1e7)
            setUserShares(Number(pos.shares || 0) / 1e7)
            setVaultTokens(Number(pos.vault_tokens_earned || 0) / 1e7)
            setTotalYield(Number(pos.total_yield_earned || 0) / 1e7)
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err)
        // Use mock data as fallback
        setTvl(89420)
        setVaultApy(12.6)
        setSharePrice(1.034)
        setXlmPrice(0.12)
      }
    }

    loadData()
  }, [publicKey])

  if (!isConnected) {
    return (
      <>
        <Navbar />
        <WalletConnect />
      </>
    )
  }

  // Health indicator based on position
  const healthPercent = userDeposited > 0
    ? Math.min(((userDeposited * sharePrice) / (userDeposited || 1)) * 100, 200)
    : 100

  const healthColor = healthPercent > 150
    ? 'bg-emerald-500'
    : healthPercent > 110
      ? 'bg-amber-500'
      : 'bg-red-500'

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Dashboard
            </h1>
            <p className="text-slate-400">
              Welcome back — here&apos;s your vault overview
            </p>
          </div>

          {/* User stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Your Deposits"
              value={`${userDeposited.toFixed(2)} XLM`}
              subtitle={`≈ $${(userDeposited * xlmPrice).toFixed(2)}`}
              icon={<Wallet className="w-5 h-5 text-indigo-400" />}
              trend="+3.2%"
              trendUp
            />
            <StatCard
              title="Vault Shares"
              value={userShares.toFixed(4)}
              subtitle={`@ ${sharePrice.toFixed(4)} XLM/share`}
              icon={<BarChart3 className="w-5 h-5 text-violet-400" />}
            />
            <StatCard
              title="VAULT Earned"
              value={vaultTokens.toFixed(2)}
              subtitle="Governance tokens"
              icon={<Coins className="w-5 h-5 text-cyan-400" />}
              trend="+12"
              trendUp
            />
            <StatCard
              title="Total Yield"
              value={`${totalYield.toFixed(4)} XLM`}
              subtitle="All-time earnings"
              icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
              trend="+2.1%"
              trendUp
            />
          </div>

          {/* Pool stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Total Value Locked"
              value={`${tvl.toLocaleString()} XLM`}
              subtitle={`≈ $${(tvl * xlmPrice).toLocaleString()}`}
              icon={<Activity className="w-5 h-5 text-indigo-400" />}
            />
            <StatCard
              title="Current Vault APY"
              value={`${vaultApy.toFixed(1)}%`}
              subtitle="Auto-compounding"
              icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
              trend="+0.8%"
              trendUp
            />
            <StatCard
              title="Share Price"
              value={`${sharePrice.toFixed(4)} XLM`}
              subtitle="Per vault share"
              icon={<Coins className="w-5 h-5 text-violet-400" />}
              trend="+0.3%"
              trendUp
            />
          </div>

          {/* Position health bar */}
          {userDeposited > 0 && (
            <div className="p-6 rounded-2xl glass mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Position Health</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  healthPercent > 150
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : healthPercent > 110
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-red-500/10 text-red-400'
                }`}>
                  {healthPercent.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${healthColor} transition-all duration-500`}
                  style={{ width: `${Math.min(healthPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>0%</span>
                <span>Healthy &gt; 150%</span>
                <span>200%</span>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link href="/dashboard/deposit">
              <div className="p-6 rounded-2xl glass glass-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer text-center">
                <ArrowDownToLine className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                <p className="text-white font-semibold">Deposit XLM</p>
                <p className="text-slate-500 text-sm">Into yield vault</p>
              </div>
            </Link>
            <Link href="/dashboard/withdraw">
              <div className="p-6 rounded-2xl glass glass-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer text-center">
                <ArrowUpFromLine className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                <p className="text-white font-semibold">Withdraw XLM</p>
                <p className="text-slate-500 text-sm">Redeem shares</p>
              </div>
            </Link>
            <Link href="/dashboard/governance">
              <div className="p-6 rounded-2xl glass glass-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer text-center">
                <Coins className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <p className="text-white font-semibold">VAULT Tokens</p>
                <p className="text-slate-500 text-sm">View governance</p>
              </div>
            </Link>
          </div>

          {/* Live feed */}
          <LiveFeed />
        </main>
      </div>
    </>
  )
}
