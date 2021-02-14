import { useQuery, useSubscription } from '@apollo/client';
import React, { useEffect } from 'react';
import { WaveTopBottomLoading } from 'react-loadingg';
import { Cards, NotifyNotFound } from '..';
import { QUERIES, SUBS } from '../../utils';
import NotifyNoNetwork from '../NotifyNoNetwork';

export default ({ groupId }) => {
    if (!groupId) throw new Error('[BudgetsList] No groupId found');
    
    const { data: budgetChanges } = useSubscription(SUBS.BUDGET_ADDED, {
        variables: { groupId }
    });
    
    const { data, loading, refetch, error } = useQuery(QUERIES.GET_GROUP_BUDGETS, {
        variables: { groupId }
    });
    
    useEffect(() => {
        refetch()
    }, [budgetChanges])
    
    if (error) return <NotifyNoNetwork onClick={ refetch } />
    else if (loading) return <WaveTopBottomLoading />
    else if (data.budget.length == 0) return <NotifyNotFound msg="Er werden geen budgetten gevonden" />
    else return data.budget.map(b => <Cards.Budget key={ b.id } data={b} />)
}