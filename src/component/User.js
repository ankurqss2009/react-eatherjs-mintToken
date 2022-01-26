import {Button, Row} from "react-bootstrap";

import  {Action_Type,Status_Type} from "../common/Constant";
import {Link} from "react-router-dom";
import Web3 from "web3";
import contract from "../abi/UserScore.json";
import React, {useEffect, useState} from "react";

const  User = ()=>{
    const [score, setScore] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const { ethereum } = window;
        const web3 = new Web3(ethereum);
        const erc20Contract = new web3.eth.Contract(
            contract.abi,
            process.env.REACT_APP_CONTACT_ADDRESS,
            web3.get
        );
        setLoading(true);
        setTimeout(()=>{
            erc20Contract.methods.getScore().call({from:window.selectedAccount}).then((res)=>{
                setScore(res);
                setLoading(false)
            });
        },1000);

    }, [])
    return (

        <div className='main-app user'>
            {loading && <h4>Loading....</h4>}

            {!loading && score && <div className="cr-balance"><span><b>Your  Score Is :</b> {score}</span></div>}
            { !loading && score && score <=0 &&
                <h4> You score is 0 so plese upload your docs&nbsp;
                <Link to="/service-provider">
                   here
                </Link>
                </h4>
            }
        </div>
    )
}

export  default  User;