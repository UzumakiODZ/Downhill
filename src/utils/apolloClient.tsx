import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const PROD_GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined;

const GRAPHQL_URL = import.meta.env.DEV ? '/graphql' : PROD_GRAPHQL_URL;

if (!GRAPHQL_URL) {
  throw new Error('GraphQL URL is not configured. Set VITE_GRAPHQL_URL for production.');
}


const client = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_URL }),
  cache: new InMemoryCache()
});

export default client;