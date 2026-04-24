// src/components/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaCashRegister, FaFire, FaShieldAlt } from "react-icons/fa";
import LogoImage from "../upload/logo.jpg";
import "./Home.css";

const Home = () => {
  return (
    <div className="auth-page-luxury">
      <div className="auth-split-left">
        <div className="auth-card-premium">
          <div className="auth-logo-box">
             <img src={LogoImage} alt="Royal Orient Logo" />
          </div>
          
          <h1 className="auth-title-premium">Royal Orient</h1>
          <p className="auth-subtitle-premium">Executive Management</p>
          
          <div className="d-flex flex-column gap-3 mt-5">
            <Link to="/cashier-login" className="auth-btn-primary">
               <FaCashRegister /> CASHIER TERMINAL
            </Link>

            <Link to="/kitchen-login" className="auth-btn-primary" style={{ background: '#334155' }}>
               <FaFire /> KITCHEN OPERATIONS
            </Link>

            <Link to="/admin-login" className="auth-btn-primary" style={{ background: '#b45309' }}>
               <FaShieldAlt /> ADMINISTRATION
            </Link>
          </div>

          <div className="auth-footer mt-5">
            <p className="tiny text-muted mb-3">NEW PERSONNEL REGISTRATION</p>
            <div className="d-flex justify-content-center gap-4">
              <Link to="/signup?role=cashier" className="auth-link-gold small">CASHIER</Link>
              <Link to="/signup?role=kitchen" className="auth-link-gold small">KITCHEN</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="auth-split-right">
          <div className="position-relative z-10 text-center animate-in">
              <div className="display-1 fw-900 text-white opacity-40" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.4)', letterSpacing: '4px' }}>ROYAL</div>
              <div className="h4 fw-900 text-white tracking-widest mt-n4" style={{ textShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>ORIENT</div>
          </div>
      </div>
    </div>
  );
};

export default Home;