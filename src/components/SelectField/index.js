import React from 'react';
import './index.scss'

export default React.forwardRef(({ name, label = 'no label set', type = 'text', value = '', options = null, children, required, className }, ref) => {
    const nameValue = (name || children.replace(/[^A-Za-z0-9]+/g, '')).toLowerCase();
    
    return (
        <label className={`select-field input ${className}`}>
            <span className="input-field__label">{ label }</span>            
            <select name={nameValue} ref={ref} defaultValue={value}>
                { children || options }
            </select>
        </label>
    )
})