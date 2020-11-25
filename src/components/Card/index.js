import React from 'react';
import './index.scss';

export default ({ theme, children, className = '', onClick }) => {
    return (
        <div className={`card ${theme && `card--${theme}` || ''} ${className}`} onClick={onClick ? () => onClick() : null}>
            { children }
        </div>
    )
}