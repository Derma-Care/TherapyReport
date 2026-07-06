import React, { useState, useEffect, useMemo } from "react";
import {
  Search, ChevronLeft, ChevronRight, Star,
  MessageSquareQuote, Users, Award, BarChart2, RefreshCw,
} from "lucide-react";
import { BASE_URL } from "../../API/BaseUrl";

const therapistData = JSON.parse(localStorage.getItem("therapistData"));
const API_URL = `${BASE_URL}/getTherapistFeedback/${therapistData.clinicId}/${therapistData.branchId}/${therapistData.therapistId}`;

/* ── theme (matches AppHeader PRIMARY) ── */
const PRIMARY = "#1B4F8A";
const PRIMARY_DARK = "#143d6e";
const PRIMARY_LIGHT = "#e8f0fb";
const PRIMARY_MID = "#2563be";
const ACCENT = "#f59e0b";   // gold for stars / quote
const SUCCESS = "#16a34a";
const WARNING = "#ea580c";
const BORDER = "#dde4f0";
const BG = "#f4f7fc";
const CARD = "#ffffff";
const INK = "#0f172a";
const MUTED = "#64748b";

/* ── helpers ── */
function hasValue(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return !Number.isNaN(v);
  return true;
}
function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return iso; }
}

/* ── sub-components ── */
function Stars({ rating }) {
  const r = Math.round(parseFloat(rating));
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14}
          fill={i < r ? ACCENT : "none"}
          stroke={i < r ? ACCENT : "#cbd5e1"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

function Highlight({ text, term }) {
  if (!hasValue(text)) return null;
  if (!term) return <>{text}</>;
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = String(text).split(new RegExp(`(${safe})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase()
          ? <mark key={i} style={{ background: "rgba(245,158,11,0.25)", color: "inherit", borderRadius: 2, padding: "0 1px" }}>{part}</mark>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </>
  );
}

/* ── global styles injected once ── */
const injectStyles = () => {
  if (document.getElementById("tf-styles")) return;
  const el = document.createElement("style");
  el.id = "tf-styles";
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @keyframes tf-spin    { to { transform: rotate(360deg); } }
    @keyframes tf-fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    .tf-card { animation: tf-fadeUp .28s ease both; }
    .tf-card:hover { box-shadow: 0 6px 24px rgba(27,79,138,0.13) !important; transform: translateY(-1px); }
    .tf-search:focus { border-color: ${PRIMARY} !important; box-shadow: 0 0 0 3px rgba(27,79,138,0.12) !important; }
    .tf-select:hover  { border-color: ${PRIMARY} !important; }
    .tf-pg-btn {
      border:1.5px solid #dde4f0; background:#fff; color:#374151;
      font-size:13px; padding:7px 13px; border-radius:8px; cursor:pointer;
      font-family:inherit; transition:all .15s;
    }
    .tf-pg-btn:hover:not(:disabled) { border-color:${PRIMARY}; color:${PRIMARY}; }
    .tf-pg-btn.tf-active { background:${PRIMARY}; border-color:${PRIMARY}; color:#fff; font-weight:600; }
    .tf-pg-btn:disabled { opacity:.4; cursor:not-allowed; }
    .tf-spinner {
      width:34px; height:34px; border-radius:50%;
      border:3px solid #dde4f0; border-top:3px solid ${PRIMARY};
      animation: tf-spin .75s linear infinite; margin:0 auto 14px;
    }
    .tf-retry {
      display:inline-flex; align-items:center; gap:6px;
      padding:9px 18px; background:${PRIMARY}; color:#fff;
      border:none; border-radius:8px; font-size:13px; font-weight:600;
      cursor:pointer; font-family:inherit; margin-top:14px;
      transition:background .15s;
    }
    .tf-retry:hover { background:${PRIMARY_DARK}; }
    @media (max-width: 600px) {
      .tf-retry-header { padding: 8px 10px !important; border-radius: 8px !important; }
      .tf-retry-text { display: none; }
      .tf-header-row { flex-wrap: nowrap !important; }
    }
  `;
  document.head.appendChild(el);
};

const STAT_ICONS = [
  <Users size={15} key="u" color="#93c5fd" />, // light blue
  <Star size={15} key="s" color="#fcd34d" />,  // gold
  <Award size={15} key="a" color="#86efac" />, // light green
  <BarChart2 size={15} key="b" color="#c4b5fd" />, // light purple
];

export default function TherapistFeedback() {
  useEffect(() => { injectStyles(); }, []);

  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("dateDesc");
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);

  async function loadData() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(API_URL, { method: "GET", headers: { Accept: "application/json" } });
      let payload;
      try { payload = await res.json(); } catch { throw new Error(`Non-JSON response (HTTP ${res.status})`); }
      if (!res.ok) throw new Error(payload?.message || `HTTP ${res.status}`);
      if (!payload?.success || !payload?.data) throw new Error(payload?.message || "Backend reported failure.");
      setStats(payload.data);
      setFeedbacks(payload.data.feedbacks || []);
    } catch (err) {
      setError(err?.message || "Could not reach the server.");
      setStats(null); setFeedbacks([]);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []); // eslint-disable-line

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = feedbacks.filter(f => {
      if (!term) return true;
      const hay = [f.patientName, f.serviceName, f.patientFeedbackComment,
      f.whatWentWell, f.improvements, f.appointmentId]
        .filter(hasValue).join(" ").toLowerCase();
      return hay.includes(term);
    });
    list = [...list].sort((a, b) => {
      if (sort === "dateDesc") return new Date(b.submittedDate) - new Date(a.submittedDate);
      if (sort === "dateAsc") return new Date(a.submittedDate) - new Date(b.submittedDate);
      if (sort === "ratingDesc") return (b.averageRating || 0) - (a.averageRating || 0);
      if (sort === "ratingAsc") return (a.averageRating || 0) - (b.averageRating || 0);
      return 0;
    });
    return list;
  }, [feedbacks, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => { setPage(p => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const resetPage = fn => (...args) => { fn(...args); setPage(1); };

  const statTiles = stats ? [
    { num: stats.totalPatients, lbl: "Patients" },
    { num: hasValue(stats.averageSessionRating) ? stats.averageSessionRating.toFixed(1) : null, lbl: "Session Avg" },
    { num: hasValue(stats.averageOverallRating) ? stats.averageOverallRating.toFixed(1) : null, lbl: "Overall Avg" },
    { num: hasValue(stats.overallAverageRating) ? stats.overallAverageRating.toFixed(1) : null, lbl: "Combined" },
  ].filter(s => hasValue(s.num)) : [];

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div style={{ minHeight: "100%", background: BG, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", WebkitFontSmoothing: "antialiased" }}>

      {/* ── HEADER ── */}
      <header style={{
        background: `linear-gradient(135deg, ${PRIMARY_DARK} 0%, ${PRIMARY} 60%, ${PRIMARY_MID} 100%)`,
        padding: "28px 28px 24px", position: "relative", overflow: "hidden",
      }}>
        {/* decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <div className="tf-header-row" style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.22)", borderRadius: 20,
              padding: "4px 12px", fontSize: 10, fontWeight: 700,
              letterSpacing: ".09em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)",
              marginBottom: 10,
            }}>
              <MessageSquareQuote size={12} color="#fcd34d" /> Patient Feedback
            </div>
            <h1 style={{ margin: 0, fontSize: "clamp(20px,2.8vw,30px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Ratings &amp; Reviews
            </h1>
            <p style={{ marginTop: 5, fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>
              See what your patients say about their experience
            </p>
          </div>

          <button className="tf-retry tf-retry-header" onClick={loadData} style={{ marginTop: 0, alignSelf: "flex-start", flexShrink: 0 }}>
            <RefreshCw size={15} color="#ffffff" /> <span className="tf-retry-text">Refresh</span>
          </button>
        </div>

        {/* stat tiles */}
        {statTiles.length > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20, position: "relative", zIndex: 1 }}>
            {statTiles.map((s, i) => (
              <div key={s.lbl} style={{
                background: "rgba(255,255,255,0.13)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12,
                padding: "12px 18px", minWidth: 100,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.65)", marginBottom: 4, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>
                  {STAT_ICONS[i]} {s.lbl}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{s.num}</div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 20px 80px" }}>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
          {/* search */}
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: MUTED, pointerEvents: "none" }} />
            <input
              className="tf-search"
              type="text"
              value={search}
              onChange={resetPage(e => setSearch(e.target.value))}
              placeholder="Search patient, service, or comment…"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 14px 10px 38px",
                border: `1.5px solid ${BORDER}`, borderRadius: 10,
                background: CARD, fontSize: 13.5, color: INK, outline: "none",
                fontFamily: "inherit", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "border-color .2s",
              }}
            />
          </div>

          <select className="tf-select" value={sort} onChange={resetPage(e => setSort(e.target.value))}
            style={{ padding: "10px 14px", border: `1.5px solid ${BORDER}`, borderRadius: 10, background: CARD, fontSize: 13, color: INK, cursor: "pointer", outline: "none", fontFamily: "inherit", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <option value="dateDesc">Newest first</option>
            <option value="dateAsc">Oldest first</option>
            <option value="ratingDesc">Highest rated</option>
            <option value="ratingAsc">Lowest rated</option>
          </select>

          <select className="tf-select" value={pageSize} onChange={resetPage(e => setPageSize(parseInt(e.target.value, 10)))}
            style={{ padding: "10px 14px", border: `1.5px solid ${BORDER}`, borderRadius: 10, background: CARD, fontSize: 13, color: INK, cursor: "pointer", outline: "none", fontFamily: "inherit", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
          </select>
        </div>

        {/* result count */}
        {!loading && (
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 14, fontWeight: 500 }}>
            {filtered.length === 0
              ? "No reviews found"
              : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length} review${filtered.length === 1 ? "" : "s"}`}
          </div>
        )}

        {/* ── States ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 24px", background: CARD, borderRadius: 16, border: `1.5px solid ${BORDER}` }}>
            <div className="tf-spinner" />
            <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>Loading feedback…</p>
          </div>

        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 24px", background: CARD, borderRadius: 16, border: `1.5px solid ${BORDER}` }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
            <p style={{ color: "#dc2626", fontWeight: 700, fontSize: 14, margin: "0 0 6px" }}>Couldn't load feedback</p>
            <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>{error}</p>
            <button className="tf-retry" onClick={loadData}><RefreshCw size={13} /> Try Again</button>
          </div>

        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "70px 24px", background: CARD, borderRadius: 16, border: `1.5px dashed ${BORDER}` }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: INK, margin: "0 0 6px" }}>No matching feedback</p>
            <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>Try a different name, service, or keyword.</p>
          </div>

        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pageItems.map((f, idx) => {
              const hasRatings = hasValue(f.sessionRating) || hasValue(f.overallRating);
              const hasComment = hasValue(f.patientFeedbackComment);
              const hasWell = hasValue(f.whatWentWell);
              const hasImprov = hasValue(f.improvements);
              const hasGrid = hasWell || hasImprov;

              return (
                <article
                  key={`${currentPage}-${idx}-${f.appointmentId ?? ""}`}
                  className="tf-card"
                  style={{
                    background: CARD,
                    borderRadius: 14,
                    border: `1.5px solid ${BORDER}`,
                    borderLeft: `4px solid ${PRIMARY}`,
                    padding: "18px 20px",
                    boxShadow: "0 1px 6px rgba(27,79,138,0.06)",
                    transition: "box-shadow .2s, transform .2s",
                    animationDelay: `${idx * 45}ms`,
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                    {/* Left */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: PRIMARY_DARK, letterSpacing: "-0.01em" }}>
                        <Highlight text={f.patientName} term={search} />
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 5 }}>
                        {hasValue(f.serviceName) && (
                          <span style={{ display: "inline-flex", alignItems: "center", background: PRIMARY_LIGHT, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, color: PRIMARY }}>
                            <Highlight text={f.serviceName} term={search} />
                          </span>
                        )}
                        {hasValue(f.appointmentId) && (
                          <span style={{ fontSize: 12, color: MUTED }}>
                            Appt <b style={{ color: INK }}><Highlight text={f.appointmentId} term={search} /></b>
                          </span>
                        )}
                        {hasValue(f.appointmentDate) && (
                          <span style={{ fontSize: 12, color: MUTED }}>· {fmtDate(f.appointmentDate)}</span>
                        )}
                        {hasValue(f.submittedDate) && (
                          <span style={{ fontSize: 12, color: MUTED }}>· Submitted {fmtDate(f.submittedDate)}</span>
                        )}
                      </div>
                    </div>

                    {/* Right: ratings */}
                    {hasRatings && (
                      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexShrink: 0 }}>
                        {hasValue(f.sessionRating) && (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                            <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".1em", color: MUTED, fontWeight: 600 }}>Session</span>
                            <Stars rating={f.sessionRating} />
                          </div>
                        )}
                        {hasValue(f.overallRating) && (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                            <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".1em", color: MUTED, fontWeight: 600 }}>Overall</span>
                            <Stars rating={f.overallRating} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Comment */}
                  {hasComment && (
                    <div style={{
                      display: "flex", gap: 10, alignItems: "flex-start",
                      background: "#fefce8", border: "1px solid #fde68a",
                      borderRadius: 10, padding: "11px 14px", marginTop: 14,
                    }}>
                      <MessageSquareQuote size={15} style={{ color: ACCENT, flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#374151", fontStyle: "italic", margin: 0 }}>
                        "<Highlight text={f.patientFeedbackComment} term={search} />"
                      </p>
                    </div>
                  )}

                  {/* Detail grid */}
                  {hasGrid && (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: hasWell && hasImprov ? "1fr 1fr" : "1fr",
                      gap: 10, marginTop: 12,
                    }}>
                      {hasWell && (
                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "11px 13px" }}>
                          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700, color: SUCCESS, marginBottom: 5 }}>✓ What went well</div>
                          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: 0 }}>
                            <Highlight text={f.whatWentWell} term={search} />
                          </p>
                        </div>
                      )}
                      {hasImprov && (
                        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "11px 13px" }}>
                          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700, color: WARNING, marginBottom: 5 }}>↑ Room to improve</div>
                          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: 0 }}>
                            <Highlight text={f.improvements} term={search} />
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 28, flexWrap: "wrap" }}>
            <button className="tf-pg-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft size={14} style={{ verticalAlign: "middle" }} /> Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1;
              if (totalPages > 7 && n !== 1 && n !== totalPages && Math.abs(n - currentPage) > 1) {
                if (n === 2 || n === totalPages - 1) return <span key={n} style={{ color: MUTED, padding: "0 2px" }}>…</span>;
                return null;
              }
              return (
                <button key={n} className={`tf-pg-btn${n === currentPage ? " tf-active" : ""}`} onClick={() => setPage(n)}>
                  {n}
                </button>
              );
            })}

            <button className="tf-pg-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Next <ChevronRight size={14} style={{ verticalAlign: "middle" }} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}