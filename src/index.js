import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { env, getToken } from './utils/index';
import { ApolloClient, InMemoryCache, ApolloProvider, gql, HttpLink, ApolloLink, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import 'boxicons/dist/boxicons';

const gqlUri = env('http://localhost:4000', 'https://immense-cliffs-08162.herokuapp.com/');
const wsUri = env('ws://localhost:4000/graphql', 'wss://immense-cliffs-08162.herokuapp.com/graphql');

const httpLink = new HttpLink({
  uri: gqlUri
})

const wsLink = new WebSocketLink({
  uri: wsUri,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: getToken().token,
    },
  }
})

const authLink = new ApolloLink((operation, forward) => {
  const token = getToken().token;

  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    }
  });
  
  return forward(operation);
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

const client = new ApolloClient({
  // uri: gqlUri,
  link: splitLink,
  cache: new InMemoryCache()
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
