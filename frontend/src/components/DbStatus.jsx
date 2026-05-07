import API_BASE_URL from "../apiConfig";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaDatabase,
  FaFolderOpen,
  FaHdd,
  FaChartLine,
  FaShieldAlt
} from "react-icons/fa";

const MAX_STORAGE_MB = 512;

const DatabaseUsage = () => {
  const getTheme = () => {
    return (
      document.documentElement.getAttribute("data-admin-theme") ||
      localStorage.getItem("adminTheme") ||
      "light"
    );
  };

  const [theme, setTheme] = useState(getTheme());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleThemeChanged = (event) => {
      setTheme(event.detail?.theme || getTheme());
    };

    window.addEventListener("admin-theme-changed", handleThemeChanged);

    return () => {
      window.removeEventListener("admin-theme-changed", handleThemeChanged);
    };
  }, []);

  useEffect(() => {
    const fetchDbStats = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_BASE_URL}/api/auth/admin/db-stats`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setStats(res.data);
      } catch (err) {
        console.error("Failed to load DB stats:", err);
        setError("Unable to load database statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDbStats();
  }, []);

  const summary = useMemo(() => {
    if (!stats?.database) return null;

    const usedMB = Number(stats.database.totalStorageMB || 0);
    const estimatedMB = Number(stats.database.totalEstimatedSizeMB || 0);
    const freeMB = Math.max(MAX_STORAGE_MB - usedMB, 0);
    const percentageUsed = Math.min((usedMB / MAX_STORAGE_MB) * 100, 100);

    let usageLabel = "Healthy";
    let usageTone = "success";

    if (percentageUsed >= 85) {
      usageLabel = "Critical";
      usageTone = "danger";
    } else if (percentageUsed >= 65) {
      usageLabel = "Warning";
      usageTone = "warning";
    }

    return {
      usedMB,
      estimatedMB,
      freeMB,
      percentageUsed,
      usageLabel,
      usageTone
    };
  }, [stats]);

  const sortedCollections = useMemo(() => {
    if (!stats?.collections) return [];
    return [...stats.collections].sort(
      (a, b) => Number(b.storageSizeMB) - Number(a.storageSizeMB)
    );
  }, [stats]);

  const pageClass = `db-page ${theme === "dark" ? "theme-dark" : "theme-light"}`;

  if (loading) {
    return (
      <div className={pageClass}>
        <div className="container py-5">
          <div className="loading-shell mx-auto text-center">
            <div className="spinner-border db-spinner" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-4 mb-2 db-strong fw-bold">
              Loading storage dashboard
            </h4>
            <p className="db-muted mb-0">Fetching MongoDB Atlas statistics...</p>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className={pageClass}>
        <div className="container py-5">
          <div className="status-card mx-auto text-center">
            <div className="status-icon danger">!</div>
            <h4 className="fw-bold db-strong mb-2">Something went wrong</h4>
            <p className="db-muted mb-0">{error}</p>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (!stats || !summary) {
    return (
      <div className={pageClass}>
        <div className="container py-5">
          <div className="status-card mx-auto text-center">
            <div className="status-icon muted">i</div>
            <h4 className="fw-bold db-strong mb-2">No data available</h4>
            <p className="db-muted mb-0">
              Database statistics are currently unavailable.
            </p>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <div className="container py-4 py-lg-5">
        <div className="hero-card mb-4 mb-lg-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="chip mb-3">
                <span className={`dot ${summary.usageTone}`}></span>
                {summary.usageLabel} Storage Status
              </div>

              <h1 className="hero-title hero-title-row mb-2">
                <span className="db-hero-icon-3d" aria-hidden>
                  <span className="db-hero-icon-inner">
                    <FaDatabase />
                  </span>
                </span>
                <span>MongoDB Atlas Storage Dashboard</span>
              </h1>

              <p className="hero-subtitle mb-0">
                Premium admin monitoring view for database usage, capacity, and
                collection-level storage analytics.
              </p>
            </div>

            <div className="col-lg-4">
              <div className="hero-metric">
                <div className="hero-metric-label">Storage Utilization</div>
                <div className="hero-metric-value">
                  {summary.percentageUsed.toFixed(1)}%
                </div>
                <div className="hero-metric-note">
                  {summary.usedMB.toFixed(2)} MB used of {MAX_STORAGE_MB} MB
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4 mb-lg-5 db-stat-row">
          <div className="col-md-6 col-xl-3 d-flex justify-content-center">
            <div className="stat-card w-100">
              <div className="db-stat-icon-3d db-stat-icon--amber" aria-hidden>
                <span className="db-stat-icon-inner">
                  <FaFolderOpen />
                </span>
              </div>
              <div className="stat-label">Database</div>
              <div className="stat-value">{stats.database.name || "N/A"}</div>
              <div className="stat-meta">{stats.database.collections} collections</div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3 d-flex justify-content-center">
            <div className="stat-card w-100">
              <div className="db-stat-icon-3d db-stat-icon--violet" aria-hidden>
                <span className="db-stat-icon-inner">
                  <FaHdd />
                </span>
              </div>
              <div className="stat-label">Storage Used</div>
              <div className="stat-value">{summary.usedMB.toFixed(2)} MB</div>
              <div className="stat-meta">Live allocated storage</div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3 d-flex justify-content-center">
            <div className="stat-card w-100">
              <div className="db-stat-icon-3d db-stat-icon--coral" aria-hidden>
                <span className="db-stat-icon-inner">
                  <FaChartLine />
                </span>
              </div>
              <div className="stat-label">Estimated Data</div>
              <div className="stat-value">{summary.estimatedMB.toFixed(2)} MB</div>
              <div className="stat-meta">Approximate raw data size</div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3 d-flex justify-content-center">
            <div className="stat-card w-100">
              <div className="db-stat-icon-3d db-stat-icon--iron" aria-hidden>
                <span className="db-stat-icon-inner">
                  <FaShieldAlt />
                </span>
              </div>
              <div className="stat-label">Remaining Space</div>
              <div className="stat-value">{summary.freeMB.toFixed(2)} MB</div>
              <div className="stat-meta">Available free-tier balance</div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4 mb-lg-5">
          <div className="col-lg-7">
            <div className="glass-panel h-100">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title mb-1">Storage Overview</h3>
                  <p className="panel-subtitle mb-0">
                    Real-time storage usage against the free-tier capacity
                  </p>
                </div>
                <span className={`status-badge ${summary.usageTone}`}>
                  {summary.usageLabel}
                </span>
              </div>

              <div className="progress-wrap mt-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="progress-label">Usage Progress</span>
                  <span className="progress-value">
                    {summary.percentageUsed.toFixed(1)}%
                  </span>
                </div>

                <div className="custom-progress">
                  <div
                    className={`custom-progress-bar ${summary.usageTone}`}
                    style={{ width: `${summary.percentageUsed}%` }}
                  />
                </div>

                <div className="d-flex justify-content-between mt-2 progress-scale">
                  <span>0 MB</span>
                  <span>{MAX_STORAGE_MB} MB</span>
                </div>
              </div>

              <div className="info-grid mt-4">
                <div className="info-item">
                  <span className="info-key">Database Name</span>
                  <span className="info-value">{stats.database.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-key">Collections</span>
                  <span className="info-value">{stats.database.collections}</span>
                </div>
                <div className="info-item">
                  <span className="info-key">Used Storage</span>
                  <span className="info-value">{summary.usedMB.toFixed(2)} MB</span>
                </div>
                <div className="info-item">
                  <span className="info-key">Free Balance</span>
                  <span className="info-value">{summary.freeMB.toFixed(2)} MB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="glass-panel h-100">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title mb-1">Capacity Summary</h3>
                  <p className="panel-subtitle mb-0">
                    Snapshot of your current cluster allowance
                  </p>
                </div>
              </div>

              <div className="capacity-list mt-4">
                <div className="capacity-row">
                  <span>Total Capacity</span>
                  <strong>{MAX_STORAGE_MB} MB</strong>
                </div>
                <div className="capacity-row">
                  <span>Allocated Storage</span>
                  <strong>{summary.usedMB.toFixed(2)} MB</strong>
                </div>
                <div className="capacity-row">
                  <span>Estimated Data Size</span>
                  <strong>{summary.estimatedMB.toFixed(2)} MB</strong>
                </div>
                <div className="capacity-row">
                  <span>Remaining Free Space</span>
                  <strong>{summary.freeMB.toFixed(2)} MB</strong>
                </div>
              </div>

              <div className="highlight-box mt-4">
                <div className="highlight-title">Admin Insight</div>
                <div className="highlight-text">
                  {summary.percentageUsed >= 85
                    ? "Your database is close to the free-tier limit. Plan cleanup or upgrade soon."
                    : summary.percentageUsed >= 65
                    ? "Storage usage is increasing. Monitor larger collections carefully."
                    : "Storage usage is currently healthy with safe free capacity remaining."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header mb-3">
            <div>
              <h3 className="panel-title mb-1">Collection Breakdown</h3>
              <p className="panel-subtitle mb-0">
                Collections sorted by storage size, highest first
              </p>
            </div>
          </div>

          <div className="table-responsive custom-table-wrap">
            <table className="table align-middle custom-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Collection</th>
                  <th>Documents</th>
                  <th>Data Size</th>
                  <th>Storage Size</th>
                </tr>
              </thead>
              <tbody>
                {sortedCollections.length > 0 ? (
                  sortedCollections.map((col, index) => (
                    <tr key={col.name || index}>
                      <td>{index + 1}</td>
                      <td>
                        <span className="collection-name">{col.name}</span>
                      </td>
                      <td>{col.count}</td>
                      <td>
                        <span className="mini-badge primary">
                          {Number(col.sizeMB || 0).toFixed(2)} MB
                        </span>
                      </td>
                      <td>
                        <span className="mini-badge info">
                          {Number(col.storageSizeMB || 0).toFixed(2)} MB
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 db-empty-row">
                      No collection data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .db-page {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .db-page.theme-light {
    --db-card-bg: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(246,249,252,0.96));
    --db-card-border: rgba(15, 23, 42, 0.08);
    --db-card-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);

    --db-title: #0f172a;
    --db-subtitle: #475569;
    --db-muted: #64748b;
    --db-text: #334155;
    --db-strong: #0f172a;

    --db-soft-bg: rgba(248, 250, 252, 0.98);
    --db-soft-border: rgba(15, 23, 42, 0.08);

    --db-table-head: rgba(59, 130, 246, 0.08);
    --db-table-row: rgba(255, 255, 255, 0.94);
    --db-table-row-hover: rgba(59, 130, 246, 0.05);

    --db-highlight-bg: rgba(99, 102, 241, 0.08);
    --db-highlight-border: rgba(99, 102, 241, 0.14);

    --db-chip-bg: rgba(15, 23, 42, 0.04);
    --db-chip-color: #334155;

    --db-badge-primary-bg: rgba(59, 130, 246, 0.12);
    --db-badge-primary-color: #2563eb;
    --db-badge-info-bg: rgba(6, 182, 212, 0.12);
    --db-badge-info-color: #0891b2;

    --db-spinner: #2563eb;
  }

  .db-page.theme-dark {
    --db-card-bg: linear-gradient(180deg, rgba(15,23,42,0.94), rgba(24,34,56,0.96));
    --db-card-border: rgba(148, 163, 184, 0.14);
    --db-card-shadow: 0 24px 56px rgba(2, 8, 23, 0.40);

    --db-title: #f8fafc;
    --db-subtitle: #cbd5e1;
    --db-muted: #94a3b8;
    --db-text: #e2e8f0;
    --db-strong: #ffffff;

    --db-soft-bg: rgba(255, 255, 255, 0.05);
    --db-soft-border: rgba(148, 163, 184, 0.12);

    --db-table-head: rgba(255, 255, 255, 0.08);
    --db-table-row: rgba(255, 255, 255, 0.04);
    --db-table-row-hover: rgba(255, 255, 255, 0.07);

    --db-highlight-bg: rgba(99, 102, 241, 0.12);
    --db-highlight-border: rgba(99, 102, 241, 0.18);

    --db-chip-bg: rgba(255, 255, 255, 0.08);
    --db-chip-color: #ffffff;

    --db-badge-primary-bg: rgba(96, 165, 250, 0.16);
    --db-badge-primary-color: #bfdbfe;
    --db-badge-info-bg: rgba(34, 211, 238, 0.16);
    --db-badge-info-color: #a5f3fc;

    --db-spinner: #ffffff;
  }

  .db-strong {
    color: var(--db-strong) !important;
  }

  .db-muted {
    color: var(--db-muted) !important;
  }

  .db-spinner {
    color: var(--db-spinner) !important;
  }

  .hero-card,
  .glass-panel,
  .stat-card,
  .status-card,
  .loading-shell {
    border: 1px solid var(--db-card-border);
    background: var(--db-card-bg);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: var(--db-card-shadow);
    border-radius: 24px;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  }

  .hero-card {
    padding: 2rem;
  }

  .hero-title {
    color: var(--db-title);
    font-size: clamp(1.8rem, 3vw, 2.8rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0;
  }

  .hero-title-row {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    flex-wrap: wrap;
  }

  .db-hero-icon-3d {
    width: 52px;
    height: 52px;
    min-width: 52px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    color: #ffffff;
    position: relative;
    flex-shrink: 0;
    background: linear-gradient(145deg, #22d3ee 0%, #2563eb 52%, #1d4ed8 100%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.38),
      0 12px 24px rgba(0, 0, 0, 0.1),
      0 5px 10px rgba(15, 23, 42, 0.12);
  }

  .db-hero-icon-3d::before {
    content: "";
    position: absolute;
    inset: 1px;
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0.02));
    pointer-events: none;
  }

  .db-hero-icon-3d::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    top: 7px;
    height: 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    filter: blur(1px);
    pointer-events: none;
  }

  .db-hero-icon-inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .db-hero-icon-inner svg {
    width: 22px;
    height: 22px;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.22));
  }

  .hero-subtitle {
    color: var(--db-subtitle);
    font-size: 1rem;
    max-width: 760px;
  }

  .hero-metric {
    padding: 1.4rem;
    border-radius: 20px;
    background: var(--db-soft-bg);
    border: 1px solid var(--db-soft-border);
    text-align: center;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }

  .hero-metric-label {
    color: var(--db-muted);
    font-size: 0.9rem;
    margin-bottom: 0.35rem;
  }

  .hero-metric-value {
    color: var(--db-strong);
    font-size: 2.2rem;
    font-weight: 800;
    line-height: 1;
  }

  .hero-metric-note {
    color: var(--db-muted);
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    background: var(--db-chip-bg);
    color: var(--db-chip-color);
    font-size: 0.85rem;
    font-weight: 700;
    border: 1px solid var(--db-soft-border);
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  .dot.success {
    background: #22c55e;
  }

  .dot.warning {
    background: #f59e0b;
  }

  .dot.danger {
    background: #ef4444;
  }

  .db-stat-row {
    justify-content: center;
  }

  .stat-card {
    padding: 1.4rem;
    height: 100%;
    max-width: min(100%, 300px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .stat-card:hover,
  .glass-panel:hover,
  .hero-card:hover {
    transform: translateY(-4px);
  }

  .db-stat-icon-3d {
    width: 56px;
    height: 56px;
    min-width: 56px;
    border-radius: 17px;
    display: grid;
    place-items: center;
    color: #ffffff;
    position: relative;
    margin-bottom: 0.9rem;
    flex-shrink: 0;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.36),
      0 10px 20px rgba(15, 23, 42, 0.14),
      0 4px 8px rgba(15, 23, 42, 0.08);
  }

  .db-stat-icon-3d::before {
    content: "";
    position: absolute;
    inset: 1px;
    border-radius: 15px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.02));
    pointer-events: none;
  }

  .db-stat-icon-3d::after {
    content: "";
    position: absolute;
    left: 8px;
    right: 8px;
    top: 6px;
    height: 9px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    filter: blur(1px);
    pointer-events: none;
  }

  .db-stat-icon-inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .db-stat-icon-inner svg {
    width: 24px;
    height: 24px;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
  }

  .db-stat-icon--amber {
    background: linear-gradient(145deg, #fde047 0%, #eab308 50%, #ca8a04 100%);
  }

  .db-stat-icon--violet {
    background: linear-gradient(145deg, #c4b5fd 0%, #8b5cf6 50%, #6d28d9 100%);
  }

  .db-stat-icon--coral {
    background: linear-gradient(145deg, #fca5a5 0%, #f97316 48%, #dc2626 100%);
  }

  .db-stat-icon--iron {
    background: linear-gradient(145deg, #cbd5e1 0%, #64748b 45%, #b91c1c 92%);
  }

  .stat-label {
    color: var(--db-muted);
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }

  .stat-value {
    color: var(--db-strong);
    font-size: 1.35rem;
    font-weight: 800;
    word-break: break-word;
  }

  .stat-meta {
    color: var(--db-muted);
    font-size: 0.88rem;
    margin-top: 0.35rem;
  }

  .glass-panel {
    padding: 1.5rem;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .panel-title {
    color: var(--db-title);
    font-size: 1.2rem;
    font-weight: 800;
  }

  .panel-subtitle {
    color: var(--db-muted);
    font-size: 0.92rem;
  }

  .status-badge {
    padding: 0.45rem 0.8rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
    border: 1px solid transparent;
  }

  .status-badge.success {
    background: rgba(34, 197, 94, 0.14);
    color: #16a34a;
    border-color: rgba(34, 197, 94, 0.24);
  }

  .db-page.theme-dark .status-badge.success {
    color: #86efac;
  }

  .status-badge.warning {
    background: rgba(245, 158, 11, 0.14);
    color: #d97706;
    border-color: rgba(245, 158, 11, 0.24);
  }

  .db-page.theme-dark .status-badge.warning {
    color: #fcd34d;
  }

  .status-badge.danger {
    background: rgba(239, 68, 68, 0.14);
    color: #dc2626;
    border-color: rgba(239, 68, 68, 0.24);
  }

  .db-page.theme-dark .status-badge.danger {
    color: #fca5a5;
  }

  .progress-wrap {
    padding: 1rem 1rem 0.9rem;
    border-radius: 18px;
    background: var(--db-soft-bg);
    border: 1px solid var(--db-soft-border);
  }

  .progress-label,
  .progress-value,
  .progress-scale {
    color: var(--db-muted);
    font-size: 0.9rem;
    font-weight: 600;
  }

  .custom-progress {
    width: 100%;
    height: 16px;
    border-radius: 999px;
    overflow: hidden;
    background: var(--db-table-head);
    box-shadow: inset 0 0 0 1px var(--db-soft-border);
  }

  .custom-progress-bar {
    height: 100%;
    border-radius: 999px;
    transition: width 0.35s ease;
  }

  .custom-progress-bar.success {
    background: linear-gradient(90deg, #22c55e, #4ade80);
  }

  .custom-progress-bar.warning {
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
  }

  .custom-progress-bar.danger {
    background: linear-gradient(90deg, #ef4444, #fb7185);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .info-item {
    padding: 1rem;
    border-radius: 18px;
    background: var(--db-soft-bg);
    border: 1px solid var(--db-soft-border);
  }

  .info-key {
    display: block;
    color: var(--db-muted);
    font-size: 0.85rem;
    margin-bottom: 0.35rem;
  }

  .info-value {
    color: var(--db-strong);
    font-size: 1rem;
    font-weight: 700;
  }

  .capacity-list {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .capacity-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.95rem 1rem;
    border-radius: 16px;
    background: var(--db-soft-bg);
    border: 1px solid var(--db-soft-border);
    color: var(--db-text);
  }

  .capacity-row strong {
    color: var(--db-strong);
    font-size: 0.95rem;
  }

  .highlight-box {
    padding: 1rem 1.1rem;
    border-radius: 18px;
    background: var(--db-highlight-bg);
    border: 1px solid var(--db-highlight-border);
  }

  .highlight-title {
    color: var(--db-strong);
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 0.35rem;
  }

  .highlight-text {
    color: var(--db-subtitle);
    font-size: 0.92rem;
    line-height: 1.6;
  }

  .custom-table-wrap {
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid var(--db-soft-border);
  }

  .custom-table {
    color: var(--db-text);
    margin: 0;
  }

  .custom-table thead th {
    background: var(--db-table-head);
    color: var(--db-strong);
    border: none;
    padding: 1rem;
    font-size: 0.9rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .custom-table tbody td {
    background: var(--db-table-row);
    border-top: 1px solid var(--db-soft-border);
    color: var(--db-text);
    padding: 1rem;
    vertical-align: middle;
  }

  .custom-table tbody tr:hover td {
    background: var(--db-table-row-hover);
  }

  .collection-name {
    font-weight: 700;
    color: var(--db-strong);
  }

  .mini-badge {
    display: inline-block;
    padding: 0.38rem 0.7rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .mini-badge.primary {
    background: var(--db-badge-primary-bg);
    color: var(--db-badge-primary-color);
    border: 1px solid rgba(59, 130, 246, 0.16);
  }

  .mini-badge.info {
    background: var(--db-badge-info-bg);
    color: var(--db-badge-info-color);
    border: 1px solid rgba(6, 182, 212, 0.16);
  }

  .db-empty-row {
    color: var(--db-muted) !important;
  }

  .status-card,
  .loading-shell {
    max-width: 540px;
    padding: 2rem;
  }

  .status-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    margin: 0 auto 1rem;
    font-size: 1.5rem;
    font-weight: 800;
  }

  .status-icon.danger {
    background: rgba(239, 68, 68, 0.16);
    color: #ef4444;
  }

  .status-icon.muted {
    background: var(--db-soft-bg);
    color: var(--db-strong);
    border: 1px solid var(--db-soft-border);
  }

  @media (max-width: 991px) {
    .info-grid {
      grid-template-columns: 1fr;
    }

    .hero-card,
    .glass-panel,
    .stat-card {
      border-radius: 20px;
    }
  }

  @media (max-width: 576px) {
    .hero-card,
    .glass-panel,
    .stat-card {
      padding: 1.15rem;
    }

    .hero-metric {
      padding: 1rem;
    }

    .hero-metric-value {
      font-size: 1.9rem;
    }

    .db-stat-icon-3d {
      width: 50px;
      height: 50px;
      min-width: 50px;
      border-radius: 15px;
    }

    .db-stat-icon-3d::before {
      border-radius: 13px;
    }

    .db-stat-icon-inner svg {
      width: 21px;
      height: 21px;
    }

    .db-hero-icon-3d {
      width: 46px;
      height: 46px;
      min-width: 46px;
      border-radius: 14px;
    }

    .db-hero-icon-3d::before {
      border-radius: 12px;
    }

    .db-hero-icon-inner svg {
      width: 19px;
      height: 19px;
    }

    .custom-table thead th,
    .custom-table tbody td {
      padding: 0.85rem;
    }
  }
`;

export default DatabaseUsage;