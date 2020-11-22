import React from 'react';
import './index.scss';

export default ({ children, theme = 'default' }) => {
    return (
        <div className={`section section--${theme}`}>
            { children }
        </div>
    )
}