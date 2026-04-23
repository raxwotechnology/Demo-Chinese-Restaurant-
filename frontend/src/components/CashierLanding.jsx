import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import PaymentModal from "./PaymentModal";
import ReceiptModal from "./ReceiptModal";
import "react-toastify/dist/ReactToastify.css";
import makeAnimated from "react-select/animated";
import Select from "react-select";

const CashierLanding = () => {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    phone: "",
    name: "",
    orderType: "takeaway",
    tableNo: "",
    deliveryType: "Customer Pickup",
    deliveryPlaceId: "",
    deliveryNote: ""
  });

  const [receiptOrder, setReceiptOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [serviceChargeSettings, setServiceChargeSettings] = useState({
    dineInCharge: 0,
    isActive: false
  });
  const [deliveryPlaces, setDeliveryPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [sizeFilter, setSizeFilter] = useState("");
  const [menuPopularity, setMenuPopularity] = useState({});
  const [numberPadTarget, setNumberPadTarget] = useState(null);
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [waiters, setWaiters] = useState([]);
  const [selectedWaiterId, setSelectedWaiterId] = useState("");
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [tempStock, setTempStock] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitLock, setSubmitLock] = useState(false);

  const navigate = useNavigate();
  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchMenus();
    fetchServiceCharge();
    fetchDeliveryPlaces();
    fetchOrdersAndComputePopularity();
    fetchWaiters();
  }, []);

  useEffect(() => {
    if (!customer.phone) return;

    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/customer",
          {
            params: { phone: customer.phone },
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (res.data?.name && !customer.name) {
          setCustomer((prev) => ({ ...prev, name: res.data.name }));
        }
      } catch (err) {
        console.error("Auto-fill failed:", err.message);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [customer.phone, customer.name]);

  const fetchWaiters = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/employees",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const waiterList = res.data.filter(
        (emp) =>
          emp.role?.toLowerCase() === "waiter" ||
          emp.position?.toLowerCase() === "waiter"
      );

      setWaiters(waiterList);
    } catch (err) {
      console.error("Failed to load waiters:", err.message);
      toast.error("Could not load waiters");
    }
  };

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

      const uniqueCategories = [
        ...new Set(res.data.map((menu) => menu.category).filter(Boolean))
      ];
      setCategories(uniqueCategories);

      const initialTempStock = {};
      res.data.forEach((menu) => {
        initialTempStock[menu._id] = menu.currentQty || 0;
      });
      setTempStock(initialTempStock);

      setLoadingCategories(false);
    } catch (err) {
      console.error("Failed to load menus:", err.message);
      setLoadingCategories(false);
    }
  };

  const fetchOrdersAndComputePopularity = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/orders?limit=500",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const orders = res.data.orders || res.data;
      const popularityMap = {};

      orders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            if (item.name) {
              popularityMap[item.name] = (popularityMap[item.name] || 0) + item.quantity;
            }
          });
        }
      });

      setMenuPopularity(popularityMap);
    } catch (err) {
      console.error("Failed to load order history for sorting:", err.message);
    }
  };

  const fetchServiceCharge = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/admin/service-charge",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { dineInCharge, isActive } = res.data;
      setServiceChargeSettings({
        dineInCharge,
        isActive: isActive === true || isActive === "true"
      });
    } catch (err) {
      console.error(
        "Failed to load service charge:",
        err.response?.data || err.message
      );
    }
  };

  const fetchDeliveryPlaces = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/delivery-charges",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setDeliveryPlaces(res.data);
    } catch (err) {
      console.error("Failed to load delivery places:", err.message);
      toast.error("Failed to load delivery zones");
    }
  };

  const handleOrderTypeChange = (e) => {
    const newType = e.target.value;

    setCustomer((prev) => {
      const updated = { ...prev, orderType: newType };

      if (newType === "table") {
        updated.deliveryType = "";
        updated.deliveryPlaceId = "";
        updated.deliveryNote = "";
      } else if (newType === "takeaway") {
        updated.tableNo = "";
      }

      return updated;
    });

    if (newType !== "table") {
      setSelectedWaiterId("");
    }
  };

  const handlePhoneChange = async (value) => {
    const digits = value.replace(/\D/g, "");
    setCustomer((prev) => ({ ...prev, phone: digits, name: prev.name || "" }));
    setCustomerSearchResults([]);

    if (digits.length >= 2) {
      setIsSearching(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/customers-search",
          {
            params: { q: digits },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setCustomerSearchResults(res.data || []);
      } catch (err) {
        console.error("Customer search failed:", err);
        toast.error("Search failed");
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleNumberPadInput = (value) => {
    if (!numberPadTarget) return;

    if (numberPadTarget === "phone") {
      const newPhone = (customer.phone || "") + value;
      handlePhoneChange(newPhone);
    } else if (numberPadTarget === "tableNo") {
      setCustomer((prev) => ({
        ...prev,
        tableNo: (prev.tableNo || "") + value
      }));
    } else if (numberPadTarget === "quantity") {
      setItemQuantity((prev) => {
        const next = parseInt(`${prev}${value}`, 10) || 0;
        const max = selectedMenuItem ? tempStock[selectedMenuItem._id] || 0 : 0;
        if (next > max) {
          toast.warn(`Only ${max} available for "${selectedMenuItem?.name}"`);
          return prev;
        }
        return next;
      });
    }
  };

  const handleBackspace = () => {
    if (!numberPadTarget) return;

    if (numberPadTarget === "phone") {
      const newPhone = (customer.phone || "").slice(0, -1);
      handlePhoneChange(newPhone);
    } else if (numberPadTarget === "tableNo") {
      setCustomer((prev) => ({
        ...prev,
        tableNo: (prev.tableNo || "").slice(0, -1)
      }));
    } else if (numberPadTarget === "quantity") {
      setItemQuantity((prev) => {
        const str = prev.toString();
        if (str.length <= 1) return 1;
        return parseInt(str.slice(0, -1), 10) || 1;
      });
    }
  };

  const cleanMenuName = (name) => {
    if (!name) return "";
    const match = name.match(/^[^a-zA-Z]*([a-zA-Z].*)/);
    return match ? match[1] : name;
  };

  const addToCart = (menu) => {
    const { _id, quantity = 1 } = menu;
    const available = tempStock[_id] || 0;

    if (quantity > available) {
      toast.warn(`Only ${available} of "${menu.name}" available!`);
      return;
    }

    const cleanedName = cleanMenuName(menu.name);
    const existing = cart.find((item) => item._id === menu._id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item._id === _id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...menu, name: cleanedName, quantity }]);
    }

    setTempStock((prev) => ({
      ...prev,
      [_id]: (prev[_id] || 0) - quantity
    }));
  };

  const removeFromCart = (menu) => {
    const existing = cart.find((item) => item._id === menu._id);
    if (!existing) return;

    let newCart;
    if (existing.quantity <= 1) {
      newCart = cart.filter((item) => item._id !== menu._id);
    } else {
      newCart = cart
        .map((item) =>
          item._id === menu._id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);
    }

    setCart(newCart);

    setTempStock((prev) => ({
      ...prev,
      [menu._id]: (prev[menu._id] || 0) + 1
    }));
  };

  const goToPayment = () => {
    const {
      phone,
      name,
      orderType,
      tableNo,
      deliveryType,
      deliveryPlaceId
    } = customer;

    if (!phone.trim()) {
      toast.warn("Phone number is required");
      return;
    }

    if (!name.trim()) {
      toast.warn("Customer name is required");
      return;
    }

    if (cart.length === 0) {
      toast.warn("Please add at least one item to the order");
      return;
    }

    if (orderType === "table") {
      if (!tableNo.trim()) {
        toast.warn("Table number is required for Dine-In orders");
        return;
      }
      if (!selectedWaiterId) {
        toast.warn("Please assign a waiter for Dine-In orders");
        return;
      }
    }

    if (orderType === "takeaway") {
      if (!deliveryType) {
        toast.warn("Please select a Delivery Type");
        return;
      }

      if (deliveryType === "Delivery Service" && !deliveryPlaceId) {
        toast.warn("Please select a Delivery Place");
        return;
      }
    }

    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let serviceCharge = 0;
    let deliveryCharge = 0;
    let finalTotal = subtotal;

    if (customer.orderType === "table" && serviceChargeSettings.isActive) {
      serviceCharge = subtotal * (serviceChargeSettings.dineInCharge / 100);
      finalTotal += serviceCharge;
    }

    if (
      customer.orderType === "takeaway" &&
      customer.deliveryType === "Delivery Service" &&
      selectedDeliveryPlace
    ) {
      deliveryCharge = selectedDeliveryPlace.charge;
      finalTotal += deliveryCharge;
    }

    setOrderData({
      customerName: name,
      customerPhone: phone,
      tableNo: customer.orderType === "takeaway" ? "Takeaway" : customer.tableNo,
      items: cart.map((item) => ({
        menuId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      })),
      subtotal,
      serviceCharge,
      deliveryType: customer.orderType === "takeaway" ? customer.deliveryType : null,
      deliveryCharge,
      totalPrice: finalTotal
    });

    setShowPaymentModal(true);
  };

  const submitConfirmedOrder = async (paymentData) => {
    if (submitLock) return;

    setSubmitLock(true);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const now = new Date();

      const timestamp = `${now.getFullYear()}${String(
        now.getMonth() + 1
      ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(
        now.getHours()
      ).padStart(2, "0")}${String(now.getMinutes()).padStart(
        2,
        "0"
      )}${String(now.getSeconds()).padStart(2, "0")}`;

      const invoiceNo = `INV-${timestamp}`;

      const payload = {
        ...customer,
        invoiceNo,
        waiterId: customer.orderType === "table" ? selectedWaiterId : null,
        deliveryPlaceId: selectedDeliveryPlace?._id,
        deliveryPlaceName: selectedDeliveryPlace?.placeName || null,
        deliveryCharge,
        ...orderData,
        payment: {
          cash: paymentData.cash,
          card: paymentData.card,
          bankTransfer: paymentData.bankTransfer,
          totalPaid: paymentData.totalPaid,
          changeDue: paymentData.changeDue,
          notes: paymentData.notes
        }
      };

      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/order",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setReceiptOrder(res.data);
      setCustomer({
        phone: "",
        name: "",
        orderType: "takeaway",
        tableNo: "",
        deliveryType: "Customer Pickup",
        deliveryPlaceId: "",
        deliveryNote: ""
      });
      setSelectedWaiterId("");
      setCart([]);
      setSelectedMenuItem(null);
      setItemQuantity(1);
      fetchMenus();
      setShowPaymentModal(false);
      toast.success("Order placed successfully!");
    } catch (err) {
      console.error("Order failed:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || "Failed to place order";

      if (err.response?.status === 409) {
        toast.error(`⚠️ ${errorMsg}`);
      } else {
        toast.error(`❌ ${errorMsg}`);
      }
    } finally {
      setIsSubmitting(false);
      setSubmitLock(false);
    }
  };

  const filteredMenus = menus
    .filter((menu) => {
      const matchesSearch = menu.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || menu.category === selectedCategory;

      let matchesSize = true;
      if (sizeFilter) {
        const parts = menu.name
          ? menu.name
              .split(/\s*-\s*/)
              .map((part) => part.trim())
              .filter(Boolean)
          : [];
        const suffix = parts[parts.length - 1];
        matchesSize = suffix === sizeFilter;
      }

      return matchesSearch && matchesCategory && matchesSize;
    })
    .sort((a, b) => {
      const countA = menuPopularity[a.name] || 0;
      const countB = menuPopularity[b.name] || 0;
      return countB - countA;
    });

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const serviceCharge =
    customer.orderType === "table" && serviceChargeSettings.isActive
      ? subtotal * (serviceChargeSettings.dineInCharge / 100)
      : 0;

  const selectedDeliveryPlace = deliveryPlaces.find(
    (place) => place._id === customer.deliveryPlaceId
  );

  const deliveryCharge =
    customer.orderType === "takeaway" &&
    customer.deliveryType === "Delivery Service" &&
    selectedDeliveryPlace
      ? selectedDeliveryPlace.charge
      : 0;

  const finalTotal = subtotal + serviceCharge + deliveryCharge;

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "58px",
      borderRadius: "18px",
      background: "#ffffff",
      border: state.isFocused
        ? "1px solid hsla(160, 42%, 40%, 0.55)"
        : "1px solid rgba(15, 23, 42, 0.12)",
      boxShadow: state.isFocused
        ? "0 0 0 4px hsla(160, 40%, 42%, 0.14)"
        : "0 1px 2px rgba(15, 23, 42, 0.04)"
    }),
    menu: (base) => ({
      ...base,
      background: "#ffffff",
      border: "1px solid rgba(15, 23, 42, 0.1)",
      borderRadius: "16px",
      overflow: "hidden",
      zIndex: 50,
      boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)"
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected
        ? "hsla(160, 40%, 42%, 0.16)"
        : state.isFocused
          ? "hsla(160, 35%, 45%, 0.1)"
          : "transparent",
      color: "#0f172a",
      cursor: "pointer"
    }),
    singleValue: (base) => ({ ...base, color: "#0f172a" }),
    input: (base) => ({ ...base, color: "#0f172a" }),
    placeholder: (base) => ({ ...base, color: "rgba(15, 23, 42, 0.45)" }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({ ...base, color: "#64748b" }),
    clearIndicator: (base) => ({ ...base, color: "#64748b" })
  };

  return (
    <div className="cashier-page">
      <div className="page-glow glow-1"></div>
      <div className="page-glow glow-2"></div>
      <div className="page-grid"></div>

      <div className="page-shell">
        <div className="hero-card shared-card-surface">
          <span className="hero-badge">Cashier Order Management</span>
          <h1 className="hero-title">Create New Order</h1>
          <p className="hero-subtitle">
            Manage customer details, build orders, assign tables or delivery, and complete checkout in one modern cashier dashboard.
          </p>
        </div>

        <div className="cashier-panels-stack">
          {showNumberPad && (
            <div className="glass-card shared-card-surface cashier-hero-panel numberpad-card">
              <span className="hero-badge">Numeric entry</span>
              <div className="cashier-panel-head-row">
                <div>
                  <h2 className="hero-title cashier-panel-title">
                    Enter{" "}
                    {numberPadTarget === "phone"
                      ? "phone number"
                      : numberPadTarget === "quantity"
                        ? "quantity"
                        : "table number"}
                  </h2>
                  <p className="hero-subtitle cashier-panel-lede">
                    Tap digits on the keypad, use backspace to correct, then Done.
                  </p>
                </div>
                <button
                  className="mini-close-btn"
                  onClick={() => setShowNumberPad(false)}
                  type="button"
                  aria-label="Close keypad"
                >
                  ✕
                </button>
              </div>
              <div className="cashier-panel-body">
                <div className="numberpad-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      className="number-btn"
                      onClick={() => handleNumberPadInput(num.toString())}
                      type="button"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    className="number-btn"
                    onClick={() => handleNumberPadInput("0")}
                    type="button"
                  >
                    0
                  </button>
                  <button className="number-btn" onClick={handleBackspace} type="button">
                    ⌫
                  </button>
                  <button
                    className="done-btn"
                    onClick={() => setShowNumberPad(false)}
                    type="button"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card shared-card-surface cashier-hero-panel">
            <span className="hero-badge">Customer</span>
            <h2 className="hero-title cashier-panel-title">Customer Details</h2>
            <p
  className="hero-subtitle cashier-panel-lede"
  style={{ textAlign: "center", margin: "0 auto" }}
>
  Enter customer details, order type, and delivery or table information.
</p>

            <div className="cashier-panel-body">
              <div className="form-grid form-grid-4">
                <div className="field-block search-field-wrap">
                  <label className="form-label">Phone *</label>
                  <input
                    type="text"
                    value={customer.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onFocus={() => {
                      setNumberPadTarget("phone");
                      setShowNumberPad(true);
                    }}
                    className="custom-input"
                    placeholder="Type phone..."
                  />

                  {customerSearchResults.length > 0 && (
                    <ul className="search-results-list">
                      {customerSearchResults.map((cust) => (
                        <li
                          key={cust._id || cust.phone}
                          className="search-result-item"
                          onClick={() => {
                            setCustomer({
                              ...customer,
                              phone: cust.phone,
                              name: cust.name || ""
                            });
                            setCustomerSearchResults([]);
                          }}
                        >
                          {cust.name ? `${cust.name} (${cust.phone})` : cust.phone}
                        </li>
                      ))}
                    </ul>
                  )}

                  {isSearching && <div className="helper-text">Searching...</div>}
                </div>

                <div className="field-block">
                  <label className="form-label">Name *</label>
                  <input
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        name: e.target.value
                      })
                    }
                    className="custom-input"
                    placeholder="John Doe"
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Order Type</label>
                  <select
                    value={customer.orderType}
                    onChange={handleOrderTypeChange}
                    className="custom-input custom-select"
                  >
                    <option value="table">Dine In</option>
                    <option value="takeaway">Takeaway</option>
                  </select>
                </div>

                {customer.orderType === "table" && (
                  <div className="field-block">
                    <label className="form-label">Table No</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customer.tableNo}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setCustomer({ ...customer, tableNo: val });
                      }}
                      onFocus={() => {
                        setNumberPadTarget("tableNo");
                        setShowNumberPad(true);
                      }}
                      className="custom-input"
                      placeholder="-"
                    />
                  </div>
                )}

                {customer.orderType === "table" && (
                  <div className="field-block">
                    <label className="form-label">Assign Waiter *</label>
                    <select
                      value={selectedWaiterId}
                      onChange={(e) => setSelectedWaiterId(e.target.value)}
                      className="custom-input custom-select"
                    >
                      <option value="">Select a waiter</option>
                      {waiters.map((waiter) => (
                        <option key={waiter._id} value={waiter._id}>
                          {waiter.name || waiter.fullName || waiter._id}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {customer.orderType === "takeaway" && (
                  <div className="field-block">
                    <label className="form-label">Delivery Type</label>
                    <select
                      value={customer.deliveryType}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          deliveryType: e.target.value
                        })
                      }
                      className="custom-input custom-select"
                    >
                      <option value="">Select an option</option>
                      <option value="Customer Pickup">Customer Pickup</option>
                      <option value="Delivery Service">Delivery Service</option>
                    </select>
                  </div>
                )}

                {customer.orderType === "takeaway" &&
                  customer.deliveryType === "Delivery Service" && (
                    <>
                      <div className="field-block field-full">
                        <label className="form-label">Delivery Address or Note</label>
                        <textarea
                          value={customer.deliveryNote || ""}
                          onChange={(e) =>
                            setCustomer({
                              ...customer,
                              deliveryNote: e.target.value
                            })
                          }
                          rows="3"
                          className="custom-input custom-textarea"
                          placeholder="Enter delivery address or instructions"
                        ></textarea>
                      </div>

                      <div className="field-block field-span-2">
                        <label className="form-label">Delivery Place *</label>
                        <Select
                          name="deliveryPlaceId"
                          value={
                            customer.deliveryPlaceId
                              ? deliveryPlaces.find(
                                  (place) => place._id === customer.deliveryPlaceId
                                )
                                ? {
                                    value: customer.deliveryPlaceId,
                                    label: `${deliveryPlaces.find(
                                      (p) => p._id === customer.deliveryPlaceId
                                    ).placeName} (${symbol}${deliveryPlaces
                                      .find((p) => p._id === customer.deliveryPlaceId)
                                      .charge.toFixed(2)})`
                                  }
                                : null
                              : null
                          }
                          onChange={async (selectedOption) => {
                            if (
                              selectedOption &&
                              selectedOption.value === "__CREATE_NEW__"
                            ) {
                              const placeName = prompt("Enter new delivery place name:");
                              if (!placeName || !placeName.trim()) return;

                              const chargeStr = prompt(
                                `Enter delivery charge for "${placeName}" (e.g., 5.99):`
                              );
                              const charge = parseFloat(chargeStr);

                              if (isNaN(charge) || charge < 0) {
                                toast.error("Invalid delivery charge");
                                return;
                              }

                              try {
                                const token = localStorage.getItem("token");
                                const res = await axios.post(
                                  "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/delivery-charges",
                                  { placeName: placeName.trim(), charge },
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`
                                    }
                                  }
                                );

                                const newPlace = res.data;

                                setDeliveryPlaces((prev) => [...prev, newPlace]);

                                setCustomer((prev) => ({
                                  ...prev,
                                  deliveryPlaceId: newPlace._id
                                }));

                                toast.success(
                                  `"${placeName}" added with charge ${symbol}${charge.toFixed(2)}`
                                );
                              } catch (err) {
                                console.error("Failed to create delivery place:", err);
                                toast.error("Failed to save new delivery place");
                              }
                            } else {
                              setCustomer((prev) => ({
                                ...prev,
                                deliveryPlaceId: selectedOption ? selectedOption.value : ""
                              }));
                            }
                          }}
                          options={[
                            {
                              value: "__CREATE_NEW__",
                              label: "➕ Create New Delivery Place..."
                            },
                            ...deliveryPlaces.map((place) => ({
                              value: place._id,
                              label: `${place.placeName} (${symbol}${place.charge.toFixed(
                                2
                              )})`
                            }))
                          ]}
                          placeholder="Select a delivery zone..."
                          isClearable
                          isSearchable
                          styles={selectStyles}
                          components={makeAnimated()}
                          menuPortalTarget={document.body}
                        />
                      </div>
                    </>
                  )}
              </div>
            </div>
          </div>

          <div className="glass-card shared-card-surface cashier-hero-panel">
            <span className="hero-badge">Quick add</span>
            <h2 className="hero-title cashier-panel-title">Quick Add Menu Item</h2>
            <p
  className="hero-subtitle cashier-panel-lede"
  style={{ textAlign: "center", margin: "0 auto" }}
>
  Search one item and add it directly with quantity.
</p>


            <div className="cashier-panel-body">
              <div className="form-grid quick-add-grid">
                <div className="field-block field-span-2">
                  <label className="form-label">Select Menu Item</label>
                  <Select
                    options={menus
                      .filter((menu) => (tempStock[menu._id] || 0) > 0)
                      .map((menu) => ({
                        ...menu,
                        value: menu._id,
                        label: `${menu.name} (${symbol}${menu.price.toFixed(
                          2
                        )}) — Stock: ${tempStock[menu._id]}`
                      }))}
                    value={selectedMenuItem}
                    onChange={setSelectedMenuItem}
                    placeholder="Search menu items..."
                    isClearable
                    isSearchable
                    noOptionsMessage={() => "No in-stock items"}
                    styles={selectStyles}
                    components={makeAnimated()}
                    menuPortalTarget={document.body}
                  />
                </div>

                <div className="field-block">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedMenuItem ? tempStock[selectedMenuItem._id] || 1 : 1}
                    className="custom-input"
                    value={itemQuantity}
                    onFocus={() => {
                      if (selectedMenuItem) {
                        setNumberPadTarget("quantity");
                        setShowNumberPad(true);
                      }
                    }}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      const max = selectedMenuItem
                        ? tempStock[selectedMenuItem._id] || 1
                        : 1;

                      if (val > max) {
                        toast.warn(`Only ${max} available`);
                      }

                      setItemQuantity(Math.max(1, Math.min(val, max)));
                    }}
                    disabled={!selectedMenuItem}
                  />
                </div>

                <div className="field-block action-apply-wrap">
                  <label className="form-label invisible-label">Add</label>
                  <button
                    className="submit-btn"
                    onClick={() => {
                      if (!selectedMenuItem) return;
                      addToCart({
                        ...selectedMenuItem,
                        quantity: itemQuantity
                      });
                      setSelectedMenuItem(null);
                      setItemQuantity(1);
                    }}
                    disabled={!selectedMenuItem}
                    type="button"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card shared-card-surface cashier-hero-panel cart-card">
            <span className="hero-badge">Order summary</span>
            <h2 className="hero-title cashier-panel-title">Current Order</h2>
            <p
  className="hero-subtitle cashier-panel-lede"
  style={{ textAlign: "center", margin: "0 auto" }}
>
  Review line items, charges, and total before completing payment.
</p>


            <div className="cashier-panel-body">
              <div className="cart-list">
                {cart.length === 0 ? (
                  <div className="empty-info-box">No items added</div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="cart-item">
                      <div className="cart-item-left">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-qty">Qty: {item.quantity}</span>
                      </div>
                      <div className="cart-item-right">
                        <span className="cart-item-price">
                          {symbol}
                          {(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item)}
                          type="button"
                        >
                          -
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="summary-box">
                <div className="summary-row">
                  <strong>Subtotal</strong>
                  <span>
                    {symbol}
                    {subtotal.toFixed(2)}
                  </span>
                </div>

                {serviceCharge > 0 && (
                  <div className="summary-row">
                    <strong>
                      Service Charge ({serviceChargeSettings.dineInCharge}%)
                    </strong>
                    <span>
                      {symbol}
                      {serviceCharge.toFixed(2)}
                    </span>
                  </div>
                )}

                {deliveryCharge > 0 && (
                  <div className="summary-row">
                    <strong>Delivery Fee</strong>
                    <span>
                      {symbol}
                      {deliveryCharge.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="summary-row total-row">
                  <strong>Total</strong>
                  <span>
                    {symbol}
                    {finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className="submit-btn proceed-btn"
                onClick={goToPayment}
                disabled={cart.length === 0}
                type="button"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>

        <section className="cashier-browse-fullwidth" aria-label="Browse menu">
          <div className="glass-card shared-card-surface browse-menu-card">
            <div className="section-header browse-header">
              <div className="browse-header-intro">
                <h2 className="section-title">Browse Menu</h2>
                <p className="section-subtitle">
                  Filter by category, search items, and add available menu items to the current order.
                </p>
              </div>

              <div className="results-chip">
                {filteredMenus.length} item{filteredMenus.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="browse-toolbar">
              <div className="field-block">
                <label className="form-label">Category</label>
                <select
                  className="custom-input custom-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {loadingCategories ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="field-block">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Search item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="field-block">
                <label className="form-label">Size</label>
                <select
                  className="custom-input custom-select"
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                >
                  <option value="">All Sizes</option>
                  <option value="M">Medium</option>
                  <option value="L">Large</option>
                </select>
              </div>
            </div>

            {filteredMenus.length === 0 ? (
              <div className="empty-menu-state">
                <div className="empty-menu-icon">🍽️</div>
                <h4>No menu items found</h4>
                <p>Try changing the category, size, or search keyword.</p>
              </div>
            ) : (
              <div className="menu-scroll-area menu-scroll-area--wide">
                <div className="menu-grid improved-menu-grid browse-menu-grid-fluid">
                  {filteredMenus.map((menu) => {
                    const available = tempStock[menu._id] || 0;
                    const inStock = available > 0;
                    const lowStock = available <= (menu.minimumQty || 0);
                    const displayName = cleanMenuName(menu.name);

                    return (
                      <div key={menu._id} className="menu-card improved-menu-card">
                        <div className="menu-card-body improved-menu-card-body">
                          <div className="menu-card-top">
                            <span className="menu-category-pill">
                              {menu.category}
                            </span>

                            <span
                              className={`stock-pill ${
                                inStock
                                  ? lowStock
                                    ? "stock-low"
                                    : "stock-ok"
                                  : "stock-out"
                              }`}
                            >
                              {inStock ? available : 0}
                            </span>
                          </div>

                          <h6 className="menu-name improved-menu-name">
                            {displayName}
                          </h6>

                          <div className="menu-price-block">
                            <span className="menu-price-label">Price</span>
                            <p className="menu-price improved-menu-price">
                              {symbol}
                              {menu.price.toFixed(2)}
                            </p>
                          </div>

                          <div className="menu-meta-list">
                            <div className="menu-meta-row">
                              <span className="menu-meta-key">Stock</span>
                              <span className="menu-meta-value">{available}</span>
                            </div>

                            <div className="menu-meta-row">
                              <span className="menu-meta-key">Category</span>
                              <span className="menu-meta-value">
                                {menu.category || "-"}
                              </span>
                            </div>
                          </div>

                          <div className="menu-card-footer">
                            {inStock ? (
                              <button
                                className="menu-add-btn improved-menu-add-btn"
                                onClick={() => addToCart(menu)}
                                type="button"
                              >
                                Add
                              </button>
                            ) : (
                              <button
                                className="menu-disabled-btn"
                                type="button"
                                disabled
                              >
                                Out of stock
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {showPaymentModal && (
        <PaymentModal
          totalAmount={orderData.totalPrice}
          subtotal={orderData.subtotal}
          serviceCharge={orderData.serviceCharge}
          deliveryCharge={orderData.deliveryCharge}
          onConfirm={submitConfirmedOrder}
          onClose={() => setShowPaymentModal(false)}
          loading={isSubmitting}
        />
      )}

      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          onClose={() => {
            setReceiptOrder(null);
          }}
        />
      )}

      <ToastContainer />

      <style>{`
        .cashier-page {
          min-height: 100vh;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
          padding: 28px 24px 34px;
        }

        .cashier-page .page-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
          background-size: 42px 42px;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0.04));
        }

        .cashier-page .page-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(95px);
          opacity: 0.45;
          pointer-events: none;
        }

        .cashier-page .glow-1 {
          width: 320px;
          height: 320px;
          top: -100px;
          left: -80px;
          background: hsla(160, 42%, 48%, 0.22);
        }

        .cashier-page .glow-2 {
          width: 360px;
          height: 360px;
          right: -100px;
          bottom: -100px;
          background: hsla(200, 55%, 58%, 0.14);
        }

        .cashier-page .page-shell {
          width: 100%;
          max-width: min(100%, 1680px);
          margin: 0 auto;
          box-sizing: border-box;
          position: relative;
          z-index: 1;
        }

        .cashier-page .hero-card.shared-card-surface,
        .cashier-page .glass-card.shared-card-surface {
          border-radius: 30px;
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

        .cashier-page .hero-card {
          padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}


        .cashier-page .hero-badge {
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

        .cashier-page .hero-title {
          margin: 14px 0 8px;
          color: #0f172a;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .cashier-page .hero-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.7;
          max-width: 760px;
        }

        .cashier-page .cashier-panels-stack {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
          align-items: stretch;
        }

        .cashier-page .cashier-hero-panel {
          padding: clamp(22px, 2.5vw, 34px) clamp(22px, 3vw, 38px);
        }

        .cashier-page .cashier-panel-title {
          margin: 14px 0 8px;
          font-size: clamp(1.45rem, 2.4vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.025em;
          line-height: 1.12;
          color: #0f172a;
        }

        .cashier-page .cashier-panel-lede {
          margin: 0;
          max-width: 820px;
        }

        .cashier-page .cashier-panel-body {
          margin-top: 22px;
          padding-top: 24px;
          border-top: 1px solid rgba(15, 23, 42, 0.07);
        }

        .cashier-page .cashier-panel-head-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }

        .cashier-page .cashier-hero-panel.numberpad-card .numberpad-grid {
          max-width: 420px;
          margin: 0 auto;
        }

        /* Match Quick Add “Add to Order” primary button */
        .cashier-page .cashier-hero-panel.cart-card .proceed-btn {
          display: block;
          width: min(100%, 420px);
          max-width: 100%;
          height: 58px;
          margin-left: auto;
          margin-right: auto;
        }

        .cashier-page .glass-card {
         padding: 24px 30px;
  margin: 0 auto 24px auto;
  max-width: 1500px;
  width: 100%;
  align-items: center;
}


        .cashier-page .section-header {
          margin-bottom: 22px;
        }

        .cashier-page .compact-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .cashier-page .section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cashier-page .section-title {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-align: center;
  width: 100%;
}

        .cashier-page .mini-title {
          margin: 0;
          color: #0f172a;
          font-size: 18px;
          font-weight: 800;
        }

        .cashier-page .section-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
          max-width: 760px;
        }

        .cashier-page .mini-close-btn {
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.06);
          color: #334155;
          font-weight: 700;
        }

        .cashier-page .form-grid {
          display: grid;
          gap: 100px;
        }

        .cashier-page .form-grid-4 {
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
        }

        .cashier-page .quick-add-grid {
          grid-template-columns: minmax(0, 2fr) minmax(140px, 200px) minmax(160px, 220px);
          align-items: end;
        }

        .cashier-page .field-block {
          min-width: 0;
          position: relative;
        }

        .cashier-page .field-full {
          grid-column: 1 / -1;
        }

        .cashier-page .field-span-2 {
          grid-column: span 2;
        }

        .cashier-page .quick-add-grid .action-apply-wrap {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          margin-top: 4px;
        }

        .cashier-page .quick-add-grid .action-apply-wrap .invisible-label {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .cashier-page .quick-add-grid .action-apply-wrap .submit-btn {
          width: min(100%, 420px);
          max-width: 100%;
        }

        .cashier-page .form-label {
          display: block;
          margin-bottom: 10px;
          color: #334155;
          font-size: 15px;
          font-weight: 700;
        }

        .cashier-page .invisible-label {
          visibility: hidden;
        }

        .cashier-page .custom-input {
          width: 100%;
          height: 58px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #0f172a;
          font-size: 15px;
          padding: 0 16px;
          transition: all 0.25s ease;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
        }

        .cashier-page .custom-input:focus {
          outline: none;
          border-color: hsla(160, 42%, 40%, 0.55);
          box-shadow: 0 0 0 4px hsla(160, 40%, 42%, 0.14) !important;
        }

        .cashier-page .custom-input::placeholder {
          color: rgba(15, 23, 42, 0.42);
        }

        .cashier-page .custom-select {
          appearance: none;
        }

        .cashier-page .custom-textarea {
          min-height: 110px;
          height: auto;
          padding-top: 14px;
          resize: none;
        }

        .cashier-page .helper-text {
          margin-top: 8px;
          color: #64748b;
          font-size: 12px;
        }

        .cashier-page .search-results-list {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          z-index: 30;
          list-style: none;
          margin: 0;
          padding: 8px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.1);
          background: #ffffff;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
          max-height: 220px;
          overflow-y: auto;
        }

        .cashier-page .search-result-item {
          padding: 12px 14px;
          border-radius: 12px;
          color: #0f172a;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .cashier-page .search-result-item:hover {
          background: hsla(160, 35%, 45%, 0.12);
        }

        .cashier-page .submit-btn,
        .cashier-page .menu-add-btn,
        .cashier-page .done-btn,
        .cashier-page .remove-btn,
        .cashier-page .number-btn {
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 800;
          transition: all 0.25s ease;
          cursor: pointer;
        }

        .cashier-page .submit-btn,
        .cashier-page .menu-add-btn,
        .cashier-page .done-btn,
        .cashier-page .remove-btn {
          color: #ffffff;
        }

        .cashier-page .number-btn {
          color: #0f172a;
          background: #f1f5f9;
          border: 1px solid rgba(15, 23, 42, 0.1);
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        .cashier-page .submit-btn,
        .cashier-page .menu-add-btn,
        .cashier-page .done-btn {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 14px 28px rgba(34, 197, 94, 0.22);
        }

        .cashier-page .submit-btn {
          height: 58px;
          width: 100%;
          align-self: center;
          justify-self: center;
        }

        .cashier-page .done-btn {
          grid-column: span 3;
        }

        .cashier-page .submit-btn:hover,
        .cashier-page .menu-add-btn:hover,
        .cashier-page .done-btn:hover,
        .cashier-page .remove-btn:hover,
        .cashier-page .number-btn:hover {
          transform: translateY(-2px);
        }

        .cashier-page .numberpad-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .cashier-page .number-btn,
        .cashier-page .done-btn {
          min-height: 54px;
        }

        .cashier-page .cart-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 22px;
        }

        .cashier-page .cart-item {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          padding: 14px 16px;
          border-radius: 18px;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .cashier-page .cart-item-left,
        .cashier-page .cart-item-right {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cashier-page .cart-item-right {
          align-items: flex-end;
        }

        .cashier-page .cart-item-name {
          color: #0f172a;
          font-weight: 700;
        }

        .cashier-page .cart-item-qty,
        .cashier-page .cart-item-price {
          color: #64748b;
          font-size: 13px;
        }

        .cashier-page .remove-btn {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 10px 22px rgba(239, 68, 68, 0.22);
        }

        .cashier-page .summary-box {
          border-top: 1px solid rgba(15, 23, 42, 0.08);
          padding-top: 18px;
          margin-top: 4px;
        }

        .cashier-page .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          color: #475569;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .cashier-page .total-row {
          color: #0f172a;
          font-size: 18px;
          font-weight: 800;
        }

        .cashier-page .proceed-btn {
          margin-top: 16px;
        }

        .cashier-page .empty-info-box {
          border-radius: 18px;
          border: 1px dashed #cbd5e1;
          background: #f8fafc;
          padding: 18px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        .cashier-page .cashier-browse-fullwidth {
          width: 100%;
          margin-top: 26px;
        }

        .cashier-page .cashier-browse-fullwidth .browse-menu-card {
          width: 100%;
          max-width: none;
        }

        .cashier-page .browse-menu-card {
          padding: 28px;
        }

        .cashier-page .browse-menu-grid-fluid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
          gap: 18px;
        }

        @media (min-width: 1400px) {
          .cashier-page .browse-menu-grid-fluid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
        }

        @media (min-width: 1800px) {
          .cashier-page .browse-menu-grid-fluid {
            grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          }
        }

        .cashier-page .browse-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
        }

        .cashier-page .browse-header-intro {
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }

        .cashier-page .browse-header-intro .section-title,
        .cashier-page .browse-header-intro .section-subtitle {
          text-align: center;
        }

        .cashier-page .browse-header-intro .section-subtitle {
          margin-left: auto;
          margin-right: auto;
        }

        .cashier-page .results-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 10px 14px;
          border-radius: 999px;
          background: hsla(160, 40%, 42%, 0.10);
          color: hsl(160, 55%, 24%);
          border: 1px solid hsla(160, 45%, 35%, 0.18);
          font-size: 13px;
          font-weight: 800;
        }

        .cashier-page .browse-toolbar {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
          padding: 18px;
          border-radius: 22px;
          background: linear-gradient(145deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.92));
          border: 1px solid rgba(15, 23, 42, 0.06);
        }

        .cashier-page .menu-scroll-area {
          max-height: 980px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .cashier-page .menu-scroll-area--wide {
          max-height: min(58vh, 780px);
        }

        .cashier-page .menu-scroll-area::-webkit-scrollbar {
          width: 8px;
        }

        .cashier-page .menu-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(15, 23, 42, 0.18);
          border-radius: 999px;
        }

        .cashier-page .improved-menu-card {
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          box-shadow:
            0 8px 20px rgba(15, 23, 42, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          overflow: hidden;
          height: 100%;
        }

        .cashier-page .improved-menu-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 16px 30px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
          border-color: hsla(160, 38%, 42%, 0.18);
        }

        .cashier-page .improved-menu-card-body {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-height: 280px;
          text-align: left;
        }

        .cashier-page .menu-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .cashier-page .menu-category-pill {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.05);
          color: #334155;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
        }

        .cashier-page .stock-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          line-height: 1;
          white-space: nowrap;
        }

        .cashier-page .stock-pill.stock-ok {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
        }

        .cashier-page .stock-pill.stock-low {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fcd34d;
        }

        .cashier-page .stock-pill.stock-out {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .cashier-page .improved-menu-name {
          margin: 0;
          color: #0f172a;
          font-size: 18px;
          font-weight: 800;
          line-height: 1.35;
          min-height: 50px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .cashier-page .menu-price-block {
          padding: 14px;
          border-radius: 18px;
          background: rgba(15, 23, 42, 0.03);
          border: 1px solid rgba(15, 23, 42, 0.05);
        }

        .cashier-page .menu-price-label {
          display: block;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .cashier-page .improved-menu-price {
          margin: 0;
          color: #16a34a;
          font-size: 22px;
          font-weight: 800;
          line-height: 1;
        }

        .cashier-page .menu-meta-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cashier-page .menu-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.06);
        }

        .cashier-page .menu-meta-key {
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
        }

        .cashier-page .menu-meta-value {
          color: #0f172a;
          font-size: 13px;
          font-weight: 800;
        }

        .cashier-page .menu-card-footer {
          margin-top: auto;
        }

        .cashier-page .improved-menu-add-btn,
        .cashier-page .menu-disabled-btn {
          width: 100%;
          min-height: 48px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          border: none;
        }

        .cashier-page .improved-menu-add-btn {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #ffffff;
          box-shadow: 0 12px 24px rgba(34, 197, 94, 0.20);
        }

        .cashier-page .menu-disabled-btn {
          background: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .cashier-page .empty-menu-state {
          min-height: 260px;
          border-radius: 24px;
          border: 1px dashed rgba(15, 23, 42, 0.12);
          background: linear-gradient(145deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.92));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 28px;
        }

        .cashier-page .empty-menu-icon {
          font-size: 44px;
          margin-bottom: 14px;
        }

        .cashier-page .empty-menu-state h4 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 22px;
          font-weight: 800;
        }

        .cashier-page .empty-menu-state p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          max-width: 340px;
          line-height: 1.7;
        }

        @media (max-width: 1400px) {
          .cashier-page .form-grid-4 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1100px) {
          .cashier-page .form-grid-4,
          .cashier-page .quick-add-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .cashier-page .field-span-2,
          .cashier-page .field-full {
            grid-column: 1 / -1;
          }

          .cashier-page .browse-toolbar {
            grid-template-columns: 1fr 1fr;
          }

          .cashier-page .browse-menu-grid-fluid {
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
          }
        }

        @media (max-width: 768px) {
          .cashier-page {
            padding: 18px 12px;
          }

          .cashier-page .page-shell {
            width: 100%;
            max-width: 100%;
          }

          .cashier-page .hero-card,
          .cashier-page .glass-card {
            padding: 20px;
            border-radius: 22px;
          }

          .cashier-page .form-grid-4,
          .cashier-page .quick-add-grid {
            grid-template-columns: 1fr;
          }

          .cashier-page .field-span-2,
          .cashier-page .field-full {
            grid-column: auto;
          }

          .cashier-page .quick-add-grid .field-span-2,
          .cashier-page .quick-add-grid .action-apply-wrap {
            grid-column: 1 / -1;
          }

          .cashier-page .cashier-panel-title {
            font-size: 1.45rem;
          }

          .cashier-page .section-title {
            font-size: 24px;
          }

          .cashier-page .browse-header {
            align-items: center;
          }

          .cashier-page .browse-toolbar {
            grid-template-columns: 1fr;
            padding: 14px;
          }

          .cashier-page .browse-menu-grid-fluid {
            grid-template-columns: 1fr;
          }

          .cashier-page .improved-menu-card-body {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default CashierLanding;