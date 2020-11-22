import React from 'react';
import './index.scss';

export default ({ theme = 'default', children, ignore }) => {
    return (
        <div className={`page page--${theme} ${ignore ? 'page--ignore' : ''}`}>
            { children }
        </div>
    )
}