import React, { useState, useEffect, useRef } from "react"
import {
  CCard,
  CCardBody,
  CTable,
  CButton,
  CBadge,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from "@coreui/react"

import { useLocation } from "react-router-dom"
import SessionFormModal from "./SessionFormModal"
import { getSessionDetails, getPaidSessions } from "./TheraphyApi"
import SessionViewModal from "./SessionViewModal"
import { COLORS } from "../../Constant/Themes"

const DUMMY_DATA = {
  "bookingId": "BOOK123",
  "patientId": "PAT123",
  "doctorId": "DOC123",
  "doctorName": "Dr. John (Physio)",
  "therapistId": "THER123",
  "therapistName": "Therapy_1",
  "therapistRecordId": "REC123",
  "serviceType": "PACKAGE",
  "totalAmount": 1250,
  "discountAmount": 100,
  "finalAmount": 1150,
  "totalPaid": 800,
  "balanceAmount": 350,
  "paymentStatus": "Partial",
  "sessionStartDate": "14/04/2026",
  "totalSessionCount": 25,
  "noOfSessionCompletedCount": 3,
  "noOfSessionCompletedStatus": false,
  "sessionTableCreatedStatus": true,
  "paymentHistory": [
    {
      "amount": 500,
      "paymentMode": "CASH",
      "paymentType": "Partial",
      "paymentLevel": "PACKAGE",
      "paymentDate": "14/04/2026"
    },
    {
      "amount": 300,
      "paymentMode": "UPI",
      "paymentType": "Partial",
      "paymentLevel": "SESSION",
      "paymentDate": "16/04/2026"
    }
  ],
  "therapyWithSessions": [
    {
      "packageId": "PACK001",
      "packageName": "PACKAGE_1",
      "totalPackagePrice": 1250,
      "paymentStatus": "Partial",
      "programs": [
        {
          "programId": "PROG001",
          "programName": "PROGRAM_1",
          "totalProgramPrice": 625,
          "paymentStatus": "Partial",
          "therapyData": [
            {
              "therapyId": "THER001",
              "therapyName": "THERAPY_1",
              "totalTherapyPrice": 425,
              "paymentStatus": "Partial",
              "exercises": [
                {
                  "exerciseId": "E1",
                  "exerciseName": "Knee Flexion",
                  "pricePerSession": 10,
                  "noOfSessions": 10,
                  "totalExercisePrice": 100,
                  "paymentStatus": "Partial",
                  "repetitions": 10,
                  "frequency": "2/day",
                  "sets": 2,
                  "youtubeUrl": "",
                  "sessions": [
                    {
                      "sessionId": "E1_1",
                      "sessionNo": 1,
                      "date": "14/04/2026",
                      "status": "Completed",
                      "paymentStatus": "Paid"
                    },
                    {
                      "sessionId": "E1_2",
                      "sessionNo": 2,
                      "date": "15/04/2026",
                      "status": "Completed",
                      "paymentStatus": "Paid"
                    },
                    {
                      "sessionId": "E1_3",
                      "sessionNo": 3,
                      "date": "17/04/2026",
                      "status": "Pending",
                      "paymentStatus": "Paid"
                    }
                  ]
                },
                {
                  "exerciseId": "E2",
                  "exerciseName": "Quad Strengthening",
                  "pricePerSession": 20,
                  "noOfSessions": 5,
                  "totalExercisePrice": 100,
                  "paymentStatus": "Partial",
                  "repetitions": 12,
                  "frequency": "3/day",
                  "sets": 4,
                  "youtubeUrl": "",
                  "sessions": [
                    {
                      "sessionId": "E2_1",
                      "sessionNo": 1,
                      "date": "14/04/2026",
                      "status": "Pending",
                      "paymentStatus": "Paid"
                    }
                  ]
                }
              ]
            },
            {
              "therapyId": "THER002",
              "therapyName": "THERAPY_2",
              "totalTherapyPrice": 200,
              "paymentStatus": "Paid",
              "exercises": [
                {
                  "exerciseId": "E3",
                  "exerciseName": "Hamstring Stretch",
                  "pricePerSession": 20,
                  "noOfSessions": 10,
                  "totalExercisePrice": 200,
                  "paymentStatus": "Paid",
                  "repetitions": 10,
                  "frequency": "2/day",
                  "sets": 2,
                  "youtubeUrl": "",
                  "sessions": [
                    {
                      "sessionId": "E3_1",
                      "sessionNo": 1,
                      "date": "17/04/2026",
                      "status": "Pending",
                      "paymentStatus": "Paid"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const cleanHierarchy = (node) => {
  if (!node || node.paymentStatus?.toLowerCase() === 'unpaid') return null;

  let result = { ...node };

  if (Array.isArray(node.sessions)) {
    result.sessions = node.sessions.filter(s => s.paymentStatus?.toLowerCase() !== 'unpaid');
  }

  if (Array.isArray(node.exercises)) {
    result.exercises = node.exercises.map(cleanHierarchy).filter(Boolean);
  }

  if (Array.isArray(node.therapyData)) {
    result.therapyData = node.therapyData.map(cleanHierarchy).filter(Boolean);
  }

  if (Array.isArray(node.programs)) {
    result.programs = node.programs.map(cleanHierarchy).filter(Boolean);
  }

  if (Array.isArray(node.therapyWithSessions)) {
    result.therapyWithSessions = node.therapyWithSessions.map(cleanHierarchy).filter(Boolean);
  }

  return result;
}


const deepUpdateSession = (node, updatedSession) => {
  if (!node) return node;
  let newNode = { ...node };

  if (newNode.sessions) {
    newNode.sessions = newNode.sessions.map(s =>
      s.sessionId === updatedSession.sessionId ? { ...s, ...updatedSession } : s
    );
  }

  ['therapyWithSessions', 'programs', 'therapyData', 'exercises'].forEach(key => {
    if (newNode[key]) {
      newNode[key] = newNode[key].map(child => deepUpdateSession(child, updatedSession));
    }
  });

  return newNode;
}
// const [sets, setSests] = useState(0);
// const [repetation, setRepetation] = useState(0);
 

const extractDirectExercises = (node) => {
  let list = [];
  if (!node) return list;
  if (node.exerciseId && node.sessions) {
    list.push(node);
  }
  ['therapyWithSessions', 'programs', 'therapyData', 'exercises'].forEach(key => {
    if (node[key] && Array.isArray(node[key])) {
      node[key].forEach(child => list = list.concat(extractDirectExercises(child)));
    }
  });
  return list;
}

// Inline Voice Record Modal powered by Real MediaRecorder API
const VoiceRecordModal = ({ visible, onClose, onSave }) => {
  const [status, setStatus] = useState('IDLE'); // IDLE, RECORDING, PAUSED, PREVIEW, STOPPED
  const [timer, setTimer] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    let interval;
    if (status === 'RECORDING') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (visible) {
      setStatus('IDLE');
      setTimer(0);
      setAudioUrl(null);
      chunksRef.current = [];
    }
  }, [visible]);

  const startActualRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url); // Store the playable URL
      }
      recorder.start();
      setStatus('RECORDING');
    } catch (err) {
      console.error(err);
      alert("Microphone access denied or encountered an error.");
    }
  }

  const handlePause = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setStatus('PAUSED');
    }
  }

  const handleResume = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setStatus('RECORDING');
    }
  }

  const handleStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    setStatus('PREVIEW');
  };

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
  });

const handleSend = async () => {
  try {
    setStatus("STOPPED");

    const blob = new Blob(chunksRef.current, {
      type: "audio/webm",
    });

    const base64Audio = await blobToBase64(blob);

    setTimeout(() => {
      onSave(base64Audio); // ✅ send base64 instead of blob url
      onClose();
    }, 1500);
  } catch (error) {
    console.error("Audio convert error:", error);
    setStatus("PREVIEW");
  }
};

  return (
    <CModal visible={visible} onClose={() => status !== 'STOPPED' && onClose()} alignment="center" size="sm" backdrop="static">
      <CModalHeader>
        <CModalTitle>Voice Record</CModalTitle>
      </CModalHeader>
      <CModalBody className="text-center py-4">
        {status !== 'PREVIEW' && status !== 'STOPPED' && (
          <h2 className="mb-4 text-primary" style={{ fontFamily: 'monospace' }}>
            {new Date(timer * 1000).toISOString().substr(14, 5)}
          </h2>
        )}

        {status === 'IDLE' && (
          <CButton color="danger" onClick={startActualRecording}>▶ Start Recording</CButton>
        )}

        {(status === 'RECORDING' || status === 'PAUSED') && (
          <div className="d-flex justify-content-center gap-2">
            {status === 'RECORDING' ? (
              <CButton color="warning" className="text-white" onClick={handlePause}>⏸ Pause</CButton>
            ) : (
              <CButton color="danger" onClick={handleResume}>▶ Resume</CButton>
            )}
            <CButton color="dark" onClick={handleStop}>⏹ Stop Tracking</CButton>
          </div>
        )}

        {status === 'PREVIEW' && (
          <div className="d-flex flex-column align-items-center">
            <div className="fw-bold mb-2">Recording Preview</div>
            <audio controls src={audioUrl} style={{ width: '100%', height: '40px', marginBottom: '15px' }}>
              Your browser does not support the audio element.
            </audio>
            <div className="d-flex w-100 justify-content-center gap-2">
              <CButton color="secondary" variant="outline" onClick={() => { setStatus('IDLE'); setTimer(0); }}>Redo</CButton>
              <CButton color="success" onClick={handleSend}>Send Recording</CButton>
            </div>
          </div>
        )}

        {status === 'STOPPED' && (
          <div className="text-success fw-bold">
            <div className="spinner-border spinner-border-sm me-2 text-success" />
            Storing and sending...
          </div>
        )}
      </CModalBody>
    </CModal>
  );
};

// UI component for displaying live elapsed time
const ElapsedTime = ({ startTimeObj }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTimeObj) return;
    setElapsed(Math.floor((new Date() - startTimeObj) / 1000)); // Reset initial state quickly
    const interval = setInterval(() => {
      setElapsed(Math.floor((new Date() - startTimeObj) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTimeObj]);

  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');

  return <span className="fw-bold" style={{ color: '#dc3545', fontFamily: 'monospace', fontSize: '1.1rem' }}>{mins}:{secs}</span>;
}

const SessionList = () => {
  const location = useLocation()

  // Initial patient info from location.state or DUMMY_DATA skeleton
  const [patientData, setPatientData] = useState(location.state || { name: "John Doe", therapy: "Physiotherapy", });
  const [patientDataSource, setPatientDataSource] = useState(location.state);
  const patient = patientData;

  const [loadingId, setLoadingId] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)

  // Create tree data dynamically
  const [treeData, setTreeData] = useState(() => cleanHierarchy(patientDataSource))

  useEffect(() => {
    const fetchApiData = async () => {
      setDataLoading(true);
      try {
        const storedData = localStorage.getItem('therapistData')
        const raw = storedData ? JSON.parse(storedData) : {}

        const clinicId = raw?.clinicId || raw?.data?.clinicId
        const branchId = raw?.branchId || raw?.data?.branchId

        const bookingId = patientData?.bookingId
        const therapistRecordId = patientData?.therapistRecordId

        if (clinicId && branchId && bookingId && therapistRecordId) {
          const res = await getPaidSessions(clinicId, branchId, bookingId, therapistRecordId);
          if (res && res.data && res.data.therapyWithSessions) {
            setPatientDataSource(res.data);
            setTreeData(cleanHierarchy(res.data));
            setPatientData(prev => ({ ...prev, ...res.data }));
          } else if (res && res.therapyWithSessions) {
            setPatientDataSource(res);
            setTreeData(cleanHierarchy(res));
            setPatientData(prev => ({ ...prev, ...res }));
          }
        }
      } catch (err) {
        console.error("Error fetching patient data", err);
      } finally {
        setDataLoading(false);
      }
    };

    if (!location.state?.therapyWithSessions) {
      fetchApiData();
    }
  }, [location.state])

  const [selected, setSelected] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)

  // Voice Modal State
  const [voiceRecordSession, setVoiceRecordSession] = useState(null)

  // Audio Playback Modal State
  const [audioPlaybackSession, setAudioPlaybackSession] = useState(null)

  // Mapping of sessionId -> startTime (Date object) for the live stopwatches
  const [activeSessions, setActiveSessions] = useState({})

  const formatDisplayTime = (dateObj) => {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  const formatSystemTime = (dateObj) => {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  const handleUpdate = (updated) => {
    const newTree = deepUpdateSession(treeData, updated);
    setTreeData(newTree);
  }

  console.log("activeSessions", treeData);
  const handleStartSession = (sessionId) => {
    setActiveSessions(p => ({ ...p, [sessionId]: new Date() }));
  }

  const handleStopAndComplete = (sessionItem) => {
    const startObj = activeSessions[sessionItem.sessionId];
    const endObj = new Date();

    if (!startObj) return;

    // Convert to whatever time format the form modal uses (usually 24h format for <input type="time" />)
    const startStr = formatSystemTime(startObj);
    const endStr = formatSystemTime(endObj);

    // Clear it from active state
    setActiveSessions(p => {
      const next = { ...p };
      delete next[sessionItem.sessionId];
      return next;
    });

    // Directly update state to mark times without altering the session's main status
    const quickCompleteData = {
      ...sessionItem,
      startTime: startStr,
      endTime: endStr
    };

    // Auto-save logic triggers here
    handleUpdate(quickCompleteData);
  }

  // Still maintaining fallback manually Complete form button if they need edge cases
  const handleManualCompleteFallback = (sessionItem,session) => {
    let calculatedDuration = "";
    if (sessionItem.startTime && sessionItem.endTime) {
      const [startH, startM] = sessionItem.startTime.split(':').map(Number);
      const [endH, endM] = sessionItem.endTime.split(':').map(Number);
      let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
      if (diffMins < 0) diffMins += 24 * 60; // handle overnight

      const hrs = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      calculatedDuration = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} mins`;
    }
    console.log("calculatedDuration", sessionItem);
    console.log("patientDataSource", patientDataSource);
    console.log("patient", patient);
    console.log("patient", session);

    setSelected({
      ...sessionItem,
      mode: "complete",
      sessionTime: calculatedDuration,
      startTime: sessionItem.startTime || "",
      endTime: sessionItem.endTime || "",
      patientName: patient.name,
      bookingId: patientDataSource.bookingId,
      patientId: patientDataSource.patientId,
      serviceType: patientDataSource.serviceType,
      sets: session.sets,
      repetitions: session.repetitions,
      disease: patient.disease,
      therapistRecordId: patient.therapistRecordId,
      voiceRecordUrl: sessionItem.voiceRecordUrl || ""
    })
  }

  const handleVoiceRecordSaved = (audioUrl) => {
    if (voiceRecordSession && audioUrl) {
      handleUpdate({
        ...voiceRecordSession,
        voiceRecordUrl: audioUrl
      });
    }
    setVoiceRecordSession(null);
  }

  const handleView = async (item, therapistRecordId, bookingId) => {
    console.log("item", item);
    console.log("therapistRecordId", patientDataSource.bookingId);

    setLoadingId(item.sessionId) // start loading
    try {
      const storedData = localStorage.getItem('therapistData')
      const raw = storedData ? JSON.parse(storedData) : {}

      const clinicId = raw?.clinicId || raw?.data?.clinicId
      const branchId = raw?.branchId || raw?.data?.branchId

      if (!clinicId || !branchId || !therapistRecordId) {
        console.error("Missing required IDs")
        setSelectedSession(item)
        return
      }

      const res = await getSessionDetails(
        clinicId,
        branchId,
        therapistRecordId,
        item.sessionId //
      )

      if (res && res.data) {
        setSelectedSession(res.data)
      } else if (res) {
        setSelectedSession(res)
      } else {
        setSelectedSession(item) // Fallback
      }
    } catch (err) {
      console.error(err)
      setSelectedSession(item) // Fallback
    } finally {
      setLoadingId(null) // stop loading
    }
  }

  /* --- RENDERING HELPERS --- */

  const isDateToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    if (dateStr === `${dd}/${mm}/${yyyy}` || dateStr === `${yyyy}-${mm}-${dd}`) return true;

    const d = new Date(dateStr);
    if (!isNaN(d.valueOf())) {
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }
    return false;
  };

  const renderSessionsTable = (sessions, exerciseContext) => {
    if (!sessions || sessions.length === 0) {
      return <div className="text-muted p-2 ms-2 fst-italic">No session available</div>;
    }

    const DesktopTable = (
      <CTable bordered className="d-none d-md-table mt-2 mb-2 bg-white align-middle pink-table" responsive size="sm" style={{ fontSize: '0.9rem' }}>
        <thead className="bg-light">
          <tr>
            <th>Session_Id</th>
            <th>Date</th>
            {/* <th>Duration</th> */}
            <th>Session Timing</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, idx) => {
            const activeStartObj = activeSessions[s.sessionId];
            const isRunning = !!activeStartObj;

            return (
              <tr key={s.sessionId || idx}>
                  <td>
                  {s.sessionId}
                  
                </td>
                <td>
                  {s.date || s.sessionDate}
                  {isDateToday(s.date || s.sessionDate) && (
                    <CBadge style={{backgroundColor:COLORS.primary, color:"white"}} className="ms-2">Today</CBadge>
                  )}
                </td>
                {/* <td className="text-nowrap">{s.duration || 'N/A'}</td> */}
                <td className="text-nowrap" style={{ minWidth: "160px" }}>
                  {s.startTime && s.endTime ? (
                    <span className="text-muted"><small>
                      <i>Tracked: <strong>{s.startTime}</strong> to <strong>{s.endTime}</strong></i>
                    </small></span>
                  ) : s.status?.toLowerCase() === "completed" ? (
                    <span className="text-muted"><small><i>Completed natively</i></small></span>
                  ) : (
                    !isRunning ? (
                      <CButton size="sm" style={{ color:COLORS.primary}} variant="outline" className="w-100 fw-bold" onClick={() => handleStartSession(s.sessionId)}>
                        ▶ Start Tracker
                      </CButton>
                    ) : (
                      <div className="d-flex flex-column align-items-center bg-light border border-danger rounded px-2 py-1 shadow-sm">
                        <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                          <span className="spinner-grow spinner-grow-sm text-danger" role="status" aria-hidden="true" style={{ width: '0.6rem', height: '0.6rem' }}></span>
                          <ElapsedTime startTimeObj={activeStartObj} />
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#6c757d" }} className="mb-2">Started {formatDisplayTime(activeStartObj)}</div>
                        <CButton size="sm" color="danger" className="w-100 fw-bold text-white shadow" onClick={() => handleStopAndComplete(s)}>
                          ⏹ Stop & Save Time
                        </CButton>
                      </div>
                    )
                  )}
                </td>
                <td className="text-nowrap">
                  <div>
                    <CBadge color={s.status?.toLowerCase() === 'completed' ? 'success' : 'warning'}>
                      {s.status || 'Pending'}
                    </CBadge>
                  </div>
                </td>
                <td className="text-nowrap">
                  <div className="d-flex gap-1 border-0">
                    {/* Swap to Play button if audio is attached, else show Mic button if not completed */}
                    {s.voiceRecordUrl ? (
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        onClick={() => setAudioPlaybackSession(s)}
                        title="Play Recording"
                      >
                        ▶️ Play
                      </CButton>
                    ) : (s.status?.toLowerCase() !== "completed" && (
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="outline"
                        onClick={() => setVoiceRecordSession(s)}
                        title="Voice Record"
                      >
                        🎤 Record
                      </CButton>
                    ))}

                    {s.status?.toLowerCase() !== "completed" ? (
                      <CButton
                        size="sm"
                       style={{color:"white", backgroundColor:COLORS.primary}}
                        title="Manual Complete (Fallback)"
                        onClick={() => handleManualCompleteFallback(s,exerciseContext)}
                      >
                        Complete Form
                      </CButton>
                    ) : (
                      <CButton
                        size="sm"
                        color="primary"
                        disabled={loadingId === s.sessionId}
                        onClick={() => handleView(s, patient.therapistRecordId, patient)}
                      >
                        {loadingId === s.sessionId ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          "View"
                        )}
                      </CButton>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </CTable>
    );

    const MobileCards = (
      <div className="d-block d-md-none mt-2">
        {sessions.map((s, idx) => {
          const activeStartObj = activeSessions[s.sessionId];
          const isRunning = !!activeStartObj;

          return (
            <CCard key={s.sessionId || idx} className="mb-3 shadow-sm border-light">
              <CCardBody className="p-3">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                  <span className="fw-bold">
                    {s.date || s.sessionDate}
                    {isDateToday(s.date || s.sessionDate) && (
                      <CBadge  className="ms-2" style={{backgroundColor:COLORS.primary}}>Today</CBadge>
                    )}
                  </span>
                  <CBadge color={s.status?.toLowerCase() === 'completed' ? 'success' : 'warning'}>
                    {s.status || 'Pending'}
                  </CBadge>
                </div>
                {/* <div className="d-flex justify-content-between mb-3 text-muted" style={{ fontSize: '0.85rem' }}>
                  <span>Duration: {s.duration || 'N/A'}</span>
                </div> */}

                <div className="mb-3">
                  {s.startTime && s.endTime ? (
                    <div className="text-muted text-center p-2 bg-light rounded"><small>
                      <i>Tracked: <strong>{s.startTime}</strong> to <strong>{s.endTime}</strong></i>
                    </small></div>
                  ) : s.status?.toLowerCase() === "completed" ? (
                    <div className="text-muted text-center p-2 bg-light rounded"><small><i>Completed natively</i></small></div>
                  ) : (
                    !isRunning ? (
                      <CButton size="sm" color="success" variant="outline" className="w-100 fw-bold py-2" onClick={() => handleStartSession(s.sessionId)}>
                        ▶ Start Tracker
                      </CButton>
                    ) : (
                      <div className="d-flex flex-column align-items-center bg-light border border-danger rounded p-3 shadow-sm">
                        <div className="d-flex w-100 justify-content-between align-items-center mb-2">
                          <span className="spinner-grow spinner-grow-sm text-danger" role="status" aria-hidden="true" style={{ width: '0.8rem', height: '0.8rem' }}></span>
                          <ElapsedTime startTimeObj={activeStartObj} />
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#6c757d" }} className="mb-3">Started {formatDisplayTime(activeStartObj)}</div>
                        <CButton size="sm" color="danger" className="w-100 fw-bold text-white shadow py-2" onClick={() => handleStopAndComplete(s)}>
                          ⏹ Stop & Save Time
                        </CButton>
                      </div>
                    )
                  )}
                </div>

                <div className="d-flex gap-2">
                  {/* Action buttons side by side */}
                  {s.voiceRecordUrl ? (
                    <CButton size="sm" color="info" variant="outline" className="w-100" onClick={() => setAudioPlaybackSession(s)}>
                      ▶️ Play
                    </CButton>
                  ) : (s.status?.toLowerCase() !== "completed" && (
                    <CButton size="sm" color="secondary" variant="outline" className="w-100" onClick={() => setVoiceRecordSession(s)}>
                      🎤 Record
                    </CButton>
                  ))}

                  {s.status?.toLowerCase() !== "completed" ? (
                    <CButton size="sm" color="secondary" className="w-100" onClick={() => handleManualCompleteFallback(s,exerciseContext)}>
                      Complete Form
                    </CButton>
                  ) : (
                    <CButton size="sm" color="primary" className="w-100" disabled={loadingId === s.sessionId} onClick={() => handleView(s, patient.therapistRecordId)}>
                      {loadingId === s.sessionId ? <span className="spinner-border spinner-border-sm" /> : "View"}
                    </CButton>
                  )}
                </div>
              </CCardBody>
            </CCard>
          )
        })}
      </div>
    );

    return (
      <>
        {DesktopTable}
        {MobileCards}
      </>
    );
  }

  const renderExercise = (ex) => {
    const hasTodaySession = ex.sessions && ex.sessions.some(s => isDateToday(s.date || s.sessionDate));
// setSests(ex.sets);
// setRepetation(ex.repetitions);
    return (
      <CAccordionItem itemKey={`ex-${ex.exerciseId}`} key={ex.exerciseId}>
        <CAccordionHeader>
          <span className="fw-semibold " style={{ color:COLORS.primary}}>Exercise: {ex.exerciseName}</span>
          {hasTodaySession && (
            <CBadge style={{backgroundColor:COLORS.primary, color:"white"}} className="ms-2">Today</CBadge>
          )}
        </CAccordionHeader>
        <CAccordionBody>
          <div className="mb-2" style={{ fontSize: '0.85rem' }}>
            <strong>Freq:</strong> {ex.frequency} &bull; <strong>Sets:</strong> {ex.sets} &bull; <strong>Reps:</strong> {ex.repetitions}
          </div>
          {renderSessionsTable(ex.sessions, ex)}
        </CAccordionBody>
      </CAccordionItem>
    );
  }

  const renderHierarchy = (node) => {
    let exercises = extractDirectExercises(node);

    if (!exercises || exercises.length === 0) {
      return <div className="text-muted p-4 shadow-sm bg-light rounded text-center">No exercises available for this service type.</div>;
    }

    const initialKeys = exercises.length > 0 ? [`ex-${exercises[0].exerciseId}`] : [];

    return (
      <CAccordion alwaysOpen activeItemKey={initialKeys} style={{color:COLORS.primary}}>
        {exercises.map(renderExercise)}
      </CAccordion>
    );
  }

  return (
    <CCard>
      <CCardBody style={{color: COLORS.primary}}>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div>
            <h4 className="fw-bold mb-1" style={{color: COLORS.primary}}>{patient.name || 'Patient Sessions'}</h4>
            <div className="text-muted" style={{color: COLORS.primary}}><strong>Doctor:</strong> {patient.doctorName || patientDataSource.doctorName || 'N/A'}</div>
          </div>
          <div className="text-end" style={{backgroundColor: COLORS.primary}}>
            <CBadge   shape="rounded-pill" style={{ fontSize: '1rem', padding: '8px 16px',color: "white" }}>
              {patientDataSource.serviceType || 'CUSTOM'}
            </CBadge>
          </div>
        </div>

        <div className="hierarchy-container">
          {renderHierarchy(treeData)}
        </div>

        {/* Dynamic Modals */}
        <VoiceRecordModal
          visible={!!voiceRecordSession}
          onClose={() => setVoiceRecordSession(null)}
          onSave={handleVoiceRecordSaved}
        />

        {audioPlaybackSession && (
          <CModal visible={true} onClose={() => setAudioPlaybackSession(null)} alignment="center" size="sm">
            <CModalHeader>
              <CModalTitle>Playback Recording</CModalTitle>
            </CModalHeader>
            <CModalBody className="text-center py-4">
              <audio controls autoPlay src={audioPlaybackSession.voiceRecordUrl} style={{ width: '100%' }}>
                Your browser does not support the audio element.
              </audio>
            </CModalBody>
          </CModal>
        )}

        {selected && selected.mode === "complete" && (
          <SessionFormModal
            visible={true}
            data={selected}
            onClose={() => setSelected(null)}
            onSave={handleUpdate}
          />
        )}

        {selectedSession && (
          <SessionViewModal
            visible={true}
            data={selectedSession}
            onClose={() => {
              setSelected(null)
              setSelectedSession(null)
            }}
          />
        )}
      </CCardBody>
    </CCard>
  )
}

export default SessionList