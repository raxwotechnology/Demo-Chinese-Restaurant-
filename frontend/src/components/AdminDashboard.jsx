import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Truck,
  Percent,
  Wallet,
  TrendingUp,
  TrendingDown,
  Filter,
  DollarSign,
  Users,
  Activity,
  Layers
} from "lucide-react";
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
    totalOtherIncome: 0,
    totalSupplierExpenses: 0,
    totalBills: 0,
    totalSalaries: 0,
    totalOtherExpenses: 0,
    totalCost: 0,
    netProfit: 0,
    totalOrders: 0,
    totaldeliveryOrders: 0,
    totaldeliveryOrdersIncome: 0,
    totalOrdersIncome: 0,
    totalOrdersNetIncome: 0,
    totalTableOrders: 0,
    totalServiceChargeIncome: 0,
    statusCounts: {},
    delayedOrders: 0,
    nextDayStatusUpdates: 0,
    paymentBreakdown: { cash: 0, cashdue: 0, card: 0, bank: 0 },
    topMenus: [],
    waiterServiceEarnings: [],
    deliveryPlacesBreakdown: [],
    orderTypeSummary: {
      dineIn: { count: 0, total: 0 },
      takeaway: { count: 0, total: 0 },
      delivery: { count: 0, total: 0 }
    }
  });

  const [filterType, setFilterType] = useState("thisMonth");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(true);

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchSummary();
  }, [filterType, customStart, customEnd]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      let payload = {};

      switch (filterType) {
        case "today": {
          const today = new Date();
          payload.startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
          payload.endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();
          break;
        }
        case "thisWeek": {
          const now = new Date();
          const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          payload.startDate = firstDayOfWeek.toISOString();
          payload.endDate = new Date().toISOString();
          break;
        }
        case "thisMonth": {
          const todayMonth = new Date();
          const firstOfMonth = new Date(todayMonth.getFullYear(), todayMonth.getMonth(), 1);
          const lastOfMonth = new Date(todayMonth.getFullYear(), todayMonth.getMonth() + 1, 0);
          payload.startDate = firstOfMonth.toISOString();
          payload.endDate = lastOfMonth.toISOString();
          break;
        }
        case "custom": {
          if (!customStart || !customEnd) {
            setLoading(false);
            return;
          }
          payload.startDate = new Date(customStart).toISOString();
          payload.endDate = new Date(customEnd).toISOString();
          break;
        }
        default:
          break;
      }

      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/admin/summary",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: payload
        }
      );

      setSummary((prev) => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error("Dashboard error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { 
          color: '#64748b', 
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20, 
          font: { size: 12, weight: '600', family: 'Inter' } 
        }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#0f172a',
        bodyColor: '#64748b',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        borderColor: '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
      }
    },
    scales: {
      y: { 
        grid: { color: '#f1f5f9', drawBorder: false }, 
        ticks: { color: '#94a3b8', font: { size: 11 } } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#94a3b8', font: { size: 11 } } 
      }
    }
  };

  const statCards = [
    { label: "Revenue", value: summary.totalIncome, icon: Wallet, color: "blue", sub: "Gross Earnings" },
    { label: "Net Profit", value: summary.netProfit, icon: TrendingUp, color: "green", sub: "Final Margin" },
    { label: "Expenditure", value: summary.totalCost, icon: TrendingDown, color: "red", sub: "Operational Cost" },
    { label: "Total Orders", value: summary.totalOrders, icon: ShoppingCart, color: "gold", sub: "Volume", isCurrency: false }
  ];

  if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <div className="text-muted fw-bold">Synchronizing Data...</div>
          </div>
        </div>
      );
  }

  return (
    <div className="admin-dashboard-container animate-fade-in p-2">
      {/* Platinum Header */}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title">Executive Dashboard</h1>
          <p className="premium-subtitle">Strategic overview of business operations & growth metrics</p>
        </div>
        
        <div className="orient-card p-2 d-flex align-items-center gap-3 bg-white">
            <div className="bg-blue-glow p-2 rounded-3"><Filter size={18} /></div>
            <select 
                className="premium-input py-1 px-2 border-0 bg-transparent fw-bold" 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                style={{ minWidth: '160px', fontSize: '0.85rem' }}
            >
                <option value="today">Today's Performance</option>
                <option value="thisWeek">Weekly Overview</option>
                <option value="thisMonth">Monthly Analysis</option>
                <option value="custom">Custom Timeframe</option>
            </select>
            {filterType === "custom" && (
                <div className="d-flex gap-2 align-items-center">
                    <input type="date" className="premium-input py-1 px-2" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                    <input type="date" className="premium-input py-1 px-2" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                </div>
            )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="row g-4 mb-5">
        {statCards.map((stat, idx) => (
          <div className="col-xl-3 col-md-6" key={idx}>
            <div className="orient-card orient-stat-card">
              <div className={`orient-stat-icon bg-${stat.color}-glow`}>
                <stat.icon size={26} />
              </div>
              <div className="flex-grow-1">
                <div className="orient-stat-label">{stat.label}</div>
                <div className="orient-stat-value">
                  {stat.isCurrency !== false && symbol}
                  {stat.isCurrency !== false ? formatCurrency(stat.value) : stat.value}
                </div>
                <div className="small text-muted fw-500 mt-1">{stat.sub}</div>
              </div>
              <div className="opacity-10">
                <stat.icon size={48} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="orient-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-blue-glow p-2 rounded-3"><Activity size={20} /></div>
                    <h5 className="mb-0 fw-bold">Revenue by Order Channel</h5>
                </div>
                <div className="badge-premium badge-primary">Real-time Stream</div>
            </div>
            <div style={{ height: '380px' }}>
              <Bar 
                options={chartOptions} 
                data={{
                  labels: ["Dine-In Service", "Takeaway Orders", "Home Delivery"],
                  datasets: [
                    {
                      label: 'Order Volume',
                      data: [summary.orderTypeSummary.dineIn.count, summary.orderTypeSummary.takeaway.count, summary.orderTypeSummary.delivery.count],
                      backgroundColor: '#2563eb',
                      borderRadius: 12,
                      barThickness: 32,
                    },
                    {
                      label: 'Total Revenue',
                      data: [summary.orderTypeSummary.dineIn.total, summary.orderTypeSummary.takeaway.total, summary.orderTypeSummary.delivery.total],
                      backgroundColor: '#10b981',
                      borderRadius: 12,
                      barThickness: 32,
                    }
                  ]
                }} 
              />
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="orient-card h-100">
            <div className="d-flex align-items-center gap-3 mb-5">
                <div className="bg-red-glow p-2 rounded-3"><Layers size={20} /></div>
                <h5 className="mb-0 fw-bold">Expenditure Allocation</h5>
            </div>
            <div style={{ height: '300px' }}>
              <Doughnut 
                options={{ 
                    ...chartOptions, 
                    scales: { x: { display: false }, y: { display: false } },
                    cutout: '75%'
                }} 
                data={{
                  labels: ["Suppliers", "Fixed Bills", "Staff Payroll", "Operations"],
                  datasets: [{
                    data: [summary.totalSupplierExpenses, summary.totalBills, summary.totalSalaries, summary.totalOtherExpenses],
                    backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0,
                    hoverOffset: 20
                  }]
                }}
              />
            </div>
            <div className="mt-5 p-3 rounded-4 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted fw-bold small">TOTAL MONTHLY OUTFLOW</span>
                    <span className="fw-900 text-danger h5 mb-0">{symbol}{formatCurrency(summary.totalCost)}</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1 mb-5">
        <div className="col-md-6">
            <div className="orient-card">
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="bg-blue-glow p-2 rounded-3"><CreditCard size={20} /></div>
                    <h5 className="mb-0 fw-bold">Payment Methods Summary</h5>
                </div>
                <div className="d-flex flex-column gap-3">
                    {[
                        { label: 'Cash Collections', val: summary.paymentBreakdown.cash, color: '#2563eb', icon: DollarSign, bg: 'blue' },
                        { label: 'Card Transactions', val: summary.paymentBreakdown.card, color: '#10b981', icon: CreditCard, bg: 'green' },
                        { label: 'Bank Transfers', val: summary.paymentBreakdown.bank, color: '#f59e0b', icon: Wallet, bg: 'gold' }
                    ].map((item, i) => (
                        <div key={i} className="d-flex align-items-center justify-content-between p-3 rounded-4 hover-lift" style={{ background: '#f8fafc' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className={`bg-${item.bg}-glow p-2 rounded-circle`}><item.icon size={18} /></div>
                                <span className="fw-bold small">{item.label}</span>
                            </div>
                            <span className="fw-900">{symbol}{formatCurrency(item.val)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="col-md-6">
            <div className="orient-card">
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="bg-gold-glow p-2 rounded-3"><Users size={20} /></div>
                    <h5 className="mb-0 fw-bold">Elite Performance: Top Menu Items</h5>
                </div>
                <div className="premium-table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>CULINARY ITEM</th>
                                <th>VOLUME</th>
                                <th>REVENUE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.topMenus.length > 0 ? summary.topMenus.map((item, i) => (
                                <tr key={i}>
                                    <td className="fw-bold">{item.name}</td>
                                    <td><span className="badge-premium badge-primary">{item.count} Sold</span></td>
                                    <td className="fw-900 text-primary">{symbol}{formatCurrency(item.total)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center text-muted py-5">No performance data recorded for this timeframe.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        .fw-900 { font-weight: 900; }
        .fw-500 { font-weight: 500; }
        .hover-lift { transition: transform 0.2s; }
        .hover-lift:hover { transform: translateX(5px); }
      `}</style>
    </div>
  );
};

export default AdminDashboard;