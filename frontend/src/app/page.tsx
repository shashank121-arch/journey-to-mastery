"use client"
import Link from 'next/link'
import { useWallet } from '@/context/WalletContext'
import {
  Shield, Zap, TrendingUp,
  ArrowRight, Lock, Coins,
  BarChart3, Layers
} from 'lucide-react'

export default function LandingPage() {
  const { isConnected } = useWallet()

  const features = [
    {
      icon: Lock,
      title: 'Secure Vaults',
      desc: 'XLM deposited into audited Soroban smart contracts with auto-compounding strategies',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: TrendingUp,
      title: 'Dynamic APY',
      desc: 'Vault yields adjust automatically based on utilization via on-chain RateEngine',
      gradient: 'from-violet-500 to-violet-600',
    },
    {
      icon: Coins,
      title: 'VAULT Rewards',
      desc: 'Earn VAULT governance tokens on every deposit — own a piece of the protocol',
      gradient: 'from-cyan-500 to-cyan-600',
    },
    {
      icon: Shield,
      title: 'Price Oracle',
      desc: 'Real-time asset prices via on-chain PriceOracle contract with batch updates',
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: Zap,
      title: 'Instant Settlement',
      desc: '5-second transaction finality on Stellar — no waiting, no uncertainty',
      gradient: 'from-amber-500 to-amber-600',
    },
    {
      icon: BarChart3,
      title: 'Live Analytics',
      desc: 'Real-time dashboard with SSE transaction streaming from Stellar Horizon',
      gradient: 'from-pink-500 to-pink-600',
    },
  ]

  const steps = [
    {
      step: '01',
      title: 'Connect your wallet',
      desc: 'Connect Freighter or Albedo wallet with your Stellar testnet account',
      color: 'text-indigo-400 bg-indigo-500/20',
    },
    {
      step: '02',
      title: 'Choose a vault',
      desc: 'Select from available yield vaults with different risk profiles and APYs',
      color: 'text-violet-400 bg-violet-500/20',
    },
    {
      step: '03',
      title: 'Deposit XLM',
      desc: 'Deposit XLM into the vault — receive shares proportional to your deposit',
      color: 'text-cyan-400 bg-cyan-500/20',
    },
    {
      step: '04',
      title: 'Earn yield + VAULT tokens',
      desc: 'Your deposit auto-compounds. Earn VAULT governance tokens as bonus rewards',
      color: 'text-emerald-400 bg-emerald-500/20',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0f1a]">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">StellarVault</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How it works</a>
            <a href="#stats" className="hover:text-white transition">Stats</a>
          </div>
          <Link href="/dashboard">
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
              {isConnected ? 'Open App' : 'Launch App'}
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent_70%)]" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Built on Stellar Soroban Testnet
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Yield Vaults
            <span className="block gradient-text">
              For Everyone
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Deposit XLM into auto-compounding yield vaults.
            Earn dynamic APY plus VAULT governance tokens.
            Powered by Stellar blockchain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <button className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-lg hover:opacity-90 transition hover:scale-105 transform duration-200">
                Start Earning
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <a href="#how-it-works">
              <button className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white font-semibold text-lg hover:bg-white/5 transition">
                Learn More
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-12 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Total Value Locked', value: '$89K', color: 'text-indigo-400' },
            { label: 'Active Depositors', value: '312', color: 'text-violet-400' },
            { label: 'VAULT Distributed', value: '2.4M', color: 'text-cyan-400' },
            { label: 'Avg Vault APY', value: '12.6%', color: 'text-emerald-400' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Everything you need
          </h2>
          <p className="text-slate-400 text-center mb-12 text-lg">
            Built with battle-tested DeFi primitives on Soroban
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl glass glass-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            How it works
          </h2>

          <div className="space-y-6">
            {steps.map((item, i) => (
              <div key={i} className="flex gap-6 items-start p-6 rounded-2xl glass">
                <div className={`w-12 h-12 rounded-xl flex-shrink-0 ${item.color} flex items-center justify-center font-bold text-lg`}>
                  {item.step}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to earn yield?
          </h2>
          <p className="text-slate-400 mb-8">
            Join the StellarVault community on Stellar testnet today.
          </p>
          <Link href="/dashboard">
            <button className="px-8 py-4 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 transition hover:scale-105 transform">
              Launch App →
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5 text-center">
        <p className="text-slate-500 text-sm">
          StellarVault — Built on Stellar Soroban Testnet · Rise In Orange Belt
        </p>
      </footer>
    </div>
  )
}
