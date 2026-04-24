import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPrint, FaSyncAlt, FaSave, FaTrash, FaDatabase, FaServer, FaCogs } from "react-icons/fa";
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
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/printers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedPrinters(res.data);
    } catch (err) {
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const loadSystemPrinters = async () => {
    if (typeof qz === "undefined") {
      toast.error("Bridge service (QZ Tray) not detected");
      return;
    }
    setLoadingQZ(true);
    try {
      await qz.websocket.connect();
      const printers = await qz.printers.find();
      setSystemPrinters(printers);
      if (printers.length > 0) setSelectedPrinter(printers[0]);
    } catch (err) {
      toast.error("Bridge link failed. Is QZ Tray running?");
    } finally {
      try { await qz.websocket.disconnect(); } catch (e) {}
      setLoadingQZ(false);
    }
  };

  const handleSavePrinter = async () => {
    if (!selectedPrinter.trim()) {
      toast.error("Selection parameter missing");
      return;
    }
    if (savedPrinters.length >= 2 && !savedPrinters.some((p) => p.name === selectedPrinter)) {
      toast.error("Maximum 2 hardware slots allowed");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/printers`,
        { name: selectedPrinter },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSavedPrinters();
      toast.success("Hardware registered successfully");
    } catch (err) {
      toast.error("Registration failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Purge this hardware entry?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/auth/printers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedPrinters(savedPrinters.filter((p) => p._id !== id));
      toast.success("Entry purged");
    } catch (err) {
      toast.error("Purge operation failed");
    }
  };

  if (loading && savedPrinters.length === 0) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <div className="text-center">
            <div className="spinner-border text-primary mb-3"></div>
            <div className="fw-900 text-main">Syncing Hardware Hub...</div>
        </div>
    </div>
  );

  return (
    <div className="printer-layout animate-in p-2">
      <ToastContainer theme="light" />
      
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title">Hardware Hub</h1>
          <p className="premium-subtitle">Configure cloud-to-local print bridging and hardware routing</p>
        </div>
        <div className="orient-card stat-widget py-2 px-4 border-0 shadow-sm bg-white">
            <div className="stat-label">Active Slots</div>
            <div className="stat-value fs-4">{savedPrinters.length} / 2</div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
            <div className="orient-card border-0 shadow-platinum bg-white p-5">
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="bg-blue-glow p-3 rounded-circle"><FaCogs size={22} /></div>
                    <div>
                        <h4 className="mb-0 fw-900 text-main">Hardware Bridge</h4>
                        <p className="tiny text-muted mb-0 fw-700">QZ TRAY SYNCHRONIZATION</p>
                    </div>
                </div>
                
                <div className="d-flex flex-column gap-4">
                    <div className="col-12">
                        <label className="stat-label mb-2 d-block">Available Local Nodes</label>
                        <select
                          className="premium-input bg-app border-0 fw-800"
                          value={selectedPrinter}
                          onChange={(e) => setSelectedPrinter(e.target.value)}
                          disabled={loadingQZ}
                        >
                          <option value="">— SELECT LOCAL HARDWARE —</option>
                          {systemPrinters.map((printer, i) => (
                            <option key={i} value={printer}>{printer}</option>
                          ))}
                        </select>
                    </div>

                    <div className="d-flex gap-3 mt-2">
                        <button className="btn-premium btn-ghost flex-grow-1 py-3 rounded-pill" onClick={loadSystemPrinters} disabled={loadingQZ}>
                            <FaSyncAlt className={loadingQZ ? "fa-spin" : ""} /> {loadingQZ ? "POLLING..." : "REFRESH BRIDGE"}
                        </button>
                        <button className="btn-premium btn-primary flex-grow-1 py-3 rounded-pill shadow-lg" onClick={handleSavePrinter} disabled={!selectedPrinter || saving}>
                            <FaSave /> {saving ? "REGISTERING..." : "COMMIT NODE"}
                        </button>
                    </div>

                    <div className="mt-4 p-4 bg-app rounded-4 border border-dashed">
                        <p className="tiny text-muted fw-700 mb-0">Status: {typeof qz !== 'undefined' ? "Bridge Active" : "Bridge Disconnected"}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="col-xl-7">
            <div className="orient-card p-0 border-0 shadow-platinum bg-white overflow-hidden">
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <h6 className="mb-0 fw-800 text-main d-flex align-items-center gap-2">
                        <FaDatabase className="text-primary" /> Registered Hardware Directory
                    </h6>
                    <span className="badge badge-blue">Local Routing</span>
                </div>
                
                <div className="table-container border-0">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Hardware Identity</th>
                                <th>Status</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {savedPrinters.length > 0 ? savedPrinters.map(printer => (
                                <tr key={printer._id}>
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-app p-2 rounded-circle"><FaPrint className="text-primary" size={14} /></div>
                                            <div className="text-main fw-800">{printer.name}</div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-green">SYNCED NODE</span></td>
                                    <td className="text-center">
                                        <button className="btn-premium btn-ghost p-2 rounded-circle text-danger" onClick={() => handleDelete(printer._id)}>
                                            <FaTrash size={12} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-5 opacity-40">
                                        <FaServer size={32} className="mb-2" />
                                        <div className="fw-800">No hardware bridges registered</div>
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
      `}</style>
    </div>
  );
};

export default PrinterSettings;