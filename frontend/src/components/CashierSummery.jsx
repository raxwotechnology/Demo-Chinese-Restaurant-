import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaCalendarAlt, FaFileInvoiceDollar, FaChartLine, FaHistory, FaCashRegister, 
  FaArrowUp, FaArrowDown, FaPlus, FaFilter, FaPrint, FaWallet, FaCoins, FaDatabase
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "../styles/PremiumUI.css";

const CashierSummery = () => {
  const [summary, setSummary] = useState({
    totalSales: 0,
    startingCash: 0,
    inflow: 0,
    outflow: 0,
    closingCash: 0,
    orders: []
  });
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchFinancialData();
  }, [dateFilter]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/cashier/summary?date=${dateFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(res.data);
    } catch (err) {
      toast.error("Financial reconciliation failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
            <div className="spinner-border text-primary mb-3"></div>
            <div className="fw-800 text-muted">Auditing Accounts...</div>
        </div>
    </div>
  );

  return (
    <div className="finance-layout animate-in p-2">
      <ToastContainer theme="light" />
      
      {/* Executive Header */}
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title">EOD Reconciliation</h1>
          <p className="premium-subtitle">Financial audit and shift performance summary</p>
        </div>
        
        <div className="orient-card p-2 d-flex align-items-center gap-3 bg-white border-0 shadow-sm">
            <div className="bg-blue-glow p-2 rounded-circle"><FaCalendarAlt size={14} /></div>
            <input 
                type="date" 
                className="premium-input border-0 bg-transparent fw-800 py-1" 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)} 
            />
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="row g-4 mb-5">
        {[
            { label: "Opening Balance", val: summary.startingCash, icon: FaDatabase, color: "blue", sub: "Shift Handover" },
            { label: "Net Sales", val: summary.totalSales, icon: FaChartLine, color: "green", sub: "Order Revenue" },
            { label: "Inflows (Misc)", val: summary.inflow, icon: FaArrowUp, color: "blue", sub: "Other Income" },
            { label: "Outflows (Misc)", val: summary.outflow, icon: FaArrowDown, color: "red", sub: "Expenses" }
        ].map((stat, i) => (
            <div className="col-xl-3 col-md-6" key={i}>
                <div className="orient-card stat-widget h-100 border-0 shadow-platinum">
                    <div className={`stat-icon bg-${stat.color}-glow`}><stat.icon size={22} /></div>
                    <div>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{symbol}{stat.val.toLocaleString()}</div>
                        <div className="tiny text-muted fw-700 mt-1">{stat.sub}</div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Main Ledger Section */}
      <div className="row g-4">
        <div className="col-lg-8">
            <div className="orient-card p-0 border-0 shadow-platinum bg-white overflow-hidden">
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <h6 className="mb-0 fw-800 text-main d-flex align-items-center gap-2">
                        <FaHistory className="text-primary" /> Transaction Ledger
                    </h6>
                    <button className="btn-premium btn-ghost py-1 px-3 fs-tiny rounded-pill" onClick={() => window.print()}>
                        <FaPrint size={10} className="me-1" /> Export Audit
                    </button>
                </div>
                
                <div className="table-container border-0">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Client Name</th>
                                <th>Category</th>
                                <th>Valuation</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.orders?.length > 0 ? summary.orders.map(order => (
                                <tr key={order._id}>
                                    <td><span className="fw-800 text-main">#{order.invoiceNo || order._id.slice(-6)}</span></td>
                                    <td><div className="fw-700 small">{order.customerName}</div></td>
                                    <td><span className="badge badge-blue">{order.orderType}</span></td>
                                    <td><span className="fw-900 text-primary">{symbol}{order.totalPrice.toFixed(2)}</span></td>
                                    <td><span className="badge badge-green">Authenticated</span></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 opacity-40">
                                        <FaDatabase size={32} className="mb-2" />
                                        <div className="fw-800">No records found for this period</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="col-lg-4">
            <div className="orient-card h-100 border-0 shadow-platinum bg-white d-flex flex-direction-column">
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="bg-gold-glow p-3 rounded-circle"><FaWallet size={24} /></div>
                    <h5 className="mb-0 fw-900 text-main">Vault Position</h5>
                </div>
                
                <div className="vault-breakdown flex-grow-1">
                    <div className="p-4 rounded-4 bg-app border mb-4">
                        <div className="stat-label mb-2">EXPECTED CLOSING BALANCE</div>
                        <div className="h3 fw-900 text-primary mb-0">{symbol}{summary.closingCash.toLocaleString()}</div>
                    </div>
                    
                    <div className="d-flex flex-column gap-3">
                        <div className="d-flex justify-content-between p-3 rounded-4 hover-lift bg-light">
                            <span className="fw-700 small">Electronic Payments</span>
                            <span className="fw-900">{symbol}0.00</span>
                        </div>
                        <div className="d-flex justify-content-between p-3 rounded-4 hover-lift bg-light">
                            <span className="fw-700 small">Cash Liquidity</span>
                            <span className="fw-900">{symbol}{summary.closingCash.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-5 pt-4 border-top">
                    <button className="btn-premium btn-primary w-100 py-3 rounded-4 shadow-sm" onClick={() => toast.info("Audit Lock Initiated")}>
                        <FaPlus className="me-2" /> RECONCILE & LOCK SHIFT
                    </button>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        .finance-layout { height: 100%; }
        .fs-tiny { font-size: 0.65rem; }
        .hover-lift { transition: all 0.2s; }
        .hover-lift:hover { transform: translateX(5px); background: var(--primary-light) !important; color: var(--primary); }
      `}</style>
    </div>
  );
};

export default CashierSummery;