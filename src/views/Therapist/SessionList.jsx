import React, { useState, useEffect, useRef } from "react"
import {
  CModal, CModalHeader, CModalTitle, CModalBody,
} from "@coreui/react"
import { useLocation ,useNavigate } from "react-router-dom"
import SessionFormModal from "./SessionFormModal"
import { getSessionDetails, getPaidSessions } from "./TheraphyApi"
import SessionViewModal from "./SessionViewModal"
import LoadingIndicator from "../../Utils/loader"

/* ─── THEME ─────────────────────────────────────────────────────────────── */
const T = {
  navy:      "#1B4F8A",
  navyDark:  "#163f6e",
  navyLight: "#e8f0fa",
  navyMid:   "#2563a8",
  accent:    "#0ea5e9",
  accentBg:  "#e0f2fe",
  success:   "#16a34a",
  successBg: "#dcfce7",
  warning:   "#d97706",
  warningBg: "#fef9c3",
  danger:    "#dc2626",
  dangerBg:  "#fee2e2",
  text:      "#1e293b",
  muted:     "#64748b",
  border:    "#e2e8f0",
  white:     "#ffffff",
  bg:        "#f0f4f8",
  cardBg:    "#ffffff",
}

const S = {
  /* Page */
  page: {  minHeight: "100vh", padding: "1.5rem", fontFamily: "'Segoe UI', system-ui, sans-serif" },

  /* Patient card header */
  patientCard: {
    background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
    borderRadius: 14, padding: "1.5rem 1.75rem", marginBottom: "1.5rem",
    boxShadow: `0 4px 20px rgba(27,79,138,0.25)`,
    display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
  },
  patientName: { color: T.white, fontSize: "1.35rem", fontWeight: 700, margin: 0 },
  patientSub:  { color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", marginTop: 4 },
  serviceTag:  { background: "rgba(255,255,255,0.18)", color: T.white, borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.8rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(4px)" },

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
  metaPill: { background: T.navyLight, color: T.navy, borderRadius: 20, padding: "0.18rem 0.6rem", fontSize: "0.72rem", fontWeight: 600 },

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
      pending:   { bg: T.warningBg, color: T.warning, border: "#fde68a" },
      today:     { bg: T.navy,      color: T.white,   border: T.navy },
      paid:      { bg: T.accentBg,  color: "#0369a1", border: "#bae6fd" },
    }
    const c = map[type] || map.pending
    return { background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 20, padding: "0.2rem 0.65rem", fontSize: "0.71rem", fontWeight: 700, display: "inline-block", whiteSpace: "nowrap" }
  },

  /* Buttons */
  btn: (variant = "primary", size = "sm") => {
    const base = { borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, transition: "all 0.15s", whiteSpace: "nowrap" }
    const pad = size === "sm" ? { padding: "0.3rem 0.75rem", fontSize: "0.75rem" } : { padding: "0.5rem 1.1rem", fontSize: "0.82rem" }
    const map = {
      primary:   { background: T.navy,    color: T.white },
      success:   { background: T.success, color: T.white },
      danger:    { background: T.danger,  color: T.white },
      warning:   { background: T.warning, color: T.white },
      outline:   { background: "transparent", color: T.navy, border: `1.5px solid ${T.navy}` },
      ghost:     { background: T.navyLight, color: T.navy },
      info:      { background: T.accentBg, color: "#0369a1", border: "1px solid #bae6fd" },
      secondary: { background: "#f1f5f9", color: T.muted, border: "1px solid #e2e8f0" },
    }
    return { ...base, ...pad, ...(map[variant] || map.primary) }
  },

  /* Tracker box */
  trackerBox: { background: "#fff5f5", border: `1.5px solid ${T.danger}`, borderRadius: 9, padding: "0.6rem 0.85rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 150 },
  trackerTime: { color: T.danger, fontFamily: "monospace", fontSize: "1.25rem", fontWeight: 700, lineHeight: 1 },
  trackerHint: { fontSize: "0.7rem", color: T.muted },

  /* Mobile card */
  mobileCard: { background: T.white, borderRadius: 10, padding: "0.85rem", marginBottom: "0.65rem", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: `1px solid ${T.border}` },
}

/* ─── DUMMY DATA ─────────────────────────────────────────────────────────── */
const DUMMY_DATA = {
  bookingId: "BOOK123", patientId: "PAT123", doctorId: "DOC123",
  doctorName: "Dr. John (Physio)", therapistId: "THER123", therapistName: "Therapy_1",
  therapistRecordId: "REC123", serviceType: "PACKAGE", totalAmount: 1250,
  discountAmount: 100, finalAmount: 1150, totalPaid: 800, balanceAmount: 350,
  paymentStatus: "Partial", sessionStartDate: "14/04/2026", totalSessionCount: 25,
  noOfSessionCompletedCount: 3, noOfSessionCompletedStatus: false, sessionTableCreatedStatus: true,
  paymentHistory: [
    { amount: 500, paymentMode: "CASH", paymentType: "Partial", paymentLevel: "PACKAGE", paymentDate: "14/04/2026" },
    { amount: 300, paymentMode: "UPI",  paymentType: "Partial", paymentLevel: "SESSION", paymentDate: "16/04/2026" },
  ],
  therapyWithSessions: [
    {
      packageId: "PACK001", packageName: "PACKAGE_1", totalPackagePrice: 1250, paymentStatus: "Partial",
      programs: [{
        programId: "PROG001", programName: "PROGRAM_1", totalProgramPrice: 625, paymentStatus: "Partial",
        therapyData: [
          {
            therapyId: "THER001", therapyName: "THERAPY_1", totalTherapyPrice: 425, paymentStatus: "Partial",
            exercises: [
              { exerciseId: "E1", exerciseName: "Knee Flexion", pricePerSession: 10, noOfSessions: 10, totalExercisePrice: 100, paymentStatus: "Partial", repetitions: 10, frequency: "2/day", sets: 2, youtubeUrl: "", sessions: [
                { sessionId: "E1_1", sessionNo: 1, date: "14/04/2026", status: "Completed", paymentStatus: "Paid" },
                { sessionId: "E1_2", sessionNo: 2, date: "15/04/2026", status: "Completed", paymentStatus: "Paid" },
                { sessionId: "E1_3", sessionNo: 3, date: "17/04/2026", status: "Pending",   paymentStatus: "Paid" },
              ]},
              { exerciseId: "E2", exerciseName: "Quad Strengthening", pricePerSession: 20, noOfSessions: 5, totalExercisePrice: 100, paymentStatus: "Partial", repetitions: 12, frequency: "3/day", sets: 4, youtubeUrl: "", sessions: [
                { sessionId: "E2_1", sessionNo: 1, date: "14/04/2026", status: "Pending", paymentStatus: "Paid" },
              ]},
            ],
          },
          {
            therapyId: "THER002", therapyName: "THERAPY_2", totalTherapyPrice: 200, paymentStatus: "Paid",
            exercises: [
              { exerciseId: "E3", exerciseName: "Hamstring Stretch", pricePerSession: 20, noOfSessions: 10, totalExercisePrice: 200, paymentStatus: "Paid", repetitions: 10, frequency: "2/day", sets: 2, youtubeUrl: "", sessions: [
                { sessionId: "E3_1", sessionNo: 1, date: "17/04/2026", status: "Pending", paymentStatus: "Paid" },
              ]},
            ],
          },
        ],
      }],
    },
  ],
}

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
const cleanHierarchy = (node) => {
  if (!node || node.paymentStatus?.toLowerCase() === "unpaid") return null
  let r = { ...node }
  if (Array.isArray(node.sessions))           r.sessions           = node.sessions.filter(s => s.paymentStatus?.toLowerCase() !== "unpaid")
  if (Array.isArray(node.exercises))          r.exercises          = node.exercises.map(cleanHierarchy).filter(Boolean)
  if (Array.isArray(node.therapyData))        r.therapyData        = node.therapyData.map(cleanHierarchy).filter(Boolean)
  if (Array.isArray(node.programs))           r.programs           = node.programs.map(cleanHierarchy).filter(Boolean)
  if (Array.isArray(node.therapyWithSessions)) r.therapyWithSessions = node.therapyWithSessions.map(cleanHierarchy).filter(Boolean)
  return r
}

const deepUpdateSession = (node, upd) => {
  if (!node) return node
  let n = { ...node }
  if (n.sessions) n.sessions = n.sessions.map(s => s.sessionId === upd.sessionId ? { ...s, ...upd } : s)
  ;["therapyWithSessions","programs","therapyData","exercises"].forEach(k => {
    if (n[k]) n[k] = n[k].map(c => deepUpdateSession(c, upd))
  })
  return n
}

const extractExercises = (node) => {
  let list = []
  if (!node) return list
  if (node.exerciseId && node.sessions) list.push(node)
  ;["therapyWithSessions","programs","therapyData","exercises"].forEach(k => {
    if (node[k]) node[k].forEach(c => list = list.concat(extractExercises(c)))
  })
  return list
}

const isDateToday = (dateStr) => {
  if (!dateStr) return false
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, "0")
  const mm = String(today.getMonth() + 1).padStart(2, "0")
  const yyyy = today.getFullYear()
  if (dateStr === `${dd}/${mm}/${yyyy}` || dateStr === `${yyyy}-${mm}-${dd}`) return true
  const d = new Date(dateStr)
  return !isNaN(d) && d.getDate()===today.getDate() && d.getMonth()===today.getMonth() && d.getFullYear()===today.getFullYear()
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
    setStatus("STOPPED")
    const blob = new Blob(chunksRef.current, { type: "audio/webm" })
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => { setTimeout(() => { onSave(reader.result); onClose() }, 1200) }
  }

  const timeStr = new Date(timer * 1000).toISOString().substr(14, 5)

  return (
    <CModal visible={visible} onClose={() => status !== "STOPPED" && onClose()} alignment="center" size="sm" backdrop="static">
      <CModalHeader style={{ background: T.navy, color: T.white }}>
        <CModalTitle style={{ color: T.white, fontWeight: 700 }}>🎤 Voice Record</CModalTitle>
      </CModalHeader>
      <CModalBody className="text-center py-4">
        {status !== "PREVIEW" && status !== "STOPPED" && (
          <div style={{ fontSize: "2.5rem", fontFamily: "monospace", color: T.navy, fontWeight: 700, marginBottom: "1rem" }}>{timeStr}</div>
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
        {status === "STOPPED" && <div style={{ color: T.success, fontWeight: 600 }}>✅ Storing and sending...</div>}
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

  const [loadingId, setLoadingId] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [treeData, setTreeData] = useState(() => cleanHierarchy(location.state))

  const [openExercises, setOpenExercises] = useState({})
  const [selected, setSelected] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [voiceRecordSession, setVoiceRecordSession] = useState(null)
  const [audioPlaybackSession, setAudioPlaybackSession] = useState(null)
  const [activeSessions, setActiveSessions] = useState({})

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
      patientName: patient.name, bookingId: patientDataSource?.bookingId,
      patientId: patientDataSource?.patientId, serviceType: patientDataSource?.serviceType,
      sets: ex?.sets, repetitions: ex?.repetitions, disease: patient.disease,
      therapistRecordId: patient.therapistRecordId, voiceRecordUrl: s.voiceRecordUrl || "",
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
  }

  /* ── stats ── */
  const exercises = treeData ? extractExercises(treeData) : []
  const allSessions = exercises.flatMap(e => e.sessions || [])
  const completedCount = allSessions.filter(s => s.status?.toLowerCase() === "completed").length
  const pendingCount   = allSessions.filter(s => s.status?.toLowerCase() !== "completed").length
  const todayCount     = allSessions.filter(s => isDateToday(s.date || s.sessionDate)).length

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
                      <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: T.navy, fontWeight: 600 }}>{s.sessionId}</span>
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
                    </td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                        {s.voiceRecordUrl
                          ? <button style={S.btn("info", "sm")} onClick={() => setAudioPlaybackSession(s)}>▶️ Play</button>
                          : (!completed && <button style={S.btn("secondary", "sm")} onClick={() => setVoiceRecordSession(s)}>🎤 Record</button>)}
                        {!completed
                          ? <button style={S.btn("primary", "sm")} onClick={() => handleManualCompleteFallback(s, ex)}>Complete Form</button>
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
        <div className="d-block d-md-none" style={{ padding: "0.75rem" }}>
          {sessions.map((s, i) => {
            const activeObj = activeSessions[s.sessionId]
            const isRunning = !!activeObj
            const completed = s.status?.toLowerCase() === "completed"
            return (
              <div key={s.sessionId || i} style={S.mobileCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: T.navy, fontWeight: 700 }}>{s.sessionId}</span>
                  <span style={S.badge(completed ? "completed" : "pending")}>{s.status || "Pending"}</span>
                </div>
                <div style={{ fontSize: "0.8rem", color: T.muted, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  📅 {s.date || s.sessionDate}
                  {isDateToday(s.date || s.sessionDate) && <span style={S.badge("today")}>Today</span>}
                </div>
                {!completed && (
                  <div style={{ marginBottom: 8 }}>
                    {!isRunning
                      ? <button style={{ ...S.btn("outline", "sm"), width: "100%" }} onClick={() => handleStartSession(s.sessionId)}>▶ Start Tracker</button>
                      : <div style={{ ...S.trackerBox, width: "100%" }}>
                          <ElapsedTime startTimeObj={activeObj} />
                          <div style={S.trackerHint}>Started {fmt12(activeObj)}</div>
                          <button style={{ ...S.btn("danger", "sm"), width: "100%" }} onClick={() => handleStopAndComplete(s)}>⏹ Stop & Save</button>
                        </div>}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6 }}>
                  {s.voiceRecordUrl
                    ? <button style={{ ...S.btn("info", "sm"), flex: 1 }} onClick={() => setAudioPlaybackSession(s)}>▶️ Play</button>
                    : (!completed && <button style={{ ...S.btn("secondary", "sm"), flex: 1 }} onClick={() => setVoiceRecordSession(s)}>🎤 Record</button>)}
                  {!completed
                    ? <button style={{ ...S.btn("primary", "sm"), flex: 1 }} onClick={() => handleManualCompleteFallback(s, ex)}>Complete</button>
                    : <button style={{ ...S.btn("ghost", "sm"), flex: 1 }} disabled={loadingId === s.sessionId} onClick={() => handleView(s)}>
                        {loadingId === s.sessionId ? <span className="spinner-border spinner-border-sm" /> : "View"}
                      </button>}
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
    const isOpen = !!openExercises[ex.exerciseId]
    const hasToday = ex.sessions?.some(s => isDateToday(s.date || s.sessionDate))
    const completedSessions = ex.sessions?.filter(s => s.status?.toLowerCase() === "completed").length || 0
    const totalSessions = ex.sessions?.length || 0

    return (
      <div key={ex.exerciseId} style={{ borderBottom: `1px solid ${T.border}` }}>
        <div
          style={{ ...S.exHeader, ...(isOpen ? S.exHeaderOpen : {}) }}
          onClick={() => setOpenExercises(p => ({ ...p, [ex.exerciseId]: !p[ex.exerciseId] }))}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <span style={{ color: T.navy, fontSize: "0.9rem", fontWeight: 600 }}>{ex.exerciseName}</span>
            {hasToday && <span style={S.badge("today")}>Today</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={S.exMeta}>
              <span style={S.metaPill}>📆 {ex.frequency}</span>
              <span style={S.metaPill}>🔁 {ex.sets} sets</span>
              <span style={S.metaPill}>💪 {ex.repetitions} reps</span>
              <span style={{ ...S.metaPill, background: completedSessions === totalSessions ? T.successBg : T.navyLight, color: completedSessions === totalSessions ? T.success : T.navy }}>
                ✅ {completedSessions}/{totalSessions}
              </span>
            </div>
            <span style={{ color: T.navy, fontSize: "1rem", transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
          </div>
        </div>
        {isOpen && (
          <div style={{ background: "#f8fafd", borderTop: `1px solid ${T.border}` }}>
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
        No exercises available for this service type.
      </div>
    )
    return exercises.map(renderExercise)
  }

  /* ── render ── */
  return (
    <div style={S.page}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .session-row:hover { background: #f0f6ff !important; }
      `}</style>

      {/* Patient header */}
  <div style={S.patientCard}>
        <div>
          <h4 style={S.patientName}>{patient.name || "Patient Sessions"}</h4>
          <div style={S.patientSub}>
            <span>👨‍⚕️ {patient.doctorName || "N/A"}</span>
            {patientDataSource?.sessionStartDate && <span style={{ marginLeft: "1rem" }}>📅 Started: {patientDataSource.sessionStartDate}</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={S.serviceTag}>{patientDataSource?.serviceType || "CUSTOM"}</span>
          <button
            onClick={() => navigate(-1)}
            title="Close"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.4)",
              borderRadius: "50%",
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: T.white,
              fontSize: "1rem",
              lineHeight: 1,
              transition: "background 0.15s",
            }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
            onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          >
            ✕
          </button>
        </div>
      </div>

   

      {/* Main card */}
      <div style={S.mainCard}>
        <div style={{ background: T.navy, padding: "0.9rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: T.white, fontWeight: 700, fontSize: "0.95rem" }}>📋 Session Exercises</span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem" }}>{exercises.length} exercise{exercises.length !== 1 ? "s" : ""}</span>
        </div>

        {dataLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
            <LoadingIndicator message="Loading session data..." />
          </div>
        ) : (
          <div>{treeData ? renderHierarchy(treeData) : renderHierarchy(cleanHierarchy(DUMMY_DATA))}</div>
        )}
      </div>

      {/* Modals */}
      <VoiceRecordModal visible={!!voiceRecordSession} onClose={() => setVoiceRecordSession(null)} onSave={handleVoiceRecordSaved} />

      {audioPlaybackSession && (
        <CModal visible onClose={() => setAudioPlaybackSession(null)} alignment="center" size="sm">
          <CModalHeader style={{ background: T.navy }}><CModalTitle style={{ color: T.white }}>▶️ Playback Recording</CModalTitle></CModalHeader>
          <CModalBody className="text-center py-4">
            <audio controls autoPlay src={audioPlaybackSession.voiceRecordUrl} style={{ width: "100%" }} />
          </CModalBody>
        </CModal>
      )}

      {selected?.mode === "complete" && (
        <SessionFormModal visible data={selected} onClose={() => setSelected(null)} onSave={handleUpdate} />
      )}

      {selectedSession && (
        <SessionViewModal visible data={selectedSession} onClose={() => { setSelected(null); setSelectedSession(null) }} />
      )}
    </div>
  )
}

export default SessionList