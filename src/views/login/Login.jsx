import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CRow,
    CFormSelect,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CSpinner,
    CNav,
    CNavItem,
    CNavLink,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilLockUnlocked, cilShieldAlt } from '@coreui/icons'
import axios from 'axios'
 
 
 
 
import DermaLogo from '../../assets/Kinetixwhitelogo.png' // adjust path if needed
 
import { toast, ToastContainer } from 'react-toastify'
 
import { BASE_URL } from '../../API/BaseUrl'
 
import { showCustomToast } from '../../Utils/Toaster'
import { COLORS } from '../../Constant/Themes'
import { useHospital } from '../../Context/HospitalContext'
 
 
// import { getFCMToken } from '../../../firebase'

const Login = () => {
    const [activeTab, setActiveTab] = useState('clinic') // clinic | doctor
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('admin')
    const [errorMessage, setErrorMessage] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showResetModal, setShowResetModal] = useState(false)
   const {  setSelectedHospital , fetchAllData } = useHospital()
    const navigate = useNavigate()

    const validateForm = () => {
        const errors = {}
        if (!userName.trim()) errors.userName = 'Username is required'
        if (!password.trim()) errors.password = 'Password is required'
        if (password && password.length < 6) errors.password = 'Password must be at least 6 characters'
        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    useEffect(() => {
        // ✅ Clear storage when login page loads
        localStorage.clear()
    }, [])

    const handleClinicLogin = async (e) => {
        if (e && e.preventDefault) e.preventDefault()
        if (!validateForm()) return
        setIsLoading(true)
        setErrorMessage('')

        try {
            // ✅ get FCM token first
            await Notification.requestPermission()
            // const fcmToken = await getFCMToken()
            // console.log(fcmToken)
            let res
            const loginBody = {
                userName,
                password,
                role : "physiotherapist",
                // fcmToken: fcmToken || '',
                deviceType: 'web',
            }

            // ✅ Call correct API based on role
            
                const resposnse = await axios.post(`${BASE_URL}/loginUsingRoles`, loginBody, {
                    headers: { 'Content-Type': 'application/json' },
                })
                res = resposnse.data
            

            console.log('✅ Login API response:', res.data)

            // ✅ Success check
            if (resposnse?.status === 200) {
                const payload = res.data
                if (!payload) {
                    showCustomToast(res?.message || 'Invalid login response', 'error')
                    return
                }
    
          
        

  const HospitalId = payload.hospitalId 
   
       const hores =   await fetchAllData(HospitalId)
       if(hores.status === 200){
                    showCustomToast(res.data?.message || 'Login successful!', 'success')
localStorage.setItem('selectedClinic', JSON.stringify(hores.data));
localStorage.setItem('hospitalId', JSON.stringify(HospitalId));
    
  const theraphPayload = {
                            therapistId: payload.staffId,
                            therapistName: payload.staffName,
                       
                          
                            branchId: payload.branchId,
                            clinicId: payload.hospitalId,
                            role: role,
                            branchName: payload.branchName
                        }
 
                        localStorage.setItem(
                            "therapistData",
                            JSON.stringify(theraphPayload)
                        )

                        navigate("/therapist", {
                            state: theraphPayload,
                        })
       }
 
      

                   

                      

                    } 
             
         
        } catch (err) {
            console.error('Login error:', err)

            const backendMessage = err?.response?.data?.message

            if (backendMessage) {
                if (backendMessage.toLowerCase().includes('username')) {
                    setErrorMessage('Invalid username. Please try again.')
                    // showCustomToast('Invalid username. Please try again.', 'error')
                } else if (backendMessage.toLowerCase().includes('password')) {
                    setErrorMessage('Invalid password. Please try again.')
                    // showCustomToast('Invalid password. Please try again.', 'error')
                } else {
                    setErrorMessage(backendMessage)
                    // showCustomToast(backendMessage, 'error')
                }
            } else {
                setErrorMessage('An unexpected error occurred. Please try again later.')
                // showCustomToast('An unexpected error occurred. Please try again later.', 'error')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        // Outer container uses flex column and full viewport height to allow sticky footer without overflow
        <>
            <ToastContainer />
            <div className="d-flex flex-column min-vh-100 derma-bg">
                {/* Main content - will grow and keep footer at bottom */}
                <div className="flex-grow-1 d-flex justify-content-center align-content-center align-items-center ">
                    <CContainer fluid className="p-0 h-100   align-content-center align-items-center">
                        {/* Use h-100 on the row so it occupies the available height (minus footer) */}
                        <CRow className="g-0 h-100">
                        

                            {/* RIGHT: Card + Tabs + Form */}
                            <CCol md={6} className="d-flex align-items-center justify-content-center  md-5">
                                <CCard className="shadow-lg border-0 glass-card w-100" style={{ maxWidth: 460 }}>
                                    <CCardBody className="p-4 p-md-5">
                                        <h3 className="text-center fw-bold mb-3" style={{ color: COLORS.primary }}>
                                            Kinetix  Therapy Login
                                        </h3>
                                        

                                   
                                      

                                        {/* Error message */}
                                        {errorMessage && (
                                            <div className="alert alert-danger text-center py-2 mb-3">{errorMessage}</div>
                                        )}

                                        {/* CLINIC TAB */}
                                        
                                            <CForm onSubmit={handleClinicLogin} noValidate>
                                              
                                                {/* Username */}
                                                <CInputGroup className="mb-2">
                                                    <CInputGroupText>
                                                        <CIcon icon={cilUser} />
                                                    </CInputGroupText>
                                                    <CFormInput
                                                        placeholder="Username"
                                                        value={userName}
                                                        onChange={(e) => {
                                                            setUserName(e.target.value)
                                                            if (fieldErrors.userName)
                                                                setFieldErrors((p) => ({ ...p, userName: '' }))
                                                        }}
                                                        aria-invalid={!!fieldErrors.userName}
                                                        autoComplete="username"
                                                    />
                                                </CInputGroup>
                                                {fieldErrors.userName && (
                                                    <small className="text-danger">{fieldErrors.userName}</small>
                                                )}

                                                {/* Password */}
                                                <CInputGroup className="mt-3 mb-2">
                                                    <CInputGroupText
                                                        onClick={() => setShowPassword((s) => !s)}
                                                        style={{ cursor: 'pointer' }}
                                                        title={showPassword ? 'Hide password' : 'Show password'}
                                                    >
                                                        <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} />
                                                    </CInputGroupText>
                                                    <CFormInput
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Password"
                                                        value={password}
                                                        onChange={(e) => {
                                                            setPassword(e.target.value)
                                                            if (fieldErrors.password)
                                                                setFieldErrors((p) => ({ ...p, password: '' }))
                                                        }}
                                                        aria-invalid={!!fieldErrors.password}
                                                        autoComplete="current-password"
                                                    />
                                                </CInputGroup>
                                                {fieldErrors.password && (
                                                    <small className="text-danger">{fieldErrors.password}</small>
                                                )}

                                                <div
                                                    className="d-flex justify-content-between mt-2"
                                                    style={{ color: COLORS.primary }}
                                                >
                                                    <a
                                                        style={{ color: COLORS.primary }}
                                                        href="#"
                                                        className="text-decoration-none derma-link"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            setShowResetModal(true)
                                                        }}
                                                    >
                                                        Forgot password?
                                                    </a>
                                                </div>

                                                <CButton
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-100 mt-4 derma-btn"
                                                    style={{ backgroundColor: COLORS.primary, color: 'white' }}
                                                >
                                                    {isLoading ? <CSpinner size="sm" /> : 'Login'}
                                                </CButton>
                                            </CForm>
                                 
                                    </CCardBody>
                                </CCard>
                            </CCol>
                        </CRow>
                    </CContainer>
                </div>

                {/* Sticky Footer */}
                <footer
                    className="d-flex justify-content-around small py-2 opacity-75 mt-auto"
                    style={{ color: COLORS.primary, backgroundColor: '#f8f9fa' }}
                >
                    <span
                        className="d-inline-flex align-items-center gap-2"
                        style={{ color: COLORS.primary }}
                    >
                        <CIcon icon={cilShieldAlt} /> Secure by design
                    </span>
                    <span style={{ color: COLORS.primary }}>
                        © {new Date().getFullYear()} Chiselon Technologies
                    </span>
                    <a
                        href="https://chiselontechnologies.com"
                        target="_blank"
                        style={{ color: COLORS.primary }}
                        rel="noreferrer"
                    >
                        About Chiselon Technologies
                    </a>
                </footer>

                {/* Reset Modal */}
           
            </div>
        </>
    )
}

export default Login
