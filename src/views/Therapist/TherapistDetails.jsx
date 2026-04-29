import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CBadge,
  CButton,
} from '@coreui/react'
import capitalizeWords from '../../Utils/capitalizeWords'
import { COLORS } from '../../Constant/Themes'

export default function TherapistDetails() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state

  if (!data) return <p>No Data</p>

  const formatDay = (d) =>
    d ? d.charAt(0).toUpperCase() + d.slice(1) : ''

  const cardStyle = {
    border: `1px solid ${COLORS.primary}15`,
    borderRadius: '14px',
    padding: '14px',
    background: '#fff',
    height: '100%',
  }

  const titleStyle = {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 'clamp(15px,2vw,18px)',
    marginBottom: '12px',
    borderBottom: `1px solid ${COLORS.primary}20`,
    paddingBottom: '6px',
  }

  const textStyle = {
    fontSize: 'clamp(13px,1.5vw,15px)',
    lineHeight: '1.6',
    color: '#222',
    wordBreak: 'break-word',
  }

  return (
    <CCard
      className="shadow border-0"
      style={{
        borderRadius: '18px',
        overflow: 'hidden',
      }}
    >
      <CCardBody className="p-3 p-md-4">

        {/* Header */}
        <div
          className="position-relative mb-4 pb-3"
          style={{
            borderBottom: `1px solid ${COLORS.primary}25`,
          }}
        >
          {/* Close Button */}
          <CButton
            size="sm"
            className="position-absolute top-0 end-0"
            style={{
              color: COLORS.primary,
              border: `1px solid ${COLORS.primary}`,
              fontSize: '12px',
              padding: '5px 10px',
              borderRadius: '8px',
              background: '#fff',
            }}
            onClick={() => navigate(-1)}
          >
            ✕ Close
          </CButton>

          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-3 pe-5">
            <img
              src={
                data.documents?.profilePhoto
                  ? `data:image/jpeg;base64,${data.documents.profilePhoto}`
                  : '/assets/images/default-avatar.png'
              }
              alt={data.fullName}
              style={{
                width: 'clamp(90px,18vw,140px)',
                height: 'clamp(90px,18vw,140px)',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `4px solid ${COLORS.primary}20`,
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              }}
            />

            <div className="text-center text-md-start w-100">
              <h3
                className="mb-1 fw-bold"
                style={{
                  color: COLORS.primary,
                  fontSize: 'clamp(22px,4vw,34px)',
                }}
              >
                {data.fullName}
              </h3>

              <div
                className="mb-2"
                style={{
                  color: '#6c757d',
                  fontSize: 'clamp(12px,2vw,14px)',
                }}
              >
                {data.therapistId}
              </div>

              <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
                <CBadge
                  style={{
                    backgroundColor: COLORS.primary,
                    color: '#fff',
                    fontSize: '12px',
                    padding: '7px 12px',
                    borderRadius: '20px',
                  }}
                >
                  {capitalizeWords(data.role || 'Therapist')}
                </CBadge>

                <CBadge
                  style={{
                    backgroundColor: '#eef4ff',
                    color: COLORS.primary,
                    fontSize: '12px',
                    padding: '7px 12px',
                    borderRadius: '20px',
                    border: `1px solid ${COLORS.primary}30`,
                  }}
                >
                  {data.yearsOfExperience} yrs exp
                </CBadge>
              </div>
            </div>
          </div>
        </div>

        {/* Personal + Professional */}
        <CRow className="g-3 mb-3">
          <CCol xs={12} lg={6}>
            <div style={cardStyle}>
              <div style={titleStyle}>Personal Details</div>
              <div style={textStyle}><b>Contact:</b> {data.contactNumber}</div>
              <div style={textStyle}><b>Gender:</b> {capitalizeWords(data.gender)}</div>
              <div style={textStyle}><b>DOB:</b> {data.dateOfBirth}</div>
            </div>
          </CCol>

          <CCol xs={12} lg={6}>
            <div style={cardStyle}>
              <div style={titleStyle}>Professional Details</div>
              <div style={textStyle}><b>Qualification:</b> {data.qualification}</div>
              <div style={textStyle}><b>Experience:</b> {data.yearsOfExperience} years</div>
              <div style={textStyle}><b>Services:</b> {data.services?.join(', ') || 'N/A'}</div>
              <div style={textStyle}><b>Specializations:</b> {data.specializations?.join(', ') || 'N/A'}</div>
            </div>
          </CCol>
        </CRow>

        {/* Expertise + Availability */}
        <CRow className="g-3 mb-3">
          <CCol xs={12} lg={6}>
            <div style={cardStyle}>
              <div style={titleStyle}>Expertise & Treatments</div>
              <div style={textStyle}><b>Expertise:</b> {data.expertiseAreas?.join(', ') || 'N/A'}</div>
              <div style={textStyle}><b>Treatments:</b> {data.treatmentTypes?.join(', ') || 'N/A'}</div>
            </div>
          </CCol>

          <CCol xs={12} lg={6}>
            <div style={cardStyle}>
              <div style={titleStyle}>Availability</div>
              <div style={textStyle}>
                <b>Days:</b>{' '}
                {data.availability?.days?.map(formatDay).join(', ') || 'N/A'}
              </div>
              <div style={textStyle}>
                <b>Time:</b> {data.availability?.startTime} - {data.availability?.endTime}
              </div>
            </div>
          </CCol>
        </CRow>

        {/* Languages */}
        <div style={{ ...cardStyle, marginBottom: '16px' }}>
          <div style={titleStyle}>Languages</div>

          <div className="d-flex flex-wrap gap-2">
            {data.languages?.length ? (
              data.languages.map((lang, i) => (
                <CBadge
                  key={i}
                  style={{
                    backgroundColor: '#f5f8ff',
                    color: COLORS.primary,
                    fontSize: '12px',
                    padding: '7px 10px',
                    borderRadius: '18px',
                    border: `1px solid ${COLORS.primary}25`,
                  }}
                >
                  {capitalizeWords(lang)}
                </CBadge>
              ))
            ) : (
              <span style={textStyle}>N/A</span>
            )}
          </div>
        </div>

        {/* Bio */}
        <div style={{ ...cardStyle, marginBottom: '16px' }}>
          <div style={titleStyle}>Profile Description</div>
          <div style={textStyle}>
            {data.bio || 'N/A'}
          </div>
        </div>

        {/* Documents */}
        <div style={cardStyle}>
          <div style={titleStyle}>Documents</div>

          <CRow className="g-3">
            <CCol xs={12} md={6}>
              <div style={textStyle} className="mb-2">
                <b>License Certificate</b>
              </div>

              {data.documents?.licenseCertificate ? (
                <CButton
                  size="sm"
                  style={{
                    backgroundColor: COLORS.primary,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13px',
                  }}
                  onClick={() =>
                    window.open(
                      `data:application/pdf;base64,${data.documents.licenseCertificate}`
                    )
                  }
                >
                  View PDF
                </CButton>
              ) : (
                <span style={textStyle}>Not Uploaded</span>
              )}
            </CCol>

            <CCol xs={12} md={6}>
              <div style={textStyle} className="mb-2">
                <b>Degree Certificate</b>
              </div>

              {data.documents?.degreeCertificate ? (
                <CButton
                  size="sm"
                  style={{
                    backgroundColor: COLORS.primary,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13px',
                  }}
                  onClick={() =>
                    window.open(
                      `data:application/pdf;base64,${data.documents.degreeCertificate}`
                    )
                  }
                >
                  View PDF
                </CButton>
              ) : (
                <span style={textStyle}>Not Uploaded</span>
              )}
            </CCol>
          </CRow>
        </div>

      </CCardBody>
    </CCard>
  )
}