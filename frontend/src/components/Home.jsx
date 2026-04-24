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
              <div className="branding-wrapper">
                  <h1 className="luxury-text-royal">ROYAL</h1>
                  <div className="luxury-divider"></div>
                  <h2 className="luxury-text-orient">ORIENT</h2>
                  <p className="luxury-est">ESTABLISHED 1998</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Home;