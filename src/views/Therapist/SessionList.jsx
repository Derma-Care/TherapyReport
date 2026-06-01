import React, { useState, useEffect, useRef } from "react"
import {
  CModal, CModalHeader, CModalTitle, CModalBody,
} from "@coreui/react"
import { useLocation, useNavigate } from "react-router-dom"
import SessionFormModal from "./SessionFormModal"
import { getSessionDetails, getPaidSessions } from "./TheraphyApi"
import SessionViewModal from "./SessionViewModal"
import LoadingIndicator from "../../Utils/loader"
import ConsentFormModal from "./ConsentFormModal"
import MediaCaptureModal from "./MediaCaptureModal"
import { BASE_URL } from "../../API/BaseUrl"
import { uploadFile } from "../../Utils/S3UploadService"
import {
  User, Calendar, ClipboardList, X, ChevronDown, Eye,
  Play, Mic, Activity, Clock, CheckCircle, Zap, Camera
} from "lucide-react"
import { COLORS } from "../../Constant/Themes"

/* ─── THEME ─────────────────────────────────────────────────────────────── */
const T = {
  navy: "#1B4F8A",
  navyDark: "#163f6e",
  navyLight: "#e8f0fa",
  navyMid: "#2563a8",
  accent: "#0ea5e9",
  accentBg: "#e0f2fe",
  success: "#16a34a",
  successBg: "#dcfce7",
  warning: "#d97706",
  warningBg: "#fef9c3",
  danger: "#dc2626",
  dangerBg: "#fee2e2",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  white: "#ffffff",
  bg: "#f0f4f8",
  cardBg: "#ffffff",
}

const S = {
  /* Page */
  page: (isMobile) => ({ minHeight: "100vh", padding: isMobile ? "0.75rem" : "1.5rem", }),

  /* Patient card header */
  patientCard: {
    background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
    borderRadius: 14, padding: "1.5rem 1.75rem", marginBottom: "1.5rem",
    boxShadow: `0 4px 20px rgba(27,79,138,0.25)`,
    display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
  },
  patientName: { color: T.white, fontSize: "1.35rem", fontWeight: 700, margin: 0 },
  patientSub: { color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", marginTop: 4 },
  serviceTag: { background: "rgba(255,255,255,0.18)", color: T.white, borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.8rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(4px)" },

  /* Stats row */
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.85rem", marginBottom: "1.5rem" },
  statCard: { background: T.white, borderRadius: 10, padding: "0.9rem 1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderLeft: `3px solid ${T.navy}` },
  statVal: { fontSize: "1.4rem", fontWeight: 700, color: T.navy, lineHeight: 1 },
  statLbl: { fontSize: "0.72rem", color: T.muted, marginTop: 4, fontWeight: 500 },

  /* Main card */
  mainCard: { background: T.white, borderRadius: 14, boxShadow: "0 2px 12px rgba(27,79,138,0.09)", overflow: "hidden" },

  /* Exercise accordion */
  exHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0.9rem 1.25rem", cursor: "pointer", userSelect: "none",
    borderBottom: `1px solid ${T.border}`, transition: "background 0.15s",
    background: T.white,
  },
  exHeaderOpen: { background: T.navyLight },
  exTitle: { fontWeight: 600, color: T.navy, fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "0.5rem" },
  exMeta: { fontSize: "0.75rem", color: T.muted, display: "flex", gap: "0.75rem" },
  metaPill: {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "0.22rem 0.65rem", borderRadius: 6, fontSize: "0.71rem", fontWeight: 600,
    whiteSpace: "nowrap"
  },
  metaPillBlue: { background: "#eef6ff", color: "#1b4f8a", border: "0.5px solid #d0e4f8" },
  metaPillAmber: { background: "#fff9eb", color: "#854f0b", border: "0.5px solid #ffe9b5" },
  metaPillGreen: { background: "#f0faf5", color: "#0d6e4a", border: "0.5px solid #c2edda" },
  metaPillPurple: { background: "#f8f7ff", color: "#5a4fcf", border: "0.5px solid #e0deff" },

  /* Therapy / Program section label */
  sectionLabel: {
    background: T.navyLight, color: T.navy, fontWeight: 700, fontSize: "0.78rem",
    padding: "0.45rem 1.25rem", letterSpacing: "0.05em", textTransform: "uppercase",
    borderBottom: `1px solid ${T.border}`,
  },

  /* Session table */
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" },
  th: { background: T.navy, color: T.white, padding: "0.6rem 1rem", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.03em", textAlign: "left", whiteSpace: "nowrap" },
  td: { padding: "0.7rem 1rem", borderBottom: `1px solid ${T.border}`, verticalAlign: "middle", color: T.text },

  /* Status badges */
  badge: (type) => {
    const map = {
      completed: { bg: T.successBg, color: T.success, border: "#bbf7d0" },
      pending: { bg: T.warningBg, color: T.warning, border: "#fde68a" },
      today: { bg: T.danger, color: T.white, border: T.danger, padding: "2px 6px", fontSize: "0.55rem" },
      paid: { bg: T.accentBg, color: "#0369a1", border: "#bae6fd" },
    }
    const c = map[type] || map.pending
    return { background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 20, padding: c.padding || "0.2rem 0.65rem", fontSize: c.fontSize || "0.71rem", fontWeight: 800, display: "inline-block", whiteSpace: "nowrap", textTransform: "uppercase" }
  },

  /* Buttons */
  btn: (variant = "primary", size = "sm") => {
    const base = { borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, transition: "all 0.15s", whiteSpace: "nowrap" }
    const pad = size === "sm" ? { padding: "0.3rem 0.75rem", fontSize: "0.75rem" } : { padding: "0.5rem 1.1rem", fontSize: "0.82rem" }
    const map = {
      primary: { background: T.navy, color: T.white },
      success: { background: T.success, color: T.white },
      danger: { background: T.danger, color: T.white },
      warning: { background: T.warning, color: T.white },
      outline: { background: "transparent", color: T.navy, border: `1.5px solid ${T.navy}` },
      ghost: { background: T.navyLight, color: T.navy },
      info: { background: T.accentBg, color: "#0369a1", border: "1px solid #bae6fd" },
      secondary: { background: "#f1f5f9", color: T.muted, border: "1px solid #e2e8f0" },
    }
    return { ...base, ...pad, ...(map[variant] || map.primary) }
  },

  /* Tracker box */
  trackerBox: { background: "#fff5f5", border: `1.5px solid ${T.danger}`, borderRadius: 10, padding: "0.75rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 140, boxShadow: "0 2px 8px rgba(220,38,38,0.1)" },
  trackerTime: { color: T.danger, fontSize: "1.3rem", fontWeight: 700, lineHeight: 1 },
  trackerHint: { fontSize: "0.65rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.02em" },

  /* Mobile card */
  mobileCard: {
    background: T.white, borderRadius: 12, padding: "1rem", marginBottom: "0.75rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: `1px solid ${T.border}`,
    display: "flex", flexDirection: "column", gap: "0.75rem"
  },
}


/* ─── HELPERS ────────────────────────────────────────────────────────────── */

/**
 * Removes any stale Bootstrap modal backdrops and the modal-open class from
 * <body>. This prevents leftover overlays from blocking UI interaction after
 * sequentially opened modals (consent → media capture → voice record) close.
 */
const cleanupModalArtifacts = () => {
  // IMPORTANT: Do NOT call removeChild / remove() on .modal-backdrop elements.
  // CoreUI owns these through React's lifecycle and will call removeChild() itself
  // during its Transition exit phase. Removing them manually causes a race that
  // throws: "NotFoundError: Failed to execute 'removeChild' on 'Node'".
  //
  // Strategy: hide any stale backdrops with display:none (stops them blocking UI)
  // and clean up the body class that prevents scrolling/interaction.
  // CoreUI can still removeChild() the element safely on its own schedule.
  setTimeout(() => {
    document.querySelectorAll('.modal-backdrop').forEach(el => {
      el.style.display = 'none'
    })
    document.body.classList.remove('modal-open')
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }, 600)
}

const cleanHierarchy = (node) => {
  if (!node) return null
  return node
}

const deepUpdateSession = (node, upd) => {
  if (!node) return node
  let n = { ...node }
  if (n.sessions) n.sessions = n.sessions.map(s => s.sessionId === upd.sessionId ? { ...s, ...upd } : s)
    ;["therapyWithSessions", "programs", "therapyData", "exercises"].forEach(k => {
      if (n[k]) n[k] = n[k].map(c => deepUpdateSession(c, upd))
    })
  return n
}

const extractExercises = (node) => {
  let list = []
  if (!node) return list
  if (Array.isArray(node.sessions) && (node.exerciseId !== undefined || node.exerciseName)) list.push(node)
    ;["therapyWithSessions", "programs", "therapyData", "exercises"].forEach(k => {
      if (node[k]) node[k].forEach(c => list = list.concat(extractExercises(c)))
    })
  return list
}

const getExerciseKey = (exercise) => exercise.exerciseId || exercise.sessions?.[0]?.sessionId || exercise.exerciseName

const isDateToday = (dateStr) => {
  if (!dateStr) return false
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, "0")
  const mm = String(today.getMonth() + 1).padStart(2, "0")
  const yyyy = today.getFullYear()
  if (dateStr === `${dd}/${mm}/${yyyy}` || dateStr === `${yyyy}-${mm}-${dd}`) return true
  const d = new Date(dateStr)
  return !isNaN(d) && d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
}

const fmt12 = d => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
const fmt24 = d => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })

/* ─── ELAPSED TIME ───────────────────────────────────────────────────────── */
const ElapsedTime = ({ startTimeObj }) => {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!startTimeObj) return
    setElapsed(Math.floor((new Date() - startTimeObj) / 1000))
    const iv = setInterval(() => setElapsed(Math.floor((new Date() - startTimeObj) / 1000)), 1000)
    return () => clearInterval(iv)
  }, [startTimeObj])
  const m = Math.floor(elapsed / 60).toString().padStart(2, "0")
  const s = (elapsed % 60).toString().padStart(2, "0")
  return <span style={S.trackerTime}>{m}:{s}</span>
}

/* ─── VOICE RECORD MODAL ─────────────────────────────────────────────────── */
const VoiceRecordModal = ({ visible, onClose, onSave }) => {
  const [status, setStatus] = useState("IDLE")
  const [timer, setTimer] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  const recRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => {
    let iv
    if (status === "RECORDING") iv = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(iv)
  }, [status])

  useEffect(() => { if (visible) { setStatus("IDLE"); setTimer(0); setAudioUrl(null); chunksRef.current = [] } }, [visible])

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      recRef.current = rec; chunksRef.current = []
      rec.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data)
      rec.onstop = () => setAudioUrl(URL.createObjectURL(new Blob(chunksRef.current, { type: "audio/webm" })))
      rec.start(); setStatus("RECORDING")
    } catch { alert("Microphone access denied.") }
  }

  const stop = () => {
    if (recRef.current?.state !== "inactive") {
      recRef.current.stop()
      recRef.current.stream.getTracks().forEach(t => t.stop())
    }
    setStatus("PREVIEW")
  }

  const send = async () => {
    if (!chunksRef.current.length) {
      onClose()
      return
    }
    setStatus("STOPPED")
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/mp3" })
      const file = new File([blob], "voiceRecord.mp3", { type: "audio/mp3" })
      const fileKey = await uploadFile("voiceRecord", file)
      onSave(fileKey)
      onClose()
    } catch (e) {
      console.error("Audio upload failed", e)
      setStatus("PREVIEW")
      alert("Failed to save audio recording.")
    }
  }

  const timeStr = new Date(timer * 1000).toISOString().substr(14, 5)

  return (
    <CModal visible={visible} onClose={() => (status !== "RECORDING" && status !== "PAUSED") && onClose()} alignment="center" size="sm" backdrop="static">
      <CModalHeader style={{ background: T.navy, color: T.white }}>
        <CModalTitle style={{ color: T.white, fontWeight: 700 }}>🎤 Voice Record</CModalTitle>
      </CModalHeader>
      <CModalBody className="text-center py-4">
        {status !== "PREVIEW" && status !== "STOPPED" && (
          <div style={{ fontSize: "2.5rem", color: T.navy, fontWeight: 700, marginBottom: "1rem" }}>{timeStr}</div>
        )}
        {status === "IDLE" && <button style={S.btn("danger", "md")} onClick={start}>▶ Start Recording</button>}
        {(status === "RECORDING" || status === "PAUSED") && (
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {status === "RECORDING"
              ? <button style={S.btn("warning")} onClick={() => { recRef.current?.pause(); setStatus("PAUSED") }}>⏸ Pause</button>
              : <button style={S.btn("danger")} onClick={() => { recRef.current?.resume(); setStatus("RECORDING") }}>▶ Resume</button>}
            <button style={S.btn("secondary")} onClick={stop}>⏹ Stop</button>
          </div>
        )}
        {status === "PREVIEW" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <audio controls src={audioUrl} style={{ width: "100%" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btn("secondary")} onClick={() => { setStatus("IDLE"); setTimer(0) }}>Redo</button>
              <button style={S.btn("success")} onClick={send}>Send Recording</button>
            </div>
          </div>
        )}
        {status === "STOPPED" && <div style={{ color: T.success, fontWeight: 600 }}>✅ Recording saved!</div>}
      </CModalBody>
    </CModal>
  )
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
const SessionList = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [patientData, setPatientData] = useState(location.state || { name: "John Doe" })
  const [patientDataSource, setPatientDataSource] = useState(location.state)
  const patient = patientData
  console.log("patient", patientData)

  const [loadingId, setLoadingId] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [treeData, setTreeData] = useState(() => cleanHierarchy(location.state))

  const [openExercises, setOpenExercises] = useState({})
  const [selected, setSelected] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [exDetail, setExDetail] = useState(null)
  const [voiceRecordSession, setVoiceRecordSession] = useState(null)
  const [audioPlaybackSession, setAudioPlaybackSession] = useState(null)
  const [consentSession, setConsentSession] = useState(null)
  const [mediaSession, setMediaSession] = useState(null)
  const [activeSessions, setActiveSessions] = useState({})
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [mediaPreview, setMediaPreview] = useState(null)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  /* ── fetch ── */
  useEffect(() => {
    const fetch = async () => {
      setDataLoading(true)
      try {
        const raw = JSON.parse(localStorage.getItem("therapistData") || "{}")
        const clinicId = raw?.clinicId || raw?.data?.clinicId
        const branchId = raw?.branchId || raw?.data?.branchId
        const { bookingId, therapistRecordId } = patientData
        if (clinicId && branchId && bookingId && therapistRecordId) {
          const res = await getPaidSessions(clinicId, branchId, bookingId, therapistRecordId)
          const d = res?.data?.therapyWithSessions ? res.data : res?.therapyWithSessions ? res : null
          console.log("d", d)
          if (d) { setPatientDataSource(d); setTreeData(cleanHierarchy(d)); setPatientData(p => ({ ...p, ...d })) }


        }
      } catch (e) { console.error(e) } finally { setDataLoading(false) }
    }
    if (!location.state?.therapyWithSessions) fetch()
  }, [location.state])

  const handleUpdate = upd => setTreeData(t => deepUpdateSession(t, upd))

  const handleStartSession = id => setActiveSessions(p => ({ ...p, [id]: new Date() }))

  const handleStopAndComplete = s => {
    const startObj = activeSessions[s.sessionId]
    if (!startObj) return
    const endObj = new Date()
    setActiveSessions(p => { const n = { ...p }; delete n[s.sessionId]; return n })
    handleUpdate({ ...s, startTime: fmt24(startObj), endTime: fmt24(endObj) })
  }

  const handleManualCompleteFallback = (s, ex) => {
    let dur = ""
    if (s.startTime && s.endTime) {
      const [sh, sm] = s.startTime.split(":").map(Number)
      const [eh, em] = s.endTime.split(":").map(Number)
      let diff = (eh * 60 + em) - (sh * 60 + sm)
      if (diff < 0) diff += 1440
      const h = Math.floor(diff / 60), m = diff % 60
      dur = h > 0 ? `${h}h ${m}m` : `${m} mins`
    }
    setSelected({
      ...s, mode: "complete", sessionTime: dur,
      startTime: s.startTime || "", endTime: s.endTime || "",
      patientName: patient.name, doctorName: patient.doctorName || patientDataSource?.doctorName, bookingId: patientDataSource?.bookingId,
      patientId: patientDataSource?.patientId, serviceType: patientDataSource?.serviceType,
      sets: ex?.sets, repetitions: ex?.repetitions, disease: patient.disease,
      therapistRecordId: patient.therapistRecordId, voiceRecordUrl: s.voiceRecordUrl || "",
      activityType: ex?.activityType,
    })
  }

  const handleView = async (item) => {
    setLoadingId(item.sessionId)
    try {
      const raw = JSON.parse(localStorage.getItem("therapistData") || "{}")
      const clinicId = raw?.clinicId || raw?.data?.clinicId
      const branchId = raw?.branchId || raw?.data?.branchId
      const res = await getSessionDetails(clinicId, branchId, patient.therapistRecordId, item.sessionId)
      setSelectedSession(res?.data || res || item)
    } catch { setSelectedSession(item) } finally { setLoadingId(null) }
  }
  const handleVoiceRecordSaved = url => {
    if (voiceRecordSession && url) handleUpdate({ ...voiceRecordSession, voiceRecordUrl: url })
    setVoiceRecordSession(null)
    cleanupModalArtifacts()
  }

  const handleConsentGranted = (pdfUrl) => {
    if (!consentSession) return
    const updatedSession = { ...consentSession.session, consentPdfUrl: pdfUrl }
    handleUpdate(updatedSession)
    setConsentSession(null)
    // Small delay before opening media modal so backdrop cleanup runs first
    setTimeout(() => {
      cleanupModalArtifacts()
      setMediaSession({ session: updatedSession, type: consentSession.type })
    }, 400)
  }

  const handleMediaSaved = ({ fileKey, previewUrl, mediaType }) => {
    if (!mediaSession) return
    const updatedSession = { ...mediaSession.session }
    if (mediaSession.type === "before") {
      updatedSession.beforeMediaUrl = fileKey
      updatedSession.beforeMediaPreviewUrl = previewUrl
      updatedSession.beforeMediaType = mediaType
    }
    if (mediaSession.type === "after") {
      updatedSession.afterMediaUrl = fileKey
      updatedSession.afterMediaPreviewUrl = previewUrl
      updatedSession.afterMediaType = mediaType
    }
    handleUpdate(updatedSession)
    setMediaSession(null)
    cleanupModalArtifacts()
  }

  /* ── stats ── */
  const exercises = treeData ? extractExercises(treeData) : []
  const allSessions = exercises.flatMap(e => e.sessions || [])
  const completedCount = allSessions.filter(s => s.status?.toLowerCase() === "completed").length
  const pendingCount = allSessions.filter(s => s.status?.toLowerCase() !== "completed").length
  const todayCount = allSessions.filter(s => isDateToday(s.date || s.sessionDate)).length

  /* ── session table ── */
  const renderSessionsTable = (sessions, ex) => {
    if (!sessions?.length) return <div style={{ padding: "0.75rem 1rem", color: T.muted, fontSize: "0.82rem", fontStyle: "italic" }}>No sessions available</div>

    return (
      <>
        {/* Desktop */}
        <div className="d-none d-md-block" style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Session ID", "Date", "Timing / Tracker", "Status", "Actions"].map(h => (
                  <th key={h} style={{ ...S.th, ...(h === "Actions" ? { textAlign: "center" } : {}) }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => {
                const activeObj = activeSessions[s.sessionId]
                const isRunning = !!activeObj
                const completed = s.status?.toLowerCase() === "completed"
                return (
                  <tr key={s.sessionId || i} style={{ background: i % 2 === 0 ? T.white : "#f8fafd" }}>
                    <td style={S.td}>
                      <span style={{ fontSize: "0.78rem", color: T.navy, fontWeight: 600 }}>{s.sessionId}</span>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{s.date || s.sessionDate}</span>
                        {isDateToday(s.date || s.sessionDate) && <span style={S.badge("today")}>Today</span>}
                      </div>
                    </td>
                    <td style={{ ...S.td, minWidth: 200 }}>
                      {s.startTime && s.endTime ? (
                        <span style={{ color: T.muted, fontSize: "0.78rem" }}>
                          Tracked: <strong>{s.startTime}</strong> → <strong>{s.endTime}</strong>
                        </span>
                      ) : completed ? (
                        <span style={{ color: T.muted, fontSize: "0.78rem", fontStyle: "italic" }}>Completed natively</span>
                      ) : !isRunning ? (
                        <button style={{ ...S.btn("outline", "sm"), width: "100%" }} onClick={() => handleStartSession(s.sessionId)}>▶ Start Tracker</button>
                      ) : (
                        <div style={S.trackerBox}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.danger, animation: "pulse 1s infinite" }} />
                            <ElapsedTime startTimeObj={activeObj} />
                          </div>
                          <div style={S.trackerHint}>Started {fmt12(activeObj)}</div>
                          <button style={{ ...S.btn("danger", "sm"), width: "100%", marginTop: 4 }} onClick={() => handleStopAndComplete(s)}>⏹ Stop & Save</button>
                        </div>
                      )}
                    </td>
                    <td style={S.td}>
                      <span style={S.badge(completed ? "completed" : "pending")}>{s.status || "Pending"}</span>
                      <span style={{ color: T.muted, fontSize: "0.78rem", display: "flex", justifyContent: "center" }}>{s.paymentStatus}</span>
                    </td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      {!completed && (
                        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <button
                              style={S.btn(s.beforeMediaUrl ? "success" : "secondary", "sm")}
                              onClick={() => {
                                if (!s.consentPdfUrl) setConsentSession({ session: s, type: "before" })
                                else setMediaSession({ session: s, type: "before" })
                              }}
                            >
                              <Camera size={14} /> Before
                            </button>
                            {s.beforeMediaUrl && (
                              <button
                                style={{ ...S.btn("info", "sm"), padding: "4px 8px" }}
                                onClick={() => setMediaPreview({ url: s.beforeMediaPreviewUrl || s.beforeMediaUrl, type: s.beforeMediaType })}
                              >
                                <Eye size={12} />
                              </button>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <button
                              style={S.btn(s.afterMediaUrl ? "success" : "secondary", "sm")}
                              onClick={() => {
                                if (!s.consentPdfUrl) setConsentSession({ session: s, type: "after" })
                                else setMediaSession({ session: s, type: "after" })
                              }}
                            >
                              <Camera size={14} /> After
                            </button>
                            {s.afterMediaUrl && (
                              <button
                                style={{ ...S.btn("info", "sm"), padding: "4px 8px" }}
                                onClick={() => setMediaPreview({ url: s.afterMediaPreviewUrl || s.afterMediaUrl, type: s.afterMediaType })}
                              >
                                <Eye size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                        {s.voiceRecordUrl
                          ? <button style={S.btn("info", "sm")} onClick={() => setAudioPlaybackSession(s)}>▶️ Play</button>
                          : (!completed && <button style={S.btn("secondary", "sm")} onClick={() => setVoiceRecordSession(s)}>🎤 Record</button>)}
                        {!completed
                          ? <button
                            style={{ ...S.btn(s.startTime && s.endTime ? "primary" : "secondary", "sm"), opacity: (s.startTime && s.endTime) ? 1 : 0.5 }}
                            disabled={!(s.startTime && s.endTime)}
                            onClick={() => handleManualCompleteFallback(s, ex)}
                          >Complete Form</button>
                          : <button style={S.btn("ghost", "sm")} disabled={loadingId === s.sessionId} onClick={() => handleView(s)}>
                            {loadingId === s.sessionId ? <span className="spinner-border spinner-border-sm" /> : "View"}
                          </button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="d-block d-md-none" style={{ padding: "1rem 0.75rem" }}>
          {sessions.map((s, i) => {
            const activeObj = activeSessions[s.sessionId]
            const isRunning = !!activeObj
            const completed = s.status?.toLowerCase() === "completed"
            return (
              <div key={s.sessionId || i} style={S.mobileCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "0.65rem", color: T.muted, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>Session ID</div>
                    <div style={{ fontSize: "0.85rem", color: T.navy, fontWeight: 700 }}>{s.sessionId}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <span style={S.badge(completed ? "completed" : "pending")}>{s.status || "Pending"}</span>
                    <span style={{ color: T.muted, fontSize: "0.68rem", fontWeight: 600 }}>{s.paymentStatus || "Unpaid"}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: "0.75rem 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: T.text, fontWeight: 500 }}>
                    <Calendar size={14} style={{ color: T.navy }} />
                    {s.date || s.sessionDate}
                  </div>
                  {isDateToday(s.date || s.sessionDate) && <span style={S.badge("today")}>Today</span>}
                </div>

                {!completed && (
                  <div style={{ marginBottom: 8 }}>
                    {s.startTime && s.endTime ? (
                      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.6rem 0.75rem", display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={14} style={{ color: T.navy }} />
                        <span style={{ color: T.text, fontSize: "0.82rem", fontWeight: 500 }}>
                          Tracked: <strong>{s.startTime}</strong> → <strong>{s.endTime}</strong>
                        </span>
                      </div>
                    ) : !isRunning ? (
                      <button style={{ ...S.btn("outline", "sm"), width: "100%", justifyContent: "center", padding: "0.6rem" }} onClick={() => handleStartSession(s.sessionId)}>
                        <Play size={14} fill={T.navy} /> Start Tracker
                      </button>
                    ) : (
                      <div style={{ ...S.trackerBox, width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.danger, animation: "pulse 1s infinite", boxShadow: `0 0 10px ${T.danger}` }} />
                          <ElapsedTime startTimeObj={activeObj} />
                        </div>
                        <div style={S.trackerHint}>Started at {fmt12(activeObj)}</div>
                        <button style={{ ...S.btn("danger", "sm"), width: "100%", marginTop: 8, justifyContent: "center", padding: "0.6rem" }} onClick={() => handleStopAndComplete(s)}>
                          Stop & Save Session
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!completed && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1, display: "flex", gap: 4 }}>
                      <button
                        style={{ ...S.btn(s.beforeMediaUrl ? "success" : "secondary", "sm"), flex: 1, justifyContent: "center" }}
                        onClick={() => {
                          if (!s.consentPdfUrl) setConsentSession({ session: s, type: "before" })
                          else setMediaSession({ session: s, type: "before" })
                        }}
                      >
                        <Camera size={14} /> Before
                      </button>
                      {s.beforeMediaUrl && (
                        <button
                          style={{ ...S.btn("info", "sm"), padding: "6px 10px" }}
                          onClick={() => setMediaPreview({ url: s.beforeMediaPreviewUrl || s.beforeMediaUrl, type: s.beforeMediaType })}
                        >
                          <Eye size={14} />
                        </button>
                      )}
                    </div>
                    <div style={{ flex: 1, display: "flex", gap: 4 }}>
                      <button
                        style={{ ...S.btn(s.afterMediaUrl ? "success" : "secondary", "sm"), flex: 1, justifyContent: "center" }}
                        onClick={() => {
                          if (!s.consentPdfUrl) setConsentSession({ session: s, type: "after" })
                          else setMediaSession({ session: s, type: "after" })
                        }}
                      >
                        <Camera size={14} /> After
                      </button>
                      {s.afterMediaUrl && (
                        <button
                          style={{ ...S.btn("info", "sm"), padding: "6px 10px" }}
                          onClick={() => setMediaPreview({ url: s.afterMediaPreviewUrl || s.afterMediaUrl, type: s.afterMediaType })}
                        >
                          <Eye size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  {s.voiceRecordUrl ? (
                    <button style={{ ...S.btn("info", "sm"), flex: 1, justifyContent: "center" }} onClick={() => setAudioPlaybackSession(s)}>
                      <Play size={14} /> Listen
                    </button>
                  ) : (
                    !completed && (
                      <button style={{ ...S.btn("secondary", "sm"), flex: 1, justifyContent: "center" }} onClick={() => setVoiceRecordSession(s)}>
                        <Mic size={14} /> Record
                      </button>
                    )
                  )}
                  {!completed ? (
                    <button
                      style={{ ...S.btn(s.startTime && s.endTime ? "primary" : "secondary", "sm"), flex: 1, justifyContent: "center", opacity: (s.startTime && s.endTime) ? 1 : 0.5 }}
                      disabled={!(s.startTime && s.endTime)}
                      onClick={() => handleManualCompleteFallback(s, ex)}
                    >
                      <CheckCircle size={14} color="white" /> Complete
                    </button>
                  ) : (
                    <button style={{ ...S.btn("ghost", "sm"), flex: 1, justifyContent: "center" }} disabled={loadingId === s.sessionId} onClick={() => handleView(s)}>
                      {loadingId === s.sessionId ? <span className="spinner-border spinner-border-sm" /> : "View Summary"}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  /* ── exercise accordion ── */
  const renderExercise = (ex) => {
    const exerciseKey = getExerciseKey(ex)
    const isOpen = !!openExercises[exerciseKey]
    const hasToday = ex.sessions?.some(s => isDateToday(s.date || s.sessionDate))
    const completedSessions = ex.sessions?.filter(s => s.status?.toLowerCase() === "completed").length || 0
    const totalSessions = ex.sessions?.length || 0

    return (
      <div key={exerciseKey} style={{ borderBottom: `1px solid ${T.border}` }}>
        <div
          style={{
            ...S.exHeader,
            ...(isOpen ? S.exHeaderOpen : {}),
            padding: isMobile ? "0.85rem 1rem" : "1rem 1.25rem",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? 10 : 0
          }}
          onClick={() => setOpenExercises(p => ({ ...p, [exerciseKey]: !p[exerciseKey] }))}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: 0 }}>
            <span style={{ color: T.navy, fontSize: isMobile ? "0.95rem" : "1.05rem", fontWeight: 700, whiteSpace: "normal" }}>{ex.exerciseName}</span>
            {hasToday && <span style={S.badge("today")}>Today</span>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
            <span style={{ ...S.metaPill, ...S.metaPillBlue }}><Calendar size={12} /> {ex.frequency}</span>
            {ex.activityDuration && (
              <span style={{ ...S.metaPill, ...S.metaPillPurple }}>
                <Clock size={12} /> {String(ex.activityDuration).toLowerCase().includes('min') ? ex.activityDuration : `${ex.activityDuration} mins`}
              </span>
            )}
            {/* Removed Sets and Reps from header as per user request */}
            <span style={{
              ...S.metaPill,
              ...(completedSessions === totalSessions ? S.metaPillGreen : S.metaPillPurple),
              ...(completedSessions === totalSessions ? { fontWeight: 700 } : {})
            }}>
              <CheckCircle size={12} /> {completedSessions}/{totalSessions}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 4 }}>
              <button
                style={{ background: "none", border: "none", color: T.navy, cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}
                onClick={(e) => { e.stopPropagation(); setExDetail(ex) }}
              >
                <Eye size={18} />
              </button>
              <ChevronDown size={18} style={{ color: T.navy, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </div>
          </div>
        </div>
        {isOpen && (
          <div style={{ background: "#f8fafd", borderTop: `1px solid ${T.border}` }}>
            {/* Details Bar */}
            <div style={{
              padding: "0.8rem 1.25rem",
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
              background: T.white,
              borderBottom: `1px solid ${T.border}`,
              fontSize: "0.82rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Activity size={14} style={{ color: T.navy }} />
                <span style={{ color: T.muted }}>Type:</span>
                <span style={{ fontWeight: 600, color: T.navy }}>{ex.activityType || "N/A"}</span>
              </div>
              {(parseInt(ex.sets) > 0 || parseInt(ex.repetitions) > 0) && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Zap size={14} style={{ color: T.navy }} />
                  <span style={{ color: T.muted }}>Prescription:</span>
                  <span style={{ fontWeight: 600, color: T.navy }}>{ex.sets} Sets x {ex.repetitions} Reps</span>
                </div>
              )}
            </div>
            {renderSessionsTable(ex.sessions, ex)}
          </div>
        )}
      </div>
    )
  }

  /* ── hierarchy with section labels ── */
  const renderHierarchy = (node) => {
    const exercises = extractExercises(node)
    if (!exercises?.length) return (
      <div style={{ textAlign: "center", padding: "3rem", color: T.muted }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
        No activities available for this service type.
      </div>
    )
    return exercises.map(renderExercise)
  }

  /* ── render ── */
  return (
    <div style={S.page(isMobile)}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .session-row:hover { background: #f0f6ff !important; }
      `}</style>

      {/* Patient header */}
      <div style={{
        ...S.patientCard,
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        padding: isMobile ? "1.25rem" : "1.5rem 1.75rem"
      }}>
        <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
          <h4 style={{ ...S.patientName, fontSize: isMobile ? "1.4rem" : "1.6rem", marginBottom: 12, whiteSpace: "normal", wordBreak: "break-word" }}>{patient.name || "Patient Sessions"}</h4>
          <div style={{ ...S.patientSub, display: "flex", flexDirection: "column", gap: 10, color: "#ffffff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <User size={16} color="#ffffff" /> <span style={{ color: "#fff" }}>{patient.doctorName || "N/A"}</span>
            </div>
            {patientDataSource?.sessionStartDate && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={16} color="#ffffff" /> <span style={{ color: "#fff" }}>Started: {patientDataSource.sessionStartDate}</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={16} color="#ffffff" /> <span style={{ color: "#fff" }}>ID: {patientDataSource?.bookingId || "N/A"}</span>
            </div>
          </div>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile ? "space-between" : "flex-end",
          gap: "1rem",
          width: isMobile ? "100%" : "auto",
          marginTop: isMobile ? "1rem" : 0,
          borderTop: isMobile ? "1px solid rgba(255,255,255,0.1)" : "none",
          paddingTop: isMobile ? "1rem" : 0
        }}>
          <span style={{ ...S.serviceTag, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.8rem", padding: "0.4rem 1rem" }}>{patientDataSource?.serviceType || "CUSTOM"}</span>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.4)",
              borderRadius: "50%",
              width: 38, height: 38,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: T.white,
              transition: "all 0.2s",
            }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
            onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={S.statsRow}>
        {[
          { label: "Total Activities", value: exercises.length, icon: <ClipboardList size={18} /> },
          { label: "Total Sessions", value: allSessions.length, icon: <Activity size={18} /> },
          { label: "Completed", value: completedCount, icon: <CheckCircle size={18} />, color: T.success },
          { label: "Pending", value: pendingCount, icon: <Clock size={18} />, color: T.warning },
          { label: "Today", value: todayCount, icon: <Zap size={18} />, color: T.navy },
        ].map((s, i) => (
          <div key={i} style={{ ...S.statCard, borderLeft: `4px solid ${s.color || T.navy}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={S.statLbl}>{s.label}</div>
              <div style={{ color: s.color || T.navy, opacity: 0.8 }}>{s.icon}</div>
            </div>
            <div style={{ ...S.statVal, color: s.color || T.navy }}>{s.value}</div>
          </div>
        ))}
      </div>



      {/* Main card */}
      <div style={S.mainCard}>
        <div style={{ background: T.navy, padding: "1.1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ClipboardList size={22} color={T.white} />
            <span style={{ color: T.white, fontWeight: 700, fontSize: "1.1rem" }}>Session Activity Log</span>
          </div>
          <span style={{ background: "rgba(255,255,255,0.2)", color: T.white, padding: "0.2rem 0.6rem", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600 }}>
            {exercises.length} activity{exercises.length !== 1 ? "s" : ""}
          </span>
        </div>

        {dataLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
            <LoadingIndicator message="Loading session data..." />
          </div>
        ) : (
          <div>{renderHierarchy(treeData)}</div>
        )}
      </div>

      {/* Modals */}
      <VoiceRecordModal visible={!!voiceRecordSession} onClose={() => setVoiceRecordSession(null)} onSave={handleVoiceRecordSaved} />

      {audioPlaybackSession && (() => {
        const getFileUrl = (str) => {
          if (!str) return ''
          if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/') || str.startsWith('blob:') || str.startsWith('data:')) {
            return str
          }
          const isBase64 = str.includes(';base64,') || (str.length > 100 && !str.includes('/') && !str.includes('.'));
          if (!isBase64) {
            return `${BASE_URL}/viewFile/${str}`
          }
          return ''
        }
        const audioSrc = getFileUrl(audioPlaybackSession.voiceRecordUrl || audioPlaybackSession.voiceRecord)
        return (
          <CModal visible onClose={() => setAudioPlaybackSession(null)} alignment="center" size="sm">
            <CModalHeader style={{ background: T.navy }}><CModalTitle style={{ color: T.white }}>▶️ Playback Recording</CModalTitle></CModalHeader>
            <CModalBody className="text-center py-4">
              <audio controls autoPlay src={audioSrc} style={{ width: "100%" }} />
            </CModalBody>
          </CModal>
        )
      })()}

      {selected?.mode === "complete" && (
        <SessionFormModal visible data={selected} onClose={() => setSelected(null)} onSave={handleUpdate} />
      )}

      {selectedSession && (
        <SessionViewModal visible data={selectedSession} onClose={() => { setSelected(null); setSelectedSession(null) }} />
      )}



      <ConsentFormModal
        visible={!!consentSession}
        onClose={() => setConsentSession(null)}
        patientName={patient?.name}
        doctorName={patient?.doctorName || patientDataSource?.doctorName}
        bookingId={patientDataSource?.bookingId}
        bookingDate={patient?.sessionDate || consentSession?.session?.sessionDate || patientDataSource?.sessionStartDate}
        bookingTime={patient?.sessionTime || consentSession?.session?.appointmentTime || consentSession?.session?.slotTime || consentSession?.session?.startTime}
        onConsentGranted={handleConsentGranted}
      />

      <MediaCaptureModal
        visible={!!mediaSession}
        onClose={() => setMediaSession(null)}
        type={mediaSession?.type}
        onMediaSaved={handleMediaSaved}
      />

      {/* Exercise Detail Modal */}
      <CModal visible={!!exDetail} onClose={() => setExDetail(null)} alignment="center" size="lg" className="custom-modal">
        <CModalHeader style={{ background: T.navy, color: T.white }}>
          <CModalTitle style={{ color: T.white, fontWeight: 700 }}>Activity Information</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1.25rem" }}>
            {exDetail && Object.entries(exDetail)
              .filter(([key, val]) => {
                const blacklist = ["sessions", "paymentStatus", "totalExercisePrice", "totalPrice", "discountPercentage", "discountAmount", "gst", "otherTax", "pricePerSession", "therapyId", "packageId", "programId"]
                if (blacklist.includes(key)) return false
                if (val === null || val === "" || val === undefined) return false
                return true
              })
              .map(([key, val]) => {
                const isVideo = key.toLowerCase().includes("video") || (typeof val === "string" && (val.match(/\.(mp4|webm|mov|ogg)$/i) || val.startsWith("data:video")));
                const isImage = key.toLowerCase().includes("image") || (typeof val === "string" && (val.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i) || val.startsWith("data:image")));

                return (
                  <div key={key} style={{ borderBottom: `1px solid ${T.bg}`, paddingBottom: 8, gridColumn: (isVideo || isImage) ? "1 / -1" : "auto" }}>
                    <div style={{ fontSize: "0.7rem", color: T.muted, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em", marginBottom: 4 }}>
                      {key.replace(/([A-Z])/g, ' $1').trim().replace(/Exercise/g, 'Activity')}
                    </div>
                    <div style={{ fontSize: "0.95rem", color: T.navy, fontWeight: 600 }}>
                      {isVideo ? (
                        <video
                          key={String(val)}
                          src={String(val)}
                          controls
                          playsInline
                          style={{ width: "100%", borderRadius: 8, marginTop: 8, maxHeight: 240, background: "#000" }}
                        />
                      ) : isImage ? (
                        <img
                          src={String(val)}
                          alt={key}
                          style={{ width: "100%", borderRadius: 8, marginTop: 8, objectFit: "contain", maxHeight: 240, background: "#fafafa", border: "1px solid #e2e8f0" }}
                        />
                      ) : (
                        String(val)
                      )}
                    </div>
                  </div>
                )
              })
            }
          </div>
        </CModalBody>
      </CModal>

      {/* General Media Preview Modal */}
      {mediaPreview && (() => {
        const getFileUrl = (str) => {
          if (!str) return ''
          if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/') || str.startsWith('blob:') || str.startsWith('data:')) {
            return str
          }
          const isBase64 = str.includes(';base64,') || (str.length > 100 && !str.includes('/') && !str.includes('.'));
          if (!isBase64) {
            return `${BASE_URL}/viewFile/${str}`
          }
          return ''
        }
        const mediaUrl = typeof mediaPreview === "string" ? mediaPreview : mediaPreview.url
        const previewUrl = getFileUrl(mediaUrl)
        const isVideo = mediaPreview.type === "video" || mediaUrl.startsWith("data:video") || mediaUrl.match(/\.(mp4|webm|mov|ogg)$/i) || mediaUrl.toLowerCase().includes("video");

        return (
          <CModal
            visible
            size="xl"
            onClose={() => setMediaPreview(null)}
            className="preview-modal"
          >
            <CModalBody style={{ position: "relative", textAlign: "center", background: "#000", padding: "40px 15px 15px" }}>
              <button
                onClick={() => setMediaPreview(null)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "rgba(255,255,255,0.9)",
                  color: "#000",
                  border: "none",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  fontSize: "20px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  zIndex: 1000
                }}
              >
                ×
              </button>
              {isVideo ? (
                <video key={previewUrl} src={previewUrl} controls autoPlay style={{ maxWidth: "100%", maxHeight: "80vh" }} />
              ) : (
                <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }} />
              )}
            </CModalBody>
          </CModal>
        )
      })()}
    </div>
  )
}

export default SessionList
