// src/components/AdminLogin.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUserShield, FaKey, FaChevronRight } from "react-icons/fa";
import { AuthContext } from "../context/auth-context";
import API_BASE_URL from "../apiConfig";
import "./Login.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      const data = res.data;

      if (data.role !== "admin") {
        alert("Unauthorized access. This portal is for Administrators only.");
        setLoading(false);
        return;
      }

      login(data);
      navigate("/admin");
    } catch (err) {
      alert("Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-luxury">
      <div className="auth-split-left">
        <div className="auth-card-premium">
          <h2 className="auth-title-premium">Administrator</h2>
          <p className="auth-subtitle-premium">Secure Access Terminal</p>

          <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
            <div className="auth-input-group">
              <label>System Identity</label>
              <input
                type="email"
                className="auth-input-premium"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label>Access Key</label>
              <input
                type="password"
                className="auth-input-premium"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-btn-primary mt-3" disabled={loading} style={{ background: '#b45309' }}>
              {loading ? "AUTHORIZING..." : "AUTHORIZE ACCESS"}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/" className="auth-link-gold small">RETURN TO COMMAND CENTER</Link>
          </div>
        </div>
      </div>

      <div className="auth-split-right">
          <div className="text-center animate-in">
              <div className="display-4 fw-900 text-white opacity-40">SECURE</div>
              <div className="h6 text-white tracking-widest mt-2">ENCRYPTED PORTAL</div>
          </div>
      </div>
    </div>
  );
};

export default AdminLogin;