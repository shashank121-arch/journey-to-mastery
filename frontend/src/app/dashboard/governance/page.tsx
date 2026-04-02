"use client"
import { useEffect, useState } from 'react'
import { useWallet } from '@/context/WalletContext'
import Navbar from '@/components/ui/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import WalletConnect from '@/components/ui/WalletConnect'
import { getUserPosition } from '@/lib/stellar'
import { Coins, CheckCircle2, AlertCircle } from 'lucide-react'

// Dummy proposals for visual demonstration
const proposals = [
  {
    id: 1,
    title: 'Increase Stable Yield Vault Reserve Factor to 15%',
    description: 'Increase the reserve factor of the Stable Yield Vault from 10% to 15% to boost treasury reserves.',
    status: 'Active',
    endDate: '2 days left',
    for: 145000,
    against: 21000,
  },
  {
    id: 2,
    title: 'Add USDC as a supported base asset',
    description: 'Allow deposits and withdrawals using Stellar USDC into a new dedicated vault.',
    status: 'Active',
    endDate: '5 days left',
    for: 320000,
    against: 4500,
  },
  {
    id: 3,
    title: 'Adjust Jump Multiplier in RateEngine',
    description: 'Change the jump multiplier from 30% to 25% to ease borrowing costs at high utilization.',
    status: 'Passed',
    endDate: 'Ended 4 days ago',
    for: 512000,
    against: 110000,
  }
]

export default function GovernancePage() {
  const { publicKey, isConnected } = useWallet()
  const [totalVotingPower, setTotalVotingPower] = useState(0)

  useEffect(() => {
    async function loadData() {
      if (publicKey) {
        try {
          const pos = await getUserPosition(publicKey)
          if (pos && pos.vault_tokens_earned !== undefined) {
            const tokens = Number(pos.vault_tokens_earned) / 1e7
            setTotalVotingPower(tokens) // Voting power = token balance
          }
        } catch {
          // Fallback
          setTotalVotingPower(15.0)
        }
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

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Governance
            </h1>
            <p className="text-slate-400 mb-8">
              Use your earned VAULT tokens to vote on protocol upgrades.
            </p>

            {/* Voting Power Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-2xl glass flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Your Voting Power</p>
                  <p className="text-3xl font-bold text-white flex items-center gap-2">
                    {totalVotingPower.toFixed(2)} 
                    <Coins className="w-6 h-6 text-cyan-400" />
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-cyan-500/10 hidden sm:block">
                  <span className="text-cyan-400 font-medium">VAULT</span>
                </div>
              </div>
              <div className="p-6 rounded-2xl glass bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
                <h3 className="text-white font-semibold mb-2">How to get VAULT</h3>
                <p className="text-slate-400 text-sm">
                  VAULT tokens are automatically minted to your address when you deposit XLM
                  into Yield Vaults. They represent a share in protocol governance.
                </p>
              </div>
            </div>

            {/* Proposals */}
            <h2 className="text-xl font-semibold text-white mb-4">Active Proposals</h2>
            
            <div className="space-y-4">
              {proposals.map((proposal) => {
                const totalVotes = proposal.for + proposal.against
                const forPercent = (proposal.for / totalVotes) * 100

                return (
                  <div key={proposal.id} className="p-6 rounded-2xl glass glass-hover transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <h3 className="text-white font-semibold text-lg">{proposal.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                        proposal.status === 'Active' 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-6 max-w-2xl">
                      {proposal.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> For ({forPercent.toFixed(1)}%)
                        </span>
                        <span className="text-red-400 flex items-center gap-1">
                          Against ({(100 - forPercent).toFixed(1)}%) <AlertCircle className="w-4 h-4" />
                        </span>
                      </div>
                      
                      <div className="w-full h-2.5 rounded-full bg-red-500/20 overflow-hidden flex">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${forPercent}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                        <span className="text-slate-500 text-xs">
                          {proposal.endDate}
                        </span>
                        {proposal.status === 'Active' && totalVotingPower > 0 && (
                          <div className="flex gap-2">
                            <button className="px-4 py-1.5 rounded-lg border border-white/10 text-white text-sm hover:bg-white/5 transition flex items-center gap-1">
                              Vote For
                            </button>
                            <button className="px-4 py-1.5 rounded-lg border border-white/10 text-white text-sm hover:bg-white/5 transition flex items-center gap-1">
                              Vote Against
                            </button>
                          </div>
                        )}
                        {proposal.status === 'Active' && totalVotingPower <= 0 && (
                          <span className="text-slate-500 text-xs italic">
                            Insufficient voting power
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
