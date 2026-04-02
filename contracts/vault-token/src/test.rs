#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup_test() -> (Env, Address, VaultTokenClient) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, VaultToken);
    let client = VaultTokenClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.initialize(
        &admin,
        &7u32,
        &String::from_str(&env, "VaultToken"),
        &String::from_str(&env, "VAULT"),
    );
    (env, admin, client)
}

#[test]
fn test_initialize() {
    let (env, _admin, client) = setup_test();
    assert_eq!(client.name(), String::from_str(&env, "VaultToken"));
    assert_eq!(client.symbol(), String::from_str(&env, "VAULT"));
    assert_eq!(client.decimals(), 7u32);
    assert_eq!(client.total_supply(), 0i128);
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_double_initialize() {
    let (env, admin, client) = setup_test();
    client.initialize(
        &admin,
        &7u32,
        &String::from_str(&env, "VaultToken"),
        &String::from_str(&env, "VAULT"),
    );
}

#[test]
fn test_mint() {
    let (env, admin, client) = setup_test();
    let user = Address::generate(&env);
    client.mint(&user, &1000_i128);
    assert_eq!(client.balance(&user), 1000_i128);
    assert_eq!(client.total_supply(), 1000_i128);
}

#[test]
fn test_mint_multiple() {
    let (env, admin, client) = setup_test();
    let user = Address::generate(&env);
    client.mint(&user, &500_i128);
    client.mint(&user, &300_i128);
    assert_eq!(client.balance(&user), 800_i128);
    assert_eq!(client.total_supply(), 800_i128);
}

#[test]
fn test_burn() {
    let (env, admin, client) = setup_test();
    let user = Address::generate(&env);
    client.mint(&user, &1000_i128);
    client.burn(&user, &400_i128);
    assert_eq!(client.balance(&user), 600_i128);
    assert_eq!(client.total_supply(), 600_i128);
}

#[test]
#[should_panic(expected = "insufficient balance to burn")]
fn test_burn_insufficient() {
    let (env, admin, client) = setup_test();
    let user = Address::generate(&env);
    client.mint(&user, &100_i128);
    client.burn(&user, &200_i128);
}

#[test]
fn test_transfer() {
    let (env, admin, client) = setup_test();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    client.mint(&alice, &1000_i128);
    client.transfer(&alice, &bob, &300_i128);
    assert_eq!(client.balance(&alice), 700_i128);
    assert_eq!(client.balance(&bob), 300_i128);
}

#[test]
#[should_panic(expected = "insufficient balance")]
fn test_transfer_insufficient() {
    let (env, admin, client) = setup_test();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    client.mint(&alice, &100_i128);
    client.transfer(&alice, &bob, &200_i128);
}

#[test]
fn test_approve_and_allowance() {
    let (env, admin, client) = setup_test();
    let owner = Address::generate(&env);
    let spender = Address::generate(&env);
    client.approve(&owner, &spender, &500_i128, &1000u32);
    assert_eq!(client.allowance(&owner, &spender), 500_i128);
}

#[test]
fn test_transfer_from() {
    let (env, admin, client) = setup_test();
    let owner = Address::generate(&env);
    let spender = Address::generate(&env);
    let recipient = Address::generate(&env);
    client.mint(&owner, &1000_i128);
    client.approve(&owner, &spender, &500_i128, &1000u32);
    client.transfer_from(&spender, &owner, &recipient, &300_i128);
    assert_eq!(client.balance(&owner), 700_i128);
    assert_eq!(client.balance(&recipient), 300_i128);
    assert_eq!(client.allowance(&owner, &spender), 200_i128);
}

#[test]
#[should_panic(expected = "insufficient allowance")]
fn test_transfer_from_insufficient_allowance() {
    let (env, admin, client) = setup_test();
    let owner = Address::generate(&env);
    let spender = Address::generate(&env);
    let recipient = Address::generate(&env);
    client.mint(&owner, &1000_i128);
    client.approve(&owner, &spender, &100_i128, &1000u32);
    client.transfer_from(&spender, &owner, &recipient, &200_i128);
}

#[test]
fn test_balance_uninitialized_user() {
    let (env, _admin, client) = setup_test();
    let unknown = Address::generate(&env);
    assert_eq!(client.balance(&unknown), 0_i128);
}

#[test]
fn test_allowance_uninitialized() {
    let (env, _admin, client) = setup_test();
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    assert_eq!(client.allowance(&a, &b), 0_i128);
}

#[test]
#[should_panic(expected = "amount must be non-negative")]
fn test_mint_negative() {
    let (env, admin, client) = setup_test();
    let user = Address::generate(&env);
    client.mint(&user, &-100_i128);
}

#[test]
fn test_total_supply_after_operations() {
    let (env, admin, client) = setup_test();
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    client.mint(&a, &1000_i128);
    client.mint(&b, &500_i128);
    assert_eq!(client.total_supply(), 1500_i128);
    client.burn(&a, &200_i128);
    assert_eq!(client.total_supply(), 1300_i128);
    client.transfer(&a, &b, &100_i128);
    assert_eq!(client.total_supply(), 1300_i128);
}
