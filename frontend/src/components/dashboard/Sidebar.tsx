"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ArrowDownToLine,
  ArrowUpFromLine, Layers, Vote
} from 'lucide-react'

const links = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Deposit', href: '/dashboard/deposit', icon: ArrowDownToLine },
  { label: 'Withdraw', href: '/dashboard/withdraw', icon: ArrowUpFromLine },
  { label: 'Strategies', href: '/dashboard/strategies', icon: Layers },
  { label: 'Governance', href: '/dashboard/governance', icon: Vote },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 min-h-[calc(100vh-4rem)] border-r border-white/5 p-4">
        <nav className="space-y-1">
          {links.map(link => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                  <link.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{link.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile bottom tab bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1a]/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around py-2">
          {links.map(link => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href}>
                <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                  isActive ? 'text-indigo-400' : 'text-slate-500'
                }`}>
                  <link.icon className="w-5 h-5" />
                  <span className="text-[10px]">{link.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
