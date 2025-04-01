import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SolanaWalletProviderWrapper, WalletContextProvider } from './contexts/WalletContext';
import { WalletProvider } from './contexts/WalletContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WalletProvider>
        <App />
    </WalletProvider>
  </React.StrictMode>
);
