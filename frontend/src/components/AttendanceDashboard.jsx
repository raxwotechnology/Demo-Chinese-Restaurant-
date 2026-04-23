import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/admin/attendance/monthly-summary",
        {
          params: { month, year },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSummary(res.data);
    } catch (err) {
      console.error("Failed to load summary:", err.response?.data || err.message);
      toast.error("Failed to load attendance summary");
      setSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  const stats = useMemo(() => {
    const employees = summary.length;
    const totalHours = summary.reduce(
      (sum, emp) => sum + parseFloat(emp.totalHours || 0),
      0
    );
    const totalOt = summary.reduce(
      (sum, emp) => sum + parseFloat(emp.otHours || 0),
      0
    );
    const totalDays = summary.reduce(
      (sum, emp) => sum + parseInt(emp.totalDays || 0),
      0
    );

    return {
      employees,
      totalHours,
      totalOt,
      totalDays
    };
  }, [summary]);

  return (
    <div className="attendance-dashboard-page">
      <div className="bg-orb orb-one"></div>
      <div className="bg-orb orb-two"></div>
      <div className="bg-grid"></div>

      <div className="dashboard-shell">
        <div className="hero-layout">
          <div className="hero-panel">
            <span className="hero-chip">Attendance Overview</span>
            <h1 className="hero-heading">Monthly Attendance Dashboard</h1>
            <p className="hero-text">
              Monitor employee attendance, total worked hours, overtime, and
              performance status with a refined dashboard experience.
            </p>
          </div>

          <div className="hero-side-card">
            <div className="hero-side-label">Selected Period</div>
            <div className="hero-side-value">
              {new Date(year, month - 1).toLocaleString("default", {
                month: "long"
              })}{" "}
              {year}
            </div>
            <div className="hero-side-subtext">
              Monthly attendance reporting view
            </div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-title">Employees</div>
            <div className="stat-value">{stats.employees}</div>
            <div className="stat-caption">Attendance records in this month</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Total Hours</div>
            <div className="stat-value">{stats.totalHours.toFixed(2)}</div>
            <div className="stat-caption">Combined working hours</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">OT Hours</div>
            <div className="stat-value">{stats.totalOt.toFixed(2)}</div>
            <div className="stat-caption">Combined overtime hours</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Work Days</div>
            <div className="stat-value">{stats.totalDays}</div>
            <div className="stat-caption">Total recorded attendance days</div>
          </div>
        </div>

        <div className="filter-panel">
          <div className="panel-head">
            <h2 className="panel-title">Filters</h2>
            <p className="panel-subtitle">
              Choose the reporting month and year.
            </p>
          </div>

          <div className="filter-controls">
            <div className="field-group">
              <label className="field-label">Month</label>
              <select
                value={month}
                onChange={handleMonthChange}
                className="field-input"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2025, i).toLocaleString("default", {
                      month: "long"
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Year</label>
              <input
                type="number"
                value={year}
                onChange={handleYearChange}
                className="field-input"
                min="2020"
                max="2030"
              />
            </div>
          </div>
        </div>

        <div className="table-panel">
          <div className="panel-head">
            <h2 className="panel-title">Attendance Summary</h2>
            <p className="panel-subtitle">
              Monthly employee attendance and hour analysis.
            </p>
          </div>

          {loading ? (
            <div className="empty-state">Loading attendance summary...</div>
          ) : summary.length === 0 ? (
            <div className="empty-state">No attendance records found.</div>
          ) : (
            <div className="table-holder">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>First Day</th>
                    <th>Last Day</th>
                    <th>Total Days</th>
                    <th>Total Hours</th>
                    <th>OT Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((emp, idx) => {
                    const totalHours = parseFloat(emp.totalHours || 0);
                    const totalDays = parseInt(emp.totalDays || 0);
                    const otHours = parseFloat(emp.otHours || 0);
                    const expectedHours = totalDays * 8;

                    let status = "On Time";
                    if (totalHours > expectedHours) status = "Overtime";
                    else if (totalHours < expectedHours) status = "Undertime";

                    return (
                      <tr key={idx}>
                        <td className="employee-name">{emp.name}</td>
                        <td>
                          {emp.firstPunch !== "-"
                            ? new Date(emp.firstPunch).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>
                          {emp.lastPunch !== "-"
                            ? new Date(emp.lastPunch).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>{totalDays}</td>
                        <td>{totalHours.toFixed(2)}</td>
                        <td>{otHours.toFixed(2)}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              status === "Overtime"
                                ? "pill-success"
                                : status === "Undertime"
                                ? "pill-warning"
                                : "pill-neutral"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />

      <style>{`
        .attendance-dashboard-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
          padding: 28px 24px 36px;
          color: #1e293b;
        }

        .attendance-dashboard-page .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.03));
        }

        .attendance-dashboard-page .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.45;
        }

        .attendance-dashboard-page .orb-one {
          width: 280px;
          height: 280px;
          top: -60px;
          left: -40px;
          background: hsla(160, 42%, 48%, 0.2);
        }

        .attendance-dashboard-page .orb-two {
          width: 320px;
          height: 320px;
          right: -60px;
          bottom: -80px;
          background: hsla(200, 55%, 58%, 0.14);
        }

        .attendance-dashboard-page .dashboard-shell {
          position: relative;
          z-index: 1;
          width: calc(100% - 70px);
          margin: 0 auto;
        }

        .attendance-dashboard-page .hero-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          gap: 24px;
          margin-bottom: 24px;
        }

        .attendance-dashboard-page .hero-panel,
        .attendance-dashboard-page .hero-side-card,
        .attendance-dashboard-page .stat-card,
        .attendance-dashboard-page .filter-panel,
        .attendance-dashboard-page .table-panel {
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.96) 100%
          );
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow:
            0 20px 50px rgba(15, 23, 42, 0.07),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
        }

        .attendance-dashboard-page .hero-panel {
          border-radius: 30px;
          padding: 34px;
        }

        .attendance-dashboard-page .hero-side-card {
          border-radius: 30px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .attendance-dashboard-page .hero-chip {
          display: inline-flex;
          width: fit-content;
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

        .attendance-dashboard-page .hero-heading {
          margin: 16px 0 10px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 46px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .attendance-dashboard-page .hero-text {
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.8;
          max-width: 780px;
        }

        .attendance-dashboard-page .hero-side-label {
          color: hsl(160, 42%, 32%);
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        .attendance-dashboard-page .hero-side-value {
          color: #0f172a;
          font-size: 32px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 8px;
        }

        .attendance-dashboard-page .hero-side-subtext {
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        .attendance-dashboard-page .stats-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .attendance-dashboard-page .stat-card {
          border-radius: 24px;
          padding: 24px;
        }

        .attendance-dashboard-page .stat-title {
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .attendance-dashboard-page .stat-value {
          color: #0f172a;
          font-size: 32px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 10px;
        }

        .attendance-dashboard-page .stat-caption {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.5;
        }

        .attendance-dashboard-page .filter-panel,
        .attendance-dashboard-page .table-panel {
          border-radius: 30px;
          padding: 30px;
          margin-bottom: 24px;
        }

        .attendance-dashboard-page .panel-head {
          margin-bottom: 22px;
        }

        .attendance-dashboard-page .panel-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .attendance-dashboard-page .panel-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
        }

        .attendance-dashboard-page .filter-controls {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
        }

        .attendance-dashboard-page .field-group {
          width: 280px;
          max-width: 100%;
        }

        .attendance-dashboard-page .field-label {
          display: block;
          margin-bottom: 10px;
          color: #334155;
          font-size: 14px;
          font-weight: 700;
        }

        .attendance-dashboard-page .field-input {
          width: 100%;
          height: 58px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #0f172a;
          padding: 0 16px;
          font-size: 15px;
          transition: all 0.25s ease;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
        }

        .attendance-dashboard-page .field-input option {
          color: #0f172a;
        }

        .attendance-dashboard-page .field-input:focus {
          outline: none;
          border-color: hsla(160, 42%, 40%, 0.55);
          background: #ffffff;
          box-shadow: 0 0 0 4px hsla(160, 40%, 42%, 0.14) !important;
        }

        .attendance-dashboard-page .table-holder {
          overflow-x: auto;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #f8fafc;
        }

        .attendance-dashboard-page .attendance-table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
          background: #ffffff;
        }

        .attendance-dashboard-page .attendance-table thead tr {
          background: #f1f5f9;
        }

        .attendance-dashboard-page .attendance-table th {
          padding: 18px 20px;
          text-align: left;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .attendance-dashboard-page .attendance-table td {
          padding: 18px 20px;
          color: #334155;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: middle;
          background: #ffffff;
        }

        .attendance-dashboard-page .attendance-table tbody tr:hover td {
          background: #f8fafc;
        }

        .attendance-dashboard-page .employee-name {
          font-weight: 700;
          color: #0f172a;
        }

        .attendance-dashboard-page .status-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 92px;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .attendance-dashboard-page .pill-success {
          background: hsla(142, 71%, 36%, 0.12);
          color: #166534;
          border: 1px solid hsla(142, 65%, 32%, 0.22);
        }

        .attendance-dashboard-page .pill-warning {
          background: hsla(38, 92%, 45%, 0.12);
          color: #a16207;
          border: 1px solid hsla(38, 85%, 40%, 0.2);
        }

        .attendance-dashboard-page .pill-neutral {
          background: rgba(100, 116, 139, 0.12);
          color: #475569;
          border: 1px solid rgba(71, 85, 105, 0.2);
        }

        .attendance-dashboard-page .empty-state {
          border-radius: 18px;
          border: 1px dashed rgba(15, 23, 42, 0.12);
          background: #f8fafc;
          padding: 26px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        @media (max-width: 1200px) {
          .attendance-dashboard-page .hero-layout {
            grid-template-columns: 1fr;
          }

          .attendance-dashboard-page .stats-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .attendance-dashboard-page {
            padding: 18px 12px 24px;
          }

          .attendance-dashboard-page .dashboard-shell {
            width: calc(100% - 12px);
          }

          .attendance-dashboard-page .hero-panel,
          .attendance-dashboard-page .hero-side-card,
          .attendance-dashboard-page .stat-card,
          .attendance-dashboard-page .filter-panel,
          .attendance-dashboard-page .table-panel {
            padding: 20px;
            border-radius: 22px;
          }

          .attendance-dashboard-page .stats-row {
            grid-template-columns: 1fr;
          }

          .attendance-dashboard-page .filter-controls {
            flex-direction: column;
          }

          .attendance-dashboard-page .field-group {
            width: 100%;
          }

          .attendance-dashboard-page .panel-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default AttendanceDashboard;