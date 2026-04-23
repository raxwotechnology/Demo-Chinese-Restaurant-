import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "./ProtectedRoute";
import useTokenCountdown from "../hooks/useTokenCountdown";
import {
  FaBars, FaSignOutAlt, FaTachometerAlt, FaUsers, FaKey, FaFileInvoice,
  FaChartBar, FaUserTie, FaCalendarCheck, FaTruck, FaMoneyBillWave,
  FaMoneyCheckAlt, FaUtensils, FaDollarSign, FaShoppingCart, FaHistory,
  FaBookOpen, FaClipboardList, FaUserCircle, FaPercentage, FaTruckLoading,
  FaFirstOrder, FaMotorcycle, FaUserClock, FaCashRegister, FaBookReader, FaCoins, FaWallet, FaPrint, FaUserTag, FaDatabase,
  FaChevronDown
} from "react-icons/fa";
import "./Sidebar.css";
import "../styles/DashboardAlpha.css";
import NotificationCenter from "./NotificationCenter";
import useRefreshStatus from "../hooks/useRefreshStatus";
import { FaRedo } from "react-icons/fa";

const RoleLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const { user, logout } = useAuth();
  const countdown = useTokenCountdown();
  const location = useLocation();
  const dropdownRef = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHovered, setIsHovered] = useState(false);
  const { refreshed, markAsRefreshed } = useRefreshStatus();

  const handleHardRefresh = async () => {
    await markAsRefreshed();
    window.location.reload(); // hard reload
  };

  // Auto detect mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSidebarExpanded = sidebarOpen || (isHovered && !isMobile);

  const createMenuItem = (to, label, Icon) => {
    const isActive = location.pathname === to;
    return (
      <li title={!isSidebarExpanded ? label : ""} key={to}>
        <Link to={to} className={`menu-link ${isActive ? "active" : ""}`}>
          <Icon className="menu-icon" />
          {isSidebarExpanded && <span className="menu-label">{label}</span>}
        </Link>
      </li>
    );
  };

  const renderSidebarMenu = () => {
    switch (user?.role) {
      case "admin":
        return (
          <>
            {createMenuItem("/admin", "Dashboard", FaTachometerAlt)}
            {createMenuItem("/cashier/today", "Daily Report", FaBookOpen)}
            {createMenuItem("/cashier", "Order Management", FaCashRegister)}
            {createMenuItem("/kitchen/menu", "Manage Menu", FaClipboardList)}
            {createMenuItem("/kitchen", "Live Orders", FaShoppingCart)}
            {createMenuItem("/cashier/orders", "Order History", FaHistory)}
            {createMenuItem("/cashier/takeaway-orders", "Takeaway Orders", FaFirstOrder)}
            {createMenuItem("/cashier-summery", "Cashier Summery", FaBookReader)}

            {createMenuItem("/admin/users", "User Management", FaUsers)}
            {createMenuItem("/admin/report", "Monthly Report", FaChartBar)}
            {createMenuItem("/admin/customers", "Custoemrs", FaUserTag)}
            {createMenuItem("/admin/employees", "Employees", FaUserTie)}

            {createMenuItem("/kitchen/attendance/add", "Live Attendance", FaUserClock)}
            {createMenuItem("/admin/attendance", "Attendance History", FaCalendarCheck)}
            {createMenuItem("/cashier/driver-register", "Takeaway Driver Register", FaMotorcycle)}
            {createMenuItem("/admin/suppliers", "Suppliers Register", FaTruck)}
            {createMenuItem("/admin/expenses", "Supplier Expenses", FaMoneyBillWave)}
            {createMenuItem("/cashier/other-income", "Other Incomes", FaCoins)}
            {createMenuItem("/cashier/other-expences", "Other Expences", FaWallet)}
            {createMenuItem("/admin/bills", "Restaurant Bills", FaFileInvoice)}
            {createMenuItem("/admin/salaries", "Salary Payments", FaMoneyCheckAlt)}
            {createMenuItem("/admin/service-charge", "Service Charge", FaPercentage)}
            {createMenuItem("/admin/delivery-charges", "Delivery Charge", FaTruckLoading)}


            {createMenuItem("/printer-settings", "Printer Settings", FaPrint)}
            {createMenuItem("/admin/signup-key", "Signup Key", FaKey)}
            {createMenuItem("/admin/currency", "Currency", FaDollarSign)}
            {createMenuItem("/admin/db-Status", "Database Status", FaDatabase)}

            {createMenuItem("/admin/refresh-update", "Update Refresh", FaRedo)}
          </>
        );
      case "cashier":
        return (
          <>
            {createMenuItem("/cashier", "Order Management", FaCashRegister)}
            {createMenuItem("/kitchen/menu", "Manage Menu", FaClipboardList)}
            {createMenuItem("/kitchen", "Live Orders", FaShoppingCart)}
            {createMenuItem("/cashier/orders", "Order History", FaHistory)}
            {createMenuItem("/cashier/takeaway-orders", "Takeaway Orders", FaFirstOrder)}
            {createMenuItem("/cashier/today", "Daily Report", FaBookOpen)}
            {createMenuItem("/cashier-summery", "Cashier Summery", FaBookReader)}
            {createMenuItem("/cashier/other-income", "Other Incomes", FaCoins)}
            {createMenuItem("/cashier/other-expences", "Other Expences", FaWallet)}
            {createMenuItem("/cashier/driver-register", "Driver Register", FaMotorcycle)}
            {createMenuItem("/kitchen/kitchen-requestsForm", "Admin Requests", FaUtensils)}
            {createMenuItem("/kitchen/attendance/add", "Live Attendance", FaUserClock)}
            {createMenuItem("/printer-settings", "Printer Settings", FaPrint)}

          </>
        );
      case "kitchen":
        return (
          <>
            {createMenuItem("/kitchen", "Live Orders", FaShoppingCart)}
            {createMenuItem("/kitchen/history", "Order History", FaHistory)}
            {createMenuItem("/kitchen/menu", "Manage Menu", FaClipboardList)}
            {createMenuItem("/kitchen/kitchen-requestsForm", "Admin Requests", FaUtensils)}
            {createMenuItem("/kitchen/attendance/add", "Attendance", FaUserClock)}
          </>
        );
      default:
        return null;
    }
  };

  const getSidebarClass = () => {
    // Open if: user toggled it OR (hovering + desktop + not manually opened)
    const isOpen = sidebarOpen || (isHovered && !isMobile);
    return isOpen ? "open" : "collapsed";
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (!sidebarOpen) {
      setIsHovered(false); // close hover if manually opening
    }
  };

  const useAlphaShell =
    user?.role === "admin" || user?.role === "kitchen" || user?.role === "cashier";

  const usePoppinsShell =
    useAlphaShell &&
    (user?.role === "admin" || user?.role === "kitchen" || user?.role === "cashier");

  return (
    <div
      className={`layout d-flex ${useAlphaShell ? "dashboard-alpha-root" : ""} ${usePoppinsShell ? "dashboard-alpha-root--poppins" : ""}`}
    >
      {useAlphaShell && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url(${require('../assets/dashboard-bg.png')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
      )}

      <div className="d-flex w-100 position-relative" style={{ zIndex: 1 }}>
        {!isMobile || sidebarOpen ? (
          <aside
            className={`sidebar ${getSidebarClass()} ${useAlphaShell ? "alpha-sidebar" : ""}`}
            onMouseEnter={() => !isMobile && !sidebarOpen && setIsHovered(true)}
            onMouseLeave={() => !isMobile && !sidebarOpen && setIsHovered(false)}
          >
            <div className="sidebar-header d-flex align-items-center">
              {isSidebarExpanded && (
                <>
                  <img
                    src="/logo.jpg"
                    alt="Logo"
                    className="sidebar-logo rounded-circle me-2"
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                      border: "2px solid #fff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                  />
                  <h3 className="justify-content-left sidebar-title mb-0">Demo Resturant</h3>
                </>
              )}
            </div>
            <ul className="sidebar-menu">{renderSidebarMenu()}</ul>
          </aside>
        ) : null}

        <div className="main-content flex-grow-1 overflow-hidden">
          <header className={`top-navbar ${useAlphaShell ? "alpha-navbar" : ""}`}>
            <div className="navbar-left">
              <button className="btn-toggle text-inherit" onClick={toggleSidebar}>
                <FaBars />
              </button>
              <span className="session-timer d-none d-md-inline ms-3 opacity-75">⏳ Session expires in: {countdown}</span>
              <div className="ms-3">
                <NotificationCenter />
              </div>
              <button
                className="btn btn-link text-inherit ms-2 p-0"
                onClick={handleHardRefresh}
                title="Hard refresh page"
              >
                <FaRedo className={!refreshed ? "text-jade-glow" : ""} />
              </button>
            </div>
            <div className="navbar-right" ref={dropdownRef}>
              <div className="user-dropdown">
                <button
                  type="button"
                  className="user-toggle d-flex align-items-center gap-2"
                  onClick={() => setUserDropdown(!userDropdown)}
                  aria-expanded={userDropdown}
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                >
                  <FaUserCircle className="user-icon fs-4" aria-hidden />
                  <span className="user-role fw-bold text-uppercase d-none d-sm-inline" style={{ letterSpacing: '1px' }}>{user?.role}</span>
                  <FaChevronDown className={`user-menu-chevron d-none d-sm-inline ${userDropdown ? "is-open" : ""}`} aria-hidden />
                </button>
                {userDropdown && (
                  <div className="dropdown-menu show glass-card border-0 mt-2" role="menu" aria-label="Account">
                    <button type="button" className="dropdown-item text-danger" role="menuitem" onClick={logout}>
                      <FaSignOutAlt aria-hidden /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="page-content position-relative">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default RoleLayout;
