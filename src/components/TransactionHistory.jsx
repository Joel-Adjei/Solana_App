import React from 'react';
import { useWalletContext } from '../contexts/WalletContext';

const TransactionHistory = () => {
  const { connected, transactions } = useWalletContext();
  
  if (!connected) {
    return (
      <div className="transaction-history">
        <h2 className="card-title">Transaction History</h2>
        <div className="notification notification-warning">
          Please connect your wallet to view transaction history
        </div>
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <div className="transaction-history">
        <h2 className="card-title">Transaction History</h2>
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <p>No transactions yet.</p>
          <p>Create, mint, or send tokens to see your transaction history.</p>
        </div>
      </div>
    );
  }
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <div className="transaction-history">
      <h2 className="card-title">Transaction History</h2>
      
      <div className="transaction-list">
        {transactions.map((tx, index) => (
          <div key={index} className="transaction-item">
            <div className="transaction-type">{tx.type}</div>
            
            <div className="transaction-details">
              {tx.type === 'Token Creation' && (
                <>
                  <div>Token Name: {tx.details.tokenName}</div>
                  <div>Token Symbol: {tx.details.tokenSymbol}</div>
                  <div>Token Mint: {tx.details.tokenMint.slice(0, 8)}...{tx.details.tokenMint.slice(-8)}</div>
                </>
              )}
              
              {tx.type === 'Token Minting' && (
                <>
                  <div>Token Mint: {tx.details.tokenMint.slice(0, 8)}...{tx.details.tokenMint.slice(-8)}</div>
                  <div>Amount: {tx.details.amount}</div>
                </>
              )}
              
              {tx.type === 'Token Transfer' && (
                <>
                  <div>Token Mint: {tx.details.tokenMint.slice(0, 8)}...{tx.details.tokenMint.slice(-8)}</div>
                  <div>Amount: {tx.details.amount}</div>
                  <div>Recipient: {tx.details.recipient.slice(0, 8)}...{tx.details.recipient.slice(-8)}</div>
                </>
              )}
            </div>
            
            <div className="transaction-date">
              {formatDate(tx.timestamp)}
            </div>
            
            {tx.details.explorerUrl && (
              <a
                href={tx.details.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transaction-link"
              >
                View on Explorer
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
