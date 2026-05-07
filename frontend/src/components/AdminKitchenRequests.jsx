import API_BASE_URL from "../apiConfig";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle, XCircle, Clock, Package, User } from "lucide-react";
import "../styles/PremiumUI.css";

const AdminKitchenRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all kitchen requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/auth/kitchen/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(res.data);
      } catch (err) {
        alert("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/api/auth/kitchen/request/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setRequests(
        requests.map((r) => (r._id === id ? res.data : r))
      );
    } catch (err) {
      alert("Failed to update request status");
    }
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="admin-kitchen-requests-root animate-fade-in p-2">
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title mb-1">Kitchen Requests</h1>
          <p className="premium-subtitle mb-0">Review and authorize supply requisitions from culinary staff</p>
        </div>
        <div className="bento-card py-2 px-4 d-flex align-items-center gap-2 bg-white shadow-sm border-0">
          <ClipboardList className="text-indigo-600" size={20} />
          <span className="fw-bold text-main">{requests.length} Total Requisitions</span>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-indigo-600"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bento-card p-5 text-center bg-white shadow-sm border-0">
          <div className="text-muted mb-3"><Clock size={48} opacity={0.2} className="mx-auto" /></div>
          <h3 className="h5 fw-bold text-main">No Pending Requests</h3>
          <p className="text-muted mb-0">All kitchen requisitions have been processed.</p>
        </div>
      ) : (
        <div className="bento-card p-0 overflow-hidden bg-white shadow-sm border-0">
          <div className="premium-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Requested By</th>
                  <th>Supply Item</th>
                  <th>Quantity</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, idx) => (
                  <tr key={req._id || idx}>
                    <td>
                      <div className="text-muted small fw-600">
                        {new Date(req.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-blue-glow p-2 rounded-circle mini d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <User size={14} />
                        </div>
                        <div>
                          <div className="text-main fw-bold">{req.requestedBy?.name || "Unknown"}</div>
                          <div className="tiny-caps text-muted">{req.requestedBy?.role || "Staff"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Package size={16} className="text-muted" />
                        <span className="text-main fw-600">{req.item}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-main fw-bold">
                        {req.quantity} <span className="text-muted fw-normal small">{req.unit}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={`badge-premium ${
                        req.status === "Pending" ? "badge-amber" : 
                        req.status === "Approved" ? "badge-blue" : "badge-danger"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="text-center">
                      {req.status === "Pending" ? (
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn-indigo btn-sm py-2 px-3"
                            onClick={() => handleStatusChange(req._id, "Approved")}
                          >
                            <CheckCircle size={14} className="me-1" /> Approve
                          </button>
                          <button
                            className="btn-ghost btn-sm py-2 px-3 text-danger"
                            onClick={() => handleStatusChange(req._id, "Rejected")}
                          >
                            <XCircle size={14} className="me-1" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted small italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKitchenRequests;