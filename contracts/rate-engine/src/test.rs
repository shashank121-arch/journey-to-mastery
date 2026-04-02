#![cfg(test)]

use super::*;
use soroban_sdk::Env;

fn setup() -> (Env, RateEngineClient) {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register_contract(None, RateEngine);
    let client = RateEngineClient::new(&env, &id);
    // base=200(2%), mult=1000(10%), jump=3000(30%), optimal=8000(80%)
    client.initialize(&200, &1000, &3000, &8000);
    (env, client)
}

#[test]
fn test_initialize() {
    let (_, client) = setup();
    let (base, mult, jump, optimal) = client.get_params();
    assert_eq!(base, 200);
    assert_eq!(mult, 1000);
    assert_eq!(jump, 3000);
    assert_eq!(optimal, 8000);
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_double_init() {
    let (_, client) = setup();
    client.initialize(&200, &1000, &3000, &8000);
}

#[test]
fn test_utilization_zero_deposits() {
    let (_, client) = setup();
    assert_eq!(client.get_utilization_rate(&0, &0), 0);
}

#[test]
fn test_utilization_50_percent() {
    let (_, client) = setup();
    // 500/1000 = 50% = 5000 bps
    assert_eq!(client.get_utilization_rate(&1000, &500), 5000);
}

#[test]
fn test_utilization_100_percent() {
    let (_, client) = setup();
    assert_eq!(client.get_utilization_rate(&1000, &1000), 10000);
}

#[test]
fn test_borrow_rate_zero_utilization() {
    let (_, client) = setup();
    // util=0: rate = base = 200
    let rate = client.get_borrow_rate(&1000, &0);
    assert_eq!(rate, 200);
}

#[test]
fn test_borrow_rate_50_percent_utilization() {
    let (_, client) = setup();
    // util=5000, optimal=8000
    // rate = 200 + (1000 * 5000) / 8000 = 200 + 625 = 825
    let rate = client.get_borrow_rate(&1000, &500);
    assert_eq!(rate, 825);
}

#[test]
fn test_borrow_rate_at_optimal() {
    let (_, client) = setup();
    // util=8000 exactly
    // rate = 200 + (1000 * 8000) / 8000 = 200 + 1000 = 1200
    let rate = client.get_borrow_rate(&1000, &800);
    assert_eq!(rate, 1200);
}

#[test]
fn test_borrow_rate_above_optimal() {
    let (_, client) = setup();
    // util=9000 (90%), optimal=8000
    // normal_rate = 200 + 1000 = 1200
    // excess = 9000 - 8000 = 1000
    // max_excess = 10000 - 8000 = 2000
    // jump_component = 3000 * 1000 / 2000 = 1500
    // total = 1200 + 1500 = 2700
    let rate = client.get_borrow_rate(&1000, &900);
    assert_eq!(rate, 2700);
}

#[test]
fn test_borrow_rate_100_percent() {
    let (_, client) = setup();
    // util=10000
    // normal=1200, excess=2000, max=2000
    // jump=3000*2000/2000=3000
    // total=1200+3000=4200
    let rate = client.get_borrow_rate(&1000, &1000);
    assert_eq!(rate, 4200);
}

#[test]
fn test_supply_rate() {
    let (_, client) = setup();
    // 50% util, reserve=1000 (10%)
    // borrow_rate=825, util=5000
    // supply = 825 * 5000 * (10000-1000) / (10000*10000)
    //        = 825 * 5000 * 9000 / 100000000
    //        = 37125000000 / 100000000 = 371
    let rate = client.get_supply_rate(&1000, &500, &1000);
    assert_eq!(rate, 371);
}

#[test]
fn test_supply_rate_zero_util() {
    let (_, client) = setup();
    let rate = client.get_supply_rate(&1000, &0, &1000);
    assert_eq!(rate, 0);
}

#[test]
#[should_panic(expected = "invalid parameters")]
fn test_invalid_optimal_over_100() {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register_contract(None, RateEngine);
    let client = RateEngineClient::new(&env, &id);
    client.initialize(&200, &1000, &3000, &11000);
}
