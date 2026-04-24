import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaFilter, FaFileExcel, FaFilePdf, FaPrint, FaTrash, FaCheckCircle, FaSearch, FaHistory } from "react-icons/fa";
import ReceiptModal from "./ReceiptModal";
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
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/auth/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(orders.filter(o => o._id !== id));
      toast.success("Record purged");
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  return (
    <div className="order-history-container animate-fade-in">
      <ToastContainer theme="dark" />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title mb-1">Archive & Records</h1>
          <p className="premium-subtitle mb-0">Complete history of all culinary transactions</p>
        </div>
        <div className="d-flex gap-3">
            <button className="btn-premium btn-premium-primary"><FaFileExcel /> Excel</button>
            <button className="btn-premium btn-premium-primary"><FaFilePdf /> PDF</button>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card p-4 mb-5">
        <div className="row g-3 align-items-end">
            <div className="col-md-3">
                <label className="orient-stat-label">Start Date</label>
                <input type="date" className="premium-input" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
            </div>
            <div className="col-md-3">
                <label className="orient-stat-label">End Date</label>
                <input type="date" className="premium-input" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
            </div>
            <div className="col-md-2">
                <label className="orient-stat-label">Status</label>
                <select className="premium-input premium-select" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                    <option value="">All</option>
                    <option value="Completed">Completed</option>
                    <option value="Ready">Ready</option>
                    <option value="Pending">Pending</option>
                </select>
            </div>
            <div className="col-md-2">
                <label className="orient-stat-label">Type</label>
                <select className="premium-input premium-select" value={filters.orderType} onChange={(e) => setFilters({...filters, orderType: e.target.value})}>
                    <option value="">All Types</option>
                    <option value="table">Dine-In</option>
                    <option value="takeaway">Takeaway</option>
                </select>
            </div>
            <div className="col-md-2">
                <button className="btn-premium btn-premium-secondary w-100" onClick={() => fetchOrders(1)}>
                    <FaSearch /> Apply
                </button>
            </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="orient-card p-0 overflow-hidden">
        <div className="premium-table-container">
            <table className="premium-table">
                <thead>
                    <tr>
                        <th>Invoice / Date</th>
                        <th>Customer</th>
                        <th>Source</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th className="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-gold"></div></td></tr>
                    ) : orders.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-5 text-muted">No records found for the selected criteria.</td></tr>
                    ) : orders.map(order => (
                        <tr key={order._id}>
                            <td>
                                <div className="text-white fw-bold">#{order.invoiceNo || order._id.slice(-6)}</div>
                                <div className="small orient-text-muted">{new Date(order.createdAt).toLocaleString()}</div>
                            </td>
                            <td>
                                <div className="text-white">{order.customerName}</div>
                                <div className="small text-gold">{order.customerPhone}</div>
                            </td>
                            <td>
                                <div className="badge-premium badge-primary">
                                    {order.tableNo ? `Table ${order.tableNo}` : 'Takeaway'}
                                </div>
                            </td>
                            <td>
                                <div className="small orient-text-muted">
                                    {order.items.slice(0, 2).map(i => i.name).join(", ")}
                                    {order.items.length > 2 && ` +${order.items.length - 2} more`}
                                </div>
                            </td>
                            <td>
                                <div className="text-gold fw-bold">{symbol}{order.totalPrice?.toFixed(2)}</div>
                            </td>
                            <td>
                                <div className={`badge-premium ${order.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                                    {order.status}
                                </div>
                            </td>
                            <td className="text-center">
                                <div className="d-flex justify-content-center gap-2">
                                    <button className="btn-premium btn-premium-accent p-2" onClick={() => setReceiptOrder(order)}><FaPrint /></button>
                                    {localStorage.getItem("userRole") === 'admin' && (
                                        <button className="btn-premium btn-premium-primary p-2" onClick={() => handleDelete(order._id)}><FaTrash /></button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-top border-white-05 d-flex justify-content-between align-items-center">
            <div className="orient-text-muted small">Showing {orders.length} of {totalCount} records</div>
            <div className="d-flex gap-2">
                <button className="btn-premium btn-premium-primary py-1 px-3" disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)}>Prev</button>
                <span className="text-white align-self-center px-2">{currentPage} / {totalPages}</span>
                <button className="btn-premium btn-premium-primary py-1 px-3" disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)}>Next</button>
            </div>
        </div>
      </div>

      {receiptOrder && (
        <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
      )}

      <style>{`
        .border-white-05 { border-color: rgba(255,255,255,0.05) !important; }
      `}</style>
    </div>
  );
};

export default CashierOrderHistory;