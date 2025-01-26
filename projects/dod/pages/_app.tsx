import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../lib/apollo';

function BaseBucket({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();
  const client = useApollo();
  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={client}>
        <Head>
          <title>BaseBucket</title>
          <meta name="description" content="BaseBucket" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;1,100&display=swap"
            rel="stylesheet"
          />
        </Head>
        <Component {...pageProps} />
      </ApolloProvider>
    </QueryClientProvider>
  );
}

export default BaseBucket;
