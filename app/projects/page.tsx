"use client";

import { useState } from 'react';
import Link from 'next/link';
import NotifBadge from '@/app/components/NotifBadge';

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
    <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <img 
        src={images[currentIndex]} 
        alt="Hình ảnh dự án" 
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.3s' }} 
        // Nếu không tìm thấy ảnh, tự động hiển thị ảnh chờ
        onError={(e) => { e.currentTarget.src = "https://placehold.co/800x400?text=Chua+Co+Anh+Du+An" }}
      />
      
      {/* Nút Previous */}
      <button onClick={prevSlide} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(15, 23, 42, 0.7)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
        <i className="fas fa-chevron-left"></i>
      </button>

      {/* Nút Next */}
      <button onClick={nextSlide} style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(15, 23, 42, 0.7)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
        <i className="fas fa-chevron-right"></i>
      </button>

      {/* Dấu chấm chỉ báo số ảnh */}
      <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
        {images.map((_, idx) => (
          <div key={idx} style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentIndex === idx ? '#3b82f6' : 'rgba(255,255,255,0.5)', transition: '0.3s' }} />
        ))}
      </div>
    </div>
  );
};

export default function ProjectsPage() {
  // DỮ LIỆU 5 DỰ ÁN
  const projectsData = [
    {
      id: "oocl",
      title: "Hệ thống An ninh Văn phòng OOCL",
      description: "Thi công hệ thống giám sát toàn diện cho văn phòng làm việc.",
      details: [
        "Lắp đặt hệ thống Camera IP Dome ốp trần cho các khu vực làm việc chung và hành lang.",
        "Đi dây cáp mạng chuẩn Cat6 âm trần thẩm mỹ, kết nối tập trung về Switch PoE.",
        "Cấu hình IP tĩnh cho toàn bộ thiết bị, thiết lập phân quyền truy cập camera theo từng phòng ban.",
        "Tích hợp đầu ghi hình NVR lưu trữ băng thông chuẩn H.265+, đảm bảo xem lại mượt mà trong 30 ngày."
      ],
      images: [
        "/images/projects/oocl-1.jpg", "/images/projects/oocl-2.jpg", 
        "/images/projects/oocl-3.jpg", "/images/projects/oocl-4.jpg", "/images/projects/oocl-5.jpg"
      ]
    },
{
      id: "kalbi",
      title: "Giải pháp Giám sát & Mạng nội bộ Nhà hàng Kalbi",
      description: "Bảo đảm an ninh khu vực kinh doanh và quản lý hạ tầng mạng tập trung chuẩn doanh nghiệp.",
      details: [
        "Sử dụng Camera Wifi góc rộng kết hợp đàm thoại 2 chiều tại khu vực bếp để bếp trưởng điều phối linh hoạt.",
        "Trang bị camera thu âm chuyên dụng tại quầy thu ngân với độ nét cao để theo dõi và xử lý chính xác các sự cố thanh toán.",
        "Triển khai hạ tầng mạng TP-Link Omada SDN chuyên dụng, đảm bảo kết nối WiFi Roaming xuyên suốt không điểm chết cho toàn bộ hệ thống camera không dây.",
        "Tích hợp bộ điều khiển Omada Cloud Controller cho phép chủ nhà hàng giám sát toàn bộ lưu lượng mạng, cấu hình từ xa và nhận cảnh báo sự cố thiết bị theo thời gian thực."
      ],
      images: [
        "/images/projects/kalbi-1.jpg", "/images/projects/kalbi-2.jpg", 
        "/images/projects/kalbi-3.jpg", "/images/projects/kalbi-4.jpg", "/images/projects/kalbi-5.jpg"
      ]
    },
    {
      id: "hocmon",
      title: "Trường Dạy Lái Xe Hóc Môn",
      description: "Giám sát bãi tập lái xe ngoài trời và phòng học lý thuyết.",
      details: [
        "Triển khai Camera PTZ (xoay 360 độ) ngoài trời, chuẩn chống nước IP67 tại bãi sa hình.",
        "Thiết lập kết nối quang point-to-point (P2P) truyền tín hiệu từ bãi tập xa về trung tâm điều hành.",
        "Lắp đặt camera độ nét cao tại các phòng thi lý thuyết chống gian lận.",
        "Cấu hình tự động theo dõi chuyển động (Smart Tracking) đối với xe tập lái trong khu vực quan trọng."
      ],
      images: [
        "/images/projects/hocmon-1.jpg", "/images/projects/hocmon-2.jpg", 
        "/images/projects/hocmon-3.jpg", "/images/projects/hocmon-4.jpg", "/images/projects/hocmon-5.jpg"
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
        "/images/projects/photobooth-1.jpg", "/images/projects/photobooth-2.jpg", 
        "/images/projects/photobooth-3.jpg", "/images/projects/photobooth-4.jpg", "/images/projects/photobooth-5.jpg"
      ]
    },
    {
      id: "dongsgn",
      title: "Bệnh viện Đông Sài Gòn",
      description: "Dự án giám sát an ninh quy mô lớn đáp ứng tiêu chuẩn y tế.",
      details: [
        "Triển khai hơn 50+ camera IP độ phân giải 4K tại hành lang, sảnh chờ và khu vực cấp cứu.",
        "Lắp ráp tủ Rack trung tâm chứa hệ thống Server, Switch quang và Đầu ghi NVR mở rộng ổ cứng 32TB.",
        "Cấu hình phần mềm CMS quản lý tập trung trên màn hình Tivi lớn tại phòng bảo vệ.",
        "Thiết lập tính năng nhận diện khuôn mặt và cảnh báo khu vực cấm xâm nhập (vùng cách ly y tế)."
      ],
      images: [
        "/images/projects/dongsgn-1.jpg", "/images/projects/dongsgn-2.jpg", 
        "/images/projects/dongsgn-3.jpg", "/images/projects/dongsgn-4.jpg", "/images/projects/dongsgn-5.jpg"
      ]
    }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* HEADER TẠM (Để đồng bộ thiết kế) */}
      <header style={{ background: "#1e293b", padding: "12px 0", borderBottom: "1px solid #0f172a" }}>
        <div style={{ maxWidth: "1140px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", width: "96%" }}>
          <Link href="/" style={{ color: "white", fontWeight: "bold", fontSize: "20px", display: "flex", alignItems: "center", gap: "10px", textDecoration: 'none' }}>
            <i className="fas fa-video"></i> CAMERA B&N
          </Link>
          <nav style={{ display: "flex", gap: "20px" }}>
            <Link href="/" style={{ color: "white", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}><i className="fas fa-home"></i> Trang chủ</Link>
            <Link href="/projects" style={{ color: "#38bdf8", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}><i className="fas fa-project-diagram"></i> Dự án</Link>
            <Link href="/contact" style={{ color: "white", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}><i className="fas fa-phone-alt"></i> Liên hệ</Link>
          </nav>
        </div>
      </header>

      {/* BANNER DỰ ÁN */}
      <div style={{ background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url("https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2000")', backgroundSize: 'cover', backgroundPosition: 'center', padding: '80px 20px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px' }}>Dự Án Đã Thi Công</h1>
        <p style={{ fontSize: '16px', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto' }}>Tự hào là đối tác triển khai hệ thống an ninh giám sát cho hàng trăm doanh nghiệp, cơ quan và cửa hàng.</p>
      </div>

      {/* DANH SÁCH DỰ ÁN */}
      <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '60px' }}>
        {projectsData.map((project, index) => (
          <div key={project.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: index % 2 === 0 ? 'row' : 'row-reverse', flexWrap: 'wrap' }}>
            
            {/* Cột Trái: Slider Ảnh */}
            <div style={{ flex: 1, minWidth: '350px', padding: '20px' }}>
              <ProjectSlider images={project.images} />
            </div>

            {/* Cột Phải: Nội dung */}
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

      {/* FOOTER ĐƠN GIẢN */}
      <footer style={{ background: '#0f172a', textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '14px' }}>
        © 2026 Công Ty TNHH Camera CB.
      </footer>
    </div>
  );
}