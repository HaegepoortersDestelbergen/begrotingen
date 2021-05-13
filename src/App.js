import { useState } from 'react';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import Popup from 'reactjs-popup';
import { ToastContainer, toast, Slide, Zoom, Flip, Bounce } from 'react-toastify';
import 'dayjs/locale/nl-be';

import './App.scss';
import { AuthRequired, Fab } from './components';
import { AuthContext, BudgetProvider, NotifyContext } from './contexts';
import { AccessDeniedPage, AdminPage, BudgetPage, GroupPage, Login, SharePage, StartPage } from './pages'
import { logOut } from './utils';
import { version as appVersion } from '../package.json'
import _Auth, { useAuth, _AuthRequired } from './contexts/Auth';

const Wrapper = () => {
    const { user } = useAuth();
    
    return <>
        <Switch>
            <Route path="/login" exact={true}>
                <Login/>
            </Route>
            <Route path="/" exact={true}>
                <_AuthRequired><StartPage/></_AuthRequired>
                {/* <AuthRequired><StartPage/></AuthRequired> */}
            </Route>
            <Route path="/admin" exact={true}>
                <AuthRequired minRole={1}><AdminPage/></AuthRequired>
            </Route>
            <Route path="/group/:id" exact={true}>
                <_AuthRequired><GroupPage/></_AuthRequired>
            </Route>
            <Route path="/budget/:id" exact={true}>
                <_AuthRequired><BudgetPage/></_AuthRequired>
            </Route>
            <Route path="/share/:id" exact={true}>
                <SharePage/>
            </Route>
            <Route>
                <AccessDeniedPage/>
            </Route>
        </Switch>
        <Fab>
            <Popup
                trigger={<button className="btn btn--icon btn--sub"><box-icon name='support'></box-icon> Support</button>}
                className={'menu'}
                position="top right">
                <p className="label m-0 mb-2">versie { appVersion }</p>
                <p className="m-0">Gebruik dit nummer om hulp te vragen</p>
            </Popup>
            { user && <Popup
                trigger={<button className="btn btn--icon"><box-icon name='user-circle' ></box-icon> { user.name }</button>}
                className={'menu'}
                position="top right">
                <div className="btn-group btn-group--vertical">
                    <button onClick={logOut} className="btn">Afmelden</button>
                    { (user?.role <= 1) && <Link to="/admin" className="btn">Admin</Link> }
                </div>
            </Popup>}
        </Fab>
        <ToastContainer newestOnTop position="bottom-center" transition={Slide}/>
        
    </>
}

function App() {
    const [ authenticatedUser, authenticateUser ] = useState(null);
    const [ notifies, setNotify ] = useState([]);
    
    return (
        <div className="App">
            <BrowserRouter basename="/#">
                <AuthContext.Provider value={[ authenticatedUser, authenticateUser ]}>
                    <NotifyContext.Provider value={[ notifies, setNotify ]}>
                        <_Auth>
                            <Wrapper />
                        </_Auth>
                    </NotifyContext.Provider>
                </AuthContext.Provider>
            </BrowserRouter>
        </div>
    );
}

const checkAccess = (e) => {
    console.log(e)
}

export default App;
