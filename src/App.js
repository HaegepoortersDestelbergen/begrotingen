import { useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.scss';
import { AuthRequired } from './components';
import { AuthContext } from './contexts';
import { AdminPage, BudgetPage, GroupPage, Login, StartPage } from './pages'

function App() {
    const [authenticatedUser, authenticateUser] = useState(null)
    
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
                        <AuthRequired minRole={3}><GroupPage/></AuthRequired>
                    </Route>
                    <Route path="/budget/:id" exact={true}>
                        <AuthRequired minRole={3}><BudgetPage/></AuthRequired>
                    </Route>
                </Switch>
            </AuthContext.Provider>
        </BrowserRouter>
        </div>
    );
}

export default App;
