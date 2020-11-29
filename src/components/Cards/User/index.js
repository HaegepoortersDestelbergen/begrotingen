import { gql, useMutation } from '@apollo/client';
import React from 'react';
import Popup from 'reactjs-popup';
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
    
    console.log({ data })
    
    const handleDelete = (e) => {
        deleteUser()
        if (!loading) e.target.closest('.card').remove();
    }
    
    return (
        <Card theme="user">
            <div className="d-flex align-items-center gap--col">
                { RoleIcon(data.role) } <strong>{ data.name }</strong> <small>{ RoleName(data.role) }</small>
            </div>
            { data.role != 0 ? 
                <div>
                    <button className="btn btn--blank" onClick={(e) => handleDelete(e)}><box-icon name='x'></box-icon></button>
                </div> :
                <div>
                    <Popup trigger={<button className="btn btn--blank"><box-icon name='x'></box-icon></button>} position="left center">
                        Root-gebruikers kunnen<br/>niet verwijderd worden
                    </Popup>
                </div>
            }
        </Card>
    )
    
}

const RoleIcon = (role) => {
    return {
        // 0: <box-icon name='power-off' ></box-icon>,
        0: <box-icon name='crown' ></box-icon>,
        1: <box-icon name='cog'></box-icon>,
        2: <box-icon name='user-circle'></box-icon>,
        3: <box-icon name='ghost' ></box-icon>
    }[role]
}

const RoleName = (role) => {
    return {
        0: 'root-gebruiker',
        1: 'admin',
        2: 'gebruiker',
        3: 'gast'
    }[role]
}