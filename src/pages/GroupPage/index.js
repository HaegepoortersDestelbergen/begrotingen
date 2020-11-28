import { useQuery, gql } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { WaveTopBottomLoading } from 'react-loadingg';
import { Link, useParams } from 'react-router-dom';
import Popup from 'reactjs-popup';
import { Card, Cards, Section, Forms, OnAuth } from '../../components';
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

export default () => {
    const { id: requestedGroupId } = useParams();
    const [ updatedBudgets, updateBudgets ] = useState([]);
    const [ modalState, setModalState ] = useState(false);
    const { loading: groupLoading, data: groupData, error: groupError } = useQuery(GET_GROUP, {
        variables: {id: requestedGroupId}
    })
    const {loading: budgetsLoading, data: budgetsData, error: budgetsError, refetch } = useQuery(GET_BUDGETS, {
        variables: {groupId: requestedGroupId}
    })
    
    const { group } = groupData || [];
    const { budget: budgets } = budgetsData || [];
    
    const toggleModal = (e) => {
        setModalState(!modalState)
    }
    
    useEffect(() => {
        refetch();
    }, [updatedBudgets])
    
    useEffect(() => {
        refetch();
    }, [])
    
    if (group) {
        const { name } = group[0];
        
        return (
            <Page theme="group" ignore> 
                <header>
                    <Section container>
                        <div className="mb-5 d-flex justify-content-between">  
                            <Link to="/" className="btn btn--simple btn--icon"><box-icon name='left-arrow-alt'></box-icon> Overzicht groepen</Link>
                            <div className="btn-group">
                                <OnAuth>
                                    <button className="btn" onClick={toggleModal}>Nieuwe begroting</button>
                                </OnAuth>
                            </div>
                        </div>
                        <h1 className="page__title">{ name }</h1>
                        <h2 className="page__subtitle">Overzicht van begrotingen</h2>
                    </Section>
                </header>
                <Section container>
                    {budgets ? budgets.map(b => <Link key={b.id} to={`/budget/${b.id}`} className="mb-3">
                        <Cards.Budget data={b}/>
                    </Link>) : <WaveTopBottomLoading/>}
                </Section>
                <Popup open={modalState} position="right center" modal className={"edit-cost"} closeOnDocumentClick={false}>
                    <div className="modal__body">
                        <Forms.Budget groupData={group[0]} states={{
                            updatedBudgets: [ updatedBudgets, updateBudgets ],
                            modal: toggleModal
                        }}/>
                    </div>
                </Popup>
            </Page>
        )
    } else {
        return <WaveTopBottomLoading/>
    }
    
}