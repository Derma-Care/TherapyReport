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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const stopStreamAndTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping media recorder:", e);
      }
      mediaRecorderRef.current = null;
    }
    chunksRef.current = [];
  };

  useEffect(() => {
    if (visible) {
      setFile(null);
      setPreviewUrl(null);
      setIsLoading(false);
      setIsRecording(false);
      setRecordingSeconds(0);
    } else {
      stopStreamAndTimer();
    }
    return () => {
      stopStreamAndTimer();
    };
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
      setIsLoading(true);
      // 1 MB limit
      if (selectedFile.size > 1 * 1024 * 1024) {
        showCustomToast("Video must be 1 MB or smaller.", "error");
        setIsLoading(false);
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
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      video.onerror = function () {
        window.URL.revokeObjectURL(video.src);
        showCustomToast("Failed to load video file. Make sure it is a valid, playable format.", "error");
        setIsLoading(false);
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

  const getSupportedMimeType = () => {
    const types = [
      "video/mp4;codecs=avc1,mp4a",
      "video/mp4",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  };

  const startRecording = async () => {
    setCaptureMode("video");
    setIsLoading(true);
    setRecordingSeconds(0);
    chunksRef.current = [];

    try {
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        },
        audio: true
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setIsRecording(true);
      setIsLoading(false);

      // Delay briefly to allow rendering of video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 50);

      const options = { videoBitsPerSecond: 350000 };
      const mimeType = getSupportedMimeType();
      if (mimeType) {
        options.mimeType = mimeType;
      }

      const recorder = new MediaRecorder(mediaStream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        // Stop stream tracks here to ensure recorder has all data
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const blobType = mimeType || "video/webm";
        const videoBlob = new Blob(chunksRef.current, { type: blobType });

        if (videoBlob.size === 0 || chunksRef.current.length === 0) {
          showCustomToast("Recorded video is empty. Please try again.", "error");
          setPreviewUrl(null);
          setFile(null);
          setIsRecording(false);
          return;
        }

        setFile(videoBlob);
        setPreviewUrl(URL.createObjectURL(videoBlob));
        setIsRecording(false);
      };

      recorder.start();

      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds += 1;
        setRecordingSeconds(seconds);
        if (seconds >= 20) {
          stopRecording();
          showCustomToast("Recording stopped automatically at 20 seconds.", "info");
        }
      }, 1000);

    } catch (err) {
      console.error("Failed to start recording:", err);
      showCustomToast("Could not start live recording. Opening camera fallback...", "warning");
      setIsLoading(false);
      setIsRecording(false);
      triggerFileInput("video");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSave = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
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
      <style>{`
        @keyframes pulse-recording {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      <CModalHeader>
        <CModalTitle>Capture {type === "before" ? "Before" : "After"} Media</CModalTitle>
      </CModalHeader>
      <CModalBody className="text-center" style={{ position: "relative" }}>
        
        {isLoading && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(255,255,255,0.85)", zIndex: 10,
            display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
          }}>
            <div className="spinner-border text-primary" role="status" style={{ marginBottom: 12 }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <strong style={{ color: "#0ea5e9" }}>Processing media... Please wait.</strong>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          accept={captureMode === "image" ? "image/*" : "video/*"}
          capture="environment"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {!previewUrl && !isRecording ? (
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
              onClick={startRecording}
            >
              <Video size={32} color="#6d28d9" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#6d28d9" }}>Record Video</div>
            </div>
          </div>
        ) : isRecording ? (
          <div style={{ position: "relative", background: "#000", borderRadius: 8, overflow: "hidden" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", maxHeight: 300, background: "#000", objectFit: "contain" }}
            />
            
            <div style={{
              position: "absolute", top: 12, left: 12,
              background: "rgba(0,0,0,0.6)", borderRadius: 20,
              padding: "4px 10px", display: "flex", alignItems: "center", gap: 6,
              color: "#fff", fontSize: "0.8rem", fontWeight: 600
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%", background: "#ef4444",
                animation: "pulse-recording 1s infinite"
              }} />
              <span>REC {recordingSeconds}s / 20s</span>
            </div>

            <div style={{
              position: "absolute", bottom: 0, left: 0, height: 4,
              background: "#ef4444", width: `${(recordingSeconds / 20) * 100}%`,
              transition: "width 1s linear"
            }} />

            <div style={{ padding: "12px", background: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", gap: "1rem" }}>
              <CButton color="danger" size="sm" onClick={stopRecording} style={{ fontWeight: 600 }}>
                Stop Recording
              </CButton>
              <CButton color="secondary" size="sm" onClick={() => { stopStreamAndTimer(); setIsRecording(false); }} style={{ fontWeight: 600 }}>
                Cancel
              </CButton>
            </div>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {captureMode === "image" ? (
              <img src={previewUrl} alt="Preview" style={{ width: "100%", borderRadius: 8, maxHeight: 300, objectFit: "contain", background: "#000" }} />
            ) : (
              <video 
                key={previewUrl}
                src={previewUrl} 
                controls 
                playsInline 
                preload="auto" 
                style={{ width: "100%", borderRadius: 8, maxHeight: 300, background: "#000" }} 
              />
            )}
            <CButton 
              color="secondary" 
              size="sm" 
              style={{ position: "absolute", top: 10, right: 10 }}
              onClick={() => {
                setPreviewUrl(null);
                setFile(null);
              }}
            >
              Retake
            </CButton>
          </div>
        )}

      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose} disabled={isLoading || isRecording}>Cancel</CButton>
        <CButton color="primary" onClick={handleSave} disabled={!file || isLoading || isRecording}>
          {isLoading ? "Saving..." : "Save Media"}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default MediaCaptureModal;
