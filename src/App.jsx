import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import './App.css';
import WalletConnection from './components/WalletConnection';
import UserActions from './components/UserActions'
import { WalletProvider, useWalletContext } from './contexts/WalletContext';

function App() {
  const {connected} = useWalletContext();


  return (
    <WalletProvider>

      <div className="app-container">
          { !connected ? <>
        <header className=".header" >
          <div className="icon"></div>
          <h1>Solana Token Manager</h1>
          <p>Connect your Solana wallet to interact with the application</p>
          <WalletConnection />
        </header>
          </>
         : <UserActions />
        }
        
        <footer>
          <p>Solana Token Manager</p>
        </footer>
        
        <ToastContainer position="bottom-right" />
      </div>

    </WalletProvider>
  );
}

export default App;
