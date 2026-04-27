import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Package,
  DollarSign,
  Layers,
  Image as ImageIcon,
  X,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  MoreVertical,
  ChefHat,
  RefreshCw
} from "lucide-react";
import API_BASE_URL from "../apiConfig";
import "../styles/PremiumUI.css";

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newMenu, setNewMenu] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    category: "Main Course",
    minimumQty: 5
  });

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/menus`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenus(res.data || []);
    } catch (err) {
      toast.error("Inventory sync failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredMenus = menus.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (!selectedCategory || m.category === selectedCategory)
  );

  const categories = [...new Set(menus.map(m => m.category).filter(Boolean))];
  const lowStockCount = menus.filter(m => m.currentQty <= m.minimumQty).length;

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/auth/menu`, newMenu, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenus([...menus, res.data]);
      setShowAddModal(false);
      toast.success("Inventory asset registered");
    } catch (err) {
      toast.error("Registration failed");
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner-border text-indigo" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inventory-suite">
      <ToastContainer theme="colored" />
      
      {/* Dynamic Header */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h1 className="text-hero">Inventory & Catalog</h1>
          <p className="text-subtitle">Real-time oversight of culinary assets and procurement thresholds</p>
        </div>
        <button className="btn-indigo" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>REGISTER ASSET</span>
        </button>
      </div>

      {/* Analytics Bento Row */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="bento-card kpi-card">
            <div className="d-flex justify-content-between">
              <div className="stat-icon-wrapper"><Package size={20} /></div>
              <span className="tiny-caps text-muted">TOTAL SKUs</span>
            </div>
            <h2 className="display-6 fw-900 mt-3">{menus.length}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bento-card kpi-card danger">
            <div className="d-flex justify-content-between">
              <div className="stat-icon-wrapper danger"><AlertTriangle size={20} /></div>
              <span className="tiny-caps text-danger">LOW STOCK</span>
            </div>
            <h2 className="display-6 fw-900 mt-3">{lowStockCount}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bento-card kpi-card success">
            <div className="d-flex justify-content-between">
              <div className="stat-icon-wrapper success"><Layers size={20} /></div>
              <span className="tiny-caps text-success">DEPARTMENTS</span>
            </div>
            <h2 className="display-6 fw-900 mt-3">{categories.length}</h2>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="d-flex gap-3 mb-5">
        <div className="search-bar-modern flex-grow-1">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search catalog by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-pill-modern">
          <Filter size={18} />
          <select 
            className="premium-select" 
            style={{ border: 'none', backgroundPosition: 'right 0 center', padding: '0 2rem 0 0' }}
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Collections</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button 
          className="btn-refresh-premium" 
          onClick={fetchMenus}
          disabled={loading}
        >
          <RefreshCw size={20} className={loading ? "animate-spin-soft" : ""} />
        </button>
      </div>

      {/* Inventory Grid */}
      <div className="inventory-grid">
        <AnimatePresence mode="popLayout">
          {filteredMenus.map((menu, i) => (
            <motion.div 
              key={menu._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bento-card inventory-item-card"
            >
              <div className="item-visual-box">
                {menu.imageUrl ? <img src={menu.imageUrl} alt={menu.name} /> : <ChefHat size={32} opacity={0.1} />}
                <div className="category-badge">{menu.category}</div>
              </div>
              
              <div className="item-body mt-4">
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="fw-800 m-0">{menu.name}</h5>
                  <button className="icon-btn-round"><MoreVertical size={14} /></button>
                </div>
                <p className="text-muted small mt-2">{menu.description || "Nomenclature description pending"}</p>
                
                <div className="item-stats-grid mt-4">
                  <div className="stat-mini">
                    <span className="tiny-caps">Stock</span>
                    <span className={`fw-800 ${menu.currentQty <= menu.minimumQty ? 'text-danger' : 'text-main'}`}>
                      {menu.currentQty} / {menu.minimumQty}
                    </span>
                  </div>
                  <div className="stat-mini">
                    <span className="tiny-caps">Valuation</span>
                    <span className="fw-800 text-indigo">{symbol}{menu.price}</span>
                  </div>
                </div>

                <div className="stock-progress-bar mt-3">
                   <div 
                    className={`progress-fill ${menu.currentQty <= menu.minimumQty ? 'danger' : ''}`} 
                    style={{ width: `${Math.min(100, (menu.currentQty / (menu.minimumQty * 3)) * 100)}%` }}
                   />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="pos-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="pos-payment-card"
              style={{ maxWidth: '600px' }}
            >
              <header className="d-flex justify-content-between align-items-center mb-5">
                <h3 className="fw-800 m-0">Register Asset</h3>
                <button className="close-btn-pos" onClick={() => setShowAddModal(false)}><X size={20} /></button>
              </header>

              <form onSubmit={handleCreate} className="row g-4">
                <div className="col-12">
                  <label className="tiny-caps mb-2 d-block">Dish Nomenclature</label>
                  <input type="text" className="pos-input" required value={newMenu.name} onChange={(e) => setNewMenu({...newMenu, name: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="tiny-caps mb-2 d-block">Retail Price ({symbol})</label>
                  <input type="number" className="pos-input" required value={newMenu.price} onChange={(e) => setNewMenu({...newMenu, price: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="tiny-caps mb-2 d-block">Procurement Cost ({symbol})</label>
                  <input type="number" className="pos-input" required value={newMenu.cost} onChange={(e) => setNewMenu({...newMenu, cost: e.target.value})} />
                </div>
                <div className="col-12">
                  <label className="tiny-caps mb-2 d-block">Category</label>
                  <input type="text" className="pos-input" value={newMenu.category} onChange={(e) => setNewMenu({...newMenu, category: e.target.value})} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn-indigo w-100 py-3 justify-content-center">
                    <span>COMMIT TO CATALOG</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .inventory-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        .inventory-item-card { transition: 0.3s; padding: 20px; }
        .inventory-item-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        .item-visual-box { height: 160px; background: #f8fafc; border-radius: 20px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .item-visual-box img { width: 100%; height: 100%; object-fit: cover; }
        .category-badge { position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,0.9); padding: 4px 12px; border-radius: 50px; font-size: 0.65rem; font-weight: 800; color: var(--p-indigo-600); }
        .item-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .stat-mini { display: flex; flex-direction: column; }
        .stock-progress-bar { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--p-indigo-600); border-radius: 10px; transition: 0.5s; }
        .progress-fill.danger { background: var(--danger); }
        .search-bar-modern { background: white; border-radius: 16px; padding: 12px 20px; border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 12px; }
        .search-bar-modern input { border: none; outline: none; flex: 1; font-weight: 600; font-size: 0.9rem; }
        .filter-pill-modern { background: white; border-radius: 16px; padding: 12px 20px; border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 10px; }
        .filter-pill-modern select { border: none; outline: none; font-weight: 800; font-size: 0.8rem; }
      `}</style>
    </motion.div>
  );
};

export default MenuManagement;