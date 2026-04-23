import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUtensils,
  FaClock,
  FaCheckCircle,
  FaFire,
  FaSyncAlt,
  FaUserAlt,
  FaShoppingBag,
  FaHistory,
  FaChevronRight
} from "react-icons/fa";
import "../styles/PremiumUI.css";

const KitchenLanding = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 30000);
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => { clearInterval(interval); clearInterval(timer); };
  }, []);

  const fetchOrders = async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/orders?limit=200", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  const markAsReady = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/order/${id}/status`, { status: "Ready" }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(prev => prev.filter(o => o._id !== id));
      toast.success("Order dispatched to pickup!");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const liveOrders = orders.filter(o => ["Pending", "Processing"].includes(o.status));

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <div className="text-center">
            <div className="spinner-border text-primary mb-3"></div>
            <div className="text-muted fw-bold">Syncing Kitchen Display...</div>
        </div>
    </div>
  );

  return (
    <div className="kitchen-dashboard animate-fade-in p-2">
      <ToastContainer theme="light" />
      
      {/* Platinum Header */}
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title">Kitchen Operations</h1>
          <p className="premium-subtitle">Live prep queue and order fulfillment</p>
        </div>
        <div className="d-flex gap-3">
            <div className="orient-card py-2 px-4 d-flex align-items-center gap-3 bg-white">
                <div className="bg-red-glow p-2 rounded-circle"><FaFire size={14} /></div>
                <span className="fw-800">{liveOrders.length} Active Orders</span>
            </div>
            <button className="btn-premium btn-premium-primary" onClick={() => fetchOrders(true)}>
                <FaSyncAlt /> Sync Dashboard
            </button>
        </div>
      </div>

      {/* Stats Summary Widgets */}
      <div className="row g-4 mb-5">
        {[
            { label: "Pending Prep", val: liveOrders.filter(o => o.status === 'Pending').length, icon: FaClock, color: 'blue' },
            { label: "In Progress", val: liveOrders.filter(o => o.status === 'Processing').length, icon: FaUtensils, color: 'green' },
            { label: "Recently Ready", val: orders.filter(o => o.status === 'Ready').length, icon: FaCheckCircle, color: 'gold' }
        ].map((stat, i) => (
            <div className="col-md-4" key={i}>
                <div className="orient-card orient-stat-card py-3">
                    <div className={`orient-stat-icon bg-${stat.color}-glow`}><stat.icon size={20} /></div>
                    <div>
                        <div className="orient-stat-label">{stat.label}</div>
                        <div className="orient-stat-value" style={{ fontSize: '1.4rem' }}>{stat.val}</div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="row g-4">
        {liveOrders.length === 0 ? (
            <div className="col-12 text-center py-5">
                <div className="orient-card py-5 bg-white">
                    <FaHistory size={64} className="text-muted mb-3 opacity-10" />
                    <h4 className="fw-900 text-main">Kitchen Queue Empty</h4>
                    <p className="text-muted">No active orders awaiting preparation.</p>
                </div>
            </div>
        ) : (
            liveOrders.map(order => {
                const createdAt = new Date(order.createdAt);
                const elapsedMin = Math.floor((currentTime - createdAt.getTime()) / 60000);
                const isLate = elapsedMin > 20;

                return (
                    <div className="col-xl-4 col-lg-6" key={order._id}>
                        <div className={`orient-card h-100 d-flex flex-column p-0 overflow-hidden bg-white shadow-platinum ${isLate ? 'border-danger' : ''}`}>
                            <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ background: isLate ? 'var(--danger-light)' : 'var(--bg-main)' }}>
                                <div>
                                    <span className="orient-stat-label d-block" style={{ fontSize: '0.6rem' }}>TICKET ID</span>
                                    <span className="text-main fw-900">#{order.invoiceNo || order._id.slice(-6)}</span>
                                </div>
                                <div className={`badge-premium ${isLate ? 'badge-danger' : order.status === 'Pending' ? 'badge-warning' : 'badge-primary'}`}>
                                    {order.status} • {elapsedMin}m
                                </div>
                            </div>
                            
                            <div className="p-4 flex-grow-1">
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-blue-glow p-2 rounded-3"><FaUserAlt size={14} /></div>
                                    <div className="text-main fw-800">{order.customerName}</div>
                                    <div className="ms-auto text-primary fw-bold small">{order.tableNo ? `Table ${order.tableNo}` : 'Takeaway'}</div>
                                </div>

                                <div className="d-flex flex-column gap-2 mb-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="d-flex justify-content-between align-items-center p-2 rounded-3 bg-light border">
                                            <span className="text-main small fw-bold">{item.name}</span>
                                            <span className="badge-premium badge-primary" style={{ fontSize: '0.7rem' }}>x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                {order.notes && (
                                    <div className="p-3 rounded-4 bg-danger-light small text-danger border-dashed border-danger">
                                        <strong>Chef's Note:</strong> {order.notes}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-light border-top mt-auto">
                                <button className="btn-premium btn-premium-secondary w-100 py-3 rounded-4 shadow-sm" onClick={() => markAsReady(order._id)}>
                                    <FaCheckCircle className="me-2" /> Mark as Prepared <FaChevronRight className="ms-auto opacity-50" size={10} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>


    </div>
  );
};

export default KitchenLanding;