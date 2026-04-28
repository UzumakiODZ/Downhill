import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://downhill-gqll-api.onrender.com' }),
  cache: new InMemoryCache()
});

export default client;