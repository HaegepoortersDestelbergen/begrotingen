import React from 'react';
import './index.scss';

export default ({ msg = 'We konden geen kosten vinden' }) => {
    return (
        <div className="notify-notfound">
            <img src="undraw/searching.svg" width="200px"/>
            <p className="label">{ msg }</p>
        </div>
    )
}