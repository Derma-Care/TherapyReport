import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import store from './store'

import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import HospitalProvider from './Context/HospitalContext'

import '@coreui/coreui/dist/css/coreui.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <HospitalProvider>
      <BrowserRouter>
        <ToastContainer />
        <App />
      </BrowserRouter>
    </HospitalProvider>
  </Provider>
)