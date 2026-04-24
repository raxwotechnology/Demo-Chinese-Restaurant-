import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner, FaUserPlus } from "react-icons/fa";

const AdminEmployeeRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    address: "",
    phone: "",
    basicSalary: "",
    workingHours: 8,
    otHourRate: "",
    bankAccountNo: "",
    role: "cashier"
  });

  const [generatedId, setGeneratedId] = useState("Loading...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_BASE_URL}/api/auth/employees/next-id`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGeneratedId(res.data.nextId);
      } catch {
        setGeneratedId("EMP-001");
      }
    };

    fetchNextId();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      employeeId: generatedId
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/auth/employee/register`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Employee registered successfully.");
      navigate("/admin/employees");
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to register employee");
    } finally {
      setLoading(false);
    }
  };

  const symbol = localStorage.getItem("currencySymbol") || "$";

  return (
    <div className="employee-register-page">
      <div className="page-glow glow-1" aria-hidden />
      <div className="page-glow glow-2" aria-hidden />
      <div className="page-grid" aria-hidden />

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Team management</span>
          <h1 className="hero-title">Register new employee</h1>
          <p className="hero-subtitle">
            Capture identity, pay, and role details in one place. The next employee ID is reserved
            automatically when you open this form.
          </p>
          <p className="hero-meta">
            Next ID: <strong>{generatedId}</strong>
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface form-card">
            <div className="section-header">
              <h2 className="section-title">Employee details</h2>
              <p className="section-subtitle">
                Required fields are marked. OT rate and bank account are optional.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field-block">
                  <label className="form-label" htmlFor="emp-name">
                    Name *
                  </label>
                  <input
                    id="emp-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="form-control custom-input"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label" htmlFor="emp-nic">
                    NIC *
                  </label>
                  <input
                    id="emp-nic"
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    placeholder="901234567V"
                    className="form-control custom-input"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label" htmlFor="emp-phone">
                    Phone *
                  </label>
                  <input
                    id="emp-phone"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0771234567"
                    className="form-control custom-input"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label" htmlFor="emp-basic">
                    Basic salary *
                  </label>
                  <input
                    id="emp-basic"
                    type="number"
                    name="basicSalary"
                    value={formData.basicSalary}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="e.g., 50000"
                    className="form-control custom-input"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label" htmlFor="emp-role">
                    Role *
                  </label>
                  <select
                    id="emp-role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-select custom-input custom-select"
                    required
                  >
                    <option value="cashier">Cashier</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="waiter">Waiter</option>
                    <option value="cleaner">Cleaner</option>
                  </select>
                </div>

                <div className="field-block">
                  <label className="form-label" htmlFor="emp-hours">
                    Working hours (daily)
                  </label>
                  <input
                    id="emp-hours"
                    type="number"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    min="0"
                    max="24"
                    className="form-control custom-input"
                  />
                </div>

                <div className="field-block">
                  <label className="form-label" htmlFor="emp-ot">
                    OT hour rate ({symbol})
                  </label>
                  <input
                    id="emp-ot"
                    type="number"
                    name="otHourRate"
                    value={formData.otHourRate}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="form-control custom-input"
                  />
                </div>

                <div className="field-block">
                  <label className="form-label" htmlFor="emp-bank">
                    Bank account no (optional)
                  </label>
                  <input
                    id="emp-bank"
                    type="text"
                    name="bankAccountNo"
                    value={formData.bankAccountNo}
                    onChange={handleChange}
                    className="form-control custom-input"
                  />
                </div>

                <div className="field-block field-full">
                  <label className="form-label" htmlFor="emp-address">
                    Address
                  </label>
                  <textarea
                    id="emp-address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="form-control custom-input custom-textarea"
                  />
                </div>

                <div className="field-block field-full employee-register-actions">
                  <button
                    type="submit"
                    className="submit-btn employee-register-submit d-inline-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="employee-register-spin" aria-hidden />
                        Registering…
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="employee-register-submit-icon" aria-hidden />
                        Register employee
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3200} />

      <style>{`
        .employee-register-page {
          min-height: calc(100vh - 88px);
          position: relative;
          overflow-x: hidden;
          color: #0f172a;
          padding: 28px 24px 40px;
        }

        .employee-register-page .page-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
          background-size: 42px 42px;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.02));
        }

        .employee-register-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.4;
          pointer-events: none;
        }

        .employee-register-page .glow-1 {
          width: 300px;
          height: 300px;
          top: -80px;
          left: -60px;
          background: hsla(160, 42%, 48%, 0.2);
        }

        .employee-register-page .glow-2 {
          width: 340px;
          height: 340px;
          right: -80px;
          bottom: -40px;
          background: hsla(200, 55%, 58%, 0.14);
        }

        .employee-register-page .page-shell {
          width: 100%;
          max-width: min(1120px, 100%);
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .employee-register-page .page-shell > .hero-card,
        .employee-register-page .page-shell > .stack-layout,
        .employee-register-page .stack-layout > .glass-card {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .employee-register-page .hero-card.shared-card-surface,
        .employee-register-page .glass-card.shared-card-surface {
          border-radius: 28px !important;
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

        .employee-register-page .hero-card {
          padding: 30px 34px;
          margin-bottom: 22px;
          text-align: left;
        }

        .employee-register-page .hero-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: hsl(160, 55%, 24%);
          background: hsla(160, 40%, 42%, 0.12);
          border: 1px solid hsla(160, 45%, 35%, 0.22);
        }

        .employee-register-page .hero-title {
          margin: 14px 0 8px;
          font-size: clamp(1.5rem, 2.5vw, 2.1rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.12;
          color: #0f172a;
        }

        .employee-register-page .hero-subtitle {
          margin: 0 0 12px;
          max-width: 52rem;
          color: #64748b;
          font-size: 15px;
          line-height: 1.65;
        }

        .employee-register-page .hero-meta {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
        }

        .employee-register-page .hero-meta strong {
          color: #0f172a;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .employee-register-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 18px;
          width: 100%;
        }

        .employee-register-page .form-card {
          padding: 28px 30px 30px;
          text-align: left;
        }

        .employee-register-page .section-header {
          margin-bottom: 22px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.07);
        }

        .employee-register-page .section-title {
          margin: 0 0 8px;
          font-size: clamp(1.25rem, 2vw, 1.65rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.15;
          color: #0f172a;
        }

        .employee-register-page .section-subtitle {
          margin: 0;
          max-width: 40rem;
          color: #64748b;
          font-size: 15px;
          line-height: 1.65;
        }

        .employee-register-page .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .employee-register-page .field-full {
          grid-column: 1 / -1;
        }

        .employee-register-page .field-block {
          min-width: 0;
        }

        .employee-register-page .form-label {
          display: block;
          margin-bottom: 10px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 700;
        }

        .employee-register-page .custom-input,
        .employee-register-page .form-control.custom-input {
          width: 100%;
          min-height: 54px;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.12) !important;
          background: #ffffff !important;
          color: #0f172a !important;
          color-scheme: light;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          font-size: 15px;
          padding: 0 16px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .employee-register-page .custom-textarea {
          min-height: 96px;
          padding: 14px 16px;
          resize: vertical;
        }

        .employee-register-page .custom-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 42px;
        }

        .employee-register-page .custom-input:focus,
        .employee-register-page .form-control.custom-input:focus {
          outline: none;
          border-color: hsla(160, 42%, 40%, 0.55) !important;
          box-shadow: 0 0 0 4px hsla(160, 40%, 42%, 0.14) !important;
        }

        .employee-register-page .custom-input::placeholder,
        .employee-register-page .form-control.custom-input::placeholder {
          color: rgba(15, 23, 42, 0.42);
        }

        .employee-register-page .employee-register-actions {
          display: flex;
          justify-content: center;
          padding-top: 8px;
        }

        .employee-register-page .submit-btn {
          border: none;
          border-radius: 18px;
          font-size: 1.05rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          min-height: 58px;
          padding: 16px 48px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            0 3px 0 rgba(5, 46, 22, 0.14),
            0 14px 32px rgba(22, 163, 74, 0.32);
        }

        .employee-register-page .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.02);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            0 4px 0 rgba(5, 46, 22, 0.12),
            0 18px 42px rgba(22, 163, 74, 0.38);
        }

        .employee-register-page .submit-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
          transform: none;
        }

        .employee-register-page .employee-register-submit-icon {
          font-size: 1.15rem;
        }

        .employee-register-page .employee-register-spin {
          animation: employee-register-spin 0.85s linear infinite;
        }

        @keyframes employee-register-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .employee-register-page {
            padding: 18px 14px 28px;
          }

          .employee-register-page .hero-card,
          .employee-register-page .form-card {
            padding: 22px 18px;
          }

          .employee-register-page .form-grid {
            grid-template-columns: 1fr;
          }

          .employee-register-page .field-full {
            grid-column: auto;
          }

          .employee-register-page .submit-btn {
            width: 100%;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminEmployeeRegister;
