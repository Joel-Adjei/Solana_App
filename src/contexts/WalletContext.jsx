import React, { createContext, useContext, useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider as SolanaWalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { toast } from 'react-toastify';

// Create the wallet context
const WalletContext = createContext();

// Custom hook for accessing the wallet context
export const useWalletContext = () => useContext(WalletContext);

// Solana connection config
const network = clusterApiUrl('devnet');
const connection = new Connection(network, 'confirmed');

export const WalletContextProvider = ({ children }) => {
  // Get wallet data from Solana adapter
  const { publicKey, connected, connect, disconnect, wallet, select, wallets } = useWallet();
  
  // Component state
  const [walletBalance, setWalletBalance] = useState(0);
  const [tokenAccounts, setTokenAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  
  // Initialize wallet adapters
  useEffect(() => {
    if (!wallet) {
      // Default to Phantom if available
      const phantomWallet = wallets.find(w => w.adapter.name === 'Phantom');
      if (phantomWallet) {
        select(phantomWallet.adapter.name);
      }
    }
  }, [wallet, wallets, select]);
  
  // Fetch SOL balance when connected
  useEffect(() => {
    const getWalletBalance = async () => {
      if (connected && publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          setWalletBalance(balance / 10**9); // Convert lamports to SOL
        } catch (error) {
          console.error('Error fetching balance:', error);
          toast.error('Failed to fetch wallet balance');
        }
      }
    };
    
    getWalletBalance();
    // Set up interval to refresh balance
    const intervalId = setInterval(getWalletBalance, 30000);

    
    return () => clearInterval(intervalId);
  }, [connected, publicKey]);
  
  // Fetch token accounts when connected
  useEffect(() => {
    const getTokenAccounts = async () => {
      if (connected && publicKey) {
        try {
          setIsLoading(true);
          
          // Fetch token accounts owned by the wallet
          const tokenAccountsResponse = await connection.getParsedTokenAccountsByOwner(
            publicKey,
            { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
          );
          
          const accounts = tokenAccountsResponse.value.map(accountInfo => {
            const parsedInfo = accountInfo.account.data.parsed.info;
            const mintAddress = parsedInfo.mint;
            const tokenBalance = parsedInfo.tokenAmount.uiAmount;
            
            return {
              mint: mintAddress,
              balance: tokenBalance,
              address: accountInfo.pubkey.toString()
            };
          });
          
          setTokenAccounts(accounts);
        } catch (error) {
          console.error('Error fetching token accounts:', error);
          toast.error('Failed to fetch token accounts');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    getTokenAccounts();
    // Set up interval to refresh token accounts
    const intervalId = setInterval(()=> getTokenAccounts, 30000);
    
    return () => clearInterval(intervalId);
  }, [connected, publicKey]);
  
  // Add transaction to history
  const addTransaction = (txData) => {
    setTransactions(prev => [txData, ...prev]);
  };
  
  // Handle connect wallet
  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection error:', error);
      toast.error(`Failed to connect wallet: ${error.message}`);
    }
  };
  
  // Handle disconnect wallet
  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
      setWalletBalance(0);
      setTokenAccounts([]);
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error(`Failed to disconnect wallet: ${error.message}`);
    }
  };
  
  // Value object to be provided by the context
  const value = {
    publicKey,
    connected,
    connectWallet: handleConnectWallet,
    disconnectWallet: handleDisconnectWallet,
    walletBalance,
    tokenAccounts,
    connection,
    isLoading,
    transactions,
    addTransaction
  };
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Wrapper component that provides Solana wallet adapter
export const SolanaWalletProviderWrapper = ({ children }) => {
  // Configure wallets
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter()
  ];
  
  return (
    <ConnectionProvider endpoint={network}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

// Export the complete provider that wraps both contexts
export const WalletProvider = ({ children }) => (
  <SolanaWalletProviderWrapper>
    <WalletContextProvider>
      {children}
    </WalletContextProvider>
  </SolanaWalletProviderWrapper>
);
