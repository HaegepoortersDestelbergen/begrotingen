import React, { useEffect, useState } from 'react';
import { _cls } from '../../utils';
import Popup from 'reactjs-popup';

import styles from './index.scss';

const ButtonOverflow = ({ children, button, onMobile }) => {
    const [ modalState, setModalState ] = useState(false);
    
    return <>
        <button className="ButtonOverflow__button btn--icon" onClick={ () => setModalState(p => !p) }>
            <box-icon name='dots-horizontal-rounded'></box-icon>
            opties
        </button>
        <div className="ButtonOverflow__overflow btn-group">{ children }</div>
        <Popup 
            open={ modalState } 
            className="ButtonOverflow__modal" 
            position="right center" 
            modal 
            closeOnDocumentClick={ true }
            onClose={ () => setModalState(false) }
        >
            { onMobile || children }
        </Popup>
    </>
}

export default ButtonOverflow;