/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */

import React, { useState, useEffect } from 'react'
import { CModal, CModalHeader, CModalBody, CCol, CRow, CButton } from '@coreui/react'
import { COLORS } from '../../Constant/Themes'

const SessionViewModal = ({ visible, data, onClose }) => {
  const [preview, setPreview] = useState(null)
  const [beforeVideoUrl, setBeforeVideoUrl] = useState(null)
  const [afterVideoUrl, setAfterVideoUrl] = useState(null)
  const [beforeImageUrl, setBeforeImageUrl] = useState(null)
  const [afterImageUrl, setAfterImageUrl] = useState(null)
  const [consentPdfBlobUrl, setConsentPdfBlobUrl] = useState(null)

  if (!data) return null

  const base64ToBlob = (base64, mime) => {
    try {
      const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64
      const byteChars = atob(cleanBase64)
      const byteNumbers = new Array(byteChars.length)
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      return new Blob([byteArray], { type: mime })
    } catch (e) {
      console.error("Invalid base64", e)
      return new Blob([], { type: mime })
    }
  }

  useEffect(() => {
    if (!data || !visible) {
      return
    }

    const activeUrls = []

    const resolveMediaUrl = (mediaPath, rawBase64, isVideo = false) => {
      if (mediaPath) {
        if (mediaPath.startsWith("http") || mediaPath.startsWith("blob:") || mediaPath.startsWith("data:")) {
          return mediaPath
        }
      }
      const source = rawBase64 || mediaPath
      if (source) {
        if (source.startsWith("http") || source.startsWith("blob:") || source.startsWith("data:")) {
          return source
        }
        try {
          const mimeType = isVideo ? "video/mp4" : "image/jpeg"
          const blob = base64ToBlob(source, mimeType)
          const url = URL.createObjectURL(blob)
          activeUrls.push(url)
          return url
        } catch (e) {
          console.error("Error creating blob URL", e)
        }
      }
      return null
    }

    const beforeImg = data.beforeMediaUrl && !data.beforeMediaUrl.match(/\.(mp4|webm|mov|ogg)$/i) ? data.beforeMediaUrl : data.beforeImage;
    const afterImg = data.afterMediaUrl && !data.afterMediaUrl.match(/\.(mp4|webm|mov|ogg)$/i) ? data.afterMediaUrl : data.afterImage;
    const beforeVid = data.beforeMediaUrl && data.beforeMediaUrl.match(/\.(mp4|webm|mov|ogg)$/i) ? data.beforeMediaUrl : data.beforeVideo;
    const afterVid = data.afterMediaUrl && data.afterMediaUrl.match(/\.(mp4|webm|mov|ogg)$/i) ? data.afterMediaUrl : data.afterVideo;

    setBeforeImageUrl(resolveMediaUrl(beforeImg, data.beforeImage, false))
    setAfterImageUrl(resolveMediaUrl(afterImg, data.afterImage, false))
    setBeforeVideoUrl(resolveMediaUrl(beforeVid, data.beforeVideo, true))
    setAfterVideoUrl(resolveMediaUrl(afterVid, data.afterVideo, true))

    if (data.consentPdfUrl) {
      if (data.consentPdfUrl.startsWith("data:application/pdf;base64,") || !data.consentPdfUrl.startsWith("http")) {
        try {
          const blob = base64ToBlob(data.consentPdfUrl, "application/pdf")
          const url = URL.createObjectURL(blob)
          activeUrls.push(url)
          setConsentPdfBlobUrl(url)
        } catch (err) {
          console.error("Failed to parse PDF base64", err)
          setConsentPdfBlobUrl(data.consentPdfUrl)
        }
      } else {
        setConsentPdfBlobUrl(data.consentPdfUrl)
      }
    } else {
      setConsentPdfBlobUrl(null)
    }

    return () => {
      activeUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url)
        } catch (e) {
          console.error("Failed to revoke URL", url, e)
        }
      })
    }
  }, [data, visible])

  const audioSrc =
    data?.voiceRecord ||
    data?.voiceRecordUrl ||
    "";

  return (
    <>
      <CModal visible={visible} onClose={onClose} size="lg" backdrop="static" className='custom-modal' scrollable={true}>
        <CModalHeader closeButton style={{ backgroundColor: COLORS.primary, color: "white" }} className="text-white">Session Details</CModalHeader>

        <CModalBody>

          {/* 🔷 HEADER */}
          <h6 className="section-title" style={{ color: COLORS.primary }}>Session Information</h6>

          <CRow className="mb-3" style={{ color: COLORS.primary }}>
            {[
              { label: "Patient", value: data.patientName },
              { label: "Therapy", value: data.therapy },
              { label: "Date", value: data.completedDate },
              { label: "Time", value: data.completedTime },
              { label: "Patient ID", value: data.patientId },
              { label: "Booking ID", value: data.bookingId },
              { label: "Therapist ID", value: data.therapistId },
              { label: "Session ID", value: data.sessionId },
            ].map((item, i) => (
              <CCol md={6} key={i}>
                <div className="info-box">
                  <span className="label" style={{ color: COLORS.primary }}>{item.label}</span>
                  <span className="value" style={{ color: COLORS.primary }}>{item.value || "-"}</span>
                </div>
              </CCol>
            ))}
          </CRow>

          {/* 🔷 NOTES */}
          <h6 className="section-title" style={{ color: COLORS.primary }}>Notes</h6>

          <div className="note-box mb-4">
            <b>Therapist Notes</b>
            <p style={{ color: COLORS.primary }}>{data.therapistNotes || "-"}</p>
          </div>

          <div className="note-box mb-4" style={{ borderLeftColor: '#16a34a' }}>
            <b>Patient Response</b>
            <p style={{ color: COLORS.primary }}>{data.patientResponse || "-"}</p>
          </div>

          {/* 🔷 SESSION DETAILS */}
          <h6 className="section-title" style={{ color: COLORS.primary }}>Session Details</h6>

          <CRow className="g-3 mt-1">
            <CCol md={6}>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "12px",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  Pain Before
                </div>
                <div style={{ fontSize: "15px", fontWeight: "500" }}>
                  {data.painBefore || "-"}
                </div>
              </div>
            </CCol>

            <CCol md={6}>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "12px",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  Pain After
                </div>
                <div style={{ fontSize: "15px", fontWeight: "500" }}>
                  {data.painAfter || "-"}
                </div>
              </div>
            </CCol>

            <CCol md={6}>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "12px",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: COLORS.primary,
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  Result
                </div>
                <div style={{ fontSize: "15px", fontWeight: "500" }}>
                  {data.result || "-"}
                </div>
              </div>
            </CCol>

            <CCol md={6}>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  color: COLORS.primary,
                  padding: "12px",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: COLORS.primary,
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  Duration
                </div>
                <div style={{ fontSize: "15px", fontWeight: "500" }}>
                  {data.duration || "-"}
                </div>
              </div>
            </CCol>

            <CCol md={12}>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  Next Plan
                </div>
                <div style={{ fontSize: "15px", fontWeight: "500", color: COLORS.primary }}>
                  {data.nextPlan || "-"}
                </div>
              </div>
            </CCol>
          </CRow>

          {/* 🔷 MEDIA */}
          <h6 className="section-title mt-4" style={{ color: COLORS.primary }}>Media</h6>

          <CRow>
            <CRow className="g-3">

              {/* No Sets Completed */}
              <CCol md={6}>
                <strong>No Sets Completed:</strong>
                <div>{data?.setsDone || "-"}</div>
              </CCol>

              {/* Repetition Done */}
              <CCol md={6}>
                <strong>Repetition Done:</strong>
                <div>{data?.repetationDone || "-"}</div>
              </CCol>

              {/* Audio */}
              <CCol md={12} className='mt-5'>
                <strong>Audio Record:</strong>

                <div className="mt-2">
                  {audioSrc ? (
                    <audio controls src={audioSrc} style={{ width: "100%" }} />
                  ) : (
                    <span>No Audio</span>
                  )}
                </div>
              </CCol>

            </CRow>

            {/* Images */}
            <CCol md={6} className="mt-3">
              <b>Before Image</b>
              <div>
                {beforeImageUrl ? (
                  <img
                    src={beforeImageUrl}
                    className="img-fluid rounded border"
                    style={{ cursor: "pointer", maxHeight: 120 }}
                    onClick={() => setPreview(beforeImageUrl)}
                  />
                ) : <span>No Image</span>}
              </div>
            </CCol>

            <CCol md={6} className="mt-3">
              <b>After Image</b>
              <div>
                {afterImageUrl ? (
                  <img
                    src={afterImageUrl}
                    className="img-fluid rounded border"
                    style={{ cursor: "pointer", maxHeight: 120 }}
                    onClick={() => setPreview(afterImageUrl)}
                  />
                ) : <span>No Image</span>}
              </div>
            </CCol>

            {/* Videos */}
            <CCol md={6} className="mt-4">
              <b>Before Video</b>
              <div className="media-box">
                {beforeVideoUrl ? (
                  <video
                    src={beforeVideoUrl}
                    controls
                    playsInline
                    preload="auto"
                    style={{ maxHeight: 150, width: '100%' }}
                  />
                ) : <span>No Video</span>}
              </div>
            </CCol>

            <CCol md={6} className="mt-4">
              <b>After Video</b>
              <div className="media-box">
                {afterVideoUrl ? (
                  <video
                    src={afterVideoUrl}
                    controls
                    playsInline
                    preload="auto"
                    style={{ maxHeight: 150, width: '100%' }}
                    onClick={() => setPreview(afterVideoUrl)}
                  />
                ) : <span>No Video</span>}
              </div>
            </CCol>

          </CRow>


          {consentPdfBlobUrl && (

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "12px",
                marginTop: "10px",
                background: "#f8fafc",
              }}
            >
              <hr />

              Consent Form PDF

              <br />

              {/* PDF Preview */}
              <embed
                src={consentPdfBlobUrl}
                type="application/pdf"
                width="100%"
                height="400px"
              />

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                }}
              >

                <CButton
                  color="primary"
                  variant="outline"
                  onClick={() =>
                    window.open(consentPdfBlobUrl, "_blank")
                  }
                >
                  View PDF
                </CButton>

                <a
                  href={consentPdfBlobUrl}
                  download="consent-form.pdf"
                  style={{ textDecoration: "none" }}
                >
                  <CButton color="success">
                    Download PDF
                  </CButton>
                </a>

              </div>

            </div>
          )}

        </CModalBody>
      </CModal>

      {/* Full screen preview */}
      {preview && (
        <CModal
          visible
          size="xl"
          onClose={() => setPreview(null)}
          className="preview-modal"
        >
          <CModalBody className="preview-body">
            <button
              className="preview-close"
              onClick={() => setPreview(null)}
            >
              ×
            </button>

            {preview.startsWith("data:video") || preview.startsWith("blob:") || preview.match(/\.(mp4|webm|mov|ogg)$/i) ? (
              <video src={preview} controls autoPlay style={{ width: '100%' }} />
            ) : (
              <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
            )}
          </CModalBody>
        </CModal>
      )}

      <style>
        {`
          .info-box {
            background: #f8f9fa;
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid #eee;
            margin-bottom: 10px;
            display: flex;
            flex-direction: column;
          }

          .label {
            font-size: 12px;
            color: #6c757d;
          }

          .value {
            font-weight: 600;
            font-size: 14px;
            color: #212529;
          }
          
          .custom-modal .btn-close {
            filter: brightness(0) invert(1);
            opacity: 1;
          }
           
          /* Main Modal */
          .custom-modal .modal-dialog {
            max-width: 95%;
          }

          .custom-modal .modal-content {
            border-radius: 14px;
            overflow: hidden;
          }

          /* Section Title */
          .section-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #222;
            border-bottom: 2px solid #f1f1f1;
            padding-bottom: 6px;
          }

          /* Info Box */
          .info-box {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 10px;
            border: 1px solid #e9ecef;
            margin-bottom: 12px;
            min-height: 72px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .label {
            font-size: 12px;
            color: #6c757d;
            margin-bottom: 4px;
          }

          .value {
            font-weight: 600;
            font-size: 14px;
            color: #212529;
            word-break: break-word;
          }

          /* Notes */
          .note-box {
            background: #fff;
            border: 1px solid #eee;
            border-left: 4px solid #0d6efd;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 12px;
          }

          .note-box p {
            margin: 6px 0 0;
            font-size: 14px;
            color: #444;
          }

          /* Media */
          .media-box {
            border: 1px solid #eee;
            border-radius: 10px;
            padding: 10px;
            background: #fafafa;
            text-align: center;
            min-height: 160px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .media-box img,
          .media-box video {
            width: 100%;
            max-height: 180px;
            object-fit: cover;
            border-radius: 8px;
            cursor: pointer;
          }

          /* Full Preview Modal */
          .preview-modal .modal-dialog {
            max-width: 95vw;
            margin: auto;
          }

          .preview-modal .modal-content {
            background: #000;
            border-radius: 14px;
            overflow: hidden;
          }

          .preview-body {
            padding: 15px;
            text-align: center;
            position: relative;
          }

          .preview-body img,
          .preview-body video {
            max-width: 100%;
            max-height: 85vh;
            border-radius: 10px;
            object-fit: contain;
          }

          /* Close Button */
          .preview-close {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255,255,255,0.9);
            color: #000;
            border: none;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            font-size: 22px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1000;
            transition: 0.2s;
          }

          .preview-close:hover {
            background: #fff;
            transform: scale(1.08);
          }

          /* Mobile Responsive */
          @media (max-width: 768px) {
            .section-title {
              font-size: 16px;
            }

            .info-box {
              min-height: auto;
              padding: 10px;
            }

            .label {
              font-size: 11px;
            }

            .value {
              font-size: 13px;
            }

            .media-box {
              min-height: 140px;
            }

            .media-box img,
            .media-box video {
              max-height: 150px;
            }

            .preview-close {
              width: 34px;
              height: 34px;
              font-size: 20px;
              top: 8px;
              right: 8px;
            }
          }
        `}
      </style>
    </>
  )
}
export default SessionViewModal