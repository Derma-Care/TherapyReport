import React, { useRef, useState, useEffect } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from "@coreui/react";
import jsPDF from "jspdf";
import axios from "axios";
import { wifiUrl } from "../../API/BaseUrl";
import { showCustomToast } from "../../Utils/Toaster";
import { COLORS } from "../../Constant/Themes";

const ConsentFormModal = ({ visible, onClose, onConsentGranted, patientName }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(true);
  useEffect(() => {
    if (visible && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
    }
  }, [visible]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const isCanvasBlank = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    return !pixelBuffer.some(color => color !== 0xffffffff);
  };

  const handleAgreeAndSign = async () => {
    if (isCanvasBlank()) {
      showCustomToast("Please provide a signature before agreeing.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Get Signature Base64
      const canvas = canvasRef.current;
      const signatureImg = canvas.toDataURL("image/png");

      // 2. Fetch Clinic Info
      const storedClinic = localStorage.getItem("selectedClinic");
      const clinicData = storedClinic ? JSON.parse(storedClinic) : {};

      const clinicName = clinicData.name || "PhysioCare Clinic";
      const clinicAddress = clinicData.address || "";
      const clinicEmail = clinicData.email || "";
      const clinicPhone = clinicData.phoneNumber || clinicData.mobile || "";
      const clinicLogo = clinicData.hospitalLogo || null;

      // 3. Generate PDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      let currentY = 20;

      // Hospital Logo
      if (clinicLogo) {
        try {
          doc.addImage(`data:image/png;base64,${clinicLogo}`, "PNG", 15, 10, 30, 30);
        } catch (e) {
          console.error("Failed to add logo to PDF", e);
        }
      }

      // Hospital Info Header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(clinicName, 50, 18);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      if (clinicAddress) { doc.text(clinicAddress, 50, 24); }
      if (clinicEmail) { doc.text(`Email: ${clinicEmail}`, 50, 29); }
      if (clinicPhone) { doc.text(`Phone: ${clinicPhone}`, 50, 34); }

      currentY = 50;
      doc.line(15, currentY - 5, 195, currentY - 5);

      // Consent Title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Media Consent Form", 105, currentY, null, null, "center");
      currentY += 15;

      // Consent Text
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const text = `I, ${patientName || "the patient"}, hereby consent to the recording of images and/or video during my physiotherapy session at ${clinicName}. I understand these media files will be used strictly for clinical tracking and assessment purposes by the therapist.`;
      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 15, currentY);
      currentY += 30;

      // Timestamp & Signature
      const now = new Date();
      doc.text(`Date: ${now.toLocaleDateString()}`, 15, currentY);
      doc.text(`Time: ${now.toLocaleTimeString()}`, 15, currentY + 10);

      doc.text("Patient Signature:", 15, currentY + 30);
      doc.addImage(
        signatureImg,
        "JPEG",
        15,
        currentY + 35,
        60,
        25,
        undefined,
        "FAST"
      );

      // Output as Base64 Data URI
      // const base64Pdf = doc.output("datauristring");
      const base64Pdf = await new Promise((resolve) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result);
        };

        reader.readAsDataURL(doc.output("blob"));
      });

      onConsentGranted(base64Pdf);
      onClose();
      showCustomToast("Consent recorded successfully.", "success");
    } catch (err) {
      console.error(err);
      showCustomToast("Failed to process consent.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CModal visible={visible} onClose={onClose} alignment="center" backdrop="static">
      <CModalHeader>
        <CModalTitle>Patient Media Consent</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#64748b",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            lineHeight: "1.5"
          }}
        >
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            style={{
              marginTop: "3px",
              accentColor: "#2563eb",
              cursor: "pointer"
            }}
          />

          <span>
            I hereby consent to the clinic capturing photographs and/or video recordings
            during assessment and treatment sessions for clinical documentation,
            treatment planning, and progress tracking purposes only. These records will
            be kept confidential and used solely for medical purposes.
          </span>
        </p>
        <div style={{ border: "2px dashed #cbd5e1", borderRadius: 8, background: "#f8fafc", overflow: "hidden" }}>
          <canvas
            ref={canvasRef}
            width={450}
            height={150}
            style={{ width: "100%", height: "150px", touchAction: "none" }}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <CButton color="secondary" variant="ghost" size="sm" onClick={clearCanvas}>
            Clear Signature
          </CButton>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose} disabled={isLoading}>Cancel</CButton>
        <CButton style={{ backgroundColor: COLORS.primary, color: COLORS.white }} onClick={handleAgreeAndSign} disabled={isLoading}>
          {isLoading ? "Saving..." : "Agree & Sign"}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ConsentFormModal;
