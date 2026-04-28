import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://downhill-gqll-api.onrender.com/query' }),
  cache: new InMemoryCache()
});

export default client;