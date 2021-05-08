import { useQuery, gql, useMutation, useLazyQuery } from '@apollo/client';
import React, { useEffect, useState, useContext } from 'react';
import { WaveTopBottomLoading } from 'react-loadingg';
import { Link, Redirect, useParams } from 'react-router-dom';
import Popup from 'reactjs-popup';
import dayjs from 'dayjs';
import 'dayjs/locale/nl-be';

import { Card, Cards, CostsList, Forms, NotifyNotFound, OnAuth, Section } from '../../components';
import { useBudgetPeriod } from '../../hooks'
import { Page } from '../../layouts';
import './index.scss';
import '../../utils/index';
import 'reactjs-popup/dist/index.css';
import { AccessDeniedPage } from '..';
import { BudgetProvider, useBudget } from '../../contexts';
import { QUERIES } from '../../utils/index';

dayjs.locale('nl-be') 

export default () => {
    const { id: requestedShare } = useParams();
    const [ simulation, setSimulation ] = useState({})
    const { loading: getShareLoading, data: getShareData, error: getShareError } = useQuery(QUERIES.GET_SHARE, {
        variables: { id: requestedShare }
    })
    const [ getBudgetTotal, { data: budgetTotal, loading: budgetTotalLoading, refetch: refetchBudgetTotal }] = useLazyQuery(QUERIES.GET_BUDGET_TOTAL);
    
    useEffect(() => {
        if (getShareData) setSimulation(getShareData.share[0])
    }, [getShareData])
    
    useEffect(() => {
        if (getShareData) {
            const { budget: { id, period, people: { paying, free } }} = getShareData.share[0]
            const periodStart = dayjs(period.start);
            const periodEnd = dayjs(period.end);
            const periodDays = (periodEnd.diff(periodStart, 'days'))+1;
        
            getBudgetTotal({
                variables: { 
                    budgetId: id,
                    people: { paying, free },
                    days: periodDays
                }
            })
        };
    }, [getShareData])
    
    if (getShareError) return <getShareError />
    if (!getShareData) return <WaveTopBottomLoading/>            
    else {
        const { budget, costs } = getShareData.share[0];
        const { title, groupId, comment, period: { start, end }, people } = budget;
        
        const periodStart = dayjs(start);
        const periodEnd = dayjs(end);
        const periodDays = (periodEnd.diff(periodStart, 'days'))+1;
        const periodNights = periodDays - 1;
        
        const peopleTotal = people.paying + people.free;
        // const budgetTotalReduced = budgetTotal.reduce((a, b) => {
        //     return {total: a.total + b.total}
        // });
                                
        return (
            <Page theme="budget" ignore>
                    <header>
                        <Link to="/login">
                            <div className="bg--blue500">
                                <p className="fw-bolder text-center text-white p-2 d-flex align-middle justify-content-center">
                                    {/* <box-icon name='show' class="d-inline-block fill-white mr-2"></box-icon>  */}
                                    Je bekijkt dit budget als gast, meld je aan om te bewerken
                                    <box-icon name='right-arrow-alt' class="d-inline-block fill-white mr-2" style={{ opacity: .7 }}></box-icon>
                                </p>
                            </div>
                        </Link>
                        <Section container>
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
                        {/* { costsLoading && <WaveTopBottomLoading/> } */}
                        {/* {   costs ? 
                            costs.map(c =>
                                <Cards.Cost key={c.id} data={c} budgetData={{...budget, stay: { days: periodDays, nights: periodNights } }} editable={false} states={{
                                    budgetTotal: [ budgetTotal, setBudgetTotal ]
                                }} />
                            ) : 
                            null
                        } */}
                        { <CostsList budgetData={{ ...budget, stay: { days: periodDays, nights: periodNights }}} editable={ false } />}
                        { (costs && costs.length == 0) && <NotifyNotFound/> }
                    </Section>
            </Page>
        )
    }
}