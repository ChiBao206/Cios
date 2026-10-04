"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 1. KHI VỪA VÀO WEB: Tải giỏ hàng từ Máy chủ (nếu đã đăng nhập) hoặc từ bộ nhớ tạm
  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      
      // GỌI API LẤY GIỎ HÀNG TỪ DATABASE ĐỂ ĐỒNG BỘ
      fetch(`/api/cart?username=${parsedUser.username}`) 
        .then(res => res.json())
        .then(data => {
           if (data && data.cart) {
             setCartItems(data.cart);
           } else {
             loadLocalCart();
           }
           setIsLoaded(true);
        })
        .catch(() => {
           // Nếu lỗi kết nối, lấy tạm giỏ hàng ở máy hiện tại
           loadLocalCart();
           setIsLoaded(true);
        });
    } else {
      loadLocalCart();
      setIsLoaded(true);
    }
  }, []);

  const loadLocalCart = () => {
    const savedCart = localStorage.getItem('camera_bn_cart');
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }

  // 2. MỖI KHI GIỎ HÀNG THAY ĐỔI: Lưu vào bộ nhớ máy & Đẩy lên Database
  useEffect(() => {
    if (isLoaded) {
      // Lưu offline trên thiết bị hiện tại
      localStorage.setItem('camera_bn_cart', JSON.stringify(cartItems));
      
      // NẾU ĐÃ ĐĂNG NHẬP -> ĐỒNG BỘ LÊN MÁY CHỦ ĐỂ ĐIỆN THOẠI CŨNG THẤY
      if (user) {
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.username, cart: cartItems })
        }).catch(err => console.log("Lỗi đồng bộ giỏ hàng lên server:", err));
      }
    }
  }, [cartItems, isLoaded, user]);

  // THÊM VÀO GIỎ
  const addToCart = (product: any, qty: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id || item._id === product._id);
      if (existingItem) {
        return prev.map(item => (item.id === product.id || item._id === product._id) ? { ...item, cartQty: item.cartQty + qty } : item);
      }
      return [...prev, { ...product, id: product._id || product.id, cartQty: qty, checked: true }];
    });
  };

  // XÓA KHỎI GIỎ
  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // TĂNG GIẢM SỐ LƯỢNG
  const updateQty = (id: string, qty: number) => {
    setCartItems(cartItems.map(item => item.id === id ? { ...item, cartQty: qty } : item));
  };

  // TICK CHỌN SẢN PHẨM
  const toggleCheck = (id: string) => {
    setCartItems(cartItems.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // TÍNH TỔNG SỐ LƯỢNG SẢN PHẨM TRÊN ICON GIỎ HÀNG
  const totalItems = cartItems.reduce((sum, item) => sum + item.cartQty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, toggleCheck, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);