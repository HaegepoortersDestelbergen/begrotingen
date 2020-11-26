import { useQuery, gql, useMutation } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { WaveTopBottomLoading } from 'react-loadingg';
import { Link, Redirect, useParams } from 'react-router-dom';
import Popup from 'reactjs-popup';
import dayjs from 'dayjs';
import 'dayjs/locale/nl-be';
import { Card, Cards, Forms, Section } from '../../components';
import { Page } from '../../layouts';
import './index.scss';
import '../../utils/index';
import 'reactjs-popup/dist/index.css';

dayjs.locale('nl-be') 

const GET_BUDGET = gql`
    query budget($id: String) {
        budget(id: $id) {
            id
            title
            created
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
    const [ budgetTotal, setBudgetTotal ] = useState([{id: null, total: 0}]);
    const [ modalState, setModalState ] = useState(false);
    const [ updatedCosts, updateCosts ] = useState([]);
    const { loading: budgetLoading, data: budgetData, error: budgetError } = useQuery(GET_BUDGET, {
        variables: { id: requestedBudget }
    })
    const [ deleteBudget, { loading: deleteBudgetLoading, data: deleteBudgetData, error: deleteBudgetError } ] = useMutation(DELETE_BUDGET, {
        variables: { id: requestedBudget }
    });
    const { loading: costsLoading, data: costsData, error: costsError, refetch: costsRefetch } = useQuery(GET_COSTS, {
        variables: { budgetId: requestedBudget }
    })
    
    const handleDelete = (groupId) => {
        console.log('deleted budget');
        deleteBudget();
        window.location.hash = `#/group/${groupId}`;
    }
    
    const toggleModal = (e) => {
        setModalState(!modalState)
    }
    
    useEffect(() => {
        costsRefetch();
    }, [updatedCosts])
    
    const { budget } = budgetData || [];
    const { cost: costs } = costsData || [];

    if (!budgetLoading && budget[0]) {
        const { title, groupId, comment, period: { start, end }, people } = budget[0];
        
        const periodStart = dayjs(start);
        const periodEnd = dayjs(end);
        const periodDays = (periodEnd.diff(periodStart, 'days'))+1;
        const periodNights = periodDays - 1;
        const peopleTotal = people.paying + people.free;
        const budgetTotalReduced = budgetTotal.reduce((a, b) => {
            console.log(a, b);
            return {total: a.total + b.total}
        });
        
        const budgetTotalReducedIsNumber = budgetTotalReduced.total == 'number';
                
        return (
            <Page theme="group" ignore>
                <header>
                    <Section container>
                        <div className="mb-5 d-flex align-items-center justify-content-between">
                            <Link to={`/group/${groupId}`}>Overzicht budgetten</Link>
                            <div className="btn-group">
                                <button className="btn btn--icon btn--sub" onClick={() => handleDelete(groupId)}><box-icon name='trash'></box-icon> Verwijder budget</button>
                                <button className="btn btn--icon" onClick={() => handleDelete(groupId)}><box-icon name='edit-alt'></box-icon> Bewerk budget</button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <h1>{ title }</h1>
                                <h2>van { periodStart.format('DD MMM') } tot { periodEnd.format('DD MMM') } — { peopleTotal } personen</h2>
                                <p>{ comment }</p> 
                            </div>
                            <div className="col d-flex flex-column align-items-end">
                                <h1>{ typeof budgetTotalReduced.total == 'number' ? budgetTotalReduced.total.pricify() : 0 }</h1>
                                { budgetTotalReduced.total == 'number' && budgetTotalReduced.total >= 0 ?
                                    <small>{ budgetTotalReducedIsNumber ? ((budgetTotalReduced.total)/peopleTotal).pricify() : 0 } per persoon</small> :
                                    <small>{ budgetTotalReducedIsNumber ? (((budgetTotalReduced.total)/peopleTotal)*-1).pricify() : 0 } winst per persoon</small>
                                }
                                
                            </div>
                        </div>
                        <div>
                            <Forms.Cost state={[ updatedCosts, updateCosts ]} budgetId={requestedBudget} />
                        </div>
                    </Section>
                </header>
                <Section container>
                    { costsLoading && <WaveTopBottomLoading/> }
                    {   !costsLoading && costs ? 
                        costs.map(c =>
                            <Cards.Cost key={c.id} data={c} budgetData={{...budget[0], stay: { days: periodDays, nights: periodNights } }} states={{
                                budgetTotal: [ budgetTotal, setBudgetTotal ],
                                modal: [ modalState, setModalState ]
                            }} />
                        ) : 
                        null
                    }
                    { (!costsLoading && costs.length == 0) && <div className="">
                        <img src="undraw/searching.svg" width="200px"/>
                        We konden geen uitgaven vinden
                    </div> }
                </Section>
                <Popup open={modalState} position="right center" modal className={"edit-cost"} closeOnDocumentClick={false}>
                    <div className="modal__body">
                        
                    </div>
                    <div className="btn-group">
                        <button className="btn btn--sub" onClick={toggleModal}>Annuleren</button>
                        <button onClick={toggleModal}>Opslaan</button>
                    </div>
                </Popup>
            </Page>
        )
    } else if (!budgetLoading && !budget[0]) {
        return <Redirect to={`/`}/>
    } else {
        return <WaveTopBottomLoading/>
    }
    
}