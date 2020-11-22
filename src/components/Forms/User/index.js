import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField, SelectField } from '../..';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';

const REGISTER_USER = gql`
    mutation addGroup($name: String, $icon: String) {
        addGroup(name: $name, icon: $icon) {
            id
            name
            icon
        }
    }
`;

export default ({ state, className = '' }) => {
    const [update, updateList] = state;
    
    const { register, handleSubmit, watch, errors } = useForm();
    const [ addGroup, { loading: addGroupLoading, data: addGroupData, error: addGroupError } ] = useMutation(REGISTER_USER);

    const handle = (formData) => {
        addGroup({
            variables: formData
        })
    }
    
    useEffect(() => {
        if (addGroupData) updateList(prev => [...prev, addGroupData.addGroup]);
    }, [addGroupData])
    
    
    return (
        <form onSubmit={handleSubmit(handle)} className={`form ${className}`}>
            <div className="form__fields">
                <InputField ref={register} name="name" placeholder="webmaster" autoComplete={false}>Naam</InputField>
                <InputField ref={register} name="email" value="webmaster@haegepoorters.be">E-mail</InputField>
                {/* <InputField ref={register} name="role">Rol</InputField> */}
                <SelectField name="role" label="Rol" value="user">
                    <option value="user">Gebruiker</option>
                    <option value="poweruser">Power gebruiker</option>
                    <option value="admin">Administrator</option>
                    <option value="root">Root</option>
                    <option value="guest">Gast</option>
                </SelectField>
                <InputField ref={register} name="password" type="password" value="svg image">Wachtwoord</InputField>
                <InputField ref={register} type="rights" value="svg image">Toegangsrechten</InputField>
            </div>
            <button className="btn btn--icon" type="submit"><box-icon name='plus'></box-icon> Gebruiker toevoegen</button>
        </form>
    )
}