import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminServiceCharge = () => {
  const [serviceCharge, setServiceCharge] = useState({
    dineInCharge: 0,
    isActive: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServiceCharge();
  }, []);

  const fetchServiceCharge = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/admin/service-charge",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setServiceCharge({
        dineInCharge: Number(res.data?.dineInCharge || 0),
        isActive: Boolean(res.data?.isActive)
      });
    } catch (err) {
      toast.error("Failed to load service charge settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setServiceCharge((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value === ""
            ? ""
            : parseFloat(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      serviceCharge.dineInCharge === "" ||
      Number.isNaN(serviceCharge.dineInCharge)
    ) {
      toast.warning("Please enter a valid service charge percentage.");
      return;
    }

    if (serviceCharge.dineInCharge < 0) {
      toast.warning("Service charge cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const payload = {
        dineInCharge: Number(serviceCharge.dineInCharge),
        isActive: serviceCharge.isActive
      };

      const res = await axios.put(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/admin/service-charge",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setServiceCharge({
        dineInCharge: Number(res.data?.dineInCharge || 0),
        isActive: Boolean(res.data?.isActive)
      });

      toast.success("Service charge updated successfully.");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error("Failed to update service charge.");
    } finally {
      setSaving(false);
    }
  };

  const formattedCharge = useMemo(() => {
    const value = Number(serviceCharge.dineInCharge || 0);
    return `${value.toFixed(2)}%`;
  }, [serviceCharge.dineInCharge]);

  return (
    <div className="service-charge-page">
      <div className="bg-orb orb-one"></div>
      <div className="bg-orb orb-two"></div>
      <div className="bg-grid"></div>

      <div className="page-container">
        {/* Top Header */}
        <div className="topbar-card">
          <div>
            <span className="eyebrow">Restaurant Admin</span>
            <h1 className="page-title">Service Charge Management</h1>
            <p className="page-description">
              Configure dine-in service charge percentage and monitor the live
              service charge status from one place.
            </p>
          </div>

          <div className="topbar-status-card">
            <span className="mini-label">Current Status</span>
            <div
              className={`status-badge-large ${serviceCharge.isActive ? "active" : "inactive"
                }`}
            >
              {serviceCharge.isActive ? "Enabled" : "Disabled"}
            </div>
            <p className="mini-subtext">{formattedCharge} applied to dine-in</p>
          </div>
        </div>

        {/* Main Layout */}
        <div className="dashboard-grid">
          {/* Left Side - Form */}
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Update Service Charge</h2>
                <p className="panel-subtitle">
                  Manage dine-in service charge settings.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="loading-box">Loading current settings...</div>
            ) : (
              <form onSubmit={handleSubmit} className="form-layout">
                <div className="form-group">
                  <label className="form-label">Dine-In Service Charge</label>
                  <p className="field-hint">
                    Enter the percentage to apply to dine-in customer orders.
                  </p>

                  <div className="input-shell">
                    <span className="input-prefix">%</span>
                    <input
                      type="number"
                      name="dineInCharge"
                      value={serviceCharge.dineInCharge}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="Enter percentage"
                      className="custom-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Charge Availability</label>
                  <p className="field-hint">
                    Enable or disable the dine-in service charge instantly.
                  </p>

                  <div className="switch-card">
                    <div>
                      <div className="switch-title">Enable Service Charge</div>
                      <div className="switch-subtitle">
                        Turn service charge on for dine-in orders
                      </div>
                    </div>

                    <label className="toggle-wrapper">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={serviceCharge.isActive}
                        onChange={handleChange}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving || loading}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>

          {/* Right Side - Summary */}
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Current Settings</h2>
                <p className="panel-subtitle">
                  Live overview of the current dine-in service charge.
                </p>
              </div>
            </div>

            <div className="summary-stack">
              <div className="summary-item highlight">
                <div>
                  <p className="summary-label">Dine-In Charge</p>
                  <p className="summary-text">
                    Current percentage configured for dine-in orders.
                  </p>
                </div>
                <h3 className="summary-value">{formattedCharge}</h3>
              </div>

              <div className="summary-item">
                <div>
                  <p className="summary-label">Service Charge Status</p>
                  <p className="summary-text">
                    Indicates whether the dine-in service charge is currently
                    active.
                  </p>
                </div>
                <span
                  className={`status-badge ${serviceCharge.isActive ? "active" : "inactive"
                    }`}
                >
                  {serviceCharge.isActive ? "Enabled" : "Disabled"}
                </span>
              </div>

              <div className="summary-item">
                <div>
                  <p className="summary-label">Operational Preview</p>
                  <p className="summary-text">
                    Real-time admin view of the active charge configuration for
                    dine-in service.
                  </p>
                </div>
                <div className="preview-card">
                  <div className="preview-row">
                    <span>Charge</span>
                    <strong>{formattedCharge}</strong>
                  </div>
                  <div className="preview-row">
                    <span>Status</span>
                    <strong>
                      {serviceCharge.isActive ? "Enabled" : "Disabled"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />

      <style>{`
        .service-charge-page,
        .service-charge-page * {
          box-sizing: border-box;
        }

        .service-charge-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          // background:
          //   radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 32%),
          //   radial-gradient(circle at bottom right, hsla(160, 42%, 42%, 0.1), transparent 30%),
          //   linear-gradient(160deg, #f6faf9 0%, #f1f5ff 42%, #eef8f6 100%);
          padding: 32px 20px;
        }

        // .service-charge-page .bg-grid {
        //   position: absolute;
        //   inset: 0;
        //   background-image:
        //     linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px),
        //     linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px);
        //   background-size: 44px 44px;
        //   mask-image: linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.1));
        //   pointer-events: none;
        // }

        .service-charge-page .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.35;
          pointer-events: none;
        }

        .service-charge-page .orb-one {
          width: 280px;
          height: 280px;
          top: -60px;
          left: -50px;
          background: rgba(99, 102, 241, 0.2);
        }

        .service-charge-page .orb-two {
          width: 300px;
          height: 300px;
          right: -60px;
          bottom: -80px;
          background: rgba(34, 197, 94, 0.14);
        }

        .service-charge-page .page-container {
          max-width: 1420px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .service-charge-page .topbar-card {
          border-radius: 28px;
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          margin-bottom: 24px;
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow:
            0 18px 50px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .service-charge-page .topbar-status-card {
          min-width: 280px;
          padding: 20px;
          border-radius: 22px;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .service-charge-page .eyebrow {
          display: inline-flex;
          align-items: center;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #1e40af;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.22);
        }

        .service-charge-page .page-title {
          margin: 14px 0 10px;
          font-size: clamp(28px, 3.2vw, 42px);
          line-height: 1.05;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
        }

        .service-charge-page .page-description {
          margin: 0;
          max-width: 760px;
          color: rgba(15, 23, 42, 0.62);
          font-size: 15px;
          line-height: 1.7;
        }

        .service-charge-page .mini-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 10px;
        }

        .service-charge-page .mini-subtext {
          margin: 10px 0 0;
          color: #475569;
          font-size: 14px;
        }

        .service-charge-page .dashboard-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.9fr;
          gap: 24px;
        }

        .service-charge-page .panel-card {
          border-radius: 26px;
          padding: 28px;
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow:
            0 18px 50px rgba(15, 23, 42, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .service-charge-page .panel-header {
          margin-bottom: 24px;
        }

        .service-charge-page .panel-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .service-charge-page .panel-subtitle {
          margin: 0;
          color: rgba(15, 23, 42, 0.58);
          font-size: 14px;
          line-height: 1.6;
        }

        .service-charge-page .loading-box {
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          background: #f8fafc;
          border: 1px dashed rgba(15, 23, 42, 0.15);
          color: #64748b;
          font-size: 15px;
        }

        .service-charge-page .form-layout {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .service-charge-page .form-group {
          display: flex;
          flex-direction: column;
        }

        .service-charge-page .form-label {
          color: #0f172a;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .service-charge-page .field-hint {
          margin: 0 0 14px;
          color: rgba(15, 23, 42, 0.55);
          font-size: 13px;
          line-height: 1.6;
        }

        .service-charge-page .input-shell {
          position: relative;
        }

        .service-charge-page .input-prefix {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 800;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.22);
        }

        .service-charge-page .custom-input {
          width: 100%;
          height: 60px;
          padding: 0 18px 0 64px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          outline: none;
          background: #ffffff;
          color: #0f172a;
          color-scheme: light;
          font-size: 15px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .service-charge-page .custom-input::placeholder {
          color: rgba(15, 23, 42, 0.4);
        }

        .service-charge-page .custom-input:focus {
          border-color: rgba(59, 130, 246, 0.55);
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
        }

        .service-charge-page .switch-card {
          min-height: 86px;
          padding: 18px 18px;
          border-radius: 20px;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .service-charge-page .switch-title {
          color: #0f172a;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .service-charge-page .switch-subtitle {
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
        }

        .service-charge-page .toggle-wrapper {
          position: relative;
          width: 62px;
          height: 34px;
          flex-shrink: 0;
        }

        .service-charge-page .toggle-wrapper input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .service-charge-page .slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: #cbd5e1;
          border-radius: 999px;
          transition: 0.3s ease;
        }

        .service-charge-page .slider::before {
          content: "";
          position: absolute;
          height: 26px;
          width: 26px;
          left: 4px;
          top: 4px;
          background: #ffffff;
          border-radius: 50%;
          transition: 0.3s ease;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.15);
        }

        .service-charge-page .toggle-wrapper input:checked + .slider {
          background: linear-gradient(135deg, #16a34a, #22c55e);
        }

        .service-charge-page .toggle-wrapper input:checked + .slider::before {
          transform: translateX(28px);
        }

        .service-charge-page .save-btn {
          height: 58px;
          border: none;
          border-radius: 18px;
          cursor: pointer;
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 14px 28px rgba(37, 99, 235, 0.22);
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .service-charge-page .save-btn:hover {
          transform: translateY(-2px);
        }

        .service-charge-page .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .service-charge-page .summary-stack {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .service-charge-page .summary-item {
          border-radius: 22px;
          padding: 22px;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .service-charge-page .summary-item.highlight {
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.08),
            #f8fafc 55%
          );
          border-color: rgba(59, 130, 246, 0.15);
        }

        .service-charge-page .summary-label {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 700;
        }

        .service-charge-page .summary-text {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
          max-width: 340px;
        }

        .service-charge-page .summary-value {
          margin: 0;
          color: #1d4ed8;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.03em;
          white-space: nowrap;
        }

        .service-charge-page .status-badge-large,
        .service-charge-page .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          font-weight: 800;
          border: 1px solid transparent;
          white-space: nowrap;
        }

        .service-charge-page .status-badge-large {
          padding: 10px 16px;
          font-size: 14px;
        }

        .service-charge-page .status-badge {
          padding: 10px 14px;
          font-size: 13px;
        }

        .service-charge-page .status-badge-large.active,
        .service-charge-page .status-badge.active {
          color: #166534;
          background: rgba(34, 197, 94, 0.14);
          border-color: rgba(34, 197, 94, 0.28);
        }

        .service-charge-page .status-badge-large.inactive,
        .service-charge-page .status-badge.inactive {
          color: #991b1b;
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.25);
        }

        .service-charge-page .preview-card {
          min-width: 190px;
          padding: 14px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.1);
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        .service-charge-page .preview-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #64748b;
          font-size: 13px;
        }

        .service-charge-page .preview-row strong {
          color: #0f172a;
        }

        .service-charge-page .preview-row + .preview-row {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
        }

        @media (max-width: 1100px) {
          .service-charge-page .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .service-charge-page .topbar-card {
            flex-direction: column;
            align-items: stretch;
          }

          .service-charge-page .topbar-status-card {
            min-width: auto;
          }
        }

        @media (max-width: 768px) {
          .service-charge-page {
            padding: 18px 12px;
          }

          .service-charge-page .topbar-card,
          .service-charge-page .panel-card {
            padding: 20px;
            border-radius: 20px;
          }

          .service-charge-page .summary-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .service-charge-page .summary-value {
            font-size: 24px;
          }

          .service-charge-page .switch-card {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminServiceCharge;