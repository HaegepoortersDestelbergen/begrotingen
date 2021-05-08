import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { QUERIES } from '../../utils';
import { CostsList } from '../../components';
import WaveTopBottomLoading from 'react-loadingg';
import dayjs from 'dayjs';

const BudgetContext = createContext();

const BudgetProvider = ({ children, budgetId }) => {
    const [period, setPeriod] = useState({
        start: new Date(),
        end: new Date(),
        days: 0,
        nights: 0
    });
    const { data: budgetData, loading: budgetLoading, error: budgetError } = useQuery(QUERIES.GET_BUDGET, {
        variables: { id: budgetId }
    })
    const [getBudgetTotal, { data: budgetTotalData, loading: budgetTotalLoading, error: budgetTotalError }] = useLazyQuery(QUERIES.GET_BUDGET_TOTAL);
    
    useEffect(() => {
        if (budgetData) {
            const [{ period: { start, end }, people: { paying, free }}] = budgetData.budget;
            const periodStart = dayjs(start);
            const periodEnd = dayjs(end);
            const periodDays = (periodEnd.diff(periodStart, 'days'))+1;
            const periodNights = periodDays - 1;
            
            setPeriod({
                start: periodStart,
                end: periodEnd,
                days: periodDays,
                nights: periodNights
            })
            
            getBudgetTotal({
                variables: {
                    budgetId,
                    people: { paying, free },
                    days: periodDays
                }
            })
        }
    }, [budgetData])
    
    if (!budgetData) return <WaveTopBottomLoading />
    const budget = budgetData.budget
    
    const returnedContext = {
        TotalPrice: <p>{ 10 } euro</p>,
        CostsList: <CostsList budgetData={{ ...budget, stay: { days: period.days, nights: period.nights }}} />
    }
    
    return <BudgetContext.Provider value={{ ...returnedContext }}>
        { children }
    </BudgetContext.Provider>
}

export const useBudget = () => useContext(BudgetContext);
export default BudgetProvider