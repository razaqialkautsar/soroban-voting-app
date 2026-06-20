#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, String, Symbol, Vec};

const POLL_DATA: Symbol = symbol_short!("POLL_DATA");

#[contracttype]
#[derive(Clone)]
pub struct Poll {
    pub id: u64,
    pub question: String,
    pub option_a: String,
    pub option_b: String,
    pub votes_a: u64,
    pub votes_b: u64,
}

#[contract]
pub struct VotingContract;

#[contractimpl]
impl VotingContract {
    pub fn get_polls(env: Env) -> Vec<Poll> {
        env.storage()
            .instance()
            .get(&POLL_DATA)
            .unwrap_or(Vec::new(&env))
    }

    pub fn create_poll(
        env: Env,
        question: String,
        option_a: String,
        option_b: String,
    ) -> String {
        let mut polls = Self::get_polls(env.clone());
        let mut next_id = 1u64;

        for poll in polls.iter() {
            if poll.id >= next_id {
                next_id = poll.id + 1;
            }
        }

        let poll = Poll {
            id: next_id,
            question,
            option_a,
            option_b,
            votes_a: 0,
            votes_b: 0,
        };

        polls.push_back(poll);
        env.storage().instance().set(&POLL_DATA, &polls);

        String::from_str(&env, "Poll created")
    }

    pub fn vote_poll(env: Env, id: u64, choice: u32) -> String {
        if choice != 1 && choice != 2 {
            return String::from_str(&env, "Invalid choice");
        }

        let mut polls = Self::get_polls(env.clone());
        let mut index = 0u32;

        while index < polls.len() {
            let mut poll = polls.get(index).unwrap();

            if poll.id == id {
                if choice == 1 {
                    poll.votes_a += 1;
                }

                if choice == 2 {
                    poll.votes_b += 1;
                }

                polls.set(index, poll);
                env.storage().instance().set(&POLL_DATA, &polls);

                return String::from_str(&env, "Vote submitted");
            }

            index += 1;
        }

        String::from_str(&env, "Poll not found")
    }

    pub fn delete_poll(env: Env, id: u64) -> String {
        let mut polls = Self::get_polls(env.clone());
        let mut index = 0u32;

        while index < polls.len() {
            let poll = polls.get(index).unwrap();

            if poll.id == id {
                polls.remove(index);
                env.storage().instance().set(&POLL_DATA, &polls);

                return String::from_str(&env, "Poll deleted");
            }

            index += 1;
        }

        String::from_str(&env, "Poll not found")
    }
}
