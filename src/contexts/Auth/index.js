import { createContext, useContext, useEffect, useState } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useLocation } from "react-router-dom";

import { Login } from "../../pages";
import { localToken as getLocalToken , QUERIES } from "../../utils";

export const AuthContext = createContext();
export const useAuth = () => {
    return useContext(AuthContext)
};

const _Auth = ({ children }) => {
    // const [ user, setUser ] = useState(); 
    const [ localToken, setLocalToken ] = useState(getLocalToken());
    const [ loginQuery, loginState ] = useLazyQuery(QUERIES.LOGIN);
    
    const login = (email, password) => loginQuery({ variables: {
        email,
        password
    }})
    const [ getUser, { data: userData } ] = useLazyQuery(QUERIES.GET_USER);
    
    useEffect(() => {
        if (localToken) getUser({ variables: { id: localToken.userId }})
    }, [localToken])
    
    const obj = {
        getUser,
        user: userData?.user[0] || null,
        setLocalToken,
        localToken,
        login,
        loginState
    }
    
    return <AuthContext.Provider value={{ ...obj }}>
        { children }
    </AuthContext.Provider>
}

export const _AuthRequired = ({ children }) => {
    const location = useLocation();
    const { localToken: _t, user } = useAuth();

    if (
        !_t || !user
    ) return <Login />
    
    return children
}

export default _Auth;