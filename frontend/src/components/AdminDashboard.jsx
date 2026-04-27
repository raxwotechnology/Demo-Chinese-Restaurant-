import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  ShoppingCart,
  CreditCard,
  TrendingUp,
  Filter,
  DollarSign,
  Activity,
  Layers,
  Flame,
  Award,
  Globe,
  ArrowUpRight,
  Zap,
  Briefcase,
  PieChart,
  RefreshCw
} from "lucide-react";
import API_BASE_URL from "../apiConfig";
import "../styles/PremiumUI.css";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalCost: 0,
    netProfit: 0,
    totalOrders: 0,
    paymentBreakdown: { cash: 0, card: 0, bank: 0 },
    topMenus: [],
    orderTypeSummary: {
      dineIn: { count: 0, total: 0 },
      takeaway: { count: 0, total: 0 },
      delivery: { count: 0, total: 0 }
    }
  });

  const [filterType, setFilterType] = useState("thisMonth");
  const [loading, setLoading] = useState(true);
  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchSummary();
  }, [filterType]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/admin/summary`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { filterType }
      });
      setSummary(res.data);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner-border text-indigo" />
    </div>
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="dashboard-wrapper"
    >
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h1 className="text-hero">Executive Dashboard</h1>
          <p className="text-subtitle">Strategic monitoring and real-time operational intelligence</p>
        </div>
        
        <div className="d-flex gap-2 bg-white p-2 rounded-4 shadow-sm border align-items-center">
          <select 
            className="premium-select" 
            style={{ border: 'none', backgroundPosition: 'right 0.5rem center', padding: '0 2rem 0 1rem', fontSize: '0.9rem' }}
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="today">Today's Cycle</option>
            <option value="thisWeek">Weekly Window</option>
            <option value="thisMonth">Monthly Perspective</option>
          </select>
          <button className="btn-refresh-premium" style={{ border: 'none', boxShadow: 'none' }} onClick={fetchSummary} disabled={loading}>
            <RefreshCw size={18} className={loading ? "animate-spin-soft" : ""} />
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="dashboard-grid">
        <motion.div variants={itemVariants} className="bento-card kpi-main">
          <div className="d-flex justify-content-between">
            <div className="stat-icon-wrapper"><TrendingUp size={24} /></div>
            <ArrowUpRight size={20} className="opacity-30" />
          </div>
          <div className="mt-4">
            <p className="tiny-caps">Net Profitability</p>
            <h2 className="text-hero mt-1" style={{ color: 'var(--p-indigo-600)' }}>{symbol}{(summary.netProfit || 0).toLocaleString()}</h2>
            <div className="badge-modern success mt-3">+14.2% from last cycle</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bento-card">
          <div className="d-flex justify-content-between">
            <div className="stat-icon-wrapper" style={{ background: '#fef2f2', color: '#ef4444' }}><Flame size={24} /></div>
          </div>
          <div className="mt-4">
            <p className="tiny-caps">Operational Cost</p>
            <h3 className="text-hero mt-1" style={{ fontSize: '1.75rem' }}>{symbol}{(summary.totalCost || 0).toLocaleString()}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bento-card">
          <div className="d-flex justify-content-between">
            <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#10b981' }}><Zap size={24} /></div>
          </div>
          <div className="mt-4">
            <p className="tiny-caps">Gross Revenue</p>
            <h3 className="text-hero mt-1" style={{ fontSize: '1.75rem' }}>{symbol}{(summary.totalIncome || 0).toLocaleString()}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bento-card">
          <div className="d-flex justify-content-between">
            <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#f59e0b' }}><Globe size={24} /></div>
          </div>
          <div className="mt-4">
            <p className="tiny-caps">Transaction Index</p>
            <h3 className="text-hero mt-1" style={{ fontSize: '1.75rem' }}>{summary.totalOrders || 0}</h3>
          </div>
        </motion.div>

        {/* Major Charts Row */}
        <motion.div variants={itemVariants} className="bento-card chart-span-2">
          <div className="d-flex align-items-center gap-3 mb-5">
            <Activity size={20} className="text-indigo" />
            <h5 className="m-0 fw-800">Channel Velocity</h5>
          </div>
          <div style={{ height: '300px' }}>
            <Bar 
              data={{
                labels: ["Dining Room", "Takeaway", "Delivery"],
                datasets: [
                  { label: 'Volume', data: [summary.orderTypeSummary?.dineIn?.count || 0, summary.orderTypeSummary?.takeaway?.count || 0, summary.orderTypeSummary?.delivery?.count || 0], backgroundColor: '#4f46e5', borderRadius: 12 },
                  { label: 'Value', data: [summary.orderTypeSummary?.dineIn?.total || 0, summary.orderTypeSummary?.takeaway?.total || 0, summary.orderTypeSummary?.delivery?.total || 0], backgroundColor: '#e0e7ff', borderRadius: 12 }
                ]
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } } }}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bento-card">
          <div className="d-flex align-items-center gap-3 mb-4">
            <PieChart size={20} className="text-indigo" />
            <h5 className="m-0 fw-800">Settlements</h5>
          </div>
          <div style={{ height: '220px' }}>
            <Doughnut 
              data={{
                labels: ["Cash", "Card", "Bank"],
                datasets: [{ data: [summary.paymentBreakdown?.cash || 0, summary.paymentBreakdown?.card || 0, summary.paymentBreakdown?.bank || 0], backgroundColor: ['#4f46e5', '#818cf8', '#c7d2fe'], borderWidth: 0 }]
              }}
              options={{ cutout: '80%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, usePointStyle: true } } } }}
            />
          </div>
        </motion.div>

        {/* Lists Grid */}
        <motion.div variants={itemVariants} className="bento-card span-full">
          <div className="d-flex align-items-center gap-3 mb-4">
            <Award size={20} className="text-indigo" />
            <h5 className="m-0 fw-800">Performance Index: Top Assets</h5>
          </div>
          <div className="premium-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Nomenclature</th>
                  <th>Index Score</th>
                  <th>Valuation</th>
                  <th className="text-end">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {(summary.topMenus || []).map((item, i) => (
                  <tr key={i}>
                    <td className="fw-800">{item.name}</td>
                    <td><div className="badge-modern success">{item.count} SOLD</div></td>
                    <td className="fw-800 text-indigo">{symbol}{(item.total || 0).toLocaleString()}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end align-items-center gap-2">
                        <div style={{ width: '100px', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                           <div style={{ width: `${Math.min(100, (item.count/(summary.totalOrders || 1))*500)}%`, height: '100%', background: 'var(--p-indigo-600)' }}></div>
                        </div>
                        <span className="tiny-caps">High</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .kpi-main { grid-column: span 1; }
        .chart-span-2 { grid-column: span 3; }
        .span-full { grid-column: span 4; }
        .badge-modern { padding: 6px 14px; border-radius: 50px; font-size: 0.7rem; font-weight: 800; display: inline-block; }
        .badge-modern.success { background: #dcfce7; color: #166534; }
        @media (max-width: 1200px) {
          .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
          .chart-span-2, .span-full { grid-column: span 2; }
        }
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .chart-span-2, .span-full, .kpi-main { grid-column: span 1; }
        }
      `}</style>
    </motion.div>
  );
};

export default AdminDashboard;