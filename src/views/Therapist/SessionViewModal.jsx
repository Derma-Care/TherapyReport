/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */

import React, { useState } from 'react'
import { CModal, CModalHeader, CModalBody, CCol, CRow } from '@coreui/react'

const SessionViewModal = ({ visible, data, onClose }) => {
  const [preview, setPreview] = useState(null)

  if (!data) return null

  const base64ToBlob = (base64, mime) => {
    const byteChars = atob(base64)
    const byteNumbers = new Array(byteChars.length)

    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mime })
  }
  const getVideoUrl = (base64) => {
    if (!base64) return null
    const blob = base64ToBlob(base64, "video/mp4")
    return URL.createObjectURL(blob)
  }
  const audioSrc =
  data?.voiceRecord ||
  data?.voiceRecordUrl ||
  "";
  return (
    <>
      <CModal visible={visible} onClose={onClose} size="lg" backdrop="static" className='custom-modal'>
        <CModalHeader>Session Details</CModalHeader>

        <CModalBody>

          {/* 🔷 HEADER */}
          <h5 className="section-title">Session Information</h5>

          <CRow className="mb-3">
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
                  <span className="label">{item.label}</span>
                  <span className="value">{item.value || "-"}</span>
                </div>
              </CCol>
            ))}
          </CRow>

          {/* 🔷 NOTES */}
          <h6 className="section-title">Notes</h6>

          {/* <div className="note-box">
    <b>Doctor Notes</b>
    <p>{data.doctorNotes || "-"}</p>
  </div> */}

          <div className="note-box">
            <b>Therapist Notes</b>
            <p>{data.therapistNotes || "-"}</p>
          </div>

          {/* 🔷 SESSION DETAILS */}
          <h6 className="section-title">Session Details</h6>

          <CRow>
            <CCol md={6}><b>Pain Before:</b> {data.painBefore || "-"}</CCol>
            <CCol md={6}><b>Pain After:</b> {data.painAfter || "-"}</CCol>
            <CCol md={6}><b>Result:</b> {data.result || "-"}</CCol>
            <CCol md={6}><b>Duration:</b> {data.duration || "-"}  </CCol>
            <CCol md={12}>
              <b>Next Plan:</b>
              <div>{data.nextPlan || "-"}</div>
            </CCol>
          </CRow>

          {/* 🔷 MEDIA */}
          <h6 className="section-title">Media</h6>

          <CRow>
            <CRow className="g-3">

  {/* No Sets Completed */}
  <CCol md={6}>
    <strong>No Sets Completed:</strong>
    <div>{data?.noSetsCompleted || "-"}</div>
  </CCol>

  {/* Repetition Done */}
  <CCol md={6}>
    <strong>Repetition Done:</strong>
    <div>{data?.repetitionDone || "-"}</div>
  </CCol>

  {/* Audio */}
<CCol md={12}>
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
            <CCol md={6}>
              <b>Before Image</b>
              <div  >
                {data.beforeImage ? (
                  <img
                    src={`data:image/jpeg;base64,${data.beforeImage}`}
                    className="img-fluid rounded border"
                    style={{ cursor: "pointer", maxHeight: 120 }}
                    onClick={() => setPreview(`data:image/jpeg;base64,${data.beforeImage}`)}
                  />
                ) : <span>No Image</span>}
              </div>
            </CCol>

            <CCol md={6}>
              <b>After Image</b>
              <div  >
                {data.afterImage ? (
                  <img
                    src={`data:image/jpeg;base64,${data.afterImage}`}
                    className="img-fluid rounded border"
                    style={{ cursor: "pointer", maxHeight: 120 }}
                    onClick={() => setPreview(`data:image/jpeg;base64,${data.afterImage}`)}
                  />
                ) : <span>No Image</span>}
              </div>
            </CCol>

            {/* Videos */}
            <CCol md={6} className="mt-3">
              <b>Before Video</b>
              <div className="media-box">
                {data.beforeVideo ? (
                  <video
                    src={getVideoUrl(data.beforeVideo)}
                    controls
                    style={{ maxHeight: 150 }}
                  />
                ) : <span>No Video</span>}
              </div>
            </CCol>

            <CCol md={6} className="mt-3">
              <b>After Video</b>
              <div className="media-box">
                {data.afterVideo ? (
                  <video
                    src={`data:video/mp4;base64,${data.afterVideo}`}
                    controls
                    onClick={() => setPreview(`data:video/mp4;base64,${data.afterVideo}`)}
                  />
                ) : <span>No Video</span>}
              </div>
            </CCol>

          </CRow>

        </CModalBody>
      </CModal>

      {/* Full screen preview */}

      {/* {preview && (
  <CModal visible size="xl" onClose={() => setPreview(null)}>
    <CModalBody style={{ textAlign: "center" }}>
      {preview.endsWith(".mp4") ||
      preview.startsWith("blob:")
        ? (
          <video
            src={preview}
            controls
            style={{ width: "100%" }}
          />
        )
        : (
          <img
            src={preview}
            style={{ width: "100%" }}
          />
        )}
    </CModalBody>
  </CModal>
)} */}
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

            {preview.startsWith("data:video") ? (
              <video src={preview} controls autoPlay />
            ) : (
              <img src={preview} alt="Preview" />
            )}
          </CModalBody>
        </CModal>
      )}

      <style>
        {
          `
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
 
            /* Main Modal */
            .custom - modal.modal - dialog {
          max - width: 95%;
}

        .custom-modal .modal-content {
          border - radius: 14px;
        overflow: hidden;
}

        /* Section Title */
        .section-title {
          font - size: 18px;
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
          font - size: 12px;
        color: #6c757d;
        margin-bottom: 4px;
}

        .value {
          font - weight: 600;
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
          max - width: 95vw;
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
          max - width: 100%;
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
  .section - title {
          font - size: 16px;
  }

        .info-box {
          min - height: auto;
        padding: 10px;
  }

        .label {
          font - size: 11px;
  }

        .value {
          font - size: 13px;
  }

        .media-box {
          min - height: 140px;
  }

        .media-box img,
        .media-box video {
          max - height: 150px;
  }

        .preview-close {
          width: 34px;
        height: 34px;
        font-size: 20px;
        top: 8px;
        right: 8px;
  }
}
 
      `
        }
      </style >
    </>
  )
}
export default SessionViewModal