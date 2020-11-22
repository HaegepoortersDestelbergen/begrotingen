import { gql, useMutation } from '@apollo/client';
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
    
    return (
        <Card theme="group">
            <div className="d-flex gap--col">
                <box-icon name='group'></box-icon> <strong>{ data.name }</strong>
            </div>
            <div>
                <button className="btn btn--blank" onClick={deleteGroup}><box-icon name='x'></box-icon></button>
            </div>
        </Card>
    )
}