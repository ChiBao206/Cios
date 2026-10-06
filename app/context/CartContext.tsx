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
      const productId = product._id ? String(product._id) : String(product.id);

      const existingItemIndex = prev.findIndex(item => {
        const itemId = item._id ? String(item._id) : String(item.id);
        return itemId === productId;
      });

      if (existingItemIndex !== -1) {
        const newCart = [...prev];
        newCart[existingItemIndex].cartQty += qty;
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

  // ========================================================
  // BỔ SUNG: Hàm Chọn/Bỏ chọn TẤT CẢ (Để làm ô tick tổng)
  // ========================================================
  const toggleAllCheck = (status: boolean) => {
    setCartItems(cartItems.map(item => ({ ...item, checked: status })));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.cartQty, 0);

  return (
    // Đã xuất hàm toggleAllCheck ra ngoài để trang Giỏ hàng có thể xài được
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, toggleCheck, toggleAllCheck, totalItems, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);