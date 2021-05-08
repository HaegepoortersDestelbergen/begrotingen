import React, { useContext, useEffect, useState } from 'react';
import WaveTopBottomLoading from 'react-loadingg/lib/WaveTopBottomLoading';
import { useLocation, useParams, useRouteMatch } from 'react-router';

import { AuthContext } from '../../contexts';
import { useAuth } from '../../contexts/Auth';

export default ({ children, group: requestedGroup }) => {
    const { user } = useAuth('none');
    const [ access, setAccess ] = useState()
    
    useEffect(() => {
        const result = requestedGroup && user?.access.find(group => group.groupId === requestedGroup) || 'none';
        setAccess(result.type);
    }, [])
    
    if (access === 'write') return children
    return null
}