import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaMoneyCheckAlt, FaHistory, FaUserTie, FaCoins, FaClock } from "react-icons/fa";
import "../styles/PremiumUI.css";

const SalaryPage = () => {
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [formData, setFormData] = useState({
    employee: null,
    basicSalary: "",
    otHours: 0,
    otRate: 0
  });
  const [loading, setLoading] = useState(false);

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [empRes, salRes] = await Promise.all([
        axios.get("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/employees", { headers }),
        axios.get("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/salaries", { headers })
      ]);
      setEmployees(empRes.data);
      setSalaries(salRes.data);
    } catch (err) {
      toast.error("Payroll synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (selectedOption) => {
    if (!selectedOption) {
      setFormData({ employee: null, basicSalary: "", otHours: 0, otRate: 0 });
      return;
    }
    setFormData({
      ...formData,
      employee: selectedOption,
      basicSalary: selectedOption.basicSalary || 0,
      otHours: 0,
      otRate: selectedOption.otHourRate || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee || !formData.basicSalary) {
      toast.error("Please complete the personnel selection");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        employee: formData.employee.value,
        basicSalary: parseFloat(formData.basicSalary),
        otHours: parseInt(formData.otHours || 0),
        otRate: parseFloat(formData.otRate || 0)
      };
      await axios.post("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/salary/add", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Payroll record committed");
      setFormData({ employee: null, basicSalary: "", otHours: 0, otRate: 0 });
      fetchInitialData();
    } catch (err) {
      toast.error("Payroll record failed");
    } finally {
      setLoading(false);
    }
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      background: 'rgba(255,255,255,0.05)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '5px',
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
    <div className="payroll-container animate-fade-in">
      <ToastContainer theme="dark" />
      
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title mb-1">Payroll Management</h1>
          <p className="premium-subtitle mb-0">Disburse salaries and manage employee compensation</p>
        </div>
      </div>

      <div className="row g-5">
        {/* Form Column */}
        <div className="col-xl-5">
            <div className="premium-card p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-gold-glow p-3 rounded-circle"><FaMoneyCheckAlt className="text-gold" size={24} /></div>
                    <h3 className="premium-title h5 mb-0">Disbursement Voucher</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                    <div>
                        <label className="orient-stat-label">Recipient Personnel</label>
                        <Select 
                            styles={selectStyles}
                            options={employees.map(e => ({ value: e._id, label: e.name, basicSalary: e.basicSalary, otHourRate: e.otHourRate }))}
                            value={formData.employee}
                            onChange={handleEmployeeChange}
                            placeholder="Locate staff member..."
                        />
                    </div>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="orient-stat-label">Basic Salary ({symbol})</label>
                            <div className="position-relative">
                                <FaCoins className="position-absolute top-50 start-0 translate-middle-y ms-3 text-gold" />
                                <input type="number" className="premium-input ps-5" value={formData.basicSalary} onChange={(e) => setFormData({...formData, basicSalary: e.target.value})} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="orient-stat-label">OT Rate /Hr</label>
                            <div className="position-relative">
                                <FaClock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-gold" />
                                <input type="number" className="premium-input ps-5" value={formData.otRate} onChange={(e) => setFormData({...formData, otRate: e.target.value})} />
                            </div>
                        </div>
                        <div className="col-12">
                            <label className="orient-stat-label">Overtime Hours Worked</label>
                            <input type="number" className="premium-input" placeholder="0" value={formData.otHours} onChange={(e) => setFormData({...formData, otHours: e.target.value})} />
                        </div>
                    </div>

                    <div className="orient-card p-3 bg-white-02 border-white-05">
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="orient-stat-label">Net Disbursement</span>
                            <span className="text-gold fw-bold h4 mb-0">
                                {symbol}{(parseFloat(formData.basicSalary || 0) + (parseFloat(formData.otHours || 0) * parseFloat(formData.otRate || 0))).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="btn-premium btn-premium-secondary py-3" disabled={loading}>
                        <FaMoneyCheckAlt className="me-2" /> Authorize Payment
                    </button>
                </form>
            </div>
        </div>

        {/* List Column */}
        <div className="col-xl-7">
            <div className="orient-card p-0 overflow-hidden">
                <div className="p-4 border-bottom border-white-05 d-flex justify-content-between align-items-center">
                    <h5 className="text-white mb-0"><FaHistory className="me-2 text-gold" /> Payroll History</h5>
                </div>
                <div className="premium-table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Personnel</th>
                                <th>Basic</th>
                                <th>OT Hours</th>
                                <th>Total Paid</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-gold"></div></td></tr>
                            ) : salaries.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">No historical payroll data found.</td></tr>
                            ) : salaries.slice(0, 15).map(sal => (
                                <tr key={sal._id}>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <FaUserTie className="text-gold opacity-50" size={12} />
                                            <div className="text-white small fw-bold">{sal.employee?.name}</div>
                                        </div>
                                    </td>
                                    <td><div className="small text-white opacity-70">{symbol}{sal.basicSalary?.toFixed(2)}</div></td>
                                    <td><div className="small text-white">{sal.otHours} hrs</div></td>
                                    <td><div className="text-gold fw-bold">{symbol}{sal.total?.toFixed(2)}</div></td>
                                    <td><div className="small orient-text-muted">{new Date(sal.date).toLocaleDateString()}</div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default SalaryPage;