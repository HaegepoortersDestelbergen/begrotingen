import { gql, useMutation } from '@apollo/client';
import dayjs from 'dayjs';
import React from 'react';
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

export default ({ data, onClick, editable }) => {       
    const [deleteGroup, { loading, data: deleteGroupData, error }] = useMutation(DELETE_GROUP, {variables: {
        id: data.id
    }})
    
    const handleDelete = (e) => {
        deleteGroup()
        if (!loading) e.target.closest('.card').remove();
    }
    
    const periodStart = dayjs(data.period.start).format('DD MMM');
    const periodEnd = dayjs(data.period.end).format('DD MMM');
    const peopleTotal = data.people.paying + data.people.free;
    
    return (
        <Card theme="budget">
            <div className="card__header">
                <div className="card__icon">
                    {/* <box-icon name='coin'></box-icon> */}
                    {/* <box-icon name='coin-stack'></box-icon> */}
                    <box-icon name='wallet'></box-icon>
                </div>
                <div className="card__title">
                    <h4>{ data.title }</h4>
                    <small>{ data.comment }</small>
                </div>
            </div>
            <div className="card__summary">
                <h4>{ periodStart } tot { periodEnd }</h4>
                <small>{ peopleTotal } personen</small>
            </div>
            {editable && 
                <div>
                    <button className="btn btn--blank" onClick={handleDelete}><box-icon name='x'></box-icon></button>
                </div>
            }
        </Card>
    )
}