export const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/graphql` 
  : 'http://localhost:8000/graphql';

