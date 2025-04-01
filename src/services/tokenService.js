import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  TOKEN_PROGRAM_ID,
  getMint,
  getAccount
} from '@solana/spl-token';

// Devnet connection
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Create a new token
export const createToken = async (
  wallet,
  decimals = 9
) => {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    // Create a new account for the mint
    const mintAuthority = wallet.publicKey;
    const freezeAuthority = wallet.publicKey;
    
    // Note: This is a workaround for the wallet adapter
    // In a real implementation, you would not use a new keypair but would use the user's wallet
    // to sign the transaction
    const mintKeypair = Keypair.generate();
    
    // Create the token mint
    const createMintTx = await createMint(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      mintAuthority,
      freezeAuthority,
      decimals,
      mintKeypair
    );

    return {
      tokenAddress: mintKeypair.publicKey.toString(),
      signature: createMintTx
    };
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
};

// Mint tokens to a wallet
export const mintTokens = async (
  wallet,
  tokenAddress,
  amount
) => {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    const mintPublicKey = new PublicKey(tokenAddress);
    
    // Get or create the associated token account for the recipient
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      mintPublicKey,
      wallet.publicKey
    );

    // Get the mint info to find out the decimals
    const mintInfo = await getMint(connection, mintPublicKey);
    
    // Convert amount to the correct decimals
    const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

    // Mint tokens to the recipient's token account
    const signature = await mintTo(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      mintPublicKey,
      tokenAccount.address,
      wallet.publicKey, // Mint authority
      adjustedAmount
    );

    return { signature };
  } catch (error) {
    console.error('Error minting tokens:', error);
    throw error;
  }
};

// Send tokens to another wallet
export const sendTokens = async (
  wallet,
  tokenAddress,
  recipientAddress,
  amount
) => {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    const mintPublicKey = new PublicKey(tokenAddress);
    const recipientPublicKey = new PublicKey(recipientAddress);
    
    // Get or create the sender's token account
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      mintPublicKey,
      wallet.publicKey
    );
    
    // Get or create the recipient's token account
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      mintPublicKey,
      recipientPublicKey
    );
    
    // Get the mint info to find out the decimals
    const mintInfo = await getMint(connection, mintPublicKey);
    
    // Convert amount to the correct decimals
    const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);
    
    // Transfer tokens
    const signature = await transfer(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      senderTokenAccount.address,
      recipientTokenAccount.address,
      wallet.publicKey,
      adjustedAmount
    );

    return { signature };
  } catch (error) {
    console.error('Error sending tokens:', error);
    throw error;
  }
};

// Get token balance
export const getTokenBalance = async (
  wallet,
  tokenAddress
) => {
  try {
    const mintPublicKey = new PublicKey(tokenAddress);
    
    // Find the associated token account address
    const tokenAccountAddress = await getOrCreateAssociatedTokenAccount(
      connection,
      {publicKey: wallet}, // This is a hack for the function signature
      mintPublicKey,
      wallet
    );
    
    // Get account info
    const accountInfo = await getAccount(connection, tokenAccountAddress.address);
    
    // Get mint info to get decimals
    const mintInfo = await getMint(connection, mintPublicKey);
    
    // Convert to actual token amount based on decimals
    return Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0; // Return 0 if there's an error or the account doesn't exist
  }
};