#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    BaseRate,
    Multiplier,
    JumpMultiplier,
    OptimalUtilization,
    Initialized,
}

#[contract]
pub struct RateEngine;

#[contractimpl]
impl RateEngine {
    /// Initialize the rate engine with parameters.
    /// Rates are in basis points (1% = 100).
    /// base_rate: 200 = 2%
    /// multiplier: 1000 = 10%
    /// jump_multiplier: 3000 = 30%
    /// optimal_utilization: 8000 = 80%
    pub fn initialize(
        env: Env,
        base_rate: i128,
        multiplier: i128,
        jump_multiplier: i128,
        optimal_utilization: i128,
    ) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("already initialized");
        }
        if base_rate < 0
            || multiplier < 0
            || jump_multiplier < 0
            || optimal_utilization <= 0
            || optimal_utilization > 10000
        {
            panic!("invalid parameters");
        }

        env.storage().instance().set(&DataKey::BaseRate, &base_rate);
        env.storage()
            .instance()
            .set(&DataKey::Multiplier, &multiplier);
        env.storage()
            .instance()
            .set(&DataKey::JumpMultiplier, &jump_multiplier);
        env.storage()
            .instance()
            .set(&DataKey::OptimalUtilization, &optimal_utilization);
        env.storage().instance().set(&DataKey::Initialized, &true);

        env.events().publish(
            (Symbol::new(&env, "rate_engine_init"),),
            (base_rate, multiplier, jump_multiplier, optimal_utilization),
        );
    }

    /// Calculate the utilization rate.
    /// Returns utilization as percentage * 100 (basis points).
    /// e.g., 50% utilization = 5000
    pub fn get_utilization_rate(env: Env, total_deposits: i128, total_borrows: i128) -> i128 {
        if total_deposits == 0 {
            return 0;
        }
        (total_borrows * 10000) / total_deposits
    }

    /// Calculate the borrow/vault APY rate.
    /// Returns annual rate in basis points.
    /// Uses kinked rate model:
    ///   If util < optimal: rate = base + multiplier * (util / optimal)
    ///   If util >= optimal: rate = base + multiplier + jump * ((util - optimal) / (10000 - optimal))
    pub fn get_borrow_rate(env: Env, total_deposits: i128, total_borrows: i128) -> i128 {
        check_init(&env);

        let base: i128 = env.storage().instance().get(&DataKey::BaseRate).unwrap();
        let mult: i128 = env.storage().instance().get(&DataKey::Multiplier).unwrap();
        let jump: i128 = env
            .storage()
            .instance()
            .get(&DataKey::JumpMultiplier)
            .unwrap();
        let optimal: i128 = env
            .storage()
            .instance()
            .get(&DataKey::OptimalUtilization)
            .unwrap();

        let util = Self::get_utilization_rate(env.clone(), total_deposits, total_borrows);

        if util <= optimal {
            // Linear below optimal
            base + (mult * util) / optimal
        } else {
            // Jump above optimal
            let normal_rate = base + mult;
            let excess_util = util - optimal;
            let max_excess = 10000 - optimal;
            if max_excess == 0 {
                return normal_rate;
            }
            normal_rate + (jump * excess_util) / max_excess
        }
    }

    /// Calculate the supply/deposit APY rate.
    /// supply_rate = borrow_rate * utilization * (1 - reserve_factor)
    /// reserve_factor in basis points (e.g., 1000 = 10%)
    pub fn get_supply_rate(
        env: Env,
        total_deposits: i128,
        total_borrows: i128,
        reserve_factor: i128,
    ) -> i128 {
        check_init(&env);

        let borrow_rate = Self::get_borrow_rate(env.clone(), total_deposits, total_borrows);
        let util = Self::get_utilization_rate(env, total_deposits, total_borrows);

        // supply_rate = borrow_rate * util/10000 * (10000 - reserve_factor)/10000
        (borrow_rate * util * (10000 - reserve_factor)) / (10000 * 10000)
    }

    /// Get current parameters.
    pub fn get_params(env: Env) -> (i128, i128, i128, i128) {
        check_init(&env);
        let base: i128 = env.storage().instance().get(&DataKey::BaseRate).unwrap();
        let mult: i128 = env.storage().instance().get(&DataKey::Multiplier).unwrap();
        let jump: i128 = env
            .storage()
            .instance()
            .get(&DataKey::JumpMultiplier)
            .unwrap();
        let optimal: i128 = env
            .storage()
            .instance()
            .get(&DataKey::OptimalUtilization)
            .unwrap();
        (base, mult, jump, optimal)
    }
}

fn check_init(env: &Env) {
    if !env.storage().instance().has(&DataKey::Initialized) {
        panic!("rate engine not initialized");
    }
}

mod test;
