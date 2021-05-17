import { useQuery, useLazyQuery, useSubscription } from '@apollo/client';
import React, { useEffect, useState, useContext } from 'react';
import { WaveTopBottomLoading } from 'react-loadingg';
import { Link, Redirect, useParams } from 'react-router-dom';
import Popup from 'reactjs-popup';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import { Card, Cards, Forms, NotifyNotFound, OnAuth, Section, SharesList, CostsList, ButtonOverflow, Form, FormInput } from '../../components';
import { Page } from '../../layouts';
import './index.scss';
import '../../utils/index';
import 'reactjs-popup/dist/index.css';
import { QUERIES, SUBS } from '../../utils/index';
import { useBudget } from '../../contexts';

dayjs.locale('nl-be') 

export default () => {
    const { id: requestedBudget } = useParams();
    const [ modalState, setModalState ] = useState(false);
    const [ modalBudgetState, setModalBudgetState ] = useState(false);
    const [ modalShareState, setModalShareState ] = useState(false);
    const [ updatedBudget, setUpdateBudget ] = useState([]);
    const [ simulation, setSimulation ] = useState({}); 
    
    const { loading: budgetLoading, data: budgetData, error: budgetError } = useQuery(QUERIES.GET_BUDGET, {
        variables: { id: requestedBudget }
    })
    
    const { data: costChanges } = useSubscription(SUBS.COST_EDITED, {
        variables: { budgetId: requestedBudget }
    })
            
    const [ getBudgetTotal, { data: budgetTotal, loading: budgetTotalLoading, refetch: refetchBudgetTotal }] = useLazyQuery(QUERIES.GET_BUDGET_TOTAL)
    
    const toggleModal = (e) => {
        setModalState(!modalState)
    }
    
    /**
     * TODO: simulation with context provider
     */
    
    // useEffect(() => {
    //     setSimulation(budgetData)
    // }, [budgetData])
    
    useEffect(() => {
        if (budgetData) {
            const { budget: [{ period, people: { paying, free} }]} = budgetData
            const periodStart = dayjs(period.start);
            const periodEnd = dayjs(period.end);
            const periodDays = (periodEnd.diff(periodStart, 'days'))+1;
        
            refetchBudgetTotal({
                variables: { 
                    budgetId: requestedBudget,
                    people: { paying, free },
                    days: periodDays
                }
            })
        };
    }, [costChanges])
    
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
    
    if (!budgetLoading && budgetData) {
        const { budget: [ budget ]} = budgetData || [];
        const { title, groupId, comment, period: { start, end }, people } = budget;
        
        const periodStart = dayjs(start);
        const periodEnd = dayjs(end);
        const periodDays = (periodEnd.diff(periodStart, 'days'))+1;
        const periodNights = periodDays - 1;
        
        const peopleTotal = people.paying + people.free;
        
        /**
         * TODO: make sortable
         * https://github.com/SortableJS/react-sortablejs
         */
        
        console.log('groupId', groupId)
                        
        return (
            <Page theme="budget" ignore>
                <header>
                    <Section container>
                        <div className="mb-5 d-flex align-items-center justify-content-between">
                            <Link to={`/group/${groupId}`} className="btn btn--simple btn--icon"><box-icon name='left-arrow-alt'></box-icon> Overzicht budgetten</Link>
                            <div className="btn-group">
                                <OnAuth group={ groupId }>
                                    <ButtonOverflow 
                                        onMobile={<>
                                            <button className="btn btn--sub btn--w-full" onClick={() => setModalBudgetState(!modalBudgetState)}>Bewerken</button>
                                            <div className="btn-group">
                                                    <button className="btn btn--icon mb-0" onClick={() => setModalShareState(!modalShareState)}><box-icon name='share-alt'></box-icon> Delen</button>
                                                    <button className="btn btn--w-full mb-0" onClick={toggleModal}> Nieuwe kost</button>
                                            </div>
                                        </>}
                                    >
                                        <button className="btn btn--sub" onClick={() => setModalBudgetState(!modalBudgetState)}>Bewerken</button>
                                        <button className="btn btn--icon" onClick={() => setModalShareState(!modalShareState)}><box-icon name='share-alt'></box-icon> Delen</button>
                                        <button className="btn btn--icon" onClick={() => toast('Functie nog niet beschikbaar')}><box-icon name='cube-alt'></box-icon> Simulatie</button>
                                        <button className="btn btn--icon" onClick={() => toast('Functie nog niet beschikbaar')}><box-icon type='solid' name='analyse'></box-icon> Stats</button>
                                        <button className="btn" onClick={toggleModal}> Nieuwe kost</button>
                                    </ButtonOverflow>
                                </OnAuth>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 col-md-6">
                                <h1 className="page__title text-center text-md-left">{ title }</h1>
                                <h2 className="page__subtitle text-center text-md-left">Van { periodStart.format('DD MMM') } tot { periodEnd.format('DD MMM') } — { peopleTotal } personen</h2>
                                <p className="text-center text-md-left mt-0 mt-md-2">{ comment }</p> 
                            </div>
                            <div className="col-12 col-md-6 mt-3 mt-md-0 d-flex flex-column align-items-center align-items-md-end justify-content-center justify-content-md-start">
                                <h1 className="mb-0 color--blue500">{ budgetTotal && budgetTotal.budgetTotal.pricify() || (0).pricify() }</h1>
                                <small className="color--blue300">{ budgetTotal ? (budgetTotal.budgetTotal/peopleTotal).pricify() : (0).pricify() } per persoon</small>
                            </div>
                        </div>
                    </Section>
                </header>
                {/* <div className="container">
                    <Form className="mt-4" onSubmit={ console.log }>
                        <FormInput name="query" placeholder="Zoek in kosten" />
                    </Form>
                </div> */}
                <Section container>
                    <CostsList budgetData={{ ...budget, stay: { days: periodDays, nights: periodNights } }} />
                </Section>
                
                {/* ADD COST */}
                <Popup open={modalState} position="right center" modal className={"edit-cost"} closeOnDocumentClick={false}>
                    <div className="modal__body">
                        <Forms.Cost states={{
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