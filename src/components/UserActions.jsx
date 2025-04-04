import React, {useState} from "react";
import {useWalletContext} from "../contexts/WalletContext";
import "../styles/mainSection.css"

import TokenCreator from "./TokenCreator";
import TokenMinter from "./TokenMinter";
import TokenSender from "./TokenSender";
import Navbar from "./Navbar";

import {formatPublicKey} from "../utils/solanaUtils";

const UserActions = ()=>{
    const {publicKey, walletBalance , disconnectWallet , isLoading } = useWalletContext()
    const [activeTab, setActiveTab] = useState('create');

    return(<>
        <Navbar />
        <div className="wallet-info">
            <div className="wallet-address" title={publicKey?.toString()}>
                {formatPublicKey(publicKey?.toString())};dd
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
                {activeTab === 'create' && <TokenCreator/>}
                {activeTab === 'mint' && <TokenMinter/>}
                {activeTab === 'send' && <TokenSender/>}
            </div>

        </main>
    </>)
}

export default UserActions;