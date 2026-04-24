import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaTruck, FaDollarSign, FaExclamationCircle, FaDatabase, FaSave } from "react-icons/fa";
import "../styles/PremiumUI.css";

const AdminDeliveryCharge = () => {
  const [deliveryCharge, setDeliveryCharge] = useState({
    amount: 0,
    isActive: false
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryCharge();
  }, []);

  const fetchDeliveryCharge = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/admin/delivery-charge`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeliveryCharge(res.data);
    } catch (err) {
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setDeliveryCharge((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/api/auth/admin/delivery-charge`,
        deliveryCharge,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      setDeliveryCharge(res.data);
      toast.success("Governance logic updated");
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const symbol = localStorage.getItem("currencySymbol") || "$";

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <div className="text-center">
            <div className="spinner-border text-primary mb-3"></div>
            <div className="fw-900 text-main">Syncing Logistic Parameters...</div>
        </div>
    </div>
  );

  return (
    <div className="delivery-charge-layout animate-in p-2">
      <ToastContainer theme="light" />
      
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title">Logistic Governance</h1>
          <p className="premium-subtitle">Configure delivery premiums and takeaway routing logic</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
            <div className="orient-card border-0 shadow-platinum bg-white p-5">
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="bg-blue-glow p-3 rounded-circle"><FaTruck size={22} className="text-primary" /></div>
                    <div>
                        <h4 className="mb-0 fw-900 text-main">Logistic Parameter</h4>
                        <p className="tiny text-muted mb-0 fw-700">CHARGE PER TRIP ({symbol})</p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                    <div className="col-12">
                        <label className="stat-label mb-2 d-block">Premium Amount ({symbol})</label>
                        <div className="position-relative">
                            <FaDollarSign className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
                            <input
                              type="number"
                              name="amount"
                              value={deliveryCharge.amount}
                              onChange={handleChange}
                              min="0"
                              step="0.1"
                              className="premium-input bg-app border-0 ps-5 fw-900 text-primary fs-4"
                              required
                            />
                        </div>
                    </div>

                    <div className="col-12 p-4 bg-app rounded-4 border">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="fw-900 text-main mb-1">Routing Logic</h6>
                                <p className="tiny text-muted mb-0 fw-600">Enable or suspend delivery charge</p>
                            </div>
                            <label className="switch">
                              <input
                                type="checkbox"
                                name="isActive"
                                checked={deliveryCharge.isActive}
                                onChange={handleChange}
                              />
                              <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn-premium btn-primary py-3 rounded-pill shadow-lg w-100 mt-4" disabled={saving}>
                        <FaSave className="me-2" /> {saving ? "AUTHORIZING..." : "COMMIT GLOBAL CHANGE"}
                    </button>
                </form>
            </div>
        </div>

        <div className="col-xl-7">
            <div className="row g-4 mb-4">
                <div className="col-md-6">
                    <div className="orient-card stat-widget py-4 border-0 shadow-platinum bg-white">
                        <div className="stat-icon bg-gold-glow"><FaDollarSign size={20} className="text-warning" /></div>
                        <div>
                            <div className="stat-label">Current Premium</div>
                            <div className="stat-value">{symbol}{deliveryCharge.amount.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="orient-card stat-widget py-4 border-0 shadow-platinum bg-white">
                        <div className="stat-icon bg-blue-glow"><FaDatabase size={20} /></div>
                        <div>
                            <div className="stat-label">Logistic Node</div>
                            <div className="stat-value text-uppercase">{deliveryCharge.isActive ? "OPERATIONAL" : "SUSPENDED"}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="orient-card p-5 border-0 shadow-platinum bg-white">
                <h5 className="fw-900 text-main mb-4">Live Operational Preview</h5>
                <div className="p-4 bg-light rounded-4 border d-flex gap-4 align-items-start">
                    <div className="bg-white p-3 rounded-circle shadow-sm"><FaExclamationCircle className="text-primary" /></div>
                    <div>
                        <p className="text-main fw-800 mb-1">Pricing Engine Logic</p>
                        <p className="tiny text-muted fw-600 mb-0">
                            When <strong>Operational</strong>, the system will automatically append a <strong>{symbol}{deliveryCharge.amount.toFixed(2)}</strong> logistic premium to all takeaway and delivery invoices processed at the terminal.
                        </p>
                    </div>
                </div>
                
                <div className="mt-5 p-4 bg-app rounded-4 border border-dashed">
                    <p className="tiny text-muted fw-700 mb-0">Security Note: Personnel must have administrative clearance to modify global logistic parameters.</p>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        .switch { position: relative; display: inline-block; width: 60px; height: 34px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; inset: 0; background-color: #e2e8f0; transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 26px; width: 26px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(26px); }
        .tiny { font-size: 0.7rem; }
      `}</style>
    </div>
  );
};

export default AdminDeliveryCharge;
