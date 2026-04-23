// src/components/Signup.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaKey } from "react-icons/fa";
import "./Signup.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get("role") || "cashier";

  const requiresKey = ["cashier", "kitchen"].includes(role);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || (requiresKey && !key)) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      await axios.post("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/signup", {
        name,
        email,
        password,
        role,
        ...(requiresKey && { signupKey: key }),
      });

      alert(`${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`);
      navigate(`/${role}-login`);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please check your credentials.");
    }
  };

  return (
    <div className={`signup-wrapper ${role}`}>
      <div className="signup-bg-overlay"></div>

      <div className="signup-glass-card">
        <h2 className="signup-card-title">Sign Up</h2>
        <span className="signup-card-subtitle">{role} registration</span>

        {error && <div className="signup-error-alert">{error}</div>}

        <form onSubmit={handleSignup}>
          <div className="premium-input-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                className="premium-input"
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="premium-input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                className="premium-input"
                id="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="premium-input-group">
            <label htmlFor="password">Security Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                className="premium-input"
                id="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {requiresKey && (
            <div className="premium-input-group">
              <label htmlFor="key">Access Key</label>
              <div className="input-with-icon">
                <FaKey className="input-icon" />
                <input
                  type="text"
                  className="premium-input"
                  id="key"
                  placeholder="Enter staff signup key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`signup-btn-premium ${role === 'cashier' ? 'btn-cashier-accent' : 'btn-kitchen-accent'}`}
          >
            Create {role} Account
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already part of the team?
            <Link to={`/${role}-login`} className="login-link-premium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;