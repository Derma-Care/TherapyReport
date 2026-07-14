/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  CSpinner,
  CCollapse,
  CButton,
} from '@coreui/react'
import { getStats } from './therapistService'
import { useLocation, useNavigate } from 'react-router-dom'
import { getBookingByBookingId, getClinicData, getDashboard, getSessionDetails, assignTherapist, updateAssignedStatus, getTherapistsWithServices } from './TheraphyApi'
import PatientViewModal from './PatientViewModal'
import capitalizeWords from '../../Utils/capitalizeWords'
import LoadingIndicator from '../../Utils/loader'
import {
  User, Phone, Stethoscope, Activity,
  CheckCircle2, Clock, CalendarDays, ArrowRight,
  ClipboardList, Users, Zap, X
} from 'lucide-react'
import { COLORS } from '../../Constant/Themes'

// ─── Status config ────────────────────────────────────────
const STATUS_CONFIG = {
  completed: { bg: '#E1F5EE', color: '#085041', border: '#9FE1CB', dot: '#1D9E75' },
  active: { bg: '#FAEEDA', color: '#633806', border: '#FAC775', dot: '#BA7517' },
  default: { bg: '#f1efe8', color: '#5f5e5a', border: '#d3d1c7', dot: '#888780' },
}
const getStatus = (s) => STATUS_CONFIG[s?.toLowerCase()] || STATUS_CONFIG.default

// ─── Reassign Modal ───────────────────────────────────────
const ReassignModal = ({ visible, onClose, onAssign, onWithdraw, patient, clinicId, branchId, originalTherapistId, originalTherapistName, assignedTherapist }) => {
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)

  const [therapistsList, setTherapistsList] = useState([])
  const [listLoading, setListLoading] = useState(false)

  useEffect(() => {
    const fetchTherapists = async () => {
      if (!visible) return
      setListLoading(true)
      try {
        const res = await getTherapistsWithServices(clinicId, branchId)
        if (res?.success && res?.data) {
          setTherapistsList(res.data)
        }
      } catch (err) {
        console.error("Error fetching therapists:", err)
      } finally {
        setListLoading(false)
      }
    }
    fetchTherapists()
  }, [visible, clinicId, branchId])

  if (!visible) return null

  const handleAssign = async () => {
    if (!selected) return
    setLoading(true)
    try {
      const payload = {
        clinicId,
        branchId,
        therapistRecordId: patient?.therapistRecordId,
        assignTherapistId: originalTherapistId,
        assignTherapistName: originalTherapistName,
        assignedTherapistId: selected.therapistId,
        assignedTherapistName: selected.therapistName,
      }
      console.log("assignTherapist payload", payload)
      const res = await assignTherapist(payload)
      console.log("assignTherapist res", res)
      if (res?.success) {
        onAssign(selected)
      } else {
        console.error("assignTherapist failed:", res)
      }
    } catch (err) {
      console.error("assignTherapist error:", err?.response?.data || err)
    } finally {
      setLoading(false)
      onClose()
    }
  }

  const handleWithdraw = async () => {
    setLoading(true)
    try {
      if (patient?.therapistRecordId) {
        const res = await updateAssignedStatus(patient.therapistRecordId, "false")
        if (res?.success) {
          onWithdraw()
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '16px' }}>
      <div style={{ background: '#fff', padding: 0, borderRadius: 12, width: 450, maxWidth: '100%', maxHeight: '90%', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#1b4f8a', // PRIMARY
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Users size={20} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              REASSIGN THERAPIST
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '2px 0' }}>
              {patient?.patientName || 'Select Therapist'}
            </div>
            {patient?.bookingId && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}>
                #{patient?.bookingId}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#fff', padding: 4, cursor: 'pointer',
            opacity: 0.8, alignSelf: 'flex-start',
            transition: 'opacity 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.8}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', padding: '20px', background: '#f1f5f9', flex: 1, maxHeight: 420 }}>

          {/* Currently assigned therapist card (shown when already assigned) */}
          {assignedTherapist && (
            <>
              <div style={{ fontSize: 13, color: '#0c447c', fontWeight: 600, marginBottom: 4 }}>Currently Assigned To:</div>
              <div style={{
                padding: 14,
                border: `1px solid #185fa5`,
                borderRadius: 8,
                background: '#e6f1fb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                flexShrink: 0
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#0c447c', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} /> {assignedTherapist.therapistName}
                    </div>
                    <span style={{ fontSize: 11, color: '#888780', fontWeight: 'normal', display: 'block', marginLeft: 20 }}>
                      ID: {assignedTherapist.therapistId}
                    </span>
                  </div>
                  {assignedTherapist.services?.length > 0 && (
                    <div style={{ fontSize: 12, color: '#5f5e5a', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'capitalize' }}>
                      <Activity size={12} /> {assignedTherapist.services.join(', ')}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 11, fontWeight: '600', color: '#1D9E75', background: '#ecfdf5', padding: '4px 8px', borderRadius: 4, flexShrink: 0, marginLeft: 10 }}>
                  Assigned
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', padding: '6px 2px', marginBottom: 2 }}>
                Select a different therapist below to reassign:
              </div>
            </>
          )}

          {/* Therapist list */}
          {listLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <CSpinner size="sm" />
            </div>
          ) : therapistsList.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13, padding: '20px' }}>No therapists available</div>
          ) : (
            therapistsList.map((t, index) => {
              const isDisabled = t.isPresent === true
              const isCurrentlyAssigned = assignedTherapist && t.therapistId === assignedTherapist.therapistId

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (isDisabled || isCurrentlyAssigned) return
                    setSelected(t)
                  }}
                  style={{
                    padding: 12,
                    border: `1px solid ${isCurrentlyAssigned ? '#185fa5' :
                      selected?.therapistId === t.therapistId ? '#185fa5' : '#d0dce9'
                      }`,
                    borderRadius: 8,
                    background: isCurrentlyAssigned ? '#dbeafe' : selected?.therapistId === t.therapistId ? '#e6f1fb' : '#fff',
                    cursor: isDisabled || isCurrentlyAssigned ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.6 : 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0c447c', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={14} /> {t.therapistName}
                      </div>
                      <span style={{ fontSize: 11, color: '#888780', fontWeight: 'normal', display: 'block', marginLeft: 20 }}>
                        ID: {t.therapistId}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#5f5e5a', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'capitalize' }}>
                      <Activity size={12} /> {t.services?.join(', ')}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: '600',
                    color: isCurrentlyAssigned ? '#185fa5' : isDisabled ? '#ef4444' : '#1D9E75',
                    background: isCurrentlyAssigned ? '#dbeafe' : isDisabled ? '#fef2f2' : '#ecfdf5',
                    padding: '4px 8px', borderRadius: 4, flexShrink: 0, marginLeft: 10
                  }}>
                    {isCurrentlyAssigned ? 'Current' : isDisabled ? 'Unavailable' : 'Selectable'}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {confirmWithdraw ? (
          /* ── Withdraw confirmation banner ── */
          <div style={{ flexShrink: 0, borderTop: '1px solid #fecaca', background: '#fff5f5' }}>
            <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#fee2e2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0, marginTop: 2
              }}>
                <X size={15} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c', marginBottom: 2 }}>Withdraw Assignment?</div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                  This will remove <strong style={{ color: '#0f172a' }}>{assignedTherapist?.therapistName}</strong> from this patient and return them to the original queue.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '10px 20px 14px', flexWrap: 'wrap' }}>
              <button
                className="td-btn td-btn-outline"
                onClick={() => setConfirmWithdraw(false)}
                disabled={loading}
              >
                No, Keep
              </button>
              <button
                className="td-btn td-btn-outline"
                style={{ borderColor: '#ef4444', color: '#ef4444', background: loading ? '#fef2f2' : 'transparent' }}
                onClick={handleWithdraw}
                disabled={loading}
              >
                {loading ? <CSpinner size="sm" /> : 'Yes, Withdraw'}
              </button>
            </div>
          </div>
        ) : (
          /* ── Normal footer ── */
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, padding: '14px 20px', background: '#fff', borderTop: '1px solid #e2e8f0', flexShrink: 0, flexWrap: 'wrap' }}>
            <button className="td-btn td-btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
            {assignedTherapist && assignedTherapist.therapistId !== originalTherapistId && (
              <button
                className="td-btn td-btn-outline"
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
                onClick={() => setConfirmWithdraw(true)}
                disabled={loading}
              >
                Withdraw
              </button>
            )}
            <button className="td-btn td-btn-primary" onClick={handleAssign} disabled={!selected || loading}>
              {loading ? <CSpinner size="sm" /> : 'Confirm Reassign'}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

const PatientRow = ({ p, index, clinicId, branchId, originalTherapistId, originalTherapistName, onViewDetails, navigate, onRefresh }) => {
  const [detailLoading, setDetailLoading] = useState(false)
  const [showReassign, setShowReassign] = useState(false)
  const [sessionToast, setSessionToast] = useState(false)
  const [assignedTherapist, setAssignedTherapist] = useState(() => {
    const isAssigned = p.assignedStatus === true || p.assignedStatus === "true" || p.assignStatus === "true" || p.assignStatus === true
    if (isAssigned) {
      return {
        therapistName: p.assignedTherapistName || p.assignedTherapist || 'Assigned Therapist',
        therapistId: p.assignedTherapistId || p.assignedthrepaistId || 'Unknown ID',
        services: [] // Not provided by the list API, but UI can gracefully handle
      }
    }
    return null
  })

  const bookingId = p.bookingId
  const patientId = p.patientId
  const therapistRecordId = p.therapistRecordId
  const status = getStatus(p.overallStatus)

  const initials = (name) => {
    if (!name) return 'P'
    return name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s*/i, '').trim()
      .split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || 'P'
  }

  const handleViewDetails = async () => {
    try {
      setDetailLoading(true)
      const res = await getBookingByBookingId(clinicId, branchId, patientId, bookingId, therapistRecordId)
      onViewDetails(res?.data || res || p)
    } catch {
      onViewDetails(p)
    } finally {
      setDetailLoading(false)
    }
  }
  const transferred = p.therapistId && p.assignedStatus && p.assignedTo;
  return (
    <div className="td-patient-card">
      {/* Left accent */}
      <div className="td-patient-accent" style={{ background: status.dot }} />

      <div className="td-patient-top">
        {/* Avatar */}
        <div className="td-patient-avatar">
          {initials(p.patientName)}
        </div>

        {/* Info */}
        <div className="td-patient-info">
          <div className="td-patient-name">{p.patientName || 'N/A'}</div>
          <div className="td-patient-meta">
            <span><ClipboardList size={11} /> {p.bookingId || 'N/A'}</span>
            <span><Stethoscope size={11} /> {p.doctorName || 'N/A'}</span>
            <span><Activity size={11} /> {p.serivceType || 'N/A'}</span>
            <span><Phone size={11} /> {p.mobileNumber || p.patientMobileNumber || 'N/A'}</span>
          </div>
          {transferred && (
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700 }}>
              <ArrowRight size={10} /> Transferred from {p.therapistName}
            </div>
          )}
        </div>
      </div>

      <div className="td-patient-bottom">
        {/* Status badge & Reassign */}
        <div className="td-patient-mid" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span
            className="td-status-badge"
            style={{ background: status.bg, color: status.color, borderColor: status.border }}
          >
            <span className="td-status-dot" style={{ background: status.dot }} />
            {p.overallStatus || 'Pending'}
          </span>
          {p.overallStatus?.toLowerCase() === 'completed' ? (
            assignedTherapist && !transferred ? (
              <button
                className="td-btn td-btn-primary"
                style={{ padding: "4px 10px", fontSize: "11px", height: "26px" }}
                onClick={() => setShowReassign(true)}
              >
                <Users size={11} color="#fff" />
                {" "}
                Assigned
              </button>
            ) : null
          ) : (
            <button
              className={`td-btn ${assignedTherapist && !transferred ? "td-btn-primary" : "td-btn-outline"
                }`}
              style={{ padding: "4px 10px", fontSize: "11px", height: "26px" }}
              onClick={() => setShowReassign(true)}
            >
              <Users
                size={11}
                color={assignedTherapist && !transferred ? "#fff" : "currentColor"}
              />
              {" "}
              {assignedTherapist && !transferred ? "Assigned" : "Reassign"}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="td-patient-actions">
          <button
            className="td-btn td-btn-outline"
            disabled={detailLoading}
            onClick={handleViewDetails}
          >
            {detailLoading
              ? <CSpinner size="sm" style={{ width: 12, height: 12 }} />
              : <><ClipboardList size={12} /> Details</>}
          </button>
          <button
            className="td-btn td-btn-primary"
            style={assignedTherapist && !transferred ? { opacity: 0.55, cursor: 'not-allowed', background: '#94a3b8', borderColor: '#94a3b8' } : {}}
            onClick={() => {
              if (assignedTherapist && !transferred) {
                setSessionToast(true)
                setTimeout(() => setSessionToast(false), 3000)
                return
              }
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
            }}
          >
            Sessions <ArrowRight size={12} color="#fff" />
          </button>
          {/* Session locked toast */}
          {sessionToast && (
            <div style={{
              position: 'absolute', bottom: '110%', right: 0,
              background: '#1e293b', color: '#fff',
              fontSize: 11, fontWeight: 500,
              padding: '7px 12px', borderRadius: 8,
              whiteSpace: 'nowrap', zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
              animation: 'td-toast-in 0.2s ease',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <X size={11} color="#f87171" />
              Withdraw the assignment to access sessions
              <span style={{
                position: 'absolute', bottom: -5, right: 16,
                width: 10, height: 10,
                background: '#1e293b',
                transform: 'rotate(45deg)',
                borderRadius: 2
              }} />
            </div>
          )}
        </div>
      </div>

      <ReassignModal
        visible={showReassign}
        onClose={() => setShowReassign(false)}
        patient={p}
        clinicId={clinicId}
        branchId={branchId}
        originalTherapistId={originalTherapistId}
        originalTherapistName={originalTherapistName}
        assignedTherapist={assignedTherapist}
        onAssign={(therapist) => {
          console.log('Reassigned to:', therapist)
          setAssignedTherapist(therapist)
          setShowReassign(false)
        }}
        onWithdraw={() => {
          console.log('Withdrawn assignment from:', assignedTherapist)
          setAssignedTherapist(null)
          setShowReassign(false)
          // Re-fetch fresh data so next reassign uses updated therapistRecordId
          if (onRefresh) onRefresh()
        }}
      />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────
const TherapyDashboard = () => {
  const [tab, setTab] = useState(1)
  const [therapyData, setTherapyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [patientList, setPatientList] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [selected, setSelected] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const location = useLocation()
  const navigate = useNavigate()

  const storedData = localStorage.getItem('therapistData')
  const routeData = location.state || (storedData ? JSON.parse(storedData) : {})
  const clinicId = routeData?.clinicId
  const branchId = routeData?.branchId
  const therapistId = routeData?.therapistId

  const fetchClinicData = async () => {
    try {
      setLoading(true)
      const res = await getClinicData(clinicId, branchId, therapistId)
      setTherapyData(res?.data || [])
    } catch { setTherapyData([]) }
    finally { setLoading(false) }
  }

  const fetchDashboardData = async (statusId) => {
    try {
      setDashboardLoading(true)
      const response = await getDashboard(clinicId, branchId, therapistId, statusId)
      setDashboard(response)
      setPatientList(response?.data || [])
    } catch { setDashboard(null); setPatientList([]) }
    finally { setDashboardLoading(false) }
  }

  useEffect(() => {
    if (clinicId && branchId && therapistId) {
      fetchClinicData()
      fetchDashboardData(1)
    } else {
      setLoading(false)
    }
  }, [clinicId, branchId, therapistId])

  useEffect(() => {
    if (clinicId && branchId && therapistId) {
      fetchDashboardData(tab)
      setCurrentPage(1)
    }
  }, [tab])

  const stats = getStats(dashboard)

  const TABS = [
    { id: 1, label: 'New Sessions', icon: Zap, accent: '#185fa5' },
    { id: 2, label: 'Active Sessions', icon: Activity, accent: '#BA7517' },
    { id: 3, label: 'Completed Sessions', icon: CheckCircle2, accent: '#1D9E75' },
  ]

  const STATS = [
    { label: "Today's Appointments", value: stats?.todayCount || 0, sub: `${stats?.todayTime || 0} min`, icon: CalendarDays, accent: '#185fa5', bg: '#e6f1fb', border: '#b5d4f4' },
    { label: 'Weekly Appointments', value: stats?.weekCount || 0, sub: `${stats?.weekTime || 0} min`, icon: Clock, accent: '#BA7517', bg: '#FAEEDA', border: '#FAC775' },
    { label: 'Monthly Appointments', value: stats?.monthCount || 0, sub: `${stats?.monthTime || 0} min`, icon: Users, accent: '#1D9E75', bg: '#E1F5EE', border: '#9FE1CB' },
  ]

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <LoadingIndicator message="Loading therapy data…" />
    </div>
  )

  return (
    <>
      {/* ── Animated background ─────────────────── */}
      <div className="td-bg" aria-hidden="true">
        <div className="td-bg-gradient" />
        <div className="td-bg-orb td-bg-orb-1" />
        <div className="td-bg-orb td-bg-orb-2" />
        <div className="td-bg-orb td-bg-orb-3" />
        <svg className="td-bg-dots" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="td-dot-pattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="#185fa5" fillOpacity="0.06" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#td-dot-pattern)" />
        </svg>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`td-particle td-particle-${i + 1}`} />
        ))}
      </div>

      <div className="td-page">

        {/* ── Page header ───────────────────────── */}
        <div className="td-page-header">
          <div>
            <h1 className="td-page-title">Therapist Dashboard</h1>
            <p className="td-page-sub">Manage your patient sessions and appointments</p>
          </div>

          <CButton
            style={{ backgroundColor: COLORS.primary, color: "white", display: "flex", justifyContent: "end", alignItems: "center", gap: 8 }}
            onClick={() => navigate('/therapist/attendance', { state: { clinicId, branchId, therapistId } })}
          >
            <Clock size={16} color="white" /> Duty Logs
          </CButton>
        </div>

        {/* ── Session tabs panel ────────────────── */}
        <div className="td-panel">

          {/* Tabs */}
          <div className="td-tabs">
            {TABS.map(({ id, label, icon: Icon, accent }) => (
              <button
                key={id}
                className={`td-tab${tab === id ? ' active' : ''}`}
                style={tab === id ? { background: accent, borderColor: accent, color: '#fff' } : {}}
                onClick={() => setTab(id)}
              >
                <Icon size={13} color={tab === id ? '#fff' : 'currentColor'} />
                {label}
              </button>
            ))}
          </div>

          {/* Patient list */}
          <div className="td-patient-list">
            {dashboardLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <LoadingIndicator message="Loading patients…" />
              </div>
            ) : patientList.length === 0 ? (
              <div className="td-empty">
                <Users size={40} style={{ color: '#d3d1c7', marginBottom: 10 }} />
                <p>No patients found for this session type.</p>
              </div>
            ) : (
              <>
                <div className="td-list-header">
                  <span className="td-list-count">
                    <Users size={13} /> {patientList.length} Patient{patientList.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {patientList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((p, index) => {
                  const displayPatient = p
                  return (
                    <PatientRow
                      key={`${p.bookingId || 'no-booking'}-${index}-${currentPage}`}
                      p={displayPatient}
                      index={index}
                      clinicId={clinicId}
                      branchId={branchId}
                      originalTherapistId={therapistId}
                      originalTherapistName={routeData?.therapistName}
                      onViewDetails={setSelected}
                      navigate={navigate}
                      onRefresh={() => fetchDashboardData(tab)}
                    />
                  )
                })}
                {patientList.length > itemsPerPage && (
                  <div className="td-pagination">
                    <button
                      className="td-page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Prev
                    </button>
                    <span className="td-page-info">
                      Page {currentPage} of {Math.ceil(patientList.length / itemsPerPage)}
                    </span>
                    <button
                      className="td-page-btn"
                      disabled={currentPage === Math.ceil(patientList.length / itemsPerPage)}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <PatientViewModal
        visible={!!selected}
        data={selected}
        onClose={() => setSelected(null)}
      />

      {/* ── Styles ──────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Background animations ── */
        .td-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        /* Soft gradient wash */
        .td-bg-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            #f0f6ff 0%,
            #f7fafd 40%,
            #f0faf5 70%,
            #fdf8f0 100%
          );
          animation: td-grad-shift 12s ease-in-out infinite alternate;
        }
        @keyframes td-grad-shift {
          0%   { opacity: 1; filter: hue-rotate(0deg); }
          50%  { opacity: 0.85; filter: hue-rotate(8deg); }
          100% { opacity: 1; filter: hue-rotate(0deg); }
        }

        /* Blurred orbs */
        .td-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0;
          animation: td-orb-float 0s ease-in-out infinite alternate;
        }
        .td-bg-orb-1 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(24,95,165,0.12) 0%, transparent 70%);
          top: -80px; left: -60px;
          opacity: 1;
          animation: td-orb-float 14s ease-in-out infinite alternate;
        }
        .td-bg-orb-2 {
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(29,158,117,0.10) 0%, transparent 70%);
          bottom: 5%; right: -40px;
          opacity: 1;
          animation: td-orb-float 18s ease-in-out infinite alternate-reverse;
        }
        .td-bg-orb-3 {
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(186,117,23,0.08) 0%, transparent 70%);
          top: 40%; left: 55%;
          opacity: 1;
          animation: td-orb-float 22s ease-in-out infinite alternate;
        }
        @keyframes td-orb-float {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(18px, -22px) scale(1.04); }
          66%  { transform: translate(-12px, 14px) scale(0.97); }
          100% { transform: translate(8px, -8px) scale(1.02); }
        }

        /* Dot grid */
        .td-bg-dots {
          position: absolute;
          inset: 0;
          width: 100%; height: 100%;
        }

        /* Floating particles */
        .td-particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0;
          animation: td-particle-rise 0s linear infinite;
        }
        .td-particle-1 {
          width: 5px; height: 5px;
          background: rgba(24,95,165,0.18);
          left: 12%; bottom: -10px;
          animation: td-particle-rise 16s linear 0s infinite;
        }
        .td-particle-2 {
          width: 4px; height: 4px;
          background: rgba(29,158,117,0.18);
          left: 28%; bottom: -10px;
          animation: td-particle-rise 20s linear 3s infinite;
        }
        .td-particle-3 {
          width: 6px; height: 6px;
          background: rgba(186,117,23,0.14);
          left: 48%; bottom: -10px;
          animation: td-particle-rise 14s linear 6s infinite;
        }
        .td-particle-4 {
          width: 4px; height: 4px;
          background: rgba(24,95,165,0.15);
          left: 65%; bottom: -10px;
          animation: td-particle-rise 18s linear 1s infinite;
        }
        .td-particle-5 {
          width: 5px; height: 5px;
          background: rgba(29,158,117,0.14);
          left: 80%; bottom: -10px;
          animation: td-particle-rise 22s linear 9s infinite;
        }
        .td-particle-6 {
          width: 3px; height: 3px;
          background: rgba(24,95,165,0.12);
          left: 92%; bottom: -10px;
          animation: td-particle-rise 17s linear 4s infinite;
        }
        @keyframes td-particle-rise {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          5%   { opacity: 1; }
          85%  { opacity: 0.6; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }

        /* Ensure page content sits above bg */
        .td-page {
          position: relative;
          z-index: 1;
          padding: 1.25rem;
        
          max-width: 960px;
          margin: 0 auto;
        }

        /* Header */
        .td-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          gap: 12px;
          flex-wrap: wrap;
        }
        .td-page-title {
         
          font-size: 22px;
          font-weight: 700;
          color: #0c447c;
          margin: 0 0 4px;
        }
        .td-page-sub {
          font-size: 13px;
          color: #888780;
          margin: 0;
        }
        @media (max-width: 576px) {
          
          .td-page-header {display: flex;   justify-content: end }
          
        }

        /* Main panel */
        .td-panel {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 0.5px solid #d0dce9;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }

        /* Tabs */
        .td-tabs {
          display: flex;
          gap: 4px;
          padding: 10px 10px 0;
          border-bottom: 0.5px solid #e6f1fb;
          background: rgba(247,250,253,0.85);
          flex-wrap: wrap;
        }
        .td-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 0.5px solid #d0dce9;
          border-bottom: none;
          border-radius: 9px 9px 0 0;
          font-size: 12.5px;
          font-weight: 500;
          color: #5f5e5a;
          background: #fff;
          cursor: pointer;
          transition: all 0.15s;
     
          white-space: nowrap;
          position: relative;
          bottom: -0.5px;
        }
        .td-tab:hover:not(.active) { background: #e6f1fb; color: #185fa5; }
        .td-tab.active {
          font-weight: 600;
          border-bottom-color: transparent;
          box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
          z-index: 1;
        }
        @media (max-width: 576px) {
          .td-tabs { gap: 6px; padding: 10px; }
          .td-tab { flex: 1; justify-content: center; padding: 10px 8px; font-size: 11px; border-radius: 8px; border-bottom: 0.5px solid #d0dce9; }
          .td-tab.active { border-bottom-color: transparent; }
        }

        /* Patient list */
        .td-patient-list { padding: 1.25rem; }
        .td-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .td-list-count {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #888780;
        }

        /* Patient card */
        .td-patient-card {
          display: flex;
          flex-direction: column;
          background: rgba(255,255,255,0.9);
          border: 0.5px solid #d0dce9;
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 10px;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.15s, border-color 0.15s;
          gap: 12px;
        }
        .td-patient-top {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .td-patient-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        @media (min-width: 768px) {
          .td-patient-card {
            flex-direction: row;
            align-items: center;
            gap: 20px;
          }
          .td-patient-top { flex: 1; min-width: 0; }
          .td-patient-bottom { flex-shrink: 0; gap: 20px; }
        }
        @media (max-width: 576px) {
          .td-patient-card { padding: 12px; }
          .td-patient-bottom { flex-direction: column; align-items: stretch; }
          .td-patient-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .td-btn { justify-content: center; }
          .td-patient-avatar { width: 42px; height: 42px; margin-left: 0; }
          .td-patient-name { font-size: 13.5px; }
          .td-patient-meta { gap: 8px; font-size: 11px; }
        }
        .td-patient-card:hover {
          border-color: #b5d4f4;
          box-shadow: 0 2px 12px rgba(24,95,165,0.08);
        }
        .td-patient-card:last-child { margin-bottom: 0; }
        .td-patient-accent {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
        }
        .td-patient-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #042C53, #185fa5);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
          margin-left: 6px;
        }
        .td-patient-info { flex: 1; min-width: 160px; }
        .td-patient-name {
         
          font-size: 14px;
          font-weight: 600;
          color: #0c447c;
          margin-bottom: 5px;
        }
        .td-patient-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 12px;
          color: #5f5e5a;
        }
        .td-patient-meta span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .td-patient-mid {
          display: flex;
          align-items: center;
        }
        .td-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: capitalize;
          padding: 4px 10px;
          border-radius: 20px;
          border: 0.5px solid;
          white-space: nowrap;
        }
        .td-status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .td-patient-actions {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
          position: relative;
        }
        @keyframes td-toast-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Buttons */
        .td-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 8px;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          border: 0.5px solid;
         
          white-space: nowrap;
        }
        .td-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .td-btn-primary {
          background: #185fa5;
          color: #fff;
          border-color: #185fa5;
          box-shadow: 0 1px 6px rgba(24,95,165,0.2);
        }
  

.td-btn-primary svg {
  color: inherit;
}
        .td-btn-primary:hover:not(:disabled) { background: #0c447c; border-color: #0c447c; }
        .td-btn-outline {
          background: #fff;
          color: #185fa5;
          border-color: #b5d4f4;
        }
        .td-btn-outline:hover:not(:disabled) { background: #e6f1fb; }

        /* Empty */
        .td-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3.5rem;
          text-align: center;
          color: #888780;
          font-size: 13px;
        }
        .td-empty p { margin: 0; }

        /* Pagination */
        .td-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 0.5px solid #d0dce9;
          margin-top: 16px;
        }
        .td-page-btn {
          padding: 6px 12px;
          border: 0.5px solid #d0dce9;
          background: #fff;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #185fa5;
          cursor: pointer;
          transition: all 0.2s;
        }
        .td-page-btn:hover:not(:disabled) {
          background: #e6f1fb;
          border-color: #b5d4f4;
        }
        .td-page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          color: #888780;
        }
        .td-page-info {
          font-size: 12px;
          color: #5f5e5a;
        }
      `}</style>
    </>
  )
}

export default TherapyDashboard