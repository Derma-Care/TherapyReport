import React, { useState } from "react"
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from "@coreui/react"
import {
  cilAccountLogout,
  cilHospital,
  cilUser,
  cilStar,
} from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { useNavigate } from "react-router-dom"

import { useHospital } from "../Context/HospitalContext"
import ConfirmModal from "../Utils/ConfirmLogoutModal"
import { getClinicData } from "../views/Therapist/TheraphyApi"

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const { selectedHospital } = useHospital()

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [dropdownVisible, setDropdownVisible] =
    useState(false)

  const handleLogout = () => {
    sessionStorage.clear();

    // Preserve biometric login credentials
    const bioEnabled = localStorage.getItem("biometricEnabled");
    const savedUser = localStorage.getItem("savedUserName");
    const savedPass = localStorage.getItem("savedPassKey");
    const bioCredId = localStorage.getItem("bioCredId");
    
    // Preserve biometric prompt seen flags
    const promptKeys = Object.keys(localStorage).filter(k => k.startsWith('biometricPromptSeen_'));
    const prompts = promptKeys.map(k => ({ key: k, val: localStorage.getItem(k) }));

    localStorage.clear(); 

    // Restore biometric credentials
    if (bioEnabled) localStorage.setItem("biometricEnabled", bioEnabled);
    if (savedUser) localStorage.setItem("savedUserName", savedUser);
    if (savedPass) localStorage.setItem("savedPassKey", savedPass);
    if (bioCredId) localStorage.setItem("bioCredId", bioCredId);
    prompts.forEach(p => localStorage.setItem(p.key, p.val));

    navigate("/login");
  }

  const hospitalData = JSON.parse(
    localStorage.getItem("selectedClinic") || "{}"
  )

  const hospitalLogo = hospitalData?.hospitalLogo
    ? `data:image/webp;base64,${hospitalData.hospitalLogo}`
    : ""

  const hospitalName =
    selectedHospital?.data?.name || "Hospital"

  const isValidLogo =
    hospitalLogo &&
    hospitalLogo !== "null" &&
    hospitalLogo !== "undefined" &&
    hospitalLogo.trim() !== ""

  const getTherapistContext = () => {
    const stored = JSON.parse(
      localStorage.getItem("therapistData") || "{}"
    )

    const clinicId =
      stored?.clinicId || stored?.data?.clinicId

    const branchId =
      stored?.branchId || stored?.data?.branchId

    const therapistId =
      stored?.therapistId || stored?.data?.therapistId

    return { clinicId, branchId, therapistId }
  }

  const handleProfileClick = async () => {
    if (loading) return

    try {
      setLoading(true)
      setDropdownVisible(true) // keep open

      const { clinicId, branchId, therapistId } =
        getTherapistContext()

      const res = await getClinicData(
        clinicId,
        branchId,
        therapistId
      )

      const list = res?.data || []

      const item = Array.isArray(list)
        ? list.find(
          (x) => x.therapistId === therapistId
        )
        : list

      // close after success
      setDropdownVisible(false)

      setTimeout(() => {
        navigate("/therapist-details", {
          state: item,
        })
      }, 200)
    } catch (err) {
      console.error("Clinic Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }


  return (
    <>
      <CDropdown
        variant="nav-item"
        visible={dropdownVisible}
        onVisibleChange={setDropdownVisible}
      >
        <CDropdownToggle
          caret={false}
          className="py-0 pe-0"

          style={{ cursor: "pointer" }}
        >
          {isValidLogo ? (
            <img
              src={hospitalLogo}
              alt={hospitalName}
              width={40}
              height={40}
              style={{
                borderRadius: "50%",
                objectFit: "contain",
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#e9ecef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CIcon icon={cilHospital} size="lg" />
            </div>
          )}
        </CDropdownToggle>

        <CDropdownMenu
          className="pt-0"
          placement="bottom-end"
        >
          <CDropdownItem
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleProfileClick()
            }}
            disabled={loading}
            style={{ cursor: "pointer" }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm "
                  role="status"
                  aria-hidden="true"
                ></span>
                Loading Profile...
              </>
            ) : (
              <>
                <CIcon icon={cilUser} className="me-2" />
                Profile
              </>
            )}
          </CDropdownItem>

          {/* <CDropdownItem
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleFeedbackClick()
            }}
            disabled={feedbackLoading}
            style={{ cursor: "pointer" }}
          >
            {feedbackLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Loading Feedback...
              </>
            ) : (
              <>
                <CIcon icon={cilStar} className="me-2" />
                Ratings &amp; Feedback
              </>
            )}
          </CDropdownItem> */}

          <CDropdownItem
            onClick={() =>
              setShowLogoutModal(true)
            }
            style={{ cursor: "pointer" }}
          >
            <CIcon
              icon={cilAccountLogout}
              className="me-2"
            />
            Logout
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      <ConfirmModal
        visible={showLogoutModal}
        onClose={() =>
          setShowLogoutModal(false)
        }
        onConfirm={() => {
          setShowLogoutModal(false)
          handleLogout()
        }}
        title="Confirm Logout"
        message="Are you sure you want to logout from the Clinic Portal?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        confirmColor="danger"
      />
    </>
  )
}

export default AppHeaderDropdown