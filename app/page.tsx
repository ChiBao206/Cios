"use client"; // Bắt buộc phải có dòng này ở đầu file để dùng useState trong Next.js

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. Khai báo công cụ chuyển trang
import db from "../db.json";
import { useCart } from "./context/CartContext";
import NotifBadge from "@/app/components/NotifBadge";

export default function Home() {
  const categories = db.categories;
  const router = useRouter(); // 2. Khởi tạo router
  // 1. Lấy 4 sản phẩm đầu làm "Bán chạy nhất"
  const hotProducts = db.products.slice(0, 4);

  // 2. Lấy 35 sản phẩm còn lại
  const remainingProducts = db.products.slice(4);
  //công cụ giỏ hàng
  const { addToCart, totalItems } = useCart();
  // KIỂM TRA ĐĂNG NHẬP
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
// ==========================================
  // THUẬT TOÁN BỘ LỌC & PHÂN TRANG (PAGINATION LOGIC)
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false); 
  const productsPerPage = 8; 

// 1. CÁC STATE CHO BỘ LỌC
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState(0); // Thêm giá tối thiểu
  const [maxPrice, setMaxPrice] = useState(5000000); 
  const [searchTerm, setSearchTerm] = useState("");

  // 2. TỰ ĐỘNG VỀ TRANG 1 KHI ĐỔI BỘ LỌC
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, minPrice, maxPrice, searchTerm]);

  // 3. THUẬT TOÁN LỌC SẢN PHẨM TỔNG HỢP
  const baseProducts = db.products.slice(4); 
  const filteredProducts = baseProducts.filter(product => {
    const matchCat = selectedCategory === "all" || String(product.category_id) === String(selectedCategory);
    // Tính toán khoảng giá (từ minPrice đến maxPrice)
    const matchPrice = Number(product.price) >= minPrice && Number(product.price) <= maxPrice;
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchPrice && matchSearch;
  });

  // 4. CẮT DỮ LIỆU SẢN PHẨM ĐÃ LỌC ĐỂ HIỂN THỊ TRÊN TRANG HIỆN TẠI
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;

  // 3. TẠO HÀM XỬ LÝ NÚT MUA NGAY
  const handleBuyNow = (product: any) => {
    if (!user) {
      alert("Vui lòng đăng nhập để mua hàng!");
      router.push("/login"); // Chuyển hướng sang trang đăng nhập
      return;
    }
    addToCart(product);
    router.push("/cart");
  };


  // Hàm xử lý nút Tới/Lùi có tính năng vòng lặp
  const handlePrev = () => {
    // Nếu đang ở trang 1 mà bấm Lùi thì nhảy tới trang cuối (totalPages)
    setCurrentPage(currentPage === 1 ? totalPages : currentPage - 1);
  };
  
  const handleNext = () => {
    // Nếu đang ở trang cuối mà bấm Tới thì quay về trang 1
    setCurrentPage(currentPage === totalPages ? 1 : currentPage + 1);
  };

  return (
    <>
      {/* 1. HEADER (NAVBAR) */}
      <header
        style={{
          background: "#1e293b",
          padding: "12px 0",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div
          style={{
            maxWidth: "1140px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "96%",
          }}
        >
          <div
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="fas fa-video"></i> CIOs - impossible is nothing
          </div>
          <nav style={{ display: "flex", gap: "20px" }}>
            <Link href="/" className="nav-link">
              <i className="fas fa-home"></i> Trang chủ
            </Link>
            <Link href="/contact" className="nav-link">
              <i className="fas fa-phone-alt"></i> Liên hệ
            </Link>
            <Link href="/projects" className="nav-link">
  <i className="fas fa-project-diagram"></i> Dự án
</Link>
            <Link
              href="/notifications"
              className="nav-link"
              style={{ position: "relative" }}
            >
              <i className="fas fa-bell"></i> Thông báo
              <NotifBadge />
            </Link>
            <Link
              href="/cart"
              className="nav-link"
              style={{ position: "relative" }}
            >
              <i className="fas fa-shopping-cart"></i> Giỏ hàng
              {totalItems > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-12px",
                    background: "#e11d48",
                    color: "white",
                    fontSize: "10px",
                    padding: "2px 6px",
                    borderRadius: "50%",
                  }}
                >
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              /* NẾU ĐÃ ĐĂNG NHẬP */
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginLeft: "10px",
                }}
              >
                <Link
                  href={String(user.role) === "1" ? "/admin" : "/profile"}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textDecoration: "none",
                    lineHeight: "1.2",
                  }}
                >
                  <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                    Xin chào,
                  </span>
                  <span
                    style={{
                      color: "#4ade80",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    {user.username.toUpperCase()}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "6px 15px",
                    borderRadius: "4px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                >
                  Thoát
                </button>
              </div>
            ) : (
              /* NẾU CHƯA ĐĂNG NHẬP: HIỂN THỊ ĐĂNG NHẬP / ĐĂNG KÝ */
              <>
                <Link href="/login" className="nav-link">
                  <i className="fas fa-user"></i> Đăng nhập
                </Link>
                <Link href="/register" className="nav-link">
                  <i className="fas fa-user-plus"></i> Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* 2. HERO BANNER */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1
            style={{
              textTransform: "uppercase",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            Công Nghệ Giám Sát 4.0
          </h1>
          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            CIOs - impossible is nothing - Đối tác an ninh tin cậy của mọi gia đình Việt
          </p>
          <button 
            className="btn-hero" 
            style={{ background: "#e11d48" }}
            onClick={() => router.push('/contact')}
          >
            TƯ VẤN NGAY
          </button>
        </div>
      </div>

      {/* 3. MAIN LAYOUT */}
      <div className="main-container">
        {/* CỘT TRÁI (SIDEBAR) */}
        <aside className="sidebar-left">
          {/* DANH MỤC (ĐÃ SỬA LỖI ĐÓNG MỞ) */}
          <div
            className="sidebar-box category-dropdown"
            onMouseEnter={() => setIsCategoryOpen(true)}
            onMouseLeave={() => setIsCategoryOpen(false)}
          >
            <h3
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                <i
                  className="fas fa-folder-open"
                  style={{ color: "#facc15", marginRight: "8px" }}
                ></i>{" "}
                DANH MỤC
              </span>
              <i
                className="fas fa-caret-down arrow-icon"
                style={{
                  transform: isCategoryOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "0.3s",
                }}
              ></i>
            </h3>
            <ul 
              className="category-vertical" 
              style={{ 
                maxHeight: isCategoryOpen ? '500px' : '0', 
                opacity: isCategoryOpen ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.4s ease',
                marginTop: isCategoryOpen ? '10px' : '0',
                paddingTop: isCategoryOpen ? '10px' : '0',
                borderTop: isCategoryOpen ? '1px dashed #e2e8f0' : 'none'
              }}
            >
              <li 
                className={selectedCategory === "all" ? "active" : ""} 
                onClick={() => setSelectedCategory("all")}
                style={{ cursor: 'pointer' }}
              >
                Tất cả <i className="fas fa-arrow-right" style={{ fontSize: '10px' }}></i>
              </li>
              {categories.map((cat) => (
                <li 
                  key={cat.id}
                  className={selectedCategory === String(cat.id) ? "active" : ""} 
                  onClick={() => setSelectedCategory(String(cat.id))}
                  style={{ cursor: 'pointer' }}
                >
                  {cat.name} <i className="fas fa-arrow-right" style={{ fontSize: '10px' }}></i>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-box">
            <h3 style={{ marginBottom: '15px' }}>
              <i className="fas fa-money-bill-wave" style={{ color: "#eab308" }}></i> KHOẢNG GIÁ
            </h3>
            
            {/* THANH KÉO GIÁ */}
            <div style={{ paddingBottom: '15px', borderBottom: '1px solid #e2e8f0', marginBottom: '15px' }}>
              <input
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={maxPrice}
                onChange={(e) => {
                  setMinPrice(0); // Về 0 khi dùng thanh kéo
                  setMaxPrice(Number(e.target.value));
                }}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#e11d48' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '10px', color: '#64748b', fontWeight: 'bold' }}>
                <span>0 đ</span>
                <span style={{ color: '#e11d48' }}>Dưới {maxPrice.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {/* CÁC Ô CHỌN GIÁ NHANH */}
            <ul className="price-filter-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: minPrice === 0 && maxPrice === 500000 ? '#e11d48' : '#334155', fontWeight: minPrice === 0 && maxPrice === 500000 ? 'bold' : 'normal' }} onClick={() => { setMinPrice(0); setMaxPrice(500000); }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid', borderColor: minPrice === 0 && maxPrice === 500000 ? '#e11d48' : '#cbd5e1', background: minPrice === 0 && maxPrice === 500000 ? '#e11d48' : 'white' }}></div> Dưới 500k
              </li>
              <li style={{ cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: minPrice === 500000 && maxPrice === 1000000 ? '#e11d48' : '#334155', fontWeight: minPrice === 500000 && maxPrice === 1000000 ? 'bold' : 'normal' }} onClick={() => { setMinPrice(500000); setMaxPrice(1000000); }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid', borderColor: minPrice === 500000 && maxPrice === 1000000 ? '#e11d48' : '#cbd5e1', background: minPrice === 500000 && maxPrice === 1000000 ? '#e11d48' : 'white' }}></div> 500k - 1 Triệu
              </li>
              <li style={{ cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: minPrice === 1000000 && maxPrice === 3000000 ? '#e11d48' : '#334155', fontWeight: minPrice === 1000000 && maxPrice === 3000000 ? 'bold' : 'normal' }} onClick={() => { setMinPrice(1000000); setMaxPrice(3000000); }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid', borderColor: minPrice === 1000000 && maxPrice === 3000000 ? '#e11d48' : '#cbd5e1', background: minPrice === 1000000 && maxPrice === 3000000 ? '#e11d48' : 'white' }}></div> 1 - 3 Triệu
              </li>
              <li style={{ cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: minPrice === 3000000 && maxPrice === 50000000 ? '#e11d48' : '#334155', fontWeight: minPrice === 3000000 && maxPrice === 50000000 ? 'bold' : 'normal' }} onClick={() => { setMinPrice(3000000); setMaxPrice(50000000); }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid', borderColor: minPrice === 3000000 && maxPrice === 50000000 ? '#e11d48' : '#cbd5e1', background: minPrice === 3000000 && maxPrice === 50000000 ? '#e11d48' : 'white' }}></div> Trên 3 Triệu
              </li>
              <li style={{ cursor: 'pointer', marginTop: '15px', fontSize: '13px', color: '#3b82f6', fontWeight: 'bold', textAlign: 'center' }} onClick={() => { setMinPrice(0); setMaxPrice(5000000); }}>
                <i className="fas fa-sync-alt"></i> Bỏ lọc giá
              </li>
            </ul>
          </div>

          <div className="sidebar-box">
            <h3 style={{ color: "#64748b" }}>
              <i className="fas fa-headset"></i> HỖ TRỢ 24/7
            </h3>
            <div className="support-item">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#f1f5f9",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  color: "#1e293b",
                }}
              >
                <i className="fas fa-user-circle"></i>
              </div>
              <div>
                <span>Hotline mua hàng</span>
                <strong style={{ color: "#e11d48" }}>0971.024.173</strong>
              </div>
            </div>
          </div>
        </aside>

        {/* CỘT PHẢI (NỘI DUNG CHÍNH) */}
        <main className="content-right">
          <div className="search-bar-modern">
            <span style={{ padding: "10px 15px", color: "#3b82f6" }}>
              <i className="fas fa-search"></i>
            </span>
            <input 
              type="text" 
              placeholder="Bạn muốn tìm camera loại nào?" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button style={{ background: "#1e293b" }}>
              <i className="fas fa-search"></i>
            </button>
          </div>

          {/* BÁN CHẠY NHẤT */}
          <h2 className="section-title">
            <i className="fas fa-fire" style={{ color: "#e11d48" }}></i> BÁN
            CHẠY NHẤT
          </h2>
          <div className="hot-grid" style={{ marginBottom: "40px" }}>
            {hotProducts.map((product) => (
              <div className="hot-card" key={product.id}>
                <div className="hot-badge">TOP 1</div>
                <div className="hot-img">
                  <Link href={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} />
                  </Link>
                </div>
                <div className="hot-info">
                  <Link
                    href={`/product/${product.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <h3>{product.name}</h3>
                  </Link>
                  <div className="hot-price">
                    {Number(product.price).toLocaleString("vi-VN")} đ
                  </div>

              {/* SỬA LỖI HẾT HÀNG Ở MỤC BÁN CHẠY NHẤT */}
                  {Number(product.quantity) > 0 ? (
                    <button className="btn-hot-add" onClick={() => {
                      if (!user) {
                        alert("Vui lòng đăng nhập để mua hàng!");
                        router.push('/login');
                      } else {
                        addToCart(product);
                        router.push('/cart');
                      }
                    }}>
                      Mua Ngay
                    </button>
                  ) : (
                    <button className="btn-hot-add" disabled style={{ background: '#cbd5e1', color: '#64748b', cursor: 'not-allowed' }}>
                      Tạm hết hàng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* TẤT CẢ SẢN PHẨM (ĐÃ ÁP DỤNG PHÂN TRANG) */}
          <h2 className="section-title">
            <i className="fas fa-box-open" style={{ color: "#b45309" }}></i> TẤT
            CẢ SẢN PHẨM
          </h2>
          <div className="product-grid">
            {/* DUYỆT QUA BIẾN currentProducts THAY VÌ allProducts */}
            {currentProducts.map((product) => (
              <div className="product-card" key={product.id}>
                <div className="favorite-btn">
                  <i className="fas fa-heart"></i>
                </div>
                <div className="card-img">
                  <Link href={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} />
                  </Link>
                </div>
                <div className="card-body">
                  <Link
                    href={`/product/${product.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <h3>{product.name}</h3>
                  </Link>
                  <div className="price-row">
                    {Number(product.price).toLocaleString("vi-VN")} đ
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#e58e26",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    <i className="fas fa-tag"></i> Chỉ còn: {product.quantity}{" "}
                    cái
                  </div>
                  {/* SỬA LỖI HẾT HÀNG Ở MỤC TẤT CẢ SẢN PHẨM */}
                  {Number(product.quantity) > 0 ? (
                    <button
                      className="btn-hot-add"
                      onClick={() => {
                        if (!user) {
                          alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
                          router.push('/login');
                        } else {
                          addToCart(product);
                        }
                      }}
                    >
                      Thêm vào giỏ hàng
                    </button>
                  ) : (
                    <button
                      className="btn-hot-add"
                      disabled
                      style={{ background: '#cbd5e1', color: '#64748b', cursor: 'not-allowed' }}
                    >
                      Tạm hết hàng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* THANH PHÂN TRANG HOẠT ĐỘNG THỰC TẾ */}
          <div className="pagination-container">
            <div className="pagination">
              {/* Nút Lùi: Đã bỏ thuộc tính disabled */}
              <button className="page-btn prev" onClick={handlePrev}>
                <i className="fas fa-chevron-left"></i>
              </button>

              {/* Các nút số trang */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    className={`page-btn ${currentPage === number ? "active" : ""}`}
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
                  </button>
                ),
              )}

              {/* Nút Tới: Đã bỏ thuộc tính disabled */}
              <button className="page-btn next" onClick={handleNext}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </main>
      </div>

     {/* 4. FLOATING BUTTONS */}
      <div className="floating-buttons">
        {/* Mở Zalo ở tab mới */}
        <a href="https://zalo.me/0971024173" target="_blank" rel="noopener noreferrer" className="float-btn zalo">
          <i className="fas fa-comment-dots"></i> Chat Zalo
        </a>
        
        {/* Kích hoạt cuộc gọi */}
        <a href="tel:0971024173" className="float-btn phone">
          <i className="fas fa-phone-alt"></i> 0971.024.173
        </a>
        
        {/* Cuộn lên đầu trang mượt mà */}
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
            <h3>CIOs - impossible is nothing</h3>
            <p>
              Đối tác tin cậy cung cấp giải pháp an ninh toàn diện. Cam kết sản
              phẩm chính hãng, dịch vụ tận tâm và hỗ trợ kỹ thuật trọn đời.
            </p>
            <div className="social-icons">
              <div className="social-btn" style={{ background: "#3b5998" }}>
                <i className="fab fa-facebook-f"></i>
              </div>
              <div className="social-btn" style={{ background: "#e1306c" }}>
                <i className="fab fa-instagram"></i>
              </div>
              <div className="social-btn" style={{ background: "#ff0000" }}>
                <i className="fab fa-youtube"></i>
              </div>
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
              <li>
                <span className="bullet">›</span> Chính sách bảo hành 24 tháng
              </li>
              <li>
                <span className="bullet">›</span> Đổi trả 1-1 trong 30 ngày
              </li>
              <li>
                <span className="bullet">›</span> Chính sách bảo mật thông tin
              </li>
              <li>
                <span className="bullet">›</span> Hướng dẫn mua hàng online
              </li>
              <li>
                <span className="bullet">›</span> Hướng dẫn thanh toán
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>LIÊN HỆ VỚI CHÚNG TÔI</h3>
            <div className="contact-row">
              <div className="icon-box">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <strong>Trụ sở chính:</strong>
                <p>
                  12 Trịnh Đình Thảo, P. Hòa Thạnh, Q. Tân Phú, TP. Hồ Chí Minh
                </p>
              </div>
            </div>
            <div className="contact-row">
              <div className="icon-box">
                <i className="fas fa-phone-alt"></i>
              </div>
              <div>
                <strong>Hotline 24/7:</strong>
                <span className="hotline-text">0971.024.173</span>
              </div>
            </div>
            <div className="contact-row">
              <div className="icon-box">
                <i className="fas fa-envelope"></i>
              </div>
              <div>
                <strong>Email hỗ trợ:</strong>
                <p>hotro@cameracb.com</p>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h3>BẢN ĐỒ CỬA HÀNG</h3>
            <div
              className="map-frame"
              style={{
                background: "#ccc",
                height: "150px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyItems: "center",
              }}
            >
              <iframe
                src="https://maps.google.com/maps?q=12%20Tr%E1%BB%8Bnh%20%C4%90%C3%ACnh%20Th%E1%BA%A3o%2C%20Ho%C3%A0%20Th%E1%BA%A1nh%2C%20T%C3%A2n%20Ph%C3%BA%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 Công Ty TNHH CIOs - impossible is nothing. Giấy phép KD số: 0123456789.
        </div>
      </footer>
    </>
  );
}
