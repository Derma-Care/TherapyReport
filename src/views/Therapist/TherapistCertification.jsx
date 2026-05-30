import React, { useState, useRef, useEffect, useCallback } from "react"
import {
    CCard,
    CCardBody,
    CCardHeader,
    CForm,
    CFormInput,
    CButton,
    CTable,
    CTableHead,
    CTableHeaderCell,
    CTableBody,
    CTableRow,
    CTableDataCell,
    CModal,
    CModalHeader,
    CModalBody,
    CModalTitle,
    CBadge,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import {
    cilCloudUpload,
    cilFile,
    cilX,
    cilCheckCircle,
    cilClock,
    cilSearch,
    cilDataTransferDown,
    cilFolderOpen,
    cilDescription,
} from "@coreui/icons"
import { COLORS } from "../../Constant/Themes"
import { uploadFile } from "../../Utils/S3UploadService"
import { BASE_URL } from "../../API/BaseUrl"

// ─── Injected responsive CSS ─────────────────────────────────────────────────
const RESPONSIVE_CSS = `
  @media (max-width: 576px) {
    .cert-form-grid {
      grid-template-columns: 1fr !important;
    }
    .cert-card-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 10px !important;
    }
    .cert-search-wrap {
      width: 100% !important;
    }
    .cert-table-wrap { display: none !important; }
    .cert-mobile-list { display: flex !important; }
  }
  @media (min-width: 577px) {
    .cert-table-wrap { display: block !important; }
    .cert-mobile-list { display: none !important; }
  }
`

// ─── Inline styles ────────────────────────────────────────────────────────────

const styles = {
    page: {
        maxWidth: 960,
        margin: "0 auto",
        padding: "2rem 1rem",

    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        background: "#f8f9fa",
        borderRadius: 10,
        padding: "14px 18px",
        border: "0.5px solid #e4e6ea",
    },
    statLabel: {
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "#8b929a",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 26,
        fontWeight: 600,
        color: "#1a1d23",
        lineHeight: 1,
    },
    card: {
        border: "0.5px solid #e4e6ea",
        borderRadius: 12,
        boxShadow: "none",
        marginBottom: 20,
    },
    cardHeader: {
        background: "#fff",
        borderBottom: "0.5px solid #e4e6ea",
        padding: "16px 20px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 600,
        color: "#1a1d23",
        margin: 0,
    },
    cardSub: {
        fontSize: 12,
        color: "#8b929a",
        marginTop: 2,
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
    },
    mobileCertCard: {
        border: "0.5px solid #e4e6ea",
        borderRadius: 10,
        padding: "14px 16px",
        background: "#fff",
        marginBottom: 10,
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    mobileCertRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 8,
    },
    mobileCertLabel: {
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "#8b929a",
        minWidth: 90,
        flexShrink: 0,
    },
    mobileCertValue: {
        fontSize: 13,
        color: "#1a1d23",
        fontWeight: 500,
        textAlign: "right",
        flex: 1,
    },
    mobileCertMuted: {
        fontSize: 12,
        color: "#5c6370",
        textAlign: "right",
        flex: 1,
    },
    mobileCertIndex: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "#f0f4ff",
        color: "#2563eb",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0,
    },
    label: {
        fontSize: 12,
        fontWeight: 500,
        color: "#5c6370",
        letterSpacing: "0.03em",
        marginBottom: 6,
        display: "block",
    },
    input: {
        height: 38,
        borderRadius: 8,
        border: "0.5px solid #d1d5db",
        fontSize: 13,
        color: "#1a1d23",
        background: "#fff",
        padding: "0 10px",
        width: "100%",
        outline: "none",
        transition: "border-color 0.15s",
    },
    fileZone: {
        border: "1px dashed #d1d5db",
        borderRadius: 10,
        background: "#f8f9fa",
        padding: "18px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
    },
    fileZoneActive: {
        borderColor: "#3b82f6",
        background: "#eff6ff",
    },
    fileIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 8,
        background: "#dbeafe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    fileTag: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "#eff6ff",
        color: "#2563eb",
        fontSize: 12,
        padding: "4px 10px",
        borderRadius: 6,
        marginTop: 8,
        fontWeight: 500,
    },
    submitRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 20,
        paddingTop: 16,
        borderTop: "0.5px solid #e4e6ea",
    },
    btnClear: {
        background: "transparent",
        border: "0.5px solid #d1d5db",
        borderRadius: 8,
        padding: "0 14px",
        height: 34,
        fontSize: 13,
        color: "#5c6370",
        cursor: "pointer",

    },
    btnSubmit: {
        backgroundColor: COLORS.primary,
        border: "none",
        borderRadius: 8,
        padding: "0 16px",
        height: 34,
        fontSize: 13,
        fontWeight: 500,
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,

    },
    th: {
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "#8b929a",
        padding: "10px 14px",
        borderBottom: "0.5px solid #e4e6ea",
        background: "#fff",
        whiteSpace: "nowrap",
    },
    td: {
        padding: "11px 14px",
        fontSize: 13,
        color: "#1a1d23",
        borderBottom: "0.5px solid #f0f0f0",
        verticalAlign: "middle",
    },
    tdMuted: {
        padding: "11px 14px",
        fontSize: 13,
        color: "#8b929a",
        borderBottom: "0.5px solid #f0f0f0",
        verticalAlign: "middle",
    },
    badgeVerified: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "#dcfce7",
        color: "#166534",
        fontSize: 11,
        fontWeight: 500,
        padding: "3px 8px",
        borderRadius: 99,
        border: "none",
    },
    badgePending: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "#fef3c7",
        color: "#92400e",
        fontSize: 11,
        fontWeight: 500,
        padding: "3px 8px",
        borderRadius: 99,
        border: "none",
    },
    btnView: {
        background: "transparent",
        border: "0.5px solid #d1d5db",
        borderRadius: 6,
        padding: "3px 10px",
        fontSize: 12,
        color: "#5c6370",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,

    },
    emptyState: {
        textAlign: "center",
        padding: "3rem",
        color: "#8b929a",
        fontSize: 13,
    },
    searchWrap: {
        position: "relative",
        width: 220,
    },
    searchIcon: {
        position: "absolute",
        left: 10,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#8b929a",
        pointerEvents: "none",
    },
    searchInput: {
        height: 32,
        width: "100%",
        borderRadius: 8,
        border: "0.5px solid #d1d5db",
        fontSize: 12,
        paddingLeft: 30,
        paddingRight: 8,
        outline: "none",
        color: "#1a1d23",
        background: "#f8f9fa",

    },
    toastWrap: {
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
    },
    toast: (visible, isError) => ({
        background: isError ? "#ef4444" : "#1a1d23",
        color: "#fff",
        fontSize: 13,
        padding: "10px 14px",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        gap: 8,

        fontWeight: 500,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.22s ease, opacity 0.22s ease",
        pointerEvents: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }),
    pdfFrame: {
        width: "100%",
        height: 320,
        border: "0.5px solid #e4e6ea",
        borderRadius: 8,
        background: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 10,
        color: "#8b929a",
        fontSize: 13,
    },
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, isError, visible }) {
    return (
        <div style={styles.toast(visible, isError)}>
            {isError
                ? <CIcon icon={cilX} size="sm" />
                : <CIcon icon={cilCheckCircle} size="sm" />
            }
            {message}
        </div>
    )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value }) {
    return (
        <div style={styles.statCard}>
            <div style={styles.statLabel}>{label}</div>
            <div style={styles.statValue}>{value}</div>
        </div>
    )
}

// ─── Date formatter ──────────────────────────────────────────────────────────

function formatDateTime(raw) {
    if (!raw) return '—'
    try {
        const d = new Date(raw)
        if (isNaN(d.getTime())) return raw
        return d.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
    } catch {
        return raw
    }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TherapistCertification() {

    const [form, setForm] = useState({
        certificationName: "",
        issuingAuthority: "",
        certificateFile: null,
    })

    const [certifications, setCertifications] = useState([])
    const [search, setSearch] = useState("")
    const [previewModal, setPreviewModal] = useState(false)
    const [selectedCert, setSelectedCert] = useState(null)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [toast, setToast] = useState({ visible: false, message: "", isError: false })
    const [submitting, setSubmitting] = useState(false)
    const [fileActive, setFileActive] = useState(false)

    const fileRef = useRef()
    const toastTimer = useRef()

    const showToast = useCallback((message, isError = false) => {
        clearTimeout(toastTimer.current)
        setToast({ visible: true, message, isError })
        toastTimer.current = setTimeout(() => {
            setToast(t => ({ ...t, visible: false }))
        }, 3000)
    }, [])

    useEffect(() => {
        fetchCertifications()
        return () => clearTimeout(toastTimer.current)
    }, [])

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
        if (!allowedTypes.includes(file.type)) {
            showToast("Only PDF, JPEG, and PNG files are allowed", true)
            fileRef.current.value = ""
            return
        }
        if (file.size > 200 * 1024) {
            showToast("File size must be below 200 KB", true)
            fileRef.current.value = ""
            return
        }
        setForm(prev => ({ ...prev, certificateFile: file }))
    }

    const clearForm = () => {
        setForm({ certificationName: "", issuingAuthority: "", certificateFile: null })
        if (fileRef.current) fileRef.current.value = ""
    }

    const uploadCertificate = async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch("https://yourdomain.com/api/upload-certificate", {
            method: "POST",
            body: formData,
        })
        const result = await response.json()
        return result.url
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { certificationName, issuingAuthority, certificateFile } = form
        if (!certificationName || !issuingAuthority || !certificateFile) {
            showToast("Please fill all fields and select a file", true)
            return
        }
        setSubmitting(true)
        try {
            const fileKey = await uploadFile("certificate", certificateFile)

            const td = JSON.parse(localStorage.getItem('therapistData') || '{}')
            const clinicId = td?.clinicId || td?.data?.clinicId || '0001'
            const branchId = td?.branchId || td?.data?.branchId || '000101'
            const therapistId = td?.therapistId || td?.data?.therapistId

            const payload = {
                clinicId,
                branchId,
                therapistId,
                certificateName: certificationName,
                issueAuthority: issuingAuthority,
                upload: fileKey,
            }

            const response = await fetch(`${BASE_URL}/createTherapistCertificate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (response.ok || data.success) {
                clearForm()
                showToast("Certification uploaded successfully")
                fetchCertifications()
            } else {
                showToast(data.message || "Upload failed. Please try again.", true)
            }
        } catch (error) {
            console.error(error)
            showToast("Upload failed. Please try again.", true)
        } finally {
            setSubmitting(false)
        }
    }

    const fetchCertifications = async () => {
        try {
            const td = JSON.parse(localStorage.getItem('therapistData') || '{}')
            const clinicId = td?.clinicId || td?.data?.clinicId || '0001'
            const branchId = td?.branchId || td?.data?.branchId || '000101'
            const therapistId = td?.therapistId || td?.data?.therapistId
            const response = await fetch(`${BASE_URL}/getTherapistCertificatesByClinicIdBranchIdAndTherapistId/${clinicId}/${branchId}/${therapistId}`)
            const result = await response.json()
            if (result.success && result.data) {
                const certs = Array.isArray(result.data) ? result.data : [result.data]
                console.log("Certifications", certs)
                setCertifications(certs)
            } else {
                setCertifications([])
            }
        } catch (error) {
            console.error("Error fetching certifications:", error)
            setCertifications([])
        }
    }

    const filtered = certifications.filter(c => {
        const name = (c.certificateName || c.certificationName || '').toLowerCase()
        const authority = (c.issueAuthority || c.issuingAuthority || '').toLowerCase()
        const q = search.toLowerCase()
        return name.includes(q) || authority.includes(q)
    })

    const verifiedCount = certifications.filter(c => (c.status || 'pending') === "verified").length
    const pendingCount = certifications.filter(c => (c.status || 'pending') === "pending").length

    return (
        <div style={styles.page}>
            {/* Injected responsive CSS */}
            <style>{RESPONSIVE_CSS}</style>

            {/* Stats */}
            {/* <div style={styles.statsGrid}>
                <StatCard label="Total uploaded" value={certifications.length} />
                <StatCard label="Verified" value={verifiedCount} />
                <StatCard label="Pending review" value={pendingCount} />
            </div> */}

            {/* Upload Form */}
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <div>
                        <p style={styles.cardTitle}>Upload certification</p>
                        <p style={styles.cardSub}>PDF only · max 200 KB per file</p>
                    </div>
                    <CIcon icon={cilDescription} size="lg" style={{ color: "#8b929a" }} />
                </div>
                <div style={{ padding: "20px" }}>
                    <CForm onSubmit={handleSubmit}>
                        <div style={styles.formGrid} className="cert-form-grid">

                            <div>
                                <label style={styles.label}>Certification name</label>
                                <input
                                    style={styles.input}
                                    name="certificationName"
                                    value={form.certificationName}
                                    onChange={handleChange}
                                    placeholder="e.g. Licensed Clinical Social Worker"
                                />
                            </div>

                            <div>
                                <label style={styles.label}>Issuing authority</label>
                                <input
                                    style={styles.input}
                                    name="issuingAuthority"
                                    value={form.issuingAuthority}
                                    onChange={handleChange}
                                    placeholder="e.g. State Board of Psychology"
                                />
                            </div>

                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={styles.label}>Certificate file</label>
                                <div
                                    style={{
                                        ...styles.fileZone,
                                        ...(fileActive || form.certificateFile ? styles.fileZoneActive : {}),
                                    }}
                                    onClick={() => fileRef.current?.click()}
                                    onMouseEnter={() => setFileActive(true)}
                                    onMouseLeave={() => setFileActive(false)}
                                >
                                    <div style={styles.fileIconWrap}>
                                        <CIcon icon={cilCloudUpload} style={{ color: "#2563eb" }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1d23" }}>
                                            {form.certificateFile ? "File selected" : "Click to select a PDF"}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#8b929a", marginTop: 2 }}>
                                            Maximum size 200 KB
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="application/pdf,image/jpeg,image/png"
                                        ref={fileRef}
                                        onChange={handleFile}
                                        style={{ display: "none" }}
                                    />
                                </div>
                                {form.certificateFile && (
                                    <div style={styles.fileTag}>
                                        <CIcon icon={cilFile} size="sm" />
                                        {form.certificateFile.name}
                                        <span
                                            style={{ cursor: "pointer", marginLeft: 4, opacity: 0.7 }}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setForm(prev => ({ ...prev, certificateFile: null }))
                                                if (fileRef.current) fileRef.current.value = ""
                                            }}
                                        >
                                            ×
                                        </span>
                                    </div>
                                )}
                            </div>

                        </div>

                        <div style={styles.submitRow}>
                            <button type="button" style={styles.btnClear} onClick={clearForm}>
                                Clear
                            </button>
                            <button type="submit" style={styles.btnSubmit} disabled={submitting}>
                                <CIcon icon={cilCloudUpload} size="sm" style={{ color: "white" }} />
                                {submitting ? "Uploading…" : "Upload certification"}
                            </button>
                        </div>
                    </CForm>
                </div>
            </div>

            {/* Certifications Table */}
            <div style={styles.card}>
                <div style={styles.cardHeader} className="cert-card-header">
                    <div>
                        <p style={styles.cardTitle}>Uploaded certifications</p>
                        <p style={styles.cardSub}>All documents submitted for this therapist</p>
                    </div>
                    {certifications.length > 0 && (
                        <div style={styles.searchWrap} className="cert-search-wrap">
                            <span style={styles.searchIcon}>
                                <CIcon icon={cilSearch} size="sm" />
                            </span>
                            <input
                                style={styles.searchInput}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search…"
                            />
                        </div>
                    )}
                </div>
                {/* ── Desktop table ── */}
                <div style={{ overflowX: "auto" }} className="cert-table-wrap">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={{ ...styles.th, width: 48 }}>#</th>
                                <th style={styles.th}>Certification name</th>
                                <th style={styles.th}>Issuing authority</th>
                                <th style={{ ...styles.th, width: 120 }}>Upload date</th>
                                <th style={{ ...styles.th, width: 80 }}>File</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={styles.emptyState}>
                                        <div>
                                            <CIcon icon={cilFolderOpen} size="xl" style={{ color: "#d1d5db", marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
                                            {search ? "No results match your search" : "No certifications uploaded yet"}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item, index) => (
                                    <tr
                                        key={index}
                                        style={{ transition: "background 0.1s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#f8f9fa"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <td style={{ ...styles.tdMuted, width: 48 }}>{index + 1}</td>
                                        <td style={{ ...styles.td, fontWeight: 500 }}>
                                            {item.certificateName || item.certificationName}
                                        </td>
                                        <td style={styles.tdMuted}>{item.issueAuthority || item.issuingAuthority}</td>
                                        <td style={styles.tdMuted}>
                                            {formatDateTime(item.uploadDateTime || item.createdAt)}
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                style={styles.btnView}
                                                onClick={() => {
                                                    setSelectedCert(item)
                                                    setPreviewLoading(true)
                                                    setPreviewModal(true)
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Mobile card list ── */}
                <div
                    className="cert-mobile-list"
                    style={{ flexDirection: "column", padding: "12px 14px", gap: 10 }}
                >
                    {filtered.length === 0 ? (
                        <div style={styles.emptyState}>
                            <CIcon icon={cilFolderOpen} size="xl" style={{ color: "#d1d5db", display: "block", margin: "0 auto 8px" }} />
                            {search ? "No results match your search" : "No certifications uploaded yet"}
                        </div>
                    ) : (
                        filtered.map((item, index) => (
                            <div key={index} style={styles.mobileCertCard}>
                                {/* Header row: index badge + cert name + view btn */}
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={styles.mobileCertIndex}>{index + 1}</span>
                                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1a1d23", lineHeight: 1.3 }}>
                                        {item.certificateName || item.certificationName}
                                    </span>
                                    <button
                                        style={{ ...styles.btnView, flexShrink: 0 }}
                                        onClick={() => {
                                            setSelectedCert(item)
                                            setPreviewLoading(true)
                                            setPreviewModal(true)
                                        }}
                                    >
                                        <CIcon icon={cilFile} size="sm" />
                                        View
                                    </button>
                                </div>
                                {/* Authority row */}
                                <div style={styles.mobileCertRow}>
                                    <span style={styles.mobileCertLabel}>Authority</span>
                                    <span style={styles.mobileCertMuted}>
                                        {item.issueAuthority || item.issuingAuthority || "—"}
                                    </span>
                                </div>
                                {/* Date row */}
                                <div style={styles.mobileCertRow}>
                                    <span style={styles.mobileCertLabel}>Uploaded</span>
                                    <span style={styles.mobileCertMuted}>
                                        {formatDateTime(item.uploadDateTime || item.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* PDF Preview Modal */}
            <CModal
                visible={previewModal}
                onClose={() => { setPreviewModal(false); setPreviewLoading(false) }}
                size="lg"
            >
                <CModalHeader style={{ borderBottom: "0.5px solid #e4e6ea" }}>
                    <CModalTitle style={{ fontSize: 15, fontWeight: 600 }}>
                        {selectedCert?.certificateName || selectedCert?.certificationName || "Certificate preview"}
                    </CModalTitle>
                </CModalHeader>
                <CModalBody style={{ padding: 20 }}>
                    <div style={{ ...styles.pdfFrame, position: 'relative', minHeight: 320 }}>
                        {/* Loading spinner overlay */}
                        {previewLoading && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                background: '#f8f9fa', borderRadius: 8, zIndex: 2,
                                gap: 12,
                            }}>
                                <div style={{
                                    width: 36, height: 36,
                                    border: '3px solid #e4e6ea',
                                    borderTop: `3px solid ${COLORS.primary}`,
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                }} />
                                <span style={{ fontSize: 12, color: '#8b929a', fontWeight: 500 }}>Loading preview…</span>
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                        )}
                        {(selectedCert?.upload || selectedCert?.certificateUrl) ? (
                            (selectedCert.upload || selectedCert.certificateUrl).match(/\.(jpeg|jpg|png|webp|gif)/i) ||
                                !(selectedCert.upload || selectedCert.certificateUrl).includes(".pdf") ? (
                                <img
                                    src={selectedCert.upload || selectedCert.certificateUrl}
                                    alt="Certificate Preview"
                                    onLoad={() => setPreviewLoading(false)}
                                    onError={() => setPreviewLoading(false)}
                                    style={{
                                        maxWidth: "100%", maxHeight: "100%",
                                        objectFit: "contain", borderRadius: 8,
                                        opacity: previewLoading ? 0 : 1,
                                        transition: 'opacity 0.3s',
                                    }}
                                />
                            ) : (
                                <iframe
                                    src={selectedCert.upload || selectedCert.certificateUrl}
                                    title="PDF Preview"
                                    width="100%"
                                    height="100%"
                                    onLoad={() => setPreviewLoading(false)}
                                    style={{ border: "none", borderRadius: 8 }}
                                />
                            )
                        ) : (
                            <>
                                <CIcon icon={cilFile} size="3xl" style={{ color: "#d1d5db" }} />
                                <span>{selectedCert?.fileName ?? "No preview available"}</span>
                            </>
                        )}
                    </div>
                    {(selectedCert?.upload || selectedCert?.certificateUrl) && (
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                            <a
                                href={selectedCert.upload || selectedCert.certificateUrl}
                                download
                                style={{ textDecoration: "none" }}
                            >
                                <button style={styles.btnSubmit}>
                                    <CIcon icon={cilDataTransferDown} size="sm" />
                                    Download
                                </button>
                            </a>
                        </div>
                    )}
                </CModalBody>
            </CModal>

            {/* Toast */}
            <div style={styles.toastWrap}>
                <Toast
                    message={toast.message}
                    isError={toast.isError}
                    visible={toast.visible}
                />
            </div>

        </div>
    )
}