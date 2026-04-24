import API_BASE_URL from "../apiConfig";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserPlus, FaFileExcel, FaFilePdf, FaEdit, FaTrash, FaUsers, FaIdBadge, FaBriefcase, FaDatabase, FaChevronRight } from "react-icons/fa";
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
      const res = await axios.get(`${API_BASE_URL}/api/auth/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data || []);
    } catch (err) {
      toast.error("Cloud personnel sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently remove this personnel record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/auth/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(employees.filter(e => e._id !== id));
      toast.success("Personnel record purged");
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  if (loading && employees.length === 0) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <div className="text-center">
            <div className="spinner-border text-primary mb-3"></div>
            <div className="fw-900 text-main">Syncing HR Database...</div>
        </div>
    </div>
  );

  return (
    <div className="personnel-layout animate-in p-2">
      <ToastContainer theme="light" />
      
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title">Human Resources</h1>
          <p className="premium-subtitle">Manage staff profiles, roles, and organizational structure</p>
        </div>
        <Link to="/admin/employee/new" className="btn-premium btn-primary px-4 py-3 rounded-pill shadow-lg">
          <FaUserPlus className="me-2" /> RECRUIT PERSONNEL
        </Link>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
            <div className="orient-card stat-widget py-3 border-0 shadow-platinum bg-white">
                <div className="stat-icon bg-blue-glow"><FaUsers size={20} /></div>
                <div>
                    <div className="stat-label">Total Staff</div>
                    <div className="stat-value">{employees.length} Personnel</div>
                </div>
            </div>
        </div>
        <div className="col-md-4">
            <div className="orient-card stat-widget py-3 border-0 shadow-platinum bg-white">
                <div className="stat-icon bg-gold-glow"><FaBriefcase size={20} className="text-warning" /></div>
                <div>
                    <div className="stat-label">Operational Nodes</div>
                    <div className="stat-value">{[...new Set(employees.map(e => e.role))].length} Depts</div>
                </div>
            </div>
        </div>
      </div>

      <div className="orient-card p-0 border-0 shadow-platinum bg-white overflow-hidden">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
            <h6 className="mb-0 fw-800 text-main d-flex align-items-center gap-2">
                <FaDatabase className="text-primary" /> Personnel Directory Ledger
            </h6>
            <div className="d-flex gap-2">
                <button className="btn-premium btn-ghost py-1 px-3 fs-tiny rounded-pill"><FaFileExcel size={10} className="me-1" /> Excel</button>
                <button className="btn-premium btn-ghost py-1 px-3 fs-tiny rounded-pill"><FaFilePdf size={10} className="me-1" /> PDF</button>
            </div>
        </div>

        <div className="table-container border-0">
            <table className="premium-table">
                <thead>
                    <tr>
                        <th>Personnel Identity</th>
                        <th>NIC / ID</th>
                        <th>Contact Node</th>
                        <th>Position</th>
                        <th>Valuation</th>
                        <th className="text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.length > 0 ? employees.map(emp => (
                        <tr key={emp._id}>
                            <td>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-app p-2 rounded-circle"><FaIdBadge className="text-primary" size={14} /></div>
                                    <div>
                                        <div className="text-main fw-800">{emp.name}</div>
                                        <div className="tiny text-muted">ID: {emp.id || emp._id.slice(-6).toUpperCase()}</div>
                                    </div>
                                </div>
                            </td>
                            <td><div className="text-main small fw-700">{emp.nic}</div></td>
                            <td><div className="text-muted small">{emp.phone}</div></td>
                            <td><span className="badge badge-blue">{emp.role}</span></td>
                            <td><div className="text-primary fw-900">{symbol}{Number(emp.basicSalary || 0).toLocaleString()}</div></td>
                            <td className="text-center">
                                <div className="d-flex justify-content-center gap-2">
                                    <Link to={`/admin/employee/edit/${emp._id}`} className="btn-premium btn-ghost p-2 rounded-circle"><FaEdit size={10} /></Link>
                                    <button className="btn-premium btn-ghost p-2 rounded-circle text-danger" onClick={() => handleDelete(emp._id)}><FaTrash size={10} /></button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="6" className="text-center py-5 opacity-40">
                                <FaUsers size={32} className="mb-2" />
                                <div className="fw-800">No personnel records found</div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <style>{`
        .fs-tiny { font-size: 0.65rem; }
        .tiny { font-size: 0.7rem; }
      `}</style>
    </div>
  );
};

export default AdminEmployees;