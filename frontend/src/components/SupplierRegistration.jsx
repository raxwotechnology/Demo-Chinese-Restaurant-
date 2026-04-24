import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTruck, FaUserAlt, FaBuilding, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaEdit, FaTrash, FaPlus, FaSave, FaSyncAlt } from "react-icons/fa";
import "../styles/PremiumUI.css";

const SupplierRegistration = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({ name: "", companyName: "", contact: "", email: "", address: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(res.data || []);
    } catch (err) {
      toast.error("Failed to sync vendor directory");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.name || !formData.contact) {
      toast.error("Required fields missing");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingId 
        ? `${API_BASE_URL}/api/auth/supplier/${editingId}`
        : `${API_BASE_URL}/api/auth/supplier/register`;
      
      const res = await axios[editingId ? 'put' : 'post'](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(editingId ? "Vendor profile updated" : "New vendor registered");
      setFormData({ name: "", companyName: "", contact: "", email: "", address: "" });
      setEditingId(null);
      fetchSuppliers();
    } catch (err) {
      toast.error("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this vendor from directory?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/auth/supplier/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(suppliers.filter(s => s._id !== id));
      toast.success("Vendor purged");
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  return (
    <div className="supplier-management-container animate-fade-in p-2">
      <ToastContainer theme="light" />
      
      {/* Platinum Header */}
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title">Supply Chain</h1>
          <p className="premium-subtitle">Manage authorized vendors and procurement contacts</p>
        </div>
        <button className="btn-premium btn-premium-primary" onClick={fetchSuppliers}>
            <FaSyncAlt /> Refresh Directory
        </button>
      </div>

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-xl-4">
            <div className="orient-card p-4 h-100 bg-white">
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="bg-gold-glow p-3 rounded-circle"><FaTruck size={24} /></div>
                    <h3 className="mb-0 fw-800 h5 text-main">{editingId ? "Modify Vendor" : "Onboard New Vendor"}</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                    <div>
                        <label className="orient-stat-label">Company / Entity Name</label>
                        <div className="position-relative">
                            <FaBuilding className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={12} />
                            <input type="text" className="premium-input ps-5 w-100" placeholder="e.g. Royal Spices Ltd." value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="orient-stat-label">Primary Contact Person</label>
                        <div className="position-relative">
                            <FaUserAlt className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={12} />
                            <input type="text" className="premium-input ps-5 w-100" placeholder="e.g. John Smith" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                    </div>
                    <div className="row g-3">
                        <div className="col-md-12">
                            <label className="orient-stat-label">Phone / WhatsApp</label>
                            <div className="position-relative">
                                <FaPhoneAlt className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={12} />
                                <input type="text" className="premium-input ps-5 w-100" placeholder="+123..." value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
                            </div>
                        </div>
                        <div className="col-md-12">
                            <label className="orient-stat-label">Email Communications</label>
                            <div className="position-relative">
                                <FaEnvelope className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={12} />
                                <input type="email" className="premium-input ps-5 w-100" placeholder="vendor@mail.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="orient-stat-label">Registered Business Address</label>
                        <div className="position-relative">
                            <FaMapMarkerAlt className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={12} />
                            <input type="text" className="premium-input ps-5 w-100" placeholder="Street, City..." value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                        </div>
                    </div>

                    <div className="d-flex flex-column gap-2 mt-2">
                        <button type="submit" className="btn-premium btn-premium-secondary py-3 rounded-4 shadow-sm" disabled={loading}>
                            {editingId ? <><FaSave className="me-2" /> Commit Profile Update</> : <><FaPlus className="me-2" /> Finalize Registration</>}
                        </button>
                        {editingId && <button type="button" className="btn-premium btn-premium-primary py-2 rounded-4" onClick={() => {setEditingId(null); setFormData({name: "", companyName: "", contact: "", email: "", address: ""})}}>Discard Changes</button>}
                    </div>
                </form>
            </div>
        </div>

        {/* List Column */}
        <div className="col-xl-8">
            <div className="orient-card p-0 overflow-hidden bg-white shadow-platinum h-100 d-flex flex-column">
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <h6 className="mb-0 fw-800 text-main d-flex align-items-center gap-2">
                        <FaBuilding className="text-primary" size={16} /> Authorized Vendor Directory
                    </h6>
                    <span className="badge-premium badge-primary">{suppliers.length} Verified Sources</span>
                </div>
                
                <div className="premium-table-container border-0 flex-grow-1 overflow-auto">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Vendor Identity</th>
                                <th>Representative</th>
                                <th>Communications</th>
                                <th>Location</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : suppliers.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">No active vendors found in the registry.</td></tr>
                            ) : suppliers.map(s => (
                                <tr key={s._id}>
                                    <td>
                                        <div className="text-main fw-800">{s.companyName}</div>
                                        <div className="tiny text-primary fw-bold text-uppercase">Certified Partner</div>
                                    </td>
                                    <td><div className="text-main small fw-500">{s.name}</div></td>
                                    <td>
                                        <div className="text-main small fw-800">{s.contact}</div>
                                        <div className="tiny text-muted">{s.email || '--'}</div>
                                    </td>
                                    <td><div className="tiny text-muted truncate-2">{s.address || '--'}</div></td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn-premium btn-premium-primary p-2 text-primary" onClick={() => { setEditingId(s._id); setFormData(s); }}><FaEdit size={12} /></button>
                                            <button className="btn-premium btn-premium-primary p-2 text-danger" onClick={() => handleDelete(s._id)}><FaTrash size={12} /></button>
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

      <style>{`
        .bg-gold-glow { background: var(--warning-light); color: var(--warning); }
        .fw-800 { font-weight: 800; }
        .tiny { font-size: 0.7rem; }
        .truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default SupplierRegistration;