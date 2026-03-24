import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 1,      // 1 min — compromiso seguro para app de gestión
      gcTime: 1000 * 60 * 10,         // 10 min — mantener en caché tras desmontarse
      refetchOnWindowFocus: true,     // Re-fetch al volver a la pestaña (si es stale)
      retry: 1,                       // Solo 1 retry en error
    },
  },
});

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </Provider>,
)
