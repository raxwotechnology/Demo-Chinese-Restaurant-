import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  Filter,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import API_BASE_URL from "../apiConfig";
import "../styles/PremiumUI.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const fetchReport = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/report/monthly?month=${parseInt(month) + 1}&year=${parseInt(year)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(res.data);
    } catch (err) {
      console.error("Report sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  const processedData = React.useMemo(() => {
    if (!reportData) return null;
    const daysInMonth = new Date(year, parseInt(month) + 1, 0).getDate();
    const allDates = Array.from({ length: daysInMonth }, (_, i) => `${year}-${String(parseInt(month) + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`);
    
    const incomeData = allDates.map(d => reportData.monthlyIncome[d] || 0);
    const expenseData = allDates.map(d => (reportData.monthlySupplierExpenses[d] || 0) + (reportData.monthlyBills[d] || 0) + (reportData.monthlySalaries[d] || 0));

    const totalIncome = incomeData.reduce((a, b) => a + b, 0);
    const totalExpense = expenseData.reduce((a, b) => a + b, 0);
    const netProfit = totalIncome - totalExpense;

    return { allDates, incomeData, expenseData, totalIncome, totalExpense, netProfit };
  }, [reportData, month, year]);

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner-border text-primary" /></div>;
  if (!reportData || !processedData) return <div className="text-center py-5">No report data found</div>;

  const { allDates, incomeData, expenseData, totalIncome, totalExpense, netProfit } = processedData;

  const chartData = {
    labels: allDates.map(d => d.split("-")[2]),
    datasets: [
      {
        label: "Revenue",
        backgroundColor: "#4f46e5",
        borderRadius: 8,
        data: incomeData
      },
      {
        label: "Expenses",
        backgroundColor: "#e0e7ff",
        borderRadius: 8,
        data: expenseData
      }
    ]
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="report-view-modern">
      {/* Header & Controls */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h1 className="text-hero">Fiscal Analytics</h1>
          <p className="text-subtitle">High-precision financial monitoring and margin audit</p>
        </div>
        <div className="d-flex gap-2 bg-white p-2 rounded-4 shadow-sm border">
            <select className="premium-select" style={{ border: 'none', backgroundPosition: 'right 0.5rem center', padding: '0 2rem 0 1rem', fontSize: '0.9rem' }} value={month} onChange={(e) => setMonth(e.target.value)}>
                {Array.from({length: 12}, (_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('default', {month: 'long'})}</option>)}
            </select>
            <select className="premium-select border-start" style={{ borderTop: 'none', borderBottom: 'none', borderRight: 'none', backgroundPosition: 'right 0.5rem center', padding: '0 2rem 0 1rem', fontSize: '0.9rem', borderRadius: 0 }} value={year} onChange={(e) => setYear(e.target.value)}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="btn-refresh-premium" style={{ border: 'none', boxShadow: 'none' }} onClick={fetchReport} disabled={loading}>
                <RefreshCw size={18} className={loading ? "animate-spin-soft" : ""} />
            </button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="bento-grid-report mb-5">
        <motion.div whileHover={{ y: -5 }} className="bento-card" style={{ background: 'var(--p-indigo-900)', color: 'white', border: 'none' }}>
            <div className="d-flex justify-content-between">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}><TrendingUp size={24} /></div>
                <ArrowUpRight size={20} opacity={0.5} />
            </div>
            <div className="mt-4">
                <p className="tiny-caps text-white opacity-60">Monthly Revenue</p>
                <h3 className="text-hero text-white mt-1">{symbol}{totalIncome.toLocaleString()}</h3>
            </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bento-card">
            <div className="d-flex justify-content-between">
                <div className="stat-icon-wrapper"><TrendingDown size={24} className="text-danger" /></div>
                <ArrowDownRight size={20} opacity={0.3} />
            </div>
            <div className="mt-4">
                <p className="tiny-caps">Operational Costs</p>
                <h3 className="text-hero mt-1" style={{ fontSize: '1.75rem' }}>{symbol}{totalExpense.toLocaleString()}</h3>
            </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bento-card">
            <div className="d-flex justify-content-between">
                <div className="stat-icon-wrapper"><Scale size={24} className="text-indigo" /></div>
                <div className="badge-modern success">+12.5%</div>
            </div>
            <div className="mt-4">
                <p className="tiny-caps">Net Margin</p>
                <h3 className="text-hero mt-1" style={{ fontSize: '1.75rem', color: 'var(--p-indigo-600)' }}>{symbol}{netProfit.toLocaleString()}</h3>
            </div>
        </motion.div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
            <div className="bento-card h-100">
                <div className="d-flex align-items-center gap-3 mb-5">
                    <PieChart size={20} className="text-indigo" />
                    <h5 className="m-0 fw-800">Revenue Flow Trend</h5>
                </div>
                <div style={{ height: '380px' }}>
                    <Bar 
                        data={chartData} 
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { weight: '600' } } },
                                y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8' } }
                            }
                        }} 
                    />
                </div>
            </div>
        </div>
        <div className="col-lg-4">
            <div className="bento-card h-100">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <Calendar size={20} className="text-primary" />
                    <h5 className="m-0 fw-bold">Daily Ledger</h5>
                </div>
                <div className="daily-list-scrollable">
                    {[...allDates].reverse().map((date, i) => {
                        const inc = reportData.monthlyIncome[date] || 0;
                        const exp = (reportData.monthlySupplierExpenses[date] || 0) + (reportData.monthlyBills[date] || 0) + (reportData.monthlySalaries[date] || 0);
                        if (inc === 0 && exp === 0) return null;
                        return (
                            <div key={i} className="daily-item-modern">
                                <div className="date-meta">
                                    <span className="day">{new Date(date).getDate()}</span>
                                    <span className="month-tiny">{new Date(date).toLocaleString('default', { month: 'short' })}</span>
                                </div>
                                <div className="value-meta">
                                    <span className="val-inc">+{symbol}{inc}</span>
                                    <span className="val-exp">-{symbol}{exp}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>

      <style>{`
        .bento-grid-report { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .stat-bento { border-radius: 32px !important; }
        .stat-bento.primary { background: var(--primary); color: white; }
        .tiny-caps { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; }
        .badge-modern { padding: 4px 12px; border-radius: 50px; font-size: 0.7rem; font-weight: 800; }
        .badge-modern.success { background: #dcfce7; color: #166534; }
        .daily-list-scrollable { max-height: 400px; overflow-y: auto; padding-right: 10px; }
        .daily-item-modern { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border-subtle); }
        .date-meta { display: flex; flex-direction: column; align-items: center; background: #f8fafc; padding: 8px; border-radius: 12px; min-width: 50px; }
        .day { font-size: 1.1rem; font-weight: 800; line-height: 1; }
        .month-tiny { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); }
        .value-meta { display: flex; flex-direction: column; align-items: flex-end; }
        .val-inc { font-size: 0.9rem; font-weight: 800; color: var(--success); }
        .val-exp { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
      `}</style>
    </motion.div>
  );
};

export default MonthlyReport;