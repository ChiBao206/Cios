"use client";

import { useState } from 'react';
import Link from 'next/link';

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
        // Đã sửa 'cover' thành 'contain' để không bao giờ bị cắt mất viền ảnh
        style={{ width: '100%', height: '100%', objectFit: 'contain', transition: '0.3s' }} 
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
          <div key={idx} style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentIndex === idx ? '#3b82f6' : 'rgba(15, 23, 42, 0.4)', transition: '0.3s' }} />
        ))}
      </div>
    </div>
  );
};

export default function ProjectsPage() {
  // DỮ LIỆU 5 DỰ ÁN ĐÃ CHỈNH SỬA NỘI DUNG CHUYÊN NGÀNH
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
        "/uploads/photobooth1.png", "/uploads/photobooth2.JPG", 
        "/uploads/photobooth3.PNG", "/uploads/photobooth4.JPG", "/uploads/photobooth5.JPG"
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
        <p style={{ fontSize: '16px', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto' }}>Tự hào là đối tác triển khai hệ thống an ninh giám sát và mạng hạ tầng cho hàng trăm doanh nghiệp, cơ quan và cửa hàng.</p>
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