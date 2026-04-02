// // toastUtil.js
// import { toast } from 'react-toastify'
// export const showToast = (msg, type = 'info') => {
//   const options = { toastId: msg, position: 'top-right', autoClose: 4000 }
//   if (type === 'success') toast.success(msg, options)
//   else if (type === 'error') toast.error(msg, options)
//   else if (type === 'warning') toast.warning(msg, options)
//   else toast.info(msg, options)
// }

// components/CustomToast.jsx
import React from 'react'
import { toast } from 'react-toastify'
 
 

const CustomToast = ({ message, type = 'success' }) => {
 
    return (
        <div className={`custom-toast ${type}`}>
          
            <div className="toast-message">{message}</div>
        </div>
    )
}

export const showCustomToast = (message, type = 'success') => {
    toast(<CustomToast message={message} type={type} />, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        toastId: `custom-${message}`,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        closeButton: (
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', marginRight: '10px' }}>
                ×
            </span>
        ),
    })
}
