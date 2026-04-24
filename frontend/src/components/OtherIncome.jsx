import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCoins, FaHistory, FaPlus, FaSave, FaTrash, FaEdit, FaCreditCard, FaMoneyBillWave, FaDonate, FaDatabase, FaChevronRight } from "react-icons/fa";
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
      const res = await axios.get(`${API_BASE_URL}/api/auth/income/other`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncomes(res.data || []);
    } catch (err) {
      toast.error("Miscellaneous revenue sync failed");
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
        ? `${API_BASE_URL}/api/auth/income/other/${editingId}`
        : `${API_BASE_URL}/api/auth/income/other`;
      
      await axios[editingId ? 'put' : 'post'](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(editingId ? "Ledger updated" : "Revenue logged successfully");
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
    if (!window.confirm("Purge this revenue record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/auth/income/other/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncomes(incomes.filter(i => i._id !== id));
      toast.success("Record purged");
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  if (loading && incomes.length === 0) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <div className="text-center">
            <div className="spinner-border text-primary mb-3"></div>
            <div className="fw-900 text-main">Syncing Revenue Cloud...</div>
        </div>
    </div>
  );

  return (
    <div className="revenue-layout animate-in p-2">
      <ToastContainer theme="light" />
      
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title">Miscellaneous Revenue</h1>
          <p className="premium-subtitle">Record non-sales income like tips, event fees, and donations</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-xl-4">
            <div className="orient-card border-0 shadow-platinum bg-white p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-gold-glow p-2 rounded-circle"><FaDonate size={18} className="text-warning" /></div>
                    <h5 className="mb-0 fw-900 text-main">{editingId ? "Update Entry" : "New Income Log"}</h5>
                </div>
                
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <div className="col-12">
                        <label className="stat-label mb-2 d-block">Revenue Source</label>
                        <select className="premium-input bg-app border-0 fw-800" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})}>
                            <option value="Tips">Service Tips</option>
                            <option value="Event Rental">Event Space Rental</option>
                            <option value="Merchandise">Branded Merchandise</option>
                            <option value="Delivery Fee">Surcharge / Delivery</option>
                            <option value="Donations">Grant / Donations</option>
                            <option value="Other">Other Miscellaneous</option>
                        </select>
                    </div>

                    <div className="row g-3">
                        <div className="col-6">
                            <label className="stat-label mb-2 d-block">Amount ({symbol})</label>
                            <div className="position-relative">
                                <FaCoins className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={10} />
                                <input type="number" step="0.01" className="premium-input bg-app border-0 ps-5 fw-900 text-primary" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                            </div>
                        </div>
                        <div className="col-6">
                            <label className="stat-label mb-2 d-block">Transaction Date</label>
                            <input type="date" className="premium-input bg-app border-0" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                        </div>
                    </div>

                    <div className="col-12">
                        <label className="stat-label mb-2 d-block">Payment Mode</label>
                        <div className="d-flex gap-2">
                            {['Cash', 'Card', 'Bank'].map(mode => (
                                <button key={mode} type="button" className={`btn-premium flex-grow-1 py-2 small border-0 ${formData.paymentMethod === mode ? 'btn-primary shadow-sm' : 'bg-app text-muted fw-700'}`} onClick={() => setFormData({...formData, paymentMethod: mode})}>
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="col-12">
                        <label className="stat-label mb-2 d-block">Remarks / Description</label>
                        <textarea className="premium-input bg-app border-0" rows="3" placeholder="Brief metadata note..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <button type="submit" className="btn-premium btn-primary py-3 rounded-4 shadow-sm w-100" disabled={loading}>
                        {editingId ? <><FaSave className="me-2" /> COMMIT CHANGES</> : <><FaPlus className="me-2" /> LOG REVENUE</>}
                    </button>
                    {editingId && (
                        <button type="button" className="btn-premium btn-ghost w-100" onClick={() => {setEditingId(null); setFormData({source: "Tips", amount: "", description: "", date: new Date().toISOString().split("T")[0], paymentMethod: "Cash"})}}>CANCEL EDIT</button>
                    )}
                </form>
            </div>
        </div>

        {/* List Column */}
        <div className="col-xl-8">
            <div className="orient-card p-0 border-0 shadow-platinum bg-white overflow-hidden">
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <h6 className="mb-0 fw-800 text-main d-flex align-items-center gap-2">
                        <FaDatabase className="text-primary" /> Miscellaneous Revenue Ledger
                    </h6>
                    <span className="badge badge-blue">Audit Trail</span>
                </div>
                
                <div className="table-container border-0">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Source / Metadata</th>
                                <th>Channel</th>
                                <th>Execution Date</th>
                                <th>Valuation</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incomes.length > 0 ? incomes.slice(0, 15).map(inc => (
                                <tr key={inc._id}>
                                    <td>
                                        <div className="text-main fw-800">{inc.source}</div>
                                        <div className="tiny text-muted truncate">{inc.description || 'No metadata description'}</div>
                                    </td>
                                    <td><span className="badge badge-blue">{inc.paymentMethod}</span></td>
                                    <td><div className="text-main small fw-700">{new Date(inc.date).toLocaleDateString()}</div></td>
                                    <td><div className="text-primary fw-900">{symbol}{inc.amount?.toFixed(2)}</div></td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn-premium btn-ghost p-2 rounded-circle" onClick={() => { setEditingId(inc._id); setFormData(inc); }}><FaEdit size={10} /></button>
                                            <button className="btn-premium btn-ghost p-2 rounded-circle text-danger" onClick={() => handleDelete(inc._id)}><FaTrash size={10} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 opacity-40">
                                        <FaHistory size={32} className="mb-2" />
                                        <div className="fw-800">No miscellaneous inflow records</div>
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

export default OtherIncome;