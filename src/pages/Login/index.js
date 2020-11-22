import React from 'react';
import { Forms } from '../../components'
import { Page } from '../../layouts';
import './index.scss';

export default () => {
    return (
        <Page theme="login">
            <Forms.Login/>
        </Page>
    )
}