import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Button,Row,Container } from 'react-bootstrap';
import {} from 'dotenv/config'

import  Contract from  './component/Contract'
import {Action_Type, Status_Type} from './common/Constant.js';

import './App.css';
import contract from './contracts/NFTCollectible.json';
import newContract from './contracts/MyNFT.json';

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [newBalance, setNewBalance] = useState(0);
  const [loading, setLoading] = useState({status:null,message:'',actionType:''});

  let nftContract = null,nftNewContract = null,isInitialized = false;

  const connectWalletHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Please install Metamask!");
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length !== 0) {
        setCurrentAccount(accounts[0]);
        initContractHandler(accounts[0])
      } else {
        console.log("No authorized account found");
      }
      // handle change account
      ethereum.on('accountsChanged', function (accounts) {
        setCurrentAccount(accounts[0]);
        initContractHandler(accounts[0])
        console.log(`Selected account changed to ${accounts[0]}`);
      });
    } catch (err) {
      console.log(err)
    }
  }

  const initContractHandler = async (curAccount) => {
     const { ethereum } = window;
    // attach provider
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    nftContract = new ethers.Contract(process.env.REACT_APP_CONTACT_ADDRESS, contract.abi, signer);
    nftNewContract = new ethers.Contract(process.env.REACT_APP_NEW_CONTACT_ADDRESS, newContract.abi, signer);
    isInitialized = true;
      // set existing contact Balance
      if(!balance){
          let obj  = await nftContract.balanceOf(curAccount);
          let ctrbalance = `${obj}`.valueOf()
          setBalance(ctrbalance)
          let newobj  = await nftNewContract.balanceOf(curAccount);
          let newctrbalance = +`${newobj}`
          setNewBalance(newctrbalance)
      }

  }
  const NftBalanceHandler = async () => {
        if (!isInitialized) {
            await initContractHandler();
        }

      let balance = await nftContract.balanceOf(currentAccount);
      let bal = +`${balance}`
      setBalance(bal)
      return bal
  }
  const mintNftHandler = async () => {
     if (!isInitialized) {
        await initContractHandler();
      }

      try{
          setLoading({status: Status_Type.PENDING, message: 'Initializing....',actionType: Action_Type.MINT})
          let nftTxn = await nftContract.mintItems(1);
          setLoading({status: Status_Type.PENDING, message: 'Processing.... Please wait',actionType: Action_Type.MINT})
          await nftTxn.wait();
          if(nftTxn.hash){
              setBalance(+balance + 1)
          }
          setLoading({status: Status_Type.SUCCESS ,message:`Minting complete please see the transiction  <a target="_blank" rel="noreferrer" href=https://ropsten.etherscan.io/tx/${nftTxn.hash}>here</a>`, actionType: Action_Type.MINT})

      }
     catch (e){
         console.log("error", e);
         setLoading({status: Status_Type.ERROR ,message:e.message, actionType: Action_Type.MINT})

     }
     };
  const NewNftMintHandler = async () => {
    if (!isInitialized) {
      await initContractHandler();
    }
    // check allow mint operation
     let valid = await canMint();
     if(valid){
         try{
             console.log("currentAccount", currentAccount);
             setLoading({status: Status_Type.PENDING, message: 'Initializing....',actionType: Action_Type.NEW_MINT})

             let nftTxn = await nftNewContract.mint(currentAccount,12, "https://ipfs.io/ipfs/Qmb7jqyJ1uAnys598ZKZZdCTQbSJ9Ke4K3Lqr4DftCFP3w")

             setLoading({status: Status_Type.PENDING, message: 'Processing.... Please wait',actionType: Action_Type.NEW_MINT})
             await nftTxn.wait();
             setLoading({status: Status_Type.SUCCESS ,message:`Minting complete please see the transiction  <a target="_blank" rel="noreferrer" href=https://ropsten.etherscan.io/tx/${nftTxn.hash}>here</a>`, actionType: Action_Type.NEW_MINT})
             if(nftTxn.hash){
                 setNewBalance(+newBalance + 1)
             }
         }  catch (e){
             console.log("error", e);
             setLoading({status: Status_Type.ERROR ,message:e.message, actionType: Action_Type.NEW_MINT})

         }
     }
      else{
        alert('maximum mint limit reached' )
     }
  }
  const NewNftBalanceHandler = async () => {
        if (!isInitialized) {
          await initContractHandler();
        }
        let balance = await nftNewContract.balanceOf(currentAccount);
        let bal = +`${balance}`
        setNewBalance(bal)
        return bal
  }
  const canMint = async ()=>{
    let allow = false;
    const url = `https://api-${process.env.REACT_APP_NETWORK}.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${process.env.REACT_APP_NEW_CONTACT_ADDRESS}&address=${currentAccount}&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=${process.env.REACT_APP_EATHERSCAN_API_KEY}`
    const response = await fetch(url);
      // waits until the request completes...
    const data  =  await response.json()
    let res = data.result.filter((item)=>{
        return item.to.toLowerCase() === currentAccount.toLowerCase() && item.from === process.env.REACT_APP_DEFAULT_SENDER
    })
    if(balance > res.length){
        allow = true;
    }
    return allow
  }

  useEffect(() => {
    connectWalletHandler();
  }, [])
    const connectWalletButton = () => {
        return (
            <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
                Connect Wallet
            </button>
        )
    }
    return (
    <div className='main-app'>
      <h1>Mint Token With Gated Functionality</h1>
        {currentAccount ?
        <>
        <h3>Selected Account:{currentAccount} </h3>
        <h4>Total tokens that can be minted for this account:{balance} </h4>
        <Container className="containerWrapper">
           {/*<Contract name={"Old Contract"} symbole={"Token (Gate)"} balance={balance} loading={loading} contactBalHandler={NftBalanceHandler} contactMintHandler={mintNftHandler} actionType={Action_Type.MINT} CONTACT_ADDRESS={process.env.REACT_APP_CONTACT_ADDRESS}></Contract>*/}
            <Contract name={"New Contract"} symbole={"Token ( Gate This Mint)"} balance={newBalance} loading={loading} contactBalHandler={NewNftBalanceHandler} contactMintHandler={NewNftMintHandler} actionType={Action_Type.NEW_MINT} CONTACT_ADDRESS={process.env.REACT_APP_NEW_CONTACT_ADDRESS}></Contract>
        </Container>
        </> :connectWalletButton()}
    </div>
  )
}

export default App;
