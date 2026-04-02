import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '../API/BaseUrl'

const HospitalContext = createContext()

const HospitalProvider = ({ children }) => {
const [selectedHospital, setSelectedHospital] = useState(() => {
  const stored = localStorage.getItem('selectedClinic')
  return stored ? JSON.parse(stored) : null
})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hydrated, setHydrated] = useState(false)

  const fetchHospital = async (id) => {
    if (!id) return
    setLoading(true)
        console.log("Fetched hospital data:", id)

    try {
      const res = await axios.get(`${BASE_URL}/getClinic/${id}`)
      if (res.status === 200) {
        setSelectedHospital(res.data)
        console.log("Fetched hospital data:", res.data)
      
      }
      return res.data
    } catch (err) {
      setErrorMessage('Error fetching hospital data.')
      return null
    } finally {
      setLoading(false)
    }
  }

const fetchAllData = async (id) => {
  if (!id) return
  setHydrated(false)

  const data = await fetchHospital(id)  // ✅ return value

  setHydrated(true)
  return data   // ✅ ADD THIS
}

  return (
    <HospitalContext.Provider
      value={{
        selectedHospital,
        setSelectedHospital ,
        fetchAllData,
        fetchHospital,
        loading,
        errorMessage,
        hydrated,
      }}
    >
      {children}
    </HospitalContext.Provider>
  )
}

export default HospitalProvider

export const useHospital = () => useContext(HospitalContext)