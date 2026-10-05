"use client";

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react'; 
import NotifBadge from '@/app/components/NotifBadge';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, toggleCheck, totalItems, clearCart } = useCart();
  const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.checked ? Number(item.price) * item.cartQty : 0), 0);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [paymentMethod, setPaymentMethod] = useState('cod'); 
  const [user, setUser] = useState<any>(null);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      setName(parsedUser.username || '');
      setPhone(parsedUser.phone || '');
    }

    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Lỗi tải tỉnh thành: ", err));
  }, []);

const handleLogout = () => {
    localStorage.removeItem('currentUser'); // Xóa thông tin đăng nhập
    localStorage.removeItem('camera_bn_cart'); // Bắn bỏ luôn cái giỏ hàng trong bộ nhớ
    window.location.reload(); // Tải lại trang (Lúc này máy tính đã trống trơn)
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
        .then(data => setDistricts(data.districts))
        .catch(err => console.error("Lỗi tải quận huyện: ", err));
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    setSelectedWard(''); 

    if (districtCode) {
      fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards))
        .catch(err => console.error("Lỗi tải phường xã: ", err));
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

    const newOrder = {
      id: Math.floor(Math.random() * 10000), 
      user_id: user ? user.id : 2, 
      total_money: totalAmount,
      status: "Chờ xử lý", 
      customer_name: name,
      customer_phone: phone,
      shipping_address: fullAddress,
      items: JSON.parse(JSON.stringify(cartItems.filter((i: any) => i.checked))) 
    };
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });

      if (res.ok) {
        alert("🎉 Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại Camera B&N.");
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

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#1e293b', padding: '12px 0', borderBottom: '1px solid #0f172a' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '96%', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-video"></i> CAMERA B&N
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

            {/* CỘT TRÁI: SẢN PHẨM */}
            <div style={{ flex: '1 1 60%', width: '100%', background: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
              {cartItems.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'stretch', padding: '15px 0', borderBottom: '1px solid #f1f5f9', gap: '12px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.id)} style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#e11d48' }} />
                  </div>

                  <div style={{ width: '80px', height: '80px', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px', flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <Link href={`/product/${item.id}`} style={{ fontWeight: '600', color: '#1e293b', textDecoration: 'none', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.name}
                      </Link>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '15px', marginTop: '2px' }}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontWeight: '700', color: '#e11d48', fontSize: '15px' }}>
                        {Number(item.price).toLocaleString('vi-VN')} đ
                      </span>
                      
                      <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                        <button onClick={() => updateQty(item.id, item.cartQty - 1)} disabled={item.cartQty <= 1} style={{ width: '28px', height: '28px', background: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>-</button>
                        <input type="text" value={item.cartQty} readOnly style={{ width: '35px', height: '28px', border: 'none', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', color: '#1e293b' }} />
                        <button onClick={() => updateQty(item.id, item.cartQty + 1)} disabled={item.cartQty >= item.maxQty} style={{ width: '28px', height: '28px', background: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CỘT PHẢI: FORM GIAO HÀNG */}
            <div style={{ flex: '1 1 35%', minWidth: '300px', width: '100%' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', marginBottom: '20px' }}>Thông tin giao hàng</h3>

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
                      
                      {/* ĐÃ SỬA LẠI: Vì ảnh mới cắt rất vuông vức, chỉ cần dùng objectFit contain và căn giữa là đẹp! */}
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

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', marginBottom: '10px' }}>
                  <span>Tạm tính:</span>
                  <span style={{ fontWeight: '600' }}>{totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingTop: '15px', borderTop: '1px dashed #cbd5e1' }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Tổng cộng:</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: '#e11d48' }}>{totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                <button onClick={handleCheckout} disabled={isSubmitting} style={{ width: '100%', padding: '15px', background: isSubmitting ? '#f43f5e' : '#e11d48', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: '0.3s' }}>
                  {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}