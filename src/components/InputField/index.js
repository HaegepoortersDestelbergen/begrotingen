import React from 'react';
import './index.scss'

export default React.forwardRef(({ name, type = 'text', value = '', children, onChange = null, required, placeholder = ' ', autoComplete = true, className }, ref) => {
    const nameValue = (name || children.replace(/[^A-Za-z0-9]+/g, '')).toLowerCase();
    
    return (
        <label className={`input-field input ${className}`}>
            <span className="input-field__label">{children}</span>
            <input name={nameValue} type={type} placeholder={placeholder} defaultValue={value} ref={ref} autoComplete={autoComplete ? 'true' : 'off'}/>
        </label>
    )
})