"use client"
import Link from 'next/link'
import { useWallet } from '@/context/WalletContext'
import { Layers, Menu, X, LogOut, Wallet, Copy, Globe } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function Navbar() {
  const { publicKey, isConnected, xlmBalance, connectFreighter, connectAlbedo, disconnect } = useWallet()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [walletModal, setWalletModal] = useState(false)

  const truncateKey = (key: string | null) => {
    if (!key || typeof key !== 'string') return '...'
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey)
      toast.success('Address copied!')
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">StellarVault</span>
          </Link>

          {/* Testnet badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 text-xs font-medium">Testnet</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Deposit', href: '/dashboard/deposit' },
              { label: 'Withdraw', href: '/dashboard/withdraw' },
              { label: 'Strategies', href: '/dashboard/strategies' },
              { label: 'Governance', href: '/dashboard/governance' },
            ].map(link => (
              <Link key={link.href} href={link.href}>
                <span className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Wallet section */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-sm">
                  <span className="text-slate-400">{xlmBalance.toFixed(2)} XLM</span>
                </div>
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass hover:bg-white/5 transition text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white">{truncateKey(publicKey!)}</span>
                  <Copy className="w-3 h-3 text-slate-500" />
                </button>
                <button
                  onClick={disconnect}
                  className="p-2 rounded-lg hover:bg-red-500/10 transition"
                  title="Disconnect"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setWalletModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition"
              >
                <Wallet className="w-4 h-4" />
                Connect
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0a0f1a]/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-1">
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Deposit', href: '/dashboard/deposit' },
                { label: 'Withdraw', href: '/dashboard/withdraw' },
                { label: 'Strategies', href: '/dashboard/strategies' },
                { label: 'Governance', href: '/dashboard/governance' },
              ].map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  <span className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Wallet connect modal */}
      {walletModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl glass p-6 relative">
            <button
              onClick={() => setWalletModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
            <p className="text-slate-400 text-sm mb-6">Choose your preferred wallet to connect to StellarVault.</p>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  await connectFreighter()
                  setWalletModal(false)
                  toast.success('Wallet connected via Freighter!')
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl glass glass-hover transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Freighter</p>
                  <p className="text-slate-500 text-xs">Browser extension wallet</p>
                </div>
              </button>

              <button
                onClick={async () => {
                  await connectAlbedo()
                  setWalletModal(false)
                  toast.success('Wallet connected via Albedo!')
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl glass glass-hover transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-violet-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Albedo</p>
                  <p className="text-slate-500 text-xs">Web-based wallet</p>
                </div>
              </button>
            </div>

            <p className="text-slate-600 text-xs text-center mt-6">
              By connecting, you agree to use Stellar Testnet
            </p>
          </div>
        </div>
      )}
    </>
  )
}
