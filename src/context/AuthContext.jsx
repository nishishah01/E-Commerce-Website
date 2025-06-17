import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api";

export const AuthContext=createContext(false)

export function AuthProvider({children}){

    const[isAuthenticated, setIsAuthenticated]=useState(false)//this state lets us know when the user is logged in or not
    const[username,setUsername]=useState("")
    const handleAuth = () => { //checks if a user is authenticated by verifying the JWT token stored in the local storage.
        const token = localStorage.getItem("access");
        if (token) {
            const decoded = jwtDecode(token);
            const expiry_date = decoded.exp;
            const current_time = Date.now() / 1000;
            if (expiry_date >= current_time) {  // checks its expiration date, and sets the authentication status to true if the token is still valid.
                setIsAuthenticated(true);
            }
        }
    };

    function get_username(){
        api.get("get_username")
        .then(res=>{
            setUsername(res.data.username)
        })
        .catch(err=>{
            console.log(err.message)
        })
    }
    useEffect(function(){
        handleAuth()
        get_username()
    },[])

    const authValue={isAuthenticated,username, setIsAuthenticated, get_username}//MAKING THIS state availible to every component
    return <AuthContext.Provider value={authValue}>
        {children}
    </AuthContext.Provider>
}