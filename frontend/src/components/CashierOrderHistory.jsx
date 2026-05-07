import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  Printer,
  Trash2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Hash,
  User,
  CreditCard,
  Clock,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import ReceiptModal from "./ReceiptModal";
import API_BASE_URL from "../apiConfig";
import "../styles/PremiumUI.css";

const CashierOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ startDate: "", endDate: "", status: "", orderType: "" });
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const ORDERS_PER_PAGE = 50;

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchOrders(1);
  }, [filters]);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setCurrentPage(page);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ ...filters, page, limit: ORDERS_PER_PAGE });
      const res = await axios.get(`${API_BASE_URL}/api/auth/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      toast.error("Archive synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Purge this transaction record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/auth/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(orders.filter(o => o._id !== id));
      toast.success("Transaction purged from database");
    } catch (err) {
      toast.error("Security lockout: Deletion failed");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="history-suite">
      <ToastContainer theme="colored" />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="text-hero">Transaction Archives</h1>
          <p className="text-subtitle">Comprehensive ledger of all culinary operations and financial settlements</p>
        </div>
        <div className="d-flex gap-3">
          <button className="btn-indigo secondary py-2 px-4"><FileSpreadsheet size={18} /> EXCEL</button>
          <button className="btn-indigo secondary py-2 px-4"><FileText size={18} /> PDF</button>
        </div>
      </div>

      {/* Modern Filter Suite */}
      <div className="bento-card mb-5 p-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <span className="tiny-caps mb-2 d-block opacity-50">Range Start</span>
            <div className="input-group-premium">
              <Calendar size={16} />
              <input type="date" className="premium-input-transparent" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
            </div>
          </div>
          <div className="col-md-3">
            <span className="tiny-caps mb-2 d-block opacity-50">Range End</span>
            <div className="input-group-premium">
              <Calendar size={16} />
              <input type="date" className="premium-input-transparent" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
            </div>
          </div>
          <div className="col-md-2">
            <span className="tiny-caps mb-2 d-block opacity-50">Status</span>
            <select className="premium-select w-100" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Full Cycle</option>
              <option value="Completed">Completed</option>
              <option value="Ready">Ready</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="col-md-2">
            <span className="tiny-caps mb-2 d-block opacity-50">Order Mode</span>
            <select className="premium-select w-100" value={filters.orderType} onChange={(e) => setFilters({ ...filters, orderType: e.target.value })}>
              <option value="">All Channels</option>
              <option value="table">Dine-In</option>
              <option value="takeaway">Takeaway</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn-indigo w-100 py-3 justify-content-center" onClick={() => fetchOrders(1)}>
              <Filter size={18} />
              <span>SYNC</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bento-card p-0 overflow-hidden mb-5">
        <div className="table-responsive">
          <table className="premium-data-table">
            <thead>
              <tr>
                <th>TICKET & ORIGIN</th>
                <th>CUSTOMER IDENT</th>
                <th>CHANNEL</th>
                <th>INVENTORY</th>
                <th>NET VALUE</th>
                <th>AUTHORIZATION</th>
                <th className="text-end">OPERATIONS</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner-border text-indigo" /></td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-5"><div className="opacity-20"><Layers size={48} className="mb-2" /><p>No transaction history found</p></div></td></tr>
                ) : orders.map((order, i) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="stat-icon-wrapper mini"><Hash size={12} /></div>
                        <div>
                          <span className="fw-900 d-block">#{order.invoiceNo || order._id.slice(-6)}</span>
                          <span className="tiny-caps opacity-50">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="stat-icon-wrapper mini secondary"><User size={12} /></div>
                        <div>
                          <span className="fw-800 d-block">{order.customerName}</span>
                          <span className="small opacity-50">{order.customerPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={`badge-modern ${order.tableNo && order.tableNo !== 'Takeaway' ? 'indigo' : 'info'}`}>
                        {order.tableNo && order.tableNo !== 'Takeaway' ? `Table ${order.tableNo}` : 'Takeaway'}
                      </div>
                    </td>
                    <td>
                      <div className="small fw-700 opacity-60">
                        {order.items.slice(0, 1).map(i => i.name).join(", ")}
                        {order.items.length > 1 && <span className="text-indigo"> +{order.items.length - 1} More</span>}
                      </div>
                    </td>
                    <td>
                      <div className="fw-900 text-main h6 m-0">{symbol}{order.totalPrice?.toLocaleString()}</div>
                    </td>
                    <td>
                      <div className={`status-pill ${order.status.toLowerCase()}`}>
                        {order.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {order.status}
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn-action primary" onClick={() => setReceiptOrder(order)}><Printer size={16} /></button>
                        <button className="btn-action danger" onClick={() => handleDelete(order._id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Immersive Pagination */}
      <div className="d-flex justify-content-between align-items-center bg-white p-4 rounded-4 shadow-sm border">
        <div className="tiny-caps opacity-50">Synchronizing {orders.length} of {totalCount} Records</div>
        <div className="pagination-suite d-flex gap-3 align-items-center">
          <button className="btn-refresh-premium" disabled={currentPage === 1} onClick={() => fetchOrders(currentPage - 1)}><ChevronLeft size={20} /></button>
          <div className="fw-900 text-indigo">{currentPage} <span className="opacity-20 px-2">/</span> {totalPages}</div>
          <button className="btn-refresh-premium" disabled={currentPage === totalPages} onClick={() => fetchOrders(currentPage + 1)}><ChevronRight size={20} /></button>
        </div>
      </div>

      {receiptOrder && (
        <ReceiptModal order={receiptOrder} handleClose={() => setReceiptOrder(null)} />
      )}

      <style>{`
        .history-suite { padding-bottom: 100px; }
        .input-group-premium { background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: 12px; padding: 10px 16px; display: flex; align-items: center; gap: 12px; transition: 0.2s; }
        .input-group-premium:focus-within { background: white; border-color: var(--p-indigo-600); box-shadow: 0 0 0 4px var(--p-indigo-50); }
        .premium-input-transparent { border: none; background: transparent; outline: none; font-size: 0.85rem; font-weight: 700; color: var(--text-main); flex: 1; }
        
        .status-pill { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 50px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; width: fit-content; }
        .status-pill.completed { background: #f0fdf4; color: #166534; }
        .status-pill.pending { background: #fffbeb; color: #92400e; }
        .status-pill.ready { background: #eff6ff; color: #1e40af; }
        
        .btn-action { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-subtle); background: white; display: flex; align-items: center; justify-content: center; transition: 0.2s; color: var(--text-muted); }
        .btn-action:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--p-indigo-600); color: var(--p-indigo-600); }
        .btn-action.danger:hover { background: #fee2e2; border-color: #ef4444; color: #ef4444; }
      `}</style>
    </motion.div>
  );
};

export default CashierOrderHistory;