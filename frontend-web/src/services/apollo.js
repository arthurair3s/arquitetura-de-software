import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';

import { API_URL } from '../config';

const httpLink = createHttpLink({
  uri: API_URL,
});

// Sem este link o Apollo Client mandava as operações sem credencial, enquanto os
// fetch manuais espalhados pelos componentes mandavam. Com a @auth no schema,
// toda operação protegida passa a exigir o header.
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('token');
  operation.setContext(({ headers = {} }) => ({
    headers: token ? { ...headers, Authorization: `Bearer ${token}` } : headers,
  }));
  return forward(operation);
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          entregadores: {
            merge(existing, incoming) {
              return incoming;
            }
          },
          pedidos: {
            merge(existing, incoming) {
              return incoming;
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  }
});
