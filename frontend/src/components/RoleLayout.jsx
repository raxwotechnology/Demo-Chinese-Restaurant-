import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "./ProtectedRoute";
import {
  FaBars, FaSignOutAlt, FaTachometerAlt, FaUsers, FaKey, FaFileInvoice,
  FaChartBar, FaUserTie, FaCalendarCheck, FaTruck, FaMoneyBillWave,
  FaMoneyCheckAlt, FaUtensils, FaDollarSign, FaShoppingCart, FaHistory,
  FaBookOpen, FaClipboardList, FaUserCircle, FaPercentage, FaTruckLoading,
  FaFirstOrder, FaMotorcycle, FaUserClock, FaCashRegister, FaBookReader, FaCoins, FaWallet, FaPrint, FaUserTag, FaDatabase,
  FaChevronDown, FaTimes, FaIndent, FaOutdent
} from "react-icons/fa";
import "../styles/PremiumUI.css";
import NotificationCenter from "./NotificationCenter";

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

  const createMenuItem = (to, label, Icon) => {
    const isActive = location.pathname === to;
    return (
      <li className="menu-item" key={to}>
        <Link 
          to={to} 
          className={`menu-link ${isActive ? "active" : ""}`} 
          onClick={() => isMobile && setSidebarOpen(false)}
        >
          <Icon />
          {sidebarOpen && <span>{label}</span>}
        </Link>
      </li>
    );
  };

  const renderSidebarMenu = () => {
    switch (user?.role) {
      case "admin":
        return (
          <>
            {createMenuItem("/admin", "Executive Desk", FaTachometerAlt)}
            <div className="menu-divider">POS & Operations</div>
            {createMenuItem("/cashier", "Terminal POS", FaCashRegister)}
            {createMenuItem("/kitchen", "Live Kitchen", FaUtensils)}
            {createMenuItem("/kitchen/menu", "Inventory", FaClipboardList)}
            {createMenuItem("/cashier/orders", "Order Vault", FaHistory)}
            {createMenuItem("/admin/customers", "Loyalty Base", FaUserTag)}
            
            <div className="menu-divider">Human Resources</div>
            {createMenuItem("/admin/employees", "Staff Directory", FaUserTie)}
            {createMenuItem("/kitchen/attendance/add", "Check-In Terminal", FaUserClock)}
            {createMenuItem("/admin/attendance", "Attendance Audit", FaCalendarCheck)}
            
            <div className="menu-divider">Finances & Supply</div>
            {createMenuItem("/admin/suppliers", "Supply Chain", FaTruck)}
            {createMenuItem("/admin/expenses", "Vendor Bills", FaMoneyBillWave)}
            {createMenuItem("/cashier/other-income", "Misc Inflow", FaCoins)}
            {createMenuItem("/cashier/other-expences", "Operational Out", FaWallet)}
            {createMenuItem("/admin/salaries", "Payroll", FaMoneyCheckAlt)}
            {createMenuItem("/admin/report", "Fiscal Reports", FaChartBar)}
            
            <div className="menu-divider">Core Systems</div>
            {createMenuItem("/printer-settings", "Printers", FaPrint)}
            {createMenuItem("/admin/service-charge", "Tax/Charges", FaPercentage)}
            {createMenuItem("/admin/users", "User Access", FaUsers)}
            {createMenuItem("/admin/db-Status", "System Health", FaDatabase)}
          </>
        );
      case "cashier":
        return (
          <>
            {createMenuItem("/cashier", "POS Terminal", FaCashRegister)}
            {createMenuItem("/kitchen", "Live Orders", FaUtensils)}
            {createMenuItem("/cashier/orders", "Order History", FaHistory)}
            {createMenuItem("/cashier/today", "EOD Report", FaBookOpen)}
            {createMenuItem("/cashier/other-income", "Income Log", FaCoins)}
            {createMenuItem("/cashier/other-expences", "Expense Log", FaWallet)}
            {createMenuItem("/kitchen/attendance/add", "Attendance", FaUserClock)}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="orient-root">
      {/* Sidebar */}
      <aside className={`orient-sidebar ${!sidebarOpen ? "collapsed" : ""} ${isMobile && sidebarOpen ? "mobile-open" : ""}`}>
        <div className="orient-sidebar-header">
          <img src="/logo.jpg" alt="Logo" className="sidebar-logo" />
          {sidebarOpen && <h1 className="sidebar-title">Royal Orient</h1>}
          {isMobile && sidebarOpen && (
            <button className="btn-premium btn-ghost p-1 ms-auto" onClick={() => setSidebarOpen(false)}>
              <FaTimes />
            </button>
          )}
        </div>
        <ul className="orient-menu">
          {renderSidebarMenu()}
        </ul>
        
        <div className="sidebar-footer">
          <button className="menu-link w-100 border-0 bg-transparent text-on-dark opacity-75" onClick={logout}>
            <FaSignOutAlt />
            {sidebarOpen && <span>Sign Out System</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="orient-main">
        <header className="orient-header">
          <div className="header-left">
            <button className="btn-premium btn-ghost" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <FaIndent /> : <FaOutdent />}
            </button>
            <div className="nav-breadcrumb d-none d-md-block">
               Cloud Management / <span className="breadcrumb-active">{user?.role} portal</span>
            </div>
          </div>

          <div className="header-right">
            <NotificationCenter />
            <div className="user-profile-btn" ref={dropdownRef} onClick={() => setUserDropdown(!userDropdown)}>
                <FaUserCircle size={18} className="text-primary" />
                <span className="d-none d-sm-inline">{user?.name || user?.role}</span>
                <FaChevronDown size={10} className={`ms-2 ${userDropdown ? "rotate-180" : ""}`} />
            </div>
            {userDropdown && (
                <div className="user-dropdown">
                    <div className="dropdown-header">
                        <div className="fw-900 text-main">{user?.name || "System User"}</div>
                        <div className="text-muted tiny">{user?.email || "verified_personnel"}</div>
                    </div>
                    <button className="dropdown-item text-danger" onClick={logout}>
                        <FaSignOutAlt /> Exit Management
                    </button>
                </div>
            )}
          </div>
        </header>

        <main className="orient-content">
          <Outlet />
        </main>
      </div>


    </div>
  );
};

export default RoleLayout;
