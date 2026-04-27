import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  History, 
  Filter, 
  Printer, 
  User, 
  ChevronRight, 
  Database,
  Briefcase,
  TrendingUp,
  Activity,
  Award,
  RefreshCw
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import API_BASE_URL from "../apiConfig";
import "../styles/PremiumUI.css";

const AttendanceDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ employees: 0, totalHours: 0, totalOt: 0, totalDays: 0 });
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/attendance/summary?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data.attendance || []);
      setStats(res.data.stats || { employees: 0, totalHours: 0, totalOt: 0, totalDays: 0 });
    } catch (err) {
      toast.error("Workforce sync failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner-border text-indigo" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="attendance-suite">
      <ToastContainer theme="colored" />
      
      {/* Dynamic Header */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h1 className="text-hero">Workforce Intelligence</h1>
          <p className="text-subtitle">Strategic monitoring of organizational human capital and duty compliance</p>
        </div>
        
        <div className="d-flex gap-2 bg-white p-2 rounded-4 shadow-sm border">
          <select 
            className="premium-select" 
            style={{ border: 'none', backgroundPosition: 'right 0.5rem center', padding: '0 2rem 0 1rem', fontSize: '0.9rem' }}
            value={month} 
            onChange={(e) => setMonth(parseInt(e.target.value))}
          >
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select 
            className="premium-select border-start" 
            style={{ borderTop: 'none', borderBottom: 'none', borderRight: 'none', backgroundPosition: 'right 0.5rem center', padding: '0 2rem 0 1rem', fontSize: '0.9rem', borderRadius: 0 }}
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn-refresh-premium" style={{ border: 'none', boxShadow: 'none' }} onClick={fetchAttendance} disabled={loading}>
            <RefreshCw size={18} className={loading ? "animate-spin-soft" : ""} />
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="row g-4 mb-5">
        <div className="col-xl-3 col-md-6">
          <div className="bento-card kpi-card">
            <div className="d-flex justify-content-between align-items-center">
              <div className="stat-icon-wrapper"><UserCheck size={20} /></div>
              <span className="tiny-caps">Active Staff</span>
            </div>
            <h2 className="display-6 fw-900 mt-3">{stats.employees}</h2>
            <div className="badge-modern success mt-2">Verified Personnel</div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="bento-card kpi-card">
            <div className="d-flex justify-content-between align-items-center">
              <div className="stat-icon-wrapper success"><Clock size={20} /></div>
              <span className="tiny-caps">Duty Hours</span>
            </div>
            <h2 className="display-6 fw-900 mt-3">{stats.totalHours.toFixed(1)}</h2>
            <div className="tiny-caps text-muted mt-2">Aggregated Time</div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="bento-card kpi-card">
            <div className="d-flex justify-content-between align-items-center">
              <div className="stat-icon-wrapper warning"><Award size={20} /></div>
              <span className="tiny-caps">Overtime</span>
            </div>
            <h2 className="display-6 fw-900 mt-3">{stats.totalOt.toFixed(1)}</h2>
            <div className="tiny-caps text-muted mt-2">Premium Surplus</div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="bento-card kpi-card">
            <div className="d-flex justify-content-between align-items-center">
              <div className="stat-icon-wrapper info"><Calendar size={20} /></div>
              <span className="tiny-caps">Coverage</span>
            </div>
            <h2 className="display-6 fw-900 mt-3">{stats.totalDays}</h2>
            <div className="tiny-caps text-muted mt-2">Operational Days</div>
          </div>
        </div>
      </div>

      {/* Detail Directory */}
      <div className="bento-card p-0 overflow-hidden shadow-lg border-0 bg-white">
        <header className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
           <div className="d-flex align-items-center gap-3">
             <div className="bg-indigo-glow p-2 rounded-circle"><Activity size={18} className="text-indigo" /></div>
             <h6 className="fw-900 m-0">Compliance Registry</h6>
           </div>
           <button className="btn-modern btn-modern-primary py-2 px-4 shadow-none" onClick={() => window.print()}>
             <Printer size={16} /> EXPORT AUDIT
           </button>
        </header>

        <div className="premium-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Personnel Identity</th>
                <th>Designation</th>
                <th>Duty Cycle</th>
                <th>Regular Hrs</th>
                <th>Premium Hrs</th>
                <th className="text-end">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {attendance.map((emp, i) => (
                  <motion.tr 
                    key={emp._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="attendance-avatar">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-800 text-main">{emp.name}</div>
                          <div className="tiny-caps opacity-50">ID: {emp._id.slice(-6).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td><div className="badge-modern success">Verified Professional</div></td>
                    <td className="fw-700">{emp.totalDays} Days</td>
                    <td className="fw-700">{(emp.totalHours - emp.totalOt).toFixed(1)}h</td>
                    <td className="fw-800 text-indigo">{emp.totalOt.toFixed(1)}h</td>
                    <td className="text-end">
                       <button className="icon-btn-round"><ChevronRight size={14} /></button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {attendance.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <Database size={48} className="text-muted opacity-20 mb-3" />
                    <p className="text-muted fw-700">No workforce records for this period</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .attendance-avatar {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: var(--p-indigo-50);
          color: var(--p-indigo-600);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-family: 'Outfit';
        }
        .icon-btn-round {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border-subtle);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: 0.2s;
        }
        .icon-btn-round:hover {
          color: var(--p-indigo-600);
          border-color: var(--p-indigo-600);
          transform: translateX(3px);
        }
        .badge-modern.success {
          background: var(--p-indigo-50);
          color: var(--p-indigo-600);
        }
        .bento-card.kpi-card {
          padding: 30px;
          border: 1px solid var(--border-subtle);
        }
      `}</style>
    </motion.div>
  );
};

export default AttendanceDashboard;