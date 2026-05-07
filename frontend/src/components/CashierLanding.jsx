import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import {
  Search,
  ShoppingCart,
  User,
  Trash2,
  Plus,
  Minus,
  Utensils,
  ArrowRight,
  Printer,
  X,
  Phone,
  ChevronDown,
  ChevronUp,
  Tag,
  CreditCard,
  Layers,
  ChefHat,
  Monitor
} from "lucide-react";
import PaymentModal from "./PaymentModal";
import ReceiptModal from "./ReceiptModal";
import API_BASE_URL from "../apiConfig";
import "react-toastify/dist/ReactToastify.css";
import "../styles/PremiumUI.css";

const CashierLanding = () => {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    phone: "", name: "", orderType: "takeaway", tableNo: "", deliveryType: "Customer Pickup", deliveryPlaceId: "", deliveryNote: ""
  });

  const [receiptOrder, setReceiptOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isIdentityExpanded, setIsIdentityExpanded] = useState(true);

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_BASE_URL}/api/auth/menus`, config);
      setMenus(res.data || []);
      setCategories([...new Set(res.data.map(m => m.category).filter(Boolean))]);
    } catch (err) {
      toast.error("Terminal sync failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredMenus = menus.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedCategory || m.category === selectedCategory)
  );

  const addToCart = (menu) => {
    if (menu.currentQty <= 0) {
      toast.warn("Product out of stock");
      return;
    }
    const existing = cart.find(i => i._id === menu._id);
    if (existing) {
      setCart(cart.map(i => i._id === menu._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...menu, quantity: 1 }]);
    }
    setMenus(menus.map(m => m._id === menu._id ? { ...m, currentQty: m.currentQty - 1 } : m));
    if (isIdentityExpanded) setIsIdentityExpanded(false);
  };

  const updateQty = (id, delta) => {
    const item = cart.find(i => i._id === id);
    if (delta > 0) {
      const originalMenu = menus.find(m => m._id === id);
      if (originalMenu.currentQty <= 0) {
        toast.warn("Inventory limit reached");
        return;
      }
      setCart(cart.map(i => i._id === id ? { ...i, quantity: i.quantity + 1 } : i));
      setMenus(menus.map(m => m._id === id ? { ...m, currentQty: m.currentQty - 1 } : m));
    } else {
      if (item.quantity <= 1) {
        setCart(cart.filter(i => i._id !== id));
      } else {
        setCart(cart.map(i => i._id === id ? { ...i, quantity: i.quantity - 1 } : i));
      }
      setMenus(menus.map(m => m._id === id ? { ...m, currentQty: m.currentQty + 1 } : m));
    }
  };

  const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return toast.warn("Selection queue is empty");
    // if (!customer.phone || !customer.name) return toast.warn("Customer identification required");

    setOrderData({
      ...customer,
      items: cart,
      subtotal,
      totalPrice: subtotal
    });
    setShowPaymentModal(true);
  };

  const [processing, setProcessing] = useState(false);

  const saveOrder = async (paymentData) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        customerPhone: customer.phone,
        customerName: customer.name,
        tableNo: customer.orderType === 'table' ? customer.tableNo : 'Takeaway',
        items: cart.map(item => ({
          menuId: item._id,
          name: item.name,
          quantity: item.quantity
        })),
        deliveryType: customer.deliveryType,
        deliveryPlaceId: customer.deliveryPlaceId,
        deliveryNote: customer.deliveryNote,
        payment: {
          cash: paymentData.cash,
          card: paymentData.card,
          bankTransfer: paymentData.bankTransfer,
          totalPaid: paymentData.totalPaid,
          changeDue: paymentData.changeDue,
          notes: paymentData.notes
        }
      };

      const res = await axios.post(`${API_BASE_URL}/api/auth/order`, payload, config);

      setShowPaymentModal(false);
      setReceiptOrder(res.data);
      setCart([]);
      setCustomer({ phone: "", name: "", orderType: "takeaway", tableNo: "", deliveryType: "Customer Pickup", deliveryPlaceId: "", deliveryNote: "" });
      toast.success("Transaction Authorized & Synchronized");
    } catch (err) {
      toast.error(err.response?.data?.error || "Transaction failure");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner-border text-indigo" />
    </div>
  );

  return (
    <div className="pos-immersive-layout">
      <ToastContainer theme="colored" />

      {/* Top Navigation */}
      <nav className="pos-nav">
        <div className="d-flex align-items-center gap-3">
          <div className="pos-logo-box"><Monitor size={20} /></div>
          <h2 className="pos-brand">ROYAL POS</h2>
        </div>
        <div className="d-flex gap-4">
          <div className="nav-stat">
            <span className="tiny-caps">System Status</span>
            <span className="status-dot online">Online</span>
          </div>
          <div className="nav-stat">
            <span className="tiny-caps">Active Terminal</span>
            <span className="fw-800">T-04</span>
          </div>
        </div>
      </nav>

      <div className="pos-body">
        {/* Main Catalog */}
        <main className="pos-catalog-section">
          <header className="catalog-header">
            <div className="search-pill">
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Find item or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="category-scroll">
              <button
                className={`cat-btn ${!selectedCategory ? 'active' : ''}`}
                onClick={() => setSelectedCategory("")}
              >
                All Items
              </button>
              {categories.map(c => (
                <button
                  key={c}
                  className={`cat-btn ${selectedCategory === c ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </header>

          <div className="catalog-grid-modern">
            <AnimatePresence mode="popLayout">
              {filteredMenus.map(menu => (
                <motion.div
                  key={menu._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className={`menu-card-modern ${menu.currentQty <= 0 ? 'depleted' : ''}`}
                  onClick={() => addToCart(menu)}
                >
                  <div className="menu-image-box">
                    {menu.imageUrl ? <img src={menu.imageUrl} alt={menu.name} /> : <ChefHat size={32} opacity={0.1} />}
                    <div className="menu-price-badge">{symbol}{menu.price}</div>
                  </div>
                  <div className="menu-content">
                    <h5 className="menu-name">{menu.name}</h5>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="qty-tag">{menu.currentQty} in stock</span>
                      <div className="add-icon-box"><Plus size={14} /></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>

        {/* Action Sidebar */}
        <aside className="pos-checkout-sidebar">
          <div className="checkout-card">
            {/* Customer Identity */}
            <div className={`identity-panel ${isIdentityExpanded ? 'open' : 'closed'}`}>
              <header onClick={() => setIsIdentityExpanded(!isIdentityExpanded)}>
                <div className="d-flex align-items-center gap-2">
                  <User size={16} className="text-indigo" />
                  <span className="fw-800">CUSTOMER DETAILS</span>
                </div>
                {isIdentityExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </header>

              <AnimatePresence>
                {isIdentityExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="identity-body"
                  >
                    <div className="mb-3">
                      <label className="tiny-caps mb-1 d-block">Phone Number</label>
                      <input type="text" className="pos-input" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="07x xxx xxxx" />
                    </div>
                    <div className="mb-3">
                      <label className="tiny-caps mb-1 d-block">Full Name</label>
                      <input type="text" className="pos-input" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Guest Name" />
                    </div>
                    <div className="row g-2">
                      <div className="col-6">
                        <label className="tiny-caps mb-1 d-block">Type</label>
                        <select className="pos-input" value={customer.orderType} onChange={(e) => setCustomer({ ...customer, orderType: e.target.value })}>
                          <option value="takeaway">Takeaway</option>
                          <option value="table">Dine-In</option>
                        </select>
                      </div>
                      {customer.orderType === 'table' && (
                        <div className="col-6">
                          <label className="tiny-caps mb-1 d-block">Table</label>
                          <input type="text" className="pos-input" value={customer.tableNo} onChange={(e) => setCustomer({ ...customer, tableNo: e.target.value })} placeholder="No" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order List */}
            <div className="order-list-section">
              <header className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <ShoppingCart size={16} className="text-indigo" />
                  <span className="fw-800">ORDER LIST</span>
                </div>
                <span className="badge-modern success">{cart.length} ITEMS</span>
              </header>

              <div className="cart-items-scroll">
                <AnimatePresence mode="popLayout">
                  {cart.map(item => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="cart-item-modern"
                    >
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-700 small">{item.name}</span>
                        <span className="fw-800 text-indigo">{symbol}{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted tiny">{symbol}{item.price} each</span>
                        <div className="qty-control-modern">
                          <button onClick={() => updateQty(item._id, -1)}><Minus size={12} /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQty(item._id, 1)}><Plus size={12} /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {cart.length === 0 && (
                  <div className="text-center py-5 opacity-20">
                    <Layers size={48} className="mb-2" />
                    <p className="fw-800 small">Ready for Order</p>
                  </div>
                )}
              </div>
            </div>

            {/* Total & Checkout */}
            <footer className="checkout-footer-modern">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted fw-700">Subtotal</span>
                <span className="fw-800">{symbol}{subtotal.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-4 pt-3 border-top">
                <span className="fw-900 h5 m-0">TOTAL</span>
                <span className="fw-900 h4 m-0 text-indigo">{symbol}{subtotal.toLocaleString()}</span>
              </div>
              <button className="btn-indigo w-100 py-4 justify-content-center" onClick={handleCheckout}>
                <span>PROCESS PAYMENT</span>
                <CreditCard size={20} />
              </button>
            </footer>
          </div>
        </aside>
      </div>

      <style>{`
        .pos-immersive-layout { height: 100vh; display: flex; flex-direction: column; background: #f8fafc; overflow: hidden; }
        .pos-nav { height: 72px; background: white; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; }
        .pos-logo-box { width: 40px; height: 40px; background: var(--p-indigo-600); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .pos-brand { font-family: 'Outfit'; font-weight: 800; font-size: 1.25rem; margin: 0; letter-spacing: -0.5px; }
        .status-dot { font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; gap: 6px; color: #10b981; }
        .status-dot::before { content: ''; width: 8px; height: 8px; background: #10b981; border-radius: 50%; }
        
        .pos-body { flex: 1; display: flex; overflow: hidden; }
        .pos-catalog-section { flex: 1; overflow-y: auto; padding: 40px; }
        .catalog-header { margin-bottom: 40px; }
        .search-pill { background: white; border-radius: 100px; padding: 12px 24px; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-subtle); width: 400px; margin-bottom: 24px; }
        .search-pill input { border: none; outline: none; font-size: 0.9rem; font-weight: 600; flex: 1; }
        
        .category-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; }
        .cat-btn { padding: 10px 24px; border-radius: 50px; border: 1px solid var(--border-subtle); background: white; font-weight: 700; font-size: 0.85rem; color: var(--text-muted); cursor: pointer; transition: 0.2s; white-space: nowrap; }
        .cat-btn:hover { border-color: var(--p-indigo-600); color: var(--p-indigo-600); }
        .cat-btn.active { background: var(--p-indigo-600); color: white; border-color: var(--p-indigo-600); }
        
        .catalog-grid-modern { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
        .menu-card-modern { background: white; border-radius: 24px; overflow: hidden; cursor: pointer; border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm); transition: 0.3s; }
        .menu-card-modern:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); border-color: var(--p-indigo-100); }
        .menu-image-box { height: 160px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; position: relative; }
        .menu-image-box img { width: 100%; height: 100%; object-fit: cover; }
        .menu-price-badge { position: absolute; bottom: 12px; right: 12px; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); color: white; padding: 6px 14px; border-radius: 50px; font-weight: 800; font-size: 0.9rem; }
        .menu-content { padding: 20px; }
        .menu-name { font-weight: 800; font-size: 1rem; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .qty-tag { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); }
        .add-icon-box { width: 32px; height: 32px; background: var(--p-indigo-50); color: var(--p-indigo-600); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        
        .pos-checkout-sidebar { width: 440px; background: white; border-left: 1px solid var(--border-subtle); display: flex; flex-direction: column; padding: 24px; }
        .checkout-card { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .identity-panel { border: 1px solid var(--border-subtle); border-radius: 20px; margin-bottom: 24px; overflow: hidden; }
        .identity-panel header { padding: 16px 20px; background: #f8fafc; cursor: pointer; display: flex; align-items: center; justify-content: space-between; }
        .identity-body { padding: 20px; border-top: 1px solid var(--border-subtle); }
        .pos-input { width: 100%; padding: 12px 16px; border: 1px solid var(--border-strong); border-radius: 12px; font-size: 0.9rem; font-weight: 600; outline: none; transition: 0.2s; }
        .pos-input:focus { border-color: var(--p-indigo-600); box-shadow: 0 0 0 3px var(--p-indigo-50); }
        
        .order-list-section { flex: 1; overflow: hidden; display: flex; flex-direction: column; margin-bottom: 24px; }
        .cart-items-scroll { flex: 1; overflow-y: auto; padding: 20px 0; }
        .cart-item-modern { background: #f8fafc; padding: 16px; border-radius: 16px; margin-bottom: 12px; border: 1px solid transparent; transition: 0.2s; }
        .cart-item-modern:hover { border-color: var(--p-indigo-100); background: white; box-shadow: var(--shadow-sm); }
        .qty-control-modern { display: flex; align-items: center; gap: 14px; background: white; padding: 4px 12px; border-radius: 50px; border: 1px solid var(--border-strong); }
        .qty-control-modern button { border: none; background: transparent; color: var(--text-muted); cursor: pointer; padding: 2px; }
        .qty-control-modern span { font-weight: 800; font-size: 0.85rem; min-width: 20px; text-align: center; }
        
        .checkout-footer-modern { border-top: 1px solid var(--border-subtle); padding-top: 24px; }
      `}</style>

      {showPaymentModal && (
        <PaymentModal
          handleClose={() => setShowPaymentModal(false)}
          orderData={orderData}
          symbol={symbol}
          onSubmit={saveOrder}
          processing={processing}
        />
      )}

      {receiptOrder && (
        <ReceiptModal order={receiptOrder} handleClose={() => setReceiptOrder(null)} />
      )}
    </div>
  );
};

export default CashierLanding;