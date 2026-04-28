/* eslint-disable prettier/prettier */

import axios from "axios"
import { BASE_URL, wifiUrl } from "../../API/BaseUrl"

/* ================= CREATE ================= */
export const createTherapyExercise = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/createTherapyExercises`, data)
    return res.data
  } catch (error) {
    console.log("createTherapyExercise error", error)
    throw error
  }
}

/* ================= GET ================= */
export const getTherapyExercise = async (clinicId, branchId) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/getBytherapyExercisesClinicIdAndBranchId/${clinicId}/${branchId}`
    )
    return res.data
  } catch (error) {
    console.log("getTherapyExercise error", error)
    throw error
  }
}

/* ================= GET BY ID ================= */
export const getTherapyExerciseById = async (clinicId, branchId, therapyExercisesId) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/getBytherapyExercisesClinicIdAndBranchIdAndtherapyExercisesId/${clinicId}/${branchId}/${therapyExercisesId}`
    )
    return res.data
  } catch (error) {
    console.log("getTherapyExerciseById error", error)
    throw error
  }
}

/* ================= UPDATE ================= */
export const updateTherapyExercise = async (therapyExercisesId, data) => {
  try {
    const res = await axios.put(
      `${BASE_URL}/updateTherapyExercisesById/${therapyExercisesId}`,
      data
    )
    return res.data
  } catch (error) {
    console.log("updateTherapyExercise error", error)
    throw error
  }
}

/* ================= DELETE ================= */
export const deleteTherapyExercise = async (therapyExercisesId) => {
  try {
    const res = await axios.delete(
      `${BASE_URL}/deleteTherapyExercisesById/${therapyExercisesId}`
    )
    return res.data
  } catch (error) {
    console.log("deleteTherapyExercise error", error)
    throw error
  }
}

/* ================= CLINIC DATA ================= */
export const getClinicData = async (clinicId, branchId, therapistId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/getByClinicIdBranchIdAndTherapistId/${clinicId}/${branchId}/${therapistId}`
    )
    return response.data
  } catch (error) {
    console.error("Error fetching clinic data:", error)
    throw error
  }
}

/* ================= THERAPY NOTES ================= */
export const createTherapyNotes = async (data) => {
  console.log(data)
  try {
    const res = await axios.post(`${BASE_URL}/saveRecord`, data)
    return res.data
  } catch (error) {
    console.log("saveRecord error", error)
    throw error
  }
}

/* ================= DASHBOARD ================= */
/* ================= ASSIGNED PATIENTS (DASHBOARD) ================= */
export const getDashboard = async (clinicId, branchId, therapistId, statusId = 1) => {
  try {
    const res = await axios.get(
      `${wifiUrl}/api/physiotherapy-doctor/assigned-patients/${clinicId}/${branchId}/${therapistId}/${statusId}`
    )
    return res.data  // ✅ return full response: { data: [...], message, status, success }
  } catch (err) {
    console.error("Assigned Patients API Error:", err)
    return null
  }
}

/* ================= GET PAID SESSIONS ================= */
export const getPaidSessions = async (clinicId, branchId, bookingId, therapistRecordId) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/getPaidSessionsByClinicIdBranchIdBookingIdAndTherapistRecordId/${clinicId}/${branchId}/${bookingId}/${therapistRecordId}`
    )
    return res.data
  } catch (err) {
    console.error("API Error (getPaidSessions):", err)
    return null
  }
}

/* ================= SESSION DETAILS ================= */
export const getSessionDetails = async (clinicId, branchId, therapistId, sessionId) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/getRecordByClinicIdBranchIdtherapistRecordIdAndSessionId/${clinicId}/${branchId}/${therapistId}/${sessionId}`
    )
    return res.data
  } catch (err) {
    console.error("API Error:", err)
    return null
  }
}

export const getBookingByBookingId = async (clinicId, branchId, patientId, bookingId, therapistRecordId) => {
  try {
    const res = await axios.get(
      // `${wifiUrl}/api/physiotherapy-doctor/clinic-branch-booking/${clinicId}/${branchId}/${bookingId}`
      `${wifiUrl}/api/physiotherapy-doctor/get-record/${clinicId}/${branchId}/${patientId}/${bookingId}/${therapistRecordId}`
    )


    return res.data
  } catch (err) {
    console.error("API Error:", err)
    return null
  }
}