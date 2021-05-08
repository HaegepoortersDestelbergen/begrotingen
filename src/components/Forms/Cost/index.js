import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { InputField, SelectField, RadioField, RadioFieldGroup } from '../..';
import { useMutation } from '@apollo/client';
import { MUTATIONS } from '../../../utils/queries';

export default ({ states, className = '', budgetId }) => {
    const { register, handleSubmit, watch, errors } = useForm();
    const [ addCost, { loading: addCostLoading, data: addCostData, error: addCostError } ] = useMutation(MUTATIONS.ADD_COST);

    const handle = (formData) => {        
        const parsedFormData = {...formData, budgetId: budgetId, amount: parseFloat(formData.amount)}
        addCost({
            variables: parsedFormData
        })
    }
    
    useEffect(() => {
        if (addCostData) {
            states.modal();
            if (!addCostError) toast('Kost toegevoegd');
        };
    }, [addCostData])
    
    return (
        <form onSubmit={handleSubmit(handle)} className={`form ${className}`}>
            <div className="form__fields">
                <div className="row">
                    <div className="col">
                        <InputField className="input--stretch" ref={register} name="title" placeholder="Naam van kost / inkomst" autoComplete={false}>Titel</InputField>
                        <InputField className="input--stretch" ref={register} name="comment" placeholder="Enkele details" autoComplete={false}>Opmerkingen</InputField>
                        <SelectField className="input--stretch" name="category" label="Categorie" value="SHOPPING" ref={register}>
                            <option value="SHOPPING">Inkopen</option>
                            <option value="FOOD">Eten</option>
                            <option value="LOCATION">Locatie</option>
                            <option value="DRINKS">Drank</option>
                            <option value="DRINKS">Drank</option>
                            <option value="TRANSPORT">Transport</option>
                            <option value="NIGHT">Nacht</option>
                            <option value="INSURANCE">Verzekering</option>
                            <option value="GWE">GWE</option>
                            <option value="GIFT">Gift / Sponsor</option>
                            <option value="BENEFIT">Financiële actie</option>
                            <option value="OTHER">Andere</option>
                        </SelectField>
                        <div className="input-group"> 
                            <SelectField className="input--stretch" name="when" label="Wanneer" value="ONETIME" ref={register}>
                                <option value="ONETIME">Eenmalig</option>
                                <option value="PER_DAY">Elke dag</option>
                                <option value="PER_NIGHT">Elke nacht</option>
                            </SelectField>
                            <InputField className="input--stretch" ref={register} type="number" name="amount" placeholder="0" autoComplete={false}>Bedrag €</InputField>
                            <SelectField className="input--stretch" name="type" label="Type" value="PER_PERSON" ref={register}>
                                <option value="FIXED">Vaste kost</option>
                                <option value="PER_PERSON">Voor iedereen</option>
                                <option value="PER_PAYER">Per betalende persoon</option>
                                <option value="PER_FREE">Per gratis persoon</option>
                                <option value="INCOME">Inkomst</option>
                            </SelectField>
                        </div>
                    </div>
                </div>
            </div>
            <div className="btn-group mt-3">
                <button className="btn btn--sub" type="reset" onClick={() => {states.modal()}}>Niet opslaan</button>
                <button className="btn btn--icon" type="submit"><box-icon name='plus'></box-icon> Kost toevoegen</button>
            </div>
        </form>
    )
}

const handleAccess = (data) => {
    const keys = Object.keys(data);
    
    return keys.map(k => {
        return {
            budgetId: k,
            type: data[k]
        }
    })
}