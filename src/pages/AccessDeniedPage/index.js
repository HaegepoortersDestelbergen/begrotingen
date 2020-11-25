import React from 'react';
import { Page } from '../../layouts';
import './index.scss';

export default () => {
    return (
        <Page theme="access-denied">
            <div className="wrapper">
                <img src="https://res.cloudinary.com/haegepoortersbe/image/upload/v1598633138/uhujsjocl5n4bhdqrsmu.gif" alt="" width="200px" height="200px"/>
                <h2>Geen toegang</h2>
                <p>Je hebt niet voldoende rechten op deze pagina te bekijken</p>
            </div>
        </Page>
    )
}