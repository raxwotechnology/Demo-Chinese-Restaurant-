import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeliveryCharges = () => {
  const [charges, setCharges] = useState([]);
  const [form, setForm] = useState({ placeName: "", charge: "" });
  const [editingId, setEditingId] = useState(null);

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchCharges();
  }, []);

  const fetchCharges = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/delivery-charges`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCharges(res.data);
    } catch (err) {
      toast.error("Failed to load delivery charges");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { placeName, charge } = form;

    if (!placeName.trim() || charge === "" || parseFloat(charge) < 0) {
      toast.error("Valid place name and charge required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...(editingId && { id: editingId }),
        placeName: placeName.trim(),
        charge: parseFloat(charge)
      };

      await axios.post(
        `${API_BASE_URL}/api/auth/delivery-charges`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(editingId ? "Delivery charge updated!" : "Delivery charge added!");
      setForm({ placeName: "", charge: "" });
      setEditingId(null);
      fetchCharges();
    } catch (err) {
      const msg = err.response?.data?.error || "Operation failed";
      toast.error(msg);
    }
  };

  const startEdit = (charge) => {
    setForm({ placeName: charge.placeName, charge: charge.charge });
    setEditingId(charge._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this delivery charge?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/api/auth/delivery-charges/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Deleted successfully");
      fetchCharges();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="delivery-charges-page">
      <div className="page-orb orb-1"></div>
      <div className="page-orb orb-2"></div>

      <div className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
        <div className="content-shell">
          <div className="hero-card mb-4">
            <div className="hero-grid">
              <div>
                <span className="hero-badge">Admin Settings</span>
                <h1 className="hero-title mt-3 mb-2">Delivery Charges</h1>
                <p className="hero-subtitle mb-0">
                  Manage delivery places and configure charge amounts with a clean,
                  premium admin interface.
                </p>
              </div>

              <div className="summary-box">
                <div className="summary-box-label">Configured Places</div>
                <div className="summary-box-value">{charges.length}</div>
                <div className="summary-box-subtext">Active delivery locations</div>
              </div>
            </div>
          </div>

          <div className="glass-card form-card mb-4 full-width-form-card">
            <div className="card-header-row mb-4">
              <div>
                <h3 className="section-title mb-1">
                  {editingId ? "Edit Delivery Charge" : "Add Delivery Charge"}
                </h3>
                <p className="section-subtitle mb-0">Manage delivery charges.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field-block">
                  <label className="form-label custom-label">Delivery Place</label>
                  <input
                    type="text"
                    name="placeName"
                    value={form.placeName}
                    onChange={handleChange}
                    className="form-control custom-input"
                    placeholder="e.g., Downtown, Airport, Suburb"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label custom-label">Charge ({symbol})</label>
                  <div className="input-wrap">
                    <span className="currency-pill">{symbol}</span>
                    <input
                      type="number"
                      name="charge"
                      value={form.charge}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="form-control custom-input charge-input"
                      placeholder="e.g., 5.99"
                      required
                    />
                  </div>
                </div>

                <div className="field-block action-block">
                  <label className="form-label custom-label d-none d-lg-block">
                    &nbsp;
                  </label>
                  <button
                    type="submit"
                    className={`action-btn primary-btn ${
                      editingId ? "warning-btn" : "success-btn"
                    } w-100`}
                  >
                    {editingId ? "Update Charge" : "Add Delivery Charge"}
                  </button>
                </div>
              </div>

              {editingId && (
                <button
                  type="button"
                  className="action-btn secondary-btn mt-3 w-100"
                  onClick={() => {
                    setForm({ placeName: "", charge: "" });
                    setEditingId(null);
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          <div className="glass-card table-card full-width-table-card">
            <div className="card-header-row mb-4">
              <div>
                <h3 className="section-title mb-1">
                  Configured Delivery Places ({charges.length})
                </h3>
                <p className="section-subtitle mb-0">
                  View, edit, and remove delivery charge records.
                </p>
              </div>
            </div>

            {charges.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🚚</div>
                <p className="empty-text mb-0">No delivery charges configured yet.</p>
              </div>
            ) : (
              <div className="table-shell">
                <div className="table-responsive">
                  <table className="table custom-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="ps-4">Place Name</th>
                        <th>Charge</th>
                        <th className="text-center pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {charges.map((dc) => (
                        <tr key={dc._id}>
                          <td className="place-name ps-4">{dc.placeName}</td>
                          <td className="charge-value">
                            {symbol}
                            {dc.charge.toFixed(2)}
                          </td>
                          <td className="text-center pe-4">
                            <div className="action-group">
                              <button
                                className="table-btn edit-btn"
                                onClick={() => startEdit(dc)}
                              >
                                Edit
                              </button>
                              <button
                                className="table-btn delete-btn"
                                onClick={() => handleDelete(dc._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer />

      <style>{`
        .delivery-charges-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          padding: 0;
          // background: linear-gradient(165deg, #f6f4fc 0%, #f1f5ff 42%, #eef8f6 100%);
        }

        .delivery-charges-page .page-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.32;
          pointer-events: none;
        }

        .delivery-charges-page .orb-1 {
          width: 280px;
          height: 280px;
          left: -50px;
          top: -50px;
          background: rgba(124, 58, 237, 0.18);
        }

        .delivery-charges-page .orb-2 {
          width: 320px;
          height: 320px;
          right: -70px;
          bottom: -70px;
          background: rgba(34, 197, 94, 0.12);
        }

        .delivery-charges-page .content-shell {
          max-width: 1500px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .delivery-charges-page .hero-card,
        .delivery-charges-page .glass-card {
          width: 100%;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border-radius: 28px;
          box-shadow:
            0 18px 50px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .delivery-charges-page .hero-card {
          padding: 2rem;
        }

        .delivery-charges-page .glass-card {
          padding: 1.75rem;
        }

        .delivery-charges-page .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 1.5rem;
          align-items: center;
        }

        .delivery-charges-page .hero-badge {
          display: inline-block;
          padding: 0.45rem 0.9rem;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 800;
          color: #5b21b6;
          background: rgba(124, 58, 237, 0.12);
          border: 1px solid rgba(124, 58, 237, 0.22);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .delivery-charges-page .hero-title {
          color: #0f172a;
          font-size: clamp(2rem, 3vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .delivery-charges-page .hero-subtitle,
        .delivery-charges-page .section-subtitle,
        .delivery-charges-page .summary-box-subtext,
        .delivery-charges-page .empty-text {
          color: rgba(15, 23, 42, 0.6);
        }

        .delivery-charges-page .summary-box {
          padding: 1.4rem;
          border-radius: 22px;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          text-align: center;
        }

        .delivery-charges-page .summary-box-label {
          color: #64748b;
          font-size: 0.92rem;
          margin-bottom: 0.4rem;
        }

        .delivery-charges-page .summary-box-value {
          color: #0f172a;
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 1;
        }

        .delivery-charges-page .section-title {
          color: #0f172a;
          font-size: 1.28rem;
          font-weight: 800;
        }

        .delivery-charges-page .full-width-form-card {
          width: 100% !important;
          max-width: 100% !important;
          display: block;
        }

        .delivery-charges-page .form-card {
          width: 100% !important;
          max-width: 100% !important;
          padding: 1.75rem;
        }

        .delivery-charges-page .form-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr) 260px;
          gap: 1rem;
          align-items: end;
        }

        .delivery-charges-page .field-block {
          min-width: 0;
        }

        .delivery-charges-page .action-block {
          display: flex;
          align-items: end;
        }

        .delivery-charges-page .custom-label {
          color: #0f172a;
          font-weight: 600;
          margin-bottom: 0.8rem;
        }

        .delivery-charges-page .custom-input {
          height: 58px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #0f172a;
          color-scheme: light;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          font-size: 1rem;
        }

        .delivery-charges-page .custom-input::placeholder {
          color: rgba(15, 23, 42, 0.42);
        }

        .delivery-charges-page .custom-input:focus {
          background: #ffffff;
          color: #0f172a;
          border-color: rgba(124, 58, 237, 0.45);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12) !important;
        }

        .delivery-charges-page .input-wrap {
          position: relative;
        }

        .delivery-charges-page .currency-pill {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          border: none;
          box-shadow: 0 8px 16px rgba(34, 197, 94, 0.2);
        }

        .delivery-charges-page .charge-input {
          padding-left: 58px;
        }

        .delivery-charges-page .action-btn {
          border: none;
          outline: none;
          padding: 1rem 1.4rem;
          border-radius: 18px;
          font-size: 1rem;
          font-weight: 800;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .delivery-charges-page .action-btn:hover,
        .delivery-charges-page .table-btn:hover {
          transform: translateY(-2px);
        }

        .delivery-charges-page .primary-btn {
          color: #ffffff;
        }

        .delivery-charges-page .success-btn {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          box-shadow: 0 12px 28px rgba(34, 197, 94, 0.22);
        }

        .delivery-charges-page .warning-btn {
          background: linear-gradient(135deg, #f59e0b, #f97316);
          box-shadow: 0 12px 28px rgba(245, 158, 11, 0.22);
        }

        .delivery-charges-page .secondary-btn {
          color: #334155;
          background: #f1f5f9;
          border: 1px solid rgba(15, 23, 42, 0.12);
        }

        .delivery-charges-page .full-width-table-card {
          width: 100% !important;
          max-width: 100% !important;
          display: block;
          padding: 1.75rem;
        }

        .delivery-charges-page .table-card {
          width: 100% !important;
          max-width: 100% !important;
          overflow: hidden;
        }

        .delivery-charges-page .table-shell {
          width: 100%;
          border-radius: 22px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
        }

        .delivery-charges-page .custom-table {
          width: 100% !important;
          min-width: 1200px;
          color: #334155;
          margin: 0;
        }

        .delivery-charges-page .custom-table thead th {
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          padding: 1.2rem 1rem;
          font-size: 0.96rem;
          font-weight: 800;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        .delivery-charges-page .custom-table tbody td {
          background: #ffffff;
          color: #334155;
          border-top: 1px solid rgba(15, 23, 42, 0.06);
          padding: 1.15rem 1rem;
          vertical-align: middle;
        }

        .delivery-charges-page .custom-table tbody tr:hover td {
          background: #f8fafc;
        }

        .delivery-charges-page .place-name {
          font-weight: 700;
          font-size: 1rem;
          color: #0f172a;
        }

        .delivery-charges-page .charge-value {
          font-weight: 800;
          font-size: 1rem;
          color: #15803d;
          white-space: nowrap;
        }

        .delivery-charges-page .action-group {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: nowrap;
        }

        .delivery-charges-page .table-btn {
          min-width: 92px;
          border: none;
          outline: none;
          padding: 0.72rem 1rem;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 700;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .delivery-charges-page .table-btn.edit-btn {
          color: #ffffff;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: none;
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.25);
        }

        .delivery-charges-page .table-btn.delete-btn {
          color: #ffffff;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: none;
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.22);
        }

        .delivery-charges-page .empty-state {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .delivery-charges-page .empty-icon {
          font-size: 3rem;
          margin-bottom: 0.75rem;
        }

        @media (max-width: 1100px) {
          .delivery-charges-page .hero-grid {
            grid-template-columns: 1fr;
          }

          .delivery-charges-page .form-grid {
            grid-template-columns: 1fr;
          }

          .delivery-charges-page .action-block {
            display: block;
          }
        }

        @media (max-width: 768px) {
          .delivery-charges-page .hero-card,
          .delivery-charges-page .glass-card {
            padding: 1.25rem;
            border-radius: 20px;
          }

          .delivery-charges-page .full-width-form-card,
          .delivery-charges-page .full-width-table-card,
          .delivery-charges-page .table-card {
            padding: 1rem;
          }

          .delivery-charges-page .custom-table {
            min-width: 760px;
          }

          .delivery-charges-page .custom-table thead th,
          .delivery-charges-page .custom-table tbody td {
            padding: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DeliveryCharges;