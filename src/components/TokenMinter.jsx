import React, { useState, useEffect } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { mintTokens, fetchWalletTokens } from '../utils/tokenUtils';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

const TokenMinter = () => {
  const { connected, connection, publicKey, addTransaction } = useWalletContext();
  const [selectedToken, setSelectedToken] = useState('');
  const [mintAmount, setMintAmount] = useState(1000);
  const [isMinting, setIsMinting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  
  // Fetch user's tokens for which they are mint authority
  useEffect(() => {
    const fetchUserTokens = async () => {
      if (!connected || !publicKey) return;
      
      try {
        setIsLoading(true);
        const walletTokens = await fetchWalletTokens(connection, publicKey);
        
        // Filter for tokens where the user is the mint authority
        const filteredTokens = [];
        for (const token of walletTokens) {
          try {
            const mintInfo = await connection.getParsedAccountInfo(new PublicKey(token.mint));
            const data = mintInfo.value.data.parsed.info;
            
            if (data.mintAuthority === publicKey.toString()) {
              filteredTokens.push(token);
            }
          } catch (error) {
            console.error('Error checking mint authority:', error);
          }
        }
        
        setTokens(filteredTokens);
        
        // Select the first token by default if available
        if (filteredTokens.length > 0 && !selectedToken) {
          setSelectedToken(filteredTokens[0].mint);
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
        toast.error('Failed to fetch your tokens');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserTokens();
  }, [connected, publicKey, connection]);
  
  const handleMintTokens = async (e) => {
    e.preventDefault();
    
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!selectedToken) {
      toast.error('Please select a token to mint');
      return;
    }
    
    if (mintAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    try {
      setIsMinting(true);
      
      const wallet = window.solana;
      const result = await mintTokens(connection, wallet, selectedToken, mintAmount);
      
      if (result.success) {
        toast.success(result.message);
        
        // Add to transaction history
        addTransaction({
          type: 'Token Minting',
          timestamp: new Date().toISOString(),
          details: {
            tokenMint: selectedToken,
            amount: mintAmount,
            signature: result.signature,
            explorerUrl: result.explorerUrl
          }
        });
        
        // Reset form
        setMintAmount(1000);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error minting tokens:', error);
      toast.error('Failed to mint tokens: ' + error.message);
    } finally {
      setIsMinting(false);
    }
  };
  
  return (
    <div className="token-minter">
      <h2 className="card-title">Mint Tokens</h2>
      
      {!connected ? (
        <div className="notification notification-warning">
          Please connect your wallet to mint tokens
        </div>
      ) : isLoading ? (
        <div className="loading-state">
          <LoadingSpinner />
          <p>Loading your tokens...</p>
        </div>
      ) : tokens.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🪙</div>
          <p>You don't have any tokens for which you are the mint authority.</p>
          <p>Create a token first to start minting.</p>
        </div>
      ) : (
        <form onSubmit={handleMintTokens}>
          <div className="input-group">
            <label htmlFor="token-select">Select Token</label>
            <select
              id="token-select"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              required
            >
              <option value="">-- Select a token --</option>
              {tokens.map((token) => (
                <option key={token.mint} value={token.mint}>
                  {token.mint.slice(0, 8)}...{token.mint.slice(-8)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="input-group">
            <label htmlFor="mint-amount">Amount to Mint</label>
            <input
              id="mint-amount"
              type="number"
              min="1"
              value={mintAmount}
              onChange={(e) => setMintAmount(parseFloat(e.target.value))}
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isMinting || !connected || tokens.length === 0}
          >
            {isMinting ? (
              <>
                <span className="loading-spinner mr-2"></span>
                Minting...
              </>
            ) : (
              'Mint Tokens'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default TokenMinter;
