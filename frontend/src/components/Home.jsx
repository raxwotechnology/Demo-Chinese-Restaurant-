import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Flame, ShieldCheck, ChevronRight, Fingerprint } from "lucide-react";
import LogoImage from "../upload/logo.jpg";
import "../styles/PremiumUI.css";

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="auth-page-luxury">
      <div className="auth-split-left">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="auth-card-modern"
        >
          <motion.div variants={itemVariants} className="auth-logo-box-modern text-center">
             <img src={LogoImage} alt="Royal Orient" style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover' }} />
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center mt-4">
            <h1 className="text-hero" style={{ fontSize: '2.5rem' }}>Royal Orient</h1>
            <p className="text-subtitle">INTELLIGENT RESTAURANT ECOSYSTEM</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="d-flex flex-column gap-3 mt-5">
            <Link to="/cashier-login" className="btn-indigo w-100 py-4 justify-content-between">
               <div className="d-flex align-items-center gap-3">
                 <CreditCard size={20} />
                 <span>POS TERMINAL</span>
               </div>
               <ChevronRight size={18} opacity={0.5} />
            </Link>

            <Link to="/kitchen-login" className="btn-ghost w-100 py-4 justify-content-between">
               <div className="d-flex align-items-center gap-3">
                 <Flame size={20} className="text-danger" />
                 <span>LIVE KITCHEN</span>
               </div>
               <ChevronRight size={18} opacity={0.3} />
            </Link>

            <Link to="/admin-login" className="btn-ghost w-100 py-4 justify-content-between">
               <div className="d-flex align-items-center gap-3">
                 <ShieldCheck size={20} className="text-indigo" />
                 <span>ADMINISTRATION</span>
               </div>
               <ChevronRight size={18} opacity={0.3} />
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mt-5 pt-4 border-top">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-4 opacity-50">
              <Fingerprint size={14} />
              <span className="tiny-caps">Secure Access Only</span>
            </div>
            <div className="d-flex justify-content-center gap-5">
              <Link to="/signup?role=cashier" className="link-hover-indigo">STAFF REGISTER</Link>
              <Link to="/signup?role=kitchen" className="link-hover-indigo">KITCHEN OPS</Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      <div className="auth-split-right-modern">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="branding-content"
          >
              <div className="brand-badge-indigo">EST. 1998</div>
              <h1 className="giant-title">ROYAL<br/>ORIENT</h1>
              <div className="accent-bar-indigo"></div>
              <p className="vision-text-modern">Elevating culinary management through digital precision and excellence.</p>
          </motion.div>
      </div>

      <style>{`
        .link-hover-indigo { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-decoration: none; transition: 0.3s; }
        .link-hover-indigo:hover { color: var(--p-indigo-600); transform: translateY(-1px); }
        .brand-badge-indigo { padding: 6px 14px; background: var(--p-indigo-600); color: white; border-radius: 50px; font-size: 0.7rem; font-weight: 800; display: inline-block; }
        .accent-bar-indigo { width: 60px; height: 4px; background: #c5a059; margin: 30px 0; }
        .vision-text-modern { font-size: 1.1rem; font-weight: 400; opacity: 0.8; max-width: 400px; line-height: 1.6; }
        @media (max-width: 1024px) {
          .auth-split-right-modern { display: none; }
        }
      `}</style>
    </div>
  );
};


export default Home;