import React from 'react';
import { Redirect } from 'react-router';
import { Forms } from '../../components'
import { useAuth } from '../../contexts/Auth';
import { Page } from '../../layouts';
import './index.scss';

export default () => {
    const { user } = useAuth()
    
    if (user) return <Redirect to="/" />
    
    return (
        <Page theme="login">
            <div className="form-wrapper">
                <h1 className="text-center">Login</h1>
                <Forms.Login/>
            </div>
            <img src="https://images.unsplash.com/photo-1508877320241-41d39b9118be?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1950&q=80" alt="" className="img--backgr"/>
            {/* <img src="https://res.cloudinary.com/haegepoortersbe/image/upload/w_1200/v1598573563/z50b7hf4s32tqkb455gu.jpg" alt="" className="img--backgr"/> */}
        </Page>
    )
}