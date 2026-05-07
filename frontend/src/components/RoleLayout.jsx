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
        .orient-root { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; }
        .orient-sidebar { 
          background: #0f172a; 
          color: white; 
          display: flex; 
          flex-direction: column; 
          height: 100vh; 
          position: fixed; 
          left: 0; 
          top: 0; 
          z-index: 1000;
          box-shadow: 10px 0 30px rgba(0,0,0,0.05);
        }
        .sidebar-header-modern { 
          display: flex; 
          align-items: center; 
          gap: 16px; 
          padding: 32px 24px; 
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .brand-logo { width: 42px; height: 42px; border-radius: 12px; object-fit: cover; }
        .brand-name { font-size: 1.2rem; font-weight: 800; letter-spacing: -0.5px; margin: 0; color: white; }
        .brand-tag { font-size: 0.65rem; color: #6366f1; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        
        .sidebar-scrollable { 
          flex: 1; 
          overflow-y: auto; 
          padding: 24px 16px; 
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .sidebar-scrollable::-webkit-scrollbar { width: 4px; }
        .sidebar-scrollable::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        
        .sidebar-group-title { 
          font-size: 0.65rem; 
          font-weight: 800; 
          color: #475569; 
          text-transform: uppercase; 
          letter-spacing: 1.5px; 
          margin: 24px 0 12px 12px; 
          opacity: 0.8;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 12px;
          color: #94a3b8;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          margin-bottom: 4px;
        }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
        .nav-item.active { background: #4f46e5; color: white; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
        .nav-label { white-space: nowrap; }

        .orient-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .orient-header { 
          height: 80px; 
          background: rgba(255,255,255,0.9); 
          backdrop-filter: blur(10px); 
          border-bottom: 1px solid #e2e8f0; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 0 40px; 
          position: sticky; 
          top: 0; 
          z-index: 900; 
        }
        
        .header-left, .header-right { display: flex; align-items: center; gap: 20px; }
        .search-bar-header { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          background: #f1f5f9; 
          padding: 10px 20px; 
          border-radius: 12px; 
          width: 320px; 
          border: 1px solid transparent; 
        }
        .search-bar-header input { border: none; background: transparent; font-size: 0.85rem; outline: none; width: 100%; font-weight: 600; }
        
        .icon-btn { 
          width: 40px; 
          height: 40px; 
          border-radius: 10px; 
          border: none; 
          background: transparent; 
          color: #64748b; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          cursor: pointer; 
          transition: 0.2s; 
        }
        .icon-btn:hover { background: #f1f5f9; color: #4f46e5; }
        
        .user-profile-modern { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 6px 16px 6px 6px; 
          border-radius: 50px; 
          background: white; 
          border: 1px solid #e2e8f0; 
          cursor: pointer; 
        }
        .avatar-box { width: 34px; height: 34px; border-radius: 50%; background: #eef2ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; }
        .user-name-bold { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
        .user-role-tiny { font-size: 0.65rem; color: #4f46e5; font-weight: 800; text-transform: uppercase; }
        
        .profile-dropdown-modern { 
          position: absolute; 
          top: 85px; 
          right: 40px; 
          width: 240px; 
          padding: 16px; 
          background: white; 
          border-radius: 20px; 
          box-shadow: 0 20px 50px rgba(0,0,0,0.1); 
          border: 1px solid #e2e8f0; 
        }
        .dropdown-action-btn { 
          width: 100%; 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 12px; 
          border-radius: 12px; 
          border: none; 
          background: transparent; 
          font-weight: 700; 
          font-size: 0.85rem; 
          cursor: pointer; 
          color: #475569; 
        }
        .dropdown-action-btn:hover { background: #f8fafc; color: #4f46e5; }
        .dropdown-action-btn.danger { color: #ef4444; }
        
        .orient-content { padding: 40px; flex: 1; }
        .sidebar-footer-modern { padding: 24px 16px; border-top: 1px solid rgba(255,255,255,0.05); }
        .logout-btn-modern { 
          width: 100%; 
          padding: 12px; 
          border-radius: 12px; 
          border: 1px solid rgba(239,68,68,0.2); 
          background: rgba(239,68,68,0.05); 
          color: #f87171; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 10px; 
          font-weight: 700; 
          cursor: pointer; 
        }
        
        @media (max-width: 1024px) {
          .search-bar-header { display: none; }
          .orient-header { padding: 0 20px; }
        }
      `}</style>
    </div>
  );
};

export default RoleLayout;
