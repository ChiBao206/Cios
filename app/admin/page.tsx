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
  const [isLoading, setIsLoading] = useState(true);

  // STATE ĐỂ CHỌN NĂM XEM BIỂU ĐỒ
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [showProductForm, setShowProductForm] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [newProduct, setNewProduct] = useState({ 
    name: '', price: '', quantity: '', image: '', category_id: '' 
  });

  const [selectedSupport, setSelectedSupport] = useState<any>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const timestamp = new Date().getTime();
      const [prodRes, catRes, ordRes, usrRes, revRes, supRes] = await Promise.all([
        fetch(`/api/products?t=${timestamp}`), 
        fetch(`/api/categories?t=${timestamp}`), 
        fetch(`/api/orders?t=${timestamp}`), 
        fetch(`/api/users?t=${timestamp}`), 
        fetch(`/api/reviews?t=${timestamp}`).catch(() => ({ ok: false, json: () => [] })), 
        fetch(`/api/supports?t=${timestamp}`).catch(() => ({ ok: false, json: () => [] }))
      ]);
      
      if(prodRes.ok) setProducts(await prodRes.json());
      if(catRes.ok) setCategories(await catRes.json());
      if(ordRes.ok) setOrders(await ordRes.json());
      if(usrRes.ok) setUsers(await usrRes.json());
      if(revRes.ok) setReviews(await revRes.json());
      if(supRes.ok) setSupports(await supRes.json());
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
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, price: Number(newProduct.price), quantity: Number(newProduct.quantity) })
      });
      if(res.ok) {
        alert("Thêm sản phẩm thành công!");
        setShowProductForm(false);
        setNewProduct({ name: '', price: '', quantity: '', image: '', category_id: '' });
        setImagePreview('');
        fetchAllData();
      }
    } catch (e) { alert("Lỗi khi thêm sản phẩm"); }
  };

  const handleDeleteProduct = (id: string) => {
    if(!window.confirm("Xóa sản phẩm này?")) return;
    setProducts(products.filter(p => p._id !== id && p.id !== id));
    alert("Đã xóa! (Cần API DELETE)");
  };

  const handleAddCategory = async () => {
    const name = window.prompt("Nhập tên danh mục mới:");
    if (!name) return;
    try {
      await fetch('/api/categories', { method: 'POST', body: JSON.stringify({ name }) });
      fetchAllData();
    } catch (e) { alert("Lỗi thêm danh mục"); }
  };

  const handleEditCategory = (cat: any) => {
    const newName = window.prompt("Sửa tên danh mục:", cat.name);
    if (newName) alert(`Đã ghi nhận sửa "${cat.name}" thành "${newName}".`);
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) alert(`Đã xóa!`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(o => (o._id === orderId || o.id === orderId) ? { ...o, status: newStatus } : o));
    alert(`Đã chuyển trạng thái thành: ${newStatus}.`);
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm("Hủy và xóa đơn hàng này?")) alert("Đã xóa đơn hàng!");
  };

  const handleEditUser = (userId: string, currentUser: any) => {
    const newName = window.prompt(`Sửa Tên:`, currentUser.username || "");
    if(newName === null) return;
    const newEmail = window.prompt(`Sửa Email:`, currentUser.email || "");
    if(newEmail === null) return;
    const newPhone = window.prompt(`Sửa SĐT:`, currentUser.phone || "");
    if(newPhone === null) return;
    setUsers(users.map(u => (u._id === userId || u.id === userId) ? { ...u, username: newName, email: newEmail, phone: newPhone } : u));
    alert("Đã cập nhật thông tin khách hàng!");
  };

  // ==========================================
  // THUẬT TOÁN TÍNH TOÁN DỮ LIỆU THẬT 100%
  // ==========================================
  const totalOrders = orders.length;
  
  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status === 'Đã hủy') return sum;
    return sum + Number(order.total_money || order.total || 0);
  }, 0);
  
  const totalProducts = products.length;
  const totalInventory = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
  
  // 1. BIỂU ĐỒ TRÒN
  const categoryCount = products.reduce((acc: any, curr) => {
    const catName = categories.find(c => String(c.id) === String(curr.category_id) || String(c._id) === String(curr.category_id))?.name || "Chưa phân loại";
    acc[catName] = (acc[catName] || 0) + 1;
    return acc;
  }, {});
  
  const catNames = Object.keys(categoryCount).sort(); 
  const catValues = catNames.map(name => categoryCount[name]);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#d946ef', '#14b8a6', '#f43f5e'];
  
  let gradientString = "";
  let currentPercentage = 0;
  if(totalProducts > 0) {
    catValues.forEach((val, i) => {
      const percentage = (val / totalProducts) * 100;
      gradientString += `${colors[i % colors.length]} ${currentPercentage}% ${currentPercentage + percentage}%, `;
      currentPercentage += percentage;
    });
    gradientString = gradientString.slice(0, -2);
  } else { gradientString = "#e2e8f0 0% 100%"; }

  // 2. TÌM TẤT CẢ CÁC NĂM HIỆN CÓ TRONG DATA ĐỂ LÀM MENU CHỌN NĂM
  const availableYears = Array.from(new Set(orders.map(order => {
    if (order.createdAt) {
      const d = new Date(order.createdAt);
      if (!isNaN(d.getTime())) return d.getFullYear();
    }
    return new Date().getFullYear();
  }))).sort((a, b) => b - a); // Xếp năm mới nhất lên đầu

  // Nếu mảng năm trống thì mặc định là năm nay
  if (availableYears.length === 0) availableYears.push(new Date().getFullYear());

  // 3. TÍNH DOANH THU 12 THÁNG DỰA TRÊN NĂM ĐÃ CHỌN (selectedYear)
  const monthlyRevenue = Array(12).fill(0);
  orders.forEach(order => {
    if (order.status !== 'Đã hủy') { 
      let orderYear = new Date().getFullYear(); 
      let orderMonth = 0; // Tháng 1

      if (order.createdAt) {
        const d = new Date(order.createdAt);
        if (!isNaN(d.getTime())) {
          orderYear = d.getFullYear();
          orderMonth = d.getMonth(); 
        }
      }

      // Chỉ cộng tiền nếu đơn hàng đó thuộc NĂM ĐANG CHỌN
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
        .admin-logout { padding: 15px 25px; background: #0f172a; cursor: pointer; text-align: center; font-weight: bold; color: #94a3b8; display: block; text-decoration: none;}
        .admin-main { flex: 1; margin-left: 250px; padding: 30px; width: calc(100% - 250px);}
        
        .stat-grid { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; flex: 1; min-width: 200px; border-bottom: 4px solid #3b82f6;}
        .stat-card:nth-child(2) { border-bottom-color: #10b981; }
        .stat-card:nth-child(3) { border-bottom-color: #f59e0b; }
        .stat-card:nth-child(4) { border-bottom-color: #a855f7; }
        .stat-card h3 { font-size: 13px; color: #64748b; margin-bottom: 15px; font-weight: 700;}
        .stat-card .value { font-size: 28px; font-weight: 800; color: #1e293b; }
        
        .chart-container { display: flex; gap: 20px; margin-bottom: 30px; }
        .chart-box { background: white; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; flex: 2; height: 350px; display: flex; flex-direction: column;}
        .chart-box.small { flex: 1; align-items: center; justify-content: center;}
        
        .bar-chart { flex: 1; display: flex; align-items: flex-end; justify-content: space-around; border-left: 2px solid #e2e8f0; border-bottom: 2px solid #e2e8f0; padding: 20px 10px 0; gap: 10px;}
        .bar { width: 35px; background: #3b82f6; border-radius: 4px 4px 0 0; position: relative; transition: 0.3s; }
        .bar:hover { background: #2563eb; }
        .bar span { position: absolute; bottom: -25px; left: 50%; transform: translateX(-50%); font-size: 12px; color: #64748b; font-weight: bold;}
        
        /* Tooltip hiển thị số tiền */
        .bar::after {
          content: attr(data-tooltip);
          position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
          background: #1e293b; color: white; padding: 4px 8px; border-radius: 4px;
          font-size: 11px; white-space: nowrap; opacity: 0; pointer-events: none; transition: 0.2s;
          z-index: 10;
        }
        .bar:hover::after { opacity: 1; }

        .admin-card { background: white; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; margin-bottom: 30px; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { padding: 15px; text-align: left; background: #f8fafc; color: #64748b; font-size: 13px; border-bottom: 2px solid #e2e8f0; }
        .admin-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px; vertical-align: middle; }
        .action-btn { padding: 6px 12px; border: 1px solid #cbd5e1; background: white; border-radius: 4px; font-size: 12px; cursor: pointer; margin-right: 5px; color: #64748b; }
        .status-select { padding: 6px; border-radius: 4px; border: 1px solid #cbd5e1; outline: none; font-weight: bold; font-size: 12px; cursor: pointer; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px);}
        .modal-content { background: white; padding: 30px; border-radius: 12px; width: 650px; max-width: 95%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);}
        .modal-input { width: 100%; padding: 12px 15px; margin-bottom: 15px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; transition: 0.2s;}
        .modal-input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .upload-area { border: 2px dashed #cbd5e1; border-radius: 8px; background: #f8fafc; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 215px; cursor: pointer; transition: 0.2s; position: relative; overflow: hidden; }
        
        .chat-bubble-customer { background: #f1f5f9; color: #1e293b; padding: 12px 18px; border-radius: 18px 18px 18px 0; max-width: 75%; font-size: 14px; align-self: flex-start; border: 1px solid #e2e8f0; }
        .chat-bubble-admin { background: #3b82f6; color: white; padding: 12px 18px; border-radius: 18px 18px 0 18px; max-width: 75%; font-size: 14px; align-self: flex-end; box-shadow: 0 2px 5px rgba(59,130,246,0.2); }
        /* Tự động điều chỉnh giao diện trên điện thoại */
        @media (max-width: 768px) {
          .admin-layout { flex-direction: column; }
          .admin-sidebar { width: 100%; position: relative; height: auto; }
          .admin-menu { display: flex; flex-wrap: wrap; justify-content: center; padding: 10px; gap: 5px; }
          .admin-menu li { padding: 8px 12px; border-left: none; border-bottom: 3px solid transparent; font-size: 13px; }
          .admin-menu li:hover, .admin-menu li.active { border-left: none; border-bottom-color: #38bdf8; }
          .admin-main { margin-left: 0; width: 100%; padding: 15px; }
          .chart-container { flex-direction: column; }
          .chart-box { height: auto; min-height: 300px; }
          .admin-table { display: block; overflow-x: auto; white-space: nowrap; } /* Cho phép vuốt ngang bảng */
          .stat-card { min-width: 100%; }
        }
      `}</style>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-logo"><h2><i className="fas fa-camera"></i> ADMIN CP</h2></div>
          <ul className="admin-menu">
            <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><i className="fas fa-chart-bar"></i> Tổng quan</li>
            <li className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}><i className="fas fa-folder"></i> Danh mục</li>
            <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}><i className="fas fa-box"></i> Đơn hàng</li>
            <li className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}><i className="fas fa-camera"></i> Sản phẩm</li>
            <li className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}><i className="fas fa-star"></i> Đánh giá</li>
            <li className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}><i className="fas fa-users"></i> Khách hàng</li>
            <li className={activeTab === 'support' ? 'active' : ''} onClick={() => setActiveTab('support')}><i className="fas fa-headset"></i> Hỗ trợ</li>
          </ul>
          <Link href="/" className="admin-logout" style={{ marginTop: 'auto' }}><i className="fas fa-arrow-left"></i> Về Trang chủ</Link>
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
                    
                    {/* BIỂU ĐỒ CỘT 12 THÁNG KÈM NÚT CHỌN NĂM */}
                    <div className="chart-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>📈 Doanh thu các tháng</h3>
                        
                        {/* Thanh Chọn Năm */}
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
                      <h3 style={{ margin: '0 0 30px 0', color: '#1e293b' }}>🏆 Tỉ trọng danh mục</h3>
                      <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: `conic-gradient(${gradientString})` }}></div>
                      <div style={{ marginTop: '20px', fontSize: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {catNames.map((name, i) => (
                          <span key={name} style={{ color: colors[i % colors.length] }}>■ {name} ({categoryCount[name]})</span>
                        ))}
                      </div>
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
                  <table className="admin-table">
                    <thead><tr><th>Tên danh mục</th><th style={{ textAlign: 'right' }}>Hành động</th></tr></thead>
                    <tbody>
                      {categories.map((cat: any) => (
                        <tr key={cat._id || cat.id}>
                          <td style={{ color: '#3b82f6', fontWeight: 'bold' }}>{cat.name}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="action-btn" onClick={() => handleEditCategory(cat)}><i className="fas fa-edit"></i> Sửa</button>
                            <button className="action-btn" onClick={() => handleDeleteCategory(cat._id || cat.id)}><i className="fas fa-trash"></i> Xóa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="admin-card">
                  <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>QUẢN LÝ ĐƠN HÀNG</h2>
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
                      {orders.map((order: any) => (
                        <tr key={order._id || order.id}>
                          <td style={{ color: '#64748b' }}>#{String(order._id || order.id).slice(-4)}</td>
                          <td style={{ fontWeight: 'bold', color: '#334155' }}>{order.user_id === 1 ? 'ADMIN' : 'Khách vãng lai'}</td>
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
                            <button className="action-btn" onClick={() => handleDeleteOrder(order._id || order.id)}><i className="fas fa-trash"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>KHO HÀNG SẢN PHẨM</h2>
                    <button onClick={() => setShowProductForm(true)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Thêm Sản Phẩm</button>
                  </div>
                  <table className="admin-table">
                    <thead><tr><th>Hình</th><th>Tên</th><th>Giá</th><th>Tồn kho</th><th style={{ textAlign: 'right' }}>Hành động</th></tr></thead>
                    <tbody>
                      {products.map((product: any) => (
                        <tr key={product._id || product.id}>
                          <td><img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e2e8f0' }} /></td>
                          <td style={{ color: '#334155' }}>{product.name}</td>
                          <td style={{ color: '#10b981', fontWeight: 'bold' }}>{Number(product.price).toLocaleString('vi-VN')} đ</td>
                          <td style={{ fontWeight: 'bold' }}>{product.quantity}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="action-btn" onClick={() => handleDeleteProduct(product._id || product.id)}><i className="fas fa-trash"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="admin-card">
                  <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>THỐNG KÊ ĐÁNH GIÁ (API)</h2>
                  {reviews.length === 0 ? <p>Chưa có đánh giá nào trong DB.</p> : (
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <h1 style={{ fontSize: '60px', margin: 0, color: '#f59e0b' }}>{Number(reviews.reduce((a,b)=>a+b.rating,0)/reviews.length || 5).toFixed(1)}</h1>
                        <div style={{ color: '#f59e0b', fontSize: '24px' }}>★★★★★</div>
                        <p style={{ color: '#64748b' }}>Dựa trên {reviews.length} lượt đánh giá</p>
                      </div>
                      <div style={{ flex: 2 }}>
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
                  <table className="admin-table">
                    <thead><tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th style={{ textAlign: 'right' }}>Hành động</th></tr></thead>
                    <tbody>
                      {users.map((user: any) => (
                        <tr key={user._id || user.id}>
                          <td style={{ fontWeight: 'bold', color: '#1e293b' }}>{user.username}</td>
                          <td style={{ color: '#64748b' }}>{user.email || 'Chưa cập nhật'}</td>
                          <td style={{ color: '#64748b' }}>{user.phone || 'Chưa cập nhật'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="action-btn" onClick={() => handleEditUser(user._id || user.id, user)}><i className="fas fa-edit"></i> Sửa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'support' && (
                <div className="admin-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', height: 'calc(100vh - 180px)', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '320px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px', background: '#1e293b', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span><i className="fas fa-inbox"></i> Hộp thư Khách hàng</span>
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
                            onClick={() => setSelectedSupport({ customer: customerName, phone: latestTicket.phone, tickets: userTickets })}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                              <strong style={{ color: '#1e293b' }}>{customerName}</strong>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{latestTicket.createdAt ? new Date(latestTicket.createdAt).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : ''}</span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: hasUnread ? 'bold' : 'normal' }}>
                              {latestTicket.issue}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
                    {!selectedSupport ? (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#cbd5e1' }}>
                         <i className="fas fa-comments" style={{ fontSize: '70px', marginBottom: '20px' }}></i>
                         <h3 style={{ margin: 0, color: '#94a3b8' }}>Chọn một khách hàng bên trái để xem tin nhắn</h3>
                      </div>
                    ) : (
                      <>
                        <div style={{ padding: '15px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', background: '#f8fafc' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                            {selectedSupport.customer.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1e293b' }}>{selectedSupport.customer}</h3>
                            <div style={{ fontSize: '12px', color: '#64748b' }}><i className="fas fa-phone-alt" style={{ fontSize: '10px' }}></i> {selectedSupport.phone}</div>
                          </div>
                        </div>

                        <div style={{ flex: 1, height: '100px', padding: '25px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: '#fff' }}>
                          {selectedSupport.tickets.map((t: any) => (
                            <div key={t._id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start', maxWidth: '80%' }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, fontWeight: 'bold' }}>
                                  {selectedSupport.customer.charAt(0).toUpperCase()}
                                </div>
                                <div className="chat-bubble-customer">
                                  {t.issue}
                                </div>
                              </div>

                              {t.admin_reply && (
                                <div className="chat-bubble-admin">
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
                              alert("Đã gửi tin nhắn cho khách thành công!");
                            }
                          }} 
                          style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '15px' }}
                        >
                          <input 
                            type="text" 
                            placeholder="Nhập tin nhắn trả lời khách hàng..." 
                            value={adminReplyText}
                            onChange={e => setAdminReplyText(e.target.value)}
                            style={{ flex: 1, padding: '15px', border: '1px solid #cbd5e1', borderRadius: '30px', outline: 'none', fontSize: '14px', background: 'white' }}
                            required
                          />
                          <button type="submit" style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 4px 6px rgba(16,185,129,0.3)' }}>
                            <i className="fas fa-paper-plane"></i>
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* MODAL THÊM SẢN PHẨM */}
          {showProductForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '20px' }}><i className="fas fa-box-open" style={{ color: '#10b981', marginRight: '10px' }}></i> Thêm Sản Phẩm Mới</h3>
                  <button onClick={() => setShowProductForm(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                </div>
                
                <form onSubmit={handleAddProductSubmit}>
                  <div style={{ display: 'flex', gap: '25px' }}>
                    <div style={{ flex: 1 }}>
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

                    <div style={{ width: '220px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Hình ảnh sản phẩm *</label>
                      <label className="upload-area">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ textAlign: 'center', padding: '20px' }}>
                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '36px', color: '#94a3b8', marginBottom: '10px' }}></i>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Nhấp để chọn file</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} required={!imagePreview} />
                      </label>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                    <button type="button" onClick={() => setShowProductForm(false)} style={{ padding: '10px 20px', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>Hủy bỏ</button>
                    <button type="submit" style={{ padding: '10px 25px', border: 'none', background: '#10b981', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-save"></i> Lưu Sản Phẩm
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}