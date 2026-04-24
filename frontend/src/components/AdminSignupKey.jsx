import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaKey, FaPlus, FaTrash, FaCopy, FaCheck, FaShieldAlt, FaHistory, FaSyncAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/PremiumUI.css";

const AdminSignupKey = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/signup-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKeys(res.data || []);
    } catch (err) {
      toast.error("Vault synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/auth/generate-key`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKeys([...keys, res.data]);
      toast.success("New Authority Token minted");
    } catch (err) {
      toast.error("Key generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const deleteKey = async (id) => {
    if (!window.confirm("Revoke this authority token?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/auth/signup-key/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKeys(keys.filter((k) => k._id !== id));
      toast.success("Token revoked");
    } catch (err) {
      toast.error("Revocation failed");
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.info("Token copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="signup-key-container animate-fade-in">
      <ToastContainer theme="dark" />
      
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title mb-1">Authority Vault</h1>
          <p className="premium-subtitle mb-0">Generate and manage secure registration tokens for staff onboarding</p>
        </div>
      </div>

      {/* Main Action Card */}
      <div className="premium-card p-5 text-center mb-5 orient-card-glass">
          <div className="bg-gold-glow d-inline-block p-4 rounded-circle mb-4">
              <FaShieldAlt className="text-gold" size={48} />
          </div>
          <h2 className="text-white mb-3 h3">Mint New Authority Token</h2>
          <p className="orient-text-muted mb-4 mx-auto" style={{maxWidth: '500px'}}>Tokens are required for new staff to register accounts. Revoke unused tokens to maintain system integrity.</p>
          <button className="btn-premium btn-premium-secondary px-5 py-3" onClick={generateKey} disabled={generating}>
              {generating ? <><FaSyncAlt className="animate-spin me-2" /> Forging Token...</> : <><FaPlus className="me-2" /> Generate Token</>}
          </button>
      </div>

      {/* Keys List */}
      <div className="orient-card p-0 overflow-hidden">
        <div className="p-4 border-bottom border-white-05 d-flex justify-content-between align-items-center">
            <h5 className="text-white mb-0"><FaHistory className="me-2 text-gold" /> Active Authority Tokens</h5>
            <span className="badge-premium badge-primary">{keys.length} Active Keys</span>
        </div>
        
        <div className="p-4">
            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-gold"></div></div>
            ) : keys.length === 0 ? (
                <div className="text-center py-5 orient-text-muted">No active tokens found in the vault.</div>
            ) : (
                <div className="row g-4">
                    {keys.map((k) => (
                        <div key={k._id} className="col-lg-6">
                            <div className="premium-card p-3 d-flex align-items-center justify-content-between bg-white-05 border-white-05">
                                <div className="d-flex align-items-center gap-3 overflow-hidden">
                                    <div className="bg-gold-glow p-3 rounded-3"><FaKey className="text-gold" /></div>
                                    <div className="overflow-hidden">
                                        <div className="orient-stat-label mb-1">Vault Key</div>
                                        <code className="text-gold h5 mb-0 d-block text-truncate" style={{letterSpacing: '1px'}}>{k.key}</code>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn-premium btn-premium-primary p-2" onClick={() => copyToClipboard(k.key, k._id)}>
                                        {copiedId === k._id ? <FaCheck className="text-success" /> : <FaCopy />}
                                    </button>
                                    <button className="btn-premium btn-premium-primary p-2 text-danger" onClick={() => deleteKey(k._id)}>
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      <style>{`
        .bg-gold-glow { background: rgba(255, 183, 3, 0.1); }
        .border-white-05 { border-color: rgba(255,255,255,0.05) !important; }
        .bg-white-05 { background: rgba(255,255,255,0.05); }
        .orient-card-glass { background: rgba(2, 48, 71, 0.4) !important; backdrop-filter: blur(20px); border: 1px solid rgba(255, 183, 3, 0.1); }
      `}</style>
    </div>
  );
};

export default AdminSignupKey;
