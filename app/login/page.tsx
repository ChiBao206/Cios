"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ==========================================
  // STATE CHO TÍNH NĂNG QUÊN MẬT KHẨU
  // ==========================================
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); 
  const [forgotEmail, setForgotEmail] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError('');

    const inputUser = username.trim();
    const inputPass = password; 

    try {
      const res = await fetch('/api/users');
      
      if (!res.ok) {
        setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau!');
        return;
      }

      const dbUsers = await res.json();
      const user = dbUsers.find(
        (u: any) => (u.username === inputUser || u.email === inputUser) && u.password === inputPass
      );

      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        const userRole = String(user.role).toLowerCase();
        
        if (userRole === "1" || userRole === "admin") {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác!');
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError('Đã xảy ra lỗi mạng. Vui lòng thử lại!');
    }
  };

  // ==========================================
  // XỬ LÝ CÁC BƯỚC QUÊN MẬT KHẨU
  // ==========================================

  // BƯỚC 1: KIỂM TRA EMAIL VÀ GỌI API GỬI MÃ OTP THẬT
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setIsLoading(true);

    try {
      // 1. Kiểm tra xem email có trong DB không
      const res = await fetch('/api/users');
      const users = await res.json();
      const userExists = users.find((u: any) => u.email === forgotEmail.trim());

      if (!userExists) {
        setForgotError('Email này chưa được đăng ký trong hệ thống!');
        setIsLoading(false);
        return;
      }

      // 2. Tạo mã OTP ngẫu nhiên 6 số
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtp(otpCode);

      // 3. Gọi API gửi mail đã tạo
      const mailRes = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim(), otp: otpCode })
      });

      if (mailRes.ok) {
        setForgotStep(2); // Chuyển sang bước nhập OTP nếu gửi mail thành công
      } else {
        setForgotError('Có lỗi xảy ra khi gửi email. Vui lòng kiểm tra lại cấu hình mail!');
      }
    } catch (err) {
      setForgotError('Lỗi hệ thống. Vui lòng thử lại!');
    }
    setIsLoading(false);
  };

  // BƯỚC 2: KIỂM TRA MÃ OTP KHÁCH NHẬP
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (inputOtp.trim() !== sentOtp) {
      setForgotError('Mã OTP không chính xác!');
      return;
    }

    setForgotStep(3); // Đúng mã thì qua bước đặt mật khẩu
  };

  // BƯỚC 3: CẬP NHẬT MẬT KHẨU MỚI LÊN DATABASE
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (newPassword !== confirmPassword) {
      setForgotError('Mật khẩu nhập lại không khớp!');
      return;
    }
    
    if (newPassword.length < 6) {
      setForgotError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/users');
      const users = await res.json();
      const userToUpdate = users.find((u: any) => u.email === forgotEmail.trim());

      if (userToUpdate) {
        const updateRes = await fetch(`/api/users?id=${userToUpdate._id || userToUpdate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword })
        });

        if (updateRes.ok) {
          alert('🎉 Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
          closeForgotModal();
        } else {
          setForgotError('Lỗi hệ thống khi lưu mật khẩu. Vui lòng thử lại!');
        }
      }
    } catch (error) {
      setForgotError('Lỗi mạng. Vui lòng thử lại!');
    }
    setIsLoading(false);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotEmail('');
    setInputOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
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
      
      {/* CSS DÀNH RIÊNG CHO MODAL QUÊN MẬT KHẨU */}
      <style>{`
        .forgot-modal-overlay {
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(5px);
        }
        .forgot-modal-content {
          background: white; border-radius: 12px; width: 100%; max-width: 450px; padding: 30px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); position: relative;
        }
        .forgot-input {
          width: 100%; padding: 12px 15px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none; margin-bottom: 20px; transition: border-color 0.2s;
        }
        .forgot-input:focus {
          border-color: #3b82f6;
        }
        .forgot-btn {
          width: 100%; padding: 14px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; gap: 8px;
        }
        .forgot-btn:hover { background: #2563eb; }
        .forgot-btn:disabled { background: #94a3b8; cursor: not-allowed; }
      `}</style>

      {/* MODAL QUÊN MẬT KHẨU KHÔNG CHUYỂN TRANG */}
      {showForgotModal && (
        <div className="forgot-modal-overlay">
          <div className="forgot-modal-content">
            <button 
              onClick={closeForgotModal} 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
            >
              &times;
            </button>

            <h3 style={{ fontSize: '20px', color: '#1e293b', margin: '0 0 10px', textAlign: 'center', fontWeight: '800' }}>
              KHÔI PHỤC MẬT KHẨU
            </h3>

            {forgotError && (
              <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px', textAlign: 'center', border: '1px solid #fecdd3' }}>
                {forgotError}
              </div>
            )}

            {/* BƯỚC 1: NHẬP EMAIL */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOTP}>
                <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginBottom: '20px' }}>
                  Vui lòng nhập Email bạn đã dùng để đăng ký tài khoản. Chúng tôi sẽ gửi mã xác nhận gồm 6 chữ số.
                </p>
                <label style={{ display: 'block', fontSize: '13px', color: '#334155', fontWeight: '600', marginBottom: '8px' }}>Địa chỉ Email *</label>
                <input 
                  type="email" 
                  className="forgot-input" 
                  placeholder="Nhập email của bạn..." 
                  value={forgotEmail} 
                  onChange={(e) => setForgotEmail(e.target.value)} 
                  required 
                />
                <button type="submit" className="forgot-btn" disabled={isLoading}>
                  {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-envelope"></i>}
                  {isLoading ? 'ĐANG GỬI MÃ...' : 'GỬI MÃ XÁC NHẬN'}
                </button>
              </form>
            )}

            {/* BƯỚC 2: NHẬP MÃ OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOTP}>
                <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginBottom: '20px' }}>
                  Mã xác nhận đã được gửi đến <strong>{forgotEmail}</strong>.<br/>Vui lòng kiểm tra hộp thư đến (hoặc thư rác).
                </p>
                <label style={{ display: 'block', fontSize: '13px', color: '#334155', fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>Mã OTP 6 số *</label>
                <input 
                  type="text" 
                  className="forgot-input" 
                  placeholder="Ví dụ: 123456" 
                  value={inputOtp} 
                  onChange={(e) => setInputOtp(e.target.value)} 
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '5px', fontWeight: 'bold' }}
                  required 
                />
                <button type="submit" className="forgot-btn">
                  <i className="fas fa-check-circle"></i> XÁC NHẬN MÃ OTP
                </button>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <button type="button" onClick={() => setForgotStep(1)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>Sai email? Quay lại</button>
                </div>
              </form>
            )}

            {/* BƯỚC 3: ĐẶT LẠI MẬT KHẨU MỚI */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'inline-flex', width: '50px', height: '50px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '10px' }}>
                    <i className="fas fa-unlock-alt"></i>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Xác thực thành công. Vui lòng đặt lại mật khẩu mới.</p>
                </div>
                
                <label style={{ display: 'block', fontSize: '13px', color: '#334155', fontWeight: '600', marginBottom: '8px' }}>Mật khẩu mới *</label>
                <input 
                  type="password" 
                  className="forgot-input" 
                  placeholder="Tối thiểu 6 ký tự..." 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />

                <label style={{ display: 'block', fontSize: '13px', color: '#334155', fontWeight: '600', marginBottom: '8px' }}>Xác nhận mật khẩu mới *</label>
                <input 
                  type="password" 
                  className="forgot-input" 
                  placeholder="Nhập lại mật khẩu..." 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />

                <button type="submit" className="forgot-btn" disabled={isLoading} style={{ background: '#10b981' }}>
                  {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                  {isLoading ? 'ĐANG LƯU...' : 'ĐỔI MẬT KHẨU'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* FORM ĐĂNG NHẬP CHÍNH */}
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
          <Link 
            href="#" 
            onClick={(e) => { e.preventDefault(); setShowForgotModal(true); }} 
            style={{ color: '#ef4444', fontSize: '13px', textDecoration: 'none', fontWeight: '600', display: 'block', marginBottom: '20px' }}
          >
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