import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import DefaultLayout from './layout/DefaultLayout'
import routes from './routes'
import ProtectedRoute from './Routes/ProtectedRoute'
import Login from './views/login/Login'
import './App.css'
import { useHospital } from './Context/HospitalContext'

function App() {
 const hospitalData = JSON.parse(localStorage.getItem("selectedClinic") || "{}");

  const hospitalLogo = hospitalData?.hospitalLogo
    ? `data:image/webp;base64,${hospitalData.hospitalLogo}`
    : "";
  return (
    <Suspense  fallback={
        <div
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#fff",
            flexDirection: "column",
          }}
        >
          <style>
            {`
              @keyframes blinkHeart {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.15); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
              }

              .heart-loader {
                animation: blinkHeart 1s infinite ease-in-out;
              }
            `}
          </style>

          {hospitalLogo && (
            <img
              src={hospitalLogo}
              alt="Hospital Logo"
              className="heart-loader"
              style={{
                width: "80px",
                height: "80px",
                objectFit: "contain",
                marginBottom: "12px",
              }}
            />
          )}

          {/* <h6 style={{ color: "var(--color-black)", margin: 0 }}>
            Loading...
          </h6> */}
        </div>
      }>
      <Routes>

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DefaultLayout />
            </ProtectedRoute>
          }
        >
          {routes
            .filter(route => route.path !== '/login') // ❗ remove login from here
            .map((route, idx) => {
              const Element = route.element
              return (
                <Route
                  key={idx}
                  path={route.path}
                  element={<Element />}
                />
              )
            })}
        </Route>

      </Routes>
    </Suspense>
  )
}

export default App