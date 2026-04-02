import React from 'react'
import AppHeader from '../components/AppHeader'
import AppContent from '../components/AppContent'
import AppFooter from '../components/AppFooter'


const DefaultLayout = () => {
    return (
        <>
            {/* <AppSidebar /> */}
            <div className="wrapper d-flex flex-column min-vh-100" >
                <AppHeader />
                <div className="body flex-grow-1">
                    <AppContent />
                </div>
                <AppFooter />
            </div >

        </>
    )
}

export default DefaultLayout
