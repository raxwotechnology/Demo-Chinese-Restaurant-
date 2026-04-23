import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import makeAnimated from "react-select/animated";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaReceipt, FaSave, FaSpinner } from "react-icons/fa";

const ExpensePage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    supplier: null,
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    billNo: "",
    paymentMethod: "Cash"
  });
  const [billItems, setBillItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedExpenses, setExpandedExpenses] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [showCreateMenuModal, setShowCreateMenuModal] = useState(false);
  const [newMenuData, setNewMenuData] = useState({
    name: "",
    price: "",
    cost: "",
    category: "Main Course",
    minimumQty: 5
  });
  const [pendingMenuIndex, setPendingMenuIndex] = useState(null);
  const [menus, setMenus] = useState([]);

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchSuppliers();
    fetchExpenses();
    fetchMenus();

    const storedItems = localStorage.getItem("restockBillItems");
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        if (Array.isArray(items) && items.length > 0) {
          setBillItems(items);
          const total = items.reduce(
            (sum, item) => sum + (parseFloat(item.total) || 0),
            0
          );
          setFormData((prev) => ({ ...prev, amount: total.toFixed(2) }));
          toast.info("Loaded items for restocking from Menu Management");
          localStorage.removeItem("restockBillItems");
        }
      } catch (e) {
        console.error("Failed to parse restock items", e);
      }
    }
  }, []);

  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/menus",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMenus(res.data);
    } catch (err) {
      console.error("Failed to load menus");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/suppliers",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuppliers(res.data);
    } catch (err) {
      toast.error("Failed to load suppliers");
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expenses",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setExpenses(res.data);
    } catch (err) {
      toast.error("Failed to load expenses");
    }
  };

  const toggleBillItems = (expenseId) => {
    setExpandedExpenses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(expenseId)) {
        newSet.delete(expenseId);
      } else {
        newSet.add(expenseId);
      }
      return newSet;
    });
  };

  const addBillItem = () => {
    setBillItems([
      ...billItems,
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        menuId: null,
        isConfirmed: false,
        note: ""
      }
    ]);
  };

  const removeBillItem = (index) => {
    const updated = billItems.filter((_, i) => i !== index);
    setBillItems(updated);
    updateTotalAmount(updated);
  };

  const updateBillItem = (index, field, value) => {
    const updated = [...billItems];
    updated[index][field] = value;

    if (field === "menuId") {
      const selectedMenu = menus.find((m) => m._id === value);
      updated[index].isConfirmed = false;
      if (selectedMenu) {
        if (!updated[index].description) {
          updated[index].description = `${selectedMenu.name} (Restock)`;
        }
        updated[index].note = `Avail Qty: ${selectedMenu.currentQty || 0}`;
      } else {
        updated[index].note = "";
      }
    }

    if (field === "quantity" || field === "unitPrice") {
      const qty = parseFloat(updated[index].quantity) || 0;
      const price = parseFloat(updated[index].unitPrice) || 0;
      updated[index].total = qty * price;
    }

    setBillItems(updated);
    updateTotalAmount(updated);
  };

  const updateTotalAmount = (items) => {
    const total = items.reduce(
      (sum, item) => sum + (parseFloat(item.total) || 0),
      0
    );
    setFormData((prev) => ({ ...prev, amount: total.toFixed(2) }));
  };

  const handleCreateMenuSubmit = async () => {
    if (!newMenuData.name || !newMenuData.price || !newMenuData.cost) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: newMenuData.name,
        price: newMenuData.price,
        cost: newMenuData.cost,
        category: newMenuData.category || "Main Course",
        minimumQty: newMenuData.minimumQty || 5,
        currentQty: 0
      };

      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/menu",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMenus((prev) => [...prev, res.data]);
      toast.success("New menu item created!");

      if (pendingMenuIndex !== null) {
        const index = pendingMenuIndex;
        const newMenu = res.data;

        setBillItems((prevItems) => {
          const updated = [...prevItems];
          updated[index].menuId = newMenu._id;
          updated[index].isConfirmed = false;
          if (!updated[index].description) {
            updated[index].description = `${newMenu.name} (Restock)`;
          }
          updated[index].note = `Avail Qty: ${newMenu.currentQty || 0}`;
          return updated;
        });

        setPendingMenuIndex(null);
      }

      setShowCreateMenuModal(false);
      setNewMenuData({
        name: "",
        price: "",
        cost: "",
        category: "Main Course",
        minimumQty: 5
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to create menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierChange = (selectedOption) => {
    setFormData({ ...formData, supplier: selectedOption });
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supplier || !formData.amount || !formData.billNo) {
      toast.warning("Please select supplier, enter amount, and provide bill number");
      return;
    }

    const unconfirmedItems = billItems.filter(
      (item) => item.menuId && !item.isConfirmed
    );
    if (unconfirmedItems.length > 0) {
      toast.error("Please confirm all linked menu items before saving.");
      return;
    }

    const payload = {
      supplier: formData.supplier.value,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      billNo: formData.billNo,
      paymentMethod: formData.paymentMethod,
      billItems: billItems.map(({ isConfirmed, ...rest }) => rest)
    };

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const url = editingId
        ? `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/${editingId}`
        : "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/add";

      const method = editingId ? "put" : "post";

      const res = await axios[method](url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (editingId) {
        const updatedList = expenses.map((exp) =>
          exp._id === editingId ? res.data : exp
        );
        setExpenses(updatedList);
        setEditingId(null);
        toast.success("Expense updated successfully!");
      } else {
        const supplierData = suppliers.find((s) => s._id === payload.supplier);
        const newExpense = {
          _id: res.data._id,
          supplier: supplierData,
          amount: payload.amount,
          description: payload.description,
          date: payload.date,
          billNo: payload.billNo,
          paymentMethod: payload.paymentMethod,
          billItems: payload.billItems
        };
        setExpenses([newExpense, ...expenses]);
        toast.success("Expense added successfully!");
      }

      setFormData({
        supplier: null,
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        billNo: "",
        paymentMethod: "Cash"
      });
      setBillItems([]);
      fetchMenus();
      fetchExpenses();
    } catch (err) {
      console.error("Failed to submit expense:", err.response?.data || err.message);
      toast.error(editingId ? "Failed to update expense" : "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (exp) => {
    setFormData({
      supplier: {
        value: exp.supplier._id,
        label: `${exp.supplier.name} (${exp.supplier.contact})`
      },
      amount: exp.amount,
      description: exp.description,
      date: new Date(exp.date).toISOString().split("T")[0],
      billNo: exp.billNo,
      paymentMethod: exp.paymentMethod || "Cash"
    });

    const existingItems = (exp.billItems || []).map((item) => ({
      ...item,
      isConfirmed: true
    }));

    setBillItems(existingItems);
    setEditingId(exp._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/expense/${deleteId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setExpenses(expenses.filter((exp) => exp._id !== deleteId));
      toast.success("Expense deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete expense");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setDeleteId(null);
      fetchExpenses();
      fetchMenus();
    }
  };

  const supplierOptions = suppliers.map((s) => ({
    value: s._id,
    label: `${s.name} (${s.contact})`
  }));

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "60px",
      borderRadius: "18px",
      background: "#ffffff",
      border: state.isFocused
        ? "1px solid hsla(160, 42%, 40%, 0.55)"
        : "1px solid rgba(15, 23, 42, 0.12)",
      boxShadow: state.isFocused
        ? "0 0 0 4px hsla(160, 40%, 42%, 0.14)"
        : "0 1px 2px rgba(15, 23, 42, 0.04)",
      "&:hover": {
        border: "1px solid hsla(160, 42%, 40%, 0.45)"
      }
    }),
    menu: (base) => ({
      ...base,
      background: "#ffffff",
      border: "1px solid rgba(15, 23, 42, 0.12)",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 12px 40px rgba(15, 23, 42, 0.12)",
      zIndex: 50
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (base) => ({
      ...base,
      padding: "8px"
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: "10px",
      background: state.isSelected
        ? "#2563eb"
        : state.isFocused
          ? "hsla(160, 40%, 42%, 0.12)"
          : "transparent",
      color: state.isSelected ? "#ffffff" : "#0f172a",
      cursor: "pointer"
    }),
    singleValue: (base) => ({
      ...base,
      color: "#0f172a"
    }),
    input: (base) => ({
      ...base,
      color: "#0f172a"
    }),
    placeholder: (base) => ({
      ...base,
      color: "rgba(15, 23, 42, 0.45)"
    }),
    indicatorSeparator: () => ({
      display: "none"
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#64748b"
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#64748b"
    })
  };

  return (
    <div className="expense-page">
      <div className="page-glow glow-1"></div>
      <div className="page-glow glow-2"></div>
      <div className="page-grid"></div>

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Supplier Expense Management</span>
          <h1 className="hero-title">Record Supplier Expense</h1>
          <p className="hero-subtitle">
            Record supplier bills, manage bill items, and track expense records in a
            clean, modern admin interface.
          </p>
        </div>

        <div className="stack-layout">
          <div className="glass-card shared-card-surface form-card">
            <div className="section-header">
              <h2 className="section-title">
                {editingId ? "Update Expense" : "Add Expense"}
              </h2>
              <p className="section-subtitle">
                Enter supplier expense details and keep purchase records organized.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field-block">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="form-control custom-input"
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Select Supplier</label>
                  <Select
                    options={supplierOptions}
                    value={formData.supplier}
                    onChange={handleSupplierChange}
                    placeholder="Search supplier..."
                    isClearable
                    isSearchable
                    styles={selectStyles}
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Bill No</label>
                  <input
                    type="text"
                    name="billNo"
                    value={formData.billNo}
                    onChange={handleChange}
                    placeholder="Enter Bill Number"
                    className="form-control custom-input"
                    required
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Amount ({symbol})</label>
                  <div className="input-wrap">
                    <span className="input-pill">{symbol}</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="e.g., 100"
                      className="form-control custom-input with-prefix"
                      required
                    />
                  </div>
                </div>

                <div className="field-block">
                  <label className="form-label">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="form-select custom-input custom-select"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="field-block field-span-3">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g., Raw materials"
                    className="form-control custom-input"
                  />
                </div>
              </div>

              <div className="bill-items-section">
                <div className="bill-items-header">
                  <div>
                    <h3 className="mini-title">Bill Items</h3>
                    <p className="mini-subtitle">
                      Add individual items and link menu records for restocking.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="table-btn edit-btn"
                    onClick={addBillItem}
                    disabled={loading}
                  >
                    Add Item
                  </button>
                </div>

                {billItems.length > 0 ? (
                  <div className="table-wrap items-wrap">
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Link Menu</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billItems.map((item, index) => {
                          const selectedMenu = menus.find((m) => m._id === item.menuId);
                          const isLinked = !!item.menuId;
                          const showFields = !isLinked || item.isConfirmed;

                          return (
                            <tr key={index}>
                              <td>
                                <input
                                  type="text"
                                  className="form-control inner-input"
                                  placeholder="Item description"
                                  value={item.description}
                                  onChange={(e) =>
                                    updateBillItem(index, "description", e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <div className="item-link-stack">
                                  <CreatableSelect
                                    isClearable
                                    isDisabled={item.isConfirmed || loading}
                                    options={menus.map((m) => ({
                                      value: m._id,
                                      label: m.name
                                    }))}
                                    value={
                                      item.menuId
                                        ? {
                                          value: item.menuId,
                                          label:
                                            menus.find((m) => m._id === item.menuId)
                                              ?.name || "Unknown"
                                        }
                                        : null
                                    }
                                    onChange={(option) =>
                                      updateBillItem(
                                        index,
                                        "menuId",
                                        option ? option.value : ""
                                      )
                                    }
                                    onCreateOption={(inputValue) => {
                                      setNewMenuData({
                                        name: inputValue,
                                        price: "0",
                                        cost: "0",
                                        category: "Main Course",
                                        minimumQty: 5
                                      });
                                      setPendingMenuIndex(index);
                                      setShowCreateMenuModal(true);
                                    }}
                                    placeholder="Select or Create..."
                                    menuPortalTarget={document.body}
                                    styles={selectStyles}
                                    components={makeAnimated()}
                                  />

                                  {selectedMenu && (
                                    <div className="link-meta">
                                      <span>
                                        Stock: <strong>{selectedMenu.currentQty || 0}</strong>
                                      </span>

                                      {!item.isConfirmed ? (
                                        <button
                                          type="button"
                                          className="tiny-btn tiny-confirm"
                                          onClick={() =>
                                            updateBillItem(index, "isConfirmed", true)
                                          }
                                          disabled={loading}
                                        >
                                          Confirm
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          className="tiny-btn tiny-edit"
                                          onClick={() =>
                                            updateBillItem(index, "isConfirmed", false)
                                          }
                                          disabled={loading}
                                        >
                                          Edit
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {isLinked && (
                                    <input
                                      type="text"
                                      className="form-control inner-input muted-note"
                                      value={item.note || ""}
                                      readOnly
                                      placeholder="Stock Note"
                                    />
                                  )}
                                </div>
                              </td>
                              <td>
                                {showFields && (
                                  <input
                                    type="number"
                                    className="form-control inner-input"
                                    placeholder="Qty"
                                    min="0"
                                    step="0.01"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateBillItem(index, "quantity", e.target.value)
                                    }
                                  />
                                )}
                              </td>
                              <td>
                                {showFields && (
                                  <input
                                    type="number"
                                    className="form-control inner-input"
                                    placeholder="Price"
                                    min="0"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={(e) =>
                                      updateBillItem(index, "unitPrice", e.target.value)
                                    }
                                  />
                                )}
                              </td>
                              <td>
                                {showFields && (
                                  <input
                                    type="number"
                                    className="form-control inner-input total-readonly"
                                    value={Number(item.total || 0).toFixed(2)}
                                    readOnly
                                  />
                                )}
                              </td>
                              <td className="text-center">
                                <button
                                  type="button"
                                  className="table-btn delete-btn"
                                  onClick={() => removeBillItem(index)}
                                  disabled={loading}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="4" className="tfoot-label">
                            Total Amount
                          </td>
                          <td className="tfoot-value">
                            {symbol}
                            {formData.amount || "0.00"}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="empty-info-box">
                    No items added yet. Click “Add Item” to add bill items.
                  </div>
                )}
              </div>

              <div className="submit-row expense-submit-row">
                <button
                  type="submit"
                  className="submit-btn expense-submit-btn d-inline-flex align-items-center justify-content-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="me-2 expense-submit-icon expense-submit-icon--spin" aria-hidden />
                      Processing…
                    </>
                  ) : editingId ? (
                    <>
                      <FaSave className="me-2 expense-submit-icon" aria-hidden />
                      Update Expense
                    </>
                  ) : (
                    <>
                      <FaReceipt className="me-2 expense-submit-icon" aria-hidden />
                      Add New Expense
                    </>
                  )}
                </button>
              </div>

              {editingId && (
                <div className="edit-warning">
                  <div>
                    <strong>Edit Mode:</strong> You are currently editing an expense.
                    Make your changes and click “Update Expense”.
                  </div>
                  <button
                    type="button"
                    className="tiny-btn tiny-edit"
                    onClick={() => {
                      setEditingId(null);
                      setBillItems([]);
                      setFormData({
                        supplier: null,
                        amount: "",
                        description: "",
                        date: new Date().toISOString().split("T")[0],
                        billNo: "",
                        paymentMethod: "Cash"
                      });
                    }}
                    disabled={loading}
                  >
                    Cancel Edit
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="glass-card shared-card-surface table-card">
            <div className="section-header">
              <h2 className="section-title">Recent Expenses</h2>
              <p className="section-subtitle">
                View and manage your latest supplier expense records.
              </p>
            </div>

            <div className="table-wrap">
              <table className="expense-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Bill No</th>
                    <th>Supplier</th>
                    <th>Description</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-row">
                        No expenses found
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp, idx) => (
                      <React.Fragment key={exp._id || idx}>
                        <tr>
                          <td>{new Date(exp.date).toLocaleDateString()}</td>
                          <td>
                            <strong>{exp.billNo}</strong>
                          </td>
                          <td>
                            {exp.supplier?.name || "Unknown"} (
                            {exp.supplier?.contact || "-"})
                          </td>
                          <td>{exp.description || "-"}</td>
                          <td className="text-center">
                            {exp.billItems && exp.billItems.length > 0 ? (
                              <span
                                className="item-badge"
                                onClick={() => toggleBillItems(exp._id)}
                                title={
                                  expandedExpenses.has(exp._id)
                                    ? "Click to hide items"
                                    : "Click to view items"
                                }
                              >
                                {exp.billItems.length}{" "}
                                {expandedExpenses.has(exp._id) ? "▼" : "▶"}
                              </span>
                            ) : (
                              <span className="text-muted-lite">-</span>
                            )}
                          </td>
                          <td>
                            {symbol}
                            {parseFloat(exp.amount).toFixed(2)}
                          </td>
                          <td>{exp.paymentMethod || "Cash"}</td>
                          <td className="text-center action-cell">
                            <button
                              className="table-btn edit-btn"
                              onClick={() => openEditModal(exp)}
                              disabled={loading}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className="table-btn delete-btn"
                              onClick={() => confirmDelete(exp._id)}
                              disabled={loading}
                              type="button"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>

                        {exp.billItems &&
                          exp.billItems.length > 0 &&
                          expandedExpenses.has(exp._id) && (
                            <tr className="expanded-row">
                              <td colSpan="8">
                                <div className="expanded-box">
                                  <strong className="expanded-title">Bill Items</strong>
                                  <table className="nested-table">
                                    <thead>
                                      <tr>
                                        <th>Description</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {exp.billItems.map((item, itemIdx) => (
                                        <tr key={itemIdx}>
                                          <td>{item.description}</td>
                                          <td>{item.quantity}</td>
                                          <td>
                                            {symbol}
                                            {parseFloat(item.unitPrice).toFixed(2)}
                                          </td>
                                          <td>
                                            {symbol}
                                            {parseFloat(item.total).toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box shared-card-surface small-modal">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowConfirmModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-text">
                Are you sure you want to delete this expense?
              </p>
              <div className="modal-actions">
                <button
                  className="table-btn edit-btn flex-btn"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="table-btn delete-btn flex-btn"
                  onClick={handleDelete}
                  disabled={loading}
                  type="button"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateMenuModal && (
        <div className="modal-overlay">
          <div className="modal-box shared-card-surface">
            <div className="modal-header">
              <h5 className="modal-title">Create New Menu Item</h5>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowCreateMenuModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-form-grid">
                <div className="field-block field-full">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control custom-input"
                    value={newMenuData.name}
                    onChange={(e) =>
                      setNewMenuData({ ...newMenuData, name: e.target.value })
                    }
                    placeholder="Menu item name"
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    className="form-control custom-input"
                    value={newMenuData.price}
                    onChange={(e) =>
                      setNewMenuData({ ...newMenuData, price: e.target.value })
                    }
                    min="0"
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Cost</label>
                  <input
                    type="number"
                    className="form-control custom-input"
                    value={newMenuData.cost}
                    onChange={(e) =>
                      setNewMenuData({ ...newMenuData, cost: e.target.value })
                    }
                    min="0"
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Category</label>
                  <CreatableSelect
                    isClearable
                    onChange={(option) =>
                      setNewMenuData({
                        ...newMenuData,
                        category: option ? option.value : ""
                      })
                    }
                    onCreateOption={(inputValue) => {
                      setNewMenuData({ ...newMenuData, category: inputValue });
                    }}
                    options={[...new Set(menus.map((m) => m.category).filter(Boolean))].map(
                      (c) => ({ value: c, label: c })
                    )}
                    value={
                      newMenuData.category
                        ? {
                          value: newMenuData.category,
                          label: newMenuData.category
                        }
                        : null
                    }
                    placeholder="Select or Create..."
                    menuPortalTarget={document.body}
                    styles={selectStyles}
                    components={makeAnimated()}
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Minimum Qty</label>
                  <input
                    type="number"
                    className="form-control custom-input"
                    value={newMenuData.minimumQty}
                    onChange={(e) =>
                      setNewMenuData({
                        ...newMenuData,
                        minimumQty: e.target.value
                      })
                    }
                    min="0"
                  />
                </div>
              </div>

              <div className="modal-actions create-actions">
                <button
                  className="table-btn edit-btn flex-btn"
                  onClick={() => setShowCreateMenuModal(false)}
                  disabled={loading}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="submit-btn flex-btn"
                  onClick={handleCreateMenuSubmit}
                  disabled={loading}
                  type="button"
                >
                  {loading ? "Creating..." : "Create Menu Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} />

      <style>{`
        .expense-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          // background: linear-gradient(160deg, #f6faf9 0%, #f1f5ff 42%, #eef8f6 100%);
          padding: 28px 24px 34px;
        }

        // .expense-page .page-grid {
        //   position: absolute;
        //   inset: 0;
        //   background-image:
        //     linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px),
        //     linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px);
        //   background-size: 44px 44px;
        //   pointer-events: none;
        //   mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.12));
        // }

        .expense-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.35;
          pointer-events: none;
        }

        .expense-page .glow-1 {
          width: 300px;
          height: 300px;
          top: -80px;
          left: -60px;
          background: hsla(160, 42%, 42%, 0.2);
        }

        .expense-page .glow-2 {
          width: 340px;
          height: 340px;
          right: -80px;
          bottom: -80px;
          background: rgba(59, 130, 246, 0.16);
        }

        .expense-page .page-shell {
          width: calc(100% - 80px);
          max-width: none;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .expense-page .shared-card-surface {
          border-radius: 30px;
          border: 1px solid rgba(15, 23, 42, 0.08) !important;
          background: #ffffff !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow:
            0 18px 50px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
        }

        .expense-page .hero-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .expense-page .hero-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #166534;
          background: hsla(160, 40%, 42%, 0.14);
          border: 1px solid hsla(160, 42%, 40%, 0.22);
        }

        .expense-page .hero-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .expense-page .hero-subtitle {
          margin: 0;
          color: rgba(15, 23, 42, 0.62);
          font-size: 15px;
          line-height: 1.7;
          max-width: 760px;
        }

        .expense-page .stack-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .expense-page .glass-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .expense-page .form-card,
        .expense-page .table-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}

        .expense-page .section-header {
          margin-bottom: 22px;
        }

        .expense-page .section-title {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .expense-page .section-subtitle {
          margin: 0;
          color: rgba(15, 23, 42, 0.6);
          font-size: 14px;
          line-height: 1.7;
        }

        .expense-page .form-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .expense-page .modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .expense-page .field-block {
          min-width: 0;
        }

        .expense-page .field-full {
          grid-column: 1 / -1;
        }

        .expense-page .field-span-3 {
          grid-column: span 3;
        }

        .expense-page .form-label {
          display: block;
          margin-bottom: 10px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 700;
        }

        .expense-page .input-wrap {
          position: relative;
        }

        .expense-page .input-pill {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          z-index: 2;
          box-shadow: 0 12px 20px rgba(34, 197, 94, 0.24);
        }

        .expense-page .with-prefix {
          padding-left: 58px !important;
        }

        .expense-page .custom-input,
        .expense-page .inner-input {
          width: 100%;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          font-size: 15px;
          padding: 0 16px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .expense-page .custom-input {
          height: 60px;
        }

        .expense-page .inner-input {
          min-height: 42px;
          padding: 10px 12px;
          font-size: 13px;
          border-radius: 14px;
        }

        .expense-page .custom-input:focus,
        .expense-page .inner-input:focus {
          background: #ffffff;
          color: #0f172a;
          border-color: hsla(160, 42%, 40%, 0.55);
          box-shadow: 0 0 0 4px hsla(160, 40%, 42%, 0.14) !important;
        }

        .expense-page .custom-input::placeholder,
        .expense-page .inner-input::placeholder {
          color: rgba(15, 23, 42, 0.42);
        }

        .expense-page .custom-select {
          appearance: none;
        }

        .expense-page .bill-items-section {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
        }

        .expense-page .bill-items-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .expense-page .mini-title {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: 20px;
          font-weight: 800;
        }

        .expense-page .mini-subtitle {
          margin: 0;
          color: rgba(15, 23, 42, 0.55);
          font-size: 13px;
        }

        .expense-page .items-wrap {
          margin-bottom: 18px;
        }

        .expense-page .items-table,
        .expense-page .expense-table,
        .expense-page .nested-table {
          width: 100%;
          border-collapse: collapse;
        }

        .expense-page .items-table {
          min-width: 1100px;
        }

        .expense-page .expense-table {
          min-width: 1200px;
        }

        .expense-page .nested-table {
          min-width: 700px;
          margin-top: 12px;
        }

        .expense-page .items-table thead tr,
        .expense-page .expense-table thead tr,
        .expense-page .nested-table thead tr {
          background: #f1f5f9;
        }

        .expense-page .items-table th,
        .expense-page .expense-table th,
        .expense-page .nested-table th {
          padding: 16px 18px;
          text-align: left;
          color: #475569;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .expense-page .items-table td,
        .expense-page .expense-table td,
        .expense-page .nested-table td {
          padding: 16px 18px;
          color: #334155;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          vertical-align: top;
          background: #ffffff;
        }

        .expense-page .items-table tbody tr:hover td,
        .expense-page .expense-table tbody tr:hover td,
        .expense-page .nested-table tbody tr:hover td {
          background: #f8fafc;
        }

        .expense-page .table-wrap {
          overflow-x: auto;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
        }

        .expense-page .item-link-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 240px;
        }

        .expense-page .link-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: #64748b;
        }

        .expense-page .tiny-btn {
          border: none;
          border-radius: 10px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 800;
          color: #ffffff;
        }

        .expense-page .tiny-confirm {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }

        .expense-page .tiny-edit {
          background: #f1f5f9;
          color: #0f172a;
          border: 1px solid rgba(15, 23, 42, 0.1);
        }

        .expense-page .muted-note {
          font-style: italic;
          color: #94a3b8 !important;
        }

        .expense-page .total-readonly {
          background: #f1f5f9;
        }

        .expense-page .tfoot-label,
        .expense-page .tfoot-value {
          font-weight: 800;
          color: #0f172a;
          background: #f8fafc;
        }

        .expense-page .empty-info-box {
          border-radius: 18px;
          border: 1px dashed rgba(15, 23, 42, 0.2);
          background: #f8fafc;
          padding: 18px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        .expense-page .submit-row {
          margin-top: 18px;
        }

        .expense-page .expense-submit-row {
          display: flex;
          justify-content: center;
        }

        .expense-page .submit-btn.expense-submit-btn {
          width: auto !important;
          min-width: min(100%, 280px);
          min-height: 58px;
          height: auto;
          padding: 16px 40px;
          font-size: 1.05rem;
          letter-spacing: 0.03em;
          border-radius: 18px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            0 3px 0 rgba(5, 46, 22, 0.14),
            0 14px 32px rgba(22, 163, 74, 0.32);
        }

        .expense-page .expense-submit-icon {
          font-size: 1.15rem;
        }

        .expense-page .expense-submit-icon--spin {
          animation: expense-submit-spin 0.85s linear infinite;
        }

        @keyframes expense-submit-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .expense-page .expense-submit-btn:hover:not(:disabled) {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            0 4px 0 rgba(5, 46, 22, 0.12),
            0 18px 42px rgba(22, 163, 74, 0.38);
        }

        .expense-page .submit-btn,
        .expense-page .danger-btn,
        .expense-page .table-btn {
          border: none;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .expense-page .submit-btn {
          height: 60px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 16px 32px rgba(34, 197, 94, 0.22);
        }

        .expense-page .submit-btn:hover,
        .expense-page .danger-btn:hover,
        .expense-page .table-btn:hover {
          transform: translateY(-2px);
        }

        .expense-page .table-btn {
          padding: 10px 14px;
          margin: 0 4px;
        }

        .expense-page .edit-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 10px 22px rgba(37, 99, 235, 0.22);
        }

        .expense-page .delete-btn,
        .expense-page .danger-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 10px 22px rgba(239, 68, 68, 0.22);
        }

        .expense-page .action-cell {
          white-space: nowrap;
        }

        .expense-page .item-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          user-select: none;
        }

        .expense-page tr.expanded-row td {
          background: #f8fafc !important;
        }

        .expense-page .expanded-box {
          padding: 8px 2px;
        }

        .expense-page .expanded-title {
          color: #475569;
          display: inline-block;
          margin-bottom: 8px;
        }

        .expense-page .text-muted-lite {
          color: #94a3b8;
        }

        .expense-page .empty-row {
          text-align: center;
          color: #94a3b8 !important;
          padding: 34px !important;
          background: #ffffff !important;
        }

        .expense-page .edit-warning {
          margin-top: 16px;
          border-radius: 18px;
          border: 1px solid rgba(245, 158, 11, 0.35);
          background: hsla(38, 92%, 50%, 0.1);
          color: #a16207;
          padding: 16px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
        }

        .expense-page .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 16px;
        }

        .expense-page .modal-box {
          width: 100%;
          max-width: 780px;
          overflow: hidden;
        }

        .expense-page .small-modal {
          max-width: 420px;
        }

        .expense-page .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .expense-page .modal-title {
          margin: 0;
          color: #0f172a;
          font-size: 22px;
          font-weight: 800;
        }

        .expense-page .modal-close {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 12px;
          background: #f1f5f9;
          color: #334155;
          font-size: 24px;
          line-height: 1;
        }

        .expense-page .modal-body {
          padding: 24px;
        }

        .expense-page .modal-text {
          color: #475569;
          margin: 0 0 18px;
          line-height: 1.6;
        }

        .expense-page .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 18px;
        }

        .expense-page .create-actions {
          margin-top: 22px;
        }

        .expense-page .flex-btn {
          flex: 1;
          height: 56px;
        }

        @media (max-width: 1100px) {
          .expense-page .form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .expense-page .field-span-3 {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 768px) {
          .expense-page .page-shell {
            width: calc(100% - 24px);
          }

          .expense-page {
            padding: 18px 12px;
          }

          .expense-page .hero-card,
          .expense-page .glass-card,
          .expense-page .modal-body {
            padding: 20px;
          }

          .expense-page .form-grid,
          .expense-page .modal-form-grid {
            grid-template-columns: 1fr;
          }

          .expense-page .field-full,
          .expense-page .field-span-3 {
            grid-column: auto;
          }

          .expense-page .section-title {
            font-size: 24px;
          }

          .expense-page .bill-items-header,
          .expense-page .edit-warning,
          .expense-page .modal-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default ExpensePage;