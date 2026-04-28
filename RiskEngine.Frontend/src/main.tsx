import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import App from './App.tsx'
import './index.css'

const httpUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:5100/graphql';
const wsUrl = httpUrl.replace('http://', 'ws://').replace('https://', 'wss://');

const httpLink = new HttpLink({
  uri: httpUrl,
});

const wsLink = new GraphQLWsLink(createClient({
  url: wsUrl,
  connectionParams: {
    // Add auth headers here if needed
  }
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
)
