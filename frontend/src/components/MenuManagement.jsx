import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreatableSelect from "react-select/creatable";
import makeAnimated from "react-select/animated";
import {
  FaUtensils,
  FaLayerGroup,
  FaBoxes,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaDollarSign,
  FaTags
} from "react-icons/fa";

const animatedComponents = makeAnimated();

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
  const [editImage, setEditImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editPreview, setEditPreview] = useState("");
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockMenu, setRestockMenu] = useState(null);
  const [restockAmount, setRestockAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [bulkRestockOpen, setBulkRestockOpen] = useState(false);
  const [bulkRestockAmount, setBulkRestockAmount] = useState(0);

  const symbol = localStorage.getItem("currencySymbol") || "$";

  useEffect(() => {
    fetchMenus();
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

      const menuData = res.data || [];
      setMenus(menuData);

      const uniqueCats = [...new Set(menuData.map((menu) => menu.category).filter(Boolean))];
      const options = uniqueCats.map((cat) => ({ value: cat, label: cat }));

      if (options.length === 0) {
        setCategoryOptions([{ value: "Main Course", label: "Main Course" }]);
      } else {
        setCategoryOptions(options);
      }
    } catch (err) {
      console.error("Failed to load menus:", err.message);
      toast.error("Failed to load menus");
    }
  };

  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || menu.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const allCategories = [...new Set(menus.map((menu) => menu.category).filter(Boolean))];

  const calculateNetProfit = (price, cost) => {
    return (parseFloat(price || 0) - parseFloat(cost || 0)).toFixed(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMenu((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setNewMenu((prev) => ({ ...prev, imageUrl: "" }));
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      setEditPreview(URL.createObjectURL(file));
      setEditData((prev) => ({ ...prev, imageUrl: "" }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!newMenu.name || !newMenu.price) {
      toast.warn("Name and price are required");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    Object.entries(newMenu).forEach(([key, value]) => {
      if (value !== "" && value != null) {
        formData.append(key, value);
      }
    });

    if (image) {
      formData.append("image", image);
    }

    if (!newMenu.currentQty) {
      formData.append("currentQty", newMenu.minimumQty);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/menu",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMenus([...menus, res.data]);
      resetForm();
      toast.success("Menu item added successfully!");
    } catch (err) {
      console.error("Add failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewMenu({
      name: "",
      description: "",
      price: "0",
      cost: "0",
      category: "Main Course",
      minimumQty: 5,
      menuImage: "",
      imageUrl: ""
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
      imageUrl: menu.imageUrl || ""
    });
    setEditImage(null);
    setEditPreview("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

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
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/menu/${editingMenu}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMenus(menus.map((m) => (m._id === editingMenu ? res.data : m)));
      setEditingMenu(null);
      toast.success("Menu updated successfully!");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to update menu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this menu?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/menu/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMenus(menus.filter((m) => m._id !== id));
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

  const handleRestockSubmit = async () => {
    if (restockAmount <= 0) {
      toast.warn("Please enter a valid amount");
      return;
    }

    const updatedAvailableQty = restockMenu.minimumQty + parseInt(restockAmount, 10);
    const updatedCurrentQty = restockMenu.currentQty + parseInt(restockAmount, 10);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/menu/${restockMenu._id}`,
        {
          minimumQty: updatedAvailableQty,
          currentQty: updatedCurrentQty
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMenus(menus.map((m) => (m._id === restockMenu._id ? res.data : m)));
      closeRestockModal();
      toast.success("Menu restocked successfully!");
    } catch (err) {
      console.error("Restock failed:", err.response?.data || err.message);
      toast.error("Failed to restock");
    }
  };

  const handleBulkRestock = async () => {
    if (bulkRestockAmount <= 0) {
      toast.warn("Please enter a valid amount");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://gasmachineserestaurantapp-7aq4.onrender.com/api/auth/menu/restock-all",
        { amount: bulkRestockAmount },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMenus(res.data);
      setBulkRestockOpen(false);
      setBulkRestockAmount(0);
      toast.success(`All items restocked by ${bulkRestockAmount} units!`);
    } catch (err) {
      console.error("Bulk restock failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to restock all items");
    }
  };

  const calculateMenuStatus = (qty) => {
    if (!qty || qty <= 0) return "Out of Stock";
    if (qty <= 5) return "Low Stock";
    return "In Stock";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "In Stock":
        return "status-success";
      case "Low Stock":
        return "status-warning";
      case "Out of Stock":
        return "status-danger";
      default:
        return "";
    }
  };

  const convertGoogleDriveUrl = (url) => {
    const regex = /\/file\/d\/([^/]+)/;
    const match = url.match(regex);

    if (match) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    return url;
  };

  const totalMenus = menus.length;
  const lowStockCount = menus.filter((m) => calculateMenuStatus(m.currentQty) === "Low Stock").length;
  const outOfStockCount = menus.filter((m) => calculateMenuStatus(m.currentQty) === "Out of Stock").length;
  const categoryCount = allCategories.length;

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 54,
      background: "#ffffff",
      borderColor: state.isFocused
        ? "hsla(160, 42%, 40%, 0.55)"
        : "rgba(15, 23, 42, 0.12)",
      boxShadow: state.isFocused
        ? "0 0 0 3px hsla(160, 40%, 42%, 0.14)"
        : "0 1px 2px rgba(15, 23, 42, 0.04)",
      borderRadius: 16,
      color: "#0f172a"
    }),
    menu: (base) => ({
      ...base,
      background: "#ffffff",
      border: "1px solid rgba(15, 23, 42, 0.1)",
      borderRadius: 16,
      overflow: "hidden",
      zIndex: 9999,
      boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)"
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? "hsla(160, 35%, 45%, 0.12)" : "transparent",
      color: "#0f172a",
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
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: "rgba(15, 23, 42, 0.1)"
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#64748b"
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#64748b"
    }),
    multiValue: (base) => ({
      ...base,
      background: "hsla(160, 40%, 42%, 0.14)",
      color: "#0f172a"
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#0f172a"
    })
  };

  return (
    <>
      <style>{`
        .menu-page-wrapper {
          min-height: 100vh;
          background: linear-gradient(165deg, #f0f4f8 0%, #e8f2ee 42%, #f5f7fb 100%);
          color: #0f172a;
          padding-bottom: 32px;
        }

        .menu-page-wrapper .hero-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: #0f172a;
          border-radius: 30px;
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.07);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(14px);
        }

        .menu-page-wrapper .hero-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            hsla(160, 40%, 42%, 0.06),
            transparent 40%,
            rgba(255, 255, 255, 0.04)
          );
          pointer-events: none;
        }

        .menu-page-wrapper .hero-chip {
          display: inline-block;
          background: hsla(160, 40%, 42%, 0.12);
          color: hsl(160, 55%, 24%);
          border: 1px solid hsla(160, 45%, 35%, 0.22);
          padding: 7px 15px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 14px;
          text-transform: uppercase;
        }

        .menu-page-wrapper .hero-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 10px;
          color: #0f172a;
        }

        .menu-page-wrapper .hero-text {
          max-width: 720px;
          color: #64748b;
          margin-bottom: 0;
        }

        .menu-page-wrapper .hero-side-box {
          min-width: 220px;
          padding: 18px 20px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(15, 23, 42, 0.08);
          text-align: center;
          backdrop-filter: blur(10px);
        }

        .menu-page-wrapper .hero-side-box span {
          display: block;
          font-size: 14px;
          text-transform: uppercase;
          color: hsl(160, 42%, 32%);
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }

        .menu-page-wrapper .hero-side-box strong {
          color: #0f172a;
          font-size: 1.75rem;
          font-weight: 800;
        }

        .menu-page-wrapper .mini-card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          padding: 22px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          height: 100%;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
          transition: all 0.25s ease;
        }

        .menu-page-wrapper .mini-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.1);
        }

        .menu-page-wrapper .mini-icon {
          width: 64px;
          height: 64px;
          min-width: 64px;
          border-radius: 22px;
          display: grid;
          place-items: center;
          font-size: 28px;
          color: #fff;
          position: relative;
          transform-style: preserve-3d;
          transform: perspective(220px) rotateX(8deg) rotateY(-5deg);
          border: 1px solid rgba(255, 255, 255, 0.38);
          box-shadow:
            0 5px 0 rgba(15, 23, 42, 0.2),
            0 16px 32px rgba(15, 23, 42, 0.16),
            inset 0 2px 0 rgba(255, 255, 255, 0.55),
            inset 0 -12px 24px rgba(0, 0, 0, 0.14);
        }

        .menu-page-wrapper .mini-icon::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            155deg,
            rgba(255, 255, 255, 0.55) 0%,
            rgba(255, 255, 255, 0.08) 38%,
            transparent 52%
          );
          pointer-events: none;
          z-index: 1;
        }

        .menu-page-wrapper .mini-icon::after {
          content: "";
          position: absolute;
          left: 12%;
          right: 12%;
          bottom: 6px;
          height: 10px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.22);
          filter: blur(6px);
          opacity: 0.55;
          transform: translateZ(-1px);
          pointer-events: none;
          z-index: 0;
        }

        .menu-page-wrapper .mini-icon svg {
          position: relative;
          z-index: 2;
          width: 28px;
          height: 28px;
          filter: drop-shadow(0 3px 2px rgba(0, 0, 0, 0.35))
            drop-shadow(0 1px 0 rgba(255, 255, 255, 0.25));
        }

        .menu-page-wrapper .icon-blue {
          background: linear-gradient(145deg, #60a5fa 0%, #2563eb 42%, #1d4ed8 100%);
        }
        .menu-page-wrapper .icon-cyan {
          background: linear-gradient(145deg, #22d3ee 0%, #0891b2 45%, #0e7490 100%);
        }
        .menu-page-wrapper .icon-yellow {
          background: linear-gradient(145deg, #fbbf24 0%, #d97706 42%, #b45309 100%);
        }
        .menu-page-wrapper .icon-red {
          background: linear-gradient(145deg, #f87171 0%, #dc2626 45%, #b91c1c 100%);
        }

        @media (prefers-reduced-motion: reduce) {
          .menu-page-wrapper .mini-icon {
            transform: none;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
          }
        }

        .menu-page-wrapper .mini-label {
          margin-bottom: 6px;
          color: #64748b;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .menu-page-wrapper .mini-value {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
        }

        .menu-page-wrapper .section-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
          backdrop-filter: blur(12px);
        }

        .menu-page-wrapper .section-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .menu-page-wrapper .section-subtitle {
          color: #64748b;
          margin-bottom: 0;
        }

        .menu-page-wrapper .glass-label {
          font-weight: 700;
          color: #334155;
          margin-bottom: 8px;
          display: block;
        }

        .menu-page-wrapper .glass-input,
        .menu-page-wrapper .glass-select,
        .menu-page-wrapper .glass-textarea {
          background: #ffffff !important;
          border: 1px solid rgba(15, 23, 42, 0.12) !important;
          color: #0f172a !important;
          border-radius: 16px !important;
          min-height: 52px;
          padding: 12px 16px !important;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
        }

        .menu-page-wrapper .glass-textarea {
          min-height: 100px;
        }

        .menu-page-wrapper .glass-input::placeholder,
        .menu-page-wrapper .glass-textarea::placeholder {
          color: #94a3b8 !important;
        }

        .menu-page-wrapper .glass-input:focus,
        .menu-page-wrapper .glass-select:focus,
        .menu-page-wrapper .glass-textarea:focus {
          border-color: hsla(160, 42%, 40%, 0.55) !important;
          box-shadow: 0 0 0 3px hsla(160, 40%, 42%, 0.14) !important;
        }

        .menu-page-wrapper .glass-select option {
          color: #0f172a;
        }

        .menu-page-wrapper .glass-btn {
          border: none;
          border-radius: 16px;
          padding: 12px 18px;
          font-weight: 700;
          color: #fff;
          transition: all 0.25s ease;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
        }

        .menu-page-wrapper .glass-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
          color: #fff;
        }

        .menu-page-wrapper .btn-green {
          background: linear-gradient(135deg, #16a34a, #22c55e);
        }

        .menu-page-wrapper .add-menu-item-btn {
          min-height: 58px;
          min-width: min(100%, 280px);
          padding: 16px 400px;
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          border-radius: 18px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            0 3px 0 rgba(5, 46, 22, 0.14),
            0 14px 32px rgba(22, 163, 74, 0.32);
        }

        .menu-page-wrapper .add-menu-item-btn svg {
          font-size: 1.15rem;
        }

        .menu-page-wrapper .add-menu-item-btn:hover:not(:disabled) {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            0 4px 0 rgba(5, 46, 22, 0.12),
            0 18px 42px rgba(22, 163, 74, 0.38);
        }

        .menu-page-wrapper .add-menu-item-btn:disabled {
          opacity: 0.72;
          transform: none;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
        }
        .menu-page-wrapper .btn-blue {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
        }
        .menu-page-wrapper .btn-red {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }
        .menu-page-wrapper .btn-orange {
          background: linear-gradient(135deg, #d97706, #f59e0b);
        }
        .menu-page-wrapper .btn-slate {
          background: linear-gradient(135deg, #475569, #64748b);
        }

        .menu-page-wrapper .profit-box {
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 18px;
          padding: 14px 16px;
        }

        .menu-page-wrapper .filter-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .menu-page-wrapper .menu-card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 26px;
          overflow: hidden;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
          height: 100%;
          transition: all 0.25s ease;
        }

        .menu-page-wrapper .menu-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.1);
        }

        .menu-page-wrapper .menu-image-wrap {
          height: 180px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .menu-page-wrapper .menu-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 14px;
        }

        .menu-page-wrapper .menu-body {
          padding: 18px;
          display: flex;
          flex-direction: column;
          height: calc(100% - 180px);
        }

        .menu-page-wrapper .menu-name {
          color: #0f172a;
          font-weight: 800;
          font-size: 1.08rem;
          margin-bottom: 4px;
        }

        .menu-page-wrapper .menu-category {
          color: hsl(160, 42%, 32%);
          font-size: 0.86rem;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .menu-page-wrapper .menu-meta {
          color: #475569;
          font-size: 0.92rem;
          line-height: 1.7;
          margin-bottom: 14px;
        }

        .menu-page-wrapper .menu-meta strong {
          color: #0f172a;
        }

        .menu-page-wrapper .status-badge-custom {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 95px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 800;
          border: 1px solid transparent;
        }

        .menu-page-wrapper .status-badge-custom.status-success {
          background: #dcfce7;
          color: #166534;
          border-color: #86efac;
        }

        .menu-page-wrapper .status-badge-custom.status-warning {
          background: #fef3c7;
          color: #92400e;
          border-color: #fcd34d;
        }

        .menu-page-wrapper .status-badge-custom.status-danger {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fecaca;
        }

        .menu-page-wrapper .meta-pill {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 700;
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
        }

        .menu-page-wrapper .card-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: auto;
        }

        .menu-page-wrapper .card-actions .card-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border: 1px solid rgba(255, 255, 255, 0.38);
          border-radius: 16px;
          padding: 11px 10px;
          font-weight: 800;
          font-size: 0.82rem;
          letter-spacing: 0.02em;
          color: #fff;
          cursor: pointer;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
          transform-style: preserve-3d;
          transform: perspective(120px) rotateX(4deg);
          box-shadow:
            0 4px 0 rgba(15, 23, 42, 0.22),
            0 10px 20px rgba(15, 23, 42, 0.14),
            inset 0 2px 0 rgba(255, 255, 255, 0.45),
            inset 0 -8px 16px rgba(0, 0, 0, 0.12);
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
        }

        .menu-page-wrapper .card-actions .card-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            165deg,
            rgba(255, 255, 255, 0.5) 0%,
            rgba(255, 255, 255, 0.06) 40%,
            transparent 55%
          );
          pointer-events: none;
          z-index: 1;
        }

        .menu-page-wrapper .card-actions .card-btn svg {
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 2px 1px rgba(0, 0, 0, 0.35));
        }

        .menu-page-wrapper .card-actions .card-btn.btn-blue {
          background: linear-gradient(145deg, #60a5fa 0%, #2563eb 42%, #1d4ed8 100%);
        }

        .menu-page-wrapper .card-actions .card-btn.btn-red {
          background: linear-gradient(145deg, #f87171 0%, #dc2626 45%, #b91c1c 100%);
        }

        .menu-page-wrapper .card-actions .card-btn.btn-green {
          background: linear-gradient(145deg, #4ade80 0%, #16a34a 42%, #15803d 100%);
        }

        .menu-page-wrapper .card-actions .card-btn:hover {
          transform: perspective(120px) rotateX(2deg) translateY(-2px);
          filter: brightness(1.06);
          box-shadow:
            0 5px 0 rgba(15, 23, 42, 0.2),
            0 14px 26px rgba(15, 23, 42, 0.16),
            inset 0 2px 0 rgba(255, 255, 255, 0.5),
            inset 0 -8px 16px rgba(0, 0, 0, 0.1);
        }

        .menu-page-wrapper .card-actions .card-btn:active {
          transform: perspective(120px) rotateX(0deg) translateY(3px);
          filter: brightness(0.97);
          box-shadow:
            0 1px 0 rgba(15, 23, 42, 0.28),
            0 4px 10px rgba(15, 23, 42, 0.12),
            inset 0 2px 6px rgba(0, 0, 0, 0.18);
        }

        @media (prefers-reduced-motion: reduce) {
          .menu-page-wrapper .card-actions .card-btn {
            transform: none;
          }
          .menu-page-wrapper .card-actions .card-btn:hover {
            transform: translateY(-1px);
          }
          .menu-page-wrapper .card-actions .card-btn:active {
            transform: translateY(1px);
          }
        }

        .menu-page-wrapper .empty-box {
          min-height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #64748b;
        }

        .menu-page-wrapper .empty-box h4 {
          color: #0f172a;
        }

        .menu-page-wrapper .menu-muted {
          color: #64748b;
        }

        .menu-page-wrapper .menu-muted strong {
          color: #0f172a;
        }

        .menu-page-wrapper .empty-icon {
          font-size: 44px;
          margin-bottom: 10px;
        }

        .menu-page-wrapper .modal-glass .modal-content {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 24px;
          color: #0f172a;
          box-shadow: 0 24px 48px rgba(15, 23, 42, 0.15);
        }

        .menu-page-wrapper .modal-glass .modal-header,
        .menu-page-wrapper .modal-glass .modal-footer {
          border-color: rgba(15, 23, 42, 0.08);
        }

        .menu-page-wrapper .modal-glass .modal-title {
          color: #0f172a;
          font-weight: 800;
        }

        .menu-page-wrapper .modal-glass .btn-close {
          filter: none;
        }

        @media (max-width: 992px) {
          .menu-page-wrapper .hero-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .menu-page-wrapper .hero-side-box {
            width: 100%;
          }
        }

        @media (max-width: 576px) {
          .menu-page-wrapper .hero-title {
            font-size: 1.55rem;
          }

          .menu-page-wrapper .hero-card,
          .menu-page-wrapper .section-card,
          .menu-page-wrapper .mini-card,
          .menu-page-wrapper .menu-card {
            border-radius: 20px;
          }

          .menu-page-wrapper .hero-card,
          .menu-page-wrapper .section-card {
            padding: 18px;
          }

          .menu-page-wrapper .card-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="menu-page-wrapper">
        <div className="container py-4">
          <div className="hero-card mb-4">
            <div>
              <span className="hero-chip">Inventory Management</span>
              <h1 className="hero-title">
                <FaUtensils className="me-2" />
                Menu Management
              </h1>
              <p className="hero-text">
                Add, edit, search, filter, and restock menu items in one modern admin dashboard.
              </p>
            </div>

            <div className="hero-side-box">
              <span>Total Items</span>
              <strong>{totalMenus}</strong>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-3 col-md-6">
              <div className="mini-card">
                <div className="mini-icon icon-blue" aria-hidden>
                  <FaUtensils />
                </div>
                <div>
                  <p className="mini-label">Total Menus</p>
                  <h4 className="mini-value">{totalMenus}</h4>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="mini-card">
                <div className="mini-icon icon-cyan" aria-hidden>
                  <FaLayerGroup />
                </div>
                <div>
                  <p className="mini-label">Categories</p>
                  <h4 className="mini-value">{categoryCount}</h4>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="mini-card">
                <div className="mini-icon icon-yellow" aria-hidden>
                  <FaExclamationTriangle />
                </div>
                <div>
                  <p className="mini-label">Low Stock</p>
                  <h4 className="mini-value">{lowStockCount}</h4>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="mini-card">
                <div className="mini-icon icon-red" aria-hidden>
                  <FaTimesCircle />
                </div>
                <div>
                  <p className="mini-label">Out of Stock</p>
                  <h4 className="mini-value">{outOfStockCount}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="section-card mb-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4">
              <div>
                <h4 className="section-title">Create Menu Item</h4>
                <p className="section-subtitle">
                  Add a new food item with pricing, stock, category, image, and profit details.
                </p>
              </div>

              <button
                className="glass-btn btn-green"
                onClick={() => setBulkRestockOpen(true)}
              >
                <FaBoxOpen className="me-2" />
                Restock All Menu Items
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="glass-label">Category</label>
                  <CreatableSelect
                    value={
                      categoryOptions.find((option) => option.value === newMenu.category) || null
                    }
                    onChange={(selectedOption) => {
                      const value = selectedOption ? selectedOption.value : "Main Course";
                      setNewMenu((prev) => ({ ...prev, category: value }));

                      if (
                        selectedOption &&
                        !categoryOptions.some((opt) => opt.value === value)
                      ) {
                        setCategoryOptions((prev) => [...prev, { value, label: value }]);
                      }
                    }}
                    onCreateOption={(inputValue) => {
                      const newOption = { value: inputValue, label: inputValue };
                      setCategoryOptions((prev) => [...prev, newOption]);
                      setNewMenu((prev) => ({ ...prev, category: inputValue }));
                    }}
                    options={categoryOptions}
                    placeholder="Select or create category..."
                    isClearable={false}
                    components={animatedComponents}
                    styles={selectStyles}
                  />
                </div>

                <div className="col-md-6">
                  <label className="glass-label">Menu Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newMenu.name}
                    onChange={handleChange}
                    className="form-control glass-input"
                    placeholder="e.g., Spaghetti Bolognese"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="glass-label">Price *</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    onFocus={(e) => e.target.select()}
                    onWheel={(e) => e.target.blur()}
                    value={newMenu.price}
                    onChange={handleChange}
                    className="form-control glass-input"
                    placeholder="Enter price"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="glass-label">Cost</label>
                  <input
                    type="number"
                    name="cost"
                    step="0.01"
                    min="0"
                    onFocus={(e) => e.target.select()}
                    onWheel={(e) => e.target.blur()}
                    value={newMenu.cost}
                    onChange={handleChange}
                    className="form-control glass-input"
                    placeholder="Enter cost"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="glass-label">Minimum Stock Quantity *</label>
                  <input
                    type="number"
                    name="minimumQty"
                    min="1"
                    onFocus={(e) => e.target.select()}
                    onWheel={(e) => e.target.blur()}
                    value={newMenu.minimumQty}
                    onChange={handleChange}
                    className="form-control glass-input"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="glass-label">Description</label>
                  <textarea
                    name="description"
                    value={newMenu.description}
                    onChange={handleChange}
                    className="form-control glass-textarea"
                    rows="2"
                    placeholder="Optional description..."
                  ></textarea>
                </div>

                <div className="col-12">
                  <label className="glass-label">Paste an Image URL</label>
                  <input
                    type="url"
                    className="form-control glass-input"
                    placeholder="https://example.com/image.jpg"
                    value={newMenu.imageUrl}
                    onChange={(e) =>
                      setNewMenu((prev) => ({ ...prev, imageUrl: e.target.value }))
                    }
                  />
                </div>

                {preview && (
                  <div className="col-12">
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        maxHeight: "220px",
                        objectFit: "cover",
                        borderRadius: "18px",
                        border: "1px solid rgba(255,255,255,0.08)"
                      }}
                    />
                  </div>
                )}

                <div className="col-12">
                  <label className="glass-label">Net Profit</label>
                  <div className="profit-box">
                    <strong
                      className={
                        parseFloat(calculateNetProfit(newMenu.price, newMenu.cost)) >= 0
                          ? "text-success"
                          : "text-danger"
                      }
                    >
                      {symbol}
                      {calculateNetProfit(newMenu.price, newMenu.cost)}
                    </strong>
                  </div>
                </div>

                <div className="col-12 d-flex justify-content-center pt-1">
                  <button
                    type="submit"
                    className="glass-btn btn-green add-menu-item-btn d-inline-flex align-items-center justify-content-center"
                    disabled={loading}
                  >
                    <FaPlus className="me-2" aria-hidden />
                    {loading ? "Uploading..." : "Add Menu Item"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="section-card mb-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4">
              <div>
                <h4 className="section-title">Search & Filter</h4>
                <p className="section-subtitle">
                  Find menu items quickly by category or menu name.
                </p>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="glass-label">Filter by Category</label>
                <select
                  className="form-select glass-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {allCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-8">
                <label className="glass-label">Search Menu</label>
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid rgba(15, 23, 42, 0.12)",
                      color: "#475569",
                      borderRadius: "16px 0 0 16px"
                    }}
                  >
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control glass-input"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderRadius: "0 16px 16px 0" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {filteredMenus.length === 0 ? (
            <div className="section-card">
              <div className="empty-box">
                <div className="empty-icon">🍽️</div>
                <h4 className="mb-2">No menu items found</h4>
                <p className="mb-0 menu-muted">Try changing the category or search text.</p>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {filteredMenus.map((menu) => {
                const status = calculateMenuStatus(menu.currentQty);
                const profit = calculateNetProfit(menu.price, menu.cost);

                return (
                  <div key={menu._id} className="col-sm-6 col-lg-4 col-xl-3">
                    <div className="menu-card">
                      <div className="menu-image-wrap">
                        <img
                          src={
                            menu.imageUrl?.startsWith("https")
                              ? convertGoogleDriveUrl(menu.imageUrl)
                              : `${menu.imageUrl}`
                          }
                          alt={menu.name}
                          className="menu-image"
                        />
                      </div>

                      <div className="menu-body">
                        <div className="menu-name">{menu.name}</div>
                        <div className="menu-category">
                          <FaTags className="me-1" />
                          {menu.category}
                        </div>

                        <div className="menu-meta">
                          <div>
                            <strong>Price:</strong> {symbol}
                            {Number(menu.price || 0).toFixed(2)}
                          </div>
                          <div>
                            <strong>Cost:</strong> {symbol}
                            {Number(menu.cost || 0).toFixed(2)}
                          </div>
                          <div>
                            <strong>Profit:</strong>{" "}
                            <span
                              className={
                                parseFloat(profit) >= 0 ? "text-success fw-bold" : "text-danger fw-bold"
                              }
                            >
                              {symbol}
                              {profit}
                            </span>
                          </div>
                          <div>
                            <strong>Available:</strong> {menu.currentQty || 0}
                          </div>
                          <div>
                            <strong>Minimum:</strong> {menu.minimumQty || 5}
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className={`status-badge-custom ${getStatusClass(status)}`}>
                            {status}
                          </span>
                          <span className="meta-pill">
                            <FaBoxes className="me-1" />
                            Stock
                          </span>
                        </div>

                        <div className="card-actions">
                          <button
                            className="card-btn btn-blue"
                            onClick={() => openEditModal(menu)}
                          >
                            <FaEdit className="me-1" />
                            Edit
                          </button>
                          <button
                            className="card-btn btn-red"
                            onClick={() => handleDelete(menu._id)}
                          >
                            <FaTrash className="me-1" />
                            Delete
                          </button>
                          <button
                            className="card-btn btn-green"
                            onClick={() => openRestockModal(menu)}
                          >
                            <FaPlus className="me-1" />
                            Restock
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {editingMenu && (
            <div
              className="modal fade show d-block modal-glass"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Menu</h5>
                    <button className="btn-close" onClick={() => setEditingMenu(null)}></button>
                  </div>

                  <div className="modal-body">
                    <form onSubmit={handleUpdate}>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="glass-label">Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleEditChange}
                            className="form-control glass-input"
                            required
                          />
                        </div>

                        <div className="col-12">
                          <label className="glass-label">Price *</label>
                          <input
                            type="number"
                            name="price"
                            step="0.01"
                            min="0"
                            onFocus={(e) => e.target.select()}
                            onWheel={(e) => e.target.blur()}
                            value={editData.price}
                            onChange={handleEditChange}
                            className="form-control glass-input"
                            required
                          />
                        </div>

                        <div className="col-12">
                          <label className="glass-label">Cost</label>
                          <input
                            type="number"
                            name="cost"
                            step="0.01"
                            min="0"
                            onFocus={(e) => e.target.select()}
                            onWheel={(e) => e.target.blur()}
                            value={editData.cost}
                            onChange={handleEditChange}
                            className="form-control glass-input"
                            required
                          />
                        </div>

                        <div className="col-12">
                          <label className="glass-label">Minimum Qty *</label>
                          <input
                            type="number"
                            name="minimumQty"
                            min="1"
                            onFocus={(e) => e.target.select()}
                            onWheel={(e) => e.target.blur()}
                            value={editData.minimumQty}
                            onChange={handleEditChange}
                            className="form-control glass-input"
                            required
                          />
                        </div>

                        <div className="col-12">
                          <label className="glass-label">Current Stock</label>
                          <input
                            type="number"
                            name="currentQty"
                            min="1"
                            onFocus={(e) => e.target.select()}
                            onWheel={(e) => e.target.blur()}
                            onChange={handleEditChange}
                            value={editData.currentQty}
                            className="form-control glass-input"
                          />
                        </div>

                        <div className="col-12">
                          <label className="glass-label">Category</label>
                          <CreatableSelect
                            value={
                              categoryOptions.find((option) => option.value === editData.category) || {
                                value: editData.category,
                                label: editData.category
                              }
                            }
                            onChange={(selectedOption) => {
                              const value = selectedOption ? selectedOption.value : "Main Course";
                              setEditData((prev) => ({ ...prev, category: value }));

                              if (
                                selectedOption &&
                                !categoryOptions.some((opt) => opt.value === value)
                              ) {
                                setCategoryOptions((prev) => [...prev, { value, label: value }]);
                              }
                            }}
                            onCreateOption={(inputValue) => {
                              const newOption = { value: inputValue, label: inputValue };
                              setCategoryOptions((prev) => [...prev, newOption]);
                              setEditData((prev) => ({ ...prev, category: inputValue }));
                            }}
                            options={categoryOptions}
                            placeholder="Select or create category..."
                            isClearable={false}
                            components={animatedComponents}
                            styles={selectStyles}
                          />
                        </div>

                        <div className="col-12">
                          <label className="glass-label">Paste image URL</label>
                          <input
                            type="url"
                            className="form-control glass-input"
                            placeholder="https://example.com/image.jpg"
                            value={editData.imageUrl || ""}
                            onChange={(e) => {
                              setEditData((prev) => ({ ...prev, imageUrl: e.target.value }));
                              setEditImage(null);
                              setEditPreview("");
                            }}
                          />
                        </div>

                        {editPreview && (
                          <div className="col-12">
                            <img
                              src={editPreview}
                              alt="Edit Preview"
                              style={{
                                width: "100%",
                                maxHeight: "220px",
                                objectFit: "cover",
                                borderRadius: "18px",
                                border: "1px solid rgba(15, 23, 42, 0.1)"
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <button
                          type="submit"
                          className="glass-btn btn-blue w-100"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Menu"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {restockModalOpen && restockMenu && (
            <div
              className="modal fade show d-block modal-glass"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Restock "{restockMenu.name}"</h5>
                    <button className="btn-close" onClick={closeRestockModal}></button>
                  </div>

                  <div className="modal-body">
                    <label className="glass-label">Quantity to Add</label>
                    <input
                      type="number"
                      value={restockAmount}
                      onFocus={(e) => e.target.select()}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => setRestockAmount(parseInt(e.target.value, 10) || 0)}
                      className="form-control glass-input"
                      min="1"
                    />
                  </div>

                  <div className="modal-footer">
                    <button className="glass-btn btn-slate" onClick={closeRestockModal}>
                      Cancel
                    </button>
                    <button className="glass-btn btn-green" onClick={handleRestockSubmit}>
                      Add Stock
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {bulkRestockOpen && (
            <div
              className="modal fade show d-block modal-glass"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Restock All Menu Items</h5>
                    <button className="btn-close" onClick={() => setBulkRestockOpen(false)}></button>
                  </div>

                  <div className="modal-body">
                    <p className="menu-muted mb-3">
                      Enter the quantity to add to <strong>all</strong> menu items:
                    </p>
                    <input
                      type="number"
                      className="form-control glass-input"
                      onFocus={(e) => e.target.select()}
                      onWheel={(e) => e.target.blur()}
                      value={bulkRestockAmount}
                      onChange={(e) => setBulkRestockAmount(parseInt(e.target.value, 10) || 0)}
                      min="1"
                      placeholder="e.g., 10"
                      autoFocus
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      className="glass-btn btn-slate"
                      onClick={() => setBulkRestockOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="glass-btn btn-green"
                      onClick={handleBulkRestock}
                      disabled={bulkRestockAmount <= 0}
                    >
                      Apply to All Items
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ToastContainer position="top-right" autoClose={2500} />
        </div>
      </div>
    </>
  );
};

export default MenuManagement;