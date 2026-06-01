/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalBody,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CModalFooter,
} from '@coreui/react'
import { createTherapyNotes } from './TheraphyApi'
import { useNavigate } from 'react-router-dom'
import { convertToBase64 } from '../../Utils/Base64Convert'
import { showCustomToast } from '../../Utils/Toaster'
import ConsentFormModal from './ConsentFormModal'
import { BASE_URL } from '../../API/BaseUrl'
import { uploadFile } from '../../Utils/S3UploadService'

/* ─── Design tokens ─── */
const PRIMARY = '#1B4F8A'
const t = {
  primary: PRIMARY,
  text: '#1e293b',
  textMuted: '#64748b',
  surface: '#f8fafc',
  border: '#e2e8f0',
  danger: '#dc2626',
  success: '#16a34a',
  radius: '10px',
  radiusSm: '6px',
  shadow: '0 1px 3px rgba(0,0,0,0.07)',
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
      transition: 'border-color .15s',
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
const FileField = ({ label, required, error, accept, onChange, onClear, preview, isVideo }) => {
  const getMediaSrc = (val) => {
    if (!val) return null;
    if (val.startsWith("http") || val.startsWith("blob:") || val.startsWith("data:")) return val;
    const isBase64 = val.includes(';base64,') || (val.length > 100 && !val.includes('/') && !val.includes('.'));
    if (!isBase64) {
      return `${BASE_URL}/viewFile/${val}`;
    }
    return `data:${isVideo ? "video/mp4" : "image/jpeg"};base64,${val}`;
  };

  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 12px', borderRadius: t.radiusSm,
          border: `1px dashed ${error ? t.danger : t.border}`,
          backgroundColor: t.surface, cursor: 'pointer', fontSize: '12px', color: t.textMuted,
          flex: 1,
        }}>
          📎 Choose file
          <input type="file" accept={accept} style={{ display: 'none' }} onChange={e => {
            if (e.target.files?.[0]) {
              onChange(e.target.files[0]);
            }
          }} />
        </label>
        {preview && onClear && (
          <button
            type="button"
            onClick={onClear}
            style={{
              padding: '7px 12px',
              borderRadius: t.radiusSm,
              border: `1px solid ${t.danger}`,
              backgroundColor: '#fff',
              color: t.danger,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🗑️ Clear
          </button>
        )}
      </div>
      {preview && (
        <div style={{ position: 'relative', display: 'inline-block', marginTop: '6px' }}>
          {isVideo ? (
            <video src={getMediaSrc(preview)} controls style={{ width: '100%', maxHeight: '100px', objectFit: 'contain', marginTop: '6px', borderRadius: t.radiusSm, border: `1px solid ${t.border}` }} />
          ) : (
            <img src={getMediaSrc(preview)} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: t.radiusSm, border: `1px solid ${t.border}` }} />
          )}
        </div>
      )}
      <FieldError msg={error} />
    </div>
  )
}

/* ─── Pain scale selector ─── */
const PainSelect = ({ label, value, onChange, error }) => (
  <div>
    <FieldLabel required>{label}</FieldLabel>
    <Sel value={value} onChange={e => onChange(e.target.value)} error={error}>
      <option value="">Select 1–10</option>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n}>{n}</option>)}
    </Sel>
    <FieldError msg={error} />
  </div>
)

/* ═══════════════════════════════════════════════════════════════════════ */

export default function SessionFormModal({ visible, data, onClose, onSave }) {
  const navigate = useNavigate()
  const [notes, setNotes] = useState('')
  const [patientResponse, setPatientResponse] = useState(data?.patientResponse || 'Good')
  const [before, setBefore] = useState(null)
  const [beforePreview, setBeforePreview] = useState(null)
  const [after, setAfter] = useState(null)
  const [afterPreview, setAfterPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [beforeVideo, setBeforeVideo] = useState(null)
  const [beforeVideoPreview, setBeforeVideoPreview] = useState(null)
  const [afterVideo, setAfterVideo] = useState(null)
  const [afterVideoPreview, setAfterVideoPreview] = useState(null)
  const [painBefore, setPainBefore] = useState('')
  const [painAfter, setPainAfter] = useState('')
  const [result, setResult] = useState('')
  const [nextPlan, setNextPlan] = useState('')
  const [completedSets, setCompletedSets] = useState('')
  const [completedRepitations, setCompletedRepitations] = useState('')
  const [error, setError] = useState({})
  const [errors, setErrors] = useState({})

  const clearBeforeImage = () => {
    setBefore(null)
    setBeforePreview(null)
  }

  const clearAfterImage = () => {
    setAfter(null)
    setAfterPreview(null)
  }

  const clearBeforeVideo = () => {
    setBeforeVideo(null)
    setBeforeVideoPreview(null)
  }

  const clearAfterVideo = () => {
    setAfterVideo(null)
    setAfterVideoPreview(null)
  }

  // Consent flow state
  const [showConsent, setShowConsent] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [localConsentPdf, setLocalConsentPdf] = useState(data.consentPdfUrl || null)
  const isVideoMedia = (url, type) => type === "video" || url?.match(/\.(mp4|webm|mov|ogg)$/i) || url?.includes("video")

  // Initialize previews with data captured from dashboard if present
  useEffect(() => {
    if (data.beforeMediaUrl) {
      if (isVideoMedia(data.beforeMediaUrl, data.beforeMediaType)) {
        setBeforeVideoPreview(data.beforeMediaPreviewUrl || data.beforeMediaUrl)
      } else {
        setBeforePreview(data.beforeMediaPreviewUrl || data.beforeMediaUrl)
      }
    }
    if (data.afterMediaUrl) {
      if (isVideoMedia(data.afterMediaUrl, data.afterMediaType)) {
        setAfterVideoPreview(data.afterMediaPreviewUrl || data.afterMediaUrl)
      } else {
        setAfterPreview(data.afterMediaPreviewUrl || data.afterMediaUrl)
      }
    }
  }, [data])

  const storedData = localStorage.getItem('therapistData')
  const theraphydata = location.state || (storedData ? JSON.parse(storedData) : {})

  /* ── file handlers ── */
  const processBeforeImage = (file) => {
    let err = { ...error }
    if (!file.type.startsWith('image/')) { err.before = 'Only image files allowed' }
    else if (file.size > 1 * 1024 * 1024) { err.before = 'Image must be < 1 MB' }
    else { delete err.before; setBefore(file); setBeforePreview(URL.createObjectURL(file)) }
    setError(err)
  }

  const processAfterImage = (file) => {
    let err = { ...error }
    if (!file.type.startsWith('image/')) { err.after = 'Only image files allowed' }
    else if (file.size > 1 * 1024 * 1024) { err.after = 'Image must be < 1 MB' }
    else { delete err.after; setAfter(file); setAfterPreview(URL.createObjectURL(file)) }
    setError(err)
  }

  const processBeforeVideo = (file) => {
    let err = { ...errors }
    if (!file.type.startsWith('video/')) { err.beforeVideo = 'Only video files allowed' }
    else if (file.size > 2 * 1024 * 1024) { err.beforeVideo = 'Video must be < 2 MB' }
    else { delete err.beforeVideo; setBeforeVideo(file); setBeforeVideoPreview(URL.createObjectURL(file)) }
    setErrors(err)
  }

  const processAfterVideo = (file) => {
    let err = { ...errors }
    if (!file.type.startsWith('video/')) { err.afterVideo = 'Only video files allowed' }
    else if (file.size > 2 * 1024 * 1024) { err.afterVideo = 'Video must be < 2 MB' }
    else { delete err.afterVideo; setAfterVideo(file); setAfterVideoPreview(URL.createObjectURL(file)) }
    setErrors(err)
  }

  const handleFileSelect = (file, type) => {
    if (!file) return;
    if (!localConsentPdf) {
      setPendingFile({ file, type });
      setShowConsent(true);
      return;
    }
    // If consent already granted, process immediately
    if (type === 'beforeImage') processBeforeImage(file);
    if (type === 'afterImage') processAfterImage(file);
    if (type === 'beforeVideo') processBeforeVideo(file);
    if (type === 'afterVideo') processAfterVideo(file);
  }

  const cleanupModalArtifacts = () => {
    setTimeout(() => {
      document.querySelectorAll('.modal-backdrop').forEach(el => {
        el.style.display = 'none'
      })
      document.body.classList.remove('modal-open')
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }, 600)
  }

  const handleConsentGranted = (pdfUrl) => {
    setLocalConsentPdf(pdfUrl);
    setShowConsent(false);
    cleanupModalArtifacts();
    if (pendingFile) {
      if (pendingFile.type === 'beforeImage') processBeforeImage(pendingFile.file);
      if (pendingFile.type === 'afterImage') processAfterImage(pendingFile.file);
      if (pendingFile.type === 'beforeVideo') processBeforeVideo(pendingFile.file);
      if (pendingFile.type === 'afterVideo') processAfterVideo(pendingFile.file);
      setPendingFile(null);
    }
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
    if (!notes) err.notes = 'Notes required'
    if (!painBefore) err.painBefore = 'Select pain before'
    if (!painAfter) err.painAfter = 'Select pain after'
    if (!result) err.result = 'Select result'
    setError(err)
    if (Object.keys(err).length > 0) return

    try {
      setLoading(true)
      const loc = await getCurrentLocation();
      const beforeKey = before ? await uploadFile('beforeImage', before) : ''
      const afterKey = after ? await uploadFile('afterImage', after) : ''
      const beforeVideoKey = beforeVideo ? await uploadFile('beforeVideo', beforeVideo) : ''
      const afterVideoKey = afterVideo ? await uploadFile('afterVideo', afterVideo) : ''
      const now = new Date()
      const td = JSON.parse(localStorage.getItem('therapistData'))
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

      const payload = {
        therapistRecordId: data.therapistRecordId,
        clinicId: td?.clinicId,
        branchId: td?.branchId,
        patientId: data.patientId,
        bookingId: data.bookingId,
        therapistId: td?.therapistId,
        sessionId: data.sessionId,
        patientName: data.patientName,
        serviceType: data.serviceType,
        date: formattedDate,
        completedDate: formattedDate,
        completedTime: now.toLocaleTimeString(),
        painBefore, painAfter,
        duration: data.sessionTime,
        voiceRecord: data.voiceRecordUrl,
        setsDone: `${completedSets || 0}/${data?.sets || 0}`,
        repetationDone: `${completedRepitations || 0}/${data?.repetitions || 0}`,
        therapistNotes: notes,
        patientResponse: patientResponse || 'Good',
        result, mode: 'complete', nextPlan,
        beforeImage: beforeKey || (beforePreview && !isVideoMedia(data.beforeMediaUrl, data.beforeMediaType) ? data.beforeMediaUrl : ''),
        afterImage: afterKey || (afterPreview && !isVideoMedia(data.afterMediaUrl, data.afterMediaType) ? data.afterMediaUrl : ''),
        beforeVideo: beforeVideoKey || (beforeVideoPreview && isVideoMedia(data.beforeMediaUrl, data.beforeMediaType) ? data.beforeMediaUrl : ''),
        afterVideo: afterVideoKey || (afterVideoPreview && isVideoMedia(data.afterMediaUrl, data.afterMediaType) ? data.afterMediaUrl : ''),
        latitude: loc.latitude, longitude: loc.longitude,
        consentPdfUrl: localConsentPdf || data.consentPdfUrl || '',
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
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg" className='custom-modal' scrollable={true}>

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
          <InfoChip label="Patient" value={data.patientName} />
          <InfoChip label="Service Type" value={data.serviceType} />
          <InfoChip label="Session ID" value={data.sessionId} />
          <InfoChip label="Record ID" value={data.therapistRecordId} />
          <InfoChip label="Date" value={new Date().toLocaleDateString()} />
          <InfoChip label="Time" value={new Date().toLocaleTimeString()} />
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

        {/* ── Patient Response ── */}
        <SectionHeading title="Patient Response" />
        <div>
          <Textarea
            rows={2}
            placeholder="Enter patient feedback or response…"
            value={patientResponse}
            onChange={e => setPatientResponse(e.target.value)}
          />
        </div>

        {/* ── Pain Scale ── */}
        <SectionHeading title="Pain Scale" />
        <div className="responsive-grid">
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
        {data.activityType?.toLowerCase() === 'exercise' && (
          <>
            <SectionHeading title="Exercise Completion" />
            <div className="responsive-grid">
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
          </>
        )}

        {/* ── Next Plan ── */}
        <SectionHeading title="Next Session Plan" />
        <Textarea rows={2} placeholder="Describe the plan for the next session…" value={nextPlan}
          onChange={e => setNextPlan(e.target.value)} />

        {/* ── Consent Status ── */}
        <SectionHeading title="Media Consent" />
        {localConsentPdf ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', borderRadius: t.radiusSm,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            fontSize: '12px', color: '#16a34a', fontWeight: 600,
          }}>
            ✅ Patient consent has been recorded
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', borderRadius: t.radiusSm,
            background: '#fffbeb', border: '1px solid #fde68a',
            fontSize: '12px', color: '#b45309', fontWeight: 500,
          }}>
            ⚠️ Consent required — you will be asked to sign before uploading media
          </div>
        )}

        {/* ── Images ── */}
        {
          localConsentPdf &&
          (
            <>

              <SectionHeading title="Before & After Images (Optional)" />
              <div className="responsive-grid">
                <FileField label="Before Image" accept="image/*" error={error.before}
                  preview={beforePreview} onChange={file => handleFileSelect(file, 'beforeImage')} onClear={clearBeforeImage} />
                <FileField label="After Image" accept="image/*" error={error.after}
                  preview={afterPreview} onChange={file => handleFileSelect(file, 'afterImage')} onClear={clearAfterImage} />
              </div>

              {/* ── Videos ── */}
              <SectionHeading title="Before & After Videos (Optional)" />
              <div className="responsive-grid">
                <FileField label="Before Video" accept="video/*" error={errors.beforeVideo}
                  preview={beforeVideoPreview} isVideo onChange={file => handleFileSelect(file, 'beforeVideo')} onClear={clearBeforeVideo} />
                <FileField label="After Video" accept="video/*" error={errors.afterVideo}
                  preview={afterVideoPreview} isVideo onChange={file => handleFileSelect(file, 'afterVideo')} onClear={clearAfterVideo} />
              </div>

              <div style={{ fontSize: '11px', color: t.textMuted, marginTop: '4px' }}>
                Images: max 1 MB &nbsp;·&nbsp; Videos: max 2 MB
              </div>
            </>
          )
        }

      </CModalBody>
      <CModalFooter>

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
      </CModalFooter>

      {/* Only mount ConsentFormModal when actively needed — avoids DOM/backdrop interference */}
      {showConsent && (
        <ConsentFormModal
          visible={showConsent}
          onClose={() => {
            setShowConsent(false);
            setPendingFile(null);
            cleanupModalArtifacts();
          }}
          patientName={data?.patientName}
          doctorName={data?.doctorName}
          bookingId={data?.bookingId}
          bookingDate={data?.date || data?.sessionDate}
          bookingTime={data?.bookingTime || data?.appointmentTime || data?.slotTime || data?.startTime}
          onConsentGranted={handleConsentGranted}
        />
      )}
      <style>
        {`
          .custom-modal .modal-dialog {
            max-width: 95%;
            margin: 1.75rem auto;
          }
          @media (min-width: 768px) {
            .custom-modal .modal-dialog {
              max-width: 700px;
            }
          }
          .responsive-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          @media (max-width: 768px) {
            .responsive-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }
          }
        `}
      </style>
    </CModal>
  )
}
