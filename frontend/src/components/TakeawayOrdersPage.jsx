import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import useNotifications from "../hooks/useNotification";
import ReceiptModal from "./ReceiptModal";
import "react-toastify/dist/ReactToastify.css";

const TakeawayOrdersPage = () => {
  const { sendNotification } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editData, setEditData] = useState({
    deliveryStatus: "",
    driverId: ""
  });
  const [drivers, setDrivers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const ORDERS_PER_PAGE = 15;

  useEffect(() => {
    fetchOrders(1);
    const interval = setInterval(() => fetchOrders(currentPage), 30000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchOrders = async (page = 1) => {
    try {
      const token = localStorage.getItem("token");
      const params = {
        page,
        limit: ORDERS_PER_PAGE
      };
      if (filterStatus) params.status = filterStatus;

      const res = await axios.get(
        `${API_BASE_URL}/api/auth/cashier/takeaway-orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      setOrders(res.data.orders);
      setTotalCount(res.data.totalCount || 0);
      setTotalPages(res.data.totalPages || 0);
      setCurrentPage(res.data.currentPage || 1);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load takeaway orders:", err.message);
      toast.error("Failed to load takeaway orders");
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/drivers`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDrivers(res.data);
    } catch (err) {
      console.error("Failed to load drivers:", err.message);
    }
  };

  const handleDeliveryStatusChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const openEditModal = (order) => {
    setEditingOrderId(order._id);
    setEditData({
      deliveryStatus: order.deliveryStatus,
      driverId: order.driverId?._id || ""
    });
  };

  const submitDeliveryUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/api/auth/order/${editingOrderId}/delivery-status`,
        editData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      setOrders(orders.map((o) => (o._id === editingOrderId ? res.data : o)));
      setEditingOrderId(null);
      toast.success("Delivery status updated successfully!");

      await sendNotification(
        "Update",
        `Delivery Status Updated as ${editData.deliveryStatus}`
      );
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error("Failed to update delivery status");
    }
  };

  const getStatusOptions = (deliveryType) => {
    if (deliveryType === "Customer Pickup") {
      return ["Customer Pending", "Customer Picked Up"];
    } else {
      return ["Driver Pending", "Driver On the Way", "Order Delivered"];
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Customer Pending":
        return <span className="status-pill status-warning">{status}</span>;
      case "Customer Picked Up":
        return <span className="status-pill status-success">Picked Up</span>;
      case "Driver Pending":
        return <span className="status-pill status-info">{status}</span>;
      case "Driver On the Way":
        return <span className="status-pill status-primary">{status}</span>;
      case "Order Delivered":
        return <span className="status-pill status-success">{status}</span>;
      default:
        return <span className="status-pill status-neutral">{status}</span>;
    }
  };

  const getOrderBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="status-pill status-warning">Pending</span>;
      case "Processing":
        return <span className="status-pill status-primary">Processing</span>;
      case "Ready":
        return <span className="status-pill status-success">Ready</span>;
      case "Completed":
        return <span className="status-pill status-neutral">Completed</span>;
      default:
        return <span className="status-pill status-neutral">{status}</span>;
    }
  };

  const symbol = localStorage.getItem("currencySymbol") || "$";

  const paginate = (pageNumber) => {
    fetchOrders(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="takeaway-page">
      <div className="page-glow glow-1"></div>
      <div className="page-glow glow-2"></div>
      <div className="page-grid"></div>

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Takeaway Order Management</span>
          <h1 className="hero-title">Takeaway Orders</h1>
          <p className="hero-subtitle">
            View and manage takeaway and delivery orders in a clean, modern admin interface.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface filter-card">
            <div className="section-header center-header">
              <h2 className="section-title">Order Filters</h2>
              <p className="section-subtitle">
                Filter takeaway orders by order status.
              </p>
            </div>

            <div className="filter-row">
              <div className="field-block filter-field">
                <label className="form-label">Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="custom-input custom-select"
                >
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Ready">Ready</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="summary-chip">
                Total Orders: <strong>{totalCount}</strong>
              </div>
            </div>
          </div>

          <div className="glass-card shared-card-surface table-card">
            <div className="section-header center-header">
              <h2 className="section-title">Takeaway Order Records</h2>
              <p className="section-subtitle">
                View order details, update delivery status, and manage assigned drivers.
              </p>
            </div>

            {loading ? (
              <div className="empty-info-box">Loading takeaway orders...</div>
            ) : orders.length === 0 ? (
              <div className="empty-info-box">No takeaway orders found.</div>
            ) : (
              <>
                <div className="table-wrap">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Invoice No</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Delivery Type</th>
                        <th>Delivery Status</th>
                        <th>Driver</th>
                        <th>Date</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const canEdit =
                          order.deliveryType === "Delivery Service"
                            ? ["Driver Pending", "Driver On the Way"].includes(
                                order.deliveryStatus
                              )
                            : ["Customer Pending"].includes(order.deliveryStatus);

                        return (
                          <tr key={order._id}>
                            <td className="invoice-no">{order.invoiceNo}</td>
                            <td className="customer-name">{order.customerName}</td>
                            <td>
                              {symbol}
                              {order.totalPrice.toFixed(2)}
                            </td>
                            <td>{getOrderBadge(order.status)}</td>
                            <td>
                              {order.deliveryType === "Customer Pickup" ? (
                                <span className="status-pill status-neutral">
                                  {order.deliveryType}
                                </span>
                              ) : (
                                <span className="status-pill status-info">
                                  {order.deliveryType}
                                </span>
                              )}
                            </td>
                            <td>{getStatusBadge(order.deliveryStatus)}</td>
                            <td>
                              {order.driverId ? (
                                <div className="driver-info">
                                  <strong>{order.driverId.name}</strong>
                                  <span>
                                    {order.driverId.vehicle} ({order.driverId.numberPlate})
                                  </span>
                                </div>
                              ) : (
                                <span className="muted-text">Not Assigned</span>
                              )}
                            </td>
                            <td>{new Date(order.createdAt).toLocaleString()}</td>
                            <td className="text-center action-cell">
                              <div className="table-action-group">
                                <button
                                  className="table-btn primary-btn"
                                  onClick={() => setSelectedOrder(order)}
                                  type="button"
                                >
                                  View
                                </button>

                                {canEdit && (
                                  <button
                                    className="table-btn warning-btn"
                                    onClick={() => openEditModal(order)}
                                    type="button"
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="pagination-wrap">
                    <p className="pagination-text">
                      Showing page {currentPage} of {totalPages} ({totalCount} total orders)
                    </p>

                    <div className="pagination-controls">
                      <button
                        className="page-btn"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>

                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              className={`page-btn ${
                                currentPage === pageNum ? "page-btn-active" : ""
                              }`}
                              onClick={() => paginate(pageNum)}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          (pageNum === currentPage - 2 && currentPage > 3) ||
                          (pageNum === currentPage + 2 && currentPage < totalPages - 2)
                        ) {
                          return (
                            <span key={pageNum} className="page-ellipsis">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        className="page-btn"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <ReceiptModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {editingOrderId && (
        <div className="modal-overlay">
          <div className="modal-box shared-card-surface">
            <div className="modal-header">
              <h5 className="modal-title">Update Delivery Status</h5>
              <button
                className="modal-close"
                onClick={() => setEditingOrderId(null)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-form-grid">
                <div className="field-block field-full">
                  <label className="form-label">Select Delivery Status</label>
                  <select
                    name="deliveryStatus"
                    value={editData.deliveryStatus}
                    onChange={handleDeliveryStatusChange}
                    className="custom-input custom-select"
                  >
                    {getStatusOptions(
                      orders.find((o) => o._id === editingOrderId)?.deliveryType
                    ).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {editData.deliveryStatus === "Driver Pending" ? (
                  <div className="field-block field-full">
                    <label className="form-label">Assign Driver</label>
                    <select
                      name="driverId"
                      value={editData.driverId || ""}
                      onChange={handleDeliveryStatusChange}
                      className="custom-input custom-select"
                    >
                      <option value="">Select Driver</option>
                      {drivers.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} - {d.vehicle} ({d.numberPlate})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>

              <div className="modal-actions">
                <button
                  className="table-btn primary-btn flex-btn"
                  onClick={() => setEditingOrderId(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="submit-btn flex-btn"
                  onClick={submitDeliveryUpdate}
                  type="button"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} />

      <style>{`
        .takeaway-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
          padding: 28px 24px 34px;
        }

        .takeaway-page .page-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
          background-size: 42px 42px;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0.04));
        }

        .takeaway-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.45;
          pointer-events: none;
        }

        .takeaway-page .glow-1 {
          width: 320px;
          height: 320px;
          top: -100px;
          left: -80px;
          background: hsla(160, 42%, 48%, 0.22);
        }

        .takeaway-page .glow-2 {
          width: 360px;
          height: 360px;
          right: -100px;
          bottom: -100px;
          background: hsla(200, 55%, 58%, 0.14);
        }

        .takeaway-page .page-shell {
          width: calc(100% - 80px);
          max-width: none;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .takeaway-page .hero-card.shared-card-surface,
        .takeaway-page .glass-card.shared-card-surface,
        .takeaway-page .modal-box.shared-card-surface {
          border-radius: 30px;
          border: 1px solid rgba(15, 23, 42, 0.08) !important;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.96) 100%
          ) !important;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow:
            0 20px 50px rgba(15, 23, 42, 0.07),
            inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
        }

        .takeaway-page .modal-box.shared-card-surface {
          border-radius: 24px;
        }

        .takeaway-page .hero-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}


        .takeaway-page .hero-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: hsl(160, 55%, 24%);
          background: hsla(160, 40%, 42%, 0.12);
          border: 1px solid hsla(160, 45%, 35%, 0.22);
        }

        .takeaway-page .hero-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .takeaway-page .hero-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.7;
          max-width: 760px;
        }

        .takeaway-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .takeaway-page .glass-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}


        .takeaway-page .section-header {
          margin-bottom: 24px;
        }

        .takeaway-page .center-header {
          text-align: center;
        }

        .takeaway-page .section-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .takeaway-page .section-subtitle {
          margin: 0 auto;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
          max-width: 760px;
        }

        .takeaway-page .filter-row {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 16px;
          flex-wrap: wrap;
        }

        .takeaway-page .filter-field {
          min-width: 260px;
        }

        .takeaway-page .field-block {
          min-width: 0;
        }

        .takeaway-page .field-full {
          grid-column: 1 / -1;
        }

        .takeaway-page .form-label {
          display: block;
          margin-bottom: 10px;
          color: #334155;
          font-size: 15px;
          font-weight: 700;
        }

        .takeaway-page .custom-input {
          width: 100%;
          height: 60px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          font-size: 15px;
          padding: 0 16px;
          transition: all 0.25s ease;
        }

        .takeaway-page .custom-input::placeholder {
          color: rgba(15, 23, 42, 0.42);
        }

        .takeaway-page .custom-input:focus {
          background: #ffffff;
          color: #0f172a;
          border-color: hsla(160, 42%, 40%, 0.55);
          box-shadow: 0 0 0 4px hsla(160, 40%, 42%, 0.14) !important;
          outline: none;
        }

        .takeaway-page .custom-select {
          appearance: none;
        }

        .takeaway-page .summary-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 56px;
          padding: 0 18px;
          border-radius: 16px;
          background: #f1f5f9;
          color: #334155;
          border: 1px solid rgba(15, 23, 42, 0.1);
          font-size: 14px;
          font-weight: 700;
        }

        .takeaway-page .table-wrap {
          overflow-x: auto;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
        }

        .takeaway-page .orders-table {
          width: 100%;
          min-width: 1300px;
          border-collapse: collapse;
        }

        .takeaway-page .orders-table thead tr {
          background: #f1f5f9;
        }

        .takeaway-page .orders-table th {
          padding: 18px 20px;
          text-align: left;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .takeaway-page .orders-table td {
          padding: 18px 20px;
          color: #475569;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: middle;
        }

        .takeaway-page .orders-table tbody tr:hover {
          background: hsla(160, 35%, 42%, 0.08);
        }

        .takeaway-page .invoice-no,
        .takeaway-page .customer-name {
          font-weight: 700;
          color: #0f172a;
        }

        .takeaway-page .driver-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .takeaway-page .driver-info span,
        .takeaway-page .muted-text {
          color: #64748b;
          font-size: 12px;
        }

        .takeaway-page .status-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 100px;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }

        .takeaway-page .status-success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
        }

        .takeaway-page .status-warning {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fcd34d;
        }

        .takeaway-page .status-info {
          background: #ecfeff;
          color: #0e7490;
          border: 1px solid #a5f3fc;
        }

        .takeaway-page .status-primary {
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #93c5fd;
        }

        .takeaway-page .status-neutral {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .takeaway-page .action-cell {
          white-space: nowrap;
        }

        .takeaway-page .table-action-group {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .takeaway-page .table-btn,
        .takeaway-page .submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          transition: all 0.25s ease;
          cursor: pointer;
          text-decoration: none;
        }

        .takeaway-page .table-btn:hover,
        .takeaway-page .submit-btn:hover {
          transform: translateY(-2px);
        }

        .takeaway-page .table-btn {
          padding: 10px 14px;
        }

        .takeaway-page .primary-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 10px 22px rgba(37, 99, 235, 0.22);
        }

        .takeaway-page .warning-btn {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          box-shadow: 0 10px 22px rgba(245, 158, 11, 0.22);
        }

        .takeaway-page .submit-btn {
          height: 56px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 14px 28px rgba(34, 197, 94, 0.22);
        }

        .takeaway-page .pagination-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .takeaway-page .pagination-text {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .takeaway-page .pagination-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .takeaway-page .page-btn {
          min-width: 42px;
          height: 42px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #334155;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .takeaway-page .page-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .takeaway-page .page-btn-active {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-color: transparent;
          color: #ffffff;
        }

        .takeaway-page .page-ellipsis {
          color: #94a3b8;
          padding: 0 6px;
        }

        .takeaway-page .empty-info-box {
          border-radius: 18px;
          border: 1px dashed #cbd5e1;
          background: #f8fafc;
          padding: 24px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        .takeaway-page .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 16px;
        }

        .takeaway-page .modal-box {
          width: 100%;
          max-width: 720px;
          overflow: hidden;
        }

        .takeaway-page .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .takeaway-page .modal-title {
          margin: 0;
          color: #0f172a;
          font-size: 22px;
          font-weight: 800;
        }

        .takeaway-page .modal-close {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.06);
          color: #334155;
          font-size: 24px;
          line-height: 1;
        }

        .takeaway-page .modal-body {
          padding: 24px;
        }

        .takeaway-page .modal-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }

        .takeaway-page .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 22px;
        }

        .takeaway-page .flex-btn {
          flex: 1;
        }

        @media (max-width: 768px) {
          .takeaway-page .page-shell {
            width: calc(100% - 24px);
          }

          .takeaway-page {
            padding: 18px 12px;
          }

          .takeaway-page .hero-card,
          .takeaway-page .glass-card,
          .takeaway-page .modal-body {
            padding: 20px;
          }

          .takeaway-page .section-title {
            font-size: 24px;
          }

          .takeaway-page .filter-row,
          .takeaway-page .pagination-wrap,
          .takeaway-page .modal-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .takeaway-page .summary-chip,
          .takeaway-page .filter-field,
          .takeaway-page .page-btn,
          .takeaway-page .submit-btn {
            width: 100%;
          }

          .takeaway-page .table-action-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default TakeawayOrdersPage;