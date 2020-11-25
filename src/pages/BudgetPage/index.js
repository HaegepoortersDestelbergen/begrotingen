import { useQuery, gql, useMutation } from '@apollo/client';
import React, { useEffect } from 'react';
import { WaveTopBottomLoading } from 'react-loadingg';
import { Link, Redirect, useParams } from 'react-router-dom';
import { Card, Cards, Section } from '../../components';
import { Page } from '../../layouts';
import './index.scss';

const GET_BUDGET = gql`
    query budget($id: String) {
        budget(id: $id) {
            id
            title
            created
            groupId
        }
    }
`;

const DELETE_BUDGET = gql`
    mutation deleteBudget($id: String) {
        deleteBudget(id: $id){title}
    }
`;

const GET_COSTS = gql`
    query cost($budgetId: String) {
        cost(budgetId: $budgetId) {
            id
            title
            comment
            category
            type
            when
            amount
        }
    }
`;

export default () => {
    const { id: requestedBudget } = useParams();
    const {loading: budgetLoading, data: budgetData, error: budgetError } = useQuery(GET_BUDGET, {
        variables: { id: requestedBudget }
    })
    const [ deleteBudget, { loading: deleteBudgetLoading, data: deleteBudgetData, error: deleteBudgetError } ] = useMutation(DELETE_BUDGET, {
        variables: { id: requestedBudget }
    });
    const {loading: costsLoading, data: costsData, error: costsError, refetch: costsRefetch } = useQuery(GET_COSTS, {
        variables: { budgetId: requestedBudget }
    })
    
    const handleDelete = (groupId) => {
        console.log('deleted budget');
        deleteBudget();
        window.location.hash = `#/group/${groupId}`;
    }
    
    const { budget } = budgetData || [];
    const { cost: costs } = costsData || [];
    
    console.log(costs);

    if (!budgetLoading && budget[0]) {
        const { title, groupId, comment } = budget[0];
        
        return (
            <Page theme="group" ignore>
                <header>
                    <Section container>
                        <div className="mb-5 d-flex align-items-center justify-content-between">
                            <Link to={`/group/${groupId}`}>Overzicht budgetten</Link>
                            <div>
                                <button className="btn btn--icon" onClick={() => handleDelete(groupId)}><box-icon name='trash'></box-icon> verwijder budget</button>
                            </div>
                        </div>
                        <h1>{ title }</h1>
                        <h2>van tot</h2>
                        <p>{ comment }</p>
                    </Section>
                </header>
                <Section container>
                    { costsLoading && <WaveTopBottomLoading/> }
                    {   !costsLoading && costs ? 
                        costs.map(c =>
                            <Cards.Cost key={c.id} data={c}/>
                        ) : 
                        null
                    }
                    { (!costsLoading && costs.length == 0) && <div className="">
                        <img src="undraw/searching.svg" width="200px"/>
                        We konden geen uitgaven vinden
                    </div> }
                    
                </Section>
            </Page>
        )
    } else if (!budgetLoading && !budget[0]) {
        return <Redirect to={`/`}/>
    } else {
        return <WaveTopBottomLoading/>
    }
    
}