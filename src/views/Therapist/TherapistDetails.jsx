import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import capitalizeWords from '../../Utils/capitalizeWords'
import { ArrowLeft, Phone, User, Calendar, GraduationCap, Briefcase, Clock, Globe, FileText, Star, Activity } from 'lucide-react'

/* ─── Design tokens ─── */
const PRIMARY = '#1B4F8A'
const t = {
  primary:   PRIMARY,
  text:      '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  surface:   '#f8fafc',
  border:    '#e2e8f0',
  danger:    '#dc2626',
  success:   '#16a34a',
  radius:    '10px',
  radiusSm:  '6px',
  shadow:    '0 1px 3px rgba(0,0,0,0.07)',
  shadowMd:  '0 4px 12px rgba(0,0,0,0.08)',
}

/* ─── Primitives ─── */

const SectionCard = ({ icon: Icon, title, children, style = {} }) => (
  <div style={{
    backgroundColor: '#fff',
    borderRadius: t.radius,
    border: `1px solid ${t.border}`,
    overflow: 'hidden',
    boxShadow: t.shadow,
    ...style,
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '12px 18px',
      borderBottom: `1px solid ${t.border}`,
      backgroundColor: t.surface,
    }}>
      {Icon && (
        <span style={{
          width: '26px', height: '26px', borderRadius: '6px',
          backgroundColor: PRIMARY, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={13} color="#fff" />
        </span>
      )}
      <span style={{ fontSize: '12px', fontWeight: '700', color: t.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </span>
    </div>
    <div style={{ padding: '16px 18px' }}>{children}</div>
  </div>
)

const InfoRow = ({ label, value }) => (
  <div style={{ marginBottom: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
    <span style={{ fontSize: '11px', fontWeight: '700', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: '110px', paddingTop: '1px' }}>
      {label}
    </span>
    <span style={{ fontSize: '13px', color: t.text, fontWeight: '500', flex: 1 }}>
      {value || '—'}
    </span>
  </div>
)

const Tag = ({ label, variant = 'default' }) => {
  const styles = {
    default: { bg: '#eff6ff', color: PRIMARY, border: `1px solid ${PRIMARY}30` },
    muted:   { bg: t.surface, color: t.textMuted, border: `1px solid ${t.border}` },
    success: { bg: '#dcfce7', color: t.success, border: '1px solid #86efac' },
  }
  const s = styles[variant] || styles.default
  return (
    <span style={{
      fontSize: '11px', fontWeight: '600', padding: '4px 12px',
      borderRadius: '20px', backgroundColor: s.bg, color: s.color, border: s.border,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

const DocBtn = ({ label, base64, mimeType = 'application/pdf' }) => (
  <div>
    <div style={{ fontSize: '11px', fontWeight: '700', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
      {label}
    </div>
    {base64 ? (
      <button
        onClick={() => window.open(`data:${mimeType};base64,${base64}`)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 16px', borderRadius: t.radiusSm, border: `1px solid ${PRIMARY}`,
          backgroundColor: '#eff6ff', color: PRIMARY, fontSize: '12px',
          fontWeight: '600', cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.color = PRIMARY }}
      >
        <FileText size={13} /> View PDF
      </button>
    ) : (
      <span style={{ fontSize: '12px', color: t.textMuted, fontStyle: 'italic' }}>Not uploaded</span>
    )}
  </div>
)

/* ═══════════════════════════════════════════════════════════════════ */

export default function TherapistDetails() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state

  if (!data) return (
    <div style={{ textAlign: 'center', padding: '60px', color: t.textMuted, fontSize: '14px' }}>
      No therapist data found.
    </div>
  )

  const formatDay = (d) => d ? d.charAt(0).toUpperCase() + d.slice(1) : ''

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '20px', color: t.text }}>

      {/* ── Top Header Bar ── */}
      <div style={{
        backgroundColor: PRIMARY,
        borderRadius: t.radius,
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        boxShadow: t.shadowMd,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px',
              width: '30px', height: '30px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0,
            }}
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>THERAPIST PROFILE</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{data.fullName}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px', fontWeight: '700', padding: '4px 12px',
            borderRadius: '20px', backgroundColor: '#dcfce7', color: t.success,
            border: '1px solid #86efac',
          }}>
            {capitalizeWords(data.role || 'Therapist')}
          </span>
          <span style={{
            fontSize: '11px', fontWeight: '600', padding: '4px 12px',
            borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff',
          }}>
            {data.yearsOfExperience} yrs exp
          </span>
        </div>
      </div>

      {/* ── Profile Hero ── */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: t.radius,
        border: `1px solid ${t.border}`,
        padding: '20px 24px',
        marginBottom: '14px',
        boxShadow: t.shadow,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={
              data.documents?.profilePhoto
                ? `data:image/jpeg;base64,${data.documents.profilePhoto}`
                : '/assets/images/default-avatar.png'
            }
            alt={data.fullName}
            style={{
              width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover',
              border: `3px solid ${PRIMARY}`, boxShadow: t.shadowMd,
            }}
          />
          <span style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '20px', height: '20px', borderRadius: '50%',
            backgroundColor: t.success, border: '2px solid #fff',
          }} />
        </div>

        {/* Name & meta */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: t.text, marginBottom: '4px' }}>
            {data.fullName}
          </div>
          <div style={{ fontSize: '12px', color: t.textMuted, marginBottom: '10px' }}>
            ID: {data.therapistId}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {data.specializations?.map((s, i) => <Tag key={i} label={s} />)}
            {data.services?.map((s, i) => <Tag key={i} label={s} variant="muted" />)}
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'Experience', value: `${data.yearsOfExperience} yrs` },
            { label: 'Gender', value: capitalizeWords(data.gender) },
            { label: 'Contact', value: data.contactNumber },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center', minWidth: '80px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: PRIMARY }}>{item.value}</div>
              <div style={{ fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

        {/* Personal Details */}
        <SectionCard icon={User} title="Personal Details">
          <InfoRow label="Full Name"    value={data.fullName} />
          <InfoRow label="Contact"      value={data.contactNumber} />
          <InfoRow label="Gender"       value={capitalizeWords(data.gender)} />
          <InfoRow label="Date of Birth" value={data.dateOfBirth} />
        </SectionCard>

        {/* Professional Details */}
        <SectionCard icon={Briefcase} title="Professional Details">
          <InfoRow label="Qualification"   value={data.qualification} />
          <InfoRow label="Experience"       value={`${data.yearsOfExperience} years`} />
          <InfoRow label="Services"         value={data.services?.join(', ')} />
          <InfoRow label="Specializations"  value={data.specializations?.join(', ')} />
        </SectionCard>

        {/* Expertise */}
        <SectionCard icon={Star} title="Expertise & Treatments">
          <InfoRow label="Expertise"   value={data.expertiseAreas?.join(', ')} />
          <InfoRow label="Treatments"  value={data.treatmentTypes?.join(', ')} />
        </SectionCard>

        {/* Availability */}
        <SectionCard icon={Clock} title="Availability">
          <InfoRow label="Days" value={data.availability?.days?.map(formatDay).join(', ')} />
          <InfoRow label="Start Time" value={data.availability?.startTime} />
          <InfoRow label="End Time"   value={data.availability?.endTime} />
        </SectionCard>
      </div>

      {/* ── Languages ── */}
      <SectionCard icon={Globe} title="Languages" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {data.languages?.length
            ? data.languages.map((lang, i) => <Tag key={i} label={capitalizeWords(lang)} />)
            : <span style={{ fontSize: '13px', color: t.textMuted }}>—</span>
          }
        </div>
      </SectionCard>

      {/* ── Bio ── */}
      <SectionCard icon={Activity} title="Profile Description" style={{ marginBottom: '14px' }}>
        <p style={{ fontSize: '13px', color: data.bio ? t.text : t.textMuted, lineHeight: '1.7', margin: 0, fontStyle: data.bio ? 'normal' : 'italic' }}>
          {data.bio || 'No profile description added.'}
        </p>
      </SectionCard>

      {/* ── Documents ── */}
      <SectionCard icon={FileText} title="Documents">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <DocBtn label="License Certificate" base64={data.documents?.licenseCertificate} />
          <DocBtn label="Degree Certificate"  base64={data.documents?.degreeCertificate} />
        </div>
      </SectionCard>

    </div>
  )
}