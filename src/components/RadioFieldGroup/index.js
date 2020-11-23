import React from 'react';
import { RadioField } from '..';
import './index.scss'

export default React.forwardRef(({ name, options, required }, ref) => {

    return (   
        <div className="radio-field-group">
            {options.map((o, index) => <RadioField key={index} ref={ref} name={name} value={o.value} checked={o.checked}>{ o.name }</RadioField>)}
            
            {/* <RadioField ref={ref} name="kapoenen">Lezen</RadioField>
            <RadioField ref={ref} name="kapoenen">Bewerken</RadioField> */}
        </div>
    )
})