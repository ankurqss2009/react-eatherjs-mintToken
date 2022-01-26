import { useEffect, useState } from 'react';

import {
  Link
} from "react-router-dom";

import { Button,Row,Container } from 'react-bootstrap';
import {} from 'dotenv/config'

import {Action_Type, Status_Type} from './common/Constant.js';
import {connectWalletHandler, setLoadingState,initContractHandler} from './common/utils';

import './Home.css';

function Home() {
    const [loading, setLoading] = useState({status:null,message:'',actionType:''});
    const [network, setNetwotk] = useState('');
    const [error, setError] = useState('');

    console.log("window.network",window.network)
    console.log("window.selectedAccount",window.selectedAccount)


    useEffect(() => {
        if(!window.network){
            initContractHandler(setNetwotk).then((res)=>{
                console.log("--res---",res)
            })
        }
    }, [])
    return (
        <div className='main-app'>
            <h1>Upload Score</h1>
            <>
                <h3>Selected Account:{window.selectedAccount} </h3>
                {window.network === process.env.REACT_APP_NETWORK &&
                <Container className="containerWrapper">

                    {loading.actionType === Action_Type.MINT  && loading.message ? <span style={loading.status === Status_Type.ERROR ? {color: 'red'} : {}} dangerouslySetInnerHTML={{__html: loading.message}}></span>:''}
                    <Row className="customRow align-items-center justify-content-center" >
                        <Link to="/service-provider">
                             <Button size="lg"  variant="primary"  >Service Provider</Button>
                         </Link>
                        <Link to="/user">
                             <Button size="lg" variant="primary">User</Button>
                        </Link>
                    </Row >
                </Container>
                }
            </>
        </div>
    )
}
export default Home;
