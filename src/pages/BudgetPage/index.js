import { useQuery, gql, useMutation } from '@apollo/client';
import React, { useEffect, useState, useContext } from 'react';
import { WaveTopBottomLoading } from 'react-loadingg';
import { Link, Redirect, useParams } from 'react-router-dom';
import Popup from 'reactjs-popup';
import dayjs from 'dayjs';
import 'dayjs/locale/nl-be';
import { Card, Cards, Forms, NotifyNotFound, OnAuth, Section } from '../../components';
import { Page } from '../../layouts';
import './index.scss';
import '../../utils/index';
import 'reactjs-popup/dist/index.css';
import { AuthContext } from '../../contexts';

dayjs.locale('nl-be') 

const GET_BUDGET = gql`
    query budget($id: String) {
        budget(id: $id) {
            id
            title
            created
            groupId
            comment
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
        }
    }
`;

export default () => {
    const { id: requestedBudget } = useParams();
    const [ authenticatedUser, authenticateUser ] = useContext(AuthContext);
    const [ budgetTotal, setBudgetTotal ] = useState([{id: null, total: 0}]);
    const [ modalState, setModalState ] = useState(false);
    const [ modalBudgetState, setModalBudgetState ] = useState(false);
    const [ updatedCosts, updateCosts ] = useState([]);
    const [ updatedBudget, setUpdateBudget ] = useState([]);
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
        deleteBudget();
        window.location.hash = `#/group/${groupId}`;
    }
    
    const toggleModal = (e) => {
        setModalState(!modalState)
    }
    
    useEffect(() => {
        if (updatedCosts) costsRefetch();
    }, [updatedCosts])
    
    // useEffect(() => {
    //     console.log('reload');
    // }, [budgetTotal])
    
    if (!budgetLoading && budgetData && costsData) {
        const { budget } = budgetData || [];
        const { title, groupId, comment, period: { start, end }, people } = budget[0];
        const { cost: costs } = costsData || [];
        
        const periodStart = dayjs(start);
        const periodEnd = dayjs(end);
        const periodDays = (periodEnd.diff(periodStart, 'days'))+1;
        const periodNights = periodDays - 1;
        
        const peopleTotal = people.paying + people.free;
        const budgetTotalReduced = budgetTotal.reduce((a, b) => {
            return {total: a.total + b.total}
        });
                        
        return (
            <Page theme="budget" ignore>
                <header>
                    <Section container>
                        <div className="mb-5 d-flex align-items-center justify-content-between">
                            <Link to={`/group/${groupId}`} className="btn btn--simple btn--icon"><box-icon name='left-arrow-alt'></box-icon> Overzicht budgetten</Link>
                            <div className="btn-group">
                                <OnAuth>
                                    <button className="btn btn--icon btn--sub" onClick={() => handleDelete(groupId)}><box-icon name='trash'></box-icon> Verwijder budget</button>
                                    <button className="btn btn--icon btn--sub" onClick={() => setModalBudgetState(!modalBudgetState)}><box-icon name='edit-alt'></box-icon> Bewerk budget</button>
                                    <button className="btn" onClick={toggleModal}> Nieuwe kost</button>
                                </OnAuth>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <h1 className="page__title">{ title }</h1>
                                <h2 className="page__subtitle">Van { periodStart.format('DD MMM') } tot { periodEnd.format('DD MMM') } — { peopleTotal } personen</h2>
                                <p>{ comment }</p> 
                            </div>
                            <div className="col d-flex flex-column align-items-end">
                                <h1 className="mb-0 color--blue500">{ typeof budgetTotalReduced.total == 'number' ? budgetTotalReduced.total.pricify() : 0 }</h1>
                                <small className="color--blue300">{ typeof budgetTotalReduced.total == 'number' ? ((budgetTotalReduced.total)/peopleTotal).pricify() : 0 } per persoon</small>
                            </div>
                        </div>
                    </Section>
                </header>
                <Section container>
                    { costsLoading && <WaveTopBottomLoading/> }
                    {   !costsLoading && costs ? 
                        costs.map(c =>
                            <Cards.Cost key={c.id} data={c} budgetData={{...budget[0], stay: { days: periodDays, nights: periodNights } }} states={{
                                budgetTotal: [ budgetTotal, setBudgetTotal ]
                            }} />
                        ) : 
                        null
                    }
                    { (!costsLoading && costs.length == 0) && <NotifyNotFound/> }
                </Section>
                
                {/* ADD COST */}
                <Popup open={modalState} position="right center" modal className={"edit-cost"} closeOnDocumentClick={false}>
                    <div className="modal__body">
                        <Forms.Cost states={{
                            updateCost: [ updatedCosts, updateCosts ],
                            modal: toggleModal
                        }} budgetId={requestedBudget} />
                    </div>
                </Popup>
                
                {/* UPDATE BUDGET */}
                <Popup open={modalBudgetState} position="right center" modal className={"edit-cost"} closeOnDocumentClick={false}>
                    <div className="modal__body">
                        <h3 className="text-center">Update budget</h3>
                        <Forms.UpdateBudget
                            states={{
                                updateBudget: [ updatedBudget, setUpdateBudget ],
                                modal: () => setModalBudgetState(!modalBudgetState)
                            }}
                            budgetId={requestedBudget}
                        />
                    </div>
                </Popup>
            </Page>
        )
    } else if (!budgetLoading && !budgetData.budget) {
        return <Redirect to={`/`}/>
    } else {
        return <WaveTopBottomLoading/>
    }
    
}