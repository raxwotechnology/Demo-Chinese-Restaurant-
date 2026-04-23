import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaMoneyBillWave,
  FaPlus,
  FaTrashAlt,
  FaSyncAlt,
  FaCalendarAlt,
  FaLock,
  FaPrint,
  FaCashRegister,
  FaArrowDown,
  FaArrowUp,
  FaCheckCircle,
  FaReceipt
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CashierSummary = () => {
  const [orders, setOrders] = useState([]);
  const [otherIncomes, setOtherIncomes] = useState([]);
  const [otherExpenses, setOtherExpenses] = useState([]);

  const [cashIns, setCashIns] = useState([]);
  const [cashOuts, setCashOuts] = useState([]);

  const [startingCash, setStartingCash] = useState("");
  const [startingCashLocked, setStartingCashLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [submittedSummary, setSubmittedSummary] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [forwardBalance, setForwardBalance] = useState(null);

  const [incomeSource, setIncomeSource] = useState("");
  const [incomeDesc, setIncomeDesc] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [expenseSource, setExpenseSource] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [cashInDesc, setCashInDesc] = useState("");
  const [cashInAmount, setCashInAmount] = useState("");
  const [cashOutDesc, setCashOutDesc] = useState("");
  const [cashOutAmount, setCashOutAmount] = useState("");

  const token = localStorage.getItem("token");
  const cashierId = localStorage.getItem("userId");
  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    const savedLocked = localStorage.getItem("startingCashLocked");
    if (savedLocked === "true") {
      setStartingCashLocked(true);
    }
  }, []);

  useEffect(() => {
    fetchCashOrders();
    fetchOtherIncomes();
    fetchOtherExpenses();
    checkExistingSummary();
    fetchForwardBalance(dateFilter);
  }, [dateFilter]);

  const fetchCashOrders = async () => {
    setLoading(true);
    try {
      const startDate = new Date(dateFilter);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(dateFilter);
      endDate.setHours(23, 59, 59, 999);

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const res = await axios.get(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/orders?${params.toString()}&limit=500`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const ordersArray = res.data.orders || res.data;
      const cashOrders = ordersArray.filter(
        (order) => (order.payment?.cash || 0) - (order.payment?.changeDue || 0) > 0
      );

      setOrders(cashOrders);
    } catch (err) {
      console.error("Failed to load cash orders:", err);
      toast.error("Failed to load cash orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherIncomes = async () => {
    try {
      const res = await axios.get(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/income/other/by-date?date=${dateFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtherIncomes(res.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Failed to load other income:", err);
        toast.error("Failed to load income records");
      }
      setOtherIncomes([]);
    }
  };

  const fetchOtherExpenses = async () => {
    try {
      const res = await axios.get(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/other/by-date?date=${dateFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtherExpenses(res.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Failed to load other expenses:", err);
        toast.error("Failed to load expense records");
      }
      setOtherExpenses([]);
    }
  };

  const fetchForwardBalance = async (currentDate) => {
    try {
      const today = new Date(currentDate);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const yyyy = yesterday.getFullYear();
      const mm = String(yesterday.getMonth() + 1).padStart(2, "0");
      const dd = String(yesterday.getDate()).padStart(2, "0");
      const yesterdayStr = `${yyyy}-${mm}-${dd}`;

      const res = await axios.get(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/cashier/shift-summary/${yesterdayStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data) {
        setForwardBalance({
          expectedClosingCash: res.data.expectedClosingCash,
          date: yesterdayStr,
          submittedAt: res.data.submittedAt
        });
      } else {
        setForwardBalance(null);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Error fetching forward balance:", err.message);
      }
      setForwardBalance(null);
    }
  };

  const checkExistingSummary = async () => {
    try {
      const res = await axios.get(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/cashier/shift-summary/${dateFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data) {
        const summary = res.data;
        setSubmittedSummary(summary);
        setIsReadOnly(true);
        setStartingCash(summary.startingCash);
        setStartingCashLocked(true);

        setCashIns(summary.cashIns || []);
        setCashOuts(summary.cashOuts || []);
      } else {
        resetForm();
      }
    } catch (err) {
      if (err.response?.status === 404) {
        resetForm();
      } else {
        console.error("Error checking existing summary:", err.message);
      }
    }
  };

  const resetForm = () => {
    setSubmittedSummary(null);
    setIsReadOnly(false);
    setStartingCash("");
    setStartingCashLocked(false);

    setIncomeDesc("");
    setIncomeAmount("");
    setIncomeSource("");
    setExpenseSource("");
    setExpenseDesc("");
    setExpenseAmount("");
    setCashIns([]);
    setCashOuts([]);
  };

  const addOtherIncome = async () => {
    if (isReadOnly) return;

    if (incomeSource.trim() === "Other") {
      if (!incomeDesc.trim() || !incomeAmount || parseFloat(incomeAmount) <= 0) {
        toast.error("Please enter valid description and amount");
        return;
      }
    } else {
      if (!incomeSource || !incomeAmount || parseFloat(incomeAmount) <= 0) {
        toast.error("Please enter valid description and amount");
        return;
      }
    }

    try {
      const payload = {
        source: incomeSource,
        amount: parseFloat(incomeAmount),
        description: incomeDesc,
        date: dateFilter,
        paymentMethod: "Cash"
      };

      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/income/other",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOtherIncomes([...otherIncomes, res.data]);
      setIncomeDesc("");
      setIncomeAmount("");
      setIncomeSource("");
      toast.success("Cash In added!");
    } catch (err) {
      console.error("Add income failed:", err);
      toast.error("Failed to add cash in");
    }
  };

  const addOtherExpense = async () => {
    if (isReadOnly) return;

    if (expenseSource.trim() === "Other") {
      if (!expenseDesc.trim() || !expenseAmount || parseFloat(expenseAmount) <= 0) {
        toast.error("Please enter valid description and amount");
        return;
      }
    } else {
      if (!expenseSource || !expenseAmount || parseFloat(expenseAmount) <= 0) {
        toast.error("Please enter valid description and amount");
        return;
      }
    }

    try {
      const payload = {
        category: expenseSource,
        amount: parseFloat(expenseAmount),
        description: expenseDesc,
        date: dateFilter,
        paymentMethod: "Cash"
      };

      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/other",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOtherExpenses([...otherExpenses, res.data]);
      setExpenseDesc("");
      setExpenseAmount("");
      setExpenseSource("");
      toast.success("Cash Out added!");
    } catch (err) {
      console.error("Add expense failed:", err);
      toast.error("Failed to add cash out");
    }
  };

  const deleteOtherIncome = async (id) => {
    if (isReadOnly) return;
    if (!window.confirm("Are you sure you want to delete this cash in record?")) return;

    try {
      await axios.delete(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/income/other/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOtherIncomes(otherIncomes.filter((inc) => inc._id !== id));
      toast.success("Cash in record deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete record");
    }
  };

  const deleteOtherExpense = async (id) => {
    if (isReadOnly) return;
    if (!window.confirm("Are you sure you want to delete this cash out record?")) return;

    try {
      await axios.delete(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/other/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOtherExpenses(otherExpenses.filter((exp) => exp._id !== id));
      toast.success("Cash out record deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete record");
    }
  };

  const totalCashFromOrders = orders.reduce((sum, order) => {
    const cashReceived = (order.payment?.cash || 0) - (order.payment?.changeDue || 0);
    return sum + cashReceived;
  }, 0);

  const CashierCashIn = cashIns.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
  const CashierCashOut = cashOuts.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

  const totalCashIn = CashierCashIn + otherIncomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalCashOut = CashierCashOut + otherExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const startingCashNum = parseFloat(startingCash) || 0;
  const expectedClosingCash =
    startingCashNum + totalCashFromOrders + totalCashIn - totalCashOut;

  const addCashIn = () => {
    if (isReadOnly) return;
    if (!cashInDesc.trim() || !cashInAmount || parseFloat(cashInAmount) <= 0) return;

    const newEntry = {
      description: cashInDesc,
      amount: parseFloat(cashInAmount),
      timestamp: new Date().toISOString(),
      cashierId: cashierId
    };

    setCashIns([...cashIns, newEntry]);
    setCashInDesc("");
    setCashInAmount("");
  };

  const addCashOut = () => {
    if (isReadOnly) return;
    if (!cashOutDesc.trim() || !cashOutAmount || parseFloat(cashOutAmount) <= 0) return;

    const newEntry = {
      description: cashOutDesc,
      amount: parseFloat(cashOutAmount),
      timestamp: new Date().toISOString(),
      cashierId: cashierId
    };

    setCashOuts([...cashOuts, newEntry]);
    setCashOutDesc("");
    setCashOutAmount("");
  };

  const removeCashIn = (index) => {
    if (isReadOnly) return;
    setCashIns(cashIns.filter((_, i) => i !== index));
  };

  const removeCashOut = (index) => {
    if (isReadOnly) return;
    setCashOuts(cashOuts.filter((_, i) => i !== index));
  };

  const handleStartingCashSubmit = () => {
    if (isReadOnly) return;

    if (!startingCash || parseFloat(startingCash) < 0) {
      toast.error("Please enter a valid starting cash amount");
      return;
    }

    setStartingCashLocked(true);
    localStorage.setItem("startingCashLocked", "true");
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async () => {
    if (isReadOnly) {
      toast.info("This shift summary has already been submitted.");
      return;
    }

    if (!startingCashLocked) {
      toast.error("Please set starting cash before submitting.");
      return;
    }

    try {
      const payload = {
        date: dateFilter,
        startingCash: parseFloat(startingCash),
        cashIns: cashIns,
        cashOuts: cashOuts,
        totalCashFromOrders: totalCashFromOrders,
        expectedClosingCash: expectedClosingCash
      };

      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/cashier/shift-summary/submitshift",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Shift summary submitted successfully!");
      setSubmittedSummary(res.data);
      setIsReadOnly(true);

      const today = new Date(dateFilter);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const dd = String(tomorrow.getDate()).padStart(2, "0");
      const tomorrowStr = `${yyyy}-${mm}-${dd}`;

      setDateFilter(tomorrowStr);
      localStorage.removeItem("startingCashLocked");
    } catch (err) {
      console.error("Submission failed:", err.response?.data || err.message);
      toast.error(`Failed to submit: ${err.response?.data?.error || "Unknown error"}`);
    }
  };

  const summaryCards = [
    {
      label: "Starting Cash Float",
      value: `${symbol}${formatCurrency(startingCashNum)}`,
      icon: <FaMoneyBillWave />,
      colorClass: "summary-slate"
    },
    {
      label: "Cash from Orders",
      value: `${symbol}${formatCurrency(totalCashFromOrders)}`,
      icon: <FaCashRegister />,
      colorClass: "summary-green"
    },
    {
      label: "Total Cash In",
      value: `${symbol}${formatCurrency(totalCashIn)}`,
      icon: <FaArrowDown />,
      colorClass: "summary-blue"
    },
    {
      label: "Total Cash Out",
      value: `${symbol}${formatCurrency(totalCashOut)}`,
      icon: <FaArrowUp />,
      colorClass: "summary-red"
    },
    {
      label: "Expected Closing Cash",
      value: `${symbol}${formatCurrency(expectedClosingCash)}`,
      icon: <FaCheckCircle />,
      colorClass: "summary-cyan"
    }
  ];

  if (loading) {
    return (
      <>
        <style>{`
          .cashier-page-wrapper.cashier-summary-loading {
            min-height: 100vh;
            background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
            color: #0f172a;
          }
          .cashier-page-wrapper.cashier-summary-loading .cashier-summary-muted {
            color: #64748b;
          }
        `}</style>
        <div className="cashier-page-wrapper cashier-summary-loading d-flex justify-content-center align-items-center">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 mb-0 cashier-summary-muted">Loading cashier data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .cashier-shift-summary.cashier-page-wrapper {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background: transparent;
          color: #1e293b;
          padding-bottom: 32px;
        }

        .cashier-shift-summary .container {
          position: relative;
          z-index: 1;
        }

        .cashier-shift-summary .hero-card {
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

        .cashier-shift-summary .hero-card::after {
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

        .cashier-shift-summary .hero-card > * {
          position: relative;
          z-index: 1;
        }

        .cashier-shift-summary .hero-chip {
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

        .cashier-shift-summary .hero-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 10px;
          color: #0f172a;
        }

        .cashier-shift-summary .hero-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .cashier-shift-summary .section-title-row {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .cashier-shift-summary .hero-text {
          max-width: 720px;
          color: #64748b;
          margin-bottom: 0;
        }

        .cashier-shift-summary .hero-side-box {
          min-width: 220px;
          padding: 18px 20px;
          border-radius: 20px;
          background: rgba(248, 250, 252, 0.95);
          border: 1px solid rgba(15, 23, 42, 0.1);
          text-align: center;
        }

        .cashier-shift-summary .hero-side-box span {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          color: hsl(160, 42%, 32%);
          margin-bottom: 6px;
          letter-spacing: 0.5px;
          font-weight: 700;
        }

        .cashier-shift-summary .hero-side-box strong {
          color: #0f172a;
          font-size: 1.15rem;
          font-weight: 800;
        }

        .cashier-shift-summary .section-card {
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

        .cashier-shift-summary .section-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .cashier-shift-summary .section-subtitle {
          color: #64748b;
          margin-bottom: 0;
        }

        .cashier-shift-summary .custom-label {
          font-weight: 700;
          color: #334155;
          margin-bottom: 8px;
          display: block;
        }

        .cashier-shift-summary .glass-input,
        .cashier-shift-summary .glass-select {
          background: #ffffff !important;
          border: 1px solid rgba(15, 23, 42, 0.12) !important;
          color: #0f172a !important;
          border-radius: 16px !important;
          min-height: 52px;
          padding: 12px 16px !important;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
        }

        .cashier-shift-summary .glass-input:focus,
        .cashier-shift-summary .glass-select:focus {
          border-color: hsla(160, 42%, 40%, 0.55) !important;
          box-shadow: 0 0 0 4px hsla(160, 40%, 42%, 0.14) !important;
          outline: none !important;
        }

        .cashier-shift-summary .glass-input::placeholder {
          color: rgba(15, 23, 42, 0.42) !important;
        }

        .cashier-shift-summary .glass-input:disabled,
        .cashier-shift-summary .glass-select:disabled {
          background: #f1f5f9 !important;
          color: #64748b !important;
        }

        .cashier-shift-summary .glass-select option {
          color: #0f172a;
        }

        .cashier-shift-summary .glass-addon {
          position: relative;
          background: linear-gradient(168deg, #ffffff 0%, #f1f5f9 55%, #e2e8f0 100%) !important;
          border: 1px solid rgba(15, 23, 42, 0.11) !important;
          color: #334155 !important;
          border-radius: 16px 0 0 16px !important;
          min-width: 56px;
          justify-content: center;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.95),
            inset -1px 0 0 rgba(15, 23, 42, 0.04),
            2px 2px 8px rgba(15, 23, 42, 0.06);
        }

        .cashier-shift-summary .glass-addon::before {
          content: "";
          position: absolute;
          inset: 2px 3px 2px 2px;
          border-radius: 12px 0 0 12px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), transparent 55%);
          pointer-events: none;
        }

        .cashier-shift-summary .glass-addon svg {
          position: relative;
          z-index: 1;
          font-size: 1.05rem;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.12));
        }

        .cashier-shift-summary .input-group > .glass-input {
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
        }

        .cashier-shift-summary .glass-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 16px;
          padding: 12px 18px;
          font-weight: 700;
          color: #fff;
          transition: all 0.25s ease;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
        }

        .cashier-shift-summary .glass-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.05);
          color: #fff;
        }

        .cashier-shift-summary .glass-btn:disabled {
          opacity: 0.55;
          transform: none;
        }

        .cashier-shift-summary .btn-green {
          background: linear-gradient(135deg, #16a34a, #22c55e);
        }

        .cashier-shift-summary .btn-blue {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
        }

        .cashier-shift-summary .btn-red {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        .cashier-shift-summary .btn-yellow {
          background: linear-gradient(135deg, #d97706, #f59e0b);
          color: #fff;
        }

        .cashier-shift-summary .btn-slate {
          background: linear-gradient(135deg, #334155, #475569);
        }

        .cashier-shift-summary .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 800;
          border: 1px solid transparent;
        }

        .cashier-shift-summary .pill-success {
          background: hsla(142, 71%, 36%, 0.12);
          color: #166534;
          border-color: hsla(142, 65%, 32%, 0.2);
        }

        .cashier-shift-summary .pill-info {
          background: hsla(217, 91%, 45%, 0.1);
          color: #1d4ed8;
          border-color: hsla(217, 85%, 40%, 0.18);
        }

        .cashier-shift-summary .pill-warning {
          background: hsla(38, 92%, 45%, 0.12);
          color: #a16207;
          border-color: hsla(38, 85%, 40%, 0.2);
        }

        .cashier-shift-summary .mini-card {
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

        .cashier-shift-summary .mini-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
        }

        .cashier-shift-summary .cashier-icon-3d {
          width: 60px;
          height: 60px;
          min-width: 60px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          color: #ffffff;
          position: relative;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.38),
            0 14px 26px rgba(15, 23, 42, 0.16),
            0 6px 10px rgba(15, 23, 42, 0.08);
        }

        .cashier-shift-summary .cashier-icon-3d::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0.02));
          pointer-events: none;
        }

        .cashier-shift-summary .cashier-icon-3d::after {
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

        .cashier-shift-summary .cashier-icon-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cashier-shift-summary .cashier-icon-inner svg {
          width: 26px;
          height: 26px;
          filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.22));
        }

        .cashier-shift-summary .cashier-icon-3d--hero {
          width: 52px;
          height: 52px;
          min-width: 52px;
          border-radius: 17px;
        }

        .cashier-shift-summary .cashier-icon-3d--hero::before {
          border-radius: 15px;
        }

        .cashier-shift-summary .cashier-icon-3d--hero .cashier-icon-inner svg {
          width: 22px;
          height: 22px;
        }

        .cashier-shift-summary .cashier-icon-3d--inline {
          width: 38px;
          height: 38px;
          min-width: 38px;
          border-radius: 13px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.35),
            0 8px 16px rgba(15, 23, 42, 0.12),
            0 3px 6px rgba(15, 23, 42, 0.08);
        }

        .cashier-shift-summary .cashier-icon-3d--inline::before {
          border-radius: 11px;
        }

        .cashier-shift-summary .cashier-icon-3d--inline::after {
          left: 7px;
          right: 7px;
          top: 5px;
          height: 8px;
        }

        .cashier-shift-summary .cashier-icon-3d--inline .cashier-icon-inner svg {
          width: 16px;
          height: 16px;
        }

        .cashier-shift-summary .cashier-icon-3d--empty {
          width: 72px;
          height: 72px;
          min-width: 72px;
          border-radius: 22px;
        }

        .cashier-shift-summary .cashier-icon-3d--empty::before {
          border-radius: 20px;
        }

        .cashier-shift-summary .cashier-icon-3d--empty .cashier-icon-inner svg {
          width: 30px;
          height: 30px;
        }

        .cashier-shift-summary .icon-slate {
          background: linear-gradient(145deg, #94a3b8 0%, #64748b 55%, #475569 100%);
        }
        .cashier-shift-summary .icon-green {
          background: linear-gradient(145deg, #4ade80 0%, #16a34a 55%, #15803d 100%);
        }
        .cashier-shift-summary .icon-blue {
          background: linear-gradient(145deg, #4f8cff 0%, #2563eb 55%, #1d4ed8 100%);
        }
        .cashier-shift-summary .icon-red {
          background: linear-gradient(145deg, #f87171 0%, #dc2626 55%, #b91c1c 100%);
        }
        .cashier-shift-summary .icon-cyan {
          background: linear-gradient(145deg, #22d3ee 0%, #0891b2 55%, #0e7490 100%);
        }
        .cashier-shift-summary .icon-jade {
          background: linear-gradient(145deg, #34d399 0%, #059669 55%, #047857 100%);
        }
        .cashier-shift-summary .icon-amber {
          background: linear-gradient(145deg, #fbbf24 0%, #d97706 55%, #b45309 100%);
        }

        .cashier-shift-summary .mini-label {
          margin-bottom: 6px;
          color: #64748b;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .cashier-shift-summary .mini-value {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
        }

        .cashier-shift-summary .summary-card {
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

        .cashier-shift-summary .summary-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.09);
        }

        .cashier-shift-summary .summary-icon-3d {
          width: 58px;
          height: 58px;
          min-width: 58px;
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

        .cashier-shift-summary .summary-icon-3d::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 17px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.02));
          pointer-events: none;
        }

        .cashier-shift-summary .summary-icon-3d::after {
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

        .cashier-shift-summary .summary-icon-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cashier-shift-summary .summary-icon-inner svg {
          width: 24px;
          height: 24px;
          filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
        }

        .cashier-shift-summary .summary-slate {
          background: linear-gradient(145deg, #94a3b8 0%, #64748b 55%, #475569 100%);
        }
        .cashier-shift-summary .summary-green {
          background: linear-gradient(135deg, #16a34a, #22c55e);
        }
        .cashier-shift-summary .summary-blue {
          background: linear-gradient(145deg, #4f8cff 0%, #2563eb 55%, #1d4ed8 100%);
        }
        .cashier-shift-summary .summary-red {
          background: linear-gradient(145deg, #f87171 0%, #dc2626 55%, #b91c1c 100%);
        }
        .cashier-shift-summary .summary-cyan {
          background: linear-gradient(145deg, #22d3ee 0%, #0891b2 55%, #0e7490 100%);
        }

        .cashier-shift-summary .pill-icon-3d {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          min-width: 28px;
          border-radius: 9px;
          margin-right: 2px;
          position: relative;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.45),
            0 4px 10px rgba(15, 23, 42, 0.12);
        }

        .cashier-shift-summary .pill-icon-3d::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 7px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent);
          pointer-events: none;
        }

        .cashier-shift-summary .pill-icon-3d svg {
          position: relative;
          z-index: 1;
          width: 13px;
          height: 13px;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15));
        }

        .cashier-shift-summary .pill-icon-3d--success {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #fff;
        }

        .cashier-shift-summary .pill-icon-3d--info {
          background: linear-gradient(145deg, #93c5fd 0%, #3b82f6 55%, #1d4ed8 100%);
          color: #fff;
        }

        .cashier-shift-summary .pill-icon-3d--warn {
          background: linear-gradient(145deg, #fcd34d 0%, #f59e0b 55%, #d97706 100%);
          color: #fff;
        }

        .cashier-shift-summary .footer-btn-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 10px;
          margin-right: 10px;
          vertical-align: middle;
          background: rgba(255, 255, 255, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            0 4px 10px rgba(0, 0, 0, 0.15);
        }

        .cashier-shift-summary .footer-btn-icon svg {
          width: 15px;
          height: 15px;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));
        }

        .cashier-shift-summary .summary-label {
          margin-bottom: 6px;
          color: #64748b;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .cashier-shift-summary .summary-value {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }

        .cashier-shift-summary .section-head-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .cashier-shift-summary .list-shell {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cashier-shift-summary .list-item {
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 18px;
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
        }

        .cashier-shift-summary .list-title {
          color: #0f172a;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .cashier-shift-summary .list-meta {
          color: #64748b;
          font-size: 0.84rem;
        }

        .cashier-shift-summary .amount-positive,
        .cashier-shift-summary .amount-negative {
          font-weight: 800;
          white-space: nowrap;
        }

        .cashier-shift-summary .amount-positive {
          color: #15803d;
        }

        .cashier-shift-summary .amount-negative {
          color: #b91c1c;
        }

        .cashier-shift-summary .icon-btn {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 13px;
          border: 1px solid rgba(15, 23, 42, 0.1);
          background: linear-gradient(165deg, #ffffff 0%, #f1f5f9 100%);
          color: #64748b;
          display: grid;
          place-items: center;
          transition: all 0.2s ease;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.95),
            0 6px 14px rgba(15, 23, 42, 0.08);
        }

        .cashier-shift-summary .icon-btn::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 11px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.5), transparent 55%);
          pointer-events: none;
        }

        .cashier-shift-summary .icon-btn svg {
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.08));
        }

        .cashier-shift-summary .icon-btn:hover {
          background: linear-gradient(165deg, #fef2f2 0%, #fee2e2 100%);
          color: #b91c1c;
          border-color: hsla(0, 72%, 45%, 0.28);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            0 8px 18px hsla(0, 72%, 45%, 0.15);
        }

        .cashier-shift-summary .table-shell {
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 22px;
          overflow: hidden;
        }

        .cashier-shift-summary .cashier-table {
          color: #1e293b;
          margin-bottom: 0;
        }

        .cashier-shift-summary .cashier-table thead th {
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

        .cashier-shift-summary .cashier-table tbody td {
          padding: 15px 14px;
          border-top: 1px solid rgba(15, 23, 42, 0.06);
          color: #334155;
          vertical-align: middle;
          background: #ffffff;
        }

        .cashier-shift-summary .cashier-table tbody tr:hover td {
          background: #f8fafc;
        }

        .cashier-shift-summary .order-pill {
          display: inline-flex;
          padding: 7px 12px;
          border-radius: 999px;
          background: hsla(217, 91%, 45%, 0.1);
          color: #1d4ed8;
          border: 1px solid hsla(217, 85%, 40%, 0.18);
          font-weight: 700;
          font-size: 0.84rem;
        }

        .cashier-shift-summary .status-badge-custom {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 95px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 800;
          border: 1px solid transparent;
          text-transform: capitalize;
        }

        .cashier-shift-summary .status-badge-custom.status-success {
          background: hsla(142, 71%, 36%, 0.12);
          color: #166534;
          border-color: hsla(142, 65%, 32%, 0.2);
        }

        .cashier-shift-summary .status-badge-custom.status-warning {
          background: hsla(38, 92%, 45%, 0.12);
          color: #a16207;
          border-color: hsla(38, 85%, 40%, 0.2);
        }

        .cashier-shift-summary .status-badge-custom.status-secondary {
          background: rgba(100, 116, 139, 0.12);
          color: #475569;
          border-color: rgba(71, 85, 105, 0.2);
        }

        .cashier-shift-summary .empty-box {
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #64748b;
          background: #f8fafc;
          border-radius: 18px;
          border: 1px dashed rgba(15, 23, 42, 0.1);
        }

        .cashier-shift-summary .empty-3d-wrap {
          margin-bottom: 8px;
        }

        @media (max-width: 992px) {
          .cashier-shift-summary .hero-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .cashier-shift-summary .hero-side-box {
            width: 100%;
          }
        }

        @media (max-width: 576px) {
          .cashier-shift-summary .hero-title {
            font-size: 1.55rem;
          }

          .cashier-shift-summary .hero-card,
          .cashier-shift-summary .section-card,
          .cashier-shift-summary .mini-card,
          .cashier-shift-summary .summary-card {
            padding: 18px;
            border-radius: 20px;
          }

          .cashier-shift-summary .list-item {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="cashier-page-wrapper cashier-shift-summary">
        <div className="container py-4">
          <div className="hero-card mb-4">
            <div>
              <span className="hero-chip">Cashier Management</span>
              <h1 className="hero-title hero-title-row">
                <span className="cashier-icon-3d cashier-icon-3d--hero icon-jade" aria-hidden>
                  <span className="cashier-icon-inner">
                    <FaMoneyBillWave />
                  </span>
                </span>
                <span>Cashier Shift Summary</span>
              </h1>
              <p className="hero-text">
                Track shift opening cash, other cash movements, order collections, and expected closing balance in a clean modern admin interface.
              </p>
            </div>

            <div className="hero-side-box">
              <span>Selected Date</span>
              <strong>{dateFilter}</strong>
            </div>
          </div>

          <div className="section-card mb-4">
            <div className="section-head-row">
              <div>
                <h4 className="section-title">Shift Setup</h4>
                <p className="section-subtitle">
                  Choose the working date and set the starting cash float before submitting the shift.
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2">
                {startingCashLocked && (
                  <span className="status-pill pill-success">
                    <span className="pill-icon-3d pill-icon-3d--success" aria-hidden>
                      <FaLock />
                    </span>
                    Starting Cash Locked
                  </span>
                )}

                {isReadOnly && submittedSummary && (
                  <span className="status-pill pill-info">
                    <span className="pill-icon-3d pill-icon-3d--info" aria-hidden>
                      <FaCheckCircle />
                    </span>
                    Submitted
                  </span>
                )}
              </div>
            </div>

            <div className="row g-3">
              <div className="col-lg-4">
                <label className="custom-label">Select Date</label>
                <div className="input-group">
                  <span className="input-group-text glass-addon">
                    <FaCalendarAlt />
                  </span>
                  <input
                    type="date"
                    className="form-control glass-input"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-lg-5">
                <label className="custom-label">Starting Cash Float</label>
                <div className="input-group">
                  <span className="input-group-text glass-addon">{symbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control glass-input"
                    placeholder="e.g. 500.00"
                    value={startingCash}
                    onChange={(e) => setStartingCash(e.target.value)}
                    disabled={startingCashLocked || isReadOnly}
                  />
                  {!startingCashLocked && !isReadOnly && (
                    <button
                      className="glass-btn btn-green ms-2"
                      onClick={handleStartingCashSubmit}
                      disabled={!startingCash || parseFloat(startingCash) < 0}
                    >
                      Set Cash
                    </button>
                  )}
                </div>
              </div>

              <div className="col-lg-3 d-flex align-items-end">
                <div className="w-100">
                  {isReadOnly && submittedSummary ? (
                    <div className="status-pill pill-info">
                      <span className="pill-icon-3d pill-icon-3d--info" aria-hidden>
                        <FaCheckCircle />
                      </span>
                      {new Date(submittedSummary.submittedAt).toLocaleString()}
                    </div>
                  ) : (
                    <div className="status-pill pill-warning">
                      <span className="pill-icon-3d pill-icon-3d--warn" aria-hidden>
                        <FaCashRegister />
                      </span>
                      Awaiting Submission
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {forwardBalance && (
            <div className="section-card mb-4">
              <div className="section-head-row">
                <div>
                  <h4 className="section-title section-title-row">
                    <span className="cashier-icon-3d cashier-icon-3d--inline icon-cyan" aria-hidden>
                      <span className="cashier-icon-inner">
                        <FaSyncAlt />
                      </span>
                    </span>
                    <span>Forward Balance</span>
                  </h4>
                  <p className="section-subtitle">
                    Closing balance carried from previous shift on {forwardBalance.date}.
                  </p>
                </div>

                <div>
                  {!isReadOnly && !startingCashLocked && (
                    <button
                      className="glass-btn btn-blue"
                      onClick={() => {
                        setStartingCash(forwardBalance.expectedClosingCash);
                        setStartingCashLocked(true);
                        localStorage.setItem("startingCashLocked", "true");
                        toast.success("Starting Cash set from yesterday’s closing balance.");
                      }}
                    >
                      Use as Starting Cash
                    </button>
                  )}
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="mini-card">
                    <div className="cashier-icon-3d icon-cyan" aria-hidden>
                      <div className="cashier-icon-inner">
                        <FaMoneyBillWave />
                      </div>
                    </div>
                    <div>
                      <p className="mini-label">Forwarded Closing Balance</p>
                      <h4 className="mini-value">
                        {symbol}{formatCurrency(forwardBalance.expectedClosingCash)}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mini-card">
                    <div className="cashier-icon-3d icon-slate" aria-hidden>
                      <div className="cashier-icon-inner">
                        <FaSyncAlt />
                      </div>
                    </div>
                    <div>
                      <p className="mini-label">Submitted At</p>
                      <h4 className="mini-value">
                        {new Date(forwardBalance.submittedAt).toLocaleString()}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="section-card mb-4">
            <div className="section-head-row">
              <div>
                <h4 className="section-title section-title-row">
                  <span className="cashier-icon-3d cashier-icon-3d--inline icon-blue" aria-hidden>
                    <span className="cashier-icon-inner">
                      <FaArrowDown />
                    </span>
                  </span>
                  <span>Other Incomes</span>
                </h4>
                <p className="section-subtitle">
                  Add tips, float top-up, event rental, delivery fee, and other cash inflows.
                </p>
              </div>

              {isReadOnly && <span className="status-pill pill-warning">Locked</span>}
            </div>

            {!isReadOnly && (
              <>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="custom-label">Income Source</label>
                    <select
                      value={incomeSource}
                      onChange={(e) => setIncomeSource(e.target.value)}
                      className="form-select glass-select"
                      disabled={isReadOnly}
                    >
                      <option value="">Select source</option>
                      <option>Tips</option>
                      <option>Event Rental</option>
                      <option>Merchandise</option>
                      <option>Delivery Fee</option>
                      <option>Donations</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="custom-label">Amount</label>
                    <div className="input-group">
                      <span className="input-group-text glass-addon">{symbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control glass-input"
                        placeholder="Amount"
                        value={incomeAmount}
                        onChange={(e) => setIncomeAmount(e.target.value)}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>

                  <div className="col-md-10">
                    <label className="custom-label">Description</label>
                    <input
                      type="text"
                      className="form-control glass-input"
                      placeholder="Description (e.g., Tip from Table 3)"
                      value={incomeDesc}
                      onChange={(e) => setIncomeDesc(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="col-md-2 d-flex align-items-end">
                    <button
                      className="glass-btn btn-green w-100"
                      onClick={addOtherIncome}
                      disabled={
                        isReadOnly ||
                        !incomeAmount ||
                        parseFloat(incomeAmount) <= 0
                      }
                    >
                      Add
                    </button>
                  </div>
                </div>
              </>
            )}

            {otherIncomes.length > 0 || cashIns.length > 0 ? (
              <div className="list-shell">
                {otherIncomes.map((entry) => (
                  <div key={entry._id} className="list-item">
                    <div>
                      <div className="list-title">{entry.description || entry.source}</div>
                      <div className="list-meta">
                        {formatDate(entry.date)} • {entry.paymentMethod}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="amount-positive">
                        +{symbol}{formatCurrency(entry.amount)}
                      </span>
                      {!isReadOnly && (
                        <button
                          className="icon-btn"
                          onClick={() => deleteOtherIncome(entry._id)}
                          title="Delete"
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {cashIns.map((entry, idx) => (
                  <div key={idx} className="list-item">
                    <div>
                      <div className="list-title">{entry.description}</div>
                      <div className="list-meta">{formatDate(entry.timestamp)}</div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="amount-positive">
                        +{symbol}{formatCurrency(entry.amount)}
                      </span>
                      {!isReadOnly && (
                        <button
                          className="icon-btn"
                          onClick={() => removeCashIn(idx)}
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-box">
                <div className="empty-3d-wrap">
                  <div className="cashier-icon-3d cashier-icon-3d--empty icon-blue" aria-hidden>
                    <div className="cashier-icon-inner">
                      <FaArrowDown />
                    </div>
                  </div>
                </div>
                <p className="mb-0">No other income records added yet.</p>
              </div>
            )}
          </div>

          <div className="section-card mb-4">
            <div className="section-head-row">
              <div>
                <h4 className="section-title section-title-row">
                  <span className="cashier-icon-3d cashier-icon-3d--inline icon-red" aria-hidden>
                    <span className="cashier-icon-inner">
                      <FaArrowUp />
                    </span>
                  </span>
                  <span>Other Expenses</span>
                </h4>
                <p className="section-subtitle">
                  Add petty cash, refunds, repairs, software costs, and other cash outflows.
                </p>
              </div>

              {isReadOnly && <span className="status-pill pill-warning">Locked</span>}
            </div>

            {!isReadOnly && (
              <>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="custom-label">Expense Category</label>
                    <select
                      value={expenseSource}
                      onChange={(e) => setExpenseSource(e.target.value)}
                      className="form-select glass-select"
                      disabled={isReadOnly}
                    >
                      <option value="">Select category</option>
                      <option>Marketing</option>
                      <option>Admin Supplies</option>
                      <option>Repairs & Maintenance</option>
                      <option>Software/Subscription</option>
                      <option>Training</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="custom-label">Amount</label>
                    <div className="input-group">
                      <span className="input-group-text glass-addon">{symbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control glass-input"
                        placeholder="Amount"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>

                  <div className="col-md-10">
                    <label className="custom-label">Description</label>
                    <input
                      type="text"
                      className="form-control glass-input"
                      placeholder="Description (e.g., Office Supplies)"
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="col-md-2 d-flex align-items-end">
                    <button
                      className="glass-btn btn-red w-100"
                      onClick={addOtherExpense}
                      disabled={
                        isReadOnly ||
                        !expenseDesc.trim() ||
                        !expenseAmount ||
                        parseFloat(expenseAmount) <= 0
                      }
                    >
                      Add
                    </button>
                  </div>
                </div>
              </>
            )}

            {otherExpenses.length > 0 ? (
              <div className="list-shell">
                {otherExpenses.map((entry) => (
                  <div key={entry._id} className="list-item">
                    <div>
                      <div className="list-title">{entry.description || entry.category}</div>
                      <div className="list-meta">
                        {formatDate(entry.date)} • {entry.paymentMethod}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="amount-negative">
                        -{symbol}{formatCurrency(entry.amount)}
                      </span>
                      {!isReadOnly && (
                        <button
                          className="icon-btn"
                          onClick={() => deleteOtherExpense(entry._id)}
                          title="Delete"
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-box">
                <div className="empty-3d-wrap">
                  <div className="cashier-icon-3d cashier-icon-3d--empty icon-red" aria-hidden>
                    <div className="cashier-icon-inner">
                      <FaArrowUp />
                    </div>
                  </div>
                </div>
                <p className="mb-0">No other expense records added yet.</p>
              </div>
            )}
          </div>

          <div className="section-card mb-4">
            <div className="section-head-row">
              <div>
                <h4 className="section-title">Manual Cash Out</h4>
                <p className="section-subtitle">
                  Record manual cash given out such as boss withdrawal, refund, or emergency payout.
                </p>
              </div>

              {isReadOnly && <span className="status-pill pill-warning">Locked</span>}
            </div>

            {!isReadOnly && (
              <div className="row g-3 mb-3">
                <div className="col-md-5">
                  <label className="custom-label">Description</label>
                  <input
                    type="text"
                    className="form-control glass-input"
                    placeholder="Description (e.g., Refund to Customer)"
                    value={cashOutDesc}
                    onChange={(e) => setCashOutDesc(e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="col-md-5">
                  <label className="custom-label">Amount</label>
                  <div className="input-group">
                    <span className="input-group-text glass-addon">{symbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control glass-input"
                      placeholder="Amount"
                      value={cashOutAmount}
                      onChange={(e) => setCashOutAmount(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="col-md-2 d-flex align-items-end">
                  <button
                    className="glass-btn btn-yellow w-100"
                    onClick={addCashOut}
                    disabled={
                      isReadOnly ||
                      !cashOutDesc.trim() ||
                      !cashOutAmount ||
                      parseFloat(cashOutAmount) <= 0
                    }
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {cashOuts.length > 0 ? (
              <div className="list-shell">
                {cashOuts.map((entry, idx) => (
                  <div key={idx} className="list-item">
                    <div>
                      <div className="list-title">{entry.description}</div>
                      <div className="list-meta">{formatDate(entry.timestamp)}</div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="amount-negative">
                        -{symbol}{formatCurrency(entry.amount)}
                      </span>
                      {!isReadOnly && (
                        <button
                          className="icon-btn"
                          onClick={() => removeCashOut(idx)}
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-box">
                <div className="empty-3d-wrap">
                  <div className="cashier-icon-3d cashier-icon-3d--empty icon-amber" aria-hidden>
                    <div className="cashier-icon-inner">
                      <FaMoneyBillWave />
                    </div>
                  </div>
                </div>
                <p className="mb-0">No manual cash out records added yet.</p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h4 className="section-title mb-3">Shift Summary</h4>
            <div className="row g-4">
              {summaryCards.map((card, idx) => (
                <div className="col-md-6 col-lg-4" key={idx}>
                  <div className="summary-card">
                    <div className={`summary-icon-3d ${card.colorClass}`} aria-hidden>
                      <div className="summary-icon-inner">{card.icon}</div>
                    </div>
                    <div>
                      <p className="summary-label">{card.label}</p>
                      <h5 className="summary-value">{card.value}</h5>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card mb-4">
            <div className="section-head-row">
              <div>
                <h4 className="section-title">Cash Received Orders ({orders.length})</h4>
                <p className="section-subtitle">
                  Orders paid in cash for the selected shift date.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="empty-box">
                <div className="empty-3d-wrap">
                  <div className="cashier-icon-3d cashier-icon-3d--empty icon-slate" aria-hidden>
                    <div className="cashier-icon-inner">
                      <FaReceipt />
                    </div>
                  </div>
                </div>
                <p className="mb-0">No cash-received orders found for this date.</p>
              </div>
            ) : (
              <div className="table-responsive table-shell">
                <table className="table cashier-table align-middle">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Cash Paid</th>
                      <th>Change Given</th>
                      <th>Net Cash Received</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const cashPaid = order.payment?.cash || 0;
                      const changeDue = order.payment?.changeDue || 0;
                      const netCash = cashPaid - changeDue;

                      return (
                        <tr key={order._id}>
                          <td>
                            <span className="order-pill">
                              #{order.invoiceNo || order._id.slice(-6)}
                            </span>
                          </td>
                          <td>{order.customerName || "Walk-in"}</td>
                          <td>{symbol}{formatCurrency(cashPaid)}</td>
                          <td className="amount-negative">
                            -{symbol}{formatCurrency(changeDue)}
                          </td>
                          <td className="amount-positive">
                            {symbol}{formatCurrency(netCash)}
                          </td>
                          <td>
                            <span
                              className={`status-badge-custom ${
                                order.status === "completed"
                                  ? "status-success"
                                  : order.status === "pending"
                                  ? "status-warning"
                                  : "status-secondary"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-between mt-4 gap-2 flex-wrap">
            <button
              className="glass-btn btn-slate"
              onClick={() => window.print()}
              type="button"
            >
              <span className="footer-btn-icon" aria-hidden>
                <FaPrint />
              </span>
              Print Summary
            </button>

            <button
              className={`glass-btn ${isReadOnly ? "btn-slate" : "btn-green"}`}
              onClick={handleSubmit}
              disabled={isReadOnly || !startingCashLocked}
            >
              {isReadOnly ? "Already Submitted" : "Submit Shift Summary"}
            </button>
          </div>

          <ToastContainer position="top-right" autoClose={2500} />
        </div>
      </div>
    </>
  );
};

export default CashierSummary;