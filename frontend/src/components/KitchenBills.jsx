import API_BASE_URL from "../apiConfig";
// src/components/KitchenBills.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaFileInvoiceDollar } from "react-icons/fa";

const KitchenBills = () => {
  const [bills, setBills] = useState([]);
  const [newBill, setNewBill] = useState({
    type: "Gas",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash"
  });

  const [editingBill, setEditingBill] = useState(null);
  const [editData, setEditData] = useState({ ...newBill });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/kitchen/bills`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setBills(res.data);
    } catch (err) {
      console.error("Failed to load bills:", err.message);
      toast.error("Failed to load kitchen bills");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setNewBill({ ...newBill, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { type, amount, date } = newBill;

    if (!type || !amount || !date) {
      alert("Type, Amount, and Date are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/kitchen/bill`,
        newBill,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setBills([res.data, ...bills]);
      setNewBill({
        type: "Gas",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash"
      });

      toast.success("Bill added successfully!");
    } catch (err) {
      console.error("Add failed:", err.response?.data || err.message);
      toast.error("Failed to add bill");
    }
  };

  const symbol = localStorage.getItem("currencySymbol") || "$";

  const openEditModal = (bill) => {
    setEditingBill(bill._id);
    setEditData({
      type: bill.type,
      amount: bill.amount,
      description: bill.description,
      date: new Date(bill.date).toISOString().split("T")[0],
      paymentMethod: bill.paymentMethod || "Cash"
    });
  };

  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();

    const { type, amount, date } = editData;

    if (!type || !amount || !date) {
      alert("All fields are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/api/auth/kitchen/bill/${editingBill}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBills(bills.map((b) => (b._id === editingBill ? res.data : b)));
      setEditingBill(null);
      toast.success("Bill updated!");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error("Failed to update bill");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this bill?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/api/auth/kitchen/bill/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBills(bills.filter((bill) => bill._id !== id));
      toast.success("Bill deleted");
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      toast.error("Failed to delete bill");
    }
  };

  return (
    <div className="kitchen-bills-page">
      <div className="page-glow glow-1"></div>
      <div className="page-glow glow-2"></div>
      <div className="page-grid"></div>

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Kitchen Expense Management</span>
          <h1 className="hero-title">Restaurant Bills</h1>
          <p className="hero-subtitle">
            Record and manage kitchen expense bills in a clean, modern admin interface.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface form-card">
            <div className="section-header">
              <h2 className="section-title">Add Bill</h2>
              <p className="section-subtitle">
                Enter bill details and keep kitchen expenses organized.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field-block">
                  <label className="form-label">Bill Type</label>
                  <select
                    name="type"
                    value={newBill.type}
                    onChange={handleChange}
                    className="form-control custom-input custom-select"
                  >
                    <option>Gas</option>
                    <option>Electricity</option>
                    <option>Water</option>
                    <option>Cleaning</option>
                    <option>Repairs</option>
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
                      value={newBill.amount}
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
                    value={newBill.paymentMethod}
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
                    value={newBill.date}
                    onChange={handleChange}
                    className="form-control custom-input"
                    required
                  />
                </div>

                <div className="field-block field-full">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={newBill.description}
                    onChange={handleChange}
                    rows="3"
                    className="form-control custom-input custom-textarea"
                    placeholder="Add a short description"
                  />
                </div>

                <div className="field-block field-full kitchen-bills-submit-actions">
                  <button
                    type="submit"
                    className="submit-btn kitchen-bills-submit-btn d-inline-flex align-items-center justify-content-center"
                  >
                    <FaFileInvoiceDollar className="me-2 kitchen-bills-submit-icon" aria-hidden />
                    Add Bill
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="glass-card shared-card-surface table-card">
            <div className="section-header">
              <h2 className="section-title">Recent Bills</h2>
              <p className="section-subtitle">
                View and manage your latest kitchen bill records.
              </p>
            </div>

            <div className="table-wrap">
              <table className="bills-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
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
                        Loading bills...
                      </td>
                    </tr>
                  ) : bills.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        No bills found
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill) => (
                      <tr key={bill._id}>
                        <td>{new Date(bill.date).toLocaleDateString()}</td>
                        <td>{bill.type}</td>
                        <td>
                          {symbol}
                          {Number(bill.amount).toFixed(2)}
                        </td>
                        <td>{bill.paymentMethod || "Cash"}</td>
                        <td>{bill.description || "-"}</td>
                        <td className="text-center action-cell">
                          <button
                            className="table-btn edit-btn"
                            onClick={() => openEditModal(bill)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="table-btn delete-btn"
                            onClick={() => handleDelete(bill._id)}
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

      {editingBill && (
        <div className="modal-overlay">
          <div className="modal-box shared-card-surface">
            <div className="modal-header">
              <h5 className="modal-title">Edit Bill</h5>
              <button
                type="button"
                className="modal-close"
                onClick={() => setEditingBill(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleUpdate}>
                <div className="modal-form-grid">
                  <div className="field-block">
                    <label className="form-label">Bill Type</label>
                    <select
                      name="type"
                      value={editData.type}
                      onChange={handleEditChange}
                      className="form-control custom-input custom-select"
                    >
                      <option>Gas</option>
                      <option>Electricity</option>
                      <option>Water</option>
                      <option>Cleaning</option>
                      <option>Repairs</option>
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
                      onClick={() => handleDelete(editingBill)}
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
        .kitchen-bills-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          // background: linear-gradient(160deg, #f6faf9 0%, #f1f5ff 42%, #eef8f6 100%);
          padding: 28px 24px 34px;
        }

        // .kitchen-bills-page .page-grid {
        //   position: absolute;
        //   inset: 0;
        //   background-image:
        //     linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px),
        //     linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px);
        //   background-size: 44px 44px;
        //   pointer-events: none;
        //   mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.12));
        // }

        .kitchen-bills-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.35;
          pointer-events: none;
        }

        .kitchen-bills-page .glow-1 {
          width: 300px;
          height: 300px;
          top: -80px;
          left: -60px;
          background: rgba(59, 130, 246, 0.16);
        }

        .kitchen-bills-page .glow-2 {
          width: 340px;
          height: 340px;
          right: -80px;
          bottom: -80px;
          background: hsla(160, 42%, 42%, 0.18);
        }

        .kitchen-bills-page .page-shell {
          width: calc(100% - 80px);
          max-width: none;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .kitchen-bills-page .shared-card-surface {
          border-radius: 30px;
          border: 1px solid rgba(15, 23, 42, 0.08) !important;
          background: #ffffff !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow:
            0 18px 50px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
        }

        .kitchen-bills-page .hero-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .kitchen-bills-page .hero-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #1e40af;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.22);
        }

        .kitchen-bills-page .hero-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .kitchen-bills-page .hero-subtitle {
          margin: 0;
          color: rgba(15, 23, 42, 0.62);
          font-size: 15px;
          line-height: 1.7;
          max-width: 760px;
        }

        .kitchen-bills-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .kitchen-bills-page .glass-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .kitchen-bills-page .form-card,
        .kitchen-bills-page .table-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .kitchen-bills-page .section-header {
          margin-bottom: 22px;
        }

        .kitchen-bills-page .section-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .kitchen-bills-page .section-subtitle {
          margin: 0;
          color: rgba(15, 23, 42, 0.6);
          font-size: 14px;
          line-height: 1.7;
        }

        .kitchen-bills-page .form-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .kitchen-bills-page .modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .kitchen-bills-page .field-full {
          grid-column: 1 / -1;
        }

        .kitchen-bills-page .field-block {
          min-width: 0;
        }

        .kitchen-bills-page .form-label {
          display: block;
          margin-bottom: 10px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 700;
        }

        .kitchen-bills-page .input-wrap {
          position: relative;
        }

        .kitchen-bills-page .input-pill {
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
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          z-index: 2;
          box-shadow: 0 12px 20px rgba(37, 99, 235, 0.24);
        }

        .kitchen-bills-page .with-prefix {
          padding-left: 58px !important;
        }

        .kitchen-bills-page .custom-input {
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

        .kitchen-bills-page .custom-input:focus {
          background: #ffffff;
          color: #0f172a;
          border-color: rgba(59, 130, 246, 0.55);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
        }

        .kitchen-bills-page .custom-input::placeholder {
          color: rgba(15, 23, 42, 0.42);
        }

        .kitchen-bills-page .custom-select {
          appearance: none;
          cursor: pointer;
        }

        .kitchen-bills-page .custom-textarea {
          height: auto;
          min-height: 120px;
          padding-top: 14px;
          resize: none;
        }

        .kitchen-bills-page .submit-btn,
        .kitchen-bills-page .danger-btn,
        .kitchen-bills-page .table-btn {
          border: none;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .kitchen-bills-page .submit-btn {
          height: 60px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 16px 32px rgba(34, 197, 94, 0.22);
        }

        .kitchen-bills-page .kitchen-bills-submit-actions {
          display: flex;
          justify-content: center;
          padding-top: 6px;
        }

        .kitchen-bills-page .submit-btn.kitchen-bills-submit-btn {
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

        .kitchen-bills-page .kitchen-bills-submit-icon {
          font-size: 1.15rem;
        }

        .kitchen-bills-page .kitchen-bills-submit-btn:hover:not(:disabled) {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            0 4px 0 rgba(5, 46, 22, 0.12),
            0 18px 42px rgba(22, 163, 74, 0.38);
        }

        .kitchen-bills-page .submit-btn:hover,
        .kitchen-bills-page .danger-btn:hover,
        .kitchen-bills-page .table-btn:hover {
          transform: translateY(-2px);
        }

        .kitchen-bills-page .table-wrap {
          overflow-x: auto;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
        }

        .kitchen-bills-page .bills-table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
        }

        .kitchen-bills-page .bills-table thead tr {
          background: #f1f5f9;
        }

        .kitchen-bills-page .bills-table th {
          padding: 18px 20px;
          text-align: left;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .kitchen-bills-page .bills-table td {
          padding: 18px 20px;
          color: #334155;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: middle;
          background: #ffffff;
        }

        .kitchen-bills-page .bills-table tbody tr:hover td {
          background: #f8fafc;
        }

        .kitchen-bills-page .text-center {
          text-align: center;
        }

        .kitchen-bills-page .action-cell {
          white-space: nowrap;
        }

        .kitchen-bills-page .table-btn {
          padding: 10px 14px;
          margin: 0 4px;
        }

        .kitchen-bills-page .edit-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 10px 22px rgba(37, 99, 235, 0.22);
        }

        .kitchen-bills-page .delete-btn,
        .kitchen-bills-page .danger-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 10px 22px rgba(239, 68, 68, 0.22);
        }

        .kitchen-bills-page .empty-row {
          text-align: center;
          color: #94a3b8 !important;
          padding: 34px !important;
          background: #ffffff !important;
        }

        .kitchen-bills-page .modal-overlay {
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

        .kitchen-bills-page .modal-box {
          width: 100%;
          max-width: 720px;
          overflow: hidden;
        }

        .kitchen-bills-page .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kitchen-bills-page .modal-title {
          margin: 0;
          color: #0f172a;
          font-size: 22px;
          font-weight: 800;
        }

        .kitchen-bills-page .modal-close {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 12px;
          background: #f1f5f9;
          color: #334155;
          font-size: 24px;
          line-height: 1;
        }

        .kitchen-bills-page .modal-body {
          padding: 24px;
        }

        .kitchen-bills-page .modal-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 12px;
        }

        .kitchen-bills-page .flex-btn {
          flex: 1;
          height: 56px;
        }

        @media (max-width: 768px) {
          .kitchen-bills-page .page-shell {
            width: calc(100% - 24px);
          }

          .kitchen-bills-page {
            padding: 18px 12px;
          }

          .kitchen-bills-page .hero-card,
          .kitchen-bills-page .glass-card,
          .kitchen-bills-page .modal-body {
            padding: 20px;
          }

          .kitchen-bills-page .form-grid,
          .kitchen-bills-page .modal-form-grid {
            grid-template-columns: 1fr;
          }

          .kitchen-bills-page .field-full,
          .kitchen-bills-page .modal-actions {
            grid-column: auto;
          }

          .kitchen-bills-page .modal-actions {
            flex-direction: column;
          }

          .kitchen-bills-page .section-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default KitchenBills;