import React from 'react'




const SessionList = React.lazy(() =>
  import('./views/Therapist/SessionList.jsx')
)

const TherapistDashboard = React.lazy(() =>
  import('./views/Therapist/TherapistDashboard.jsx')
)

const TherapistDetails = React.lazy(() =>
  import('./views/Therapist/TherapistDetails.jsx')
)

const AttendancePage = React.lazy(() =>
  import('./views/Therapist/AttendancePage.jsx')
)

const TherapistCertification = React.lazy(() =>
  import('./views/Therapist/TherapistCertification.jsx')
)

const TherapistFeedback = React.lazy(() =>
  import('./views/Therapist/TherapistFeedback.jsx')
)



// const Login = React.lazy(() =>
//   import('./views/login/login.jsx')
// )




const routes = [

  // { path: '/login', name: 'Dashboard', element: Login },
  { path: '/therapist', name: 'Dashboard', element: TherapistDashboard },

  { path: "/session-list", element: SessionList },

  { path: "/therapist-details", element: TherapistDetails },
  { path: "/therapist/attendance", element: AttendancePage },
  { path: "/therapist-certification", element: TherapistCertification },
  { path: "/therapist-feedback", element: TherapistFeedback },









]

export default routes
