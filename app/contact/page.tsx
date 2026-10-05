"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import NotifBadge from '../components/NotifBadge';

export default function ContactPage() {
  const { totalItems } = useCart();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', issue: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      setFormData({ name: parsedUser.username || '', phone: parsedUser.phone || '', issue: '' });
    }
  }, []);

const handleLogout = () => {
    localStorage.removeItem('camera_bn_cart'); 
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.issue) return alert("Vui lòng điền đủ thông tin!");
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/supports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: formData.name, phone: formData.phone, issue: formData.issue, status: 'Chưa trả lời' })
      });
      if (res.ok) {
        alert("Đã gửi yêu cầu liên hệ thành công! Quản trị viên sẽ phản hồi sớm nhất.");
        setFormData({ ...formData, issue: '' }); // Xóa trắng khung chat
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. HEADER ĐÃ ĐỒNG BỘ */}
      <header style={{ background: '#1e293b', padding: '12px 0', borderBottom: '1px solid #0f172a' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '96%' }}>
          <Link href="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <i className="fas fa-video"></i> Cios
          </Link>
          <nav style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/" className="nav-link" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}><i className="fas fa-home"></i> Trang chủ</Link>
            <Link href="/contact" className="nav-link" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}><i className="fas fa-phone-alt"></i> Liên hệ</Link>
            
            <Link href="/notifications" className="nav-link" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', position: 'relative' }}>
              <i className="fas fa-bell"></i> Thông báo <NotifBadge />
            </Link>
            
            <Link href="/cart" className="nav-link" style={{ position: 'relative', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
              <i className="fas fa-shopping-cart"></i> Giỏ hàng
              {totalItems > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#e11d48', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '50%' }}>{totalItems}</span>}
            </Link>
            
            {/* THAY THẾ DÒNG ĐĂNG NHẬP BẰNG TÀI KHOẢN ĐỘNG */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href="/profile" style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8', textDecoration: 'none' }}>
                  Xin chào,<br/><strong style={{ color: '#4ade80', fontSize: '14px', textTransform: 'uppercase' }}>{user.username}</strong>
                </Link>
                <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Thoát</button>
              </div>
            ) : (
              <Link href="/login" className="nav-link" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
                <i className="fas fa-user"></i> Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: '1140px', width: '95%', margin: '40px auto', flex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', color: '#1e293b', fontWeight: '900', textTransform: 'uppercase', marginBottom: '10px' }}>Liên hệ với chúng tôi</h1>
          <p style={{ color: '#64748b' }}>Đội ngũ Cios luôn sẵn sàng hỗ trợ bạn 24/7</p>
        </div>

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {/* Box Thông tin liên hệ */}
          <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '25px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>Thông tin cửa hàng</h3>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: '#eff6ff', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}><i className="fas fa-map-marker-alt"></i></div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '15px' }}>Địa chỉ</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>12 Trịnh Đình Thảo, P. Hòa Thạnh, Q. Tân Phú, TP. Hồ Chí Minh</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}><i className="fas fa-phone-alt"></i></div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '15px' }}>Hotline hỗ trợ</h4>
                <p style={{ margin: 0, color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>0971.024.173</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              <div style={{ width: '40px', height: '40px', background: '#f0fdf4', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}><i className="fas fa-envelope"></i></div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '15px' }}>Email</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>hotro@cameracb.com</p>
              </div>
            </div>

            {/* Bản đồ */}
            <div style={{ borderRadius: '8px', overflow: 'hidden', height: '200px', border: '1px solid #e2e8f0' }}>
              <iframe src="https://maps.google.com/maps?q=12%20Tr%E1%BB%8Bnh%20%C4%90%C3%ACnh%20Th%E1%BA%A3o%2C%20Ho%C3%A0%20Th%E1%BA%A1nh%2C%20T%C3%A2n%20Ph%C3%BA%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh&t=&z=16&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={false} loading="lazy"></iframe>
            </div>
          </div>

          {/* Form Gửi yêu cầu */}
          <div style={{ flex: 1.5, minWidth: '350px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '25px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>Gửi tin nhắn cho chúng tôi</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#475569', fontWeight: 'bold', marginBottom: '8px' }}>Họ và tên *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nhập tên của bạn" style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#475569', fontWeight: 'bold', marginBottom: '8px' }}>Số điện thoại *</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Nhập số điện thoại" style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} />
                </div>
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#475569', fontWeight: 'bold', marginBottom: '8px' }}>Nội dung vấn đề về sản phẩm *</label>
                <textarea required value={formData.issue} onChange={e => setFormData({...formData, issue: e.target.value})} rows={5} placeholder="Ví dụ: Hướng dẫn mình cài đặt đầu ghi Vantech hoặc cấu hình mạng cho switch Hikvision với..." style={{ width: '100%', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', resize: 'vertical' }}></textarea>
              </div>

              <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '15px', background: isSubmitting ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: '0.3s' }}>
                <i className="fas fa-paper-plane"></i> {isSubmitting ? 'ĐANG GỬI...' : 'GỬI YÊU CẦU NGAY'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}