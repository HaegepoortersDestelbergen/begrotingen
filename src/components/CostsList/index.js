import React, { useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { WaveTopBottomLoading } from 'react-loadingg';

import { Cards, NotifyNotFound } from '..';
import { QUERIES, SUBS } from '../../utils';
import NotifyNoNetwork from '../NotifyNoNetwork';

export default ({ budgetData }) => {
    if (!budgetData) throw new Error('[CostsList] No budgetId found');
    
   const { data: costChanges } = useSubscription(SUBS.COST_EDITED, {
        variables: { budgetId: budgetData.id }
    })
    
    const { loading, data, refetch, error } = useQuery(QUERIES.GET_COSTS_BY_BUDGET, {
        variables: { budgetId: budgetData.id }
    });
    
    useEffect(() => {
        refetch({
            variables: { budgetId: budgetData.id }
        });
    }, [costChanges])
    
    if (error) return <NotifyNoNetwork onClick={ refetch } />
    else if (loading) return <WaveTopBottomLoading />
    else if (data.cost.length == 0) return <NotifyNotFound msg="Er werden geen kosten gevonden" />
    else return data.cost.map(c => <Cards.Cost key={ c.id } data={ c } budgetData={ budgetData } />)
}