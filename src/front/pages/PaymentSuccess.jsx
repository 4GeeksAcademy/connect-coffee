import React, { useState, useEffect } from "react";
import AboutForm from "../components/AboutForm";
import { useNavigate } from 'react-router-dom';
import { getUserStore,activateStore } from '../services/api_store';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const PaymentSuccess = () => {
  const [isActiveStore, setIsActiveStore] = useState(null);
  const [responseApi, setResponseApi] = useState(null);
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const handleGetStore= async ()=>{
    //setResponseApi(await getUserStore(store.token));
    const resApi=await getUserStore(store.token);
    console.log("handleGetStore API isActive", await getUserStore(store.token));
    console.log("responseApi?.data.length", resApi.data.length);
    if (  resApi?.data.length !== 0 ){
      setResponseApi(resApi.data[0]);
      console.log("setResponseApi", resApi.data[0]);
      if( resApi?.data[0].is_active == false){
        console.log("setResponseApi FALSE", resApi.data[0]);
        setIsActiveStore(await activateStore(resApi.data[0].id));
        console.log("isActive",isActiveStore);
        navigate('/provider')
      }else{
        console.log("setResponseApi TRUE", resApi.data[0]);
        navigate('/')
        //return true;
      }
    }
    console.log("setResponseApi FALSE END", resApi.data[0]);
    return false;
  }
  
  useEffect(() => {
    if (handleGetStore()) {
      console.log("Navegamos a /store-builder");
      navigate('/store-builder')
    }else{
      console.log("responseApi",responseApi)
    }
  }, []);

  return (
    <div>✅ ¡Gracias por elegirnos!</div>     
  );
};

export default PaymentSuccess;