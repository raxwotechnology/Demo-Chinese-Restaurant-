import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UtensilsCrossed,
  Layers3,
  TriangleAlert,
  XCircle
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [newMenu, setNewMenu] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    category: "Main Course",
    minimumQty: 5
  });
  const [editingMenu, setEditingMenu] = useState(null);
  const [editData, setEditData] = useState({ ...newMenu });
  const [image, setImage] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editPreview, setEditPreview] = useState("");
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockMenu, setRestockMenu] = useState(null);
  const [restockAmount, setRestockAmount] = useState(0);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/menus`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMenus(res.data);
    } catch (err) {
      console.error("Failed to load menus:", err.message);
    }
  };

  const handleChange = (e) =>
    setNewMenu({ ...newMenu, [e.target.name]: e.target.value });

  const calculateNetProfit = (price, cost) => {
    return (parseFloat(price || 0) - parseFloat(cost || 0)).toFixed(2);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(newMenu).forEach(([key, value]) =>
      formData.append(key, value)
    );
    formData.append("currentQty", newMenu.minimumQty);
    if (image) formData.append("image", image);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/menu`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMenus([...menus, res.data]);
      toast.success("Menu item added successfully!");
      resetForm();
    } catch (err) {
      toast.error("Failed to add menu item");
    }
  };

  const resetForm = () => {
    setNewMenu({
      name: "",
      description: "",
      price: "",
      cost: "",
      category: "Main Course",
      minimumQty: 5
    });
    setImage(null);
    setPreview("");
  };

  const openEditModal = (menu) => {
    setEditingMenu(menu._id);
    setEditData({
      name: menu.name,
      description: menu.description || "",
      price: menu.price,
      cost: menu.cost,
      category: menu.category,
      minimumQty: menu.minimumQty,
      currentQty: menu.currentQty,
      imageUrl: menu.imageUrl
    });
    setEditImage(null);
    setEditPreview("");
  };

  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(editData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    if (editImage) {
      formData.append("image", editImage);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/api/auth/menu/${editingMenu}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMenus(menus.map((m) => (m._id === editingMenu ? res.data : m)));
      toast.success("Menu updated successfully!");
      setEditingMenu(null);
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error("Failed to update menu");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this menu?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/api/auth/menu/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMenus(menus.filter((menu) => menu._id !== id));
      toast.success("Menu deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      toast.error("Failed to delete menu");
    }
  };

  const openRestockModal = (menu) => {
    setRestockMenu(menu);
    setRestockAmount(0);
    setRestockModalOpen(true);
  };

  const closeRestockModal = () => {
    setRestockModalOpen(false);
    setRestockMenu(null);
    setRestockAmount(0);
  };

  const sendNotification = (type, message) => {
    const iconMap = {
      stock: "📦",
      update: "🔧",
      order: "🛒"
    };

    toast.info(`${iconMap[type] || "🔔"} ${message}`, {
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  };

  const handleRestockSubmit = async () => {
    if (restockAmount <= 0) {
      alert("Please enter a valid restock amount");
      return;
    }

    const updatedAvailableQty =
      Number(restockMenu.minimumQty) + Number(restockAmount);
    const updatedCurrentQty =
      Number(restockMenu.currentQty) + Number(restockAmount);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${API_BASE_URL}/api/auth/menu/${restockMenu._id}`,
        {
          minimumQty: updatedAvailableQty,
          currentQty: updatedCurrentQty
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMenus(menus.map((m) => (m._id === restockMenu._id ? res.data : m)));
      toast.success("Menu restocked successfully!");
      sendNotification("stock", `Stock updated for "${restockMenu.name}"`);
      closeRestockModal();
    } catch (err) {
      console.error("Restock failed:", err.response?.data || err.message);
      alert("Failed to restock");
    }
  };

  const totalMenus = menus.length;
  const totalCategories = [...new Set(menus.map((m) => m.category))].length;
  const lowStockCount = menus.filter((m) => m.menuStatus === "Low Stock").length;
  const outOfStockCount = menus.filter(
    (m) => m.menuStatus === "Out of Stock"
  ).length;

  return (
    <div className="container-fluid py-4">
      <ToastContainer />

      <style>{`
        .icon-3d-box {
          width: 64px;
          height: 64px;
          min-width: 64px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          position: relative;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.35),
            0 14px 24px rgba(15, 23, 42, 0.16),
            0 6px 10px rgba(15, 23, 42, 0.08);
        }

        .icon-3d-box::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 18px;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.28),
            rgba(255,255,255,0.03)
          );
          pointer-events: none;
        }

        .icon-3d-box::after {
          content: "";
          position: absolute;
          left: 10px;
          right: 10px;
          top: 8px;
          height: 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.20);
          filter: blur(1px);
        }

        .icon-3d-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .icon-3d-inner svg {
          width: 26px;
          height: 26px;
          stroke-width: 2.4;
          filter: drop-shadow(0 2px 1px rgba(0,0,0,0.18));
        }

        .icon-blue {
          background: linear-gradient(145deg, #4f8cff 0%, #2563eb 55%, #1d4ed8 100%);
        }

        .icon-cyan {
          background: linear-gradient(145deg, #22d3ee 0%, #0891b2 55%, #0e7490 100%);
        }

        .icon-orange {
          background: linear-gradient(145deg, #f59e0b 0%, #d97706 55%, #b45309 100%);
        }

        .icon-red {
          background: linear-gradient(145deg, #f87171 0%, #dc2626 55%, #b91c1c 100%);
        }

        .stats-label {
          font-size: 0.95rem;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 4px;
        }

        .stats-value {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          line-height: 1;
        }
      `}</style>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-3d-box icon-blue">
                <div className="icon-3d-inner">
                  <UtensilsCrossed />
                </div>
              </div>
              <div>
                <div className="stats-label">Total Menus</div>
                <h4 className="stats-value">{totalMenus}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-3d-box icon-cyan">
                <div className="icon-3d-inner">
                  <Layers3 />
                </div>
              </div>
              <div>
                <div className="stats-label">Categories</div>
                <h4 className="stats-value">{totalCategories}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-3d-box icon-orange">
                <div className="icon-3d-inner">
                  <TriangleAlert />
                </div>
              </div>
              <div>
                <div className="stats-label">Low Stock</div>
                <h4 className="stats-value">{lowStockCount}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-3d-box icon-red">
                <div className="icon-3d-inner">
                  <XCircle />
                </div>
              </div>
              <div>
                <div className="stats-label">Out of Stock</div>
                <h4 className="stats-value">{outOfStockCount}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleCreate} className="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <h4 className="fw-bold mb-3">Create Menu Item</h4>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Category</label>
            <select
              name="category"
              value={newMenu.category}
              onChange={handleChange}
              className="form-select rounded-4"
            >
              <option>Main Course</option>
              <option>Appetizer</option>
              <option>Dessert</option>
              <option>Drink</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Menu Name *</label>
            <input
              type="text"
              name="name"
              value={newMenu.name}
              onChange={handleChange}
              className="form-control rounded-4"
              placeholder="e.g., Spaghetti Bolognese"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Price *</label>
            <input
              type="number"
              name="price"
              value={newMenu.price}
              onChange={handleChange}
              className="form-control rounded-4"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Cost</label>
            <input
              type="number"
              name="cost"
              value={newMenu.cost}
              onChange={handleChange}
              className="form-control rounded-4"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Minimum Stock Quantity *</label>
            <input
              type="number"
              name="minimumQty"
              value={newMenu.minimumQty}
              onChange={handleChange}
              className="form-control rounded-4"
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold">Description</label>
            <textarea
              name="description"
              value={newMenu.description}
              onChange={handleChange}
              className="form-control rounded-4"
              rows="4"
              placeholder="Optional description..."
            ></textarea>
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold">Paste an Image URL</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (!e.target.files[0]) return;
                setImage(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
              className="form-control rounded-4"
            />
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-success px-4 rounded-4">
              Add Menu Item
            </button>
          </div>
        </div>
      </form>

      <div className="row g-4">
        {menus.map((menu) => (
          <div key={menu._id} className="col-md-6 col-lg-4 col-xl-3">
            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
              <img
                src={`${API_BASE_URL}${menu.imageUrl}`}
                alt={menu.name}
                style={{ height: "220px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="fw-bold">{menu.name}</h5>
                <p className="mb-1"><strong>Price:</strong> ${menu.price?.toFixed(2)}</p>
                <p className="mb-1"><strong>Cost:</strong> ${menu.cost?.toFixed(2) || "0.00"}</p>
                <p className="mb-1 text-success fw-bold">
                  <strong>Profit:</strong> ${calculateNetProfit(menu.price, menu.cost)}
                </p>
                <p className="mb-1"><strong>Available:</strong> {menu.currentQty}</p>
                <p className="mb-3"><strong>Minimum:</strong> {menu.minimumQty}</p>

                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-primary rounded-4"
                    onClick={() => openEditModal(menu)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger rounded-4"
                    onClick={() => handleDelete(menu._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-success rounded-4"
                    onClick={() => openRestockModal(menu)}
                  >
                    Restock
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {restockModalOpen && restockMenu && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Restock "{restockMenu.name}"</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeRestockModal}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label fw-semibold">Enter Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                  className="form-control rounded-4"
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary rounded-4" onClick={closeRestockModal}>
                  Cancel
                </button>
                <button className="btn btn-success rounded-4" onClick={handleRestockSubmit}>
                  Add Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingMenu && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Edit Menu</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingMenu(null)}
                ></button>
              </div>

              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                        className="form-control rounded-4"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Category</label>
                      <select
                        name="category"
                        value={editData.category}
                        onChange={handleEditChange}
                        className="form-select rounded-4"
                      >
                        <option>Main Course</option>
                        <option>Appetizer</option>
                        <option>Dessert</option>
                        <option>Drink</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Price</label>
                      <input
                        type="number"
                        name="price"
                        value={editData.price}
                        onChange={handleEditChange}
                        className="form-control rounded-4"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Cost</label>
                      <input
                        type="number"
                        name="cost"
                        value={editData.cost}
                        onChange={handleEditChange}
                        className="form-control rounded-4"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Minimum Quantity</label>
                      <input
                        type="number"
                        name="minimumQty"
                        value={editData.minimumQty}
                        onChange={handleEditChange}
                        className="form-control rounded-4"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea
                        name="description"
                        value={editData.description}
                        onChange={handleEditChange}
                        className="form-control rounded-4"
                        rows="3"
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Change Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (!e.target.files[0]) return;
                          setEditImage(e.target.files[0]);
                          setEditPreview(URL.createObjectURL(e.target.files[0]));
                        }}
                        className="form-control rounded-4"
                      />
                    </div>

                    <div className="col-12">
                      <img
                        src={
                          editPreview ||
                          `${API_BASE_URL}${editData.imageUrl}`
                        }
                        alt="Preview"
                        className="img-fluid rounded-4"
                        style={{ maxHeight: "220px", objectFit: "cover" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary rounded-4"
                    onClick={() => setEditingMenu(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-4">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;