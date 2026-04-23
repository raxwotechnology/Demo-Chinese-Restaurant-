import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PrinterSettings = () => {
  const [savedPrinters, setSavedPrinters] = useState([]); // from backend
  const [systemPrinters, setSystemPrinters] = useState([]); // from QZ Tray
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [loadingQZ, setLoadingQZ] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSavedPrinters();
    loadSystemPrinters();
  }, []);

  const fetchSavedPrinters = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/printers",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSavedPrinters(res.data);
    } catch (err) {
      console.error("Failed to load saved printers:", err.message);
      toast.error("Failed to load saved printers");
    }
  };

  const loadSystemPrinters = async () => {
    if (typeof qz === "undefined") {
      toast.error("QZ Tray is not loaded. Check console.");
      return;
    }

    setLoadingQZ(true);
    try {
      await qz.websocket.connect();
      const printers = await qz.printers.find();
      setSystemPrinters(printers);
      if (printers.length > 0) {
        setSelectedPrinter(printers[0]);
      }
    } catch (err) {
      console.error("QZ Tray error:", err);
      toast.error("Failed to load system printers. Is QZ Tray running?");
    } finally {
      try {
        await qz.websocket.disconnect();
      } catch (e) {
        console.warn("QZ disconnect warning:", e);
      }
      setLoadingQZ(false);
    }
  };

  const handleSavePrinter = async () => {
    if (!selectedPrinter.trim()) {
      toast.error("Please select a printer");
      return;
    }

    if (
      savedPrinters.length >= 2 &&
      !savedPrinters.some((p) => p.name === selectedPrinter)
    ) {
      toast.error("Maximum of 2 printers allowed");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { name: selectedPrinter };

      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/printers",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSavedPrinters((prev) => {
        const exists = prev.find((p) => p.name === selectedPrinter);
        if (exists) {
          return prev.map((p) =>
            p.name === selectedPrinter ? res.data : p
          );
        } else {
          return [res.data, ...prev].slice(0, 2);
        }
      });

      toast.success("Printer saved successfully!");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save printer";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this saved printer?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/printers/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSavedPrinters(savedPrinters.filter((p) => p._id !== id));
      toast.success("Printer deleted");
    } catch (err) {
      toast.error("Failed to delete printer");
    }
  };

  return (
    <div className="printer-page">
      <div className="container py-4 py-lg-5">
        <div className="printer-wrapper">
          <div className="header-card mb-4">
            <div>
              <p className="small-label mb-2">Admin Settings</p>
              <h2 className="main-title mb-2">Printer Configuration</h2>
              <p className="sub-text mb-0">
                Manage printer selection and saved printer configuration.
              </p>
            </div>

            <div className="count-badge-box">
              <span>{savedPrinters.length}/2</span>
              <small>Saved Printers</small>
            </div>
          </div>

          <div className="config-card mb-4">
            <h4 className="section-title mb-3">Add Printer from System</h4>

            <div className="row g-3 align-items-end">
              <div className="col-md-6">
                <label className="form-label custom-label">
                  Available Printers
                </label>
                <select
                  className="form-select custom-select"
                  value={selectedPrinter}
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                  disabled={loadingQZ}
                >
                  <option value="">— Select a printer —</option>
                  {systemPrinters.length > 0 ? (
                    systemPrinters.map((printer, i) => (
                      <option key={i} value={printer}>
                        {printer}
                      </option>
                    ))
                  ) : (
                    <option disabled>No printers found</option>
                  )}
                </select>
              </div>

              <div className="col-md-3">
                <button
                  className="refresh-btn w-100"
                  onClick={loadSystemPrinters}
                  disabled={loadingQZ}
                >
                  {loadingQZ ? "Loading..." : "Refresh Printers"}
                </button>
              </div>

              <div className="col-md-3">
                <button
                  className="save-btn w-100"
                  onClick={handleSavePrinter}
                  disabled={!selectedPrinter || saving}
                >
                  {saving ? "Saving..." : "Save Printer"}
                </button>
              </div>
            </div>

            <small className="helper-text d-block mt-3">
              Make sure <strong>QZ Tray</strong> is running on this computer.
            </small>
          </div>

          <div className="saved-card">
            <div className="saved-header mb-3">
              <h4 className="saved-title mb-0">
                Saved Printers ({savedPrinters.length}/2)
              </h4>
            </div>

            {savedPrinters.length === 0 ? (
              <div className="empty-card">
                <div className="empty-icon">🖨️</div>
                <p className="empty-text mb-0">No printers saved yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table custom-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Printer Name</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedPrinters.map((printer) => (
                      <tr key={printer._id}>
                        <td className="printer-name">{printer.name}</td>
                        <td className="text-center">
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(printer._id)}
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

      <ToastContainer />

      <style>{`
        .printer-page {
          min-height: 100vh;
          padding: 20px 0;
          background: linear-gradient(165deg, #f6f4fc 0%, #f1f5ff 42%, #eef8f6 100%);
        }

        .printer-page .printer-wrapper {
          max-width: 1120px;
          margin: 0 auto;
        }

        .printer-page .header-card,
        .printer-page .config-card,
        .printer-page .saved-card,
        .printer-page .empty-card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border-radius: 24px;
          box-shadow:
            0 18px 50px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .printer-page .header-card {
          padding: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .printer-page .config-card,
        .printer-page .saved-card {
          padding: 28px;
        }

        .printer-page .small-label {
          color: #5b21b6;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .printer-page .main-title {
          color: #0f172a;
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .printer-page .sub-text {
          color: rgba(15, 23, 42, 0.62);
          font-size: 1rem;
        }

        .printer-page .count-badge-box {
          min-width: 150px;
          padding: 18px 22px;
          border-radius: 18px;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          text-align: center;
        }

        .printer-page .count-badge-box span {
          display: block;
          color: #0f172a;
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
        }

        .printer-page .count-badge-box small {
          color: #64748b;
          font-size: 0.9rem;
        }

        .printer-page .section-title,
        .printer-page .saved-title {
          color: #0f172a;
          font-size: 1.2rem;
          font-weight: 800;
        }

        .printer-page .custom-label {
          color: #0f172a;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .printer-page .custom-select {
          height: 54px;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #0f172a;
          color-scheme: light;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
        }

        .printer-page .custom-select:focus {
          border-color: rgba(124, 58, 237, 0.45);
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12) !important;
        }

        .printer-page .custom-select option {
          color: #111827;
        }

        .printer-page .refresh-btn,
        .printer-page .save-btn,
        .printer-page .delete-btn {
          border: none;
          outline: none;
          border-radius: 16px;
          font-weight: 700;
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }

        .printer-page .refresh-btn,
        .printer-page .save-btn {
          height: 54px;
          padding: 0 18px;
        }

        .printer-page .refresh-btn {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid rgba(37, 99, 235, 0.28);
        }

        .printer-page .save-btn {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(34, 197, 94, 0.22);
        }

        .printer-page .delete-btn {
          padding: 10px 18px;
          border-radius: 12px;
          color: #ffffff;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.2);
        }

        .printer-page .refresh-btn:hover,
        .printer-page .save-btn:hover,
        .printer-page .delete-btn:hover {
          transform: translateY(-2px);
        }

        .printer-page .refresh-btn:disabled,
        .printer-page .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .printer-page .helper-text {
          color: #64748b;
          font-size: 0.92rem;
        }

        .printer-page .custom-table {
          color: #334155;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .printer-page .custom-table thead th {
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          padding: 16px;
          font-size: 0.92rem;
          font-weight: 700;
        }

        .printer-page .custom-table tbody td {
          background: #ffffff;
          color: #334155;
          border-top: 1px solid rgba(15, 23, 42, 0.06);
          padding: 16px;
        }

        .printer-page .custom-table tbody tr:hover td {
          background: #f8fafc;
        }

        .printer-page .printer-name {
          font-weight: 600;
          color: #0f172a;
        }

        .printer-page .empty-card {
          min-height: 220px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .printer-page .empty-icon {
          font-size: 3rem;
          margin-bottom: 12px;
        }

        .printer-page .empty-text {
          color: #64748b;
          font-size: 1rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .printer-page .header-card,
          .printer-page .config-card,
          .printer-page .saved-card {
            padding: 20px;
            border-radius: 20px;
          }

          .printer-page .count-badge-box {
            width: 100%;
          }

          .printer-page .custom-table thead th,
          .printer-page .custom-table tbody td {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default PrinterSettings;