import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapPin, DollarSign, Plus, Edit, Trash2, Globe, RefreshCcw } from "lucide-react";
import "../styles/PremiumUI.css";

const DeliveryCharges = () => {
  const [charges, setCharges] = useState([]);
  const [form, setForm] = useState({ placeName: "", charge: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchCharges();
  }, []);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/delivery-charges`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCharges(res.data);
    } catch (err) {
      toast.error("Failed to load delivery charges");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { placeName, charge } = form;

    if (!placeName.trim() || charge === "" || parseFloat(charge) < 0) {
      toast.error("Valid place name and charge required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...(editingId && { id: editingId }),
        placeName: placeName.trim(),
        charge: parseFloat(charge)
      };

      await axios.post(
        `${API_BASE_URL}/api/auth/delivery-charges`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(editingId ? "Delivery charge updated!" : "Delivery charge added!");
      setForm({ placeName: "", charge: "" });
      setEditingId(null);
      fetchCharges();
    } catch (err) {
      const msg = err.response?.data?.error || "Operation failed";
      toast.error(msg);
    }
  };

  const startEdit = (charge) => {
    setForm({ placeName: charge.placeName, charge: charge.charge });
    setEditingId(charge._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this delivery charge?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/api/auth/delivery-charges/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Deleted successfully");
      fetchCharges();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="delivery-charges-root animate-fade-in p-2">
      <ToastContainer theme="dark" />
      
      {/* Header Area */}
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title mb-1">Logistics Matrix</h1>
          <p className="premium-subtitle mb-0">Configure regional delivery overheads and coverage zones</p>
        </div>
        <div className="d-flex gap-2">
            <button className="btn-ghost d-flex align-items-center gap-2" onClick={fetchCharges}>
                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Sync
            </button>
            <div className="bento-card py-2 px-4 d-flex align-items-center gap-2 bg-white shadow-sm border-0">
                <Globe className="text-indigo-600" size={18} />
                <span className="fw-bold text-main">{charges.length} Active Zones</span>
            </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Input Column */}
        <div className="col-xl-4">
            <div className="bento-card p-4 h-100 bg-white shadow-sm">
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="bg-blue-glow p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        <MapPin size={22} />
                    </div>
                    <div>
                        <h3 className="mb-0 fw-800 h5 text-main">{editingId ? "Update Zone" : "New Coverage Zone"}</h3>
                        <p className="text-muted small mb-0">Define location-specific pricing</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                    <div className="input-group-premium">
                        <label className="tiny-caps">Destination Place Name</label>
                        <div className="position-relative">
                            <MapPin className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                            <input 
                                type="text" 
                                name="placeName"
                                className="input-premium ps-5" 
                                placeholder="e.g. Downtown Core" 
                                value={form.placeName}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>

                    <div className="input-group-premium">
                        <label className="tiny-caps">Delivery Surcharge ({symbol})</label>
                        <div className="position-relative">
                            <DollarSign className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                            <input 
                                type="number" 
                                name="charge"
                                className="input-premium ps-5" 
                                placeholder="0.00" 
                                step="0.01"
                                min="0"
                                value={form.charge}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>

                    <div className="d-flex flex-column gap-2 mt-2">
                        <button type="submit" className="btn-indigo py-3 justify-content-center">
                            {editingId ? <><Edit size={18} className="me-2" /> Commit Update</> : <><Plus size={18} className="me-2" /> Add Location</>}
                        </button>
                        {editingId && (
                            <button type="button" className="btn-ghost py-3" onClick={() => { setForm({ placeName: "", charge: "" }); setEditingId(null); }}>
                                Discard Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>

        {/* Matrix List Column */}
        <div className="col-xl-8">
            <div className="bento-card p-0 overflow-hidden bg-white shadow-sm h-100 d-flex flex-column">
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-10">
                    <h6 className="mb-0 fw-800 text-main d-flex align-items-center gap-2">
                        <MapPin className="text-indigo-600" size={16} /> Configured Rate Matrix
                    </h6>
                    <span className="badge-premium badge-blue">System Active</span>
                </div>

                <div className="premium-table-container border-0 flex-grow-1 overflow-auto">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Location Identity</th>
                                <th>Operational Surcharge</th>
                                <th className="text-center">Manage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" className="text-center py-5"><div className="spinner-border text-indigo-600"></div></td></tr>
                            ) : charges.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-5 text-muted">
                                        <div className="mb-2"><Globe size={32} opacity={0.2} className="mx-auto" /></div>
                                        No delivery zones defined yet.
                                    </td>
                                </tr>
                            ) : charges.map((dc) => (
                                <tr key={dc._id}>
                                    <td>
                                        <div className="text-main fw-800">{dc.placeName}</div>
                                        <div className="tiny-caps text-muted">Active Coverage</div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="bg-blue-glow p-1 rounded small"><DollarSign size={12} /></div>
                                            <span className="text-main fw-bold h5 mb-0">{symbol}{dc.charge.toFixed(2)}</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn-ghost p-2 text-indigo-600 rounded-circle" onClick={() => startEdit(dc)}>
                                                <Edit size={14} />
                                            </button>
                                            <button className="btn-ghost p-2 text-danger rounded-circle" onClick={() => handleDelete(dc._id)}>
                                                <Trash2 size={14} />
                                            </button>
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

export default DeliveryCharges;
    </div>
  );
};

export default DeliveryCharges;