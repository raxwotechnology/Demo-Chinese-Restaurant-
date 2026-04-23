import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserPlus, FaFileExcel, FaFilePdf, FaEdit, FaTrash, FaUsers, FaIdBadge, FaBriefcase } from "react-icons/fa";
import "../styles/PremiumUI.css";

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/employees", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data || []);
    } catch (err) {
      toast.error("Failed to sync personnel data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently remove this employee?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(employees.filter(e => e._id !== id));
      toast.success("Personnel record purged");
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  return (
    <div className="personnel-management-container animate-fade-in">
      <ToastContainer theme="dark" />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title mb-1">Human Resources</h1>
          <p className="premium-subtitle mb-0">Manage staff profiles, roles, and payroll information</p>
        </div>
        <div className="d-flex gap-3">
            <Link to="/admin/employee/new" className="btn-premium btn-premium-secondary py-3 px-4">
                <FaUserPlus className="me-2" /> Recruit Personnel
            </Link>
        </div>
      </div>

      {/* Stats Quick Look */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
            <div className="orient-card orient-stat-card py-3">
                <div className="orient-stat-icon bg-blue-glow"><FaUsers size={20} /></div>
                <div>
                    <div className="orient-stat-label">Total Staff</div>
                    <div className="orient-stat-value" style={{ fontSize: '1.4rem' }}>{employees.length}</div>
                </div>
            </div>
        </div>
        <div className="col-md-4">
            <div className="orient-card orient-stat-card py-3">
                <div className="orient-stat-icon bg-gold-glow"><FaBriefcase size={20} /></div>
                <div>
                    <div className="orient-stat-label">Departments</div>
                    <div className="orient-stat-value" style={{ fontSize: '1.4rem' }}>{[...new Set(employees.map(e => e.role))].length}</div>
                </div>
            </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="orient-card p-0 overflow-hidden">
        <div className="p-4 border-bottom border-white-05 d-flex justify-content-between align-items-center">
            <h5 className="text-white mb-0">Personnel Directory</h5>
            <div className="d-flex gap-2">
                <button className="btn-premium btn-premium-primary p-2 small"><FaFileExcel /> Excel</button>
                <button className="btn-premium btn-premium-primary p-2 small"><FaFilePdf /> PDF</button>
            </div>
        </div>

        <div className="premium-table-container">
            <table className="premium-table">
                <thead>
                    <tr>
                        <th>Personnel Identity</th>
                        <th>NIC / ID</th>
                        <th>Contact Info</th>
                        <th>Position</th>
                        <th>Basic Salary</th>
                        <th className="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-gold"></div></td></tr>
                    ) : employees.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-5 text-muted">No staff records found in the database.</td></tr>
                    ) : employees.map(emp => (
                        <tr key={emp._id}>
                            <td>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-white-05 p-2 rounded-circle"><FaIdBadge className="text-gold" /></div>
                                    <div>
                                        <div className="text-white fw-bold">{emp.name}</div>
                                        <div className="small orient-text-muted">Staff ID: {emp.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td><div className="text-white small">{emp.nic}</div></td>
                            <td>
                                <div className="text-white small">{emp.phone}</div>
                            </td>
                            <td>
                                <div className="badge-premium badge-primary">{emp.role}</div>
                            </td>
                            <td>
                                <div className="text-gold fw-bold">{symbol}{Number(emp.basicSalary || 0).toFixed(2)}</div>
                            </td>
                            <td className="text-center">
                                <div className="d-flex justify-content-center gap-2">
                                    <Link to={`/admin/employee/edit/${emp._id}`} className="btn-premium btn-premium-accent p-2"><FaEdit /></Link>
                                    <button className="btn-premium btn-premium-primary p-2" onClick={() => handleDelete(emp._id)}><FaTrash /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default AdminEmployees;