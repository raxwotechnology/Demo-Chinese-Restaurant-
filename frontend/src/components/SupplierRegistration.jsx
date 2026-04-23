import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTruck } from "react-icons/fa";

const SupplierRegistration = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    companyName: "",
    contact: "",
    email: "",
    address: ""
  });
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    companyName: "",
    contact: "",
    email: "",
    address: ""
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/suppliers",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuppliers(res.data);
    } catch (err) {
      toast.error("Failed to load suppliers");
    }
  };

  const handleChange = (e) =>
    setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!newSupplier.companyName || !newSupplier.name || !newSupplier.contact) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/supplier/register",
        newSupplier,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuppliers([...suppliers, res.data]);
      setNewSupplier({
        name: "",
        companyName: "",
        contact: "",
        email: "",
        address: ""
      });
      toast.success("Supplier registered successfully!");
    } catch (err) {
      console.error("Register failed:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.error || "Failed to register supplier";
      toast.error(errorMessage);
    }
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier._id);
    setEditData({
      name: supplier.name,
      companyName: supplier.companyName || "",
      contact: supplier.contact,
      email: supplier.email || "",
      address: supplier.address || ""
    });
  };

  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editData.companyName || !editData.name || !editData.contact) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/supplier/${editingSupplier}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuppliers(
        suppliers.map((s) => (s._id === editingSupplier ? res.data : s))
      );
      setEditingSupplier(null);
      toast.success("Supplier updated successfully!");
    } catch (err) {
      console.error("Failed to update supplier:", err.message);
      toast.error("Failed to update supplier");
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;

    axios
      .delete(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/supplier/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      )
      .then(() => {
        setSuppliers(suppliers.filter((s) => s._id !== id));
        toast.success("Supplier deleted successfully!");
      })
      .catch(() => {
        toast.error("Failed to delete supplier");
      });
  };

  return (
    <div className="supplier-page">
      <div className="page-glow glow-1"></div>
      <div className="page-glow glow-2"></div>
      <div className="page-grid"></div>

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Supplier Management</span>
          <h1 className="hero-title">Register New Supplier</h1>
          <p className="hero-subtitle">
            Create and manage supplier records in a clean, modern admin interface.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface form-card">
            <div className="section-header center-header">
              <h2 className="section-title">Register Supplier</h2>
              <p className="section-subtitle">
                Enter supplier information and keep your vendor records organized.
              </p>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="field-block">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    name="name"
                    value={newSupplier.name}
                    onChange={handleChange}
                    className="form-control custom-input"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={newSupplier.companyName}
                    onChange={handleChange}
                    className="form-control custom-input"
                    placeholder="e.g. ABC Distributors"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Contact</label>
                  <input
                    type="text"
                    name="contact"
                    value={newSupplier.contact}
                    onChange={handleChange}
                    className="form-control custom-input"
                    placeholder="Phone / WhatsApp"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newSupplier.email}
                    onChange={handleChange}
                    className="form-control custom-input"
                    placeholder="example@domain.com"
                  />
                </div>

                <div className="field-block field-full">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={newSupplier.address}
                    onChange={handleChange}
                    className="form-control custom-input"
                    placeholder="Enter supplier address"
                  />
                </div>

                <div className="field-block field-full supplier-register-actions">
                  <button
                    type="submit"
                    className="submit-btn supplier-register-submit d-inline-flex align-items-center justify-content-center"
                  >
                    <FaTruck className="me-2" aria-hidden />
                    Register Supplier
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="glass-card shared-card-surface table-card">
            <div className="section-header center-header">
              <h2 className="section-title">Registered Suppliers</h2>
              <p className="section-subtitle">
                View and manage all registered supplier details in one place.
              </p>
            </div>

            <div className="table-wrap">
              <table className="supplier-table">
                <thead>
                  <tr>
                    <th>Contact Person</th>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        No suppliers found
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((s, idx) => (
                      <tr key={s._id || idx}>
                        <td>{s.name}</td>
                        <td>{s.companyName}</td>
                        <td>{s.contact}</td>
                        <td>{s.email || "-"}</td>
                        <td>{s.address || "-"}</td>
                        <td className="text-center action-cell">
                          <button
                            className="table-btn edit-btn"
                            onClick={() => openEditModal(s)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="table-btn delete-btn"
                            onClick={() => handleDelete(s._id)}
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

      {editingSupplier && (
        <div className="modal-overlay">
          <div className="modal-box shared-card-surface">
            <div className="modal-header">
              <h5 className="modal-title">Edit Supplier</h5>
              <button
                className="modal-close"
                onClick={() => setEditingSupplier(null)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleUpdate}>
                <div className="modal-form-grid">
                  {["name", "companyName", "contact", "email", "address"].map(
                    (field, index) => (
                      <div
                        className={`field-block ${field === "address" ? "field-full" : ""}`}
                        key={index}
                      >
                        <label className="form-label">
                          {field
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (s) => s.toUpperCase())}
                        </label>
                        <input
                          type={field === "email" ? "email" : "text"}
                          name={field}
                          value={editData[field]}
                          onChange={handleEditChange}
                          className="form-control custom-input"
                          required={["name", "companyName", "contact"].includes(
                            field
                          )}
                        />
                      </div>
                    )
                  )}
                </div>

                <div className="modal-actions create-actions">
                  <button
                    type="button"
                    className="table-btn edit-btn flex-btn"
                    onClick={() => setEditingSupplier(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn flex-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} />

      <style>{`
        .supplier-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          // background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
          color: #0f172a;
          padding: 28px 24px 34px;
        }

        // .supplier-page .page-grid {
        //   position: absolute;
        //   inset: 0;
        //   background-image:
        //     linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
        //     linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
        //   background-size: 42px 42px;
        //   pointer-events: none;
        //   mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.03));
        // }

        .supplier-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.42;
          pointer-events: none;
        }

        .supplier-page .glow-1 {
          width: 300px;
          height: 300px;
          top: -80px;
          left: -60px;
          background: hsla(160, 42%, 48%, 0.2);
        }

        .supplier-page .glow-2 {
          width: 340px;
          height: 340px;
          right: -80px;
          bottom: -80px;
          background: hsla(200, 55%, 58%, 0.14);
        }

        .supplier-page .page-shell {
          width: calc(100% - 80px);
          max-width: none;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .supplier-page .hero-card.shared-card-surface,
        .supplier-page .glass-card.shared-card-surface,
        .supplier-page .modal-box.shared-card-surface {
          border-radius: 30px !important;
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

        .supplier-page .hero-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .supplier-page .hero-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: hsl(160, 55%, 24%);
          background: hsla(160, 40%, 42%, 0.12);
          border: 1px solid hsla(160, 45%, 35%, 0.22);
        }

        .supplier-page .hero-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .supplier-page .hero-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.7;
          max-width: 760px;
        }

        .supplier-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .supplier-page .glass-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .supplier-page .form-card,
        .supplier-page .table-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .supplier-page .section-header {
          margin-bottom: 24px;
        }

        .supplier-page .center-header {
          text-align: center;
        }

        .supplier-page .section-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .supplier-page .section-subtitle {
          margin: 0 auto;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
          max-width: 760px;
        }

        .supplier-page .form-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .supplier-page .modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .supplier-page .field-block {
          min-width: 0;
        }

        .supplier-page .field-full {
          grid-column: 1 / -1;
        }

        .supplier-page .form-label {
          display: block;
          margin-bottom: 10px;
          color: #334155;
          font-size: 15px;
          font-weight: 700;
          text-align: center;
        }

        .supplier-page .custom-input,
        .supplier-page .form-control.custom-input {
          width: 100%;
          height: 60px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.12) !important;
          background: #ffffff !important;
          color: #0f172a !important;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          font-size: 15px;
          padding: 0 16px;
          transition: all 0.25s ease;
        }

        .supplier-page .custom-input:focus,
        .supplier-page .form-control.custom-input:focus {
          background: #ffffff !important;
          color: #0f172a !important;
          outline: none;
          border-color: hsla(160, 42%, 40%, 0.55) !important;
          box-shadow: 0 0 0 4px hsla(160, 40%, 42%, 0.14) !important;
        }

        .supplier-page .custom-input::placeholder,
        .supplier-page .form-control.custom-input::placeholder {
          color: rgba(15, 23, 42, 0.42);
        }

        .supplier-page .submit-btn,
        .supplier-page .table-btn {
          border: none;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          transition: all 0.25s ease;
          cursor: pointer;
        }

        .supplier-page .submit-btn {
          height: 60px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 16px 32px rgba(34, 197, 94, 0.22);
          width: 100%;
        }

        .supplier-page .supplier-register-actions {
          display: flex;
          justify-content: center;
          padding-top: 6px;
        }

        .supplier-page .submit-btn.supplier-register-submit {
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

        .supplier-page .supplier-register-submit svg {
          font-size: 1.15rem;
        }

        .supplier-page .supplier-register-submit:hover:not(:disabled) {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            0 4px 0 rgba(5, 46, 22, 0.12),
            0 18px 42px rgba(22, 163, 74, 0.38);
        }

        .supplier-page .submit-btn:hover,
        .supplier-page .table-btn:hover {
          transform: translateY(-2px);
        }

        .supplier-page .table-btn {
          padding: 10px 14px;
          margin: 0 4px;
        }

        .supplier-page .edit-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 10px 22px rgba(37, 99, 235, 0.2);
        }

        .supplier-page .delete-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 10px 22px rgba(239, 68, 68, 0.2);
        }

        .supplier-page .table-wrap {
          overflow-x: auto;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #f8fafc;
        }

        .supplier-page .supplier-table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
          background: #ffffff;
        }

        .supplier-page .supplier-table thead tr {
          background: #f1f5f9;
        }

        .supplier-page .supplier-table th {
          padding: 18px 20px;
          text-align: left;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .supplier-page .supplier-table td {
          padding: 18px 20px;
          color: #334155;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: middle;
          background: #ffffff;
        }

        .supplier-page .supplier-table tbody tr:hover td {
          background: #f8fafc;
        }

        .supplier-page .action-cell {
          white-space: nowrap;
        }

        .supplier-page .empty-row {
          text-align: center;
          color: #64748b !important;
          padding: 34px !important;
        }

        .supplier-page .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 16px;
        }

        .supplier-page .modal-box {
          width: 100%;
          max-width: 780px;
          overflow: hidden;
          border-radius: 24px;
        }

        .supplier-page .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .supplier-page .modal-title {
          margin: 0;
          color: #0f172a;
          font-size: 22px;
          font-weight: 800;
        }

        .supplier-page .modal-close {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 12px;
          background: #f1f5f9;
          color: #475569;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
        }

        .supplier-page .modal-close:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .supplier-page .modal-body {
          padding: 24px;
        }

        .supplier-page .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 22px;
        }

        .supplier-page .create-actions .flex-btn,
        .supplier-page .flex-btn {
          flex: 1;
          height: 56px;
        }

        @media (max-width: 1100px) {
          .supplier-page .form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .supplier-page .page-shell {
            width: calc(100% - 24px);
          }

          .supplier-page {
            padding: 18px 12px;
          }

          .supplier-page .hero-card,
          .supplier-page .glass-card,
          .supplier-page .modal-body {
            padding: 20px;
          }

          .supplier-page .form-grid,
          .supplier-page .modal-form-grid {
            grid-template-columns: 1fr;
          }

          .supplier-page .field-full {
            grid-column: auto;
          }

          .supplier-page .section-title {
            font-size: 24px;
          }

          .supplier-page .modal-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default SupplierRegistration;