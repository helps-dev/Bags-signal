import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

/**
 * Sign and send a transaction using the connected wallet
 */
export async function signAndSendTransaction(
  wallet: WalletContextState,
  transaction: any, // Use any to avoid type conflicts between different @solana/web3.js versions
  connection: Connection
): Promise<TransactionResult> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    // Sign the transaction
    const signedTx = await wallet.signTransaction(transaction);

    // Send the transaction
    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      }
    );

    // Confirm the transaction
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    return {
      signature,
      success: true,
    };
  } catch (error) {
    console.error('Transaction error:', error);
    return {
      signature: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get transaction from backend API and sign it
 */
export async function executeBackendTransaction(
  wallet: WalletContextState,
  apiEndpoint: string,
  payload: any,
  rpcUrl: string = 'https://mainnet.helius-rpc.com?api-key=c52abbc9-2158-4ff1-8960-b8dcb7b02b1e'
): Promise<TransactionResult> {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Get transaction from backend
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        walletAddress: wallet.publicKey.toBase58(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get transaction from backend');
    }

    const data = await response.json();

    // Check if backend returned a transaction
    if (!data.transaction) {
      throw new Error('No transaction returned from backend');
    }

    // Deserialize transaction
    const txBuffer = Buffer.from(data.transaction, 'base64');
    const transaction = VersionedTransaction.deserialize(txBuffer);

    // Create connection
    const connection = new Connection(rpcUrl, 'confirmed');

    // Sign and send
    return await signAndSendTransaction(wallet, transaction, connection);
  } catch (error) {
    console.error('Backend transaction error:', error);
    return {
      signature: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
