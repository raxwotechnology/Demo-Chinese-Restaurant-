import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Printer,
  FileText,
  Download,
  X,
  CheckCircle2,
  Calendar,
  Hash,
  User,
  MapPin,
  UtensilsCrossed,
  Info
} from "lucide-react";
import LogoImage from "../upload/logo.png";
import { printReceiptToBoth } from "../utils/printReceipt";
import "../styles/PremiumUI.css";

const ReceiptModal = ({ order, handleClose }) => {
  if (!order) return null;
  const symbol = localStorage.getItem("currencySymbol") || "$";
  const now = new Date().toLocaleString();

  const handlePrint = () => {
    const printableHTML = generatePrintableHTML(order, symbol, now);
    printReceiptToBoth(printableHTML);
  };

  return (
    <div className="receipt-overlay-root">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="receipt-backdrop"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="receipt-card-premium"
        >
          {/* Top Actions */}
          <header className="receipt-header">
            <div className="status-badge">
              <CheckCircle2 size={16} className="text-success" />
              <span className="fw-800">TRANSACTION FINALIZED</span>
            </div>
            <div className="d-flex gap-2">
              <button className="icon-btn-round" onClick={handlePrint}><Printer size={18} /></button>
              <button className="icon-btn-round" onClick={handleClose}><X size={18} /></button>
            </div>
          </header>

          <div className="receipt-scrollable-body">
            {/* Brand Identity */}
            <div className="brand-section text-center mb-5">
              <div className="logo-wrapper-premium mx-auto mb-3">
                <img src={LogoImage} alt="Royal Orient" />
              </div>
              <h2 className="fw-900 m-0">Royal Orient</h2>
              <p className="tiny-caps opacity-50 letter-spacing-2">Culinary Excellence & Tradition</p>
            </div>

            {/* Meta Info Grid */}
            <div className="meta-info-grid mb-5">
              <div className="meta-box">
                <Hash size={14} className="text-indigo" />
                <div>
                  <span className="tiny-caps opacity-50">Invoice No</span>
                  <span className="fw-800 d-block">{order.invoiceNo || "ORD-7829"}</span>
                </div>
              </div>
              <div className="meta-box">
                <Calendar size={14} className="text-indigo" />
                <div>
                  <span className="tiny-caps opacity-50">Date & Time</span>
                  <span className="fw-800 d-block">{now}</span>
                </div>
              </div>
              <div className="meta-box">
                <User size={14} className="text-indigo" />
                <div>
                  <span className="tiny-caps opacity-50">Customer</span>
                  <span className="fw-800 d-block">{order.customerName || "Walk-in Guest"}</span>
                </div>
              </div>
              <div className="meta-box">
                <UtensilsCrossed size={14} className="text-indigo" />
                <div>
                  <span className="tiny-caps opacity-50">Order Type</span>
                  <span className="fw-800 d-block">{order.tableNo && order.tableNo !== 'Takeaway' ? `Table ${order.tableNo}` : "Takeaway"}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="ledger-table-container mb-5">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Culinary Item</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <span className="fw-700">{item.name}</span>
                        <span className="d-block tiny-caps opacity-40">Unit: {symbol}{item.price}</span>
                      </td>
                      <td className="text-center fw-800">{item.quantity}</td>
                      <td className="text-end fw-900 text-indigo">{symbol}{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="financial-summary-box p-4 rounded-4 bg-app">
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-700 opacity-50">Subtotal</span>
                <span className="fw-800">{symbol}{(order.subtotal || order.totalPrice).toLocaleString()}</span>
              </div>
              {order.serviceCharge > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-700 opacity-50">Service Charge</span>
                  <span className="fw-800">{symbol}{order.serviceCharge.toLocaleString()}</span>
                </div>
              )}
              {order.deliveryCharge > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-700 opacity-50">Delivery Logistics</span>
                  <span className="fw-800">{symbol}{order.deliveryCharge.toLocaleString()}</span>
                </div>
              )}
              <div className="divider-dashed my-3"></div>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="fw-900 m-0">TOTAL AMOUNT</h4>
                <h3 className="fw-900 m-0 text-indigo">{symbol}{order.totalPrice.toLocaleString()}</h3>
              </div>
            </div>

            {/* Footer Note */}
            <footer className="text-center mt-5 pt-4 border-top">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                <Info size={14} className="text-indigo" />
                <span className="fw-800 small">Thank you for your patronage</span>
              </div>
              <p className="tiny-caps opacity-30 m-0">Software Powered by Raxwo (Pvt) Ltd • 074 357 3333</p>
            </footer>
          </div>

          <footer className="receipt-actions-footer">
            <button className="btn-indigo w-100 py-3 justify-content-center" onClick={handlePrint}>
              <Printer size={18} />
              <span>PRINT PHYSICAL RECEIPT</span>
            </button>
            <button className="btn-ghost w-100 mt-2" onClick={handleClose}>CLOSE DOCUMENT</button>
          </footer>
        </motion.div>
      </motion.div>

      <style>{`
        .receipt-overlay-root { position: fixed; inset: 0; z-index: 4000; }
        .receipt-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 40px; }
        
        .receipt-card-premium { background: white; width: 100%; max-width: 540px; border-radius: 40px; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.4); display: flex; flex-direction: column; overflow: hidden; max-height: 90vh; }
        
        .receipt-header { padding: 20px 32px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; }
        .status-badge { display: flex; align-items: center; gap: 8px; background: #f0fdf4; padding: 6px 14px; border-radius: 50px; font-size: 0.65rem; color: #166534; }
        
        .receipt-scrollable-body { flex: 1; overflow-y: auto; padding: 32px 40px; scrollbar-width: none; }
        .receipt-scrollable-body::-webkit-scrollbar { display: none; }

        .logo-wrapper-premium { width: 70px; height: 70px; border-radius: 50%; overflow: hidden; border: 3px solid var(--p-indigo-50); }
        .logo-wrapper-premium img { width: 100%; height: 100%; object-fit: cover; }

        .meta-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .meta-box { display: flex; gap: 10px; align-items: center; min-width: 0; }
        .meta-box span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .ledger-table { width: 100%; border-collapse: collapse; }
        .ledger-table th { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px; }
        .ledger-table td { padding: 12px 0; border-bottom: 1px solid #f8fafc; font-size: 0.85rem; }
        
        .divider-dashed { border-top: 1px dashed var(--border-strong); width: 100%; }
        
        .receipt-actions-footer { padding: 20px 40px 32px; background: linear-gradient(0deg, #fff 80%, transparent 100%); }

        @media (max-width: 576px) {
          .receipt-backdrop { padding: 10px; }
          .receipt-card-premium { border-radius: 24px; max-height: 98vh; }
          .receipt-scrollable-body { padding: 24px; }
          .meta-info-grid { grid-template-columns: 1fr; gap: 12px; }
          .receipt-header { padding: 16px 20px; }
          .logo-wrapper-premium { width: 60px; height: 60px; }
          .ledger-table td { font-size: 0.75rem; padding: 8px 0; }
          .receipt-actions-footer { padding: 16px 24px 24px; }
        }
      `}</style>
    </div>
  );
};

const generatePrintableHTML = (order, symbol, now) => {
  // High-fidelity print logic for thermal printers (keeping the user's specific store details)
  return `
      <html>
        <head>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0; padding: 5mm; color: #000; }
            .text-center { text-align: center; }
            .text-end { text-align: right; }
            hr { border: 0; border-top: 1px dashed #000; margin: 5px 0; }
            table { width: 100%; font-size: 12px; border-collapse: collapse; }
            th, td { padding: 3px 0; }
            .mb-2 { margin-bottom: 10px; }
            .header-title { font-size: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="text-center mb-2">
            <div class="header-title">Royal Orient</div>
            <div style="font-size:10px;">No. 14/2/D, Pugoda Road, Katulanda, Dekatana.</div>
            <div style="font-size:12px; font-weight:bold;">0777122797</div>
          </div>
          <hr/>
          <div style="font-size:11px;">
            <div>INV: ${order.invoiceNo || 'N/A'}</div>
            <div>DATE: ${now}</div>
            <div>CUST: ${order.customerName || 'Walk-in'}</div>
            <div>TYPE: ${order.tableNo > 0 ? 'Dine-In Table ' + order.tableNo : 'Takeaway'}</div>
          </div>
          <hr/>
          <table>
            <thead>
              <tr><th style="text-align:left;">Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Amt</th></tr>
            </thead>
            <tbody>
              ${order.items.map(i => `
                <tr>
                  <td style="width:50%;">${i.name}</td>
                  <td style="text-align:center;width:20%;">${i.quantity}</td>
                  <td style="text-align:right;width:30%;">${symbol}${(i.price * i.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <hr/>
          <div class="text-end">
            <div>Subtotal: ${symbol}${(order.subtotal || order.totalPrice).toFixed(2)}</div>
            ${order.serviceCharge > 0 ? `<div>Service: ${symbol}${order.serviceCharge.toFixed(2)}</div>` : ''}
            ${order.deliveryCharge > 0 ? `<div>Delivery: ${symbol}${order.deliveryCharge.toFixed(2)}</div>` : ''}
            <div style="font-size:16px; font-weight:bold; margin-top:5px;">TOTAL: ${symbol}${order.totalPrice.toFixed(2)}</div>
          </div>
          <hr/>
          <div class="text-center" style="font-size:11px; margin-top:10px;">
            <div>Thank you for your order!</div>
            <div>Software by Raxwo (Pvt) Ltd</div>
          </div>
        </body>
      </html>
    `;
};

export default ReceiptModal;
