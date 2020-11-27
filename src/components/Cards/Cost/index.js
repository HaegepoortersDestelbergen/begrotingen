import { gql, useMutation } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { Card } from '../..';
import './index.scss';
import '../../../utils';


const DELETE_COST = gql`
    mutation deleteCost($id: String) {
        deleteCost(id: $id){
            id
        }
    }
`;

export default ({ data, budgetData, states, onClick, editable }) => {       
    const [ collapseState, setCollapseState ] = useState(true);
    const [ budgetTotal, setBudgetTotal ] = states.budgetTotal;
    const [ modalState, setModalState ] = states.modal;
    const [ deleteCost, { loading, data: deleteCostData, error }] = useMutation(DELETE_COST, {variables: {
        id: data.id
    }})
        
    const people = calcCostType(data.type, budgetData.people)
    const when = calcCostWhen(data.when, budgetData.stay)
    const totalAmount = ((people * data.amount) * when);
    
    const toggleModal = () => {
        setModalState(!modalState)
    }
    
    useEffect(() => {    
        setBudgetTotal(prev => [...prev, ...[{
            id: data.id,
            total: totalAmount
        }]])
    }, [])
    
    const handleDelete = (e) => {
        deleteCost()
        if (!loading) e.target.closest('.card').remove();
    }
    
    return (
        <Card theme="cost" className={`collapse collapse--${collapseState}`}>
            <div className="card__top" onClick={() => setCollapseState(!collapseState)}>
                <div className="card__header">
                    <div className="card__icon">{ CategoryIcon(data.category) }</div>
                    <div>
                        <h3>{ data.title }</h3>
                        <small>{ data.comment }</small>
                    </div>
                </div>
                <div className="card__price">
                    <h3>{totalAmount >= 0 && '+'}{ totalAmount.pricify() }</h3>
                    <small>{ costTypeContext(data.type) }</small>
                </div>
            </div>
            {/* <hr className="striped"/> */}
            <div className="card__btm">
                <div className="card__detail">
                    <p>Uitgave van <strong>{ (totalAmount / budgetData.people.paying).pricify() } per persoon</strong></p>
                    <small>{ costTypeDetail(data.type) }, verekend per betalende persoon</small>
                </div>
                <div className="card__actions">
                    <div className="btn-group">
                        <button className="btn btn--sub btn--icon" onClick={(e) => handleDelete(e)}><box-icon name='trash'></box-icon> Verwijder kost</button>
                        <button className="btn" onClick={toggleModal}>Bewerken</button>
                    </div>
                </div>
            </div>
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

const calcCostType = (prop, { paying, free }) => {
    return {
        FIXED: 1,
        PER_PERSON: paying + free,
        PER_PAYER: paying,
        PER_FREE: free,
        INCOME: -1
    }[prop]
}

const costTypeContext = (prop) => {
    return {
        FIXED: 'Vaste kost, ongeacht aantal personen',
        PER_PERSON: 'Totaalkost, alle personen',
        PER_PAYER: 'Totaalkost, per betalende personen',
        PER_FREE: 'Totaalkost, per niet-betalende personen',
        INCOME: 'Inkomst, wordt afgetrokken'
    }[prop]
}

const costTypeDetail = (prop) => {
    return {
        FIXED: 'Kost voor heel de groep, verekend per betalende persoon',
        PER_PERSON: 'Kost voor elke persoon uit de groep',
        PER_PAYER: 'Kost voor elke betalende persoon uit de groep',
        PER_FREE: 'Kost voor elke niet-betalende persoon uit de groep',
        INCOME: 'Deze inkomsten worden afgetrokken van het totaal van deze begroting'
    }[prop]
}

const calcCostWhen = (prop, { days, nights }) => {
    return {
        ONETIME: 1,
        PER_DAY: days,
        PER_NIGHT: nights
    }[prop]
}