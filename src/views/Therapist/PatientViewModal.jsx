import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from "@coreui/react"
import { useState } from "react"

export default function PatientViewModal({ visible, data, onClose }) {
  const [preview, setPreview] = useState(null)
  const record = data

  if (!record) return null

  const theme = {
    primary: "#041f3a",
    bg: "#f4f7fb",
    border: "#dbe4f0",
    white: "#ffffff",
  }

  const hiddenKeys = [
    "payment",
    "paymentInfo",
    "amount",
    "paidAmount",
    "balanceAmount",
    "totalAmount",
    "discount",
    "price",
    "fee",
    "cost",
  ]

  const value = (v) => {
    if (v === null || v === undefined || v === "") return null
    if (typeof v === "boolean") return v ? "Yes" : "No"
    return v
  }

  const label = (txt = "") =>
    txt
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (s) => s.toUpperCase())

  const isImage = (str) =>
    typeof str === "string" &&
    (str.startsWith("/9j/") ||
      str.startsWith("iVBOR") ||
      str.startsWith("R0lGOD") ||
      str.startsWith("data:image"))

  const getImg = (img) => {
    if (!img) return null
    if (img.startsWith("data:image")) return img
    if (img.startsWith("iVBOR")) return `data:image/png;base64,${img}`
    if (img.startsWith("/9j/")) return `data:image/jpeg;base64,${img}`
    return `data:image/jpeg;base64,${img}`
  }

  const cardStyle = {
    border: `1px solid ${theme.border}`,
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "16px",
  }

  const titleStyle = {
    background: theme.primary,
    color: "#fff",
    padding: "10px 14px",
    fontWeight: "600",
    margin: "-1rem -1rem 1rem -1rem",
  }

  const shouldHide = (key) => {
    const k = key?.toLowerCase()
    return hiddenKeys.some((item) => k.includes(item.toLowerCase()))
  }

  const renderField = (key, val, i) => {
    if (!key || shouldHide(key)) return null
    if (val === null || val === undefined || val === "") return null

    // IMAGE
    if (isImage(val)) {
      return (
        <CCol md={4} key={i} className="mb-3">
          <div className="fw-semibold mb-2">{label(key)}</div>
          <img
            src={getImg(val)}
            alt={key}
            onClick={() => setPreview(getImg(val))}
            style={{
              width: "180px",
              height: "140px",
              objectFit: "cover",
              borderRadius: "12px",
              border: "1px solid #dbe4f0",
              cursor: "pointer",
            }}
          />
        </CCol>
      )
    }

    // ARRAY
    if (Array.isArray(val)) {
      if (val.length === 0) return null

      return (
        <CCol md={12} key={i} className="mb-3">
          <div className="fw-bold mb-2" style={{ color: theme.primary }}>
            {label(key)}
          </div>

          {val.map((item, index) => (
            <CCard
              key={index}
              className="mb-2"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
              }}
            >
              <CCardBody className="py-3">
                <CRow>
                  {typeof item === "object"
                    ? Object.entries(item).map(([k, v], idx) =>
                        renderField(k, v, `${index}-${idx}`)
                      )
                    : renderField(`${key}-${index}`, item, index)}
                </CRow>
              </CCardBody>
            </CCard>
          ))}
        </CCol>
      )
    }

    // OBJECT
    if (typeof val === "object") {
      const entries = Object.entries(val).filter(
        ([k, v]) =>
          !shouldHide(k) &&
          v !== null &&
          v !== undefined &&
          v !== ""
      )

      if (entries.length === 0) return null

      return (
        <CCol md={12} key={i} className="mb-3">
          <CCard
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
            }}
          >
            <CCardBody>
              <div
                className="fw-bold mb-3"
                style={{
                  color: theme.primary,
                  fontSize: "15px",
                }}
              >
                {label(key)}
              </div>

              <CRow>
                {entries.map(([k, v], idx) =>
                  renderField(k, v, `${i}-${idx}`)
                )}
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      )
    }

    // NORMAL TEXT
    const showValue = value(val)
    if (!showValue) return null

    return (
      <CCol md={4} key={i} className="mb-3">
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
              color: "#64748b",
              marginBottom: "4px",
              fontWeight: "600",
            }}
          >
            {label(key)}
          </div>

          <div
            style={{
              fontSize: "15px",
              color: "#111827",
              fontWeight: "500",
              wordBreak: "break-word",
            }}
          >
            {showValue}
          </div>
        </div>
      </CCol>
    )
  }

  const Section = ({ title, obj }) => {
    if (!obj) return null

    const fields = Object.entries(obj).map(([k, v], i) =>
      renderField(k, v, i)
    )

    const hasData = fields.some(Boolean)
    if (!hasData) return null

    return (
      <CCard style={cardStyle}>
        <CCardBody>
          <div style={titleStyle}>{title}</div>
          <CRow>{fields}</CRow>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <>
      <CModal
        visible={visible}
        onClose={onClose}
        size="xl"
        backdrop="static" color="white" className="custom-modal"
      >
        <CModalHeader style={{ background: theme.primary, color: "#fff" }}>
          <CModalTitle>Patient Details</CModalTitle>
        </CModalHeader>

        <CModalBody style={{ background: theme.bg }}>
          <Section
            title="Main Details"
            obj={{
              therapistRecordId: record?.therapistRecordId,
              bookingId: record?.bookingId,
              clinicId: record?.clinicId,
              branchId: record?.branchId,
              overallStatus: record?.overallStatus,
              createdAt: record?.createdAt,
              updatedAt: record?.updatedAt,
            }}
          />

          <Section title="Patient Info" obj={record?.patientInfo} />
          <Section title="Complaints" obj={record?.complaints} />
          <Section title="Reports" obj={record?.reports} />
          <Section title="Assessment" obj={record?.assessment} />
          <Section title="Diagnosis" obj={record?.diagnosis} />
          <Section title="Treatment Plan" obj={record?.treatmentPlan} />


          {/* Therapy Session Accordion */}
          {record?.therapySessions?.length > 0 && (
            <CCard style={cardStyle}>
              <CCardBody>
                <div style={titleStyle}>Therapy Session</div>

                <CAccordion alwaysOpen>
                  <CAccordionItem itemKey={1}>
                    <CAccordionHeader>
                      Therapy Session Details
                    </CAccordionHeader>

                    <CAccordionBody>
                      <CRow>
                        {Object.entries(record.therapySessions[0]).map(
                          ([k, v], i) => renderField(k, v, i)
                        )}
                      </CRow>
                    </CAccordionBody>
                  </CAccordionItem>
                </CAccordion>
              </CCardBody>
            </CCard>
          )}

          {/* Home Exercise Accordion */}
          {record?.exercisePlan?.exercises?.length > 0 && (
            <CCard style={cardStyle}>
              <CCardBody>
                <div style={titleStyle}>Home Exercise</div>

                <CAccordion >
                  {record.exercisePlan.exercises.map((item, index) => (
                    <CAccordionItem
                      itemKey={index + 1}
                      key={index}
                    >
                      <CAccordionHeader>
                        Home Exercise {index + 1}
                      </CAccordionHeader>

                      <CAccordionBody>
                        <CRow>
                          {Object.entries(item).map(([k, v], i) =>
                            renderField(k, v, `${index}-${i}`)
                          )}
                        </CRow>
                      </CAccordionBody>
                    </CAccordionItem>
                  ))}
                </CAccordion>
              </CCardBody>
            </CCard>
          )}

          {/* Questions Accordion */}
          {record?.questions?.length > 0 && (
            <CCard style={cardStyle}>
              <CCardBody>
                <div style={titleStyle}>Questions</div>

                <CAccordion alwaysOpen>
                  {record.questions.map((item, index) => (
                    <CAccordionItem
                      itemKey={index + 1}
                      key={index}
                    >
                      <CAccordionHeader>
                        Question {index + 1}
                      </CAccordionHeader>

                      <CAccordionBody>
                        <CRow>
                          {Object.entries(item).map(([k, v], i) =>
                            renderField(k, v, `${index}-${i}`)
                          )}
                        </CRow>
                      </CAccordionBody>
                    </CAccordionItem>
                  ))}
                </CAccordion>
              </CCardBody>
            </CCard>
          )}

          <Section title="Exercise Plan" obj={record?.exercisePlan} />
          <Section title="Follow Up" obj={record?.followUp} />
          <Section
            title="Home Advice"
            obj={{ homeAdvice: record?.homeAdvice }}
          />
        </CModalBody>

        <CModalFooter>
          <CButton
            onClick={onClose}
            style={{
              background: theme.primary,
              color: theme.white,
              border: "none",
              padding: "8px 20px",
              fontWeight: "600",
            }}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Image Preview */}
      <CModal
        visible={!!preview}
        onClose={() => setPreview(null)}
        size="lg"
      >
        <CModalHeader style={{ background: theme.primary, color: "#fff" }}>
          <CModalTitle>Image Preview</CModalTitle>
        </CModalHeader>

        <CModalBody style={{ textAlign: "center" }}>
          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          )}
        </CModalBody>

        <CModalFooter>
          <CButton
            onClick={() => setPreview(null)}
            style={{
              background: theme.primary,
              color: "#fff",
              border: "none",
            }}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}