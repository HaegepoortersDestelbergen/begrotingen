import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField } from '../..';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { useAuth } from '../../../contexts/Auth';

const LOGIN = gql`
    query login($email: String, $password: String) {
        login(user: {
            email: $email,
            password: $password
        }) {
            userId
            token
        }
    }
`;

export default () => {
    const { register, handleSubmit, watch, errors } = useForm();
    // const [ loginQuery, { loading: loginLoading, data: loginData, error: loginError } ] = useLazyQuery(LOGIN);
    const { setLocalToken, login, loginState: { data: loginData } } = useAuth()
    
    useEffect(() => {
        if (loginData) {
            const d = JSON.stringify(loginData.login)
            window.localStorage.setItem('user', d)
            window.location.hash = '#/'
            
            setLocalToken(d);
        }
    }, [loginData])
    
    const handleLogin = ({ email, password }) => login(email, password)
    
    return (
        <form className="form" onSubmit={handleSubmit(handleLogin)}>
            <InputField className="input--stretch" ref={register} value="demo@haegepoorters.be">E-mail</InputField>
            <InputField className="input--stretch" ref={register} value="demo" type="password" name="password">Wachtwoord</InputField>
            <small className="d-block text-center mt-3">Een login ontvang je van de webmaster(s)</small>
            <button className="btn mx-auto" type="submit">Aanmelden</button>
        </form>
    )
}