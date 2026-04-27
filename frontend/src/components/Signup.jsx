import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";
import API_BASE_URL from "../apiConfig";
import "../styles/PremiumUI.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get("role") || "cashier";

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        name,
        email,
        password,
        role
      });
      navigate(`/${role}-login`);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="immersive-login-root">
      {/* Visual Side */}
      <div className="login-side-visual d-none d-lg-flex" style={{ background: '#0f172a' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="visual-content-box"
        >
          <div className="brand-badge-indigo mb-4" style={{ background: 'var(--p-indigo-600)' }}>ENROLLMENT</div>
          <h1 className="giant-title mb-4" style={{ fontSize: '5rem' }}>JOIN THE<br/>ORIENT</h1>
          <p className="vision-text-modern mx-auto" style={{ maxWidth: '460px' }}>
            Start your journey with the world's most advanced restaurant management system. 
            Precision, elegance, and performance.
          </p>
        </motion.div>
        
        <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="position-absolute"
            style={{ top: '20%', right: '15%', width: '300px', height: '300px', background: 'var(--p-indigo-600)', filter: 'blur(130px)' }}
          />
        </div>
      </div>

      {/* Form Side */}
      <div className="login-side-form">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ultra-glass-card"
        >
          <div className="floating-icon-box">
            <Sparkles size={32} />
          </div>
          
          <div className="text-center mb-5">
            <h2 className="text-hero" style={{ fontSize: '2rem' }}>Create Account</h2>
            <p className="text-subtitle mt-2">{role.charAt(0).toUpperCase() + role.slice(1)} Registration</p>
          </div>

          <form onSubmit={handleSignup}>
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
              <label>Full Nomenclature</label>
              <div className="position-relative">
                <User className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                <input 
                  type="text" 
                  className="input-premium ps-5" 
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group-premium">
              <label>Professional Email</label>
              <div className="position-relative">
                <Mail className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                <input 
                  type="email" 
                  className="input-premium ps-5" 
                  placeholder="john@royalorient.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group-premium">
              <label>Security Password</label>
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
                  <span>CREATING ACCOUNT...</span>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <span>FINALIZE ENROLLMENT</span>
                  <ArrowRight size={20} />
                </div>
              )}
            </button>
          </form>

          <div className="text-center mt-5">
            <Link to={`/${role}-login`} className="link-hover-indigo small fw-800">
               ALREADY HAVE AN ACCOUNT? SIGN IN
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;