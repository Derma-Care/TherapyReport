import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  CContainer,
  CHeader,
  CHeaderNav,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell } from '@coreui/icons'
import { useHospital } from '../Context/HospitalContext'
import AppHeaderDropdown from './AppHeaderDropdown'

const PRIMARY = '#1B4F8A'
const PRIMARY_DARK = '#143d6e'

const AppHeader = () => {
  const headerRef = useRef()
  const [scrolled, setScrolled] = useState(false)
  const [bellHover, setBellHover] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedHospital } = useHospital()

  // Hide back button on dashboard
  const isDashboard = location.pathname === '/therapist' || location.pathname === '/'

  const storedData = localStorage.getItem('therapistData')
  const storedClinic = localStorage.getItem('selectedClinic')
  const data = storedData ? JSON.parse(storedData) : {}
  const clinicData = storedClinic ? JSON.parse(storedClinic) : {}

  const therapistName = data?.therapistName
  const branch = data?.branchName
  const therapistId = data?.therapistId

  const clinicName = selectedHospital?.name || clinicData.name || 'Clinic Name'
  const ClinicLogo = selectedHospital?.hospitalLogo || clinicData.hospitalLogo

  const initials = therapistName
    ? therapistName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'DR'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(document.documentElement.scrollTop > 0)
    }
    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <style>{`
        .app-header-shell {
          background: ${PRIMARY} !important;
          border-bottom: 1px solid ${PRIMARY_DARK} !important;
          transition: box-shadow .2s ease;
        }
        .app-header-shell.scrolled {
          box-shadow: 0 2px 20px rgba(0,0,0,0.25);
        }
        .clinic-logo-wrap {
          width: 48px; height: 48px;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.60);
          background: rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; flex-shrink: 0;
          padding: 3px;
        }
        .clinic-logo-wrap img { width: 100%; height: 100%; object-fit: contain; }
        .clinic-logo-fallback {
          width: 48px; height: 48px; border-radius: 10px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.60);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .clinic-name {
          font-weight: 700; font-size: 15px; color: #ffffff;
          line-height: 1.2; letter-spacing: -0.01em;
        }
        .clinic-branch {
          font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 2px;
          display: flex; align-items: center; gap: 4px;
        }
        .branch-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(255,255,255,0.45); flex-shrink: 0;
        }
        .divider-v {
          width: 1px; height: 32px; background: rgba(255,255,255,0.2);
          margin: 0 18px; flex-shrink: 0;
        }
        .welcome-text {
          font-size: 12px; color: rgba(255,255,255,0.6); font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.06em; line-height: 1;
        }
        .therapist-name {
          font-size: 14px; font-weight: 700; color: #ffffff;
          margin-top: 3px; line-height: 1;
        }
        .therapist-id {
          font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 3px;
       letter-spacing: 0.03em;
        }
        .bell-btn {
          width: 38px; height: 38px; border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.60);
          background: rgba(255,255,255,0.22);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all .15s; position: relative;
          outline: none;
        }
        .bell-btn:hover {
          background: rgba(255,255,255,0.20);
          border-color: rgba(255,255,255,0.45);
        }
        .bell-badge {
          position: absolute; top: 6px; right: 6px;
          width: 7px; height: 7px; border-radius: 50%;
          background: #fbbf24; border: 1.5px solid ${PRIMARY};
        }
        .avatar-ring {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff;
          border: 1.5px solid rgba(255,255,255,0.35); flex-shrink: 0;
        }
        .back-btn {
          width: 38px; height: 38px; border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.60);
          background: rgba(255,255,255,0.22);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all .15s; margin-right: 14px;
          color: white; outline: none;
        }
        .back-btn:hover {
          background: rgba(255,255,255,0.30);
          border-color: #ffffff;
        }
        /* mobile */
        @media (max-width: 767px) {
          .clinic-name { font-size: 13px; }
          .clinic-branch { font-size: 11px; }
        }
      `}</style>

      <CHeader
        position="sticky"
        className={`mb-3 p-0 app-header-shell${scrolled ? ' scrolled' : ''}`}
        ref={headerRef}
      >
        <CContainer fluid className=" py-0" style={{ minHeight: 64, display: 'flex', alignItems: 'center' }}>

          {/* ── DESKTOP ── */}
          <div className="d-none d-md-flex align-items-center w-100" style={{ gap: 0 }}>

            {!isDashboard && (
              <button className="back-btn" onClick={() => navigate(-1)} title="Back">
                <ArrowLeft size={18} />
              </button>
            )}

            {/* Logo + Clinic Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* {ClinicLogo ? (
                <div className="clinic-logo-wrap">
                  <img src={`data:image/png;base64,${ClinicLogo}`} alt="Clinic Logo" />
                </div>
              ) : (
                <div className="clinic-logo-fallback">🏥</div>
              )} */}
              <div>
                <div className="clinic-name">{clinicName}</div>
                {branch && (
                  <div className="clinic-branch">
                    <span className="branch-dot" />
                    {branch}
                  </div>
                )}
              </div>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Therapist Info */}
            <div style={{ textAlign: 'right', marginRight: 4 }}>
              <div className="welcome-text">Welcome back</div>
              <div className="therapist-name">{therapistName || '—'}</div>
              {therapistId && <div className="therapist-id">ID: {therapistId}</div>}
            </div>

            <div className="divider-v" />

            {/* Bell */}
            <button
              className="bell-btn"
              style={{ marginRight: 10 }}
              onMouseEnter={() => setBellHover(true)}
              onMouseLeave={() => setBellHover(false)}
            >
              <CIcon icon={cilBell} style={{ color: "#ffffff", width: 18, height: 18, transition: 'color .15s' }} />
              <span className="bell-badge" />
            </button>

            {/* Avatar + Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="avatar-ring">{initials}</div>
              <CHeaderNav>
                <AppHeaderDropdown />
              </CHeaderNav>
            </div>
          </div>

          {/* ── MOBILE ── */}
          <div className="d-flex d-md-none align-items-center justify-content-between w-100">

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              {!isDashboard && (
                <button className="back-btn" style={{ width: 34, height: 34, marginRight: 8 }} onClick={() => navigate(-1)}>
                  <ArrowLeft size={16} />
                </button>
              )}
              <div style={{ minWidth: 0 }}>
                <div className="clinic-name" style={{
                  display: '-webkit-box', WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {clinicName}
                </div>
                {branch && (
                  <div className="clinic-branch">
                    <span className="branch-dot" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{branch}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right — bell + dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button className="bell-btn" style={{ width: 34, height: 34 }}>
                <CIcon icon={cilBell} style={{ color: '#ffffff', width: 18, height: 18 }} />
                <span className="bell-badge" />
              </button>
              <div className="avatar-ring" style={{ width: 34, height: 34, fontSize: 12 }}>{initials}</div>
              <CHeaderNav>
                <AppHeaderDropdown />
              </CHeaderNav>
            </div>
          </div>

        </CContainer>
      </CHeader>
    </>
  )
}

export default AppHeader