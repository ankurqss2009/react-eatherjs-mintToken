import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import {Button, Form, Row, Col} from "react-bootstrap";

import {Action_Type, Docs_Score_Map, Status_Type,Allow_File_Name} from '../common/Constant';
import {prepareUploadInput,setLoadingState} from '../common/utils';

import Web3 from "web3";
import contract from "../abi/UserScore.json";

function  FileUpload ({index,fileName, onChange, onRemove, hideDelete}){

    const validate = (inputName,docName)=>{
        let name = docName.split('.').slice(0, -1).join('.')
        if(Allow_File_Name.indexOf(name)>=0){
            onChange(inputName,docName)
        }
        else{
            alert("Please select file name with"  +  Allow_File_Name.join(",") +  "only");
        }
    }
    return (
        <Form.Group as={Row}>
        <Col>
        <Form.Control key={index}
             type="file"
             name={fileName}
             className="custom-file-label"
             id="inputGroupFile01"
             label={fileName}
             onChange={(e) => validate(fileName,e.target.files[0].name)}
        />
        </Col>
        <Col>
            {!hideDelete &&<Button size="sm" variant="primary" onClick={(e)=>onRemove(index)}>Delete</Button>}
        </Col>
        </Form.Group>
    )
}
function ServiceProvider() {
    const maxFiles = 8;
    const [fileNames, setFileNames] = useState({});
    const [files, setFiles] = useState(['doc1']);
    const [loading, setLoading] = useState({status:null,message:'',actionType:''});
    const navigate = useNavigate();


    const addMoreFile = ()=>{
        files.push(`doc${files.length+1}`)
        setFiles([...files]);
    }

    const onRemove = (index,fileName) => {
        files.splice(index,1);
        setFiles([...files]);
        if(fileName && Object.keys(fileName) > 0){
            delete  fileNames[fileName]
            setFileNames(...fileNames)
        }
    }

    const getDocScore  = (name) => {
        return Docs_Score_Map[name]
    }

    const setSelectedFiles = (inputName,docName)=>{
        let obj = Object.assign(fileNames,{[inputName]:getDocScore(docName)})
        setFileNames({...obj})
    }
    const uploadFileHandler = async () => {
        const { ethereum } = window;
        const web3 = new Web3(ethereum);
        const erc20Contract = new web3.eth.Contract(
            contract.abi,
            process.env.REACT_APP_CONTACT_ADDRESS,
            web3.get
        );
        try{
            setLoadingState({status: Status_Type.PENDING, message: 'Processing.... Please wait',actionType: Action_Type.UPLOAD},setLoading)
            let res = await erc20Contract.methods.upload(prepareUploadInput(fileNames)).send({from:window.selectedAccount});
            setLoadingState({status: Status_Type.SUCCESS ,message:`Upload is complete please see the transiction  <a target="_blank" rel="noreferrer" href=https://ropsten.etherscan.io/tx/${res}>here</a>`, actionType: Action_Type.UPLOAD},setLoading)
            navigate("/user");
        }
        catch (e){
            console.log("error", e);
            setLoadingState({status: Status_Type.ERROR ,message:e.message, actionType: Action_Type.UPLOAD},setLoading)
        }
    }
    return (
        <div className='main-app service_provider_sec'>
            <>
                {
                    files.map(function(file, i){
                        return <FileUpload key={file} index={i} fileName={file} onChange={setSelectedFiles} onRemove={onRemove} hideDelete={files.length <= 1} ></FileUpload>
                    })
                }
                <Row>
                    {files.length < maxFiles && <Button size="sm" variant="primary" onClick={addMoreFile}>Add More</Button>}
                </Row>
                <Row>
                    {loading.actionType === Action_Type.UPLOAD && loading.message ? <span style={loading.status == Status_Type.ERROR ? {color: 'red'} : {color:'#fff'}}  dangerouslySetInnerHTML={{__html: loading.message}}></span>:''}
                </Row>

                <Row>
                    {Object.keys(fileNames).length > 0 && <Button size="sm" variant="primary" onClick={uploadFileHandler}>Submit</Button>}
                </Row>
            </>
        </div>
    );
}

export  default  ServiceProvider;