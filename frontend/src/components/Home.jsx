// src/components/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaCashRegister, FaFire, FaShieldAlt } from "react-icons/fa";
import LogoImage from "../upload/logo.jpg";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-wrapper">
      <div className="bg-overlay"></div>
      
      <div className="glass-card">
        <div className="logo-container">
          <div className="logo-ring">
            <img
              src={LogoImage}
              alt="Demo Resturant Logo"
              className="logo-img"
            />
          </div>
        </div>

        <h1 className="home-title">Demo Resturant</h1>
        <p className="home-subtitle">Restaurant Management</p>
        
        <p className="signup-text" style={{ color: "rgba(255,255,255,0.6)", marginBottom: "25px" }}>
          Welcome back. Please select your department:
        </p>

        <div className="login-options">
          <Link to="/cashier-login" className="premium-btn btn-cashier">
             <FaCashRegister className="btn-icon" /> Cashier Login
          </Link>

          <Link to="/kitchen-login" className="premium-btn btn-kitchen">
             <FaFire className="btn-icon" /> Kitchen Login
          </Link>

          <Link to="/admin-login" className="premium-btn btn-admin">
             <FaShieldAlt className="btn-icon" /> Admin Login
          </Link>
        </div>

        <div className="signup-section">
          <p className="signup-text">New account registration:</p>
          <div className="signup-btns">
            <Link to="/signup?role=cashier" className="btn-signup">
              Cashier
            </Link>
            <Link to="/signup?role=kitchen" className="btn-signup">
              Kitchen
            </Link>
          </div>
        </div>

        <div className="footer-text">
          © 2026 DEMO RESTURANT SYSTEM • PREMIER EDITION
        </div>
      </div>
    </div>
  );
};

export default Home;