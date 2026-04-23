import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaMoneyCheckAlt } from "react-icons/fa";

const SalaryPage = () => {
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [formData, setFormData] = useState({
    employee: null,
    basicSalary: "",
    otHours: 0,
    otRate: 0
  });

  useEffect(() => {
    fetchEmployees();
    fetchSalaries();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/employees",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEmployees(res.data);
    } catch (err) {
      toast.error("Failed to load employees");
    }
  };

  const fetchSalaries = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/salaries",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSalaries(res.data);
    } catch (err) {
      console.error("Failed to load salaries:", err.message);
      toast.error("Failed to load salaries");
    }
  };

  const handleEmployeeChange = (selectedOption) => {
    if (!selectedOption) {
      setFormData({
        employee: null,
        basicSalary: "",
        otHours: 0,
        otRate: 0
      });
      return;
    }

    setFormData({
      ...formData,
      employee: selectedOption,
      basicSalary: selectedOption.basicSalary || 0,
      otHours: 0,
      otRate: selectedOption.otHourRate || 0
    });
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee || !formData.basicSalary) {
      toast.warning("Please select employee and enter basic salary.");
      return;
    }

    const payload = {
      employee: formData.employee.value,
      basicSalary: parseFloat(formData.basicSalary),
      otHours: parseInt(formData.otHours || 0),
      otRate: parseFloat(formData.otRate || 0)
    };

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/salary/add",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data && res.data._id) {
        const employeeData = employees.find((e) => e._id === res.data.employee);

        setSalaries([
          {
            ...res.data,
            employee: employeeData
          },
          ...salaries
        ]);

        setFormData({
          employee: null,
          basicSalary: "",
          otHours: 0,
          otRate: 0
        });

        toast.success("Salary recorded successfully!");
      } else {
        toast.error("Server returned no data");
      }
    } catch (err) {
      console.error("Failed to record salary:", err.response?.data || err.message);
      toast.error("Failed to record salary");
    }
  };

  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.name} (${emp.role})`,
    basicSalary: emp.basicSalary,
    otHourRate: emp.otHourRate
  }));

  const symbol = localStorage.getItem("currencySymbol") || "$";

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "60px",
      borderRadius: "18px",
      background: "#ffffff",
      border: state.isFocused
        ? "1px solid rgba(59, 130, 246, 0.55)"
        : "1px solid rgba(15, 23, 42, 0.12)",
      boxShadow: state.isFocused
        ? "0 0 0 4px rgba(59, 130, 246, 0.12)"
        : "0 1px 2px rgba(15, 23, 42, 0.04)",
      "&:hover": {
        border: "1px solid rgba(59, 130, 246, 0.45)"
      }
    }),
    menu: (base) => ({
      ...base,
      background: "#ffffff",
      border: "1px solid rgba(15, 23, 42, 0.12)",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 12px 40px rgba(15, 23, 42, 0.12)",
      zIndex: 20
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (base) => ({
      ...base,
      padding: "8px"
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: "10px",
      background: state.isSelected
        ? "#2563eb"
        : state.isFocused
          ? "rgba(59, 130, 246, 0.12)"
          : "transparent",
      color: state.isSelected ? "#ffffff" : "#0f172a",
      cursor: "pointer"
    }),
    singleValue: (base) => ({
      ...base,
      color: "#0f172a"
    }),
    input: (base) => ({
      ...base,
      color: "#0f172a"
    }),
    placeholder: (base) => ({
      ...base,
      color: "rgba(15, 23, 42, 0.45)"
    }),
    indicatorSeparator: () => ({
      display: "none"
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#64748b"
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#64748b"
    })
  };

  return (
    <div className="salary-page">
      <div className="page-glow glow-1"></div>
      <div className="page-glow glow-2"></div>
      <div className="page-grid"></div>

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Payroll Management</span>
          <h1 className="hero-title">Record Employee Salary</h1>
          <p className="hero-subtitle">
            Manage salary entries, overtime values, and payroll records in a clean,
            modern admin interface.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface form-card">
            <div className="section-header">
              <h2 className="section-title">Add Salary Record</h2>
              <p className="section-subtitle">
                Select an employee and enter salary details.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field-block">
                  <label className="form-label">Select Employee</label>
                  <Select
                    options={employeeOptions}
                    onChange={handleEmployeeChange}
                    value={formData.employee}
                    placeholder="Search or select employee..."
                    isClearable
                    menuPortalTarget={document.body}
                    styles={selectStyles}
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Basic Salary</label>
                  <div className="input-wrap">
                    <span className="input-pill">{symbol}</span>
                    <input
                      type="number"
                      name="basicSalary"
                      value={formData.basicSalary}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="form-control custom-input with-prefix"
                      required
                    />
                  </div>
                </div>

                <div className="field-block">
                  <label className="form-label">OT Hours</label>
                  <input
                    type="number"
                    name="otHours"
                    value={formData.otHours}
                    onChange={handleChange}
                    min="0"
                    className="form-control custom-input"
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">OT Rate ({symbol})</label>
                  <div className="input-wrap">
                    <span className="input-pill">{symbol}</span>
                    <input
                      type="number"
                      name="otRate"
                      value={formData.otRate}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="form-control custom-input with-prefix"
                    />
                  </div>
                </div>

                <div className="field-block field-full salary-submit-actions">
                  <button
                    type="submit"
                    className="submit-btn salary-submit-btn d-inline-flex align-items-center justify-content-center"
                  >
                    <FaMoneyCheckAlt className="me-2 salary-submit-icon" aria-hidden />
                    Record Salary
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="glass-card shared-card-surface table-card">
            <div className="section-header">
              <h2 className="section-title">Salary Records</h2>
              <p className="section-subtitle">
                View all recorded employee salary entries.
              </p>
            </div>

            <div className="table-wrap">
              <table className="salary-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Basic</th>
                    <th>OT Hours</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-row">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    salaries.map((s, idx) => (
                      <tr key={s._id || idx}>
                        <td>{new Date(s.date).toLocaleDateString()}</td>
                        <td>
                          {s.employee?.name || "Unknown"}{" "}
                          {s.employee?.role ? `(${s.employee.role})` : ""}
                        </td>
                        <td>
                          {symbol}
                          {Number(s.basicSalary || 0).toFixed(2)}
                        </td>
                        <td>{s.otHours}</td>
                        <td className="total-cell">
                          {symbol}
                          {Number(s.total || 0).toFixed(2)}
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
        .salary-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          // background: linear-gradient(160deg, #f6faf9 0%, #f1f5ff 42%, #eef8f6 100%);
          padding: 28px 24px 34px;
        }

        // .salary-page .page-grid {
        //   position: absolute;
        //   inset: 0;
        //   background-image:
        //     linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px),
        //     linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px);
        //   background-size: 44px 44px;
        //   pointer-events: none;
        //   mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.12));
        // }

        .salary-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.35;
          pointer-events: none;
        }

        .salary-page .glow-1 {
          width: 300px;
          height: 300px;
          top: -80px;
          left: -60px;
          background: rgba(59, 130, 246, 0.16);
        }

        .salary-page .glow-2 {
          width: 340px;
          height: 340px;
          right: -80px;
          bottom: -80px;
          background: hsla(160, 42%, 42%, 0.18);
        }

        .salary-page .page-shell {
          width: calc(100% - 80px);
          max-width: none;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .salary-page .shared-card-surface {
          border-radius: 30px;
          border: 1px solid rgba(15, 23, 42, 0.08) !important;
          background: #ffffff !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow:
            0 18px 50px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
        }

        .salary-page .hero-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .salary-page .hero-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #1e40af;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.22);
        }

        .salary-page .hero-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .salary-page .hero-subtitle {
          margin: 0;
          color: rgba(15, 23, 42, 0.62);
          font-size: 15px;
          line-height: 1.7;
          max-width: 760px;
        }

        .salary-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .salary-page .glass-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .salary-page .form-card,
        .salary-page .table-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .salary-page .section-header {
          margin-bottom: 22px;
        }

        .salary-page .section-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .salary-page .section-subtitle {
          margin: 0;
          color: rgba(15, 23, 42, 0.6);
          font-size: 14px;
          line-height: 1.7;
        }

        .salary-page .form-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .salary-page .field-full {
          grid-column: 1 / -1;
        }

        .salary-page .field-block {
          min-width: 0;
        }

        .salary-page .form-label {
          display: block;
          margin-bottom: 10px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 700;
        }

        .salary-page .input-wrap {
          position: relative;
        }

        .salary-page .input-pill {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          z-index: 2;
          box-shadow: 0 12px 20px rgba(37, 99, 235, 0.24);
        }

        .salary-page .with-prefix {
          padding-left: 58px !important;
        }

        .salary-page .custom-input {
          width: 100%;
          height: 60px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #0f172a;
          color-scheme: light;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          font-size: 15px;
          padding: 0 16px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .salary-page .custom-input:focus {
          background: #ffffff;
          color: #0f172a;
          border-color: rgba(59, 130, 246, 0.55);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
        }

        .salary-page .custom-input::placeholder {
          color: rgba(15, 23, 42, 0.42);
        }

        .salary-page .submit-btn {
          border: none;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          height: 60px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 16px 32px rgba(34, 197, 94, 0.22);
        }

        .salary-page .salary-submit-actions {
          display: flex;
          justify-content: center;
          padding-top: 6px;
        }

        .salary-page .submit-btn.salary-submit-btn {
          width: auto !important;
          min-width: min(100%, 280px);
          min-height: 58px;
          height: auto;
          padding: 16px 120px;
          font-size: 1.05rem;
          letter-spacing: 0.03em;
          border-radius: 18px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            0 3px 0 rgba(5, 46, 22, 0.14),
            0 14px 32px rgba(22, 163, 74, 0.32);
        }

        .salary-page .salary-submit-icon {
          font-size: 1.15rem;
        }

        .salary-page .salary-submit-btn:hover:not(:disabled) {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            0 4px 0 rgba(5, 46, 22, 0.12),
            0 18px 42px rgba(22, 163, 74, 0.38);
        }

        .salary-page .submit-btn:hover {
          transform: translateY(-2px);
        }

        .salary-page .table-wrap {
          overflow-x: auto;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
        }

        .salary-page .salary-table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
        }

        .salary-page .salary-table thead tr {
          background: #f1f5f9;
        }

        .salary-page .salary-table th {
          padding: 18px 20px;
          text-align: left;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .salary-page .salary-table td {
          padding: 18px 20px;
          color: #334155;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: middle;
          background: #ffffff;
        }

        .salary-page .salary-table tbody tr:hover td {
          background: #f8fafc;
        }

        .salary-page .total-cell {
          color: #1d4ed8 !important;
          font-weight: 800;
        }

        .salary-page .empty-row {
          text-align: center;
          color: #94a3b8 !important;
          padding: 34px !important;
          background: #ffffff !important;
        }

        @media (max-width: 768px) {
          .salary-page .page-shell {
            width: calc(100% - 24px);
          }

          .salary-page {
            padding: 18px 12px;
          }

          .salary-page .hero-card,
          .salary-page .glass-card {
            padding: 20px;
          }

          .salary-page .form-grid {
            grid-template-columns: 1fr;
          }

          .salary-page .field-full {
            grid-column: auto;
          }

          .salary-page .section-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default SalaryPage;