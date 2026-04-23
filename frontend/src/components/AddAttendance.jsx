import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import {
  FaUserCircle,
  FaCalendarAlt,
  FaStopwatch,
  FaSignInAlt,
  FaPause,
  FaPlay,
  FaSignOutAlt,
  FaClipboardList,
  FaFolderOpen
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AttendancePage = () => {
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
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/employees",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to load employees:", err.message);
      toast.error("Failed to load employees");
    }
  };

  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.name} (${emp.id})`
  }));

  const fetchPunches = async (empId) => {
    setLoading(true);
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/attendance/summary",
        {
          params: { _id: empId, month, year },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPunches(res.data.daily || []);
    } catch (err) {
      console.error("Failed to load punches:", err.response?.data || err.message);
      toast.error("Failed to load punch history");
      setPunches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (selectedOption) => {
    if (!selectedOption) {
      setSelectedEmp(null);
      setPunches([]);
      return;
    }

    setSelectedEmp(selectedOption);
    fetchPunches(selectedOption.value);
  };

  const recordPunch = async (type) => {
    if (!selectedEmp) return;

    try {
      const token = localStorage.getItem("token");
      const punchTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      const payload = {
        employeeId: selectedEmp.value,
        punchType: type
      };

      await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/attendance/punch",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(`${selectedEmp.label} - ${type} at ${punchTime}`);
      fetchPunches(selectedEmp.value);
    } catch (err) {
      console.error("Failed to record punch:", err.response?.data || err.message);
      toast.error(`Failed to record ${type}`);
    }
  };

  const canPunch = (type) => {
    if (!punches.length) return type === "In";

    const latestDay = punches[punches.length - 1];
    const lastPunches = latestDay?.punches || [];
    const lastPunch = lastPunches[lastPunches.length - 1];

    switch (type) {
      case "In":
        return !lastPunch || lastPunch?.type === "Out";
      case "Break In":
        return lastPunch?.type === "In";
      case "Break Out":
        return lastPunch?.type === "Break In";
      case "Out":
        return lastPunch?.type === "Break Out";
      default:
        return false;
    }
  };

  const getStatus = (hours) => {
    if (hours > 8) return "Overtime";
    if (hours < 8) return "Undertime";
    return "On Time";
  };

  const selectedEmpName = selectedEmp ? selectedEmp.label.split(" (")[0] : "";

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  const latestDayData = useMemo(() => {
    if (!punches.length) return null;
    return punches[punches.length - 1];
  }, [punches]);

  const statData = useMemo(() => {
    const totalDays = punches.length;
    const totalHours = punches.reduce(
      (sum, day) => sum + parseFloat(day.totalHours || 0),
      0
    );
    const avgHours = totalDays ? totalHours / totalDays : 0;

    return {
      totalDays,
      totalHours,
      avgHours
    };
  }, [punches]);

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "58px",
      borderRadius: "18px",
      background: "#ffffff",
      borderColor: state.isFocused
        ? "hsla(160, 42%, 40%, 0.55)"
        : "rgba(15, 23, 42, 0.12)",
      boxShadow: state.isFocused
        ? "0 0 0 4px hsla(160, 40%, 42%, 0.14)"
        : "0 1px 2px rgba(15, 23, 42, 0.04)",
      paddingLeft: "8px",
      fontSize: "15px",
      color: "#0f172a",
      "&:hover": {
        borderColor: "hsla(160, 42%, 40%, 0.45)"
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#0f172a"
    }),
    input: (provided) => ({
      ...provided,
      color: "#0f172a"
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "16px",
      overflow: "hidden",
      background: "#ffffff",
      border: "1px solid rgba(15, 23, 42, 0.12)",
      boxShadow: "0 12px 40px rgba(15, 23, 42, 0.12)",
      zIndex: 9999
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#2563eb"
        : state.isFocused
        ? "hsla(160, 40%, 42%, 0.12)"
        : "#ffffff",
      color: state.isSelected ? "#ffffff" : "#0f172a",
      padding: "12px 14px"
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "rgba(15, 23, 42, 0.45)"
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: "rgba(15, 23, 42, 0.1)"
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#64748b"
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: "#64748b"
    })
  };

  return (
    <>
      <style>{`
        .attendance-page-light.attendance-page-wrapper {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          // background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
          color: #1e293b;
          padding-bottom: 30px;
        }

        // .attendance-page-light.attendance-page-wrapper::before {
        //   content: "";
        //   position: fixed;
        //   inset: 0;
        //   background-image:
        //     linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
        //     linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
        //   background-size: 40px 40px;
        //   pointer-events: none;
        //   mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.03));
        //   z-index: 0;
        // }

        .attendance-page-light .container {
          position: relative;
          z-index: 1;
        }

        .attendance-page-light .hero-card {
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.96) 100%
          );
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: #0f172a;
          border-radius: 30px;
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          box-shadow:
            0 20px 50px rgba(15, 23, 42, 0.07),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .attendance-page-light .hero-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            hsla(160, 40%, 42%, 0.06),
            transparent 40%,
            rgba(59, 130, 246, 0.04)
          );
          pointer-events: none;
        }

        .attendance-page-light .hero-card > * {
          position: relative;
          z-index: 1;
        }

        .attendance-page-light .hero-chip {
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

        .attendance-page-light .hero-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 10px;
          color: #0f172a;
        }

        .attendance-page-light .hero-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .attendance-page-light .att-hero-icon-3d {
          width: 52px;
          height: 52px;
          min-width: 52px;
          border-radius: 17px;
          display: grid;
          place-items: center;
          color: #ffffff;
          position: relative;
          flex-shrink: 0;
          background: linear-gradient(145deg, #34d399 0%, #059669 55%, #047857 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.38),
            0 14px 26px rgba(15, 23, 42, 0.16),
            0 6px 10px rgba(15, 23, 42, 0.08);
        }

        .attendance-page-light .att-hero-icon-3d::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 15px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0.02));
          pointer-events: none;
        }

        .attendance-page-light .att-hero-icon-3d::after {
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

        .attendance-page-light .att-hero-icon-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .attendance-page-light .att-hero-icon-inner svg {
          width: 22px;
          height: 22px;
          filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.22));
        }

        .attendance-page-light .hero-text {
          max-width: 720px;
          color: #64748b;
          margin-bottom: 0;
        }

        .attendance-page-light .hero-date-box {
          min-width: 190px;
          padding: 18px 20px;
          border-radius: 20px;
          background: rgba(248, 250, 252, 0.95);
          border: 1px solid rgba(15, 23, 42, 0.1);
          text-align: center;
        }

        .attendance-page-light .hero-date-box span {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          color: hsl(160, 42%, 32%);
          margin-bottom: 6px;
          letter-spacing: 0.5px;
          font-weight: 700;
        }

        .attendance-page-light .hero-date-box strong {
          color: #0f172a;
          font-size: 1.05rem;
          font-weight: 800;
        }

        .attendance-page-light .info-card {
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

        .attendance-page-light .info-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.09);
        }

        .attendance-page-light .att-icon-3d {
          width: 60px;
          height: 60px;
          min-width: 60px;
          border-radius: 19px;
          display: grid;
          place-items: center;
          color: #ffffff;
          position: relative;
          flex-shrink: 0;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.36),
            0 12px 22px rgba(15, 23, 42, 0.14),
            0 5px 9px rgba(15, 23, 42, 0.08);
        }

        .attendance-page-light .att-icon-3d::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 17px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.02));
          pointer-events: none;
        }

        .attendance-page-light .att-icon-3d::after {
          content: "";
          position: absolute;
          left: 9px;
          right: 9px;
          top: 6px;
          height: 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.18);
          filter: blur(1px);
          pointer-events: none;
        }

        .attendance-page-light .att-icon-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .attendance-page-light .att-icon-inner svg {
          width: 25px;
          height: 25px;
          filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
        }

        .attendance-page-light .att-icon-3d--empty {
          width: 72px;
          height: 72px;
          min-width: 72px;
          border-radius: 22px;
        }

        .attendance-page-light .att-icon-3d--empty::before {
          border-radius: 20px;
        }

        .attendance-page-light .att-icon-3d--empty .att-icon-inner svg {
          width: 30px;
          height: 30px;
        }

        .attendance-page-light .icon-blue {
          background: linear-gradient(145deg, #4f8cff 0%, #2563eb 55%, #1d4ed8 100%);
        }
        .attendance-page-light .icon-green {
          background: linear-gradient(145deg, #4ade80 0%, #16a34a 55%, #15803d 100%);
        }
        .attendance-page-light .icon-purple {
          background: linear-gradient(145deg, #c4b5fd 0%, #7c3aed 55%, #5b21b6 100%);
        }
        .attendance-page-light .icon-slate {
          background: linear-gradient(145deg, #94a3b8 0%, #64748b 55%, #475569 100%);
        }

        .attendance-page-light .info-label {
          margin-bottom: 6px;
          color: #64748b;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .attendance-page-light .info-value {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
        }

        .attendance-page-light .section-card {
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.96) 100%
          );
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 28px;
          padding: 24px;
          box-shadow:
            0 14px 40px rgba(15, 23, 42, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .attendance-page-light .section-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .attendance-page-light .section-subtitle {
          color: #64748b;
          margin-bottom: 0;
        }

        .attendance-page-light .custom-label {
          font-weight: 700;
          color: #334155;
          margin-bottom: 8px;
        }

        .attendance-page-light .employee-profile-card {
          text-align: center;
          height: 100%;
        }

        .attendance-page-light .employee-avatar {
          position: relative;
          width: 84px;
          height: 84px;
          margin: 0 auto 16px;
          border-radius: 22px;
          background: linear-gradient(145deg, #60a5fa 0%, #2563eb 50%, #1d4ed8 100%);
          color: #fff;
          display: grid;
          place-items: center;
          font-size: 1.28rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.45),
            inset 0 -3px 0 rgba(30, 64, 175, 0.35),
            0 14px 32px rgba(37, 99, 235, 0.28),
            0 4px 10px rgba(15, 23, 42, 0.1);
        }

        .attendance-page-light .employee-avatar::before {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.38), transparent 52%);
          pointer-events: none;
        }

        .attendance-page-light .employee-avatar span {
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
        }

        .attendance-page-light .employee-name {
          font-size: 1.3rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .attendance-page-light .employee-text {
          color: #64748b;
          margin-bottom: 18px;
        }

        .attendance-page-light .mini-stat-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 18px;
          padding: 14px 16px;
          margin-bottom: 12px;
        }

        .attendance-page-light .mini-stat-box span {
          color: #64748b;
          font-weight: 600;
        }

        .attendance-page-light .mini-stat-box strong {
          color: #0f172a;
          font-weight: 800;
        }

        .attendance-page-light .employee-select-wrap {
          max-width: min(100%, 480px);
        }

        .attendance-page-light .punch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 18px;
          justify-items: start;
        }

        .attendance-page-light .punch-btn {
          border: none;
          border-radius: 20px;
          padding: 18px;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 14px;
          text-align: left;
          transition: all 0.25s ease;
          width: 100%;
          max-width: min(100%, 440px);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            0 14px 28px rgba(15, 23, 42, 0.14);
        }

        .attendance-page-light .punch-btn:hover {
          transform: translateY(-3px);
          filter: brightness(1.04);
        }

        .attendance-page-light .punch-btn-icon {
          position: relative;
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 15px;
          display: grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.22);
          flex-shrink: 0;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.45),
            0 6px 14px rgba(0, 0, 0, 0.15);
        }

        .attendance-page-light .punch-btn-icon::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 13px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent 55%);
          pointer-events: none;
        }

        .attendance-page-light .punch-btn-icon svg {
          position: relative;
          z-index: 1;
          width: 20px;
          height: 20px;
          filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
        }

        .attendance-page-light .btn-in {
          background: linear-gradient(168deg, #5ee9a8 0%, #22c55e 45%, #16a34a 78%, #15803d 100%);
        }

        .attendance-page-light .btn-break-in {
          background: linear-gradient(168deg, #fcd34d 0%, #f59e0b 45%, #d97706 78%, #b45309 100%);
        }

        .attendance-page-light .btn-break-out {
          background: linear-gradient(168deg, #93c5fd 0%, #3b82f6 45%, #2563eb 78%, #1d4ed8 100%);
        }

        .attendance-page-light .btn-out {
          background: linear-gradient(168deg, #fca5a5 0%, #ef4444 45%, #dc2626 78%, #b91c1c 100%);
        }

        .attendance-page-light .punch-btn strong {
          display: block;
          font-size: 1rem;
        }

        .attendance-page-light .punch-btn small {
          opacity: 0.92;
        }

        .attendance-page-light .table-responsive {
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          overflow: hidden;
          background: #f8fafc;
        }

        .attendance-page-light .attendance-table {
          color: #334155;
          margin-bottom: 0;
          background: #ffffff;
        }

        .attendance-page-light .attendance-table thead th {
          background: #f1f5f9;
          color: #475569;
          font-size: 0.86rem;
          font-weight: 800;
          padding: 16px 14px;
          border: none;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          white-space: nowrap;
        }

        .attendance-page-light .attendance-table tbody td {
          padding: 16px 14px;
          border-top: 1px solid rgba(15, 23, 42, 0.06);
          color: #334155;
          vertical-align: middle;
          background: #ffffff;
        }

        .attendance-page-light .attendance-table tbody tr:hover td {
          background: #f8fafc;
        }

        .attendance-page-light .hours-pill {
          display: inline-flex;
          padding: 7px 12px;
          border-radius: 999px;
          background: hsla(217, 91%, 45%, 0.1);
          color: #1d4ed8;
          border: 1px solid hsla(217, 85%, 40%, 0.18);
          font-weight: 700;
          font-size: 0.84rem;
        }

        .attendance-page-light .status-badge-custom {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 95px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 800;
          border: 1px solid transparent;
        }

        .attendance-page-light .status-badge-custom.status-success {
          background: hsla(142, 71%, 36%, 0.12);
          color: #166534;
          border-color: hsla(142, 65%, 32%, 0.2);
        }

        .attendance-page-light .status-badge-custom.status-warning {
          background: hsla(38, 92%, 45%, 0.12);
          color: #a16207;
          border-color: hsla(38, 85%, 40%, 0.2);
        }

        .attendance-page-light .status-badge-custom.status-secondary {
          background: rgba(100, 116, 139, 0.12);
          color: #475569;
          border-color: rgba(71, 85, 105, 0.2);
        }

        .attendance-page-light .empty-box {
          min-height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #64748b;
        }

        .attendance-page-light .empty-box h5 {
          color: #0f172a;
          font-weight: 800;
        }

        .attendance-page-light .att-empty-3d-wrap {
          margin-bottom: 8px;
        }

        @media (max-width: 992px) {
          .attendance-page-light .hero-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .attendance-page-light .hero-date-box {
            width: 100%;
          }
        }

        @media (max-width: 576px) {
          .attendance-page-light .hero-title {
            font-size: 1.55rem;
          }

          .attendance-page-light .hero-card,
          .attendance-page-light .section-card,
          .attendance-page-light .info-card {
            padding: 18px;
            border-radius: 20px;
          }

          .attendance-page-light .att-icon-3d:not(.att-icon-3d--empty) {
            width: 54px;
            height: 54px;
            min-width: 54px;
            border-radius: 17px;
          }

          .attendance-page-light .att-icon-3d:not(.att-icon-3d--empty)::before {
            border-radius: 15px;
          }

          .attendance-page-light .att-icon-3d:not(.att-icon-3d--empty) .att-icon-inner svg {
            width: 22px;
            height: 22px;
          }

          .attendance-page-light .punch-grid {
            grid-template-columns: 1fr;
          }

          .attendance-page-light .punch-btn {
            max-width: 100%;
          }
        }
      `}</style>

      <div className="attendance-page-wrapper attendance-page-light">
        <div className="container py-4">
          <div className="hero-card mb-4">
            <div>
              <span className="hero-chip">Attendance Management</span>
              <h1 className="hero-title hero-title-row">
                <span className="att-hero-icon-3d" aria-hidden>
                  <span className="att-hero-icon-inner">
                    <FaClipboardList />
                  </span>
                </span>
                <span>Employee Attendance</span>
              </h1>
              <p className="hero-text">
                Record and manage employee clock in, break, and clock out activities in a clean modern admin interface.
              </p>
            </div>

            <div className="hero-date-box">
              <span>Today</span>
              <strong>{new Date().toLocaleDateString()}</strong>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-4 col-md-6">
              <div className="info-card">
                <div className="att-icon-3d icon-blue" aria-hidden>
                  <span className="att-icon-inner">
                    <FaUserCircle />
                  </span>
                </div>
                <div>
                  <p className="info-label">Selected Employee</p>
                  <h4 className="info-value">
                    {selectedEmp ? selectedEmpName : "Not Selected"}
                  </h4>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="info-card">
                <div className="att-icon-3d icon-green" aria-hidden>
                  <span className="att-icon-inner">
                    <FaCalendarAlt />
                  </span>
                </div>
                <div>
                  <p className="info-label">Recorded Days</p>
                  <h4 className="info-value">{statData.totalDays}</h4>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-12">
              <div className="info-card">
                <div className="att-icon-3d icon-purple" aria-hidden>
                  <span className="att-icon-inner">
                    <FaStopwatch />
                  </span>
                </div>
                <div>
                  <p className="info-label">Total Hours</p>
                  <h4 className="info-value">{statData.totalHours.toFixed(2)}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="section-card mb-4">
            <h4 className="section-title">Select Employee</h4>
            <p className="section-subtitle mb-3">
              Search and choose an employee to manage attendance punches.
            </p>

            <label className="form-label custom-label">Employee Name</label>
            <div className="employee-select-wrap">
              <Select
                options={employeeOptions}
                value={selectedEmp}
                onChange={handleEmployeeChange}
                placeholder="Search or select employee..."
                isClearable
                isSearchable
                styles={customSelectStyles}
              />
            </div>
          </div>

          {selectedEmp && (
            <div className="row g-4 mb-4">
              <div className="col-lg-4">
                <div className="section-card employee-profile-card">
                  <div className="employee-avatar">
                    <span>{getInitials(selectedEmpName)}</span>
                  </div>
                  <h4 className="employee-name">{selectedEmpName}</h4>
                  <p className="employee-text">
                    Manage punch records and check the daily attendance summary for this employee.
                  </p>

                  <div className="mini-stat-box">
                    <span>Average Hours</span>
                    <strong>{statData.avgHours.toFixed(2)} hrs</strong>
                  </div>

                  <div className="mini-stat-box">
                    <span>Latest Status</span>
                    <strong>
                      {latestDayData
                        ? getStatus(parseFloat(latestDayData.totalHours || 0))
                        : "No Record"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="col-lg-8">
                <div className="section-card h-100">
                  <h4 className="section-title">Punch Actions</h4>
                  <p className="section-subtitle">
                    Available actions depend on the employee’s latest recorded punch.
                  </p>

                  <div className="punch-grid">
                    {canPunch("In") && (
                      <button
                        className="punch-btn btn-in"
                        onClick={() => recordPunch("In")}
                        type="button"
                      >
                        <div className="punch-btn-icon" aria-hidden>
                          <FaSignInAlt />
                        </div>
                        <div>
                          <strong>Clock In</strong>
                          <small>Start shift attendance</small>
                        </div>
                      </button>
                    )}

                    {canPunch("Break In") && (
                      <button
                        className="punch-btn btn-break-in"
                        onClick={() => recordPunch("Break In")}
                        type="button"
                      >
                        <div className="punch-btn-icon" aria-hidden>
                          <FaPause />
                        </div>
                        <div>
                          <strong>Break In</strong>
                          <small>Employee starts break</small>
                        </div>
                      </button>
                    )}

                    {canPunch("Break Out") && (
                      <button
                        className="punch-btn btn-break-out"
                        onClick={() => recordPunch("Break Out")}
                        type="button"
                      >
                        <div className="punch-btn-icon" aria-hidden>
                          <FaPlay />
                        </div>
                        <div>
                          <strong>Break Out</strong>
                          <small>Employee ends break</small>
                        </div>
                      </button>
                    )}

                    {canPunch("Out") && (
                      <button
                        className="punch-btn btn-out"
                        onClick={() => recordPunch("Out")}
                        type="button"
                      >
                        <div className="punch-btn-icon" aria-hidden>
                          <FaSignOutAlt />
                        </div>
                        <div>
                          <strong>Clock Out</strong>
                          <small>End shift attendance</small>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedEmp && (
            <div className="section-card">
              <h4 className="section-title">Daily Punch Log</h4>
              <p className="section-subtitle mb-3">
                View daily attendance records, break times, total hours, and work status.
              </p>

              {loading ? (
                <div className="empty-box">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-3 mb-0 text-muted">Loading punch history...</p>
                </div>
              ) : punches.length === 0 ? (
                <div className="empty-box">
                  <div className="att-empty-3d-wrap">
                    <div className="att-icon-3d att-icon-3d--empty icon-slate" aria-hidden>
                      <span className="att-icon-inner">
                        <FaFolderOpen />
                      </span>
                    </div>
                  </div>
                  <h5>No punches recorded yet</h5>
                  <p className="text-muted mb-0">
                    Attendance records for the selected employee will appear here.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table attendance-table align-middle">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>In</th>
                        <th>Break In</th>
                        <th>Break Out</th>
                        <th>Out</th>
                        <th>Total Hours</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {punches.map((day, idx) => {
                        const punchesMap = {};
                        day.punches.forEach((p) => {
                          punchesMap[p.type] = p.time;
                        });

                        const totalHours = parseFloat(day.totalHours || 0);
                        const status = getStatus(totalHours);

                        return (
                          <tr key={idx}>
                            <td>{new Date(day.date).toLocaleDateString()}</td>
                            <td>{punchesMap["In"] || "-"}</td>
                            <td>{punchesMap["Break In"] || "-"}</td>
                            <td>{punchesMap["Break Out"] || "-"}</td>
                            <td>{punchesMap["Out"] || "-"}</td>
                            <td>
                              <span className="hours-pill">
                                {totalHours.toFixed(2)} hrs
                              </span>
                            </td>
                            <td>
                              <span
                                className={`status-badge-custom ${
                                  status === "Overtime"
                                    ? "status-success"
                                    : status === "Undertime"
                                    ? "status-warning"
                                    : "status-secondary"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <ToastContainer position="top-right" autoClose={2500} />
        </div>
      </div>
    </>
  );
};

export default AttendancePage;