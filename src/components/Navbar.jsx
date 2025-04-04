import React, {useState} from "react";
import TransactionHistory from "./TransactionHistory";


const Navbar = ()=>{
    const [displayNotifi , setDisplayNotifi] = useState("none")
    return(
        <>
            <div className='transparent' style={{display: displayNotifi }}  ></div>

                <div className='notifi-section' style={{display: displayNotifi }}>
                    <button onClick={()=> setDisplayNotifi("none")}>Close</button>
                    <TransactionHistory />
                </div>

        <nav className="navbar">
            <h3> <img src={"./images/solana-icon.png"} /> Solana Token Manager</h3>

            <button className={` history `} onClick={() => setDisplayNotifi('flex')}>
                Transaction History
            </button>
        </nav>
        </>
    )
}

export  default Navbar;