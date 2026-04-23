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
  FaReceipt,
  FaWallet,
  FaHistory
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/PremiumUI.css";

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
    if (!incomeSource || !incomeAmount || parseFloat(incomeAmount) <= 0) {
      toast.error("Valid source and amount required");
      return;
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
      toast.success("Additional Income Logged!");
    } catch (err) {
      toast.error("Failed to log income");
    }
  };

  const addOtherExpense = async () => {
    if (isReadOnly) return;
    if (!expenseSource || !expenseAmount || parseFloat(expenseAmount) <= 0) {
      toast.error("Valid category and amount required");
      return;
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
      toast.success("Operational Expense Logged!");
    } catch (err) {
      toast.error("Failed to log expense");
    }
  };

  const deleteOtherIncome = async (id) => {
    if (isReadOnly) return;
    if (!window.confirm("Delete this income record?")) return;
    try {
      await axios.delete(`https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/income/other/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setOtherIncomes(otherIncomes.filter(inc => inc._id !== id));
      toast.success("Record deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const deleteOtherExpense = async (id) => {
    if (isReadOnly) return;
    if (!window.confirm("Delete this expense record?")) return;
    try {
      await axios.delete(`https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/other/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setOtherExpenses(otherExpenses.filter(exp => exp._id !== id));
      toast.success("Record deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const totalCashFromOrders = orders.reduce((sum, order) => {
    const cashReceived = (order.payment?.cash || 0) - (order.payment?.changeDue || 0);
    return sum + cashReceived;
  }, 0);

  const totalCashIn = otherIncomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalCashOut = otherExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const startingCashNum = parseFloat(startingCash) || 0;
  const expectedClosingCash = startingCashNum + totalCashFromOrders + totalCashIn - totalCashOut;

  const handleStartingCashSubmit = () => {
    if (isReadOnly) return;
    if (!startingCash || parseFloat(startingCash) < 0) {
      toast.error("Valid starting cash required");
      return;
    }
    setStartingCashLocked(true);
    localStorage.setItem("startingCashLocked", "true");
  };

  const handleSubmit = async () => {
    if (isReadOnly) return toast.info("Shift already submitted.");
    if (!startingCashLocked) return toast.error("Set starting cash first.");

    try {
      const payload = {
        date: dateFilter,
        startingCash: parseFloat(startingCash),
        totalCashFromOrders,
        expectedClosingCash
      };

      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/cashier/shift-summary/submitshift",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Shift successfully submitted!");
      setSubmittedSummary(res.data);
      setIsReadOnly(true);
      localStorage.removeItem("startingCashLocked");
    } catch (err) {
      toast.error("Submission failed");
    }
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const summaryCards = [
    { label: "Starting Float", value: startingCashNum, icon: FaWallet, color: "blue" },
    { label: "Sales (Cash)", value: totalCashFromOrders, icon: FaCashRegister, color: "green" },
    { label: "Misc Inflow", value: totalCashIn, icon: FaArrowDown, color: "blue" },
    { label: "Misc Outflow", value: totalCashOut, icon: FaArrowUp, color: "red" },
    { label: "Expected Closing", value: expectedClosingCash, icon: FaCheckCircle, color: "gold" }
  ];

  return (
    <div className="cashier-summary-container animate-fade-in p-2">
      <ToastContainer theme="light" />
      
      {/* Platinum Header */}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title">Shift Reconciliation</h1>
          <p className="premium-subtitle">End-of-day cash auditing and financial summary</p>
        </div>
        
        <div className="orient-card p-2 d-flex align-items-center gap-3 bg-white">
            <div className="bg-blue-glow p-2 rounded-3"><FaCalendarAlt size={18} /></div>
            <input type="date" className="premium-input border-0 bg-transparent fw-bold" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            <button className="btn-premium btn-premium-primary p-2" onClick={() => fetchCashOrders()}><FaSyncAlt /></button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-5">
        {summaryCards.map((card, idx) => (
          <div className="col-xl-2 col-md-4 col-6" key={idx}>
            <div className="orient-card h-100 text-center p-3">
              <div className={`orient-stat-icon bg-${card.color}-glow mx-auto mb-3`}>
                <card.icon size={20} />
              </div>
              <div className="orient-stat-label" style={{ fontSize: '0.65rem' }}>{card.label}</div>
              <div className="orient-stat-value" style={{ fontSize: '1.2rem' }}>{symbol}{formatCurrency(card.value)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Left Column - Setup & Transactions */}
        <div className="col-lg-5">
            <div className="orient-card mb-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-gold-glow p-2 rounded-3"><FaLock size={18} /></div>
                    <h5 className="mb-0 fw-bold">Shift Initialization</h5>
                </div>
                <div className="d-flex gap-2">
                    <div className="position-relative flex-grow-1">
                        <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted fw-bold">{symbol}</span>
                        <input type="number" className="premium-input ps-5" placeholder="Starting Cash Float" value={startingCash} onChange={(e) => setStartingCash(e.target.value)} disabled={startingCashLocked} />
                    </div>
                    {!startingCashLocked ? (
                        <button className="btn-premium btn-premium-secondary px-4" onClick={handleStartingCashSubmit}>Lock Float</button>
                    ) : (
                        <div className="badge-premium badge-success d-flex align-items-center px-4">Locked</div>
                    )}
                </div>
            </div>

            <div className="orient-card">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-blue-glow p-2 rounded-3"><FaCashRegister size={18} /></div>
                    <h5 className="mb-0 fw-bold">Cash Log (Inflow/Outflow)</h5>
                </div>
                
                <div className="tabs-mini d-flex gap-2 mb-4 bg-light p-1 rounded-3">
                    <button className="btn-premium flex-grow-1 py-1 small btn-premium-primary border-0">Misc Transactions</button>
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-md-12">
                        <label className="orient-stat-label">Source / Category</label>
                        <select className="premium-input w-100" value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)}>
                            <option value="">Select Inflow Source</option>
                            <option value="Tips">Service Tips</option>
                            <option value="Refund">Supplier Refund</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="col-md-8">
                        <input type="text" className="premium-input w-100" placeholder="Description..." value={incomeDesc} onChange={(e) => setIncomeDesc(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                        <input type="number" className="premium-input w-100" placeholder="Amount" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} />
                    </div>
                    <div className="col-12">
                        <button className="btn-premium btn-premium-accent w-100" onClick={addOtherIncome} disabled={isReadOnly}>Log Cash Inflow</button>
                    </div>
                </div>

                <div className="row g-3">
                    <div className="col-md-12">
                        <label className="orient-stat-label">Expense Category</label>
                        <select className="premium-input w-100" value={expenseSource} onChange={(e) => setExpenseSource(e.target.value)}>
                            <option value="">Select Outflow Category</option>
                            <option value="Supplies">Daily Supplies</option>
                            <option value="Repair">Urgent Repair</option>
                            <option value="Fuel">Delivery Fuel</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="col-md-8">
                        <input type="text" className="premium-input w-100" placeholder="Description..." value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                        <input type="number" className="premium-input w-100" placeholder="Amount" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
                    </div>
                    <div className="col-12">
                        <button className="btn-premium btn-premium-secondary w-100" onClick={addOtherExpense} disabled={isReadOnly}>Log Cash Outflow</button>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column - Transaction History & Finalize */}
        <div className="col-lg-7">
            <div className="orient-card h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                        <FaHistory className="text-primary" size={18} /> Daily Transaction Audit
                    </h5>
                    {isReadOnly && <div className="badge-premium badge-success">SHIFT SUBMITTED</div>}
                </div>

                <div className="premium-table-container flex-grow-1 overflow-auto mb-4" style={{ maxHeight: '500px' }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th className="text-end">Amount</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {otherIncomes.map(inc => (
                                <tr key={inc._id}>
                                    <td><span className="badge-premium badge-primary">IN</span></td>
                                    <td>{inc.description || '--'}</td>
                                    <td>{inc.source}</td>
                                    <td className="text-end fw-bold text-success">+{symbol}{formatCurrency(inc.amount)}</td>
                                    <td className="text-center">
                                        <button className="btn-premium btn-premium-primary p-2 text-danger" onClick={() => deleteOtherIncome(inc._id)} disabled={isReadOnly}><FaTrashAlt size={12} /></button>
                                    </td>
                                </tr>
                            ))}
                            {otherExpenses.map(exp => (
                                <tr key={exp._id}>
                                    <td><span className="badge-premium badge-danger">OUT</span></td>
                                    <td>{exp.description || '--'}</td>
                                    <td>{exp.category}</td>
                                    <td className="text-end fw-bold text-danger">-{symbol}{formatCurrency(exp.amount)}</td>
                                    <td className="text-center">
                                        <button className="btn-premium btn-premium-primary p-2 text-danger" onClick={() => deleteOtherExpense(exp._id)} disabled={isReadOnly}><FaTrashAlt size={12} /></button>
                                    </td>
                                </tr>
                            ))}
                            {(otherIncomes.length === 0 && otherExpenses.length === 0) && (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">No miscellaneous transactions logged for this shift.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-auto p-4 bg-light rounded-4">
                    <div className="row g-4 align-items-center">
                        <div className="col-md-7">
                            <div className="d-flex flex-column gap-1">
                                <div className="d-flex justify-content-between text-muted small">
                                    <span>Sales Revenue:</span>
                                    <span>{symbol}{formatCurrency(totalCashFromOrders)}</span>
                                </div>
                                <div className="d-flex justify-content-between text-muted small">
                                    <span>Starting Float:</span>
                                    <span>{symbol}{formatCurrency(startingCashNum)}</span>
                                </div>
                                <div className="d-flex justify-content-between fw-bold h5 mb-0 mt-2 border-top pt-2">
                                    <span>Total Expected Cash:</span>
                                    <span className="text-primary">{symbol}{formatCurrency(expectedClosingCash)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <button className="btn-premium btn-premium-secondary w-100 py-3 rounded-4 shadow-lg" onClick={handleSubmit} disabled={isReadOnly}>
                                <FaCheckCircle className="me-2" /> Submit Shift Audit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        .bg-blue-glow { background: var(--primary-light); color: var(--primary); }
        .bg-green-glow { background: var(--success-light); color: var(--success); }
        .bg-red-glow { background: var(--danger-light); color: var(--danger); }
        .bg-gold-glow { background: var(--warning-light); color: var(--warning); }
      `}</style>
    </div>
  );
};

export default CashierSummary;