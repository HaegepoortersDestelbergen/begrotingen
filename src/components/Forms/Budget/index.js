import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField, SelectField, RadioField, RadioFieldGroup } from '../..';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import dayjs from 'dayjs'

const ADD_BUDGET = gql`
    mutation addBudget ($title: String, $comment: String, $groupId: ID, $people: PeopleInput, $period: PeriodInput) {
        addBudget(budget: {
            title: $title
            comment: $comment
            groupId: $groupId,
            people: $people
            period: $period
        }){
            title
            comment
            groupId
        }
    }
`;

export default ({ states, groupData, className = '', budgetId, placeHolder }) => {        
    const { register, handleSubmit, watch, errors } = useForm({
        defaultValues: placeHolder && placeHolder || { }
    });
    const [ addBudget, { loading: addBudgettLoading, data: addBudgetData, error: addBudgetError } ] = useMutation(ADD_BUDGET);

    const handle = (formData) => {        
        const { start, end, paying, free } = formData;
        
        // delete formData.start
        // delete formData.end
        // delete formData.paying
        // delete formData.free
        
        const parsedFormData = {
            ...formData,
            groupId: groupData.id,
            people: {
                paying: parseFloat(paying),
                free: parseFloat(free)
            },
            period: {
                start: new Date(start).getTime(),
                end: new Date(end).getTime()
            }
        }
        
        addBudget({
            variables: parsedFormData
        })
    }
        
    useEffect(() => {
        if (addBudgetData) states.modal();
    }, [addBudgetData])
    
    const today = dayjs().format('YYYY-MM-DD')
    const future = dayjs().add(2, 'day').format('YYYY-MM-DD')
    
    //todo: better naming https://react-hook-form.com/api#register
    
    return (
        <form onSubmit={handleSubmit(handle)} className={`form ${className}`}>
            <div className="form__fields">
                <div className="row">
                    <div className="col">
                        <InputField className="input--stretch" ref={register({required: true})} name="title" placeholder="Naam van activiteit" autoComplete={false}>Titel</InputField>
                        <InputField className="input--stretch" ref={register} name="comment" placeholder="Enkele details" autoComplete={false}>Opmerkingen</InputField>
                        <div className="input-group">
                            <InputField className="input--stretch" ref={register({required: true})} type="date" name="start" value={today} autoComplete={false}>Van</InputField>
                            <InputField className="input--stretch" ref={register({required: true})} type="date" name="end" value={future} autoComplete={false}>Tot</InputField>
                        </div>
                        <div className="input-group">
                            <InputField className="input--stretch" ref={register({required: true})} type="number" name="paying" value={0} autoComplete={false}>Betalende personen</InputField>
                            <InputField className="input--stretch" ref={register} type="number" name="free" value={0} autoComplete={false}>Niet-betalende personen</InputField>
                        </div>
                    </div>
                </div>
            </div>
            <div className="btn-group"> 
                <button className="btn btn--sub" type="reset" onClick={states.modal}>Niet opslaan</button>
                <button className="btn btn--icon" type="submit"><box-icon name='plus'></box-icon> Kost toevoegen</button>
            </div>
        </form>
    )
}