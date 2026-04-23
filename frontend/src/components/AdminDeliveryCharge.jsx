import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import { Truck, DollarSign, Settings, CheckCircle2, AlertCircle } from "lucide-react";

const AdminDeliveryCharge = () => {
  const [deliveryCharge, setDeliveryCharge] = useState({
    amount: 0,
    isActive: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDeliveryCharge();
  }, []);

  const fetchDeliveryCharge = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/admin/delivery-charge",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDeliveryCharge(res.data);
    } catch (err) {
      console.error("Failed to load delivery charge:", err.message);
      toast.error("Failed to load delivery charge");
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
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/admin/delivery-charge",
        deliveryCharge,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDeliveryCharge(res.data);
      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error("Failed to update delivery charge");
    } finally {
      setSaving(false);
    }
  };

  const symbol = localStorage.getItem("currencySymbol") || "$";

  return (
    <div className="admin-delivery-config">
      <div className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-width-900 mx-auto"
        >
          {/* Header */}
          <div className="d-flex align-items-center gap-4 mb-5">
            <div className="p-3 rounded-4 glass-card text-jade-glow">
              <Truck size={32} />
            </div>
            <div>
              <h2 className="text-white fw-bold mb-1">Delivery Charge Settings</h2>
              <p className="text-secondary m-0">Synchronize takeaway routing & pricing tier</p>
            </div>
          </div>

          <div className="row g-4">
            {/* Control Panel */}
            <div className="col-lg-7">
              <div className="glass-card p-4 h-100">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-jade-soft text-jade">
                    <Settings size={18} />
                  </div>
                  <h5 className="m-0 fw-bold text-white">Advanced Routing</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="text-secondary small fw-bold mb-2 letter-spacing-1">CHARGE PER TRIP ({symbol})</label>
                    <div className="position-relative">
                      <div className="position-absolute start-0 top-50 translate-middle-y ps-3 text-secondary">
                        <DollarSign size={18} />
                      </div>
                      <input
                        type="number"
                        name="amount"
                        value={deliveryCharge.amount}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        className="form-control glass-panel border-white border-opacity-10 text-white p-3 ps-5 hover-jade"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-3 glass-panel rounded-4 border-white border-opacity-10 mb-4">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className="text-white fw-bold m-0">System Override</h6>
                        <p className="text-secondary small m-0">Apply charge to all takeaway nodes</p>
                      </div>
                      <div className="form-check form-switch m-0">
                        <input
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          checked={deliveryCharge.isActive}
                          onChange={handleChange}
                          className="form-check-input"
                          style={{ width: '3em', height: '1.5em', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="save-btn w-100 py-3 rounded-4 fw-bold"
                  >
                    {saving ? "Synchronizing..." : "Update Vault Settings"}
                  </motion.button>
                </form>
              </div>
            </div>

            {/* Status Hub */}
            <div className="col-lg-5">
              <div className="glass-card p-4 h-100">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-gold-soft text-gold">
                    <CheckCircle2 size={18} />
                  </div>
                  <h5 className="m-0 fw-bold text-white">Live Status</h5>
                </div>

                <div className="status-display mb-4">
                  <div className="p-4 rounded-4 glass-panel text-center">
                    <div className={`status-dot mx-auto mb-2 ${deliveryCharge.isActive ? 'active' : 'inactive'}`} />
                    <h3 className="text-white fw-bold m-0">{deliveryCharge.isActive ? 'OPERATIONAL' : 'OFFLINE'}</h3>
                    <p className="text-secondary small m-0 uppercase letter-spacing-2">Pricing Engine</p>
                  </div>
                </div>

                <div className="p-3 rounded-4 glass-panel border-info border-opacity-20 d-flex gap-3 align-items-start">
                  <AlertCircle size={20} className="text-info" />
                  <p className="text-secondary small m-0">
                    When <strong>Operational</strong>, nodes will automatically calculate the {symbol}{deliveryCharge.amount.toFixed(2)} premium on checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <ToastContainer position="bottom-right" theme="dark" />

      <style>{`
        .admin-delivery-config {
          min-height: 80vh;
          color: white;
        }

        .max-width-900 {
            max-width: 900px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .text-jade-glow {
          color: #10b981;
          filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.3));
        }

        .bg-jade-soft { background: rgba(16, 185, 129, 0.1); }
        .text-jade { color: #10b981; }
        
        .bg-gold-soft { background: rgba(234, 179, 8, 0.1); }
        .text-gold { color: #eab308; }

        .letter-spacing-1 { letter-spacing: 1px; }
        .letter-spacing-2 { letter-spacing: 2px; }

        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        .status-dot.active { background: #10b981; box-shadow: 0 0 15px #10b981; }
        .status-dot.inactive { background: #ef4444; box-shadow: 0 0 15px #ef4444; }

        .save-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
          transition: all 0.3s ease;
        }

        .save-btn:hover {
          box-shadow: 0 12px 25px rgba(16, 185, 129, 0.5);
          transform: translateY(-2px);
        }

        .hover-jade:focus {
            border-color: rgba(16, 185, 129, 0.5) !important;
            box-shadow: none;
        }

        .form-check-input:checked {
            background-color: #10b981;
            border-color: #10b981;
        }
      `}</style>
    </div>
  );
};

export default AdminDeliveryCharge;
