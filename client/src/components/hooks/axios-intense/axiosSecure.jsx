import axios from "axios";
import UseAuth from "./UseAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";


 const axiosSecure= axios.create(
   {
    baseURL:import.meta.env.VITE_BASE_URL,
    withCredentials:true
   }
)


const useAxiosSecure =()=>{
     const {logOut} = UseAuth();
     const navigate = useNavigate()
   // 
  useEffect(()=>{
   axiosSecure.interceptors.response.use( res => {
      return res
     }, async error => {
       console.log("error cought" , error?.response);
       if(error?.response?.status === 401 || error.response?.status === 403){
         logOut();
        navigate('/login');
        toast.error(error.response?.data.message)
       }
       return Promise.reject(error);
     })
  },[logOut, navigate]);

  return axiosSecure
}

export default useAxiosSecure