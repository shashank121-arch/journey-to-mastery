# StellarVault

A DeFi yield vault platform built on Stellar Soroban.

## Architecture

```
┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│ Stellar SDK  │
│  (Next.js)  │     │  (Soroban)   │
└─────────────┘     └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │ YieldVault  │ │ PriceOracle │ │ RateEngine  │
    │  (core)     │ │  (prices)   │ │  (APY calc) │
    └──────┬──────┘ └─────────────┘ └─────────────┘
           │
    ┌──────▼──────┐
    │ VaultToken  │
    │  (SEP-41)   │
    └─────────────┘
```

## Smart Contracts

| Contract | Purpose |
|----------|---------|
| yield-vault | Core vault logic with deposit/withdraw/compound |
| vault-token | SEP-41 governance token (VAULT) |
| price-oracle | On-chain asset price feeds |
| rate-engine | Dynamic APY calculation engine |

## Tech Stack

- **Contracts**: Rust + Soroban SDK 20.0.0
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Blockchain**: Stellar Testnet
- **Wallets**: Freighter + Albedo
- **CI/CD**: GitHub Actions + Vercel

## Setup

### Prerequisites
- Rust + `wasm32-unknown-unknown` target
- Stellar CLI
- Node.js 20+

### Build Contracts
```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
cargo test
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### Deploy Contracts
```bash
stellar keys generate deployer --network testnet
stellar keys fund deployer --network testnet

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/vault_token.wasm \
  --source deployer --network testnet
```

## Contract Addresses (Testnet)

| Contract | ID |
|----------|-----|
| YieldVault | `<paste after deploy>` |
| VaultToken | `<paste after deploy>` |
| PriceOracle | `<paste after deploy>` |
| RateEngine | `<paste after deploy>` |

## Level Requirements

- ✅ Level 1: Smart contract + frontend + wallet
- ✅ Level 2: Custom token + yield mechanics + rate model
- ✅ Level 3: Inter-contract calls + SSE streaming + CI/CD + mobile
- ✅ Level 4: Advanced patterns + custom token + production ready

## License
MIT
