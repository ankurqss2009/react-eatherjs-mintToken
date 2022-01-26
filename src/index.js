import React ,{useEffect,useState} from 'react';
import ReactDOM from 'react-dom';

import Home from './Home';
import  ServiceProvider from './component/ServiceProvider';
import  User from './component/User';
import  ConnectWallet from './component/ConnectWallet';
import  Header from './component/Header';

import {connectWalletHandler,isWalletConnected} from './common/utils'

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'

import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";


const App = () => {
    const [currentAccount,setCurrentAccount] = useState('');
    const [network,setNetwork] = useState('');
    useEffect(()=>{
     connectWalletHandler(setCurrentAccount,setNetwork).then(()=>{
         console.log("response");
     });
    },[]);
    return (
        <>
        <Router>
                <Header/>
                <Routes>
                    <Route exact path="/" element={!isWalletConnected() ? <Navigate to="/connect" /> : <Home/>}/>
                    <Route exact path="/user" element={!isWalletConnected() ? <Navigate to="/connect" /> : <User/>}/>
                    <Route exact path="/service-provider" element={!isWalletConnected() ? <Navigate to="/connect" /> : <ServiceProvider/>}/>
                    {!isWalletConnected() && <Route exact path="/connect" element={<ConnectWallet/>}/>}
                </Routes>
        </Router>
        </>
    );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
