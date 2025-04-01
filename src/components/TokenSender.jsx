import React, { useState, useEffect } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { sendTokens, fetchWalletTokens } from '../utils/tokenUtils';
import { isValidPublicKey } from '../utils/solanaUtils';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

const TokenSender = () => {
  const { connected, connection, publicKey, addTransaction } = useWalletContext();
  const [selectedToken, setSelectedToken] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState(100);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  
  // Fetch user's tokens
  useEffect(() => {
    const fetchUserTokens = async () => {
      if (!connected || !publicKey) return;
      
      try {
        setIsLoading(true);
        const walletTokens = await fetchWalletTokens(connection, publicKey);
        
        // Filter for tokens with positive balance
        const filteredTokens = walletTokens.filter(token => token.balance > 0);
        setTokens(filteredTokens);
        
        // Select the first token by default if available
        if (filteredTokens.length > 0 && !selectedToken) {
          setSelectedToken(filteredTokens[0].mint);
          setSelectedTokenBalance(filteredTokens[0].balance);
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
  
  // Update selected token balance when selection changes
  useEffect(() => {
    if (selectedToken) {
      const token = tokens.find(t => t.mint === selectedToken);
      if (token) {
        setSelectedTokenBalance(token.balance);
      }
    }
  }, [selectedToken, tokens]);
  
  const handleSendTokens = async (e) => {
    e.preventDefault();
    
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!selectedToken) {
      toast.error('Please select a token to send');
      return;
    }
    
    if (!isValidPublicKey(recipientAddress)) {
      toast.error('Please enter a valid Solana address');
      return;
    }
    
    if (sendAmount <= 0 || sendAmount > selectedTokenBalance) {
      toast.error(`Please enter a valid amount (max: ${selectedTokenBalance})`);
      return;
    }
    
    try {
      setIsSending(true);
      
      const wallet = window.solana;
      const result = await sendTokens(connection, wallet, selectedToken, recipientAddress, sendAmount);
      
      if (result.success) {
        toast.success(result.message);
        
        // Add to transaction history
        addTransaction({
          type: 'Token Transfer',
          timestamp: new Date().toISOString(),
          details: {
            tokenMint: selectedToken,
            amount: sendAmount,
            recipient: recipientAddress,
            signature: result.signature,
            explorerUrl: result.explorerUrl
          }
        });
        
        // Reset form
        setRecipientAddress('');
        setSendAmount(100);
        
        // Refresh token list to update balances
        setIsLoading(true);
        const walletTokens = await fetchWalletTokens(connection, publicKey);
        const filteredTokens = walletTokens.filter(token => token.balance > 0);
        setTokens(filteredTokens);
        setIsLoading(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error sending tokens:', error);
      toast.error('Failed to send tokens: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="token-sender">
      <h2 className="card-title">Send Tokens</h2>
      
      {!connected ? (
        <div className="notification notification-warning">
          Please connect your wallet to send tokens
        </div>
      ) : isLoading ? (
        <div className="loading-state">
          <LoadingSpinner />
          <p>Loading your tokens...</p>
        </div>
      ) : tokens.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🪙</div>
          <p>You don't have any tokens to send.</p>
          <p>Mint some tokens first or receive tokens from others.</p>
        </div>
      ) : (
        <form onSubmit={handleSendTokens}>
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
                  {token.mint.slice(0, 8)}...{token.mint.slice(-8)} ({token.balance})
                </option>
              ))}
            </select>
          </div>
          
          <div className="input-group">
            <label htmlFor="recipient-address">Recipient Address</label>
            <input
              id="recipient-address"
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Solana wallet address"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="send-amount">
              Amount to Send (Max: {selectedTokenBalance})
            </label>
            <input
              id="send-amount"
              type="number"
              min="0.000001"
              max={selectedTokenBalance}
              value={sendAmount}
              onChange={(e) => setSendAmount(parseFloat(e.target.value))}
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSending || !connected || tokens.length === 0}
          >
            {isSending ? (
              <>
                <span className="loading-spinner mr-2"></span>
                Sending...
              </>
            ) : (
              'Send Tokens'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default TokenSender;
