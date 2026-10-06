"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [supports, setSupports] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const openAddProductModal = () => {
    setIsEditing(false);
    setEditingProductId(null);
    setNewProduct({ name: '', price: '', quantity: '', image: '', category_id: '' });
    setImagePreview('');
    setShowProductForm(true);
  };

  const openEditProductModal = (product: any) => {
    setIsEditing(true);
    setEditingProductId(product._id || product.id);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      image: product.image || '',
      category_id: product.category_id || ''
    });
    setImagePreview(product.image || '');
    setShowProductForm(true);
  };
  
  const [searchOrderCode, setSearchOrderCode] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [showProductForm, setShowProductForm] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [newProduct, setNewProduct] = useState({ 
    name: '', price: '', quantity: '', image: '', category_id: '' 
  });

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  
  const [newProject, setNewProject] = useState<{title: string, description: string, details: string, images: string[]}>({ 
    title: '', description: '', details: '', images: [] 
  });

  const [selectedSupport, setSelectedSupport] = useState<any>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  // STATE MỚI ĐỂ QUẢN LÝ GIAO DIỆN CHAT TRÊN ĐIỆN THOẠI
  const [showMobileChat, setShowMobileChat] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('camera_bn_cart'); 
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const timestamp = new Date().getTime();
      const [prodRes, catRes, ordRes, usrRes, revRes, supRes, projRes] = await Promise.all([
        fetch(`/api/products?t=${timestamp}`), 
        fetch(`/api/categories?t=${timestamp}`), 
        fetch(`/api/orders?t=${timestamp}`), 
        fetch(`/api/users?t=${timestamp}`), 
        fetch(`/api/reviews?t=${timestamp}`).catch(() => ({ ok: false, json: () => [] })), 
        fetch(`/api/supports?t=${timestamp}`).catch(() => ({ ok: false, json: () => [] })),
        fetch(`/api/projects?t=${timestamp}`).catch(() => ({ ok: false, json: () => [] })) 
      ]);
      
      if(prodRes.ok) setProducts(await prodRes.json());
      if(catRes.ok) setCategories(await catRes.json());
      if(ordRes.ok) setOrders(await ordRes.json());
      if(usrRes.ok) setUsers(await usrRes.json());
      if(revRes.ok) setReviews(await revRes.json());
      if(supRes.ok) setSupports(await supRes.json());
      if(projRes.ok) setProjects(await projRes.json());
    } catch (error) {
      console.log("Lỗi tải dữ liệu");
    }
    setIsLoading(false);
  };

  const handleSyncAll = async () => {
    if (!window.confirm("Đồng bộ toàn bộ dữ liệu từ db.json lên MongoDB? (Sẽ chép đè dữ liệu mới)")) return;
    setIsLoading(true);
    try {
      await fetch('/api/seed');
      alert("Đã đồng bộ xong TOÀN BỘ!");
      fetchAllData();
    } catch (error) { alert("Lỗi đồng bộ!"); }
    setIsLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewProduct({ ...newProduct, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.image) return alert("Vui lòng tải lên hình ảnh sản phẩm!");
    
    try {
      if (isEditing && editingProductId) {
        const res = await fetch(`/api/products?id=${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              ...newProduct, 
              price: Number(newProduct.price), 
              quantity: Number(newProduct.quantity) 
          })
        });
        if(res.ok) alert("Cập nhật sản phẩm thành công!");
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              ...newProduct, 
              price: Number(newProduct.price), 
              quantity: Number(newProduct.quantity) 
          })
        });
        if(res.ok) alert("Thêm sản phẩm mới thành công!");
      }

      setShowProductForm(false);
      setNewProduct({ name: '', price: '', quantity: '', image: '', category_id: '' });
      setImagePreview('');
      setIsEditing(false);
      setEditingProductId(null);
      fetchAllData(); 
    } catch (e) { alert("Lỗi khi lưu sản phẩm"); }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("⚠️ Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống không?")) {
      try {
        const res = await fetch(`/api/products?id=${productId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          alert("Đã xóa sản phẩm thành công!");
          fetchAllData(); 
        } else {
          alert("Xóa thất bại! API trả về lỗi hoặc không tìm thấy sản phẩm trên DB.");
        }
      } catch (error) {
        console.error(error);
        alert("Lỗi mạng hoặc chưa có API DELETE!");
      }
    }
  };

  const handleAddCategory = async () => {
    const name = window.prompt("Nhập tên danh mục mới:");
    if (!name) return;
    try {
      await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      fetchAllData();
    } catch (e) { alert("Lỗi thêm danh mục"); }
  };

  const handleEditCategory = async (cat: any) => {
    const newName = window.prompt("Sửa tên danh mục:", cat.name);
    if (!newName || newName === cat.name) return;
    try {
      const res = await fetch(`/api/categories?id=${cat._id || cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if(res.ok) {
        alert("Cập nhật danh mục thành công!");
        fetchAllData();
      } else alert("Lỗi cập nhật!");
    } catch (e) { alert("Lỗi mạng"); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này? Các sản phẩm thuộc danh mục có thể bị ảnh hưởng!")) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if(res.ok) {
        alert("Đã xóa danh mục!");
        fetchAllData();
      } else alert("Lỗi khi xóa!");
    } catch (e) { alert("Lỗi mạng"); }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders?id=${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if(res.ok) {
        alert(`Đã chuyển trạng thái thành: ${newStatus}.`);
        fetchAllData();
      } else alert("Lỗi cập nhật trạng thái");
    } catch (e) { alert("Lỗi mạng"); }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn hủy và xóa vĩnh viễn đơn hàng này?")) return;
    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
      if(res.ok) {
        alert("Đã xóa đơn hàng!");
        fetchAllData();
      } else alert("Lỗi khi xóa đơn hàng!");
    } catch (e) { alert("Lỗi mạng"); }
  };

  const handleEditUser = async (userId: string, currentUser: any) => {
    const newName = window.prompt(`Sửa Tên:`, currentUser.username || "");
    if(newName === null) return;
    const newEmail = window.prompt(`Sửa Email:`, currentUser.email || "");
    if(newEmail === null) return;
    const newPhone = window.prompt(`Sửa SĐT:`, currentUser.phone || "");
    if(newPhone === null) return;

    try {
      const res = await fetch(`/api/users?id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newName, email: newEmail, phone: newPhone })
      });
      if(res.ok) {
        alert("Đã cập nhật thông tin khách hàng!");
        fetchAllData();
      } else alert("Lỗi cập nhật thông tin!");
    } catch (e) { alert("Lỗi mạng"); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("⚠ Bạn có chắc chắn muốn xóa khách hàng này khỏi hệ thống không?")) {
      try {
        const res = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
        if(res.ok) {
          alert("Đã xóa khách hàng thành công!");
          fetchAllData();
        } else {
          alert("Xóa thất bại! API trả về lỗi.");
        }
      } catch (error) {
        console.log("Lỗi kết nối");
      }
    }
  };

  const openAddProjectModal = () => {
    setIsEditingProject(false); setEditingProjectId(null);
    setNewProject({ title: '', description: '', details: '', images: [] });
    setShowProjectForm(true);
  };

  const openEditProjectModal = (proj: any) => {
    setIsEditingProject(true); setEditingProjectId(proj._id || proj.id);
    setNewProject({
      title: proj.title,
      description: proj.description,
      details: Array.isArray(proj.details) ? proj.details.join('\n') : proj.details,
      images: Array.isArray(proj.images) ? proj.images : []
    });
    setShowProjectForm(true);
  };

  const handleProjectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewProject(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeProjectImage = (indexToRemove: number) => {
    setNewProject(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.images.length === 0) return alert("Vui lòng tải lên ít nhất 1 hình ảnh dự án!");

    const payload = {
      title: newProject.title,
      description: newProject.description,
      details: newProject.details.split('\n').map(s => s.trim()).filter(s => s),
      images: newProject.images 
    };

    try {
      if (isEditingProject && editingProjectId) {
        const res = await fetch(`/api/projects?id=${editingProjectId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if(res.ok) alert("Cập nhật dự án thành công!");
      } else {
        const res = await fetch('/api/projects', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if(res.ok) alert("Thêm dự án thành công!");
      }
      setShowProjectForm(false);
      fetchAllData();
    } catch(e) { alert("Lỗi khi lưu dự án!"); }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("⚠️ Bạn có chắc chắn muốn xóa dự án này?")) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if(res.ok) {
        alert("Đã xóa dự án thành công!");
        fetchAllData();
      } else alert("Lỗi xóa dự án!");
    } catch (e) { alert("Lỗi mạng!"); }
  };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status === 'Đã hủy') return sum;
    return sum + Number(order.total_money || order.total || 0);
  }, 0);
  const totalProducts = products.length;
  const totalInventory = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
  
  const productSalesCount: { [key: string]: number } = {};
  orders.forEach(order => {
    if (order.status !== 'Đã hủy' && order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const shortName = item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name;
        productSalesCount[shortName] = (productSalesCount[shortName] || 0) + Number(item.cartQty || 1);
      });
    }
  });

  const topProducts = Object.entries(productSalesCount).sort(([, a], [, b]) => b - a).slice(0, 5);
  const topProductNames = topProducts.map(([name]) => name);
  const topProductValues = topProducts.map(([, qty]) => qty);
  const totalItemsSoldForChart = topProductValues.reduce((sum, val) => sum + val, 0);

  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];
  let gradientString = "";
  let currentPercentage = 0;
  if(totalItemsSoldForChart > 0) {
    topProductValues.forEach((val, i) => {
      const percentage = (val / totalItemsSoldForChart) * 100;
      gradientString += `${colors[i % colors.length]} ${currentPercentage}% ${currentPercentage + percentage}%, `;
      currentPercentage += percentage;
    });
    gradientString = gradientString.slice(0, -2);
  } else { gradientString = "#e2e8f0 0% 100%"; }

  const availableYears = Array.from(new Set(orders.map(order => {
    if (order.createdAt) {
      const d = new Date(order.createdAt);
      if (!isNaN(d.getTime())) return d.getFullYear();
    }
    return new Date().getFullYear();
  }))).sort((a, b) => b - a); 

  if (availableYears.length === 0) availableYears.push(new Date().getFullYear());

  const monthlyRevenue = Array(12).fill(0);
  orders.forEach(order => {
    if (order.status !== 'Đã hủy') { 
      let orderYear = new Date().getFullYear(); 
      let orderMonth = 0; 
      if (order.createdAt) {
        const d = new Date(order.createdAt);
        if (!isNaN(d.getTime())) { orderYear = d.getFullYear(); orderMonth = d.getMonth(); }
      }
      if (orderYear === selectedYear) {
        monthlyRevenue[orderMonth] += Number(order.total_money || order.total || 0);
      }
    }
  });

  const maxRevenue = Math.max(...monthlyRevenue, 1); 

  return (
    <>
<style>{`
        .admin-layout { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Segoe UI', sans-serif; }
        .admin-sidebar { width: 250px; background: #1e293b; color: white; display: flex; flex-direction: column; position: fixed; height: 100vh; overflow-y: auto; z-index: 100;}
        .admin-logo { padding: 25px 20px; text-align: center; border-bottom: 1px solid #334155; }
        .admin-logo h2 { color: #38bdf8; font-size: 20px; margin-bottom: 5px; display: flex; align-items: center; justify-content: center; gap: 10px;}
        .admin-menu { list-style: none; padding: 15px 0; flex: 1; }
        .admin-menu li { padding: 15px 25px; cursor: pointer; display: flex; align-items: center; gap: 15px; font-weight: 600; color: #cbd5e1; transition: 0.3s; font-size: 14px;}
        .admin-menu li:hover, .admin-menu li.active { background: #0f172a; color: #38bdf8; border-left: 4px solid #38bdf8; }
        
        .admin-home-link { padding: 15px 25px; background: #0f172a; cursor: pointer; text-align: center; font-weight: bold; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 10px; text-decoration: none; border-top: 1px solid #334155; transition: 0.2s; margin-top: auto;}
        .admin-home-link:hover { color: #38bdf8; background: #1e293b; }
        .admin-logout { padding: 15px 25px; background: #ef4444; border-top: 1px solid #b91c1c; cursor: pointer; text-align: center; font-weight: bold; color: white; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.2s;}
        .admin-logout:hover { background: #dc2626; }
        
        .admin-main { flex: 1; margin-left: 250px; padding: 30px; width: calc(100% - 250px); overflow-x: hidden; }
        
        .stat-grid { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; flex: 1; min-width: 200px; border-bottom: 4px solid #3b82f6;}
        .stat-card:nth-child(2) { border-bottom-color: #10b981; }
        .stat-card:nth-child(3) { border-bottom-color: #f59e0b; }
        .stat-card:nth-child(4) { border-bottom-color: #a855f7; }
        .stat-card h3 { font-size: 13px; color: #64748b; margin-bottom: 15px; font-weight: 700;}
        .stat-card .value { font-size: 28px; font-weight: 800; color: #1e293b; }
        
        .chart-container { display: flex; gap: 20px; margin-bottom: 30px; }
        
        .chart-box { background: white; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; flex: 2; height: 400px; display: flex; flex-direction: column; justify-content: space-between;}
        .chart-box.small { flex: 1; align-items: center; justify-content: flex-start; height: 400px; overflow-y: auto;}
        
        .bar-chart { height: 260px; width: 100%; display: flex; align-items: flex-end; justify-content: space-around; border-left: 2px solid #e2e8f0; border-bottom: 2px solid #e2e8f0; padding: 20px 10px 0; gap: 10px;}
        
        .bar { width: 35px; background: #3b82f6; border-radius: 4px 4px 0 0; position: relative; transition: 0.3s; }
        .bar:hover { background: #2563eb; }
        .bar span { position: absolute; bottom: -25px; left: 50%; transform: translateX(-50%); font-size: 12px; color: #64748b; font-weight: bold;}
        
        .bar::after {
          content: attr(data-tooltip);
          position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
          background: #1e293b; color: white; padding: 4px 8px; border-radius: 4px;
          font-size: 11px; white-space: nowrap; opacity: 0; pointer-events: none; transition: 0.2s;
          z-index: 10;
        }
        .bar:hover::after { opacity: 1; }

        .admin-card { background: white; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; margin-bottom: 30px; overflow-x: auto; width: 100%; }
        .table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .admin-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .admin-table th { padding: 15px; text-align: left; background: #f8fafc; color: #64748b; font-size: 13px; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
        .admin-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px; vertical-align: middle; }
        
        .proj-title { color: #3b82f6; font-weight: bold; min-width: 150px; }
        .proj-desc { color: #64748b; font-size: 13px; min-width: 250px; }
        
        .action-btn { padding: 6px 12px; border: 1px solid #cbd5e1; background: white; border-radius: 4px; font-size: 12px; cursor: pointer; margin-right: 5px; color: #64748b; white-space: nowrap; }
        .status-select { padding: 6px; border-radius: 4px; border: 1px solid #cbd5e1; outline: none; font-weight: bold; font-size: 12px; cursor: pointer; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); padding: 15px; overflow-y: auto;}
        .modal-content { background: white; padding: 30px; border-radius: 12px; width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);}
        .modal-input { width: 100%; padding: 12px 15px; margin-bottom: 15px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; transition: 0.2s;}
        .modal-input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .upload-area { border: 2px dashed #cbd5e1; border-radius: 8px; background: #f8fafc; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 150px; padding: 20px; cursor: pointer; transition: 0.2s; position: relative; overflow: hidden; }
        
        .chat-bubble-customer { background: #f1f5f9; color: #1e293b; padding: 12px 18px; border-radius: 18px 18px 18px 0; max-width: 75%; font-size: 14px; align-self: flex-start; border: 1px solid #e2e8f0; }
        .chat-bubble-admin { background: #3b82f6; color: white; padding: 12px 18px; border-radius: 18px 18px 0 18px; max-width: 75%; font-size: 14px; align-self: flex-end; box-shadow: 0 2px 5px rgba(59,130,246,0.2); }
        
        .support-box-container { display: flex; height: calc(100vh - 180px); border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .support-list-col { width: 320px; background: #f8fafc; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; }
        .support-chat-col { flex: 1; display: flex; flex-direction: column; background: white; }

        @media (max-width: 768px) {
          .admin-layout { flex-direction: column; }
          .admin-sidebar { width: 100%; position: relative; height: auto; }
          .admin-menu { display: flex; flex-wrap: wrap; justify-content: center; padding: 10px; gap: 5px; }
          .admin-menu li { padding: 8px 12px; border-left: none; border-bottom: 3px solid transparent; font-size: 13px; }
          .admin-menu li:hover, .admin-menu li.active { border-left: none; border-bottom-color: #38bdf8; }
          .admin-main { margin-left: 0; width: 100%; padding: 15px; }
          .chart-container { flex-direction: column; }
          .chart-box { height: auto; min-height: 400px; }
          .bar-chart { height: 250px; } 
          .stat-card { min-width: 100%; }

          .admin-card { padding: 15px; }
          .modal-content { padding: 15px; }
          
          /* CHỈNH LẠI GIAO DIỆN CHAT TRÊN MOBILE (GIỐNG SHOPEE) */
          .support-box-container { flex-direction: column; height: 80vh; border: none; }
          
          .support-list-col { 
            width: 100%; 
            height: 100%; 
            border-right: none; 
            border-bottom: none; 
            display: ${showMobileChat ? 'none' : 'flex'}; 
          }
          
          .support-chat-col { 
            width: 100%; 
            height: 100%; 
            display: ${showMobileChat ? 'flex' : 'none'}; 
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
          }
        }
      `}</style>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-logo"><h2><i className="fas fa-camera"></i> ADMIN </h2></div>
          <ul className="admin-menu">
            <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><i className="fas fa-chart-bar"></i> Tổng quan</li>
            <li className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}><i className="fas fa-folder"></i> Danh mục</li>
            <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}><i className="fas fa-box"></i> Đơn hàng</li>
            <li className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}><i className="fas fa-camera"></i> Sản phẩm</li>
            <li className={activeTab === 'projects' ? 'active' : ''} onClick={() => setActiveTab('projects')}><i className="fas fa-project-diagram"></i> Dự án</li>
            <li className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}><i className="fas fa-star"></i> Đánh giá</li>
            <li className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}><i className="fas fa-users"></i> Khách hàng</li>
            <li className={activeTab === 'support' ? 'active' : ''} onClick={() => { setActiveTab('support'); setShowMobileChat(false); }}><i className="fas fa-headset"></i> Hỗ trợ</li>
          </ul>
          
          <Link href="/" className="admin-home-link">
            <i className="fas fa-arrow-left"></i> Về trang chủ
          </Link>
          <div onClick={handleLogout} className="admin-logout">
            <i className="fas fa-sign-out-alt"></i> Đăng xuất
          </div>
        </aside>

        <main className="admin-main">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
            <button onClick={handleSyncAll} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>
              <i className="fas fa-sync-alt"></i> Đồng bộ DB.JSON
            </button>
          </div>

          {isLoading ? ( <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', fontWeight: 'bold', color: '#64748b' }}><i className="fas fa-spinner fa-spin"></i> Đang tải dữ liệu thực tế...</div> ) : (
            <>
              {activeTab === 'overview' && (
                <>
                  <div className="stat-grid">
                    <div className="stat-card"><h3>TỔNG ĐƠN HÀNG</h3><div className="value">{totalOrders}</div></div>
                    <div className="stat-card"><h3>DOANH THU (ĐÃ CHUẨN HÓA)</h3><div className="value" style={{ color: '#10b981' }}>{totalRevenue.toLocaleString('vi-VN')} đ</div></div>
                    <div className="stat-card"><h3>TỔNG SẢN PHẨM</h3><div className="value">{totalProducts}</div></div>
                    <div className="stat-card"><h3>TỔNG TỒN KHO</h3><div className="value">{totalInventory}</div></div>
                  </div>
                  <div className="chart-container">
                    
                    <div className="chart-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>📈 Doanh thu các tháng</h3>
                        <select 
                          value={selectedYear} 
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                          style={{ padding: '6px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: 'bold', color: '#1e293b', background: '#f8fafc', cursor: 'pointer' }}
                        >
                          {availableYears.map(y => (
                            <option key={y} value={y}>Năm {y}</option>
                          ))}
                        </select>
                      </div>

                      <div className="bar-chart">
                        {monthlyRevenue.map((rev, i) => (
                          <div 
                            key={i} 
                            className="bar" 
                            style={{ 
                              height: `${maxRevenue > 0 ? (rev / maxRevenue) * 100 : 10}%`, 
                              minHeight: '5%', 
                              opacity: rev > 0 ? 1 : 0.4
                            }}
                            data-tooltip={`${rev.toLocaleString('vi-VN')} đ`}
                          >
                            <span>T{i+1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="chart-box small">
                      <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>🏆 Top 5 Sản phẩm Hot</h3>
                      {topProductNames.length > 0 ? (
                        <>
                          <div style={{ width: '170px', height: '170px', borderRadius: '50%', background: `conic-gradient(${gradientString})`, flexShrink: 0 }}></div>
                          <div style={{ marginTop: '20px', width: '100%' }}>
                            {topProductNames.map((name, i) => (
                              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ display: 'inline-block', width: '12px', height: '12px', background: colors[i % colors.length], borderRadius: '3px' }}></span>
                                  <span style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>{name}</span>
                                </div>
                                <strong style={{ fontSize: '13px', color: '#1e293b' }}>{topProductValues[i]} cái</strong>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                          <div style={{ color: '#94a3b8', fontStyle: 'italic', marginTop: '50px' }}>Chưa có đơn hàng nào được bán.</div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'categories' && (
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>QUẢN LÝ DANH MỤC</h2>
                    <button onClick={handleAddCategory} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>+ Thêm danh mục</button>
                  </div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead><tr><th>Tên danh mục</th><th style={{ textAlign: 'right' }}>Hành động</th></tr></thead>
                      <tbody>
                        {categories.map((cat: any) => (
                          <tr key={cat._id || cat.id}>
                            <td style={{ color: '#3b82f6', fontWeight: 'bold' }}>{cat.name}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="action-btn" onClick={() => handleEditCategory(cat)}><i className="fas fa-edit"></i> Sửa</button>
                              <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => handleDeleteCategory(cat._id || cat.id)}><i className="fas fa-trash"></i> Xóa</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>QUẢN LÝ ĐƠN HÀNG</h2>
                    
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '8px 15px', border: '1px solid #cbd5e1', width: '250px' }}>
                      <i className="fas fa-search" style={{ color: '#94a3b8', marginRight: '10px' }}></i>
                      <input 
                        type="text" 
                        placeholder="Tìm mã đơn (vd: 67cf)..." 
                        value={searchOrderCode}
                        onChange={(e) => setSearchOrderCode(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', color: '#1e293b' }}
                      />
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Mã Đơn</th>
                          <th>Khách hàng</th>
                          <th>Ngày đặt</th>
                          <th>Thanh toán</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                          <th style={{ textAlign: 'right' }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders
                          .filter((order: any) => {
                            if (!searchOrderCode) return true;
                            const code = String(order._id || order.id).slice(-4).toLowerCase();
                            return code.includes(searchOrderCode.toLowerCase().replace('#', ''));
                          })
                          .map((order: any) => (
                          <tr key={order._id || order.id}>
                            <td style={{ color: '#64748b' }}>#{String(order._id || order.id).slice(-4)}</td>
                            <td style={{ fontWeight: 'bold', color: '#334155' }}>{order.user_id === 1 ? 'ADMIN' : (order.customer_name || 'Khách vãng lai')}</td>
                            <td style={{ color: '#64748b' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}</td>
                            <td style={{ color: '#10b981' }}>Tiền mặt (COD)</td>
                            <td style={{ color: '#e11d48', fontWeight: 'bold' }}>{Number(order.total_money || order.total || 0).toLocaleString('vi-VN')} đ</td>
                            <td>
                              <select 
                                className="status-select" 
                                value={order.status || "Chờ xử lý"} 
                                onChange={(e) => handleUpdateOrderStatus(order._id || order.id, e.target.value)}
                                style={{ color: order.status === 'Thành công' ? '#16a34a' : order.status === 'Đã hủy' ? '#ef4444' : '#d97706' }}
                              >
                                <option value="Chờ xử lý">Chờ xử lý</option>
                                <option value="Đã vận chuyển">Đã vận chuyển</option>
                                <option value="Đang giao hàng">Đang giao hàng</option>
                                <option value="Thành công">Thành công</option>
                                <option value="Đã hủy">Đã hủy</option>
                              </select>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="action-btn" onClick={() => setSelectedOrderDetails(order)} style={{ color: '#3b82f6', marginRight: '5px' }}>
                                <i className="fas fa-eye"></i> Xem
                              </button>
                              <button className="action-btn" onClick={() => handleDeleteOrder(order._id || order.id)} style={{ color: '#ef4444' }}>
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {orders.filter((o: any) => String(o._id || o.id).slice(-4).toLowerCase().includes(searchOrderCode.toLowerCase().replace('#', ''))).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontStyle: 'italic' }}>Không tìm thấy đơn hàng nào có mã "{searchOrderCode}"</div>
                  )}
                </div>
              )}

             {activeTab === 'products' && (
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>KHO HÀNG SẢN PHẨM</h2>
                    <button onClick={openAddProductModal} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Thêm Sản Phẩm</button>
                  </div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead><tr><th>Hình</th><th>Tên</th><th>Giá</th><th>Tồn kho</th><th style={{ textAlign: 'right' }}>Hành động</th></tr></thead>
                      <tbody>
                        {products.map((product: any) => (
                          <tr key={product._id || product.id}>
                            <td><img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e2e8f0' }} /></td>
                            <td style={{ color: '#334155', minWidth: '150px' }}>{product.name}</td>
                            <td style={{ color: '#10b981', fontWeight: 'bold' }}>{Number(product.price).toLocaleString('vi-VN')} đ</td>
                            <td style={{ fontWeight: 'bold' }}>{product.quantity}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="action-btn" style={{ color: '#3b82f6', marginRight: '5px' }} onClick={() => openEditProductModal(product)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => handleDeleteProduct(product._id || product.id)}>
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>QUẢN LÝ DỰ ÁN ĐÃ THI CÔNG</h2>
                    <button onClick={openAddProjectModal} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Thêm Dự Án</button>
                  </div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead><tr><th>Hình đại diện</th><th>Tên dự án</th><th>Mô tả ngắn</th><th style={{ textAlign: 'right' }}>Hành động</th></tr></thead>
                      <tbody>
                        {projects.map((project: any) => (
                          <tr key={project._id || project.id}>
                            <td>
                              <img 
                                src={project.images && project.images.length > 0 ? project.images[0] : "https://placehold.co/80x50?text=No+Image"} 
                                alt={project.title} 
                                style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} 
                              />
                            </td>
                            <td className="proj-title">{project.title}</td>
                            <td className="proj-desc">{project.description}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="action-btn" style={{ color: '#3b82f6', marginRight: '5px' }} onClick={() => openEditProjectModal(project)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => handleDeleteProject(project._id || project.id)}>
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {projects.length === 0 && (
                          <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Chưa có dự án nào!</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="admin-card">
                  <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>THỐNG KÊ ĐÁNH GIÁ (API)</h2>
                  {reviews.length === 0 ? <p>Chưa có đánh giá nào trong DB.</p> : (
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '60px', margin: 0, color: '#f59e0b' }}>{Number(reviews.reduce((a,b)=>a+b.rating,0)/reviews.length || 5).toFixed(1)}</h1>
                        <div style={{ color: '#f59e0b', fontSize: '24px' }}>★★★★★</div>
                        <p style={{ color: '#64748b' }}>Dựa trên {reviews.length} lượt đánh giá</p>
                      </div>
                      <div style={{ flex: 2, minWidth: '300px' }}>
                         {[5, 4, 3, 2, 1].map((star) => {
                           const count = reviews.filter(r => r.rating === star).length;
                           const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                           return (
                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <span style={{ width: '50px', color: '#64748b', fontWeight: 'bold' }}>{star} Sao</span>
                              <div style={{ flex: 1, height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ width: `${percent}%`, height: '100%', background: '#f59e0b' }}></div>
                              </div>
                            </div>
                           )
                         })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'customers' && (
                <div className="admin-card">
                  <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>DANH SÁCH KHÁCH HÀNG</h2>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead><tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th style={{ textAlign: 'right' }}>Hành động</th></tr></thead>
                      <tbody>
                        {users.map((user: any) => (
                          <tr key={user._id || user.id}>
                            <td style={{ fontWeight: 'bold', color: '#1e293b' }}>{user.username}</td>
                            <td style={{ color: '#64748b' }}>{user.email || 'Chưa cập nhật'}</td>
                            <td style={{ color: '#64748b' }}>{user.phone || 'Chưa cập nhật'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="action-btn" onClick={() => handleEditUser(user._id || user.id, user)}>
                                <i className="fas fa-edit"></i> Sửa
                              </button>
                              <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => handleDeleteUser(user._id || user.id)}>
                                <i className="fas fa-trash-alt"></i> Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'support' && (
                <div className="admin-card" style={{ padding: 0 }}>
                  <div className="support-box-container">
                    
                    {/* CỘT BÊN TRÁI: Danh sách khách hàng (Hiện mặc định trên mobile) */}
                    <div className="support-list-col">
                      <div style={{ padding: '15px 20px', background: '#1e293b', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><i className="fas fa-inbox"></i> Hộp thư</span>
                      </div>
                      
                      <div style={{ flex: 1, overflowY: 'auto' }}>
                        {Array.from(new Set(supports.map((s: any) => s.customer))).map((customerName: any) => {
                          const userTickets = supports.filter((s: any) => s.customer === customerName);
                          const latestTicket = userTickets[userTickets.length - 1]; 
                          const hasUnread = userTickets.some((s: any) => s.status === 'Chưa trả lời');

                          return (
                            <div 
                              key={customerName} 
                              style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', background: selectedSupport?.customer === customerName ? '#eff6ff' : hasUnread ? 'white' : 'transparent', borderLeft: hasUnread ? '4px solid #ef4444' : '4px solid transparent', transition: '0.2s' }}
                              onClick={() => {
                                setSelectedSupport({ customer: customerName, phone: latestTicket.phone, tickets: userTickets });
                                setShowMobileChat(true); // Bấm vào là hiển thị khung chat trên mobile
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                <strong style={{ color: '#1e293b', fontSize: '15px' }}>{customerName}</strong>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{latestTicket.createdAt ? new Date(latestTicket.createdAt).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : ''}</span>
                              </div>
                              <div style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: hasUnread ? 'bold' : 'normal' }}>
                                {latestTicket.issue}
                              </div>
                            </div>
                          );
                        })}
                        {supports.length === 0 && <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Chưa có tin nhắn</div>}
                      </div>
                    </div>

                    {/* CỘT BÊN PHẢI: Khung chat chi tiết (Chỉ hiện trên mobile khi đã chọn khách) */}
                    <div className="support-chat-col">
                      {!selectedSupport ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#cbd5e1', padding: '20px' }}>
                           <i className="fas fa-comments" style={{ fontSize: '60px', marginBottom: '15px' }}></i>
                           <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '16px', textAlign: 'center' }}>Chọn một khách hàng để xem</h3>
                        </div>
                      ) : (
                        <>
                          <div style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', background: '#f8fafc' }}>
                            {/* NÚT QUAY LẠI CHỈ HIỆN TRÊN MOBILE */}
                            <button 
                              className="d-md-none" 
                              onClick={() => setShowMobileChat(false)} 
                              style={{ background: 'none', border: 'none', fontSize: '20px', color: '#64748b', cursor: 'pointer', padding: '0 5px' }}
                            >
                              <i className="fas fa-arrow-left"></i>
                            </button>

                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                              {selectedSupport.customer.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1e293b' }}>{selectedSupport.customer}</h3>
                              <div style={{ fontSize: '12px', color: '#64748b' }}><i className="fas fa-phone-alt" style={{ fontSize: '10px' }}></i> {selectedSupport.phone}</div>
                            </div>
                          </div>

                          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', background: '#fff' }}>
                            {selectedSupport.tickets.map((t: any) => (
                              <div key={t._id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start', maxWidth: '85%' }}>
                                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, fontWeight: 'bold', marginTop: '5px' }}>
                                    {selectedSupport.customer.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="chat-bubble-customer" style={{ fontSize: '14px', padding: '12px 18px' }}>
                                    {t.issue}
                                  </div>
                                </div>

                                {t.admin_reply && (
                                  <div className="chat-bubble-admin" style={{ fontSize: '14px', padding: '12px 18px' }}>
                                    {t.admin_reply}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          <form 
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if(!adminReplyText.trim()) return;
                              const latestT = selectedSupport.tickets[selectedSupport.tickets.length - 1];

                              const res = await fetch('/api/supports', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: latestT._id, admin_reply: adminReplyText })
                              });

                              if(res.ok) {
                                const updatedTickets = selectedSupport.tickets.map((item: any) => 
                                  item._id === latestT._id ? { ...item, status: 'Đã trả lời', admin_reply: adminReplyText } : item
                                );
                                setSelectedSupport({ ...selectedSupport, tickets: updatedTickets });
                                setSupports(supports.map((s: any) => s._id === latestT._id ? { ...s, status: 'Đã trả lời', admin_reply: adminReplyText } : s));
                                setAdminReplyText('');
                              }
                            }} 
                            style={{ padding: '15px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}
                          >
                            <input 
                              type="text" 
                              placeholder="Nhập tin nhắn..." 
                              value={adminReplyText}
                              onChange={e => setAdminReplyText(e.target.value)}
                              style={{ flex: 1, padding: '12px 20px', border: '1px solid #cbd5e1', borderRadius: '25px', outline: 'none', fontSize: '14px', background: 'white' }}
                              required
                            />
                            <button type="submit" style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                              <i className="fas fa-paper-plane"></i>
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* MODAL THÊM/SỬA DỰ ÁN */}
          {showProjectForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
                 <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>
                    <i className="fas fa-project-diagram" style={{ color: '#10b981', marginRight: '10px' }}></i> 
                    {isEditingProject ? 'Cập nhật Dự Án' : 'Thêm Dự Án Mới'}
                  </h3>
                  <button onClick={() => setShowProjectForm(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                </div>
                
                <form onSubmit={handleAddProjectSubmit}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Tên dự án *</label>
                  <input className="modal-input" required value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} placeholder="VD: Lắp đặt camera tại..." />
                  
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Mô tả ngắn gọn *</label>
                  <input className="modal-input" required value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} placeholder="Mô tả tổng quan về dự án..." />
                  
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Chi tiết thi công (Mỗi ý một dòng) *</label>
                  <textarea className="modal-input" required rows={4} value={newProject.details} onChange={e => setNewProject({...newProject, details: e.target.value})} placeholder="VD:&#10;- Thi công lắp đặt 10 camera&#10;- Đi cáp mạng gọn gàng..." style={{ resize: 'vertical' }}></textarea>
                  
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Hình ảnh dự án (Có thể chọn nhiều ảnh) *</label>
                  <label className="upload-area" style={{ height: 'auto', minHeight: '100px', padding: '15px', marginBottom: '15px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <i className="fas fa-images" style={{ fontSize: '24px', color: '#3b82f6', marginBottom: '10px' }}></i>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Nhấp để chọn ảnh từ máy tính/điện thoại</p>
                    </div>
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleProjectImageUpload} />
                  </label>

                  {newProject.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {newProject.images.map((imgBase64, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '6px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                          <img src={imgBase64} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button" 
                            onClick={() => removeProjectImage(idx)} 
                            style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(225, 29, 72, 0.9)', color: 'white', border: 'none', width: '16px', height: '16px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                    <button type="button" onClick={() => setShowProjectForm(false)} style={{ padding: '8px 15px', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#475569', fontSize: '13px' }}>Hủy bỏ</button>
                    <button type="submit" style={{ padding: '8px 20px', border: 'none', background: '#10b981', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <i className="fas fa-save"></i> {isEditingProject ? 'Lưu Cập Nhật' : 'Lưu Dự Án'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL THÊM SẢN PHẨM */}
          {showProductForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
                 <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>
                    <i className="fas fa-box-open" style={{ color: '#10b981', marginRight: '10px' }}></i> 
                    {isEditing ? 'Cập nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                  </h3>
                  <button onClick={() => setShowProductForm(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                </div>
                
                <form onSubmit={handleAddProductSubmit}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ flex: '1 1 100%' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Tên sản phẩm *</label>
                      <input className="modal-input" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                      
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Thuộc danh mục *</label>
                      <select className="modal-input" required value={newProduct.category_id} onChange={e => setNewProduct({...newProduct, category_id: e.target.value})} style={{ background: 'white', cursor: 'pointer' }}>
                        <option value="" disabled>-- Hãy chọn danh mục --</option>
                        {categories.map(cat => (
                          <option key={cat._id || cat.id} value={cat.id || cat._id}>{cat.name}</option>
                        ))}
                      </select>

                      <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Giá bán (VNĐ) *</label>
                          <input className="modal-input" type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Số lượng kho *</label>
                          <input className="modal-input" type="number" required value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} />
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: '1 1 100%' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Hình ảnh sản phẩm *</label>
                      <label className="upload-area" style={{ minHeight: '100px', padding: '10px' }}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ textAlign: 'center' }}>
                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '24px', color: '#94a3b8', marginBottom: '5px' }}></i>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Nhấp để chọn file</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} required={!imagePreview} />
                      </label>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                    <button type="button" onClick={() => setShowProductForm(false)} style={{ padding: '8px 15px', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#475569', fontSize: '13px' }}>Hủy bỏ</button>
                    <button type="submit" style={{ padding: '8px 20px', border: 'none', background: '#10b981', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <i className="fas fa-save"></i> {isEditing ? 'Lưu Cập Nhật' : 'Lưu Sản Phẩm'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL XEM CHI TIẾT ĐƠN HÀNG */}
          {selectedOrderDetails && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>
                    <i className="fas fa-file-invoice-dollar" style={{ color: '#3b82f6', marginRight: '8px' }}></i> 
                    Chi tiết đơn hàng #{String(selectedOrderDetails._id || selectedOrderDetails.id).slice(-4)}
                  </h3>
                  <button onClick={() => setSelectedOrderDetails(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                </div>
                
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', color: '#334155', lineHeight: '1.6', border: '1px dashed #cbd5e1' }}>
                  <p style={{ margin: 0 }}><strong>Tên KH:</strong> {selectedOrderDetails.customer_name}</p>
                  <p style={{ margin: 0 }}><strong>SĐT:</strong> {selectedOrderDetails.customer_phone}</p>
                  <p style={{ margin: 0 }}><strong>Địa chỉ:</strong> {selectedOrderDetails.shipping_address}</p>
                </div>

                <h4 style={{ color: '#1e293b', marginBottom: '10px', fontSize: '13px' }}>Sản phẩm đã đặt:</h4>
                <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table className="admin-table" style={{ margin: 0, minWidth: '400px' }}>
                    <thead style={{ background: '#f1f5f9' }}>
                      <tr>
                        <th style={{ padding: '8px 10px', fontSize: '12px' }}>Sản phẩm</th>
                        <th style={{ padding: '8px 10px', fontSize: '12px' }}>Đơn giá</th>
                        <th style={{ padding: '8px 10px', fontSize: '12px' }}>SL</th>
                        <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '12px' }}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderDetails.items && selectedOrderDetails.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px' }}>
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              style={{ width: '30px', height: '30px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', flexShrink: 0 }}
                              onError={(e) => { e.currentTarget.src = "https://placehold.co/30x30?text=Img" }} 
                            />
                            <span style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{item.name}</span>
                          </td>
                          <td style={{ color: '#64748b', fontSize: '12px', padding: '8px 10px' }}>{Number(item.price).toLocaleString('vi-VN')} đ</td>
                          <td style={{ fontWeight: 'bold', fontSize: '12px', padding: '8px 10px' }}>{item.cartQty}</td>
                          <td style={{ color: '#10b981', fontWeight: 'bold', textAlign: 'right', fontSize: '12px', padding: '8px 10px' }}>{(Number(item.price) * item.cartQty).toLocaleString('vi-VN')} đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div style={{ textAlign: 'right', fontSize: '15px', fontWeight: 'bold', color: '#e11d48', marginTop: '15px', paddingTop: '10px', borderTop: '2px solid #e2e8f0' }}>
                  Tổng thanh toán: {Number(selectedOrderDetails.total_money || selectedOrderDetails.total || 0).toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}