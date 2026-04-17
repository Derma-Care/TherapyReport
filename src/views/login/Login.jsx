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
        <>
            <ToastContainer />
            <div className="d-flex flex-column min-vh-100 position-relative align-items-center justify-content-center" style={{ background: `linear-gradient(135deg, #09203f 0%, #537895 100%)`, fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
                
                {/* Decorative background elements */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', filter: 'blur(80px)' }}></div>

                {/* Main content - flex center */}
                <div className="w-100 d-flex flex-column align-items-center justify-content-center px-3" style={{ zIndex: 1, flex: 1 }}>
                    <div className="text-center mb-4">
                         <img src={DermaLogo} alt="Logo" style={{ maxHeight: '70px', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))' }} />
                    </div>
                    <CCard className="shadow-lg border-0" style={{ width: '100%', maxWidth: '420px', borderRadius: '24px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', padding: '10px' }}>
                        <CCardBody className="p-4 p-md-5">
                            <h4 className="text-center fw-bold mb-1" style={{ color: '#2c3e50', letterSpacing: '-0.5px' }}>Therapist Login</h4>
                            <p className="text-center mb-4" style={{ color: '#6c757d', fontSize: '0.875rem' }}>Sign in to your account</p>

                            {/* Error message */}
                            {errorMessage && (
                                <div className="alert alert-danger text-center py-2 mb-4" style={{ borderRadius: '12px', fontSize: '0.9rem' }}>{errorMessage}</div>
                            )}

                            <CForm onSubmit={handleClinicLogin} noValidate>
                                {/* Username */}
                                <CInputGroup className="mb-3" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                                    <CInputGroupText style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRight: 'none' }}>
                                        <CIcon icon={cilUser} style={{ color: '#94a3b8' }} />
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
                                        style={{ border: '1px solid #e2e8f0', borderLeft: 'none', padding: '12px' }}
                                    />
                                </CInputGroup>
                                {fieldErrors.userName && (
                                    <small className="text-danger d-block mb-3 mt-n2">{fieldErrors.userName}</small>
                                )}

                                {/* Password */}
                                <CInputGroup className="mb-3 mt-2" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                                    <CInputGroupText
                                        onClick={() => setShowPassword((s) => !s)}
                                        style={{ cursor: 'pointer', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRight: 'none' }}
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} style={{ color: '#94a3b8' }} />
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
                                        style={{ border: '1px solid #e2e8f0', borderLeft: 'none', padding: '12px' }}
                                    />
                                </CInputGroup>
                                {fieldErrors.password && (
                                    <small className="text-danger d-block mb-3 mt-n2">{fieldErrors.password}</small>
                                )}

                                <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
                                    <a
                                        href="#"
                                        className="text-decoration-none"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setShowResetModal(true)
                                        }}
                                        style={{ color: COLORS.primary, fontSize: '0.85rem', fontWeight: '500' }}
                                    >
                                        Forgot password?
                                    </a>
                                </div>

                                <CButton
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-100"
                                    style={{ 
                                        backgroundColor: COLORS.primary, 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '12px', 
                                        padding: '12px', 
                                        fontWeight: '600',
                                        boxShadow: '0 4px 10px rgba(0, 97, 194, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {isLoading ? <CSpinner size="sm" /> : 'Sign In'}
                                </CButton>
                            </CForm>
                        </CCardBody>
                    </CCard>
                </div>

                {/* Sticky Footer */}
                <footer
                    className="d-flex justify-content-around small py-3 mt-auto w-100"
                    style={{ color: 'rgba(255, 255, 255, 0.7)', zIndex: 1, backgroundColor: 'transparent' }}
                >
                    <span className="d-inline-flex align-items-center gap-2">
                        <CIcon icon={cilShieldAlt} /> Secure by design
                    </span>
                    <span>
                        © {new Date().getFullYear()} Chiselon Technologies
                    </span>
                    <a
                        href="https://chiselontechnologies.com"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                    >
                        About Chiselon Technologies
                    </a>
                </footer>

                {/* Reset Modal Placeholder */}
            </div>
        </>
    )
}

export default Login
