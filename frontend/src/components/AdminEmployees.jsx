import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/employees",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setEmployees(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load employees:", err.message);
        toast.error("Failed to load employees");
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const exportToExcel = () => {
    import("xlsx").then((XLSX) => {
      const worksheetData = employees.map((emp) => ({
        ID: emp.id,
        Name: emp.name,
        NIC: emp.nic,
        Phone: emp.phone,
        Role: emp.role,
        "Basic Salary": emp.basicSalary,
        "Working Hours": emp.workingHours,
        "OT Rate": emp.otHourRate || "N/A",
        "Bank Account": emp.bankAccountNo || "N/A"
      }));

      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Employees");
      XLSX.writeFile(wb, "rms_employees.xlsx");
    });
  };

  const exportToPDF = () => {
    const input = document.getElementById("employee-table");

    if (!input) {
      toast.error("Could not find table to export.");
      return;
    }

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("rms_employees.pdf");
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    axios
      .delete(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/employee/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      )
      .then(() => {
        setEmployees(employees.filter((emp) => emp._id !== id));
        toast.success("Employee deleted successfully");
      })
      .catch((err) => {
        toast.error("Failed to delete employee");
        console.error("Delete failed:", err.message);
      });
  };

  const symbol = localStorage.getItem("currencySymbol") || "$";

  return (
    <div className="employees-page">
      <div className="page-glow glow-1"></div>
      <div className="page-glow glow-2"></div>
      <div className="page-grid"></div>

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Employee Management</span>
          <h1 className="hero-title">Manage Employees</h1>
          <p className="hero-subtitle">
            View, manage, export, and update employee records in a clean, modern
            admin interface.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface action-card">
            <div className="section-header center-header">
              <h2 className="section-title">Employee Actions</h2>
              <p className="section-subtitle">
                Add new employees or export the employee list to Excel and PDF.
              </p>
            </div>

            <div className="action-row">
              <Link to="/admin/employee/new" className="action-btn success-btn">
                + Add New Employee
              </Link>

              <div className="action-group">
                <button className="action-btn outline-green" onClick={exportToExcel}>
                  Export to Excel
                </button>
                <button className="action-btn outline-red" onClick={exportToPDF}>
                  Export to PDF
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card shared-card-surface table-card">
            <div className="section-header center-header">
              <h2 className="section-title">Employee Records</h2>
              <p className="section-subtitle">
                View and manage all employee information in one place.
              </p>
            </div>

            {loading ? (
              <div className="empty-info-box">Loading employees...</div>
            ) : employees.length === 0 ? (
              <div className="empty-info-box">No employees found.</div>
            ) : (
              <div className="table-wrap" id="employee-table">
                <table className="employee-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>NIC</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Basic Salary</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, idx) => (
                      <tr key={emp._id || idx}>
                        <td>{emp.id}</td>
                        <td className="employee-name">{emp.name}</td>
                        <td>{emp.nic}</td>
                        <td>{emp.phone}</td>
                        <td>
                          <span className="role-badge">{emp.role}</span>
                        </td>
                        <td>
                          {symbol}
                          {Number(emp.basicSalary || 0).toFixed(2)}
                        </td>
                        <td className="text-center action-cell">
                          <Link
                            to={`/admin/employee/edit/${emp._id}`}
                            className="table-btn edit-btn"
                          >
                            Edit
                          </Link>
                          <button
                            className="table-btn delete-btn"
                            onClick={() => handleDelete(emp._id)}
                            type="button"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />

      <style>{`
        .employees-page {
          min-height: auto;
          position: relative;
          overflow-x: hidden;
          color: #0f172a;
          padding: 28px 24px 34px;
        }

        .employees-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.42;
          pointer-events: none;
        }

        .employees-page .glow-1 {
          width: 300px;
          height: 300px;
          top: -80px;
          left: -60px;
          background: hsla(160, 42%, 48%, 0.2);
        }

        .employees-page .glow-2 {
          width: 340px;
          height: 340px;
          right: -80px;
          bottom: -80px;
          background: hsla(200, 55%, 58%, 0.14);
        }

        .employees-page .page-shell {
          width: calc(100% - 80px);
          max-width: none;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .employees-page .hero-card.shared-card-surface,
        .employees-page .glass-card.shared-card-surface {
          border-radius: 30px !important;
          border: 1px solid rgba(15, 23, 42, 0.08) !important;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.96) 100%
          ) !important;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow:
            0 20px 50px rgba(15, 23, 42, 0.07),
            inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
        }

        .employees-page .hero-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}


        .employees-page .hero-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: hsl(160, 55%, 24%);
          background: hsla(160, 40%, 42%, 0.12);
          border: 1px solid hsla(160, 45%, 35%, 0.22);
        }

        .employees-page .hero-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .employees-page .hero-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.7;
          max-width: 760px;
        }

        .employees-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .employees-page .glass-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}


        .employees-page .action-card,
        .employees-page .table-card {
          width: 100%;
        }

        .employees-page .section-header {
          margin-bottom: 24px;
        }

        .employees-page .center-header {
          text-align: center;
        }

        .employees-page .section-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .employees-page .section-subtitle {
          margin: 0 auto;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
          max-width: 760px;
        }

        .employees-page .action-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .employees-page .action-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .employees-page .action-btn,
        .employees-page .table-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border: none;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          transition: all 0.25s ease;
          cursor: pointer;
        }

        .employees-page .action-btn:hover,
        .employees-page .table-btn:hover {
          transform: translateY(-2px);
        }

        .employees-page .action-btn {
          min-height: 56px;
          padding: 0 20px;
        }

        .employees-page .success-btn {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 16px 32px rgba(34, 197, 94, 0.22);
        }

        .employees-page .outline-green {
          background: hsla(142, 71%, 36%, 0.1);
          border: 2px solid hsla(142, 65%, 36%, 0.45);
          color: #166534;
        }

        .employees-page .outline-green:hover {
          background: hsla(142, 71%, 36%, 0.16);
          color: #14532d;
        }

        .employees-page .outline-red {
          background: hsla(0, 84%, 50%, 0.08);
          border: 2px solid hsla(0, 72%, 45%, 0.4);
          color: #b91c1c;
        }

        .employees-page .outline-red:hover {
          background: hsla(0, 84%, 50%, 0.12);
          color: #991b1b;
        }

        .employees-page .table-wrap {
          overflow-x: auto;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #f8fafc;
        }

        .employees-page .employee-table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
          background: #ffffff;
        }

        .employees-page .employee-table thead tr {
          background: #f1f5f9;
        }

        .employees-page .employee-table th {
          padding: 18px 20px;
          text-align: left;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .employees-page .employee-table td {
          padding: 18px 20px;
          color: #334155;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: middle;
          background: #ffffff;
        }

        .employees-page .employee-table tbody tr:hover td {
          background: #f8fafc;
        }

        .employees-page .employee-name {
          font-weight: 700;
          color: #0f172a;
        }

        .employees-page .role-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(241, 245, 249, 0.95);
          color: #475569;
          border: 1px solid rgba(15, 23, 42, 0.1);
          font-size: 12px;
          font-weight: 800;
        }

        .employees-page .action-cell {
          white-space: nowrap;
        }

        .employees-page .table-btn {
          padding: 10px 14px;
          margin: 0 4px;
        }

        .employees-page .edit-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 10px 22px rgba(37, 99, 235, 0.2);
        }

        .employees-page .delete-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 10px 22px rgba(239, 68, 68, 0.2);
        }

        .employees-page .empty-info-box {
          border-radius: 18px;
          border: 1px dashed rgba(15, 23, 42, 0.12);
          background: #f8fafc;
          padding: 24px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .employees-page .page-shell {
            width: calc(100% - 24px);
          }

          .employees-page {
            padding: 18px 12px;
          }

          .employees-page .hero-card,
          .employees-page .glass-card {
            padding: 20px;
          }

          .employees-page .section-title {
            font-size: 24px;
          }

          .employees-page .action-row {
            flex-direction: column;
            align-items: stretch;
          }

          .employees-page .action-group {
            width: 100%;
            flex-direction: column;
          }

          .employees-page .action-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminEmployees;