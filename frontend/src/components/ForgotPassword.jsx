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
    <div className="auth-page-luxury">
      <div className="auth-split-left">
        <div className="auth-card-premium" style={{ maxWidth: '480px' }}>
          <h2 className="auth-title-premium">Security Portal</h2>
          <p className="auth-subtitle-premium">
            {step === 1 ? "IDENTITY VERIFICATION" : "PASSWORD RESTORATION"}
          </p>

          {step === 1 && (
            <form onSubmit={handleVerifyKey} className="d-flex flex-column gap-3">
              <div className="auth-input-group">
                <label>Security Reset Key</label>
                <input
                  type="text"
                  className="auth-input-premium"
                  placeholder="Enter Key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="auth-btn-primary mt-2" disabled={loading}>
                {loading ? "VERIFYING..." : "VERIFY KEY"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="d-flex flex-column gap-3">
              <div className="auth-input-group">
                <label>Confirmed Email</label>
                <input
                  type="email"
                  className="auth-input-premium"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="auth-input-group">
                <label>New Security Passphrase</label>
                <input
                  type="password"
                  className="auth-input-premium"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="auth-btn-primary mt-2" disabled={loading}>
                {loading ? "UPDATING..." : "RESET PASSWORD"}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <Link to="/" className="auth-link-gold small">EXIT TO MAIN PORTAL</Link>
          </div>
        </div>
      </div>

      <div className="auth-split-right">
          <div className="position-relative z-10 text-center animate-in">
              <div className="branding-wrapper">
                  <h1 className="luxury-text-royal">ROYAL</h1>
                  <div className="luxury-divider"></div>
                  <h2 className="luxury-text-orient">RECOVERY</h2>
                  <p className="luxury-est">SECURITY & ACCESS CONTROL</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ResetPassword;
