import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaSearch, FaShoppingCart, FaUser, FaTrash, FaPlus, FaMinus, FaUtensils, FaArrowRight, FaPrint, FaWindowClose, FaPhone, FaChevronDown, FaChevronUp, FaTag } from "react-icons/fa";
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
      
      const [menusRes] = await Promise.all([
        axios.get("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/menus", config)
      ]);

      setMenus(menusRes.data || []);
      setCategories([...new Set(menusRes.data.map(m => m.category).filter(Boolean))]);
    } catch (err) {
      toast.error("Cloud synchronization failed");
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
        toast.warn("Product depletion alert: Out of stock");
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
  const total = subtotal;

  const handleCheckout = () => {
    if (cart.length === 0) return toast.warn("Transaction requires items");
    if (!customer.phone || !customer.name) return toast.warn("Client identification required");
    
    setOrderData({
        ...customer,
        items: cart,
        subtotal,
        totalPrice: total
    });
    setShowPaymentModal(true);
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
            <div className="fw-900 text-main">Initializing Terminal...</div>
        </div>
    </div>
  );

  return (
    <div className="pos-layout animate-in">
      <ToastContainer theme="light" />
      
      <div className="pos-main-grid">
        {/* Left Side: Product Selection */}
        <div className="pos-catalog">
            <div className="orient-card mb-4 p-3 d-flex gap-3 align-items-center bg-white shadow-sm border-0">
                <div className="position-relative flex-grow-1">
                    <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={12} />
                    <input type="text" className="premium-input ps-5 border-0 bg-app" placeholder="Search catalog..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="premium-input w-auto fw-800 border-0 bg-app" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">All Departments</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="catalog-grid">
                {filteredMenus.map(menu => (
                    <div key={menu._id} className={`catalog-card ${menu.currentQty <= 0 ? 'depleted' : ''}`} onClick={() => addToCart(menu)}>
                        <div className="catalog-img-box">
                            {menu.imageUrl ? <img src={menu.imageUrl} alt={menu.name} /> : <div className="img-placeholder"><FaUtensils size={24} /></div>}
                            <div className="price-tag">{symbol}{menu.price}</div>
                        </div>
                        <div className="catalog-info">
                            <div className="item-name">{menu.name}</div>
                            <div className="d-flex justify-content-between align-items-center mt-2">
                                <span className={`badge ${menu.currentQty > 5 ? 'badge-green' : 'badge-red'}`}>
                                    {menu.currentQty} Units
                                </span>
                                <div className="add-btn"><FaPlus size={10} /></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Side: Execution Sidebar */}
        <div className="pos-sidebar">
            <div className="orient-card h-100 p-0 d-flex flex-column bg-white shadow-platinum overflow-hidden border-0">
                {/* Client Identification Section */}
                <div className={`execution-section ${isIdentityExpanded ? 'expanded' : 'collapsed'}`}>
                    <div className="section-header" onClick={() => setIsIdentityExpanded(!isIdentityExpanded)}>
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-blue-glow p-2 rounded-circle"><FaUser size={12} /></div>
                            <span className="fw-800 text-main small">Client Identification</span>
                        </div>
                        {isIdentityExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </div>
                    
                    <div className="section-body p-4">
                        <div className="d-flex flex-column gap-3">
                            <div>
                                <label className="stat-label mb-2 d-block">Contact Protocol</label>
                                <div className="position-relative">
                                    <FaPhone className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={10} />
                                    <input type="text" className="premium-input ps-5 bg-app border-0" placeholder="Contact Number" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="stat-label mb-2 d-block">Legal Name</label>
                                <input type="text" className="premium-input bg-app border-0" placeholder="Full Identity Name" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} />
                            </div>
                            <div className="row g-2">
                                <div className="col-6">
                                    <label className="stat-label mb-2 d-block">Fulfillment</label>
                                    <select className="premium-input bg-app border-0 fw-700" value={customer.orderType} onChange={(e) => setCustomer({...customer, orderType: e.target.value})}>
                                        <option value="takeaway">Takeaway</option>
                                        <option value="table">Dine-In</option>
                                    </select>
                                </div>
                                {customer.orderType === 'table' && (
                                    <div className="col-6">
                                        <label className="stat-label mb-2 d-block">Asset ID</label>
                                        <input type="text" className="premium-input bg-app border-0" placeholder="Table #" value={customer.tableNo} onChange={(e) => setCustomer({...customer, tableNo: e.target.value})} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cart Ledger */}
                <div className="cart-ledger flex-grow-1 overflow-auto p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-gold-glow p-2 rounded-circle"><FaShoppingCart size={12} /></div>
                            <span className="fw-800 text-main small">Selected Assets</span>
                        </div>
                        <span className="badge badge-blue">{cart.length} SKUs</span>
                    </div>

                    {cart.length === 0 ? (
                        <div className="text-center py-5 opacity-20">
                            <FaShoppingCart size={48} className="mb-2" />
                            <div className="small fw-700">Ledger Empty</div>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-2">
                            {cart.map(item => (
                                <div key={item._id} className="ledger-item">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="item-name-sm truncate">{item.name}</span>
                                        <span className="item-price-sm">{symbol}{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted tiny">{symbol}{item.price} unit</span>
                                        <div className="qty-stepper">
                                            <button className="stepper-btn" onClick={() => updateQty(item._id, -1)}><FaMinus size={8}/></button>
                                            <span className="stepper-val">{item.quantity}</span>
                                            <button className="stepper-btn" onClick={() => updateQty(item._id, 1)}><FaPlus size={8}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Execution Footer */}
                <div className="execution-footer p-4 bg-app border-top">
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted fw-700 tiny">NET VALUATION</span>
                        <span className="text-main fw-800">{symbol}{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-4 pt-2 border-top">
                        <span className="fw-900 text-main h6 mb-0">GROSS REVENUE</span>
                        <span className="fw-900 text-primary h5 mb-0">{symbol}{total.toFixed(2)}</span>
                    </div>
                    <button className="btn-premium btn-primary w-100 py-3 rounded-pill shadow-lg" onClick={handleCheckout}>
                        COMMIT TRANSACTION <FaArrowRight className="ms-2" />
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
                toast.success("Transaction Securely Authorized");
                setCart([]);
                setCustomer({ phone: "", name: "", orderType: "takeaway", tableNo: "", deliveryType: "Customer Pickup", deliveryPlaceId: "", deliveryNote: "" });
                setShowPaymentModal(false);
            }}
        />
      )}

      {receiptOrder && (
        <ReceiptModal order={receiptOrder} handleClose={() => setReceiptOrder(null)} />
      )}


    </div>
  );
};

export default CashierLanding;