import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import { Card } from '../..';
import './index.scss';

const DELETE_GROUP = gql`
    mutation deleteGroup($id: String) {
        deleteGroup(id: $id) {
            id
            name
        }
    }
`;

export default ({ data, budgetData, onClick, editable }) => {       
    const [ collapseState, setCollapseState ] = useState(true);
    const [deleteGroup, { loading, data: deleteGroupData, error }] = useMutation(DELETE_GROUP, {variables: {
        id: data.id
    }})
    
    const handleDelete = (e) => {
        deleteGroup()
        if (!loading) e.target.closest('.card').remove();
    }
    
    return (
        <Card theme="cost" className={`collapse collapse--${collapseState}`} onClick={() => setCollapseState(!collapseState)}>
            <div className="card__top">
                <div className="card__header">
                    <div className="card__icon">{ CategoryIcon(data.category) }</div>
                    <div>
                        <h3>{ data.title }</h3>
                        <small>{ data.comment }</small>
                    </div>
                </div>
                <div className="card__price">
                    <h3>+{ data.amount } euro</h3>
                    <small>about this price</small>
                </div>
            </div>
            <hr className="striped"/>
            <div className="card__btm">
                <div className="card__detail">
                    <p>Uitgave van 3,30 euro per persoon</p>
                    <small>Kost voor heel de group, verekend per betalende persoon</small>
                </div>
                <div className="card__actions">
                    <button className="btn">Bewerken</button>
                </div>
            </div>

            {/* <div className="d-flex gap--col">
                 <strong>{ data.title }</strong>
            </div>
            {editable && 
                <div>
                    <button className="btn btn--blank" onClick={handleDelete}><box-icon name='x'></box-icon></button>
                </div>
            } */}
        </Card>
    )
}

const CategoryIcon = (prop) => {
    return {
        SHOPPING: <box-icon name='shopping-bag'></box-icon>,
        FOOD: <box-icon name='restaurant'></box-icon>,
        LOCATION: <box-icon name='building-house'></box-icon>,
        DRINKS: <box-icon name='drink'></box-icon>,
        TRANSPORT: <box-icon name='train'></box-icon>,
        NIGHT: <box-icon name='bed'></box-icon>,
        INSURANCE: <box-icon name='check-shield'></box-icon>,
        GWE: <box-icon name='plug'></box-icon>,
        OTHER: <box-icon name='coin'></box-icon>
    }[prop]
}