#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, log,
    token::{self, Interface as _},
    Address, Env, String, Symbol, Vec,
};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    TotalSupply,
    Balance(Address),
    Allowance(Address, Address),
    Name,
    Symbol,
    Decimals,
    Initialized,
}

fn check_nonnegative(amount: i128) {
    if amount < 0 {
        panic!("amount must be non-negative");
    }
}

fn check_initialized(env: &Env) {
    if !env.storage().instance().has(&DataKey::Initialized) {
        panic!("contract not initialized");
    }
}

#[contract]
pub struct VaultToken;

#[contractimpl]
impl VaultToken {
    /// Initialize the VAULT token.
    /// Can only be called once.
    pub fn initialize(env: Env, admin: Address, decimal: u32, name: String, symbol: String) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Decimals, &decimal);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::TotalSupply, &0_i128);
        env.storage().instance().set(&DataKey::Initialized, &true);

        env.events().publish(
            (Symbol::new(&env, "initialize"),),
            (admin.clone(), name, symbol, decimal),
        );
    }

    /// Mint new VAULT tokens. Only admin.
    pub fn mint(env: Env, to: Address, amount: i128) {
        check_initialized(&env);
        check_nonnegative(amount);

        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let mut balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);
        balance += amount;
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &balance);

        let mut total_supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        total_supply += amount;
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &total_supply);

        env.events()
            .publish((Symbol::new(&env, "mint"),), (to, amount));
    }

    /// Burn VAULT tokens from an address.
    pub fn burn(env: Env, from: Address, amount: i128) {
        check_initialized(&env);
        check_nonnegative(amount);
        from.require_auth();

        let mut balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(from.clone()))
            .unwrap_or(0);
        if balance < amount {
            panic!("insufficient balance to burn");
        }
        balance -= amount;
        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &balance);

        let mut total_supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        total_supply -= amount;
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &total_supply);

        env.events()
            .publish((Symbol::new(&env, "burn"),), (from, amount));
    }

    /// Transfer tokens from one address to another.
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        check_initialized(&env);
        check_nonnegative(amount);
        from.require_auth();

        let mut from_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(from.clone()))
            .unwrap_or(0);
        if from_balance < amount {
            panic!("insufficient balance");
        }
        from_balance -= amount;
        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &from_balance);

        let mut to_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);
        to_balance += amount;
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &to_balance);

        env.events()
            .publish((Symbol::new(&env, "transfer"),), (from, to, amount));
    }

    /// Get balance of an address.
    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(id))
            .unwrap_or(0)
    }

    /// Get total supply.
    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    /// Approve a spender.
    pub fn approve(
        env: Env,
        from: Address,
        spender: Address,
        amount: i128,
        expiration_ledger: u32,
    ) {
        check_initialized(&env);
        check_nonnegative(amount);
        from.require_auth();

        env.storage()
            .persistent()
            .set(&DataKey::Allowance(from.clone(), spender.clone()), &amount);

        env.events().publish(
            (Symbol::new(&env, "approve"),),
            (from, spender, amount, expiration_ledger),
        );
    }

    /// Get allowance.
    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Allowance(from, spender))
            .unwrap_or(0)
    }

    /// Transfer from using allowance.
    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        check_initialized(&env);
        check_nonnegative(amount);
        spender.require_auth();

        let mut allowance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Allowance(from.clone(), spender.clone()))
            .unwrap_or(0);
        if allowance < amount {
            panic!("insufficient allowance");
        }
        allowance -= amount;
        env.storage().persistent().set(
            &DataKey::Allowance(from.clone(), spender.clone()),
            &allowance,
        );

        let mut from_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(from.clone()))
            .unwrap_or(0);
        if from_balance < amount {
            panic!("insufficient balance");
        }
        from_balance -= amount;
        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &from_balance);

        let mut to_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);
        to_balance += amount;
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &to_balance);

        env.events().publish(
            (Symbol::new(&env, "transfer_from"),),
            (spender, from, to, amount),
        );
    }

    /// Get token name.
    pub fn name(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Name)
            .unwrap_or(String::from_str(&env, "VaultToken"))
    }

    /// Get token symbol.
    pub fn symbol(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Symbol)
            .unwrap_or(String::from_str(&env, "VAULT"))
    }

    /// Get decimals.
    pub fn decimals(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::Decimals)
            .unwrap_or(7u32)
    }
}

mod test;
