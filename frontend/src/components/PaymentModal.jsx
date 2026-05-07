import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Banknote, Landmark, X, Delete, ArrowRight, Wallet, History, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import "../styles/PremiumUI.css";

const PaymentModal = ({ orderData, onSubmit, handleClose, symbol = "$", processing = false }) => {
  const totalAmount = orderData?.totalPrice || 0;
  const [cash, setCash] = useState(totalAmount.toString());
  const [card, setCard] = useState("0");
  const [bank, setBank] = useState("0");
  const [notes, setNotes] = useState("");
  const [activeField, setActiveField] = useState("cash");

  const totalPaid = parseFloat(cash || 0) + parseFloat(card || 0) + parseFloat(bank || 0);
  const changeDue = Math.max(0, totalPaid - totalAmount);
  const isSufficient = totalPaid >= totalAmount;

  const handleNumPad = (val) => {
    let current = activeField === "cash" ? cash : activeField === "card" ? card : bank;

    if (val === "back") {
      current = current.slice(0, -1) || "0";
    } else if (val === ".") {
      if (!current.includes(".")) current += ".";
    } else {
      current = current === "0" ? String(val) : current + val;
    }

    if (activeField === "cash") setCash(current);
    else if (activeField === "card") setCard(current);
    else setBank(current);
  };

  const handleConfirm = () => {
    if (!isSufficient) {
      toast.error("Insufficient payment volume");
      return;
    }
    onSubmit({
      cash: parseFloat(cash),
      card: parseFloat(card),
      bankTransfer: parseFloat(bank),
      totalPaid,
      changeDue,
      notes
    });
  };

  return (
    <div className="payment-modal-root">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
          className="payment-overlay"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="payment-card-premium"
          >
            {/* Header Area */}
            <header className="payment-header">
              <div className="header-info">
                <div className="icon-badge"><Wallet size={20} /></div>
                <div>
                  <h2 className="m-0 fw-900 h4">Authorize Settlement</h2>
                  <p className="m-0 tiny-caps opacity-50">Transaction Security Module v4.1</p>
                </div>
              </div>
              <button className="close-btn-round" onClick={handleClose}><X size={20} /></button>
            </header>

            <div className="payment-body">
              {/* Left Column: Summary & Methods */}
              <div className="payment-left">
                <div className="payable-display">
                  <span className="tiny-caps">Account Balance Due</span>
                  <div className="amount-hero">
                    <span className="currency">{symbol}</span>
                    <span className="value">{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="payment-methods-grid">
                  <PaymentMethod
                    icon={Banknote}
                    label="Physical Cash"
                    value={cash}
                    active={activeField === 'cash'}
                    onClick={() => setActiveField('cash')}
                    symbol={symbol}
                  />
                  <PaymentMethod
                    icon={CreditCard}
                    label="Electronic Card"
                    value={card}
                    active={activeField === 'card'}
                    onClick={() => setActiveField('card')}
                    symbol={symbol}
                  />
                  <PaymentMethod
                    icon={Landmark}
                    label="Bank Transfer"
                    value={bank}
                    active={activeField === 'bank'}
                    onClick={() => setActiveField('bank')}
                    symbol={symbol}
                  />
                </div>

                <div className={`status-summary ${isSufficient ? 'success' : 'pending'}`}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="tiny-caps">{isSufficient ? 'Balance to Return' : 'Missing Funds'}</span>
                    <div className="fw-900 h5 m-0">
                      {symbol}{isSufficient ? changeDue.toLocaleString() : (totalAmount - totalPaid).toLocaleString()}
                    </div>
                  </div>
                  {!isSufficient && (
                    <div className="d-flex align-items-center gap-2 text-danger small fw-800">
                      <AlertCircle size={14} />
                      <span>AWAITING FULL AUTHORIZATION</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Numpad & Meta */}
              <div className="payment-right">
                <div className="numpad-container">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'back'].map(num => (
                    <button
                      key={num}
                      className={`numpad-btn ${num === 'back' ? 'back' : ''}`}
                      onClick={() => handleNumPad(num)}
                    >
                      {num === 'back' ? <Delete size={26} strokeWidth={1.5} /> : num}
                    </button>
                  ))}
                </div>

                <div className="meta-container mt-4">
                  <div className="input-group-premium mb-4">
                    <label className="tiny-caps mb-2 d-block opacity-50">Operational Remarks</label>
                    <textarea
                      className="pos-textarea"
                      placeholder="Add transaction metadata..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <button
                    className={`checkout-btn ${isSufficient && !processing ? 'authorized' : ''}`}
                    onClick={handleConfirm}
                    disabled={!isSufficient || processing}
                  >
                    <div className="btn-content">
                      {processing ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner-border spinner-border-sm" />
                      ) : (
                        <>
                          <span className="fw-900">FINALIZE TRANSACTION</span>
                          <ArrowRight size={22} />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <style>{`
        .payment-modal-root { position: fixed; inset: 0; z-index: 3000; }
        .payment-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); display: flex; align-items: center; justify-content: center; padding: 40px; }
        
        .payment-card-premium { background: #fff; width: 100%; max-width: 1100px; border-radius: 40px; overflow: hidden; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.25); display: flex; flex-direction: column; max-height: 95vh; }
        
        .payment-header { padding: 24px 40px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; }
        .header-info { display: flex; align-items: center; gap: 15px; }
        .icon-badge { width: 44px; height: 44px; background: var(--p-indigo-600); color: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .close-btn-round { border: none; background: #f8fafc; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s; color: var(--text-muted); }

        .payment-body { display: flex; padding: 32px 40px; gap: 40px; overflow-y: auto; }
        .payment-left { flex: 1.2; display: flex; flex-direction: column; gap: 24px; min-width: 0; }
        .payment-right { flex: 1; min-width: 0; }

        .payable-display { background: linear-gradient(135deg, var(--p-indigo-900) 0%, var(--p-indigo-700) 100%); padding: 32px; border-radius: 28px; color: white; }
        .amount-hero { display: flex; align-items: baseline; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
        .amount-hero .currency { font-size: 1.5rem; font-weight: 300; opacity: 0.7; }
        .amount-hero .value { font-size: 3.5rem; font-weight: 900; letter-spacing: -2px; line-height: 1; }

        .payment-methods-grid { display: flex; flex-direction: column; gap: 10px; }
        .method-tile { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-radius: 20px; border: 2px solid transparent; background: #f8fafc; cursor: pointer; transition: 0.3s; }
        .method-tile.active { background: white; border-color: var(--p-indigo-600); }
        .method-tile .icon-wrap { width: 42px; height: 42px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        .status-summary { padding: 20px; border-radius: 20px; }

        .numpad-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .numpad-btn { height: 64px; border-radius: 16px; border: 1px solid var(--border-subtle); background: white; font-size: 1.5rem; font-weight: 700; font-family: 'Outfit'; cursor: pointer; }

        .checkout-btn { width: 100%; padding: 24px; border-radius: 20px; border: none; background: #e2e8f0; color: #94a3b8; cursor: not-allowed; transition: 0.3s; }
        
        @media (max-width: 992px) {
          .payment-overlay { padding: 15px; }
          .payment-card-premium { border-radius: 24px; }
          .payment-body { flex-direction: column; padding: 24px; gap: 32px; }
          .payment-header { padding: 16px 24px; }
          .amount-hero .value { font-size: 2.5rem; }
          .payable-display { padding: 24px; }
          .numpad-btn { height: 56px; font-size: 1.25rem; }
        }

        @media (max-height: 800px) {
          .payment-card-premium { max-height: 98vh; }
          .payment-body { padding: 20px 24px; gap: 20px; }
          .payable-display { padding: 20px; }
          .amount-hero .value { font-size: 2rem; }
          .numpad-btn { height: 50px; }
          .method-tile { padding: 12px 16px; }
        }
        .checkout-btn.authorized { background: var(--p-indigo-600); color: white; cursor: pointer; box-shadow: 0 20px 40px -10px rgba(79, 70, 229, 0.4); }
        .checkout-btn.authorized:hover { background: var(--p-indigo-700); transform: translateY(-4px); }
        .btn-content { display: flex; align-items: center; justify-content: center; gap: 16px; position: relative; z-index: 10; }
        
        .pos-textarea { width: 100%; padding: 20px; border-radius: 20px; border: 1px solid var(--border-subtle); background: #f8fafc; font-weight: 600; outline: none; transition: 0.2s; min-height: 100px; font-family: 'Inter'; }
        .pos-textarea:focus { background: white; border-color: var(--p-indigo-600); }
      `}</style>
    </div>
  );
};

const PaymentMethod = ({ icon: Icon, label, value, active, onClick, symbol }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    className={`method-tile ${active ? 'active' : ''}`}
    onClick={onClick}
  >
    <div className="icon-wrap"><Icon size={22} /></div>
    <div className="flex-grow-1">
      <span className="tiny-caps opacity-50">{label}</span>
      <div className="fw-900 h5 m-0">{symbol}{parseFloat(value).toLocaleString()}</div>
    </div>
    <div className="active-indicator"></div>
  </motion.div>
);

export default PaymentModal;