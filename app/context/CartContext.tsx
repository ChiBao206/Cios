"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);

  // ======================================================================
  // 1. TẢI DỮ LIỆU: KIỂM TRA ĐĂNG NHẬP VÀ MÓC ĐÚNG GIỎ HÀNG CỦA TÀI KHOẢN ĐÓ
  // ======================================================================
  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      
      // Lấy giỏ hàng từ MongoDB
      fetch(`/api/cart?username=${parsedUser.username}&t=${new Date().getTime()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      }) 
        .then(res => res.json())
        .then(data => {
           if (data && data.cart && data.cart.length > 0) {
             setCartItems(data.cart);
           } else {
             // Nếu DB trống, tìm rổ riêng lưu trên máy của tài khoản này
             const savedCart = localStorage.getItem(`camera_bn_cart_${parsedUser.username}`);
             if (savedCart) setCartItems(JSON.parse(savedCart));
           }
           setIsLoaded(true);
        })
        .catch(() => {
           const savedCart = localStorage.getItem(`camera_bn_cart_${parsedUser.username}`);
           if (savedCart) setCartItems(JSON.parse(savedCart));
           setIsLoaded(true);
        });
    } else {
      // ĐÃ SỬA: NẾU CHƯA ĐĂNG NHẬP -> LẬP TỨC ÉP GIỎ HÀNG VỀ TRỐNG BÓC
      setUser(null);
      setCartItems([]);
      setIsLoaded(true);
    }
  }, []);

  // ======================================================================
  // 2. LƯU TRỮ: CHỈ LƯU KHI CÓ TÀI KHOẢN VÀ LƯU VÀO ĐÚNG RỔ CỦA NGƯỜI ĐÓ
  // ======================================================================
  useEffect(() => {
    if (isLoaded && user) {
      // Lưu vào trình duyệt với đuôi là TÊN TÀI KHOẢN (Ví dụ: camera_bn_cart_admin)
      localStorage.setItem(`camera_bn_cart_${user.username}`, JSON.stringify(cartItems));
      
      // Bắn lên lưu vô MongoDB
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, cart: cartItems })
      }).catch(err => console.log("Lỗi đồng bộ giỏ hàng:", err));
    }
  }, [cartItems, isLoaded, user]);

  // Các chức năng thêm, xóa, sửa số lượng giữ nguyên
  const addToCart = (product: any, qty: number = 1) => {
    setCartItems(prev => {
      const productId = product._id ? String(product._id) : String(product.id);

      const existingItemIndex = prev.findIndex(item => {
        const itemId = item._id ? String(item._id) : String(item.id);
        return itemId === productId;
      });

      if (existingItemIndex !== -1) {
        const newCart = [...prev];
        newCart[existingItemIndex].cartQty += qty;
        newCart[existingItemIndex].checked = true;
        return newCart;
      }

      return [...prev, { ...product, id: productId, cartQty: qty, checked: true }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => {
      const itemId = item._id ? String(item._id) : String(item.id);
      return itemId !== String(id);
    }));
  };

  const updateQty = (id: string, qty: number) => {
    setCartItems(cartItems.map(item => {
      const itemId = item._id ? String(item._id) : String(item.id);
      return itemId === String(id) ? { ...item, cartQty: qty } : item;
    }));
  };

  const toggleCheck = (id: string) => {
    setCartItems(cartItems.map(item => {
      const itemId = item._id ? String(item._id) : String(item.id);
      return itemId === String(id) ? { ...item, checked: !item.checked } : item;
    }));
  };

  const toggleAllCheck = (status: boolean) => {
    setCartItems(cartItems.map(item => ({ ...item, checked: status })));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.cartQty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, toggleCheck, toggleAllCheck, totalItems, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);