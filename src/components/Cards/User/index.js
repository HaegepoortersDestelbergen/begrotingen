import { gql, useMutation } from '@apollo/client';
import React from 'react';
import { Card } from '../..';
import './index.scss';

const DELETE_USER = gql`
    mutation deleteUser($id: String) {
        deleteUser(id: $id) {
            id
            name
        }
    }
`;

export default ({ data, onClick, editable }) => {       
    const [deleteUser, { loading, data: deleteUserData, error }] = useMutation(DELETE_USER, {variables: {
        id: data.id
    }})
    
    const handleDelete = (e) => {
        deleteUser()
        if (!loading) e.target.closest('.card').remove();
    }
    
    return (
        <Card theme="user">
            <div className="d-flex gap--col">
                <box-icon name='user-circle'></box-icon> <strong>{ data.name }</strong>
            </div>
            <div>
                <button className="btn btn--blank" onClick={handleDelete}><box-icon name='x'></box-icon></button>
            </div>
        </Card>
    )
}