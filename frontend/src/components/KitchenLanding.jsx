import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Flame, 
  RefreshCw, 
  User, 
  Timer, 
  AlertCircle,
  Hash,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import API_BASE_URL from "../apiConfig";
import "../styles/PremiumUI.css";

const KitchenLanding = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 20000);
    const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => { clearInterval(interval); clearInterval(timer); };
  }, []);

  const fetchOrders = async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/orders?limit=200`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || res.data);
    } catch (err) {
      console.error("KDS Sync Error:", err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  const markAsReady = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/auth/order/${id}/status`, { status: "Ready" }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(prev => prev.filter(o => o._id !== id));
      toast.success("Culinary Masterpiece Ready!");
    } catch (err) {
      toast.error("Dispatch Failed");
    }
  };

  const liveOrders = orders.filter(o => ["Pending", "Processing"].includes(o.status));

  if (loading && orders.length === 0) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner-border text-indigo" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kitchen-suite">
      <ToastContainer theme="colored" />
      
      {/* KDS Header */}
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="text-hero">Kitchen Command Center</h1>
          <p className="text-subtitle">Real-time KDS monitoring and culinary workflow orchestration</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
            <div className="bento-card kpi-mini secondary">
                <Flame size={18} className="text-danger" />
                <span className="fw-900">{liveOrders.length} ACTIVE TICKETS</span>
            </div>
            <button className="btn-refresh-premium" onClick={() => fetchOrders(true)} disabled={loading}>
                <RefreshCw size={20} className={loading ? "animate-spin-soft" : ""} />
            </button>
        </div>
      </div>

      {/* KDS Analytics */}
      <div className="row g-4 mb-5">
        {[
            { label: "Awaiting Prep", val: liveOrders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'var(--warning)' },
            { label: "On The Fire", val: liveOrders.filter(o => o.status === 'Processing').length, icon: ChefHat, color: 'var(--p-indigo-600)' },
            { label: "Dispatch Ready", val: orders.filter(o => o.status === 'Ready').length, icon: CheckCircle2, color: 'var(--success)' }
        ].map((stat, i) => (
            <div className="col-md-4" key={i}>
                <div className="bento-card d-flex align-items-center gap-3">
                    <div className="stat-icon-wrapper" style={{ background: `${stat.color}15`, color: stat.color }}><stat.icon size={22} /></div>
                    <div>
                        <span className="tiny-caps">{stat.label}</span>
                        <h4 className="fw-900 m-0">{stat.val}</h4>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Ticket Grid */}
      <div className="row g-4">
        <AnimatePresence mode="popLayout">
          {liveOrders.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-12 text-center py-5">
                  <div className="bento-card py-5 bg-white border-dashed">
                      <ClipboardList size={64} className="opacity-10 mb-3" />
                      <h4 className="fw-900 opacity-40">Queue Clear</h4>
                      <p className="text-subtitle">All orders have been dispatched.</p>
                  </div>
              </motion.div>
          ) : (
              liveOrders.map((order, i) => {
                  const createdAt = new Date(order.createdAt);
                  const elapsedMin = Math.floor((currentTime - createdAt.getTime()) / 60000);
                  const isLate = elapsedMin > 15;
                  const isCritical = elapsedMin > 25;

                  return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: i * 0.05 }}
                        className="col-xl-4 col-lg-6" 
                        key={order._id}
                      >
                          <div className={`bento-card kds-ticket p-0 overflow-hidden ${isCritical ? 'critical-pulse' : isLate ? 'border-danger' : ''}`}>
                              <header className={`p-3 d-flex justify-content-between align-items-center ${isCritical ? 'bg-danger text-white' : 'bg-light border-bottom'}`}>
                                  <div className="d-flex align-items-center gap-2">
                                      <Hash size={14} className="opacity-50" />
                                      <span className="fw-900">{order.invoiceNo || order._id.slice(-6)}</span>
                                  </div>
                                  <div className={`badge-modern ${isCritical ? 'bg-white text-danger' : isLate ? 'danger' : 'info'}`}>
                                      <Timer size={12} className="me-1" />
                                      {elapsedMin}M ELAPSED
                                  </div>
                              </header>
                              
                              <div className="p-4">
                                  <div className="d-flex align-items-center gap-3 mb-4">
                                      <div className="stat-icon-wrapper mini"><User size={14} /></div>
                                      <div>
                                        <span className="fw-800 d-block">{order.customerName}</span>
                                        <span className="tiny-caps indigo">{order.tableNo ? `Table ${order.tableNo}` : 'Takeaway Order'}</span>
                                      </div>
                                  </div>

                                  <div className="kitchen-items-list gap-2 d-flex flex-column mb-4">
                                      {order.items.map((item, idx) => (
                                          <div key={idx} className="d-flex justify-content-between align-items-center p-2 rounded-3 bg-app border">
                                              <span className="fw-700 small text-main">{item.name}</span>
                                              <span className="badge-modern indigo py-1 px-2">x{item.quantity}</span>
                                          </div>
                                      ))}
                                  </div>

                                  {order.notes && (
                                      <div className="p-3 rounded-3 bg-danger-light text-danger border border-danger border-dashed mb-3">
                                          <div className="d-flex align-items-center gap-2 mb-1">
                                            <AlertCircle size={14} />
                                            <span className="tiny-caps text-danger">CHEF NOTES</span>
                                          </div>
                                          <p className="m-0 small fw-700">{order.notes}</p>
                                      </div>
                                  )}
                              </div>

                              <footer className="p-3 border-top bg-light">
                                  <button className="btn-indigo w-100 py-3 justify-content-between" onClick={() => markAsReady(order._id)}>
                                      <span className="fw-800">MARK AS PREPARED</span>
                                      <ChevronRight size={18} />
                                  </button>
                              </footer>
                          </div>
                      </motion.div>
                  );
              })
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .kitchen-suite { min-height: 100vh; padding-bottom: 80px; }
        .kds-ticket { transition: all 0.3s; border: 1px solid var(--border-subtle); background: white; }
        .kds-ticket:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); }
        .critical-pulse { border: 2px solid var(--danger) !important; animation: ticket-pulse 2s infinite; }
        @keyframes ticket-pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .stat-icon-wrapper.mini { width: 32px; height: 32px; border-radius: 10px; }
        .kitchen-items-list { max-height: 250px; overflow-y: auto; }
      `}</style>
    </motion.div>
  );
};

export default KitchenLanding;