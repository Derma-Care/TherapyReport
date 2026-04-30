import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
} from "@coreui/react"
import { useState } from "react"
import { FileText, X, ZoomIn, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"

/* ─── Design tokens — matches AppointmentDetails / DoctorDetailsPage ─── */
const PRIMARY      = '#1B4F8A'
const PRIMARY_DARK = '#143d6e'
const t = {
  primary:     PRIMARY,
  primaryDark: PRIMARY_DARK,
  text:        '#1e293b',
  textMuted:   '#64748b',
  textLight:   '#94a3b8',
  surface:     '#f8fafc',
  surfaceAlt:  '#f1f5f9',
  border:      '#e2e8f0',
  danger:      '#dc2626',
  success:     '#16a34a',
  warning:     '#d97706',
  radius:      '10px',
  radiusSm:    '6px',
  shadow:      '0 1px 3px rgba(0,0,0,0.07)',
  shadowMd:    '0 4px 12px rgba(0,0,0,0.08)',
  shadowLg:    '0 8px 24px rgba(0,0,0,0.10)',
}

/* ─── Helpers ─── */
const labelify = (txt = "") =>
  txt.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^./, s => s.toUpperCase()).trim()

const coerceValue = (v) => {
  if (v === null || v === undefined || v === "") return null
  if (typeof v === "boolean") return v ? "Yes" : "No"
  return v
}

const isImgString = (str) =>
  typeof str === "string" &&
  (str.startsWith("/9j/") || str.startsWith("iVBOR") ||
   str.startsWith("R0lGOD") || str.startsWith("data:image"))

const resolveImg = (img) => {
  if (!img) return null
  if (img.startsWith("data:image")) return img
  if (img.startsWith("iVBOR")) return `data:image/png;base64,${img}`
  return `data:image/jpeg;base64,${img}`
}

const HIDDEN = ["payment","paymentinfo","amount","paidamount","balanceamount",
  "totalamount","discount","price","fee","cost"]
const shouldHide = (key) => { const k = key?.toLowerCase(); return HIDDEN.some(h => k?.includes(h)) }

/* ─── Section config ─── */
const SECTION_CFG = {
  "Main Details":   { color: PRIMARY,     icon: '🏥' },
  "Patient Info":   { color: '#0e7490',   icon: '👤' },
  "Complaints":     { color: '#b91c1c',   icon: '📋' },
  "Reports":        { color: '#1d4ed8',   icon: '📊' },
  "Assessment":     { color: '#15803d',   icon: '🔍' },
  "Diagnosis":      { color: '#92400e',   icon: '🩺' },
  "Treatment Plan": { color: '#7c3aed',   icon: '💊' },
  "Home Exercise":  { color: '#065f46',   icon: '🏃' },
  "Questions":      { color: '#6d28d9',   icon: '❓' },
  "Exercise Plan":  { color: '#0369a1',   icon: '📝' },
  "Follow Up":      { color: '#b45309',   icon: '📅' },
  "Home Advice":    { color: '#166534',   icon: '🏠' },
}

/* ─── Status badge ─── */
const StatusBadge = ({ value }) => {
  const v = String(value).toLowerCase()
  const map = {
    completed: { bg: '#dcfce7', color: t.success, dot: t.success },
    active:    { bg: '#dbeafe', color: PRIMARY,    dot: PRIMARY },
    pending:   { bg: '#fef3c7', color: t.warning,  dot: t.warning },
    cancelled: { bg: '#fee2e2', color: t.danger,   dot: t.danger },
  }
  const s = map[v] || { bg: t.surface, color: t.textMuted, dot: t.textMuted }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      backgroundColor: s.bg, color: s.color, borderRadius: 20,
      padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
      textTransform: 'uppercase', border: `1px solid ${s.dot}40`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: s.dot, flexShrink: 0 }} />
      {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
    </span>
  )
}

/* ─── Info tile (label + value) ─── */
const Tile = ({ label, children }) => (
  <div style={{
    backgroundColor: '#fff', border: `1px solid ${t.border}`,
    borderRadius: t.radiusSm, padding: '12px 14px',
    transition: 'box-shadow .15s',
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = t.shadowMd}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
  >
    <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
      {label}
    </div>
    {children}
  </div>
)

/* ─── Accordion for exercises / questions ─── */
const Accordion = ({ title, index, children, accentColor = PRIMARY }) => {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: t.radiusSm, overflow: 'hidden', marginBottom: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', background: open ? t.surface : '#fff',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          fontWeight: 600, fontSize: 13, color: t.text, transition: 'background .15s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
            backgroundColor: `${accentColor}15`, color: accentColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700,
          }}>
            {index + 1}
          </span>
          {title}
        </span>
        {open
          ? <ChevronUp size={14} color={t.textMuted} />
          : <ChevronDown size={14} color={t.textMuted} />
        }
      </button>
      {open && (
        <div style={{ padding: '14px', borderTop: `1px solid ${t.border}`, backgroundColor: t.surface }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ─── Section card with accent heading ─── */
const SectionCard = ({ title, children }) => {
  const cfg = SECTION_CFG[title] || { color: PRIMARY, icon: '●' }
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{
          width: 30, height: 30, borderRadius: '8px', flexShrink: 0,
          backgroundColor: `${cfg.color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
        }}>
          {cfg.icon}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div style={{ flex: 1, height: 1, backgroundColor: t.border }} />
      </div>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function PatientViewModal({ visible, data, onClose }) {
  const [preview, setPreview] = useState(null)
  const record = data
  if (!record) return null

  /* ── renderField ── */
  const renderField = (key, val, i) => {
    if (!key || shouldHide(key)) return null
    if (val === null || val === undefined || val === "") return null

    // IMAGE
    if (isImgString(val)) {
      const src = resolveImg(val)
      return (
        <CCol md={4} key={i} className="mb-3">
          <Tile label={labelify(key)}>
            <div style={{ position: 'relative', cursor: 'pointer', borderRadius: t.radiusSm, overflow: 'hidden' }}
              onClick={() => setPreview(src)}>
              <img src={src} alt={key} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
              <div style={{
                position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.45)'; e.currentTarget.querySelector('span').style.opacity = '1' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; e.currentTarget.querySelector('span').style.opacity = '0' }}
              >
                <span style={{ opacity: 0, color: '#fff', fontSize: 11, fontWeight: 700, transition: 'opacity .2s', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ZoomIn size={13} /> Preview
                </span>
              </div>
            </div>
          </Tile>
        </CCol>
      )
    }

    // ARRAY
    if (Array.isArray(val)) {
      if (!val.length) return null
      return (
        <CCol md={12} key={i} className="mb-3">
          <Tile label={labelify(key)}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {val.map((item, idx) => {
                if (typeof item !== 'object' || item === null) {
                  return (
                    <span key={idx} style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, padding: '3px 12px', fontSize: 12, color: t.text, fontWeight: 500 }}>
                      {item}
                    </span>
                  )
                }
                const text = Object.entries(item)
                  .filter(([k, v]) => !shouldHide(k) && v != null && v !== "" && typeof v !== 'object')
                  .map(([, v]) => v).join(' · ')
                return text ? (
                  <span key={idx} style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, padding: '3px 12px', fontSize: 12, color: t.text, fontWeight: 500 }}>
                    {text}
                  </span>
                ) : null
              })}
            </div>
          </Tile>
        </CCol>
      )
    }

    // OBJECT
    if (typeof val === 'object') {
      const entries = Object.entries(val).filter(([k, v]) => !shouldHide(k) && v != null && v !== "")
      if (!entries.length) return null
      return (
        <CCol md={12} key={i} className="mb-3">
          <div style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
              {labelify(key)}
            </div>
            <CRow className="g-2">
              {entries.map(([k, v], idx) => renderField(k, v, `${i}-${idx}`))}
            </CRow>
          </div>
        </CCol>
      )
    }

    // SCALAR
    const display = coerceValue(val)
    if (!display) return null
    const isStatus = ['status', 'overallstatus', 'state'].some(s => key?.toLowerCase().includes(s))
    const isId     = key?.toLowerCase().includes('id')
    const isDate   = ['createdat', 'updatedat', 'date', 'time'].some(s => key?.toLowerCase().includes(s))

    return (
      <CCol md={4} key={i} className="mb-3">
        <Tile label={labelify(key)}>
          {isStatus ? (
            <StatusBadge value={display} />
          ) : (
            <div style={{
              fontSize: isId ? 11 : 13,
              color: isId || isDate ? t.textMuted : t.text,
              fontWeight: isId ? 500 : 600,
              fontFamily: isId ? "'Courier New',monospace" : 'inherit',
              wordBreak: 'break-word',
            }}>
              {display}
            </div>
          )}
        </Tile>
      </CCol>
    )
  }

  /* ── Section wrapper ── */
  const Section = ({ title, obj }) => {
    if (!obj) return null
    const fields = Object.entries(obj).map(([k, v], i) => renderField(k, v, i))
    if (!fields.some(Boolean)) return null
    return (
      <SectionCard title={title}>
        <CRow className="g-2">{fields}</CRow>
      </SectionCard>
    )
  }

  /* ── Exercise item ── */
  const renderExerciseItem = (item, index) => {
    const cfg = SECTION_CFG['Home Exercise']
    return (
      <Accordion key={index} title={item?.exerciseName || item?.name || `Exercise ${index + 1}`} index={index} accentColor={cfg.color}>
        <CRow className="g-2">
          {Object.entries(item).map(([k, v], i) => {
            const field = k.toLowerCase()
            if (field.includes('thumbnail') || field.includes('photo')) return null
            let resolved = v
            try {
              if (typeof resolved === 'string' && !resolved.startsWith('http') && !resolved.startsWith('data:')) {
                const dec = atob(resolved)
                if (dec.startsWith('http://') || dec.startsWith('https://') || dec.startsWith('www.')) resolved = dec
              }
            } catch {}
            const isUrl = typeof resolved === 'string' && (resolved.startsWith('http://') || resolved.startsWith('https://') || resolved.startsWith('www.'))
            const isImg = typeof resolved === 'string' && resolved.startsWith('data:image')
            if (isUrl || isImg) {
              let displayLabel = labelify(k)
              try { displayLabel = labelify(atob(k)) } catch {}
              return (
                <CCol md={4} key={`${index}-${i}`} className="mb-2">
                  <Tile label={displayLabel}>
                    {isImg && <img src={resolved} alt="preview" style={{ width: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: t.radiusSm, marginBottom: 8 }} />}
                    <button onClick={() => window.open(resolved, '_blank')}
                      style={{
                        backgroundColor: PRIMARY, color: '#fff', border: 'none',
                        borderRadius: t.radiusSm, padding: '6px 14px', cursor: 'pointer',
                        fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                      <ExternalLink size={12} /> {isUrl ? 'Open Link' : 'View Image'}
                    </button>
                  </Tile>
                </CCol>
              )
            }
            return renderField(k, resolved, `${index}-${i}`)
          })}
        </CRow>
      </Accordion>
    )
  }

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        .pvm-modal .modal-content {
          background: #f1f5f9 !important;
          border: none !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
          overflow: hidden;
        }
        .pvm-modal .modal-dialog { max-width: min(92vw, 960px) !important; }
        .pvm-body::-webkit-scrollbar { width: 5px; }
        .pvm-body::-webkit-scrollbar-track { background: #f1f5f9; }
        .pvm-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .pvm-close-btn .btn-close { filter: invert(1) brightness(2) !important; opacity: 0.8 !important; }
        .pvm-close-btn .btn-close:hover { opacity: 1 !important; }
      `}</style>

      <CModal visible={visible} onClose={onClose} size="xl" backdrop="static" className="pvm-modal">

        {/* ── Header ── */}
        <CModalHeader closeButton className="pvm-close-btn" style={{
          backgroundColor: PRIMARY,
          padding: '14px 20px',
          border: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>⚕️</div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                PATIENT RECORD
              </div>
              <CModalTitle style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>
                {record?.patientInfo?.name || record?.patientInfo?.patientName || 'Patient Details'}
              </CModalTitle>
              {record?.bookingId && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1, fontFamily: "'Courier New',monospace", letterSpacing: '0.04em' }}>
                  #{record.bookingId}
                </div>
              )}
            </div>
            {record?.overallStatus && (
              <div style={{ marginLeft: 'auto', marginRight: 36 }}>
                <StatusBadge value={record.overallStatus} />
              </div>
            )}
          </div>
        </CModalHeader>

        {/* ── Body ── */}
        <CModalBody className="pvm-body" style={{
          backgroundColor: '#f1f5f9',
          padding: '20px 24px 12px',
          maxHeight: '72vh',
          overflowY: 'auto',
          color: t.text,
        }}>

          {/* Each section is wrapped in a white card */}
          {[
            { title: 'Main Details', obj: {
                therapistRecordId: record?.therapistRecordId,
                bookingId: record?.bookingId,
                clinicId: record?.clinicId,
                branchId: record?.branchId,
                overallStatus: record?.overallStatus,
                createdAt: record?.createdAt,
                updatedAt: record?.updatedAt,
              }
            },
            { title: 'Patient Info',   obj: record?.patientInfo },
            { title: 'Complaints',     obj: record?.complaints },
            { title: 'Reports',        obj: record?.reports },
            { title: 'Assessment',     obj: record?.assessment },
            { title: 'Diagnosis',      obj: record?.diagnosis },
            { title: 'Treatment Plan', obj: record?.treatmentPlan },
          ].map(({ title, obj }) => {
            if (!obj) return null
            const fields = Object.entries(obj).map(([k, v], i) => renderField(k, v, i))
            if (!fields.some(Boolean)) return null
            return (
              <div key={title} style={{ backgroundColor: '#fff', borderRadius: t.radius, border: `1px solid ${t.border}`, padding: '16px 18px', marginBottom: 12, boxShadow: t.shadow }}>
                <SectionCard title={title}>
                  <CRow className="g-2">{fields}</CRow>
                </SectionCard>
              </div>
            )
          })}

          {/* Home Exercises */}
          {record?.exercisePlan?.exercises?.length > 0 && (
            <div style={{ backgroundColor: '#fff', borderRadius: t.radius, border: `1px solid ${t.border}`, padding: '16px 18px', marginBottom: 12, boxShadow: t.shadow }}>
              <SectionCard title="Home Exercise">
                {record.exercisePlan.exercises.map((item, index) => renderExerciseItem(item, index))}
              </SectionCard>
            </div>
          )}

          {/* Questions */}
          {record?.questions?.length > 0 && (
            <div style={{ backgroundColor: '#fff', borderRadius: t.radius, border: `1px solid ${t.border}`, padding: '16px 18px', marginBottom: 12, boxShadow: t.shadow }}>
              <SectionCard title="Questions">
                {record.questions.map((item, index) => (
                  <Accordion key={index} title={item?.questionText || item?.question || `Question ${index + 1}`} index={index} accentColor={SECTION_CFG['Questions'].color}>
                    <CRow className="g-2">
                      {Object.entries(item).map(([k, v], i) => renderField(k, v, `${index}-${i}`))}
                    </CRow>
                  </Accordion>
                ))}
              </SectionCard>
            </div>
          )}

          {/* Exercise Plan (non-exercises fields) */}
          {record?.exercisePlan && (() => {
            const obj = Object.fromEntries(Object.entries(record.exercisePlan).filter(([k]) => k !== 'exercises'))
            const fields = Object.entries(obj).map(([k, v], i) => renderField(k, v, i))
            if (!fields.some(Boolean)) return null
            return (
              <div style={{ backgroundColor: '#fff', borderRadius: t.radius, border: `1px solid ${t.border}`, padding: '16px 18px', marginBottom: 12, boxShadow: t.shadow }}>
                <SectionCard title="Exercise Plan">
                  <CRow className="g-2">{fields}</CRow>
                </SectionCard>
              </div>
            )
          })()}

          {/* Follow Up */}
          {record?.followUp && (() => {
            const fields = Object.entries(record.followUp).map(([k, v], i) => renderField(k, v, i))
            if (!fields.some(Boolean)) return null
            return (
              <div style={{ backgroundColor: '#fff', borderRadius: t.radius, border: `1px solid ${t.border}`, padding: '16px 18px', marginBottom: 12, boxShadow: t.shadow }}>
                <SectionCard title="Follow Up">
                  <CRow className="g-2">{fields}</CRow>
                </SectionCard>
              </div>
            )
          })()}

          {/* Home Advice */}
          {record?.homeAdvice && (
            <div style={{ backgroundColor: '#fff', borderRadius: t.radius, border: `1px solid ${t.border}`, padding: '16px 18px', marginBottom: 12, boxShadow: t.shadow }}>
              <SectionCard title="Home Advice">
                <CRow className="g-2">{renderField('homeAdvice', record.homeAdvice, 0)}</CRow>
              </SectionCard>
            </div>
          )}

        </CModalBody>

        {/* ── Footer ── */}
        <CModalFooter style={{
          backgroundColor: t.surface, borderTop: `1px solid ${t.border}`,
          padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 11, color: t.textMuted }}>
            {record?.updatedAt
              ? `Last updated · ${new Date(record.updatedAt).toLocaleString()}`
              : 'Patient record'}
          </div>
          <button onClick={onClose} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 18px', borderRadius: t.radiusSm, border: 'none',
            backgroundColor: PRIMARY, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: t.shadow, transition: 'opacity .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <X size={13} /> Close Record
          </button>
        </CModalFooter>
      </CModal>

      {/* ── Image Lightbox ── */}
      {!!preview && (
        <CModal visible={!!preview} onClose={() => setPreview(null)} size="lg">
          <CModalHeader style={{ backgroundColor: PRIMARY, padding: '14px 20px', border: 'none' }}>
            <CModalTitle style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Image Preview</CModalTitle>
          </CModalHeader>
          <CModalBody style={{ backgroundColor: '#0d0d0d', textAlign: 'center', padding: 20 }}>
            <img src={preview} alt="preview" style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: t.radiusSm }} />
          </CModalBody>
          <CModalFooter style={{ backgroundColor: '#0d0d0d', border: 'none', justifyContent: 'center' }}>
            <button onClick={() => setPreview(null)} style={{
              backgroundColor: '#fff', color: t.text, border: 'none', borderRadius: t.radiusSm,
              padding: '8px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 13,
            }}>
              Close
            </button>
          </CModalFooter>
        </CModal>
      )}
    </>
  )
}