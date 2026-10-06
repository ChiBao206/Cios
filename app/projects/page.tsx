"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NotifBadge from '@/app/components/NotifBadge';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';

// COMPONENT SLIDER ẢNH CHO TỪNG DỰ ÁN
const ProjectSlider = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayImages = images && images.length > 0 ? images : ["https://placehold.co/800x400?text=Chua+Co+Anh+Du+An"];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <img 
        src={displayImages[currentIndex]} 
        alt="Hình ảnh dự án" 
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.3s' }} 
        onError={(e) => { e.currentTarget.src = "https://placehold.co/800x400?text=Loi+Anh" }}
      />
      
      {displayImages.length > 1 && (
        <>
          <button onClick={prevSlide} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(15, 23, 42, 0.7)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button onClick={nextSlide} style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(15, 23, 42, 0.7)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
            <i className="fas fa-chevron-right"></i>
          </button>
          <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
            {displayImages.map((_, idx) => (
              <div key={idx} style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentIndex === idx ? '#3b82f6' : 'rgba(15, 23, 42, 0.4)', transition: '0.3s' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function ProjectsPage() {
  const router = useRouter();
  const { totalItems } = useCart();
  const [user, setUser] = useState<any>(null);
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("currentUser");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }

    fetch(`/api/projects?t=${new Date().getTime()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setProjectsData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy dữ liệu dự án:", err);
        setIsLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('camera_bn_cart'); 
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. HEADER */}
      <header style={{ background: "#1e293b", padding: "12px 0", borderBottom: "1px solid #0f172a" }}>
        <div style={{ maxWidth: "1140px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", width: "96%" }}>
          <div style={{ color: "white", fontWeight: "bold", fontSize: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="fas fa-video"></i> CIOs - impossible is nothing
          </div>
          <nav style={{ display: "flex", gap: "20px" }}>
            <Link href="/" className="nav-link"><i className="fas fa-home"></i> Trang chủ</Link>
            <Link href="/contact" className="nav-link"><i className="fas fa-phone-alt"></i> Liên hệ</Link>
            <Link href="/projects" className="nav-link" style={{ color: '#38bdf8' }}><i className="fas fa-project-diagram"></i> Dự án</Link>
            <Link href="/notifications" className="nav-link" style={{ position: "relative" }}>
              <i className="fas fa-bell"></i> Thông báo
              <NotifBadge />
            </Link>
            <Link href="/cart" className="nav-link" style={{ position: "relative" }}>
              <i className="fas fa-shopping-cart"></i> Giỏ hàng
              {totalItems > 0 && (
                <span style={{ position: "absolute", top: "-8px", right: "-12px", background: "#e11d48", color: "white", fontSize: "10px", padding: "2px 6px", borderRadius: "50%" }}>
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginLeft: "10px" }}>
                <Link href={String(user.role) === "1" ? "/admin" : "/profile"} style={{ display: "flex", flexDirection: "column", alignItems: "center", textDecoration: "none", lineHeight: "1.2" }}>
                  <span style={{ color: "#94a3b8", fontSize: "11px" }}>Xin chào,</span>
                  <span style={{ color: "#4ade80", fontSize: "14px", fontWeight: "bold" }}>{user.username.toUpperCase()}</span>
                </Link>
                <button onClick={handleLogout} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 15px", borderRadius: "4px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", transition: "0.2s" }}>
                  Thoát
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="nav-link"><i className="fas fa-user"></i> Đăng nhập</Link>
                <Link href="/register" className="nav-link"><i className="fas fa-user-plus"></i> Đăng ký</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* 2. BANNER */}
      <div style={{ background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url("https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2000")', backgroundSize: 'cover', backgroundPosition: 'center', padding: '80px 20px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px' }}>Dự Án Đã Thi Công</h1>
        <p style={{ fontSize: '16px', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>Tự hào là đối tác triển khai hệ thống an ninh giám sát và mạng hạ tầng cho hàng trăm doanh nghiệp, cơ quan và cửa hàng.</p>
      </div>

      {/* 2.5 VIDEO */}
      <div style={{ maxWidth: '1000px', margin: '50px auto 0', padding: '0 20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '20px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <i className="fas fa-play-circle" style={{ color: '#e11d48', fontSize: '24px' }}></i>
            Video Giới Thiệu Công Ty
          </h2>
          <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
            <video 
              src="/uploads/video-cong-ty.mp4" 
              controls autoPlay muted loop playsInline
              style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', display: 'block' }}
            >
              Trình duyệt của bạn không hỗ trợ xem video.
            </video>
          </div>
        </div>
      </div>

      {/* 3. DANH SÁCH DỰ ÁN */}
      <div style={{ maxWidth: '1000px', margin: '40px auto 50px', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '60px', flex: 1 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Đang tải dữ liệu dự án...</div>
        ) : projectsData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Chưa có dự án nào được đăng tải.</div>
        ) : (
          projectsData.map((project, index) => (
            <div key={project._id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: index % 2 === 0 ? 'row' : 'row-reverse', flexWrap: 'wrap' }}>
              
              <div style={{ flex: 1, minWidth: '350px', padding: '20px' }}>
                <ProjectSlider images={project.images} />
              </div>

              <div style={{ flex: 1, minWidth: '350px', padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ color: '#e11d48', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Dự án nổi bật</span>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '15px', lineHeight: '1.3' }}>{project.title}</h2>
                <p style={{ color: '#475569', fontSize: '15px', marginBottom: '20px', lineHeight: '1.6' }}>{project.description}</p>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {project.details?.map((detail: string, idx: number) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
                      <i className="fas fa-check-circle" style={{ color: '#10b981', marginTop: '3px' }}></i>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. FLOATING BUTTONS */}
      <div className="floating-buttons">
        <a href="https://zalo.me/0971024173" target="_blank" rel="noopener noreferrer" className="float-btn zalo">
          <i className="fas fa-comment-dots"></i> Chat Zalo
        </a>
        <a href="tel:0971024173" className="float-btn phone">
          <i className="fas fa-phone-alt"></i> 0971.024.173
        </a>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="float-btn up-top" style={{ border: 'none', cursor: 'pointer' }}>
          <i className="fas fa-arrow-up"></i>
        </button>
      </div>

      {/* 5. FOOTER (ĐÃ KHÔI PHỤC FULL GIAO DIỆN) */}
      <footer className="pro-footer">
        <div className="footer-container">
          <div className="footer-col">
            <h3>CIOs - impossible is nothing</h3>
            <p>Đối tác tin cậy cung cấp giải pháp an ninh toàn diện. Cam kết sản phẩm chính hãng, dịch vụ tận tâm và hỗ trợ kỹ thuật trọn đời.</p>
            <div className="social-icons">
              <div className="social-btn" style={{ background: "#3b5998" }}><i className="fab fa-facebook-f"></i></div>
              <div className="social-btn" style={{ background: "#e1306c" }}><i className="fab fa-instagram"></i></div>
              <div className="social-btn" style={{ background: "#ff0000" }}><i className="fab fa-youtube"></i></div>
            </div>
            <div className="newsletter-box">
              <span>Đăng ký nhận khuyến mãi:</span>
              <div className="input-group">
                <input type="email" placeholder="Email của bạn..." />
                <button>GỬI</button>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h3>CHÍNH SÁCH HỖ TRỢ</h3>
            <ul className="footer-links">
              <li><span className="bullet">›</span> Chính sách bảo hành 24 tháng</li>
              <li><span className="bullet">›</span> Đổi trả 1-1 trong 30 ngày</li>
              <li><span className="bullet">›</span> Chính sách bảo mật thông tin</li>
              <li><span className="bullet">›</span> Hướng dẫn mua hàng online</li>
              <li><span className="bullet">›</span> Hướng dẫn thanh toán</li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>LIÊN HỆ VỚI CHÚNG TÔI</h3>
            <div className="contact-row">
              <div className="icon-box"><i className="fas fa-map-marker-alt"></i></div>
              <div>
                <strong>Trụ sở chính:</strong>
                <p>12 Trịnh Đình Thảo, P. Hòa Thạnh, Q. Tân Phú, TP. Hồ Chí Minh</p>
              </div>
            </div>
            <div className="contact-row">
              <div className="icon-box"><i className="fas fa-phone-alt"></i></div>
              <div>
                <strong>Hotline 24/7:</strong>
                <span className="hotline-text">0971.024.173</span>
              </div>
            </div>
            <div className="contact-row">
              <div className="icon-box"><i className="fas fa-envelope"></i></div>
              <div>
                <strong>Email hỗ trợ:</strong>
                <p>hotro@cameracb.com</p>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h3>BẢN ĐỒ CỬA HÀNG</h3>
            <div className="map-frame" style={{ background: "#ccc", height: "150px", borderRadius: "8px", display: "flex", alignItems: "center", justifyItems: "center" }}>
              <iframe src="https://maps.google.com/maps?q=12%20Tr%E1%BB%8Bnh%20%C4%90%C3%ACnh%20Th%E1%BA%A3o%2C%20Ho%C3%A0%20Th%E1%BA%A1nh%2C%20T%C3%A2n%20Ph%C3%BA%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh&t=&z=16&ie=UTF8&iwloc=&output=embed" width="100%" height="200" style={{ border: 0 }} allowFullScreen={true} loading="lazy"></iframe>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 Công Ty TNHH CIOs - impossible is nothing. Giấy phép KD số: 0123456789.
        </div>
      </footer>
    </div>
  );
}