import React from 'react';
import './index.scss';

export default ({ children, theme = 'default', container }) => {
    
    if (container) return (
        <div className={`section section--${theme} container`}>
            { children }
        </div>
    )
    
    else return (
        <div className={`section section--${theme}`}>
            { children }
        </div>
    )
}