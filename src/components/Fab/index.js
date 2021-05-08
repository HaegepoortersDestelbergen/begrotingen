import React from 'react';
import './index.scss';

export default ({ children }) => {
    return (
        <div className="fab">
            <div className="btn-group"> 
                { children }
            </div>
        </div>
    )
}