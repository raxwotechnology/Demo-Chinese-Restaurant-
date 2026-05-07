import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserShield, FaTrash, FaEdit, FaPlus, FaSave, FaUserCircle, FaSyncAlt, FaKey, FaShieldAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "../styles/PremiumUI.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data || []);
    } catch (err) {
      toast.error("Security synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/auth/user/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Security permissions updated");
      fetchUsers();
    } catch (err) {
      toast.error("Permission update failed");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to revoke all access for this personnel?")) return;
    try {
      const token = localStorage.getItem("token");
      // Assuming a delete endpoint exists or using deactivate
      await axios.put(`${API_BASE_URL}/api/auth/user/${userId}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Personnel access revoked");
      fetchUsers();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="users-layout animate-in p-2">
      <ToastContainer theme="light" />
      
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="text-hero">Access Governance</h1>
          <p className="text-subtitle">Manage system permissions and administrative authority</p>
        </div>
        <button className="btn-modern btn-modern-primary" onClick={fetchUsers}>
            <FaSyncAlt /> Sync Access Directory
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-3">
            <div className="orient-card shadow-platinum bg-white h-100">
                <div className="stat-icon-wrapper mini bg-blue-glow mb-4"><FaShieldAlt size={22} /></div>
                <div>
                    <div className="tiny-caps">Security Pool</div>
                    <h2 className="display-6 fw-900 mt-2">{users.length} Users</h2>
                    <div className="badge-modern success mt-2">Verified Personnel</div>
                </div>
            </div>
        </div>

        <div className="col-lg-9">
            <div className="orient-card p-0 shadow-platinum bg-white overflow-hidden">
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <h6 className="mb-0 fw-800 text-main d-flex align-items-center gap-2">
                        <FaUserShield className="text-indigo" /> Authorized Personnel Directory
                    </h6>
                </div>
                
                <div className="premium-table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Personnel Identity</th>
                                <th>Electronic Contact</th>
                                <th>Security Role</th>
                                <th>Account Status</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-indigo"></div></td></tr>
                            ) : users.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-app p-2 rounded-circle"><FaUserCircle className="text-indigo" size={14} /></div>
                                            <div className="text-main fw-800">{user.name}</div>
                                        </div>
                                    </td>
                                    <td><div className="text-muted small fw-600">{user.email}</div></td>
                                    <td>
                                        <select 
                                            className="premium-input py-1 px-2 small border-0 bg-app fw-800 text-indigo" 
                                            value={user.role} 
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        >
                                            <option value="admin">System Admin</option>
                                            <option value="cashier">Terminal Cashier</option>
                                            <option value="kitchen">Kitchen Staff</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`badge-modern ${user.isActive ? 'success' : 'danger'}`}>
                                            {user.isActive ? 'Active Node' : 'Suspended'}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <button className="icon-btn-round text-danger border-0 mx-auto" onClick={() => handleDelete(user._id)}>
                                          <FaTrash size={12} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;