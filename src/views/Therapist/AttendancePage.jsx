import React, { useState, useEffect } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormLabel,
  CSpinner,
} from "@coreui/react";
import {
  User, Phone, Stethoscope, Activity,
  CheckCircle2, Clock, CalendarDays, ArrowRight,
  ClipboardList, Users, Zap, LogIn, LogOut, ShieldCheck, MapPin, ChevronRight, ListChecks, Eye
} from 'lucide-react';
import { COLORS } from "../../Constant/Themes";
import ConfirmModal from "../../Utils/ConfirmLogoutModal";
import { BASE_URL } from "../../API/BaseUrl";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ScrollPicker = ({ items, selected, onChange, label }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '85px' }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{label}</div>
      <div style={{
        height: '110px',
        overflowY: 'auto',
        border: '1px solid #d1d5db',
        borderRadius: 8,
        width: '100%',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
        className="hide-scrollbar"
      >
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {items.map(item => (
          <div
            key={item}
            onClick={() => onChange(item)}
            style={{
              padding: '8px 0',
              textAlign: 'center',
              cursor: 'pointer',
              background: selected === item ? '#1B4F8A' : 'transparent',
              color: selected === item ? '#fff' : '#374151',
              fontWeight: selected === item ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.2s'
            }}
          >
            {item.toString().padStart(2, '0')}
          </div>
        ))}
      </div>
    </div>
  )
}

const AttendanceTracker = () => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const dateDisplay = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [loginTime, setLoginTime] = useState("");
  const [logoutTime, setLogoutTime] = useState("");
  const [loginLocation, setLoginLocation] = useState("");
  const [logoutLocation, setLogoutLocation] = useState("");
  const [activeTab, setActiveTab] = useState("daily");
  const [showModal, setShowModal] = useState(false);
  const [activity, setActivity] = useState("");
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [address, setAddress] = useState("Fetching...");

  const [data, setData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [activityType, setActivityType] = useState("Training");
  const [description, setDescription] = useState("");
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const location = useLocation();
  const storedData = localStorage.getItem('therapistData');
  const therapistData = location.state || (storedData ? JSON.parse(storedData) : {});
  const therapistId = therapistData?.therapistId;
  const clinicId = therapistData?.clinicId || "0001";
  const branchId = therapistData?.branchId || "NA";
  const navigate = useNavigate()
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }),
          () => resolve({ latitude: "", longitude: "" })
        );
      } else {
        resolve({ latitude: "", longitude: "" });
      }
    });
  };

  const fetchDailyData = async () => {
    try {
      setLoadingDaily(true);
      const res = await axios.get(`${BASE_URL}/getDaily/${therapistId}/${dateStr}`);
      const result = res.data;
      if (result.success && result.data) {
        setData(result.data.sessions || []);
        if (result.data.login?.time) {
          setLoginTime(result.data.login.time);
          setLoginLocation(result.data.login.location || "");
          setLoggedIn(true);
        } else {
          setLoginTime("");
          setLoginLocation("");
          setLoggedIn(false);
        }
        if (result.data.logout?.time) {
          setLogoutTime(result.data.logout.time);
          setLogoutLocation(result.data.logout.location || "");
          setLoggedOut(true);
          setLoggedIn(false);
        } else {
          setLogoutTime("");
          setLogoutLocation("");
          setLoggedOut(false);
        }
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching daily data:", err);
    } finally {
      setLoadingDaily(false);
    }
  };

  const fetchDailyDetails = async (date) => {
    try {
      setLoadingDetails(true);
      setShowDetailsModal(true);
      setDetailsData(null);
      const res = await axios.get(`${BASE_URL}/getDaily/${therapistId}/${date}`);
      if (res.data.success) {
        setDetailsData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching daily details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      setLoadingMonthly(true);
      const monthStr = dateStr.substring(0, 7);
      const res = await axios.get(`${BASE_URL}/getMonthly/${therapistId}/${monthStr}`);
      const result = res.data;
      if (result.success && result.data) {
        setMonthlyData(result.data || []);
      } else {
        setMonthlyData([]);
      }
    } catch (err) {
      console.error("Error fetching monthly data:", err);
    } finally {
      setLoadingMonthly(false);
    }
  };

  useEffect(() => {
    fetchDailyData();
    fetchMonthlyData();

    navigator.geolocation &&
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
            );
            setAddress(res.data.display_name);
          } catch {
            setAddress("Unable to fetch address");
          }
        },
        () => setAddress("Location unavailable")
      );
  }, []);

  const updateTimes = async (type, timeStr) => {
    try {
      setIsUpdatingStatus(true);

      let payload = {
        completedDate: dateStr,
      };

      if (type === "login") {
        payload.loginTime = timeStr;
        payload.loginLocation = address;
      } else if (type === "logout") {
        payload.logoutTime = timeStr;
        payload.logoutLocation = address;
      }

      const res = await axios.put(
        `${BASE_URL}/updateAttendance/${therapistId}`,
        payload
      );

      // ✅ only if backend success
      if (res?.data?.success) {
        await fetchDailyData();
        await fetchMonthlyData();

        return true;
      }

      return false;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleLogin = async () => {
    if (loggedIn || loggedOut) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const success = await updateTimes("login", time);

    // ✅ change UI only after backend success
    if (success) {
      setLoggedIn(true);
      setLoginTime(time);
      setLoginLocation(address);
    }
  };

  const handleLogout = () => {
    if (!loggedIn || loggedOut) return;
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const success = await updateTimes("logout", time);

    // ✅ update UI only after backend success
    if (success) {
      setLoggedIn(false);
      setLoggedOut(true);
      setLogoutTime(time);
      setLogoutLocation(address);
      setIsLogoutModalVisible(false);
    }

  };

  const handleAdd = async () => {
    let newErrors = {};

    if (!activityType.trim()) {
      newErrors.activityType = "Activity is required";
    }

    if (activityType === "Other Activity" && !description.trim()) {
      newErrors.description = "Description is required for Other Activity";
    }

    if (durationHours === 0 && durationMinutes === 0) {
      newErrors.duration = "Please select a valid duration";
    }

    setErrors(newErrors);

    // stop if errors exist
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      let durationStr = "";
      if (durationHours > 0) durationStr += `${durationHours} Hour${durationHours > 1 ? 's' : ''} `;
      if (durationMinutes > 0) durationStr += `${durationMinutes} Minute${durationMinutes > 1 ? 's' : ''}`;
      durationStr = durationStr.trim();

      const loc = await getCurrentLocation();
      const payload = {
        completedDate: dateStr,
        activity: activityType, description,
        duration: durationStr,
        location: address
      };

      const res = await axios.post(`${BASE_URL}/attendance/manual-session/${therapistId}`, payload);
      const result = res.data;
      if (result) {
        await fetchDailyData();
        await fetchMonthlyData();

        // reset
        setActivity("");
        setDurationHours(0);
        setDurationMinutes(0);
        setErrors({});
        setShowModal(false);
      }
    } catch (err) {
      console.error("Error updating attendance:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Styles ────────────────────────────────────────────────────────────────
  const isMobile = window.innerWidth <= 576;
  const isTablet = window.innerWidth > 576 && window.innerWidth <= 992;
  const styles = {
    wrap: {
      padding: isMobile ? "1rem" : "1.5rem",
      width: "100%",
      maxWidth: "100%",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,

      padding: "12px 16px",
      borderRadius: 10,
      color: "#fff",
    },
    h2: { fontSize: 18, fontWeight: 600, margin: 0, color: COLORS.primary },
    subtext: { fontSize: 13, color: "#6b7280", marginTop: 2 },

    // Stat cards
    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(160px, 1fr))",
      gap: isMobile ? 12 : 16,
      marginBottom: "1.5rem",
    },
    statCard: {
      background: "#ffffff",
      borderRadius: 12,
      padding: isMobile ? "1rem" : "1.25rem",
      borderLeft: "4px solid #1B4F8A",
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: isMobile ? 90 : 100,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 600,
      color: "#1B4F8A",
    },
    statLabel: {
      fontSize: 11,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      marginBottom: 6,
    },


    // Tabs
    tabs: {
      display: "flex",
      borderBottom: "1px solid #e5e7eb",
      marginBottom: "1.25rem",
      gap: isMobile ? 0 : "1rem",
    },
    tab: (active) => ({
      flex: isMobile ? 1 : "initial",
      textAlign: "center",
      padding: isMobile ? "12px 0" : "10px 24px",
      fontSize: isMobile ? 14 : 15,
      cursor: "pointer",
      color: active ? "#1B4F8A" : "#6b7280",
      fontWeight: active ? 600 : 500,
      borderBottom: active ? "3px solid #1B4F8A" : "3px solid transparent",
      background: "none",
      border: "none",
      transition: "all 0.2s",
      marginBottom: -1,
    }),

    // Card / Table
    card: {
      background: "#fff",
      border: "0.5px solid #e5e7eb",
      borderRadius: 12,
      overflow: "hidden",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: "0.5px solid #e5e7eb",
    },
    cardTitle: { fontSize: 18, fontWeight: 500 },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: isMobile ? 11 : 13,
    },
    th: {
      padding: "10px 18px",
      textAlign: "left",
      fontWeight: 500,
      fontSize: 11,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      background: "#f9fafb",
      borderBottom: "0.5px solid #e5e7eb",
    },
    td: {
      padding: "12px 18px",
      borderBottom: "0.5px solid #f3f4f6",
      verticalAlign: "middle",
    },

    // Badges
    badgeAmber: {
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 500,
      background: "#FAEEDA",
      color: "#854F0B",
    },
    badgeGreen: {
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 500,
      background: "#EAF3DE",
      color: "#3B6D11",
    },
    badgeBlue: {
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 500,
      background: "#E6F1FB",
      color: "#185FA5",
    },

    // Buttons
    btn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "7px 16px",
      borderRadius: 8,
      border: "0.5px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontSize: 13,
      cursor: "pointer",
    },
    btnGreen: {
      background: "#EAF3DE",
      color: "#3B6D11",
      border: "0.5px solid #639922",
      borderRadius: 8,
      padding: "7px 16px",
      fontSize: 13,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    },
    btnRed: {
      background: "#FCEBEB",
      color: "#A32D2D",
      border: "0.5px solid #E24B4A",
      borderRadius: 8,
      padding: "7px 16px",
      fontSize: 13,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    },
    btnBlue: {
      background: "#E6F1FB",
      color: "#185FA5",
      border: "0.5px solid #378ADD",
      borderRadius: 8,
      padding: "7px 16px",
      fontSize: 13,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    },

    // Modal
    modalBg: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    },
    modal: {
      background: "#fff",
      border: "0.5px solid #e5e7eb",
      borderRadius: 12,
      width: "95%",
      maxWidth: 380,
      overflow: "hidden",
    },
    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: "0.5px solid #e5e7eb",
    },
    modalTitle: { fontSize: 15, fontWeight: 500 },
    modalBody: { padding: 18 },
    modalFooter: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      padding: "14px 18px",
      borderTop: "0.5px solid #e5e7eb",
    },
    field: { marginBottom: 14 },
    fieldLabel: {
      display: "block",
      fontSize: 12,
      color: COLORS.primary,
      marginBottom: 5,
    },
    input: {
      width: "100%",
      padding: "8px 12px",
      border: "0.5px solid #d1d5db",
      borderRadius: 8,
      fontSize: 13,
      outline: "none",
      boxSizing: "border-box",
    },
    infoBox: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      fontSize: 12,
      color: "#6b7280",
      background: "#f9fafb",
      padding: "10px 12px",
      borderRadius: 8,
    },
    dot: (color) => ({
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: color,
      display: "inline-block",
      marginRight: 5,
    }),
    addrCell: {
      fontSize: 11,
      color: "#6b7280",
      maxWidth: 180,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      cursor: "pointer",
    },
    // Mobile specific
    mobileCard: {
      background: "#fff",
      borderRadius: 12,
      padding: "1rem",
      marginBottom: "0.85rem",
      border: "0.5px solid #e5e7eb",
      boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
    },
    mobileCardRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    mobileLabel: {
      fontSize: 11,
      textTransform: "uppercase",
      color: "#9ca3af",
      fontWeight: 600,
      letterSpacing: "0.03em",
    },
    mobileValue: {
      fontSize: 13,
      color: "#374151",
      fontWeight: 500,
    }
  };
  const [errors, setErrors] = useState({
    activity: "",
    duration: "",
  });
  // ─── Status badge ──────────────────────────────────────────────────────────
  const StatusBadge = () => {
    if (loggedOut)
      return (
        <span style={styles.badgeAmber}>Signed out</span>
      );
    if (loggedIn)
      return <span style={styles.badgeGreen}>Active</span>;
    return <span style={{ fontSize: 14, color: "#9ca3af" }}>—</span>;
  };

  // ─── Action button ─────────────────────────────────────────────────────────
  const ActionButton = () => {
    if (loadingDaily)
      return (
        <div className="at-skel" style={{ width: "100%", height: 34, borderRadius: 8 }} />
      );
    if (isUpdatingStatus)
      return (
        <button style={{ ...styles.btn, color: "#9ca3af", width: "100%", justifyContent: "center" }} disabled>
          <CSpinner size="sm" style={{ width: '1rem', height: '1rem', marginRight: '6px' }} />
          Updating...
        </button>
      );
    if (loggedOut)
      return (
        <span style={{ fontSize: 12, color: "#9ca3af", padding: "8px 0", width: "100%", textAlign: "center" }}>
          Session ended
        </span>
      );
    if (loggedIn)
      return (
        <button style={{ ...styles.btnRed, width: "100%", justifyContent: "center" }} onClick={handleLogout}>
          <span style={styles.dot("#E24B4A")} />
          Logout
        </button>
      );
    return (
      <button style={{ ...styles.btnGreen, width: "100%", justifyContent: "center" }} onClick={handleLogin}>
        <span style={styles.dot("#888780")} />
        Login
      </button>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "1.5rem"
      }}>
        <div>
          <h2 style={styles.h2}>Daily Duty Log</h2>
          <p style={styles.subtext}>{dateDisplay}</p>
        </div>
        <div style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          justifyContent: isMobile ? "space-between" : "flex-end",
          flexWrap: "wrap",
          width: isMobile ? "100%" : "auto"
        }}>
          <CButton
            style={{
              backgroundColor: COLORS.primary,
              color: "white",
              padding: "7px 16px",
              fontSize: 13,
              borderRadius: 8,
              border: "none",
              fontWeight: 600,
              flex: isMobile ? 1 : "initial",
              textAlign: "center"
            }}
            onClick={() => navigate("/therapist-certification")}
          >
            Certification
          </CButton>
          <div style={{ flex: isMobile ? 1 : "initial", display: "flex", justifyContent: isMobile ? "stretch" : "flex-end", width: isMobile ? "100%" : "auto" }}>
            <ActionButton />
          </div>
        </div>
      </div>


      <ConfirmModal
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        onConfirm={confirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to logout and end your session for today?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
      />

      {/* Stat cards */}
      <div style={styles.statsGrid}>
        {[
          {
            label: "Login",
            icon: <LogIn size={14} />,
            value: loadingDaily ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <div className="at-skel" style={{ height: 18, width: '70%', borderRadius: 4 }} />
                <div className="at-skel" style={{ height: 10, width: '90%', borderRadius: 4 }} />
              </div>
            ) : (
              <div>
                <div>{loginTime || "—"}</div>
                {loginTime && (
                  <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 400, marginTop: 4, display: 'flex', alignItems: 'center' }}>
                    <MapPin size={10} style={{ marginRight: 4 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                      {loginLocation || "Location not recorded"}
                    </span>
                  </div>
                )}
              </div>
            ),
          },
          {
            label: "Logout",
            icon: <LogOut size={14} />,
            value: loadingDaily ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <div className="at-skel" style={{ height: 18, width: '70%', borderRadius: 4 }} />
                <div className="at-skel" style={{ height: 10, width: '90%', borderRadius: 4 }} />
              </div>
            ) : (
              <div>
                <div>{logoutTime || "—"}</div>
                {logoutTime && (
                  <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 400, marginTop: 4, display: 'flex', alignItems: 'center' }}>
                    <MapPin size={10} style={{ marginRight: 4 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                      {logoutLocation || "Location not recorded"}
                    </span>
                  </div>
                )}
              </div>
            ),
          },
          {
            label: "Activities",
            icon: <Activity size={14} />,
            value: loadingDaily
              ? <div className="at-skel" style={{ height: 22, width: 36, borderRadius: 4, marginTop: 4 }} />
              : data.length,
          },
          {
            label: "Status",
            icon: <ShieldCheck size={14} />,
            value: loadingDaily
              ? <div className="at-skel" style={{ height: 22, width: 70, borderRadius: 20, marginTop: 4 }} />
              : <StatusBadge />,
          },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={{ color: "#1B4F8A", opacity: 0.6 }}>{s.icon}</div>
            </div>
            <div style={styles.statValue}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["daily", "monthly"].map((t) => (
          <button
            key={t}
            style={styles.tab(activeTab === t)}
            onClick={() => setActiveTab(t)}
          >
            {t === "daily" ? "Daily log" : "Monthly"}
          </button>
        ))}
      </div>

      {/* Daily tab */}
      {activeTab === "daily" && (
        <div style={styles.card} >
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Today's activities</span>
            <button
              style={{
                ...styles.btnBlue,
                opacity: loggedIn ? 1 : 0.5,
                cursor: loggedIn ? "pointer" : "not-allowed"
              }}
              disabled={!loggedIn}
              onClick={() => setShowModal(true)}
            >
              + Add activity
            </button>
          </div>
          <div style={{ padding: isMobile ? "0 4px" : 0 }}>
            {loadingDaily ? (
              <div style={{ padding: isMobile ? '1rem' : '0' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, padding: isMobile ? '12px 0' : '14px 18px',
                    borderBottom: '0.5px solid #f3f4f6', alignItems: 'center'
                  }}>
                    <div className="at-skel" style={{ width: 20, height: 14, borderRadius: 4, flexShrink: 0 }} />
                    <div className="at-skel" style={{ flex: 2, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ flex: 1, height: 22, borderRadius: 20 }} />
                    <div className="at-skel" style={{ flex: 2, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ width: 70, height: 14, borderRadius: 4 }} />
                  </div>
                ))}
              </div>
            ) : isMobile ? (
              /* Mobile Daily View */
              <div style={{ padding: "1rem" }}>
                {data.map((item, i) => (
                  <div key={item.sessionId || i} style={styles.mobileCard}>
                    <div style={styles.mobileCardRow}>
                      <span style={styles.mobileLabel}>Activity</span>
                      <span style={{ ...styles.mobileValue, fontWeight: 700, color: "#1B4F8A" }}>{item.activity}</span>
                    </div>
                    {item.description && (
                      <div style={{ marginBottom: 8 }}>
                        <span style={styles.mobileLabel}>Description</span>
                        <div style={{ fontSize: 12, color: "#374151", marginTop: 2, lineHeight: 1.4 }}>{item.description || "NA"}</div>
                      </div>
                    )}
                    <div style={styles.mobileCardRow}>
                      <span style={styles.mobileLabel}>Duration</span>
                      <span style={styles.badgeAmber}>{item.duration}</span>
                    </div>
                    <div style={{ marginBottom: 0, paddingTop: 8, borderTop: "0.5px solid #f3f4f6" }}>
                      <span style={styles.mobileLabel}><MapPin size={11} style={{ marginRight: 4 }} /> Location</span>
                      <div
                        title={item.location || ""}
                        style={styles.addrCell}
                      >
                        {item.location || "—"}
                      </div>
                    </div>
                  </div>
                ))}
                {data.length === 0 && (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                    <ListChecks size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <p style={{ fontSize: 13 }}>No activities logged today.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Daily View */
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["#", "Activity", "Description", "Duration", "Location"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, i) => (
                      <tr key={item.sessionId || i}>
                        <td style={styles.td}>{i + 1}</td>
                        <td style={styles.td}>
                          <div
                            title={item.activity || ""}
                            style={{
                              maxWidth: "180px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: 11,
                              color: "#6b7280",
                              cursor: "pointer",
                            }}
                          >
                            {item.activity || "—"}
                          </div>
                        </td>
                        <td style={{ ...styles.td, color: "#374151", fontSize: 12 }}>
                          {item.description || <span style={{ color: "#d1d5db" }}>NA</span>}
                        </td>
                        <td style={styles.td}>
                          <span  >{item.duration}</span>
                        </td>
                        <td style={{
                          maxWidth: "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: 11,
                          color: "#6b7280",
                          cursor: "pointer",
                        }}>
                          {item.location || "—"}
                        </td>
                      </tr>
                    ))}
                    {data.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ ...styles.td, textAlign: "center", color: "#9ca3af", padding: "20px" }}>
                          No activities logged today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monthly tab */}
      {activeTab === "monthly" && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Monthly summary</span>
          </div>
          <div style={{ padding: isMobile ? "0 4px" : 0 }}>
            {loadingMonthly ? (
              <div style={{ padding: isMobile ? '1rem' : '0' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, padding: isMobile ? '12px 0' : '14px 18px',
                    borderBottom: '0.5px solid #f3f4f6', alignItems: 'center'
                  }}>
                    <div className="at-skel" style={{ flex: 1.2, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ flex: 1, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ flex: 1, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ flex: 1, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ flex: 1, height: 22, borderRadius: 20 }} />
                    <div className="at-skel" style={{ flex: 0.8, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ width: 56, height: 26, borderRadius: 7 }} />
                  </div>
                ))}
              </div>
            ) : isMobile ? (
              /* Mobile Monthly View */
              <div style={{ padding: "1rem" }}>
                {monthlyData.map((item, i) => (
                  <div key={i} style={styles.mobileCard}>
                    <div style={{ ...styles.mobileCardRow, borderBottom: "1px solid #f3f4f6", pb: 8, mb: 10 }}>
                      <span style={{ ...styles.mobileValue, fontWeight: 700 }}>{item.date}</span>
                      <button
                        style={{ border: 'none', background: 'none', padding: 4, cursor: 'pointer' }}
                        onClick={() => fetchDailyDetails(item.date)}
                      >
                        <Eye size={16} color={COLORS.primary} />
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                      <div>
                        <div style={styles.mobileLabel}>Login</div>
                        <div style={styles.mobileValue}>{item.inTime || "—"}</div>
                      </div>
                      <div>
                        <div style={styles.mobileLabel}>Logout</div>
                        <div style={styles.mobileValue}>{item.outTime || "—"}</div>
                      </div>
                      <div>
                        <div style={styles.mobileLabel}>Working</div>
                        <span style={styles.badgeGreen}>{item.workingHours || "—"}</span>
                      </div>
                      <div>
                        <div style={styles.mobileLabel}>Total Log</div>
                        <div style={styles.mobileValue}>{item.logTime || "—"}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {monthlyData.length === 0 && (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                    <CalendarDays size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <p style={{ fontSize: 13 }}>No records found for this month.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Monthly View */
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Date", "Login", "Logout", "Total", "Working", "Idle", "Action"].map((h) => (
                        // {["Date", "Login", "Logout", "Total", "Working", "Idle"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((item, i) => (
                      <tr key={i}>
                        <td style={styles.td}>{item.date}</td>
                        <td style={styles.td}>{item.inTime}</td>
                        <td style={styles.td}>{item.outTime}</td>
                        <td style={styles.td}>{item.logTime}</td>
                        <td style={styles.td}>
                          <span style={styles.badgeGreen}>{item.workingHours}</span>
                        </td>
                        <td style={styles.td}>{item.idleTime}</td>
                        <td style={styles.td}>
                          <button
                            style={{ ...styles.btnBlue, padding: '4px 8px' }}
                            onClick={() => fetchDailyDetails(item.date)}
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {monthlyData.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ ...styles.td, textAlign: "center", color: "#9ca3af", padding: "20px" }}>
                          No records found for this month.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          alignment="center" backdrop="static"
        >
          <CModalHeader>
            <CModalTitle>Add Activity</CModalTitle>
          </CModalHeader>

          <CModalBody>
            {/* Activity */}
            {/* Activity Type */}
            <div style={{ marginBottom: 14 }}>
              <CFormLabel
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.primary,
                  marginBottom: 6,
                }}
              >
                Activity Name
              </CFormLabel>

              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  fontSize: 13,
                  outline: "none",
                  background: "#fff",
                }}
              >
                <option value="Training">Training</option>
                <option value="Other Activity">Other Activity</option>
                <option value="Paid Leave">Paid Leave</option>
                <option value="Loss of Pay">Loss of Pay</option>

              </select>
            </div>



            {/* Description */}
            <div style={{ marginBottom: 14 }}>
              <CFormLabel
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.primary,
                  marginBottom: 6,
                  display: "flex",
                  gap: 4,
                  alignItems: "center"
                }}
              >
                Description
                {activityType === "Other Activity" && (
                  <span style={{ color: "#dc2626", fontSize: 12 }}>*</span>
                )}
              </CFormLabel>

              <textarea
                rows={3}
                placeholder={activityType === "Other Activity" ? "Required — describe the other activity..." : "Enter activity description (optional)..."}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors({ ...errors, description: "" });
                }}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: errors.description ? "1px solid #dc2626" : "1px solid #d1d5db",
                  padding: "10px 12px",
                  fontSize: 13,
                  resize: "none",
                  outline: "none",
                }}
              />
              {errors.description && (
                <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>
                  {errors.description}
                </div>
              )}
            </div>

            {/* Duration */}
            {/* Duration */}
            <div style={{ marginBottom: 16 }}>
              <CFormLabel
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.primary,
                  marginBottom: 8,
                  display: "block",
                }}
              >
                Duration
              </CFormLabel>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                {/* Hours */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      marginBottom: 6,
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    Hours
                  </div>

                  <CFormInput
                    type="number"
                    min={0}
                    max={12}
                    value={durationHours}
                    onChange={(e) => {
                      let value = Number(e.target.value)

                      if (value > 12) value = 12
                      if (value < 0) value = 0

                      setDurationHours(value)
                      setErrors({ ...errors, duration: "" })
                    }}
                    style={{
                      textAlign: "center",
                      fontSize: "22px",
                      fontWeight: 700,
                      borderRadius: "12px",
                      border: "1px solid #dbe2ea",
                      color: COLORS.primary,
                      height: "58px",
                    }}
                  />
                </div>

                {/* Colon */}
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    marginTop: "24px",
                  }}
                >
                  :
                </div>

                {/* Minutes */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      marginBottom: 6,
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    Minutes
                  </div>

                  <CFormInput
                    type="number"
                    min={0}
                    max={59}
                    value={durationMinutes}
                    onChange={(e) => {
                      let value = Number(e.target.value)

                      if (value > 59) value = 59
                      if (value < 0) value = 0

                      setDurationMinutes(value)
                      setErrors({ ...errors, duration: "" })
                    }}
                    style={{
                      textAlign: "center",
                      fontSize: "22px",
                      fontWeight: 700,
                      borderRadius: "12px",
                      border: "1px solid #dbe2ea",
                      color: COLORS.primary,
                      height: "58px",
                    }}
                  />
                </div>
              </div>

              {errors.duration && (
                <div
                  style={{
                    color: "#dc2626",
                    fontSize: 11,
                    marginTop: 6,
                  }}
                >
                  {errors.duration}
                </div>
              )}
            </div>

            {/* Info Box – date only; location is captured per-activity from device GPS */}
            <div
              style={{
                background: "#f9fafb",
                padding: 10,
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              <div>
                <strong>Date:</strong> {dateStr}
              </div>
            </div>
          </CModalBody>

          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? <CSpinner size="sm" /> : "Save"}
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      {/* Daily Details Modal */}
      <CModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        alignment="center"
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Daily Report - {detailsData?.date}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingDetails ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <CSpinner color="primary" />
            </div>
          ) : detailsData ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: (detailsData.login || detailsData.logout) && !isMobile ? '1fr 1fr' : '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {detailsData.login && (
                  <div style={styles.infoBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: COLORS.primary, marginBottom: 4 }}>
                      <LogIn size={14} />
                      <strong style={{ fontSize: 13 }}>Login Details</strong>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <Clock size={12} style={{ marginRight: 6, display: 'inline' }} />
                      <span style={{ fontWeight: 600 }}>{detailsData.login.time || '—'}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'flex-start' }}>
                      <MapPin size={12} style={{ marginRight: 6, marginTop: 2, flexShrink: 0 }} />
                      <span>{detailsData.login.location || 'Location not recorded'}</span>
                    </div>
                  </div>
                )}

                {detailsData.logout && (
                  <div style={styles.infoBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#A32D2D', marginBottom: 4 }}>
                      <LogOut size={14} />
                      <strong style={{ fontSize: 13 }}>Logout Details</strong>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <Clock size={12} style={{ marginRight: 6, display: 'inline' }} />
                      <span style={{ fontWeight: 600 }}>{detailsData.logout.time || '—'}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'flex-start' }}>
                      <MapPin size={12} style={{ marginRight: 6, marginTop: 2, flexShrink: 0 }} />
                      <span>{detailsData.logout.location || 'Location not recorded'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1rem', fontWeight: 600, fontSize: 14, color: COLORS.primary, borderBottom: `2px solid ${COLORS.primary}`, paddingBottom: 4, display: 'inline-block' }}>
                Activity Log
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["#", "Activity", "Description", "Duration", "Location"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detailsData.sessions && detailsData.sessions.length > 0 ? (
                      detailsData.sessions.map((session, index) => (
                        <tr key={index}>
                          <td style={styles.td}>{index + 1}</td>
                          <td style={{ ...styles.td, fontWeight: 600, color: COLORS.primary, whiteSpace: "nowrap" }}>
                            {session.activity}
                          </td>
                          <td style={{ ...styles.td, fontSize: 12, color: "#374151" }}>
                            {session.description || <span style={{ color: "#d1d5db" }}>NA</span>}
                          </td>
                          <td style={styles.td}>
                            <span>{session.duration}</span>
                          </td>
                          <td style={{ ...styles.td, fontSize: 11, color: "#6b7280", minWidth: 140, wordBreak: "break-word" }}>
                            {session.location || "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ ...styles.td, textAlign: "center", color: "#9ca3af", padding: "20px" }}>
                          No sessions found for this day.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
              Failed to load data.
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      {/* Skeleton shimmer styles */}
      <style>{`
        @keyframes at-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .at-skel {
          background: linear-gradient(90deg, #f0f4f8 25%, #e2eaf2 50%, #f0f4f8 75%);
          background-size: 800px 100%;
          animation: at-shimmer 1.4s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default AttendanceTracker;