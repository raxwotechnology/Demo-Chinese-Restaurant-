import API_BASE_URL from "../apiConfig";
// components/AdminRefreshStatus.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaRedo,
  FaSpinner
} from "react-icons/fa";

const AdminRefreshStatus = () => {
  const [refreshed, setRefreshed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_BASE_URL}/api/auth/refresh-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRefreshed(res.data.refreshed);
      } catch (err) {
        toast.error("Failed to load refresh status");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleReset = async () => {
    if (
      !window.confirm(
        "Mark the system as not refreshed? All users will see a reminder on the header refresh control until they reload."
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/refresh-status/reset`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefreshed(res.data.refreshed);
      toast.success(
        "System marked as not refreshed. Users will see the refresh indicator until they hard refresh."
      );
    } catch (err) {
      toast.error("Failed to reset refresh status");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="refresh-status-page">
      <div className="page-glow glow-1" aria-hidden />
      <div className="page-glow glow-2" aria-hidden />
      <div className="page-grid" aria-hidden />

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">System administration</span>
          <h1 className="hero-title">System refresh indicator</h1>
          <p className="hero-subtitle">
            Control the global refresh flag after deployments or configuration changes so
            cashiers and admins reload the app and pick up the latest assets.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface refresh-main-card">
            <div className="refresh-card-intro">
              <span className="hero-badge">Current status</span>
              <h2 className="section-title">Refresh control</h2>
              <p className="section-subtitle">
                See the live flag, then notify every signed-in user to hard refresh when you ship
                an update.
              </p>
            </div>

            {loading ? (
              <div className="refresh-loading" role="status">
                <FaSpinner className="refresh-loading-icon" aria-hidden />
                <p className="refresh-loading-text">Loading refresh status…</p>
              </div>
            ) : (
              <div className="refresh-status-panel">
                <div className="refresh-status-main">
                  <div
                    className={`refresh-status-pill ${refreshed ? "refresh-status-pill--ok" : "refresh-status-pill--warn"}`}
                  >
                    <span className="refresh-status-pill-icon" aria-hidden>
                      {refreshed ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    </span>
                    <span className="refresh-status-pill-text">
                      {refreshed ? "All clients reported refreshed" : "Refresh required"}
                    </span>
                  </div>
                  <p className="refresh-status-lede">
                    {refreshed
                      ? "No active reminder. Use the action on the right after an update to prompt everyone to hard refresh."
                      : "Users should see a badge on the header refresh control until they reload this application."}
                  </p>
                </div>

                <div className="refresh-status-actions">
                  <button
                    type="button"
                    className="refresh-reset-btn d-inline-flex align-items-center justify-content-center gap-2"
                    onClick={handleReset}
                    disabled={resetting || !refreshed}
                  >
                    {resetting ? (
                      <>
                        <FaSpinner className="refresh-btn-spin" aria-hidden />
                        Updating…
                      </>
                    ) : (
                      <>
                        <FaRedo aria-hidden />
                        Mark system as not refreshed
                      </>
                    )}
                  </button>
                  {!refreshed && (
                    <p className="refresh-action-hint">
                      Status is already &quot;not refreshed&quot;. Users must reload; you cannot
                      clear this flag from here.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="glass-card shared-card-surface refresh-note-card">
            <div className="refresh-card-intro">
              <span className="hero-badge">How it works</span>
              <h2 className="section-title">Header refresh badge</h2>
              <p className="section-subtitle">
                When the system is <strong>not refreshed</strong>, a badge appears on the refresh icon
                in the top bar for every signed-in role. The badge clears only after a{" "}
                <strong>hard refresh</strong> (full reload), so users pick up new JavaScript and
                cached API behaviour.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3200} />

      <style>{`
        .refresh-status-page {
          min-height: calc(100vh - 88px);
          position: relative;
          overflow-x: hidden;
          color: #0f172a;
          padding: 28px 24px 40px;
        }

        .refresh-status-page .page-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
          background-size: 42px 42px;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.02));
        }

        .refresh-status-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.4;
          pointer-events: none;
        }

        .refresh-status-page .glow-1 {
          width: 300px;
          height: 300px;
          top: -80px;
          left: -60px;
          background: hsla(160, 42%, 48%, 0.2);
        }

        .refresh-status-page .glow-2 {
          width: 340px;
          height: 340px;
          right: -80px;
          bottom: -40px;
          background: hsla(200, 55%, 58%, 0.14);
        }

        .refresh-status-page .page-shell {
          width: 100%;
          max-width: min(1120px, 100%);
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .refresh-status-page .page-shell > .hero-card,
        .refresh-status-page .page-shell > .stack-layout,
        .refresh-status-page .stack-layout > .glass-card {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .refresh-status-page .hero-card.shared-card-surface,
        .refresh-status-page .glass-card.shared-card-surface {
          border-radius: 28px !important;
          border: 1px solid rgba(15, 23, 42, 0.08) !important;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.96) 100%
          ) !important;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow:
            0 20px 50px rgba(15, 23, 42, 0.07),
            inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
        }

        .refresh-status-page .hero-card {
          padding: 30px 34px;
          margin-bottom: 22px;
        }

        .refresh-status-page .hero-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: hsl(160, 55%, 24%);
          background: hsla(160, 40%, 42%, 0.12);
          border: 1px solid hsla(160, 45%, 35%, 0.22);
        }

        .refresh-status-page .hero-title {
          margin: 14px 0 8px;
          font-size: clamp(1.5rem, 2.5vw, 2.1rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.12;
          color: #0f172a;
        }

        .refresh-status-page .hero-subtitle {
          margin: 0;
          max-width: 52rem;
          color: #64748b;
          font-size: 15px;
          line-height: 1.65;
        }

        .refresh-status-page .stack-layout {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 18px;
          width: 100%;
        }

        .refresh-status-page .refresh-main-card {
          padding: 28px 30px 26px;
          text-align: left;
        }

        .refresh-status-page .refresh-main-card .refresh-card-intro {
          text-align: left;
        }

        .refresh-status-page .refresh-note-card {
          padding: 28px 30px 26px;
        }

        .refresh-status-page .refresh-card-intro {
          margin-bottom: 22px;
          padding-bottom: 22px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.07);
        }

        .refresh-status-page .refresh-card-intro .section-title {
          margin: 14px 0 8px;
          font-size: clamp(1.25rem, 2vw, 1.65rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.15;
          color: #0f172a;
        }

        .refresh-status-page .refresh-card-intro .section-subtitle {
          margin: 0;
          max-width: 52rem;
          color: #64748b;
          font-size: 16px;
          line-height: 1.65;
        }

        .refresh-status-page .refresh-note-card .refresh-card-intro .section-subtitle {
          text-align: center;
          margin-left: auto;
          margin-right: auto;
        }

        .refresh-status-page .refresh-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          min-height: 200px;
          margin-top: 8px;
          color: #64748b;
        }

        .refresh-status-page .refresh-loading-icon {
          font-size: 2rem;
          color: hsl(160, 42%, 36%);
          animation: refresh-spin 0.85s linear infinite;
        }

        .refresh-status-page .refresh-loading-text {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
        }

        @keyframes refresh-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .refresh-status-page .refresh-status-panel {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-top: 4px;
        }

        .refresh-status-page .refresh-status-main {
          flex: 1;
          min-width: min(100%, 280px);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .refresh-status-page .refresh-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 16px;
          font-weight: 800;
          font-size: 15px;
          border: 1px solid transparent;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.35),
            0 10px 26px rgba(15, 23, 42, 0.08);
        }

        .refresh-status-page .refresh-status-pill--ok {
          color: #065f46;
          background: linear-gradient(145deg, #ecfdf5, #d1fae5);
          border-color: rgba(16, 185, 129, 0.35);
        }

        .refresh-status-page .refresh-status-pill--warn {
          color: #92400e;
          background: linear-gradient(145deg, #fffbeb, #fef3c7);
          border-color: rgba(245, 158, 11, 0.45);
        }

        .refresh-status-page .refresh-status-pill-icon {
          display: grid;
          place-items: center;
          width: 2.35rem;
          height: 2.35rem;
          border-radius: 12px;
          font-size: 1.1rem;
          color: #fff;
          background: linear-gradient(145deg, #34d399, #059669);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
        }

        .refresh-status-page .refresh-status-pill--warn .refresh-status-pill-icon {
          background: linear-gradient(145deg, #fbbf24, #d97706);
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35);
        }

        .refresh-status-page .refresh-status-lede {
          margin: 14px 0 0;
          font-size: 14px;
          line-height: 1.65;
          color: #64748b;
          max-width: none;
        }

        .refresh-status-page .refresh-status-actions {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 10px;
          min-width: min(100%, 300px);
        }

        .refresh-status-page .refresh-reset-btn {
          border: none;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          cursor: pointer;
          min-height: 54px;
          padding: 14px 22px;
          letter-spacing: 0.02em;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 3px 0 rgba(127, 29, 29, 0.2),
            0 14px 32px rgba(239, 68, 68, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }

        .refresh-status-page .refresh-reset-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.03);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.25),
            0 4px 0 rgba(127, 29, 29, 0.16),
            0 18px 40px rgba(239, 68, 68, 0.42);
        }

        .refresh-status-page .refresh-reset-btn:disabled {
          opacity: 0.52;
          cursor: not-allowed;
          transform: none;
          filter: grayscale(0.15);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
        }

        .refresh-status-page .refresh-btn-spin {
          animation: refresh-spin 0.85s linear infinite;
        }

        .refresh-status-page .refresh-action-hint {
          margin: 0;
          font-size: 12px;
          line-height: 1.5;
          color: #94a3b8;
          text-align: center;
        }

        @media (max-width: 768px) {
          .refresh-status-page {
            padding: 18px 14px 28px;
          }

          .refresh-status-page .hero-card,
          .refresh-status-page .refresh-main-card,
          .refresh-status-page .refresh-note-card {
            padding: 22px 18px;
          }

          .refresh-status-page .refresh-status-actions {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminRefreshStatus;
