"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NotifBadge from '@/app/components/NotifBadge';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';

// COMPONENT SLIDER ẢNH CHO TỪNG DỰ ÁN
const ProjectSlider = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <img 
        src={images[currentIndex]} 
        alt="Hình ảnh dự án" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', transition: '0.3s' }} 
        onError={(e) => { e.currentTarget.src = "https://placehold.co/800x400?text=Chua+Co+Anh+Du+An" }}
      />
      
      <button onClick={prevSlide} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(15, 23, 42, 0.7)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
        <i className="fas fa-chevron-left"></i>
      </button>

      <button onClick={nextSlide} style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(15, 23, 42, 0.7)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
        <i className="fas fa-chevron-right"></i>
      </button>

      <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
        {images.map((_, idx) => (
          <div key={idx} style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentIndex === idx ? '#3b82f6' : 'rgba(15, 23, 42, 0.4)', transition: '0.3s' }} />
        ))}
      </div>
    </div>
  );
};

export default function ProjectsPage() {
  const router = useRouter();
  const { totalItems } = useCart();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("currentUser");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

const handleLogout = () => {
    localStorage.removeItem('camera_bn_cart'); 
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  const projectsData = [
    {
      id: "oocl",
      title: "Hệ thống Mạng & IT Văn phòng OOCL",
      description: "Thi công hạ tầng mạng và lắp đặt thiết bị tin học toàn diện cho văn phòng làm việc.",
      details: [
        "Thi công, lắp ráp và đi dây gọn gàng cho hệ thống tủ Rack trung tâm.",
        "Triển khai kéo cáp, bấm node mạng nội bộ đến từng vị trí bàn làm việc của nhân viên.",
        "Lắp đặt, cài đặt hệ điều hành và phần mềm cho toàn bộ hệ thống máy tính văn phòng.",
        "Kiểm tra và nghiệm thu tín hiệu mạng, đảm bảo kết nối ổn định cho toàn bộ công ty."
      ],
      images: [
        "/uploads/oocl1.JPG", "/uploads/oocl2.JPG", 
        "/uploads/oocl3.JPG", "/uploads/oocl4.JPG", "/uploads/oocl5.JPG"
      ]
    },
    {
      id: "kalbi",
      title: "Giải pháp Giám sát & Mạng nội bộ Nhà hàng Kalbi",
      description: "Bảo đảm an ninh khu vực kinh doanh, quản lý hạ tầng mạng và hệ thống âm thanh.",
      details: [
        "Sử dụng và lắp đặt hệ thống Camera Dome Wifi, đảm bảo tính thẩm mỹ cao cho không gian nhà hàng.",
        "Triển khai hạ tầng mạng và cấu hình quản lý tập trung thông qua hệ thống Omada Controller.",
        "Thi công lắp đặt hệ thống loa phát nhạc nền và thông báo, tạo không gian chuyên nghiệp cho thực khách.",
        "Tối ưu hóa vùng phủ sóng wifi, đảm bảo kết nối ổn định cho cả khách hàng và hệ thống vận hành nội bộ."
      ],
      images: [
        "/uploads/kalbi1.JPG", "/uploads/kalbi2.JPG", 
        "/uploads/kalbi3.JPG", "/uploads/kalbi4.JPG", "/uploads/kalbi5.JPG"
      ]
    },
    {
      id: "hocmon",
      title: "Trường Dạy Lái Xe Hóc Môn",
      description: "Triển khai hệ thống camera giám sát ngoài trời với hạ tầng cáp quang chuyên dụng.",
      details: [
        "Trang bị và lắp đặt hệ thống camera thân Vantech chuyên dụng, chống chịu tốt với điều kiện thời tiết ngoài trời.",
        "Triển khai kéo cáp quang khoảng cách xa để truyền tải tín hiệu camera từ sa hình về trung tâm điều hành.",
        "Thực hiện đo kiểm và hàn nối cáp quang chuyên nghiệp, đảm bảo suy hao tín hiệu ở mức thấp nhất.",
        "Cấu hình hệ thống lưu trữ và hiển thị giám sát bao quát toàn bộ bãi sa hình tập lái xe."
      ],
      images: [
        "/uploads/hocmon1.JPG", "/uploads/hocmon2.JPG", 
        "/uploads/hocmon3.JPG", "/uploads/hocmon4.JPG", "/uploads/hocmon5.JPG"
      ]
    },
    {
      id: "photobooth",
      title: "Hệ thống Photobooth Chụp Ảnh Tự Động",
      description: "Bảo vệ tài sản và quản trị mạng từ xa cho chuỗi điểm chụp ảnh không người trực.",
      details: [
        "Lắp đặt hệ thống Camera siêu nhỏ gọn với góc nhìn toàn cảnh, bao quát khu vực buồng chụp mà không gây mất thẩm mỹ.",
        "Trang bị tính năng AI báo động chủ động, tự động phát hiện và cảnh báo qua App khi có người lạ đột nhập ngoài giờ hoạt động.",
        "Thiết lập mạng diện rộng đồng bộ qua nền tảng Omada Cloud SDN, giúp IT quản lý băng thông và trạng thái mạng của hàng loạt chi nhánh buồng chụp từ một giao diện duy nhất.",
        "Cấu hình VLAN và tường lửa (Firewall) bảo mật cấp doanh nghiệp trên Omada Gateway để cô lập hệ thống camera, bảo vệ tuyệt đối dữ liệu hình ảnh riêng tư của khách hàng."
      ],
      images: [
        "/uploads/photobooth3.PNG", "/uploads/photobooth2.JPG", 
        "/uploads/photobooth1.png", "/uploads/photobooth4.JPG", "/uploads/photobooth5.JPG"
      ]
    },
    {
      id: "dongsgn",
      title: "Bệnh viện Đông Sài Gòn",
      description: "Thi công hệ thống điện mạng và trang thiết bị cảnh báo y tế chuyên dụng.",
      details: [
        "Thi công hạ tầng đi dây cáp mạng và cáp điện an toàn, đáp ứng tiêu chuẩn khắt khe của bệnh viện.",
        "Lắp đặt hệ thống thiết bị y tế chuyên dụng: trung tâm đầu báo, nút bấm gọi y tá tại các giường bệnh.",
        "Trang bị và kết nối hệ thống đèn báo hiệu trước cửa phòng bệnh và hành lang khu vực cấp cứu.",
        "Đồng bộ hóa hệ thống gọi y tá với trung tâm trực ban, đảm bảo phản ứng nhanh chóng trong các tình huống khẩn cấp."
      ],
      images: [
        "/uploads/dongsgn1.JPG", "/uploads/dongsgn2.JPG", 
        "/uploads/dongsgn3.JPG", "/uploads/dongsgn4.JPG", "/uploads/dongsgn5.JPG"
      ]
    }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* 1. HEADER (ĐỒNG BỘ TỪ TRANG CHỦ) */}
      <header style={{ background: "#1e293b", padding: "12px 0", borderBottom: "1px solid #0f172a" }}>
        <div style={{ maxWidth: "1140px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", width: "96%" }}>
          <div style={{ color: "white", fontWeight: "bold", fontSize: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="fas fa-video"></i> Cios
          </div>
          <nav style={{ display: "flex", gap: "20px" }}>
            <Link href="/" className="nav-link"><i className="fas fa-home"></i> Trang chủ</Link>
            <Link href="/contact" className="nav-link"><i className="fas fa-phone-alt"></i> Liên hệ</Link>
            <Link href="/projects" className="nav-link"><i className="fas fa-project-diagram"></i> Dự án</Link>
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

      {/* 2. BANNER DỰ ÁN (Khôi phục lại hình nền tĩnh ban đầu của bạn) */}
      <div style={{ background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url("https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2000")', backgroundSize: 'cover', backgroundPosition: 'center', padding: '80px 20px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px' }}>Dự Án Đã Thi Công</h1>
        <p style={{ fontSize: '16px', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>Tự hào là đối tác triển khai hệ thống an ninh giám sát và mạng hạ tầng cho hàng trăm doanh nghiệp, cơ quan và cửa hàng.</p>
      </div>

      {/* 2.5 KHU VỰC VIDEO GIỚI THIỆU (Nằm ngay trên các dự án) */}
      <div style={{ maxWidth: '1000px', margin: '50px auto 0', padding: '0 20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '20px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <i className="fas fa-play-circle" style={{ color: '#e11d48', fontSize: '24px' }}></i>
            Video Giới Thiệu Công Ty
          </h2>
          <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
            <video 
              src="/uploads/video-cong-ty.mp4" 
              controls 
              autoPlay 
              muted 
              loop 
              playsInline
              style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', display: 'block' }}
            >
              Trình duyệt của bạn không hỗ trợ xem video.
            </video>
          </div>
        </div>
      </div>

      {/* 3. DANH SÁCH DỰ ÁN */}
      <div style={{ maxWidth: '1000px', margin: '40px auto 50px', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '60px' }}>
        {projectsData.map((project, index) => (
          <div key={project.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: index % 2 === 0 ? 'row' : 'row-reverse', flexWrap: 'wrap' }}>
            
            <div style={{ flex: 1, minWidth: '350px', padding: '20px' }}>
              <ProjectSlider images={project.images} />
            </div>

            <div style={{ flex: 1, minWidth: '350px', padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ color: '#e11d48', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Dự án nổi bật</span>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '15px', lineHeight: '1.3' }}>{project.title}</h2>
              <p style={{ color: '#475569', fontSize: '15px', marginBottom: '20px', lineHeight: '1.6' }}>{project.description}</p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {project.details.map((detail, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
                    <i className="fas fa-check-circle" style={{ color: '#10b981', marginTop: '3px' }}></i>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* 4. FLOATING BUTTONS */}
      <div className="floating-buttons">
        <a href="https://zalo.me/0971024173" target="_blank" rel="noopener noreferrer" className="float-btn zalo">
          <i className="fas fa-comment-dots"></i> Chat Zalo
        </a>
        <a href="tel:0971024173" className="float-btn phone">
          <i className="fas fa-phone-alt"></i> 0971.024.173
        </a>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="float-btn up-top" 
          style={{ border: 'none', cursor: 'pointer' }}
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      </div>

      {/* 5. FOOTER */}
      <footer className="pro-footer">
        <div className="footer-container">
          <div className="footer-col">
            <h3>Cios</h3>
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
          © 2026 Công Ty TNHH Camera CB. Giấy phép KD số: 0123456789.
        </div>
      </footer>
    </div>
  );
}