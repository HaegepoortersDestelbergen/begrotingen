import { gql, useQuery } from '@apollo/client';
import React, { useContext } from 'react';
import { Page } from '../../layouts';
import { WaveTopBottomLoading } from 'react-loadingg';
import { Link, Route } from 'react-router-dom';
import { Cards, OnAuth, Section } from '../../components';
import { AuthContext } from '../../contexts';
import './index.scss';

const GET_GROUPS = gql`
    query {group {
            id
            name
        }
    }
`;

export default () => {
    const {loading: groupsLoading, data: groupsData, error: groupsError, refetch: groupsRefetch } = useQuery(GET_GROUPS);
    const { group: allGroups } = groupsData || [];
    const [authenticatedUser, authenticateUser] = useContext(AuthContext);
    return (
        <Page theme="start">
            <h1>Welke tak?</h1>
            <h2 className="page__subtitle">Kies een tak om begrotingen te bekijken of bewerken</h2>
            <Section theme="groups-list" container>
                {allGroups && authenticatedUser ? allGroups.map(g => {
                    const groupAccess = authenticatedUser.access.find(a => a.groupId === g.id);
                    if (groupAccess.type != 'none') return <Link key={g.id} to={`/group/${g.id}`} className="mb-3">
                        <Cards.Group data={g}/>
                    </Link>
                }
                ) : <WaveTopBottomLoading/>}
            </Section>
        </Page>
    )
}