/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import {
  CSpinner,
  CCollapse,
  CButton,
} from '@coreui/react'
import { getStats } from './therapistService'
import { useLocation, useNavigate } from 'react-router-dom'
import { getBookingByBookingId, getClinicData, getDashboard, getSessionDetails } from './TheraphyApi'
import PatientViewModal from './PatientViewModal'
import capitalizeWords from '../../Utils/capitalizeWords'
import LoadingIndicator from '../../Utils/loader'
import {
  User, Phone, Stethoscope, Activity,
  CheckCircle2, Clock, CalendarDays, ArrowRight,
  ClipboardList, Users, Zap,
} from 'lucide-react'
import { COLORS } from '../../Constant/Themes'

// ─── Status config ────────────────────────────────────────
const STATUS_CONFIG = {
  completed: { bg: '#E1F5EE', color: '#085041', border: '#9FE1CB', dot: '#1D9E75' },
  active:    { bg: '#FAEEDA', color: '#633806', border: '#FAC775', dot: '#BA7517' },
  default:   { bg: '#f1efe8', color: '#5f5e5a', border: '#d3d1c7', dot: '#888780' },
}
const getStatus = (s) => STATUS_CONFIG[s?.toLowerCase()] || STATUS_CONFIG.default

// ─── Patient Card ─────────────────────────────────────────
const PatientRow = ({ p, index, clinicId, branchId, onViewDetails, navigate }) => {
  const [detailLoading, setDetailLoading] = useState(false)

  const bookingId        = p.bookingId
  const patientId        = p.patientId
  const therapistRecordId = p.therapistRecordId
  const status           = getStatus(p.overallStatus)

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
            <span><Stethoscope size={11} /> {p.doctorName || 'N/A'}</span>
            <span><Activity size={11} /> {p.serivceType || 'N/A'}</span>
            <span><Phone size={11} /> {p.mobileNumber || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="td-patient-bottom">
        {/* Status badge */}
        <div className="td-patient-mid">
          <span
            className="td-status-badge"
            style={{ background: status.bg, color: status.color, borderColor: status.border }}
          >
            <span className="td-status-dot" style={{ background: status.dot }} />
            {p.overallStatus || 'Pending'}
          </span>
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
            onClick={() => navigate('/session-list', {
              state: {
                name: p.patientName,
                therapy: p.programName,
                doctorName: p.doctorName,
                therapistRecordId: p.therapistRecordId,
                patientId: p.patientId,
                bookingId: p.bookingId,
              },
            })}
          >
            Sessions <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────
const TherapyDashboard = () => {
  const [tab, setTab]               = useState(1)
  const [therapyData, setTherapyData] = useState([])
  const [loading, setLoading]       = useState(true)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [patientList, setPatientList] = useState([])
  const [dashboard, setDashboard]   = useState(null)
  const [selected, setSelected]     = useState(null)

  const location  = useLocation()
  const navigate  = useNavigate()

  const storedData   = localStorage.getItem('therapistData')
  const routeData    = location.state || (storedData ? JSON.parse(storedData) : {})
  const clinicId     = routeData?.clinicId
  const branchId     = routeData?.branchId
  const therapistId  = routeData?.therapistId

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
    if (clinicId && branchId && therapistId) fetchDashboardData(tab)
  }, [tab])

  const stats = getStats(dashboard)

  const TABS = [
    { id: 1, label: 'New Sessions',       icon: Zap,           accent: '#185fa5' },
    { id: 2, label: 'Active Sessions',    icon: Activity,      accent: '#BA7517' },
    { id: 3, label: 'Completed Sessions', icon: CheckCircle2,  accent: '#1D9E75' },
  ]

  const STATS = [
    { label: "Today's Appointments", value: stats?.todayCount || 0,  sub: `${stats?.todayTime || 0} min`,  icon: CalendarDays, accent: '#185fa5', bg: '#e6f1fb', border: '#b5d4f4' },
    { label: 'Weekly Appointments',  value: stats?.weekCount  || 0,  sub: `${stats?.weekTime  || 0} min`,  icon: Clock,        accent: '#BA7517', bg: '#FAEEDA',  border: '#FAC775' },
    { label: 'Monthly Appointments', value: stats?.monthCount || 0,  sub: `${stats?.monthTime || 0} min`,  icon: Users,        accent: '#1D9E75', bg: '#E1F5EE',  border: '#9FE1CB' },
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
            <h1 className="td-page-title">Therapy Dashboard</h1>
            <p className="td-page-sub">Manage your patient sessions and appointments</p>
          </div>

          <CButton 
            style={{ backgroundColor: COLORS.primary, color: "white", display: "flex", alignItems: "center", gap: 8 }} 
            onClick={() => navigate('/therapist/attendance', { state: { clinicId, branchId, therapistId } })}
          >
            <Clock size={16} /> Duty Logs
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
                <Icon size={13} />
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
                {patientList.map((p, index) => (
                  <PatientRow
                    key={p.patientId || index}
                    p={p}
                    index={index}
                    clinicId={clinicId}
                    branchId={branchId}
                    onViewDetails={setSelected}
                    navigate={navigate}
                  />
                ))}
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
          font-family: 'DM Sans', sans-serif;
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
          font-family: 'Syne', sans-serif;
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
          .td-page { padding: 0.75rem; }
          .td-page-header { flex-direction: column; align-items: stretch; }
          .td-page-header .btn { width: 100%; }
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
          font-family: 'DM Sans', sans-serif;
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
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
          margin-left: 6px;
        }
        .td-patient-info { flex: 1; min-width: 160px; }
        .td-patient-name {
          font-family: 'Syne', sans-serif;
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
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .td-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .td-btn-primary {
          background: #185fa5;
          color: #fff;
          border-color: #185fa5;
          box-shadow: 0 1px 6px rgba(24,95,165,0.2);
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
      `}</style>
    </>
  )
}

export default TherapyDashboard