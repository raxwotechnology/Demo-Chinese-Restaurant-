import API_BASE_URL from "../apiConfig";
// src/components/DailyReport.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  ShoppingCart,
  Wallet,
  Gift,
  Wrench
} from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const DailyReport = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalOrdersIncome: 0,
    totalOtherIncome: 0,
    totalOtherExpenses: 0,
    statusCounts: {},
    paymentBreakdown: { cash: 0, cashdue: 0, card: 0, bank: 0 },
    topMenus: []
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  const page1Ref = useRef();
  const page2ContainerRef = useRef();

  const fetchData = async (dateStr) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const date = new Date(dateStr);
    const startDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
    ).toISOString();
    const endDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
    ).toISOString();

    try {
      const [summaryRes, ordersRes] = await Promise.all([
        axios.get(
          `${API_BASE_URL}/api/auth/admin/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { startDate, endDate }
          }
        ),
        axios.get(
          `${API_BASE_URL}/api/auth/orders?limit=1000`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { startDate, endDate }
          }
        )
      ]);

      setSummary(summaryRes.data);
      const ordersArray = ordersRes.data.orders || ordersRes.data;
      setOrders(ordersArray);
    } catch (err) {
      console.error("Failed to load report:", err.message);
      alert("Failed to load report data");
      setSummary({
        totalOrders: 0,
        totalOrdersIncome: 0,
        totalOtherIncome: 0,
        totalOtherExpenses: 0,
        statusCounts: {},
        paymentBreakdown: { cash: 0, cashdue: 0, card: 0, bank: 0 },
        topMenus: []
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const symbol = localStorage.getItem("currencySymbol") || "$";

  const statusChartData = {
    labels:
      Object.keys(summary.statusCounts).length > 0
        ? Object.keys(summary.statusCounts)
        : ["No Data"],
    datasets: [
      {
        label: "Order Status",
        data:
          Object.keys(summary.statusCounts).length > 0
            ? Object.values(summary.statusCounts)
            : [1],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        hoverOffset: 4
      }
    ]
  };

  const paymentChartData = {
    labels: ["Cash", "Card", "Bank Transfer"],
    datasets: [
      {
        label: "Payment Methods",
        data: [
          Math.max(0, summary.paymentBreakdown.cash - summary.paymentBreakdown.cashdue),
          summary.paymentBreakdown.card || 0,
          summary.paymentBreakdown.bank || 0
        ],
        backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"]
      }
    ]
  };

  const costChartData = {
    labels: ["Other Expenses"],
    datasets: [
      {
        label: "Expenses",
        data: [summary.totalOtherExpenses || 0],
        backgroundColor: ["#FF9F40"]
      }
    ]
  };

  const doughnutChartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#475569",
          padding: 14,
          usePointStyle: true
        }
      }
    }
  };

  const exportFullReport = async () => {
    if (loading || isExportingPDF) return;

    setIsExportingPDF(true);
    setPdfProgress(0);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.width;

      const canvas1 = await html2canvas(page1Ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff"
      });
      const imgData1 = canvas1.toDataURL("image/png");
      const imgHeight1 = (canvas1.height * pageWidth) / canvas1.width;
      pdf.addImage(imgData1, "PNG", 0, 0, pageWidth, imgHeight1);
      setPdfProgress(30);

      const ROWS_PER_PAGE = 25;
      const totalPages = Math.ceil(orders.length / ROWS_PER_PAGE);

      for (let p = 0; p < totalPages; p++) {
        pdf.addPage();

        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.fontSize = "20px";
        table.style.fontFamily = "Arial, sans-serif";

        const colWidths = ["15%", "12%", "15%", "10%", "30%", "18%"];

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        ["Date", "Customer", "Table / Type", "Status", "Items", "Total"].forEach(
          (text, idx) => {
            const th = document.createElement("th");
            th.textContent = text;
            th.style.border = "1px solid #000";
            th.style.padding = "8px";
            th.style.textAlign = "left";
            th.style.fontWeight = "bold";
            th.style.width = colWidths[idx];
            th.style.fontSize = "25px";
            headerRow.appendChild(th);
          }
        );
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        const start = p * ROWS_PER_PAGE;
        const end = Math.min(start + ROWS_PER_PAGE, orders.length);

        for (let i = start; i < end; i++) {
          const order = orders[i];
          const itemsText = (order.items || [])
            .map((item) => `${item.name} x${item.quantity}`)
            .join(", ");

          const tableTakeaway =
            order.tableNo > 0
              ? `Table ${order.tableNo}`
              : order.deliveryType === "Customer Pickup"
              ? `Takeaway - ${order.deliveryType}`
              : `Takeaway - ${order.deliveryPlaceName || order.deliveryType || "—"}`;

          const row = document.createElement("tr");

          const cellData = [
            new Date(order.createdAt).toLocaleString(),
            order.customerName || "—",
            tableTakeaway,
            order.status || "—",
            itemsText,
            `${symbol}${(order.totalPrice || 0).toFixed(2)}`
          ];

          cellData.forEach((text, idx) => {
            const td = document.createElement("td");
            td.textContent = text;
            td.style.border = "1px solid #000";
            td.style.padding = "8px";
            td.style.fontSize = "25px";
            td.style.width = colWidths[idx];
            td.style.textAlign = idx === 5 ? "right" : "left";
            row.appendChild(td);
          });

          tbody.appendChild(row);
        }

        table.appendChild(tbody);
        table.style.position = "absolute";
        table.style.left = "-10000px";
        table.style.backgroundColor = "#fff";
        document.body.appendChild(table);

        const canvas = await html2canvas(table, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#fff",
          scrollX: 0,
          scrollY: -window.scrollY
        });

        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * pageWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 10, pageWidth, Math.min(imgHeight, 280));

        document.body.removeChild(table);

        const progress = 30 + Math.round(((p + 1) / totalPages) * 70);
        setPdfProgress(Math.min(progress, 100));
      }

      pdf.save(`daily_report_${selectedDate}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to generate PDF. Try with fewer orders.");
    } finally {
      setIsExportingPDF(false);
      setPdfProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="daily-report-page">
        <div className="page-glow glow-1"></div>
        <div className="page-glow glow-2"></div>
        <div className="page-grid"></div>

        <div className="loading-shell">
          <div className="loading-card shared-card-surface">
            <div className="loading-spinner"></div>
            <p>Loading Daily Report...</p>
          </div>
        </div>

        <style>{`
          .daily-report-page {
            min-height: 100vh;
            position: relative;
            overflow: hidden;
            background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
            padding: 28px 24px 34px;
          }

          .daily-report-page .page-grid {
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
            background-size: 42px 42px;
            pointer-events: none;
            mask-image: linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0.04));
          }

          .daily-report-page .page-glow {
            position: absolute;
            border-radius: 50%;
            filter: blur(95px);
            opacity: 0.45;
            pointer-events: none;
          }

          .daily-report-page .glow-1 {
            width: 320px;
            height: 320px;
            top: -100px;
            left: -80px;
            background: hsla(160, 42%, 48%, 0.22);
          }

          .daily-report-page .glow-2 {
            width: 360px;
            height: 360px;
            right: -100px;
            bottom: -100px;
            background: hsla(200, 55%, 58%, 0.14);
          }

          .daily-report-page .shared-card-surface {
            border-radius: 30px;
            border: 1px solid rgba(15, 23, 42, 0.08);
            background: linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.98) 0%,
              rgba(248, 250, 252, 0.96) 100%
            );
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            box-shadow:
              0 20px 50px rgba(15, 23, 42, 0.07),
              inset 0 1px 0 rgba(255, 255, 255, 0.95);
          }

          .daily-report-page .loading-shell {
            min-height: calc(100vh - 62px);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 1;
          }

          .daily-report-page .loading-card {
            width: 320px;
            padding: 32px;
            text-align: center;
            color: #0f172a;
          }

          .daily-report-page .loading-spinner {
            width: 54px;
            height: 54px;
            border-radius: 50%;
            border: 4px solid rgba(15, 23, 42, 0.08);
            border-top-color: hsl(160, 42%, 40%);
            margin: 0 auto 16px;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const statsCards = [
    {
      label: "Total Orders",
      value: summary.totalOrders,
      icon: ShoppingCart,
      className: "stat-blue"
    },
    {
      label: "Orders Income",
      value: `${symbol}${formatCurrency(summary.totalOrdersIncome)}`,
      icon: Wallet,
      className: "stat-green"
    },
    {
      label: "Other Income",
      value: `${symbol}${formatCurrency(summary.totalOtherIncome)}`,
      icon: Gift,
      className: "stat-green"
    },
    {
      label: "Other Expenses",
      value: `${symbol}${formatCurrency(summary.totalOtherExpenses)}`,
      icon: Wrench,
      className: "stat-red"
    }
  ];

  return (
    <div className="daily-report-page">
      <div className="page-glow glow-1"></div>
      <div className="page-glow glow-2"></div>
      <div className="page-grid"></div>

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Daily Business Report</span>
          <h1 className="hero-title">Daily Report</h1>
          <p className="hero-subtitle">
            Review daily sales, order activity, income, expenses, charts, and
            detailed order records in a clean, modern admin interface.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface">
            <div className="section-header center-header">
              <h2 className="section-title">Report Controls</h2>
              <p className="section-subtitle">
                Choose a report date and export the full daily report as PDF.
              </p>
            </div>

            <div className="control-row">
              <div className="field-block control-field">
                <label htmlFor="reportDate" className="form-label">
                  Select Date
                </label>
                <input
                  type="date"
                  id="reportDate"
                  className="custom-input"
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </div>

              <button
                className="action-btn danger-btn"
                onClick={exportFullReport}
                disabled={isExportingPDF}
                type="button"
              >
                Export Full Report (PDF)
                {isExportingPDF && (
                  <span className="progress-pill">{pdfProgress}%</span>
                )}
              </button>
            </div>
          </div>

          <div ref={page1Ref} className="glass-card shared-card-surface">
            <div className="section-header center-header">
              <h2 className="section-title">Summary for {selectedDate}</h2>
              <p className="section-subtitle">
                Daily business performance overview, key financial totals, order
                status counts, payment summary, and visual charts.
              </p>
            </div>

            <div className="stats-grid">
              {statsCards.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <div key={idx} className={`metric-card ${card.className}`}>
                    <div className={`metric-icon-3d ${card.className}`}>
                      <div className="metric-icon-inner">
                        <IconComponent />
                      </div>
                    </div>
                    <div className="metric-label">{card.label}</div>
                    <div className="metric-value">{card.value}</div>
                  </div>
                );
              })}
            </div>

            <div className="summary-grid">
              <div className="info-card">
                <h3 className="mini-card-title">Top Ordered Menu Items</h3>
                {summary.topMenus.length === 0 ? (
                  <p className="muted-info">No items sold</p>
                ) : (
                  <div className="list-scroll">
                    {summary.topMenus.map((item, idx) => (
                      <div key={idx} className="list-row">
                        <span>{item.name}</span>
                        <span className="count-badge">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="info-card">
                <h3 className="mini-card-title">Order Summary</h3>
                {Object.keys(summary.statusCounts).length === 0 ? (
                  <p className="muted-info">No orders</p>
                ) : (
                  <div className="summary-list">
                    {Object.entries(summary.statusCounts).map(([status, count]) => (
                      <div key={status} className="list-row">
                        <span>{status}</span>
                        <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="info-card">
                <h3 className="mini-card-title">Payment Summary</h3>
                <div className="summary-list">
                  <div className="list-row">
                    <span>Cash</span>
                    <strong>
                      {symbol}
                      {formatCurrency(
                        Math.max(
                          0,
                          summary.paymentBreakdown.cash -
                            summary.paymentBreakdown.cashdue
                        )
                      )}
                    </strong>
                  </div>
                  <div className="list-row">
                    <span>Card</span>
                    <strong>
                      {symbol}
                      {formatCurrency(summary.paymentBreakdown.card)}
                    </strong>
                  </div>
                  <div className="list-row">
                    <span>Bank Transfer</span>
                    <strong>
                      {symbol}
                      {formatCurrency(summary.paymentBreakdown.bank)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-grid">
              <div className="chart-card">
                <h3 className="mini-card-title center-text">Order Status</h3>
                <div className="chart-wrap">
                  <Doughnut data={statusChartData} options={doughnutChartOptions} />
                </div>
              </div>

              <div className="chart-card">
                <h3 className="mini-card-title center-text">Payment Methods</h3>
                <div className="chart-wrap">
                  <Doughnut data={paymentChartData} options={doughnutChartOptions} />
                </div>
              </div>

              <div className="chart-card">
                <h3 className="mini-card-title center-text">Other Expenses</h3>
                <div className="chart-wrap">
                  <Doughnut
                    data={costChartData}
                    options={doughnutChartOptions}
                  />
                </div>
              </div>
            </div>
          </div>

          <div ref={page2ContainerRef} className="glass-card shared-card-surface">
            <div className="section-header center-header">
              <h2 className="section-title">Order Details for {selectedDate}</h2>
              <p className="section-subtitle">
                Detailed order records for the selected day, including customer,
                table or takeaway type, item list, status, and order total.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="empty-info-box">No orders found.</div>
            ) : (
              <div className="table-wrap">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Table / Takeaway</th>
                      <th>Status</th>
                      <th>Items</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="customer-name">{order.customerName || "—"}</td>
                        <td>
                          {order.tableNo > 0
                            ? `Table ${order.tableNo}`
                            : order.deliveryType === "Customer Pickup"
                            ? `Takeaway - ${order.deliveryType}`
                            : `Takeaway - ${
                                order.deliveryPlaceName ||
                                order.deliveryType ||
                                "—"
                              }`}
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
                          <div className="items-list">
                            {(order.items || []).map((item, i) => (
                              <div key={i}>
                                {item.name} x{item.quantity}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          {symbol}
                          {(order.totalPrice || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .daily-report-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
          padding: 28px 24px 34px;
        }

        .daily-report-page .page-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
          background-size: 42px 42px;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0.04));
        }

        .daily-report-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.45;
          pointer-events: none;
        }

        .daily-report-page .glow-1 {
          width: 320px;
          height: 320px;
          top: -100px;
          left: -80px;
          background: hsla(160, 42%, 48%, 0.22);
        }

        .daily-report-page .glow-2 {
          width: 360px;
          height: 360px;
          right: -100px;
          bottom: -100px;
          background: hsla(200, 55%, 58%, 0.14);
        }

        .daily-report-page .page-shell {
          width: calc(100% - 80px);
          max-width: none;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .daily-report-page .shared-card-surface {
          border-radius: 30px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.96) 100%
          );
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow:
            0 20px 50px rgba(15, 23, 42, 0.07),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
        }

        .daily-report-page .hero-card {
  padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .daily-report-page .hero-badge {
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

        .daily-report-page .hero-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .daily-report-page .hero-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.7;
          max-width: 760px;
        }

        .daily-report-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .daily-report-page .glass-card {
         padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}


        .daily-report-page .section-header {
          margin-bottom: 24px;
        }

        .daily-report-page .center-header {
          text-align: center;
        }

        .daily-report-page .section-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .daily-report-page .section-subtitle {
          margin: 0 auto;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
          max-width: 760px;
        }

        .daily-report-page .control-row {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 16px;
          flex-wrap: wrap;
        }

        .daily-report-page .control-field {
          min-width: 240px;
        }

        .daily-report-page .field-block {
          min-width: 0;
        }

        .daily-report-page .form-label {
          display: block;
          margin-bottom: 10px;
          color: #334155;
          font-size: 15px;
          font-weight: 700;
        }

        .daily-report-page .custom-input {
          width: 100%;
          height: 58px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #0f172a;
          font-size: 15px;
          padding: 0 16px;
          transition: all 0.25s ease;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
        }

        .daily-report-page .custom-input:focus {
          outline: none;
          border-color: hsla(160, 42%, 40%, 0.55);
          box-shadow: 0 0 0 4px hsla(160, 40%, 42%, 0.14) !important;
        }

        .daily-report-page .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 58px;
          padding: 0 22px;
          border: none;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          transition: all 0.25s ease;
          cursor: pointer;
          justify-content: center;
        }

        .daily-report-page .action-btn:hover {
          transform: translateY(-2px);
        }

        .daily-report-page .danger-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 14px 28px rgba(239, 68, 68, 0.22);
          justify-content: center;
        }

        .daily-report-page .progress-pill {
          padding: 4px 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.22);
          font-size: 11px;
        }

        .daily-report-page .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .daily-report-page .metric-card {
          border-radius: 24px;
          padding: 22px;
          color: #0f172a;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .daily-report-page .stat-blue {
          background: linear-gradient(145deg, #eff6ff, #e0f2fe);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .daily-report-page .stat-green {
          background: linear-gradient(145deg, #ecfdf5, #d1fae5);
          border-color: rgba(16, 185, 129, 0.22);
        }

        .daily-report-page .stat-red {
          background: linear-gradient(145deg, #fef2f2, #fee2e2);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .daily-report-page .metric-icon-3d {
          width: 72px;
          height: 72px;
          min-width: 72px;
          border-radius: 22px;
          display: grid;
          place-items: center;
          position: relative;
          margin-bottom: 14px;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.38),
            0 14px 26px rgba(15, 23, 42, 0.14),
            0 8px 14px rgba(15, 23, 42, 0.08);
        }

        .daily-report-page .metric-icon-3d::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 20px;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.28),
            rgba(255,255,255,0.03)
          );
          pointer-events: none;
        }

        .daily-report-page .metric-icon-3d::after {
          content: "";
          position: absolute;
          left: 12px;
          right: 12px;
          top: 8px;
          height: 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
          filter: blur(1px);
          pointer-events: none;
        }

        .daily-report-page .metric-icon-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }

        .daily-report-page .metric-icon-inner svg {
          width: 30px;
          height: 30px;
          stroke-width: 2.3;
          filter: drop-shadow(0 2px 1px rgba(0,0,0,0.18));
        }

        .daily-report-page .metric-card.stat-blue .metric-icon-3d {
          background: linear-gradient(145deg, #4f8cff 0%, #2563eb 55%, #1d4ed8 100%);
        }

        .daily-report-page .metric-card.stat-green .metric-icon-3d {
          background: linear-gradient(145deg, #4ade80 0%, #16a34a 55%, #15803d 100%);
        }

        .daily-report-page .metric-card.stat-red .metric-icon-3d {
          background: linear-gradient(145deg, #f87171 0%, #dc2626 55%, #b91c1c 100%);
        }

        .daily-report-page .metric-label {
          color: #475569;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .daily-report-page .metric-value {
          font-size: 28px;
          font-weight: 800;
          line-height: 1.1;
          color: #0f172a;
        }

        .daily-report-page .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .daily-report-page .info-card,
        .daily-report-page .chart-card {
          border-radius: 24px;
          padding: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #f8fafc;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .daily-report-page .mini-card-title {
          margin: 0 0 16px;
          color: #0f172a;
          font-size: 18px;
          font-weight: 800;
        }

        .daily-report-page .center-text {
          text-align: center;
        }

        .daily-report-page .muted-info {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .daily-report-page .list-scroll {
          max-height: 260px;
          overflow-y: auto;
        }

        .daily-report-page .summary-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .daily-report-page .list-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          padding: 10px 12px;
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.06);
          color: #334155;
          font-size: 14px;
        }

        .daily-report-page .count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          padding: 6px 10px;
          border-radius: 999px;
          background: hsla(160, 40%, 42%, 0.14);
          color: hsl(160, 55%, 22%);
          font-weight: 800;
          font-size: 12px;
        }

        .daily-report-page .chart-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .daily-report-page .chart-wrap {
          height: 300px;
          position: relative;
        }

        .daily-report-page .table-wrap {
          overflow-x: auto;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
        }

        .daily-report-page .report-table {
          width: 100%;
          min-width: 1100px;
          border-collapse: collapse;
        }

        .daily-report-page .report-table thead tr {
          background: #f1f5f9;
        }

        .daily-report-page .report-table th {
          padding: 18px 20px;
          text-align: left;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .daily-report-page .report-table td {
          padding: 18px 20px;
          color: #475569;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: middle;
        }

        .daily-report-page .report-table tbody tr:hover {
          background: hsla(160, 35%, 42%, 0.08);
        }

        .daily-report-page .customer-name {
          font-weight: 700;
          color: #0f172a;
        }

        .daily-report-page .items-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13px;
        }

        .daily-report-page .status-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 96px;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }

        .daily-report-page .status-success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
        }

        .daily-report-page .status-primary {
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #93c5fd;
        }

        .daily-report-page .status-neutral {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .daily-report-page .status-warning {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fcd34d;
        }

        .daily-report-page .empty-info-box {
          border-radius: 18px;
          border: 1px dashed #cbd5e1;
          background: #f8fafc;
          padding: 24px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        @media (max-width: 1200px) {
          .daily-report-page .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .daily-report-page .summary-grid,
          .daily-report-page .chart-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .daily-report-page {
            padding: 18px 12px;
          }

          .daily-report-page .page-shell {
            width: calc(100% - 12px);
          }

          .daily-report-page .hero-card,
          .daily-report-page .glass-card {
            padding: 20px;
            border-radius: 22px;
          }

          .daily-report-page .control-row {
            flex-direction: column;
            align-items: stretch;
          }

          .daily-report-page .control-field,
          .daily-report-page .action-btn {
            width: 100%;
            
          }

          .daily-report-page .stats-grid {
            grid-template-columns: 1fr;
          }

          .daily-report-page .section-title {
            font-size: 24px;
          }

          .daily-report-page .metric-value {
            font-size: 24px;
          }

          .daily-report-page .metric-icon-3d {
            width: 64px;
            height: 64px;
            min-width: 64px;
            border-radius: 20px;
          }

          .daily-report-page .metric-icon-inner svg {
            width: 26px;
            height: 26px;
          }

          .daily-report-page .chart-wrap {
            height: 260px;
          }
        }
      `}</style>
    </div>
  );
};

export default DailyReport;