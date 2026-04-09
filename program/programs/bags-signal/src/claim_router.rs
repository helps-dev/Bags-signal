use anchor_lang::prelude::*;

/// ClaimRouter - Automates fee claiming and distribution
/// PDA stores: token_mint, fee_claimer_vault, min_claim_threshold

#[derive(Accounts)]
pub struct InitializeClaimRouter<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + ClaimRouterState::SIZE,
        seeds = [b"claim_router", token_mint.key().as_ref()],
        bump
    )]
    pub claim_router: Account<'info, ClaimRouterState>,
    pub token_mint: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimAndDistribute<'info> {
    #[account(
        mut,
        seeds = [b"claim_router", token_mint.key().as_ref()],
        bump,
        constraint = claim_router.accumulated_fees >= claim_router.min_claim_threshold @ ErrorCode::BelowMinThreshold
    )]
    pub claim_router: Account<'info, ClaimRouterState>,
    pub token_mint: AccountInfo<'info>,
    #[account(mut)]
    pub fee_claimer_vault: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateThreshold<'info> {
    #[account(
        mut,
        seeds = [b"claim_router", claim_router.token_mint.as_ref()],
        bump,
        constraint = claim_router.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub claim_router: Account<'info, ClaimRouterState>,
    pub authority: Signer<'info>,
}

#[account]
pub struct ClaimRouterState {
    pub token_mint: Pubkey,
    pub fee_claimer_vault: Pubkey,
    pub min_claim_threshold: u64,
    pub accumulated_fees: u64,
    pub authority: Pubkey,
    pub recipient_count: u8,
    pub recipients: Vec<Recipient>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct Recipient {
    pub wallet: Pubkey,
    pub percentage: u8,
}

impl ClaimRouterState {
    pub const SIZE: usize = 32 + 32 + 8 + 8 + 32 + 1 + (4 + 10 * 33); // Vec serialization overhead
}

pub fn initialize_claim_router(
    ctx: Context<InitializeClaimRouter>,
    min_claim_threshold: u64,
) -> Result<()> {
    let router = &mut ctx.accounts.claim_router;
    router.token_mint = ctx.accounts.token_mint.key();
    router.min_claim_threshold = min_claim_threshold;
    router.accumulated_fees = 0;
    router.authority = ctx.accounts.authority.key();
    router.recipient_count = 0;
    router.recipients = Vec::new();
    
    msg!("ClaimRouter initialized for mint: {}", router.token_mint);
    Ok(())
}

pub fn claim_and_distribute(ctx: Context<ClaimAndDistribute>) -> Result<()> {
    let router = &ctx.accounts.claim_router;
    
    // Verify accumulated fees meet threshold
    require!(
        router.accumulated_fees >= router.min_claim_threshold,
        ErrorCode::BelowMinThreshold
    );
    
    // In production, this would call Bags fee claim CPI
    // Then distribute to recipients atomically
    
    msg!(
        "Claimed {} fees for mint: {}",
        router.accumulated_fees,
        router.token_mint
    );
    
    // Reset accumulated fees after claim
    let router_mut = &mut ctx.accounts.claim_router;
    router_mut.accumulated_fees = 0;
    
    Ok(())
}

pub fn update_threshold(ctx: Context<UpdateThreshold>, new_threshold: u64) -> Result<()> {
    let router = &mut ctx.accounts.claim_router;
    router.min_claim_threshold = new_threshold;
    msg!("Updated threshold to: {}", new_threshold);
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Accumulated fees below minimum threshold")]
    BelowMinThreshold,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid recipient percentage")]
    InvalidPercentage,
}
