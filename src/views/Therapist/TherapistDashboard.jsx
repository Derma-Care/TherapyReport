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
import { getClinicData, getDashboard, getSessionDetails } from './TheraphyApi'
import PatientViewModal from './PatientViewModal'
import capitalizeWords from '../../Utils/capitalizeWords'

// ─── Dummy exercise/session data (fallback when API has no therapyWithSessions) ─
const DUMMY_THERAPY_DATA = [
  {
    exerciseId: 'E1',
    exerciseName: 'Shoulder Rotation',
    frequency: '2/day',
    noOfSessions: 10,
    pricePerSession: 200,
    repetitions: 15,
    sets: 3,
    totalSessionCost: 2000,
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    sessions: [
      { date: '4/8/2026',  status: 'Pending', sessionsId: 'E1_1' },
      { date: '4/9/2026',  status: 'Paid',    sessionsId: 'E1_2' },
      { date: '4/10/2026', status: 'Pending', sessionsId: 'E1_3' },
      { date: '4/11/2026', status: 'Pending', sessionsId: 'E1_4' },
      { date: '4/12/2026', status: 'Pending', sessionsId: 'E1_5' },
    ],
  },
  {
    exerciseId: 'E2',
    exerciseName: 'Arm Circles',
    frequency: '3/day',
    noOfSessions: 5,
    pricePerSession: 150,
    repetitions: 10,
    sets: 2,
    totalSessionCost: 750,
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    sessions: [
      { date: '4/8/2026',  status: 'Pending', sessionsId: 'E2_1' },
      { date: '4/9/2026',  status: 'Paid',    sessionsId: 'E2_2' },
      { date: '4/10/2026', status: 'Pending', sessionsId: 'E2_3' },
    ],
  },
]

// ─── Session dot ──────────────────────────────────────────────────────────────
const SessionDot = ({ session, index }) => {
  const { status, date } = session
  let bg = '#f3f4f6', color = '#9ca3af', border = '#d1d5db'
  if (status === 'Done') { bg = '#d1fae5'; color = '#065f46'; border = '#6ee7b7' }
  if (status === 'Paid') { bg = '#d1fae5'; color = '#065f46'; border = '#10b981' }
  return (
    <div
      title={`${date} — ${status}`}
      style={{
        width: 30, height: 30, borderRadius: '50%',
        background: bg, color, border: `1.5px solid ${border}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 600, margin: 2, cursor: 'pointer',
      }}
    >
      {index + 1}
    </div>
  )
}

// ─── Exercise accordion ───────────────────────────────────────────────────────
const ExerciseAccordion = ({ exercises }) => {
  const [openIdx, setOpenIdx]     = useState(null)
  const [startTime, setStartTime] = useState({})
  const [endTime, setEndTime]     = useState({})
  const [setsDone, setSetsDone]   = useState({})
  const [repsDone, setRepsDone]   = useState({})
  const [recording, setRecording] = useState({})

  const handleSubmit = (ex) => {
    alert(
      `Session submitted for "${ex.exerciseName}":\n` +
      `Start: ${startTime[ex.exerciseId] || '—'}\n` +
      `End:   ${endTime[ex.exerciseId]   || '—'}\n` +
      `Sets done: ${setsDone[ex.exerciseId] || 0}\n` +
      `Reps done: ${repsDone[ex.exerciseId] || 0}`
    )
  }

  return (
    <div className="mt-3">
      <small className="text-muted fw-semibold">THERAPY EXERCISES</small>
      {exercises.map((ex, idx) => (
        <CCard key={ex.exerciseId || idx} className="mt-2" style={{ border: '1px solid #dee2e6' }}>
          <CCardBody className="p-2">

            {/* Header */}
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            >
              <div className="d-flex align-items-center gap-2">
                <strong style={{ fontSize: 13 }}>{ex.exerciseName}</strong>
                <CBadge color="success" style={{ fontSize: 10 }}>{ex.frequency}</CBadge>
              </div>
              <div className="d-flex align-items-center gap-3">
                <small className="text-muted">
                  {ex.sets}s · {ex.repetitions}r · {ex.noOfSessions} sessions · ₹{(ex.totalSessionCost || 0).toLocaleString()}
                </small>
                <small>{openIdx === idx ? '▲' : '▼'}</small>
              </div>
            </div>

            {/* Expanded */}
            <CCollapse visible={openIdx === idx}>
              <hr className="my-2" />

              {/* Stat pills */}
              <div className="d-flex flex-wrap gap-1 mb-3">
                {[
                  ['Sets', ex.sets],
                  ['Reps', ex.repetitions],
                  ['Sessions', ex.noOfSessions],
                  ['₹/session', ex.pricePerSession],
                  ['Total', `₹${(ex.totalSessionCost || 0).toLocaleString()}`],
                ].map(([k, v]) => (
                  <span key={k} style={{ fontSize: 11, padding: '2px 10px', background: '#f3f4f6', border: '0.5px solid #e5e7eb', borderRadius: 20, color: '#374151' }}>
                    {k}: <strong>{v}</strong>
                  </span>
                ))}
              </div>

              {/* Session dots */}
              <div className="mb-1">
                <small className="text-muted">
                  Sessions —&nbsp;
                  <span style={{ color: '#065f46' }}>● Done / Paid</span>&nbsp;&nbsp;
                  <span style={{ color: '#9ca3af' }}>● Pending</span>
                </small>
              </div>
              <div className="d-flex flex-wrap mb-3">
                {(ex.sessions || []).map((s, si) => (
                  <SessionDot key={s.sessionsId || si} session={s} index={si} />
                ))}
              </div>

              {/* Time inputs */}
              <CRow className="g-2 mb-2">
                <CCol xs={12} sm={4}>
                  <CFormLabel style={{ fontSize: 12, marginBottom: 2 }}>Start Time</CFormLabel>
                  <CFormInput
                    type="time"
                    size="sm"
                    value={startTime[ex.exerciseId] || ''}
                    onChange={(e) => setStartTime((p) => ({ ...p, [ex.exerciseId]: e.target.value }))}
                  />
                </CCol>
                <CCol xs={12} sm={4}>
                  <CFormLabel style={{ fontSize: 12, marginBottom: 2 }}>End Time</CFormLabel>
                  <CFormInput
                    type="time"
                    size="sm"
                    value={endTime[ex.exerciseId] || ''}
                    onChange={(e) => setEndTime((p) => ({ ...p, [ex.exerciseId]: e.target.value }))}
                  />
                </CCol>
              </CRow>

              {/* Sets / Reps done */}
              <CRow className="g-2 mb-3">
                <CCol xs={6} sm={3}>
                  <CFormLabel style={{ fontSize: 12, marginBottom: 2 }}>Sets Done</CFormLabel>
                  <CFormSelect
                    size="sm"
                    value={setsDone[ex.exerciseId] || 0}
                    onChange={(e) => setSetsDone((p) => ({ ...p, [ex.exerciseId]: e.target.value }))}
                  >
                    {Array.from({ length: ex.sets + 1 }, (_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol xs={6} sm={3}>
                  <CFormLabel style={{ fontSize: 12, marginBottom: 2 }}>Reps Done</CFormLabel>
                  <CFormSelect
                    size="sm"
                    value={repsDone[ex.exerciseId] || 0}
                    onChange={(e) => setRepsDone((p) => ({ ...p, [ex.exerciseId]: e.target.value }))}
                  >
                    {Array.from({ length: ex.repetitions + 1 }, (_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              {/* Action buttons */}
              <div className="d-flex flex-wrap gap-2">
                <CButton color="success" size="sm" onClick={() => handleSubmit(ex)}>✓ Mark Complete</CButton>
                <CButton
                  color={recording[ex.exerciseId] ? 'danger' : 'secondary'}
                  size="sm"
                  onClick={() => setRecording((p) => ({ ...p, [ex.exerciseId]: !p[ex.exerciseId] }))}
                >
                  {recording[ex.exerciseId] ? '⏹ Stop Recording' : '🎙 Audio Record'}
                </CButton>
                {ex.youtubeUrl && (
                  <CButton color="danger" variant="outline" size="sm" onClick={() => window.open(ex.youtubeUrl, '_blank')}>
                    ▶ Watch Exercise
                  </CButton>
                )}
                <CButton color="primary" size="sm" onClick={() => handleSubmit(ex)}>Submit Session</CButton>
              </div>
            </CCollapse>
          </CCardBody>
        </CCard>
      ))}
    </div>
  )
}

// ─── Patient Row ──────────────────────────────────────────────────────────────
// ✅ KEY FIX: handleViewDetails calls getSessionDetails API first,
//    then passes the FULL record to PatientViewModal.
//    PatientViewModal expects: record.patientInfo, record.assessment,
//    record.diagnosis, record.treatmentPlan, record.therapySessions,
//    record.exercisePlan, record.complaints, record.followUp, etc.
const PatientRow = ({ p, index, clinicId, branchId, onViewDetails, navigate }) => {
  const [showExercises, setShowExercises] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  const exercises =
    p?.therapyWithSessions?.therophyData?.length
      ? p.therapyWithSessions.therophyData
      : DUMMY_THERAPY_DATA

  // ✅ Fetch full patient record before opening modal
  const handleViewDetails = async () => {
    try {
      setDetailLoading(true)

      // API: getRecordByClinicIdBranchIdtherapistRecordIdAndSessionId
      // params: clinicId, branchId, therapistRecordId, bookingId (acts as sessionId here)
      const res = await getSessionDetails(
        clinicId,
        branchId,
        p.therapistRecordId,
        p.bookingId,
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
        <div className="d-flex justify-content-between align-items-center">

          {/* ✅ Patient Info — exact API field names */}
          <div>
            <b>Patient: {p.patientName || 'N/A'}</b>
            <br />
            Doctor: {p.doctorName || 'N/A'}
            <br />
            Program: {p.programName || 'N/A'}
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
            >
              {p.overallStatus || 'Pending'}
            </CBadge>
          </div>

          {/* ✅ Action Buttons */}
          <div className="d-flex flex-column justify-content-center align-items-center gap-1">

            {/* ✅ FIXED: calls getSessionDetails then opens modal with full record */}
            <CButton
              size="sm"
              color="info"
              style={{ color: 'white' }}
              disabled={detailLoading}
              onClick={handleViewDetails}
            >
              {detailLoading ? <CSpinner size="sm" /> : 'View Details'}
            </CButton>

            <CButton
              size="sm"
              color="primary"
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

            <CButton
              size="sm"
              color="dark"
              variant="outline"
              onClick={() => setShowExercises((v) => !v)}
            >
              {showExercises ? '▲ Exercises' : '▼ Exercises'}
            </CButton>
          </div>
        </div>

        {/* ✅ Exercise accordion */}
        <CCollapse visible={showExercises}>
          <ExerciseAccordion exercises={exercises} />
        </CCollapse>
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
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <CSpinner color="primary" />
            <p>Loading therapy data...</p>
          </div>
        ) : (
          <>
            {/* ✅ Therapist Cards + Stats Row */}
            <CRow className="g-3">

              {/* ✅ Therapist/Doctor Cards */}
              {list.length === 0 ? (
                <CCol md={3}>
                  <CCard className="p-3 text-center h-100">
                    <h5>No Therapist Data Found</h5>
                  </CCard>
                </CCol>
              ) : (
                list.map((item, index) => (
                  <CCol md={3} key={index} className="d-flex">
                    <CCard className="w-100 h-100 shadow-sm" style={{ borderRadius: '12px' }}>
                      <CCardBody className="d-flex flex-column justify-content-between">
                        <div>
                          <CRow className="align-items-center">
                            <CCol xs={4} className="text-center">
                              <img
                                src={
                                  item?.documents?.profilePhoto
                                    ? `data:image/jpeg;base64,${item.documents.profilePhoto}`
                                    : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
                                }
                                alt="profile"
                                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                            </CCol>
                            <CCol xs={8}>
                              <h6 style={{ margin: 0 }}>{capitalizeWords(item?.fullName)}</h6>
                              <small>{item?.qualification}</small>
                              <p style={{ fontSize: '12px' }}>{item?.specializations?.join(', ')}</p>
                            </CCol>
                          </CRow>
                        </div>
                        <div className="text-end">
                          <CButton size="sm" color="primary" onClick={() => navigate('/therapist-details', { state: item })}>
                            View
                          </CButton>
                        </div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                ))
              )}

              {/* ✅ Today's Appointments */}
              <CCol md={3} className="d-flex">
                <CCard color="primary" textColor="white" className="w-100 h-100">
                  <CCardBody className="d-flex flex-column justify-content-center text-center">
                    <h6>Today's Appointments</h6>
                    <h2>{stats?.todayCount || 0}</h2>
                    <small>{stats?.todayTime || 0} min</small>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* ✅ Weekly Appointments */}
              <CCol md={3} className="d-flex">
                <CCard color="success" textColor="white" className="w-100 h-100">
                  <CCardBody className="d-flex flex-column justify-content-center text-center">
                    <h6>Weekly Appointment</h6>
                    <h2>{stats?.weekCount || 0}</h2>
                    <small>{stats?.weekTime || 0} min</small>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* ✅ Monthly Appointments */}
              <CCol md={3} className="d-flex">
                <CCard color="warning" textColor="white" className="w-100 h-100">
                  <CCardBody className="d-flex flex-column justify-content-center text-center">
                    <h6>Monthly Appointments</h6>
                    <h2>{stats?.monthCount || 0}</h2>
                    <small>{stats?.monthTime || 0} min</small>
                  </CCardBody>
                </CCard>
              </CCol>

            </CRow>

            {/* ✅ Sessions / Patients Section */}
            <CCard className="mt-4">
              <CCardBody>

                {/* ✅ Tab Navigation */}
                <CNav variant="tabs" className="mb-3">
                  <CNavItem>
                    <CNavLink active={tab === 1} onClick={() => setTab(1)} style={{ cursor: 'pointer' }}>
                      New Sessions
                    </CNavLink>
                  </CNavItem>
                  <CNavItem>
                    <CNavLink active={tab === 2} onClick={() => setTab(2)} style={{ cursor: 'pointer' }}>
                      Active Sessions
                    </CNavLink>
                  </CNavItem>
                  <CNavItem>
                    <CNavLink active={tab === 3} onClick={() => setTab(3)} style={{ cursor: 'pointer' }}>
                      Completed Sessions
                    </CNavLink>
                  </CNavItem>
                </CNav>

                <h5>Patients</h5>

                {/* ✅ Patient List */}
                {dashboardLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <CSpinner color="primary" size="sm" />
                    <p>Loading patients...</p>
                  </div>
                ) : patientList.length === 0 ? (
                  <p>No Data Found</p>
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