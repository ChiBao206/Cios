"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      
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

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('camera_bn_cart', JSON.stringify(cartItems));
      if (user) {
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.username, cart: cartItems })
        }).catch(err => console.log("Lỗi đồng bộ giỏ hàng:", err));
      }
    }
  }, [cartItems, isLoaded, user]);

  const addToCart = (product: any, qty: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id || item._id === product._id);
      if (existingItem) {
        return prev.map(item => (item.id === product.id || item._id === product._id) ? { ...item, cartQty: item.cartQty + qty } : item);
      }
      return [...prev, { ...product, id: product._id || product.id, cartQty: qty, checked: true }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    setCartItems(cartItems.map(item => item.id === id ? { ...item, cartQty: qty } : item));
  };

  const toggleCheck = (id: string) => {
    setCartItems(cartItems.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // HÀM MỚI: Dọn sạch giỏ hàng (Sẽ được gọi sau khi thanh toán xong)
  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.cartQty, 0);

  return (
    // Nhớ bổ sung clearCart vào value
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, toggleCheck, totalItems, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);