import { Suspense, useState, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import DefaultLayout from './layout/DefaultLayout'
import routes from './routes'
import ProtectedRoute from './Routes/ProtectedRoute'
import PublicRoute from './Routes/PublicRoute'
import Login from './views/login/Login'
import './App.css'
import { useHospital } from './Context/HospitalContext'
import appLogo from './assets/logo.png'

function App() {
  const [splashVisible, setSplashVisible] = useState(true)
  const [splashFading, setSplashFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 1400)
    const removeTimer = setTimeout(() => setSplashVisible(false), 1900)
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer) }
  }, [])

  const hospitalData = JSON.parse(localStorage.getItem("selectedClinic") || "{}")
  const hospitalName = hospitalData?.hospitalName || hospitalData?.clinicName || 'Kinetix Wellness'
  const hospitalLogo = hospitalData?.hospitalLogo
    ? `data:image/webp;base64,${hospitalData.hospitalLogo}`
    : appLogo

  return (
    <>
      {/* ── Splash Screen ── */}
      {splashVisible && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #f0f6ff 0%, #ffffff 50%, #f0faf5 100%)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          opacity: splashFading ? 0 : 1,
          transform: splashFading ? 'scale(1.04)' : 'scale(1)',
          pointerEvents: splashFading ? 'none' : 'all',
        }}>
          <style>{`
            @keyframes splashPulse {
              0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(27,79,138,0.25); }
              50% { transform: scale(1.08); box-shadow: 0 0 0 18px rgba(27,79,138,0); }
            }
            @keyframes splashBarFill {
              0% { width: 0%; }
              30% { width: 45%; }
              70% { width: 78%; }
              100% { width: 98%; }
            }
            @keyframes splashDot {
              0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
              40% { transform: scale(1); opacity: 1; }
            }
          `}</style>

          {/* Logo ring */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 8px 32px rgba(27,79,138,0.16), 0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'splashPulse 1.6s ease-in-out infinite',
            marginBottom: 20,
            border: '2px solid rgba(27,79,138,0.08)',
          }}>
            <img
              src={hospitalLogo}
              alt="Logo"
              style={{ width: 68, height: 68, objectFit: 'contain', borderRadius: '50%' }}
            />
          </div>

          {/* App name */}
          <div style={{
            fontSize: 18, fontWeight: 700, color: '#1B4F8A',
            letterSpacing: '0.02em', marginBottom: 4,
            fontFamily: "'Inter', 'Poppins', sans-serif",
          }}>{hospitalName}</div>
          <div style={{
            fontSize: 12, color: '#94a3b8', fontWeight: 500,
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 28,
          }}>Therapist Portal</div>

          {/* Progress bar */}
          <div style={{
            width: 180, height: 4, borderRadius: 99,
            background: 'rgba(27,79,138,0.10)', overflow: 'hidden',
            marginBottom: 16,
          }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, #1B4F8A, #0ea5e9)',
              animation: 'splashBarFill 1.6s ease-out forwards',
            }} />
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#1B4F8A',
                animation: `splashDot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ── App ── */}
      <Suspense fallback={
        <div style={{
          height: '100vh', display: 'flex', justifyContent: 'center',
          alignItems: 'center', background: '#fff', flexDirection: 'column',
        }}>
          <img src={hospitalLogo} alt="Logo"
            style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 12,
              animation: 'blinkHeart 1s infinite ease-in-out' }}
          />
          <style>{`@keyframes blinkHeart{0%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:.8}100%{transform:scale(1);opacity:1}}`}</style>
        </div>
      }>
        <Routes>
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><DefaultLayout /></ProtectedRoute>}>
            {routes
              .filter(route => route.path !== '/login')
              .map((route, idx) => {
                const Element = route.element
                return <Route key={idx} path={route.path} element={<Element />} />
              })}
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}

export default App