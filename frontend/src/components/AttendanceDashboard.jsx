import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaCalendarCheck, FaClock, FaUserClock, FaHistory, FaFilter, FaPrint, FaUserTie, FaChevronRight, FaDatabase
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
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
      const res = await axios.get(`https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/attendance/summary?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data.attendance || []);
      setStats(res.data.stats || { employees: 0, totalHours: 0, totalOt: 0, totalDays: 0 });
    } catch (err) {
      toast.error("Cloud attendance sync failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <div className="text-center">
            <div className="spinner-border text-primary mb-3"></div>
            <div className="fw-900 text-main">Processing Time Logs...</div>
        </div>
    </div>
  );

  return (
    <div className="attendance-layout animate-in p-2">
      <ToastContainer theme="light" />
      
      {/* Executive Header */}
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title">Attendance Intelligence</h1>
          <p className="premium-subtitle">Workforce monitoring and compliance audit</p>
        </div>
        
        <div className="orient-card p-2 d-flex align-items-center gap-3 bg-white border-0 shadow-sm">
            <div className="bg-blue-glow p-2 rounded-circle"><FaFilter size={14} /></div>
            <div className="d-flex gap-2 align-items-center">
                <select className="premium-input py-1 border-0 bg-app fw-800" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                    ))}
                </select>
                <select className="premium-input py-1 border-0 bg-app fw-800" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="row g-4 mb-5">
        {[
            { label: "Active Personnel", val: stats.employees, icon: FaUserTie, color: "blue", sub: "Month Workforce" },
            { label: "Aggregated Hours", val: stats.totalHours.toFixed(1), icon: FaClock, color: "green", sub: "Operational Time" },
            { label: "Overtime Surplus", val: stats.totalOt.toFixed(1), icon: FaUserClock, color: "gold", sub: "Premium Hours" },
            { label: "Duty Coverage", val: stats.totalDays, icon: FaCalendarCheck, color: "red", sub: "Service Days" }
        ].map((stat, i) => (
            <div className="col-xl-3 col-md-6" key={i}>
                <div className="orient-card stat-widget h-100 border-0 shadow-platinum">
                    <div className={`stat-icon bg-${stat.color}-glow`}><stat.icon size={22} /></div>
                    <div>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{stat.val}</div>
                        <div className="tiny text-muted fw-700 mt-1">{stat.sub}</div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Detail Table */}
      <div className="orient-card p-0 border-0 shadow-platinum bg-white overflow-hidden">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
            <h6 className="mb-0 fw-800 text-main d-flex align-items-center gap-2">
                <FaDatabase className="text-primary" /> Workforce Compliance Registry
            </h6>
            <button className="btn-premium btn-ghost py-1 px-3 fs-tiny rounded-pill" onClick={() => window.print()}>
                <FaPrint size={10} className="me-1" /> Export Logs
            </button>
        </div>
        
        <div className="table-container border-0">
            <table className="premium-table">
                <thead>
                    <tr>
                        <th>Personnel</th>
                        <th>Position</th>
                        <th>Duty Cycle</th>
                        <th>Standard Hrs</th>
                        <th>Premium Hrs</th>
                        <th className="text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {attendance.length > 0 ? attendance.map(emp => {
                        const actual = emp.totalHours - emp.totalOt;
                        return (
                            <tr key={emp._id}>
                                <td>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-app p-2 rounded-circle"><FaUserTie className="text-primary" size={14} /></div>
                                        <div>
                                            <div className="text-main fw-800">{emp.name}</div>
                                            <div className="tiny text-muted">ID: {emp._id.slice(-6).toUpperCase()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="badge badge-blue">Verified Personnel</span></td>
                                <td><div className="text-main fw-700 small">{emp.totalDays} Days</div></td>
                                <td><div className="text-main fw-700 small">{actual.toFixed(1)} hrs</div></td>
                                <td><div className="text-primary fw-900 small">{emp.totalOt.toFixed(1)} hrs</div></td>
                                <td className="text-center">
                                    <button className="btn-premium btn-ghost p-2 rounded-circle"><FaChevronRight size={10} /></button>
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan="6" className="text-center py-5 text-muted opacity-50">
                                <FaHistory size={32} className="mb-2" />
                                <div className="fw-800">No attendance records found for this period</div>
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

export default AttendanceDashboard;