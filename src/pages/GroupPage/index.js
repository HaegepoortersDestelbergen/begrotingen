import { useQuery, gql } from '@apollo/client';
import React, { useEffect } from 'react';
import { WaveTopBottomLoading } from 'react-loadingg';
import { Link, useParams } from 'react-router-dom';
import { Card, Cards, Section } from '../../components';
import { Page } from '../../layouts';
import './index.scss';

const GET_GROUP = gql`
    query group($id: String) {
        group(id: $id) {
            id
            name
        }
    }
`;

const GET_BUDGETS = gql`
    query budget($groupId: String) {
        budget(groupId: $groupId) {
            id
            title
            created
            groupId
        }
    }
`;

export default () => {
    const { id: requestedGroupId } = useParams();
    
    const { loading: groupLoading, data: groupData, error: groupError } = useQuery(GET_GROUP, {
        variables: {id: requestedGroupId}
    })
    const {loading: budgetsLoading, data: budgetsData, error: budgetsError, refetch } = useQuery(GET_BUDGETS, {
        variables: {groupId: requestedGroupId}
    })
    
    const { group } = groupData || [];
    const { budget: budgets } = budgetsData || [];
    
    useEffect(() => {
        refetch();
    }, [])
    
    if (group) {
        const { name } = group[0];
        
        return (
            <Page theme="group" ignore> 
                <header>
                    <Section container>
                        <Link to="/">Overzicht groepen</Link>
                        <h1>{ name }</h1>
                        <h2>Overzicht van begrotingen</h2>
                    </Section>
                </header>
                <Section container>
                    {budgets ? budgets.map(b => <Link key={b.id} to={`/budget/${b.id}`} className="mb-3">
                        <Cards.Budget data={b}/>
                    </Link>) : <WaveTopBottomLoading/>}
                </Section>
            </Page>
        )
    } else {
        return <WaveTopBottomLoading/>
    }
    
}