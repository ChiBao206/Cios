"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import NotifBadge from '../components/NotifBadge';

export default function NotificationsPage() {
  const { totalItems } = useCart(); // Thêm cái này để lấy số lượng giỏ hàng
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      fetchNotifications(parsedUser.phone, parsedUser.username);
      
      // Cập nhật lại mốc thời gian xem thông báo
      localStorage.setItem('lastReadNotifs', Date.now().toString());
    } else {
      setIsLoading(false);
    }
  }, []);

  // Thêm hàm Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
  };

  const fetchNotifications = async (phone: string, username: string) => {
    setIsLoading(true);
    try {
      const [orderRes, supportRes] = await Promise.all([
        fetch('/api/orders').catch(() => ({ ok: false, json: () => [] })),
        fetch('/api/supports').catch(() => ({ ok: false, json: () => [] }))
      ]);

      const orders = orderRes.ok ? await orderRes.json() : [];
      const supports = supportRes.ok ? await supportRes.json() : [];

      const myOrders = orders.filter((o: any) => o.customer_phone === phone);
      const mySupports = supports.filter((s: any) => s.customer === username || s.phone === phone);

      let notifs: any[] = [];

      myOrders.forEach((o: any) => {
        notifs.push({
          id: `order_success_${o._id}`,
          type: 'success',
          icon: 'fas fa-check-circle',
          color: '#10b981',
          title: 'Đặt hàng thành công',
          message: `Đơn hàng #${String(o._id || o.id).slice(-6).toUpperCase()} trị giá ${Number(o.total_money).toLocaleString('vi-VN')}đ đã được ghi nhận.`,
          date: o.createdAt || new Date().toISOString(),
          link: '/profile'
        });

        if (o.status === 'Đang giao hàng' || o.status === 'Đã vận chuyển') {
          notifs.push({
            id: `order_shipping_${o._id}`,
            type: 'shipping',
            icon: 'fas fa-truck',
            color: '#f59e0b',
            title: 'Đơn hàng đang trung chuyển',
            message: `Kiện hàng #${String(o._id || o.id).slice(-6).toUpperCase()} đang trên đường giao đến bạn. Vui lòng chú ý điện thoại nhé!`,
            date: o.updatedAt || o.createdAt,
            link: '/profile'
          });
        }
      });

      mySupports.forEach((s: any) => {
        if (s.status === 'Đã trả lời' && s.admin_reply) {
          notifs.push({
            id: `support_reply_${s._id}`,
            type: 'message',
            icon: 'fas fa-comment-dots',
            color: '#3b82f6',
            title: 'Admin đã phản hồi tin nhắn',
            message: `"${s.admin_reply}"`,
            date: s.updatedAt || s.createdAt,
            link: '/profile' 
          });
        }
      });

      notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNotifications(notifs);

    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* HEADER ĐÃ ĐƯỢC ĐỒNG BỘ 100% */}
      <header style={{ background: '#1e293b', padding: '12px 0', borderBottom: '1px solid #0f172a' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '96%' }}>
          <Link href="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <i className="fas fa-video"></i> CAMERA B&N
          </Link>
          <nav style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/" className="nav-link" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}><i className="fas fa-home"></i> Trang chủ</Link>
            <Link href="/contact" className="nav-link" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}><i className="fas fa-phone-alt"></i> Liên hệ</Link>
            
            <Link href="/notifications" className="nav-link" style={{ position: 'relative', color: '#38bdf8', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
              <i className="fas fa-bell"></i> Thông báo
              <NotifBadge />
            </Link>
            
            <Link href="/cart" className="nav-link" style={{ position: 'relative', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
              <i className="fas fa-shopping-cart"></i> Giỏ hàng
              {totalItems > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#e11d48', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '50%' }}>{totalItems}</span>}
            </Link>
            
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
      <main style={{ maxWidth: '800px', width: '95%', margin: '40px auto', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', color: '#1e293b', fontWeight: '900', margin: 0 }}><i className="fas fa-bell" style={{ color: '#e11d48' }}></i> THÔNG BÁO CỦA BẠN</h1>
        </div>

        {/* NẾU CHƯA ĐĂNG NHẬP */}
        {!user && !isLoading && (
          <div style={{ background: 'white', padding: '60px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <i className="fas fa-user-lock" style={{ fontSize: '60px', color: '#cbd5e1', marginBottom: '20px' }}></i>
            <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '10px' }}>Vui lòng đăng nhập để xem thông báo</h2>
            <p style={{ color: '#64748b', marginBottom: '25px' }}>Đăng nhập để theo dõi tình trạng đơn hàng và tin nhắn từ quản trị viên.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <Link href="/login" style={{ padding: '12px 30px', background: '#3b82f6', color: 'white', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none' }}>Đăng nhập</Link>
              <Link href="/register" style={{ padding: '12px 30px', background: 'white', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none' }}>Đăng ký</Link>
            </div>
          </div>
        )}

        {/* ĐANG TẢI DỮ LIỆU */}
        {user && isLoading && (
           <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Đang tải thông báo...</div>
        )}

        {/* NẾU ĐÃ ĐĂNG NHẬP & CÓ DỮ LIỆU */}
        {user && !isLoading && notifications.length > 0 && (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {notifications.map((notif, index) => (
              <Link key={notif.id} href={notif.link} style={{ display: 'flex', padding: '20px', borderBottom: index !== notifications.length - 1 ? '1px solid #f1f5f9' : 'none', textDecoration: 'none', transition: '0.2s', background: 'white' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `${notif.color}15`, color: notif.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, marginRight: '20px' }}>
                  <i className={notif.icon}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: 'bold' }}>{notif.title}</h4>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(notif.date).toLocaleDateString('vi-VN')} {new Date(notif.date).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>{notif.message}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* NẾU KHÔNG CÓ THÔNG BÁO NÀO */}
        {user && !isLoading && notifications.length === 0 && (
          <div style={{ background: 'white', padding: '60px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <i className="far fa-bell-slash" style={{ fontSize: '60px', color: '#cbd5e1', marginBottom: '20px' }}></i>
            <h2 style={{ fontSize: '18px', color: '#334155' }}>Bạn chưa có thông báo nào</h2>
          </div>
        )}
      </main>
    </div>
  );
}