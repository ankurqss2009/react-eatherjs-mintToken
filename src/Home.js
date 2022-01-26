import { useEffect, useState } from 'react';
import { Button,Row,Container,Form } from 'react-bootstrap';
import {} from 'dotenv/config'

import Web3 from 'web3';

import {Action_Type, Status_Type} from './common/Constant.js';

import './App.css';
import contract from './abi/UserScore.json';


const networkMap = {
    3:"ropsten"
}
function App() {
    const [currentAccount, setCurrentAccount] = useState("");
    const [loading, setLoading] = useState({status:null,message:'',actionType:''});
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [network, setNetwork] = useState("");

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
        ethereum.on('networkChanged', async function  (net) {
            console.log("network changed",net);
            //  console.log(" currentAccount",currentAccount);
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length !== 0) {
                setCurrentAccount(accounts[0]);
                initContractHandler(accounts[0])
            } else {
                console.log("No authorized account found");
            }
        }, false);
    };

    const initContractHandler = async () => {
        let web3 = new Web3(Web3.givenProvider);
        let network = await  web3.eth.net.getId();
        console.log("Name",network);
        network = network.toString();
        if(networkMap[network] !== process.env.REACT_APP_NETWORK){
            alert("Please select ropsten network");
            setNetwork("")
        }else{
            setNetwork(process.env.REACT_APP_NETWORK);
        }
    };

    const setLoadingState = (loading)=>{
        setLoading(loading);
        setTimeout(()=>{
            setLoading({})
        },5000)
    }

    const depositHandler = async () => {
        const { ethereum } = window;
        const web3 = new Web3(ethereum);

        const erc20Contract = new web3.eth.Contract(
            contract.abi,
            process.env.REACT_APP_CONTACT_ADDRESS,
            web3.get
        );
        if(!amount){
            setError(true);
            return
        }
        try{
            setError(false);
            //setLoading({status: Status_Type.PENDING, message: 'Processing.... Please wait',actionType: Action_Type.MINT})
            setLoadingState({status: Status_Type.PENDING, message: 'Processing.... Please wait',actionType: Action_Type.MINT})
            let ethAmount = web3.utils.toWei(amount); // 2000 ETH
            let res = await erc20Contract.methods.deposit().send({
                value: ethAmount,
                from: currentAccount
            })
            setLoadingState({status: Status_Type.SUCCESS ,message:`Deposit  of ${amount} complete please see the transiction  <a target="_blank" rel="noreferrer" href=https://ropsten.etherscan.io/tx/${res}>here</a>`, actionType: Action_Type.MINT})
            setAmount('')
        }
        catch (e){
            console.log("error", e);
            setLoadingState({status: Status_Type.ERROR ,message:e.message, actionType: Action_Type.MINT})
        }
    }

    const withdrawHandler = async () => {
        const { ethereum } = window;
        const web3 = new Web3(ethereum);

        const erc20Contract = new web3.eth.Contract(
            contract.abi,
            process.env.REACT_APP_CONTACT_ADDRESS,
            web3.get
        );
        if(!amount){
            setError(true)
            return;
        }
        try{
            setError(false);
            setLoadingState({status: Status_Type.PENDING, message: 'Processing.... Please wait',actionType: Action_Type.MINT})
            let amountWith  = web3.utils.toWei(amount)
            let res = await erc20Contract.methods.withdraw(amountWith).send({from: currentAccount})
            setAmount('')
            console.log("----res---",res)
            setLoadingState({status: Status_Type.SUCCESS ,message:`Withdraw  of ${amount} complete please see the transiction  <a target="_blank" rel="noreferrer" href=https://ropsten.etherscan.io/tx/${res}>here</a>`, actionType: Action_Type.MINT})
        }
        catch(e){
            console.log("error", e);
            setLoadingState({status: Status_Type.ERROR ,message:e.message, actionType: Action_Type.MINT})
        }
    };

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
            <h1>Upload Score</h1>
            {currentAccount ?
                <>
                    <h3>Selected Account:{currentAccount} </h3>
                    {network === process.env.REACT_APP_NETWORK && <Container className="containerWrapper">

                        {loading.actionType === Action_Type.MINT  && loading.message ? <span style={loading.status === Status_Type.ERROR ? {color: 'red'} : {}} dangerouslySetInnerHTML={{__html: loading.message}}></span>:''}
                        <Row className="customRow align-items-center justify-content-center" >
                            <Button size="lg"  variant="primary" onClick={depositHandler} >Service Provider</Button>
                            <Button size="lg" variant="primary" onClick={withdrawHandler}>User</Button>
                        </Row >
                    </Container>}
                </> :connectWalletButton()}
        </div>
    )
}
export default App;
