"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import db from '../../db.json'; // Bổ sung đọc dữ liệu từ db.json

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullname: '', username: '', phone: '', email: '', password: '', confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }

    // Tự động xóa khoảng trắng dư thừa
    const inputUser = formData.username.trim();
    const inputEmail = formData.email.trim();

    // 1. Kiểm tra xem đã có trong db.json gốc chưa
    const dbUsers = db.users || [];
    const existInDB = dbUsers.find(
      (u) => u.username === inputUser || u.email === inputEmail
    );

    // Báo lỗi nếu dính 1 trong 2 nơi
    if (existInDB) {
      alert("Tên đăng nhập hoặc Email đã được sử dụng!");
      return;
    }

    // Tạo user mới
    const newUser = {
      username: inputUser,
      email: inputEmail,
      phone: formData.phone,
      password: formData.password,
      role: "0" // 0 là khách hàng bình thường
    };

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        router.push('/login');
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Đăng ký thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      alert("Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
  };

  return (
    <div style={{ 
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop')`,
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif", padding: '20px'
    }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', width: '100%', maxWidth: '600px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <span>🚀</span> TẠO TÀI KHOẢN MỚI
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Trở thành thành viên của CIOs - impossible is nothing ngay hôm nay</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>Họ và tên</label>
            <input type="text" placeholder="Nhập họ tên..." required onChange={e => setFormData({...formData, fullname: e.target.value})} style={{ width: '100%', padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>Tên đăng nhập</label>
              <input type="text" placeholder="VD: user123" required onChange={e => setFormData({...formData, username: e.target.value})} style={{ width: '100%', padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>Số điện thoại</label>
              <input type="tel" placeholder="09xxxx..." required onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>Email</label>
            <input type="email" placeholder="email@gmail.com" required onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', background: '#f0f9ff' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>Mật khẩu</label>
              <input type="password" placeholder="***" required onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', background: '#f1f5f9' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>Nhập lại mật khẩu</label>
              <input type="password" required onChange={e => setFormData({...formData, confirmPassword: e.target.value})} style={{ width: '100%', padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
            </div>
          </div>

          <button type="submit" style={{ width: '100%', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', transition: '0.2s' }}>
            ĐĂNG KÝ NGAY
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
            Đã có tài khoản? <Link href="/login" style={{ color: '#3b82f6', fontWeight: '700', textDecoration: 'none' }}>Đăng nhập ngay</Link>
          </p>
          <Link href="/" style={{ color: '#94a3b8', fontSize: '12px', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <i className="fas fa-arrow-left"></i> Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}