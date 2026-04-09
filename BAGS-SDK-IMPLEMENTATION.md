# 🚀 Bags.fm SDK Implementation - Token Launcher

## ✅ Implementasi Lengkap

Fitur launcher sekarang menggunakan **Bags.fm SDK** (`@bagsfm/bags-sdk`) untuk implementasi lengkap token launch di client-side.

## 📦 Dependencies Installed

```json
{
  "@bagsfm/bags-sdk": "latest",
  "bs58": "latest"
}
```

## 🏗️ Arsitektur

### 1. **Bags SDK Service** (`lib/bags/launcher.ts`)

Service ini menangani seluruh flow token launch:

- ✅ Create token metadata via Bags API
- ✅ Build fee claimers array (creator + recipients)
- ✅ Create fee share config with lookup tables (jika > 15 recipients)
- ✅ Create launch transaction
- ✅ Sign dan broadcast transaction via wallet

### 2. **LauncherContent Component** (Updated)

Component launcher sekarang:
- ✅ Menggunakan `launchTokenWithBagsSDK()` function
- ✅ Dynamic import untuk avoid SSR issues
- ✅ Handle wallet signing untuk semua transactions
- ✅ Support multiple fee recipients

## 🔑 Environment Variables

### Frontend `.env`

```env
# Bags.fm API Key (required)
NEXT_PUBLIC_BAGS_API_KEY=bags_prod_bxHG-iyQ5vURf8LWSagP_c63OF6aKesG4HZT0ZIKe5g

# Solana RPC URL (recommended: Helius or QuickNode)
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com?api-key=YOUR_KEY

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
```

## 📝 Flow Token Launch

### Step 1: Create Token Metadata
```typescript
const tokenInfoResponse = await sdk.tokenLaunch.createTokenInfoAndMetadata({
  imageUrl: params.imageUrl,
  name: params.name,
  symbol: params.symbol,
  description: params.description,
  twitter: params.twitterUrl,
  website: params.websiteUrl,
  telegram: params.telegramUrl,
});
```

### Step 2: Build Fee Claimers
```typescript
const feeClaimers: Array<{ user: PublicKey; userBps: number }> = [];

// Creator gets remaining percentage
const creatorBps = 10000 - recipientsBps;
feeClaimers.push({ user: wallet.publicKey, userBps: creatorBps });

// Add recipients
for (const recipient of params.recipients) {
  feeClaimers.push({
    user: new PublicKey(recipient.wallet),
    userBps: recipient.percentage * 100, // Convert to basis points
  });
}
```

### Step 3: Create Fee Share Config
```typescript
const configKey = await createFeeShareConfig(
  sdk,
  connection,
  tokenMint,
  wallet,
  feeClaimers
);
```

**Note:** Jika ada > 15 fee claimers, otomatis create lookup tables:
1. Create LUT transaction → sign → send
2. Wait 1 slot
3. Extend LUT transactions → sign → send

### Step 4: Create Launch Transaction
```typescript
const tokenLaunchTransaction = await sdk.tokenLaunch.createLaunchTransaction({
  metadataUrl: tokenInfoResponse.tokenMetadata,
  tokenMint: tokenMint,
  launchWallet: wallet.publicKey,
  initialBuyLamports: Math.floor(params.initialBuyAmountSol * LAMPORTS_PER_SOL),
  configKey: configKey,
});
```

### Step 5: Sign & Broadcast
```typescript
const signedTx = await wallet.signTransaction(tokenLaunchTransaction);
const signature = await connection.sendRawTransaction(signedTx.serialize());
await connection.confirmTransaction(signature, 'confirmed');
```

## 🎯 Features

### ✅ Supported Features

- **Token Metadata**: Name, symbol, description, image, social links
- **Fee Share Config**: Multiple recipients dengan percentage allocation
- **Initial Buy**: Optional initial buy amount (SOL)
- **Lookup Tables**: Auto-create untuk > 15 recipients
- **Wallet Signing**: Semua transactions di-sign via Phantom/Solflare/Backpack
- **Transaction Confirmation**: Wait for confirmation sebelum return

### ⚙️ Fee Configuration

- **Creator**: Otomatis dapat sisa percentage setelah recipients
- **Recipients**: Bisa tambah multiple wallets dengan percentage masing-masing
- **Total**: Harus = 100% (10000 basis points)
- **Minimum**: Creator harus dapat minimal 0% (bisa 100% ke recipients)

### 📊 Example Fee Distribution

```typescript
// Example 1: Creator gets all fees
feeClaimers = [
  { user: creatorWallet, userBps: 10000 } // 100%
]

// Example 2: Split with 2 recipients
feeClaimers = [
  { user: creatorWallet, userBps: 4000 },    // 40%
  { user: recipient1, userBps: 3000 },       // 30%
  { user: recipient2, userBps: 3000 },       // 30%
]
```

## 🧪 Testing

### Local Testing

1. Start backend:
```bash
cd bags-signal/backend
npm run dev
```

2. Start frontend:
```bash
cd bags-signal/frontend
npm run dev
```

3. Open http://localhost:3000/launcher

4. Connect Phantom wallet

5. Fill form:
   - Upload token image
   - Enter name, symbol, description
   - Add social links (optional)
   - Configure fee recipients
   - Set initial buy amount
   - Click "Launch Token"

6. Sign transactions in Phantom:
   - Fee share config transaction(s)
   - Launch transaction

### Expected Wallet Prompts

Depending on configuration, you'll see:

1. **Lookup Table Creation** (if > 15 recipients):
   - Create LUT transaction
   - Extend LUT transaction(s)

2. **Fee Share Config**:
   - Config creation transaction(s)

3. **Token Launch**:
   - Final launch transaction with initial buy

## 🔒 Security Notes

### API Key Exposure

⚠️ **IMPORTANT**: `NEXT_PUBLIC_BAGS_API_KEY` is exposed to client-side!

- Only use API keys with appropriate rate limits
- Consider implementing backend proxy for production
- Monitor API usage via Bags.fm dashboard

### Wallet Security

- All transactions require user approval via wallet
- Private keys never leave the wallet
- Transactions are signed client-side

## 🚀 Production Deployment

### Vercel Environment Variables

Add to Vercel project settings:

```env
NEXT_PUBLIC_BAGS_API_KEY=bags_prod_YOUR_KEY
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com?api-key=YOUR_KEY
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-backend.onrender.com/ws
```

### RPC Recommendations

For production, use dedicated RPC:

- **Helius**: https://helius.dev (recommended)
- **QuickNode**: https://quicknode.com
- **Alchemy**: https://alchemy.com

Public RPC (`api.mainnet-beta.solana.com`) has rate limits.

## 📚 References

- [Bags.fm SDK Documentation](https://docs.bags.fm)
- [Token Launch Guide](https://docs.bags.fm/how-to-guides/launch-token)
- [API Reference](https://docs.bags.fm/api-reference/introduction)
- [Fee Share Config](https://docs.bags.fm/api-reference/create-config)

## 🐛 Troubleshooting

### Error: "Wallet not connected"
- Ensure Phantom/Solflare is installed
- Click "Connect Wallet" button
- Approve connection in wallet popup

### Error: "Bags API key not configured"
- Check `.env` file has `NEXT_PUBLIC_BAGS_API_KEY`
- Restart Next.js dev server
- Verify API key is valid at https://dev.bags.fm

### Error: "Transaction failed"
- Check wallet has enough SOL (≥0.05 SOL recommended)
- Verify RPC endpoint is working
- Check Solana network status
- Try again with higher priority fee

### Error: "Total recipient percentage exceeds 100%"
- Sum of all recipient percentages must be ≤ 100%
- Creator automatically gets remaining percentage

## ✅ Success Indicators

When launch succeeds, you'll see:

```
✅ Token launched successfully!

Token: [TOKEN_MINT_ADDRESS]
Tx: [TRANSACTION_SIGNATURE]

https://solscan.io/tx/[SIGNATURE]
```

You can then:
- View token on Solscan
- Trade on Bags.fm: `https://bags.fm/[TOKEN_MINT]`
- Share with community

## 🎉 Next Steps

After successful launch:

1. **Verify on Solscan**: Check token metadata, supply, etc.
2. **Test Trading**: Buy/sell on Bags.fm
3. **Monitor Fees**: Track fee accumulation in Portfolio
4. **Claim Fees**: Use fee claiming feature when ready

---

**Status**: ✅ READY FOR PRODUCTION

**Last Updated**: 2026-04-09
