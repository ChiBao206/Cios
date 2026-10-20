"use client";

import Link from "next/link";
<<<<<<< HEAD
import { useState, useEffect, useRef, useCallback } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
import { useRouter } from "next/navigation";
import { useCart } from "./context/CartContext";
import NotifBadge from "@/app/components/NotifBadge";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FloatingActions from "@/app/components/FloatingActions";
import db from "../db.json";

export default function Home() {
  const router = useRouter(); 
  const { addToCart, totalItems } = useCart();
  
<<<<<<< HEAD
  // 1. STATE LƯU DỮ LIỆU
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>(db.products || []);
  const [categories, setCategories] = useState<any[]>(db.categories || []);
  const [isLoading, setIsLoading] = useState(false);
  
  // POPUP & SALE ĐỘNG TỪ ADMIN
=======
  // 1. STATE LƯU DỮ LIỆU TỪ MONGODB THẬT
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // STATE HIỂN THỊ POPUP & SALE ĐỘNG TỪ ADMIN
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
  const [showSalePopup, setShowSalePopup] = useState(false);
  const [isSaleDay, setIsSaleDay] = useState(false);
  const [saleDayText, setSaleDayText] = useState("");
  const [saleDiscount, setSaleDiscount] = useState(0); 

<<<<<<< HEAD
  // VOUCHERS
=======
  // STATE VOUCHER (MÃ GIẢM GIÁ)
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [savedVouchers, setSavedVouchers] = useState<string[]>([]);
  const [usedVouchers, setUsedVouchers] = useState<string[]>([]);

<<<<<<< HEAD
  // FAVORITES
  const [favIds, setFavIds] = useState<string[]>([]);

  // BỘ LỌC & PHÂN TRANG (Tự động khôi phục trang và danh mục khi khách từ trang chi tiết quay lại)
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPage = sessionStorage.getItem("home_current_page");
        if (savedPage && !isNaN(Number(savedPage)) && Number(savedPage) > 0) {
          return Number(savedPage);
        }
      } catch (e) {}
    }
    return 1;
  });
  const productsPerPage = 8; 
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCat = sessionStorage.getItem("home_category");
        if (savedCat) return savedCat;
      } catch (e) {}
    }
    return "all";
  });
=======
  // ĐÃ THÊM: STATE LƯU DANH SÁCH ID SẢN PHẨM ĐÃ THẢ TIM ĐỂ ĐỔI MÀU TRÁI TIM
  const [favIds, setFavIds] = useState<string[]>([]);

  // 2. TỰ ĐỘNG GỌI API ĐỂ LẤY DỮ LIỆU TỪ DATABASE
  useEffect(() => {
    const loggedInUser = localStorage.getItem("currentUser");
    
    let currentUsername = "";
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      currentUsername = parsedUser.username;
      
      const localSavedVouchers = localStorage.getItem(`camera_bn_my_vouchers_${currentUsername}`);
      if(localSavedVouchers) setSavedVouchers(JSON.parse(localSavedVouchers));

      const localUsedVouchers = localStorage.getItem(`camera_bn_used_vouchers_${currentUsername}`);
      if(localUsedVouchers) setUsedVouchers(JSON.parse(localUsedVouchers));
    }

    // ĐỌC DỮ LIỆU SẢN PHẨM YÊU THÍCH TỪ LOCALSTORAGE ĐỂ TÔ MÀU TRÁI TIM
    const localFavs = localStorage.getItem('camera_bn_favs');
    if (localFavs) {
      const parsedFavs = JSON.parse(localFavs);
      setFavIds(parsedFavs.map((f: any) => String(f._id || f.id)));
    }

    const fetchRealData = async () => {
      try {
        const timestamp = new Date().getTime();
        const [prodRes, catRes, setRes, vouRes] = await Promise.all([
          fetch(`/api/products?t=${timestamp}`),
          fetch(`/api/categories?t=${timestamp}`),
          fetch(`/api/settings?t=${timestamp}`).catch(() => null),
          fetch(`/api/vouchers?t=${timestamp}`).catch(() => null)
        ]);
        
        if (prodRes.ok) setProducts(await prodRes.json());
        if (catRes.ok) setCategories(await catRes.json());
        
        if (vouRes && vouRes.ok) {
          const vData = await vouRes.json();
          const validVouchers = vData.filter((v: any) => 
            v.isActive && 
            v.usedCount < v.maxUsage && 
            new Date(v.expireDate) >= new Date()
          );
          setVouchers(validVouchers);
        }
        
        if (setRes && setRes.ok) {
          const sData = await setRes.json();
          if (sData) {
            setSaleDiscount(Number(sData.saleDiscount) || 0);
            
            const currentDay = new Date().getDate();
            const daysArray = (sData.saleDays || "").split(',').map((d: string) => parseInt(d.trim()));
            
            if (daysArray.includes(currentDay)) {
              setIsSaleDay(true);
              setShowSalePopup(true);
              setSaleDayText(currentDay.toString());
            }
          }
        }

      } catch (error) {
        console.error("Lỗi tải dữ liệu", error);
      }
      setIsLoading(false);
    };

    fetchRealData();
  }, []);

  const handleSaveVoucher = (code: string) => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu mã giảm giá nhé!");
      router.push('/login');
      return;
    }

    if (!savedVouchers.includes(code)) {
      const newSavedList = [...savedVouchers, code];
      setSavedVouchers(newSavedList);
      localStorage.setItem(`camera_bn_my_vouchers_${user.username}`, JSON.stringify(newSavedList));
      alert(`🎉 Đã lưu mã ${code} vào ví Voucher của bạn! Hãy vào Giỏ hàng để sử dụng nhé.`);
    }
  };

  const handleClosePopup = () => {
    setShowSalePopup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  // ĐÃ SỬA: HÀM BẬT/TẮT SẢN PHẨM YÊU THÍCH (TOGGLE)
  const toggleFavorite = (productData: any) => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu sản phẩm yêu thích nhé!");
      router.push('/login');
      return;
    }
    
    const productId = String(productData._id || productData.id);
    const saved = localStorage.getItem('camera_bn_favs');
    let favList = saved ? JSON.parse(saved) : [];
    
    const existsIndex = favList.findIndex((item: any) => String(item._id || item.id) === productId);
    
    if (existsIndex === -1) {
      // Nếu chưa có -> Thêm vào yêu thích (Tim đỏ)
      favList.push(productData);
      setFavIds([...favIds, productId]);
      localStorage.setItem('camera_bn_favs', JSON.stringify(favList));
    } else { 
      // Nếu đã có -> Xóa khỏi yêu thích (Tim xám)
      favList.splice(existsIndex, 1);
      setFavIds(favIds.filter(id => id !== productId));
      localStorage.setItem('camera_bn_favs', JSON.stringify(favList));
    }
  };

  // 3. CHIA SẢN PHẨM DỰA TRÊN DỮ LIỆU THẬT
  const hotProducts = products.slice(0, 4);
  const baseProducts = products.slice(4);

  // ==========================================
  // THUẬT TOÁN BỘ LỌC & PHÂN TRANG
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false); 
  const productsPerPage = 8; 

  const [selectedCategory, setSelectedCategory] = useState("all");
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
  const [minPrice, setMinPrice] = useState(0); 
  const [maxPrice, setMaxPrice] = useState(5000000); 
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // DỮ LIỆU THẬT CHO THANH BÊN (SIDEBAR)
  const [recentOrders, setRecentOrders] = useState<any[]>([
    {
      _id: "ord_1",
      customer_name: "Anh Bảo (TP.HCM)",
      status: "Thành công",
      items: [{ name: "Đầu ghi hình Hikvision DS-7204HGHI-K1", image: "/uploads/32.jpg" }]
    },
    {
      _id: "ord_2",
      customer_name: "Chị Hạnh (Hà Nội)",
      status: "Đang giao",
      items: [{ name: "Camera Wifi Kbone H21P", image: "/uploads/96.jpg" }]
    },
    {
      _id: "ord_3",
      customer_name: "Anh Tuấn (Bình Dương)",
      status: "Đã xác nhận",
      items: [{ name: "Camera Wifi Imou Ranger 2 (A22EP)", image: "/uploads/92.jpg" }]
    }
  ]);

  // XỬ LÝ VUỐT / KÉO / CUỘN DANH MỤC TRÊN MỌI THIẾT BỊ
  const categoryNavRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDraggingCat = useRef(false);
  const startXCat = useRef(0);
  const scrollLeftCat = useRef(0);
  const hasMovedCat = useRef(false);

  const checkCatScroll = useCallback(() => {
    if (categoryNavRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryNavRef.current;
      setCanScrollLeft(scrollLeft > 6);
      if (scrollWidth > clientWidth + 8) {
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
      } else {
        setCanScrollRight(categories.length > 2);
      }
    }
  }, [categories.length]);

  useEffect(() => {
    checkCatScroll();
    const t1 = setTimeout(checkCatScroll, 100);
    const t2 = setTimeout(checkCatScroll, 400);
    const t3 = setTimeout(checkCatScroll, 1000);
    const handleResize = () => checkCatScroll();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkCatScroll, categories]);

  useEffect(() => {
    const el = categoryNavRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          checkCatScroll();
        }
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [checkCatScroll]);

  const handleCatMouseDown = (e: React.MouseEvent) => {
    if (!categoryNavRef.current) return;
    isDraggingCat.current = true;
    hasMovedCat.current = false;
    startXCat.current = e.pageX - categoryNavRef.current.offsetLeft;
    scrollLeftCat.current = categoryNavRef.current.scrollLeft;
  };

  const handleCatMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCat.current || !categoryNavRef.current) return;
    e.preventDefault();
    const x = e.pageX - categoryNavRef.current.offsetLeft;
    const walk = (x - startXCat.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMovedCat.current = true;
    }
    categoryNavRef.current.scrollLeft = scrollLeftCat.current - walk;
    checkCatScroll();
  };

  const handleCatMouseUp = () => {
    isDraggingCat.current = false;
    setTimeout(() => {
      hasMovedCat.current = false;
    }, 60);
  };

  // Hỗ trợ vuốt chạm cảm ứng trên điện thoại
  const touchStartX = useRef(0);
  const touchScrollLeft = useRef(0);
  const isTouchingCat = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!categoryNavRef.current) return;
    isTouchingCat.current = true;
    touchStartX.current = e.touches[0].clientX;
    touchScrollLeft.current = categoryNavRef.current.scrollLeft;
    hasMovedCat.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!categoryNavRef.current || !isTouchingCat.current) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartX.current;
    if (Math.abs(deltaX) > 4) {
      hasMovedCat.current = true;
      categoryNavRef.current.scrollLeft = touchScrollLeft.current - deltaX;
      checkCatScroll();
    }
  };

  const handleTouchEnd = () => {
    isTouchingCat.current = false;
    setTimeout(() => {
      hasMovedCat.current = false;
      checkCatScroll();
    }, 100);
  };

  const scrollCat = (direction: 'left' | 'right') => {
    if (categoryNavRef.current) {
      const scrollStep = 240;
      const target = direction === 'left' 
        ? categoryNavRef.current.scrollLeft - scrollStep 
        : categoryNavRef.current.scrollLeft + scrollStep;
      categoryNavRef.current.scrollTo({ left: target, behavior: 'smooth' });
      setTimeout(checkCatScroll, 350);
    }
  };

  // 2. TỰ ĐỘNG GỌI API ĐỒNG BỘ DỮ LIỆU
  useEffect(() => {
    const loggedInUser = localStorage.getItem("currentUser");
    
    let currentUsername = "";
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      currentUsername = parsedUser.username;
      
      const localSavedVouchers = localStorage.getItem(`camera_bn_my_vouchers_${currentUsername}`);
      if(localSavedVouchers) setSavedVouchers(JSON.parse(localSavedVouchers));

      const localUsedVouchers = localStorage.getItem(`camera_bn_used_vouchers_${currentUsername}`);
      if(localUsedVouchers) setUsedVouchers(JSON.parse(localUsedVouchers));
    }

    const localFavs = localStorage.getItem('camera_bn_favs');
    if (localFavs) {
      const parsedFavs = JSON.parse(localFavs);
      setFavIds(parsedFavs.map((f: any) => String(f._id || f.id)));
    }

    const fetchRealData = async () => {
      try {
        const [prodRes, catRes, setRes, vouRes, ordRes] = await Promise.all([
          fetch(`/api/products`).catch(() => null),
          fetch(`/api/categories`).catch(() => null),
          fetch(`/api/settings`).catch(() => null),
          fetch(`/api/vouchers`).catch(() => null),
          fetch(`/api/orders`).catch(() => null)
        ]);

        if (ordRes && ordRes.ok) {
          const oData = await ordRes.json();
          if (Array.isArray(oData)) {
            const valid = oData
              .filter((o: any) => o.status !== 'Đã hủy' && o.status !== 'cancelled' && Array.isArray(o.items) && o.items.length > 0)
              .slice(0, 3);
            if (valid.length > 0) setRecentOrders(valid);
          }
        }
        
        if (prodRes && prodRes.ok) {
          const pData = await prodRes.json();
          if (Array.isArray(pData) && pData.length > 0) {
            setProducts(pData);
          }
        }

        if (catRes && catRes.ok) {
          const cData = await catRes.json();
          if (Array.isArray(cData) && cData.length > 0) {
            setCategories(cData);
          }
        }
        
        if (vouRes && vouRes.ok) {
          const vData = await vouRes.json();
          if (Array.isArray(vData)) {
            const validVouchers = vData.filter((v: any) => 
              v.isActive && 
              v.usedCount < v.maxUsage && 
              new Date(v.expireDate) >= new Date()
            );
            setVouchers(validVouchers);
          }
        }
        
        if (setRes && setRes.ok) {
          const sData = await setRes.json();
          if (sData) {
            setSaleDiscount(Number(sData.saleDiscount) || 0);
            
            const currentDay = new Date().getDate();
            const daysArray = (sData.saleDays || "").split(',').map((d: string) => parseInt(d.trim()));
            
            if (daysArray.includes(currentDay)) {
              setIsSaleDay(true);
              setShowSalePopup(true);
              setSaleDayText(currentDay.toString());
            }
          }
        }

      } catch (error) {
        console.error("Lỗi tải dữ liệu", error);
      }
    };

    fetchRealData();
  }, []);

  const handleSaveVoucher = (code: string) => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu mã giảm giá nhé!");
      router.push('/login');
      return;
    }

    if (!savedVouchers.includes(code)) {
      const newSavedList = [...savedVouchers, code];
      setSavedVouchers(newSavedList);
      localStorage.setItem(`camera_bn_my_vouchers_${user.username}`, JSON.stringify(newSavedList));
      alert(`🎉 Đã lưu mã ${code} vào ví Voucher của bạn! Hãy vào Giỏ hàng để sử dụng nhé.`);
    }
  };

  const handleClosePopup = () => {
    setShowSalePopup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  const toggleFavorite = (productData: any) => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu sản phẩm yêu thích nhé!");
      router.push('/login');
      return;
    }
    
    const productId = String(productData._id || productData.id);
    const saved = localStorage.getItem('camera_bn_favs');
    let favList = saved ? JSON.parse(saved) : [];
    
    const existsIndex = favList.findIndex((item: any) => String(item._id || item.id) === productId);
    
    if (existsIndex === -1) {
      favList.push(productData);
      setFavIds([...favIds, productId]);
      localStorage.setItem('camera_bn_favs', JSON.stringify(favList));
    } else { 
      favList.splice(existsIndex, 1);
      setFavIds(favIds.filter(id => id !== productId));
      localStorage.setItem('camera_bn_favs', JSON.stringify(favList));
    }
  };

  // CHIA SẢN PHẨM: Lấy top bán chạy theo đúng số lượng đã bán thực tế từ MongoDB
  const hotProducts = [...products]
    .sort((a, b) => (Number(b.sold) || 0) - (Number(a.sold) || 0))
    .slice(0, 4);
  const baseProducts = products;

  const isFirstFilterRun = useRef(true);

  useEffect(() => {
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false;
      return;
    }
    setCurrentPage(1);
    try {
      sessionStorage.setItem("home_current_page", "1");
      sessionStorage.setItem("home_category", String(selectedCategory));
    } catch (e) {}
  }, [selectedCategory, minPrice, maxPrice, searchTerm]);

<<<<<<< HEAD
  // Tự động cuộn lại đúng vị trí xem trước đó khi khách từ trang chi tiết quay lại
  useEffect(() => {
    try {
      const savedScrollY = sessionStorage.getItem("home_scroll_y");
      if (savedScrollY && products.length > 0) {
        const y = Number(savedScrollY);
        if (!isNaN(y) && y > 0) {
          const timer = setTimeout(() => {
            window.scrollTo({ top: y, behavior: "instant" });
          }, 80);
          return () => clearTimeout(timer);
        }
      }
    } catch (e) {}
  }, [products]);

=======
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
  const filteredProducts = baseProducts.filter(product => {
    const matchCat = selectedCategory === "all" || String(product.category_id) === String(selectedCategory);
    const matchPrice = Number(product.price) >= minPrice && Number(product.price) <= maxPrice;
    const matchSearch = (product.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchPrice && matchSearch;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;

<<<<<<< HEAD
  const scrollToProducts = () => {
    const elem = document.getElementById('products-section');
    if (elem) {
      const yOffset = -90;
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    try {
      sessionStorage.setItem("home_current_page", String(newPage));
    } catch (e) {}
    scrollToProducts();
  };

  const handlePrev = () => {
    const prev = currentPage === 1 ? totalPages : currentPage - 1;
    handlePageChange(prev);
  };
  
  const handleNext = () => {
    const next = currentPage === totalPages ? 1 : currentPage + 1;
    handlePageChange(next);
  };

  const handleProductClick = () => {
    try {
      sessionStorage.setItem("home_current_page", String(currentPage));
      sessionStorage.setItem("home_scroll_y", String(window.scrollY));
      sessionStorage.setItem("home_category", String(selectedCategory));
    } catch (e) {}
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    scrollToProducts();
=======
  const handlePrev = () => {
    setCurrentPage(currentPage === 1 ? totalPages : currentPage - 1);
  };
  
  const handleNext = () => {
    setCurrentPage(currentPage === totalPages ? 1 : currentPage + 1);
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
  };

  if (isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px", fontWeight: "bold", color: "#64748b" }}>
        <i className="fas fa-spinner fa-spin" style={{ marginRight: "10px" }}></i> Đang tải dữ liệu cửa hàng...
      </div>
    );
  }

  return (
    <>
<<<<<<< HEAD
      {/* 0. TOP UTILITY BAR */}
      <div className="top-utility-bar">
        <div className="top-bar-container">
          <div className="top-bar-left">
            <span><i className="fas fa-phone-alt"></i> Hotline tư vấn: <strong style={{ color: '#ffffff' }}>0971.024.173</strong></span>
            <span><i className="fas fa-map-marker-alt"></i> 12 Trịnh Đình Thảo, Tân Phú, TP. HCM</span>
          </div>
          <div className="top-bar-right">
            <span><i className="fas fa-truck"></i> Miễn phí lắp đặt nội thành</span>
            <span><i className="fas fa-shield-alt"></i> Bảo hành chính hãng 24 tháng</span>
          </div>
        </div>
      </div>

      {/* POPUP SALE ĐỘNG */}
      {showSalePopup && saleDiscount > 0 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 74, 110, 0.75)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#ffffff', width: '480px', maxWidth: '92%', borderRadius: '20px', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 60px -15px rgba(2, 132, 199, 0.4)', border: '1px solid #bae6fd', animation: 'popIn 0.4s ease-out' }}>
            <button onClick={handleClosePopup} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.25)', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-times"></i>
            </button>

            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '35px 20px', textAlign: 'center', color: 'white' }}>
              <div style={{ display: 'inline-block', background: '#facc15', color: '#854d0e', padding: '4px 14px', borderRadius: '20px', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Duy nhất ngày {saleDayText} hàng tháng
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>Ngày Vàng Săn Deal</h2>
            </div>

            <div style={{ padding: '30px 25px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', color: '#0369a1', margin: '0 0 10px 0', fontWeight: '800' }}>
                Giảm Ngay <span style={{ color: '#0284c7', fontSize: '36px', fontWeight: '900' }}>{saleDiscount}%</span>
              </h3>
              <p style={{ color: '#475569', fontSize: '14.5px', lineHeight: '1.6', marginBottom: '25px' }}>
                Cơ hội sở hữu camera an ninh thông minh AI với mức giá cực sốc! Giảm trực tiếp {saleDiscount}% cho toàn bộ đơn hàng thanh toán hôm nay.
              </p>
              <button 
                onClick={handleClosePopup}
                className="btn-card-action"
                style={{ width: '100%', padding: '14px', fontSize: '15px' }}
              >
                MUA SẮM NGAY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. STICKY MODERN HEADER */}
      <Header user={user} activePage="home" onLogout={handleLogout} />

      {/* MOBILE SEARCH BAR - chỉ hiện trên mobile thay thế header search */}
      <div className="mobile-search-bar">
        <i className="fas fa-search" style={{ color: '#0284c7', marginRight: '8px' }}></i>
        <input 
          type="text" 
          placeholder="Tìm camera, thiết bị an ninh..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              scrollToProducts();
            }
          }}
        />
        <button type="button" onClick={scrollToProducts}>
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>

      {/* 2. MODERN HERO BANNER */}
      <section className="modern-hero">
        <div className="hero-grid">
          <div>
            <div className="hero-badge-pill">
              <i className="fas fa-shield-virus"></i> CÔNG NGHỆ CAMERA AI 4.0 TIÊN TIẾN
            </div>
            <h1 className="hero-title">
              Giải Pháp An Ninh & Giám Sát Toàn Diện Cho Ngôi Nhà
            </h1>
            <p className="hero-desc">
              CIOs Security mang đến hệ sinh thái camera thông minh độ nét 4K Ultra HD, phát hiện chuyển động bằng AI và đàm thoại 2 chiều theo thời gian thực.
            </p>
            <div className="hero-actions">
              <button 
                className="btn-hero-primary"
                onClick={() => router.push('/contact')}
              >
                <i className="fas fa-phone-alt"></i> Nhận Tư Vấn Miễn Phí
              </button>
              <button 
                className="btn-hero-secondary"
                onClick={() => {
                  const elem = document.getElementById('products-section');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <i className="fas fa-shopping-bag"></i> Khám Phá Sản Phẩm
              </button>
            </div>
          </div>

          <div className="hero-visual-card">
            <div className="hero-feature-pill">
              <div className="hero-feature-icon">
                <i className="fas fa-eye"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Độ Phân Giải 4K Ultra HD</strong>
                <span style={{ fontSize: '12.5px', color: '#e0f2fe' }}>Ghi hình sắc nét cả ngày lẫn đêm có màu</span>
              </div>
            </div>

            <div className="hero-feature-pill">
              <div className="hero-feature-icon">
                <i className="fas fa-brain"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Nhận Diện Chuyển Động AI</strong>
                <span style={{ fontSize: '12.5px', color: '#e0f2fe' }}>Báo động chuẩn xác qua Smartphone tức thì</span>
              </div>
            </div>

            <div className="hero-feature-pill">
              <div className="hero-feature-icon">
                <i className="fas fa-cloud-upload-alt"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Lưu Trữ Đám Mây & Thẻ Nhớ</strong>
                <span style={{ fontSize: '12.5px', color: '#e0f2fe' }}>Bảo mật dữ liệu chuẩn mã hóa ngân hàng</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THANH CAM KẾT (TRUST FEATURES BAR) */}
      <div className="trust-bar">
        <div className="trust-grid">
          <div className="trust-item">
            <div className="trust-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="trust-content">
              <strong>Chính Hãng 100%</strong>
              <span>Bảo hành 24 tháng 1 đổi 1</span>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon">
              <i className="fas fa-shipping-fast"></i>
            </div>
            <div className="trust-content">
              <strong>Lắp Đặt Hỏa Tốc</strong>
              <span>Có mặt trong 2 giờ tại HCM</span>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon">
              <i className="fas fa-sync-alt"></i>
            </div>
            <div className="trust-content">
              <strong>Đổi Mới 30 Ngày</strong>
              <span>Nếu phát sinh lỗi từ nhà sản xuất</span>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon">
              <i className="fas fa-headset"></i>
            </div>
            <div className="trust-content">
              <strong>Hỗ Trợ 24/7</strong>
              <span>Kỹ thuật viên đồng hành trọn đời</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN LAYOUT (SIDEBAR + PRODUCT GRID) */}
      <div className="main-wrapper" id="products-section">
        {/* SIDEBAR CỘT TRÁI */}
        <aside className="sidebar-col">
          {/* Box Danh Mục */}
          <div className="sidebar-box-clean sidebar-box-categories">
            <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <i className="fas fa-th-large" style={{ color: '#0284c7' }}></i>
              <span>Danh Mục Thiết Bị</span>
            </div>
            <div className="category-scroll-container">
              {canScrollLeft && (
                <div className="cat-arrow-wrapper-left">
                  <button
                    type="button"
                    className="cat-arrow-btn cat-arrow-left"
                    onClick={() => scrollCat('left')}
                    title="Cuộn sang trái"
                    aria-label="Cuộn sang trái"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                </div>
              )}

              <div 
                className="category-nav-list"
                ref={categoryNavRef}
                onScroll={checkCatScroll}
                onMouseDown={handleCatMouseDown}
                onMouseMove={handleCatMouseMove}
                onMouseUp={handleCatMouseUp}
                onMouseLeave={handleCatMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div 
                  className={`category-nav-item ${selectedCategory === "all" ? "active" : ""}`}
                  onClick={() => {
                    if (!hasMovedCat.current) setSelectedCategory("all");
                  }}
                >
                  <i className="fas fa-border-all" style={{ fontSize: '11px' }}></i>
                  <span>Tất cả sản phẩm</span>
                </div>
                {categories.map((cat) => (
                  <div 
                    key={cat.id || cat._id}
                    className={`category-nav-item ${selectedCategory === String(cat.id || cat._id) ? "active" : ""}`}
                    onClick={() => {
                      if (!hasMovedCat.current) setSelectedCategory(String(cat.id || cat._id));
                    }}
                  >
                    <span>{cat.name}</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '11px' }}></i>
                  </div>
                ))}
              </div>

              {canScrollRight && (
                <div className="cat-arrow-wrapper-right">
                  <button
                    type="button"
                    className="cat-arrow-btn cat-arrow-right"
                    onClick={() => scrollCat('right')}
                    title="Cuộn sang phải"
                    aria-label="Cuộn sang phải"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Box Lọc Khoảng Giá Hiện Đại & Gọn Gàng */}
          <div className="sidebar-box-clean sidebar-box-price">
            <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-sliders-h" style={{ color: '#0284c7' }}></i>
                <span>Khoảng Giá</span>
              </div>
              {(minPrice !== 0 || maxPrice !== 5000000) && (
                <button 
                  type="button"
                  className="price-reset-pill"
                  onClick={() => { setMinPrice(0); setMaxPrice(5000000); }}
                  title="Xóa bộ lọc giá"
                >
                  <i className="fas fa-undo-alt"></i> Đặt lại
                </button>
              )}
            </div>

            {/* Thẻ hiển thị mức giá đang chọn */}
            <div className="price-display-card">
              <span className="price-display-label">
                <i className="fas fa-filter"></i> Mức giá lọc:
              </span>
              <span className="price-display-val">
                {minPrice === 0 && maxPrice >= 5000000 ? (
                  <span className="price-val-all">Tất cả mức giá</span>
                ) : (
                  <span className="price-val-active">
                    {minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')} đ` : '0 đ'} 
                    <span style={{ margin: '0 4px', color: '#94a3b8' }}>→</span>
                    {maxPrice >= 50000000 ? 'Trên 3 Triệu' : `${maxPrice.toLocaleString('vi-VN')} đ`}
                  </span>
                )}
              </span>
            </div>

            {/* Thanh trượt khoảng giá công nghệ hiện đại */}
            <div className="modern-slider-container">
=======
      <style>{`
        /* CSS CHO VOUCHER TICKETS */
        .voucher-scroll-container {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          padding: 10px 5px 20px 5px;
          margin-bottom: 30px;
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .voucher-scroll-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
        
        .voucher-ticket {
          display: flex;
          min-width: 320px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          position: relative;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }
        
        .voucher-ticket::before, .voucher-ticket::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background: #f8fafc;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
        }
        .voucher-ticket::before { left: -10px; border-right-color: transparent; border-top-color: transparent; border-bottom-color: transparent;}
        .voucher-ticket::after { left: 100px; border-left-color: transparent; border-top-color: transparent; border-bottom-color: transparent; }

        .voucher-left {
          background: linear-gradient(135deg, #e11d48, #f43f5e);
          width: 110px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          padding: 15px 10px;
          border-right: 2px dashed rgba(255,255,255,0.5);
          position: relative;
        }
        
        .voucher-right {
          flex: 1;
          padding: 15px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .btn-save-voucher {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-save-voucher:hover { background: #2563eb; }
        .btn-save-voucher:disabled {
          background: #cbd5e1;
          color: #64748b;
          cursor: not-allowed;
        }
      `}</style>

      {/* KHU VỰC POPUP HIỂN THỊ CHƯƠNG TRÌNH KHUYẾN MÃI THEO ADMIN */}
      {showSalePopup && saleDiscount > 0 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'white', width: '500px', maxWidth: '90%', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'popIn 0.5s ease-out' }}>
            
            <button onClick={handleClosePopup} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', width: '35px', height: '35px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
              <i className="fas fa-times"></i>
            </button>

            <div style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)', padding: '40px 20px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
              <i className="fas fa-gift" style={{ fontSize: '60px', opacity: 0.2, position: 'absolute', left: '-10px', bottom: '-10px', transform: 'rotate(-15deg)' }}></i>
              <i className="fas fa-percentage" style={{ fontSize: '50px', opacity: 0.2, position: 'absolute', right: '10px', top: '10px', transform: 'rotate(15deg)' }}></i>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 10px 0', textTransform: 'uppercase', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>Ngày Vàng Săn Deal</h2>
              <div style={{ display: 'inline-block', background: '#facc15', color: '#b45309', padding: '5px 15px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                Duy nhất ngày {saleDayText}
              </div>
            </div>

            <div style={{ padding: '30px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '22px', color: '#1e293b', margin: '0 0 15px 0', fontWeight: '800' }}>Giảm Ngay <span style={{ color: '#e11d48', fontSize: '32px' }}>{saleDiscount}%</span></h3>
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', marginBottom: '25px' }}>
                Mua sắm thả ga, không lo về giá! Áp dụng trực tiếp {saleDiscount}% vào toàn bộ sản phẩm cửa hàng và tổng hóa đơn khi bạn chốt đơn trong hôm nay.
              </p>
              <button 
                onClick={handleClosePopup}
                style={{ width: '100%', padding: '15px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              >
                MUA SẮM NGAY
              </button>
            </div>
          </div>

          <style>{`
            @keyframes popIn {
              0% { transform: scale(0.8); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}

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
          {/* DANH MỤC */}
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
                  key={cat.id || cat._id}
                  className={selectedCategory === String(cat.id || cat._id) ? "active" : ""} 
                  onClick={() => setSelectedCategory(String(cat.id || cat._id))}
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
            
            <div style={{ paddingBottom: '15px', borderBottom: '1px solid #e2e8f0', marginBottom: '15px' }}>
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
              <input
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={maxPrice > 5000000 ? 5000000 : maxPrice}
                onChange={(e) => {
                  setMinPrice(0);
                  setMaxPrice(Number(e.target.value));
                }}
                className="modern-price-slider"
                style={{
                  background: `linear-gradient(to right, #0284c7 0%, #0284c7 ${Math.min(100, Math.max(0, (Math.min(maxPrice, 5000000) / 5000000) * 100))}%, #e2e8f0 ${Math.min(100, Math.max(0, (Math.min(maxPrice, 5000000) / 5000000) * 100))}%, #e2e8f0 100%)`
                }}
              />
              <div className="slider-tick-labels">
                <span>0 đ</span>
                <span>2.5 Triệu</span>
                <span>5+ Triệu</span>
              </div>
            </div>

<<<<<<< HEAD
            {/* Các thẻ chọn nhanh khoảng giá dạng pills hiện đại */}
            <div className="price-chip-grid">
              <button 
                type="button"
                className={`price-chip ${minPrice === 0 && maxPrice === 500000 ? "active" : ""}`}
                onClick={() => { setMinPrice(0); setMaxPrice(500000); }}
              >
                <span className="price-chip-dot"></span>
                <span>Dưới 500K</span>
              </button>

              <button 
                type="button"
                className={`price-chip ${minPrice === 500000 && maxPrice === 1000000 ? "active" : ""}`}
                onClick={() => { setMinPrice(500000); setMaxPrice(1000000); }}
              >
                <span className="price-chip-dot"></span>
                <span>500K - 1 Triệu</span>
              </button>

              <button 
                type="button"
                className={`price-chip ${minPrice === 1000000 && maxPrice === 3000000 ? "active" : ""}`}
                onClick={() => { setMinPrice(1000000); setMaxPrice(3000000); }}
              >
                <span className="price-chip-dot"></span>
                <span>1 - 3 Triệu</span>
              </button>

              <button 
                type="button"
                className={`price-chip ${minPrice === 3000000 && maxPrice === 50000000 ? "active" : ""}`}
                onClick={() => { setMinPrice(3000000); setMaxPrice(50000000); }}
              >
                <span className="price-chip-dot"></span>
                <span>Trên 3 Triệu</span>
              </button>
            </div>
=======
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
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
          </div>

          {/* 1. Box Hotline Hỗ Trợ & Zalo */}
          <div className="sidebar-box-clean sidebar-box-hotline" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', border: '1.5px solid #bae6fd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)' }}>
                <i className="fas fa-headset"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14.5px', color: '#0c4a6e', fontWeight: '800' }}>Cần Tư Vấn Nhanh?</strong>
                <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>Kỹ thuật viên trực 24/7</span>
              </div>
            </div>
            <a 
              href="tel:0971024173" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#0284c7', color: 'white', borderRadius: '8px', fontWeight: '800', fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)', marginBottom: '8px' }}
            >
              <i className="fas fa-phone-alt"></i> 0971.024.173
            </a>
            <a 
              href="https://zalo.me/0971024173"
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-zalo-btn"
            >
              <i className="fas fa-comment-dots"></i> Chat Zalo Tư Vấn Miễn Phí
            </a>
          </div>

          {/* 2. Box Đơn Hàng Mới Nhất (Live Real-Time Feed từ MongoDB) */}
          {recentOrders.length > 0 && (
            <div className="sidebar-box-clean sidebar-box-orders">
              <div className="sidebar-widget-header">
                <span className="sidebar-widget-title">
                  <i className="fas fa-bolt" style={{ color: '#f59e0b' }}></i> Đơn Hàng Mới
                </span>
                <span className="live-status-pill">
                  <span className="pulse-indicator"></span> Trực tiếp
                </span>
              </div>

              <div className="sidebar-orders-list">
                {recentOrders.map((ord, idx) => {
                  const item = ord.items?.[0] || {};
                  const matchedProduct = products.find(p => 
                    String(p._id || p.id) === String(item._id || item.id) || 
                    String(p.name || '').trim().toLowerCase() === String(item.name || '').trim().toLowerCase()
                  );
                  const displayImg = item.image || matchedProduct?.image || '/uploads/32.jpg';
                  const custName = ord.customer_name || 'Khách hàng';
                  const safeName = custName.length > 3 ? custName.slice(0, 3) + '***' : custName;
                  const pId = item._id || item.id || matchedProduct?._id || matchedProduct?.id;

                  return (
                    <Link 
                      href={pId ? `/product/${pId}` : '#'} 
                      key={ord._id || idx}
                      className="sidebar-order-item"
                      onClick={handleProductClick}
                      title={item.name}
                    >
                      <div className="sidebar-order-thumb">
                        <img src={displayImg} alt={item.name || 'Sản phẩm'} />
                      </div>
                      <div className="sidebar-order-info">
                        <div className="sidebar-order-buyer">
                          <span><i className="fas fa-user-check" style={{ color: '#0284c7' }}></i> {safeName}</span>
                          <span className="sidebar-order-tag">Đã đặt</span>
                        </div>
                        <div className="sidebar-order-pname">
                          {item.name || 'Thiết bị an ninh'}
                        </div>
                        <div className="sidebar-order-meta">
                          <span className="sidebar-order-time">Vừa đặt mua</span>
                          <span className="sidebar-order-view">Xem <i className="fas fa-chevron-right" style={{ fontSize: '9px' }}></i></span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Box Cam Kết Tiêu Chuẩn Dịch Vụ Vàng */}
          <div className="sidebar-box-clean sidebar-box-trust">
            <div className="sidebar-widget-title" style={{ marginBottom: '14px', borderBottom: '2px solid #e0f2fe', paddingBottom: '10px' }}>
              <i className="fas fa-medal" style={{ color: '#0284c7' }}></i> Tiêu Chuẩn CiOs
            </div>
            <div className="sidebar-trust-list">
              <div className="sidebar-trust-item">
                <div className="sidebar-trust-icon"><i className="fas fa-shield-alt"></i></div>
                <div className="sidebar-trust-text">
                  <strong>Bảo Hành 24 Tháng</strong>
                  <span>1 đổi 1 trong 30 ngày tận nơi</span>
                </div>
              </div>
              <div className="sidebar-trust-item">
                <div className="sidebar-trust-icon"><i className="fas fa-shipping-fast"></i></div>
                <div className="sidebar-trust-text">
                  <strong>Lắp Đặt Hỏa Tốc</strong>
                  <span>Có mặt trong 2 giờ tại HCM</span>
                </div>
              </div>
              <div className="sidebar-trust-item">
                <div className="sidebar-trust-icon"><i className="fas fa-qrcode"></i></div>
                <div className="sidebar-trust-text">
                  <strong>Quét Mã VietQR / COD</strong>
                  <span>Thanh toán chuẩn xác, tiện lợi</span>
                </div>
              </div>
              <div className="sidebar-trust-item">
                <div className="sidebar-trust-icon"><i className="fas fa-headset"></i></div>
                <div className="sidebar-trust-text">
                  <strong>Hỗ Trợ Trọn Đời</strong>
                  <span>Kỹ thuật viên hướng dẫn từ xa</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

<<<<<<< HEAD
        {/* NỘI DUNG CHÍNH (MAIN CONTENT) */}
        <main className="content-col">
          {/* KHU VỰC VOUCHERS */}
          {vouchers.length > 0 && (
            <div className="content-section-vouchers" style={{ marginBottom: '35px' }}>
              <div className="section-header-modern">
                <div className="section-title-modern">
                  <span className="title-accent"></span>
                  Mã Giảm Giá Dành Cho Bạn
                </div>
              </div>
              <div className="vouchers-row">
                {vouchers.map((v) => {
                  const isSaved = savedVouchers.includes(v.code);
                  const isUsed = usedVouchers.includes(v.code);
                  return (
                    <div className="voucher-card-pro" key={v._id || v.id}>
                      <div className="voucher-card-left">
                        <span className="discount">{v.discountPercent}%</span>
                        <span className="label">Giảm giá</span>
                      </div>
                      <div className="voucher-card-right">
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#0369a1', marginBottom: '2px' }}>
                            Mã: <span style={{ color: '#0284c7' }}>{v.code}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Đơn tối thiểu {Number(v.minOrderValue).toLocaleString('vi-VN')}đ
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            HSD: {new Date(v.expireDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>
                            Còn {v.maxUsage - v.usedCount} lượt
                          </span>
                          <button 
                            disabled={isSaved || isUsed}
                            onClick={() => handleSaveVoucher(v.code)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: isSaved || isUsed ? '#cbd5e1' : '#0284c7',
                              color: isSaved || isUsed ? '#64748b' : 'white',
                              fontWeight: '700',
                              fontSize: '11.5px',
                              cursor: isSaved || isUsed ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {isUsed ? 'Đã dùng' : (isSaved ? 'Đã lưu' : 'Lưu mã')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
=======
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

          {/* ==================================================== */}
          {/* KHU VỰC VOUCHER "SĂN DEAL" */}
          {/* ==================================================== */}
          {vouchers.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><i className="fas fa-ticket-alt" style={{ color: "#f59e0b" }}></i> MÃ GIẢM GIÁ DÀNH CHO BẠN</span>
              </h2>
              
              <div className="voucher-scroll-container">
                {vouchers.map((v) => {
                  const isSaved = savedVouchers.includes(v.code);
                  const isUsed = usedVouchers.includes(v.code);
                  
                  return (
                    <div className="voucher-ticket" key={v._id}>
                      <div className="voucher-left">
                        <span style={{ fontSize: '28px', fontWeight: '900', lineHeight: 1 }}>{v.discountPercent}%</span>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', marginTop: '5px', fontWeight: 'bold' }}>Giảm giá</span>
                      </div>
                      <div className="voucher-right">
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>Mã: <span style={{ color: '#e11d48' }}>{v.code}</span></div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Đơn tối thiểu {Number(v.minOrderValue).toLocaleString('vi-VN')}đ</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>HSD: {new Date(v.expireDate).toLocaleDateString('vi-VN')}</div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}>
                            Còn {v.maxUsage - v.usedCount} lượt
                          </div>
                          
                          <button 
                            className="btn-save-voucher" 
                            disabled={isSaved || isUsed}
                            onClick={() => handleSaveVoucher(v.code)}
                          >
                            {isUsed ? 'Đã sử dụng' : (isSaved ? 'Đã lưu' : 'Lưu mã')}
                          </button>

                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* BÁN CHẠY NHẤT */}
          <h2 className="section-title">
            <i className="fas fa-fire" style={{ color: "#e11d48" }}></i> BÁN CHẠY NHẤT
          </h2>
          <div className="hot-grid" style={{ marginBottom: "40px" }}>
            {hotProducts.map((product) => (
              <div className="hot-card" key={product.id || product._id}>
                <div className="hot-badge">TOP</div>
                
                <div className="hot-img" style={{ position: 'relative' }}>
                  {isSaleDay && saleDiscount > 0 && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#e11d48', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      -{saleDiscount}%
                    </div>
                  )}
                  <Link href={`/product/${product.id || product._id}`}>
                    <img src={product.image} alt={product.name} />
                  </Link>
                </div>
                
                <div className="hot-info">
                  <Link
                    href={`/product/${product.id || product._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <h3>{product.name}</h3>
                  </Link>
                  
                  <div className="hot-price" style={{ minHeight: '45px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {isSaleDay && saleDiscount > 0 ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '13px', fontWeight: 'normal', marginBottom: '2px' }}>
                          {Number(product.price).toLocaleString("vi-VN")} đ
                        </span>
                        <span style={{ color: '#e11d48', fontSize: '16px' }}>
                          {(Number(product.price) * (1 - saleDiscount / 100)).toLocaleString("vi-VN")} đ
                        </span>
                      </>
                    ) : (
                      <span style={{ color: '#e11d48', fontSize: '16px' }}>
                        {Number(product.price).toLocaleString("vi-VN")} đ
                      </span>
                    )}
                  </div>

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
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
              </div>
            </div>
          )}

          {/* SẢN PHẨM BÁN CHẠY NHẤT (HOT) */}
          <div className="content-section-hot" style={{ marginBottom: '40px' }}>
            <div className="section-header-modern">
              <div className="section-title-modern">
                <span className="title-accent"></span>
                Top Bán Chạy Nhất
              </div>
              <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: '700' }}>
                <i className="fas fa-fire" style={{ color: '#f43f5e' }}></i> Đang được ưa chuộng
              </span>
            </div>

            <div className="products-grid-modern">
              {hotProducts.map((product) => (
                <div className="product-card-modern" key={product.id || product._id}>
                  <div className="card-badge-tag">TOP BÁN CHẠY</div>
                  
                  <div 
                    className={`card-fav-btn ${favIds.includes(String(product.id || product._id)) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(product)}
                    title="Lưu vào yêu thích"
                  >
                    <i className="fas fa-heart"></i>
                  </div>

                  <div className="card-img-wrapper">
                    <Link href={`/product/${product.id || product._id}`} onClick={handleProductClick}>
                      <img src={product.image} alt={product.name} />
                    </Link>
                  </div>

                  <div className="card-info-content">
                    <Link href={`/product/${product.id || product._id}`} onClick={handleProductClick}>
                      <h3 className="card-product-title">{product.name}</h3>
                    </Link>

                    <div className="card-price-container">
                      {isSaleDay && saleDiscount > 0 ? (
                        <>
                          <span className="current-price">
                            {(Number(product.price) * (1 - saleDiscount / 100)).toLocaleString("vi-VN")} đ
                          </span>
                          <span className="old-price">
                            {Number(product.price).toLocaleString("vi-VN")} đ
                          </span>
                        </>
                      ) : (
                        <span className="current-price">
                          {Number(product.price).toLocaleString("vi-VN")} đ
                        </span>
                      )}
                    </div>

                    <div className="card-stock-label">
                      <i className="fas fa-check-circle"></i> Sẵn hàng: {product.quantity} sản phẩm
                    </div>

                    {Number(product.quantity) > 0 ? (
                      <button 
                        className="btn-card-action"
                        onClick={() => {
                          if (!user) {
                            alert("Vui lòng đăng nhập để mua hàng!");
                            router.push('/login');
                          } else {
                            addToCart(product);
                            router.push('/cart');
                          }
                        }}
                      >
                        <i className="fas fa-bolt"></i> Mua Ngay
                      </button>
                    ) : (
                      <button className="btn-card-action" disabled>
                        Tạm hết hàng
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TẤT CẢ SẢN PHẨM */}
<<<<<<< HEAD
          <div className="content-section-products">
            <div className="section-header-modern">
              <div className="section-title-modern">
                <span className="title-accent"></span>
                Tất Cả Sản Phẩm
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Hiển thị {filteredProducts.length} sản phẩm
              </span>
            </div>

            {currentProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                <i className="fas fa-search" style={{ fontSize: '48px', color: '#bae6fd', marginBottom: '16px' }}></i>
                <h3 style={{ color: '#0c4a6e', marginBottom: '8px' }}>Không tìm thấy sản phẩm phù hợp</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Hãy thử điều chỉnh từ khóa tìm kiếm hoặc mức giá</p>
              </div>
            ) : (
              <div className="products-grid-modern">
                {currentProducts.map((product) => (
                  <div className="product-card-modern" key={product.id || product._id}>
                    {isSaleDay && saleDiscount > 0 && (
                      <div className="card-badge-discount">-{saleDiscount}%</div>
                    )}

                    <div 
                      className={`card-fav-btn ${favIds.includes(String(product.id || product._id)) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(product)}
                      title="Lưu vào yêu thích"
                    >
                      <i className="fas fa-heart"></i>
                    </div>

                    <div className="card-img-wrapper">
                      <Link href={`/product/${product.id || product._id}`} onClick={handleProductClick}>
                        <img src={product.image} alt={product.name} />
                      </Link>
                    </div>

                    <div className="card-info-content">
                      <Link href={`/product/${product.id || product._id}`} onClick={handleProductClick}>
                        <h3 className="card-product-title">{product.name}</h3>
                      </Link>

                      <div className="card-price-container">
                        {isSaleDay && saleDiscount > 0 ? (
                          <>
                            <span className="current-price">
                              {(Number(product.price) * (1 - saleDiscount / 100)).toLocaleString("vi-VN")} đ
                            </span>
                            <span className="old-price">
                              {Number(product.price).toLocaleString("vi-VN")} đ
                            </span>
                          </>
                        ) : (
                          <span className="current-price">
                            {Number(product.price).toLocaleString("vi-VN")} đ
                          </span>
                        )}
                      </div>

                      <div className="card-stock-label">
                        <i className="fas fa-tag"></i> Còn: {product.quantity} cái
                      </div>

                      {Number(product.quantity) > 0 ? (
                        <button 
                          className="btn-card-action"
                          onClick={() => {
                            if (!user) {
                              alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
                              router.push('/login');
                            } else {
                              addToCart(product);
                            }
                          }}
                        >
                          <i className="fas fa-cart-plus"></i> Thêm Vào Giỏ
                        </button>
                      ) : (
                        <button className="btn-card-action" disabled>
                          Tạm hết hàng
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <button 
                  className="page-btn-pro" 
                  onClick={handlePrev}
                  title="Trang trước"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
=======
          <h2 className="section-title">
            <i className="fas fa-box-open" style={{ color: "#b45309" }}></i> TẤT CẢ SẢN PHẨM
          </h2>
          <div className="product-grid">
            {currentProducts.map((product) => {
              // KIỂM TRA XEM SẢN PHẨM NÀY ĐÃ ĐƯỢC THẢ TIM HAY CHƯA
              const isFav = favIds.includes(String(product.id || product._id));

              return (
                <div className="product-card" key={product.id || product._id}>
                  {/* ĐÃ SỬA: Giao diện và logic đổi màu trái tim */}
                  <div 
                    className="favorite-btn" 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      toggleFavorite(product);
                    }}
                    style={{ cursor: 'pointer', transition: '0.3s' }}
                  >
                    <i className="fas fa-heart" style={{ color: isFav ? '#e11d48' : '#cbd5e1', transition: '0.3s' }}></i>
                  </div>
                  
                  <div className="card-img" style={{ position: 'relative' }}>
                     {isSaleDay && saleDiscount > 0 && (
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#e11d48', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        -{saleDiscount}%
                      </div>
                    )}
                    <Link href={`/product/${product.id || product._id}`}>
                      <img src={product.image} alt={product.name} />
                    </Link>
                  </div>

                  <div className="card-body">
                    <Link
                      href={`/product/${product.id || product._id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <h3>{product.name}</h3>
                    </Link>

                    <div className="price-row" style={{ minHeight: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                      {isSaleDay && saleDiscount > 0 ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px', fontWeight: 'normal' }}>
                            {Number(product.price).toLocaleString("vi-VN")} đ
                          </span>
                          <span style={{ color: '#e11d48', fontSize: '16px', fontWeight: 'bold' }}>
                            {(Number(product.price) * (1 - saleDiscount / 100)).toLocaleString("vi-VN")} đ
                          </span>
                        </>
                      ) : (
                        <span style={{ color: '#e11d48', fontSize: '16px', fontWeight: 'bold' }}>
                          {Number(product.price).toLocaleString("vi-VN")} đ
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        color: "#e58e26",
                        marginBottom: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      <i className="fas fa-tag"></i> Chỉ còn: {product.quantity} cái
                    </div>
                    
                    {Number(product.quantity) > 0 ? (
                      <button className="btn-hot-add" onClick={() => {
                        if (!user) {
                          alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
                          router.push('/login');
                        } else {
                          addToCart(product);
                        }
                      }}>
                        Thêm vào giỏ hàng
                      </button>
                    ) : (
                      <button className="btn-hot-add" disabled style={{ background: '#cbd5e1', color: '#64748b', cursor: 'not-allowed' }}>
                        Tạm hết hàng
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* THANH PHÂN TRANG */}
          <div className="pagination-container">
            <div className="pagination">
              <button className="page-btn prev" onClick={handlePrev}>
                <i className="fas fa-chevron-left"></i>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
                  <button
                    key={number}
                    className={`page-btn-pro ${currentPage === number ? "active" : ""}`}
                    onClick={() => handlePageChange(number)}
                  >
                    {number}
                  </button>
<<<<<<< HEAD
                ))}

                <button 
                  className="page-btn-pro" 
                  onClick={handleNext}
                  title="Trang tiếp"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
=======
                )
              )}

              <button className="page-btn next" onClick={handleNext}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
          </div>
        </main>
      </div>

<<<<<<< HEAD
      {/* 5. FLOATING SPEED DIAL */}
      <FloatingActions />

      {/* 6. SITE FOOTER */}
      <Footer />
=======
      {/* FLOATING BUTTONS */}
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

      {/* FOOTER */}
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
              <div className="icon-box">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <strong>Trụ sở chính:</strong>
                <p>12 Trịnh Đình Thảo, P. Hòa Thạnh, Q. Tân Phú, TP. Hồ Chí Minh</p>
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
        <div className="footer-bottom">
          © 2026 Công Ty TNHH CIOs - impossible is nothing. Giấy phép KD số: 0123456789.
        </div>
      </footer>
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
    </>
  );
}