import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCoins, FaHistory, FaPlus, FaSave, FaTrash, FaEdit, FaCreditCard, FaMoneyBillWave, FaDonate } from "react-icons/fa";
import "../styles/PremiumUI.css";

const OtherIncome = () => {
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({
    source: "Tips",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash"
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/income/other", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncomes(res.data || []);
    } catch (err) {
      toast.error("Failed to sync revenue records");
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
        ? `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/income/other/${editingId}`
        : "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/income/other";
      
      await axios[editingId ? 'put' : 'post'](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(editingId ? "Revenue record updated" : "Miscellaneous income logged");
      setFormData({ source: "Tips", amount: "", description: "", date: new Date().toISOString().split("T")[0], paymentMethod: "Cash" });
      setEditingId(null);
      fetchIncomes();
    } catch (err) {
      toast.error("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this revenue record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/income/other/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncomes(incomes.filter(i => i._id !== id));
      toast.success("Record purged");
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  return (
    <div className="revenue-container animate-fade-in">
      <ToastContainer theme="dark" />
      
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title mb-1">Miscellaneous Revenue</h1>
          <p className="premium-subtitle mb-0">Record non-sales income like tips, event fees, and donations</p>
        </div>
      </div>

      <div className="row g-5">
        <div className="col-xl-4">
            <div className="premium-card p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-gold-glow p-3 rounded-circle"><FaDonate className="text-gold" size={24} /></div>
                    <h3 className="premium-title h5 mb-0">{editingId ? "Update Entry" : "New Income Log"}</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                    <div>
                        <label className="orient-stat-label">Revenue Source</label>
                        <select className="premium-input premium-select" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})}>
                            <option value="Tips">Service Tips</option>
                            <option value="Event Rental">Event Space Rental</option>
                            <option value="Merchandise">Branded Merchandise</option>
                            <option value="Delivery Fee">Surcharge / Delivery</option>
                            <option value="Donations">Grant / Donations</option>
                            <option value="Other">Other Miscellaneous</option>
                        </select>
                    </div>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="orient-stat-label">Amount ({symbol})</label>
                            <div className="position-relative">
                                <FaCoins className="position-absolute top-50 start-0 translate-middle-y ms-3 text-gold" />
                                <input type="number" step="0.01" className="premium-input ps-5" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="orient-stat-label">Transaction Date</label>
                            <input type="date" className="premium-input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="orient-stat-label">Payment Mode</label>
                        <div className="d-flex gap-2">
                            {['Cash', 'Card', 'Bank'].map(mode => (
                                <button key={mode} type="button" className={`btn-premium flex-grow-1 py-2 small ${formData.paymentMethod === mode ? 'btn-premium-secondary' : 'btn-premium-primary'}`} onClick={() => setFormData({...formData, paymentMethod: mode})}>
                                    {mode === 'Cash' && <FaMoneyBillWave className="me-1" />}
                                    {mode === 'Card' && <FaCreditCard className="me-1" />}
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="orient-stat-label">Remarks / Description</label>
                        <textarea className="premium-input" rows="3" placeholder="Brief note..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <button type="submit" className="btn-premium btn-premium-secondary py-3" disabled={loading}>
                        {editingId ? <><FaSave className="me-2" /> Commit Changes</> : <><FaPlus className="me-2" /> Log Revenue</>}
                    </button>
                    {editingId && <button type="button" className="btn-premium btn-premium-primary py-2" onClick={() => {setEditingId(null); setFormData({source: "Tips", amount: "", description: "", date: new Date().toISOString().split("T")[0], paymentMethod: "Cash"})}}>Cancel Edit</button>}
                </form>
            </div>
        </div>

        <div className="col-xl-8">
            <div className="orient-card p-0 overflow-hidden">
                <div className="p-4 border-bottom border-white-05 d-flex justify-content-between align-items-center">
                    <h5 className="text-white mb-0"><FaHistory className="me-2 text-gold" /> Recent Non-Sales Inflow</h5>
                </div>
                <div className="premium-table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Source / Desc</th>
                                <th>Method</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-gold"></div></td></tr>
                            ) : incomes.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">No miscellaneous revenue recorded.</td></tr>
                            ) : incomes.slice(0, 12).map(inc => (
                                <tr key={inc._id}>
                                    <td>
                                        <div className="text-white fw-bold">{inc.source}</div>
                                        <div className="small orient-text-muted">{inc.description || 'No description'}</div>
                                    </td>
                                    <td><div className={`badge-premium ${inc.paymentMethod === 'Cash' ? 'badge-success' : 'badge-primary'}`}>{inc.paymentMethod}</div></td>
                                    <td><div className="small text-white">{new Date(inc.date).toLocaleDateString()}</div></td>
                                    <td><div className="text-gold fw-bold">{symbol}{inc.amount?.toFixed(2)}</div></td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn-premium btn-premium-accent p-2" onClick={() => { setEditingId(inc._id); setFormData(inc); }}><FaEdit /></button>
                                            <button className="btn-premium btn-premium-primary p-2" onClick={() => handleDelete(inc._id)}><FaTrash /></button>
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

export default OtherIncome;