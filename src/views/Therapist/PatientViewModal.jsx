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
import { COLORS } from "../../Constant/Themes"

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
    color:"white"
  }

  const titleStyle = {
    background: COLORS.white,
    color: COLORS.primary,
    padding: "10px 14px",
    fontWeight: "600",
    margin: "-1rem -1rem 1rem -1rem",
  }

  const shouldHide = (key) => {
    const k = key?.toLowerCase()
    return hiddenKeys.some((item) => k.includes(item.toLowerCase()))
  }

// REPLACE ONLY YOUR renderField FUNCTION WITH THIS
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

 

if (Array.isArray(val)) {
  if (val.length === 0) return null

  return (
    <CCol md={12} key={i} className="mb-3">
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
            marginBottom: "8px",
            fontWeight: "600",
          }}
        >
          {label(key)}
        </div>

        {val.map((item, index) => {
          // STRING / NUMBER
          if (typeof item !== "object" || item === null) {
            return (
              <span key={index}>
                {item}
                {index !== val.length - 1 ? ", " : ""}
              </span>
            )
          }

          // OBJECT => CLEAN VALUE ONLY
          const text = Object.entries(item)
            .filter(
              ([k, v]) =>
                !shouldHide(k) &&
                v !== null &&
                v !== undefined &&
                v !== "" &&
                typeof v !== "object"
            )
            .map(([k, v]) => v)
            .join(" - ")

          return (
            <span key={index}>
              {text}
              {index !== val.length - 1 ? ", " : ""}
            </span>
          )
        })}
      </div>
    </CCol>
  )
}

  // OBJECT => SIMPLE GRID
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
        <div className="fw-bold mb-2" style={{ color: COLORS.primary }}>
          {label(key)}
        </div>

        <CRow className="g-3">
          {entries.map(([k, v], idx) =>
            renderField(k, v, `${i}-${idx}`)
          )}
        </CRow>
      </CCol>
    )
  }

  // TEXT
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
          <div style={titleStyle} c>{title}</div>
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
   <CModalHeader
  closeButton
  style={{ background: COLORS.primary, color: "#fff" }}
  className="custom-modal-header"
>
  <CModalTitle>Patient Details</CModalTitle>
</CModalHeader>

        <CModalBody   >
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


 
{/* {record?.therapySessions?.length > 0 && (
  <CCard style={cardStyle}>
    <CCardBody>
      <div style={titleStyle}>Therapy Session</div>

      <CAccordion alwaysOpen>
        {record.therapySessions.map((session, sIndex) => (
          <CAccordionItem itemKey={sIndex + 1} key={sIndex}>
            <CAccordionHeader>
              Therapy Session {sIndex + 1}
            </CAccordionHeader>

            <CAccordionBody>
              <CRow className="g-3">
                {session?.serviceType && renderField("serviceType", session.serviceType, `s-${sIndex}`)}
                {session?.packageId && renderField("packageId", session.packageId, `p-${sIndex}`)}
                {session?.packageName && renderField("packageName", session.packageName, `pn-${sIndex}`)}
              
              </CRow>

     
              {session?.programs?.length > 0 && (
                <>
                  <div className="fw-bold mt-3 mb-2" style={{ color: COLORS.primary }}>
                    Programs
                  </div>

                  <CAccordion>
                    {session.programs.map((program, pIndex) => (
                      <CAccordionItem itemKey={pIndex + 1} key={pIndex}>
                        <CAccordionHeader>
                          {program?.programName || `Program ${pIndex + 1}`}
                        </CAccordionHeader>

                        <CAccordionBody>
                          <CRow className="g-3">
                            {program?.programId &&
                              renderField("programId", program.programId, `pgid-${pIndex}`)}
                            {program?.programName &&
                              renderField("programName", program.programName, `pgnm-${pIndex}`)}
                          </CRow>

                   
                          {program?.therapyData?.length > 0 && (
                            <>
                              <div className="fw-bold mt-3 mb-2" style={{ color: COLORS.primary }}>
                                Therapies
                              </div>

                              <CAccordion>
                                {program.therapyData.map((therapy, tIndex) => (
                                  <CAccordionItem itemKey={tIndex + 1} key={tIndex}>
                                    <CAccordionHeader>
                                      {therapy?.therapyName || `Therapy ${tIndex + 1}`}
                                    </CAccordionHeader>

                                    <CAccordionBody>
                                      <CRow className="g-3">
                                        {therapy?.therapyId &&
                                          renderField("therapyId", therapy.therapyId, `thid-${tIndex}`)}
                                        {therapy?.therapyName &&
                                          renderField("therapyName", therapy.therapyName, `thnm-${tIndex}`)}
                                      </CRow>

                            
                                      {therapy?.exercises?.length > 0 && (
                                        <>
                                          <div
                                            className="fw-bold mt-3 mb-2"
                                            style={{ color: COLORS.primary }}
                                          >
                                            Exercises
                                          </div>

                                          <CAccordion>
                                            {therapy.exercises.map((ex, eIndex) => (
                                              <CAccordionItem
                                                itemKey={eIndex + 1}
                                                key={eIndex}
                                              >
                                                <CAccordionHeader>
                                                  {ex?.exerciseName ||
                                                    `Exercise ${eIndex + 1}`}
                                                </CAccordionHeader>

                                                <CAccordionBody>
                                                  <CRow className="g-3">
                                                    {Object.entries(ex).map(
                                                      ([k, v], i) => {
                                                        if (
                                                          k === "youtubeUrl" &&
                                                          v
                                                        ) {
                                                          let decoded = v
                                                          try {
                                                            decoded = atob(v)
                                                          } catch (e) {}

                                                          return (
                                                            <CCol
                                                              md={4}
                                                              key={`${eIndex}-${i}`}
                                                            >
                                                              <div
                                                                style={{
                                                                  background:
                                                                    "#fff",
                                                                  border:
                                                                    "1px solid #e5e7eb",
                                                                  borderRadius:
                                                                    "10px",
                                                                  padding:
                                                                    "12px",
                                                                  textAlign:
                                                                    "center",
                                                                  height:
                                                                    "100%",
                                                                }}
                                                              >
                                                                <div
                                                                  style={{
                                                                    fontSize:
                                                                      "13px",
                                                                    color:
                                                                      "#64748b",
                                                                    marginBottom:
                                                                      "8px",
                                                                    fontWeight:
                                                                      "600",
                                                                  }}
                                                                >
                                                                  Video
                                                                </div>

                                                                <button
                                                                  onClick={() =>
                                                                    window.open(
                                                                      decoded,
                                                                      "_blank"
                                                                    )
                                                                  }
                                                                  style={{
                                                                    background:
                                                                      COLORS.primary,
                                                                    color:
                                                                      "#fff",
                                                                    border:
                                                                      "none",
                                                                    borderRadius:
                                                                      "8px",
                                                                    padding:
                                                                      "8px 14px",
                                                                    cursor:
                                                                      "pointer",
                                                                  }}
                                                                >
                                                                  ▶ Open Video
                                                                </button>
                                                              </div>
                                                            </CCol>
                                                          )
                                                        }

                                                        return renderField(
                                                          k,
                                                          v,
                                                          `${eIndex}-${i}`
                                                        )
                                                      }
                                                    )}
                                                  </CRow>
                                                </CAccordionBody>
                                              </CAccordionItem>
                                            ))}
                                          </CAccordion>
                                        </>
                                      )}
                                    </CAccordionBody>
                                  </CAccordionItem>
                                ))}
                              </CAccordion>
                            </>
                          )}
                        </CAccordionBody>
                      </CAccordionItem>
                    ))}
                  </CAccordion>
                </>
              )}
            </CAccordionBody>
          </CAccordionItem>
        ))}
      </CAccordion>
    </CCardBody>
  </CCard>
)} */}

          {/* Home Exercise Accordion */}
      {/* HOME EXERCISE */}
{record?.exercisePlan?.exercises?.length > 0 && (
  <CCard style={cardStyle}>
    <CCardBody>
      <div style={titleStyle}>Home Exercise</div>

      <CAccordion>
     {/* HOME EXERCISE */}
{record?.exercisePlan?.exercises?.length > 0 && (
  <CCard style={cardStyle}>
    <CCardBody>
      <div style={titleStyle}>Home Exercise</div>

      <CAccordion>
        {record.exercisePlan.exercises.map((item, index) => (
          <CAccordionItem itemKey={index + 1} key={index}>
            <CAccordionHeader>
              Home Exercise {index + 1}
            </CAccordionHeader>

            <CAccordionBody>
              {/* <CRow className="g-3">
                {Object.entries(item).map(([k, v], i) => {
                  const field = k.toLowerCase()

                  // HIDE IMAGE
                  if (
                    field.includes("image") ||
                    field.includes("thumbnail") ||
                    field.includes("photo")
                  ) {
                    return null
                  }

                  // IF URL STRING => OPEN DIRECTLY
                  if (
                    typeof v === "string" &&
                    (v.startsWith("http://") ||
                      v.startsWith("https://") ||
                      v.startsWith("www."))
                  ) {
                    return (
                      <CCol md={4} key={`${index}-${i}`}>
                        <div
                          style={{
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "10px",
                            padding: "12px",
                            textAlign: "center",
                            height: "100%",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#64748b",
                              marginBottom: "10px",
                              fontWeight: "600",
                            }}
                          >
                            {label(atob(k))}
                          </div>

                          <button
                            onClick={() => window.open(v, "_blank")}
                            style={{
                              background: COLORS.primary,
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              padding: "8px 16px",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            Open Link
                          </button>
                        </div>
                      </CCol>
                    )
                  }

                  return renderField(k, v, `${index}-${i}`)
                })}
              </CRow> */}
<CRow className="g-3">
  {Object.entries(item).map(([k, v], i) => {
    const field = k.toLowerCase()

    // Hide unwanted fields
    if (
      field.includes("thumbnail") ||
      field.includes("photo")
    ) {
      return null
    }

    let value = v

    // Decode base64 text (URL like YouTube)
    try {
      if (
        typeof value === "string" &&
        !value.startsWith("http") &&
        !value.startsWith("data:")
      ) {
        const decoded = atob(value)

        if (
          decoded.startsWith("http://") ||
          decoded.startsWith("https://") ||
          decoded.startsWith("www.")
        ) {
          value = decoded
        }
      }
    } catch (e) {}

    // Check URL
    const isUrl =
      typeof value === "string" &&
      (value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("www."))

    // Check Base64 Image
    const isImage =
      typeof value === "string" &&
      value.startsWith("data:image")

    if (isUrl || isImage) {
      return (
        <CCol md={4} key={`${index}-${i}`}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "12px",
              textAlign: "center",
              height: "100%",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "10px",
                fontWeight: "600",
              }}
            >
              {label(atob(k))}
            </div>

            {/* Image Preview */}
            {isImage && (
              <img
                src={value}
                alt="preview"
                style={{
                  width: "100%",
                  maxHeight: "180px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
            )}

            <button
              onClick={() => window.open(value, "_blank")}
              style={{
                background: COLORS.primary,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {isUrl ? "Open Link" : "View Image"}
            </button>
          </div>
        </CCol>
      )
    }

    return renderField(k, value, `${index}-${i}`)
  })}
</CRow>
            </CAccordionBody>
          </CAccordionItem>
        ))}
      </CAccordion>
    </CCardBody>
  </CCard>
)}
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
              background: COLORS.primary,
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
        <CModalHeader style={{ background: COLORS.primary, color: "#fff" }}>
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
              background: COLORS.primary,
              color: "#fff",
              border: "none",
            }}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      <style>
        {
          `
          .custom-modal-header .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
  opacity: 1;
}
          `
        }
      </style>
    </>
  )
}