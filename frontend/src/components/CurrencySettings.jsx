import API_BASE_URL from "../apiConfig";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Coins, Hash } from "lucide-react";
import { FaDollarSign, FaEuroSign, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import "./CurrencySettings.css";

const CurrencySettings = () => {
  const [currency, setCurrency] = useState("USD");
  const [symbol, setSymbol] = useState("$");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_BASE_URL}/api/auth/settings/currency`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setCurrency(res.data.currency || "USD");
        setSymbol(res.data.symbol || "$");
      } catch (err) {
        console.error("Failed to load currency:", err.message);
        toast.error("Failed to load currency settings");
      }
    };

    fetchCurrency();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/api/auth/settings/currency`,
        { currency, symbol },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      localStorage.setItem("currencySymbol", symbol);
      localStorage.setItem("currencyCode", currency);

      toast.success("Currency updated successfully!");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error("Failed to update currency");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="currency-page">
      <div className="currency-page__inner">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="currency-page__card"
        >
          <div className="text-center mb-4 pb-1">
            <div className="currency-page__hero-icons mb-3" aria-hidden>
              <span className="currency-page__coin-3d currency-page__coin-3d--usd">
                <FaDollarSign />
              </span>
              <span className="currency-page__coin-3d currency-page__coin-3d--eur">
                <FaEuroSign />
              </span>
            </div>
            <span className="currency-page__eyebrow">Store configuration</span>
            <h1 className="currency-page__title">Currency settings</h1>
            <p className="currency-page__subtitle">
              Set the currency code (e.g. USD, LKR) and the symbol shown beside
              amounts across receipts, reports, and registers.
            </p>
          </div>

          <div className="mb-4">
            <label
              className="currency-page__label"
              htmlFor="currency-code-input"
            >
              <span className="currency-page__label-icon-3d" aria-hidden>
                <Coins size={14} strokeWidth={2.25} />
              </span>
              Currency code
            </label>
            <input
              id="currency-code-input"
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              placeholder="e.g. USD, LKR"
              className="form-control currency-page__input"
              autoComplete="off"
            />
          </div>

          <div className="mb-4">
            <label
              className="currency-page__label"
              htmlFor="currency-symbol-input"
            >
              <span className="currency-page__label-icon-3d" aria-hidden>
                <Hash size={14} strokeWidth={2.25} />
              </span>
              Currency symbol
            </label>
            <input
              id="currency-symbol-input"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. $, Rs, €"
              className="form-control currency-page__input"
              autoComplete="off"
            />
          </div>

          <div className="currency-page__save-section">
            <motion.button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="currency-page__save d-flex align-items-center gap-3 text-start"
              whileTap={{ scale: saving ? 1 : 0.985 }}
            >
              <span className="currency-page__save-coin-3d" aria-hidden>
                <FaSave />
              </span>
              <span className="currency-page__save-copy">
                <span className="currency-page__save-title">
                  {saving ? "Saving…" : "Save settings"}
                </span>
                <span className="currency-page__save-sub">
                  {saving
                    ? "Updating your store preferences…"
                    : "Apply code and symbol across this browser session."}
                </span>
              </span>
            </motion.button>
          </div>

          <p className="currency-page__note text-center mt-4 mb-0">
            Changes apply to this browser and connected flows that read your saved
            currency preferences.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CurrencySettings;
