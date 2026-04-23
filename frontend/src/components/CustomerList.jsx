import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FaUsers,
  FaFileAlt,
  FaThumbtack,
  FaAddressBook,
  FaFileExcel,
  FaFilePdf,
  FaFolderOpen
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const CUSTOMERS_PER_PAGE = 50;

  useEffect(() => {
    fetchCustomers(1);
  }, []);

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    setCurrentPage(page);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/customers-list?page=${page}&limit=${CUSTOMERS_PER_PAGE}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setCustomers(res.data.customers || []);
      setTotalCount(res.data.totalCount || 0);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error("Failed to load customers:", err);
      toast.error("Failed to load customer list");
    } finally {
      setLoading(false);
    }
  };

  const paginate = (pageNumber) => {
    fetchCustomers(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exportToExcel = () => {
    import("xlsx").then((XLSX) => {
      const worksheetData = customers.map((cust, idx) => ({
        "#": (currentPage - 1) * CUSTOMERS_PER_PAGE + idx + 1,
        Name: cust.name || "Unnamed",
        "Phone Number": cust.phone || "—"
      }));

      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Customers");
      XLSX.writeFile(wb, "rms_customers.xlsx");
    });
  };

  const exportToPDF = () => {
    const input = document.getElementById("customer-table-container");
    if (!input) {
      toast.error("Table not found for export");
      return;
    }

    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("rms_customers.pdf");
    });
  };

  const visiblePageNumbers = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pages.push(i);
      }
    }
    return [...new Set(pages)];
  }, [totalPages, currentPage]);

  return (
    <>
      <style>{`
        .customer-directory-page.customer-page-wrapper {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          // background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
          color: #1e293b;
          padding-bottom: 30px;
        }

        // .customer-directory-page.customer-page-wrapper::before {
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

        .customer-directory-page .container {
          position: relative;
          z-index: 1;
        }

        .customer-directory-page .customer-hero-card {
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

        .customer-directory-page .customer-hero-card::after {
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

        .customer-directory-page .customer-hero-card > * {
          position: relative;
          z-index: 1;
        }

        .customer-directory-page .hero-chip {
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

        .customer-directory-page .hero-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 10px;
          color: #0f172a;
        }

        .customer-directory-page .hero-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .customer-directory-page .cust-hero-icon-3d {
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

        .customer-directory-page .cust-hero-icon-3d::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 15px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0.02));
          pointer-events: none;
        }

        .customer-directory-page .cust-hero-icon-3d::after {
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

        .customer-directory-page .cust-hero-icon-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .customer-directory-page .cust-hero-icon-inner svg {
          width: 22px;
          height: 22px;
          filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.22));
        }

        .customer-directory-page .hero-text {
          max-width: 720px;
          color: #64748b;
          margin-bottom: 0;
        }

        .customer-directory-page .hero-side-box {
          min-width: 210px;
          padding: 18px 20px;
          border-radius: 20px;
          background: rgba(248, 250, 252, 0.95);
          border: 1px solid rgba(15, 23, 42, 0.1);
          text-align: center;
        }

        .customer-directory-page .hero-side-box span {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          color: hsl(160, 42%, 32%);
          margin-bottom: 6px;
          letter-spacing: 0.5px;
          font-weight: 700;
        }

        .customer-directory-page .hero-side-box strong {
          color: #0f172a;
          font-size: 1.15rem;
          font-weight: 800;
        }

        .customer-directory-page .top-card {
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

        .customer-directory-page .top-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.09);
        }

        .customer-directory-page .cust-icon-3d {
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

        .customer-directory-page .cust-icon-3d::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 17px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.02));
          pointer-events: none;
        }

        .customer-directory-page .cust-icon-3d::after {
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

        .customer-directory-page .cust-icon-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .customer-directory-page .cust-icon-inner svg {
          width: 25px;
          height: 25px;
          filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
        }

        .customer-directory-page .cust-icon-3d--empty {
          width: 72px;
          height: 72px;
          min-width: 72px;
          border-radius: 22px;
        }

        .customer-directory-page .cust-icon-3d--empty::before {
          border-radius: 20px;
        }

        .customer-directory-page .cust-icon-3d--empty .cust-icon-inner svg {
          width: 30px;
          height: 30px;
        }

        .customer-directory-page .icon-blue {
          background: linear-gradient(145deg, #4f8cff 0%, #2563eb 55%, #1d4ed8 100%);
        }
        .customer-directory-page .icon-green {
          background: linear-gradient(145deg, #4ade80 0%, #16a34a 55%, #15803d 100%);
        }
        .customer-directory-page .icon-purple {
          background: linear-gradient(145deg, #c4b5fd 0%, #7c3aed 55%, #5b21b6 100%);
        }
        .customer-directory-page .icon-slate {
          background: linear-gradient(145deg, #94a3b8 0%, #64748b 55%, #475569 100%);
        }

        .customer-directory-page .top-label {
          margin-bottom: 6px;
          color: #64748b;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .customer-directory-page .top-value {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
        }

        .customer-directory-page .section-card {
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

        .customer-directory-page .section-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .customer-directory-page .section-subtitle {
          color: #64748b;
          margin-bottom: 0;
        }

        .customer-directory-page .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: none;
          border-radius: 16px;
          padding: 12px 18px;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.25s ease;
          color: #ffffff;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.35),
            0 12px 24px rgba(15, 23, 42, 0.14);
        }

        .customer-directory-page .action-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }

        .customer-directory-page .export-btn-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.22);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.45),
            0 4px 10px rgba(0, 0, 0, 0.12);
        }

        .customer-directory-page .export-btn-icon svg {
          width: 16px;
          height: 16px;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));
        }

        .customer-directory-page .btn-excel {
          background: linear-gradient(168deg, #5ee9a8 0%, #22c55e 45%, #16a34a 72%, #15803d 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.45),
            0 3px 0 rgba(21, 128, 61, 0.85),
            0 14px 28px rgba(22, 163, 74, 0.25);
        }

        .customer-directory-page .btn-pdf {
          background: linear-gradient(168deg, #fca5a5 0%, #ef4444 45%, #dc2626 72%, #b91c1c 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.35),
            0 3px 0 rgba(153, 27, 27, 0.75),
            0 14px 28px rgba(220, 38, 38, 0.22);
        }

        .customer-directory-page .table-shell {
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 22px;
          overflow: hidden;
        }

        .customer-directory-page .customer-table {
          color: #334155;
          margin-bottom: 0;
          background: #ffffff;
        }

        .customer-directory-page .customer-table thead th {
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

        .customer-directory-page .customer-table tbody td {
          padding: 16px 14px;
          border-top: 1px solid rgba(15, 23, 42, 0.06);
          color: #334155;
          vertical-align: middle;
          background: #ffffff;
        }

        .customer-directory-page .customer-table tbody tr:hover td {
          background: #f8fafc;
        }

        .customer-directory-page .name-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          color: #0f172a;
        }

        .customer-directory-page .name-avatar {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 14px;
          background: linear-gradient(145deg, #60a5fa 0%, #2563eb 50%, #1d4ed8 100%);
          display: grid;
          place-items: center;
          font-size: 0.78rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.45),
            inset 0 -2px 0 rgba(30, 64, 175, 0.35),
            0 6px 14px rgba(37, 99, 235, 0.28),
            0 2px 4px rgba(15, 23, 42, 0.08);
        }

        .customer-directory-page .name-avatar::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent 50%);
          pointer-events: none;
        }

        .customer-directory-page .name-avatar span {
          position: relative;
          z-index: 1;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
        }

        .customer-directory-page .number-pill {
          display: inline-flex;
          padding: 7px 12px;
          border-radius: 999px;
          background: hsla(217, 91%, 45%, 0.1);
          color: #1d4ed8;
          border: 1px solid hsla(217, 85%, 40%, 0.18);
          font-weight: 700;
          font-size: 0.84rem;
        }

        .customer-directory-page .pagination-shell {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 18px 0 0;
          flex-wrap: wrap;
        }

        .customer-directory-page .page-status {
          color: #64748b;
          margin: 0;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .customer-directory-page .page-btn {
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #475569;
          min-width: 40px;
          height: 40px;
          border-radius: 12px;
          padding: 0 12px;
          font-weight: 700;
          transition: all 0.22s ease;
        }

        .customer-directory-page .page-btn:hover:not(:disabled) {
          background: hsla(160, 40%, 42%, 0.1);
          border-color: hsla(160, 45%, 35%, 0.28);
          color: #0f172a;
        }

        .customer-directory-page .page-btn.active {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          border-color: transparent;
          color: white;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
        }

        .customer-directory-page .page-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .customer-directory-page .empty-box {
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #64748b;
        }

        .customer-directory-page .empty-box h5 {
          color: #0f172a;
          font-weight: 800;
        }

        .customer-directory-page .cust-empty-3d-wrap {
          margin-bottom: 8px;
        }

        @media (max-width: 992px) {
          .customer-directory-page .customer-hero-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .customer-directory-page .hero-side-box {
            width: 100%;
          }
        }

        @media (max-width: 576px) {
          .customer-directory-page .hero-title {
            font-size: 1.55rem;
          }

          .customer-directory-page .customer-hero-card,
          .customer-directory-page .section-card,
          .customer-directory-page .top-card {
            padding: 18px;
            border-radius: 20px;
          }

          .customer-directory-page .cust-icon-3d:not(.cust-icon-3d--empty) {
            width: 54px;
            height: 54px;
            min-width: 54px;
            border-radius: 17px;
          }

          .customer-directory-page .cust-icon-3d:not(.cust-icon-3d--empty)::before {
            border-radius: 15px;
          }

          .customer-directory-page .cust-icon-3d:not(.cust-icon-3d--empty) .cust-icon-inner svg {
            width: 22px;
            height: 22px;
          }

          .customer-directory-page .action-stack {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr;
          }

          .customer-directory-page .action-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="customer-page-wrapper customer-directory-page">
        <div className="container py-4">
          <div className="customer-hero-card mb-4">
            <div>
              <span className="hero-chip">Customer Management</span>
              <h1 className="hero-title hero-title-row">
                <span className="cust-hero-icon-3d" aria-hidden>
                  <span className="cust-hero-icon-inner">
                    <FaAddressBook />
                  </span>
                </span>
                <span>Customer Directory</span>
              </h1>
              <p className="hero-text">
                View and manage customer records in a clean, modern admin interface with export options and quick navigation.
              </p>
            </div>

            <div className="hero-side-box">
              <span>Total Records</span>
              <strong>{totalCount}</strong>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-4 col-md-6">
              <div className="top-card">
                <div className="cust-icon-3d icon-blue" aria-hidden>
                  <span className="cust-icon-inner">
                    <FaUsers />
                  </span>
                </div>
                <div>
                  <p className="top-label">Total Customers</p>
                  <h4 className="top-value">{totalCount}</h4>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="top-card">
                <div className="cust-icon-3d icon-green" aria-hidden>
                  <span className="cust-icon-inner">
                    <FaFileAlt />
                  </span>
                </div>
                <div>
                  <p className="top-label">Current Page</p>
                  <h4 className="top-value">{currentPage}</h4>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-12">
              <div className="top-card">
                <div className="cust-icon-3d icon-purple" aria-hidden>
                  <span className="cust-icon-inner">
                    <FaThumbtack />
                  </span>
                </div>
                <div>
                  <p className="top-label">Records Per Page</p>
                  <h4 className="top-value">{CUSTOMERS_PER_PAGE}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="section-card mb-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
              <div>
                <h4 className="section-title">Customer Records</h4>
                <p className="section-subtitle">
                  Browse customer details and export the current view to Excel or PDF.
                </p>
              </div>

              <div className="d-flex gap-2 action-stack">
                <button className="action-btn btn-excel" onClick={exportToExcel} type="button">
                  <span className="export-btn-icon" aria-hidden>
                    <FaFileExcel />
                  </span>
                  Export to Excel
                </button>
                <button className="action-btn btn-pdf" onClick={exportToPDF} type="button">
                  <span className="export-btn-icon" aria-hidden>
                    <FaFilePdf />
                  </span>
                  Export to PDF
                </button>
              </div>
            </div>

            {loading ? (
              <div className="empty-box">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3 mb-0 text-muted">Loading customers...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="empty-box">
                <div className="empty-icon">📂</div>
                <h5>No customers found</h5>
                <p className="text-muted mb-0">
                  Customer records will appear here when available.
                </p>
              </div>
            ) : (
              <>
                <div id="customer-table-container" className="table-responsive table-shell mt-4">
                  <table className="table customer-table align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Phone Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((cust, idx) => {
                        const displayName = cust.name || "Unnamed";
                        const initials = displayName
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase())
                          .join("");

                        return (
                          <tr key={cust.phone || idx}>
                            <td>{(currentPage - 1) * CUSTOMERS_PER_PAGE + idx + 1}</td>
                            <td>
                              <div className="name-pill">
                                <div className="name-avatar">
                                  <span>{initials || "C"}</span>
                                </div>
                                <span>{displayName}</span>
                              </div>
                            </td>
                            <td>
                              <span className="number-pill">{cust.phone || "—"}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="pagination-shell">
                    <p className="page-status">
                      Page {currentPage} of {totalPages}
                    </p>

                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => paginate(currentPage - 1)}
                      >
                        Prev
                      </button>

                      {visiblePageNumbers.map((pageNum) => (
                        <button
                          key={pageNum}
                          className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
                          onClick={() => paginate(pageNum)}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        className="page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => paginate(currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <ToastContainer position="top-right" autoClose={2500} />
        </div>
      </div>
    </>
  );
};

export default CustomerList;