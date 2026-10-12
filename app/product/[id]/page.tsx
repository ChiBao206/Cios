"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import NotifBadge from '@/app/components/NotifBadge';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter(); 
  const { addToCart, totalItems } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc'); 
  
  // ==========================================
  // STATE LẤY DỮ LIỆU TỪ MONGODB
  // ==========================================
  const [user, setUser] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // State cho Form Đánh giá mới
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0); 
  const [hoverRating, setHoverRating] = useState(0); 
  const [newComment, setNewComment] = useState('');
  const [reviewImage, setReviewImage] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // STATE KIỂM TRA NGÀY VÀNG VÀ % GIẢM GIÁ TỪ ADMIN
  const [isSaleDay, setIsSaleDay] = useState(false);
  const [saleDiscount, setSaleDiscount] = useState(0);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) setUser(JSON.parse(loggedInUser));

    const fetchData = async () => {
      try {
        const timestamp = new Date().getTime();
        
        // GỌI THÊM API SETTINGS ĐỂ LẤY CẤU HÌNH ADMIN
        const [prodRes, reviewRes, setRes] = await Promise.all([
          fetch(`/api/products?t=${timestamp}`),
          fetch(`/api/reviews?t=${timestamp}`),
          fetch(`/api/settings?t=${timestamp}`).catch(() => null)
        ]);

        if (prodRes.ok) {
          const allProducts = await prodRes.json();
          const currentProduct = allProducts.find((p: any) => String(p._id || p.id) === String(params?.id));
          setProduct(currentProduct);

          if (currentProduct) {
            const related = allProducts
              .filter((p: any) => String(p.category_id) === String(currentProduct.category_id) && String(p._id || p.id) !== String(params?.id))
              .slice(0, 4);
            setRelatedProducts(related);
          }
        }

        if (reviewRes.ok) {
          const allReviews = await reviewRes.json();
          const currentReviews = allReviews.filter((r: any) => String(r.product_id) === String(params?.id));
          setReviews(currentReviews);
        }

        // XỬ LÝ CẤU HÌNH TỪ ADMIN ĐỂ ÁP DỤNG SALE
        if (setRes && setRes.ok) {
          const sData = await setRes.json();
          if (sData) {
            const discount = Number(sData.saleDiscount) || 0;
            setSaleDiscount(discount);
            
            const currentDay = new Date().getDate();
            const daysArray = (sData.saleDays || "").split(',').map((d: string) => parseInt(d.trim()));
            
            if (daysArray.includes(currentDay) && discount > 0) {
              setIsSaleDay(true);
            }
          }
        }

      } catch (error) {
        console.error("Lỗi tải dữ liệu MongoDB:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) {
      fetchData();
    }
  }, [params?.id]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Vui lòng đăng nhập để gửi đánh giá!");
    if (newRating === 0) return alert("Vui lòng chọn số sao đánh giá cho sản phẩm!");
    if (!newComment.trim()) return alert("Vui lòng nhập nội dung đánh giá!");

    setIsSubmittingReview(true);
    
    const reviewData = {
      product_id: params?.id,
      username: user.username,
      customer_name: user.username,
      rating: newRating,
      comment: newComment,
      image: reviewImage, 
      status: "Đã duyệt" 
    };

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      if (res.ok) {
        const savedReview = await res.json();
        setReviews([savedReview, ...reviews]);
        setShowReviewForm(false);
        setNewComment('');
        setNewRating(0); 
        setReviewImage(''); 
        alert("🎉 Cảm ơn bạn đã đánh giá sản phẩm!");
      } else {
        alert("Có lỗi xảy ra khi lưu đánh giá.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ API!");
    }
    setIsSubmittingReview(false);
  };

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / totalReviews).toFixed(1) 
    : '0.0';

  if (isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px", fontWeight: "bold", color: "#64748b" }}>
        <i className="fas fa-spinner fa-spin" style={{ marginRight: "10px" }}></i> Đang tải thông tin sản phẩm...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', background: '#f8fafc', height: '100vh' }}>
        <h1 style={{ fontSize: '30px', color: '#1e293b', marginBottom: '20px' }}>Opps! Không tìm thấy sản phẩm.</h1>
        <Link href="/" style={{ padding: '10px 25px', background: '#e11d48', color: 'white', borderRadius: '30px', fontWeight: 'bold', textDecoration: 'none' }}>
          <i className="fas fa-arrow-left"></i> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const addToFavorite = (productData: any) => {
    const saved = localStorage.getItem('camera_bn_favs');
    let favList = saved ? JSON.parse(saved) : [];
    const exists = favList.find((item: any) => String(item._id || item.id) === String(productData._id || productData.id));
    
    if(!exists) {
      favList.push(productData);
      localStorage.setItem('camera_bn_favs', JSON.stringify(favList));
      alert("Đã thêm vào mục Sản phẩm yêu thích!");
    } else { alert("Sản phẩm này đã nằm trong mục Yêu thích rồi!"); }
  };
  
  const handleDecrease = () => { if (quantity > 1) setQuantity(quantity - 1); };
  const handleIncrease = () => { if (quantity < Number(product.quantity)) setQuantity(quantity + 1); };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <style>{`
        .pd-wrapper { max-width: 1200px; width: 95%; margin: 20px auto 60px; flex: 1; font-family: 'Segoe UI', sans-serif;}
        .breadcrumb-box { background: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border-left: 4px solid #0ea5e9; font-size: 14px; font-weight: 600; color: #64748b; margin-bottom: 25px; }
        .breadcrumb-box a { color: #1e293b; transition: 0.2s; text-decoration: none; }
        .breadcrumb-box a:hover { color: #0ea5e9; }
        
        .pd-main-card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; display: flex; gap: 50px; flex-wrap: wrap; margin-bottom: 30px; position: relative;}
        .pd-img-col { flex: 1; min-width: 300px; display: flex; justify-content: center; align-items: center; padding: 20px; position: relative;}
        .pd-img-col img { width: 100%; max-width: 400px; object-fit: contain; }
        
        .pd-info-col { flex: 1.2; min-width: 350px; position: relative; }
        .pd-sku { background: #f1f5f9; padding: 5px 10px; border-radius: 4px; font-size: 12px; color: #64748b; display: inline-block; margin-bottom: 15px; }
        .pd-heart { position: absolute; top: 0; right: 0; width: 40px; height: 40px; border-radius: 50%; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 18px; cursor: pointer; transition: 0.3s; background: white;}
        .pd-heart:hover { color: #ef4444; border-color: #ef4444; background: #fff1f2; }
        
        .pd-title { font-size: 28px; color: #0f172a; margin-bottom: 20px; font-weight: 800; line-height: 1.3; padding-right: 50px;}
        .pd-price-box { background: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #f1f5f9; display: flex; align-items: baseline; gap: 15px;}
        .pd-price { color: #ef4444; font-size: 36px; font-weight: 800; }
        .pd-old-price { color: #94a3b8; font-size: 18px; text-decoration: line-through; }
        
        .pd-rating { display: flex; align-items: center; gap: 10px; font-size: 14px; margin-bottom: 25px; color: #64748b; }
        .pd-stars { color: #facc15; font-size: 13px; }
        
        .pd-qty-row { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; font-weight: 600; color: #1e293b;}
        .qty-controls { display: flex; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; height: 40px; }
        .qty-btn { width: 40px; background: white; border: none; font-size: 18px; cursor: pointer; color: #64748b; transition: 0.2s;}
        .qty-btn:hover { background: #f1f5f9; color: #1e293b; }
        .qty-input { width: 60px; border: none; border-left: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; text-align: center; font-weight: bold; font-size: 15px; outline: none; }
        
        .pd-buttons { display: flex; gap: 15px; }
        .btn-add { flex: 1; border: 2px solid #0ea5e9; color: #0ea5e9; background: white; padding: 15px; border-radius: 8px; font-weight: 800; font-size: 15px; cursor: pointer; transition: 0.3s; display: flex; justify-content: center; align-items: center; gap: 10px;}
        .btn-add:hover { background: #f0f9ff; }
        .btn-buy { flex: 1; background: linear-gradient(to right, #ff6b6b, #ef4444); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 800; font-size: 15px; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); }
        .btn-buy:hover { opacity: 0.9; transform: translateY(-2px); }
        
        .pd-tabs-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; overflow: hidden; margin-bottom: 50px;}
        .tab-header { display: flex; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
        .tab-btn { flex: 1; padding: 18px; font-weight: 700; color: #64748b; background: transparent; border: none; border-top: 3px solid transparent; cursor: pointer; font-size: 15px; transition: 0.3s; }
        .tab-btn.active { color: #0ea5e9; border-top-color: #0ea5e9; background: white; }
        .tab-content { padding: 40px; line-height: 1.8; color: #475569; font-size: 15px; }
        
        .section-title-center { text-align: center; font-size: 22px; color: #1e293b; text-transform: uppercase; font-weight: 800; margin-bottom: 40px; position: relative; }
        .section-title-center::after { content: ''; position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); width: 50px; height: 3px; background: #0ea5e9; }
        
        .related-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; transition: 0.3s; position: relative; display: flex; flex-direction: column;}
        .related-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .badge-discount { position: absolute; top: 15px; left: 15px; background: #ef4444; color: white; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; z-index: 2; }
        .rc-img { height: 160px; display: flex; justify-content: center; align-items: center; margin-bottom: 15px; overflow: hidden; }
        .rc-title { font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 10px; height: 40px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .rc-price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; flex-direction: column; justify-content: center; min-height: 40px;}
        .rc-new-price { color: #ef4444; font-weight: 800; font-size: 16px; }
        .rc-old-price { color: #94a3b8; text-decoration: line-through; font-size: 12px; }
        .rc-meta { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-top: auto; }
        
        .star-rating i { color: #cbd5e1; font-size: 28px; cursor: pointer; transition: 0.2s; margin-right: 8px; }
        .star-rating i.active { color: #f59e0b; }
        
        @media (max-width: 768px) {
          .pd-main-card { padding: 20px; flex-direction: column; gap: 20px; }
          .pd-title { font-size: 22px; }
          .pd-price { font-size: 28px; }
          .pd-buttons { flex-direction: column; }
          .tab-btn { padding: 12px; font-size: 13px; }
          .tab-content { padding: 20px; }
        }
      `}</style>

      {/* HEADER */}
      <header style={{ background: '#1e293b', padding: '12px 0', borderBottom: '1px solid #0f172a', fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '96%' }}>
          <Link href="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <i className="fas fa-video"></i> CIOs - impossible is nothing
          </Link>
          <nav style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/" className="nav-link" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}><i className="fas fa-home"></i> Trang chủ</Link>
            <Link href="/contact" className="nav-link" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}><i className="fas fa-phone-alt"></i> Liên hệ</Link>
            <Link href="/notifications" className="nav-link" style={{ position: 'relative', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
              <i className="fas fa-bell"></i> Thông báo <NotifBadge />
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

      {/* MAIN CONTAINER */}
      <div className="pd-wrapper">
        <div className="breadcrumb-box">
          <Link href="/">Trang chủ</Link>
          <span style={{ margin: '0 8px', color: '#cbd5e1' }}>›</span>
          <span style={{ color: '#0ea5e9' }}>{product.name}</span>
        </div>

        <div className="pd-main-card">
          {/* TAG SALE DÀNH CHO SẢN PHẨM CHÍNH ĐỘNG TỪ ADMIN */}
          {isSaleDay && saleDiscount > 0 && (
            <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#e11d48', color: 'white', padding: '5px 12px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', zIndex: 5, boxShadow: '0 4px 10px rgba(225,29,72,0.3)', transform: 'rotate(-5deg)' }}>
              -{saleDiscount}% GIẢM NGAY
            </div>
          )}

          <div className="pd-img-col">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="pd-info-col">
            <div className="pd-sku">SKU: {String(product._id || product.id).slice(-6).toUpperCase()}</div>
            <div className="pd-heart" onClick={() => addToFavorite(product)}><i className="fas fa-heart"></i></div>
            
            <h1 className="pd-title">{product.name}</h1>
            
            {/* TÍNH TOÁN GIÁ DỰA TRÊN CẤU HÌNH ADMIN */}
            <div className="pd-price-box">
              {isSaleDay && saleDiscount > 0 ? (
                <>
                  <div className="pd-price">{(Number(product.price) * (1 - saleDiscount / 100)).toLocaleString('vi-VN')} đ</div>
                  <div className="pd-old-price">{Number(product.price).toLocaleString('vi-VN')} đ</div>
                </>
              ) : (
                <div className="pd-price">{Number(product.price).toLocaleString('vi-VN')} đ</div>
              )}
            </div>

            <div className="pd-rating">
              <span className="pd-stars">
                 {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
              </span>
              <Link href="#" onClick={(e) => { e.preventDefault(); setActiveTab('reviews'); }} style={{ color: '#0ea5e9', textDecoration: 'underline' }}>
                (Xem {totalReviews} đánh giá)
              </Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
              <span>Đã bán {product.sold || 1}</span>
            </div>

            <div className="pd-qty-row">
              <span>Số lượng:</span>
              <div className="qty-controls">
                <button className="qty-btn" onClick={handleDecrease}>-</button>
                <input type="text" className="qty-input" value={quantity} readOnly />
                <button className="qty-btn" onClick={handleIncrease}>+</button>
              </div>
              <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 'normal' }}>
                {product.quantity} sản phẩm có sẵn
              </span>
            </div>

            <div className="pd-buttons">
              {Number(product.quantity) > 0 ? (
                <>
                  <button className="btn-add" onClick={() => {
                    if (!user) {
                      alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
                      router.push('/login');
                    } else {
                      addToCart(product, quantity, true);
                      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
                    }
                  }}>
                    <i className="fas fa-cart-plus"></i> THÊM VÀO GIỎ
                  </button>
                  <button className="btn-buy" onClick={() => {
                    if (!user) {
                      alert("Vui lòng đăng nhập để mua hàng!");
                      router.push('/login');
                    } else {
                      addToCart(product, quantity, false);
                      router.push('/cart');
                    }
                  }}>
                    MUA NGAY
                  </button>
                </>
              ) : (
                <button className="btn-buy" disabled style={{ background: '#cbd5e1', cursor: 'not-allowed', width: '100%', color: '#64748b', boxShadow: 'none' }}>
                  SẢN PHẨM TẠM HẾT HÀNG
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABS CHUYỂN ĐỔI */}
        <div className="pd-tabs-card">
          <div className="tab-header">
            <button className={`tab-btn ${activeTab === 'desc' ? 'active' : ''}`} onClick={() => setActiveTab('desc')}>Mô tả sản phẩm</button>
            <button className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>Thông số kỹ thuật</button>
            <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
               Đánh giá ({totalReviews})
            </button>
          </div>
          
          <div className="tab-content">
            
            {activeTab === 'desc' && (
              <div>
                <p style={{ marginBottom: '20px' }}>{product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>
                <p style={{ marginBottom: '30px' }}>Sản phẩm được thiết kế với công nghệ mới nhất, đảm bảo hiệu suất hoạt động ổn định trong thời gian dài. Vỏ ngoài làm từ chất liệu cao cấp chống va đập, tản nhiệt tốt. Phù hợp cho cả nhu cầu gia đình và doanh nghiệp nhỏ.</p>
                <div style={{ textAlign: 'center' }}>
                  <img src={product.image} alt={product.name} style={{ maxWidth: '100%', width: '400px', borderRadius: '8px' }} />
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '15px', background: '#f8fafc', width: '35%', fontWeight: 'bold', color: '#475569' }}>Thương hiệu</td>
                      <td style={{ padding: '15px', color: '#1e293b', fontWeight: '500' }}>{product.name.split(' ')[1] || 'Đang cập nhật'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '15px', background: '#f8fafc', fontWeight: 'bold', color: '#475569' }}>Độ phân giải</td>
                      <td style={{ padding: '15px', color: '#1e293b' }}>2.0 Megapixel (Full HD 1080P)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '15px', background: '#f8fafc', fontWeight: 'bold', color: '#475569' }}>Tầm quan sát hồng ngoại</td>
                      <td style={{ padding: '15px', color: '#1e293b' }}>30 mét (Smart IR)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '15px', background: '#f8fafc', fontWeight: 'bold', color: '#475569' }}>Tiêu chuẩn chống nước/bụi</td>
                      <td style={{ padding: '15px', color: '#1e293b' }}>Chuẩn IP67 (Lắp đặt ngoài trời)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '15px', background: '#f8fafc', fontWeight: 'bold', color: '#475569' }}>Nguồn điện</td>
                      <td style={{ padding: '15px', color: '#1e293b' }}>12V DC / Hỗ trợ cấp nguồn PoE</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '15px', background: '#f8fafc', fontWeight: 'bold', color: '#475569' }}>Thời gian bảo hành</td>
                      <td style={{ padding: '15px', color: '#10b981', fontWeight: 'bold' }}>24 tháng chính hãng</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  
                  <div style={{ textAlign: 'center', minWidth: '120px' }}>
                    <div style={{ fontSize: '50px', fontWeight: '900', color: '#f59e0b', lineHeight: '1' }}>{avgRating}</div>
                    <div style={{ color: '#f59e0b', fontSize: '18px', margin: '5px 0' }}>
                        {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{totalReviews} bài đánh giá</div>
                  </div>

                  <div style={{ flex: 1, minWidth: '250px' }}>
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviews.filter(r => Number(r.rating || 5) === star).length;
                      const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px', fontSize: '13px', color: '#475569' }}>
                          <span style={{ width: '40px', fontWeight: 'bold' }}>{star} sao</span>
                          <div style={{ flex: 1, background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, background: '#f59e0b', height: '100%', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ width: '20px', textAlign: 'right' }}>{count}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>Bạn đã dùng sản phẩm này?</p>
                    <button 
                      onClick={() => {
                        if (!user) { alert("Vui lòng đăng nhập để đánh giá!"); router.push('/login'); return; }
                        setShowReviewForm(!showReviewForm);
                      }} 
                      style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 6px rgba(59,130,246,0.3)' }}
                    >
                      {showReviewForm ? 'Hủy bỏ' : 'Gửi đánh giá của bạn'}
                    </button>
                  </div>
                </div>

                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '16px' }}>Đánh giá sản phẩm</h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Chất lượng:</span>
                      <div className="star-rating" onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <i 
                            key={star} 
                            className={star <= (hoverRating || newRating) ? "fas fa-star active" : "far fa-star"} 
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                          ></i>
                        ))}
                      </div>
                      <span style={{ fontSize: '13px', color: newRating > 0 ? '#e11d48' : '#64748b', fontWeight: 'bold' }}>
                        {newRating === 0 ? 'Vui lòng chọn sao' : `${newRating} Sao`}
                      </span>
                    </div>

                    <textarea 
                      required 
                      value={newComment} 
                      onChange={e => setNewComment(e.target.value)} 
                      placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..." 
                      style={{ width: '100%', height: '100px', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', resize: 'vertical', marginBottom: '15px' }}
                    ></textarea>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 15px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', color: '#475569', fontWeight: 'bold', transition: '0.2s' }}>
                        <i className="fas fa-camera" style={{ color: '#3b82f6' }}></i> Thêm ảnh
                        <input type="file" accept="image/*" onChange={handleReviewImageUpload} style={{ display: 'none' }} />
                      </label>
                      
                      {reviewImage && (
                        <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                          <img src={reviewImage} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                          <button type="button" onClick={() => setReviewImage('')} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>&times;</button>
                        </div>
                      )}
                    </div>

                    <button type="submit" disabled={isSubmittingReview} style={{ background: isSubmittingReview ? '#94a3b8' : '#10b981', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '6px', fontWeight: 'bold', cursor: isSubmittingReview ? 'not-allowed' : 'pointer' }}>
                      {isSubmittingReview ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
                    </button>
                  </form>
                )}

                <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '20px' }}>Bình luận mới nhất</h3>
                
                {reviews.length === 0 ? (
                  <div style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá nhé!</div>
                ) : (
                  reviews.map((r, index) => {
                    const rName = r.customer_name || r.customer || r.username || 'Khách hàng';
                    const rRating = Number(r.rating || 5);
                    const rDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'Mới đây';

                    return (
                      <div key={index} style={{ display: 'flex', gap: '20px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px dashed #e2e8f0' }}>
                        <div style={{ width: '50px', height: '50px', background: '#1e293b', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', flexShrink: 0 }}>
                          {rName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{rName}</span>
                            <span style={{ fontSize: '11px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}><i className="fas fa-check-circle"></i> Đã mua hàng</span>
                          </div>
                          
                          <div style={{ color: '#f59e0b', fontSize: '13px', margin: '5px 0' }}>
                             {'★'.repeat(rRating)}{'☆'.repeat(5 - rRating)}
                          </div>
                          
                          <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: '8px 0' }}>{r.comment || r.content}</p>
                          
                          {r.image && (
                            <div style={{ marginTop: '10px' }}>
                              <img src={r.image} alt="Review attachment" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }} onClick={() => window.open(r.image, '_blank')} />
                            </div>
                          )}

                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>Gửi vào ngày {rDate}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* 5. SẢN PHẨM LIÊN QUAN */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="section-title-center">CÓ THỂ BẠN SẼ THÍCH</h2>
            <div className="product-grid" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {relatedProducts.map((p) => {
                return (
                  <div className="related-card" key={p._id || p.id} style={{ flex: 1, minWidth: '250px' }}>
                    {/* TAG SALE DÀNH CHO SẢN PHẨM LIÊN QUAN */}
                    {isSaleDay && saleDiscount > 0 && <div className="badge-discount">-{saleDiscount}%</div>}
                    
                    <div className="rc-img">
                      <Link href={`/product/${p._id || p.id}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={p.image} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </Link>
                    </div>
                    
                    <Link href={`/product/${p._id || p.id}`} style={{ textDecoration: 'none' }}>
                      <div className="rc-title">{p.name}</div>
                    </Link>
                    
                    {/* TÍNH TOÁN GIÁ DỰA THEO ADMIN CHO SẢN PHẨM LIÊN QUAN */}
                    <div className="rc-price-row">
                      {isSaleDay && saleDiscount > 0 ? (
                        <>
                          <span className="rc-old-price" style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '12px' }}>
                            {Number(p.price).toLocaleString('vi-VN')} đ
                          </span>
                          <span className="rc-new-price" style={{ color: '#ef4444', fontWeight: '800', fontSize: '16px' }}>
                            {(Number(p.price) * (1 - saleDiscount / 100)).toLocaleString('vi-VN')} đ
                          </span>
                        </>
                      ) : (
                        <span className="rc-new-price" style={{ color: '#ef4444', fontWeight: '800', fontSize: '16px' }}>
                          {Number(p.price).toLocaleString('vi-VN')} đ
                        </span>
                      )}
                    </div>
                    
                    <div className="rc-meta">
                      <span style={{ color: '#cbd5e1' }}>★★★★★</span>
                      <span>(Đã bán {p.sold || 0})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="pro-footer" style={{ background: '#1e293b', color: '#cbd5e1', paddingTop: '60px' }}>
        <div className="footer-container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px', padding: '0 20px', paddingBottom: '40px' }}>
          <div className="footer-col" style={{ flex: 1.5, minWidth: '250px' }}>
            <h3 style={{ color: 'white', marginBottom: '20px' }}>CIOs - impossible is nothing</h3>
            <p style={{ lineHeight: 1.6, marginBottom: '20px' }}>Đối tác tin cậy cung cấp giải pháp an ninh toàn diện. Cam kết sản phẩm chính hãng, dịch vụ tận tâm và hỗ trợ kỹ thuật trọn đời.</p>
            <div className="social-icons" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div className="social-btn" style={{ width: '35px', height: '35px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#3b5998' }}><i className="fab fa-facebook-f"></i></div>
              <div className="social-btn" style={{ width: '35px', height: '35px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#e1306c' }}><i className="fab fa-instagram"></i></div>
              <div className="social-btn" style={{ width: '35px', height: '35px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#ff0000' }}><i className="fab fa-youtube"></i></div>
            </div>
          </div>

          <div className="footer-col" style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ color: 'white', marginBottom: '20px' }}>CHÍNH SÁCH HỖ TRỢ</h3>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}><span style={{ color: '#0ea5e9', marginRight: '8px' }}>›</span> Chính sách bảo hành 24 tháng</li>
              <li style={{ marginBottom: '12px' }}><span style={{ color: '#0ea5e9', marginRight: '8px' }}>›</span> Đổi trả 1-1 trong 30 ngày</li>
              <li style={{ marginBottom: '12px' }}><span style={{ color: '#0ea5e9', marginRight: '8px' }}>›</span> Chính sách bảo mật thông tin</li>
              <li style={{ marginBottom: '12px' }}><span style={{ color: '#0ea5e9', marginRight: '8px' }}>›</span> Hướng dẫn mua hàng online</li>
              <li style={{ marginBottom: '12px' }}><span style={{ color: '#0ea5e9', marginRight: '8px' }}>›</span> Hướng dẫn thanh toán</li>
            </ul>
          </div>

          <div className="footer-col" style={{ flex: 1.5, minWidth: '250px' }}>
            <h3 style={{ color: 'white', marginBottom: '20px' }}>LIÊN HỆ VỚI CHÚNG TÔI</h3>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ color: '#0ea5e9', fontSize: '18px' }}><i className="fas fa-map-marker-alt"></i></div>
              <div><strong style={{ color: 'white' }}>Trụ sở chính:</strong><p style={{ margin: '5px 0 0 0' }}>12 Trịnh Đình Thảo, P. Hòa Thạnh, Q. Tân Phú, TP. Hồ Chí Minh</p></div>
            </div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ color: '#0ea5e9', fontSize: '18px' }}><i className="fas fa-phone-alt"></i></div>
              <div><strong style={{ color: 'white' }}>Hotline 24/7:</strong><p style={{ margin: '5px 0 0 0', color: '#0ea5e9', fontWeight: 'bold' }}>0971.024.173</p></div>
            </div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ color: '#0ea5e9', fontSize: '18px' }}><i className="fas fa-envelope"></i></div>
              <div><strong style={{ color: 'white' }}>Email hỗ trợ:</strong><p style={{ margin: '5px 0 0 0' }}>hotro@cameracb.com</p></div>
            </div>
          </div>

          <div className="footer-col" style={{ flex: 1.5, minWidth: '250px' }}>
            <h3 style={{ color: 'white', marginBottom: '20px' }}>BẢN ĐỒ CỬA HÀNG</h3>
            <div
              className="map-frame"
              style={{
                background: "#ccc",
                height: "150px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyItems: "center",
                overflow: "hidden"
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
        <div style={{ background: '#0f172a', textAlign: 'center', padding: '20px', fontSize: '14px', borderTop: '1px solid #334155' }}>
          © 2026 Công Ty TNHH CIOs - impossible is nothing. Giấy phép KD số: 0123456789.
        </div>
      </footer>
    </div>
  );
}