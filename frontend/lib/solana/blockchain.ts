import { Connection, PublicKey } from '@solana/web3.js'

// Solana RPC endpoint
const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com'

/**
 * Get transaction details from signature
 */
export async function getTransactionDetails(signature: string) {
  try {
    const connection = new Connection(RPC_ENDPOINT, 'confirmed')
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    })
    
    if (!tx) {
      return null
    }
    
    return {
      blockTime: tx.blockTime,
      slot: tx.slot,
      signatures: tx.transaction.signatures,
    }
  } catch (error) {
    console.error('[blockchain] Failed to get transaction:', error)
    return null
  }
}

/**
 * Get creator wallet from launch signature
 */
export async function getCreatorFromSignature(signature: string): Promise<string | null> {
  try {
    const details = await getTransactionDetails(signature)
    if (!details || !details.signatures || details.signatures.length === 0) {
      return null
    }
    
    // First signature is usually the creator/signer
    return details.signatures[0]
  } catch (error) {
    console.error('[blockchain] Failed to get creator:', error)
    return null
  }
}

/**
 * Get launch time from signature
 */
export async function getLaunchTimeFromSignature(signature: string): Promise<string | null> {
  try {
    const details = await getTransactionDetails(signature)
    if (!details || !details.blockTime) {
      return null
    }
    
    // Convert Unix timestamp to ISO string
    return new Date(details.blockTime * 1000).toISOString()
  } catch (error) {
    console.error('[blockchain] Failed to get launch time:', error)
    return null
  }
}

/**
 * Batch fetch transaction details for multiple signatures
 */
export async function batchGetTransactionDetails(signatures: string[]) {
  const results = new Map<string, { creator: string | null; launchTime: string | null }>()
  
  // Process in batches to avoid rate limiting
  const BATCH_SIZE = 10
  for (let i = 0; i < signatures.length; i += BATCH_SIZE) {
    const batch = signatures.slice(i, i + BATCH_SIZE)
    
    await Promise.all(
      batch.map(async (sig) => {
        try {
          const [creator, launchTime] = await Promise.all([
            getCreatorFromSignature(sig),
            getLaunchTimeFromSignature(sig),
          ])
          
          results.set(sig, { creator, launchTime })
        } catch (error) {
          console.error(`[blockchain] Failed to process signature ${sig}:`, error)
          results.set(sig, { creator: null, launchTime: null })
        }
      })
    )
    
    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < signatures.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
  
  return results
}
