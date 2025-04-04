import React from 'react';
import { useWalletContext } from '../contexts/WalletContext';

const WalletConnection = () => {
  const {  connected, connectWallet, isLoading } = useWalletContext();

  return (
    <div className="wallet-connection">
      {!connected && (
        <button 
          className="btn btn-primary"
          onClick={connectWallet}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner mr-2"></span>
              Connecting...
            </>
          ) : (
            'Connect Wallet'
          )}
        </button>
      )}
    </div>
  );
};

export default WalletConnection;
