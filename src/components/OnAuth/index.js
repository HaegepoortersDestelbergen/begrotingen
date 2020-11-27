import React, { useContext } from 'react';
import { AuthContext } from '../../contexts';

export default ({ children }) => {
    const [ authenticatedUser, authenticateUser ] = useContext(AuthContext);
    
    console.log( authenticatedUser.authorization )
    
    if ( authenticatedUser.authorization == 'read') {
        return null;
    } else return children
}