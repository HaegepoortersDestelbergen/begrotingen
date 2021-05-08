import React, { useContext, useState } from 'react';
import Fade from 'react-reveal/Fade';
import { Card } from '..';
import { NotifyContext } from '../../contexts';
import './index.scss';

export default ({ children, title }) => {
    const [ notifies, setNotify ] = useContext(NotifyContext);
    const [ showState, setShowState ] = useState(true);
    
    const notify = (
        <Fade right collapse when={showState}>
            <Card theme="notify">
                <h3 className="notify__title">{ title }</h3>
                <div className="notify__content">
                    { children }
                </div>
                <button className="btn" onClick={() => setShowState(false)}>sluiten</button>
            </Card>
        </Fade>
      )
    
    useState(() => {
        setNotify(prev => [...prev, notify])
    }, [notify])
    
    return null;
}