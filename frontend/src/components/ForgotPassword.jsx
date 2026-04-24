import API_BASE_URL from "../apiConfig";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaKey, FaEnvelope, FaLock, FaArrowRight, FaShieldAlt } from "react-icons/fa";
import "./Login.css";

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [key, setKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/verify-reset-key`, { key });
      setStep(2);
      setLoading(false);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid or expired key");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { email, key, newPassword });
      alert("Password reset successful!");
      navigate("/cashier-login");
    } catch (err) {
      alert(err.response?.data?.message || "Password reset failed");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper bg-premium">
      <div className="login-bg-overlay"></div>

      <div className="login-glass-card">
        <h2 className="login-card-title">Security Access</h2>
        <span className="login-card-subtitle">
          {step === 1 ? "Verify Identity" : "Create New Password"}
        </span>

        {step === 1 && (
          <form onSubmit={handleVerifyKey}>
            <div className="login-input-group">
              <label htmlFor="key">Reset Key (from Admin)</label>
              <div className="login-input-wrapper">
                <FaKey className="login-input-icon" />
                <input
                  type="text"
                  className="login-input-premium"
                  id="key"
                  placeholder="Enter your security key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              className="login-btn-premium btn-cashier-accent"
              disabled={loading}
            >
              {loading ? "Verifying..." : <>Verify Key <FaShieldAlt /></>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="login-input-group">
              <label htmlFor="email">Email Address</label>
              <div className="login-input-wrapper">
                <FaEnvelope className="login-input-icon" />
                <input
                  type="email"
                  className="login-input-premium"
                  id="email"
                  placeholder="Confirm your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="login-input-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="login-input-wrapper">
                <FaLock className="login-input-icon" />
                <input
                  type="password"
                  className="login-input-premium"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-btn-premium btn-cashier-accent"
              disabled={loading}
            >
              {loading ? "Updating..." : <>Reset Password <FaArrowRight /></>}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>
            <Link to="/" className="premium-link">
              Exit to Main Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
