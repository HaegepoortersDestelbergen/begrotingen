import React from 'react';
import './index.scss';
import undraw from './undraw_dreamer_gxxi.svg';

export default ({ title = 'Er ging iets fout', msg = 'Je hebt geen internetverbinding', onClick = () => null }) => {
    return (
        <div className="notify-nonetwork">
            <img src={ undraw } width="200px"/>
            <p className="label">{ title }</p>
            <p>{ msg }</p>
            <button className="btn btn--icon btn--sub" onClick={() => onClick()}><box-icon name='refresh' ></box-icon> Opnieuw proberen</button>
        </div>
    )
}