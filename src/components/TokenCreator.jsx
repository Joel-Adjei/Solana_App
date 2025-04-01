import React, { useState } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { createToken } from '../utils/tokenUtils';
import { toast } from 'react-toastify';

const TokenCreator = () => {
  const { connected, connection, publicKey, addTransaction } = useWalletContext();
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState(9);
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateToken = async (e) => {
    e.preventDefault();
    
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!tokenName || !tokenSymbol) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsCreating(true);
      
      const tokenConfig = {
        name: tokenName,
        symbol: tokenSymbol,
        decimals: parseInt(tokenDecimals)
      };
      
      const wallet = window.solana;
      const result = await createToken(connection, wallet, tokenConfig);
      
      if (result.success) {
        toast.success(result.message);
        
        // Add to transaction history
        addTransaction({
          type: 'Token Creation',
          timestamp: new Date().toISOString(),
          details: {
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
            tokenMint: result.tokenInfo.mint
          }
        });
        
        // Reset form
        setTokenName('');
        setTokenSymbol('');
        setTokenDecimals(9);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error creating token:', error);
      toast.error('Failed to create token: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="token-creator">
      <h2 className="card-title">Create New Token</h2>
      
      {!connected ? (
        <div className="notification notification-warning">
          Please connect your wallet to create tokens
        </div>
      ) : (
        <form onSubmit={handleCreateToken}>
          <div className="input-group">
            <label htmlFor="token-name">Token Name</label>
            <input
              id="token-name"
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="e.g., My First Token"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="token-symbol">Token Symbol</label>
            <input
              id="token-symbol"
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              placeholder="e.g., MFT"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="token-decimals">Decimals</label>
            <input
              id="token-decimals"
              type="number"
              min="0"
              max="9"
              value={tokenDecimals}
              onChange={(e) => setTokenDecimals(e.target.value)}
              required
            />
            <small>Number of decimal places (0-9)</small>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isCreating || !connected}
          >
            {isCreating ? (
              <>
                <span className="loading-spinner mr-2"></span>
                Creating Token...
              </>
            ) : (
              'Create Token'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default TokenCreator;
