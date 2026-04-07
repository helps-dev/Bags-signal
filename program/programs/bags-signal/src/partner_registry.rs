use anchor_lang::prelude::*;

/// PartnerRegistry - On-chain partner tracking
/// Stores mapping: partner_wallet -> [referred_tokens]

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + PartnerRegistry::SIZE,
        seeds = [b"partner_registry"],
        bump
    )]
    pub registry: Account<'info, PartnerRegistry>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterReferral<'info> {
    #[account(
        mut,
        seeds = [b"partner_registry"],
        bump
    )]
    pub registry: Account<'info, PartnerRegistry>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + PartnerRecord::SIZE,
        seeds = [b"partner", partner_wallet.key().as_ref()],
        bump
    )]
    pub partner_record: Account<'info, PartnerRecord>,
    /// CHECK: Partner wallet being registered
    pub partner_wallet: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterPartner<'info> {
    #[account(
        mut,
        seeds = [b"partner_registry"],
        bump,
        constraint = registry.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub registry: Account<'info, PartnerRegistry>,
    #[account(
        init,
        payer = authority,
        space = 8 + PartnerRecord::SIZE,
        seeds = [b"partner", partner_wallet.key().as_ref()],
        bump
    )]
    pub partner_record: Account<'info, PartnerRecord>,
    /// CHECK: Partner wallet to register
    pub partner_wallet: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct PartnerRegistry {
    pub authority: Pubkey,
    pub partner_count: u32,
    pub total_referrals: u32,
}

#[account]
pub struct PartnerRecord {
    pub partner_wallet: Pubkey,
    pub registration_time: i64,
    pub referral_count: u32,
    pub referred_tokens: Vec<Pubkey>,
}

impl PartnerRegistry {
    pub const SIZE: usize = 32 + 4 + 4;
}

impl PartnerRecord {
    pub const SIZE: usize = 32 + 8 + 4 + (4 + 10 * 32); // Vec with 10 token refs
}

pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
    let registry = &mut ctx.accounts.registry;
    registry.authority = ctx.accounts.authority.key();
    registry.partner_count = 0;
    registry.total_referrals = 0;
    
    msg!("PartnerRegistry initialized");
    Ok(())
}

pub fn register_referral(
    ctx: Context<RegisterReferral>,
    token_mint: Pubkey,
) -> Result<()> {
    let record = &mut ctx.accounts.partner_record;
    let registry = &mut ctx.accounts.registry;
    
    // Add token to partner's referrals
    if !record.referred_tokens.contains(&token_mint) {
        record.referred_tokens.push(token_mint);
        record.referral_count += 1;
        registry.total_referrals += 1;
    }
    
    msg!(
        "Registered referral: {} for partner: {}",
        token_mint,
        record.partner_wallet
    );
    
    Ok(())
}

pub fn register_partner(
    ctx: Context<RegisterPartner>,
    partner_wallet: Pubkey,
) -> Result<()> {
    let record = &mut ctx.accounts.partner_record;
    let registry = &mut ctx.accounts.registry;
    
    record.partner_wallet = partner_wallet;
    record.registration_time = Clock::get()?.unix_timestamp;
    record.referral_count = 0;
    record.referred_tokens = Vec::new();
    
    registry.partner_count += 1;
    
    msg!("Registered new partner: {}", partner_wallet);
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Partner already registered")]
    AlreadyRegistered,
    #[msg("Registry full")]
    RegistryFull,
}
