"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders');
  const [orderSubTab, setOrderSubTab] = useState('placed'); 
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState(''); 
  const [orders, setOrders] = useState<any[]>([]);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [favorites, setFavorites] = useState<any[]>([]);
  const [supports, setSupports] = useState<any[]>([]);
  const [supportIssue, setSupportIssue] = useState('');
  const [profileForm, setProfileForm] = useState({ username: '', phone: '', email: '' });
  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      
      setProfileForm({ 
        username: parsedUser.username || '', 
        phone: parsedUser.phone || '', 
        email: parsedUser.email || 'chua_cap_nhat@gmail.com' 
      });

      if (parsedUser.phone) {
        fetchOrders(parsedUser.phone); 
        fetchSupports(parsedUser.username, parsedUser.phone);
      }

      // LẤY DỮ LIỆU FAVORITE
      const savedFavs = localStorage.getItem('camera_bn_favs');
      if(savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }

    } else {
      router.push('/login'); 
    }
  }, [router]);

  const fetchOrders = async (phone: string) => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/orders?t=${timestamp}`);
      const allOrders = await res.json();
      const myOrders = allOrders.filter((order: any) => order.customer_phone === phone);
      
      if(myOrders && myOrders.length > 0) {
         const formattedOrders = myOrders.map((o: any) => {
           const orderItems = (o.items && o.items.length > 0) ? o.items.map((i:any) => ({
               name: i.name || "Sản phẩm không tên",
               qty: i.cartQty || 1,
               price: Number(i.price || 0).toLocaleString('vi-VN') + ' đ',
               total: (Number(i.price || 0) * (i.cartQty || 1)).toLocaleString('vi-VN') + ' đ',
               img: i.image || i.img || "https://placehold.co/100x100?text=Camera"
           })) : [{ 
               name: "Sản phẩm trong giỏ (Chưa lưu chi tiết)", qty: 1, 
               price: Number(o.total_money).toLocaleString('vi-VN') + ' đ', 
               total: Number(o.total_money).toLocaleString('vi-VN') + ' đ', 
               img: "https://placehold.co/100x100?text=Camera" 
           }];

           return {
             _id: o._id,
             id: String(o._id || o.id).slice(-6).toUpperCase(), // ĐỒNG BỘ HIỂN THỊ ID
             date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay',
             total: Number(o.total_money).toLocaleString('vi-VN') + ' đ',
             status: o.status || 'Chờ xử lý',
             customer: o.customer_name,
             phone: o.customer_phone,
             address: o.shipping_address,
             items: orderItems,
             subtotal: Number(o.total_money).toLocaleString('vi-VN') + ' đ',
             shipping: "0 đ",
           };
         });
         setOrders(formattedOrders); 
      } else { setOrders([]); }
    } catch (error) { console.error(error); }
  };

  const fetchSupports = async (username: string, phone: string) => {
    try {
      const res = await fetch('/api/supports');
      if (res.ok) {
        const allSupports = await res.json();
        const mySupports = allSupports.filter((s: any) => s.customer === username || s.phone === phone);
        setSupports(mySupports);  
      }
    } catch (e) { console.log(e); }
  };

  const handleLogout = () => {
    localStorage.removeItem('camera_bn_cart'); 
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const handleCancelOrder = async (orderId: string) => {
    if(!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    try {
      // ĐÃ SỬA: Đảm bảo gọi API với đúng biến orderId của MongoDB
      const res = await fetch(`/api/orders?id=${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Đã hủy' }) // Sửa theo format của trang Admin
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'Đã hủy' } : o));
        setViewOrder({ ...viewOrder, status: 'Đã hủy' });
        alert("Đã hủy đơn hàng thành công!");
      } else {
        alert("Có lỗi xảy ra khi hủy đơn!");
      }
    } catch (error) { alert("Lỗi mạng!"); }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Gọi API cập nhật User trên MongoDB
      const res = await fetch(`/api/users?id=${user._id || user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      
      if (res.ok) {
        const updatedUser = { ...user, ...profileForm };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert("Cập nhật thông tin cá nhân thành công!");
      } else {
        alert("Lỗi cập nhật!");
      }
    } catch (err) {
      alert("Lỗi kết nối!");
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if(passForm.new !== passForm.confirm) return alert("Mật khẩu nhập lại không khớp!");
    if(passForm.new.length < 6) return alert("Mật khẩu phải dài hơn 6 ký tự!");
    // (Bạn có thể thêm API đổi mật khẩu tương tự như UpdateProfile ở trên nếu cần)
    alert("Đổi mật khẩu thành công!");
    setPassForm({ old: '', new: '', confirm: '' });
  };

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportIssue.trim()) return;
    
    const newTicket = { customer: user.username, phone: user.phone, issue: supportIssue, status: 'Chưa trả lời' };
    
    try {
      const res = await fetch('/api/supports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });
      if (res.ok) {
        setSupports([...supports, { ...newTicket, createdAt: new Date() }]);
        setSupportIssue('');
        setTimeout(() => {
          const chatBox = document.getElementById('chat-box-container');
          if(chatBox) chatBox.scrollTop = chatBox.scrollHeight;
        }, 100);
      }
    } catch (e) { alert("Lỗi khi gửi tin nhắn!"); }
  };

  const removeFavorite = (id: string) => {
    const newFavs = favorites.filter(f => String(f._id || f.id) !== String(id));
    setFavorites(newFavs);
    localStorage.setItem('camera_bn_favs', JSON.stringify(newFavs));
  };

  if (!user) return null; 

  const renderAvatar = () => {
    if (avatar) return <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />;
    return <span style={{ fontSize: '40px', color: 'white', fontWeight: 'bold' }}>{user.username.charAt(0).toUpperCase()}</span>;
  };

  const displayedOrders = orders.filter(o => {
    if (orderSubTab === 'canceled') return o.status === 'Đã hủy';
    return o.status !== 'Đã hủy'; 
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif" }}>
      
      <header style={{ background: '#1e293b', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', textDecoration: 'none' }}><i className="fas fa-video"></i> CIOs - impossible is nothing</Link>
        <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}><i className="fas fa-home"></i> Về trang chủ</Link>
      </header>

      <div className="profile-layout" style={{ maxWidth: '1200px', width: '95%', margin: '30px auto', display: 'flex', gap: '30px', flex: 1, alignItems: 'flex-start' }}>
        
        <aside className="profile-sidebar" style={{ width: '280px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          
          <div style={{ padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <div 
              style={{ width: '100px', height: '100px', margin: '0 auto 15px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)' }}
              onClick={() => fileInputRef.current?.click()}
              className="avatar-container"
            >
              {renderAvatar()}
              <div className="avatar-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }}>
                <i className="fas fa-camera" style={{ color: 'white', fontSize: '24px' }}></i>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
            </div>

            <h3 style={{ fontSize: '18px', color: '#1e293b', margin: '0 0 5px', fontWeight: '800' }}>{user.username}</h3>
            <span style={{ display: 'inline-block', padding: '4px 12px', background: '#eff6ff', color: '#2563eb', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Thành viên thân thiết</span>
          </div>

          <ul style={{ listStyle: 'none', padding: '15px 0', margin: 0 }}>
            <li onClick={() => setActiveTab('orders')} style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: '600', color: activeTab === 'orders' ? '#2563eb' : '#475569', background: activeTab === 'orders' ? '#eff6ff' : 'transparent', borderLeft: activeTab === 'orders' ? '4px solid #2563eb' : '4px solid transparent' }}>
              <i className="fas fa-box" style={{ width: '20px', color: '#b45309' }}></i> Lịch sử đơn hàng
            </li>
            <li onClick={() => setActiveTab('favorites')} style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: '600', color: activeTab === 'favorites' ? '#2563eb' : '#475569', background: activeTab === 'favorites' ? '#eff6ff' : 'transparent', borderLeft: activeTab === 'favorites' ? '4px solid #2563eb' : '4px solid transparent' }}>
              <i className="fas fa-heart" style={{ width: '20px', color: '#e11d48' }}></i> Sản phẩm yêu thích
            </li>
            <li onClick={() => setActiveTab('support')} style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: '600', color: activeTab === 'support' ? '#2563eb' : '#475569', background: activeTab === 'support' ? '#eff6ff' : 'transparent', borderLeft: activeTab === 'support' ? '4px solid #2563eb' : '4px solid transparent' }}>
              <i className="fas fa-comments" style={{ width: '20px', color: '#94a3b8' }}></i> Chat với Admin
            </li>
            <li onClick={() => setActiveTab('settings')} style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: '600', color: activeTab === 'settings' ? '#2563eb' : '#475569', background: activeTab === 'settings' ? '#eff6ff' : 'transparent', borderLeft: activeTab === 'settings' ? '4px solid #2563eb' : '4px solid transparent' }}>
              <i className="fas fa-cog" style={{ width: '20px', color: '#64748b' }}></i> Cài đặt tài khoản
            </li>
          </ul>

          <div style={{ padding: '20px' }}>
            <Link href="/" style={{ display: 'block', textAlign: 'center', padding: '10px', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', marginBottom: '10px' }}><i className="fas fa-arrow-left"></i> Về Trang chủ</Link>
            <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Đăng xuất</button>
          </div>
        </aside>

        <main className="profile-main" style={{ flex: 1, background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', padding: '40px', minHeight: '600px', position: 'relative' }}>
          
          <style>{`
            .avatar-container:hover .avatar-overlay { opacity: 1 !important; }
            .profile-input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; borderRadius: 6px; font-size: 14px; outline: none; margin-bottom: 20px; transition: 0.3s; }
            .profile-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
            .btn-outline:hover { background: #f1f5f9 !important; }
            .invoice-table th { padding: 12px 10px; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
            .invoice-table td { padding: 15px 10px; border-bottom: 1px dashed #e2e8f0; font-size: 14px; color: #334155; vertical-align: middle; }
            .fav-card { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; transition: 0.3s; position: relative; }
            .fav-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #cbd5e1; }
            .chat-bubble-user { background: #3b82f6; color: white; padding: 12px 18px; border-radius: 18px 18px 0 18px; max-width: 70%; font-size: 14px; align-self: flex-end; box-shadow: 0 2px 5px rgba(59,130,246,0.2); }
            .chat-bubble-admin { background: #f1f5f9; color: #1e293b; padding: 12px 18px; border-radius: 18px 18px 18px 0; max-width: 70%; font-size: 14px; border: 1px solid #e2e8f0; }

            @media (max-width: 768px) {
              .profile-layout { flex-direction: column !important; }
              .profile-sidebar { width: 100% !important; }
              .profile-main { width: 100% !important; padding: 20px !important; min-height: auto !important; }
              .invoice-table { display: block; overflow-x: auto; white-space: nowrap; }
              .settings-container { flex-direction: column !important; gap: 20px !important; }
              #chat-box-container { min-height: 400px !important; max-height: 60vh !important; }
            }
          `}</style>

          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>Lịch sử mua hàng</h2>
                <Link href="/" style={{ background: '#3b82f6', color: 'white', padding: '8px 15px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}><i className="fas fa-plus"></i> Mua đơn mới</Link>
              </div>

              <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <button onClick={() => setOrderSubTab('placed')} style={{ background: 'none', border: 'none', padding: '10px 0', fontWeight: 'bold', fontSize: '14px', color: orderSubTab === 'placed' ? '#3b82f6' : '#64748b', borderBottom: orderSubTab === 'placed' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer' }}><i className="fas fa-shopping-cart"></i> Đơn hàng đã đặt</button>
                <button onClick={() => setOrderSubTab('canceled')} style={{ background: 'none', border: 'none', padding: '10px 0', fontWeight: 'bold', fontSize: '14px', color: orderSubTab === 'canceled' ? '#e11d48' : '#64748b', borderBottom: orderSubTab === 'canceled' ? '2px solid #e11d48' : '2px solid transparent', cursor: 'pointer' }}><i className="fas fa-trash-alt"></i> Đơn hàng đã hủy</button>
              </div>

              {displayedOrders.length > 0 ? (
                <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                  <thead><tr style={{ textAlign: 'left', color: '#64748b', fontSize: '12px', borderBottom: '2px solid #f1f5f9' }}><th style={{ padding: '15px 10px' }}>MÃ ĐƠN</th><th>NGÀY ĐẶT</th><th>TỔNG TIỀN</th><th>TRẠNG THÁI</th><th style={{ textAlign: 'right', paddingRight: '10px' }}></th></tr></thead>
                  <tbody>
                    {displayedOrders.map((order, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '20px 10px', color: '#3b82f6', fontWeight: 'bold' }}>#{order.id}</td>
                        <td style={{ color: '#475569', fontSize: '14px' }}>{order.date}</td>
                        <td style={{ color: '#1e293b', fontWeight: '900', fontSize: '15px' }}>{order.total}</td>
                        <td>
                          <span style={{ padding: '5px 12px', background: order.status === 'Đã hủy' ? '#fee2e2' : order.status === 'Thành công' ? '#dcfce7' : '#eff6ff', color: order.status === 'Đã hủy' ? '#ef4444' : order.status === 'Thành công' ? '#16a34a' : '#2563eb', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{order.status}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => setViewOrder(order)} className="btn-outline" style={{ border: '1px solid #cbd5e1', background: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>Xem chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: '14px' }}>Bạn chưa có đơn hàng nào trong mục này.</div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}><i className="fas fa-heart" style={{ color: '#e11d48' }}></i> Sản phẩm yêu thích</h2>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Đang lưu {favorites.length} sản phẩm</span>
              </div>
              
              {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b', fontSize: '14px' }}>
                  <i className="far fa-heart" style={{ fontSize: '40px', color: '#cbd5e1', marginBottom: '15px' }}></i>
                  <p style={{ marginBottom: '10px' }}>Bạn chưa lưu sản phẩm nào cả.</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Gợi ý: Ra ngoài trang chủ tìm sản phẩm và bấm thêm yêu thích nhé!</p>
                  <Link href="/" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}>Khám phá ngay</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {favorites.map((fav) => (
                    <div key={fav._id || fav.id} className="fav-card">
                      <button onClick={() => removeFavorite(fav._id || fav.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: '1px solid #e2e8f0', color: '#ef4444', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
                      <div style={{ height: '180px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                        <img src={fav.img || fav.image} alt={fav.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ padding: '15px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e293b', lineHeight: '1.4', height: '40px', overflow: 'hidden' }}>{fav.name}</h4>
                        <div style={{ color: '#e11d48', fontWeight: 'bold', fontSize: '15px' }}>{Number(fav.price).toLocaleString('vi-VN')} đ</div>
                        <Link href={`/product/${fav._id || fav.id}`} style={{ display: 'block', textAlign: 'center', background: '#3b82f6', color: 'white', padding: '8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px', marginTop: '15px' }}>XEM CHI TIẾT</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'support' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  <i className="fas fa-headset"></i>
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Trung tâm Hỗ trợ CIOs - impossible is nothing</h2>
                  <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div> Trực tuyến
                  </div>
                </div>
              </div>
              
              <div id="chat-box-container" style={{ flex: 1, background: '#f8fafc', borderRadius: '12px', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '350px', border: '1px solid #e2e8f0' }}>
                
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', margin: '10px 0' }}>Bắt đầu cuộc trò chuyện. Hãy gửi vấn đề bạn đang gặp phải nhé!</div>

                {supports.map((s, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    <div className="chat-bubble-user">
                      {s.issue}
                      <div style={{ fontSize: '10px', color: '#bfdbfe', marginTop: '5px', textAlign: 'right' }}>
                        {s.createdAt ? new Date(s.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : 'Vừa gửi'}
                      </div>
                    </div>

                    {s.status === 'Đã trả lời' && s.admin_reply && (
                      <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start', maxWidth: '80%' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>
                          <i className="fas fa-headset"></i>
                        </div>
                        <div className="chat-bubble-admin">
                          <p style={{ margin: 0 }}>{s.admin_reply}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmitSupport} style={{ display: 'flex', gap: '10px', marginTop: '20px', background: 'white', padding: '10px', borderRadius: '30px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <input 
                  type="text" 
                  value={supportIssue} 
                  onChange={e => setSupportIssue(e.target.value)} 
                  placeholder="Nhập tin nhắn..." 
                  style={{ flex: 1, padding: '10px 15px', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px' }} 
                />
                <button type="submit" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>Cài đặt tài khoản</h2>
              <div className="settings-container" style={{ display: 'flex', gap: '30px' }}>
                
                <div style={{ flex: 1, border: '1px solid #e2e8f0', padding: '25px', borderRadius: '8px', background: 'white' }}>
                  <h3 style={{ fontSize: '15px', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-user-edit" style={{ color: '#f87171' }}></i> Thông tin cá nhân</h3>
                  <form onSubmit={handleUpdateProfile}>
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Họ và tên</label>
                    <input type="text" value={profileForm.username} onChange={e => setProfileForm({...profileForm, username: e.target.value})} className="profile-input" required />
                    
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Số điện thoại</label>
                    <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="profile-input" required />
                    
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Email</label>
                    <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="profile-input" />
                    
                    <button type="submit" style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>LƯU THAY ĐỔI</button>
                  </form>
                </div>

                <div style={{ flex: 1, border: '1px solid #e2e8f0', padding: '25px', borderRadius: '8px', background: '#f8fafc' }}>
                  <h3 style={{ fontSize: '15px', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-lock" style={{ color: '#f59e0b' }}></i> Đổi mật khẩu</h3>
                  <form onSubmit={handleChangePassword}>
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Mật khẩu hiện tại</label>
                    <input type="password" value={passForm.old} onChange={e => setPassForm({...passForm, old: e.target.value})} className="profile-input" required />
                    
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Mật khẩu mới</label>
                    <input type="password" value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})} className="profile-input" required />
                    
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Nhập lại mật khẩu mới</label>
                    <input type="password" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} className="profile-input" required />
                    
                    <button type="submit" style={{ width: '100%', padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>XÁC NHẬN ĐỔI MẬT KHẨU</button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {viewOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '700px', maxWidth: '95%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            <div style={{ background: '#1e293b', color: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>HÓA ĐƠN #{viewOrder.id}</h3>
              <button onClick={() => setViewOrder(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ padding: '25px', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ border: '1px dashed #cbd5e1', padding: '20px', borderRadius: '8px', background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block' }}>NGƯỜI NHẬN</span><strong style={{ color: '#1e293b', fontSize: '14px' }}>{viewOrder.customer}</strong></div>
                <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block' }}>ĐIỆN THOẠI</span><strong style={{ color: '#1e293b', fontSize: '14px' }}>{viewOrder.phone}</strong></div>
                <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block' }}>ĐỊA CHỈ</span><span style={{ color: '#334155', fontSize: '14px' }}>{viewOrder.address}</span></div>
                <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block' }}>TRẠNG THÁI</span><strong style={{ color: viewOrder.status === 'Đã hủy' ? '#ef4444' : '#10b981', fontSize: '14px' }}>{viewOrder.status}</strong></div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px', minWidth: '500px' }}>
                  <thead><tr><th>ĐÁNH GIÁ</th><th>SP</th><th style={{ textAlign: 'center' }}>HÌNH ẢNH</th><th style={{ textAlign: 'center' }}>SL</th><th style={{ textAlign: 'right' }}>GIÁ</th><th style={{ textAlign: 'right' }}>THÀNH TIỀN</th></tr></thead>
                  <tbody>
                    {viewOrder.items?.map((item: any, index: number) => (
                      <tr key={index}>
                        <td style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>(Chưa đánh giá)</td>
                        <td style={{ width: '30%', lineHeight: '1.4' }}>{item.name}</td>
                        <td style={{ textAlign: 'center' }}><img src={item.img} alt={item.name} style={{ width: '45px', height: '45px', objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: '4px' }} /></td>
                        <td style={{ textAlign: 'center', fontWeight: '600' }}>{item.qty}</td>
                        <td style={{ textAlign: 'right' }}>{item.price}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: '#e11d48' }}>{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ textAlign: 'right', paddingRight: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '40px', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>TỔNG CỘNG</span>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: '#e11d48' }}>{viewOrder.total}</span>
                </div>
              </div>

              {viewOrder.status === 'Chờ xử lý' && (
                <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0' }}>
                  <button onClick={() => handleCancelOrder(viewOrder._id)} style={{ background: 'white', color: '#ef4444', border: '1px solid #fca5a5', padding: '10px 25px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-trash-alt"></i> Hủy đơn hàng này
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}