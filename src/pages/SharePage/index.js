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

dayjs.locale('nl-be') 

const GET_SHARE = gql`
    query share($id: String) {
        share(id: $id) {
            id
            budgetId
            budget {
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
            costs {
                id
                title
            }
        }
    }
`;

export default () => {
    const { id: requestedShare } = useParams();
    const [ budgetTotal, setBudgetTotal ] = useState([{id: null, total: 0}]);
    const { loading: getShareLoading, data: getShareData, error: getShareError } = useQuery(GET_SHARE, {
        variables: { id: requestedShare }
    })
    
    if (getShareData) {
        const { budget, costs } = getShareData.share[0];
        const { title, groupId, comment, period: { start, end }, people } = budget
        
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
                    {/* { costsLoading && <WaveTopBottomLoading/> } */}
                    {   costs ? 
                        costs.map(c =>
                            <Cards.Cost key={c.id} data={c} budgetData={{...budget, stay: { days: periodDays, nights: periodNights } }} editable={false} states={{
                                budgetTotal: [ budgetTotal, setBudgetTotal ]
                            }} />
                        ) : 
                        null
                    }
                    { (costs && costs.length == 0) && <NotifyNotFound/> }
                </Section>
            </Page>
        )
    } else {
        return <WaveTopBottomLoading/>
    } 
}