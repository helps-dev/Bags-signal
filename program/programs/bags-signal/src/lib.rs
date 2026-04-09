use anchor_lang::prelude::*;

mod claim_router;
mod partner_registry;

pub use claim_router::*;
pub use partner_registry::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod bags_signal {
    use super::*;

    // ClaimRouter instructions
    pub fn initialize_claim_router(
        ctx: Context<InitializeClaimRouter>,
        min_claim_threshold: u64,
    ) -> Result<()> {
        claim_router::initialize_claim_router(ctx, min_claim_threshold)
    }

    pub fn claim_and_distribute(ctx: Context<ClaimAndDistribute>) -> Result<()> {
        claim_router::claim_and_distribute(ctx)
    }

    pub fn update_threshold(
        ctx: Context<UpdateThreshold>,
        new_threshold: u64,
    ) -> Result<()> {
        claim_router::update_threshold(ctx, new_threshold)
    }

    // PartnerRegistry instructions
    pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
        partner_registry::initialize_registry(ctx)
    }

    pub fn register_referral(
        ctx: Context<RegisterReferral>,
        token_mint: Pubkey,
    ) -> Result<()> {
        partner_registry::register_referral(ctx, token_mint)
    }

    pub fn register_partner(
        ctx: Context<RegisterPartner>,
        partner_wallet: Pubkey,
    ) -> Result<()> {
        partner_registry::register_partner(ctx, partner_wallet)
    }
}
