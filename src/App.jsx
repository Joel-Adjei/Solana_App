import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import WalletConnection from './components/WalletConnection';
import TokenCreator from './components/TokenCreator';
import TokenMinter from './components/TokenMinter';
import TokenSender from './components/TokenSender';
import TransactionHistory from './components/TransactionHistory';
import { WalletProvider } from './contexts/WalletContext';

function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [displayNotifi , setDisplayNotifi] = useState("none")


  return (
    <WalletProvider>
      <div className='transparent' style={{display: displayNotifi }}  ></div>
      <div style={{display: "flex", flexDirection: "row-reverse"}}>
      
      <div className='notifi-section' style={{display: displayNotifi }}>

      
        <button onClick={()=> setDisplayNotifi("none")}>Close</button>
        <TransactionHistory />
      </div>
      
      <div className="app-container">
        <header className=".header" >
        <button className={`tab  history `} onClick={() => setDisplayNotifi('flex')}>
          Transaction History
        </button> 
          <div className="icon"></div>
          <h1>Solana Token Manager</h1>
          <WalletConnection />
        </header>
        
        <main>
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              Create Token
            </button>
            <button 
              className={`tab ${activeTab === 'mint' ? 'active' : ''}`}
              onClick={() => setActiveTab('mint')}
            >
              Mint Token
            </button>
            <button 
              className={`tab ${activeTab === 'send' ? 'active' : ''}`}
              onClick={() => setActiveTab('send')}
            >
              Send Token
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'create' && <TokenCreator />}
            {activeTab === 'mint' && <TokenMinter />}
            {activeTab === 'send' && <TokenSender />}
          </div>
        </main>
        
        <footer>
          <p>Solana Token Manager</p>
        </footer>
        
        <ToastContainer position="bottom-right" />
      </div>
      </div>
    </WalletProvider>
  );
}

export default App;
