"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. KHI VỪA VÀO WEB: Tự động lấy lại giỏ hàng cũ từ bộ nhớ trình duyệt
  useEffect(() => {
    const savedCart = localStorage.getItem('camera_bn_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  // 2. MỖI KHI GIỎ HÀNG THAY ĐỔI: Tự động lưu ngay vào bộ nhớ trình duyệt
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('camera_bn_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

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