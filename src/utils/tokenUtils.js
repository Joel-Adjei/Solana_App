import { 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction 
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getOrCreateAssociatedTokenAccount,
  getMint,
  createTransferInstruction
} from '@solana/spl-token';
import { toast } from 'react-toastify';
import { getExplorerUrl, handleTransactionError } from './solanaUtils';

/**
 * Create a new SPL token
 * @param {Connection} connection - Solana connection object
 * @param {Wallet} wallet - Wallet object with signTransaction method
 * @param {Object} tokenConfig - Token configuration
 * @returns {Promise<Object>} - New token information
 */
export const createToken = async (connection, wallet, tokenConfig) => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const decimals = tokenConfig.decimals || 9;
    
    // Create a new token mint
    const mintAccount = await createMint(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions
      },
      wallet.publicKey,  // mint authority
      wallet.publicKey,  // freeze authority (you can use null if not needed)
      decimals
    );
    
    // Get the token account for the wallet
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions
      },
      mintAccount,
      wallet.publicKey
    );
    
    const tokenInfo = {
      mint: mintAccount.toString(),
      tokenAccount: tokenAccount.address.toString(),
      name: tokenConfig.name,
      symbol: tokenConfig.symbol,
      decimals: decimals
    };
    
    return {
      success: true,
      tokenInfo,
      message: `Token ${tokenConfig.symbol} created successfully!`
    };
  } catch (error) {
    console.error('Token creation error:', error);
    return {
      success: false,
      error: handleTransactionError(error)
    };
  }
};

/**
 * Mint tokens to a wallet
 * @param {Connection} connection - Solana connection object
 * @param {Wallet} wallet - Wallet object with signTransaction method
 * @param {string} mintAddress - Token mint address
 * @param {number} amount - Amount to mint
 * @returns {Promise<Object>} - Transaction result
 */
export const mintTokens = async (connection, wallet, mintAddress, amount) => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // Convert mintAddress string to PublicKey
    const mintPublicKey = new PublicKey(mintAddress);
    
    // Get mint info to get decimals
    const mintInfo = await getMint(connection, mintPublicKey);
    
    // Calculate amount with decimals
    const amountToMint = amount * Math.pow(10, mintInfo.decimals);
    
    // Get associated token account for wallet
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions
      },
      mintPublicKey,
      wallet.publicKey
    );
    
    // Create mint instruction
    const transaction = new Transaction().add(
      createMintToInstruction(
        mintPublicKey,
        tokenAccount.address,
        wallet.publicKey,
        amountToMint
      )
    );
    
    // Send and confirm transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [{
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions
      }]
    );
    
    const explorerUrl = getExplorerUrl(signature);
    
    return {
      success: true,
      signature,
      explorerUrl,
      message: `Successfully minted ${amount} tokens!`
    };
  } catch (error) {
    console.error('Token minting error:', error);
    return {
      success: false,
      error: handleTransactionError(error)
    };
  }
};


 /**
 * Send tokens to another wallet
 * @param {Connection} connection - Solana connection object
 * @param {Wallet} wallet - Wallet object with signTransaction method
 * @param {string} mintAddress - Token mint address
 * @param {string} recipientAddress - Recipient wallet address
 * @param {number} amount - Amount to send
 * @returns {Promise<Object>} - Transaction result
 */
export const sendTokens = async (connection, wallet, mintAddress, recipientAddress, amount) => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // Convert addresses to PublicKey
    const mintPublicKey = new PublicKey(mintAddress);
    const recipientPublicKey = new PublicKey(recipientAddress);
    
    // Get mint info to get decimals
    const mintInfo = await getMint(connection, mintPublicKey);
    
    // Calculate amount with decimals
    const amountToSend = amount * Math.pow(10, mintInfo.decimals);
    
    // Get source token account
    const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions
      },
      mintPublicKey,
      wallet.publicKey
    );
    
    // Get destination token account
    const destinationTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      recipientPublicKey
    );
    
    // Check if the destination token account exists
    const destinationAccountInfo = await connection.getAccountInfo(destinationTokenAccount);
    
    // Create transaction
    const transaction = new Transaction();
    
    // If destination token account doesn't exist, create it
    if (!destinationAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          destinationTokenAccount,
          recipientPublicKey,
          mintPublicKey
        )
      );
    }
    
    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        sourceTokenAccount.address,
        destinationTokenAccount,
        wallet.publicKey,
        amountToSend
      )
    );
    
    // Send transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [{
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions
      }]
    );
    
    const explorerUrl = getExplorerUrl(signature);
    
    return {
      success: true,
      signature,
      explorerUrl,
      message: `Successfully sent ${amount} tokens to ${recipientAddress.slice(0, 4)}...${recipientAddress.slice(-4)}!`
    };
  } catch (error) {
    console.error('Token transfer error:', error);
    return {
      success: false,
      error: handleTransactionError(error)
    };
  }
};

/**
 * Get token metadata
 * @param {Connection} connection - Solana connection object
 * @param {string} mintAddress - Token mint address
 * @returns {Promise<Object>} - Token metadata
 */
export const getTokenMetadata = async (connection, mintAddress) => {
  try {
    const mintPublicKey = new PublicKey(mintAddress);
    const mintInfo = await getMint(connection, mintPublicKey);
    
    return {
      mint: mintAddress,
      supply: mintInfo.supply / Math.pow(10, mintInfo.decimals),
      decimals: mintInfo.decimals,
      isInitialized: mintInfo.isInitialized,
      mintAuthority: mintInfo.mintAuthority?.toString(),
      freezeAuthority: mintInfo.freezeAuthority?.toString()
    };
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
};

/**
 * Fetch all tokens in the wallet with balances
 * @param {Connection} connection - Solana connection object
 * @param {PublicKey} walletAddress - Wallet public key
 * @returns {Promise<Array>} - Array of token accounts with balances
 */
export const fetchWalletTokens = async (connection, walletAddress) => {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletAddress,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    return tokenAccounts.value.map(accountInfo => {
      const parsedInfo = accountInfo.account.data.parsed.info;
      const mintAddress = parsedInfo.mint;
      const balance = parsedInfo.tokenAmount.uiAmount;
      
      return {
        mint: mintAddress,
        balance,
        address: accountInfo.pubkey.toString(),
        decimals: parsedInfo.tokenAmount.decimals
      };
    });
  } catch (error) {
    console.error('Error fetching wallet tokens:', error);
    return [];
  }
};
