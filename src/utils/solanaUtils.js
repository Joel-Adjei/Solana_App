import { 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { toast } from 'react-toastify';

/**
 * Check if a string is a valid Solana public key
 * @param {string} address - The address to validate
 * @returns {boolean} - Whether the address is valid
 */
export const isValidPublicKey = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Format a public key for display (truncate with ellipsis)
 * @param {string} address - The address to format
 * @returns {string} - The formatted address
 */
export const formatPublicKey = (address) => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

/**
 * Request an airdrop of SOL to the specified address
 * @param {Connection} connection - Solana connection object
 * @param {PublicKey} publicKey - The public key to receive SOL
 * @param {number} amount - Amount of SOL to request (default: 1)
 * @returns {Promise<string>} - Transaction signature
 */
export const requestAirdrop = async (connection, publicKey, amount = 1) => {
  try {
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );
    
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error) {
    console.error('Airdrop failed:', error);
    throw new Error(`Airdrop failed: ${error.message}`);
  }
};

/**
 * Send SOL to another address
 * @param {Connection} connection - Solana connection object
 * @param {Keypair} fromWallet - Sender's wallet
 * @param {PublicKey} toAddress - Recipient's address
 * @param {number} amount - Amount of SOL to send
 * @returns {Promise<string>} - Transaction signature
 */
export const sendSol = async (connection, fromWallet, toAddress, amount) => {
  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: new PublicKey(toAddress),
        lamports: amount * LAMPORTS_PER_SOL
      })
    );
    
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [fromWallet]
    );
    
    return signature;
  } catch (error) {
    console.error('SOL transfer failed:', error);
    throw new Error(`SOL transfer failed: ${error.message}`);
  }
};

/**
 * Get transaction URL for Solana Explorer (Devnet)
 * @param {string} signature - Transaction signature
 * @returns {string} - Explorer URL
 */
export const getExplorerUrl = (signature) => {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
};

/**
 * Handle transaction errors with appropriate user feedback
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export const handleTransactionError = (error) => {
  console.error('Transaction error:', error);
  
  // Extract the most useful part of the error message
  let errorMessage = error.message || 'Unknown error occurred';
  
  // Common error patterns and their user-friendly messages
  if (errorMessage.includes('insufficient funds')) {
    errorMessage = 'Insufficient funds for this transaction';
  } else if (errorMessage.includes('blockhash')) {
    errorMessage = 'Transaction expired. Please try again';
  } else if (errorMessage.includes('Transaction simulation failed')) {
    errorMessage = 'Transaction simulation failed. Please check your inputs';
  }
  
  toast.error(errorMessage);
  return errorMessage;
};
