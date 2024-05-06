import "./App.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import GetQueryData from "./components/QueryData";

// const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/graphql";
const backendURL = "http://localhost:8000/graphql";

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

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="centered-container">
        <GetQueryData />
      </div>
    </ApolloProvider>
  );
}

export default App;

