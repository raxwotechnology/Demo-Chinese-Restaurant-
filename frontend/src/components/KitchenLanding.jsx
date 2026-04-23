import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FaUtensils,
  FaClock,
  FaCheckCircle,
  FaFire,
  FaSyncAlt,
  FaUserAlt,
  FaShoppingBag
} from "react-icons/fa";

const KitchenLanding = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const isToday = (dateString) => {
    const orderDate = new Date(dateString);
    const today = new Date();
    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  };

  const formatTime = (ms) => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const getDashOffset = (timeRemaining, timeLimit) => {
    if (timeRemaining <= 0) return 100;
    const percentage = (timeRemaining / timeLimit) * 100;
    return Math.max(0, Math.min(100, 100 - percentage));
  };

  const fetchOrders = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/orders?limit=200",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setOrders(res.data.orders || res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const markAsReady = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/order/${id}/status`,
        { status: "Ready" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/notifications/send",
        {
          userId: id,
          message: `Order #${id} is ready for pickup.`,
          type: "update",
          role: "kitchen"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  const liveOrders = orders.filter((order) =>
    ["Pending", "Processing"].includes(order.status)
  );

  const overdueCount = liveOrders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    const timeElapsed = currentTime - createdAt.getTime();
    return timeElapsed >= 30 * 60 * 1000;
  }).length;

  const pendingCount = liveOrders.filter((o) => o.status === "Pending").length;
  const processingCount = liveOrders.filter((o) => o.status === "Processing").length;

  const markAllAsReady = async () => {
    const liveOrderIds = liveOrders.map((order) => order._id);
    if (liveOrderIds.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to mark all ${liveOrderIds.length} order(s) as Ready?`
    );
    if (!confirmed) return;

    setIsBulkUpdating(true);

    const token = localStorage.getItem("token");
    const updatePromises = liveOrderIds.map(async (id) => {
      try {
        await axios.put(
          `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/order/${id}/status`,
          { status: "Ready" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await axios.post(
          "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/notifications/send",
          {
            userId: id,
            message: `Order #${id} is ready for pickup.`,
            type: "update",
            role: "kitchen"
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error(`Failed to update order ${id}:`, err);
      }
    });

    try {
      await Promise.allSettled(updatePromises);
      setOrders((prev) => prev.filter((order) => !liveOrderIds.includes(order._id)));
      alert(`${liveOrderIds.length} order(s) marked as Ready!`);
    } catch (err) {
      console.error("Bulk update error:", err);
      alert("Some orders may not have updated. Check console.");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <>
      <style>{`
        .kitchen-page-wrapper {
          min-height: 100vh;
          background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
          color: #0f172a;
          padding-bottom: 32px;
        }

        .kitchen-page-wrapper .kitchen-hero-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: #0f172a;
          border-radius: 30px;
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.07);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(14px);
        }

        .kitchen-page-wrapper .kitchen-hero-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            hsla(160, 40%, 42%, 0.06),
            transparent 40%,
            rgba(255, 255, 255, 0.04)
          );
          pointer-events: none;
        }

        .kitchen-page-wrapper .hero-chip {
          display: inline-block;
          background: hsla(160, 40%, 42%, 0.12);
          color: hsl(160, 55%, 24%);
          border: 1px solid hsla(160, 45%, 35%, 0.22);
          padding: 7px 15px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 14px;
          text-transform: uppercase;
        }

        .kitchen-page-wrapper .hero-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 10px;
          color: #0f172a;
        }

        .kitchen-page-wrapper .hero-text {
          max-width: 720px;
          color: #64748b;
          margin-bottom: 0;
        }

        .kitchen-page-wrapper .hero-side-box {
          min-width: 210px;
          padding: 18px 20px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(15, 23, 42, 0.08);
          text-align: center;
          backdrop-filter: blur(10px);
        }

        .kitchen-page-wrapper .hero-side-box span {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          color: hsl(160, 42%, 32%);
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }

        .kitchen-page-wrapper .hero-side-box strong {
          color: #0f172a;
          font-size: 1.75rem;
          font-weight: 800;
        }

        .kitchen-page-wrapper .mini-card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          padding: 22px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          height: 100%;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
          transition: all 0.25s ease;
        }

        .kitchen-page-wrapper .mini-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.1);
        }

        /* —— 3D icon tiles (same language as admin summary-icon-3d) —— */
        .kitchen-page-wrapper .kitchen-icon-3d {
          width: 62px;
          height: 62px;
          min-width: 62px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          color: #ffffff;
          position: relative;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.38),
            0 14px 26px rgba(15, 23, 42, 0.18),
            0 6px 10px rgba(15, 23, 42, 0.09);
        }

        .kitchen-page-wrapper .kitchen-icon-3d::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0.02));
          pointer-events: none;
        }

        .kitchen-page-wrapper .kitchen-icon-3d::after {
          content: "";
          position: absolute;
          left: 10px;
          right: 10px;
          top: 7px;
          height: 11px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.2);
          filter: blur(1px);
          pointer-events: none;
        }

        .kitchen-page-wrapper .kitchen-icon-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kitchen-page-wrapper .kitchen-icon-inner svg {
          width: 26px;
          height: 26px;
          filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.22));
        }

        .kitchen-page-wrapper .kitchen-icon-3d--hero {
          width: 52px;
          height: 52px;
          min-width: 52px;
          border-radius: 17px;
        }

        .kitchen-page-wrapper .kitchen-icon-3d--hero::before {
          border-radius: 15px;
        }

        .kitchen-page-wrapper .kitchen-icon-3d--hero .kitchen-icon-inner svg {
          width: 22px;
          height: 22px;
        }

        .kitchen-page-wrapper .kitchen-icon-3d--inline {
          width: 38px;
          height: 38px;
          min-width: 38px;
          border-radius: 13px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.35),
            0 8px 16px rgba(15, 23, 42, 0.12),
            0 3px 6px rgba(15, 23, 42, 0.08);
        }

        .kitchen-page-wrapper .kitchen-icon-3d--inline::before {
          border-radius: 11px;
        }

        .kitchen-page-wrapper .kitchen-icon-3d--inline::after {
          left: 7px;
          right: 7px;
          top: 5px;
          height: 8px;
        }

        .kitchen-page-wrapper .kitchen-icon-3d--inline .kitchen-icon-inner svg {
          width: 16px;
          height: 16px;
        }

        .kitchen-page-wrapper .kitchen-icon-3d--empty {
          width: 76px;
          height: 76px;
          min-width: 76px;
          border-radius: 24px;
        }

        .kitchen-page-wrapper .kitchen-icon-3d--empty::before {
          border-radius: 22px;
        }

        .kitchen-page-wrapper .kitchen-icon-3d--empty .kitchen-icon-inner svg {
          width: 34px;
          height: 34px;
        }

        .kitchen-page-wrapper .kitchen-btn-icon-3d {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 11px;
          margin-right: 10px;
          vertical-align: middle;
          position: relative;
          background: rgba(255, 255, 255, 0.22);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.45),
            0 6px 14px rgba(0, 0, 0, 0.18);
        }

        .kitchen-page-wrapper .kitchen-btn-icon-3d::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 9px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.04));
          pointer-events: none;
        }

        .kitchen-page-wrapper .kitchen-btn-icon-3d svg {
          position: relative;
          z-index: 1;
          width: 17px;
          height: 17px;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));
        }

        .kitchen-page-wrapper .kitchen-icon-blue {
          background: linear-gradient(145deg, #4f8cff 0%, #2563eb 55%, #1d4ed8 100%);
        }
        .kitchen-page-wrapper .kitchen-icon-yellow {
          background: linear-gradient(145deg, #fbbf24 0%, #d97706 55%, #b45309 100%);
        }
        .kitchen-page-wrapper .kitchen-icon-cyan {
          background: linear-gradient(145deg, #22d3ee 0%, #0891b2 55%, #0e7490 100%);
        }
        .kitchen-page-wrapper .kitchen-icon-red {
          background: linear-gradient(145deg, #f87171 0%, #dc2626 55%, #b91c1c 100%);
        }
        .kitchen-page-wrapper .kitchen-icon-jade {
          background: linear-gradient(145deg, #34d399 0%, #059669 55%, #047857 100%);
        }
        .kitchen-page-wrapper .kitchen-icon-slate {
          background: linear-gradient(145deg, #94a3b8 0%, #64748b 55%, #475569 100%);
        }

        .kitchen-page-wrapper .kitchen-hero-title {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .kitchen-page-wrapper .mini-label {
          margin-bottom: 6px;
          color: #64748b;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .kitchen-page-wrapper .mini-value {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
        }

        .kitchen-page-wrapper .section-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
          backdrop-filter: blur(12px);
        }

        .kitchen-page-wrapper .section-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .kitchen-page-wrapper .section-subtitle {
          color: #64748b;
          margin-bottom: 0;
        }

        .kitchen-page-wrapper .action-btn {
          border: none;
          border-radius: 18px;
          padding: 14px 20px;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.25s ease;
          color: #ffffff;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
        }

        .kitchen-page-wrapper .action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }

        .kitchen-page-wrapper .action-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .kitchen-page-wrapper .btn-ready-all {
          background: linear-gradient(135deg, #16a34a, #22c55e);
        }

        .kitchen-page-wrapper .order-card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 26px;
          overflow: hidden;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
          height: 100%;
          transition: all 0.25s ease;
        }

        .kitchen-page-wrapper .order-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.1);
        }

        .kitchen-page-wrapper .order-card.overdue {
          border: 1px solid rgba(239, 68, 68, 0.45);
          box-shadow:
            0 0 0 1px rgba(239, 68, 68, 0.12),
            0 18px 36px rgba(15, 23, 42, 0.08);
        }

        .kitchen-page-wrapper .order-header {
          padding: 18px 18px 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
        }

        .kitchen-page-wrapper .order-id {
          color: #0f172a;
          font-weight: 800;
          font-size: 1rem;
        }

        .kitchen-page-wrapper .order-status {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 800;
        }

        .kitchen-page-wrapper .order-status-pending {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fcd34d;
        }

        .kitchen-page-wrapper .order-status-processing {
          background: #e0f2fe;
          color: #0369a1;
          border: 1px solid #7dd3fc;
        }

        .kitchen-page-wrapper .order-body {
          padding: 18px;
        }

        .kitchen-page-wrapper .detail-line {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #475569;
          margin-bottom: 12px;
          font-size: 0.95rem;
        }

        .kitchen-page-wrapper .detail-line strong {
          color: #0f172a;
          min-width: 92px;
        }

        .kitchen-page-wrapper .pill-blue,
        .kitchen-page-wrapper .pill-info {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 700;
        }

        .kitchen-page-wrapper .pill-blue {
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
        }

        .kitchen-page-wrapper .pill-info {
          background: #ecfeff;
          color: #0e7490;
          border: 1px solid #a5f3fc;
        }

        .kitchen-page-wrapper .items-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 16px 0 18px;
        }

        .kitchen-page-wrapper .item-row {
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 16px;
          padding: 12px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .kitchen-page-wrapper .item-name {
          color: #0f172a;
          font-weight: 700;
        }

        .kitchen-page-wrapper .qty-badge {
          min-width: 34px;
          height: 34px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #ffffff;
          color: #334155;
          font-weight: 800;
          border: 1px solid rgba(15, 23, 42, 0.1);
        }

        .kitchen-page-wrapper .ready-btn {
          width: 100%;
          border: none;
          border-radius: 18px;
          padding: 14px 18px;
          font-weight: 800;
          color: #fff;
          transition: all 0.25s ease;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .kitchen-page-wrapper .ready-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }

        .kitchen-page-wrapper .btn-green {
          background: linear-gradient(135deg, #16a34a, #22c55e);
        }

        .kitchen-page-wrapper .btn-red {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        .kitchen-page-wrapper .countdown-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .kitchen-page-wrapper .countdown-ring {
          width: 48px;
          height: 48px;
          position: relative;
        }

        .kitchen-page-wrapper .countdown-ring svg {
          width: 48px;
          height: 48px;
          transform: rotate(-90deg);
        }

        .kitchen-page-wrapper .ring-bg {
          fill: none;
          stroke: rgba(15, 23, 42, 0.1);
          stroke-width: 2.4;
          pathLength: 100;
        }

        .kitchen-page-wrapper .ring-progress {
          fill: none;
          stroke: hsl(160, 42%, 40%);
          stroke-width: 2.8;
          stroke-linecap: round;
          pathLength: 100;
          transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
        }

        .kitchen-page-wrapper .ring-progress.overdue {
          stroke: #ef4444;
        }

        .kitchen-page-wrapper .countdown-text {
          font-weight: 800;
          color: #475569;
          min-width: 52px;
          text-align: right;
        }

        .kitchen-page-wrapper .countdown-text.overdue {
          color: #b91c1c;
        }

        .kitchen-page-wrapper .empty-box {
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #64748b;
        }

        .kitchen-page-wrapper .empty-box h4 {
          color: #0f172a;
        }

        .kitchen-page-wrapper .kitchen-muted {
          color: #64748b;
        }

        .kitchen-page-wrapper .empty-icon-3d-wrap {
          margin-bottom: 6px;
        }

        @media (max-width: 992px) {
          .kitchen-page-wrapper .kitchen-hero-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .kitchen-page-wrapper .hero-side-box {
            width: 100%;
          }
        }

        @media (max-width: 576px) {
          .kitchen-page-wrapper .hero-title {
            font-size: 1.55rem;
          }

          .kitchen-page-wrapper .kitchen-icon-3d:not(.kitchen-icon-3d--inline):not(.kitchen-icon-3d--empty):not(.kitchen-icon-3d--hero) {
            width: 56px;
            height: 56px;
            min-width: 56px;
            border-radius: 18px;
          }

          .kitchen-page-wrapper .kitchen-icon-3d:not(.kitchen-icon-3d--inline):not(.kitchen-icon-3d--empty):not(.kitchen-icon-3d--hero)::before {
            border-radius: 16px;
          }

          .kitchen-page-wrapper .kitchen-icon-3d:not(.kitchen-icon-3d--inline):not(.kitchen-icon-3d--empty):not(.kitchen-icon-3d--hero) .kitchen-icon-inner svg {
            width: 23px;
            height: 23px;
          }

          .kitchen-page-wrapper .kitchen-hero-card,
          .kitchen-page-wrapper .section-card,
          .kitchen-page-wrapper .mini-card,
          .kitchen-page-wrapper .order-card {
            border-radius: 20px;
          }

          .kitchen-page-wrapper .kitchen-hero-card,
          .kitchen-page-wrapper .section-card {
            padding: 18px;
          }

          .kitchen-page-wrapper .order-body,
          .kitchen-page-wrapper .order-header {
            padding: 14px;
          }
        }
      `}</style>

      <div className="kitchen-page-wrapper">
        <div className="container py-4">
          <div className="kitchen-hero-card mb-4">
            <div>
              <span className="hero-chip">Kitchen Management</span>
              <h1 className="hero-title kitchen-hero-title">
                <span
                  className="kitchen-icon-3d kitchen-icon-3d--hero kitchen-icon-jade"
                  aria-hidden
                >
                  <span className="kitchen-icon-inner">
                    <FaUtensils />
                  </span>
                </span>
                <span>Live Kitchen Orders</span>
              </h1>
              <p className="hero-text">
                Monitor pending and processing orders in real time, track remaining prep time, and mark completed dishes as ready.
              </p>
            </div>

            <div className="hero-side-box">
              <span>Live Orders</span>
              <strong>{liveOrders.length}</strong>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-3 col-md-6">
              <div className="mini-card">
                <div className="kitchen-icon-3d kitchen-icon-blue" aria-hidden>
                  <div className="kitchen-icon-inner">
                    <FaShoppingBag />
                  </div>
                </div>
                <div>
                  <p className="mini-label">Total Live Orders</p>
                  <h4 className="mini-value">{liveOrders.length}</h4>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="mini-card">
                <div className="kitchen-icon-3d kitchen-icon-yellow" aria-hidden>
                  <div className="kitchen-icon-inner">
                    <FaClock />
                  </div>
                </div>
                <div>
                  <p className="mini-label">Pending Orders</p>
                  <h4 className="mini-value">{pendingCount}</h4>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="mini-card">
                <div className="kitchen-icon-3d kitchen-icon-cyan" aria-hidden>
                  <div className="kitchen-icon-inner">
                    <FaSyncAlt />
                  </div>
                </div>
                <div>
                  <p className="mini-label">Processing Orders</p>
                  <h4 className="mini-value">{processingCount}</h4>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="mini-card">
                <div className="kitchen-icon-3d kitchen-icon-red" aria-hidden>
                  <div className="kitchen-icon-inner">
                    <FaFire />
                  </div>
                </div>
                <div>
                  <p className="mini-label">Overdue Orders</p>
                  <h4 className="mini-value">{overdueCount}</h4>
                </div>
              </div>
            </div>
          </div>

          {liveOrders.length > 0 && !loading && (
            <div className="section-card mb-4">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                <div>
                  <h4 className="section-title">Bulk Action</h4>
                  <p className="section-subtitle">
                    Mark all currently visible live orders as ready in one action.
                  </p>
                </div>

                <button
                  className="action-btn btn-ready-all"
                  onClick={markAllAsReady}
                  disabled={isBulkUpdating || liveOrders.length === 0}
                >
                  {isBulkUpdating ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    `Mark All ${liveOrders.length} Order(s) as Ready`
                  )}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="section-card">
              <div className="empty-box">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading live orders...</span>
                </div>
                <p className="mt-3 mb-0 kitchen-muted">Fetching active kitchen orders...</p>
              </div>
            </div>
          ) : liveOrders.length === 0 ? (
            <div className="section-card">
              <div className="empty-box">
                <div className="empty-icon-3d-wrap">
                  <div className="kitchen-icon-3d kitchen-icon-3d--empty kitchen-icon-jade" aria-hidden>
                    <div className="kitchen-icon-inner">
                      <FaCheckCircle />
                    </div>
                  </div>
                </div>
                <h4 className="mb-2">All caught up!</h4>
                <p className="mb-0 kitchen-muted">
                  No pending or processing orders at the moment.
                </p>
              </div>
            </div>
          ) : isBulkUpdating ? (
            <div className="section-card">
              <div className="empty-box">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Processing...</span>
                </div>
                <p className="mt-3 mb-0 kitchen-muted">Processing all live orders...</p>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {liveOrders.map((order) => {
                const createdAt = new Date(order.createdAt);
                const timeElapsed = currentTime - createdAt.getTime();
                const timeLimit = 30 * 60 * 1000;
                const timeRemaining = timeLimit - timeElapsed;
                const isOverdue = timeRemaining <= 0;
                const orderIsFromToday = isToday(order.createdAt);

                return (
                  <div key={order._id} className="col-md-6 col-xl-4">
                    <div className={`order-card ${isOverdue ? "overdue" : ""}`}>
                      <div className="order-header">
                        <div>
                          <div className="order-id">Order #{order._id.slice(-5)}</div>
                          <div className="mt-2">
                            <span
                              className={`order-status ${
                                order.status === "Processing"
                                  ? "order-status-processing"
                                  : "order-status-pending"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="countdown-box">
                          <div className="countdown-ring">
                            <svg viewBox="0 0 24 24">
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                className="ring-bg"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                className={`ring-progress ${isOverdue ? "overdue" : ""}`}
                                strokeDasharray="100"
                                strokeDashoffset={getDashOffset(timeRemaining, timeLimit)}
                              />
                            </svg>
                          </div>
                          <div className={`countdown-text ${isOverdue ? "overdue" : ""}`}>
                            {formatTime(timeRemaining)}
                          </div>
                        </div>
                      </div>

                      <div className="order-body">
                        <div className="detail-line">
                          <span className="kitchen-icon-3d kitchen-icon-3d--inline kitchen-icon-blue" aria-hidden>
                            <span className="kitchen-icon-inner">
                              <FaUserAlt />
                            </span>
                          </span>
                          <strong>Customer</strong>
                          <span>{order.customerName || "Walk-in"}</span>
                        </div>

                        <div className="detail-line">
                          <span className="kitchen-icon-3d kitchen-icon-3d--inline kitchen-icon-cyan" aria-hidden>
                            <span className="kitchen-icon-inner">
                              <FaUtensils />
                            </span>
                          </span>
                          <strong>Service</strong>
                          <span>
                            {order.tableNo > 0 ? (
                              <span className="pill-blue">
                                Table {order.tableNo} - {order.waiterName}
                              </span>
                            ) : (
                              <span className="pill-info">
                                Takeaway ({order.deliveryType})
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="items-wrap">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="item-row">
                              <span className="item-name">{item.name}</span>
                              <span className="qty-badge">{item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          className={`ready-btn ${orderIsFromToday ? "btn-green" : "btn-red"}`}
                          onClick={() => markAsReady(order._id)}
                        >
                          {orderIsFromToday
                            ? (
                              <>
                                <span className="kitchen-btn-icon-3d" aria-hidden>
                                  <FaCheckCircle />
                                </span>
                                Mark as Ready
                              </>
                            )
                            : (
                              <>
                                <span className="kitchen-btn-icon-3d" aria-hidden>
                                  <FaFire />
                                </span>
                                Mark as Ready (Past Day)
                              </>
                            )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default KitchenLanding;