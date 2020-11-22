import React from 'react';
import './index.scss';

export default ({ theme, children }) => {
    return (
        <div className={`card ${theme && `card--${theme}` || ''}`}>
            { children }
        </div>
    )
}