import React, { forwardRef } from 'react';
import './index.scss';

const Card = forwardRef(({ theme, children, className = '', onClick }, ref) => {
    return (
        <div ref={ ref } className={`card ${theme ? `card--${theme}` : ''} ${className}`} onClick={onClick ? () => onClick() : null}>
            { children }
        </div>
    )
})

export default Card;