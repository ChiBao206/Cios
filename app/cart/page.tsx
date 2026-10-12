"use client";

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react'; 
import NotifBadge from '@/app/components/NotifBadge';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, toggleCheck, toggleAllCheck, totalItems, clearCart } = useCart();
  
  // 1. TIỀN HÀNG (TẠM TÍNH)
  const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.checked ? Number(item.price) * item.cartQty : 0), 0);

  const hasCheckedItems = cartItems.some((item: any) => item.checked);
  const isAllChecked = cartItems.length > 0 && cartItems.every((item: any) => item.checked);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [paymentMethod, setPaymentMethod] = useState('cod'); 
  const [user, setUser] = useState<any>(null);
  
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  // ==========================================
  // STATE CẤU HÌNH VÀ VOUCHER
  // ==========================================
  const [systemSettings, setSystemSettings] = useState({
    saleDays: '', saleDiscount: 0, feeHCM: 30000, feeSouth: 50000, feeOther: 80000
  });
  
  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherMsg, setVoucherMsg] = useState({ type: '', text: '' });

  // Lấy dữ liệu settings và tỉnh thành
  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    
    if (!loggedInUser) {
      alert("Vui lòng đăng nhập tài khoản để vào giỏ hàng!");
      window.location.href = '/login';
      return;
    }

    const parsedUser = JSON.parse(loggedInUser);
    setUser(parsedUser);
    setName(parsedUser.username || '');
    setPhone(parsedUser.phone || '');
    setIsLoadingAuth(false);

    // Fetch API Tỉnh thành
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Lỗi tải tỉnh thành: ", err));

    // Fetch cấu hình Admin
    fetch(`/api/settings?t=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => { if(data) setSystemSettings(data); })
      .catch(() => {});
  }, []);

  // ==========================================
  // HÀM XỬ LÝ VOUCHER
  // ==========================================
  const handleApplyVoucher = async () => {
    if(!voucherCode.trim()) {
      setVoucherMsg({ type: 'error', text: 'Vui lòng nhập mã giảm giá!' });
      return;
    }
    setVoucherMsg({ type: '', text: 'Đang kiểm tra mã...' });
    
    try {
      const res = await fetch(`/api/vouchers?code=${voucherCode.trim().toUpperCase()}`);
      if(!res.ok) {
        const data = await res.json();
        setVoucherMsg({ type: 'error', text: data.message || 'Mã không hợp lệ!' });
        setAppliedVoucher(null);
        return;
      }
      
      const voucher = await res.json();
      
      // Kiểm tra đơn tối thiểu
      if(totalAmount < voucher.minOrderValue) {
        setVoucherMsg({ type: 'error', text: `Đơn hàng tối thiểu ${Number(voucher.minOrderValue).toLocaleString('vi-VN')}đ để dùng mã này!` });
        setAppliedVoucher(null);
        return;
      }
      
      setAppliedVoucher(voucher);
      setVoucherMsg({ type: 'success', text: `Áp dụng thành công mã giảm ${voucher.discountPercent}%!` });
    } catch(e) {
      setVoucherMsg({ type: 'error', text: 'Lỗi kiểm tra mã. Vui lòng thử lại!' });
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherMsg({ type: '', text: '' });
  };

  // Nếu người dùng giảm số lượng hàng làm tổng tiền rớt xuống dưới mức tối thiểu của Voucher, tự động gỡ Voucher
  useEffect(() => {
    if (appliedVoucher && totalAmount < appliedVoucher.minOrderValue) {
      setAppliedVoucher(null);
      setVoucherCode('');
      setVoucherMsg({ type: 'error', text: `Mã ${appliedVoucher.code} đã bị gỡ vì tổng đơn dưới ${Number(appliedVoucher.minOrderValue).toLocaleString('vi-VN')}đ.` });
    }
  }, [totalAmount, appliedVoucher]);

  // ==========================================
  // THUẬT TOÁN TÍNH TIỀN CHUNG (SALE + VOUCHER + SHIP)
  // ==========================================
  const currentDay = new Date().getDate();
  const saleDaysArr = (systemSettings.saleDays || "").split(',').map(d => parseInt(d.trim()));
  const isSaleDay = saleDaysArr.includes(currentDay) && systemSettings.saleDiscount > 0;

  const saleDiscountAmount = isSaleDay ? (totalAmount * systemSettings.saleDiscount) / 100 : 0;
  const voucherDiscountAmount = appliedVoucher ? (totalAmount * appliedVoucher.discountPercent) / 100 : 0;
  const totalDiscount = saleDiscountAmount + voucherDiscountAmount;

  let shippingFee = 0;
  if (selectedProvince) {
    const provCode = String(selectedProvince);
    const southCodes = ['70', '72', '74', '75', '77', '80', '82', '83', '84', '86', '87', '89', '91', '92', '93', '94', '95', '96'];
    
    if (provCode === '79') {
      shippingFee = systemSettings.feeHCM;
    } else if (southCodes.includes(provCode)) {
      shippingFee = systemSettings.feeSouth;
    } else {
      shippingFee = systemSettings.feeOther;
    }
  }

  // Đảm bảo tiền hàng không bị âm nếu giảm giá quá nhiều
  const finalTotal = Math.max(0, totalAmount - totalDiscount) + shippingFee;

  const handleLogout = () => {
    clearCart(); 
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedDistrict(''); 
    setWards([]);            
    setSelectedWard('');     
    if (provinceCode) {
      fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts));
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    setSelectedWard(''); 
    if (districtCode) {
      fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards));
    }
  };

  const handleCheckout = async () => {
    if (!name || !phone || !selectedProvince || !selectedDistrict || !selectedWard || !addressDetail) {
      alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!");
      return;
    }
    if (totalAmount === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }

    setIsSubmitting(true);

    const provName = provinces.find(p => String(p.code) === String(selectedProvince))?.name || '';
    const distName = districts.find(d => String(d.code) === String(selectedDistrict))?.name || '';
    const wardName = wards.find(w => String(w.code) === String(selectedWard))?.name || '';
    
    const paymentText = paymentMethod === 'cod' ? '(COD - Thanh toán khi nhận hàng)' : '(Đã thanh toán Chuyển khoản QR)';
    const fullAddress = `${addressDetail}, ${wardName}, ${distName}, ${provName} ${paymentText}`;

    const purchasedItems = cartItems.filter((i: any) => i.checked);

    const newOrder = {
      user_id: user ? (user._id || user.id) : 2, 
      email: user ? user.email : '',
      total_money: finalTotal,      
      subtotal: totalAmount,        
      shipping_fee: shippingFee,    
      discount: totalDiscount,  // Gộp cả sale và voucher   
      status: "Chờ xử lý", 
      customer_name: name,
      customer_phone: phone,
      shipping_address: fullAddress,
      items: JSON.parse(JSON.stringify(purchasedItems)) 
    };
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });

      if (res.ok) {
        // Cập nhật tồn kho sản phẩm
        for (const item of purchasedItems) {
          const remainingQty = Number(item.quantity || item.maxQty) - Number(item.cartQty);
          await fetch(`/api/products?id=${item._id || item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              quantity: remainingQty > 0 ? remainingQty : 0, 
              sold: (Number(item.sold) || 0) + Number(item.cartQty) 
            })
          });
        }

        // TĂNG SỐ LƯỢT SỬ DỤNG VOUCHER LÊN 1
        if (appliedVoucher) {
          await fetch(`/api/vouchers?id=${appliedVoucher._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usedCount: Number(appliedVoucher.usedCount) + 1 })
          }).catch(e => console.log("Lỗi cập nhật voucher:", e));
        }

        alert("🎉 Đặt hàng thành công! Hệ thống đã ghi nhận đơn hàng.");
        clearCart(); 
        window.location.href = '/profile'; 
      } else {
        alert("Có lỗi xảy ra khi lưu đơn hàng vào hệ thống.");
      }
    } catch (error) {
      alert("Lỗi kết nối đến máy chủ API!");
    }
    setIsSubmitting(false);
  };

  if (isLoadingAuth) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', color: '#64748b', fontWeight: 'bold' }}><i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i> Đang tải giỏ hàng...</div>;
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#1e293b', padding: '12px 0', borderBottom: '1px solid #0f172a' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '96%', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-video"></i> CIOs - impossible is nothing
          </div>
          <nav style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/" className="nav-link" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}><i className="fas fa-home"></i> Trang chủ</Link>
            <Link href="/contact" className="nav-link" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}><i className="fas fa-phone-alt"></i> Liên hệ</Link>
            <Link href="/notifications" className="nav-link" style={{ position: 'relative', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
              <i className="fas fa-bell"></i> Thông báo
              <NotifBadge />
            </Link>
            <Link href="/cart" className="nav-link" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', position: 'relative' }}>
              <i className="fas fa-shopping-cart"></i> Giỏ hàng
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#e11d48', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '50%' }}>
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href="/profile" style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8', textDecoration: 'none' }}>
                  Xin chào,<br/>
                  <strong style={{ color: '#4ade80', fontSize: '14px', textTransform: 'uppercase' }}>{user.username}</strong>
                </Link>
                <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', fontSize: '12px' }}>Thoát</button>
              </div>
            ) : (
              <Link href="/login" className="nav-link" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
                <i className="fas fa-user"></i> Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', width: '95%', margin: '30px auto', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>
            GIỎ HÀNG <span style={{ fontSize: '16px', color: '#64748b', fontWeight: 'normal' }}>({cartItems.length} sản phẩm)</span>
          </h1>
          <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
            <i className="fas fa-chevron-left"></i> Tiếp tục mua sắm
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '80px', color: '#cbd5e1', marginBottom: '20px' }}><i className="fas fa-shopping-cart"></i></div>
            <h2 style={{ fontSize: '18px', color: '#334155', marginBottom: '20px', fontWeight: '700' }}>Giỏ hàng đang trống!</h2>
            <Link href="/" style={{ display: 'inline-block', background: '#3b82f6', color: 'white', padding: '12px 30px', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none' }}>MUA SẮM NGAY</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

            <div style={{ flex: hasCheckedItems ? '1 1 60%' : '1 1 100%', width: '100%', background: 'white', borderRadius: '12px', padding: '0 15px 15px 15px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', transition: 'all 0.3s ease' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '2px solid #e2e8f0', gap: '12px', marginBottom: '5px' }}>
                <input 
                  type="checkbox" 
                  checked={isAllChecked} 
                  onChange={(e) => toggleAllCheck(e.target.checked)} 
                  style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#e11d48' }} 
                />
                <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>Chọn tất cả ({cartItems.length} sản phẩm)</span>
              </div>

              {cartItems.map((item: any) => (
                <div key={item._id || item.id} style={{ display: 'flex', alignItems: 'stretch', padding: '15px 0', borderBottom: '1px solid #f1f5f9', gap: '12px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item._id || item.id)} style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#e11d48' }} />
                  </div>

                  <div style={{ width: '80px', height: '80px', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px', flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <Link href={`/product/${item._id || item.id}`} style={{ fontWeight: '600', color: '#1e293b', textDecoration: 'none', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.name}
                      </Link>
                      <button onClick={() => removeFromCart(item._id || item.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '15px', marginTop: '2px' }}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontWeight: '700', color: '#e11d48', fontSize: '15px' }}>
                        {Number(item.price).toLocaleString('vi-VN')} đ
                      </span>
                      
                      <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                        <button onClick={() => updateQty(item._id || item.id, item.cartQty - 1)} disabled={item.cartQty <= 1} style={{ width: '28px', height: '28px', background: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>-</button>
                        <input type="text" value={item.cartQty} readOnly style={{ width: '35px', height: '28px', border: 'none', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', color: '#1e293b' }} />
                        <button onClick={() => updateQty(item._id || item.id, item.cartQty + 1)} disabled={item.cartQty >= (item.quantity || item.maxQty)} style={{ width: '28px', height: '28px', background: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasCheckedItems && (
              <div style={{ flex: '1 1 35%', minWidth: '300px', width: '100%', transition: 'all 0.3s ease' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', marginBottom: '20px' }}>THÔNG TIN GIAO HÀNG</h3>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '8px' }}>Họ tên</label>
                    <input type="text" placeholder="Nhập họ và tên người nhận" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '8px' }}>Điện thoại</label>
                    <input type="tel" placeholder="Nhập số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
                  </div>

                  <div style={{ border: '1px dashed #cbd5e1', background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '14px', color: '#e11d48', fontWeight: 'bold', marginBottom: '15px' }}>
                      <i className="fas fa-map-marker-alt"></i> Địa chỉ nhận hàng (*)
                    </label>
                    <select value={selectedProvince} onChange={handleProvinceChange} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', marginBottom: '10px', background: 'white', cursor: 'pointer' }}>
                      <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                      {provinces.map((prov) => (<option key={prov.code} value={prov.code}>{prov.name}</option>))}
                    </select>
                    <select value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', marginBottom: '10px', background: selectedProvince ? 'white' : '#f1f5f9', cursor: selectedProvince ? 'pointer' : 'not-allowed' }}>
                      <option value="" disabled>Chọn Quận/Huyện</option>
                      {districts.map((dist) => (<option key={dist.code} value={dist.code}>{dist.name}</option>))}
                    </select>
                    <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', marginBottom: '10px', background: selectedDistrict ? 'white' : '#f1f5f9', cursor: selectedDistrict ? 'pointer' : 'not-allowed' }}>
                      <option value="" disabled>Chọn Phường/Xã</option>
                      {wards.map((ward) => (<option key={ward.code} value={ward.code}>{ward.name}</option>))}
                    </select>
                    <input type="text" placeholder="Nhập số nhà, tên đường, tòa nhà..." value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', marginBottom: '15px' }}>Phương thức thanh toán</h3>
                  <div style={{ marginBottom: '30px' }}>
                    <div onClick={() => setPaymentMethod('cod')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid', borderColor: paymentMethod === 'cod' ? '#3b82f6' : '#cbd5e1', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', background: paymentMethod === 'cod' ? '#eff6ff' : 'white', transition: '0.2s' }}>
                      <input type="radio" checked={paymentMethod === 'cod'} readOnly style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#3b82f6' }} />
                      <div>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>Thanh toán khi nhận hàng (COD)</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Giao hàng tận nơi rồi mới thu tiền</div>
                      </div>
                    </div>
                    <div onClick={() => setPaymentMethod('qr')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid', borderColor: paymentMethod === 'qr' ? '#3b82f6' : '#cbd5e1', borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'qr' ? '#eff6ff' : 'white', transition: '0.2s' }}>
                      <input type="radio" checked={paymentMethod === 'qr'} readOnly style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#3b82f6' }} />
                      <div>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>Chuyển khoản / Quét mã QR</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Quét mã QR qua ứng dụng ngân hàng, Momo</div>
                      </div>
                    </div>
                    
                    {paymentMethod === 'qr' && (
                      <div style={{ marginTop: '15px', background: '#f8fafc', border: '1px dashed #3b82f6', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '13px', color: '#334155', fontWeight: '600', marginBottom: '15px' }}>Quét mã QR bên dưới bằng ứng dụng Ngân hàng hoặc Ví điện tử của bạn để thanh toán:</p>
                        <div style={{ width: '220px', height: '220px', margin: '0 auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                          <img 
                            src="/uploads/qrck.jpg" 
                            alt="Mã QR Thanh Toán" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.currentTarget.src = "https://placehold.co/200x200?text=Ma+QR+Loi" }}
                          />
                        </div>
                        <div style={{ marginTop: '15px', fontSize: '12px', color: '#ef4444', fontStyle: 'italic' }}>
                          * Vui lòng nhập nội dung chuyển khoản là: <strong>SĐT của bạn</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* KHUNG NHẬP MÃ GIẢM GIÁ */}
                  <div style={{ border: '1px dashed #cbd5e1', background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '14px', color: '#1e293b', fontWeight: 'bold', marginBottom: '10px' }}>
                      <i className="fas fa-ticket-alt" style={{ color: '#f59e0b' }}></i> Mã giảm giá (Voucher)
                    </label>
                    
                    {!appliedVoucher ? (
                      <>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input 
                            type="text" 
                            placeholder="Nhập mã khuyến mãi..." 
                            value={voucherCode} 
                            onChange={e => setVoucherCode(e.target.value)} 
                            style={{ flex: 1, padding: '10px 15px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', textTransform: 'uppercase', fontSize: '14px' }} 
                          />
                          <button onClick={handleApplyVoucher} style={{ background: '#1e293b', color: 'white', border: 'none', padding: '0 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
                            Áp dụng
                          </button>
                        </div>
                        {voucherMsg.text && (
                          <div style={{ color: voucherMsg.type === 'error' ? '#ef4444' : '#10b981', fontSize: '12px', marginTop: '8px', fontWeight: 'bold' }}>
                            {voucherMsg.text}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', border: '1px solid #10b981', padding: '12px 15px', borderRadius: '6px' }}>
                        <div style={{ color: '#047857', fontWeight: 'bold', fontSize: '14px' }}>
                          <i className="fas fa-check-circle"></i> Đã áp dụng mã: {appliedVoucher.code} (-{appliedVoucher.discountPercent}%)
                        </div>
                        <button onClick={handleRemoveVoucher} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>

                  {/* BẢNG TỔNG KẾT TIỀN TỆ */}
                  <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', marginBottom: '10px' }}>
                      <span>Tạm tính ({cartItems.filter((i:any)=>i.checked).length} SP):</span>
                      <span style={{ fontWeight: '600' }}>{totalAmount.toLocaleString('vi-VN')} đ</span>
                    </div>

                    {isSaleDay && saleDiscountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#10b981', marginBottom: '10px' }}>
                        <span>Giảm giá ngày vàng ({systemSettings.saleDiscount}%):</span>
                        <span style={{ fontWeight: '600' }}>- {saleDiscountAmount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    )}

                    {appliedVoucher && voucherDiscountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#f59e0b', marginBottom: '10px' }}>
                        <span>Voucher ({appliedVoucher.code}):</span>
                        <span style={{ fontWeight: '600' }}>- {voucherDiscountAmount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', marginBottom: '10px' }}>
                      <span>Phí vận chuyển:</span>
                      <span style={{ fontWeight: '600' }}>
                        {selectedProvince ? `${shippingFee.toLocaleString('vi-VN')} đ` : 'Chưa xác định'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingTop: '15px', borderTop: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Tổng cộng:</span>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: '#e11d48' }}>{finalTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <button onClick={handleCheckout} disabled={isSubmitting} style={{ width: '100%', padding: '15px', background: isSubmitting ? '#f43f5e' : '#e11d48', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: '0.3s' }}>
                    {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FLOATING BUTTONS (Sửa lại giống trang chủ) */}
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

      {/* FOOTER (Sửa lại giống trang chủ) */}
      <footer className="pro-footer" style={{ background: '#1e293b', color: '#cbd5e1', paddingTop: '60px', marginTop: 'auto' }}>
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