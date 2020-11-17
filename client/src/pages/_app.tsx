import { createClient, Provider } from 'urql';
import { ChakraProvider } from '@chakra-ui/react'

import theme from '../theme'

const client = createClient({
  url: 'http://localhost:3030/graphql',
  fetchOptions: {
    credentials: "include"
  }
});

function MyApp({ Component, pageProps }) {
  return (
    <Provider value={client}>
    <ChakraProvider theme={theme}>
        <Component {...pageProps} />
    </ChakraProvider>
  </Provider>
  )
}

export default MyApp
