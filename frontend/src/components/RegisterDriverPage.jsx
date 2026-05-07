import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserPlus } from "react-icons/fa";

const RegisterDriverPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    vehicle: "",
    numberPlate: "",
    address: "",
    phone: ""
  });
  const [drivers, setDrivers] = useState([]);
  const [editingDriver, setEditingDriver] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    nic: "",
    vehicle: "",
    numberPlate: "",
    address: "",
    phone: ""
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/drivers`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDrivers(res.data);
    } catch (err) {
      console.error("Failed to load drivers:", err.message);
      toast.error("Failed to load drivers");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/auth/drivers`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success("Driver registered successfully!");
      setFormData({
        name: "",
        nic: "",
        vehicle: "",
        numberPlate: "",
        address: "",
        phone: ""
      });
      fetchDrivers();
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to register driver");
    }
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver._id);
    setEditData({
      name: driver.name,
      nic: driver.nic,
      vehicle: driver.vehicle,
      numberPlate: driver.numberPlate,
      address: driver.address,
      phone: driver.phone
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/api/auth/drivers/${editingDriver}`,
        editData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDrivers(drivers.map((d) => (d._id === editingDriver ? res.data : d)));
      setEditingDriver(null);
      toast.success("Driver updated successfully!");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error("Failed to update driver");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this driver?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/api/auth/drivers/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setDrivers(drivers.filter((d) => d._id !== id));
      toast.success("Driver deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err.message);
      toast.error("Failed to delete driver");
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    if (!searchTerm.trim()) return true;
    const lowerSearch = searchTerm.toLowerCase();

    return (
      d.name?.toLowerCase().includes(lowerSearch) ||
      d.vehicle?.toLowerCase().includes(lowerSearch) ||
      d.nic?.toLowerCase().includes(lowerSearch) ||
      d.numberPlate?.toLowerCase().includes(lowerSearch) ||
      d.phone?.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div className="driver-page">
      <div className="page-glow glow-1"></div>
      <div className="page-glow glow-2"></div>
      <div className="page-grid"></div>

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Delivery Driver Management</span>
          <h1 className="hero-title">Register Delivery Driver</h1>
          <p className="hero-subtitle">
            Add and manage delivery driver records in a clean, modern admin interface.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface form-card">
            <div className="section-header center-header">
              <h2 className="section-title">Register Driver</h2>
              <p className="section-subtitle">
                Add new delivery driver details for takeaway and delivery orders.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field-block">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="custom-input"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">NIC</label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    className="custom-input"
                    placeholder="e.g. 19901234567"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Vehicle Type</label>
                  <input
                    type="text"
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleChange}
                    className="custom-input"
                    placeholder="Scooter, Bike, Car"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Number Plate</label>
                  <input
                    type="text"
                    name="numberPlate"
                    value={formData.numberPlate}
                    onChange={handleChange}
                    className="custom-input"
                    placeholder="e.g. ABC-1234"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="custom-input"
                    placeholder="Street, City"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Phone No</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="custom-input"
                    placeholder="e.g. 0771234567"
                    required
                  />
                </div>

                <div className="field-block field-full driver-register-actions">
                  <button
                    type="submit"
                    className="submit-btn driver-register-submit d-inline-flex align-items-center justify-content-center"
                  >
                    <FaUserPlus className="me-2" aria-hidden />
                    Register Driver
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="glass-card shared-card-surface table-card">
            <div className="section-header center-header">
              <h2 className="section-title">Registered Drivers</h2>
              <p className="section-subtitle">
                View, search, edit, and manage all registered delivery drivers in one place.
              </p>
            </div>

            <div className="search-wrap">
              <input
                type="text"
                className="custom-input"
                placeholder="Search by name, NIC, phone, vehicle, or number plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="table-wrap">
              <table className="driver-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>NIC</th>
                    <th>Phone</th>
                    <th>Vehicle</th>
                    <th>Number Plate</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        No drivers found
                      </td>
                    </tr>
                  ) : (
                    filteredDrivers.map((driver, idx) => (
                      <tr key={driver._id || idx}>
                        <td>{driver.name}</td>
                        <td>{driver.nic}</td>
                        <td>{driver.phone}</td>
                        <td>{driver.vehicle}</td>
                        <td>{driver.numberPlate}</td>
                        <td className="text-center action-cell">
                          <button
                            className="table-btn edit-btn"
                            onClick={() => openEditModal(driver)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="table-btn delete-btn"
                            onClick={() => handleDelete(driver._id)}
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

      {editingDriver && (
        <div className="modal-overlay">
          <div className="modal-box shared-card-surface">
            <div className="modal-header">
              <h5 className="modal-title">Edit Driver</h5>
              <button
                className="modal-close"
                onClick={() => setEditingDriver(null)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-form-grid">
                <div className="field-block">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    className="custom-input"
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">NIC</label>
                  <input
                    type="text"
                    name="nic"
                    value={editData.nic}
                    onChange={handleEditChange}
                    className="custom-input"
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Phone No</label>
                  <input
                    type="text"
                    name="phone"
                    value={editData.phone}
                    onChange={handleEditChange}
                    className="custom-input"
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Vehicle Type</label>
                  <input
                    type="text"
                    name="vehicle"
                    value={editData.vehicle}
                    onChange={handleEditChange}
                    className="custom-input"
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Number Plate</label>
                  <input
                    type="text"
                    name="numberPlate"
                    value={editData.numberPlate}
                    onChange={handleEditChange}
                    className="custom-input"
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editData.address}
                    onChange={handleEditChange}
                    className="custom-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="table-btn edit-btn flex-btn"
                  onClick={() => setEditingDriver(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="submit-btn flex-btn"
                  onClick={handleUpdate}
                  type="button"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} />

      <style>{`
        .driver-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
          color: #0f172a;
          padding: 28px 24px 34px;
        }

        .driver-page .page-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
          background-size: 42px 42px;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.03));
        }

        .driver-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.42;
          pointer-events: none;
        }

        .driver-page .glow-1 {
          width: 300px;
          height: 300px;
          top: -80px;
          left: -60px;
          background: hsla(160, 42%, 48%, 0.2);
        }

        .driver-page .glow-2 {
          width: 340px;
          height: 340px;
          right: -80px;
          bottom: -80px;
          background: hsla(200, 55%, 58%, 0.14);
        }

        .driver-page .page-shell {
          width: calc(100% - 80px);
          max-width: none;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .driver-page .hero-card.shared-card-surface,
        .driver-page .glass-card.shared-card-surface,
        .driver-page .modal-box.shared-card-surface {
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

        .driver-page .hero-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}


        .driver-page .hero-badge {
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

        .driver-page .hero-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .driver-page .hero-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.7;
          max-width: 760px;
        }

        .driver-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .driver-page .glass-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}


        .driver-page .form-card,
        .driver-page .table-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}


        .driver-page .section-header {
          margin-bottom: 24px;
        }

        .driver-page .center-header {
          text-align: center;
        }

        .driver-page .section-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .driver-page .section-subtitle {
          margin: 0 auto;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
          max-width: 760px;
        }

        .driver-page .form-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .driver-page .modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .driver-page .field-block {
          min-width: 0;
        }

        .driver-page .field-full {
          grid-column: 1 / -1;
        }

        .driver-page .form-label {
          display: block;
          margin-bottom: 10px;
          color: #334155;
          font-size: 15px;
          font-weight: 700;
          text-align: center;
        }

        .driver-page .custom-input {
          width: 100%;
          height: 60px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          font-size: 15px;
          padding: 0 16px;
          transition: all 0.25s ease;
        }

        .driver-page .custom-input:focus {
          background: #ffffff;
          color: #0f172a;
          outline: none;
          border-color: hsla(160, 42%, 40%, 0.55);
          box-shadow: 0 0 0 4px hsla(160, 40%, 42%, 0.14) !important;
        }

        .driver-page .custom-input::placeholder {
          color: rgba(15, 23, 42, 0.42);
        }

        .driver-page .search-wrap {
          margin-bottom: 18px;
        }

        .driver-page .submit-btn,
        .driver-page .table-btn {
          border: none;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          transition: all 0.25s ease;
          cursor: pointer;
        }

        .driver-page .submit-btn {
          height: 60px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 16px 32px rgba(34, 197, 94, 0.22);
          width: 100%;
        }

        .driver-page .driver-register-actions {
          display: flex;
          justify-content: center;
          padding-top: 6px;
        }

        .driver-page .submit-btn.driver-register-submit {
          width: auto !important;
          min-width: min(100%, 280px);
          min-height: 58px;
          height: auto;
          padding: 16px 40px;
          font-size: 1.05rem;
          letter-spacing: 0.03em;
          border-radius: 18px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            0 3px 0 rgba(5, 46, 22, 0.14),
            0 14px 32px rgba(22, 163, 74, 0.32);
        }

        .driver-page .driver-register-submit svg {
          font-size: 1.15rem;
        }

        .driver-page .driver-register-submit:hover:not(:disabled) {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            0 4px 0 rgba(5, 46, 22, 0.12),
            0 18px 42px rgba(22, 163, 74, 0.38);
        }

        .driver-page .submit-btn:hover,
        .driver-page .table-btn:hover {
          transform: translateY(-2px);
        }

        .driver-page .table-btn {
          padding: 10px 14px;
          margin: 0 4px;
        }

        .driver-page .edit-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.1);
        }

        .driver-page .delete-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 10px 22px rgba(239, 68, 68, 0.2);
        }

        .driver-page .table-wrap {
          overflow-x: auto;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #f8fafc;
        }

        .driver-page .driver-table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
          background: #ffffff;
        }

        .driver-page .driver-table thead tr {
          background: #f1f5f9;
        }

        .driver-page .driver-table th {
          padding: 18px 20px;
          text-align: left;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .driver-page .driver-table td {
          padding: 18px 20px;
          color: #334155;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: middle;
          background: #ffffff;
        }

        .driver-page .driver-table tbody tr:hover td {
          background: #f8fafc;
        }

        .driver-page .action-cell {
          white-space: nowrap;
        }

        .driver-page .empty-row {
          text-align: center;
          color: #64748b !important;
          padding: 34px !important;
        }

        .driver-page .modal-overlay {
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

        .driver-page .modal-box {
          width: 100%;
          max-width: 780px;
          overflow: hidden;
          border-radius: 24px;
        }

        .driver-page .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .driver-page .modal-title {
          margin: 0;
          color: #0f172a;
          font-size: 22px;
          font-weight: 800;
        }

        .driver-page .modal-close {
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

        .driver-page .modal-close:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .driver-page .modal-body {
          padding: 24px;
        }

        .driver-page .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 22px;
        }

        .driver-page .flex-btn {
          flex: 1;
          height: 56px;
        }

        @media (max-width: 1100px) {
          .driver-page .form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .driver-page .page-shell {
            width: calc(100% - 24px);
          }

          .driver-page {
            padding: 18px 12px;
          }

          .driver-page .hero-card,
          .driver-page .glass-card,
          .driver-page .modal-body {
            padding: 20px;
          }

          .driver-page .form-grid,
          .driver-page .modal-form-grid {
            grid-template-columns: 1fr;
          }

          .driver-page .field-full {
            grid-column: auto;
          }

          .driver-page .section-title {
            font-size: 24px;
          }

          .driver-page .modal-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterDriverPage;