#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

// We need to register mock contracts for oracle and rate engine
// For unit tests, we register the actual contracts

mod price_oracle {
    soroban_sdk::contractimport!(
        file = "../price-oracle/target/wasm32-unknown-unknown/release/price_oracle.wasm"
    );
}

mod rate_engine {
    soroban_sdk::contractimport!(
        file = "../rate-engine/target/wasm32-unknown-unknown/release/rate_engine.wasm"
    );
}

mod vault_token {
    soroban_sdk::contractimport!(
        file = "../vault-token/target/wasm32-unknown-unknown/release/vault_token.wasm"
    );
}

fn setup() -> (Env, Address, Address, Address, Address, YieldVaultClient) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);

    // Deploy oracle
    let oracle_id = env.register_contract_wasm(None, price_oracle::WASM);
    let oracle_client = price_oracle::Client::new(&env, &oracle_id);
    oracle_client.initialize(&admin);

    // Deploy rate engine
    let rate_id = env.register_contract_wasm(None, rate_engine::WASM);
    let rate_client = rate_engine::Client::new(&env, &rate_id);
    rate_client.initialize(&200_i128, &1000_i128, &3000_i128, &8000_i128);

    // Deploy vault token
    let token_id = env.register_contract_wasm(None, vault_token::WASM);
    let token_client = vault_token::Client::new(&env, &token_id);
    token_client.initialize(
        &admin,
        &7u32,
        &String::from_str(&env, "VaultToken"),
        &String::from_str(&env, "VAULT"),
    );

    // Deploy yield vault
    let vault_id = env.register_contract(None, YieldVault);
    let vault_client = YieldVaultClient::new(&env, &vault_id);
    vault_client.initialize(&admin, &token_id, &oracle_id, &rate_id);

    (env, admin, oracle_id, rate_id, token_id, vault_client)
}

// NOTE: These tests require building the dependency contracts first.
// Run: cd contracts && cargo build --target wasm32-unknown-unknown --release
// Then: cd yield-vault && cargo test
//
// For CI, if WASM files don't exist, we provide standalone tests below.

// --- Standalone tests (no inter-contract WASM needed) ---

fn setup_standalone() -> (Env, Address, YieldVaultClient) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let fake_oracle = Address::generate(&env);
    let fake_rate = Address::generate(&env);
    let fake_token = Address::generate(&env);

    let vault_id = env.register_contract(None, YieldVault);
    let client = YieldVaultClient::new(&env, &vault_id);

    // Note: initialize will work but inter-contract calls will fail
    // These tests focus on state management logic
    client.initialize(&admin, &fake_token, &fake_oracle, &fake_rate);

    (env, admin, client)
}

#[test]
fn test_initialize() {
    let (_, admin, client) = setup_standalone();
    let state = client.get_vault_state();
    assert_eq!(state.total_deposits, 0);
    assert_eq!(state.total_shares, 0);
    assert_eq!(state.reserve_factor, 1000);
    assert!(!state.is_paused);
    assert_eq!(state.admin, admin);
    assert_eq!(state.share_price, 10_000_000);
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_double_initialize() {
    let (_, admin, client) = setup_standalone();
    let fake = Address::generate(&Env::default());
    // This will panic because setup already initialized
    client.initialize(&admin, &fake, &fake, &fake);
}

#[test]
fn test_get_share_price_empty() {
    let (_, _, client) = setup_standalone();
    assert_eq!(client.get_share_price(), 10_000_000);
}

#[test]
fn test_get_position_empty() {
    let (env, _, client) = setup_standalone();
    let user = Address::generate(&env);
    let pos = client.get_position(&user);
    assert_eq!(pos.deposited, 0);
    assert_eq!(pos.shares, 0);
}

#[test]
fn test_get_user_vault_tokens_empty() {
    let (env, _, client) = setup_standalone();
    let user = Address::generate(&env);
    assert_eq!(client.get_user_vault_tokens(&user), 0);
}

#[test]
fn test_get_user_value_empty() {
    let (env, _, client) = setup_standalone();
    let user = Address::generate(&env);
    assert_eq!(client.get_user_value(&user), 0);
}

#[test]
fn test_emergency_pause() {
    let (_, _, client) = setup_standalone();
    client.emergency_pause();
    let state = client.get_vault_state();
    assert!(state.is_paused);
}

#[test]
fn test_unpause() {
    let (_, _, client) = setup_standalone();
    client.emergency_pause();
    client.unpause();
    let state = client.get_vault_state();
    assert!(!state.is_paused);
}

#[test]
fn test_compound_yield() {
    let (_, _, client) = setup_standalone();
    // Simulate: first set some deposits manually is not possible,
    // but compound_yield updates total_deposits
    client.compound_yield(&1_000_000);
    let state = client.get_vault_state();
    // yield=1000000, reserve=10%=100000, distributed=900000
    assert_eq!(state.total_deposits, 900000);
    assert_eq!(state.total_yield_distributed, 900000);
}

#[test]
#[should_panic(expected = "yield must be positive")]
fn test_compound_yield_zero() {
    let (_, _, client) = setup_standalone();
    client.compound_yield(&0);
}

#[test]
#[should_panic(expected = "yield must be positive")]
fn test_compound_yield_negative() {
    let (_, _, client) = setup_standalone();
    client.compound_yield(&-100);
}

#[test]
fn test_compound_yield_multiple() {
    let (_, _, client) = setup_standalone();
    client.compound_yield(&1_000_000);
    client.compound_yield(&500_000);
    let state = client.get_vault_state();
    // First: 900000
    // Second: 450000
    // Total: 1350000
    assert_eq!(state.total_deposits, 1350000);
    assert_eq!(state.total_yield_distributed, 1350000);
}

#[test]
fn test_vault_state_fields() {
    let (_, admin, client) = setup_standalone();
    let state = client.get_vault_state();
    assert_eq!(state.admin, admin);
    assert_eq!(state.reserve_factor, 1000);
    assert!(!state.is_paused);
    assert_eq!(state.total_deposits, 0);
    assert_eq!(state.total_shares, 0);
    assert_eq!(state.total_yield_distributed, 0);
}

// Integration tests with inter-contract calls would use setup()
// and require WASM files to be pre-built.
// Example (uncomment after building all contracts):
//
// #[test]
// fn test_deposit_with_oracle() {
//     let (env, admin, _, _, _, client) = setup();
//     let user = Address::generate(&env);
//     client.deposit(&user, &100_000_000);
//     let pos = client.get_position(&user);
//     assert_eq!(pos.deposited, 100_000_000);
//     assert_eq!(pos.shares, 100_000_000);
//     assert!(pos.vault_tokens_earned > 0);
// }
