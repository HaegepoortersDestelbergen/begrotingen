import { useState } from 'react';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import Popup from 'reactjs-popup';
import './App.scss';
import { AuthRequired, Fab } from './components';
import { AuthContext } from './contexts';
import { AdminPage, BudgetPage, GroupPage, Login, StartPage } from './pages'
import { logOut } from './utils';

function App() {
    const [authenticatedUser, authenticateUser] = useState(null)
    console.log(authenticatedUser)
    return (
        <div className="App">
        <BrowserRouter basename="/#">
            <AuthContext.Provider value={[authenticatedUser, authenticateUser]}>
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
                        <AuthRequired minRole={2}><GroupPage/></AuthRequired>
                    </Route>
                    <Route path="/budget/:id" exact={true}>
                        <AuthRequired minRole={2}><BudgetPage/></AuthRequired>
                    </Route>
                </Switch>
                <Fab>
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
            </AuthContext.Provider>
        </BrowserRouter>
        </div>
    );
}

export default App;
