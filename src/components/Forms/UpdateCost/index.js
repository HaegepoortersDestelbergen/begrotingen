import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField, SelectField, RadioField, RadioFieldGroup } from '../..';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import WaveTopBottomLoading from 'react-loadingg/lib/WaveTopBottomLoading';

const GET_COST = gql`
    query cost($id: String) {
        cost(id: $id) {
            title
            comment
            category
            type
            when
            amount
        }
    }
`;

const UPDATE_COST = gql`
    mutation addCost ($id: ID, $budgetId: ID, $title: String, $comment: String, $category: CostCategory, $type: CostType, $when: CostWhen, $amount: Float ) {
        addCost (
            id: $id,
            cost: {
                budgetId: $budgetId,
                title: $title,
                comment: $comment,
                category: $category,
                type: $type,
                when: $when,
                amount: $amount
            }
        ){
            title
        }
    }
`;

export default ({ states, className = '', costId }) => {
    const [ updatedBudget, setUpdateBudget ] = states.updateCost;
    const { register, handleSubmit, watch, errors } = useForm();
    const { loading: getCostLoading, data: getCostData, error: getCostError, refetch: getCostRefetch } = useQuery(GET_COST, { variables: {
        id: costId
    }})
    const [ updateCost, { loading: updateCostLoading, data: updateCostData, error: updateCostError } ] = useMutation(UPDATE_COST, {
        variables: {id: costId}
    });

    const handle = (formData) => {    
        const { amount } = formData; 
        const parsedFormData = {
            ...formData,
            amount: parseFloat(amount)
        }
        console.log({ parsedFormData })
        updateCost({
            variables: {
                id: costId,
                ...parsedFormData
            }
        })
    }
    
    useEffect(() => {
        if (updateCostData) {
            setUpdateBudget(updateCostData)
            states.modal();
        };
        getCostRefetch();
    }, [updateCostData])
    
    if (getCostData) {
        const { title, comment, category, type, when, amount } = getCostData.cost[0]
        
        return (
            <form onSubmit={handleSubmit(handle)} className={`form ${className}`}>
                <div className="form__fields">
                    <div className="row">
                        <div className="col">
                            <InputField className="input--stretch" ref={register} name="title" placeholder="Naam van kost / inkomst" value={ title } autoComplete={false}>Titel</InputField>
                            <InputField className="input--stretch" ref={register} name="comment" placeholder="Enkele details" value={ comment } autoComplete={false}>Opmerkingen</InputField>
                            <SelectField className="input--stretch" name="category" label="Categorie" value={ category } ref={register}>
                                <option value="SHOPPING">Inkopen</option>
                                <option value="FOOD">Eten</option>
                                <option value="LOCATION">Locatie</option>
                                <option value="DRINKS">Drank</option>
                                <option value="DRINKS">Drank</option>
                                <option value="TRANSPORT">Transport</option>
                                <option value="NIGHT">Nacht</option>
                                <option value="INSURANCE">Verzekering</option>
                                <option value="GWE">GWE</option>
                                <option value="OTHER">Andere</option>
                            </SelectField>
                            <div className="input-group"> 
                                <SelectField className="input--stretch" name="when" label="Wanneer" value={when} ref={register}>
                                    <option value="ONETIME">Eenmalig</option>
                                    <option value="PER_DAY">Elke dag</option>
                                    <option value="PER_NIGHT">Elke nacht</option>
                                </SelectField>
                                <InputField className="input--stretch" ref={register} type="number" name="amount" placeholder="0" value={ amount } autoComplete={false}>Bedrag €</InputField>
                                <SelectField className="input--stretch" name="type" label="Type" value={ type } ref={register}>
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
                    <button className="btn" type="submit">Kost bijwerken</button>
                </div>
            </form>
        )
    } else return <WaveTopBottomLoading/>
    
}