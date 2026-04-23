import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaSearch, FaShoppingCart, FaUser, FaTrash, FaPlus, FaMinus, FaUtensils, FaArrowRight, FaPrint, FaWindowClose, FaPhone, FaChevronDown, FaChevronUp } from "react-icons/fa";
import PaymentModal from "./PaymentModal";
import ReceiptModal from "./ReceiptModal";
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
  const [deliveryPlaces, setDeliveryPlaces] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [selectedWaiterId, setSelectedWaiterId] = useState("");
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
      
      const [menusRes, deliveryRes, waiterRes] = await Promise.all([
        axios.get("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/menus", config),
        axios.get("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/delivery-charges", config),
        axios.get("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/employees", config)
      ]);

      setMenus(menusRes.data || []);
      setCategories([...new Set(menusRes.data.map(m => m.category).filter(Boolean))]);
      setDeliveryPlaces(deliveryRes.data || []);
      setWaiters(waiterRes.data.filter(e => e.role?.toLowerCase() === "waiter" || e.position?.toLowerCase() === "waiter"));
    } catch (err) {
      toast.error("Failed to sync system data");
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
        toast.warn("Out of stock!");
        return;
    }
    const existing = cart.find(i => i._id === menu._id);
    if (existing) {
      setCart(cart.map(i => i._id === menu._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...menu, quantity: 1 }]);
    }
    setMenus(menus.map(m => m._id === menu._id ? { ...m, currentQty: m.currentQty - 1 } : m));
  };

  const updateQty = (id, delta) => {
    const item = cart.find(i => i._id === id);
    if (delta > 0) {
        const originalMenu = menus.find(m => m._id === id);
        if (originalMenu.currentQty <= 0) {
            toast.warn("No more stock!");
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
  const total = subtotal;

  const handleCheckout = () => {
    if (cart.length === 0) return toast.warn("Cart is empty");
    if (!customer.phone || !customer.name) return toast.warn("Customer details required");
    
    setOrderData({
        ...customer,
        items: cart,
        subtotal,
        totalPrice: total
    });
    setShowPaymentModal(true);
  };

  return (
    <div className="pos-container animate-fade-in">
      <ToastContainer theme="light" />
      
      <div className="row g-4" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Left Side - Menu selection */}
        <div className="col-lg-8 d-flex flex-column h-100">
            {/* Search & Filters */}
            <div className="premium-card p-3 mb-4 d-flex gap-3 align-items-center">
                <div className="position-relative flex-grow-1">
                    <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <input type="text" className="premium-input ps-5" placeholder="Search menu items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="premium-input premium-select w-auto fw-bold" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Menu Grid */}
            <div className="menu-grid-wrapper flex-grow-1 overflow-auto pe-2">
                <div className="row g-3">
                    {filteredMenus.map(menu => (
                        <div className="col-xl-3 col-lg-4 col-md-6" key={menu._id}>
                            <div className={`orient-card p-0 pos-menu-card ${menu.currentQty <= 0 ? 'out-of-stock' : ''}`} onClick={() => addToCart(menu)}>
                                <div className="pos-item-img">
                                    {menu.imageUrl ? <img src={menu.imageUrl} alt={menu.name} /> : <div className="pos-img-placeholder"><FaUtensils size={32} /></div>}
                                    <div className="pos-item-price">{symbol}{menu.price}</div>
                                </div>
                                <div className="p-3">
                                    <div className="fw-bold text-main small mb-2 truncate-2">{menu.name}</div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className={`badge-premium ${menu.currentQty > 5 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                                            {menu.currentQty} In Stock
                                        </span>
                                        <div className="pos-add-indicator"><FaPlus size={10} /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Side - Cart & Customer */}
        <div className="col-lg-4 d-flex flex-column h-100">
            <div className="orient-card flex-grow-1 d-flex flex-column p-0 overflow-hidden shadow-platinum">
                {/* Order Identity - Dynamic Length Form */}
                <div className={`identity-section border-bottom ${isIdentityExpanded ? 'expanded' : 'collapsed'}`}>
                    <div className="p-4 d-flex justify-content-between align-items-center cursor-pointer bg-light" onClick={() => setIsIdentityExpanded(!isIdentityExpanded)}>
                        <h6 className="mb-0 fw-800 d-flex align-items-center gap-2">
                            <FaUser className="text-primary" size={16} /> Order Identification
                        </h6>
                        {isIdentityExpanded ? <FaChevronUp className="text-muted" size={14} /> : <FaChevronDown className="text-muted" size={14} />}
                    </div>
                    
                    <div className="identity-form-content p-4 bg-white">
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="orient-stat-label">Customer Contact</label>
                                <div className="position-relative">
                                    <FaPhone className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={12} />
                                    <input type="text" className="premium-input py-2 ps-5" placeholder="Phone Number" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="col-12">
                                <label className="orient-stat-label">Customer Name</label>
                                <input type="text" className="premium-input py-2" placeholder="Full Name" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} />
                            </div>
                            <div className="col-6">
                                <label className="orient-stat-label">Order Type</label>
                                <select className="premium-input premium-select py-2" value={customer.orderType} onChange={(e) => setCustomer({...customer, orderType: e.target.value})}>
                                    <option value="takeaway">Takeaway</option>
                                    <option value="table">Dine-In</option>
                                </select>
                            </div>
                            {customer.orderType === 'table' && (
                                <div className="col-6 animate-fade-in">
                                    <label className="orient-stat-label">Table Number</label>
                                    <input type="text" className="premium-input py-2" placeholder="Ex: T-01" value={customer.tableNo} onChange={(e) => setCustomer({...customer, tableNo: e.target.value})} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="cart-items-section flex-grow-1 overflow-auto p-4 bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 className="mb-0 fw-800 d-flex align-items-center gap-2">
                            <FaShoppingCart className="text-primary" size={16} /> Selected Items
                        </h6>
                        <span className="badge-premium badge-primary">{cart.length} Items</span>
                    </div>
                    
                    {cart.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="opacity-10 mb-3"><FaShoppingCart size={64} /></div>
                            <p className="text-muted small">Your cart is empty</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-2">
                            {cart.map(item => (
                                <div key={item._id} className="cart-item-row p-3 rounded-4">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="fw-bold text-main small flex-grow-1">{item.name}</div>
                                        <div className="text-primary fw-800 small ms-3">{symbol}{(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="text-muted tiny">{symbol}{item.price} per unit</div>
                                        <div className="qty-control">
                                            <button className="qty-btn" onClick={() => updateQty(item._id, -1)}><FaMinus size={8}/></button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button className="qty-btn" onClick={() => updateQty(item._id, 1)}><FaPlus size={8}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Summary */}
                <div className="p-4 bg-light border-top">
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted fw-500 small">Subtotal</span>
                        <span className="text-main fw-700">{symbol}{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-4">
                        <h5 className="text-main fw-900">Grand Total</h5>
                        <h4 className="text-primary fw-900">{symbol}{total.toFixed(2)}</h4>
                    </div>
                    <button className="btn-premium btn-premium-secondary w-100 py-3 fs-6 rounded-4" onClick={handleCheckout}>
                        Complete Checkout <FaArrowRight className="ms-2" />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal 
            show={showPaymentModal} 
            handleClose={() => setShowPaymentModal(false)} 
            orderData={orderData} 
            symbol={symbol}
            onSubmit={(payData) => {
                toast.success("Transaction Finalized!");
                setCart([]);
                setCustomer({ phone: "", name: "", orderType: "takeaway", tableNo: "", deliveryType: "Customer Pickup", deliveryPlaceId: "", deliveryNote: "" });
                setShowPaymentModal(false);
            }}
        />
      )}

      {receiptOrder && (
        <ReceiptModal order={receiptOrder} handleClose={() => setReceiptOrder(null)} />
      )}

      <style>{`
        .pos-container { height: 100%; }
        .pos-menu-card { cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid var(--border-subtle); background: #fff; overflow: hidden; }
        .pos-menu-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); border-color: var(--primary); }
        
        .pos-item-img { height: 140px; position: relative; background: #f8fafc; overflow: hidden; }
        .pos-item-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .pos-menu-card:hover .pos-item-img img { transform: scale(1.1); }
        .pos-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #cbd5e1; }
        
        .pos-item-price { position: absolute; bottom: 10px; right: 10px; background: rgba(15, 23, 42, 0.9); color: #fff; padding: 4px 10px; border-radius: 8px; font-weight: 800; font-size: 0.8rem; backdrop-filter: blur(4px); }
        
        .pos-add-indicator { width: 24px; height: 24px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .pos-menu-card:hover .pos-add-indicator { background: var(--primary); color: #fff; }
        
        .out-of-stock { opacity: 0.5; filter: grayscale(1); pointer-events: none; }
        
        .identity-section { transition: all 0.4s ease; }
        .identity-section.collapsed .identity-form-content { max-height: 0; padding: 0 !important; overflow: hidden; opacity: 0; }
        .identity-section.expanded .identity-form-content { max-height: 500px; opacity: 1; }
        
        .cart-item-row { background: #f8fafc; border: 1px solid transparent; transition: all 0.2s; }
        .cart-item-row:hover { border-color: var(--primary-light); background: #fff; box-shadow: var(--shadow-sm); }
        
        .qty-control { display: flex; align-items: center; background: #fff; border: 1px solid var(--border-subtle); border-radius: 10px; padding: 2px; }
        .qty-btn { width: 24px; height: 24px; border-radius: 8px; border: none; background: #f1f5f9; color: var(--text-main); display: flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer; }
        .qty-btn:hover { background: var(--primary); color: #fff; }
        .qty-value { min-width: 24px; text-align: center; font-weight: 800; font-size: 0.85rem; padding: 0 4px; }
        
        .fw-800 { font-weight: 800; }
        .fw-900 { font-weight: 900; }
        .tiny { font-size: 0.7rem; }
        .truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default CashierLanding;