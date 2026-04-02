import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/context/WalletContext'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StellarVault — DeFi Yield Vaults on Stellar',
  description: 'Deposit XLM into auto-compounding yield vaults. Earn VAULT governance tokens. Built on Stellar Soroban.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0f1a] text-white antialiased`}>
        <WalletProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
              },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  )
}
