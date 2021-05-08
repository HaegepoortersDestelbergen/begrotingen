import React from 'react';
import { Card } from '../..';
import './index.scss';
import { updateClipboard } from 'cutleryjs'
import { toast } from 'react-toastify';

export default ({ data }) => {
    // on copy show toast
    
    const handleCopy = async (shareId) => {
        await updateClipboard(`${window.location.origin}/#/share/${shareId}`)
    }
    
    return (
        <Card theme="share" onClick={() => handleCopy(data.id)}>
            <div className="card__header">
                <box-icon name='share-alt'></box-icon>
                <h3>Share <span>&nbsp; { data.label === '' ? data.id : data.label }</span></h3>
            </div>
            <div className="card__body"> 
                <button className="btn--blank" onClick={() => toast('Link gekopieerd')}><box-icon name='copy'></box-icon></button>
                <box-icon name='x' onClick={() => toast('Share verwijderd')}></box-icon>
            </div>
        </Card>
    )
}