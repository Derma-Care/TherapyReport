import React from 'react'
import { Navigate } from 'react-router-dom'

import { LogoLoader } from '../Utils/LogoLoder'
import { useHospital } from '../Context/HospitalContext'

const ProtectedRoute = ({ children }) => {
  const { loading } = useHospital()

  const hospitalId = localStorage.getItem('hospitalId')
  const selectedClinic = localStorage.getItem('selectedClinic')

  if (loading) {
    return <LogoLoader />
  }

  const isAuthenticated =
    !!hospitalId &&
    !!selectedClinic

  return isAuthenticated
    ? children
    : <Navigate to="/login" replace />
}

export default ProtectedRoute