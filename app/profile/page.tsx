/* eslint-disable */
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import { useCart } from '../context/CartContext';

export default function ProfilePage() {
  const router = useRouter();
  const { addToCart } = useCart() || {};
  const [activeTab, setActiveTab] = useState('orders');
  const [orderSubTab, setOrderSubTab] = useState('placed'); 
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState(''); 
  const [orders, setOrders] = useState<any[]>([]);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [favorites, setFavorites] = useState<any[]>([]);
  const [supports, setSupports] = useState<any[]>([]);
  const [supportIssue, setSupportIssue] = useState('');
  const [profileForm, setProfileForm] = useState({ username: '', phone: '', email: '' });
  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });

  // ==========================================
  // STATE CHO TÍNH NĂNG QUÊN MẬT KHẨU BẰNG OTP
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

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      
      if (parsedUser.avatar || parsedUser.image) {
        setAvatar(parsedUser.avatar || parsedUser.image);
      }
      
      setProfileForm({ 
        username: parsedUser.username || '', 
        phone: parsedUser.phone || '', 
        email: parsedUser.email || 'chua_cap_nhat@gmail.com' 
      });

      if (parsedUser.phone) {
        fetchOrders(parsedUser.phone); 
        fetchSupports(parsedUser.username, parsedUser.phone);
      }

      if (parsedUser.username) {
        fetchFavorites(parsedUser.username);
      } else {
        const savedFavs = localStorage.getItem('camera_bn_favs');
        if(savedFavs) {
          try { setFavorites(JSON.parse(savedFavs)); } catch(e) {}
        }
      }

    } else {
      router.push('/login'); 
    }
  }, [router]);

  const fetchOrders = async (phone: string) => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/orders?t=${timestamp}`);
      const allOrders = await res.json();
      const myOrders = allOrders.filter((order: any) => order.customer_phone === phone);
      
      if(myOrders && myOrders.length > 0) {
         const formattedOrders = myOrders.map((o: any) => {
           const orderItems = (o.items && o.items.length > 0) ? o.items.map((i:any) => ({
               _id: i._id || i.id,
               id: i._id || i.id,
               name: i.name || "Sản phẩm không tên",
               qty: Number(i.cartQty || i.quantity || 1),
               rawPrice: Number(i.price || 0),
               price: Number(i.price || 0).toLocaleString('vi-VN') + ' đ',
               total: (Number(i.price || 0) * Number(i.cartQty || i.quantity || 1)).toLocaleString('vi-VN') + ' đ',
               img: i.image || i.img || i.image_url || "https://placehold.co/100x100?text=Camera",
               rawItem: i
           })) : [{ 
               _id: 'item_1',
               id: 'item_1',
               name: "Sản phẩm trong giỏ (Chưa lưu chi tiết)", 
               qty: 1, 
               rawPrice: Number(o.total_money || 0),
               price: Number(o.total_money || 0).toLocaleString('vi-VN') + ' đ', 
               total: Number(o.total_money || 0).toLocaleString('vi-VN') + ' đ', 
               img: "https://placehold.co/100x100?text=Camera",
               rawItem: null
           }];

           return {
             _id: o._id,
             id: String(o._id || o.id).slice(-6).toUpperCase(), 
             date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay',
             time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
             total: Number(o.total_money || 0).toLocaleString('vi-VN') + ' đ',
             subtotal: Number(o.subtotal || o.total_money || 0).toLocaleString('vi-VN') + ' đ',
             shippingFee: Number(o.shipping_fee || 0).toLocaleString('vi-VN') + ' đ',
             discount: Number(o.discount || 0) > 0 ? Number(o.discount).toLocaleString('vi-VN') + ' đ' : null,
             status: o.status || 'Chờ xử lý',
             customer: o.customer_name,
             phone: o.customer_phone,
             address: o.shipping_address,
             items: orderItems,
             rawItems: o.items || []
           };
         });
         setOrders(formattedOrders); 
      } else { setOrders([]); }
    } catch (error) { console.error(error); }
  };

  const fetchSupports = async (username: string, phone: string) => {
    try {
      const res = await fetch('/api/supports');
      if (res.ok) {
        const allSupports = await res.json();
        const mySupports = allSupports.filter((s: any) => s.customer === username || s.phone === phone);
        setSupports(mySupports);  
      }
    } catch (e) { console.log(e); }
  };

  const fetchFavorites = async (username: string) => {
    const userKey = `camera_bn_favs_${username}`;
    let loadedFavs: any[] = [];
    const localFavs = localStorage.getItem(userKey) || localStorage.getItem('camera_bn_favs');
    if (localFavs) {
      try {
        const parsed = JSON.parse(localFavs);
        if (Array.isArray(parsed)) {
          loadedFavs = parsed;
          setFavorites(parsed);
        }
      } catch (e) {}
    }

    try {
      const res = await fetch(`/api/favorites?username=${encodeURIComponent(username)}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.favorites)) {
          if (data.favorites.length > 0) {
            setFavorites(data.favorites);
            localStorage.setItem(userKey, JSON.stringify(data.favorites));
            localStorage.setItem('camera_bn_favs', JSON.stringify(data.favorites));
          } else if (loadedFavs.length > 0) {
            fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, favorites: loadedFavs })
            }).catch(() => {});
          }
        }
      }
    } catch (e) {
      console.error("Lỗi lấy danh sách yêu thích:", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300; 
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const base64String = canvas.toDataURL('image/jpeg', 0.7); 
          
          setAvatar(base64String);
          
          if (user && (user._id || user.id)) {
            try {
              const res = await fetch(`/api/users?id=${user._id || user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: base64String, image: base64String }) 
              });
              
              if (res.ok) {
                const updatedUser = { ...user, avatar: base64String, image: base64String };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                setUser(updatedUser);
                alert("Đã cập nhật ảnh đại diện!");
              }
            } catch (err) { console.error("Lỗi khi lưu avatar:", err); }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh đại diện và quay về mặc định?")) return;
    
    setAvatar('');
    if (user && (user._id || user.id)) {
      try {
        const res = await fetch(`/api/users?id=${user._id || user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: '', image: '' }) 
        });
        
        if (res.ok) {
          const updatedUser = { ...user, avatar: '', image: '' };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          setUser(updatedUser);
          alert("Đã xóa ảnh đại diện thành công!");
        }
      } catch (err) { console.error("Lỗi khi xóa avatar:", err); }
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if(!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    try {
      const res = await fetch(`/api/orders?id=${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Đã hủy' }) 
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'Đã hủy' } : o));
        if (viewOrder && (viewOrder._id === orderId || viewOrder.id === orderId)) {
          setViewOrder({ ...viewOrder, status: 'Đã hủy' });
        }
        alert("Đã hủy đơn hàng thành công!");
      } else {
        alert("Có lỗi xảy ra khi hủy đơn!");
      }
    } catch (error) { alert("Lỗi mạng!"); }
  };

  // ==========================================
  // XỬ LÝ MUA LẠI ĐƠN HÀNG ĐÃ HỦY -> ĐƯA VÀO GIỎ HÀNG VÀ CHUYỂN TRANG
  // ==========================================
  const handleReorder = (order: any) => {
    if (!order) return;

    let itemsToReorder: any[] = [];
    if (order.rawItems && order.rawItems.length > 0) {
      itemsToReorder = order.rawItems;
    } else if (order.items && order.items.length > 0) {
      itemsToReorder = order.items.map((i: any) => i.rawItem || {
        _id: i._id || i.id,
        id: i.id || i._id,
        name: i.name,
        price: i.rawPrice || Number(String(i.price || '').replace(/\D/g, '')),
        image: i.img,
        img: i.img,
        cartQty: i.qty || 1,
        checked: true
      });
    }

    if (itemsToReorder.length === 0) {
      alert("Không tìm thấy thông tin sản phẩm trong đơn hàng này!");
      return;
    }

    if (!addToCart) {
      alert("Hệ thống giỏ hàng chưa sẵn sàng, vui lòng thử lại!");
      return;
    }

    // Đưa từng món vào giỏ hàng
    itemsToReorder.forEach((item: any) => {
      const qty = Number(item.cartQty || item.quantity || item.qty || 1);
      const productObj = {
        _id: item._id || item.id,
        id: item.id || item._id,
        name: item.name,
        price: Number(item.price || item.rawPrice || 0),
        image: item.image || item.img || item.image_url || "https://placehold.co/100x100?text=Camera",
        cartQty: qty,
        checked: true
      };
      addToCart(productObj, qty);
    });

    if (viewOrder) setViewOrder(null);
    alert("Đã thêm các sản phẩm vào giỏ hàng! Đang chuyển đến giỏ hàng để mua ngay.");
    router.push('/cart');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users?id=${user._id || user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      
      if (res.ok) {
        const updatedUser = { ...user, ...profileForm };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert("Cập nhật thông tin cá nhân thành công!");
      } else {
        alert("Lỗi cập nhật!");
      }
    } catch (err) {
      alert("Lỗi kết nối!");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if(passForm.new !== passForm.confirm) return alert("Mật khẩu nhập lại không khớp!");
    if(passForm.new.length < 6) return alert("Mật khẩu phải dài hơn 6 ký tự!");
    
    try {
      // 1. Kiểm tra mật khẩu cũ
      const resCheck = await fetch('/api/users');
      const users = await resCheck.json();
      const currentUserData = users.find((u: any) => u._id === (user._id || user.id));

      if (currentUserData.password !== passForm.old) {
        return alert("Mật khẩu hiện tại không đúng!");
      }

      // 2. Cập nhật mật khẩu mới
      const updateRes = await fetch(`/api/users?id=${user._id || user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passForm.new })
      });

      if (updateRes.ok) {
        alert("Đổi mật khẩu thành công!");
        setPassForm({ old: '', new: '', confirm: '' });
      } else {
        alert("Có lỗi xảy ra khi lưu mật khẩu!");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportIssue.trim()) return;
    
    const newTicket = { customer: user.username, phone: user.phone, issue: supportIssue, status: 'Chưa trả lời' };
    
    try {
      const res = await fetch('/api/supports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });
      if (res.ok) {
        setSupports([...supports, { ...newTicket, createdAt: new Date() }]);
        setSupportIssue('');
        setTimeout(() => {
          const chatBox = document.getElementById('chat-box-container');
          if(chatBox) chatBox.scrollTop = chatBox.scrollHeight;
        }, 100);
      }
    } catch (e) { alert("Lỗi khi gửi tin nhắn!"); }
  };

  const removeFavorite = async (itemToRemove: any) => {
    const targetId = typeof itemToRemove === 'object'
      ? String(itemToRemove._id || itemToRemove.id || '')
      : String(itemToRemove);
    const targetName = typeof itemToRemove === 'object' ? String(itemToRemove.name || '').trim().toLowerCase() : '';

    const newFavs = favorites.filter((f: any) => {
      const fId = String(f._id || f.id || '');
      const fMongoId = String(f.id || f._id || '');
      const fName = String(f.name || '').trim().toLowerCase();

      if (targetId && (fId === targetId || fMongoId === targetId)) return false;
      if (targetName && fName && fName === targetName) return false;
      return true;
    });

    setFavorites(newFavs);

    const userKey = user?.username ? `camera_bn_favs_${user.username}` : 'camera_bn_favs';
    localStorage.setItem(userKey, JSON.stringify(newFavs));
    localStorage.setItem('camera_bn_favs', JSON.stringify(newFavs));

    if (user?.username) {
      try {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.username, favorites: newFavs })
        });
      } catch (e) {
        console.error("Lỗi xóa yêu thích:", e);
      }
    }
  };

  // ==========================================
  // XỬ LÝ QUÊN MẬT KHẨU QUA OTP
  // ==========================================
  const openForgotModal = () => {
    setForgotEmail(profileForm.email || ''); // Tự điền email của khách
    setShowForgotModal(true);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/users');
      const users = await res.json();
      const userExists = users.find((u: any) => u.email === forgotEmail.trim());

      if (!userExists) {
        setForgotError('Email này chưa được đăng ký trong hệ thống!');
        setIsLoading(false);
        return;
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtp(otpCode);

      const mailRes = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim(), otp: otpCode })
      });

      if (mailRes.ok) {
        setForgotStep(2); 
      } else {
        setForgotError('Có lỗi xảy ra khi gửi email. Vui lòng kiểm tra lại cấu hình mail!');
      }
    } catch (err) {
      setForgotError('Lỗi hệ thống. Vui lòng thử lại!');
    }
    setIsLoading(false);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (inputOtp.trim() !== sentOtp) {
      setForgotError('Mã OTP không chính xác!');
      return;
    }
    setForgotStep(3); 
  };

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
          alert('🎉 Khôi phục mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới ngay bây giờ.');
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
    setInputOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
  };

  if (!user) return null; 

  const renderAvatar = () => {
    if (avatar) return <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />;
    return <span style={{ fontSize: '40px', color: 'white', fontWeight: 'bold' }}>{user.username.charAt(0).toUpperCase()}</span>;
  };

  const displayedOrders = orders.filter(o => {
    if (orderSubTab === 'canceled') return o.status === 'Đã hủy';
    return o.status !== 'Đã hủy'; 
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif" }}>
      
      <style>{`
        .avatar-container:hover .avatar-overlay { opacity: 1 !important; }
        .profile-input { width: 100%; padding: 12px; border: 1px solid #bae6fd; border-radius: 8px; font-size: 14px; outline: none; margin-bottom: 20px; transition: 0.3s; background: rgba(255, 255, 255, 0.85); }
        .profile-input:focus { border-color: #0284c7; box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15); }
        .btn-outline:hover { background: #e0f2fe !important; }
        .invoice-table th { padding: 12px 10px; text-align: left; color: #0369a1; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #bae6fd; font-weight: 800; }
        .invoice-table td { padding: 15px 10px; border-bottom: 1px dashed rgba(186, 230, 253, 0.6); font-size: 14px; color: #334155; vertical-align: middle; }
        .fav-card { border: 1px solid #bae6fd; border-radius: 12px; overflow: hidden; transition: 0.3s; position: relative; background: rgba(255, 255, 255, 0.7); }
        .fav-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(2, 132, 199, 0.15); border-color: #38bdf8; }
        .chat-bubble-user { background: linear-gradient(135deg, #0284c7, #0369a1); color: white; padding: 12px 18px; border-radius: 18px 18px 0 18px; max-width: 70%; font-size: 14px; align-self: flex-end; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25); }
        .chat-bubble-admin { background: rgba(240, 249, 255, 0.9); color: #0c4a6e; padding: 12px 18px; border-radius: 18px 18px 18px 0; max-width: 70%; font-size: 14px; border: 1px solid #bae6fd; }

        /* CSS CHO MODAL QUÊN MẬT KHẨU */
        .forgot-modal-overlay {
          position: fixed; inset: 0; background: rgba(12, 74, 110, 0.8); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; backdrop-filter: blur(8px);
        }
        .forgot-modal-content {
          background: rgba(240, 249, 255, 0.95); backdrop-filter: blur(16px); border-radius: 16px; width: 100%; max-width: 450px; padding: 30px; box-shadow: 0 25px 50px -12px rgba(2, 132, 199, 0.35); border: 1px solid #bae6fd; position: relative;
        }
        .forgot-btn {
          width: 100%; padding: 14px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; gap: 8px;
        }
        .forgot-btn:hover { background: #2563eb; }
        .forgot-btn:disabled { background: #94a3b8; cursor: not-allowed; }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .order-modal-content {
          animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reorder-btn {
          transition: all 0.2s ease;
        }
        .reorder-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35) !important;
        }

        @media (max-width: 768px) {
          .profile-layout { flex-direction: column !important; }
          .profile-sidebar { width: 100% !important; }
          .profile-main { width: 100% !important; padding: 15px !important; min-height: auto !important; }
          .invoice-table-wrapper { width: 100% !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
          .invoice-table { width: 100% !important; min-width: 580px !important; }
          .settings-container { flex-direction: column !important; gap: 20px !important; }
          .fav-card { width: 100% !important; }
          #chat-box-container { min-height: 400px !important; max-height: 60vh !important; }
          .order-modal-content { max-width: 96% !important; border-radius: 16px !important; }
          .order-modal-body { padding: 14px !important; }
        }
      `}</style>

      {/* MODAL QUÊN MẬT KHẨU */}
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

            {/* BƯỚC 1 */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOTP}>
                <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginBottom: '20px' }}>
                  Vui lòng xác nhận Email của tài khoản. Chúng tôi sẽ gửi mã xác nhận gồm 6 chữ số.
                </p>
                <label style={{ display: 'block', fontSize: '13px', color: '#334155', fontWeight: '600', marginBottom: '8px' }}>Địa chỉ Email *</label>
                <input 
                  type="email" 
                  className="profile-input" 
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

            {/* BƯỚC 2 */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOTP}>
                <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginBottom: '20px' }}>
                  Mã xác nhận đã được gửi đến <strong>{forgotEmail}</strong>.<br/>Vui lòng kiểm tra hộp thư đến (hoặc thư rác).
                </p>
                <label style={{ display: 'block', fontSize: '13px', color: '#334155', fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>Mã OTP 6 số *</label>
                <input 
                  type="text" 
                  className="profile-input" 
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

            {/* BƯỚC 3 */}
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
                  className="profile-input" 
                  placeholder="Tối thiểu 6 ký tự..." 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />

                <label style={{ display: 'block', fontSize: '13px', color: '#334155', fontWeight: '600', marginBottom: '8px' }}>Xác nhận mật khẩu mới *</label>
                <input 
                  type="password" 
                  className="profile-input" 
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

      {/* 1. HEADER */}
      <Header user={user} activePage="profile" onLogout={handleLogout} />

      <div className="profile-layout" style={{ maxWidth: '1200px', width: '95%', margin: '30px auto', display: 'flex', gap: '30px', flex: 1, alignItems: 'flex-start' }}>
        
        <aside className="profile-sidebar" style={{ width: '280px', background: 'rgba(240, 249, 255, 0.8)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: '16px', boxShadow: '0 8px 30px rgba(2, 132, 199, 0.1)', border: '1px solid rgba(186, 230, 253, 0.75)', overflow: 'hidden' }}>
          
          <div style={{ padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid rgba(186, 230, 253, 0.6)' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 15px' }}>
              <div 
                style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #0369a1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)', overflow: 'hidden' }}
                onClick={() => fileInputRef.current?.click()}
                className="avatar-container"
              >
                {renderAvatar()}
                <div className="avatar-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }}>
                  <i className="fas fa-camera" style={{ color: 'white', fontSize: '24px' }}></i>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
              </div>
              
              {avatar && (
                <button 
                  onClick={handleDeleteAvatar} 
                  style={{ position: 'absolute', top: '0', right: '0', background: '#ef4444', color: 'white', border: 'none', width: '25px', height: '25px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                  title="Xóa ảnh đại diện"
                >
                  <i className="fas fa-times" style={{ fontSize: '12px' }}></i>
                </button>
              )}
            </div>

            <h3 style={{ fontSize: '18px', color: '#0c4a6e', margin: '0 0 5px', fontWeight: '800' }}>{user.username}</h3>
            <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(224, 242, 254, 0.8)', color: '#0284c7', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #bae6fd' }}>Thành viên thân thiết</span>
          </div>

          <ul style={{ listStyle: 'none', padding: '15px 0', margin: 0 }}>
            <li onClick={() => setActiveTab('orders')} style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: '600', color: activeTab === 'orders' ? '#0284c7' : '#475569', background: activeTab === 'orders' ? 'rgba(224, 242, 254, 0.8)' : 'transparent', borderLeft: activeTab === 'orders' ? '4px solid #0284c7' : '4px solid transparent' }}>
              <i className="fas fa-box" style={{ width: '20px', color: '#0284c7' }}></i> Lịch sử đơn hàng
            </li>
            <li onClick={() => setActiveTab('favorites')} style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: '600', color: activeTab === 'favorites' ? '#0284c7' : '#475569', background: activeTab === 'favorites' ? 'rgba(224, 242, 254, 0.8)' : 'transparent', borderLeft: activeTab === 'favorites' ? '4px solid #0284c7' : '4px solid transparent' }}>
              <i className="fas fa-heart" style={{ width: '20px', color: '#f43f5e' }}></i> Sản phẩm yêu thích
            </li>
            <li onClick={() => setActiveTab('support')} style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: '600', color: activeTab === 'support' ? '#0284c7' : '#475569', background: activeTab === 'support' ? 'rgba(224, 242, 254, 0.8)' : 'transparent', borderLeft: activeTab === 'support' ? '4px solid #0284c7' : '4px solid transparent' }}>
              <i className="fas fa-comments" style={{ width: '20px', color: '#0284c7' }}></i> Chat với Admin
            </li>
            <li onClick={() => setActiveTab('settings')} style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: '600', color: activeTab === 'settings' ? '#0284c7' : '#475569', background: activeTab === 'settings' ? 'rgba(224, 242, 254, 0.8)' : 'transparent', borderLeft: activeTab === 'settings' ? '4px solid #0284c7' : '4px solid transparent' }}>
              <i className="fas fa-cog" style={{ width: '20px', color: '#64748b' }}></i> Cài đặt tài khoản
            </li>
          </ul>

          <div style={{ padding: '20px' }}>
            <Link href="/" style={{ display: 'block', textAlign: 'center', padding: '10px', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', marginBottom: '10px', background: 'rgba(255, 255, 255, 0.8)' }}><i className="fas fa-arrow-left"></i> Về Trang chủ</Link>
            <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: 'rgba(224, 242, 254, 0.8)', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Đăng xuất</button>
          </div>
        </aside>

        <main className="profile-main" style={{ flex: 1, background: 'rgba(240, 249, 255, 0.8)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: '16px', boxShadow: '0 8px 30px rgba(2, 132, 199, 0.1)', border: '1px solid rgba(186, 230, 253, 0.75)', padding: '40px', minHeight: '600px', position: 'relative' }}>
          
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>Lịch sử mua hàng</h2>
                <Link href="/" style={{ background: '#3b82f6', color: 'white', padding: '8px 15px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}><i className="fas fa-plus"></i> Mua đơn mới</Link>
              </div>

              <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <button onClick={() => setOrderSubTab('placed')} style={{ background: 'none', border: 'none', padding: '10px 0', fontWeight: 'bold', fontSize: '14px', color: orderSubTab === 'placed' ? '#3b82f6' : '#64748b', borderBottom: orderSubTab === 'placed' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer' }}><i className="fas fa-shopping-cart"></i> Đơn hàng đã đặt</button>
                <button onClick={() => setOrderSubTab('canceled')} style={{ background: 'none', border: 'none', padding: '10px 0', fontWeight: 'bold', fontSize: '14px', color: orderSubTab === 'canceled' ? '#e11d48' : '#64748b', borderBottom: orderSubTab === 'canceled' ? '2px solid #e11d48' : '2px solid transparent', cursor: 'pointer' }}><i className="fas fa-trash-alt"></i> Đơn hàng đã hủy</button>
              </div>

              {displayedOrders.length > 0 ? (
                <div className="invoice-table-wrapper" style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                  <table className="invoice-table" style={{ width: '100%', minWidth: '580px', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '12px', borderBottom: '2px solid #bae6fd' }}>
                        <th style={{ padding: '14px 10px' }}>MÃ ĐƠN</th>
                        <th>NGÀY ĐẶT</th>
                        <th>TỔNG TIỀN</th>
                        <th>TRẠNG THÁI</th>
                        <th style={{ textAlign: 'right', paddingRight: '10px' }}>HÀNH ĐỘNG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedOrders.map((order, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px 10px', color: '#0284c7', fontWeight: 'bold' }}>#{order.id}</td>
                          <td style={{ color: '#475569', fontSize: '13px' }}>{order.date}</td>
                          <td style={{ color: '#0f172a', fontWeight: '800', fontSize: '15px' }}>{order.total}</td>
                          <td>
                            <span style={{ 
                              padding: '5px 12px', 
                              background: order.status === 'Đã hủy' ? '#fee2e2' : order.status === 'Thành công' ? '#dcfce7' : '#eff6ff', 
                              color: order.status === 'Đã hủy' ? '#ef4444' : order.status === 'Thành công' ? '#16a34a' : '#0284c7', 
                              borderRadius: '20px', 
                              fontSize: '12px', 
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}>
                              <span style={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%', 
                                background: order.status === 'Đã hủy' ? '#ef4444' : order.status === 'Thành công' ? '#16a34a' : '#0284c7' 
                              }}></span>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                              {order.status === 'Đã hủy' && (
                                <button 
                                  onClick={() => handleReorder(order)} 
                                  className="reorder-btn"
                                  style={{ 
                                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '7px 14px', 
                                    borderRadius: '6px', 
                                    fontSize: '12px', 
                                    fontWeight: '700', 
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                                  }}
                                  title="Thêm các sản phẩm vào giỏ hàng và mua ngay"
                                >
                                  <i className="fas fa-redo-alt"></i> Mua lại
                                </button>
                              )}
                              <button 
                                onClick={() => setViewOrder(order)} 
                                className="btn-outline" 
                                style={{ 
                                  border: '1px solid #cbd5e1', 
                                  background: 'white', 
                                  padding: '7px 14px', 
                                  borderRadius: '6px', 
                                  fontSize: '12px', 
                                  color: '#334155', 
                                  cursor: 'pointer',
                                  fontWeight: '600'
                                }}
                              >
                                Xem chi tiết
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: '14px' }}>Bạn chưa có đơn hàng nào trong mục này.</div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}><i className="fas fa-heart" style={{ color: '#e11d48' }}></i> Sản phẩm yêu thích</h2>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Đang lưu {favorites.length} sản phẩm</span>
              </div>
              
              {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b', fontSize: '14px' }}>
                  <i className="far fa-heart" style={{ fontSize: '40px', color: '#cbd5e1', marginBottom: '15px' }}></i>
                  <p style={{ marginBottom: '10px' }}>Bạn chưa lưu sản phẩm nào cả.</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Gợi ý: Ra ngoài trang chủ tìm sản phẩm và bấm thêm yêu thích nhé!</p>
                  <Link href="/" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}>Khám phá ngay</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {favorites.map((fav, fIdx) => (
                    <div key={fav._id || fav.id || fIdx} className="fav-card">
                      <button 
                        onClick={() => removeFavorite(fav)} 
                        title="Xóa khỏi yêu thích"
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: '1px solid #fecdd3', color: '#ef4444', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', transition: 'all 0.2s' }}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                      <div style={{ height: '180px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                        <img src={fav.image || fav.img || fav.image_url || "https://placehold.co/200x200?text=Camera"} alt={fav.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ padding: '15px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e293b', lineHeight: '1.4', height: '40px', overflow: 'hidden' }}>{fav.name}</h4>
                        <div style={{ color: '#e11d48', fontWeight: 'bold', fontSize: '15px' }}>{Number(fav.price || 0).toLocaleString('vi-VN')} đ</div>
                        <Link href={`/product/${fav._id || fav.id}`} style={{ display: 'block', textAlign: 'center', background: '#3b82f6', color: 'white', padding: '8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px', marginTop: '15px' }}>XEM CHI TIẾT</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'support' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  <i className="fas fa-headset"></i>
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Trung tâm Hỗ trợ CIOs - impossible is nothing</h2>
                  <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div> Trực tuyến
                  </div>
                </div>
              </div>
              
              <div id="chat-box-container" style={{ flex: 1, background: '#f8fafc', borderRadius: '12px', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '350px', border: '1px solid #e2e8f0' }}>
                
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', margin: '10px 0' }}>Bắt đầu cuộc trò chuyện. Hãy gửi vấn đề bạn đang gặp phải nhé!</div>

                {supports.map((s, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    <div className="chat-bubble-user">
                      {s.issue}
                      <div style={{ fontSize: '10px', color: '#bfdbfe', marginTop: '5px', textAlign: 'right' }}>
                        {s.createdAt ? new Date(s.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : 'Vừa gửi'}
                      </div>
                    </div>

                    {s.status === 'Đã trả lời' && s.admin_reply && (
                      <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start', maxWidth: '80%' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>
                          <i className="fas fa-headset"></i>
                        </div>
                        <div className="chat-bubble-admin">
                          <p style={{ margin: 0 }}>{s.admin_reply}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmitSupport} style={{ display: 'flex', gap: '10px', marginTop: '20px', background: 'white', padding: '10px', borderRadius: '30px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <input 
                  type="text" 
                  value={supportIssue} 
                  onChange={e => setSupportIssue(e.target.value)} 
                  placeholder="Nhập tin nhắn..." 
                  style={{ flex: 1, padding: '10px 15px', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px' }} 
                />
                <button type="submit" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>Cài đặt tài khoản</h2>
              <div className="settings-container" style={{ display: 'flex', gap: '30px' }}>
                
                <div style={{ flex: 1, border: '1px solid #e2e8f0', padding: '25px', borderRadius: '8px', background: 'white' }}>
                  <h3 style={{ fontSize: '15px', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-user-edit" style={{ color: '#f87171' }}></i> Thông tin cá nhân</h3>
                  <form onSubmit={handleUpdateProfile}>
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Họ và tên</label>
                    <input type="text" value={profileForm.username} onChange={e => setProfileForm({...profileForm, username: e.target.value})} className="profile-input" required />
                    
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Số điện thoại</label>
                    <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="profile-input" required />
                    
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Email</label>
                    <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="profile-input" />
                    
                    <button type="submit" style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>LƯU THAY ĐỔI</button>
                  </form>
                </div>

                <div style={{ flex: 1, border: '1px solid #e2e8f0', padding: '25px', borderRadius: '8px', background: '#f8fafc' }}>
                  <h3 style={{ fontSize: '15px', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-lock" style={{ color: '#f59e0b' }}></i> Đổi mật khẩu</h3>
                  <form onSubmit={handleChangePassword}>
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Mật khẩu hiện tại</label>
                    <input type="password" value={passForm.old} onChange={e => setPassForm({...passForm, old: e.target.value})} className="profile-input" required />
                    
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Mật khẩu mới</label>
                    <input type="password" value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})} className="profile-input" required />
                    
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Nhập lại mật khẩu mới</label>
                    <input type="password" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} className="profile-input" required />
                    
                    {/* ĐÃ THÊM: Nút Quên mật khẩu ngay trên nút Xác nhận đổi mật khẩu */}
                    <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                      <Link 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); openForgotModal(); }} 
                        style={{ color: '#ef4444', fontSize: '13px', textDecoration: 'none', fontWeight: '600', transition: '0.2s' }}
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>

                    <button type="submit" style={{ width: '100%', padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>XÁC NHẬN ĐỔI MẬT KHẨU</button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {viewOrder && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewOrder(null);
          }}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(15, 23, 42, 0.75)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000, 
            backdropFilter: 'blur(8px)',
            padding: '16px'
          }}
        >
          <div 
            className="order-modal-content"
            style={{ 
              background: '#ffffff', 
              borderRadius: '20px', 
              width: '100%', 
              maxWidth: '620px', 
              maxHeight: '90vh',
              boxShadow: '0 25px 60px -15px rgba(2, 132, 199, 0.35)', 
              border: '1px solid #bae6fd', 
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* MODAL HEADER */}
            <div style={{ 
              background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)', 
              color: 'white', 
              padding: '16px 20px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '10px', 
                  background: 'rgba(255, 255, 255, 0.15)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '17px'
                }}>
                  <i className="fas fa-file-invoice"></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', letterSpacing: '0.5px' }}>
                    HÓA ĐƠN #{viewOrder.id}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#bae6fd', marginTop: '2px' }}>
                    {viewOrder.date} {viewOrder.time ? `• ${viewOrder.time}` : ''}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewOrder(null)} 
                title="Đóng"
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  border: 'none', 
                  color: 'white', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              >
                &times;
              </button>
            </div>

            {/* MODAL BODY (SCROLLABLE) */}
            <div className="order-modal-body" style={{ 
              padding: '18px 20px', 
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              
              {/* TRẠNG THÁI ĐƠN HÀNG BANNER */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                background: viewOrder.status === 'Đã hủy' ? '#fef2f2' : viewOrder.status === 'Thành công' ? '#f0fdf4' : '#eff6ff',
                border: `1px solid ${viewOrder.status === 'Đã hủy' ? '#fecdd3' : viewOrder.status === 'Thành công' ? '#bbf7d0' : '#bfdbfe'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className={
                    viewOrder.status === 'Đã hủy' ? "fas fa-times-circle" :
                    viewOrder.status === 'Thành công' ? "fas fa-check-circle" :
                    "fas fa-clock"
                  } style={{ 
                    color: viewOrder.status === 'Đã hủy' ? '#ef4444' : viewOrder.status === 'Thành công' ? '#16a34a' : '#0284c7',
                    fontSize: '16px'
                  }}></i>
                  <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Trạng thái đơn hàng:</span>
                </div>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '13px', 
                  fontWeight: '700',
                  color: viewOrder.status === 'Đã hủy' ? '#ef4444' : viewOrder.status === 'Thành công' ? '#16a34a' : '#0284c7',
                  background: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                }}>
                  {viewOrder.status}
                </span>
              </div>

              {/* THÔNG TIN GIAO HÀNG */}
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '14px', 
                padding: '14px 16px' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '12px', 
                  color: '#0369a1', 
                  fontSize: '12px', 
                  fontWeight: '800', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <i className="fas fa-map-marker-alt"></i> Thông tin nhận hàng
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Người nhận</span>
                    <strong style={{ color: '#0f172a' }}>{viewOrder.customer || 'Khách hàng'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Điện thoại</span>
                    <strong style={{ color: '#0f172a' }}>{viewOrder.phone || 'Chưa có'}</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Địa chỉ giao hàng</span>
                    <span style={{ color: '#334155', lineHeight: '1.4' }}>{viewOrder.address || 'Chưa cung cấp'}</span>
                  </div>
                </div>
              </div>

              {/* DANH SÁCH SẢN PHẨM (CARD LIST - KHÔNG BỊ TRÀN TRÊN MOBILE) */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '8px', 
                  color: '#0369a1', 
                  fontSize: '12px', 
                  fontWeight: '800', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <span><i className="fas fa-box-open"></i> Sản phẩm ({viewOrder.items?.length || 0})</span>
                </div>

                <div style={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '14px', 
                  overflow: 'hidden' 
                }}>
                  {viewOrder.items?.map((item: any, index: number) => (
                    <div 
                      key={index} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '12px 14px',
                        borderBottom: index < viewOrder.items.length - 1 ? '1px solid #f1f5f9' : 'none'
                      }}
                    >
                      {/* Product Thumbnail */}
                      <div style={{ 
                        width: '54px', 
                        height: '54px', 
                        borderRadius: '10px', 
                        border: '1px solid #e2e8f0', 
                        background: '#f8fafc',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={item.img} 
                          alt={item.name} 
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '4px' }} 
                        />
                      </div>

                      {/* Product Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: '13px', 
                          fontWeight: '600', 
                          color: '#0f172a', 
                          lineHeight: '1.35',
                          marginBottom: '4px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{item.price}</span>
                          <span>&times;</span>
                          <span style={{ 
                            background: '#e0f2fe', 
                            color: '#0284c7', 
                            padding: '1px 6px', 
                            borderRadius: '4px', 
                            fontWeight: '700',
                            fontSize: '11px' 
                          }}>
                            {item.qty}
                          </span>
                        </div>
                      </div>

                      {/* Product Total */}
                      <div style={{ 
                        textAlign: 'right', 
                        flexShrink: 0,
                        fontWeight: '700', 
                        fontSize: '14px', 
                        color: '#e11d48' 
                      }}>
                        {item.total}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TỔNG KẾT CHI PHÍ */}
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '14px', 
                padding: '14px 16px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  <span>Tạm tính tiền hàng:</span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>{viewOrder.subtotal || viewOrder.total}</span>
                </div>
                {viewOrder.discount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#10b981', marginBottom: '8px' }}>
                    <span>Giảm giá (Voucher):</span>
                    <span style={{ fontWeight: '700' }}>- {viewOrder.discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>
                  <span>Phí vận chuyển:</span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>{viewOrder.shippingFee || "0 đ"}</span>
                </div>

                <div style={{ 
                  borderTop: '1px dashed #cbd5e1', 
                  paddingTop: '10px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>
                    TỔNG CỘNG:
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#e11d48' }}>
                    {viewOrder.total}
                  </span>
                </div>
              </div>

            </div>

            {/* MODAL FOOTER (ACTION BUTTONS) */}
            <div style={{ 
              padding: '14px 20px', 
              background: '#ffffff', 
              borderTop: '1px solid #e2e8f0', 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: '10px', 
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}>
              {/* NÚT MUA LẠI KHI ĐƠN HÀNG ĐÃ HỦY */}
              {viewOrder.status === 'Đã hủy' && (
                <button 
                  onClick={() => handleReorder(viewOrder)} 
                  className="reorder-btn"
                  style={{ 
                    flex: '1 1 200px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px 20px', 
                    borderRadius: '10px', 
                    fontWeight: '700', 
                    fontSize: '14px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
                  }}
                >
                  <i className="fas fa-redo-alt"></i> Mua lại đơn hàng này
                </button>
              )}

              {/* NÚT HỦY ĐƠN KHI ĐƠN HÀNG ĐANG CHỜ XỬ LÝ */}
              {viewOrder.status === 'Chờ xử lý' && (
                <button 
                  onClick={() => handleCancelOrder(viewOrder._id)} 
                  style={{ 
                    background: '#fff', 
                    color: '#ef4444', 
                    border: '1px solid #fca5a5', 
                    padding: '10px 18px', 
                    borderRadius: '8px', 
                    fontWeight: '700', 
                    fontSize: '13px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px' 
                  }}
                >
                  <i className="fas fa-trash-alt"></i> Hủy đơn hàng này
                </button>
              )}

              {/* NÚT ĐÓNG */}
              <button 
                onClick={() => setViewOrder(null)} 
                style={{ 
                  background: '#f1f5f9', 
                  color: '#475569', 
                  border: '1px solid #cbd5e1', 
                  padding: '10px 18px', 
                  borderRadius: '8px', 
                  fontWeight: '600', 
                  fontSize: '13px', 
                  cursor: 'pointer' 
                }}
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FLOATING SPEED DIAL */}
      <FloatingActions />

      {/* FOOTER */}
      <Footer />
    </div>
  );
}