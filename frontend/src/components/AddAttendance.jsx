import API_BASE_URL from "../apiConfig";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { FaUserCircle, FaCalendarAlt, FaStopwatch, FaSignInAlt, FaPause, FaPlay, FaSignOutAlt, FaIdCard, FaHistory } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/PremiumUI.css";

const AddAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [punches, setPunches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data || []);
    } catch (err) {
      toast.error("Failed to sync personnel directory");
    }
  };

  const fetchPunches = async (empId) => {
    setLoading(true);
    try {
      const today = new Date();
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/attendance/summary`, {
        params: { _id: empId, month: today.getMonth() + 1, year: today.getFullYear() },
        headers: { Authorization: `Bearer ${token}` }
      });
      setPunches(res.data.daily || []);
    } catch (err) {
      toast.error("Failed to load time logs");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (opt) => {
    setSelectedEmp(opt);
    if (opt) fetchPunches(opt.value);
    else setPunches([]);
  };

  const recordPunch = async (type) => {
    if (!selectedEmp) {
        toast.warning("Please identify yourself first");
        return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/auth/attendance/punch`, {
        employeeId: selectedEmp.value,
        punchType: type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Action: ${type} Recorded`);
      fetchPunches(selectedEmp.value);
    } catch (err) {
      toast.error("Punch transaction failed");
    }
  };

  const canPunch = (type) => {
    if (!punches.length) return type === "In";
    const lastDay = punches[punches.length - 1];
    const lastPunch = (lastDay?.punches || [])[(lastDay?.punches || []).length - 1];
    if (!lastPunch) return type === "In";
    switch (type) {
      case "In": return lastPunch.type === "Out";
      case "Break In": return lastPunch.type === "In";
      case "Break Out": return lastPunch.type === "Break In";
      case "Out": return lastPunch.type === "In" || lastPunch.type === "Break Out";
      default: return false;
    }
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      background: 'rgba(255,255,255,0.05)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '8px',
      color: '#fff'
    }),
    singleValue: (base) => ({ ...base, color: '#fff' }),
    menu: (base) => ({ ...base, background: '#023047', border: '1px solid var(--orient-gold)' }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? 'rgba(255,183,3,0.1)' : 'transparent',
      color: '#fff'
    })
  };

  return (
    <div className="attendance-entry-container animate-fade-in">
      <ToastContainer theme="dark" />
      
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title mb-1">Timekeeping Terminal</h1>
          <p className="premium-subtitle mb-0">Record your shift activity and manage work hours</p>
        </div>
      </div>

      <div className="row g-5">
        <div className="col-xl-5">
            <div className="premium-card p-4">
                <div className="text-center mb-4">
                    <div className="bg-gold-glow d-inline-block p-4 rounded-circle mb-3"><FaStopwatch className="text-gold" size={40} /></div>
                    <h3 className="text-white h5">Identify Personnel</h3>
                </div>

                <div className="mb-5">
                    <Select 
                        styles={selectStyles}
                        options={employees.map(e => ({ value: e._id, label: `${e.name} (${e.role})` }))}
                        value={selectedEmp}
                        onChange={handleEmployeeChange}
                        placeholder="Select your name..."
                    />
                </div>

                {selectedEmp && (
                    <div className="d-flex flex-column gap-3 animate-slide-up">
                        <div className="row g-3">
                            <div className="col-6">
                                <button className="btn-premium btn-punch btn-punch-in w-100 py-3" onClick={() => recordPunch('In')} disabled={!canPunch('In')}>
                                    <FaSignInAlt className="me-2" /> Shift In
                                </button>
                            </div>
                            <div className="col-6">
                                <button className="btn-premium btn-punch btn-punch-out w-100 py-3" onClick={() => recordPunch('Out')} disabled={!canPunch('Out')}>
                                    <FaSignOutAlt className="me-2" /> Shift Out
                                </button>
                            </div>
                            <div className="col-6">
                                <button className="btn-premium btn-punch btn-punch-break w-100 py-3" onClick={() => recordPunch('Break In')} disabled={!canPunch('Break In')}>
                                    <FaPause className="me-2" /> Break Start
                                </button>
                            </div>
                            <div className="col-6">
                                <button className="btn-premium btn-punch btn-punch-break w-100 py-3" onClick={() => recordPunch('Break Out')} disabled={!canPunch('Break Out')}>
                                    <FaPlay className="me-2" /> Break End
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="col-xl-7">
            <div className="orient-card p-0 overflow-hidden">
                <div className="p-4 border-bottom border-white-05 d-flex justify-content-between align-items-center">
                    <h5 className="text-white mb-0"><FaHistory className="me-2 text-gold" /> Personal Punch History</h5>
                </div>
                <div className="premium-table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>First Punch</th>
                                <th>Last Action</th>
                                <th>Active Hours</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-gold"></div></td></tr>
                            ) : punches.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">Select personnel to view recent logs.</td></tr>
                            ) : punches.slice(0, 10).reverse().map((day, i) => (
                                <tr key={i}>
                                    <td><div className="text-white small fw-bold">{new Date(day.date).toLocaleDateString()}</div></td>
                                    <td><div className="small text-white opacity-70">{day.punches[0]?.time || '--:--'}</div></td>
                                    <td><div className="small text-gold">{(day.punches[day.punches.length - 1]?.type)} @ {day.punches[day.punches.length - 1]?.time}</div></td>
                                    <td><div className="text-white fw-bold">{parseFloat(day.totalHours || 0).toFixed(1)} hrs</div></td>
                                    <td className="text-center">
                                        <div className={`badge-premium ${parseFloat(day.totalHours) >= 8 ? 'badge-primary' : 'badge-success'}`}>
                                            {parseFloat(day.totalHours) >= 8 ? 'Full Shift' : 'Short Shift'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        .bg-gold-glow { background: rgba(255, 183, 3, 0.1); }
        .border-white-05 { border-color: rgba(255,255,255,0.05) !important; }
        .btn-punch { 
            border-radius: 15px; 
            font-weight: 800; 
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }
        .btn-punch-in { background: linear-gradient(135deg, #00FF7F, #00994d); color: #fff; }
        .btn-punch-out { background: linear-gradient(135deg, #FF4B2B, #FF416C); color: #fff; }
        .btn-punch-break { background: linear-gradient(135deg, #FFB703, #fb8500); color: #fff; }
        .btn-punch:disabled { opacity: 0.2; transform: none !important; }
      `}</style>
    </div>
  );
};

export default AddAttendance;