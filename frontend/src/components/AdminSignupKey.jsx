import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  CopyCheck,
  RefreshCw
} from "lucide-react";

const AdminSignupKey = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Load keys
  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/signup-keys", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKeys(res.data);
    } catch (err) {
      console.error("Failed to load keys:", err);
    } finally {
      setLoading(false);
    }
  };

  // Generate new key
  const generateKey = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/generate-key",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setKeys([...keys, res.data]);
    } catch (err) {
      console.error("Failed to generate key:", err);
    } finally {
      setGenerating(false);
    }
  };

  // Delete key
  const deleteKey = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/signup-key/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKeys(keys.filter((key) => key._id !== id));
    } catch (err) {
      console.error("Failed to delete key:", err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="admin-signup-key-page container py-5"
    >
      {/* Header Section */}
      <div className="text-center mb-5">
         <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="d-inline-flex p-3 rounded-circle glass-panel mb-4 text-jade-glow animate-float"
         >
            <ShieldCheck size={48} />
         </motion.div>
         <h1 className="fw-bold mb-1 display-5 ask-page-title">Authority Signup Keys</h1>
         <p className="text-secondary fs-5 ask-page-subtitle">Secure account generation tokens & management</p>
      </div>

      {/* Action Area */}
      <div className="d-flex justify-content-center mb-5">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 px-5 glass-card d-flex align-items-center gap-3 hover-jade border-jade"
          onClick={generateKey}
          disabled={generating}
        >
          {generating ? <RefreshCw className="animate-spin" size={24} /> : <Plus size={24} className="text-jade-glow" />}
          <span className="fw-bold fs-5">{generating ? "Generating..." : "Generate Authority Token"}</span>
        </motion.button>
      </div>

      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="text-center py-5"
          >
             <div className="spinner-border text-jade" role="status" />
          </motion.div>
        ) : keys.length === 0 ? (
          <motion.div 
            key="empty"
            variants={cardVariants}
            className="glass-card p-5 text-center max-w-lg mx-auto"
          >
            <AlertCircle size={64} className="text-secondary opacity-25 mb-4" />
            <h3 className="fw-bold mb-2 ask-page-title">Safe Vault Empty</h3>
            <p className="text-secondary mb-0">No active signup keys found. Generate a new token above to authorize staff registration.</p>
          </motion.div>
        ) : (
          <div className="row g-4 justify-content-center">
            {keys.map((key) => (
              <motion.div 
                layout
                key={key._id}
                variants={cardVariants}
                exit={{ scale: 0.8, opacity: 0 }}
                className="col-xl-6 col-lg-8"
              >
                <div className="glass-card p-4 d-flex align-items-center justify-content-between gap-4">
                  <div className="d-flex align-items-center gap-4 flex-grow-1 overflow-hidden">
                    <div className="p-3 rounded-4 glass-panel text-gold">
                      <Key size={24} />
                    </div>
                    <div className="overflow-hidden">
                       <small className="text-secondary d-block mb-1 text-uppercase letter-spacing-1">Vault Key</small>
                       <code className="fs-5 fw-medium text-break ask-key-code">{key.key}</code>
                    </div>
                  </div>

                  <div className="d-flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyToClipboard(key.key, key._id)}
                      className={`btn-action rounded-circle p-3 glass-panel border-0 ${copiedId === key._id ? 'text-jade-glow' : 'text-secondary hover-text-white'}`}
                      title="Copy to clipboard"
                    >
                      {copiedId === key._id ? <CopyCheck size={20} /> : <Copy size={20} />}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: 'hsla(0, 100%, 50%, 0.1)' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteKey(key._id)}
                      className="btn-action rounded-circle p-3 glass-panel border-0 text-danger hover-text-danger"
                      title="Revoke key"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .admin-signup-key-page .ask-page-title {
          color: #0f172a;
        }

        .admin-signup-key-page .ask-page-subtitle {
          color: #64748b !important;
          opacity: 1 !important;
        }

        .admin-signup-key-page .glass-panel {
          background: #f8fafc !important;
          border: 1px solid rgba(15, 23, 42, 0.1) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        .admin-signup-key-page .glass-card {
          background: #ffffff !important;
          border: 1px solid rgba(15, 23, 42, 0.1) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08) !important;
        }

        .admin-signup-key-page .glass-card:hover {
          background: #ffffff !important;
          border-color: hsla(160, 42%, 38%, 0.4) !important;
          box-shadow: 0 22px 48px rgba(15, 23, 42, 0.1) !important;
        }

        .admin-signup-key-page .text-jade-glow,
        .admin-signup-key-page .text-jade {
          color: #059669 !important;
        }

        .admin-signup-key-page .border-jade {
          border-width: 2px !important;
          border-color: hsla(160, 42%, 38%, 0.45) !important;
        }

        .admin-signup-key-page .hover-jade:hover {
          border-color: hsla(160, 42%, 34%, 0.65) !important;
        }

        .admin-signup-key-page .glass-card .fw-bold.fs-5 {
          color: #0f172a !important;
        }

        .admin-signup-key-page .ask-key-code {
          color: #0f172a !important;
          background: #f1f5f9;
          padding: 0.2rem 0.5rem;
          border-radius: 0.4rem;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .admin-signup-key-page .text-gold {
          color: #b45309 !important;
        }

        .admin-signup-key-page .hover-text-white:hover {
          color: #0f172a !important;
        }

        .admin-signup-key-page .text-secondary.opacity-25 {
          color: #94a3b8 !important;
          opacity: 1 !important;
        }

        .admin-signup-key-page .text-secondary:not(.opacity-25) {
          color: #64748b !important;
        }
      `}</style>
    </motion.div>
  );
};

export default AdminSignupKey;
