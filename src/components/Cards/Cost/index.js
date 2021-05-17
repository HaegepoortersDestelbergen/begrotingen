import React, { useEffect, useState, forwardRef } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import Popup from 'reactjs-popup';
import { Card, OnAuth, Forms } from '../..';
import './index.scss';
import '../../../utils';
import WaveTopBottomLoading from 'react-loadingg/lib/WaveTopBottomLoading';
import { Draggable } from 'react-beautiful-dnd';


const DELETE_COST = gql`
    mutation deleteCost($cost: CostInput) {
        deleteCost(cost: $cost)
    }
`;

const Cost = forwardRef(({ data: { __typename, ...data }, budgetData, states, onClick, editable = true, index }, ref) => {
    const [ collapseState, setCollapseState ] = useState(true);
    const [ modalState, setModalState ] = useState(false);
    const [ costState, setCostState ] = useState(data);
    
    const [ deleteCost, { loading, data: deleteCostData, error }] = useMutation(DELETE_COST, { variables: {
        cost: data
    }})
    
    const { category, title, comment, type, when, amount } = data;
    const peopleCalc = calcCostType(type, budgetData.people)
    const whenCalc = calcCostWhen(when, budgetData.stay)
    const totalAmount = ((peopleCalc * amount) * whenCalc);
    
    const handleDelete = (e) => {
        deleteCost()
        // if (!loading) e.target.closest('.card').remove();
    }    
        
    return (
        <Draggable draggableId={ data.id } index={ index }>
            {(provided) =>
                <div
                    className="card-cost__wrapper"
                    { ...provided.draggableProps }
                    ref={ provided.innerRef }
                >
                    <Card 
                        theme="cost" 
                        className={`collapse collapse--${collapseState}`}
                    >
                        <div className="card__top" onClick={() => setCollapseState(!collapseState)}>
                            <div className="card__header">
                                {editable ? <div className="card__icon"
                                    { ...provided.dragHandleProps }
                                >
                                    <box-icon name='menu' class="opacity-05 mr-3"></box-icon>
                                    { CategoryIcon(category) }
                                </div> : <div className="card__icon">{ CategoryIcon(category) }</div>}
                                <div>
                                    <h3>{ title }</h3>
                                    <small>{ comment }</small>
                                </div>
                            </div>
                            <div className="card__price">
                                <h3>{totalAmount >= 0 && '+'}{ totalAmount.pricify() }</h3>
                                <small>{ costTypeContext(type) }</small>
                            </div>
                        </div>
                        {/* <hr className="striped"/> */}
                        <div className="card__btm">
                            <div className="card__detail">
                                <p>{ costTypeAmountPerPerson(type, totalAmount, budgetData.people.paying) }</p>
                                <small>{ costTypeDetail(type) }, { costTypeAmountPerPersonDetail(type) }</small>
                            </div>
                            <div className="card__actions">
                                {editable && <OnAuth group={ budgetData.groupId }>
                                    <div className="btn-group btn-group--stretch">
                                        <button className="btn" onClick={() => setModalState(!modalState)}>Bewerken</button>
                                        <button className="btn btn--sub btn--icon" onClick={(e) => handleDelete(e)}><box-icon name='trash'></box-icon> Verwijder kost</button>
                                    </div>
                                </OnAuth>}
                            </div>
                        </div>
                        {/* UPDATE COST */}
                        <Popup open={modalState} position="right center" modal className={"edit-cost"} closeOnDocumentClick={false}>
                            <div className="modal__body">
                                <h3 className="text-center">Update kost</h3>
                                <Forms.UpdateCost
                                    states={{
                                        updateCost: [ costState, setCostState ],
                                        modal: () => setModalState(!modalState)
                                    }}
                                    costId={data.id}
                                />
                            </div>
                        </Popup>
                    </Card>
                </div>
            }   
        </Draggable>
    )
})

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
        GIFT: <box-icon name='donate-heart'></box-icon>,
        BENEFIT: <box-icon name='donate-heart'></box-icon>,
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

const costTypeAmountPerPerson = (prop, amount, peoplePaying) => {
    if (prop != 'INCOME') return (<>Uitgave van <strong>{ (amount / peoplePaying).pricify() } per persoon</strong></>)
    else return (<>Aftrek van <strong>{ (amount / peoplePaying).pricify() } per persoon</strong></>)
}

const costTypeAmountPerPersonDetail = (prop) => {
    return {
        FIXED: 'verrekend per betalende persoon',
        PER_PERSON: 'verrekend per betalende persoon',
        PER_PAYER: 'verrekend per betalende persoon',
        PER_FREE: 'verrekend per betalende persoon',
        INCOME: 'verrekend per betalende persoon'
    }[prop]
}

export default Cost;