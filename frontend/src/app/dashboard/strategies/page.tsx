"use client"
import Navbar from '@/components/ui/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import VaultCard from '@/components/dashboard/VaultCard'
import { useWallet } from '@/context/WalletContext'
import WalletConnect from '@/components/ui/WalletConnect'

const vaults = [
  {
    name: 'Stable Yield Vault',
    apy: '8.4%',
    tvl: '42,100 XLM',
    risk: 'Low' as const,
    strategy: 'Conservative lending with auto-compound',
    userDeposit: '50.00 XLM',
  },
  {
    name: 'Growth Vault',
    apy: '14.2%',
    tvl: '28,700 XLM',
    risk: 'Medium' as const,
    strategy: 'Optimized utilization rate targeting',
    userDeposit: '100.00 XLM',
  },
  {
    name: 'Alpha Vault',
    apy: '22.8%',
    tvl: '18,620 XLM',
    risk: 'High' as const,
    strategy: 'Aggressive yield farming with leverage',
  },
  {
    name: 'Stablecoin Vault',
    apy: '6.2%',
    tvl: '65,400 XLM',
    risk: 'Low' as const,
    strategy: 'USDC-backed stable yield generation',
  },
]

export default function StrategiesPage() {
  const { isConnected } = useWallet()

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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Vault Strategies
            </h1>
            <p className="text-slate-400 mb-8">
              Choose from different yield vault strategies based on your risk tolerance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vaults.map(vault => (
                <VaultCard key={vault.name} {...vault} />
              ))}
            </div>

            {/* Strategy explanation */}
            <div className="mt-8 p-6 rounded-2xl glass">
              <h3 className="text-white font-semibold mb-4">How Strategies Work</h3>
              <div className="space-y-4 text-sm text-slate-400">
                <p>
                  Each vault uses a different strategy to generate yield on your deposited XLM.
                  The RateEngine smart contract dynamically adjusts APY based on
                  pool utilization and market conditions.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-emerald-400 font-medium mb-1">Low Risk</p>
                    <p className="text-xs">Conservative lending, stable returns, low volatility</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <p className="text-amber-400 font-medium mb-1">Medium Risk</p>
                    <p className="text-xs">Balanced approach, moderate returns with some volatility</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <p className="text-red-400 font-medium mb-1">High Risk</p>
                    <p className="text-xs">Aggressive strategies, highest potential returns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
