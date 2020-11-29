import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { WaveTopBottomLoading } from 'react-loadingg';
import { Card, Cards } from '..';

const GET_SHARES = gql`
    query share($budgetId: String) {
        share(budgetId: $budgetId) {
            id
            budgetId
            expires
            rights
            label
            created
        }
    }
`;

export default ({ budgetId }) => {
    const { loading: getSharesLoading, data: getSharesData, error: getSharesError } = useQuery(GET_SHARES, {
        variables: { budgetId: budgetId }
    })
    
    if (getSharesData) console.log(getSharesData);
        
    return (
        <div>
            {!getSharesLoading && getSharesData ? getSharesData.share.map(s => 
                <Cards.Share key={ s.id } data={ s } />
            ) : <WaveTopBottomLoading/>}
        </div>
    )
}