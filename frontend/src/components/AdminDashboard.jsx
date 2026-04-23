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
  Legend
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  ShoppingCart,
  CreditCard,
  Truck,
  Percent,
  Gift,
  Wrench,
  Wallet,
  TrendingDown,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
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
    const linkId = "gasma-admin-dashboard-poppins-css";
    if (document.getElementById(linkId)) return;

    const preGoogle = document.createElement("link");
    preGoogle.rel = "preconnect";
    preGoogle.href = "https://fonts.googleapis.com";

    const preGstatic = document.createElement("link");
    preGstatic.rel = "preconnect";
    preGstatic.href = "https://fonts.gstatic.com";
    preGstatic.crossOrigin = "anonymous";

    const fontSheet = document.createElement("link");
    fontSheet.id = linkId;
    fontSheet.rel = "stylesheet";
    fontSheet.href =
      "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap";

    document.head.appendChild(preGoogle);
    document.head.appendChild(preGstatic);
    document.head.appendChild(fontSheet);
  }, []);

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
          const lastOfMonth = new Date(
            todayMonth.getFullYear(),
            todayMonth.getMonth() + 1,
            0
          );
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

      setSummary((prev) => ({
        ...prev,
        ...res.data
      }));
    } catch (err) {
      console.error("Failed to load dashboard summary:", err.message);
      alert("Failed to load admin summary");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const currentFilterLabel =
    filterType === "today"
      ? "Today"
      : filterType === "thisWeek"
        ? "This Week"
        : filterType === "thisMonth"
          ? "This Month"
          : "Custom Range";

  const chartColors = {
    text: "#334155",
    muted: "#64748B",
    grid: "rgba(15,23,42,0.08)",
    tooltipBg: "rgba(255, 255, 255, 0.98)",
    tooltipTitle: "#0F172A",
    tooltipBody: "#334155",
    tooltipBorder: "rgba(15,23,42,0.08)"
  };

  const orderTypeData = summary.orderTypeSummary || {
    dineIn: { count: 0, total: 0 },
    takeaway: { count: 0, total: 0 },
    delivery: { count: 0, total: 0 }
  };

  const orderTypeChartData = {
    labels: ["Dine-In", "Takeaway - Customer Pickup", "Takeaway - Delivery Service"],
    datasets: [
      {
        label: "Number of Orders",
        data: [
          orderTypeData.dineIn.count,
          orderTypeData.takeaway.count,
          orderTypeData.delivery.count
        ],
        backgroundColor: "rgba(59, 130, 246, 0.75)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 8,
        yAxisID: "y"
      },
      {
        label: "Total Income",
        data: [
          orderTypeData.dineIn.total,
          orderTypeData.takeaway.total,
          orderTypeData.delivery.total
        ],
        backgroundColor: "rgba(239, 68, 68, 0.75)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
        borderRadius: 8,
        yAxisID: "y1"
      }
    ]
  };

  const orderTypeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    font: {
      family: "'Poppins', system-ui, -apple-system, sans-serif"
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: chartColors.text,
          usePointStyle: true,
          padding: 18
        }
      },
      tooltip: {
        backgroundColor: chartColors.tooltipBg,
        titleColor: chartColors.tooltipTitle,
        bodyColor: chartColors.tooltipBody,
        borderColor: chartColors.tooltipBorder,
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: chartColors.muted },
        grid: { color: chartColors.grid }
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        ticks: { color: chartColors.muted },
        grid: { color: chartColors.grid },
        title: {
          display: true,
          text: "Order Count",
          color: chartColors.text
        }
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        ticks: { color: chartColors.muted },
        grid: { drawOnChartArea: false },
        title: {
          display: true,
          text: `Total Income (${symbol})`,
          color: chartColors.text
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    font: {
      family: "'Poppins', system-ui, -apple-system, sans-serif"
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: chartColors.text,
          usePointStyle: true,
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: chartColors.tooltipBg,
        titleColor: chartColors.tooltipTitle,
        bodyColor: chartColors.tooltipBody,
        borderColor: chartColors.tooltipBorder,
        borderWidth: 1
      }
    }
  };

  const costChartData = {
    labels: ["Supplier Expenses", "Utility Bills", "Staff Salaries", "Other Expenses"],
    datasets: [
      {
        label: "Expenses",
        data: [
          summary.totalSupplierExpenses,
          summary.totalBills,
          summary.totalSalaries,
          summary.totalOtherExpenses
        ],
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(168, 85, 247, 0.8)"
        ],
        borderWidth: 0
      }
    ]
  };

  const statusChartData = {
    labels: Object.keys(summary.statusCounts || {}),
    datasets: [
      {
        label: "Order Status",
        data: Object.values(summary.statusCounts || {}),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)"
        ],
        hoverOffset: 4,
        borderWidth: 0
      }
    ]
  };

  const paymentChartData = {
    labels: ["Cash", "Card", "Bank Transfer"],
    datasets: [
      {
        label: "Payment Methods",
        data: [
          summary.paymentBreakdown.cash - summary.paymentBreakdown.cashdue,
          summary.paymentBreakdown.card,
          summary.paymentBreakdown.bank
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(249, 115, 22, 0.8)"
        ],
        borderWidth: 0
      }
    ]
  };

  const summaryCards = [
    {
      label: (
        <>
          Total Orders
          <br />
        </>
      ),
      value: `${summary.totalOrders}`,
      colorClass: "summary-blue",
      icon: ShoppingCart
    },
    {
      label: (
        <>
          Orders Income
          <br />
          ( Net Income )
        </>
      ),
      value: (
        <>
          {symbol}
          {formatCurrency(summary.totalOrdersIncome)}
          <br />
          ( {symbol}
          {formatCurrency(summary.totalOrdersNetIncome)} )
        </>
      ),
      colorClass: "summary-blue",
      icon: CreditCard
    },
    {
      label: (
        <>
          Delivery Orders
          <br />
          ( Total Delivery Charges )
        </>
      ),
      value: (
        <>
          {summary.totaldeliveryOrders}
          <br />
          ( {symbol}
          {formatCurrency(summary.totaldeliveryOrdersIncome)} )
        </>
      ),
      colorClass: "summary-cyan",
      icon: Truck
    },
    {
      label: (
        <>
          Total Dine-In Orders
          <br />
          ( Total Service Charge )
        </>
      ),
      value: (
        <>
          {summary.totalTableOrders}
          <br />
          ( {symbol}
          {formatCurrency(summary.totalServiceChargeIncome)} )
        </>
      ),
      colorClass: "summary-purple",
      icon: Percent
    },
    {
      label: "Other Income",
      value: `${symbol}${formatCurrency(summary.totalOtherIncome)}`,
      colorClass: "summary-green",
      icon: Gift
    },
    {
      label: "Other Expenses",
      value: `${symbol}${formatCurrency(summary.totalOtherExpenses)}`,
      colorClass: "summary-orange",
      icon: Wrench
    },
    {
      label: "Total Income",
      value: `${symbol}${formatCurrency(summary.totalIncome)}`,
      colorClass: "summary-green",
      icon: Wallet
    },
    {
      label: "Total Cost",
      value: `${symbol}${formatCurrency(summary.totalCost)}`,
      colorClass: "summary-red",
      icon: TrendingDown
    },
    {
      label: "Net Profit",
      value: `${summary.netProfit >= 0 ? "+" : "-"}${symbol}${formatCurrency(
        Math.abs(summary.netProfit)
      )}`,
      colorClass: summary.netProfit >= 0 ? "summary-cyan" : "summary-red",
      icon: summary.netProfit >= 0 ? TrendingUp : AlertTriangle
    }
  ];

  if (loading) {
    return (
      <>
        <style>{`
          /* Override .dashboard-alpha-root (Outfit/Inter) and Bootstrap form/button fonts */
          .dashboard-alpha-root .admin-page-wrapper,
          .admin-page-wrapper {
            font-family: "Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
            min-height: 100vh;
            padding-bottom: 32px;
            color: #0f172a;
            background: transparent;
            transition: color 0.3s ease;
          }
          .dashboard-alpha-root .admin-page-wrapper *,
          .admin-page-wrapper * {
            font-family: "Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
          }
        `}</style>

        <div className="admin-page-wrapper d-flex justify-content-center align-items-center py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading Admin Dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        /* Override .dashboard-alpha-root (Outfit/Inter) and Bootstrap form/button fonts */
        .dashboard-alpha-root .admin-page-wrapper,
        .admin-page-wrapper {
          font-family: "Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
          min-height: 100vh;
          padding-bottom: 32px;
          color: #0f172a;
          background: transparent;
          transition: color 0.3s ease;

          --card-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
          --card-bg-soft: linear-gradient(135deg, rgba(255, 255, 255, 0.99), rgba(255, 255, 255, 0.94));
          --card-border: rgba(15, 23, 42, 0.08);

          --text-main: #0f172a;
          --text-soft: #64748b;
          --text-strong: #111827;

          --chip-bg: hsla(160, 45%, 40%, 0.12);
          --chip-text: hsl(160, 100%, 20%);
          --chip-border: hsla(160, 50%, 32%, 0.2);

          --input-bg: rgba(248, 250, 252, 0.98);
          --input-border: rgba(15, 23, 42, 0.1);

          --table-head: hsla(160, 35%, 38%, 0.1);
          --table-row-hover: hsla(160, 30%, 40%, 0.06);

          --list-bg: rgba(255, 255, 255, 0.9);
          --list-border: rgba(15, 23, 42, 0.07);

          --hero-side-bg: rgba(255, 255, 255, 0.88);

          --shadow-lg: 0 20px 45px rgba(15, 23, 42, 0.08);
          --shadow-md: 0 14px 34px rgba(15, 23, 42, 0.07);
          --shadow-sm: 0 10px 28px rgba(15, 23, 42, 0.06);
        }

        .dashboard-alpha-root .admin-page-wrapper *,
        .admin-page-wrapper * {
          font-family: "Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }

        .hero-card {
          background: var(--card-bg-soft);
          border: 1px solid var(--card-border);
          color: var(--text-main);
          border-radius: 30px;
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          box-shadow: var(--shadow-lg);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(12px);
        }

        .hero-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            hsla(160, 40%, 42%, 0.06),
            transparent 40%,
            rgba(255, 255, 255, 0.04)
          );
          pointer-events: none;
        }

        .hero-chip {
          display: inline-block;
          background: var(--chip-bg);
          color: var(--chip-text);
          border: 1px solid var(--chip-border);
          padding: 7px 15px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 14px;
          text-transform: uppercase;
        }

        .hero-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 10px;
          color: var(--text-strong);
        }

        .hero-text {
          max-width: 760px;
          color: var(--text-soft);
          margin-bottom: 0;
        }

        .hero-side-box {
          min-width: 220px;
          padding: 18px 20px;
          border-radius: 20px;
          background: var(--hero-side-bg);
          border: 1px solid var(--card-border);
          text-align: center;
          backdrop-filter: blur(10px);
          color: var(--text-main);
        }

        .hero-side-box span {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          color: #60a5fa;
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }

        .section-card,
        .chart-card {
          background: var(--card-bg-soft);
          border: 1px solid var(--card-border);
          border-radius: 28px;
          padding: 24px;
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(12px);
          height: 100%;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-strong);
          margin-bottom: 4px;
        }

        .section-subtitle {
          color: var(--text-soft);
          margin-bottom: 0;
        }

        .glass-label {
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
          display: block;
        }

        .glass-input,
        .glass-select {
          background: var(--input-bg) !important;
          border: 1px solid var(--input-border) !important;
          color: var(--text-main) !important;
          border-radius: 16px !important;
          min-height: 52px;
          padding: 12px 16px !important;
          box-shadow: none !important;
        }

        .glass-input:focus,
        .glass-select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.18) !important;
        }

        .glass-select option {
          color: #111827;
        }

        .glass-btn {
          border: none;
          border-radius: 16px;
          padding: 12px 18px;
          font-weight: 700;
          color: #fff;
          transition: all 0.25s ease;
          box-shadow: 0 12px 24px rgba(0,0,0,0.16);
        }

        .glass-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
          color: #fff;
        }

        .btn-blue {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
        }

        .summary-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 24px;
          padding: 22px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          height: 100%;
          box-shadow: var(--shadow-sm);
          transition: all 0.25s ease;
          backdrop-filter: blur(10px);
        }

        .summary-card:hover {
          transform: translateY(-4px);
        }

        .summary-icon-3d {
          width: 66px;
          height: 66px;
          min-width: 66px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          color: #ffffff;
          position: relative;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.35),
            0 14px 24px rgba(15, 23, 42, 0.16),
            0 6px 10px rgba(15, 23, 42, 0.08);
          transform: translateY(0);
        }

        .summary-icon-3d::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.02));
          pointer-events: none;
        }

        .summary-icon-3d::after {
          content: "";
          position: absolute;
          left: 10px;
          right: 10px;
          top: 7px;
          height: 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
          filter: blur(1px);
          pointer-events: none;
        }

        .summary-icon-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .summary-icon-inner svg {
          width: 28px;
          height: 28px;
          stroke-width: 2.3;
          filter: drop-shadow(0 2px 1px rgba(0,0,0,0.18));
        }

        .summary-label {
          margin-bottom: 6px;
          color: var(--text-soft);
          font-size: 0.92rem;
          font-weight: 600;
        }

        .summary-value {
          margin: 0;
          font-size: 1.08rem;
          font-weight: 800;
          color: var(--text-strong);
          line-height: 1.45;
        }

        .summary-blue {
          background:
            linear-gradient(145deg, #4f8cff 0%, #2563eb 55%, #1d4ed8 100%);
        }

        .summary-cyan {
          background:
            linear-gradient(145deg, #22d3ee 0%, #0891b2 55%, #0e7490 100%);
        }

        .summary-purple {
          background:
            linear-gradient(145deg, #a78bfa 0%, #7c3aed 55%, #6d28d9 100%);
        }

        .summary-green {
          background:
            linear-gradient(145deg, #4ade80 0%, #16a34a 55%, #15803d 100%);
        }

        .summary-orange {
          background:
            linear-gradient(145deg, #fb923c 0%, #ea580c 55%, #c2410c 100%);
        }

        .summary-red {
          background:
            linear-gradient(145deg, #f87171 0%, #dc2626 55%, #b91c1c 100%);
        }

        .chart-wrap-lg {
          height: 420px;
        }

        .chart-wrap-md {
          height: 320px;
        }

        .table-shell {
          background: var(--list-bg);
          border: 1px solid var(--list-border);
          border-radius: 22px;
          overflow: hidden;
        }

        .dashboard-table {
          color: var(--text-main);
          margin-bottom: 0;
        }

        .dashboard-table thead th {
          background: var(--table-head);
          color: var(--text-main);
          font-size: 0.84rem;
          font-weight: 800;
          padding: 16px 14px;
          border: none;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          white-space: nowrap;
        }

        .dashboard-table tbody td {
          padding: 14px;
          border-top: 1px solid var(--list-border);
          color: var(--text-main);
          vertical-align: middle;
          background: transparent;
        }

        .dashboard-table tbody tr:hover {
          background: var(--table-row-hover);
        }

        .list-shell {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .list-item {
          background: var(--list-bg);
          border: 1px solid var(--list-border);
          border-radius: 18px;
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .list-title {
          color: var(--text-main);
          font-weight: 700;
        }

        .list-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 42px;
          height: 32px;
          border-radius: 12px;
          background: rgba(59,130,246,0.16);
          color: #3b82f6;
          border: 1px solid rgba(59,130,246,0.2);
          font-weight: 800;
          padding: 0 10px;
        }

        .money-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 70px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(34,197,94,0.14);
          color: #16a34a;
          border: 1px solid rgba(34,197,94,0.16);
          font-weight: 800;
        }

        .empty-box {
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: var(--text-soft);
        }

        .empty-icon {
          font-size: 40px;
          margin-bottom: 10px;
        }

        @media (max-width: 992px) {
          .hero-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-side-box {
            width: 100%;
          }

          .chart-wrap-lg {
            height: 360px;
          }
        }

        @media (max-width: 576px) {
          .hero-title {
            font-size: 1.55rem;
          }

          .hero-card,
          .section-card,
          .summary-card,
          .chart-card {
            padding: 18px;
            border-radius: 20px;
          }

          .summary-icon-3d {
            width: 58px;
            height: 58px;
            min-width: 58px;
            border-radius: 18px;
          }

          .summary-icon-inner svg {
            width: 24px;
            height: 24px;
          }

          .chart-wrap-lg {
            height: 300px;
          }

          .chart-wrap-md {
            height: 260px;
          }

          .list-item {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="admin-page-wrapper">
        <div className="container py-4">
          <div className="hero-card mb-4">
            <div>
              <span className="hero-chip">Analytics Overview</span>
              <h1 className="hero-title">Admin Dashboard</h1>
              <p className="hero-text">
                View revenue, costs, orders, payment insights, service charges, and
                delivery performance in one modern management dashboard.
              </p>
            </div>

            <div className="hero-side-box">
              <span>Current Filter</span>
              <strong>{currentFilterLabel}</strong>
            </div>
          </div>

          <div className="section-card mb-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-end gap-4">
              <div>
                <h4 className="section-title">Filter Dashboard</h4>
                <p className="section-subtitle">
                  Select a timeframe to refresh your business summary and charts.
                </p>
              </div>

              <div className="row g-3 w-100">
                <div className="col-md-3">
                  <label className="glass-label">Select Timeframe</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="form-select glass-select"
                  >
                    <option value="today">Today</option>
                    <option value="thisWeek">This Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {filterType === "custom" && (
                  <>
                    <div className="col-md-3">
                      <label className="glass-label">From</label>
                      <input
                        type="date"
                        className="form-control glass-input"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="glass-label">To</label>
                      <input
                        type="date"
                        className="form-control glass-input"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="col-md-3 d-flex align-items-end">
                  <button onClick={fetchSummary} className="glass-btn btn-blue w-100">
                    Apply Filter
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            {summaryCards.map((card, idx) => {
              const IconComponent = card.icon;
              return (
                <div className="col-md-6 col-xl-4" key={idx}>
                  <div className="summary-card">
                    <div className={`summary-icon-3d ${card.colorClass}`}>
                      <div className="summary-icon-inner">
                        <IconComponent />
                      </div>
                    </div>

                    <div>
                      <p className="summary-label">{card.label}</p>
                      <h5 className="summary-value">{card.value}</h5>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="chart-card mb-4">
            <div className="mb-3">
              <h4 className="section-title">Orders by Type & Delivery Place</h4>
              <p className="section-subtitle">
                Compare order counts and total income by order type.
              </p>
            </div>
            <div className="chart-wrap-lg">
              <Bar data={orderTypeChartData} options={orderTypeChartOptions} />
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <div className="chart-card">
                <div className="mb-3">
                  <h4 className="section-title">Order Status</h4>
                  <p className="section-subtitle">Current order state distribution.</p>
                </div>
                <div className="chart-wrap-md">
                  <Doughnut data={statusChartData} options={doughnutOptions} />
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="chart-card">
                <div className="mb-3">
                  <h4 className="section-title">Payment Methods</h4>
                  <p className="section-subtitle">Revenue split by payment type.</p>
                </div>
                <div className="chart-wrap-md">
                  <Doughnut data={paymentChartData} options={doughnutOptions} />
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="chart-card">
                <div className="mb-3">
                  <h4 className="section-title">Cost Breakdown</h4>
                  <p className="section-subtitle">Main expense categories.</p>
                </div>
                <div className="chart-wrap-md">
                  <Doughnut data={costChartData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <div className="section-card h-100">
                <div className="mb-3">
                  <h4 className="section-title">Top Ordered Menu Items</h4>
                  <p className="section-subtitle">Best-selling menu items.</p>
                </div>

                {summary.topMenus.length === 0 ? (
                  <div className="empty-box">
                    <div className="empty-icon">🍽️</div>
                    <p className="mb-0">No data</p>
                  </div>
                ) : (
                  <div className="list-shell">
                    {summary.topMenus.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="list-item">
                        <span className="list-title">{item.name}</span>
                        <span className="list-badge">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="section-card h-100">
                <div className="mb-3">
                  <h4 className="section-title">Order Summary</h4>
                  <p className="section-subtitle">Status totals and delay metrics.</p>
                </div>

                <div className="table-responsive table-shell">
                  <table className="table dashboard-table align-middle">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(summary.statusCounts).map(([status, count], idx) => (
                        <tr key={idx}>
                          <td>{status}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                      <tr>
                        <td>Delayed Completed</td>
                        <td>{summary.delayedOrders}</td>
                      </tr>
                      <tr>
                        <td>Delayed Completed (Day After)</td>
                        <td>{summary.nextDayStatusUpdates}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="section-card h-100">
                <div className="mb-3">
                  <h4 className="section-title">Payment Summary</h4>
                  <p className="section-subtitle">Amount received by payment method.</p>
                </div>

                <div className="table-responsive table-shell">
                  <table className="table dashboard-table align-middle">
                    <thead>
                      <tr>
                        <th>Method</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        [
                          "Cash",
                          summary.paymentBreakdown.cash - summary.paymentBreakdown.cashdue
                        ],
                        ["Card", summary.paymentBreakdown.card],
                        ["Bank Transfer", summary.paymentBreakdown.bank]
                      ].map(([label, val], idx) => (
                        <tr key={idx}>
                          <td>{label}</td>
                          <td>
                            {symbol}
                            {formatCurrency(val)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="section-card mb-4">
            <div className="mb-3">
              <h4 className="section-title">Waiters – Total Service Charge Earned</h4>
              <p className="section-subtitle">
                Highest service charge contribution by waiter.
              </p>
            </div>

            {summary.waiterServiceEarnings?.length > 0 ? (
              <div className="list-shell">
                {summary.waiterServiceEarnings.slice(0, 10).map((entry, idx) => (
                  <div key={idx} className="list-item">
                    <span className="list-title">
                      {entry.waiterName || "Unknown Waiter"}
                    </span>
                    <span className="money-badge">
                      {symbol}
                      {formatCurrency(entry.totalServiceCharge)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-box">
                <div className="empty-icon">🧑‍🍳</div>
                <p className="mb-0">No waiter service charge data available</p>
              </div>
            )}
          </div>

          <div className="section-card">
            <div className="mb-3">
              <h4 className="section-title">Delivery Places – Order Count & Revenue</h4>
              <p className="section-subtitle">
                Revenue and order volume by delivery place.
              </p>
            </div>

            {summary.deliveryPlacesBreakdown?.length > 0 ? (
              <div className="table-responsive table-shell">
                <table className="table dashboard-table align-middle">
                  <thead>
                    <tr>
                      <th>Place</th>
                      <th>Orders</th>
                      <th>Revenue ({symbol})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.deliveryPlacesBreakdown.map((place, idx) => (
                      <tr key={idx}>
                        <td>{place.placeName}</td>
                        <td>{place.count}</td>
                        <td>{formatCurrency(place.totalCharge)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-box">
                <div className="empty-icon">📍</div>
                <p className="mb-0">No delivery place data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;