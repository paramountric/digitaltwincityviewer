import '../styles/globals.css';
import type {AppProps} from 'next/app';
import {QueryClient, QueryClientProvider} from 'react-query';
import {ApolloProvider} from '@apollo/client';
import {useApollo} from '../hooks/apollo';

function Dod({Component, pageProps}: AppProps) {
  const restClient = new QueryClient();
  const gqlClient = useApollo();
  return (
    <QueryClientProvider client={restClient}>
      <ApolloProvider client={gqlClient}>
        <Component {...pageProps} />
      </ApolloProvider>
    </QueryClientProvider>
  );
}

export default Dod;
