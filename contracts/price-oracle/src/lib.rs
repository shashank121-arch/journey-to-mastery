#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Symbol, Vec};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Price(String),
    Initialized,
    LastUpdate,
}

#[contract]
pub struct PriceOracle;

#[contractimpl]
impl PriceOracle {
    /// Initialize oracle with admin address.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Initialized, &true);

        // Set default prices (price = USD cents * 10000)
        // XLM = $0.12 -> 1200
        // USDC = $1.00 -> 100000
        // BTC = $65000 -> 6500000000
        // ETH = $3500 -> 350000000
        let xlm_key = String::from_str(&env, "XLM");
        let usdc_key = String::from_str(&env, "USDC");
        let btc_key = String::from_str(&env, "BTC");
        let eth_key = String::from_str(&env, "ETH");

        env.storage()
            .persistent()
            .set(&DataKey::Price(xlm_key), &1200_i128);
        env.storage()
            .persistent()
            .set(&DataKey::Price(usdc_key), &100000_i128);
        env.storage()
            .persistent()
            .set(&DataKey::Price(btc_key), &6500000000_i128);
        env.storage()
            .persistent()
            .set(&DataKey::Price(eth_key), &350000000_i128);

        env.storage()
            .instance()
            .set(&DataKey::LastUpdate, &env.ledger().timestamp());

        env.events()
            .publish((Symbol::new(&env, "oracle_init"),), admin);
    }

    /// Set price for a single asset. Admin only.
    pub fn set_price(env: Env, asset: String, price: i128) {
        check_initialized(&env);
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if price <= 0 {
            panic!("price must be positive");
        }

        env.storage()
            .persistent()
            .set(&DataKey::Price(asset.clone()), &price);
        env.storage()
            .instance()
            .set(&DataKey::LastUpdate, &env.ledger().timestamp());

        env.events()
            .publish((Symbol::new(&env, "price_set"),), (asset, price));
    }

    /// Get price for an asset.
    pub fn get_price(env: Env, asset: String) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Price(asset))
            .unwrap_or(0)
    }

    /// Get prices for multiple assets.
    pub fn get_prices(env: Env, assets: Vec<String>) -> Map<String, i128> {
        let mut result = Map::new(&env);
        for asset in assets.iter() {
            let price = env
                .storage()
                .persistent()
                .get(&DataKey::Price(asset.clone()))
                .unwrap_or(0);
            result.set(asset, price);
        }
        result
    }

    /// Set multiple prices at once. Admin only.
    pub fn set_prices_batch(env: Env, prices: Map<String, i128>) {
        check_initialized(&env);
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        for (asset, price) in prices.iter() {
            if price <= 0 {
                panic!("all prices must be positive");
            }
            env.storage()
                .persistent()
                .set(&DataKey::Price(asset), &price);
        }

        env.storage()
            .instance()
            .set(&DataKey::LastUpdate, &env.ledger().timestamp());

        env.events()
            .publish((Symbol::new(&env, "prices_batch_set"),), prices.len());
    }

    /// Get last update timestamp.
    pub fn last_update(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::LastUpdate)
            .unwrap_or(0)
    }

    /// Get admin address.
    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }
}

fn check_initialized(env: &Env) {
    if !env.storage().instance().has(&DataKey::Initialized) {
        panic!("oracle not initialized");
    }
}

mod test;
