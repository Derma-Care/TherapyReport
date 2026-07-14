import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  CContainer,
  CHeader,
  CHeaderNav,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilStar } from '@coreui/icons'
import { useHospital } from '../Context/HospitalContext'
import { useNotifications } from '../Context/NotificationContext'
import AppHeaderDropdown from './AppHeaderDropdown'

const PRIMARY = '#1B4F8A'
const PRIMARY_DARK = '#143d6e'

// ── Notification type helpers ─────────────────────────────────────────────────
const TYPE_META = {
  feedback: { icon: '⭐', label: 'Feedback', color: '#f59e0b', bg: '#fffbeb' },
  appointment: { icon: '📅', label: 'Appointment', color: '#3b82f6', bg: '#eff6ff' },
  booking: { icon: '📋', label: 'Booking', color: '#10b981', bg: '#ecfdf5' },
  general: { icon: '🔔', label: 'General', color: '#6366f1', bg: '#eef2ff' },
}
const getMeta = (type) => TYPE_META[type] || TYPE_META.general

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const getTherapistContext = () => {
  const stored = JSON.parse(localStorage.getItem('therapistData') || '{}')
  return {
    clinicId: stored?.clinicId || stored?.data?.clinicId,
    branchId: stored?.branchId || stored?.data?.branchId,
    therapistId: stored?.therapistId || stored?.data?.therapistId,
  }
}

// ── Notification Panel Component ──────────────────────────────────────────────
const NotificationPanel = ({ onClose }) => {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAllRead, clearAll, clearOne, markOneRead } = useNotifications()

  const handleNotifClick = (notif) => {
    markOneRead(notif.id)

    const type = (notif.type || notif.data?.type || '').toLowerCase()
    const isFeedback = type === 'feedback' || type.includes('feedback')
    const isBooking = type === 'appointment' || type === 'booking' || type.includes('booking') || type === "reassignment" || type === "withdrawn"

    let route = ''
    if (isFeedback) {
      route = '/therapist-feedback'
    } else if (isBooking) {
      route = '/therapist'
    } else {
      const navigatePath = notif.data?.path || notif.data?.navigate_path || ''
      if (navigatePath) {
        route = navigatePath.startsWith('/') ? navigatePath : `/${navigatePath}`
      }
    }

    if (route) {
      navigate(route, { state: getTherapistContext() })
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
    onClose()
  }

  return (
    <div className="notif-panel">
      {/* Header */}
      <div className="notif-panel-header">
        <div className="notif-panel-title-row">
          <span className="notif-panel-title">Notifications</span>
          {unreadCount > 0 && (
            <span className="notif-unread-pill">{unreadCount} new</span>
          )}
        </div>
        <div className="notif-panel-actions">
          {unreadCount > 0 && (
            <button
              className="notif-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                markAllRead();
              }}
            >
              ✓ Read all
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className="notif-action-btn notif-action-danger"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                clearAll();
              }}
            >
              🗑 Clear all
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">🔔</div>
            <div className="notif-empty-text">All caught up!</div>
            <div className="notif-empty-sub">No notifications yet.</div>
          </div>
        ) : (
          notifications.map((notif) => {
            const meta = getMeta(notif.type)
            return (
              <div
                key={notif.id}
                className={`notif-item ${notif.read ? 'notif-item-read' : 'notif-item-unread'}`}
                onClick={() => handleNotifClick(notif)}
              >
                <div className="notif-item-icon" style={{ background: meta.bg, color: meta.color }}>
                  {meta.icon}
                </div>
                <div className="notif-item-content">
                  <div className="notif-item-title">{notif.title}</div>
                  <div className="notif-item-body">{notif.body}</div>
                  <div className="notif-item-meta">
                    <span className="notif-type-tag" style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className="notif-time">{timeAgo(notif.timestamp)}</span>
                  </div>
                </div>
                <button
                  className="notif-item-close"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearOne(notif.id);
                  }}
                  title="Remove"
                >
                  ×
                </button>
                {!notif.read && <span className="notif-unread-dot" />}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── AppHeader ─────────────────────────────────────────────────────────────────
const AppHeader = () => {
  const headerRef = useRef()
  const desktopPanelRef = useRef()
  const mobilePanelRef = useRef()
  const desktopBellBtnRef = useRef()
  const mobileBellBtnRef = useRef()
  const [scrolled, setScrolled] = useState(false)
  const [bellHover, setBellHover] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedHospital } = useHospital()
  const { unreadCount, markAllRead } = useNotifications()
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const isDashboard = location.pathname === '/therapist' || location.pathname === '/'

  const storedData = localStorage.getItem('therapistData')
  const storedClinic = localStorage.getItem('selectedClinic')
  const data = storedData ? JSON.parse(storedData) : {}
  const clinicData = storedClinic ? JSON.parse(storedClinic) : {}

  const therapistName = data?.therapistName
  const branch = data?.branchName
  const therapistId = data?.therapistId
  const clinicName = selectedHospital?.name || clinicData.name || 'Clinic Name'

  // Close panel on outside click
  useEffect(() => {
    if (!panelOpen) return;

    const handleOutsideClick = (e) => {
      if (
        desktopPanelRef.current?.contains(e.target) ||
        mobilePanelRef.current?.contains(e.target) ||
        desktopBellBtnRef.current?.contains(e.target) ||
        mobileBellBtnRef.current?.contains(e.target)
      ) {
        return;
      }

      setPanelOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [panelOpen]);
  // Close panel on route change
  useEffect(() => { setPanelOpen(false) }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => setScrolled(document.documentElement.scrollTop > 0)
    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  const togglePanel = useCallback(() => {
    setPanelOpen((prev) => !prev)
  }, [])

  const handleFeedbackClick = async () => {
    if (feedbackLoading) return
    try {
      setFeedbackLoading(true)
      const { clinicId, branchId, therapistId } = getTherapistContext()
      setTimeout(() => {
        navigate('/therapist-feedback', { state: { clinicId, branchId, therapistId } })
      }, 200)
    } catch (err) {
      console.error('Feedback Navigation Error:', err)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const BellButton = ({ style = {}, btnRef }) => (
    <button
      ref={btnRef}
      className={`bell-btn ${panelOpen ? 'bell-btn-active' : ''}`}
      style={{ position: 'relative', ...style }}
      onMouseEnter={() => setBellHover(true)}
      onMouseLeave={() => setBellHover(false)}
      onClick={togglePanel}
      title="Notifications"
      aria-label="Notifications"
    >
      <CIcon icon={cilBell} style={{ color: '#ffffff', width: 18, height: 18, transition: 'color .15s' }} />
      {unreadCount > 0 && (
        <span className="bell-count-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )

  const FeedbackButton = ({ style = {} }) => (
    <button
      className="bell-btn"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFeedbackClick() }}
      disabled={feedbackLoading}
      style={{ cursor: 'pointer', ...style }}
      title="Feedback"
    >
      {feedbackLoading
        ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        : <CIcon icon={cilStar} style={{ color: '#ffffff', width: 18, height: 18 }} />
      }
    </button>
  )

  return (
    <>
      <style>{`
        /* ── Base header ── */
        .app-header-shell {
          background: ${PRIMARY} !important;
          border-bottom: 1px solid ${PRIMARY_DARK} !important;
          transition: box-shadow .2s ease;
        }
        .app-header-shell.scrolled { box-shadow: 0 2px 20px rgba(0,0,0,0.25); }

        /* ── Logo / clinic ── */
        .clinic-name { font-weight:700;font-size:15px;color:#fff;line-height:1.2;letter-spacing:-.01em; }
        .clinic-name-btn { background:none;border:none;padding:0;cursor:pointer;text-align:left;display:flex;flex-direction:column;transition:opacity .15s; }
        .clinic-name-btn:hover { opacity:.82; }
        .clinic-branch { font-size:12px;color:rgba(255,255,255,.65);margin-top:2px;display:flex;align-items:center;gap:4px; }
        .branch-dot { width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.45);flex-shrink:0; }
        .divider-v { width:1px;height:32px;background:rgba(255,255,255,.2);margin:0 18px;flex-shrink:0; }
        .welcome-text { font-size:12px;color:rgba(255,255,255,.6);font-weight:500;text-transform:uppercase;letter-spacing:.06em;line-height:1; }
        .therapist-name { font-size:14px;font-weight:700;color:#fff;margin-top:3px;line-height:1; }
        .therapist-id { font-size:11px;color:rgba(255,255,255,.55);margin-top:3px;letter-spacing:.03em; }

        /* ── Bell button ── */
        .bell-btn {
          width:38px;height:38px;border-radius:10px;
          border:1.5px solid rgba(255,255,255,.60);
          background:rgba(255,255,255,.22);
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:all .15s;position:relative;outline:none;
        }
        .bell-btn:hover { background:rgba(255,255,255,.30);border-color:rgba(255,255,255,.8); }
        .bell-btn-active { background:rgba(255,255,255,.35) !important;border-color:#fff !important; }

        /* ── Notification count badge ── */
        .bell-count-badge {
          position:absolute;top:-6px;right:-6px;
          min-width:18px;height:18px;padding:0 4px;
          border-radius:9px;
          background:linear-gradient(135deg,#ef4444,#dc2626);
          border:2px solid ${PRIMARY};
          color:#fff;font-size:10px;font-weight:700;
          display:flex;align-items:center;justify-content:center;
          line-height:1;
          animation:badge-pop .3s cubic-bezier(.34,1.56,.64,1);
          box-shadow:0 2px 6px rgba(239,68,68,.5);
        }
        @keyframes badge-pop {
          from { transform:scale(0) rotate(-20deg); }
          to   { transform:scale(1) rotate(0deg); }
        }

        /* ── Back button ── */
        .back-btn {
          width:38px;height:38px;border-radius:10px;
          border:1.5px solid rgba(255,255,255,.60);
          background:rgba(255,255,255,.22);
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:all .15s;margin-right:14px;
          color:white;outline:none;
        }
        .back-btn:hover { background:rgba(255,255,255,.30);border-color:#fff; }

        /* ═══════════════════════════════════════════════════════
           NOTIFICATION PANEL
        ═══════════════════════════════════════════════════════ */
        .notif-panel-wrapper {
          position:absolute;top:calc(100% + 10px);right:0;
          z-index:9999;
          animation:notif-slide-in .22s cubic-bezier(.22,1,.36,1);
        }
        @keyframes notif-slide-in {
          from { opacity:0;transform:translateY(-10px) scale(.97); }
          to   { opacity:1;transform:translateY(0) scale(1); }
        }

        .notif-panel {
          width:360px;max-height:520px;
          background:#ffffff;
          border-radius:16px;
          box-shadow:0 20px 60px rgba(0,0,0,.18),0 4px 20px rgba(0,0,0,.08);
          border:1px solid rgba(0,0,0,.06);
          overflow:hidden;
          display:flex;flex-direction:column;
        }

        /* Panel header */
        .notif-panel-header {
          padding:16px 18px 12px;
          border-bottom:1px solid #f1f5f9;
          background:linear-gradient(135deg,#f8faff 0%,#f0f6ff 100%);
          flex-shrink:0;
        }
        .notif-panel-title-row {
          display:flex;align-items:center;gap:10px;margin-bottom:10px;
        }
        .notif-panel-title { font-size:15px;font-weight:700;color:#0f172a; }
        .notif-unread-pill {
          background:linear-gradient(135deg,#3b82f6,#1d4ed8);
          color:#fff;font-size:11px;font-weight:600;
          padding:2px 8px;border-radius:20px;
        }
        .notif-panel-actions { display:flex;gap:8px;flex-wrap:wrap; }
        .notif-action-btn {
          font-size:12px;font-weight:500;padding:5px 12px;
          border-radius:8px;border:1.5px solid #e2e8f0;
          background:#fff;color:#475569;cursor:pointer;
          transition:all .15s;
        }
        .notif-action-btn:hover { background:#f1f5f9;border-color:#cbd5e1;color:#1e293b; }
        .notif-action-danger { color:#dc2626;border-color:#fecaca; }
        .notif-action-danger:hover { background:#fef2f2;border-color:#fca5a5;color:#b91c1c; }

        /* List */
        .notif-list {
          flex:1;overflow-y:auto;
          scrollbar-width:thin;scrollbar-color:#e2e8f0 transparent;
        }
        .notif-list::-webkit-scrollbar { width:4px; }
        .notif-list::-webkit-scrollbar-track { background:transparent; }
        .notif-list::-webkit-scrollbar-thumb { background:#e2e8f0;border-radius:2px; }

        /* Empty state */
        .notif-empty {
          padding:48px 20px;text-align:center;
        }
        .notif-empty-icon { font-size:40px;margin-bottom:10px;opacity:.5; }
        .notif-empty-text { font-size:15px;font-weight:600;color:#64748b;margin-bottom:4px; }
        .notif-empty-sub { font-size:13px;color:#94a3b8; }

        /* Notification item */
        .notif-item {
          display:flex;align-items:flex-start;gap:12px;
          padding:14px 16px;cursor:pointer;position:relative;
          border-bottom:1px solid #f8fafc;
          transition:background .15s;
        }
        .notif-item:last-child { border-bottom:none; }
        .notif-item:hover { background:#f8fafc; }
        .notif-item-unread { background:#fafcff; }
        .notif-item-read   { background:#ffffff; }

        .notif-item-icon {
          width:38px;height:38px;border-radius:10px;
          display:flex;align-items:center;justify-content:center;
          font-size:16px;flex-shrink:0;
          border:1px solid currentColor;
          opacity:.85;
        }

        .notif-item-content { flex:1;min-width:0; }
        .notif-item-title {
          font-size:13px;font-weight:600;color:#0f172a;
          margin-bottom:3px;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        }
        .notif-item-body {
          font-size:12px;color:#475569;line-height:1.5;
          display:-webkit-box;-webkit-line-clamp:5;
          -webkit-box-orient:vertical;overflow:hidden;
          margin-bottom:6px;
          white-space: pre-line;
        }
        .notif-item-meta { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
        .notif-type-tag {
          font-size:10px;font-weight:600;padding:2px 7px;
          border-radius:6px;letter-spacing:.3px;
        }
        .notif-time { font-size:11px;color:#94a3b8; }

        .notif-item-close {
          width:20px;height:20px;border-radius:50%;
          border:none;background:transparent;
          color:#94a3b8;cursor:pointer;font-size:16px;
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;transition:all .15s;line-height:1;
          padding:0;
        }
        .notif-item-close:hover { background:#fee2e2;color:#dc2626; }

        .notif-unread-dot {
          position:absolute;top:16px;left:6px;
          width:5px;height:5px;border-radius:50%;
          background:#3b82f6;
        }

        /* ── Mobile ── */
        @media (max-width:767px) {
          .clinic-name { font-size:13px; }
          .clinic-branch { font-size:11px; }
          .notif-panel-wrapper { 
            position: fixed; 
            top: 60px; 
            right: 10px; 
            left: 10px; 
            width: auto; 
            z-index: 9999;
          }
          .notif-panel { 
            width: 100%; 
            max-width: none; 
          }
        }
      `}</style>

      <CHeader
        position="sticky"
        className={`mb-3 p-0 app-header-shell${scrolled ? ' scrolled' : ''}`}
        ref={headerRef}
      >
        <CContainer fluid className="py-0" style={{ minHeight: 64, display: 'flex', alignItems: 'center' }}>

          {/* ── DESKTOP ── */}
          <div className="d-none d-md-flex align-items-center w-100" style={{ gap: 0 }}>

            {!isDashboard && (
              <button className="back-btn" onClick={() => navigate(-1)} title="Back">
                <ArrowLeft size={18} />
              </button>
            )}

            {/* Clinic Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="clinic-name-btn" onClick={() => navigate('/therapist')} title="Go to Home">
                <div className="clinic-name">{clinicName}</div>
                {branch && (
                  <div className="clinic-branch">
                    <span className="branch-dot" />
                    {branch}
                  </div>
                )}
              </button>
            </div>

            <div style={{ flex: 1 }} />

            {/* Therapist Info */}
            <div style={{ textAlign: 'right', marginRight: 4 }}>
              <div className="welcome-text">Welcome back</div>
              <div className="therapist-name">
                {therapistName
                  ? therapistName.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
                  : '—'}
              </div>
              {therapistId && <div className="therapist-id">ID: {therapistId}</div>}
            </div>

            <div className="divider-v" />

            {/* Bell + Notification Panel */}
            <div style={{ position: 'relative', marginRight: 10 }}>
              <BellButton btnRef={desktopBellBtnRef} />
              {panelOpen && (
                <div className="notif-panel-wrapper" ref={desktopPanelRef}>
                  <NotificationPanel onClose={() => setPanelOpen(false)} />
                </div>
              )}
            </div>

            {/* Feedback Star */}
            <FeedbackButton style={{ marginRight: 8 }} />

            {/* Avatar dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              <button className="clinic-name-btn" onClick={() => navigate('/therapist')} style={{ minWidth: 0 }}>
                <div className="clinic-name" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {clinicName}
                </div>
                {branch && (
                  <div className="clinic-branch">
                    <span className="branch-dot" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{branch}</span>
                  </div>
                )}
              </button>
            </div>

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {/* Bell + panel */}
              <div style={{ position: 'relative' }}>
                <BellButton style={{ width: 34, height: 34 }} btnRef={mobileBellBtnRef} />
                {panelOpen && (
                  <div className="notif-panel-wrapper" ref={mobilePanelRef}>
                    <NotificationPanel onClose={() => setPanelOpen(false)} />
                  </div>
                )}
              </div>

              <FeedbackButton style={{ width: 34, height: 34 }} />

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