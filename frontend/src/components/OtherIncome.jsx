// src/components/OtherIncome.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCoins } from "react-icons/fa";

const OtherIncome = () => {
  const [incomes, setIncomes] = useState([]);
  const [newIncome, setNewIncome] = useState({
    source: "Tips",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash"
  });

  const [editingIncome, setEditingIncome] = useState(null);
  const [editData, setEditData] = useState({ ...newIncome });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/income/other",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setIncomes(res.data);
    } catch (err) {
      console.error("Failed to load incomes:", err.message);
      toast.error("Failed to load other income records");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setNewIncome({ ...newIncome, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { source, amount, date } = newIncome;

    if (!source || !amount || !date) {
      alert("Source, Amount, and Date are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/income/other",
        newIncome,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setIncomes([res.data, ...incomes]);
      setNewIncome({
        source: "Tips",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash"
      });

      toast.success("Income added successfully!");
    } catch (err) {
      console.error("Add failed:", err.response?.data || err.message);
      toast.error("Failed to add income");
    }
  };

  const symbol = localStorage.getItem("currencySymbol") || "$";

  const openEditModal = (income) => {
    setEditingIncome(income._id);
    setEditData({
      source: income.source,
      amount: income.amount,
      description: income.description,
      date: new Date(income.date).toISOString().split("T")[0],
      paymentMethod: income.paymentMethod || "Cash"
    });
  };

  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();

    const { source, amount, date } = editData;

    if (!source || !amount || !date) {
      alert("All fields are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/income/other/${editingIncome}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setIncomes(incomes.map((i) => (i._id === editingIncome ? res.data : i)));
      setEditingIncome(null);
      toast.success("Income updated!");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error("Failed to update income");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this income record?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/income/other/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setIncomes(incomes.filter((income) => income._id !== id));
      toast.success("Income record deleted");
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      toast.error("Failed to delete income record");
    }
  };

  return (
    <div className="other-income-page">
      <div className="page-glow glow-1"></div>
      <div className="page-glow glow-2"></div>
      <div className="page-grid"></div>

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Income Management</span>
          <h1 className="hero-title">Other Income</h1>
          <p className="hero-subtitle">
            Record and manage non-sales income in a clean, modern admin interface.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface form-card">
            <div className="section-header">
              <h2 className="section-title">Add Income</h2>
              <p className="section-subtitle">
                Enter income details and keep additional revenue records organized.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field-block">
                  <label className="form-label">Income Source</label>
                  <select
                    name="source"
                    value={newIncome.source}
                    onChange={handleChange}
                    className="form-control custom-input custom-select"
                  >
                    <option>Tips</option>
                    <option>Event Rental</option>
                    <option>Merchandise</option>
                    <option>Delivery Fee</option>
                    <option>Donations</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="field-block">
                  <label className="form-label">Amount ({symbol})</label>
                  <div className="input-wrap">
                    <span className="input-pill">{symbol}</span>
                    <input
                      type="number"
                      name="amount"
                      value={newIncome.amount}
                      onChange={handleChange}
                      step="0.01"
                      placeholder="e.g., 150"
                      className="form-control custom-input with-prefix"
                      required
                    />
                  </div>
                </div>

                <div className="field-block">
                  <label className="form-label">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={newIncome.paymentMethod}
                    onChange={handleChange}
                    className="form-control custom-input custom-select"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="field-block">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={newIncome.date}
                    onChange={handleChange}
                    className="form-control custom-input"
                    required
                  />
                </div>

                <div className="field-block field-full">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={newIncome.description}
                    onChange={handleChange}
                    rows="3"
                    className="form-control custom-input custom-textarea"
                    placeholder="Add a short description"
                  />
                </div>

                <div className="field-block field-full other-income-submit-actions">
                  <button
                    type="submit"
                    className="submit-btn other-income-submit-btn d-inline-flex align-items-center justify-content-center"
                  >
                    <FaCoins className="me-2 other-income-submit-icon" aria-hidden />
                    Add Income
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="glass-card shared-card-surface table-card">
            <div className="section-header">
              <h2 className="section-title">Recent Income Records</h2>
              <p className="section-subtitle">
                View and manage your latest income records.
              </p>
            </div>

            <div className="table-wrap">
              <table className="income-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Description</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        Loading income records...
                      </td>
                    </tr>
                  ) : incomes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        No income records found
                      </td>
                    </tr>
                  ) : (
                    incomes.map((income) => (
                      <tr key={income._id}>
                        <td>{new Date(income.date).toLocaleDateString()}</td>
                        <td>{income.source}</td>
                        <td>
                          {symbol}
                          {Number(income.amount).toFixed(2)}
                        </td>
                        <td>{income.paymentMethod || "Cash"}</td>
                        <td>{income.description || "-"}</td>
                        <td className="text-center action-cell">
                          <button
                            className="table-btn edit-btn"
                            onClick={() => openEditModal(income)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="table-btn delete-btn"
                            onClick={() => handleDelete(income._id)}
                            type="button"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {editingIncome && (
        <div className="modal-overlay">
          <div className="modal-box shared-card-surface">
            <div className="modal-header">
              <h5 className="modal-title">Edit Income</h5>
              <button
                type="button"
                className="modal-close"
                onClick={() => setEditingIncome(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleUpdate}>
                <div className="modal-form-grid">
                  <div className="field-block">
                    <label className="form-label">Income Source</label>
                    <select
                      name="source"
                      value={editData.source}
                      onChange={handleEditChange}
                      className="form-control custom-input custom-select"
                    >
                      <option>Tips</option>
                      <option>Event Rental</option>
                      <option>Merchandise</option>
                      <option>Delivery Fee</option>
                      <option>Donations</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="field-block">
                    <label className="form-label">Amount ({symbol})</label>
                    <div className="input-wrap">
                      <span className="input-pill">{symbol}</span>
                      <input
                        type="number"
                        name="amount"
                        value={editData.amount}
                        onChange={handleEditChange}
                        step="0.01"
                        className="form-control custom-input with-prefix"
                        required
                      />
                    </div>
                  </div>

                  <div className="field-block">
                    <label className="form-label">Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={editData.paymentMethod}
                      onChange={handleEditChange}
                      className="form-control custom-input custom-select"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="field-block">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={editData.date.split("T")[0]}
                      onChange={handleEditChange}
                      className="form-control custom-input"
                      required
                    />
                  </div>

                  <div className="field-block field-full">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      value={editData.description}
                      onChange={handleEditChange}
                      rows="3"
                      className="form-control custom-input custom-textarea"
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="submit-btn flex-btn">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="danger-btn flex-btn"
                      onClick={() => handleDelete(editingIncome)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} />

      <style>{`
        .other-income-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          background: linear-gradient(160deg, #f6faf9 0%, #f1f5ff 42%, #eef8f6 100%);
          padding: 28px 24px 34px;
        }

        .other-income-page .page-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.12));
        }

        .other-income-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.35;
          pointer-events: none;
        }

        .other-income-page .glow-1 {
          width: 300px;
          height: 300px;
          top: -80px;
          left: -60px;
          background: hsla(160, 42%, 42%, 0.2);
        }

        .other-income-page .glow-2 {
          width: 340px;
          height: 340px;
          right: -80px;
          bottom: -80px;
          background: rgba(59, 130, 246, 0.16);
        }

        .other-income-page .page-shell {
          width: calc(100% - 80px);
          max-width: none;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .other-income-page .shared-card-surface {
          border-radius: 30px;
          border: 1px solid rgba(15, 23, 42, 0.08) !important;
          background: #ffffff !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow:
            0 18px 50px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
        }

        .other-income-page .hero-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .other-income-page .hero-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #166534;
          background: hsla(160, 40%, 42%, 0.14);
          border: 1px solid hsla(160, 42%, 40%, 0.22);
        }

        .other-income-page .hero-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .other-income-page .hero-subtitle {
          margin: 0;
          color: rgba(15, 23, 42, 0.62);
          font-size: 15px;
          line-height: 1.7;
          max-width: 760px;
        }

        .other-income-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .other-income-page .glass-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .other-income-page .form-card,
        .other-income-page .table-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .other-income-page .section-header {
          margin-bottom: 22px;
        }

        .other-income-page .section-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .other-income-page .section-subtitle {
          margin: 0;
          color: rgba(15, 23, 42, 0.6);
          font-size: 14px;
          line-height: 1.7;
        }

        .other-income-page .form-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .other-income-page .modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .other-income-page .field-full {
          grid-column: 1 / -1;
        }

        .other-income-page .field-block {
          min-width: 0;
        }

        .other-income-page .form-label {
          display: block;
          margin-bottom: 10px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 700;
        }

        .other-income-page .input-wrap {
          position: relative;
        }

        .other-income-page .input-pill {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          z-index: 2;
          box-shadow: 0 12px 20px rgba(34, 197, 94, 0.24);
        }

        .other-income-page .with-prefix {
          padding-left: 58px !important;
        }

        .other-income-page .custom-input {
          width: 100%;
          height: 60px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #0f172a;
          color-scheme: light;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          font-size: 15px;
          padding: 0 16px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .other-income-page .custom-input:focus {
          background: #ffffff;
          color: #0f172a;
          border-color: hsla(160, 42%, 40%, 0.55);
          box-shadow: 0 0 0 4px hsla(160, 40%, 42%, 0.14) !important;
        }

        .other-income-page .custom-input::placeholder {
          color: rgba(15, 23, 42, 0.42);
        }

        .other-income-page .custom-select {
          appearance: none;
          cursor: pointer;
        }

        .other-income-page .custom-textarea {
          height: auto;
          min-height: 120px;
          padding-top: 14px;
          resize: none;
        }

        .other-income-page .submit-btn,
        .other-income-page .danger-btn,
        .other-income-page .table-btn {
          border: none;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .other-income-page .submit-btn {
          height: 60px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 16px 32px rgba(34, 197, 94, 0.22);
        }

        .other-income-page .other-income-submit-actions {
          display: flex;
          justify-content: center;
          padding-top: 6px;
        }

        .other-income-page .submit-btn.other-income-submit-btn {
          width: auto !important;
          min-width: min(100%, 280px);
          min-height: 58px;
          height: auto;
          padding: 16px 120px;
          font-size: 1.05rem;
          letter-spacing: 0.03em;
          border-radius: 18px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            0 3px 0 rgba(5, 46, 22, 0.14),
            0 14px 32px rgba(22, 163, 74, 0.32);
        }

        .other-income-page .other-income-submit-icon {
          font-size: 1.15rem;
        }

        .other-income-page .other-income-submit-btn:hover:not(:disabled) {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            0 4px 0 rgba(5, 46, 22, 0.12),
            0 18px 42px rgba(22, 163, 74, 0.38);
        }

        .other-income-page .submit-btn:hover,
        .other-income-page .danger-btn:hover,
        .other-income-page .table-btn:hover {
          transform: translateY(-2px);
        }

        .other-income-page .table-wrap {
          overflow-x: auto;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
        }

        .other-income-page .income-table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
        }

        .other-income-page .income-table thead tr {
          background: #f1f5f9;
        }

        .other-income-page .income-table th {
          padding: 18px 20px;
          text-align: left;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .other-income-page .income-table td {
          padding: 18px 20px;
          color: #334155;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: middle;
          background: #ffffff;
        }

        .other-income-page .income-table tbody tr:hover td {
          background: #f8fafc;
        }

        .other-income-page .text-center {
          text-align: center;
        }

        .other-income-page .action-cell {
          white-space: nowrap;
        }

        .other-income-page .table-btn {
          padding: 10px 14px;
          margin: 0 4px;
        }

        .other-income-page .edit-btn {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 10px 22px rgba(34, 197, 94, 0.22);
        }

        .other-income-page .delete-btn,
        .other-income-page .danger-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 10px 22px rgba(239, 68, 68, 0.22);
        }

        .other-income-page .empty-row {
          text-align: center;
          color: #94a3b8 !important;
          padding: 34px !important;
          background: #ffffff !important;
        }

        .other-income-page .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 16px;
        }

        .other-income-page .modal-box {
          width: 100%;
          max-width: 720px;
          overflow: hidden;
        }

        .other-income-page .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .other-income-page .modal-title {
          margin: 0;
          color: #0f172a;
          font-size: 22px;
          font-weight: 800;
        }

        .other-income-page .modal-close {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 12px;
          background: #f1f5f9;
          color: #334155;
          font-size: 24px;
          line-height: 1;
        }

        .other-income-page .modal-body {
          padding: 24px;
        }

        .other-income-page .modal-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 12px;
        }

        .other-income-page .flex-btn {
          flex: 1;
          height: 56px;
        }

        @media (max-width: 768px) {
          .other-income-page .page-shell {
            width: calc(100% - 24px);
          }

          .other-income-page {
            padding: 18px 12px;
          }

          .other-income-page .hero-card,
          .other-income-page .glass-card,
          .other-income-page .modal-body {
            padding: 20px;
          }

          .other-income-page .form-grid,
          .other-income-page .modal-form-grid {
            grid-template-columns: 1fr;
          }

          .other-income-page .field-full,
          .other-income-page .modal-actions {
            grid-column: auto;
          }

          .other-income-page .modal-actions {
            flex-direction: column;
          }

          .other-income-page .section-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default OtherIncome;