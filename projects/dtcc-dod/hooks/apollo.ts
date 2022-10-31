import {ApolloClient, HttpLink, InMemoryCache} from '@apollo/client';
import {useMemo} from 'react';
import {setContext} from '@apollo/client/link/context';

const {NEXT_PUBLIC_SPECKLE_SERVER_URL} = process.env;
const SPECKLE_SERVER_URL = 'https://speckle.pmtric.com';

const authLink = setContext(async (_, {headers}) => {
  const tokenResponse = await fetch('/api/auth/token');
  const {token} = await tokenResponse.json();
  console.log('set token', token);
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const httpLink = new HttpLink({
  uri: `${SPECKLE_SERVER_URL}/graphql`,
  credentials: 'same-origin',
});

function createApolloClient() {
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
}

export function useApollo() {
  const client = useMemo(() => createApolloClient(), []);
  return client;
}
