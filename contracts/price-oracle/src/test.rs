#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, Map, String, Vec};

fn setup() -> (Env, Address, PriceOracleClient) {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register_contract(None, PriceOracle);
    let client = PriceOracleClient::new(&env, &id);
    let admin = Address::generate(&env);
    client.initialize(&admin);
    (env, admin, client)
}

#[test]
fn test_initialize_defaults() {
    let (env, _, client) = setup();
    assert_eq!(client.get_price(&String::from_str(&env, "XLM")), 1200);
    assert_eq!(client.get_price(&String::from_str(&env, "USDC")), 100000);
    assert_eq!(client.get_price(&String::from_str(&env, "BTC")), 6500000000);
    assert_eq!(client.get_price(&String::from_str(&env, "ETH")), 350000000);
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_double_init() {
    let (env, admin, client) = setup();
    client.initialize(&admin);
}

#[test]
fn test_set_price() {
    let (env, _, client) = setup();
    client.set_price(&String::from_str(&env, "XLM"), &2000);
    assert_eq!(client.get_price(&String::from_str(&env, "XLM")), 2000);
}

#[test]
#[should_panic(expected = "price must be positive")]
fn test_set_price_zero() {
    let (env, _, client) = setup();
    client.set_price(&String::from_str(&env, "XLM"), &0);
}

#[test]
fn test_get_price_unknown_asset() {
    let (env, _, client) = setup();
    assert_eq!(client.get_price(&String::from_str(&env, "DOGE")), 0);
}

#[test]
fn test_get_prices_multiple() {
    let (env, _, client) = setup();
    let mut assets = Vec::new(&env);
    assets.push_back(String::from_str(&env, "XLM"));
    assets.push_back(String::from_str(&env, "USDC"));
    let prices = client.get_prices(&assets);
    assert_eq!(prices.get(String::from_str(&env, "XLM")).unwrap(), 1200);
    assert_eq!(prices.get(String::from_str(&env, "USDC")).unwrap(), 100000);
}

#[test]
fn test_set_prices_batch() {
    let (env, _, client) = setup();
    let mut batch = Map::new(&env);
    batch.set(String::from_str(&env, "XLM"), 1500);
    batch.set(String::from_str(&env, "ETH"), 400000000);
    client.set_prices_batch(&batch);
    assert_eq!(client.get_price(&String::from_str(&env, "XLM")), 1500);
    assert_eq!(client.get_price(&String::from_str(&env, "ETH")), 400000000);
}

#[test]
fn test_last_update() {
    let (_, _, client) = setup();
    let ts = client.last_update();
    assert!(ts >= 0);
}

#[test]
fn test_admin() {
    let (_, admin, client) = setup();
    assert_eq!(client.admin(), admin);
}

#[test]
fn test_set_new_asset() {
    let (env, _, client) = setup();
    client.set_price(&String::from_str(&env, "SOL"), &15000000);
    assert_eq!(client.get_price(&String::from_str(&env, "SOL")), 15000000);
}
