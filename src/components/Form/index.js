import classNames from 'classnames';
import React from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';

import styles from './Form.module.scss';

const Form = ({ children, className, onSubmit = () => null }) => {
    const methods = useForm();
    const handleSubmit = data => {
        console.log(data);
        onSubmit(data);
    }
    
    return <FormProvider { ...methods }>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className={ className }>
            { children }
        </form>
    </FormProvider>
}

export const FormInput = ({ type = 'text', name, label, validate = {}, placeholder, wrapperClassName, className }) => {
    const { register } = useFormContext();
    
    return <label className={ classNames(styles.inputWrapper, wrapperClassName) }>
        { label && <span className="label">{ label }</span> }
        <input className={ styles.field } name={ name } placeholder={ placeholder } ref={ register(validate) } />
    </label>
}

export default Form;