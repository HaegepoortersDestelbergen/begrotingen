import React, { useContext } from 'react';
import WaveTopBottomLoading from 'react-loadingg/lib/WaveTopBottomLoading';
import { AuthContext } from '../../contexts';

export default ({ children }) => {
    const [ authenticatedUser, authenticateUser ] = useContext(AuthContext);
    
    if (authenticatedUser) {
        if ( authenticatedUser.authorization == 'read') {
            return null;
        } else return children
    } else return null
}