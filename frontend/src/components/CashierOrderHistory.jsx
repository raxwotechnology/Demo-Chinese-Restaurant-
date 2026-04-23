import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { printReceiptToBoth } from "../utils/printReceipt";
import ReceiptModal from "./ReceiptModal";

if (!window.printElement) {
  window.printElement = (element) => {
    const originalContents = document.body.innerHTML;
    const printContent = element.outerHTML;

    document.body.innerHTML = `
      <style>
        body { font-family: monospace; max-width: 400px; margin: auto; }
        h3, p, li { display: block; width: 100%; text-align: left; }
      </style>
      ${printContent}
    `;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };
}

const CashierOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    orderType: "",
    deliveryType: ""
  });
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [excelProgress, setExcelProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const ORDERS_PER_PAGE = 50;

  useEffect(() => {
    fetchOrders(1);
  }, [filters]);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setCurrentPage(page);
    const token = localStorage.getItem("token");

    const start = filters.startDate ? new Date(filters.startDate) : null;
    const end = filters.endDate ? new Date(filters.endDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    const params = new URLSearchParams();

    if (start) params.append("startDate", start.toISOString());
    if (end) params.append("endDate", end.toISOString());
    if (filters.status) params.append("status", filters.status);
    if (filters.orderType) params.append("orderType", filters.orderType);
    if (filters.deliveryType) params.append("deliveryType", filters.deliveryType);
    params.append("page", page);
    params.append("limit", ORDERS_PER_PAGE);

    try {
      const res = await axios.get(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/orders?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setOrders(res.data.orders);
      setTotalCount(res.data.totalCount || 0);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error("Failed to load orders:", err.response?.data || err.message);
      alert("Failed to load order history");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    setIsExportingExcel(true);
    setExcelProgress(20);

    const token = localStorage.getItem("token");
    const start = filters.startDate ? new Date(filters.startDate) : null;
    const end = filters.endDate ? new Date(filters.endDate) : null;
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    const params = new URLSearchParams();
    if (start) params.append("startDate", start.toISOString());
    if (end) params.append("endDate", end.toISOString());
    if (filters.status) params.append("status", filters.status);
    if (filters.orderType) params.append("orderType", filters.orderType);
    if (filters.deliveryType) params.append("deliveryType", filters.deliveryType);

    try {
      setExcelProgress(50);
      const res = await axios.get(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/orders/export/excel?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob"
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "orders_history.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      setExcelProgress(100);
    } catch (err) {
      console.error("Excel export failed:", err);
      alert("Failed to export Excel file.");
    } finally {
      setTimeout(() => {
        setIsExportingExcel(false);
        setExcelProgress(0);
      }, 300);
    }
  };

  const symbol = localStorage.getItem("currencySymbol") || "$";

  const exportToPDF = async () => {
    if (orders.length === 0) {
      alert("No orders to export.");
      return;
    }

    setIsExportingPDF(true);
    setPdfProgress(0);

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const margin = 10;
    const tableWidth = pageWidth - 2 * margin;
    const ROWS_PER_PAGE = 20;
    const totalPdfPages = Math.ceil(orders.length / ROWS_PER_PAGE);

    try {
      for (let pageIndex = 0; pageIndex < totalPdfPages; pageIndex++) {
        if (pageIndex > 0) pdf.addPage();

        const table = document.createElement("table");
        table.style.width = `${tableWidth}mm`;
        table.style.fontSize = "12px";
        table.style.borderCollapse = "collapse";
        table.style.fontFamily = "sans-serif";

        const thead = document.createElement("thead");
        thead.innerHTML = `
          <tr>
            <th style="border:0.5px solid #000; padding:4px; background:#f0f0f0;">Date</th>
            <th style="border:0.5px solid #000; padding:4px; background:#f0f0f0;">Customer</th>
            <th style="border:0.5px solid #000; padding:4px; background:#f0f0f0;">Table/Type</th>
            <th style="border:0.5px solid #000; padding:4px; background:#f0f0f0;">Status</th>
            <th style="border:0.5px solid #000; padding:4px; background:#f0f0f0;">Items</th>
            <th style="border:0.5px solid #000; padding:4px; background:#f0f0f0;">Total</th>
          </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        const start = pageIndex * ROWS_PER_PAGE;
        const end = Math.min(start + ROWS_PER_PAGE, orders.length);

        for (let i = start; i < end; i++) {
          const order = orders[i];
          const itemsText = order.items
            .map((item) => `${item.name} x${item.quantity}`)
            .join(", ");

          const row = document.createElement("tr");
          row.innerHTML = `
            <td style="border:0.5px solid #000; padding:4px;">${new Date(order.createdAt).toLocaleString()}</td>
            <td style="border:0.5px solid #000; padding:4px;">${order.customerName || ""}</td>
            <td style="border:0.5px solid #000; padding:4px;">${
              order.tableNo > 0
                ? `Table ${order.tableNo}`
                : order.deliveryType === "Customer Pickup"
                ? `Takeaway - ${order.deliveryType}`
                : `Takeaway - ${order.deliveryPlaceName}`
            }</td>
            <td style="border:0.5px solid #000; padding:4px;">${order.status || ""}</td>
            <td style="border:0.5px solid #000; padding:4px; font-size:12px;">${itemsText}</td>
            <td style="border:0.5px solid #000; padding:4px; text-align:right;">${symbol}${(order.totalPrice || 0).toFixed(2)}</td>
          `;
          tbody.appendChild(row);
        }

        table.appendChild(tbody);
        table.style.position = "absolute";
        table.style.left = "-10000px";
        document.body.appendChild(table);

        const canvas = await html2canvas(table, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#fff"
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = tableWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);

        document.body.removeChild(table);

        const progress = Math.round(((pageIndex + 1) / totalPdfPages) * 100);
        setPdfProgress(progress);
      }

      pdf.save("cashier_orders.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to generate PDF. Please try with fewer orders.");
    } finally {
      setIsExportingPDF(false);
      setPdfProgress(0);
    }
  };

  const generateReceipt = (order) => {
    const symbol = localStorage.getItem("currencySymbol") || "$";
    const customerName = order.customerName || "-";
    const customerPhone = order.customerPhone || "-";
    const tableNo = order.tableNo || 0;
    const totalPrice = order.totalPrice || 0;

    const container = document.createElement("div");
    container.id = "dynamic-receipt";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.right = "0";
    container.style.zIndex = "10000";
    container.style.background = "#fff";
    container.style.padding = "20px";
    container.style.fontFamily = "Calibri, sans-serif";
    container.style.maxWidth = "380px";
    container.style.margin = "auto";
    container.style.boxShadow = "0 0 10px rgba(0,0,0,0.25)";
    container.style.border = "1px solid #ccc";
    container.style.borderRadius = "10px";

    const invoiceDetails = `
      <div style="font-size:14px; margin-bottom:12px; line-height:1.6;">
        <div style="display:flex; align-items:center; gap:4px;">
          <div style="width:90px; line-height:0; padding-bottom:4px;"><strong>Invoice No:</strong></div>
          <div>${order.invoiceNo || "-"}</div>
        </div>
        <div style="display:flex; align-items:center; gap:4px;">
          <div style="width:90px; line-height:0; padding-bottom:4px;"><strong>Date:</strong></div>
          <div>${new Date(order.createdAt || Date.now()).toLocaleString()}</div>
        </div>
        <div style="display:flex; align-items:center; gap:4px;">
          <div style="width:90px; line-height:0; padding-bottom:4px;"><strong>Customer:</strong></div>
          <div>${customerName}</div>
        </div>
        <div style="display:flex; align-items:center; gap:4px;">
          <div style="width:90px; line-height:0; padding-bottom:4px;"><strong>Phone:</strong></div>
          <div>${customerPhone}</div>
        </div>
        <div style="display:flex; align-items:center; gap:4px;">
          <div style="width:90px; line-height:0; padding-bottom:4px;"><strong>Order Type:</strong></div>
          <div>${tableNo > 0 ? `Dine In - Table ${tableNo}` : "Takeaway"}</div>
        </div>
        ${
          tableNo <= 0 && order.deliveryType
            ? `
        <div style="display:flex; align-items:center; gap:4px;">
          <div style="width:90px; line-height:0; padding-bottom:4px;"><strong>Delivery Type:</strong></div>
          <div>${order.deliveryType}</div>
        </div>`
            : ""
        }
      </div>
    `;

    const itemRows = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding:4px 0; width:50%; text-align:left;">${item.name}</td>
        <td style="padding:4px 0; width:20%; text-align:center;">${item.quantity}</td>
        <td style="padding:4px 0; width:30%; text-align:right;">${symbol}${(item.price || 0).toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    const serviceChargeRow =
      order.serviceCharge > 0
        ? `
      <tr>
        <td style="padding:4px 0; text-align:left;">Service Charge (${(
          (order.serviceCharge * 100) /
          (order.subtotal || 1)
        ).toFixed(2)}%)</td>
        <td></td>
        <td style="padding:4px 0; text-align:right;">${symbol}${order.serviceCharge.toFixed(2)}</td>
      </tr>
    `
        : "";

    const deliveryChargeRow =
      order.deliveryCharge > 0
        ? `
      <tr>
        <td style="padding:4px 0; text-align:left;">Delivery Charge</td>
        <td></td>
        <td style="padding:4px 0; text-align:right;">${symbol}${order.deliveryCharge.toFixed(2)}</td>
      </tr>
    `
        : "";

    const paymentSection = order.payment
      ? `
      <p style="margin:4px;"><strong>Paid via:</strong></p>
      ${order.payment.cash > 0 ? `<p style="margin:4px;">Cash: ${symbol}${order.payment.cash.toFixed(2)}</p>` : ""}
      ${order.payment.card > 0 ? `<p style="margin:4px;">Card: ${symbol}${order.payment.card.toFixed(2)}</p>` : ""}
      ${order.payment.bankTransfer > 0 ? `<p style="margin:4px;">Bank Transfer: ${symbol}${order.payment.bankTransfer.toFixed(2)}</p>` : ""}
      <p style="margin:4px;"><strong>Total Paid:</strong> ${symbol}${(order.payment.totalPaid || 0).toFixed(2)}</p>
      <p style="margin:4px;"><strong>Change Due:</strong> ${symbol}${(order.payment.changeDue || 0).toFixed(2)}</p>
    `
      : "";

    const deliveryNoteSection =
      order.deliveryCharge > 0 && order.deliveryNote
        ? `
      <p><strong>Delivery Note:</strong></p>
      <p>${order.deliveryNote}</p>
    `
        : "";

    container.innerHTML = `
      <h3 style="text-align:center; margin:0;"><strong>Demo Resturant</strong></h3>
      <h3 style="text-align:center; margin:4px 0 12px;"><strong>Management System</strong></h3>
      <p style="text-align:center; margin:0;">No. 14/2/D, Pugoda Road, Katulanda, Dekatana.</p>
      <p style="text-align:center; margin:0 0 16px;">0777122797</p>
      <hr />
      ${invoiceDetails}
      <hr />
      <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
        <thead>
          <tr>
            <th style="padding:4px 0; width:50%; text-align:left;">Items</th>
            <th style="padding:4px 0; width:20%; text-align:center;">Qty</th>
            <th style="padding:4px 0; width:30%; text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          ${serviceChargeRow}
          ${deliveryChargeRow}
        </tbody>
      </table>
      <hr />
      <h5 style="text-align:right; margin:0;">Total: ${symbol}${totalPrice.toFixed(2)}</h5>
      ${paymentSection ? `<hr />${paymentSection}` : ""}
      <hr />
      <p style="text-align:center; margin:8px 0;">Thank you for your order!</p>
      <p style="text-align:center; margin:4px 0; font-size:12px;">SOFTWARE BY: RAXWO (Pvt) Ltd.</p>
      <p style="text-align:center; margin:4px 0 16px; font-size:12px;">CONTACT: 074 357 3333</p>
      <hr />
      ${deliveryNoteSection}
    `;

    document.body.appendChild(container);

    const exportPDF = () => {
      if (typeof html2canvas !== "undefined" && typeof jsPDF !== "undefined") {
        html2canvas(container).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const width = pdf.internal.pageSize.getWidth();
          const height = (canvas.height * width) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, width, height);
          pdf.save("receipt.pdf");
        });
      } else {
        alert("PDF libraries not loaded. Please include html2canvas and jsPDF.");
      }
    };

    const proceed = window.confirm("Do you want to print the receipt?");
    if (proceed) {
      if (window.qz && qz.websocket.isActive()) {
        printReceiptToBoth(container.innerHTML);
      } else {
        const printWindow = window.open("", "_blank");
        printWindow.document.write(container.innerHTML);
        printWindow.print();
      }
    } else {
      exportPDF();
    }

    setTimeout(() => {
      if (container.parentNode) {
        container.remove();
      }
    }, 5000);
  };

  const handleDeleteOrder = async (orderId, customerName) => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      alert("Only admins can delete orders.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the order for ${customerName}? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/order/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      alert("Order deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      alert("Failed to delete order: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  const markAsReady = async (orderId) => {
    if (!window.confirm("Mark this order as Ready?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/order/${orderId}/status`,
        { status: "Ready" },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "Ready" } : order
        )
      );

      alert("✅ Order marked as Ready!");
    } catch (err) {
      console.error("Failed to mark as ready:", err.response?.data || err.message);
      alert("❌ Failed to update order status");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const paginate = (pageNumber) => {
    fetchOrders(pageNumber);
    window.scrollTo(0, 0);
  };

  return (
    <div className="order-history-page">
      <div className="page-glow glow-1"></div>
      <div className="page-glow glow-2"></div>
      <div className="page-grid"></div>

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Order History Management</span>
          <h1 className="hero-title">Order History</h1>
          <p className="hero-subtitle">
            View, filter, export, print, and manage completed and active order history in a clean, modern admin interface.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface filter-card">
            <div className="section-header center-header">
              <h2 className="section-title">Filters & Export</h2>
              <p className="section-subtitle">
                Filter order history by date, status, order type, and delivery type, then export records when needed.
              </p>
            </div>

            <div className="filter-grid">
              <div className="field-block">
                <label className="form-label">Start Date</label>
                <input
                  name="startDate"
                  type="date"
                  className="custom-input"
                  onChange={handleFilterChange}
                  value={filters.startDate}
                />
              </div>

              <div className="field-block">
                <label className="form-label">End Date</label>
                <input
                  name="endDate"
                  type="date"
                  className="custom-input"
                  onChange={handleFilterChange}
                  value={filters.endDate}
                />
              </div>

              <div className="field-block">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="custom-input custom-select"
                  onChange={handleFilterChange}
                  value={filters.status}
                >
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Ready">Ready</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="field-block">
                <label className="form-label">Order Type</label>
                <select
                  name="orderType"
                  className="custom-input custom-select"
                  value={filters.orderType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="table">Dine-In</option>
                  <option value="takeaway">Takeaway</option>
                </select>
              </div>

              {(filters.orderType === "takeaway" || filters.orderType === "") && (
                <div className="field-block">
                  <label className="form-label">Delivery Type</label>
                  <select
                    name="deliveryType"
                    className="custom-input custom-select"
                    value={filters.deliveryType}
                    onChange={handleFilterChange}
                  >
                    <option value="">All</option>
                    <option value="Customer Pickup">Customer Pickup</option>
                    <option value="Delivery Service">Delivery Service</option>
                  </select>
                </div>
              )}

              <div className="field-block action-apply-wrap">
                <label className="form-label invisible-label">Apply</label>
                <button className="submit-btn" onClick={() => fetchOrders(1)} type="button">
                  Apply Filters
                </button>
              </div>
            </div>

            <div className="export-row">
              <div className="export-actions">
                <button
                  className="action-btn success-outline"
                  onClick={exportToExcel}
                  disabled={isExportingExcel || isExportingPDF}
                  type="button"
                >
                  Export Excel
                  {isExportingExcel && <span className="progress-pill">{excelProgress}%</span>}
                </button>

                <button
                  className="action-btn danger-outline"
                  onClick={exportToPDF}
                  disabled={isExportingPDF}
                  type="button"
                >
                  Export PDF
                  {isExportingPDF && <span className="progress-pill">{pdfProgress}%</span>}
                </button>
              </div>

              <div className="summary-chip">
                Total Orders: <strong>{totalCount}</strong>
              </div>
            </div>
          </div>

          <div className="glass-card shared-card-surface table-card">
            <div className="section-header center-header">
              <h2 className="section-title">Order Records</h2>
              <p className="section-subtitle">
                View all orders, print receipts, mark orders as ready, and manage order records in one place.
              </p>
            </div>

            {loading ? (
              <div className="empty-info-box">Fetching orders...</div>
            ) : orders.length === 0 ? (
              <div className="empty-info-box">No orders found.</div>
            ) : (
              <>
                <div id="order-table" className="table-wrap">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Table No / Takeaway</th>
                        <th>Status</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th className="text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                          <td className="customer-name">{order.customerName}</td>
                          <td>
                            {order.tableNo > 0
                              ? `Table ${order.tableNo} - ${order.waiterName || ""}`
                              : `Takeaway (${order.deliveryType || ""} - ${order.deliveryPlaceName || ""})`}
                          </td>
                          <td>
                            <span
                              className={`status-pill ${
                                order.status === "Ready"
                                  ? "status-success"
                                  : order.status === "Processing"
                                  ? "status-primary"
                                  : order.status === "Completed"
                                  ? "status-neutral"
                                  : "status-warning"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <ul className="items-list">
                              {order.items.map((item, idx) => (
                                <li key={idx}>
                                  {item.name} x{item.quantity}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>
                            {symbol}
                            {order.totalPrice?.toFixed(2)}
                          </td>
                          <td className="text-center action-cell">
                            <div className="table-actions">
                              {(order.status === "Pending" || order.status === "Processing") && (
                                <button
                                  className="table-btn success-btn"
                                  onClick={() => markAsReady(order._id)}
                                  title="Mark order as ready for pickup"
                                  type="button"
                                >
                                  Ready
                                </button>
                              )}

                              <button
                                className="table-btn primary-btn"
                                onClick={() => setReceiptOrder(order)}
                                type="button"
                              >
                                Print
                              </button>

                              {localStorage.getItem("userRole") === "admin" && (
                                <button
                                  className="table-btn delete-btn"
                                  onClick={() => handleDeleteOrder(order._id, order.customerName)}
                                  title="Delete Order"
                                  type="button"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
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
                        type="button"
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
                              className={`page-btn ${currentPage === pageNum ? "page-btn-active" : ""}`}
                              onClick={() => paginate(pageNum)}
                              type="button"
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
                        type="button"
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

      {receiptOrder && (
        <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
      )}

      <style>{`
        .order-history-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
          padding: 28px 24px 34px;
        }

        .order-history-page .page-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
          background-size: 42px 42px;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0.04));
        }

        .order-history-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.45;
          pointer-events: none;
        }

        .order-history-page .glow-1 {
          width: 320px;
          height: 320px;
          top: -100px;
          left: -80px;
          background: hsla(160, 42%, 48%, 0.22);
        }

        .order-history-page .glow-2 {
          width: 360px;
          height: 360px;
          right: -100px;
          bottom: -100px;
          background: hsla(200, 55%, 58%, 0.14);
        }

        .order-history-page .page-shell {
          width: calc(100% - 80px);
          max-width: none;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .order-history-page .hero-card.shared-card-surface,
        .order-history-page .glass-card.shared-card-surface {
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

        .order-history-page .hero-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1800px;
  width: 100%;
  align-items: center;
}


        .order-history-page .hero-badge {
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

        .order-history-page .hero-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .order-history-page .hero-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.7;
          max-width: 760px;
        }

        .order-history-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .order-history-page .glass-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1800px;
  width: 100%;
  align-items: center;
}


        .order-history-page .section-header {
          margin-bottom: 24px;
        }

        .order-history-page .center-header {
          text-align: center;
        }

        .order-history-page .section-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .order-history-page .section-subtitle {
          margin: 0 auto;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
          max-width: 760px;
        }

        .order-history-page .filter-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 18px;
        }

        .order-history-page .field-block {
          min-width: 0;
        }

        .order-history-page .action-apply-wrap {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .order-history-page .form-label {
          display: block;
          margin-bottom: 10px;
          color: #334155;
          font-size: 15px;
          font-weight: 700;
        }

        .order-history-page .invisible-label {
          visibility: hidden;
        }

        .order-history-page .custom-input {
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

        .order-history-page .custom-input:focus {
          background: #ffffff;
          color: #0f172a;
          border-color: hsla(160, 42%, 40%, 0.55);
          box-shadow: 0 0 0 4px hsla(160, 40%, 42%, 0.14) !important;
          outline: none;
        }

        .order-history-page .custom-input::placeholder {
          color: rgba(15, 23, 42, 0.42);
        }

        .order-history-page .custom-select {
          appearance: none;
        }

        .order-history-page .submit-btn,
        .order-history-page .action-btn,
        .order-history-page .table-btn {
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

        .order-history-page .submit-btn:hover,
        .order-history-page .action-btn:hover,
        .order-history-page .table-btn:hover {
          transform: translateY(-2px);
        }

        .order-history-page .submit-btn {
          height: 60px;
          width: 100%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 14px 28px rgba(34, 197, 94, 0.22);
        }

        .order-history-page .export-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .order-history-page .export-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .order-history-page .action-btn {
          min-height: 56px;
          padding: 0 20px;
        }

        .order-history-page .success-outline {
          background: #ecfdf5;
          border: 1px solid #6ee7b7;
          color: #166534;
        }

        .order-history-page .danger-outline {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .order-history-page .progress-pill {
          margin-left: 8px;
          padding: 4px 8px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.08);
          font-size: 11px;
          color: #0f172a;
        }

        .order-history-page .summary-chip {
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

        .order-history-page .table-wrap {
          overflow-x: auto;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
        }

        .order-history-page .history-table {
          width: 100%;
          min-width: 1200px;
          border-collapse: collapse;
        }

        .order-history-page .history-table thead tr {
          background: #f1f5f9;
        }

        .order-history-page .history-table th {
          padding: 18px 20px;
          text-align: left;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .order-history-page .history-table td {
          padding: 18px 20px;
          color: #475569;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: middle;
        }

        .order-history-page .history-table tbody tr:hover {
          background: hsla(160, 35%, 42%, 0.08);
        }

        .order-history-page .customer-name {
          font-weight: 700;
          color: #0f172a;
        }

        .order-history-page .items-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13px;
          color: #475569;
        }

        .order-history-page .status-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 96px;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }

        .order-history-page .status-success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
        }

        .order-history-page .status-primary {
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #93c5fd;
        }

        .order-history-page .status-neutral {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .order-history-page .status-warning {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fcd34d;
        }

        .order-history-page .action-cell {
          white-space: nowrap;
        }

        .order-history-page .table-actions {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .order-history-page .table-btn {
          padding: 10px 14px;
        }

        .order-history-page .success-btn {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 10px 22px rgba(34, 197, 94, 0.22);
        }

        .order-history-page .primary-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 10px 22px rgba(37, 99, 235, 0.22);
        }

        .order-history-page .delete-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 10px 22px rgba(239, 68, 68, 0.22);
        }

        .order-history-page .empty-info-box {
          border-radius: 18px;
          border: 1px dashed #cbd5e1;
          background: #f8fafc;
          padding: 24px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        .order-history-page .pagination-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .order-history-page .pagination-text {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .order-history-page .pagination-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .order-history-page .page-btn {
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

        .order-history-page .page-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .order-history-page .page-btn-active {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-color: transparent;
          color: #ffffff;
        }

        .order-history-page .page-ellipsis {
          color: #94a3b8;
          padding: 0 6px;
        }

        @media (max-width: 1200px) {
          .order-history-page .filter-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .order-history-page .page-shell {
            width: calc(100% - 24px);
          }

          .order-history-page {
            padding: 18px 12px;
          }

          .order-history-page .hero-card,
          .order-history-page .glass-card {
            padding: 20px;
          }

          .order-history-page .section-title {
            font-size: 24px;
          }

          .order-history-page .filter-grid {
            grid-template-columns: 1fr;
          }

          .order-history-page .export-row,
          .order-history-page .pagination-wrap {
            flex-direction: column;
            align-items: stretch;
          }

          .order-history-page .export-actions,
          .order-history-page .table-actions {
            flex-direction: column;
          }

          .order-history-page .action-btn,
          .order-history-page .summary-chip,
          .order-history-page .page-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CashierOrderHistory;