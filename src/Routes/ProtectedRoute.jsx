import React from 'react'
import { Navigate } from 'react-router-dom'
import { useHospital } from '../Context/HospitalContext'
import { LogoLoader } from '../Utils/LogoLoder'
 

const ProtectedRoute = ({ children }) => {
  const { loading, selectedHospital } = useHospital()

  const hospitalId = localStorage.getItem('hospitalId')
  console.log("Selected Hospital in ProtectedRoute:", hospitalId)

  // ⏳ Show loader while context is loading
  if (loading) {
    return <LogoLoader />
  }

  // ✅ Proper authentication check
  const isAuthenticated =
    !!hospitalId &&
    selectedHospital &&
    Object.keys(selectedHospital).length > 0

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute