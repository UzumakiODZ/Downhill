import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const GRAPHQL_URL = (import.meta.env.VITE_GRAPHQL_URL as string | undefined) ?? '/graphql';

const client = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_URL }),
  cache: new InMemoryCache()
});

export default client;