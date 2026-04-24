// src/components/KitchenLogin.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUtensils, FaLock, FaArrowRight } from "react-icons/fa";
import { AuthContext } from "../context/auth-context";
import API_BASE_URL from "../apiConfig";
import "./Login.css";

const KitchenLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      const data = res.data;

      if (data.role !== "kitchen") {
        alert("Unauthorized access. This portal is for Kitchen Staff only.");
        setLoading(false);
        return;
      }

      login(data);
      navigate("/kitchen");
    } catch (err) {
      alert("Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-luxury">
      <div className="auth-split-left">
        <div className="auth-card-premium">
          <h2 className="auth-title-premium">Kitchen Ops</h2>
          <p className="auth-subtitle-premium">Back-of-House Management</p>

          <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
            <div className="auth-input-group">
              <label>Staff Identity</label>
              <input
                type="email"
                className="auth-input-premium"
                placeholder="Staff Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label>Station Key</label>
              <input
                type="password"
                className="auth-input-premium"
                placeholder="Security Pin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-btn-primary mt-3" disabled={loading} style={{ background: '#334155' }}>
              {loading ? "VERIFYING..." : "ENTER KITCHEN"}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/" className="auth-link-gold small">Return to Site</Link>
          </div>
        </div>
      </div>

      <div className="auth-split-right">
          <div className="text-center animate-in">
              <div className="display-4 fw-900 text-white opacity-40">KITCHEN</div>
              <div className="h6 text-white tracking-widest mt-2">OPERATIONAL ACCESS</div>
          </div>
      </div>
    </div>
  );
};

export default KitchenLogin;