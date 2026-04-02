import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import 'core-js'

import App from './App'
import './App.css'
import store from './store'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import './views/Style/toastify.css'

import { BrowserRouter } from 'react-router-dom'


import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import HospitalProvider from './Context/HospitalContext'

function Root() {

    return (
        <Provider store={store}>
            <BrowserRouter>
                <HospitalProvider>

                    <ToastContainer
                        position="top-right"
                        limit={3}
                        theme="dark" // base dark theme
                        toastStyle={{
                            backgroundColor: 'var(--color-black)',
                            color: 'white',
                        }}
                    />
                    <App />




                </HospitalProvider>
            </BrowserRouter>
        </Provider>
    )
}

createRoot(document.getElementById('root')).render(<Root />)
