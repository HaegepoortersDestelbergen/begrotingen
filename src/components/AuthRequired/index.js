import { gql, useLazyQuery, useQuery } from '@apollo/client';
import React, { useContext, useEffect, useState } from 'react';
import { Redirect, useLocation, useParams, useRouteMatch } from 'react-router-dom';
import { AuthContext } from '../../contexts';
import { Page } from '../../layouts';
import { getToken } from '../../utils';
import { WaveTopBottomLoading } from 'react-loadingg';
import { AccessDeniedPage } from '../../pages';

const GET_USER = gql`
    query user($id: String) {
        user(id: $id) {
            name
            role
            email
            access {
                groupId
                type
            }
        }
    }
`;

const GET_BUDGET = gql`
    query budget($id: String) {
        budget(id: $id) {
            groupId
        }
    }
`;

export default ({ children, minRole, maxRole, givenGroupId }) => {
    const location = useLocation();
    const { token, userId } = getToken();
    const [ groupId, setGroupId ] = useState(null);
    const [ authenticatedUser, authenticateUser ] = useContext(AuthContext);
    const { loading, data, error } = useQuery(GET_USER, {
        variables: {id: userId}
    });
    const [ getBudget, { loading: getBudgetLoading, data: getBudgetData, error: getBudgetError }] = useLazyQuery(GET_BUDGET);
    const { user } = data || [];
    
    const startMatch = useRouteMatch({path: '/', exact: true});
    const groupMatch = useRouteMatch('/group/:id');
    const budgetMatch = useRouteMatch('/budget/:id');
    
    // set groupId
    useEffect(() => {
        if (user && startMatch) authenticateUser({ ...user[0], authorization: null });
        if (user && groupMatch) setGroupId(groupMatch.params.id);
        if (user && budgetMatch) {
            getBudget({ variables: { id: budgetMatch.params.id }});
        }
    }, [location.key, user]);
    
    // if budgetpage do extra configuration
    useEffect(() => {
        if (getBudgetError) window.location.reload();
        if (getBudgetData) {
            setGroupId(getBudgetData.budget[0].groupId)
        }
    }, [getBudgetData, user])
    
    // authenticate
    useEffect(() => {
        if (user && groupMatch && groupId) authenticateUser({ ...user[0], authorization: findAuthorizationType(user[0].access, groupId) })
        if (user && budgetMatch && groupId) authenticateUser({ ...user[0], authorization: findAuthorizationType(user[0].access, groupId) })
    }, [location.key, user, groupId])
    
    // redirect if no data is available
    if (!token) return <Redirect to="/login"/>
    if (error) return <Redirect to="/login"/>
    
    if (minRole) {
        if (user && (user[0].role <= minRole)) return children
        else if (user && !(user[0].role <= minRole)) return <AccessDeniedPage/>
        else return <Page theme="loading"><WaveTopBottomLoading/></Page>
    } else if ((groupMatch || budgetMatch) && authenticatedUser) {
        if (!authenticatedUser.authorization) return <Page theme="loading"><WaveTopBottomLoading/></Page>
        else if (authenticatedUser.authorization == 'none') return <AccessDeniedPage/>
        else return children
    } else return children
}

const findAuthorizationType = (access, id) => {
    return access.find(a => a.groupId === id).type
}