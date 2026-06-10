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
import { FileText, X, ZoomIn, ExternalLink, ChevronDown, ChevronUp, MessageSquare } from "lucide-react"
import { BASE_URL } from "../../API/BaseUrl"

/* ─── Design tokens — matches AppointmentDetails / DoctorDetailsPage ─── */
const PRIMARY = '#1B4F8A'
const PRIMARY_DARK = '#143d6e'
const t = {
  primary: PRIMARY,
  primaryDark: PRIMARY_DARK,
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  surface: '#f8fafc',
  surfaceAlt: '#f1f5f9',
  border: '#e2e8f0',
  danger: '#dc2626',
  success: '#16a34a',
  warning: '#d97706',
  radius: '10px',
  radiusSm: '6px',
  shadow: '0 1px 3px rgba(0,0,0,0.07)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
  shadowLg: '0 8px 24px rgba(0,0,0,0.10)',
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

const isImgField = (key, val) => {
  if (typeof val !== "string" || !val) return false;
  if (isImgString(val)) return true;
  const k = key.toLowerCase();
  if (k.includes("image") || k.includes("photo") || k === "partimage" || val.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i)) {
    return true;
  }
  return false;
}

const resolveImg = (img) => {
  if (!img) return null
  if (img.startsWith("http") || img.startsWith("blob:") || img.startsWith("data:")) return img
  const isBase64 = img.startsWith("/9j/") || img.startsWith("iVBOR") || img.startsWith("R0lGOD") || img.startsWith("data:image");
  if (isBase64) {
    if (img.startsWith("iVBOR")) return `data:image/png;base64,${img}`
    return `data:image/jpeg;base64,${img}`
  }
  return `${BASE_URL}/viewFile/${img}`
}

const getPreviewType = (url) => {
  if (!url) return null;
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.match(/\.(mp4|webm|mov|ogg)$/i) || lowerUrl.includes("video") || lowerUrl.includes("voice") || lowerUrl.includes("record")) return "video";
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) return "youtube";
  return "image";
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return "";
  let videoId = "";
  try {
    if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get("v") || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtube.com/shorts/")) {
      videoId = url.split("youtube.com/shorts/")[1]?.split("?")[0] || "";
    }
  } catch (e) {
    console.error("Error parsing youtube embed url", e);
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

const getYouTubeThumbnail = (url) => {
  if (!url) return "";
  let videoId = "";
  try {
    if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get("v") || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtube.com/shorts/")) {
      videoId = url.split("youtube.com/shorts/")[1]?.split("?")[0] || "";
    }
  } catch (e) {
    console.error("Error parsing youtube thumbnail url", e);
  }
  return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : "";
};

const HIDDEN = ["payment", "paymentinfo", "amount", "paidamount", "balanceamount",
  "totalamount", "discount", "price", "fee", "cost"]
const shouldHide = (key) => { const k = key?.toLowerCase(); return HIDDEN.some(h => k?.includes(h)) }

/* ─── Section config ─── */
const SECTION_CFG = {
  "Main Details": { color: PRIMARY, icon: '🏥' },
  "Patient Info": { color: '#0e7490', icon: '👤' },
  "Complaints": { color: '#b91c1c', icon: '📋' },
  "Reports": { color: '#1d4ed8', icon: '📊' },
  "Assessment": { color: '#15803d', icon: '🔍' },
  "Diagnosis": { color: '#92400e', icon: '🩺' },
  "Treatment Plan": { color: '#7c3aed', icon: '💊' },
  "Home Exercise": { color: '#065f46', icon: '🏃' },
  "Questions": { color: '#6d28d9', icon: '❓' },
  "Exercise Plan": { color: '#0369a1', icon: '📝' },
  "Follow Up": { color: '#b45309', icon: '📅' },
  "Home Advice": { color: '#166534', icon: '🏠' },
}

/* ─── Status badge ─── */
const StatusBadge = ({ value }) => {
  const v = String(value).toLowerCase()
  const map = {
    completed: { bg: '#dcfce7', color: t.success, dot: t.success },
    active: { bg: '#dbeafe', color: PRIMARY, dot: PRIMARY },
    pending: { bg: '#fef3c7', color: t.warning, dot: t.warning },
    cancelled: { bg: '#fee2e2', color: t.danger, dot: t.danger },
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
          {index != null && (
            <span style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              backgroundColor: `${accentColor}15`, color: accentColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
            }}>
              {index + 1}
            </span>
          )}
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

/* ─── Section card with accent heading — now collapsible ─── */
const SectionCard = ({
  title,
  children,
  openSection,
  setOpenSection,
}) => {
  const cfg = SECTION_CFG[title] || { color: PRIMARY, icon: '●' }

  const isMain = title === "Main Details"
  const open = isMain || openSection === title

  const handleToggle = () => {
    if (isMain) return

    setOpenSection(prev => prev === title ? null : title)
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={handleToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          cursor: isMain ? 'default' : 'pointer',
          textAlign: 'left',

          marginBottom: open ? 4 : 0,
          borderBottom: open ? `1px solid ${t.border}` : 'none',
        }}
      >
        <span style={{
          width: 30,
          height: 30,
          borderRadius: '8px',
          flexShrink: 0,
          backgroundColor: `${cfg.color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
        }}>
          {cfg.icon}
        </span>

        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: cfg.color,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          flex: 1,
        }}>
          {title}
        </span>

        {!isMain && (
          open
            ? <ChevronUp size={15} color={t.textMuted} />
            : <ChevronDown size={15} color={t.textMuted} />
        )}
      </button>

      {open && (
        <div style={{ paddingTop: 8 }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function PatientViewModal({ visible, data, onClose }) {
  const [preview, setPreview] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [openSection, setOpenSection] = useState(null)
  const record = data
  if (!record) return null
  // Debug: log the full record to see all keys available
  console.log('[PatientViewModal] record keys:', Object.keys(record))
  console.log('[PatientViewModal] record:', record)

  /* ── Detect all question/answer arrays in the record automatically ── */
  const KNOWN_SECTIONS = new Set([
    'patientInfo', 'complaints', 'reports', 'assessment', 'diagnosis',
    'treatmentPlan', 'exercisePlan', 'followUp', 'homeAdvice',
    'therapistRecordId', 'bookingId', 'clinicId', 'branchId',
    'overallStatus', 'createdAt', 'updatedAt',
  ])
  const QA_KEYS = ['question', 'questiontext', 'answer', 'response', 'therapyanswer']
  const isQAArray = (arr) =>
    Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'object' &&
    Object.keys(arr[0]).some(k => QA_KEYS.includes(k.toLowerCase()))

  // Collect all QA-style arrays from the record (by any field name)
  const qaArrays = Object.entries(record)
    .filter(([k, v]) => !KNOWN_SECTIONS.has(k) && isQAArray(v))
    .map(([k, v]) => ({ key: k, items: v }))

  /* ── renderField ── */
  const renderField = (key, val, i) => {
    if (!key || shouldHide(key)) return null
    if (val === null || val === undefined || val === "") return null

    // MEDIA (Image, Video, URL, PDF, S3 Key)
    if (typeof val === 'string') {
      let resolved = val
      try {
        if (!resolved.startsWith('http') && !resolved.startsWith('data:') && !resolved.startsWith('/')) {
          const dec = atob(resolved)
          if (dec.startsWith('http://') || dec.startsWith('https://')) resolved = dec
        }
      } catch { }

      const isUrl = resolved.startsWith('http://') || resolved.startsWith('https://') || resolved.startsWith('www.')
      const isBase64Img = isImgString(resolved)

      const fieldLower = (key || '').toLowerCase()
      const isMediaKey = (fieldLower.includes('image') || fieldLower.includes('video') ||
        fieldLower.includes('photo') || fieldLower.includes('media') ||
        fieldLower.includes('url') || fieldLower.includes('link') ||
        fieldLower.includes('file') || fieldLower.includes('pdf') ||
        fieldLower.includes('thumbnail') || fieldLower.includes('attachment') ||
        fieldLower.includes('record') || fieldLower.includes('audio')) && !fieldLower.endsWith('id')

      const hasKnownExt = /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|ogg|mp3|wav|pdf)$/i.test(resolved)
      const isS3Key = !isUrl && !isBase64Img && resolved.length > 8 &&
        !resolved.includes(' ') && (isMediaKey || hasKnownExt)

      if (isUrl || isBase64Img || isS3Key) {
        let finalUrl = resolved
        if (isBase64Img) finalUrl = resolveImg(resolved)
        else if (isS3Key && !isUrl) finalUrl = `${BASE_URL}/viewFile/${resolved}`

        const type = getPreviewType(finalUrl)
        const isPdf = /\.pdf(\?|$)/i.test(finalUrl) || fieldLower.includes('pdf')
        const previewType = isPdf ? 'pdf' : type
        const isYT = previewType === 'youtube'
        const isVid = previewType === 'video'
        const isImg2 = previewType === 'image' || isBase64Img

        const thumbnail = isYT
          ? getYouTubeThumbnail(finalUrl)
          : isImg2 ? finalUrl : null

        const typeColor = isPdf ? '#dc2626' : isYT ? '#ff0000' : isVid ? '#7c3aed' : isUrl ? '#0ea5e9' : '#16a34a'
        const typeBg = isPdf ? '#fee2e2' : isYT ? '#fee2e2' : isVid ? '#f3f0ff' : isUrl ? '#e0f2fe' : '#dcfce7'
        const typeLabel = isPdf ? '📄 PDF' : isYT ? '▶ YouTube' : isVid ? '🎬 Video' : isImg2 ? '🖼 Image' : '🔗 Link'

        const handleClick = () => {
          if (isPdf || (!isYT && !isVid && !isImg2)) {
            window.open(finalUrl, '_blank')
          } else {
            setMediaPreview({ url: finalUrl, type: previewType })
          }
        }

        return (
          <CCol xs={12} sm={6} md={4} key={i} className="mb-3">
            <Tile label={labelify(key)}>
              <div style={{
                borderRadius: 10, overflow: 'hidden',
                border: `1px solid ${t.border}`,
                backgroundColor: '#fff',
                boxShadow: t.shadow,
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                marginTop: 6
              }}
                onClick={handleClick}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = t.shadowMd }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = t.shadow }}
              >
                <div style={{
                  width: '100%', height: 110, backgroundColor: isPdf ? '#fff1f2' : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {thumbnail && !isPdf ? (
                    <img src={thumbnail} alt={labelify(key)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div style={{ fontSize: 32, opacity: 0.4 }}>
                      {isPdf ? '📄' : isVid ? '🎬' : '🔗'}
                    </div>
                  )}
                  {(isVid || isYT) && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.35)',
                    }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 16, marginLeft: 3 }}>▶</span>
                      </div>
                    </div>
                  )}
                  {isImg2 && !isVid && !isYT && !isPdf && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0)', transition: 'background 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; const i = e.currentTarget.querySelector('.zoom-icon'); if (i) i.style.opacity = '1' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; const i = e.currentTarget.querySelector('.zoom-icon'); if (i) i.style.opacity = '0' }}
                    >
                      <ZoomIn className="zoom-icon" size={22} color="#fff" style={{ opacity: 0, transition: 'opacity 0.2s' }} />
                    </div>
                  )}
                </div>
                <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 10, fontWeight: 700, color: typeColor,
                    backgroundColor: typeBg, borderRadius: 20,
                    padding: '2px 8px', border: `1px solid ${typeColor}30`,
                  }}>{typeLabel}</span>
                  <ExternalLink size={11} color={t.textMuted}
                    onClick={e => { e.stopPropagation(); window.open(finalUrl, '_blank') }}
                    style={{ cursor: 'pointer', opacity: 0.6 }}
                  />
                </div>
              </div>
            </Tile>
          </CCol>
        )
      }
    }

    // ARRAY
    if (Array.isArray(val)) {
      if (!val.length) return null

      // Check if items are URL strings (images / PDFs / videos)
      const allStrings = val.every(item => typeof item === 'string')
      const hasUrls = allStrings && val.some(item =>
        item.startsWith('http://') || item.startsWith('https://')
      )

      if (hasUrls) {
        return (
          <CCol md={12} key={i} className="mb-3">
            <div style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                {labelify(key)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                {val.map((url, idx) => {
                  if (typeof url !== 'string') return null
                  const isPdf = /\.pdf(\?|$)/i.test(url)
                  const isVid = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url)
                  const isImg = !isPdf && !isVid && /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url)
                  // fallback: if none matched but it's a URL, treat as image
                  const treatAsImg = isImg || (!isPdf && !isVid)

                  const type = isPdf ? 'pdf' : isVid ? 'video' : 'image'
                  const typeLabel = isPdf ? '📄 PDF' : isVid ? '🎬 Video' : '🖼 Image'
                  const typeColor = isPdf ? '#dc2626' : isVid ? '#7c3aed' : '#0ea5e9'
                  const typeBg = isPdf ? '#fee2e2' : isVid ? '#f3f0ff' : '#e0f2fe'

                  const handleClick = () => {
                    if (isPdf) {
                      window.open(url, '_blank')
                    } else {
                      setMediaPreview({ url, type })
                    }
                  }

                  return (
                    <div
                      key={idx}
                      onClick={handleClick}
                      style={{
                        borderRadius: 10, overflow: 'hidden',
                        border: `1px solid ${t.border}`,
                        backgroundColor: '#fff',
                        boxShadow: t.shadow,
                        cursor: 'pointer',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = t.shadowMd }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = t.shadow }}
                    >
                      {/* Thumbnail area */}
                      <div style={{
                        width: '100%', height: 100,
                        backgroundColor: isPdf ? '#fff1f2' : '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden',
                      }}>
                        {treatAsImg && !isPdf ? (
                          <img
                            src={url}
                            alt={`${key}-${idx}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => {
                              e.target.style.display = 'none'
                              e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className="fallback-icon" style={{
                          display: isPdf || isVid ? 'flex' : 'none',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: 36, width: '100%', height: '100%',
                          position: isPdf || isVid ? 'relative' : 'absolute',
                        }}>
                          {isPdf ? '📄' : '🎬'}
                        </div>
                        {isVid && (
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,0,0,0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: 'rgba(255,255,255,0.9)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <span style={{ fontSize: 14, marginLeft: 3 }}>▶</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          fontSize: 10, fontWeight: 700, color: typeColor,
                          backgroundColor: typeBg, borderRadius: 20,
                          padding: '2px 8px', border: `1px solid ${typeColor}30`,
                        }}>{typeLabel}</span>
                        <ExternalLink
                          size={11} color={t.textMuted}
                          onClick={e => { e.stopPropagation(); window.open(url, '_blank') }}
                          style={{ cursor: 'pointer', opacity: 0.6 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CCol>
        )
      }

      // QA-style array? Render as accordions instead of chips
      const QA_DETECT = ['question', 'questiontext', 'questionname', 'answer', 'response', 'therapyanswer', 'answertext']
      const isQAItems = val.some(item =>
        typeof item === 'object' && item !== null &&
        Object.keys(item).some(k => QA_DETECT.includes(k.toLowerCase()))
      )
      if (isQAItems) {
        const accentColor = SECTION_CFG['Questions'].color
        return (
          <CCol md={12} key={i} className="mb-3">
            <Accordion title={labelify(key)} accentColor={accentColor}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {val.map((item, idx) => {
                  if (typeof item !== 'object' || item === null) return null
                  const qText = item?.questionText || item?.question || item?.questionName || item?.title || `Question ${idx + 1}`
                  const ans = item?.answer || item?.response || item?.therapyAnswer || item?.answerText
                  const extras = Object.entries(item).filter(([k]) => {
                    const kl = k.toLowerCase()
                    return !QA_DETECT.includes(kl) && !['title', 'questionname', 'questionkey'].includes(kl) && kl !== 'id'
                  })
                  return (
                    <div key={idx} style={{
                      backgroundColor: `${accentColor}05`,
                      border: `1px solid ${accentColor}20`,
                      borderRadius: t.radiusSm,
                      padding: '12px 16px',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: ans ? 6 : 0 }}>
                        {qText}
                      </div>
                      {ans ? (
                        <div style={{ fontSize: 14, color: accentColor, fontWeight: 700 }}>
                          <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, marginRight: 6, textTransform: 'uppercase' }}>Ans:</span>
                          {ans}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: t.textMuted, fontStyle: 'italic' }}>No answer recorded</div>
                      )}
                      {extras.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${accentColor}15` }}>
                          {extras.map(([k, v], ei) => (
                            <span key={ei} style={{ fontSize: 11, backgroundColor: '#fff', border: `1px solid ${t.border}`, borderRadius: 4, padding: '2px 6px', color: t.textMuted }}>
                              <strong>{labelify(k)}:</strong> {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Accordion>
          </CCol>
        )
      }

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
    const isId = key?.toLowerCase().includes('id')
    const isDate = ['createdat', 'updatedat', 'date', 'time'].some(s => key?.toLowerCase().includes(s))

    return (
      <CCol xs={12} sm={6} md={4} key={i} className="mb-3">
        <Tile label={labelify(key)}>
          {isStatus ? (
            <StatusBadge value={display} />
          ) : (
            <div style={{
              fontSize: isId ? 11 : 13,
              color: isId || isDate ? t.textMuted : t.text,
              fontWeight: isId ? 500 : 600,

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
      <SectionCard
        title={title}
        openSection={openSection}
        setOpenSection={setOpenSection}
      >
        <CRow className="g-2">{fields}</CRow>
      </SectionCard>
    )
  }

  /* ── Therapy Answers accordion ── */
  const renderTherapyAnswer = (item, index) => {
    const accentColor = SECTION_CFG['Questions'].color
    const questionText = item?.questionText || item?.question || item?.title || `Question ${index + 1}`
    const answer = item?.answer || item?.response || item?.therapyAnswer
    const extraFields = Object.entries(item).filter(([k]) => {
      const kl = k.toLowerCase()
      return !['questiontext', 'question', 'title', 'answer', 'response', 'therapyanswer', 'id'].includes(kl)
    })
    return (
      <Accordion key={index} title={questionText} index={index} accentColor={accentColor}>
        {answer && (
          <div style={{
            backgroundColor: `${accentColor}08`,
            border: `1px solid ${accentColor}20`,
            borderRadius: t.radiusSm,
            padding: '10px 14px',
            marginBottom: extraFields.length ? 10 : 0,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Answer
            </div>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 500, lineHeight: 1.5 }}>{answer}</div>
          </div>
        )}
        {extraFields.length > 0 && (
          <CRow className="g-2">
            {extraFields.map(([k, v], i) => renderField(k, v, `therapy-${index}-${i}`))}
          </CRow>
        )}
      </Accordion>
    )
  }

  /* ── Exercise item (rich media-aware cards) ── */
  const renderExerciseItem = (item, index) => {
    const cfg = SECTION_CFG['Home Exercise']

    // Separate media fields from regular scalar fields
    const mediaFields = []
    const scalarFields = []

    Object.entries(item).forEach(([k, v]) => {
      const field = k.toLowerCase()
      if (!k || shouldHide(k) || v === null || v === undefined || v === '') return
      if (field === 'exercisename' || field === 'name') return // shown in accordion header
      if (typeof v !== 'string') {
        scalarFields.push([k, v])
        return
      }

      // Attempt base64-encoded URL decode
      let resolved = v
      try {
        if (!resolved.startsWith('http') && !resolved.startsWith('data:') && !resolved.startsWith('/')) {
          const dec = atob(resolved)
          if (dec.startsWith('http://') || dec.startsWith('https://')) resolved = dec
        }
      } catch { }

      const isUrl = resolved.startsWith('http://') || resolved.startsWith('https://') || resolved.startsWith('www.')
      const isBase64Img = isImgString(resolved)

      // Detect if this field is a known media/file field by key name
      const fieldLower = k.toLowerCase()
      const isMediaKey = fieldLower.includes('image') || fieldLower.includes('video') ||
        fieldLower.includes('photo') || fieldLower.includes('media') ||
        fieldLower.includes('url') || fieldLower.includes('link') ||
        fieldLower.includes('file') || fieldLower.includes('pdf') ||
        fieldLower.includes('thumbnail') || fieldLower.includes('attachment') ||
        fieldLower.includes('record') || fieldLower.includes('audio')

      // S3 key: no space, looks like a file path with a known extension, or is a media field name
      const hasKnownExt = /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|ogg|mp3|wav|pdf)$/i.test(resolved)
      const isS3Key = !isUrl && !isBase64Img && resolved.length > 8 &&
        !resolved.includes(' ') && (isMediaKey || hasKnownExt)

      if (isUrl || isBase64Img || isS3Key) {
        mediaFields.push({ key: k, resolved, isUrl, isBase64Img, isS3Key })
      } else {
        scalarFields.push([k, v])
      }
    })

    return (
      <Accordion key={index} title={item?.exerciseName || item?.name || `Exercise ${index + 1}`} index={index} accentColor={cfg.color}>
        {/* ── Media Gallery ── */}
        {mediaFields.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase',
              letterSpacing: '0.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 3, height: 14, background: cfg.color, borderRadius: 2, display: 'inline-block' }} />
              Media & Resources
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {mediaFields.map(({ key: k, resolved, isUrl, isBase64Img, isS3Key }, mi) => {
                let label = labelify(k)
                try { label = labelify(atob(k)) } catch { }

                // Resolve final URL
                let finalUrl = resolved
                if (isBase64Img) finalUrl = resolveImg(resolved)
                else if (isS3Key && !isUrl) finalUrl = `${BASE_URL}/viewFile/${resolved}`

                const type = getPreviewType(finalUrl)
                const isYT = type === 'youtube'
                const isVid = type === 'video'
                const isImg2 = type === 'image' || isBase64Img

                const thumbnail = isYT
                  ? getYouTubeThumbnail(finalUrl)
                  : isImg2 ? finalUrl : null

                const typeColor = isYT ? '#ff0000' : isVid ? '#7c3aed' : isUrl ? '#0ea5e9' : '#16a34a'
                const typeBg = isYT ? '#fee2e2' : isVid ? '#f3f0ff' : isUrl ? '#e0f2fe' : '#dcfce7'
                const typeLabel = isYT ? '▶ YouTube' : isVid ? '🎬 Video' : isImg2 ? '🖼 Image' : '🔗 Link'

                return (
                  <div key={`media-${index}-${mi}`} style={{
                    borderRadius: 10, overflow: 'hidden',
                    border: `1px solid ${t.border}`,
                    backgroundColor: '#fff',
                    boxShadow: t.shadow,
                    cursor: 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                    onClick={() => setMediaPreview({ url: finalUrl, type })}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = t.shadowMd }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = t.shadow }}
                  >
                    {/* Thumbnail / Placeholder */}
                    <div style={{
                      width: '100%', height: 100, backgroundColor: '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      {thumbnail ? (
                        <img src={thumbnail} alt={label}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div style={{ fontSize: 32, opacity: 0.4 }}>
                          {isVid ? '🎬' : '🔗'}
                        </div>
                      )}
                      {/* Play overlay for videos/youtube */}
                      {(isVid || isYT) && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(0,0,0,0.35)',
                        }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: 16, marginLeft: 3 }}>▶</span>
                          </div>
                        </div>
                      )}
                      {/* Image zoom overlay */}
                      {isImg2 && !isVid && !isYT && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(0,0,0,0)', transition: 'background 0.2s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; const i = e.currentTarget.querySelector('.zoom-icon'); if (i) i.style.opacity = '1' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; const i = e.currentTarget.querySelector('.zoom-icon'); if (i) i.style.opacity = '0' }}
                        >
                          <ZoomIn className="zoom-icon" size={22} color="#fff" style={{ opacity: 0, transition: 'opacity 0.2s' }} />
                        </div>
                      )}
                    </div>

                    {/* Card footer */}
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {label}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          fontSize: 10, fontWeight: 700, color: typeColor,
                          backgroundColor: typeBg, borderRadius: 20,
                          padding: '2px 8px', border: `1px solid ${typeColor}30`,
                        }}>{typeLabel}</span>
                        <ExternalLink size={11} color={t.textMuted}
                          onClick={e => { e.stopPropagation(); window.open(finalUrl, '_blank') }}
                          style={{ cursor: 'pointer', opacity: 0.6 }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Scalar Info Fields ── */}
        {scalarFields.length > 0 && (
          <CRow className="g-2">
            {scalarFields.map(([k, v], i) => renderField(k, v, `${index}-scalar-${i}`))}
          </CRow>
        )}
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
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1, letterSpacing: '0.04em' }}>
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
            {
              title: 'Main Details', obj: {
                therapistRecordId: record?.therapistRecordId,
                bookingId: record?.bookingId,
                clinicId: record?.clinicId,
                branchId: record?.branchId,
                overallStatus: record?.overallStatus,
                createdAt: record?.createdAt,
                updatedAt: record?.updatedAt,
              }
            },
            { title: 'Patient Info', obj: record?.patientInfo },
            { title: 'Complaints', obj: record?.complaints },
            { title: 'Reports', obj: record?.reports },
            { title: 'Assessment', obj: record?.assessment },
            { title: 'Diagnosis', obj: record?.diagnosis },
            { title: 'Treatment Plan', obj: record?.treatmentPlan },
          ].map(({ title, obj }) => {
            if (!obj) return null
            const fields = Object.entries(obj).map(([k, v], i) => renderField(k, v, i))
            if (!fields.some(Boolean)) return null
            return (
              <div key={title} style={{ backgroundColor: '#fff', borderRadius: t.radius, border: `1px solid ${t.border}`, padding: '16px 18px', marginBottom: 12, boxShadow: t.shadow }}>
                <SectionCard title={title} openSection={openSection}
                  setOpenSection={setOpenSection}>
                  <CRow className="g-2">{fields}</CRow>
                </SectionCard>
              </div>
            )
          })}

          {/* Home Exercises */}
          {(record?.exercisePlan?.exercises?.length > 0 || record?.exercisePlan?.homeExercises?.length > 0) && (() => {
            const exercisesList = record?.exercisePlan?.exercises?.length > 0
              ? record.exercisePlan.exercises
              : record.exercisePlan.homeExercises;
            return (
              <div style={{ backgroundColor: '#fff', borderRadius: t.radius, border: `1px solid ${t.border}`, padding: '16px 18px', marginBottom: 12, boxShadow: t.shadow }}>
                <SectionCard title="Home Exercise" openSection={openSection}
                  setOpenSection={setOpenSection}>
                  {exercisesList.map((item, index) => renderExerciseItem(item, index))}
                </SectionCard>
              </div>
            )
          })()}

          {/* Questions / Therapy Answers — auto-discovered from any array field */}
          {qaArrays.length > 0 && qaArrays.map(({ key, items }) => (
            <div key={key} style={{ backgroundColor: '#fff', borderRadius: t.radius, border: `1px solid ${t.border}`, padding: '16px 18px', marginBottom: 12, boxShadow: t.shadow }}>
              <SectionCard title="Questions" openSection={openSection}
                setOpenSection={setOpenSection}>
                <Accordion title={labelify(key)} accentColor={SECTION_CFG['Questions'].color}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {items.map((item, index) => {
                      const qText = item?.questionText || item?.question || item?.title || item?.questionName || `Question ${index + 1}`
                      const ans = item?.answer || item?.response || item?.therapyAnswer || item?.answerText
                      const accentColor = SECTION_CFG['Questions'].color
                      const extras = Object.entries(item).filter(([k]) => {
                        const kl = k.toLowerCase()
                        return !['questiontext', 'question', 'title', 'questionname', 'answer', 'response', 'therapyanswer', 'answertext', 'questionkey'].includes(kl) && kl !== 'id'
                      })
                      return (
                        <div key={index} style={{
                          backgroundColor: `${accentColor}05`,
                          border: `1px solid ${accentColor}20`,
                          borderRadius: t.radiusSm,
                          padding: '12px 16px',
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: ans ? 6 : 0 }}>
                            {qText}
                          </div>
                          {ans ? (
                            <div style={{ fontSize: 14, color: accentColor, fontWeight: 700 }}>
                              <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, marginRight: 6, textTransform: 'uppercase' }}>Ans:</span>
                              {ans}
                            </div>
                          ) : (
                            <div style={{ fontSize: 12, color: t.textMuted, fontStyle: 'italic' }}>No answer recorded</div>
                          )}
                          {extras.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${accentColor}15` }}>
                              {extras.map(([k, v], ei) => (
                                <span key={ei} style={{ fontSize: 11, backgroundColor: '#fff', border: `1px solid ${t.border}`, borderRadius: 4, padding: '2px 6px', color: t.textMuted }}>
                                  <strong>{labelify(k)}:</strong> {v}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Accordion>
              </SectionCard>
            </div>
          ))}

          {/* Fallback: also check record.questions and record.therapyAnswers explicitly */}
          {qaArrays.length === 0 && (record?.questions?.length > 0 || record?.therapyAnswers?.length > 0) && (
            <div style={{ backgroundColor: '#fff', borderRadius: t.radius, border: `1px solid ${t.border}`, padding: '16px 18px', marginBottom: 12, boxShadow: t.shadow }}>
              <SectionCard title="Questions"    >
                <Accordion title="Therapy Answers" accentColor={SECTION_CFG['Questions'].color} >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(record?.therapyAnswers || record?.questions || []).map((item, index) => {
                      const qText = item?.questionText || item?.question || item?.title || `Question ${index + 1}`
                      const ans = item?.answer || item?.response || item?.therapyAnswer
                      const accentColor = SECTION_CFG['Questions'].color
                      const extras = Object.entries(item).filter(([k]) => {
                        const kl = k.toLowerCase()
                        return !['questiontext', 'question', 'title', 'answer', 'response', 'therapyanswer', 'questionkey'].includes(kl) && kl !== 'id'
                      })
                      return (
                        <div key={index} style={{
                          backgroundColor: `${accentColor}05`,
                          border: `1px solid ${accentColor}20`,
                          borderRadius: t.radiusSm,
                          padding: '12px 16px',
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: ans ? 6 : 0 }}>
                            {qText}
                          </div>
                          {ans ? (
                            <div style={{ fontSize: 14, color: accentColor, fontWeight: 700 }}>
                              <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, marginRight: 6, textTransform: 'uppercase' }}>Ans:</span>
                              {ans}
                            </div>
                          ) : (
                            <div style={{ fontSize: 12, color: t.textMuted, fontStyle: 'italic' }}>No answer recorded</div>
                          )}
                          {extras.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${accentColor}15` }}>
                              {extras.map(([k, v], ei) => (
                                <span key={ei} style={{ fontSize: 11, backgroundColor: '#fff', border: `1px solid ${t.border}`, borderRadius: 4, padding: '2px 6px', color: t.textMuted }}>
                                  <strong>{labelify(k)}:</strong> {v}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Accordion>
              </SectionCard>
            </div>
          )}

          {/* Exercise Plan (non-exercises fields) */}
          {record?.exercisePlan && (() => {
            const obj = Object.fromEntries(Object.entries(record.exercisePlan).filter(([k]) => k !== 'exercises' && k !== 'homeExercises'))
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
                <SectionCard title="Follow Up" openSection={openSection}
                  setOpenSection={setOpenSection}>
                  <CRow className="g-2">{fields}</CRow>
                </SectionCard>
              </div>
            )
          })()}

          {/* Home Advice */}
          {record?.homeAdvice && (
            <div style={{ backgroundColor: '#fff', borderRadius: t.radius, border: `1px solid ${t.border}`, padding: '16px 18px', marginBottom: 12, boxShadow: t.shadow }}>
              <SectionCard title="Home Advice" openSection={openSection}
                setOpenSection={setOpenSection}>
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

      {/* ── Image Lightbox (legacy) ── */}
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

      {/* ── Universal Media Lightbox ── */}
      {!!mediaPreview && (
        <CModal visible={!!mediaPreview} onClose={() => setMediaPreview(null)} size="xl" alignment="center">
          <CModalHeader style={{ backgroundColor: '#0f172a', padding: '12px 20px', border: 'none' }}>
            <CModalTitle style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              {mediaPreview.type === 'youtube' && <span style={{ color: '#ff4444' }}>▶ YouTube</span>}
              {mediaPreview.type === 'video' && <span style={{ color: '#a78bfa' }}>🎬 Video</span>}
              {mediaPreview.type === 'image' && <span style={{ color: '#38bdf8' }}>🖼 Image</span>}
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 400 }}>Preview</span>
            </CModalTitle>
          </CModalHeader>
          <CModalBody style={{ backgroundColor: '#0f172a', textAlign: 'center', padding: '20px' }}>
            {mediaPreview.type === 'youtube' && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 10, overflow: 'hidden' }}>
                <iframe
                  src={getYouTubeEmbedUrl(mediaPreview.url)}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube Preview"
                />
              </div>
            )}
            {mediaPreview.type === 'video' && (
              <video
                key={mediaPreview.url}
                src={mediaPreview.url}
                controls
                autoPlay
                style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 10, background: '#000' }}
              />
            )}
            {mediaPreview.type === 'image' && (
              <img
                src={mediaPreview.url}
                alt="preview"
                style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 10 }}
              />
            )}
          </CModalBody>
          <CModalFooter style={{ backgroundColor: '#0f172a', border: 'none', justifyContent: 'space-between', padding: '12px 20px' }}>
            <button
              onClick={() => window.open(mediaPreview.url, '_blank')}
              style={{
                backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155',
                borderRadius: t.radiusSm, padding: '7px 16px', fontWeight: 600, cursor: 'pointer',
                fontSize: 12, display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <ExternalLink size={12} /> Open in New Tab
            </button>
            <button
              onClick={() => setMediaPreview(null)}
              style={{
                backgroundColor: '#fff', color: '#0f172a', border: 'none',
                borderRadius: t.radiusSm, padding: '7px 22px', fontWeight: 700,
                cursor: 'pointer', fontSize: 13,
              }}
            >
              Close
            </button>
          </CModalFooter>
        </CModal>
      )}
    </>
  )
}