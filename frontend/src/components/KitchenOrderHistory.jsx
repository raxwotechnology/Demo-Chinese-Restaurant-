import API_BASE_URL from "../apiConfig";
import React, { useEffect, useState } from "react";
import axios from "axios";

const KitchenOrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/orders?limit=200`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle both cases (plain array or paginated object)
      setOrders(res.data.orders || res.data);
    };

    fetchOrders();

    const interval = setInterval(fetchOrders, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const completedOrders = orders.filter(
    (order) => order.status === "Ready" || order.status === "Completed"
  );

  return (
    <div className="container py-4 kitchen-shell-page">
      <div className="rounded-4 border bg-white p-4 shadow-sm mb-4">
        <span
          className="d-inline-block small fw-bold text-uppercase px-3 py-2 rounded-pill mb-2"
          style={{
            background: "hsla(160, 40%, 42%, 0.12)",
            color: "hsl(160, 55%, 24%)",
            letterSpacing: "0.04em",
            border: "1px solid hsla(160, 45%, 35%, 0.22)"
          }}
        >
          Kitchen
        </span>
        <h2 className="h3 fw-bold text-dark mb-1">Order History</h2>
        <p className="text-muted small mb-0">Ready and completed orders for this kitchen.</p>
      </div>

      <div className="table-responsive shadow-sm rounded-4 border-0 bg-white">
        <table className="table table-hover align-middle table-bordered mb-0">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Table No / Takeaway</th>
            </tr>
          </thead>
          <tbody>
            {completedOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-3">
                  No completed orders yet.
                </td>
              </tr>
            ) : (
              completedOrders.map((order) => (
                <tr key={order._id}>
                  <td>{new Date(order.date).toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge px-3 py-2 rounded-pill fw-semibold ${order.status === "Ready"
                        ? "bg-success"
                        : "bg-primary"
                        }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{order.customerName || "Walk-in"}</td>
                  <td>
                    <ul className="mb-0">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.name} <span className="text-muted">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    {order.tableNo > 0
                      ? <span className="badge bg-primary">Table {order.tableNo} </span>
                      : <span className="badge bg-info text-dark">Takeaway</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KitchenOrderHistory;
