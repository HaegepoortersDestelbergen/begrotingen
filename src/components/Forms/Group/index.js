import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField } from '../..';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';

const ADD_GROUP = gql`
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
    const [ addGroup, { loading: addGroupLoading, data: addGroupData, error: addGroupError } ] = useMutation(ADD_GROUP);

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
                <InputField ref={register} name="name" placeholder="Givers" autoComplete={false}>Naam</InputField>
                <InputField ref={register} name="icon" value="svg image">Icoon</InputField>
            </div>
            <button className="btn btn--icon" type="submit"><box-icon name='plus'></box-icon> Groep toevoegen</button>
        </form>
    )
}