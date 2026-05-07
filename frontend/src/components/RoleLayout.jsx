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
  Search,
  FileText,
  ShoppingCart,
  Activity,
  Truck,
  FileBarChart,
  UserCog,
  UserCheck,
  UserPlus,
  Car,
  Package,
  Receipt,
  Banknote,
  Settings2,
  Key,
  Database,
  MessageSquare
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
            <div className="sidebar-group-title">Main</div>
            <NavItem to="/admin" label="Dashboard" icon={LayoutDashboard} />
            <NavItem to="/cashier/today" label="Daily Report" icon={FileText} />
            <NavItem to="/admin/report" label="Monthly Report" icon={BarChart3} />
            <NavItem to="/admin/db-Status" label="Database Status" icon={Database} />

            <div className="sidebar-group-title">Operations</div>
            <NavItem to="/cashier" label="Order Management" icon={ShoppingCart} />
            <NavItem to="/admin/menu" label="Manage Menu" icon={Utensils} />
            <NavItem to="/kitchen" label="Live Orders" icon={Activity} />
            <NavItem to="/cashier/orders" label="Order History" icon={History} />
            <NavItem to="/cashier/takeaway-orders" label="Takeaway Orders" icon={Truck} />
            <NavItem to="/admin/bills" label="Restaurant Bills" icon={Receipt} />

            <div className="sidebar-group-title">Financials</div>
            <NavItem to="/cashier-summery" label="Cashier Summery" icon={FileBarChart} />
            <NavItem to="/cashier/other-income" label="Other Incomes" icon={Coins} />
            <NavItem to="/cashier/other-expences" label="Other Expenses" icon={Wallet} />
            <NavItem to="/admin/expenses" label="Supplier Expenses" icon={Package} />
            <NavItem to="/admin/salaries" label="Salary Payments" icon={Banknote} />
            <NavItem to="/admin/service-charge" label="Service / Delivery Charges" icon={Settings2} />

            <div className="sidebar-group-title">People</div>
            <NavItem to="/admin/users" label="User Management" icon={UserCog} />
            <NavItem to="/admin/customers" label="Customers" icon={Users} />
            <NavItem to="/admin/employees" label="Employees" icon={UserCheck} />
            <NavItem to="/admin/attendance/add" label="Live Attendance" icon={UserPlus} />
            <NavItem to="/admin/attendance" label="Attendance History" icon={CalendarClock} />

            <div className="sidebar-group-title">Registration</div>
            <NavItem to="/cashier/driver-register" label="Takeaway Driver" icon={Car} />
            <NavItem to="/admin/suppliers" label="Suppliers Register" icon={Package} />
            <NavItem to="/admin/signup-key" label="Signup Key" icon={Key} />

            <div className="sidebar-group-title">Settings</div>
            <NavItem to="/printer-settings" label="Printer Settings" icon={Printer} />
          </>
        );
      case "cashier":
        return (
          <>
            <div className="sidebar-group-title">Sales</div>
            <NavItem to="/cashier" label="Order Management" icon={ShoppingCart} />
            <NavItem to="/kitchen" label="Live Orders" icon={Activity} />
            <NavItem to="/cashier/orders" label="Order History" icon={History} />
            <NavItem to="/cashier/takeaway-orders" label="Takeaway Orders" icon={Truck} />
            
            <div className="sidebar-group-title">Reporting</div>
            <NavItem to="/cashier/today" label="Daily Report" icon={FileText} />
            <NavItem to="/cashier-summery" label="Cashier Summery" icon={FileBarChart} />
            
            <div className="sidebar-group-title">Finance</div>
            <NavItem to="/cashier/other-income" label="Other Incomes" icon={Coins} />
            <NavItem to="/cashier/other-expences" label="Other Expenses" icon={Wallet} />
            
            <div className="sidebar-group-title">System</div>
            <NavItem to="/cashier/driver-register" label="Driver Register" icon={Car} />
            <NavItem to="/admin/kitchen-requests" label="Admin Requests" icon={MessageSquare} />
            <NavItem to="/cashier/attendance/add" label="Live Attendance" icon={UserPlus} />
            <NavItem to="/printer-settings" label="Printer Settings" icon={Printer} />
          </>
        );
      case "kitchen":
        return (
          <>
            <div className="sidebar-group-title">Kitchen Board</div>
            <NavItem to="/kitchen" label="Live Orders" icon={Activity} />
            <NavItem to="/kitchen/history" label="Order History" icon={History} />
            <NavItem to="/kitchen/menu" label="Manage Menu" icon={Utensils} />
            
            <div className="sidebar-group-title">Communications</div>
            <NavItem to="/kitchen/kitchen-requestsForm" label="Admin Requests" icon={MessageSquare} />
            <NavItem to="/kitchen/attendance/add" label="Attendance" icon={UserPlus} />
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
        style={{ overflowX: "hidden" }}
      >
        <div className="sidebar-header-modern" style={{ padding: '32px 24px' }}>
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
        <header className="orient-header">
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
    </div>
  );
};

export default RoleLayout;
