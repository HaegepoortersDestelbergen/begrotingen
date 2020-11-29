import { gql, useMutation, useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import { Card, OnAuth, Forms } from '../..';
import './index.scss';
import '../../../utils';
import WaveTopBottomLoading from 'react-loadingg/lib/WaveTopBottomLoading';

const GET_COST = gql`
    query cost($id: String) {
        cost(id: $id) {
            title
            comment
            category
            type
            when
            amount
        }
    }
`;

const DELETE_COST = gql`
    mutation deleteCost($id: String) {
        deleteCost(id: $id){
            id
        }
    }
`;

export default ({ data, budgetData, states, onClick, editable = true }) => {
    console.log({editable})
    const [ collapseState, setCollapseState ] = useState(true);
    const [ modalState, setModalState ] = useState(false);
    const [ costState, setCostState ] = useState(data);
    const [ budgetTotal, setBudgetTotal ] = states?.budgetTotal || [];
    const { loading: getCostLoading, data: getCostData, error: getCostError} = useQuery(GET_COST, { variables: {
        id: data.id
    }})
    const [ deleteCost, { loading, data: deleteCostData, error }] = useMutation(DELETE_COST, { variables: {
        id: data.id
    }})
    
    const { category, title, comment, type, when, amount } = getCostData && getCostData.cost[0] || [];
    const peopleCalc = calcCostType(type, budgetData.people)
    const whenCalc = calcCostWhen(when, budgetData.stay)
    const totalAmount = ((peopleCalc * amount) * whenCalc);
    
    useEffect(() => {    
        if (getCostData && states?.budgetTotal) {
            setBudgetTotal(prev => {
                const duplicate = prev.findIndex(p => p.id && p.id === data.id );
                if (duplicate != -1) {
                    prev.splice(duplicate, 1);
                    return [...prev, ...[{
                        id: data.id,
                        total: totalAmount
                    }]]
                } else return [...prev, ...[{
                    id: data.id,
                    total: totalAmount
                }]]
            })
        }
    }, [getCostData, costState])
    
    if (getCostData) {
        const handleDelete = (e) => {
            deleteCost()
            if (!loading) e.target.closest('.card').remove();
        }    
         
        return ( <>
            <Card theme="cost" className={`collapse collapse--${collapseState}`}>
                <div className="card__top" onClick={() => setCollapseState(!collapseState)}>
                    <div className="card__header">
                        <div className="card__icon">{ CategoryIcon(category) }</div>
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
                        <p>Uitgave van <strong>{ (totalAmount / budgetData.people.paying).pricify() } per persoon</strong></p>
                        <small>{ costTypeDetail(type) }, verekend per betalende persoon</small>
                    </div>
                    <div className="card__actions">
                        <OnAuth>
                            <div className="btn-group">
                                <button className="btn" onClick={() => setModalState(!modalState)}>Bewerken</button>
                                <button className="btn btn--sub btn--icon" onClick={(e) => handleDelete(e)}><box-icon name='trash'></box-icon> Verwijder kost</button>
                            </div>
                        </OnAuth>
                    </div>
                </div>
            </Card>
            
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
        </>)
    } else return <WaveTopBottomLoading/>
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