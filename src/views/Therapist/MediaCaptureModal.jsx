import React, { useRef, useState, useEffect } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from "@coreui/react";
import axios from "axios";
import { wifiUrl } from "../../API/BaseUrl";
import { showCustomToast } from "../../Utils/Toaster";
import { Camera, Video } from "lucide-react";
import imageCompression from "browser-image-compression";

const MediaCaptureModal = ({ visible, onClose, type, onMediaSaved }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [captureMode, setCaptureMode] = useState("image"); // 'image' or 'video'

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setFile(null);
      setPreviewUrl(null);
      setIsLoading(false);
    }
  }, [visible]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (captureMode === "image") {
      setIsLoading(true);
      try {
        const options = {
          maxSizeMB: 0.25, // 250 KB limit
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(selectedFile, options);
        setFile(compressedFile);
        setPreviewUrl(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Compression error:", error);
        showCustomToast("Failed to compress image.", "error");
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } else if (captureMode === "video") {
      // 1 MB limit
      if (selectedFile.size > 1 * 1024 * 1024) {
        showCustomToast("Video must be 1 MB or smaller.", "error");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      
      // 20 Seconds limit
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 20) {
          showCustomToast("Video duration must be 20 seconds or less.", "error");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      video.src = URL.createObjectURL(selectedFile);
    }
  };

  const triggerFileInput = (mode) => {
    setCaptureMode(mode);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 100);
  };

  const handleSave = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      // Return file as base64 data URI directly instead of uploading
      const reader = new FileReader();
      reader.onloadend = () => {
        onMediaSaved(reader.result);
        onClose();
        showCustomToast("Media saved successfully.", "success");
        setIsLoading(false);
      };
      reader.onerror = () => {
        showCustomToast("Failed to read media.", "error");
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      showCustomToast("Failed to save media.", "error");
      setIsLoading(false);
    }
  };

  return (
    <CModal visible={visible} onClose={onClose} alignment="center" backdrop="static">
      <CModalHeader>
        <CModalTitle>Capture {type === "before" ? "Before" : "After"} Media</CModalTitle>
      </CModalHeader>
      <CModalBody className="text-center">
        
        {/* Hidden File Input */}
        <input
          type="file"
          accept={captureMode === "image" ? "image/*" : "video/*"}
          capture="environment"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {!previewUrl ? (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", padding: "2rem 0" }}>
            <div 
              style={{ padding: "1.5rem", border: "1.5px solid #0ea5e9", borderRadius: 12, cursor: "pointer", background: "#f0f9ff", width: 120 }}
              onClick={() => triggerFileInput("image")}
            >
              <Camera size={32} color="#0369a1" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0369a1" }}>Take Photo</div>
            </div>
            
            <div 
              style={{ padding: "1.5rem", border: "1.5px solid #8b5cf6", borderRadius: 12, cursor: "pointer", background: "#f5f3ff", width: 120 }}
              onClick={() => triggerFileInput("video")}
            >
              <Video size={32} color="#6d28d9" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#6d28d9" }}>Record Video</div>
            </div>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {captureMode === "image" ? (
              <img src={previewUrl} alt="Preview" style={{ width: "100%", borderRadius: 8, maxHeight: 300, objectFit: "contain", background: "#000" }} />
            ) : (
              <video src={previewUrl} controls style={{ width: "100%", borderRadius: 8, maxHeight: 300, background: "#000" }} />
            )}
            <CButton 
              color="secondary" 
              size="sm" 
              style={{ position: "absolute", top: 10, right: 10 }}
              onClick={() => setPreviewUrl(null)}
            >
              Retake
            </CButton>
          </div>
        )}

      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose} disabled={isLoading}>Cancel</CButton>
        <CButton color="primary" onClick={handleSave} disabled={!file || isLoading}>
          {isLoading ? "Saving..." : "Save Media"}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default MediaCaptureModal;
