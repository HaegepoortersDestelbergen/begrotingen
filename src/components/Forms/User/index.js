import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField, SelectField, RadioField, RadioFieldGroup } from '../..';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';

const REGISTER_USER = gql`
    mutation register($name: String, $email: String, $password: String, $role: String, $access: [AccessInput]) {
        register(user: {name: $name, email: $email, password: $password, role: $role, access: $access}) {
            id
            name
        }
    }
`;

export default ({ state, className = '', groups = [] }) => {
    const [updatedUsers, updateUsers] = state;
    
    const { register, handleSubmit, watch, errors } = useForm();
    const [ registerUser, { loading: registerUserLoading, data: registerUserData, error: registerUserError } ] = useMutation(REGISTER_USER);

    const handle = (formData) => {
        const { name, email, password, role } = formData;
        
        delete formData.name;
        delete formData.email;
        delete formData.password;
        delete formData.role;
        
        const access = handleAccess(formData);
        const parsedFormData = { name, email, password, role, access: access }
        
        registerUser({
            variables: parsedFormData
        })
    }
    
    if (registerUserData) console.log(registerUserData);
    
    useEffect(() => {
        if (registerUserData) updateUsers(prev => [...prev, registerUserData.register]);
    }, [registerUserData])
    
    const rightsOptions = [
        {
            name: 'geen',
            value: 'none',
            checked: true
        },
        {
            name: 'lezen',
            value: 'read',
            checked: false
        },
        {
            name: 'schrijven',
            value: 'write',
            checked: false
        },
    ]
    
    return (
        <form onSubmit={handleSubmit(handle)} className={`form ${className}`}>
            <div className="form__fields">
                <div className="row">
                    <div className="col">
                        <InputField className="input--stretch" ref={register} name="name" placeholder="webmaster" autoComplete={false}>Naam</InputField>
                        <InputField className="input--stretch" ref={register} name="email" value="webmaster@haegepoorters.be">E-mail</InputField>
                        {/* <InputField ref={register} name="role">Rol</InputField> */}
                        <SelectField className="input--stretch" name="role" label="Rol" value="user" ref={register}>
                            <option value="user">Gebruiker</option>
                            <option value="poweruser">Power gebruiker</option>
                            <option value="admin">Administrator</option>
                            <option value="root">Root</option>
                            <option value="guest">Gast</option>
                        </SelectField>
                        <InputField className="input--stretch" ref={register} name="password" type="password" value="svg image">Wachtwoord</InputField>
                    </div>
                    <div className="col">
                        <p className="label">Toegangsrechten</p>
                        {groups && groups.map(g =>
                            <div key={g.id} className="d-flex align-items-center justify-content-between">
                                <p>{g.name}</p>
                                <RadioFieldGroup name={g.id} options={rightsOptions} ref={register}/>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <button className="btn btn--icon" type="submit"><box-icon name='plus'></box-icon> Gebruiker toevoegen</button>
        </form>
    )
}

const handleAccess = (data) => {
    const keys = Object.keys(data);
    
    return keys.map(k => {
        return {
            id: k,
            type: data[k]
        }
    })
}