import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.scss';
import { AdminPage, Login, StartPage } from './pages'

function App() {
  return (
    <div className="App">
      <BrowserRouter basename="/#">
        <Switch>
          <Route path="/login" exact={true}><Login/></Route>
          <Route path="/" exact={true}><StartPage/></Route>
          <Route path="/admin" exact={true}><AdminPage/></Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
