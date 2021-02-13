import { useQuery, useLazyQuery } from '@apollo/client';
import React, { useEffect, useState, useContext } from 'react';
import { WaveTopBottomLoading } from 'react-loadingg';
import { Link, Redirect, useParams } from 'react-router-dom';
import Popup from 'reactjs-popup';
import dayjs from 'dayjs';
import 'dayjs/locale/nl-be';
import { toast } from 'react-toastify';

import { Card, Cards, Forms, NotifyNotFound, OnAuth, Section, SharesList } from '../../components';
import { Page } from '../../layouts';
import './index.scss';
import '../../utils/index';
import 'reactjs-popup/dist/index.css';
import { QUERIES } from '../../utils/index';

dayjs.locale('nl-be') 

export default () => {
    const { id: requestedBudget } = useParams();
    // const [ budgetTotal, setBudgetTotal ] = useState([{id: null, total: 0}]);
    const [ modalState, setModalState ] = useState(false);
    const [ modalBudgetState, setModalBudgetState ] = useState(false);
    const [ modalShareState, setModalShareState ] = useState(false);
    const [ updatedCosts, updateCosts ] = useState([]);
    const [ updatedBudget, setUpdateBudget ] = useState([]);
    const [ simulation, setSimulation ] = useState({}); 
    const { loading: budgetLoading, data: budgetData, error: budgetError } = useQuery(QUERIES.GET_BUDGET, {
        variables: { id: requestedBudget }
    })
    const { loading: costsLoading, data: costsData, error: costsError, refetch: costsRefetch } = useQuery(QUERIES.GET_COSTS, {
        variables: { budgetId: requestedBudget }
    })
            
    const [ getBudgetTotal, { data: budgetTotal, loading: budgetTotalLoading }] = useLazyQuery(QUERIES.GET_BUDGET_TOTAL)
    
    const toggleModal = (e) => {
        setModalState(!modalState)
    }
    
    /**
     * TODO: simulation
     */
    
    // useEffect(() => {
    //     setSimulation(budgetData)
    // }, [budgetData])
    
    useEffect(() => {
        if (updatedCosts) costsRefetch();
    }, [updatedCosts])
    
    useEffect(() => {
        if (budgetData) {
            const { budget: [{ period, people: { paying, free} }]} = budgetData
            const periodStart = dayjs(period.start);
            const periodEnd = dayjs(period.end);
            const periodDays = (periodEnd.diff(periodStart, 'days'))+1;
        
            getBudgetTotal({
                variables: { 
                    budgetId: requestedBudget,
                    people: { paying, free },
                    days: periodDays
                }
            })
        };
    }, [budgetData])
    
    if (!budgetLoading && budgetData && costsData) {
        const { budget } = budgetData || [];
        const { title, groupId, comment, period: { start, end }, people } = budget[0];
        const { cost: costs } = costsData || [];
        
        const periodStart = dayjs(start);
        const periodEnd = dayjs(end);
        const periodDays = (periodEnd.diff(periodStart, 'days'))+1;
        const periodNights = periodDays - 1;
        
        const peopleTotal = people.paying + people.free;
        // const budgetTotalReduced = budgetTotal.reduce((a, b) => {
        //     return {total: a.total + b.total}
        // });
        
        /**
         * TODO: make sortable
         * https://github.com/SortableJS/react-sortablejs
         */
                        
        return (
            <Page theme="budget" ignore>
                <header>
                    <Section container>
                        <div className="mb-5 d-flex align-items-center justify-content-between">
                            <Link to={`/group/${groupId}`} className="btn btn--simple btn--icon"><box-icon name='left-arrow-alt'></box-icon> Overzicht budgetten</Link>
                            <div className="btn-group">
                                <OnAuth>
                                    <button className="btn btn--sub" onClick={() => setModalBudgetState(!modalBudgetState)}>Bewerken</button>
                                    <button className="btn btn--icon" onClick={() => setModalShareState(!modalShareState)}><box-icon name='share-alt'></box-icon> Delen</button>
                                    <button className="btn btn--icon" onClick={() => toast('Functie nog niet beschikbaar')}><box-icon name='cube-alt'></box-icon> Simulatie</button>
                                    <button className="btn btn--icon" onClick={() => toast('Functie nog niet beschikbaar')}><box-icon type='solid' name='analyse'></box-icon> Stats</button>
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
                                <h1 className="mb-0 color--blue500">{ budgetTotal && budgetTotal.budgetTotal.pricify() || (0).pricify() }</h1>
                                <small className="color--blue300">{ budgetTotal ? (budgetTotal.budgetTotal/peopleTotal).pricify() : (0).pricify() } per persoon</small>
                            </div>
                        </div>
                    </Section>
                </header>
                
                <Section container>
                    { costsLoading && <WaveTopBottomLoading/> }
                    {   !costsLoading && costs ? 
                        costs.map(c =>
                            <Cards.Cost key={c.id} data={c} budgetData={{...budget[0], stay: { days: periodDays, nights: periodNights } }} />
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
                
                {/* SHARES */}
                <Popup open={modalShareState} position="right center" modal className={"edit-cost"} closeOnDocumentClick={false}>
                    <div className="modal__body">
                        <h3 className="text-center">Shares</h3>
                        <Forms.Share
                            states={{
                                updateShare: [ updatedBudget, setUpdateBudget ],
                                modal: () => setModalShareState(!modalShareState)
                            }}
                            budgetId={ requestedBudget }
                        />
                        <hr className="my-4"/>
                        <SharesList budgetId={ requestedBudget }/>
                    </div>
                    <div className="modal__actions btn-group mt-4">
                        <button className="btn btn--sub" onClick={() => setModalShareState(!modalShareState)}>Sluiten</button>
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