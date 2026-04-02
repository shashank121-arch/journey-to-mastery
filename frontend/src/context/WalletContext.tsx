"use client"
import {
  createContext, useContext,
  useState, useEffect, useCallback
} from 'react'

interface WalletState {
  publicKey: string | null
  isConnected: boolean
  xlmBalance: number
  vaultTokenBalance: number
  walletType: 'freighter' | 'albedo' | null
  isLoading: boolean
}

interface WalletContextType extends WalletState {
  connectFreighter: () => Promise<void>
  connectAlbedo: () => Promise<void>
  disconnect: () => void
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType>(
  {} as WalletContextType
)

const HORIZON = 'https://horizon-testnet.stellar.org'

async function fetchBalances(publicKey: string) {
  if (!publicKey || typeof publicKey !== 'string' || !publicKey.startsWith('G')) {
    return { xlm: 0 }
  }
  try {
    const res = await fetch(`${HORIZON}/accounts/${publicKey}`)
    if (!res.ok) return { xlm: 0 }
    const data = await res.json()
    let xlm = 0
    for (const b of data.balances) {
      if (b.asset_type === 'native') xlm = parseFloat(b.balance)
    }
    return { xlm }
  } catch {
    return { xlm: 0 }
  }
}

export function WalletProvider({ children }: {
  children: React.ReactNode
}) {
  const [state, setState] = useState<WalletState>({
    publicKey: null,
    isConnected: false,
    xlmBalance: 0,
    vaultTokenBalance: 0,
    walletType: null,
    isLoading: false,
  })

  const connectFreighter = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true }))
    try {
      const freighterApi = await import('@stellar/freighter-api')
      const connected = await freighterApi.isConnected()

      if (!connected) {
        window.open('https://freighter.app', '_blank')
        setState(s => ({ ...s, isLoading: false }))
        return
      }

      // Fix for some versions of Freighter return
      let publicKey = await (freighterApi as any).requestAccess()
      if (publicKey && typeof publicKey === 'object') {
        publicKey = publicKey.address || publicKey.publicKey || publicKey.id || JSON.stringify(publicKey)
      }

      if (typeof publicKey !== 'string') {
        throw new Error('Invalid public key received from wallet')
      }

      const { xlm } = await fetchBalances(publicKey)

      setState({
        publicKey,
        isConnected: true,
        xlmBalance: xlm,
        vaultTokenBalance: 0,
        walletType: 'freighter',
        isLoading: false,
      })

      localStorage.setItem('sv_wallet_key', publicKey)
      localStorage.setItem('sv_wallet_type', 'freighter')
    } catch (err) {
      console.error('Freighter error:', err)
      setState(s => ({ ...s, isLoading: false }))
    }
  }, [])

  const connectAlbedo = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true }))
    try {
      const albedo = (await import('@albedo-link/intent')).default
      const result = await albedo.publicKey({ token: 'stellarvault' })
      const publicKey = result.pubkey
      const { xlm } = await fetchBalances(publicKey)

      setState({
        publicKey,
        isConnected: true,
        xlmBalance: xlm,
        vaultTokenBalance: 0,
        walletType: 'albedo',
        isLoading: false,
      })

      localStorage.setItem('sv_wallet_key', publicKey)
      localStorage.setItem('sv_wallet_type', 'albedo')
    } catch (err) {
      console.error('Albedo error:', err)
      setState(s => ({ ...s, isLoading: false }))
    }
  }, [])

  const disconnect = useCallback(() => {
    setState({
      publicKey: null,
      isConnected: false,
      xlmBalance: 0,
      vaultTokenBalance: 0,
      walletType: null,
      isLoading: false,
    })
    localStorage.removeItem('sv_wallet_key')
    localStorage.removeItem('sv_wallet_type')
  }, [])

  const refreshBalance = useCallback(async () => {
    if (!state.publicKey) return
    const { xlm } = await fetchBalances(state.publicKey)
    setState(s => ({ ...s, xlmBalance: xlm }))
  }, [state.publicKey])

  useEffect(() => {
    const key = localStorage.getItem('sv_wallet_key')
    const type_ = localStorage.getItem('sv_wallet_type')
    if (key && type_) {
      fetchBalances(key).then(({ xlm }) => {
        setState({
          publicKey: key,
          isConnected: true,
          xlmBalance: xlm,
          vaultTokenBalance: 0,
          walletType: type_ as 'freighter' | 'albedo',
          isLoading: false,
        })
      })
    }
  }, [])

  return (
    <WalletContext.Provider value={{
      ...state,
      connectFreighter,
      connectAlbedo,
      disconnect,
      refreshBalance,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
