import API_BASE_URL from "../apiConfig";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUsers, FaUserCircle, FaSearch, FaFileExcel, FaFilePdf, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import "../styles/PremiumUI.css";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/customers-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data.customers || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      toast.error("Failed to load customer database");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone || "").includes(searchTerm)
  );

  return (
    <div className="customer-management-container animate-fade-in">
      <ToastContainer theme="dark" />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title mb-1">Customer Relations</h1>
          <p className="premium-subtitle mb-0">Database of valued guests and their transaction history</p>
        </div>
        <div className="orient-card py-2 px-4 d-flex align-items-center gap-2">
            <FaUsers className="text-gold" />
            <span className="fw-bold text-white">{totalCount} Registered</span>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="premium-card p-4 mb-5">
        <div className="row g-3 align-items-center">
            <div className="col-md-8">
                <div className="position-relative">
                    <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <input 
                        type="text" 
                        className="premium-input ps-5" 
                        placeholder="Search by name or phone number..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="col-md-4 d-flex gap-2">
                <button className="btn-premium btn-premium-primary flex-grow-1"><FaFileExcel /> Export</button>
                <button className="btn-premium btn-premium-primary flex-grow-1"><FaFilePdf /> PDF</button>
            </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="orient-card p-0 overflow-hidden">
        <div className="premium-table-container">
            <table className="premium-table">
                <thead>
                    <tr>
                        <th>Customer Identity</th>
                        <th>Contact Number</th>
                        <th>Loyalty Points</th>
                        <th>Total Spend</th>
                        <th className="text-center">Member Status</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-gold"></div></td></tr>
                    ) : filteredCustomers.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-5 text-muted">No guests match your current search.</td></tr>
                    ) : filteredCustomers.map((cust, i) => (
                        <tr key={cust._id || i}>
                            <td>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-white-05 p-2 rounded-circle"><FaUserCircle className="text-gold" size={20} /></div>
                                    <div className="text-white fw-bold">{cust.name || "Anonymous Guest"}</div>
                                </div>
                            </td>
                            <td>
                                <div className="d-flex align-items-center gap-2 text-gold">
                                    <FaPhoneAlt size={12} />
                                    <span>{cust.phone}</span>
                                </div>
                            </td>
                            <td>
                                <div className="orient-text-muted small">0 Points</div>
                            </td>
                            <td>
                                <div className="text-white small fw-bold">$0.00</div>
                            </td>
                            <td className="text-center">
                                <div className="badge-premium badge-primary">Silver Tier</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      <style>{`
        .bg-white-05 { background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
};

export default CustomerList;