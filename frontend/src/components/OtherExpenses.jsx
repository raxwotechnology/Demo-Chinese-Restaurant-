// src/components/OtherExpenses.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaWallet } from "react-icons/fa";

const OtherExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    category: "Marketing",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash"
  });

  const [editingExpense, setEditingExpense] = useState(null);
  const [editData, setEditData] = useState({ ...newExpense });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/other",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to load expenses:", err.message);
      toast.error("Failed to load other expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setNewExpense({ ...newExpense, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { category, amount, date } = newExpense;

    if (!category || !amount || !date) {
      alert("Category, Amount, and Date are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/other",
        newExpense,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setExpenses([res.data, ...expenses]);
      setNewExpense({
        category: "Marketing",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash"
      });

      toast.success("Expense added successfully!");
    } catch (err) {
      console.error("Add failed:", err.response?.data || err.message);
      toast.error("Failed to add expense");
    }
  };

  const symbol = localStorage.getItem("currencySymbol") || "$";

  const openEditModal = (expense) => {
    setEditingExpense(expense._id);
    setEditData({
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      date: new Date(expense.date).toISOString().split("T")[0],
      paymentMethod: expense.paymentMethod || "Cash"
    });
  };

  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();

    const { category, amount, date } = editData;

    if (!category || !amount || !date) {
      alert("All fields are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/other/${editingExpense}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setExpenses(expenses.map((e) => (e._id === editingExpense ? res.data : e)));
      setEditingExpense(null);
      toast.success("Expense updated!");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error("Failed to update expense");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/other/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setExpenses(expenses.filter((expense) => expense._id !== id));
      toast.success("Expense deleted");
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      toast.error("Failed to delete expense");
    }
  };

  return (
    <div className="other-expenses-page">
      <div className="page-glow glow-1"></div>
      <div className="page-glow glow-2"></div>
      <div className="page-grid"></div>

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Expense Management</span>
          <h1 className="hero-title">Other Expenses</h1>
          <p className="hero-subtitle">
            Record and manage non-kitchen business expenses in a clean, modern
            admin interface.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface form-card">
            <div className="section-header">
              <h2 className="section-title">Add Expense</h2>
              <p className="section-subtitle">
                Enter expense details and keep business costs organized.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field-block">
                  <label className="form-label">Expense Category</label>
                  <select
                    name="category"
                    value={newExpense.category}
                    onChange={handleChange}
                    className="form-control custom-input custom-select"
                  >
                    <option>Marketing</option>
                    <option>Admin Supplies</option>
                    <option>Repairs & Maintenance</option>
                    <option>Software/Subscription</option>
                    <option>Training</option>
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
                      value={newExpense.amount}
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
                    value={newExpense.paymentMethod}
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
                    value={newExpense.date}
                    onChange={handleChange}
                    className="form-control custom-input"
                    required
                  />
                </div>

                <div className="field-block field-full">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={newExpense.description}
                    onChange={handleChange}
                    rows="3"
                    className="form-control custom-input custom-textarea"
                    placeholder="Add a short description"
                  />
                </div>

                <div className="field-block field-full other-expenses-submit-actions">
                  <button
                    type="submit"
                    className="submit-btn other-expenses-submit-btn d-inline-flex align-items-center justify-content-center"
                  >
                    <FaWallet className="me-2 other-expenses-submit-icon" aria-hidden />
                    Add Expense
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="glass-card shared-card-surface table-card">
            <div className="section-header">
              <h2 className="section-title">Recent Expenses</h2>
              <p className="section-subtitle">
                View and manage your latest expense records.
              </p>
            </div>

            <div className="table-wrap">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
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
                        Loading expenses...
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        No expenses found
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense._id}>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                        <td>{expense.category}</td>
                        <td>
                          {symbol}
                          {Number(expense.amount).toFixed(2)}
                        </td>
                        <td>{expense.paymentMethod || "Cash"}</td>
                        <td>{expense.description || "-"}</td>
                        <td className="text-center action-cell">
                          <button
                            className="table-btn edit-btn"
                            onClick={() => openEditModal(expense)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="table-btn delete-btn"
                            onClick={() => handleDelete(expense._id)}
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

      {editingExpense && (
        <div className="modal-overlay">
          <div className="modal-box shared-card-surface">
            <div className="modal-header">
              <h5 className="modal-title">Edit Expense</h5>
              <button
                type="button"
                className="modal-close"
                onClick={() => setEditingExpense(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleUpdate}>
                <div className="modal-form-grid">
                  <div className="field-block">
                    <label className="form-label">Expense Category</label>
                    <select
                      name="category"
                      value={editData.category}
                      onChange={handleEditChange}
                      className="form-control custom-input custom-select"
                    >
                      <option>Marketing</option>
                      <option>Admin Supplies</option>
                      <option>Repairs & Maintenance</option>
                      <option>Software/Subscription</option>
                      <option>Training</option>
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
                      onClick={() => handleDelete(editingExpense)}
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
        .other-expenses-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          background: linear-gradient(165deg, #faf8f8 0%, #fff1f1 38%, #f4f6fb 100%);
          padding: 28px 24px 34px;
        }

        .other-expenses-page .page-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.12));
        }

        .other-expenses-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.35;
          pointer-events: none;
        }

        .other-expenses-page .glow-1 {
          width: 300px;
          height: 300px;
          top: -80px;
          left: -60px;
          background: rgba(59, 130, 246, 0.14);
        }

        .other-expenses-page .glow-2 {
          width: 340px;
          height: 340px;
          right: -80px;
          bottom: -80px;
          background: rgba(239, 68, 68, 0.12);
        }

        .other-expenses-page .page-shell {
          width: calc(100% - 80px);
          max-width: none;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .other-expenses-page .shared-card-surface {
          border-radius: 30px;
          border: 1px solid rgba(15, 23, 42, 0.08) !important;
          background: #ffffff !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow:
            0 18px 50px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
        }

        .other-expenses-page .hero-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .other-expenses-page .hero-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #991b1b;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.22);
        }

        .other-expenses-page .hero-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .other-expenses-page .hero-subtitle {
          margin: 0;
          color: rgba(15, 23, 42, 0.62);
          font-size: 15px;
          line-height: 1.7;
          max-width: 760px;
        }

        .other-expenses-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .other-expenses-page .glass-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .other-expenses-page .form-card,
        .other-expenses-page .table-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .other-expenses-page .section-header {
          margin-bottom: 22px;
        }

        .other-expenses-page .section-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .other-expenses-page .section-subtitle {
          margin: 0;
          color: rgba(15, 23, 42, 0.6);
          font-size: 14px;
          line-height: 1.7;
        }

        .other-expenses-page .form-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .other-expenses-page .modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .other-expenses-page .field-full {
          grid-column: 1 / -1;
        }

        .other-expenses-page .field-block {
          min-width: 0;
        }

        .other-expenses-page .form-label {
          display: block;
          margin-bottom: 10px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 700;
        }

        .other-expenses-page .input-wrap {
          position: relative;
        }

        .other-expenses-page .input-pill {
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
          background: linear-gradient(135deg, #ef4444, #dc2626);
          z-index: 2;
          box-shadow: 0 12px 20px rgba(239, 68, 68, 0.24);
        }

        .other-expenses-page .with-prefix {
          padding-left: 58px !important;
        }

        .other-expenses-page .custom-input {
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

        .other-expenses-page .custom-input:focus {
          background: #ffffff;
          color: #0f172a;
          border-color: rgba(239, 68, 68, 0.5);
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12) !important;
        }

        .other-expenses-page .custom-input::placeholder {
          color: rgba(15, 23, 42, 0.42);
        }

        .other-expenses-page .custom-select {
          appearance: none;
          cursor: pointer;
        }

        .other-expenses-page .custom-textarea {
          height: auto;
          min-height: 120px;
          padding-top: 14px;
          resize: none;
        }

        .other-expenses-page .submit-btn,
        .other-expenses-page .danger-btn,
        .other-expenses-page .table-btn {
          border: none;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .other-expenses-page .submit-btn {
          height: 60px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 16px 32px rgba(239, 68, 68, 0.22);
        }

        .other-expenses-page .other-expenses-submit-actions {
          display: flex;
          justify-content: center;
          padding-top: 6px;
        }

        .other-expenses-page .submit-btn.other-expenses-submit-btn {
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
            0 3px 0 rgba(127, 29, 29, 0.22),
            0 14px 32px rgba(239, 68, 68, 0.38);
        }

        .other-expenses-page .other-expenses-submit-icon {
          font-size: 1.15rem;
        }

        .other-expenses-page .other-expenses-submit-btn:hover:not(:disabled) {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            0 4px 0 rgba(127, 29, 29, 0.18),
            0 18px 42px rgba(239, 68, 68, 0.45);
        }

        .other-expenses-page .submit-btn:hover,
        .other-expenses-page .danger-btn:hover,
        .other-expenses-page .table-btn:hover {
          transform: translateY(-2px);
        }

        .other-expenses-page .table-wrap {
          overflow-x: auto;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
        }

        .other-expenses-page .expenses-table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
        }

        .other-expenses-page .expenses-table thead tr {
          background: #f1f5f9;
        }

        .other-expenses-page .expenses-table th {
          padding: 18px 20px;
          text-align: left;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .other-expenses-page .expenses-table td {
          padding: 18px 20px;
          color: #334155;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: middle;
          background: #ffffff;
        }

        .other-expenses-page .expenses-table tbody tr:hover td {
          background: #fff5f5;
        }

        .other-expenses-page .text-center {
          text-align: center;
        }

        .other-expenses-page .action-cell {
          white-space: nowrap;
        }

        .other-expenses-page .table-btn {
          padding: 10px 14px;
          margin: 0 4px;
        }

        .other-expenses-page .edit-btn {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          box-shadow: 0 10px 22px rgba(245, 158, 11, 0.22);
        }

        .other-expenses-page .delete-btn,
        .other-expenses-page .danger-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 10px 22px rgba(239, 68, 68, 0.22);
        }

        .other-expenses-page .empty-row {
          text-align: center;
          color: #94a3b8 !important;
          padding: 34px !important;
          background: #ffffff !important;
        }

        .other-expenses-page .modal-overlay {
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

        .other-expenses-page .modal-box {
          width: 100%;
          max-width: 720px;
          overflow: hidden;
        }

        .other-expenses-page .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .other-expenses-page .modal-title {
          margin: 0;
          color: #0f172a;
          font-size: 22px;
          font-weight: 800;
        }

        .other-expenses-page .modal-close {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 12px;
          background: #f1f5f9;
          color: #334155;
          font-size: 24px;
          line-height: 1;
        }

        .other-expenses-page .modal-body {
          padding: 24px;
        }

        .other-expenses-page .modal-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 12px;
        }

        .other-expenses-page .flex-btn {
          flex: 1;
          height: 56px;
        }

        @media (max-width: 768px) {
          .other-expenses-page .page-shell {
            width: calc(100% - 24px);
          }

          .other-expenses-page {
            padding: 18px 12px;
          }

          .other-expenses-page .hero-card,
          .other-expenses-page .glass-card,
          .other-expenses-page .modal-body {
            padding: 20px;
          }

          .other-expenses-page .form-grid,
          .other-expenses-page .modal-form-grid {
            grid-template-columns: 1fr;
          }

          .other-expenses-page .field-full,
          .other-expenses-page .modal-actions {
            grid-column: auto;
          }

          .other-expenses-page .modal-actions {
            flex-direction: column;
          }

          .other-expenses-page .section-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default OtherExpenses;