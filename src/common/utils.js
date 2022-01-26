import Web3 from "web3";

import contract from '../abi/UserScore.json';
import {} from 'dotenv/config'


const networkMap = {
    3:"ropsten"
}
const connectWalletHandler = async (setCurrentAccount,setNetwork) => {
    //console.log("setCurrentAccount,setNetwork",setCurrentAccount,setNetwork)
    //debugger;
    const { ethereum } = window;
    if (!ethereum) {
        alert("Please install Metamask!");
    }
    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length !== 0) {
            setCurrentAccount(accounts[0]);
            console.log("------accout----",accounts[0])
            window.selectedAccount = accounts[0];

            initContractHandler(setNetwork)
        } else {
            console.log("No authorized account found");
        }
        // handle change account
        ethereum.on('accountsChanged', function (accounts) {
            setCurrentAccount(accounts[0]);
            window.selectedAccount = accounts[0]
            initContractHandler(setNetwork)
            console.log(`Selected account changed to ${accounts[0]}`);
        });
    } catch (err) {
        console.log(err)
    }
    ethereum.on('networkChanged', async function  (net) {
        //console.log("network changed",net);
        //  console.log(" currentAccount",currentAccount);
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length !== 0) {
            setCurrentAccount(accounts[0]);
            window.selectedAccount = accounts[0]
            let res = initContractHandler(setNetwork)
            console.log("---res---",res)
        } else {
            console.log("No authorized account found");
        }
    }, false);
};

const isWalletConnected = async (setCurrentAccount,setNetwork) => {
    const { ethereum } = window;
    if (!ethereum) {
        alert("Please install Metamask!");
    }
    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length !== 0) {
            window.selectedAccount = accounts[0];
            return true;
        } else {
            console.log("No authorized account found");
            return false;
        }
    } catch (err) {
        console.log(err)
        return false;
    }

};

const initContractHandler = async (setNetwork) => {
    let web3 = new Web3(Web3.givenProvider);
    let network = await  web3.eth.net.getId();
    console.log("Name",network);
    network = network.toString();
    if(networkMap[network] !== process.env.REACT_APP_NETWORK){
        alert("Please select ropsten network");
        setNetwork("")
        window.network = "";
    }else{
        setNetwork(process.env.REACT_APP_NETWORK);
        window.network = process.env.REACT_APP_NETWORK
    }
    //window.history.back()
};


const prepareUploadInput = (fileNames)=>{
    let input = [];
    for(let key in fileNames ){
        input.push([key,fileNames[key]])
    }
    console.log("----input----",input);
    return input;
}

const setLoadingState = (loading,setLoading, delay=0)=>{
    setLoading(loading);
    if(delay){
        setTimeout(()=>{
            setLoading({})
        },delay)
    }
}

export{
    connectWalletHandler,
    initContractHandler,
    prepareUploadInput,
    setLoadingState,
    isWalletConnected
}