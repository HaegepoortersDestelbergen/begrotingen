import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField } from '../..';
import { gql, useLazyQuery, useQuery } from '@apollo/client';

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
    const [ loginQuery, { loading: loginLoading, data: loginData, error: loginError } ] = useLazyQuery(LOGIN);
    
    useEffect(() => {
        if (loginData) {
            window.localStorage.setItem('user', JSON.stringify(loginData.login))
            window.location.hash = '#/'
        }
    }, [loginData])
    
    const handleLogin = (formData) => {
        loginQuery({
            variables: formData
        })
    }
    
    return (
        <form className="form" onSubmit={handleSubmit(handleLogin)}>
            <InputField className="input--stretch" ref={register} value="demo@haegepoorters.be">E-mail</InputField>
            <InputField className="input--stretch" ref={register} value="demo" type="password" name="password">Wachtwoord</InputField>
            <small className="d-block text-center mt-3">Een login ontvang je van de webmaster(s)</small>
            <button className="btn mx-auto" type="submit">Aanmelden</button>
        </form>
    )
}