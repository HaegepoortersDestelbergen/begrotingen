import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { InputField, SelectField, RadioField, RadioFieldGroup } from '../..';
import { WaveTopBottomLoading } from 'react-loadingg';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import dayjs from 'dayjs'

const UPDATE_BUDGET = gql`
    mutation addBudget ($title: String, $comment: String, $groupId: ID, $people: PeopleInput, $period: PeriodInput, $id: ID) {
        addBudget(
            id: $id
            budget: {
                title: $title
                comment: $comment
                groupId: $groupId,
                people: $people
                period: $period
            }
        ){
            title
            comment
            groupId
        }
    }
`;

const GET_BUDGET = gql`
    query budget($id: String) {
        budget(id: $id) {
            id
            title
            created
            comment
            groupId
            people {
                paying
                free
            }
            period {
                start
                end
            }
        }
    }
`;

const DELETE_BUDGET = gql`
    mutation deleteBudget($id: String) {
        deleteBudget(id: $id){title}
    }
`;

export default ({ states, groupData, className = '', budgetId, placeHolder = {} }) => {
    const [ updatedBudget, setUpdateBudget ] = states.updateBudget;        
    const { loading: budgetLoading, data: budgetData, error: budgetError } = useQuery(GET_BUDGET, {
        variables: { id: budgetId }
    })
    const { register, handleSubmit, watch, errors } = useForm();
    const [ updateBudget, { loading: updateBudgetLoading, data: updateBudgetData, error: updateBudgetError } ] = useMutation(UPDATE_BUDGET);
    const [ deleteBudget, { loading: deleteBudgetLoading, data: deleteBudgetData, error: deleteBudgetError } ] = useMutation(DELETE_BUDGET, {
        variables: { id: budgetId }
    });
    
    const handleDelete = (groupId) => {
        toast('Budget werd verwijderd');
        deleteBudget();
        window.location.hash = `#/group/${groupId}`;
    }
            
    // useEffect(() => {
    //     if (updateBudgetData) {
    //         updateBudgets(prev => [...prev, updateBudgetData.addBudget]);
    //         states.modal();
    //     }
    // }, [updateBudgetData])
    
    useEffect(() => {
        if (updateBudgetData) {
            states.modal();
            window.location.reload();
        }
    }, [updateBudgetData])
    
    //todo: better naming https://react-hook-form.com/api#register
    
    if (budgetData) {
        const { title, comment, period, people: { paying, free }, groupId } = budgetData.budget[0];
        
        const handle = (formData) => { 
            const { period: { start, end }, people: { paying, free } } = formData;
            
            const parsedFormData = {
                ...budgetData.budget[0],
                ...formData,
                period: { 
                    start: new Date(start).getTime(),
                    end: new Date(end).getTime() 
                },
                people: { 
                    paying: parseFloat(paying),
                    free: parseFloat(free) 
                }
            }
                            
            updateBudget({
                variables: parsedFormData
            })
        }
        
        const start = dayjs(period.start).format('YYYY-MM-DD')
        const end = dayjs(period.end).format('YYYY-MM-DD')
        
        return ( <form onSubmit={handleSubmit(handle)} className={`form ${className}`}>
            <div className="form__fields">
                <div className="row">
                    <div className="col">
                        <InputField className="input--stretch" ref={register({required: true})} name="title" placeholder="Naam van activiteit" value={ title } autoComplete={ false }>Titel</InputField>
                        <InputField className="input--stretch" ref={register} name="comment" placeholder="Enkele details" value={ comment } autoComplete={ false }>Opmerkingen</InputField>
                        <div className="input-group">
                            <InputField className="input--stretch" ref={register({required: true})} type="date" name="period.start" value={ start } autoComplete={ false }>Van</InputField>
                            <InputField className="input--stretch" ref={register({required: true})} type="date" name="period.end" value={ end } autoComplete={ false }>Tot</InputField>
                        </div>
                        <div className="input-group">
                            <InputField className="input--stretch" ref={register({required: true})} type="number" name="people.paying" value={ paying } autoComplete={ false }>Betalende personen</InputField>
                            <InputField className="input--stretch" ref={register({required: true})} type="number" name="people.free" value={ free } autoComplete={ false }>Niet-betalende personen</InputField>
                        </div>
                    </div>
                </div>
            </div>
            <div className="d-flex justify-content-between mt-4">
                <button className="btn btn--icon btn--sub" onClick={() => handleDelete(groupId)}><box-icon name='trash'></box-icon> Verwijder budget</button>
                <div className="btn-group"> 
                    <button className="btn btn--sub" type="reset" onClick={states.modal}>Niet opslaan</button>
                    <button className="btn" type="submit">Budget bijwerken</button>
                </div>
            </div>
        </form> )} else return <WaveTopBottomLoading/>;
}