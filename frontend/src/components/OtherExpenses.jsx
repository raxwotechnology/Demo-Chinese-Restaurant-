import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaWallet, FaHistory, FaPlus, FaSave, FaTrash, FaEdit, FaTools, FaAd, FaLaptopCode } from "react-icons/fa";
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
      const res = await axios.get("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/other", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data || []);
    } catch (err) {
      toast.error("Failed to sync expense records");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.date) {
      toast.error("Required fields missing");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingId 
        ? `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/other/${editingId}`
        : "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/other";
      
      await axios[editingId ? 'put' : 'post'](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(editingId ? "Expense record updated" : "Operational expense logged");
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
    if (!window.confirm("Delete this expense record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/other/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(expenses.filter(e => e._id !== id));
      toast.success("Record purged");
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  return (
    <div className="expense-container animate-fade-in">
      <ToastContainer theme="dark" />
      
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title mb-1">Operational Expenditure</h1>
          <p className="premium-subtitle mb-0">Record and manage non-kitchen business costs and overheads</p>
        </div>
      </div>

      <div className="row g-5">
        <div className="col-xl-4">
            <div className="premium-card p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-red-glow p-3 rounded-circle"><FaWallet className="text-danger" size={24} /></div>
                    <h3 className="premium-title h5 mb-0">{editingId ? "Modify Expense" : "Log New Cost"}</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                    <div>
                        <label className="orient-stat-label">Expense Category</label>
                        <select className="premium-input premium-select" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                            <option value="Marketing">Marketing & Ads</option>
                            <option value="Admin Supplies">Stationery / Office</option>
                            <option value="Repairs & Maintenance">Repairs / Upkeep</option>
                            <option value="Software/Subscription">IT / SaaS / Subscriptions</option>
                            <option value="Training">Staff Development</option>
                            <option value="Other">Other Overheads</option>
                        </select>
                    </div>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="orient-stat-label">Amount ({symbol})</label>
                            <div className="position-relative">
                                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-danger fw-bold">{symbol}</span>
                                <input type="number" step="0.01" className="premium-input ps-5" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="orient-stat-label">Effective Date</label>
                            <input type="date" className="premium-input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="orient-stat-label">Description</label>
                        <textarea className="premium-input" rows="3" placeholder="Explain the expenditure..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <button type="submit" className="btn-premium btn-premium-secondary py-3" disabled={loading}>
                        {editingId ? <><FaSave className="me-2" /> Update Record</> : <><FaPlus className="me-2" /> Register Expense</>}
                    </button>
                    {editingId && <button type="button" className="btn-premium btn-premium-primary py-2" onClick={() => {setEditingId(null); setFormData({category: "Marketing", amount: "", description: "", date: new Date().toISOString().split("T")[0], paymentMethod: "Cash"})}}>Cancel</button>}
                </form>
            </div>
        </div>

        <div className="col-xl-8">
            <div className="orient-card p-0 overflow-hidden">
                <div className="p-4 border-bottom border-white-05 d-flex justify-content-between align-items-center">
                    <h5 className="text-white mb-0"><FaHistory className="me-2 text-danger" /> Expense Log History</h5>
                </div>
                <div className="premium-table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Classification</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Value</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-danger"></div></td></tr>
                            ) : expenses.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">No operational expenses found.</td></tr>
                            ) : expenses.slice(0, 12).map(exp => (
                                <tr key={exp._id}>
                                    <td>
                                        <div className="text-white fw-bold d-flex align-items-center gap-2">
                                            {exp.category === 'Marketing' && <FaAd className="text-danger opacity-50" />}
                                            {exp.category === 'Repairs & Maintenance' && <FaTools className="text-danger opacity-50" />}
                                            {exp.category === 'Software/Subscription' && <FaLaptopCode className="text-danger opacity-50" />}
                                            {exp.category}
                                        </div>
                                    </td>
                                    <td><div className="small orient-text-muted">{exp.description || '--'}</div></td>
                                    <td><div className="small text-white">{new Date(exp.date).toLocaleDateString()}</div></td>
                                    <td><div className="text-danger fw-bold">{symbol}{exp.amount?.toFixed(2)}</div></td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn-premium btn-premium-accent p-2" onClick={() => { setEditingId(exp._id); setFormData(exp); }}><FaEdit /></button>
                                            <button className="btn-premium btn-premium-primary p-2" onClick={() => handleDelete(exp._id)}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default OtherExpenses;