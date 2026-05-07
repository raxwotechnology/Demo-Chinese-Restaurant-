import API_BASE_URL from "../apiConfig";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPercent, FaDatabase, FaSave, FaToggleOn, FaToggleOff, FaCog, FaChartLine } from "react-icons/fa";
import "../styles/PremiumUI.css";

const AdminServiceCharge = () => {
  const [serviceCharge, setServiceCharge] = useState({
    dineInCharge: 0,
    isActive: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServiceCharge();
  }, []);

  const fetchServiceCharge = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/admin/service-charge`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServiceCharge({
        dineInCharge: Number(res.data?.dineInCharge || 0),
        isActive: Boolean(res.data?.isActive)
      });
    } catch (err) {
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setServiceCharge((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value === "" ? "" : parseFloat(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (serviceCharge.dineInCharge === "" || Number.isNaN(serviceCharge.dineInCharge)) {
      toast.warning("Financial parameter invalid");
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const payload = {
        dineInCharge: Number(serviceCharge.dineInCharge),
        isActive: serviceCharge.isActive
      };
      const res = await axios.put(
        `${API_BASE_URL}/api/auth/admin/service-charge`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServiceCharge({
        dineInCharge: Number(res.data?.dineInCharge || 0),
        isActive: Boolean(res.data?.isActive)
      });
      toast.success("Governance logic updated");
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const formattedCharge = useMemo(() => {
    const value = Number(serviceCharge.dineInCharge || 0);
    return `${value.toFixed(2)}%`;
  }, [serviceCharge.dineInCharge]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3"></div>
        <div className="fw-900 text-main">Syncing Global Parameters...</div>
      </div>
    </div>
  );

  return (
    <div className="service-charge-layout animate-fade-in p-2">
      <ToastContainer theme="light" />

      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title">Tax & Service Logic</h1>
          <p className="premium-subtitle">Configure dine-in service premiums and fiscal governance</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Configuration Panel */}
        <div className="col-xl-5">
          <div className="bento-card border-0 shadow-sm bg-white p-5">
            <div className="d-flex align-items-center gap-3 mb-5">
              <div className="bg-blue-glow p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <FaCog size={22} />
              </div>
              <div>
                <h4 className="mb-0 fw-800 text-main">Logic Parameter</h4>
                <p className="tiny-caps text-muted mb-0">DINE-IN SERVICE PREMIUM</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
              <div className="col-12">
                <label className="tiny-caps mb-2 d-block">Percentage Value (%)</label>
                <div className="position-relative">
                  <FaPercent className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={14} />
                  <input
                    type="number"
                    name="dineInCharge"
                    value={serviceCharge.dineInCharge}
                    onChange={handleChange}
                    step="0.01"
                    className="input-premium ps-5 fw-800 text-indigo-600 fs-4"
                    required
                  />
                </div>
                <p className="small text-muted mt-2">This value is applied globally to all dine-in invoices.</p>
              </div>

              <div className="col-12 p-4 bg-light bg-opacity-10 rounded-4 border">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-800 text-main mb-1">Fiscal Status</h6>
                    <p className="small text-muted mb-0">Enable or suspend charge logic</p>
                  </div>
                  <label className="premium-switch">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={serviceCharge.isActive}
                      onChange={handleChange}
                    />
                    <span className="premium-slider"></span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-indigo py-3 justify-content-center mt-4" disabled={saving}>
                <FaSave className="me-2" /> {saving ? "AUTHORIZING..." : "COMMIT GLOBAL CHANGE"}
              </button>
            </form>
          </div>
        </div>

        {/* Live Status Panel */}
        <div className="col-xl-7">
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="bento-card py-4 border-0 shadow-sm bg-white d-flex align-items-center gap-4">
                <div className="bg-gold-glow p-3 rounded-circle"><FaChartLine size={20} /></div>
                <div>
                  <div className="tiny-caps text-muted">Active Premium</div>
                  <div className="h3 fw-800 mb-0">{formattedCharge}</div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="bento-card py-4 border-0 shadow-sm bg-white d-flex align-items-center gap-4">
                <div className="bg-blue-glow p-3 rounded-circle"><FaDatabase size={20} /></div>
                <div>
                  <div className="tiny-caps text-muted">System Logic</div>
                  <div className="h3 fw-800 mb-0 text-uppercase">{serviceCharge.isActive ? "ENABLED" : "SUSPENDED"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bento-card p-5 border-0 shadow-sm bg-white">
            <h5 className="fw-800 text-main mb-4">Operational Preview</h5>
            <div className="p-4 bg-light rounded-4 border mb-3 d-flex justify-content-between align-items-center">
              <span className="fw-700 text-muted small">Standard Invoice Surcharge</span>
              <span className="fw-800 text-indigo-600 fs-5">{formattedCharge}</span>
            </div>
            <div className="p-4 bg-light rounded-4 border d-flex justify-content-between align-items-center">
              <span className="fw-700 text-muted small">Logic Authority Status</span>
              <span className={`badge-premium ${serviceCharge.isActive ? 'badge-blue' : 'badge-danger'}`}>
                {serviceCharge.isActive ? "ACTIVE NODE" : "INACTIVE NODE"}
              </span>
            </div>

            <div className="mt-5 p-4 bg-light bg-opacity-50 rounded-4 border border-dashed">
              <p className="small text-muted fw-600 mb-0">Note: Modifying these global parameters will immediately affect all terminals synchronized with the cloud backend.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminServiceCharge;