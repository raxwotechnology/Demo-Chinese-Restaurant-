import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import {
  FaMoneyBillWave,
  FaTruckLoading,
  FaFileInvoiceDollar,
  FaUserTie,
  FaChartPie,
  FaBalanceScale,
  FaGift,
  FaTools,
  FaChartBar
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    const fetchReport = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/report/monthly?month=${parseInt(month) + 1}&year=${parseInt(year)}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setReportData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load report:", err.response?.data || err.message);
        alert("Failed to load monthly report");
        setLoading(false);
      }
    };

    fetchReport();
  }, [month, year]);

  const getDatesInMonth = (yearValue, monthValue) => {
    const numDays = new Date(yearValue, monthValue, 0).getDate();
    const dates = [];

    for (let i = 1; i <= numDays; i++) {
      const dateStr = `${yearValue}-${String(monthValue).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      dates.push(dateStr);
    }

    return dates;
  };

  if (loading) {
    return (
      <>
        <style>{`
          .monthly-report-loading.report-page-wrapper {
            min-height: 100vh;
            background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
            color: #334155;
          }
          .monthly-report-loading .monthly-report-loading-text {
            color: #64748b;
          }
        `}</style>
        <div className="report-page-wrapper monthly-report-loading d-flex justify-content-center align-items-center">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 mb-0 monthly-report-loading-text">Loading Monthly Report...</p>
          </div>
        </div>
      </>
    );
  }

  if (
    !reportData ||
    !reportData.monthlyIncome ||
    !reportData.monthlySupplierExpenses ||
    !reportData.monthlyBills ||
    !reportData.monthlySalaries
  ) {
    return (
      <>
        <style>{`
          .monthly-report-loading.report-page-wrapper {
            min-height: 100vh;
            background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
            color: #334155;
          }
        `}</style>
        <div className="report-page-wrapper monthly-report-loading d-flex justify-content-center align-items-center">
          <div className="text-center monthly-report-loading-text">No data found</div>
        </div>
      </>
    );
  }

  const allDates = getDatesInMonth(year, parseInt(month) + 1);

  const incomeData = allDates.map((date) => reportData.monthlyIncome[date] || 0);
  const supplierExpenseData = allDates.map(
    (date) => reportData.monthlySupplierExpenses[date] || 0
  );
  const billData = allDates.map((date) => reportData.monthlyBills[date] || 0);
  const salaryData = allDates.map((date) => reportData.monthlySalaries[date] || 0);
  const otherIncomeData = allDates.map(
    (date) => reportData.monthlyOtherIncome?.[date] || 0
  );
  const otherExpenseData = allDates.map(
    (date) => reportData.monthlyOtherExpenses?.[date] || 0
  );

  const totalSupplierExpenses = supplierExpenseData.reduce((a, b) => a + b, 0);
  const totalBills = billData.reduce((a, b) => a + b, 0);
  const totalSalaries = salaryData.reduce((a, b) => a + b, 0);
  const totalOtherIncome = otherIncomeData.reduce((a, b) => a + b, 0);
  const totalOtherExpenses = otherExpenseData.reduce((a, b) => a + b, 0);

  const totalExpenses =
    totalSupplierExpenses +
    totalBills +
    totalSalaries +
    totalOtherExpenses;

  const totalIncome = incomeData.reduce((a, b) => a + b, 0) + totalOtherIncome;
  const netProfit = totalIncome - totalExpenses;

  const monthLabel = new Date(year, month).toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  const chartData = {
    labels: allDates.map((date) => date.split("-")[2]),
    datasets: [
      {
        label: `Income (${symbol})`,
        backgroundColor: "rgba(34, 197, 94, 0.75)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
        borderRadius: 6,
        data: incomeData
      },
      {
        label: `Other Income (${symbol})`,
        backgroundColor: "rgba(168, 85, 247, 0.75)",
        borderColor: "rgba(168, 85, 247, 1)",
        borderWidth: 1,
        borderRadius: 6,
        data: otherIncomeData
      },
      {
        label: `Suppliers (${symbol})`,
        backgroundColor: "rgba(239, 68, 68, 0.75)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
        borderRadius: 6,
        data: supplierExpenseData
      },
      {
        label: `Kitchen Bills (${symbol})`,
        backgroundColor: "rgba(245, 158, 11, 0.75)",
        borderColor: "rgba(245, 158, 11, 1)",
        borderWidth: 1,
        borderRadius: 6,
        data: billData
      },
      {
        label: `Salaries (${symbol})`,
        backgroundColor: "rgba(59, 130, 246, 0.75)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 6,
        data: salaryData
      },
      {
        label: `Other Expenses (${symbol})`,
        backgroundColor: "rgba(251, 146, 60, 0.75)",
        borderColor: "rgba(251, 146, 60, 1)",
        borderWidth: 1,
        borderRadius: 6,
        data: otherExpenseData
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#475569",
          usePointStyle: true,
          boxWidth: 10,
          padding: 18,
          font: { size: 12, weight: "600" }
        }
      },
      title: {
        display: true,
        text: `Monthly Report - ${monthLabel}`,
        color: "#0f172a",
        font: {
          size: 18,
          weight: "bold"
        }
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        titleColor: "#0f172a",
        bodyColor: "#334155",
        borderColor: "rgba(15, 23, 42, 0.12)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#64748b"
        },
        grid: {
          color: "rgba(15, 23, 42, 0.06)"
        }
      },
      y: {
        ticks: {
          color: "#64748b"
        },
        grid: {
          color: "rgba(15, 23, 42, 0.06)"
        }
      }
    }
  };

  const summaryCards = [
    {
      title: "Total Income",
      value: `${symbol}${totalIncome.toFixed(2)}`,
      icon: <FaMoneyBillWave />,
      colorClass: "report-green"
    },
    {
      title: "Total Expenses",
      value: `${symbol}${totalExpenses.toFixed(2)}`,
      icon: <FaChartPie />,
      colorClass: "report-red"
    },
    {
      title: "Net Profit",
      value: `${symbol}${netProfit.toFixed(2)}`,
      icon: <FaBalanceScale />,
      colorClass: netProfit >= 0 ? "report-cyan" : "report-red"
    },
    {
      title: "Other Income",
      value: `${symbol}${totalOtherIncome.toFixed(2)}`,
      icon: <FaGift />,
      colorClass: "report-purple"
    },
    {
      title: "Other Expenses",
      value: `${symbol}${totalOtherExpenses.toFixed(2)}`,
      icon: <FaTools />,
      colorClass: "report-orange"
    },
    {
      title: "Supplier Expenses",
      value: `${symbol}${totalSupplierExpenses.toFixed(2)}`,
      icon: <FaTruckLoading />,
      colorClass: "report-slate"
    },
    {
      title: "Kitchen Bills",
      value: `${symbol}${totalBills.toFixed(2)}`,
      icon: <FaFileInvoiceDollar />,
      colorClass: "report-yellow"
    },
    {
      title: "Salaries",
      value: `${symbol}${totalSalaries.toFixed(2)}`,
      icon: <FaUserTie />,
      colorClass: "report-blue"
    }
  ];

  return (
    <>
      <style>{`
        .monthly-report-page.report-page-wrapper {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          // background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
          color: #1e293b;
          padding-bottom: 32px;
        }

        // .monthly-report-page.report-page-wrapper::before {
        //   content: "";
        //   position: fixed;
        //   inset: 0;
        //   background-image:
        //     linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
        //     linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
        //   background-size: 40px 40px;
        //   pointer-events: none;
        //   mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.03));
        //   z-index: 0;
        // }

        .monthly-report-page .container {
          position: relative;
          z-index: 1;
        }

        .monthly-report-page .report-hero-card {
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.96) 100%
          );
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: #0f172a;
          border-radius: 30px;
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          box-shadow:
            0 20px 50px rgba(15, 23, 42, 0.07),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .monthly-report-page .report-hero-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            hsla(160, 40%, 42%, 0.06),
            transparent 40%,
            rgba(59, 130, 246, 0.04)
          );
          pointer-events: none;
        }

        .monthly-report-page .report-hero-card > * {
          position: relative;
          z-index: 1;
        }

        .monthly-report-page .hero-chip {
          display: inline-block;
          background: hsla(160, 40%, 42%, 0.12);
          color: hsl(160, 55%, 24%);
          border: 1px solid hsla(160, 45%, 35%, 0.22);
          padding: 7px 15px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 14px;
          text-transform: uppercase;
        }

        .monthly-report-page .hero-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 10px;
          color: #0f172a;
        }

        .monthly-report-page .hero-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .monthly-report-page .report-hero-icon-3d {
          width: 52px;
          height: 52px;
          min-width: 52px;
          border-radius: 17px;
          display: grid;
          place-items: center;
          color: #ffffff;
          position: relative;
          flex-shrink: 0;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.38),
            0 14px 26px rgba(15, 23, 42, 0.16),
            0 6px 10px rgba(15, 23, 42, 0.08);
        }

        .monthly-report-page .report-hero-icon-3d::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 15px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0.02));
          pointer-events: none;
        }

        .monthly-report-page .report-hero-icon-3d::after {
          content: "";
          position: absolute;
          left: 10px;
          right: 10px;
          top: 7px;
          height: 11px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.2);
          filter: blur(1px);
          pointer-events: none;
        }

        .monthly-report-page .report-hero-icon-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .monthly-report-page .report-hero-icon-inner svg {
          width: 22px;
          height: 22px;
          filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.22));
        }

        .monthly-report-page .report-icon-jade {
          background: linear-gradient(145deg, #34d399 0%, #059669 55%, #047857 100%);
        }

        .monthly-report-page .hero-text {
          max-width: 720px;
          color: #64748b;
          margin-bottom: 0;
        }

        .monthly-report-page .hero-side-box {
          min-width: 210px;
          padding: 18px 20px;
          border-radius: 20px;
          background: rgba(248, 250, 252, 0.95);
          border: 1px solid rgba(15, 23, 42, 0.1);
          text-align: center;
        }

        .monthly-report-page .hero-side-box span {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          color: hsl(160, 42%, 32%);
          margin-bottom: 6px;
          letter-spacing: 0.5px;
          font-weight: 700;
        }

        .monthly-report-page .hero-side-box strong {
          color: #0f172a;
          font-size: 1.1rem;
          font-weight: 800;
        }

        .monthly-report-page .section-card {
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.96) 100%
          );
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 28px;
          padding: 24px;
          box-shadow:
            0 14px 40px rgba(15, 23, 42, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .monthly-report-page .section-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .monthly-report-page .section-subtitle {
          color: #64748b;
          margin-bottom: 0;
        }

        .monthly-report-page .filter-label {
          font-weight: 700;
          color: #334155;
          margin-bottom: 8px;
          display: block;
        }

        .monthly-report-page .filter-input {
          background: #ffffff !important;
          border: 1px solid rgba(15, 23, 42, 0.12) !important;
          color: #0f172a !important;
          border-radius: 16px !important;
          min-height: 52px;
          padding: 12px 16px !important;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
        }

        .monthly-report-page .filter-input:focus {
          border-color: hsla(160, 42%, 40%, 0.55) !important;
          box-shadow: 0 0 0 4px hsla(160, 40%, 42%, 0.14) !important;
          outline: none !important;
        }

        .monthly-report-page .filter-input option {
          color: #0f172a;
        }

        .monthly-report-page .chart-card {
          height: 460px;
        }

        .monthly-report-page .summary-card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          padding: 22px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          height: 100%;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
          transition: all 0.25s ease;
        }

        .monthly-report-page .summary-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.09);
        }

        .monthly-report-page .summary-icon-3d {
          width: 60px;
          height: 60px;
          min-width: 60px;
          border-radius: 19px;
          display: grid;
          place-items: center;
          color: #ffffff;
          position: relative;
          flex-shrink: 0;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.36),
            0 12px 22px rgba(15, 23, 42, 0.14),
            0 5px 9px rgba(15, 23, 42, 0.08);
        }

        .monthly-report-page .summary-icon-3d::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 17px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.02));
          pointer-events: none;
        }

        .monthly-report-page .summary-icon-3d::after {
          content: "";
          position: absolute;
          left: 9px;
          right: 9px;
          top: 6px;
          height: 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.18);
          filter: blur(1px);
          pointer-events: none;
        }

        .monthly-report-page .summary-icon-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .monthly-report-page .summary-icon-inner svg {
          width: 25px;
          height: 25px;
          filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
        }

        .monthly-report-page .summary-label {
          margin-bottom: 6px;
          color: #64748b;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .monthly-report-page .summary-value {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }

        .monthly-report-page .report-green {
          background: linear-gradient(145deg, #4ade80 0%, #16a34a 55%, #15803d 100%);
        }
        .monthly-report-page .report-red {
          background: linear-gradient(145deg, #f87171 0%, #dc2626 55%, #b91c1c 100%);
        }
        .monthly-report-page .report-cyan {
          background: linear-gradient(145deg, #22d3ee 0%, #0891b2 55%, #0e7490 100%);
        }
        .monthly-report-page .report-purple {
          background: linear-gradient(145deg, #c4b5fd 0%, #7c3aed 55%, #5b21b6 100%);
        }
        .monthly-report-page .report-orange {
          background: linear-gradient(145deg, #fb923c 0%, #ea580c 55%, #c2410c 100%);
        }
        .monthly-report-page .report-slate {
          background: linear-gradient(145deg, #94a3b8 0%, #64748b 55%, #475569 100%);
        }
        .monthly-report-page .report-yellow {
          background: linear-gradient(145deg, #fbbf24 0%, #d97706 55%, #b45309 100%);
        }
        .monthly-report-page .report-blue {
          background: linear-gradient(145deg, #4f8cff 0%, #2563eb 55%, #1d4ed8 100%);
        }

        .monthly-report-page .table-shell {
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 22px;
          overflow: hidden;
        }

        .monthly-report-page .report-table {
          color: #334155;
          margin-bottom: 0;
          background: #ffffff;
        }

        .monthly-report-page .report-table thead th {
          background: #f1f5f9;
          color: #475569;
          font-size: 0.84rem;
          font-weight: 800;
          padding: 16px 14px;
          border: none;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          white-space: nowrap;
        }

        .monthly-report-page .report-table tbody td {
          padding: 15px 14px;
          border-top: 1px solid rgba(15, 23, 42, 0.06);
          color: #334155;
          vertical-align: middle;
          background: #ffffff;
        }

        .monthly-report-page .report-table tbody tr:hover td {
          background: #f8fafc;
        }

        .monthly-report-page .amount-pill {
          display: inline-flex;
          padding: 7px 12px;
          border-radius: 999px;
          background: hsla(217, 91%, 45%, 0.1);
          color: #1d4ed8;
          border: 1px solid hsla(217, 85%, 40%, 0.18);
          font-weight: 700;
          font-size: 0.84rem;
        }

        .monthly-report-page .date-pill {
          display: inline-flex;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(241, 245, 249, 0.95);
          color: #475569;
          border: 1px solid rgba(15, 23, 42, 0.1);
          font-weight: 700;
          font-size: 0.84rem;
        }

        .monthly-report-page .net-positive {
          color: #15803d !important;
          font-weight: 800;
        }

        .monthly-report-page .net-negative {
          color: #b91c1c !important;
          font-weight: 800;
        }

        @media (max-width: 992px) {
          .monthly-report-page .report-hero-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .monthly-report-page .hero-side-box {
            width: 100%;
          }

          .monthly-report-page .chart-card {
            height: 380px;
          }
        }

        @media (max-width: 576px) {
          .monthly-report-page .hero-title {
            font-size: 1.55rem;
          }

          .monthly-report-page .report-hero-card,
          .monthly-report-page .section-card,
          .monthly-report-page .summary-card {
            padding: 18px;
            border-radius: 20px;
          }

          .monthly-report-page .summary-icon-3d {
            width: 54px;
            height: 54px;
            min-width: 54px;
            border-radius: 17px;
          }

          .monthly-report-page .summary-icon-3d::before {
            border-radius: 15px;
          }

          .monthly-report-page .summary-icon-inner svg {
            width: 22px;
            height: 22px;
          }

          .monthly-report-page .chart-card {
            height: 320px;
          }
        }
      `}</style>

      <div className="report-page-wrapper monthly-report-page">
        <div className="container py-4">
          <div className="report-hero-card mb-4">
            <div>
              <span className="hero-chip">Financial Analytics</span>
              <h1 className="hero-title hero-title-row">
                <span className="report-hero-icon-3d report-icon-jade" aria-hidden>
                  <span className="report-hero-icon-inner">
                    <FaChartBar />
                  </span>
                </span>
                <span>Monthly Income & Expense Report</span>
              </h1>
              <p className="hero-text">
                Analyze monthly income, expenses, profit, and daily performance in a clean, modern admin dashboard.
              </p>
            </div>

            <div className="hero-side-box">
              <span>Current View</span>
              <strong>{monthLabel}</strong>
            </div>
          </div>

          <div className="section-card mb-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-end gap-4">
              <div>
                <h4 className="section-title">Filter Report</h4>
                <p className="section-subtitle">
                  Select a month and year to view the financial summary.
                </p>
              </div>

              <div className="d-flex flex-wrap gap-3">
                <div>
                  <label className="filter-label">Select Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="form-select filter-input"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i}>
                        {new Date(year, i).toLocaleString("default", {
                          month: "long"
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="filter-label">Select Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="form-control filter-input"
                    min="2020"
                    max="2030"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="section-card chart-card mb-4">
            <div className="h-100">
              <Bar data={chartData} options={options} />
            </div>
          </div>

          <div className="mb-4">
            <h4 className="section-title mb-3">Summary - {monthLabel}</h4>
            <div className="row g-4">
              {summaryCards.map((card, index) => (
                <div className="col-xl-3 col-md-6" key={index}>
                  <div className="summary-card">
                    <div className={`summary-icon-3d ${card.colorClass}`} aria-hidden>
                      <div className="summary-icon-inner">{card.icon}</div>
                    </div>
                    <div>
                      <p className="summary-label">{card.title}</p>
                      <h5 className="summary-value">{card.value}</h5>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="mb-3">
              <h4 className="section-title">Daily Breakdown</h4>
              <p className="section-subtitle">
                View day-by-day income, expenses, and net result for the selected month.
              </p>
            </div>

            <div className="table-responsive table-shell">
              <table className="table report-table align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Income ({symbol})</th>
                    <th>Other Income ({symbol})</th>
                    <th>Suppliers ({symbol})</th>
                    <th>Bills ({symbol})</th>
                    <th>Salaries ({symbol})</th>
                    <th>Other Expenses ({symbol})</th>
                    <th>Total Exp ({symbol})</th>
                    <th>Net ({symbol})</th>
                  </tr>
                </thead>
                <tbody>
                  {allDates.map((date, idx) => {
                    const income = incomeData[idx].toFixed(2);
                    const otherIncome = otherIncomeData[idx].toFixed(2);
                    const supplier = supplierExpenseData[idx].toFixed(2);
                    const bill = billData[idx].toFixed(2);
                    const salary = salaryData[idx].toFixed(2);
                    const otherExpense = otherExpenseData[idx].toFixed(2);

                    const total = (
                      parseFloat(supplier) +
                      parseFloat(bill) +
                      parseFloat(salary) +
                      parseFloat(otherExpense)
                    ).toFixed(2);

                    const net = (
                      parseFloat(income) +
                      parseFloat(otherIncome) -
                      parseFloat(total)
                    ).toFixed(2);

                    return (
                      <tr key={idx}>
                        <td>
                          <span className="date-pill">{date}</span>
                        </td>
                        <td>
                          <span className="amount-pill">{symbol}{income}</span>
                        </td>
                        <td>
                          <span className="amount-pill">{symbol}{otherIncome}</span>
                        </td>
                        <td>
                          <span className="amount-pill">{symbol}{supplier}</span>
                        </td>
                        <td>
                          <span className="amount-pill">{symbol}{bill}</span>
                        </td>
                        <td>
                          <span className="amount-pill">{symbol}{salary}</span>
                        </td>
                        <td>
                          <span className="amount-pill">{symbol}{otherExpense}</span>
                        </td>
                        <td>
                          <span className="amount-pill">{symbol}{total}</span>
                        </td>
                        <td className={parseFloat(net) >= 0 ? "net-positive" : "net-negative"}>
                          {symbol}{net}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MonthlyReport;