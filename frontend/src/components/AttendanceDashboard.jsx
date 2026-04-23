import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserCheck, FaClock, FaCalendarDay, FaChartPie, FaFilter, FaIdCard, FaHistory } from "react-icons/fa";
import "../styles/PremiumUI.css";

const AttendanceDashboard = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMonthlySummary();
  }, [month, year]);

  const fetchMonthlySummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/admin/attendance/monthly-summary", {
        params: { month, year },
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(res.data || []);
    } catch (err) {
      toast.error("Failed to sync attendance logs");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalHours = summary.reduce((sum, emp) => sum + parseFloat(emp.totalHours || 0), 0);
    const totalOt = summary.reduce((sum, emp) => sum + parseFloat(emp.otHours || 0), 0);
    const totalDays = summary.reduce((sum, emp) => sum + parseInt(emp.totalDays || 0), 0);
    return { employees: summary.length, totalHours, totalOt, totalDays };
  }, [summary]);

  return (
    <div className="attendance-container animate-fade-in">
      <ToastContainer theme="dark" />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title mb-1">Personnel Attendance</h1>
          <p className="premium-subtitle mb-0">Monitor staff working hours and shift compliance</p>
        </div>
        <div className="d-flex gap-3 orient-card p-2">
            <select className="premium-input py-1 px-3 small border-0 bg-transparent text-white" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1} className="bg-dark">{new Date(0, i).toLocaleString('default', {month: 'long'})}</option>)}
            </select>
            <select className="premium-input py-1 px-3 small border-0 bg-transparent text-white" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y} className="bg-dark">{y}</option>)}
            </select>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
            <div className="orient-card orient-stat-card py-3">
                <div className="orient-stat-icon bg-gold-glow"><FaUserCheck className="text-gold" /></div>
                <div>
                    <div className="orient-stat-label">Active Staff</div>
                    <div className="orient-stat-value text-white">{stats.employees}</div>
                </div>
            </div>
        </div>
        <div className="col-md-3">
            <div className="orient-card orient-stat-card py-3">
                <div className="orient-stat-icon bg-gold-glow"><FaClock className="text-gold" /></div>
                <div>
                    <div className="orient-stat-label">Total Hours</div>
                    <div className="orient-stat-value text-white">{stats.totalHours.toFixed(1)}</div>
                </div>
            </div>
        </div>
        <div className="col-md-3">
            <div className="orient-card orient-stat-card py-3">
                <div className="orient-stat-icon bg-gold-glow"><FaChartPie className="text-gold" /></div>
                <div>
                    <div className="orient-stat-label">Overtime Log</div>
                    <div className="orient-stat-value text-white">{stats.totalOt.toFixed(1)}</div>
                </div>
            </div>
        </div>
        <div className="col-md-3">
            <div className="orient-card orient-stat-card py-3">
                <div className="orient-stat-icon bg-gold-glow"><FaCalendarDay className="text-gold" /></div>
                <div>
                    <div className="orient-stat-label">Work Days</div>
                    <div className="orient-stat-value text-white">{stats.totalDays}</div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="orient-card p-0 overflow-hidden">
        <div className="p-4 border-bottom border-white-05 d-flex justify-content-between align-items-center">
            <h5 className="text-white mb-0"><FaHistory className="me-2 text-gold" /> Monthly Compliance Report</h5>
        </div>
        <div className="premium-table-container">
            <table className="premium-table">
                <thead>
                    <tr>
                        <th>Employee Identity</th>
                        <th>Deployment Range</th>
                        <th>Days Active</th>
                        <th>Normal Hrs</th>
                        <th>Overtime</th>
                        <th className="text-center">Shift Status</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-gold"></div></td></tr>
                    ) : summary.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-5 text-muted">No attendance logs found for this period.</td></tr>
                    ) : summary.map((emp, idx) => {
                        const expected = (parseInt(emp.totalDays) || 0) * 8;
                        const actual = parseFloat(emp.totalHours) || 0;
                        const isOt = actual > expected;
                        return (
                            <tr key={idx}>
                                <td>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-white-05 p-2 rounded-circle"><FaIdCard className="text-gold" /></div>
                                        <div className="text-white fw-bold">{emp.name}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="small text-white opacity-70">
                                        {emp.firstPunch !== '-' ? new Date(emp.firstPunch).toLocaleDateString() : 'N/A'} - 
                                        {emp.lastPunch !== '-' ? new Date(emp.lastPunch).toLocaleDateString() : 'N/A'}
                                    </div>
                                </td>
                                <td><div className="text-white small">{emp.totalDays} Days</div></td>
                                <td><div className="text-white small">{actual.toFixed(1)} hrs</div></td>
                                <td><div className="text-gold fw-bold">{parseFloat(emp.otHours || 0).toFixed(1)} hrs</div></td>
                                <td className="text-center">
                                    <div className={`badge-premium ${isOt ? 'badge-primary' : 'badge-success'}`}>
                                        {isOt ? 'Extended Shift' : 'Regular Shift'}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default AttendanceDashboard;