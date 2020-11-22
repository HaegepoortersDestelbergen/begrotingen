import React, { useEffect, useState } from 'react';
import { Page } from '../../layouts';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Card, Cards, Forms, Section } from '../../components';
import MultiSelect from "@kenshooui/react-multi-select";
import './index.scss';
import { gql, useLazyQuery, useQuery } from '@apollo/client';

const GET_GROUPS = gql`
    query {group {
            id
            name
        }
    }
`;

const GET_USERS = gql`
    query {
        user {
            id
            name
            email
        }
    }
`;

export default () => {
    const {loading: groupsLoading, data: groupsData, error: groupsError, refetch: groupsRefetch } = useQuery(GET_GROUPS);
    const {loading: userssLoading, data: usersData, error: usersError, refetch: usersRefetch } = useQuery(GET_USERS);
    const [update, updateList] = useState([]);
    
    const { group: allGroups } = groupsData || [];
    const { user: allUsers } = usersData || [];
    
    useEffect(() => {
        groupsRefetch();
    }, [update])
    
    return (
        <Page ignore key={update}>
            <div className="container py-5">
                <h1 className="page__title">Configuratie</h1>
            </div>
            
            <Tabs>
                <div className="container"> 
                    <TabList>
                        <Tab>Groepen</Tab>
                        <Tab>Gebruikers</Tab>
                        <Tab>Instellingen</Tab>
                    </TabList>
                </div>

                <TabPanel>
                    <div className="container">
                        <div className="mb-5"> 
                            <h2>Groepen</h2>
                            <Forms.Group className="form--inline" state={[update, updateList]}/>
                        </div>
                        {allGroups && allGroups.map(g => g.name && <Cards.Group editable key={g.id} data={g}/> || null )}
                    </div>
                </TabPanel>
                <TabPanel>
                    <div className="container"> 
                        <div className="mb-5"> 
                            <h2>Gebruikers</h2>
                            <Forms.User className="form--inline" state={[update, updateList]}/>
                        </div>
                        {allUsers && allUsers.map(u => u.name && <Cards.User editable key={u.id} data={u} /> || null )}
                    </div>
                </TabPanel>
                <TabPanel>
                    <div className="container"> 
                        <h2>Instellingen</h2>
                    </div>
                </TabPanel>
            </Tabs>
        </Page>
    )
}