import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App.tsx'
import './index.css'

const rootEl = document.getElementById('root')

if (!rootEl) {
  throw new Error('Unable to find #root element in document!')
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>
)
