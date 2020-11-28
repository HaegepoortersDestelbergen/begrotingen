import React, { useContext } from 'react';
import { NotifyContext } from '../../contexts';
import './index.scss';

export default ({ children }) => {
    const [ notifies, setNotify ] = useContext(NotifyContext);
        
    return (
        <div className="notify-container">
            { notifies && notifies.map((p, index) => <div key={index}>{p}</div>) }
        </div>
    )
}