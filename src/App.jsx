import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import DefaultLayout from './layout/DefaultLayout'
import routes from './routes'
import ProtectedRoute from './Routes/ProtectedRoute'
import Login from './views/login/login'

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
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