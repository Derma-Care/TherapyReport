import React, { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import { showCustomToast } from "../../Utils/Toaster";
import { uploadFile } from "../../Utils/S3UploadService";
import { COLORS } from "../../Constant/Themes";

/* ─── inline styles as constants to keep JSX clean ─── */
const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1050,
    padding: "1rem",
  },
  modal: {
    background: "#ffffff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "560px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 1,
    borderRadius: "16px 16px 0 0",
  },
  headerIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  closeBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    fontSize: "20px",
    lineHeight: 1,
    padding: "4px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
  },
  body: {
    padding: "1.25rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  sectionLabel: {
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#94a3b8",
    marginBottom: "10px",
  },
  detailCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "1rem 1.1rem",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "10px",
  },
  fieldLabel: {
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#94a3b8",
    marginBottom: "3px",
  },
  fieldValue: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#0f172a",
  },
  fullField: {
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "1px solid #e2e8f0",
  },
  consentBox: {
    border: "1px solid #bfdbfe",
    borderLeft: "3px solid #3b82f6",
    borderRadius: "0 10px 10px 0",
    padding: "12px 14px",
    background: "#eff6ff",
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
  },
  checkbox: {
    marginTop: "2px",
    accentColor: "#2563eb",
    cursor: "pointer",
    width: "15px",
    height: "15px",
    flexShrink: 0,
  },
  consentText: {
    fontSize: "13px",
    color: "#334155",
    lineHeight: "1.7",
    margin: 0,
  },
  sigSection: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
  },
  sigHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  sigLabel: {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#64748b",
  },
  clearBtn: {
    background: "none",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    color: "#64748b",
    padding: "3px 10px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  canvasWrap: {
    position: "relative",
    background: "#fff",
    cursor: "crosshair",
  },
  canvasHint: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "12px",
    color: "#cbd5e1",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  },
  canvasLine: {
    position: "absolute",
    bottom: "22px",
    left: "16px",
    right: "16px",
    height: "1px",
    background: "#e2e8f0",
    pointerEvents: "none",
  },
  warning: {
    fontSize: "12px",
    color: "#ef4444",
    padding: "6px 12px",
    background: "#fef2f2",
    borderTop: "1px solid #fecaca",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  footer: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    gap: "10px",
    position: "sticky",
    bottom: 0,
    background: "#fff",
    borderRadius: "0 0 16px 16px",
  },
  cancelBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  agreeBtn: (loading) => ({
    flex: 2,
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: loading ? "#93c5fd" : COLORS.primary,
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background 0.2s",
  }),
};

const Field = ({ label, value }) => (
  <div>
    <div style={S.fieldLabel}>{label}</div>
    <div style={S.fieldValue}>{value || "N/A"}</div>
  </div>
);

const ConsentFormModal = ({
  visible,
  onClose,
  onConsentGranted,
  patientName,
  doctorName,
  bookingId,
  bookingDate,
  bookingTime,
  longActivityName,
  sessionId,
  sessionNumber,
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (visible && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      setHasSig(false);
      setShowWarning(false);
    }
  }, [visible]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSig(true);
    setShowWarning(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };

  const isCanvasBlank = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pixelBuffer = new Uint32Array(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    return !pixelBuffer.some((color) => color !== 0xffffffff);
  };

  const handleAgreeAndSign = async () => {
    if (isCanvasBlank()) {
      setShowWarning(true);
      showCustomToast("Please provide a signature before agreeing.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const canvas = canvasRef.current;
      const signatureImg = canvas.toDataURL("image/png");

      const storedClinic = localStorage.getItem("selectedClinic");
      const branchName = localStorage.getItem("branchName");
      const clinicData = storedClinic ? JSON.parse(storedClinic) : {};
      const clinicName = clinicData.name || "PhysioCare Clinic";
      const clinicAddress = clinicData.address || "";
      const clinicEmail = clinicData.emailAddress || "";
      const clinicPhone = clinicData.phoneNumber || clinicData.contactNumber || "";
      const clinicLogo = clinicData.hospitalLogo || null;

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      let y = 10;

      /* ── Logo ── */
      if (clinicLogo) {
        try { doc.addImage(`data:image/png;base64,${clinicLogo}`, "PNG", 15, y, 28, 28); } catch { }
      }

      /* ── Clinic header ── */
      doc.setFontSize(15); doc.setFont("helvetica", "bold");
      doc.text(clinicName, clinicLogo ? 50 : 15, y + 8);
      doc.setFontSize(9); doc.setFont("helvetica", "normal");
      if (clinicAddress) doc.text(clinicAddress, clinicLogo ? 50 : 15, y + 14);
      if (clinicEmail) doc.text(`Email: ${clinicEmail}`, clinicLogo ? 50 : 15, y + 19);
      if (clinicPhone) doc.text(`Phone: ${clinicPhone}`, clinicLogo ? 50 : 15, y + 24);
      if (branchName) {
        doc.text(`Branch: ${branchName}`, clinicLogo ? 50 : 15, y + 29);
      }
      y = 44;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(15, y, 195, y);
      y += 8;

      /* ── Title ── */
      doc.setFontSize(14); doc.setFont("helvetica", "bold");
      doc.text("Media Consent Form", 105, y, null, null, "center");
      y += 12;

      /* ── Patient & Session Details ── */
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, y, 180, 38, 3, 3, "F");
      doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
      doc.setTextColor(148, 163, 184);
      doc.text("PATIENT & SESSION DETAILS", 20, y + 6);

      doc.setTextColor(15, 23, 42);
      const detailRows = [
        [["Patient", patientName], ["Doctor", doctorName]],
        [["Booking ID", bookingId], ["Session ID", sessionId]],
        [["Session No.", sessionNumber ? `#${sessionNumber}` : "N/A"], ["Session Date", bookingDate]],
      ];

      let dy = y + 13;
      detailRows.forEach((row) => {
        row.forEach(([lbl, val], i) => {
          doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
          doc.text(lbl.toUpperCase(), i === 0 ? 20 : 110, dy);
          doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(15, 23, 42);
          doc.text(val || "N/A", i === 0 ? 20 : 110, dy + 4);
        });
        dy += 10;
      });

      y += 40;

      /* ── Long Activity Name ── */
      if (longActivityName) {
        y += 4;
        doc.setFillColor(239, 246, 255);
        doc.setDrawColor(191, 219, 254);
        doc.setLineWidth(0.3);
        doc.roundedRect(15, y, 180, 14, 2, 2, "FD");
        doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
        doc.text("ACTIVITY", 20, y + 5);
        doc.setFontSize(9.5); doc.setFont("helvetica", "normal"); doc.setTextColor(15, 23, 42);
        doc.text(doc.splitTextToSize(longActivityName, 170)[0], 20, y + 11);
        y += 18;
      }

      /* ── Consent Text ── */
      y += 6;

      doc.setFillColor(239, 246, 255);
      doc.setDrawColor(147, 197, 253);
      doc.setLineWidth(0.6);
      doc.line(15, y, 15, y + 40);

      doc.setFillColor(239, 246, 255);
      doc.rect(16, y, 179, 40, "F");

      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);

      let x = 20;
      let textY = y + 7;

      // Normal text
      doc.setFont("helvetica", "normal");
      doc.text("I,", x, textY);

      x += 5;

      // Bold patient name
      doc.setFont("helvetica", "bold");
      doc.text(patientName || "the patient", x, textY);

      x += doc.getTextWidth(patientName || "the patient") + 2;

      // Normal text
      doc.setFont("helvetica", "normal");
      const remainingText1 =
        ", hereby consent to ";

      doc.text(remainingText1, x, textY);

      x += doc.getTextWidth(remainingText1);

      // Bold clinic name
      doc.setFont("helvetica", "bold");
      doc.text(clinicName, x, textY);

      x += doc.getTextWidth(clinicName) + 2;

      // Remaining paragraph
      doc.setFont("helvetica", "normal");

      const remainingText2 =
        " capturing photographs and/or video recordings during physiotherapy assessment and treatment sessions. I understand that these media files will be used strictly for clinical documentation, treatment planning, progress tracking, and assessment purposes only by the therapist and clinic staff. I acknowledge that this consent is voluntary, and all records will be kept confidential and used solely for medical purposes.";

      const splitText = doc.splitTextToSize(remainingText2, 170);

      doc.text(splitText, 20, textY + 6);

      y += 46;

      /* ── Timestamp ── */
      const now = new Date();
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
      doc.text(`Date: ${now.toLocaleDateString()}`, 15, y);
      doc.text(`Time: ${now.toLocaleTimeString()}`, 80, y);
      y += 14;

      /* ── Signature ── */
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
      doc.text("PATIENT SIGNATURE", 15, y);
      y += 4;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(15, y, 80, 30, 2, 2, "FD");
      doc.addImage(signatureImg, "PNG", 16, y + 1, 78, 28, undefined, "FAST");
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(105, y + 28, 185, y + 28);
      doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
      // doc.text("Authorised by clinic staff", 105, y + 33);
      y += 40;

      /* ── Footer ── */
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(15, y, 195, y);
      y += 6;
      doc.setFontSize(7.5); doc.setTextColor(148, 163, 184);
      doc.text("This document is digitally generated and stored securely. For queries contact the clinic.", 105, y, null, null, "center");

      /* ── Upload ── */
      const pdfBlob = doc.output("blob");
      const file = new File([pdfBlob], `${patientName || "Patient"}_Consent.pdf`, { type: "application/pdf" });
      const fileKey = await uploadFile("consentPdf", file);

      onConsentGranted(fileKey);
      onClose();
      showCustomToast("Consent recorded successfully.", "success");
    } catch (err) {
      console.error(err);
      showCustomToast("Failed to process consent.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;
  const storedClinic = localStorage.getItem("selectedClinic");
  const clinicData = storedClinic ? JSON.parse(storedClinic) : {};
  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}>
      <div style={S.modal} role="dialog" aria-modal="true" aria-label="Patient Media Consent">

        {/* ── Header ── */}
        <div style={S.header}>
          <div style={S.headerIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Patient media consent</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "1px" }}>Recording authorization · PhysioCare Clinic</div>
          </div>
          <button style={S.closeBtn} onClick={onClose} disabled={isLoading} aria-label="Close">✕</button>
        </div>

        {/* ── Body ── */}
        <div style={S.body}>

          {/* Detail card */}
          <div style={S.detailCard}>
            <div style={S.sectionLabel}>Patient &amp; session details</div>
            <div style={S.grid3}>
              <Field label="Patient" value={patientName} />
              <Field label="Doctor" value={doctorName} />
              <Field label="Booking ID" value={bookingId} />
              <Field label="Session ID" value={sessionId} />
              <Field label="Session No." value={sessionNumber ? `#${sessionNumber}` : null} />
              {bookingDate && <Field label="Session Date" value={bookingDate} />}
            </div>
            {longActivityName && (
              <div style={S.fullField}>
                <div style={S.fieldLabel}>Activity</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", lineHeight: "1.5" }}>
                  {longActivityName}
                </div>
              </div>
            )}
          </div>

          {/* Consent statement */}
          <div style={S.consentBox}>
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              style={S.checkbox}
            />


            <p style={S.consentText}>
              I, <strong>{patientName || "the patient"}</strong>, hereby consent to <strong>{clinicData.name}</strong> capturing photographs and/or video recordings during physiotherapy assessment and treatment sessions. I understand that these media files will be used strictly for clinical documentation, treatment planning, progress tracking, and assessment purposes only by the therapist and clinic staff. I acknowledge that this consent is voluntary, and all records will be kept confidential and used solely for medical purposes.
            </p>
          </div>

          {/* Signature pad */}
          <div style={S.sigSection}>
            <div style={S.sigHeader}>
              <span style={S.sigLabel}>
                <span style={{ marginRight: "6px" }}>✍</span> Patient signature
              </span>
              <button style={S.clearBtn} onClick={clearCanvas}>
                ↺ Clear
              </button>
            </div>
            <div style={S.canvasWrap}>
              <canvas
                ref={canvasRef}
                width={520}
                height={140}
                style={{ display: "block", width: "100%", height: "140px", touchAction: "none" }}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
              />
              {!hasSig && (
                <div style={S.canvasHint}>Sign here with mouse or touch</div>
              )}
              <div style={S.canvasLine} />
            </div>
            {showWarning && (
              <div style={S.warning}>
                <span>⚠</span> Please provide a signature before agreeing.
              </div>
            )}
          </div>

        </div>

        {/* ── Footer ── */}
        <div style={S.footer}>
          <button style={S.cancelBtn} onClick={onClose} disabled={isLoading}>Cancel</button>
          <button style={S.agreeBtn(isLoading)} onClick={handleAgreeAndSign} disabled={isLoading}>
            {isLoading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                    <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite" />
                  </path>
                </svg>
                Saving…
              </>
            ) : (
              <>

                Agree &amp; sign consent
              </>
            )}
          </button>
        </div>

      </div>
    </div >
  );
};

export default ConsentFormModal;