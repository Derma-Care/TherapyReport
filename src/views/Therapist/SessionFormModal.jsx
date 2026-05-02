/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalBody,
  CFormInput,
  CFormTextarea,
  CFormSelect,
} from '@coreui/react'
import { createTherapyNotes } from './TheraphyApi'
import { useNavigate } from 'react-router-dom'
import { convertToBase64 } from '../../Utils/Base64Convert'
import { showCustomToast } from '../../Utils/Toaster'

/* ─── Design tokens ─── */
const PRIMARY = '#1B4F8A'
const t = {
  primary:   PRIMARY,
  text:      '#1e293b',
  textMuted: '#64748b',
  surface:   '#f8fafc',
  border:    '#e2e8f0',
  danger:    '#dc2626',
  success:   '#16a34a',
  radius:    '10px',
  radiusSm:  '6px',
  shadow:    '0 1px 3px rgba(0,0,0,0.07)',
}

/* ─── Primitives ─── */

const SectionHeading = ({ title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '18px 0 12px' }}>
    <span style={{ width: '4px', height: '16px', borderRadius: '2px', backgroundColor: PRIMARY, flexShrink: 0 }} />
    <span style={{ fontSize: '12px', fontWeight: '700', color: t.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {title}
    </span>
  </div>
)

const FieldLabel = ({ children, required }) => (
  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
    {children}{required && <span style={{ color: t.danger, marginLeft: '3px' }}>*</span>}
  </label>
)

const FieldError = ({ msg }) =>
  msg ? <div style={{ fontSize: '11px', color: t.danger, marginTop: '3px' }}>{msg}</div> : null

const Inp = ({ error, style = {}, ...props }) => (
  <input
    {...props}
    style={{
      width: '100%', padding: '7px 10px', fontSize: '13px', boxSizing: 'border-box',
      border: `1px solid ${error ? t.danger : t.border}`, borderRadius: t.radiusSm,
      outline: 'none', color: t.text, backgroundColor: '#fff', transition: 'border-color .15s',
      ...style,
    }}
    onFocus={e => { e.target.style.borderColor = PRIMARY }}
    onBlur={e => { e.target.style.borderColor = error ? t.danger : t.border }}
  />
)

const Sel = ({ error, children, ...props }) => (
  <select
    {...props}
    style={{
      width: '100%', padding: '7px 10px', fontSize: '13px', boxSizing: 'border-box',
      border: `1px solid ${error ? t.danger : t.border}`, borderRadius: t.radiusSm,
      outline: 'none', color: t.text, backgroundColor: '#fff', appearance: 'auto',
    }}
  >
    {children}
  </select>
)

const Textarea = ({ error, ...props }) => (
  <textarea
    {...props}
    style={{
      width: '100%', padding: '8px 10px', fontSize: '13px', boxSizing: 'border-box',
      border: `1px solid ${error ? t.danger : t.border}`, borderRadius: t.radiusSm,
      outline: 'none', color: t.text, backgroundColor: '#fff', resize: 'vertical',
      transition: 'border-color .15s', fontFamily: 'inherit',
    }}
    onFocus={e => { e.target.style.borderColor = PRIMARY }}
    onBlur={e => { e.target.style.borderColor = error ? t.danger : t.border }}
  />
)

const Btn = ({ children, onClick, disabled, variant = 'primary', style = {} }) => {
  const bg = variant === 'secondary' ? '#e2e8f0' : PRIMARY
  const color = variant === 'secondary' ? t.text : '#fff'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '8px 22px', borderRadius: t.radiusSm, fontSize: '13px',
        fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none', color, backgroundColor: bg, opacity: disabled ? 0.6 : 1,
        boxShadow: t.shadow, transition: 'opacity .15s', ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '1' }}
    >
      {children}
    </button>
  )
}

const Divider = () => <hr style={{ border: 'none', borderTop: `1px solid ${t.border}`, margin: '16px 0' }} />

/* ─── Info chip for header summary ─── */
const InfoChip = ({ label, value }) => (
  <div style={{ minWidth: '140px' }}>
    <div style={{ fontSize: '10px', fontWeight: '700', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
      {label}
    </div>
    <div style={{ fontSize: '13px', fontWeight: '600', color: t.text }}>
      {value || '—'}
    </div>
  </div>
)

/* ─── File upload field ─── */
const FileField = ({ label, required, error, accept, onChange, preview }) => (
  <div>
    <FieldLabel required={required}>{label}</FieldLabel>
    <label style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '7px 12px', borderRadius: t.radiusSm,
      border: `1px dashed ${error ? t.danger : t.border}`,
      backgroundColor: t.surface, cursor: 'pointer', fontSize: '12px', color: t.textMuted,
    }}>
      📎 Choose file
      <input type="file" accept={accept} style={{ display: 'none' }} onChange={e => onChange(e.target.files[0])} />
    </label>
    {preview && (
      <img src={preview} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover', marginTop: '6px', borderRadius: t.radiusSm, border: `1px solid ${t.border}` }} />
    )}
    <FieldError msg={error} />
  </div>
)

/* ─── Pain scale selector ─── */
const PainSelect = ({ label, value, onChange, error }) => (
  <div>
    <FieldLabel required>{label}</FieldLabel>
    <Sel value={value} onChange={e => onChange(e.target.value)} error={error}>
      <option value="">Select 1–10</option>
      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n}>{n}</option>)}
    </Sel>
    <FieldError msg={error} />
  </div>
)

/* ═══════════════════════════════════════════════════════════════════════ */

export default function SessionFormModal({ visible, data, onClose, onSave }) {
  const navigate = useNavigate()
  const [notes,               setNotes]               = useState('')
  const [before,              setBefore]              = useState(null)
  const [beforePreview,       setBeforePreview]       = useState(null)
  const [after,               setAfter]               = useState(null)
  const [afterPreview,        setAfterPreview]        = useState(null)
  const [loading,             setLoading]             = useState(false)
  const [beforeVideo,         setBeforeVideo]         = useState(null)
  const [afterVideo,          setAfterVideo]          = useState(null)
  const [painBefore,          setPainBefore]          = useState('')
  const [painAfter,           setPainAfter]           = useState('')
  const [result,              setResult]              = useState('')
  const [nextPlan,            setNextPlan]            = useState('')
  const [completedSets,       setCompletedSets]       = useState('')
  const [completedRepitations,setCompletedRepitations]= useState('')
  const [error,               setError]               = useState({})
  const [errors,              setErrors]              = useState({})

  const storedData    = localStorage.getItem('therapistData')
  const theraphydata  = location.state || (storedData ? JSON.parse(storedData) : {})

  /* ── file handlers ── */
  const handleBeforeImage = (file) => {
    let err = { ...error }
    if (!file) return
    if (!file.type.startsWith('image/')) { err.before = 'Only image files allowed' }
    else if (file.size > 1 * 1024 * 1024) { err.before = 'Image must be < 1 MB' }
    else { delete err.before; setBefore(file); setBeforePreview(URL.createObjectURL(file)) }
    setError(err)
  }

  const handleAfterImage = (file) => {
    let err = { ...error }
    if (!file) return
    if (!file.type.startsWith('image/')) { err.after = 'Only image files allowed' }
    else if (file.size > 1 * 1024 * 1024) { err.after = 'Image must be < 1 MB' }
    else { delete err.after; setAfter(file); setAfterPreview(URL.createObjectURL(file)) }
    setError(err)
  }

  const handleBeforeVideo = (file) => {
    let err = { ...errors }
    if (!file) return
    if (!file.type.startsWith('video/')) { err.beforeVideo = 'Only video files allowed' }
    else if (file.size > 2 * 1024 * 1024) { err.beforeVideo = 'Video must be < 2 MB' }
    else { delete err.beforeVideo; setBeforeVideo(file) }
    setErrors(err)
  }

  const handleAfterVideo = (file) => {
    let err = { ...errors }
    if (!file) return
    if (!file.type.startsWith('video/')) { err.afterVideo = 'Only video files allowed' }
    else if (file.size > 2 * 1024 * 1024) { err.afterVideo = 'Video must be < 2 MB' }
    else { delete err.afterVideo; setAfterVideo(file) }
    setErrors(err)
  }

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }),
          () => resolve({ latitude: "", longitude: "" })
        );
      } else {
        resolve({ latitude: "", longitude: "" });
      }
    });
  };

  /* ── save ── */
  const save = async () => {
    let err = {}
    if (!notes)       err.notes      = 'Notes required'
    if (!before)      err.before     = 'Before image required'
    if (!after)       err.after      = 'After image required'
    if (!painBefore)  err.painBefore = 'Select pain before'
    if (!painAfter)   err.painAfter  = 'Select pain after'
    if (!result)      err.result     = 'Select result'
    setError(err)
    if (Object.keys(err).length > 0) return

    try {
      setLoading(true)
      const loc = await getCurrentLocation();
      const beforeBase64      = await convertToBase64(before)
      const afterBase64       = await convertToBase64(after)
      const beforeVideoBase64 = beforeVideo ? await convertToBase64(beforeVideo) : ''
      const afterVideoBase64  = afterVideo  ? await convertToBase64(afterVideo)  : ''
      const now               = new Date()
      const td                = JSON.parse(localStorage.getItem('therapistData'))
      const formattedDate     = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

      const payload = {
        therapistRecordId:  data.therapistRecordId,
        clinicId:           td?.clinicId,
        branchId:           td?.branchId,
        patientId:          data.patientId,
        bookingId:          data.bookingId,
        therapistId:        td?.therapistId,
        sessionId:          data.sessionId,
        patientName:        data.patientName,
        serviceType:        data.serviceType,
        date:               formattedDate,
        completedDate:      formattedDate,
        completedTime:      now.toLocaleTimeString(),
        painBefore, painAfter,
        duration:           data.sessionTime,
        voiceRecord:        data.voiceRecordUrl,
        setsDone:           `${completedSets || 0}/${data?.sets || 0}`,
        repetationDone:     `${completedRepitations || 0}/${data?.repetitions || 0}`,
        therapistNotes:     notes,
        patientResponse:    data.patientResponse || 'Good',
        result, mode: 'complete', nextPlan,
        beforeImage: beforeBase64, afterImage: afterBase64,
        beforeVideo: beforeVideoBase64, afterVideo: afterVideoBase64,
        latitude: loc.latitude, longitude: loc.longitude,
      }

      const res = await createTherapyNotes(payload)
      if (res.statusCode === 201 || res.statusCode === 200) {
        showCustomToast(res?.message || 'Saved successfully!')
        navigate('/therapist')
      }
      onClose()
    } catch (err) {
      showCustomToast(err?.response?.data?.message || 'Something went wrong!')
    } finally {
      setLoading(false)
    }
  }

  /* ─── render ─── */
  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">

      {/* ── Header ── */}
      <CModalHeader style={{ backgroundColor: PRIMARY, padding: '14px 20px', borderBottom: 'none' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '500', letterSpacing: '0.05em' }}>THERAPY MANAGEMENT</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>Complete Session</div>
        </div>
      </CModalHeader>

      <CModalBody style={{ padding: '20px', backgroundColor: '#f8fafc', color: t.text }}>

        {/* ── Session Summary Card ── */}
        <div style={{
          backgroundColor: '#fff', borderRadius: t.radius,
          border: `1px solid ${t.border}`, padding: '16px',
          display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '4px',
        }}>
          <InfoChip label="Patient"            value={data.patientName} />
          <InfoChip label="Service Type"       value={data.serviceType} />
          <InfoChip label="Session ID"         value={data.sessionId} />
          <InfoChip label="Record ID"          value={data.therapistRecordId} />
          <InfoChip label="Date"               value={new Date().toLocaleDateString()} />
          <InfoChip label="Time"               value={new Date().toLocaleTimeString()} />
        </div>

        {/* ── Doctor Notes ── */}
        <SectionHeading title="Doctor Notes" />
        <div style={{
          backgroundColor: '#fff', borderRadius: t.radiusSm,
          border: `1px solid ${t.border}`, padding: '12px 14px',
          fontSize: '13px', color: data.doctorNotes ? t.text : t.textMuted,
          fontStyle: data.doctorNotes ? 'normal' : 'italic',
          lineHeight: '1.6',
        }}>
          {data.doctorNotes || 'No notes available.'}
        </div>

        {/* ── Therapist Notes ── */}
        <SectionHeading title="Therapist Notes" />
        <div>
          <Textarea
            rows={3}
            placeholder="Enter your clinical observations…"
            value={notes}
            error={error.notes}
            onChange={e => { setNotes(e.target.value); setError(p => ({ ...p, notes: '' })) }}
          />
          <FieldError msg={error.notes} />
        </div>

        {/* ── Pain Scale ── */}
        <SectionHeading title="Pain Scale" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <PainSelect label="Pain Before" value={painBefore} error={error.painBefore}
            onChange={v => { setPainBefore(v); setError(p => ({ ...p, painBefore: '' })) }} />
          <PainSelect label="Pain After" value={painAfter} error={error.painAfter}
            onChange={v => { setPainAfter(v); setError(p => ({ ...p, painAfter: '' })) }} />
        </div>

        {/* ── Session Result ── */}
        <SectionHeading title="Session Result" />
        <div>
          <FieldLabel required>Result</FieldLabel>
          <Sel value={result} error={error.result}
            onChange={e => { setResult(e.target.value); setError(p => ({ ...p, result: '' })) }}>
            <option value="">Select result</option>
            <option>Completed</option>
            <option>Partially Completed</option>
            <option>Skipped</option>
            <option>Patient not available</option>
          </Sel>
          <FieldError msg={error.result} />
        </div>

        {/* ── Sets & Reps ── */}
        <SectionHeading title="Exercise Completion" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* Sets */}
          <div>
            <FieldLabel>Completed Sets</FieldLabel>
            <div style={{ display: 'flex', gap: '0', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, overflow: 'hidden', backgroundColor: '#fff' }}>
              <Inp
                type="number" min="0" max={data?.sets || 0} placeholder="e.g. 3"
                value={completedSets}
                onChange={e => setCompletedSets(e.target.value)}
                style={{ border: 'none', borderRadius: 0, flex: 1 }}
              />
              <span style={{ padding: '7px 12px', fontSize: '12px', color: t.textMuted, backgroundColor: t.surface, borderLeft: `1px solid ${t.border}`, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                of {data?.sets || 0}
              </span>
            </div>
          </div>
          {/* Reps */}
          <div>
            <FieldLabel>Completed Repetitions</FieldLabel>
            <div style={{ display: 'flex', gap: '0', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, overflow: 'hidden', backgroundColor: '#fff' }}>
              <Inp
                type="number" min="0" max={data?.repetitions || 0} placeholder="e.g. 15"
                value={completedRepitations}
                onChange={e => { const v = Number(e.target.value); if (v <= (data?.repetitions || 0)) setCompletedRepitations(e.target.value) }}
                style={{ border: 'none', borderRadius: 0, flex: 1 }}
              />
              <span style={{ padding: '7px 12px', fontSize: '12px', color: t.textMuted, backgroundColor: t.surface, borderLeft: `1px solid ${t.border}`, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                of {data?.repetitions || 0}
              </span>
            </div>
          </div>
        </div>

        {/* ── Next Plan ── */}
        <SectionHeading title="Next Session Plan" />
        <Textarea rows={2} placeholder="Describe the plan for the next session…" value={nextPlan}
          onChange={e => setNextPlan(e.target.value)} />

        {/* ── Images ── */}
        <SectionHeading title="Before & After Images" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FileField label="Before Image" required accept="image/*" error={error.before}
            preview={beforePreview} onChange={handleBeforeImage} />
          <FileField label="After Image" required accept="image/*" error={error.after}
            preview={afterPreview} onChange={handleAfterImage} />
        </div>

        {/* ── Videos ── */}
        <SectionHeading title="Before & After Videos (Optional)" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FileField label="Before Video" accept="video/*" error={errors.beforeVideo} onChange={handleBeforeVideo} />
          <FileField label="After Video"  accept="video/*" error={errors.afterVideo}  onChange={handleAfterVideo} />
        </div>

        <div style={{ fontSize: '11px', color: t.textMuted, marginTop: '4px' }}>
          Images: max 1 MB &nbsp;·&nbsp; Videos: max 2 MB
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${t.border}` }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={save} disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-1" style={{ width: '12px', height: '12px' }} />Saving…</>
              : 'Save Session'
            }
          </Btn>
        </div>

      </CModalBody>
    </CModal>
  )
}