"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError('');

    const inputUser = username.trim();
    const inputPass = password; 

    try {
      // 1. Gọi API để lấy danh sách người dùng từ cơ sở dữ liệu thực (MongoDB)
      const res = await fetch('/api/users');
      
      if (!res.ok) {
        setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau!');
        return;
      }

      const dbUsers = await res.json();

      // 2. Kiểm tra xem tài khoản và mật khẩu có khớp trên hệ thống không
      const user = dbUsers.find(
        (u: any) => (u.username === inputUser || u.email === inputUser) && u.password === inputPass
      );

      if (user) {
        // Đăng nhập thành công, lưu phiên làm việc vào thiết bị hiện tại
        localStorage.setItem('currentUser', JSON.stringify(user));

        // ĐÃ SỬA: Kiểm tra role linh hoạt hơn (hỗ trợ số 1, chữ "1", hoặc "admin")
        const userRole = String(user.role).toLowerCase();
        if (userRole === "1" || userRole === "admin") {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác!');
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError('Đã xảy ra lỗi mạng. Vui lòng thử lại!');
    }
  };

  return (
    <div style={{ 
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
    }}>
      
      <div style={{ 
        background: 'white', 
        padding: '40px 30px', 
        borderRadius: '12px', 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        width: '100%', 
        maxWidth: '400px' 
      }}>
        
        {/* TIÊU ĐỀ */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <span>👋</span> CHÀO MỪNG TRỞ LẠI!
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Vui lòng đăng nhập để tiếp tục</p>
        </div>

        {/* THÔNG BÁO LỖI (Sẽ hiện ra nếu nhập sai) */}
        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px', textAlign: 'center', border: '1px solid #fecdd3' }}>
            {error}
          </div>
        )}

        {/* FORM ĐĂNG NHẬP */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>
              Tên đăng nhập hoặc Email
            </label>
            <input 
              type="text" 
              placeholder="Nhập tên đăng nhập..." 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }} 
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>
              Mật khẩu
            </label>
            <input 
              type="password" 
              placeholder="******" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }} 
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            ĐĂNG NHẬP
          </button>
        </form>

        {/* CÁC ĐƯỜNG LINK TRỢ GIÚP */}
        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <Link href="#" style={{ color: '#ef4444', fontSize: '13px', textDecoration: 'none', fontWeight: '500', display: 'block', marginBottom: '20px' }}>
            Quên mật khẩu?
          </Link>
          
          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 20px 0' }} />
          
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
            Chưa có tài khoản? <Link href="/register" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>Đăng ký ngay</Link>
          </p>
          
          <Link href="/" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <i className="fas fa-arrow-left" style={{ fontSize: '11px' }}></i> Về trang chủ
          </Link>
        </div>

      </div>
    </div>
  );
}