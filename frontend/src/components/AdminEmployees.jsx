import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Briefcase, 
  Mail, 
  Phone, 
  Shield, 
  Calendar,
  MoreVertical,
  ChevronRight,
  Database
} from "lucide-react";
import API_BASE_URL from "../apiConfig";
import "../styles/PremiumUI.css";

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
      toast.error("Database synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this personnel record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/auth/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(prev => prev.filter(e => e._id !== id));
      toast.success("Personnel record archived");
    } catch (err) {
      toast.error("Archival operation failed");
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner-border text-indigo" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="personnel-view">
      <ToastContainer theme="colored" />
      
      {/* Dynamic Header */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h1 className="text-hero">Personnel Directory</h1>
          <p className="text-subtitle">Management of institutional human capital and expertise</p>
        </div>
        <Link to="/admin/employee/new" className="btn-indigo">
          <UserPlus size={18} />
          <span>ONBOARD STAFF</span>
        </Link>
      </div>

      {/* Modern Search & Filter */}
      <div className="d-flex gap-3 mb-5">
        <div className="flex-grow-1 bg-white p-2 rounded-4 shadow-sm border d-flex align-items-center px-4">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search by name, identity, or position..." 
            className="border-0 bg-transparent w-100 py-2 px-3 outline-none fw-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-white p-2 rounded-4 shadow-sm border d-flex align-items-center px-3">
          <Users size={18} className="text-indigo me-2" />
          <span className="fw-800 text-indigo">{filteredEmployees.length} RECORDS</span>
        </div>
      </div>

      {/* Personnel Grid */}
      <div className="personnel-grid">
        <AnimatePresence mode="popLayout">
          {filteredEmployees.map((emp, i) => (
            <motion.div 
              key={emp._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="bento-card personnel-card"
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="personnel-avatar-modern">
                  {emp.name.charAt(0)}
                </div>
                <div className="d-flex gap-1">
                  <Link to={`/admin/employee/edit/${emp._id}`} className="icon-btn-round"><Edit3 size={14} /></Link>
                  <button className="icon-btn-round danger" onClick={() => handleDelete(emp._id)}><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="mt-4">
                <div className="badge-modern success mb-2">{emp.role}</div>
                <h4 className="fw-800 m-0">{emp.name}</h4>
                <p className="tiny-caps opacity-50 mt-1">ID: {emp.id || "STAFF-000"}</p>
              </div>

              <div className="mt-4 pt-4 border-top">
                <div className="d-flex align-items-center gap-3 mb-2 text-muted">
                  <Mail size={14} />
                  <span className="small fw-600">{emp.email || "No email"}</span>
                </div>
                <div className="d-flex align-items-center gap-3 mb-4 text-muted">
                  <Phone size={14} />
                  <span className="small fw-600">{emp.phone || "No phone"}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center bg-app p-3 rounded-3">
                  <span className="tiny-caps">Valuation</span>
                  <span className="fw-800 text-indigo">{symbol}{Number(emp.basicSalary || 0).toLocaleString()}</span>
                </div>
              </div>

              <Link to={`/admin/employee/edit/${emp._id}`} className="btn-ghost w-100 mt-4 justify-content-between py-3">
                <span className="fw-800" style={{ fontSize: '0.75rem' }}>VIEW PERFORMANCE</span>
                <ChevronRight size={14} />
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-5">
           <Database size={48} className="text-muted opacity-20 mb-3" />
           <p className="text-muted fw-700">No personnel matching your criteria</p>
        </div>
      )}

      <style>{`
        .personnel-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        .personnel-card { transition: all 0.3s; }
        .personnel-avatar-modern {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: var(--p-indigo-50);
          color: var(--p-indigo-600);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          font-family: 'Outfit';
        }
        .icon-btn-round { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border-subtle); background: white; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
        .icon-btn-round:hover { color: var(--p-indigo-600); border-color: var(--p-indigo-600); transform: translateY(-2px); }
        .icon-btn-round.danger:hover { color: var(--danger); border-color: var(--danger); }
        .badge-modern.success { background: var(--p-indigo-50); color: var(--p-indigo-600); }
      `}</style>
    </motion.div>
  );
};

export default AdminEmployees;