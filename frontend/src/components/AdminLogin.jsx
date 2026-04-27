import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { AuthContext } from "../context/auth-context";
import API_BASE_URL from "../apiConfig";
import "../styles/PremiumUI.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      const data = res.data;

      if (data.role !== "admin") {
        setError("Unauthorized access. This portal is for Administrators only.");
        setLoading(false);
        return;
      }

      login(data);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="immersive-login-root">
      {/* Visual Side */}
      <div className="login-side-visual d-none d-lg-flex">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="visual-content-box"
        >
          <div className="brand-badge-indigo mb-4">EXECUTIVE PORTAL</div>
          <h1 className="giant-title mb-4" style={{ fontSize: '6rem' }}>ROYAL<br/>ADMIN</h1>
          <p className="vision-text-modern mx-auto" style={{ maxWidth: '460px' }}>
            Access the high-precision management suite for Royal Orient. 
            Monitor performance, manage personnel, and optimize global operations.
          </p>
        </motion.div>
        
        {/* Animated background elements */}
        <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="position-absolute"
            style={{ top: '10%', right: '10%', width: '300px', height: '300px', background: 'var(--p-indigo-600)', filter: 'blur(150px)', opacity: 0.2 }}
          />
        </div>
      </div>

      {/* Form Side */}
      <div className="login-side-form">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="ultra-glass-card"
        >
          <div className="floating-icon-box">
            <ShieldCheck size={32} />
          </div>
          
          <div className="text-center mb-5">
            <h2 className="text-hero" style={{ fontSize: '2rem' }}>Secure Login</h2>
            <p className="text-subtitle mt-2">Enter executive credentials</p>
          </div>

          <form onSubmit={handleLogin}>
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="alert alert-danger border-0 rounded-4 mb-4 small fw-700 py-3 text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="input-group-premium">
              <label>Administrator Email</label>
              <div className="position-relative">
                <Mail className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                <input 
                  type="email" 
                  className="input-premium ps-5" 
                  placeholder="admin@royalorient.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group-premium">
              <label>Access Password</label>
              <div className="position-relative">
                <Lock className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                <input 
                  type="password" 
                  className="input-premium ps-5" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-indigo w-100 py-4 mt-4 justify-content-center"
              disabled={loading}
            >
              {loading ? (
                <div className="d-flex align-items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>AUTHORIZING...</span>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <span>AUTHORIZE ACCESS</span>
                  <ArrowRight size={20} />
                </div>
              )}
            </button>
          </form>

          <div className="text-center mt-5">
            <Link to="/" className="link-hover-indigo small fw-800">
               RETURN TO COMMAND CENTER
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;