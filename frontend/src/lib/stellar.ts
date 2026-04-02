/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Contract,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  rpc,
  scValToNative,
  nativeToScVal,
  Address,
} from '@stellar/stellar-sdk'
import { CONTRACTS } from './contracts'

const server = new rpc.Server(
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
  'https://soroban-testnet.stellar.org'
)

const HORIZON = process.env.NEXT_PUBLIC_HORIZON_URL ||
  'https://horizon-testnet.stellar.org'

// Default read-only account for simulations
const DEFAULT_ACCOUNT =
  'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7'

export async function invokeContract(
  contractId: string,
  method: string,
  args: any[],
  publicKey?: string,
  readOnly = false,
  signTransaction?: (xdr: string) => Promise<string>
): Promise<any> {
  try {
    if (!contractId) {
      console.warn(`No contract ID for method ${method}`)
      return null
    }

    const contract = new Contract(contractId)

    const scArgs = args.map(arg => {
      // Check if arg is a valid Stellar Address string
      if (typeof arg === 'string' && arg.startsWith('G') && arg.length === 56) {
        try {
          return nativeToScVal(Address.fromString(arg), { type: 'address' })
        } catch (e) {
          console.warn('Invalid address in args, returning raw scVal', e)
        }
      }
      if (typeof arg === 'number' || typeof arg === 'bigint') {
        return nativeToScVal(BigInt(arg), { type: 'i128' })
      }
      if (typeof arg === 'string') {
        return nativeToScVal(arg, { type: 'string' })
      }
      return nativeToScVal(arg)
    })

    const sourceKey = publicKey || DEFAULT_ACCOUNT
    const account = await server.getAccount(sourceKey)

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(contract.call(method, ...scArgs))
      .setTimeout(30)
      .build()

    const simResult = await server.simulateTransaction(tx)

    if (rpc.Api.isSimulationError(simResult)) {
      console.error('Simulation error:', simResult)
      return null
    }

    if (readOnly) {
      const retval = (simResult as any).result?.retval
      return retval ? scValToNative(retval) : null
    }

    if (signTransaction) {
      const signedXdr = await signTransaction(tx.toXDR())
      const signedTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET)
      const submitResult = await server.sendTransaction(signedTx)

      // Use string comparison with any cast to avoid SendTransactionStatus enum overlap errors in TS
      const status = (submitResult as any).status?.toLowerCase()
      if (status === 'success' || status === 'pending') {
        return submitResult
      } else {
        console.error('Transaction failed:', submitResult)
        return null
      }
    }

    return simResult
  } catch (error) {
    console.error(`Contract call error [${method}]:`, error)
    return null
  }
}

// --- High-level API functions ---

export async function getVaultState() {
  return invokeContract(CONTRACTS.yieldVault, 'get_vault_state', [], undefined, true)
}

export async function getUserPosition(publicKey: string) {
  return invokeContract(CONTRACTS.yieldVault, 'get_position', [publicKey], publicKey, true)
}

export async function depositToVault(publicKey: string, amount: number, signTransaction?: (xdr: string) => Promise<string>) {
  return invokeContract(CONTRACTS.yieldVault, 'deposit', [publicKey, amount], publicKey, false, signTransaction)
}

export async function withdrawFromVault(publicKey: string, shareAmount: number, signTransaction?: (xdr: string) => Promise<string>) {
  return invokeContract(CONTRACTS.yieldVault, 'withdraw', [publicKey, shareAmount], publicKey, false, signTransaction)
}

export async function getSharePrice(): Promise<number> {
  const result = await invokeContract(CONTRACTS.yieldVault, 'get_share_price', [], undefined, true)
  return result ? Number(result) / 1e7 : 1.0
}

export async function getVaultApy(): Promise<number> {
  const result = await invokeContract(CONTRACTS.yieldVault, 'get_vault_apy', [], undefined, true)
  return result ? Number(result) / 100 : 8.0
}

export async function getXlmPrice(): Promise<number> {
  const result = await invokeContract(CONTRACTS.priceOracle, 'get_price', ['XLM'], undefined, true)
  return result ? Number(result) / 10000 : 0.12
}

export async function getVaultTokenBalance(publicKey: string): Promise<number> {
  const result = await invokeContract(CONTRACTS.vaultToken, 'balance', [publicKey], publicKey, true)
  return result ? Number(result) / 1e7 : 0
}

// --- Real-time event streaming (Level 3) ---

export function streamTransactions(
  publicKey: string,
  onTransaction: (tx: any) => void
): () => void {
  const url = `${HORIZON}/accounts/${publicKey}/transactions?cursor=now&order=asc`

  const eventSource = new EventSource(url)

  eventSource.onmessage = (event) => {
    try {
      const tx = JSON.parse(event.data)
      onTransaction({
        hash: tx.hash,
        createdAt: tx.created_at,
        memo: tx.memo || '',
        successful: tx.successful,
        type: 'transaction',
      })
    } catch (err) {
      console.error('SSE parse error:', err)
    }
  }

  eventSource.onerror = () => {
    eventSource.close()
  }

  return () => eventSource.close()
}

// --- Fetch recent transactions ---

export async function getRecentTransactions(publicKey: string, limit = 10) {
  try {
    const res = await fetch(
      `${HORIZON}/accounts/${publicKey}/transactions?order=desc&limit=${limit}`
    )
    if (!res.ok) return []
    const data = await res.json()
    return data._embedded?.records?.map((tx: any) => ({
      hash: tx.hash,
      createdAt: tx.created_at,
      memo: tx.memo || '',
      successful: tx.successful,
      fee: tx.fee_charged,
    })) || []
  } catch {
    return []
  }
}
