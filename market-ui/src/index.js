import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import GetQueryData from "./components/QueryData";
import { DarkModeProvider } from './contexts/DarkModeContext';

// const backendURL = "http://localhost:8000/graphql";
const backendURL = "http://35.174.189.194:8000/graphql"; //for production

// console.log("backendURL", backendURL);

const errorLink = onError(({ graphqlErrors, networkError }) => {
  if (graphqlErrors) {
    console.log(graphqlErrors);
    graphqlErrors.map(({ message, location, path }) => {
      return alert(`Graphql error ${message}`);
    });
  }
});

const link = from([
  errorLink,
  new HttpLink({ uri: backendURL }),
]);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client} >
      <div className='flex flex-col min-h-screen bg-neutral-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200 '>
        <DarkModeProvider> {/* the Dark mode for accsessing the values from all over the app */}
          <GetQueryData />
        </DarkModeProvider>
      </div>
    </ApolloProvider>
  </React.StrictMode>
);