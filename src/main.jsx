import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import store from './store'

import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import HospitalProvider from './Context/HospitalContext'
import { NotificationProvider } from './Context/NotificationContext'

import '@coreui/coreui/dist/css/coreui.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import axios from 'axios'
import { showCustomToast } from './Utils/Toaster'

// Global Axios Interceptors for handling common network/server errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // No response received (network error, offline, timeout)
      if (error.code === 'ERR_NETWORK') {
        showCustomToast('No network connection. Please check your internet.', 'error')
      } else if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
        showCustomToast('Slow internet connection. Request timed out.', 'error')
      } else {
        showCustomToast('Unable to connect to the server. Please try again later.', 'error')
      }
    } else {
      // Server responded with a status outside the 2xx range
      const status = error.response.status
      if (status >= 500) {
        showCustomToast('Server is currently down or experiencing issues. Please try again later.', 'error')
      }
    }
    return Promise.reject(error)
  }
)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <HospitalProvider>
      <BrowserRouter>
        <NotificationProvider>
          <ToastContainer />
          <App />
        </NotificationProvider>
      </BrowserRouter>
    </HospitalProvider>
  </Provider>
)