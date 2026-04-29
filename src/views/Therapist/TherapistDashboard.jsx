/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CContainer,
  CBadge,
  CButton,
  CNav,
  CNavItem,
  CNavLink,
  CSpinner,
  CCollapse,
  CFormSelect,
  CFormInput,
  CFormLabel,
} from '@coreui/react'

import { getStats } from './therapistService'
import { useLocation, useNavigate } from 'react-router-dom'
import { getBookingByBookingId, getClinicData, getDashboard, getSessionDetails } from './TheraphyApi'
import PatientViewModal from './PatientViewModal'
import capitalizeWords from '../../Utils/capitalizeWords'
import { COLORS } from '../../Constant/Themes'
import LoadingIndicator from '../../Utils/loader'
 







// ─── Patient Row ──────────────────────────────────────────────────────────────
// ✅ KEY FIX: handleViewDetails calls getSessionDetails API first,
//    then passes the FULL record to PatientViewModal.
//    PatientViewModal expects: record.patientInfo, record.assessment,
//    record.diagnosis, record.treatmentPlan, record.therapySessions,
//    record.exercisePlan, record.complaints, record.followUp, etc.
const PatientRow = ({ p, index, clinicId, branchId, onViewDetails, navigate }) => {
  const [showExercises, setShowExercises] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)


  const bookingId = p.bookingId;
  const patientId = p.patientId;
  const therapistRecordId = p.therapistRecordId;
  console.log(p)
  // ✅ Fetch full patient record before opening modals
  const handleViewDetails = async () => {
    try {
      setDetailLoading(true)

      // API: getRecordByClinicIdBranchIdtherapistRecordIdAndSessionId
      // params: clinicId, branchId, therapistRecordId, bookingId (acts as sessionId here)
      const res = await getBookingByBookingId(
        clinicId,
        branchId,
        patientId,
        bookingId,
        therapistRecordId
      )

      // res.data is the full record with patientInfo, assessment, diagnosis, etc.
      if (res?.data) {
        onViewDetails(res.data)
      } else if (res) {
        // some APIs return the object directly without a .data wrapper
        onViewDetails(res)
      } else {
        // fallback: pass what we have so modal still opens (will show N/A for deep fields)
        onViewDetails(p)
      }
    } catch (err) {
      console.error('View Details fetch error:', err)
      onViewDetails(p) // fallback
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <CCard key={p.patientId || index} className="mb-3">
      <CCardBody>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">

          {/* ✅ Patient Info — exact API field names */}
          <div className="mb-3 mb-md-0">
            <b>Patient: {p.patientName || 'N/A'}</b>
            <br />
            Doctor: {p.doctorName || 'N/A'}
            <br />
            serviceType: {p.serivceType || 'N/A'}
            <br />
            Mobile: {p.mobileNumber || 'N/A'}
            <br />
            <CBadge
              color={
                p.overallStatus?.toLowerCase() === 'completed'
                  ? 'success'
                  : p.overallStatus?.toLowerCase() === 'active'
                    ? 'warning'
                    : 'secondary'
              }
              className="mt-1"
            >
              {p.overallStatus || 'Pending'}
            </CBadge>
          </div>

          {/* ✅ Action Buttons */}
          <div className="d-flex flex-row flex-md-column justify-content-start justify-content-md-center align-items-stretch align-items-md-center gap-2 gap-md-1">

            {/* ✅ FIXED: calls getSessionDetails then opens modal with full record */}
            <CButton
              size="sm"
             
              style={{ color: 'white',backgroundColor:COLORS.primary }}
              disabled={detailLoading}
              onClick={handleViewDetails}
              className="flex-grow-1 flex-md-grow-0"
            >
              {detailLoading ? <CSpinner size="sm" style={{color: 'white'}}/> : 'View Details'}
            </CButton>

            <CButton
              size="sm"
             style={{backgroundColor:COLORS.primary, color:"white"}}
              className="flex-grow-1 flex-md-grow-0"
              onClick={() =>
                navigate('/session-list', {
                  state: {
                    name: p.patientName,
                    therapy: p.programName,
                    doctorName: p.doctorName,
                    therapistRecordId: p.therapistRecordId,
                    patientId: p.patientId,
                    bookingId: p.bookingId,
                  },
                })
              }
            >
              Sessions
            </CButton>

          </div>
        </div>

      </CCardBody>
    </CCard>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const TherapyDashboard = () => {
  const [tab, setTab] = useState(1)
  const [therapyData, setTherapyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [patientList, setPatientList] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [selected, setSelected] = useState(null)

  const location = useLocation()
  const navigate = useNavigate()

  const storedData = localStorage.getItem('therapistData')
  const routeData = location.state || (storedData ? JSON.parse(storedData) : {})
  const clinicId = routeData?.clinicId
  const branchId = routeData?.branchId
  const therapistId = routeData?.therapistId

  // ✅ Fetch Therapist/Clinic Card Data
  const fetchClinicData = async () => {
    try {
      setLoading(true)
      const res = await getClinicData(clinicId, branchId, therapistId)
      console.log('Clinic API Response:', res)
      setTherapyData(res?.data || [])
    } catch (err) {
      console.error('Clinic Fetch Error:', err)
      setTherapyData([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ Fetch Assigned Patients based on statusId
  const fetchDashboardData = async (statusId) => {
    try {
      setDashboardLoading(true)
      const response = await getDashboard(clinicId, branchId, therapistId, statusId)
      console.log('Full API Response:', response)

      const patients = response?.data || []
      setDashboard(response)
      setPatientList(patients)
    } catch (err) {
      console.error('Dashboard Fetch Error:', err)
      setDashboard(null)
      setPatientList([])
    } finally {
      setDashboardLoading(false)
    }
  }

  // ✅ On mount
  useEffect(() => {
    if (clinicId && branchId && therapistId) {
      fetchClinicData()
      fetchDashboardData(1)
    } else {
      console.warn('Missing IDs:', { clinicId, branchId, therapistId })
      setLoading(false)
    }
  }, [clinicId, branchId, therapistId])

  // ✅ Re-fetch when tab changes
  useEffect(() => {
    if (clinicId && branchId && therapistId) {
      fetchDashboardData(tab)
    }
  }, [tab])

  const list = therapyData || []
  const stats = getStats(dashboard)

  return (
    <>
      <CContainer fluid>
        {loading ? (
     <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100%",
  }}
>
  <LoadingIndicator message="Loading therapy data..." />
</div>
        ) : (
          <>
            {/* ✅ Therapist Cards + Stats Row */}
            <CRow
              className="g-3 flex-nowrap overflow-auto pb-2"
              style={{
                whiteSpace: "nowrap",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              

              {/* Today's Appointments */}
              <CCol
                xs="10"
                sm="6"
                md="3"
                className="d-flex"
                style={{ flex: "0 0 auto", minWidth: "220px" }}
              >
                <CCard  style={{color:COLORS.primary}} className="w-100 h-100">
                  <CCardBody className="text-center py-3 px-2">
                    <h6 className="mb-1" style={{ fontSize: "14px" }}>
                      Today's Appointments
                    </h6>
                    <h2 className="mb-1">{stats?.todayCount || 0}</h2>
                    <small>{stats?.todayTime || 0} min</small>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Weekly */}
              <CCol
                xs="10"
                sm="6"
                md="3"
                className="d-flex"
                style={{ flex: "0 0 auto", minWidth: "220px" }}
              >
                <CCard  style={{color:COLORS.primary}} className="w-100 h-100">
                  <CCardBody className="text-center py-3 px-2">
                    <h6 className="mb-1" style={{ fontSize: "14px" }}>
                      Weekly Appointment
                    </h6>
                    <h2 className="mb-1">{stats?.weekCount || 0}</h2>
                    <small>{stats?.weekTime || 0} min</small>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Monthly */}
              <CCol
                xs="10"
                sm="6"
                md="3"
                className="d-flex"
                style={{ flex: "0 0 auto", minWidth: "220px" }}
              >
                <CCard  style={{color:COLORS.primary}} className="w-100 h-100">
                  <CCardBody className="text-center py-3 px-2">
                    <h6 className="mb-1" style={{ fontSize: "14px" }}>
                      Monthly Appointments
                    </h6>
                    <h2 className="mb-1">{stats?.monthCount || 0}</h2>
                    <small>{stats?.monthTime || 0} min</small>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

            {/* ✅ Sessions / Patients Section */}
            <CCard className="mt-4">
              <CCardBody>

                {/* ✅ Tab Navigation */}
                <CNav
                  variant="tabs"
                  color={COLORS.primary}
                  className="mb-3 flex-nowrap overflow-auto"
                  style={{
                    whiteSpace: "nowrap",
                    scrollbarWidth: "none",
                  }}
                >
                  <CNavItem style={{ flex: "0 0 auto" }}>
                    <CNavLink
                      active={tab === 1}
                      onClick={() => setTab(1)}
                      style={{ cursor: "pointer",color:COLORS.primary }}
                    >
                      New Sessions
                    </CNavLink>
                  </CNavItem>

                  <CNavItem style={{ flex: "0 0 auto" }}>
                    <CNavLink
                      active={tab === 2}
                      onClick={() => setTab(2)}
                      style={{ cursor: "pointer",color:COLORS.primary }}
                    >
                      Active Sessions
                    </CNavLink>
                  </CNavItem>

                  <CNavItem style={{ flex: "0 0 auto" }}>
                    <CNavLink
                      active={tab === 3}
                      onClick={() => setTab(3)}
                      style={{ cursor: "pointer",color:COLORS.primary }}
                    >
                      Completed Sessions
                    </CNavLink>
                  </CNavItem>
                </CNav>
{patientList.length !== 0 && 
                <h5 className='mb-4' style={{color:COLORS.primary}}>Patients</h5>
}
                {/* ✅ Patient List */}
                {dashboardLoading ? (
                  <div  >
                    
                    <LoadingIndicator message='Loading patients...'/>
                  </div>
                ) : patientList.length === 0 ? (
                  <p style={{ textAlign: 'center', color: COLORS.primary }}>No Data Found</p>
                ) : (
                  patientList.map((p, index) => (
                    <PatientRow
                      key={p.patientId || index}
                      p={p}
                      index={index}
                      clinicId={clinicId}
                      branchId={branchId}
                      onViewDetails={setSelected}
                      navigate={navigate}
                    />
                  ))
                )}

              </CCardBody>
            </CCard>
          </>
        )}
      </CContainer>

      {/* ✅ PatientViewModal now receives full record from getSessionDetails */}
      <PatientViewModal
        visible={!!selected}
        data={selected}
        onClose={() => setSelected(null)}
      />
    </>
  )
}

export default TherapyDashboard