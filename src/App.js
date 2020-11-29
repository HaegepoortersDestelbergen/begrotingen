import { useState } from 'react';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import Popup from 'reactjs-popup';
import './App.scss';
import { AuthRequired, Fab, NotifyContainer } from './components';
import { AuthContext, NotifyContext } from './contexts';
import { AccessDeniedPage, AdminPage, BudgetPage, GroupPage, Login, SharePage, StartPage } from './pages'
import { logOut } from './utils';

function App() {
    const [ authenticatedUser, authenticateUser ] = useState(null);
    const [ notifies, setNotify ] = useState([]);
    
    return (
        <div className="App">
        <BrowserRouter basename="/#">
            <AuthContext.Provider value={[ authenticatedUser, authenticateUser ]}>
                <NotifyContext.Provider value={[ notifies, setNotify ]}>
                    <Switch>
                        <Route path="/login" exact={true}>
                            <Login/>
                        </Route>
                        <Route path="/" exact={true}>
                            <AuthRequired><StartPage/></AuthRequired>
                        </Route>
                        <Route path="/admin" exact={true}>
                            <AuthRequired minRole={1}><AdminPage/></AuthRequired>
                        </Route>
                        <Route path="/group/:id" exact={true}>
                            <AuthRequired><GroupPage/></AuthRequired>
                        </Route>
                        <Route path="/budget/:id" exact={true}>
                            <AuthRequired><BudgetPage/></AuthRequired>
                        </Route>
                        <Route path="/share/:id" exact={true}>
                            <SharePage/>
                        </Route>
                        <Route>
                            <AccessDeniedPage/>
                        </Route>
                    </Switch>
                    <Fab>
                        <button className="btn btn--icon btn--sub"><box-icon name='support'></box-icon> Support</button>
                        { authenticatedUser && <Popup
                            trigger={<button className="btn btn--icon"><box-icon name='user-circle' ></box-icon> { authenticatedUser.name }</button>}
                            className={'menu'}
                            position="top right">
                            <div className="btn-group btn-group--vertical">
                                <button onClick={logOut} className="btn">Afmelden</button>
                                { (authenticatedUser?.role <= 1) && <Link to="/admin" className="btn">Admin</Link> }
                            </div>
                        </Popup>}
                    </Fab>
                    <NotifyContainer>lel</NotifyContainer>
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
