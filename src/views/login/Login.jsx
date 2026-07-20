import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CButton,
    CCard,
    CCardBody,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CSpinner, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilLockUnlocked } from '@coreui/icons'
import axios from 'axios'
import { toast } from 'react-toastify'
import { BASE_URL } from '../../API/BaseUrl'
import { showCustomToast } from '../../Utils/Toaster'
import { COLORS } from '../../Constant/Themes'
import { useHospital } from '../../Context/HospitalContext'
import { getFCMToken } from '../../firebase'
import ResetPassword from '../Resetpassword'
import ForgotPassword from '../ForgotPassword'

const FEATURES = ['Session management', 'Progress tracking', 'Secure records', 'Multi-branch support']

// ── WebAuthn helpers ────────────────────────────────────────────
// Browsers exchange raw bytes (ArrayBuffer) for credentials, but the
// server needs to send/receive those over JSON — base64url is the
// standard encoding for that bridge.
const bufferToBase64url = (buffer) => {
    const bytes = new Uint8Array(buffer)
    let str = ''
    for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i])
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const base64urlToBuffer = (base64url) => {
    const padded = base64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(base64url.length + (4 - (base64url.length % 4)) % 4, '=')
    const str = atob(padded)
    const bytes = new Uint8Array(str.length)
    for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i)
    return bytes.buffer
}

const isWebAuthnSupported = () =>
    typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    !!navigator.credentials

const Login = () => {
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [role] = useState('admin')
    const [errorMessage, setErrorMessage] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [visiblePills, setVisiblePills] = useState([])
    const { setSelectedHospital, fetchAllData } = useHospital()
    const navigate = useNavigate()
    const [showResetModal, setShowResetModal] = useState(false)
    const [showForgotModal, setShowForgotModal] = useState(false)

    // ── Biometric login state ───────────────────────────────────
    const [biometricAvailable, setBiometricAvailable] = useState(false)
    const [savedBiometricUser, setSavedBiometricUser] = useState('')
    const [isBiometricLoading, setIsBiometricLoading] = useState(false)
    const [showBiometricPrompt, setShowBiometricPrompt] = useState(false)
    const [isEnablingBiometric, setIsEnablingBiometric] = useState(false)
    const [pendingLoginUserName, setPendingLoginUserName] = useState('')

    const validateForm = () => {
        const errors = {}
        if (!userName.trim()) errors.userName = 'Username is required'
        if (!password.trim()) errors.password = 'Password is required'
        if (password && password.length < 6) errors.password = 'Password must be at least 6 characters'
        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    useEffect(() => {
        // Stagger-in feature pills after panel lands
        FEATURES.forEach((_, i) => {
            setTimeout(() => setVisiblePills(prev => [...prev, i]), 700 + i * 130)
        })
    }, [])

    useEffect(() => {
        // Check once on mount whether this device previously registered
        // a fingerprint/biometric credential, so we know whether to show
        // the quick sign-in button.
        const checkBiometricAvailability = async () => {
            if (!isWebAuthnSupported()) return
            try {
                const platformAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                if (!platformAvailable) return
                const saved = localStorage.getItem('biometricUserName')
                if (saved) {
                    setSavedBiometricUser(saved)
                    setBiometricAvailable(true)
                }
            } catch (err) {
                console.error('Biometric availability check failed:', err)
            }
        }
        checkBiometricAvailability()
    }, [])

    // Shared "what happens after a successful login" logic — used by both
    // the password form and the biometric flow so they can't drift apart.
    const completeLogin = async (payload) => {
        if (!payload) { showCustomToast('Invalid login response', 'error'); return }

        const HospitalId = payload.hospitalId
        const hores = await fetchAllData(HospitalId)
        if (hores.status === 200) {
            showCustomToast('Login successful!', 'success')
            localStorage.setItem('selectedClinic', JSON.stringify(hores.data))
            localStorage.setItem('hospitalId', JSON.stringify(HospitalId))
            const theraphPayload = {
                therapistId: payload.staffId,
                therapistName: payload.staffName,
                branchId: payload.branchId,
                clinicId: payload.hospitalId,
                role: payload.role,
                branchName: payload.branchName
            }
            localStorage.setItem("therapistData", JSON.stringify(theraphPayload))

            const fcmToken = await getFCMToken()
            if (fcmToken) localStorage.setItem('fcmToken', fcmToken)

            navigate("/therapist", { state: theraphPayload })
        }
    }

    const handleClinicLogin = async (e) => {
        if (e && e.preventDefault) e.preventDefault()
        if (!validateForm()) return
        setIsLoading(true)
        setErrorMessage('')
        const fcmToken = await getFCMToken()
        console.log(fcmToken)
        try {
            const loginBody = { userName, password, role: "physiotherapist", deviceType: 'web', deviceId: fcmToken }
            const resposnse = await axios.post(`${BASE_URL}/loginUsingRoles`, loginBody, {
                headers: { 'Content-Type': 'application/json' },
            })
            const res = resposnse.data

            if (resposnse?.status === 200) {
                const payload = res.data
                if (!payload) { showCustomToast(res?.message || 'Invalid login response', 'error'); return }

                // First-time-only biometric opt-in: ask right after a
                // successful password login, but only once per user per
                // device, and only if the browser can actually do it.
                const promptAlreadySeen = localStorage.getItem(`biometricPromptSeen_${userName}`)
                if (isWebAuthnSupported() && !promptAlreadySeen) {
                    const platformAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false)
                    if (platformAvailable) {
                        setPendingLoginUserName(userName)
                        localStorage.setItem(`biometricPromptSeen_${userName}`, 'true')
                        setShowBiometricPrompt(true)
                        // Defer navigation until the user answers the prompt
                        window.__pendingLoginPayload = payload
                        return
                    }
                }

                await completeLogin(payload)
            }
        } catch (err) {
            console.error('Login error:', err)
            const backendMessage = err?.response?.data?.message
            if (backendMessage) {
                if (backendMessage.toLowerCase().includes('username')) setErrorMessage('Invalid username. Please try again.')
                else if (backendMessage.toLowerCase().includes('password')) setErrorMessage('Invalid password. Please try again.')
                else setErrorMessage(backendMessage)
            } else {
                setErrorMessage('An unexpected error occurred. Please try again later.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    // ── Enable biometric login (registration) ───────────────────
    // Requires backend endpoints:
    //   POST /biometric/register-options  { userName } -> WebAuthn PublicKeyCredentialCreationOptions
    //   POST /biometric/register-verify   { userName, credential } -> { status, message }
    const handleEnableBiometric = async () => {
        const isBioEnabled = localStorage.getItem("biometricEnabled") === "true";

        if (!isBioEnabled && window.PublicKeyCredential) {
            const confirmed = window.confirm(
                "Enable fingerprint login for next time?"
            );

            if (confirmed) {
                try {
                    const challenge = new Uint8Array(32);
                    crypto.getRandomValues(challenge);

                    const userId = new Uint8Array(16);
                    crypto.getRandomValues(userId);

                    const cred = await navigator.credentials.create({
                        publicKey: {
                            challenge,
                            rp: {
                                name: "Kinetix"
                            },
                            user: {
                                id: userId,
                                name: userName,
                                displayName: userName
                            },
                            pubKeyCredParams: [
                                {
                                    type: "public-key",
                                    alg: -7
                                }
                            ],
                            authenticatorSelection: {
                                authenticatorAttachment: "platform",
                                userVerification: "preferred"
                            },
                            timeout: 60000
                        }
                    });

                    localStorage.setItem(
                        "bioCredId",
                        btoa(String.fromCharCode(...new Uint8Array(cred.rawId)))
                    );

                    localStorage.setItem("savedUserName", userName);
                    localStorage.setItem("savedPassKey", btoa(password));
                    localStorage.setItem("biometricEnabled", "true");

                    setBiometricAvailable(true);
                    setSavedBiometricUser(userName);

                } catch (e) {
                    console.log(e);
                }
            }
        }

        // await completeLogin(payload);
        const payload = window.__pendingLoginPayload;
        window.__pendingLoginPayload = null;

        await completeLogin(payload);
    }

    const handleSkipBiometric = async () => {
        setShowBiometricPrompt(false)
        const payload = window.__pendingLoginPayload
        window.__pendingLoginPayload = null
        await completeLogin(payload)
    }
    const handleBiometricLogin = async () => {
        try {
            const credId = localStorage.getItem("bioCredId");

            if (!credId) {
                showCustomToast("Fingerprint not configured", "error");
                return;
            }

            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);

            const idBuffer = Uint8Array.from(
                atob(credId),
                c => c.charCodeAt(0)
            );

            await navigator.credentials.get({
                publicKey: {
                    challenge,
                    allowCredentials: [
                        {
                            id: idBuffer,
                            type: "public-key"
                        }
                    ],
                    userVerification: "preferred"
                }
            });

            const savedUser = localStorage.getItem("savedUserName");
            const savedPass = atob(localStorage.getItem("savedPassKey"));

            setUserName(savedUser);
            setPassword(savedPass);

            await handleClinicLogin();

        } catch (err) {
            console.error(err);
            showCustomToast("Fingerprint authentication failed", "error");
        }
    };
    useEffect(() => {
        const enabled =
            localStorage.getItem("biometricEnabled") === "true";

        if (enabled) {
            setBiometricAvailable(true);
            setSavedBiometricUser(
                localStorage.getItem("savedUserName")
            );
        }
    }, []);
    // ── Sign in with biometric (authentication) ──────────────────
    // Requires backend endpoints:
    //   POST /biometric/login-options { userName } -> WebAuthn PublicKeyCredentialRequestOptions
    //   POST /biometric/login-verify  { userName, credential } -> same shape as /loginUsingRoles
    // const handleBiometricLogin = async () => {
    //     setIsBiometricLoading(true)
    //     setErrorMessage('')
    //     try {
    //         const optionsRes = await axios.post(`${BASE_URL}/biometric/login-options`, { userName: savedBiometricUser })
    //         const options = optionsRes.data.data

    //         const publicKey = {
    //             ...options,
    //             challenge: base64urlToBuffer(options.challenge),
    //             allowCredentials: (options.allowCredentials || []).map(c => ({
    //                 ...c,
    //                 id: base64urlToBuffer(c.id),
    //             })),
    //         }

    //         const assertion = await navigator.credentials.get({ publicKey })

    //         const serializedAssertion = {
    //             id: assertion.id,
    //             rawId: bufferToBase64url(assertion.rawId),
    //             type: assertion.type,
    //             response: {
    //                 authenticatorData: bufferToBase64url(assertion.response.authenticatorData),
    //                 clientDataJSON: bufferToBase64url(assertion.response.clientDataJSON),
    //                 signature: bufferToBase64url(assertion.response.signature),
    //                 userHandle: assertion.response.userHandle ? bufferToBase64url(assertion.response.userHandle) : null,
    //             },
    //         }

    //         const verifyRes = await axios.post(`${BASE_URL}/biometric/login-verify`, {
    //             userName: savedBiometricUser,
    //             credential: serializedAssertion,
    //         })

    //         const payload = verifyRes.data?.data
    //         await completeLogin(payload)
    //     } catch (err) {
    //         console.error('Biometric login failed:', err)
    //         if (err?.name === 'NotAllowedError') {
    //             showCustomToast('Fingerprint sign-in was cancelled', 'info')
    //         } else {
    //             setErrorMessage('Fingerprint sign-in failed. Please sign in with your password.')
    //         }
    //     } finally {
    //         setIsBiometricLoading(false)
    //     }
    // }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

                .therapist-login-root * { box-sizing: border-box; }

                html, body {
                    overflow: hidden;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }

                .therapist-login-root {
                    height: 100vh;
                    display: flex;
                    overflow: hidden;
                    position: relative;
                    background: #f0f6ff;
                }

                /* ─── Animated background ────────────────────── */
                .login-bg {
                    position: fixed;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                    overflow: hidden;
                }
                .login-bg-gradient {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #ddeeff 0%, #eaf4ff 35%, #e6f9f2 65%, #fdf3e6 100%);
                    animation: login-grad-shift 14s ease-in-out infinite alternate;
                }
                @keyframes login-grad-shift {
                    0%   { filter: hue-rotate(0deg) brightness(1); }
                    50%  { filter: hue-rotate(6deg) brightness(0.97); }
                    100% { filter: hue-rotate(0deg) brightness(1); }
                }
                .login-bg-orb { position: absolute; border-radius: 50%; filter: blur(72px); }
                .login-bg-orb-1 {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(24,95,165,0.14) 0%, transparent 70%);
                    top: -120px; left: -100px;
                    animation: login-orb-float 16s ease-in-out infinite alternate;
                }
                .login-bg-orb-2 {
                    width: 380px; height: 380px;
                    background: radial-gradient(circle, rgba(29,158,117,0.11) 0%, transparent 70%);
                    bottom: -60px; left: 30%;
                    animation: login-orb-float 20s ease-in-out infinite alternate-reverse;
                }
                .login-bg-orb-3 {
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, rgba(186,117,23,0.09) 0%, transparent 70%);
                    top: 30%; right: 20px;
                    animation: login-orb-float 24s ease-in-out infinite alternate;
                }
                @keyframes login-orb-float {
                    0%   { transform: translate(0,0) scale(1); }
                    33%  { transform: translate(20px,-24px) scale(1.04); }
                    66%  { transform: translate(-14px,16px) scale(0.97); }
                    100% { transform: translate(10px,-10px) scale(1.02); }
                }
                .login-bg-dots { position: absolute; inset: 0; width: 100%; height: 100%; }
                .login-particle { position: absolute; border-radius: 50%; }
                .login-particle-1 { width:5px;height:5px;background:rgba(24,95,165,.20);left:8%;bottom:-10px;animation:login-particle-rise 18s linear 0s infinite; }
                .login-particle-2 { width:4px;height:4px;background:rgba(29,158,117,.18);left:22%;bottom:-10px;animation:login-particle-rise 22s linear 3s infinite; }
                .login-particle-3 { width:6px;height:6px;background:rgba(186,117,23,.14);left:40%;bottom:-10px;animation:login-particle-rise 15s linear 6s infinite; }
                .login-particle-4 { width:4px;height:4px;background:rgba(24,95,165,.16);left:58%;bottom:-10px;animation:login-particle-rise 19s linear 1s infinite; }
                .login-particle-5 { width:5px;height:5px;background:rgba(29,158,117,.14);left:74%;bottom:-10px;animation:login-particle-rise 25s linear 9s infinite; }
                .login-particle-6 { width:3px;height:3px;background:rgba(24,95,165,.12);left:90%;bottom:-10px;animation:login-particle-rise 17s linear 4s infinite; }
                @keyframes login-particle-rise {
                    0%   { transform:translateY(0) translateX(0); opacity:0; }
                    5%   { opacity:1; }
                    85%  { opacity:0.5; }
                    100% { transform:translateY(-100vh) translateX(18px); opacity:0; }
                }

                /* ─── Page-load entry animations ─────────────── */
                .login-left-panel {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 60px 72px;
                    position: relative;
                    z-index: 2;
                    animation: left-enter 0.85s cubic-bezier(0.22,1,0.36,1) both;
                }
                @keyframes left-enter {
                    from { opacity:0; transform:translateY(24px); }
                    to   { opacity:1; transform:translateY(0); }
                }

                .login-right-panel {
                    width: 480px;
                    height: 100vh;
                    overflow-y: auto;
                    background: rgba(255,255,255,0.78);
                    backdrop-filter: blur(18px);
                    -webkit-backdrop-filter: blur(18px);
                    border-left: 0.5px solid rgba(24,95,165,0.10);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 60px 52px;
                    position: relative;
                    z-index: 2;
                    box-shadow: -8px 0 40px rgba(24,95,165,0.06);
                    animation: right-enter 0.85s cubic-bezier(0.22,1,0.36,1) 0.15s both;
                }
                @keyframes right-enter {
                    from { opacity:0; transform:translateX(20px); }
                    to   { opacity:1; transform:translateX(0); }
                }

                /* Logo — spring pop with rotation */
                .logo-mark {
                    width: 48px; height: 48px;
                    background: linear-gradient(135deg, #185fa5 0%, #1D9E75 100%);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 56px;
                    box-shadow: 0 4px 18px rgba(24,95,165,0.25);
                    animation: logo-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;
                }
                @keyframes logo-pop {
                    from { opacity:0; transform:scale(0.55) rotate(-18deg); }
                    to   { opacity:1; transform:scale(1) rotate(0deg); }
                }
                .logo-mark svg { width:24px;height:24px;fill:none;stroke:white;stroke-width:2;stroke-linecap:round; }

                /* Headline & subtext — staggered fade-up */
                .left-headline {
                  
                    font-size: 52px;
                    font-weight: 700;
                    line-height: 1.15;
                    color: #0c447c;
                    margin: 0 0 20px;
                    letter-spacing: -0.5px;
                    animation: text-rise 0.7s ease 0.45s both;
                }
                .left-headline span {
                    background: linear-gradient(90deg, #185fa5, #1D9E75);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .left-subtext {
                    font-size: 16px;
                    color: #5f5e5a;
                    line-height: 1.7;
                    max-width: 400px;
                    margin: 0 0 60px;
                    animation: text-rise 0.7s ease 0.55s both;
                }
                @keyframes text-rise {
                    from { opacity:0; transform:translateY(14px); }
                    to   { opacity:1; transform:translateY(0); }
                }

                .stats-row {
                    display: flex;
                    gap: 48px;
                    animation: text-rise 0.7s ease 0.65s both;
                }
                .stat-number {
                    
                    font-size: 28px;
                    font-weight: 700;
                    color: #0c447c;
                    line-height: 1;
                    margin-bottom: 4px;
                }
                .stat-label { font-size: 13px; color: #888780; font-weight: 400; }
                .stat-divider { width:1px; background:rgba(12,68,124,0.12); align-self:stretch; }

                /* Feature pills — React-driven stagger pop */
                .feature-pills { display:flex; flex-wrap:wrap; gap:10px; margin-top:52px; }
                .feature-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(255,255,255,0.55);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border: 0.5px solid rgba(24,95,165,0.18);
                    border-radius: 100px;
                    font-size: 13px;
                    color: #0c447c;
                    opacity: 0;
                    transform: scale(0.82) translateY(8px);
                }
                .feature-pill.visible {
                    animation: pill-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards;
                }
                @keyframes pill-pop {
                    from { opacity:0; transform:scale(0.8) translateY(10px); }
                    to   { opacity:1; transform:scale(1) translateY(0); }
                }
                .pill-dot { width:6px;height:6px;border-radius:50%;background:#1D9E75;flex-shrink:0; }

                /* ─── Form panel ─────────────────────────────── */
                .form-header {
                    width: 100%;
                    margin-bottom: 36px;
                    animation: text-rise 0.7s ease 0.25s both;
                }
                .form-welcome { font-size:12px;font-weight:600;color:#185fa5;letter-spacing:1.2px;text-transform:uppercase;margin:0 0 10px; }
                .form-title {  font-size:30px;font-weight:700;color:#0c447c;margin:0 0 8px;line-height:1.2; }
                .form-subtitle { font-size:14px;color:#888780;margin:0; }

                .custom-input-wrapper { margin-bottom:20px; }
                .custom-input-wrapper:nth-of-type(1) { animation: field-slide 0.5s ease 0.35s both; }
                .custom-input-wrapper:nth-of-type(2) { animation: field-slide 0.5s ease 0.45s both; }
                @keyframes field-slide {
                    from { opacity:0; transform:translateY(10px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .custom-input-label { font-size:13px;font-weight:500;color:#0c447c;margin-bottom:8px;display:block;letter-spacing:0.2px; }
                .custom-input-group {
                    display: flex;
                    align-items: center;
                    border: 0.5px solid #b5d4f4;
                    border-radius: 12px;
                    overflow: hidden;
                    background: rgba(255,255,255,0.75);
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                }
                .custom-input-group:focus-within {
                    border-color: #185fa5;
                    background: #ffffff;
                    box-shadow: 0 0 0 4px rgba(24,95,165,0.10);
                }
                .custom-input-prefix { padding:0 14px;display:flex;align-items:center;background:transparent;border:none;cursor:default; flex-shrink: 0; }
                .custom-input-prefix svg { width:16px;height:16px;color:#888780; }
                .custom-input-field {
                    flex:1;border:none;background:transparent;outline:none;
                    padding:13px 16px 13px 0;font-size:14px;
                   color:#0c447c;
                }
                .custom-input-field::placeholder { color:#b5d4f4; }
                .custom-input-toggle { padding:0 14px;background:transparent;border:none;cursor:pointer;display:flex;align-items:center;color:#888780;transition:color 0.2s; flex-shrink: 0; }
                .custom-input-toggle:hover { color:#185fa5; }
                .field-error { font-size:12px;color:#ef4444;margin-top:5px;padding-left:2px; }

                /* Error — horizontal shake */
                .error-alert {
                    background: #fef2f2;
                    border: 0.5px solid #fecaca;
                    border-radius: 10px;
                    padding: 12px 16px;
                    font-size: 13px;
                    color: #dc2626;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: error-shake 0.4s ease;
                }
                @keyframes error-shake {
                    0%,100% { transform:translateX(0); }
                    20%     { transform:translateX(-6px); }
                    40%     { transform:translateX(6px); }
                    60%     { transform:translateX(-4px); }
                    80%     { transform:translateX(4px); }
                }

                /* Submit button */
                .submit-btn {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #185fa5 0%, #0c447c 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                  
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.22s ease, box-shadow 0.22s ease;
                    margin-top: 8px;
                    position: relative;
                    overflow: hidden;
                    letter-spacing: 0.2px;
                    box-shadow: 0 4px 18px rgba(24,95,165,0.28);
                    animation: text-rise 0.5s ease 0.55s both;
                }
                .submit-btn::before {
                    content:'';position:absolute;inset:0;
                    background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 60%);
                    border-radius:inherit;pointer-events:none;
                }
                .submit-btn::after {
                    content:'';position:absolute;inset:0;
                    background:radial-gradient(circle at center,rgba(255,255,255,0.22) 0%,transparent 70%);
                    opacity:0;transition:opacity 0.3s;pointer-events:none;
                }
                .submit-btn:active::after { opacity:1; }
                .submit-btn:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 8px 28px rgba(24,95,165,0.36); }
                .submit-btn:active:not(:disabled) { transform:translateY(0);box-shadow:0 2px 10px rgba(24,95,165,0.28); }
                .submit-btn:disabled { opacity:0.7;cursor:not-allowed; }

                /* Biometric quick sign-in button */
                .biometric-btn {
                    width: 100%;
                    padding: 12px;
                    background: rgba(255,255,255,0.6);
                    color: #0c447c;
                    border: 0.5px solid #b5d4f4;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 12px;
                    transition: background 0.2s, border-color 0.2s;
                    animation: text-rise 0.5s ease 0.6s both;
                }
                .biometric-btn:hover:not(:disabled) { background: #ffffff; border-color: #185fa5; }
                .biometric-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                .biometric-btn svg { width: 18px; height: 18px; flex-shrink: 0; }

                .right-divider { width:100%;border:none;border-top:0.5px solid rgba(24,95,165,0.12);margin:28px 0; }

                /* Security badge — pulsing dot */
                .security-badge {
                    display:flex;align-items:center;gap:6px;font-size:12px;
                    color:#888780;justify-content:center;margin-top:20px;
                    animation: text-rise 0.5s ease 0.7s both;
                }
                .security-dot {
                    width:6px;height:6px;border-radius:50%;background:#1D9E75;
                    animation: sec-pulse 2.8s ease-in-out 1.5s infinite;
                }
                @keyframes sec-pulse {
                    0%,100% { box-shadow:0 0 0 0 rgba(29,158,117,0.5); }
                    50%     { box-shadow:0 0 0 5px rgba(29,158,117,0); }
                }

                .form-footer { width:100%;text-align:center; }
                .form-footer-text { font-size:12px;color:#888780; }
                .form-footer-text a { color:#185fa5;text-decoration:none;font-weight:500; }

                /* Biometric enrollment modal content */
                .biometric-modal-icon {
                    width: 56px; height: 56px; border-radius: 50%;
                    background: rgba(24,95,165,0.10);
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 16px;
                }
                .biometric-modal-icon svg { width: 28px; height: 28px; color: #185fa5; }
                .biometric-modal-text { text-align: center; color: #5f5e5a; font-size: 14px; line-height: 1.6; margin: 0 0 4px; }

                @media (max-width: 900px) {
                    .login-left-panel { display:none; }
                    .login-right-panel { width:100%; height:100vh; border-left:none; box-shadow:none; padding: 40px 24px; justify-content: center; }
                }

                .spin {
                    animation:spin 0.8s linear infinite;
                    display:inline-block;width:18px;height:18px;
                    border:2px solid rgba(255,255,255,0.3);
                    border-top-color:white;border-radius:50%;
                }
                @keyframes spin { to { transform:rotate(360deg); } }
            `}</style>

            <div className="therapist-login-root">

                {/* ── Animated background ─────────────────────── */}
                <div className="login-bg" aria-hidden="true">
                    <div className="login-bg-gradient" />
                    <div className="login-bg-orb login-bg-orb-1" />
                    <div className="login-bg-orb login-bg-orb-2" />
                    <div className="login-bg-orb login-bg-orb-3" />
                    <svg className="login-bg-dots" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="login-dot-pattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1.2" fill="#185fa5" fillOpacity="0.06" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#login-dot-pattern)" />
                    </svg>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={`login-particle login-particle-${i}`} />
                    ))}
                </div>

                {/* ── Left panel ──────────────────────────────── */}
                <div className="login-left-panel">
                    <div className="logo-mark">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                            <path d="M8 12h8M12 8v8" />
                        </svg>
                    </div>
                    <h1 className="left-headline">
                        Your patients<br />are <span>waiting</span>.
                    </h1>
                    <p className="left-subtext">
                        A seamless workspace for physiotherapists — manage appointments, track progress, and deliver care that transforms lives.
                    </p>
                    <div className="feature-pills">
                        {FEATURES.map((f, i) => (
                            <div key={f} className={`feature-pill${visiblePills.includes(i) ? ' visible' : ''}`}>
                                <span className="pill-dot" />{f}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right form panel ────────────────────────── */}
                <div className="login-right-panel">
                    <div className="form-header">
                        {/* <p className="form-welcome">Kinetix Portal</p> */}
                        <h2 className="form-title">Welcome back</h2>
                        <p className="form-subtitle">
                            {biometricAvailable ? `Sign in as ${savedBiometricUser} or use your password` : 'Sign in to continue to your dashboard'}
                        </p>
                    </div>


                    {errorMessage && (
                        <div className="error-alert" style={{ width: '100%' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {errorMessage}
                        </div>
                    )}

                    {biometricAvailable && (
                        <button
                            type="button"
                            className="biometric-btn"
                            onClick={handleBiometricLogin}
                            disabled={isBiometricLoading}
                        >
                            {isBiometricLoading ? (
                                <span className="spin" style={{ borderTopColor: '#185fa5', borderColor: 'rgba(24,95,165,0.25)' }} />
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                    <path d="M12 11a2 2 0 0 0-2 2c0 3-1 5-1.5 6" />
                                    <path d="M7 15c.5-1.5.5-2.5.5-4a4.5 4.5 0 0 1 9 0" />
                                    <path d="M4 12a8 8 0 0 1 15.5-3" />
                                    <path d="M5.5 16.5A9 9 0 0 1 3 12" />
                                    <path d="M20 12a8 8 0 0 1-.6 3" />
                                    <path d="M12 11a2 2 0 0 1 2 2c0 1.5.2 2.5.5 3.5" />
                                </svg>
                            )}
                            {isBiometricLoading ? 'Verifying…' : `Sign in with fingerprint`}
                        </button>
                    )}

                    <form onSubmit={handleClinicLogin} noValidate style={{ width: '100%' }}>
                        <div className="custom-input-wrapper">
                            <label className="custom-input-label">Username</label>
                            <div className="custom-input-group" style={fieldErrors.userName ? { borderColor: '#ef4444', background: '#fff5f5' } : {}}>
                                <span className="custom-input-prefix">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <input
                                    className="custom-input-field"
                                    placeholder="Enter your username"
                                    value={userName}
                                    onChange={(e) => { setUserName(e.target.value); if (fieldErrors.userName) setFieldErrors(p => ({ ...p, userName: '' })) }}
                                    autoComplete="username"
                                />
                            </div>
                            {fieldErrors.userName && <div className="field-error">{fieldErrors.userName}</div>}
                        </div>

                        <div className="custom-input-wrapper">
                            <label className="custom-input-label">Password</label>
                            <div className="custom-input-group" style={fieldErrors.password ? { borderColor: '#ef4444', background: '#fff5f5' } : {}}>
                                <span className="custom-input-prefix">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    className="custom-input-field"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: '' })) }}
                                    autoComplete="current-password"
                                />
                                <button type="button" className="custom-input-toggle" onClick={() => setShowPassword(s => !s)} title={showPassword ? 'Hide' : 'Show'}>
                                    {showPassword ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
                        </div>

                        {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '13.5px' }}>
                            <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotModal(true) }} style={{ color: '#185fa5', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); setShowResetModal(true) }} style={{ color: '#185fa5', textDecoration: 'none', fontWeight: 500 }}>Reset password?</a>
                        </div> */}

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? <span className="spin" /> : 'Sign in to your account'}
                        </button>
                    </form>

                    <hr className="right-divider" />

                    {/* <div className="security-badge">
                        <span className="security-dot" />
                        <span>256-bit encrypted &amp; HIPAA-compliant session</span>
                    </div> */}
                    <CModal visible={showResetModal} onClose={() => setShowResetModal(false)} className='custom-modal' backdrop="static">
                        <CModalHeader>
                            <CModalTitle>Reset Password</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <ResetPassword onClose={() => setShowResetModal(false)} />
                        </CModalBody>
                        {/* <CModalFooter>
            <CButton color="secondary" onClick={() => setShowResetModal(false)}>
              Close
            </CButton>
          </CModalFooter> */}
                    </CModal>

                    {/* Forgot Password Modal */}
                    <CModal visible={showForgotModal} onClose={() => setShowForgotModal(false)} className='custom-modal' backdrop="static">
                        <CModalHeader>
                            <CModalTitle>Forgot Password</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <ForgotPassword onClose={() => setShowForgotModal(false)} />
                        </CModalBody>
                        {/* <CModalFooter>
            <CButton color="secondary" onClick={() => setShowForgotModal(false)}>
              Close
            </CButton>
          </CModalFooter> */}
                    </CModal>

                    {/* First-time biometric opt-in prompt */}
                    <CModal visible={showBiometricPrompt} onClose={handleSkipBiometric} className='custom-modal' backdrop="static">
                        <CModalHeader>
                            <CModalTitle>Enable fingerprint sign-in</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <div className="biometric-modal-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                    <path d="M12 11a2 2 0 0 0-2 2c0 3-1 5-1.5 6" />
                                    <path d="M7 15c.5-1.5.5-2.5.5-4a4.5 4.5 0 0 1 9 0" />
                                    <path d="M4 12a8 8 0 0 1 15.5-3" />
                                    <path d="M5.5 16.5A9 9 0 0 1 3 12" />
                                    <path d="M20 12a8 8 0 0 1-.6 3" />
                                    <path d="M12 11a2 2 0 0 1 2 2c0 1.5.2 2.5.5 3.5" />
                                </svg>
                            </div>
                            <p className="biometric-modal-text">
                                Use your fingerprint or face to sign in faster next time on this device.
                            </p>
                            <p className="biometric-modal-text" style={{ fontSize: 12, color: '#888780' }}>
                                You can turn this off later from your account settings.
                            </p>
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="secondary" onClick={handleSkipBiometric} disabled={isEnablingBiometric}>
                                Not now
                            </CButton>
                            <CButton
                                style={{ backgroundColor: COLORS.primary, color: 'white', border: 'none' }}
                                onClick={handleEnableBiometric}
                                disabled={isEnablingBiometric}
                            >
                                {isEnablingBiometric ? 'Setting up…' : 'Enable'}
                            </CButton>
                        </CModalFooter>
                    </CModal>

                    <div className="form-footer">
                        <p className="form-footer-text" style={{ marginTop: 32 }}>
                            © {new Date().getFullYear()} Chiselon Technologies ·{' '}
                            <a href="https://chiselontechnologies.com" target="_blank" rel="noreferrer">chiselontechnologies.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login