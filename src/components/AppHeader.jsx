import React, { useEffect, useRef } from 'react'

import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import ThemeSelector from '../Constant/ThemeSelector'
import {
  cilBell,
  cilContrast,
  cilEnvelopeOpen,
  cilList,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons'
import { useHospital } from '../Context/HospitalContext'
import AppHeaderDropdown from './AppHeaderDropdown'

const AppHeader = () => {
  const headerRef = useRef()
  const { selectedHospital } = useHospital()

  const storedData = localStorage.getItem('therapistData')
  const storedClinic = localStorage.getItem('selectedClinic')
  const data = location.state || (storedData ? JSON.parse(storedData) : {})
  const clinicData = storedClinic ? JSON.parse(storedClinic) : {}
  const therapistName = data?.therapistName
  const branch = data?.branchName
  const therapistId = data?.therapistId


  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  console.log("Selected Hospital in AppHeader:", selectedHospital)

  const clinicName = selectedHospital?.name || clinicData.name || 'Clinic Name'
  const ClinicLogo = selectedHospital?.hospitalLogo || clinicData.hospitalLogo || 'logo'


  return (
    <CHeader
      position="sticky"
      className="mb-4 p-0 shadow-sm"
      ref={headerRef}
      style={{ backgroundColor: '#ffffff' }}
    >
      <CContainer className="border-bottom px-3" fluid >

        {/* Desktop View */}
        <div className="d-none d-md-flex align-items-center w-100">

          {/* Logo + Clinic */}
          <div className="d-flex align-items-center">
            <img
              src={`data:image/png;base64,${ClinicLogo}`}
              alt="Clinic Logo"
              style={{ height: '70px', marginRight: '10px', padding: '5px' }}
            />

            <div>
              <div style={{ fontWeight: 'bold' }}>{clinicName}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{branch}</div>
            </div>
          </div>

          {/* Right side */}
          <div className="d-flex align-items-center ms-auto">

            {/* Doctor Info */}
            <div className="fw-bold mx-4 text-center">
              <div>Welcome, {therapistName}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                ID: {therapistId}
              </div>
            </div>

            {/* Notification */}
            <CIcon icon={cilBell} size="lg" className="mx-2" />

            <CHeaderNav>
              <AppHeaderDropdown />
            </CHeaderNav>
          </div>
        </div>



        {/* Mobile View */}
        <div className="d-flex d-md-none align-items-center justify-content-between w-100 py-2">

          {/* Left: Clinic Name + Branch */}
          <div style={{ maxWidth: '65%' }}>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '0.95rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {clinicName}
            </div>

            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              {branch}
            </div>
          </div>

          {/* Right: Notification + Logo + Profile */}
          <div className="d-flex align-items-center">
            <CIcon icon={cilBell} size="lg" className="me-2" />



            <CHeaderNav>
              <AppHeaderDropdown />
            </CHeaderNav>
          </div>

        </div>

      </CContainer>
    </CHeader>
  )
}

export default AppHeader
