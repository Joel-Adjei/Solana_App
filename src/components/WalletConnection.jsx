import React from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { formatPublicKey } from '../utils/solanaUtils';

const WalletConnection = () => {
  const { publicKey, connected, connectWallet, disconnectWallet, walletBalance, isLoading } = useWalletContext();

  return (
    <div className="wallet-connection">
      {!connected ? (
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
      ) : (
        <div className="wallet-info">
          <div className="wallet-address" title={publicKey?.toString()}>
            {formatPublicKey(publicKey?.toString())}
          </div>
          <div className="balance" title={`${walletBalance} SOL`}>
           Balance: <span>{walletBalance.toFixed(4)} SOL</span>
          </div>
          <button
            className="btn btn-outline"
            onClick={disconnectWallet}
            disabled={isLoading}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;
