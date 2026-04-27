import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Printer, 
  RefreshCw, 
  Save, 
  Trash2, 
  Database, 
  Server, 
  Settings, 
  Wifi, 
  WifiOff, 
  Cpu,
  Monitor,
  CheckCircle2
} from "lucide-react";
import API_BASE_URL from "../apiConfig";
import "../styles/PremiumUI.css";

const PrinterSettings = () => {
  const [savedPrinters, setSavedPrinters] = useState([]); 
  const [systemPrinters, setSystemPrinters] = useState([]); 
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [loadingQZ, setLoadingQZ] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedPrinters();
    loadSystemPrinters();
  }, []);

  const fetchSavedPrinters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/printers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedPrinters(res.data);
    } catch (err) {
      toast.error("Hardware sync failed");
    } finally {
      setLoading(false);
    }
  };

  const loadSystemPrinters = async () => {
    if (typeof qz === "undefined") {
      toast.error("Hardware Bridge (QZ Tray) not detected");
      return;
    }
    setLoadingQZ(true);
    try {
      await qz.websocket.connect();
      const printers = await qz.printers.find();
      setSystemPrinters(printers);
      if (printers.length > 0) setSelectedPrinter(printers[0]);
    } catch (err) {
      toast.error("Bridge link failed. Check service status.");
    } finally {
      try { await qz.websocket.disconnect(); } catch (e) {}
      setLoadingQZ(false);
    }
  };

  const handleSavePrinter = async () => {
    if (!selectedPrinter.trim()) return toast.error("Select hardware first");
    if (savedPrinters.length >= 2 && !savedPrinters.some(p => p.name === selectedPrinter)) {
      return toast.error("Hardware slot limit reached (Max 2)");
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/auth/printers`, { name: selectedPrinter }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSavedPrinters();
      toast.success("Hardware registered");
    } catch (err) {
      toast.error("Registration failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this hardware node?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/auth/printers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedPrinters(savedPrinters.filter(p => p._id !== id));
      toast.success("Node archived");
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner-border text-indigo" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hardware-suite">
      <ToastContainer theme="colored" />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h1 className="text-hero">Hardware Command</h1>
          <p className="text-subtitle">Management of terminal peripherals and cloud-to-local bridging</p>
        </div>
        <div className="bg-white p-3 rounded-4 shadow-sm border d-flex align-items-center gap-3">
          <div className={`status-pill ${typeof qz !== 'undefined' ? 'success' : 'danger'}`}>
            {typeof qz !== 'undefined' ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span className="tiny-caps">{typeof qz !== 'undefined' ? 'Bridge Online' : 'Bridge Offline'}</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Connection Panel */}
        <div className="col-xl-5">
          <div className="bento-card hardware-bridge-card">
            <div className="d-flex align-items-center gap-3 mb-5">
              <div className="stat-icon-wrapper"><Cpu size={24} /></div>
              <div>
                <h4 className="fw-800 m-0">Interface Bridge</h4>
                <p className="tiny-caps opacity-50">Local Terminal Logic</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="tiny-caps mb-2 d-block">Available Local Nodes</label>
              <div className="position-relative">
                <Printer className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                <select 
                  className="pos-input ps-5" 
                  value={selectedPrinter}
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                >
                  <option value="">Select Hardware Unit</option>
                  {systemPrinters.map((p, i) => <option key={i} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="d-flex gap-3">
              <button 
                className="btn-ghost flex-grow-1 py-3 justify-content-center" 
                onClick={loadSystemPrinters}
                disabled={loadingQZ}
              >
                <RefreshCw size={18} className={loadingQZ ? 'animate-spin' : ''} />
                <span>POLL NODES</span>
              </button>
              <button 
                className="btn-indigo flex-grow-1 py-3 justify-content-center"
                onClick={handleSavePrinter}
                disabled={!selectedPrinter || saving}
              >
                <Save size={18} />
                <span>COMMIT</span>
              </button>
            </div>

            <div className="mt-5 p-4 rounded-4 bg-app border border-dashed text-center">
              <Monitor size={32} className="text-muted opacity-20 mb-2" />
              <p className="small fw-700 m-0">Bridge Protocol: QZ Tray v2.x</p>
            </div>
          </div>
        </div>

        {/* Directory Panel */}
        <div className="col-xl-7">
          <div className="bento-card p-0 overflow-hidden shadow-lg border-0 bg-white h-100">
            <header className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <Database size={18} className="text-indigo" />
                <h6 className="fw-900 m-0">Hardware Registry</h6>
              </div>
              <span className="badge-modern success">{savedPrinters.length} Slots Active</span>
            </header>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Hardware Identity</th>
                    <th>Routing Status</th>
                    <th className="text-end">Operations</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {savedPrinters.map((p, i) => (
                      <motion.tr 
                        key={p._id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <td>
                          <div className="d-flex align-items-center gap-3">
                             <div className="icon-btn-round bg-indigo-glow"><Printer size={16} /></div>
                             <span className="fw-800">{p.name}</span>
                          </div>
                        </td>
                        <td><div className="badge-modern success"><CheckCircle2 size={12} className="me-1" /> Authorized Node</div></td>
                        <td className="text-end">
                          <button className="icon-btn-round text-danger" onClick={() => handleDelete(p._id)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {savedPrinters.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-5">
                         <Server size={48} className="text-muted opacity-20 mb-3" />
                         <p className="text-muted fw-700">No hardware nodes registered</p>
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
        .status-pill { display: flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 50px; font-weight: 800; }
        .status-pill.success { background: #f0fdf4; color: #10b981; }
        .status-pill.danger { background: #fef2f2; color: #ef4444; }
        .hardware-bridge-card { background: white; padding: 40px; border: 1px solid var(--border-subtle); }
      `}</style>
    </motion.div>
  );
};

export default PrinterSettings;