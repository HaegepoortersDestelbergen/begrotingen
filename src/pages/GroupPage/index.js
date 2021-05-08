import { useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { WaveTopBottomLoading } from 'react-loadingg';
import { Link, useParams } from 'react-router-dom';
import Popup from 'reactjs-popup';
import { Section, Forms, OnAuth, BudgetsList } from '../../components';
import { Page } from '../../layouts';
import { QUERIES } from '../../utils';
import './index.scss';

export default () => {
    const { id: requestedGroupId } = useParams();
    const [ updatedBudgets, updateBudgets ] = useState([]);
    const [ modalState, setModalState ] = useState(false);
    const { loading: groupLoading, data: groupData, error: groupError } = useQuery(QUERIES.GET_GROUP, {
        variables: {id: requestedGroupId}
    })
    
    const toggleModal = (e) => {
        setModalState(!modalState)
    }
    
    if (groupData) {
        const { group: [ group ]} = groupData;

        return (
            <Page theme="group" ignore>
                <header>
                    <Section container>
                        <div className="mb-5 d-flex justify-content-between">  
                            <Link to="/" className="btn btn--simple btn--icon"><box-icon name='left-arrow-alt'></box-icon> Overzicht groepen</Link>
                            <div className="btn-group">
                                <OnAuth group={ requestedGroupId }>
                                    <button className="btn" onClick={toggleModal}>Nieuwe begroting</button>
                                </OnAuth>
                            </div>
                        </div>
                        <h1 className="page__title">{ group.name }</h1>
                        <h2 className="page__subtitle">Overzicht van begrotingen</h2>
                    </Section>
                </header>
                
                <Section container>
                    <BudgetsList groupId={ requestedGroupId } />
                </Section>
                
                <Popup open={modalState} position="right center" modal className={"edit-cost"} closeOnDocumentClick={false}>
                    <div className="modal__body">
                        <Forms.Budget groupData={ group } states={{
                            modal: toggleModal
                        }}/>
                    </div>
                </Popup>
            </Page>
        )
    } else return <WaveTopBottomLoading/>
}