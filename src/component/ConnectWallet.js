import React, {useEffect} from 'react';
import { useNavigate } from "react-router-dom";

import {connectWalletHandler,isWalletConnected} from '../common/utils';

const ConnectWallet = () => {
    let navigate = useNavigate();

    useEffect(()=>{
        if(isWalletConnected()) {
            navigate('/',{ replace: true })
        }
    },[])

    return (
        <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
            Connect Wallet
        </button>
    )
}

export  default  ConnectWallet;
