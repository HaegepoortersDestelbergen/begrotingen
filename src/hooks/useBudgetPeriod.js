import React from 'react';
import dayjs from 'dayjs';

dayjs.locale('nl-be') 

export default ( periodData ) => {
    const { start, end } = periodData;
    
    const periodStart = dayjs(start);
    const periodEnd = dayjs(end);
    
    const days = (periodEnd.diff(periodStart, 'days'))+1;
    const nights = periodDays - 1;
    
    return {
        days, nights
    }
}