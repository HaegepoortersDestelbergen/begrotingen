import React from 'react';
import './index.scss'

export default React.forwardRef(({ name, value = 'value not set', children, required, checked }, ref) => {
    const nameValue = (name || children.replace(/[^A-Za-z0-9]+/g, '')).toLowerCase();
    
    return (
        // <label className="select-field">
        //     <span className="input-field__label">{ label }</span>            
        //     <select name={nameValue} ref={ref} defaultValue={value}>
        //         { children || options }
        //     </select>
        // </label>
        
        <label className="radio-field input">
            <input type="radio" name={name} ref={ref} defaultChecked={checked} value={value}/>
            <span className="radio-field__label">{ children }</span>
        </label>
    )
})