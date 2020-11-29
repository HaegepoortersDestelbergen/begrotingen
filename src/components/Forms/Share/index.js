import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs'
import { InputField, SelectField } from '../..';
import { gql, useMutation } from '@apollo/client';

const ADD_SHARE = gql`
    mutation addShare($expires: ShareValid, $label: String, $rights: String, $budgetId: ID) {
        addShare(share: {
            budgetId: $budgetId
            expires: $expires
            label: $label
            rights: $rights
        }){
            id
            label
        }
    }
`;


export default ({ budgetId }) => {
    const { register, handleSubmit, watch, errors } = useForm();
    const [ addShare, { loading: addShareloading, data: addShareData, error: addShareError }] = useMutation(ADD_SHARE);
    
    const handle = (formData) => {
        const [ format, amount ] = formData.expires.split('_');
        const expires = dayjs().add(parseFloat(amount), format.toLowerCase()).valueOf();
        const parsedFormData = {
            ...formData,
            rights: "WRITE"
        };
        
        addShare({
            variables: { ...parsedFormData, budgetId: budgetId }
        })
    }
    
    useEffect(() => {
        if (addShareData) console.log(addShareData)
    }, [addShareData])
        
    return (
        <form onSubmit={handleSubmit(handle)} className="form">
            <div className="form__fields">
                <div className="row">
                    <div className="col">
                        <InputField className="input--stretch" ref={register} name="label" placeholder="Link voor DC's" autoComplete={false}>Label</InputField>
                    </div>
                    <div className="col">
                        <SelectField className="input--stretch" name="expires" label="Ongeldig na" value="WEEK_2" ref={register}>
                            <option value="NEVER">Verloopt niet</option>
                            <option value="WEEK_2">2 weken</option>
                            <option value="WEEK_4">4 weken</option>
                            <option value="MONTH_3">3 maand</option>
                            <option value="MONTH_3">6 maand</option>
                        </SelectField>
                    </div>
                </div>
                <div className="btn-group mt-4">
                    <button className="btn" type="submit">Share aanmaken</button>
                </div>
            </div>
        </form>
    )
}