import { useEffect, useState } from 'react';
import { Button,Row,Col,Container } from 'react-bootstrap';
import './App.css';
import contract from './contracts/NFTCollectible.json';
import newContract from './contracts/NewNFT.json';

import { ethers } from 'ethers';

//const contractAddress = "0x355638a4eCcb777794257f22f50c289d4189F245";
//Existing contract
const contractAddress = "0x0A5f4C200732Fbe6Bd7F3646cA14d03E5764d36B";
// New Contract
const newContractAddress = "0x3F1D6CB6887dF3a211Eda3d16E10f621F019aC8F";
//demo contract
//const newContractAddress = "0xa51a1d81bbe0ee06951f23e7470b5985c4bb3730";

const abi = contract.abi;

const newNFTAbi = newContract.abi;

let nftContract = null;
let nftNewContract = null;
let isInitialized = false;
//let ctrbalance = 0;

function App() {
  const  Action_Type = {MINT:'mint',NEW_MINT:'newMint',BALANCE:'balance',NEW_BALANCE:'newBalance'}
  const  Status_Type = {PENDING:'pending',SUCCESS:'success'}
  const [currentAccount, setCurrentAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [newBalance, setNewBalance] = useState(0);
  const [loading, setLoading] = useState({status:null,message:'',actionType:''});

  const connectWalletHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Please install Metamask!");
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length !== 0) {
        console.log("Found an account! Address: ", accounts[0]);
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
    console.log("calling initContractHandler");
     const { ethereum } = window;
    // attach provider
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    nftContract = new ethers.Contract(contractAddress, abi, signer);
    nftNewContract = new ethers.Contract(newContractAddress, newNFTAbi, signer);

    console.log("--isInitialized--",isInitialized)
    isInitialized = true;
    console.log("--after sInitialized--",isInitialized);
      // set existing contact Balance
      if(!balance){
          console.log("---currentAccount----",curAccount)
          let obj  = await nftContract.balanceOf(curAccount);
          let ctrbalance = `${obj}`.valueOf()
          console.log(`Balance token: ${ctrbalance}`);
          setBalance(ctrbalance)

          let newobj  = await nftNewContract.balanceOf(curAccount);
          let newctrbalance = +`${newobj}`
          console.log(`Balance token: ${newctrbalance}`);
          setNewBalance(newctrbalance)
      }

  }
  const NftBalanceHandler = async () => {
        if (!isInitialized) {
            await initContractHandler();
        }

      let balance = await nftContract.balanceOf(currentAccount);
      console.log(`Balance token: ${balance}`);
      let bal = +`${balance}`
      setBalance(bal)
      return bal
  }
  const getTransition = async () => {
    let isvalid = false;
    try {
      const { ethereum } = window;
      if (ethereum) {
        let network = 'ropsten'
        let address = newContractAddress;
        const url = `https://api-${network}.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${address}&address=0x7cF69FCC16C65976eBFAa0414e9FF7345abF23aE&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=5XZ33UXQQ7M8N1VEUIZQRRXFP12UXUF5FG`
        fetch(url)
            .then(response => response.json())
            .then(data => console.log("hiiiiii",data));

      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  }
  const mintNftHandler = async () => {
    console.log("--before sInitialized--",isInitialized)
     if (!isInitialized) {
        await initContractHandler();
      }
      console.log("Initialize mint....");
      let nftTxn = await nftContract.mintItems(1);
      setLoading({status: Status_Type.PENDING, message: 'Initialize mint....',actionType: Action_Type.MINT})
      console.log("Mining NFT... please wait");
      setLoading({status: Status_Type.PENDING, message: 'Mining NFT.... Please wait',actionType: Action_Type.MINT})

      await nftTxn.wait();
      console.log("--nftTxn--",nftTxn)
      if(nftTxn.hash){
          setBalance(+balance + 1)
      }
      setLoading({status: Status_Type.SUCCESS ,message:`Miniting complete please see the transiction  <a target="_blank" href=https://ropsten.etherscan.io/tx/${nftTxn.hash}>here</a>`, actionType: Action_Type.MINT})

      console.log(`Mined, see transaction: https://ropsten.etherscan.io/tx/${nftTxn.hash}`);
  };
  const NewNftMintHandler = async () => {
    if (!isInitialized) {
      await initContractHandler();
    }    // check allow mint operation

     let valid = await canMint();
     if(valid){
       console.log("Initialize payment");
        //let nftTxn = await nftContract.mint(5);
         setLoading({status: Status_Type.PENDING, message: 'Initialize mint....',actionType: Action_Type.NEW_MINT})

         let nftTxn = await nftNewContract.mint(1)

         console.log("Mining.. new nft. please wait");
         setLoading({status: Status_Type.PENDING, message: 'Mining NFT.... Please wait',actionType: Action_Type.NEW_MINT})
         await nftTxn.wait();
         console.log(`Mined, see transaction: https://ropsten.etherscan.io/tx/${nftTxn.hash}`);
         setLoading({status: Status_Type.SUCCESS ,message:`Miniting complete please see the transiction  <a target="_blank" href=https://ropsten.etherscan.io/tx/${nftTxn.hash}>here</a>`, actionType: Action_Type.NEW_MINT})

         if(nftTxn.hash){
           setNewBalance(+newBalance + 1)
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
        console.log("checking balance ");
        let nftTxn = await nftNewContract.balanceOf(currentAccount);
        console.log(`Balance of new token: ${nftTxn}`);
  }
  const canMint = async ()=>{
    let allow = false, network = 'ropsten',api_key =  '5XZ33UXQQ7M8N1VEUIZQRRXFP12UXUF5FG';
    let defaultSender =  '0x0000000000000000000000000000000000000000';
    const url = `https://api-${network}.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${newContractAddress}&address=${currentAccount}&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=${api_key}`
    const response = await fetch(url);
      // waits until the request completes...
    const data  =  await response.json()
    let res = data.result.filter((item)=>{
        return item.to.toLowerCase() == currentAccount.toLowerCase() && item.from == defaultSender
    })
    if(balance > res.length){
        allow = true;
    }
    return allow
  }
  const transferToken = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        //provider.getTransaction()
        const signer = provider.getSigner();

        console.log("---signer---",signer)
        const nftContract = new ethers.Contract(newContractAddress, newNFTAbi, signer);

        console.log("Initialize transfer");
        let toAdr = '0x71F6Eb751089dadFEc2bCB8d88b9DC641EaDE367';
        let tokenId= 30;
        let nftTxn = await nftContract.symbol();
        console.log("transfer going on ... please wait");
        console.log("transfer done");
        console.log(`Transfer of new token: ${nftTxn}`);
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
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
        <Container className="containerWrapper">
            <h4>Old Contract : <a target='_blank' href={`https://ropsten.etherscan.io/address/${contractAddress}`}>{contractAddress}</a></h4>
            <h4>Token (Gate): <a target='_blank' href={`https://ropsten.etherscan.io/token/${contractAddress}`}>{contractAddress}</a></h4>

            <div><span><b>Current Balance :</b> {balance}</span></div>
            <Row className="customRow align-items-center justify-content-center" >
                {loading.actionType === Action_Type.MINT && loading.message ? <span dangerouslySetInnerHTML={{__html: loading.message}}></span>:''}
                <Button size="lg" disabled={loading.actionType === Action_Type.MINT && loading.status == Status_Type.PENDING} variant="primary" onClick={mintNftHandler} > Mint NFT</Button>
                <Button size="lg" variant="primary" onClick={NftBalanceHandler}>Check Balance</Button>
            </Row >
            <h4>New Contract : <a  target='_blank' href={`https://ropsten.etherscan.io/address/${newContractAddress}`}>{newContractAddress}</a></h4>
            <h4>Token ( Gate This Mint): <a target='_blank' href={`https://ropsten.etherscan.io/token/${newContractAddress}`}>{newContractAddress}</a></h4>

            <div><span><b>Current Balance :</b>{newBalance}</span></div>
            <Row className="customRow align-items-center justify-content-center">
                {loading.actionType === Action_Type.NEW_MINT && loading.message ? <span dangerouslySetInnerHTML={{__html: loading.message}}></span>:''}
                <Button size="lg" disabled={loading.actionType === Action_Type.NEW_MINT && loading.status == Status_Type.PENDING} variant="primary" onClick={NewNftMintHandler} > Mint NFT</Button>
                <Button size="lg" variant="primary" onClick={NewNftBalanceHandler}>Check Balance</Button>
            </Row>
        </Container>
        </> :connectWalletButton()}
    </div>
  )
}

export default App;
