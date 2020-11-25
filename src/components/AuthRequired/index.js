import { gql, useQuery } from '@apollo/client';
import React, { useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
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
                budgetId
                type
            }
        }
    }
`;

export default ({ children, minRole, maxRole }) => {
    const { token, userId } = getToken();
    const [authenticatedUser, authenticateUser] = useContext(AuthContext);
    const { loading, data, error } = useQuery(GET_USER, {
        variables: {id: userId}
    })
    
    const { user } = data || [];

    if (!token) return <Redirect to="/login"/>
    if (error) return <Redirect to="/login"/>
    
    useEffect(() => {
        if (user) authenticateUser(user[0]);
    }, [user])
    
    if (minRole) {
        if (user && (user[0].role <= minRole)) return children
        else if (user && !(user[0].role <= minRole)) return <AccessDeniedPage/>
        else return <Page theme="loading">
            <WaveTopBottomLoading/>
        </Page>
    }
    else return children;
}