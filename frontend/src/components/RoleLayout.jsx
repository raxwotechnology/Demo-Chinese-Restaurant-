import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./ProtectedRoute";
import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  ClipboardList, 
  History, 
  CalendarClock, 
  CreditCard, 
  Coins, 
  Wallet, 
  BarChart3, 
  Printer, 
  ShieldCheck, 
  ChevronDown,
  LogOut,
  Menu as MenuIcon,
  X,
  Bell,
  User as UserIcon,
  Search
} from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import "../styles/PremiumUI.css";

const RoleLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdown, setUserDropdown] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const NavItem = ({ to, label, icon: Icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`nav-item ${isActive ? "active" : ""}`}
        onClick={() => isMobile && setSidebarOpen(false)}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span className="nav-label">{label}</span>
      </Link>
    );
  };

  const renderSidebarMenu = () => {
    switch (user?.role) {
      case "admin":
        return (
          <>
            <div className="sidebar-group-title">Command Center</div>
            <NavItem to="/admin" label="Dashboard" icon={LayoutDashboard} />
            <NavItem to="/admin/report" label="Analytics" icon={BarChart3} />
            
            <div className="sidebar-group-title">Operations</div>
            <NavItem to="/cashier" label="Point of Sale" icon={CreditCard} />
            <NavItem to="/kitchen" label="Live Kitchen" icon={Utensils} />
            <NavItem to="/kitchen/menu" label="Inventory" icon={ClipboardList} />
            
            <div className="sidebar-group-title">Human Resources</div>
            <NavItem to="/admin/employees" label="Staff Directory" icon={Users} />
            <NavItem to="/admin/attendance" label="Attendance" icon={CalendarClock} />
            
            <div className="sidebar-group-title">System & Config</div>
            <NavItem to="/printer-settings" label="Hardware" icon={Printer} />
            <NavItem to="/admin/users" label="Permissions" icon={ShieldCheck} />
          </>
        );
      case "cashier":
        return (
          <>
            <NavItem to="/cashier" label="POS Terminal" icon={CreditCard} />
            <NavItem to="/kitchen" label="Kitchen Board" icon={Utensils} />
            <NavItem to="/cashier/orders" label="Order History" icon={History} />
            <NavItem to="/cashier/other-income" label="Income" icon={Coins} />
            <NavItem to="/cashier/other-expences" label="Expenses" icon={Wallet} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="orient-root">
      {/* Dynamic Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="orient-sidebar"
        style={{ overflow: "hidden" }}
      >
        <div className="sidebar-header-modern">
          <img src="/logo.jpg" alt="Royal Orient" className="brand-logo" />
          <div className="brand-info">
            <h1 className="brand-name">Royal Orient</h1>
            <p className="brand-tag">v1.0.4 Platinum</p>
          </div>
        </div>

        <div className="sidebar-scrollable">
          {renderSidebarMenu()}
        </div>

        <div className="sidebar-footer-modern">
          <button className="logout-btn-modern" onClick={logout}>
            <LogOut size={18} />
            <span>Sign Out System</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Experience Area */}
      <div className="orient-main" style={{ marginLeft: sidebarOpen ? 280 : 0, transition: "margin 0.3s ease" }}>
        <header className="orient-header glass-blur">
          <div className="header-left">
            <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
            <div className="search-bar-header">
              <Search size={16} />
              <input type="text" placeholder="Quick search personnel, orders..." />
            </div>
          </div>

          <div className="header-right">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            
            <div className="user-profile-modern" ref={dropdownRef} onClick={() => setUserDropdown(!userDropdown)}>
              <div className="avatar-box">
                <UserIcon size={20} />
              </div>
              <div className="user-meta-header">
                <span className="user-name-bold">{user?.name || user?.role}</span>
                <span className="user-role-tiny">{user?.role}</span>
              </div>
              <ChevronDown size={14} className={userDropdown ? "rotate-180" : ""} />
            </div>

            <AnimatePresence>
              {userDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="profile-dropdown-modern bento-card"
                >
                  <div className="dropdown-header-box">
                    <p className="email-label">{user?.email || "system_access"}</p>
                  </div>
                  <div className="divider-modern"></div>
                  <button className="dropdown-action-btn danger" onClick={logout}>
                    <LogOut size={16} /> Secure Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="orient-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .sidebar-header-modern { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; padding: 0 16px; }
        .brand-logo { width: 44px; height: 44px; border-radius: 12px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1); }
        .brand-name { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.5px; }
        .brand-tag { font-size: 0.65rem; color: var(--p-indigo-600); font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .sidebar-scrollable { flex: 1; overflow-y: auto; padding: 0 8px; scrollbar-width: none; -ms-overflow-style: none; }
        .sidebar-scrollable::-webkit-scrollbar { display: none; }
        .sidebar-group-title { font-size: 0.65rem; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1.5px; margin: 24px 0 12px 20px; }
        .sidebar-footer-modern { padding: 16px; border-top: 1px solid rgba(255,255,255,0.05); margin-top: auto; }
        
        .icon-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; border-radius: 10px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .icon-btn:hover { background: #f1f5f9; color: var(--p-indigo-600); }
        
        .search-bar-header { display: flex; align-items: center; gap: 12px; background: #f1f5f9; padding: 10px 20px; border-radius: 14px; margin-left: 20px; width: 320px; transition: all 0.3s; border: 1px solid transparent; }
        .search-bar-header:focus-within { background: #fff; border-color: var(--p-indigo-100); box-shadow: 0 0 0 4px var(--p-indigo-50); }
        .search-bar-header input { border: none; background: transparent; font-size: 0.85rem; font-weight: 600; outline: none; width: 100%; color: var(--text-main); }
        
        .user-profile-modern { display: flex; align-items: center; gap: 14px; padding: 6px 12px 6px 6px; border-radius: 50px; background: #fff; border: 1px solid var(--border-strong); cursor: pointer; transition: all 0.2s; }
        .user-profile-modern:hover { border-color: var(--p-indigo-600); box-shadow: var(--shadow-md); }
        .avatar-box { width: 32px; height: 32px; border-radius: 50%; background: var(--p-indigo-50); display: flex; align-items: center; justify-content: center; color: var(--p-indigo-600); }
        .user-meta-header { display: flex; flex-direction: column; }
        .user-name-bold { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
        .user-role-tiny { font-size: 0.65rem; color: var(--p-indigo-600); font-weight: 700; text-transform: uppercase; }
        
        .profile-dropdown-modern { position: absolute; top: 90px; right: 40px; width: 240px; padding: 16px; z-index: 1001; }
        .email-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-bottom: 12px; text-align: center; }
        .divider-modern { height: 1px; background: var(--border-subtle); margin: 0 -16px 12px; }
        .dropdown-action-btn { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; border: none; background: transparent; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .dropdown-action-btn.danger { color: var(--danger); }
        .dropdown-action-btn:hover { background: #f8fafc; color: var(--p-indigo-600); }
        
        .notification-dot { position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background: var(--danger); border-radius: 50%; border: 2px solid #fff; }
      `}</style>
    </div>
  );
};

export default RoleLayout;
