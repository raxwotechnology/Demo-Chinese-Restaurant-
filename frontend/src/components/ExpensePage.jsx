import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  DollarSign, 
  CreditCard, 
  Landmark, 
  Calendar, 
  ChevronRight, 
  Database,
  History,
  TrendingDown,
  X,
  Briefcase
} from "lucide-react";
import API_BASE_URL from "../apiConfig";
import "../styles/PremiumUI.css";

const ExpensePage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [billItems, setBillItems] = useState([]);

  const [formData, setFormData] = useState({
    supplier: null,
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    billNo: "",
    paymentMethod: "Cash"
  });

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [suppRes, expRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auth/suppliers`, { headers }),
        axios.get(`${API_BASE_URL}/api/auth/expenses`, { headers })
      ]);
      setSuppliers(suppRes.data);
      setExpenses(expRes.data);
    } catch (err) {
      toast.error("Financial sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = (i, field, val) => {
    const updated = [...billItems];
    updated[i][field] = val;
    if (field === 'quantity' || field === 'unitPrice') {
      updated[i].total = (parseFloat(updated[i].quantity) || 0) * (parseFloat(updated[i].unitPrice) || 0);
    }
    setBillItems(updated);
    const newTotal = updated.reduce((sum, item) => sum + (item.total || 0), 0);
    setFormData({ ...formData, amount: newTotal.toFixed(2) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier || !formData.amount) return toast.error("Required fields missing");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        supplier: formData.supplier.value,
        amount: parseFloat(formData.amount),
        billItems
      };
      const url = editingId ? `${API_BASE_URL}/api/auth/expense/${editingId}` : `${API_BASE_URL}/api/auth/expense/add`;
      await axios[editingId ? 'put' : 'post'](url, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(editingId ? "Ledger updated" : "Expense recorded");
      resetForm();
      fetchInitialData();
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ supplier: null, amount: "", description: "", date: new Date().toISOString().split("T")[0], billNo: "", paymentMethod: "Cash" });
    setBillItems([]);
    setEditingId(null);
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      background: 'white',
      borderColor: state.isFocused ? 'var(--p-indigo-600)' : 'var(--border-subtle)',
      borderRadius: '12px',
      padding: '4px 8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      boxShadow: 'none',
      '&:hover': { borderColor: 'var(--p-indigo-600)' }
    })
  };

  if (loading && expenses.length === 0) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner-border text-indigo" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="finance-suite">
      <ToastContainer theme="colored" />
      
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h1 className="text-hero">Financial Ledger</h1>
          <p className="text-subtitle">Comprehensive tracking of operational expenditure and supplier obligations</p>
        </div>
        <div className="bento-card kpi-mini danger">
          <TrendingDown size={20} />
          <div>
            <span className="tiny-caps d-block">Monthly Outflow</span>
            <span className="fw-800 text-danger h5 m-0">{symbol}{expenses.reduce((s,e) => s + (e.amount || 0), 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Form Panel */}
        <div className="col-xl-4">
          <div className="bento-card pos-payment-card p-4 h-100 border-0 shadow-lg">
            <header className="d-flex align-items-center gap-3 mb-5">
               <div className="stat-icon-wrapper"><FileText size={20} /></div>
               <h4 className="fw-800 m-0">{editingId ? "Update Ledger" : "Record Expense"}</h4>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-6">
                  <label className="tiny-caps mb-2 d-block">Date</label>
                  <input type="date" className="pos-input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="col-6">
                  <label className="tiny-caps mb-2 d-block">Bill No</label>
                  <input type="text" className="pos-input" placeholder="INV-..." value={formData.billNo} onChange={(e) => setFormData({...formData, billNo: e.target.value})} />
                </div>
                <div className="col-12">
                  <label className="tiny-caps mb-2 d-block">Supplier Entity</label>
                  <Select 
                    styles={selectStyles}
                    options={suppliers.map(s => ({ value: s._id, label: s.name }))}
                    value={formData.supplier}
                    onChange={(val) => setFormData({...formData, supplier: val})}
                    placeholder="Search supplier..."
                  />
                </div>
                <div className="col-12">
                  <label className="tiny-caps mb-2 d-block">Brief Metadata</label>
                  <textarea className="pos-input" rows="2" placeholder="Describe the transaction..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="col-6">
                  <label className="tiny-caps mb-2 d-block">Amount</label>
                  <input type="number" className="pos-input fw-800 text-indigo" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="col-6">
                  <label className="tiny-caps mb-2 d-block">Channel</label>
                  <select className="pos-input" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-4 bg-app border border-dashed">
                <div className="d-flex justify-content-between align-items-center mb-3">
                   <span className="tiny-caps">Bill Breakdown</span>
                   <button type="button" className="icon-btn-round" onClick={() => setBillItems([...billItems, { description: "", quantity: 1, unitPrice: 0, total: 0 }])}>
                     <Plus size={14} />
                   </button>
                </div>
                <div className="bill-items-list">
                  {billItems.map((item, i) => (
                    <div key={i} className="row g-2 mb-2 align-items-center bg-white p-2 rounded-3 border">
                      <div className="col-6"><input type="text" className="border-0 bg-transparent w-100 small fw-700" placeholder="Item" value={item.description} onChange={(e) => handleUpdateItem(i, 'description', e.target.value)} /></div>
                      <div className="col-2"><input type="number" className="border-0 bg-transparent w-100 small text-center" value={item.quantity} onChange={(e) => handleUpdateItem(i, 'quantity', e.target.value)} /></div>
                      <div className="col-3"><input type="number" className="border-0 bg-transparent w-100 small text-end fw-800" value={item.unitPrice} onChange={(e) => handleUpdateItem(i, 'unitPrice', e.target.value)} /></div>
                      <div className="col-1 text-end"><button type="button" className="text-danger border-0 bg-transparent" onClick={() => setBillItems(billItems.filter((_, idx) => idx !== i))}><X size={12} /></button></div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-indigo w-100 py-3 mt-4 justify-content-center">
                 <Save size={18} />
                 <span>{editingId ? "UPDATE LEDGER" : "AUTHORIZE PAYMENT"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* List Panel */}
        <div className="col-xl-8">
           <div className="bento-card p-0 overflow-hidden shadow-lg border-0 bg-white">
              <header className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <History size={18} className="text-indigo" />
                  <h6 className="fw-900 m-0">Transaction History</h6>
                </div>
                <span className="badge-modern success">Live Ledger</span>
              </header>

              <div className="premium-table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Identity / Date</th>
                      <th>Supplier Entity</th>
                      <th>Valuation</th>
                      <th>Channel</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {expenses.map((exp, i) => (
                        <motion.tr 
                          key={exp._id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <td>
                            <div className="fw-800 text-main">{new Date(exp.date).toLocaleDateString()}</div>
                            <div className="tiny-caps opacity-50"># {exp.billNo}</div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                               <Briefcase size={14} className="text-muted" />
                               <span className="fw-700">{exp.supplier?.name}</span>
                            </div>
                          </td>
                          <td className="fw-800 text-indigo">{symbol}{exp.amount?.toLocaleString()}</td>
                          <td>
                            <div className="badge-modern info">
                               {exp.paymentMethod === 'Cash' ? <Banknote size={12} /> : exp.paymentMethod === 'Card' ? <CreditCard size={12} /> : <Landmark size={12} />}
                               <span className="ms-1">{exp.paymentMethod}</span>
                            </div>
                          </td>
                          <td className="text-end">
                             <button className="icon-btn-round" onClick={() => { setEditingId(exp._id); setFormData({ ...exp, supplier: { value: exp.supplier._id, label: exp.supplier.name } }); setBillItems(exp.billItems || []); }}>
                               <ChevronRight size={14} />
                             </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        .finance-suite { min-height: 100vh; padding-bottom: 50px; }
        .kpi-mini { padding: 16px 24px; display: flex; align-items: center; gap: 16px; border: 1px solid var(--border-subtle); background: white; }
        .bill-items-list { max-height: 200px; overflow-y: auto; }
      `}</style>
    </motion.div>
  );
};

const Banknote = ({ size, className }) => <DollarSign size={size} className={className} />;

export default ExpensePage;