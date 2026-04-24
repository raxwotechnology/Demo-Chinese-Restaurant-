import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheck, FaClipboardList, FaSpinner } from "react-icons/fa";

const KitchenRequestForm = () => {
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    unit: "",
    reason: ""
  });
  const [requests, setRequests] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_BASE_URL}/api/auth/kitchen/my-requests`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRequests(res.data);
      } catch (err) {
        console.error("Failed to load your requests:", err.message);
      } finally {
        setLoadingList(false);
      }
    };

    fetchMyRequests();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.item || !formData.quantity || !formData.unit) {
      toast.warn("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/kitchen/request`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests([res.data, ...requests]);
      toast.success("Request submitted successfully.");
      setFormData({ item: "", quantity: "", unit: "", reason: "" });
    } catch (err) {
      console.error("Failed to submit request:", err.message);
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="kitchen-request-page">
      <div className="page-glow glow-1" aria-hidden />
      <div className="page-glow glow-2" aria-hidden />
      <div className="page-grid" aria-hidden />

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Kitchen operations</span>
          <h1 className="hero-title">Request kitchen supplies</h1>
          <p className="hero-subtitle">
            Log ingredients or consumables you need. Admins review requests from this queue and can
            approve or reject each line.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface form-card">
            <div className="section-header">
              <h2 className="section-title">Request details</h2>
              <p className="section-subtitle">
                Item, quantity, and unit are required. Add a short reason if it helps procurement.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field-block">
                  <label className="form-label" htmlFor="kr-item">
                    Item *
                  </label>
                  <input
                    id="kr-item"
                    type="text"
                    name="item"
                    value={formData.item}
                    onChange={handleChange}
                    className="form-control custom-input"
                    placeholder="e.g., Rice, Oil"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label" htmlFor="kr-qty">
                    Quantity *
                  </label>
                  <input
                    id="kr-qty"
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="form-control custom-input"
                    min="1"
                    placeholder="e.g., 10"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label" htmlFor="kr-unit">
                    Unit *
                  </label>
                  <select
                    id="kr-unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="form-select custom-input custom-select"
                    required
                  >
                    <option value="">Select unit</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="liters">Liters</option>
                    <option value="pcs">Pieces</option>
                    <option value="grams">Grams</option>
                    <option value="ml">Milliliters</option>
                    <option value="packs">Packs</option>
                  </select>
                </div>

                <div className="field-block field-full">
                  <label className="form-label" htmlFor="kr-reason">
                    Reason (optional)
                  </label>
                  <textarea
                    id="kr-reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows={3}
                    className="form-control custom-input custom-textarea"
                    placeholder="Describe the reason for this request"
                  />
                </div>

                <div className="field-block field-full kitchen-request-actions">
                  <button
                    type="submit"
                    className="submit-btn kitchen-request-submit d-inline-flex align-items-center justify-content-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="kitchen-request-spin" aria-hidden />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <FaCheck className="kitchen-request-submit-icon" aria-hidden />
                        Submit request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="glass-card shared-card-surface list-card">
            <div className="section-header section-header--tight">
              <h2 className="section-title">Your recent requests</h2>
              <p className="section-subtitle">
                New submissions appear at the top after you send the form.
              </p>
            </div>

            {loadingList ? (
              <div className="kitchen-request-loading" role="status">
                <FaSpinner className="kitchen-request-loading-icon" aria-hidden />
                <p className="kitchen-request-loading-text">Loading requests…</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="kitchen-request-empty">
                <FaClipboardList className="kitchen-request-empty-icon" aria-hidden />
                <p className="kitchen-request-empty-title">No requests yet</p>
                <p className="kitchen-request-empty-text">
                  Submit your first supply request above. Status updates when an admin acts on it.
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="kitchen-request-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req, idx) => (
                      <tr key={req._id || req.id || idx}>
                        <td>{new Date(req.date).toLocaleDateString()}</td>
                        <td>{req.item}</td>
                        <td>
                          {req.quantity} {req.unit}
                        </td>
                        <td>
                          <span
                            className={`status-pill ${req.status === "Approved" ? "status-pill--ok" : ""} ${req.status === "Rejected" ? "status-pill--bad" : ""} ${req.status !== "Approved" && req.status !== "Rejected" ? "status-pill--pending" : ""}`}
                          >
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3200} />

      <style>{`
        .kitchen-request-page {
          min-height: calc(100vh - 88px);
          position: relative;
          overflow-x: hidden;
          color: #0f172a;
          padding: 28px 24px 40px;
        }

        .kitchen-request-page .page-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
          background-size: 42px 42px;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.02));
        }

        .kitchen-request-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.4;
          pointer-events: none;
        }

        .kitchen-request-page .glow-1 {
          width: 300px;
          height: 300px;
          top: -80px;
          left: -60px;
          background: hsla(160, 42%, 48%, 0.2);
        }

        .kitchen-request-page .glow-2 {
          width: 340px;
          height: 340px;
          right: -80px;
          bottom: -40px;
          background: hsla(200, 55%, 58%, 0.14);
        }

        .kitchen-request-page .page-shell {
          width: 100%;
          max-width: min(1120px, 100%);
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .kitchen-request-page .page-shell > .hero-card,
        .kitchen-request-page .page-shell > .stack-layout,
        .kitchen-request-page .stack-layout > .glass-card {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .kitchen-request-page .hero-card.shared-card-surface,
        .kitchen-request-page .glass-card.shared-card-surface {
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

        .kitchen-request-page .hero-card {
          padding: 30px 34px;
          margin-bottom: 22px;
          text-align: left;
        }

        .kitchen-request-page .hero-badge {
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

        .kitchen-request-page .hero-title {
          margin: 14px 0 8px;
          font-size: clamp(1.5rem, 2.5vw, 2.1rem);
          font-weight: 800;
          line-height: 1.12;
          color: #0f172a;
        }

        .kitchen-request-page .hero-subtitle {
          margin: 0;
          max-width: 52rem;
          color: #64748b;
          font-size: 15px;
          line-height: 1.65;
        }

        .kitchen-request-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 18px;
          width: 100%;
        }

        .kitchen-request-page .form-card {
          padding: 28px 30px 30px;
          text-align: left;
        }

        .kitchen-request-page .list-card {
          padding: 28px 30px 30px;
          text-align: left;
        }

        .kitchen-request-page .section-header {
          margin-bottom: 22px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.07);
        }

        .kitchen-request-page .section-header--tight {
          margin-bottom: 18px;
        }

        .kitchen-request-page .section-title {
          margin: 0 0 8px;
          font-size: clamp(1.25rem, 2vw, 1.65rem);
          font-weight: 800;
          line-height: 1.15;
          color: #0f172a;
        }

        .kitchen-request-page .section-subtitle {
          margin: 0;
          max-width: 40rem;
          color: #64748b;
          font-size: 15px;
          line-height: 1.65;
        }

        .kitchen-request-page .form-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 18px;
        }

        .kitchen-request-page .field-full {
          grid-column: 1 / -1;
        }

        .kitchen-request-page .field-block {
          min-width: 0;
        }

        .kitchen-request-page .form-label {
          display: block;
          margin-bottom: 10px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 700;
        }

        .kitchen-request-page .custom-input,
        .kitchen-request-page .form-control.custom-input {
          width: 100%;
          min-height: 54px;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.12) !important;
          background: #ffffff !important;
          color: #0f172a !important;
          color-scheme: light;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          font-size: 15px;
          padding: 0 16px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .kitchen-request-page .custom-textarea {
          min-height: 96px;
          padding: 14px 16px;
          resize: vertical;
        }

        .kitchen-request-page .custom-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 42px;
        }

        .kitchen-request-page .custom-input:focus,
        .kitchen-request-page .form-control.custom-input:focus {
          outline: none;
          border-color: hsla(160, 42%, 40%, 0.55) !important;
          box-shadow: 0 0 0 4px hsla(160, 40%, 42%, 0.14) !important;
        }

        .kitchen-request-page .custom-input::placeholder,
        .kitchen-request-page .form-control.custom-input::placeholder {
          color: rgba(15, 23, 42, 0.42);
        }

        .kitchen-request-page .kitchen-request-actions {
          display: flex;
          justify-content: center;
          padding-top: 8px;
        }

        .kitchen-request-page .submit-btn {
          border: none;
          border-radius: 18px;
          font-size: 1.05rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          min-height: 58px;
          padding: 16px 48px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            0 3px 0 rgba(5, 46, 22, 0.14),
            0 14px 32px rgba(22, 163, 74, 0.32);
        }

        .kitchen-request-page .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.02);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            0 4px 0 rgba(5, 46, 22, 0.12),
            0 18px 42px rgba(22, 163, 74, 0.38);
        }

        .kitchen-request-page .submit-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
          transform: none;
        }

        .kitchen-request-page .kitchen-request-submit-icon {
          font-size: 1.15rem;
        }

        .kitchen-request-page .kitchen-request-spin {
          animation: kitchen-request-spin 0.85s linear infinite;
        }

        @keyframes kitchen-request-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .kitchen-request-page .kitchen-request-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 160px;
          color: #64748b;
        }

        .kitchen-request-page .kitchen-request-loading-icon {
          font-size: 2rem;
          color: hsl(160, 42%, 36%);
          animation: kitchen-request-spin 0.85s linear infinite;
        }

        .kitchen-request-page .kitchen-request-loading-text {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
        }

        .kitchen-request-page .kitchen-request-empty {
          text-align: center;
          padding: 36px 20px;
          border-radius: 20px;
          background: linear-gradient(180deg, #f8fafc, #f1f5f9);
          border: 1px dashed rgba(15, 23, 42, 0.12);
        }

        .kitchen-request-page .kitchen-request-empty-icon {
          font-size: 2.25rem;
          color: hsl(160, 40%, 42%);
          margin-bottom: 12px;
          opacity: 0.85;
        }

        .kitchen-request-page .kitchen-request-empty-title {
          margin: 0 0 8px;
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
        }

        .kitchen-request-page .kitchen-request-empty-text {
          margin: 0 auto;
          max-width: 28rem;
          font-size: 14px;
          line-height: 1.6;
          color: #64748b;
        }

        .kitchen-request-page .table-wrap {
          overflow-x: auto;
          border-radius: 20px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
        }

        .kitchen-request-page .kitchen-request-table {
          width: 100%;
          min-width: 520px;
          border-collapse: collapse;
        }

        .kitchen-request-page .kitchen-request-table thead tr {
          background: #f1f5f9;
        }

        .kitchen-request-page .kitchen-request-table th {
          padding: 16px 18px;
          text-align: left;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #475569;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .kitchen-request-page .kitchen-request-table td {
          padding: 16px 18px;
          font-size: 14px;
          color: #334155;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: middle;
          background: #ffffff;
        }

        .kitchen-request-page .kitchen-request-table tbody tr:hover td {
          background: #f8fafc;
        }

        .kitchen-request-page .status-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .kitchen-request-page .status-pill--ok {
          background: linear-gradient(145deg, #ecfdf5, #d1fae5);
          color: #065f46;
          border: 1px solid rgba(16, 185, 129, 0.35);
        }

        .kitchen-request-page .status-pill--bad {
          background: linear-gradient(145deg, #fef2f2, #fee2e2);
          color: #991b1b;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .kitchen-request-page .status-pill--pending {
          background: linear-gradient(145deg, #fffbeb, #fef3c7);
          color: #92400e;
          border: 1px solid rgba(245, 158, 11, 0.4);
        }

        @media (max-width: 992px) {
          .kitchen-request-page .form-grid {
            grid-template-columns: 1fr 1fr;
          }

          .kitchen-request-page .form-grid > .field-block:first-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 768px) {
          .kitchen-request-page {
            padding: 18px 14px 28px;
          }

          .kitchen-request-page .hero-card,
          .kitchen-request-page .form-card,
          .kitchen-request-page .list-card {
            padding: 22px 18px;
          }

          .kitchen-request-page .form-grid {
            grid-template-columns: 1fr;
          }

          .kitchen-request-page .submit-btn {
            width: 100%;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default KitchenRequestForm;
