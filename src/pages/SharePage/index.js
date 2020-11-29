import { useQuery, gql, useMutation, useLazyQuery } from '@apollo/client';
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

const GET_COSTS = gql`
    query cost($budgetId: String) {
        cost(budgetId: $budgetId) {
            id
        }
    }
`;

const GET_SHARE = gql`
    query share($id: String) {
        share(id: $id) {
            id
        }
    }
`;

const GET_ALL = gql`
    query all($budgetId: String) {
        budget: budget(id: $budgetId) {
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
        },
        costs: cost(budgetId: $budgetId) {
            id
        }
    }
`;

export default () => {
    const { id: requestedShare } = useParams();
    const [ budgetTotal, setBudgetTotal ] = useState([{id: null, total: 0}]);
    const [ getAll, { loading: getAllLoading, data: getAllData, error: getAllError }] = useLazyQuery(GET_ALL);
    const { loading: getShareLoading, data: getShareData, error: getShareError } = useQuery(GET_SHARE, {
        variables: { id: requestedShare }
    })
    const { loading: budgetLoading, data: budgetData, error: budgetError } = useQuery(GET_BUDGET, {
        variables: { id: getShareData && getShareData.share[0].budgetId }
    })
    const { loading: costsLoading, data: costsData, error: costsError } = useQuery(GET_COSTS, {
        variables: { budgetId: getShareData && getShareData.share[0].budgetId }
    })
    
    console.log(getShareData && {getShareData })
    
    useEffect(() => {
        console.log('reload getShareData')
        if (getShareData) {
            getAll({
                variables: { budgetId: getShareData.share[0].budgetId }
            })
        }
    }, [getShareLoading])
    
    
    useEffect(() => {
        if (getAllData) console.log(getAllData)
    }, [getAllData])
    
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
                    {   !costsLoading && costsData ? 
                        costsData.cost.map(c =>
                            <Cards.Cost key={c.id} data={c} budgetData={{...budget[0], stay: { days: periodDays, nights: periodNights } }} editable={false} states={{
                                budgetTotal: [ budgetTotal, setBudgetTotal ]
                            }} />
                        ) : 
                        null
                    }
                    { (!costsLoading && costs.length == 0) && <NotifyNotFound/> }
                </Section>
            </Page>
        )
    } else {
        return <WaveTopBottomLoading/>
    } 
}