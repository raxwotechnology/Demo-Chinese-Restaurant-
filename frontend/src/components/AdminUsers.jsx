// src/components/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/users",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users:", err.message);
        toast.error("Failed to load users");
      }
    };

    fetchUsers();
  }, []);

  const exportToExcel = () => {
    const filteredUsers = users.map((user) => ({
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Status: user.isActive ? "Active" : "Inactive"
    }));

    const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_report.xlsx");
  };

  const exportToPDF = () => {
    const input = document.getElementById("user-table");

    if (!input) {
      toast.error("Table not found!");
      return;
    }

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("users_report.pdf");
    });
  };

  const handleRoleChange = async (id, newRole) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/user/${id}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, role: res.data.role } : user
        )
      );

      toast.success("User role updated successfully!");
    } catch (err) {
      console.error("Failed to update role:", err.message);
      toast.error("Failed to update role");
    }
  };

  const handleDeactivate = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to deactivate this user?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/user/${id}/deactivate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUsers(users.map((u) => (u._id === id ? res.data : u)));
      toast.success("User deactivated successfully!");
    } catch (err) {
      console.error("Deactivation failed:", err.message);
      toast.error("Failed to deactivate user");
    }
  };

  const handleReactivate = async (id) => {
    if (!window.confirm("Are you sure you want to reactivate this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/user/reactivate/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUsers(users.map((u) => (u._id === id ? res.data : u)));
      toast.success("User reactivated successfully!");
    } catch (err) {
      console.error("Reactivate failed:", err.response?.data || err.message);
      toast.error("Failed to reactivate user");
    }
  };

  return (
    <div className="admin-users-page">
      <div className="page-glow glow-1"></div>
      <div className="page-glow glow-2"></div>
      <div className="page-grid"></div>

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">User Management</span>
          <h1 className="hero-title">Manage Users</h1>
          <p className="hero-subtitle">
            View, manage, export, and update system users in a clean, modern admin interface.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface action-card">
            <div className="section-header center-header">
              <h2 className="section-title">User Actions</h2>
              <p className="section-subtitle">
                Export user records and manage all system users from one place.
              </p>
            </div>

            <div className="action-row">
              <div className="action-group">
                <button className="action-btn outline-green" onClick={exportToExcel}>
                  Export to Excel
                </button>
                <button className="action-btn outline-red" onClick={exportToPDF}>
                  Export to PDF
                </button>
              </div>

              <span className="total-badge">
                Total Users: <strong>{users.length}</strong>
              </span>
            </div>
          </div>

          <div className="glass-card shared-card-surface table-card">
            <div className="section-header center-header">
              <h2 className="section-title">User Records</h2>
              <p className="section-subtitle">
                View all users, update user roles, and manage user access in one place.
              </p>
            </div>

            <div className="table-wrap">
              <table id="user-table" className="user-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-row">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td className="user-name">{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="role-select"
                            disabled={!user.isActive}
                          >
                            <option value="admin">Admin</option>
                            <option value="cashier">Cashier</option>
                            <option value="kitchen">Kitchen</option>
                          </select>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${user.isActive ? "status-active" : "status-inactive"
                              }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-center action-cell">
                          {!user.isActive ? (
                            <button
                              className="table-btn success-btn"
                              onClick={() => handleReactivate(user._id)}
                              type="button"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              className="table-btn delete-btn"
                              onClick={() => handleDeactivate(user._id)}
                              type="button"
                            >
                              Deactivate
                            </button>
                          )}
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

      <ToastContainer position="top-right" autoClose={2500} />

      <style>{`
        .admin-users-page {
          min-height: 100vh;
          position: relative;
          overflo          // 
           background: transparent;
          color: #0f172a;
          padding: 28px 24px 34px;
        }

        // .admin-users-page .page-grid {
        //   position: absolute;
        //   inset: 0;
        //   background-image:
        //     linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
        //     linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
        //   background-size: 42px 42px;
        //   pointer-events: none;
        //   mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.03));
        // }

        .admin-users-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.42;
          pointer-events: none;
        }

        .admin-users-page .glow-1 {
          width: 300px;
          height: 300px;
          top: -80px;
          left: -60px;
          background: hsla(160, 42%, 48%, 0.2);
        }

        .admin-users-page .glow-2 {
          width: 340px;
          height: 340px;
          right: -80px;
          bottom: -80px;
          background: hsla(200, 55%, 58%, 0.14);
        }

        .admin-users-page .page-shell {
          width: calc(100% - 80px);
          max-width: none;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .admin-users-page .hero-card.shared-card-surface,
        .admin-users-page .glass-card.shared-card-surface {
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

        .admin-users-page .hero-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}


        .admin-users-page .hero-badge {
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

        .admin-users-page .hero-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .admin-users-page .hero-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.7;
          max-width: 760px;
        }

        .admin-users-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .admin-users-page .glass-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}


        .admin-users-page .section-header {
          margin-bottom: 24px;
        }

        .admin-users-page .center-header {
          text-align: center;
        }

        .admin-users-page .section-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .admin-users-page .section-subtitle {
          margin: 0 auto;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
          max-width: 760px;
        }

        .admin-users-page .action-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .admin-users-page .action-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .admin-users-page .action-btn,
        .admin-users-page .table-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border: none;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          transition: all 0.25s ease;
          cursor: pointer;
        }

        .admin-users-page .action-btn:hover:not(:disabled),
        .admin-users-page .table-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .admin-users-page .action-btn {
          min-height: 56px;
          padding: 0 20px;
        }

        .admin-users-page .success-btn {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #ffffff;
          box-shadow: 0 16px 32px rgba(34, 197, 94, 0.22);
        }

        .admin-users-page .outline-green {
          background: hsla(142, 71%, 36%, 0.1);
          border: 2px solid hsla(142, 65%, 36%, 0.45);
          color: #166534;
        }

        .admin-users-page .outline-green:hover {
          background: hsla(142, 71%, 36%, 0.16);
          color: #14532d;
        }

        .admin-users-page .outline-red {
          background: hsla(0, 84%, 50%, 0.08);
          border: 2px solid hsla(0, 72%, 45%, 0.4);
          color: #b91c1c;
        }

        .admin-users-page .outline-red:hover {
          background: hsla(0, 84%, 50%, 0.12);
          color: #991b1b;
        }

        .admin-users-page .total-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 56px;
          padding: 0 18px;
          border-radius: 16px;
          background: #f1f5f9;
          color: #334155;
          border: 1px solid rgba(15, 23, 42, 0.1);
          font-size: 14px;
          font-weight: 700;
        }

        .admin-users-page .total-badge strong {
          color: #0f172a;
          font-weight: 800;
        }

        .admin-users-page .table-wrap {
          overflow-x: auto;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #f8fafc;
        }

        .admin-users-page .user-table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
          background: #ffffff;
        }

        .admin-users-page .user-table thead tr {
          background: #f1f5f9;
        }

        .admin-users-page .user-table th {
          padding: 18px 20px;
          text-align: left;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .admin-users-page .user-table td {
          padding: 18px 20px;
          color: #334155;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: middle;
          background: #ffffff;
        }

        .admin-users-page .user-table tbody tr:hover td {
          background: #f8fafc;
        }

        .admin-users-page .user-name {
          font-weight: 700;
          color: #0f172a;
        }

        .admin-users-page .role-select {
          width: 100%;
          min-width: 140px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #0f172a;
          padding: 0 12px;
          font-size: 13px;
        }

        .admin-users-page .role-select:focus {
          border-color: hsla(160, 42%, 40%, 0.55);
          outline: none;
          box-shadow: 0 0 0 3px hsla(160, 40%, 42%, 0.14);
        }

        .admin-users-page .role-select:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          background: #f1f5f9;
        }

        .admin-users-page .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 96px;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }

        .admin-users-page .status-active {
          background: hsla(142, 71%, 36%, 0.12);
          color: #166534;
          border: 1px solid hsla(142, 65%, 32%, 0.22);
        }

        .admin-users-page .status-inactive {
          background: rgba(100, 116, 139, 0.12);
          color: #475569;
          border: 1px solid rgba(71, 85, 105, 0.2);
        }

        .admin-users-page .action-cell {
          white-space: nowrap;
        }

        .admin-users-page .table-btn {
          padding: 10px 14px;
          margin: 0 4px;
          color: #ffffff;
        }

        .admin-users-page .delete-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 10px 22px rgba(239, 68, 68, 0.2);
        }

        .admin-users-page .empty-row {
          text-align: center;
          color: #64748b !important;
          padding: 34px !important;
        }

        @media (max-width: 768px) {
          .admin-users-page .page-shell {
            width: calc(100% - 24px);
          }

          .admin-users-page {
            padding: 18px 12px;
          }

          .admin-users-page .hero-card,
          .admin-users-page .glass-card {
            padding: 20px;
          }

          .admin-users-page .section-title {
            font-size: 24px;
          }

          .admin-users-page .action-row {
            flex-direction: column;
            align-items: stretch;
          }

          .admin-users-page .action-group {
            width: 100%;
            flex-direction: column;
          }

          .admin-users-page .action-btn,
          .admin-users-page .total-badge {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;