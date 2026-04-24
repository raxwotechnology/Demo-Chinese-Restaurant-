import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaReceipt, FaPlus, FaTrash, FaSave, FaBoxOpen, FaLink, FaExternalLinkAlt, FaFileInvoiceDollar, FaChevronRight, FaDatabase } from "react-icons/fa";
import "../styles/PremiumUI.css";

const ExpensePage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    supplier: null,
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    billNo: "",
    paymentMethod: "Cash"
  });
  const [billItems, setBillItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

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
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const addBillItem = () => {
    setBillItems([...billItems, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeBillItem = (idx) => {
    const updated = billItems.filter((_, i) => i !== idx);
    setBillItems(updated);
    const newTotal = updated.reduce((sum, item) => sum + (item.total || 0), 0);
    setFormData({ ...formData, amount: newTotal.toFixed(2) });
  };

  const updateBillItem = (idx, field, value) => {
    const updated = [...billItems];
    updated[idx][field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
        updated[idx].total = (parseFloat(updated[idx].quantity) || 0) * (parseFloat(updated[idx].unitPrice) || 0);
    }
    setBillItems(updated);
    const newTotal = updated.reduce((sum, item) => sum + (item.total || 0), 0);
    setFormData({ ...formData, amount: newTotal.toFixed(2) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier || !formData.amount || !formData.billNo) {
        toast.error("Identification parameters missing");
        return;
    }
    setLoading(true);
    try {
        const token = localStorage.getItem("token");
        const payload = {
            ...formData,
            supplier: formData.supplier.value,
            amount: parseFloat(formData.amount),
            billItems
        };
        const url = editingId 
            ? `${API_BASE_URL}/api/auth/expense/${editingId}`
            : `${API_BASE_URL}/api/auth/expense/add`;
        
        await axios[editingId ? 'put' : 'post'](url, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success(editingId ? "Ledger updated" : "Expenditure recorded");
        setFormData({ supplier: null, amount: "", description: "", date: new Date().toISOString().split("T")[0], billNo: "", paymentMethod: "Cash" });
        setBillItems([]);
        setEditingId(null);
        fetchInitialData();
    } catch (err) {
        toast.error("Transaction failed");
    } finally {
        setLoading(false);
    }
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      background: '#ffffff',
      borderColor: state.isFocused ? 'var(--primary)' : 'var(--border-light)',
      borderRadius: '12px',
      padding: '4px',
      fontSize: '0.9rem',
      fontWeight: '600',
      boxShadow: state.isFocused ? '0 0 0 4px var(--primary-glow)' : 'none',
      transition: 'all 0.2s',
      '&:hover': { borderColor: 'var(--primary)' }
    }),
    singleValue: (base) => ({ ...base, color: 'var(--text-main)' }),
    placeholder: (base) => ({ ...base, color: 'var(--text-muted)' }),
    menu: (base) => ({ 
      ...base, 
      background: '#ffffff', 
      borderRadius: '12px', 
      boxShadow: 'var(--shadow-lg)', 
      border: '1px solid var(--border-light)',
      zIndex: 100
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? 'var(--primary-light)' : 'transparent',
      color: state.isFocused ? 'var(--primary)' : 'var(--text-main)',
      fontWeight: '600',
      cursor: 'pointer'
    })
  };

  if (loading && expenses.length === 0) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <div className="text-center">
            <div className="spinner-border text-primary mb-3"></div>
            <div className="fw-900 text-main">Syncing Financial Cloud...</div>
        </div>
    </div>
  );

  return (
    <div className="finance-layout animate-in p-2">
      <ToastContainer theme="light" />
      
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title">Financial Ledger</h1>
          <p className="premium-subtitle">Record and monitor supplier payments and operational expenses</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-xl-4">
            <div className="orient-card border-0 shadow-platinum bg-white p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-blue-glow p-2 rounded-circle"><FaFileInvoiceDollar size={18} /></div>
                    <h5 className="mb-0 fw-900 text-main">{editingId ? "Update Entry" : "New Expenditure"}</h5>
                </div>
                
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <div className="row g-3">
                        <div className="col-6">
                            <label className="stat-label mb-2 d-block">Transaction Date</label>
                            <input type="date" className="premium-input bg-app border-0" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                        </div>
                        <div className="col-6">
                            <label className="stat-label mb-2 d-block">Bill / Invoice No</label>
                            <input type="text" className="premium-input bg-app border-0" placeholder="INV-001" value={formData.billNo} onChange={(e) => setFormData({...formData, billNo: e.target.value})} />
                        </div>
                        <div className="col-12">
                            <label className="stat-label mb-2 d-block">Select Supplier</label>
                            <Select 
                                styles={selectStyles}
                                options={suppliers.map(s => ({ value: s._id, label: s.name }))}
                                value={formData.supplier}
                                onChange={(val) => setFormData({...formData, supplier: val})}
                                placeholder="Locate supplier..."
                            />
                        </div>
                        <div className="col-6">
                            <label className="stat-label mb-2 d-block">Amount ({symbol})</label>
                            <input type="number" className="premium-input bg-app border-0 fw-900 text-primary" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                        </div>
                        <div className="col-6">
                            <label className="stat-label mb-2 d-block">Method</label>
                            <select className="premium-input bg-app border-0 fw-800" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}>
                                <option value="Cash">Physical Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Card">Electronic Card</option>
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="stat-label mb-2 d-block">Brief Description</label>
                            <textarea className="premium-input bg-app border-0" rows="2" placeholder="Note on this expense..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                        </div>
                    </div>

                    <div className="p-3 bg-app rounded-4 border">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="stat-label">Ledger Breakdown</span>
                            <button type="button" className="btn-premium btn-ghost py-1 px-3 fs-tiny rounded-pill" onClick={addBillItem}><FaPlus /> Add Line</button>
                        </div>
                        {billItems.length === 0 ? (
                            <div className="text-center py-3 opacity-30 tiny fw-800">No entries added</div>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                {billItems.map((item, i) => (
                                    <div key={i} className="row g-2 align-items-center bg-white p-2 rounded-3 border">
                                        <div className="col-6">
                                            <input type="text" className="premium-input border-0 p-0 small bg-transparent" placeholder="Item description" value={item.description} onChange={(e) => updateBillItem(i, 'description', e.target.value)} />
                                        </div>
                                        <div className="col-2">
                                            <input type="number" className="premium-input border-0 p-0 small bg-transparent text-center" placeholder="Qty" value={item.quantity} onChange={(e) => updateBillItem(i, 'quantity', e.target.value)} />
                                        </div>
                                        <div className="col-3">
                                            <input type="number" className="premium-input border-0 p-0 small bg-transparent text-end fw-800" placeholder="Rate" value={item.unitPrice} onChange={(e) => updateBillItem(i, 'unitPrice', e.target.value)} />
                                        </div>
                                        <div className="col-1 text-end">
                                            <button type="button" className="text-danger border-0 bg-transparent" onClick={() => removeBillItem(i)}><FaTrash size={10} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn-premium btn-primary py-3 rounded-4 shadow-sm w-100" disabled={loading}>
                        <FaSave className="me-2" /> {editingId ? "COMMIT UPDATE" : "AUTHORIZE TRANSACTION"}
                    </button>
                    {editingId && (
                        <button type="button" className="btn-premium btn-ghost w-100" onClick={() => { setEditingId(null); setFormData({ supplier: null, amount: "", description: "", date: new Date().toISOString().split("T")[0], billNo: "", paymentMethod: "Cash" }); setBillItems([]); }}>CANCEL EDIT</button>
                    )}
                </form>
            </div>
        </div>

        {/* List Column */}
        <div className="col-xl-8">
            <div className="orient-card p-0 border-0 shadow-platinum bg-white overflow-hidden">
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <h6 className="mb-0 fw-800 text-main d-flex align-items-center gap-2">
                        <FaDatabase className="text-primary" /> Executive Expenditure Directory
                    </h6>
                    <span className="badge badge-blue">Last 20 Transactions</span>
                </div>
                
                <div className="table-container border-0">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Date / ID</th>
                                <th>Supplier Node</th>
                                <th>Valuation</th>
                                <th>Channel</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length > 0 ? expenses.slice(0, 20).map(exp => (
                                <tr key={exp._id}>
                                    <td>
                                        <div className="text-main fw-800">{new Date(exp.date).toLocaleDateString()}</div>
                                        <div className="tiny text-muted">INV: {exp.billNo}</div>
                                    </td>
                                    <td>
                                        <div className="text-main fw-700 small">{exp.supplier?.name}</div>
                                        <div className="tiny text-muted truncate">{exp.description || "No metadata"}</div>
                                    </td>
                                    <td><div className="text-primary fw-900">{symbol}{exp.amount?.toFixed(2)}</div></td>
                                    <td><span className="badge badge-blue">{exp.paymentMethod}</span></td>
                                    <td className="text-center">
                                        <button className="btn-premium btn-ghost p-2 rounded-circle" onClick={() => { setEditingId(exp._id); setFormData({ ...exp, supplier: { value: exp.supplier._id, label: exp.supplier.name } }); setBillItems(exp.billItems || []); }}>
                                            <FaChevronRight size={10} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 opacity-40">
                                        <FaReceipt size={32} className="mb-2" />
                                        <div className="fw-800">No financial assets found</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        .fs-tiny { font-size: 0.65rem; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
      `}</style>
    </div>
  );
};

export default ExpensePage;