import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUtensils,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaDollarSign,
  FaTags,
  FaFilter,
  FaLayerGroup
} from "react-icons/fa";
import "../styles/PremiumUI.css";

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [newMenu, setNewMenu] = useState({
    name: "",
    description: "",
    price: "0",
    cost: "0",
    category: "Main Course",
    minimumQty: 5,
    imageUrl: ""
  });
  const [editingMenu, setEditingMenu] = useState(null);
  const [editData, setEditData] = useState({ ...newMenu });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/menus", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenus(res.data || []);
    } catch (err) {
      toast.error("Failed to load menus");
    }
  };

  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || menu.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const allCategories = [...new Set(menus.map((menu) => menu.category).filter(Boolean))];

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    Object.entries(newMenu).forEach(([key, value]) => formData.append(key, value));
    if (image) formData.append("image", image);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/menu", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
      });
      setMenus([...menus, res.data]);
      setShowAddModal(false);
      resetForm();
      toast.success("Menu item added!");
    } catch (err) {
      toast.error("Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenus(menus.filter((m) => m._id !== id));
      toast.success("Item deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const resetForm = () => {
    setNewMenu({ name: "", description: "", price: "0", cost: "0", category: "Main Course", minimumQty: 5, imageUrl: "" });
    setImage(null);
    setPreview("");
  };

  return (
    <div className="menu-management-container animate-fade-in">
      <ToastContainer theme="dark" />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-4">
        <div>
          <h1 className="premium-title mb-1">Culinaries & Menu</h1>
          <p className="premium-subtitle mb-0">Manage your restaurant offerings and stock levels</p>
        </div>
        <button className="btn-premium btn-premium-secondary px-4 py-3" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Add New Creation
        </button>
      </div>

      {/* Stats Quick Look */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
            <div className="orient-card orient-stat-card py-3">
                <div className="orient-stat-icon bg-blue-glow"><FaUtensils size={20} /></div>
                <div>
                    <div className="orient-stat-label">Total Items</div>
                    <div className="orient-stat-value" style={{ fontSize: '1.4rem' }}>{menus.length}</div>
                </div>
            </div>
        </div>
        <div className="col-md-3">
            <div className="orient-card orient-stat-card py-3">
                <div className="orient-stat-icon bg-gold-glow"><FaLayerGroup size={20} /></div>
                <div>
                    <div className="orient-stat-label">Categories</div>
                    <div className="orient-stat-value" style={{ fontSize: '1.4rem' }}>{allCategories.length}</div>
                </div>
            </div>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card mb-5 p-4">
        <div className="row g-4 align-items-center">
            <div className="col-md-6">
                <div className="position-relative">
                    <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <input 
                        type="text" 
                        className="premium-input ps-5" 
                        placeholder="Search for a dish..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="col-md-6 d-flex gap-3">
                <div className="flex-grow-1 position-relative">
                    <FaFilter className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <select 
                        className="premium-input premium-select ps-5"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Collections</option>
                        {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="row g-4">
        {filteredMenus.map((menu) => (
          <div className="col-xl-3 col-lg-4 col-md-6" key={menu._id}>
            <div className="orient-card p-0 overflow-hidden h-100 d-flex flex-column">
              <div className="menu-image-wrap">
                {menu.imageUrl ? (
                    <img src={menu.imageUrl} alt={menu.name} className="w-100 h-100 object-fit-cover" />
                ) : (
                    <FaUtensils size={40} className="text-muted opacity-20" />
                )}
                <div className="category-badge">{menu.category}</div>
              </div>
              <div className="p-4 flex-grow-1 d-flex flex-column">
                <h5 className="text-white mb-2 fw-bold">{menu.name}</h5>
                <p className="orient-text-muted small mb-3 flex-grow-1">{menu.description || "No description provided for this culinary creation."}</p>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="price-tag text-gold fw-bold fs-5">{symbol}{menu.price}</div>
                    <div className={`badge-premium ${menu.currentQty > 5 ? 'badge-success' : 'badge-danger'}`}>
                        {menu.currentQty} In Stock
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn-premium btn-premium-accent flex-grow-1 py-2" style={{ fontSize: '0.8rem' }} onClick={() => {}}>
                        <FaEdit /> Edit
                    </button>
                    <button className="btn-premium btn-premium-primary py-2" onClick={() => handleDelete(menu._id)}>
                        <FaTrash />
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="premium-modal-overlay animate-fade-in">
            <div className="premium-modal">
                <h3 className="premium-title mb-4">New Creation</h3>
                <form onSubmit={handleCreate} className="row g-3">
                    <div className="col-12">
                        <label className="orient-stat-label">Item Name</label>
                        <input type="text" className="premium-input" required value={newMenu.name} onChange={(e) => setNewMenu({...newMenu, name: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                        <label className="orient-stat-label">Price ({symbol})</label>
                        <input type="number" className="premium-input" required value={newMenu.price} onChange={(e) => setNewMenu({...newMenu, price: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                        <label className="orient-stat-label">Cost ({symbol})</label>
                        <input type="number" className="premium-input" value={newMenu.cost} onChange={(e) => setNewMenu({...newMenu, cost: e.target.value})} />
                    </div>
                    <div className="col-12">
                        <label className="orient-stat-label">Category</label>
                        <input type="text" className="premium-input" value={newMenu.category} onChange={(e) => setNewMenu({...newMenu, category: e.target.value})} />
                    </div>
                    <div className="col-12">
                        <label className="orient-stat-label">Description</label>
                        <textarea className="premium-input" rows="3" value={newMenu.description} onChange={(e) => setNewMenu({...newMenu, description: e.target.value})}></textarea>
                    </div>
                    <div className="col-12 d-flex gap-3 mt-4">
                        <button type="submit" className="btn-premium btn-premium-secondary flex-grow-1" disabled={loading}>
                            {loading ? "Creating..." : "Save Creation"}
                        </button>
                        <button type="button" className="btn-premium btn-premium-primary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <style>{`
        .menu-image-wrap { height: 180px; position: relative; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; }
        .category-badge { position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; color: var(--orient-gold); }
      `}</style>
    </div>
  );
};

export default MenuManagement;