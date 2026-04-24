import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaWallet, FaHistory, FaPlus, FaSave, FaTrash, FaEdit, FaTools, FaAd, FaLaptopCode, FaDatabase, FaChevronRight } from "react-icons/fa";
import "../styles/PremiumUI.css";

const OtherExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    category: "Marketing",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash"
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/expense/other`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data || []);
    } catch (err) {
      toast.error("Operational expense sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.date) {
      toast.error("Financial parameters missing");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingId 
        ? `${API_BASE_URL}/api/auth/expense/other/${editingId}`
        : `${API_BASE_URL}/api/auth/expense/other`;
      
      await axios[editingId ? 'put' : 'post'](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(editingId ? "Ledger updated" : "Expense logged successfully");
      setFormData({ category: "Marketing", amount: "", description: "", date: new Date().toISOString().split("T")[0], paymentMethod: "Cash" });
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      toast.error("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Purge this expense record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/auth/expense/other/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(expenses.filter(e => e._id !== id));
      toast.success("Record purged");
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  if (loading && expenses.length === 0) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <div className="text-center">
            <div className="spinner-border text-primary mb-3"></div>
            <div className="fw-900 text-main">Syncing Expense Cloud...</div>
        </div>
    </div>
  );

  return (
    <div className="expense-layout animate-in p-2">
      <ToastContainer theme="light" />
      
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title">Operational Expenditure</h1>
          <p className="premium-subtitle">Record and manage non-kitchen business costs and overheads</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-xl-4">
            <div className="orient-card border-0 shadow-platinum bg-white p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-red-glow p-2 rounded-circle"><FaWallet size={18} className="text-danger" /></div>
                    <h5 className="mb-0 fw-900 text-main">{editingId ? "Modify Expense" : "Log New Cost"}</h5>
                </div>
                
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <div className="col-12">
                        <label className="stat-label mb-2 d-block">Expense Category</label>
                        <select className="premium-input bg-app border-0 fw-800" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                            <option value="Marketing">Marketing & Ads</option>
                            <option value="Admin Supplies">Stationery / Office</option>
                            <option value="Repairs & Maintenance">Repairs / Upkeep</option>
                            <option value="Software/Subscription">IT / SaaS / Subscriptions</option>
                            <option value="Training">Staff Development</option>
                            <option value="Other">Other Overheads</option>
                        </select>
                    </div>

                    <div className="row g-3">
                        <div className="col-6">
                            <label className="stat-label mb-2 d-block">Amount ({symbol})</label>
                            <div className="position-relative">
                                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted fw-bold">{symbol}</span>
                                <input type="number" step="0.01" className="premium-input bg-app border-0 ps-5 fw-900 text-danger" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                            </div>
                        </div>
                        <div className="col-6">
                            <label className="stat-label mb-2 d-block">Effective Date</label>
                            <input type="date" className="premium-input bg-app border-0" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                        </div>
                    </div>

                    <div className="col-12">
                        <label className="stat-label mb-2 d-block">Description</label>
                        <textarea className="premium-input bg-app border-0" rows="3" placeholder="Explain the expenditure..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <button type="submit" className="btn-premium btn-primary py-3 rounded-4 shadow-sm w-100" disabled={loading}>
                        {editingId ? <FaSave className="me-2" /> : <FaPlus className="me-2" />}
                        {editingId ? "COMMIT MODIFICATION" : "REGISTER EXPENSE"}
                    </button>
                    {editingId && (
                        <button type="button" className="btn-premium btn-ghost w-100" onClick={() => {setEditingId(null); setFormData({category: "Marketing", amount: "", description: "", date: new Date().toISOString().split("T")[0], paymentMethod: "Cash"})}}>CANCEL EDIT</button>
                    )}
                </form>
            </div>
        </div>

        {/* List Column */}
        <div className="col-xl-8">
            <div className="orient-card p-0 border-0 shadow-platinum bg-white overflow-hidden">
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <h6 className="mb-0 fw-800 text-main d-flex align-items-center gap-2">
                        <FaDatabase className="text-primary" /> Operational Expenditure Ledger
                    </h6>
                    <span className="badge badge-red">Cost Audit</span>
                </div>
                
                <div className="table-container border-0">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Classification</th>
                                <th>Metadata</th>
                                <th>Execution Date</th>
                                <th>Valuation</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length > 0 ? expenses.slice(0, 15).map(exp => (
                                <tr key={exp._id}>
                                    <td>
                                        <div className="text-main fw-800 d-flex align-items-center gap-2">
                                            <div className="bg-app p-2 rounded-circle">
                                                {exp.category === 'Marketing' && <FaAd className="text-primary" size={12} />}
                                                {exp.category === 'Repairs & Maintenance' && <FaTools className="text-primary" size={12} />}
                                                {exp.category === 'Software/Subscription' && <FaLaptopCode className="text-primary" size={12} />}
                                                {['Marketing', 'Repairs & Maintenance', 'Software/Subscription'].indexOf(exp.category) === -1 && <FaWallet className="text-primary" size={12} />}
                                            </div>
                                            {exp.category}
                                        </div>
                                    </td>
                                    <td><div className="tiny text-muted truncate">{exp.description || 'No metadata description'}</div></td>
                                    <td><div className="text-main small fw-700">{new Date(exp.date).toLocaleDateString()}</div></td>
                                    <td><div className="text-danger fw-900">{symbol}{exp.amount?.toFixed(2)}</div></td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn-premium btn-ghost p-2 rounded-circle" onClick={() => { setEditingId(exp._id); setFormData(exp); }}><FaEdit size={10} /></button>
                                            <button className="btn-premium btn-ghost p-2 rounded-circle text-danger" onClick={() => handleDelete(exp._id)}><FaTrash size={10} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 opacity-40">
                                        <FaHistory size={32} className="mb-2" />
                                        <div className="fw-800">No operational overhead records</div>
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
        .tiny { font-size: 0.7rem; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
      `}</style>
    </div>
  );
};

export default OtherExpenses;