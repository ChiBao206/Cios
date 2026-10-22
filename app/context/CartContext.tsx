"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);

  // ======================================================================
  // HÀM ĐỒNG BỘ GIỎ HÀNG TỪ MONGODB VỀ THIẾT BỊ HIỆN TẠI
  // ======================================================================
  const refreshCart = useCallback(async () => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (!loggedInUser) return;
    
    try {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);

      const res = await fetch(`/api/cart?username=${parsedUser.username}&t=${new Date().getTime()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store' }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.cart)) {
          if (data.cart.length > 0) {
            setCartItems(data.cart);
            localStorage.setItem(`camera_bn_cart_${parsedUser.username}`, JSON.stringify(data.cart));
          } else {
            // Nếu DB chưa có nhưng local máy này có hàng, đồng bộ local lên DB
            const savedCart = localStorage.getItem(`camera_bn_cart_${parsedUser.username}`);
            if (savedCart) {
              const localItems = JSON.parse(savedCart);
              if (localItems && localItems.length > 0) {
                setCartItems(localItems);
                fetch('/api/cart', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username: parsedUser.username, cart: localItems })
                }).catch(() => {});
              }
            }
          }
        }
      }
    } catch (e) {
      console.log("Lỗi đồng bộ giỏ hàng:", e);
    }
  }, []);

  // ======================================================================
  // 1. TẢI DỮ LIỆU BAN ĐẦU: KIỂM TRA ĐĂNG NHẬP VÀ MÓC ĐÚNG GIỎ HÀNG CỦA TÀI KHOẢN ĐÓ
  // ======================================================================
  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      
      // Lấy giỏ hàng từ MongoDB
      fetch(`/api/cart?username=${parsedUser.username}&t=${new Date().getTime()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store' }
      }) 
        .then(res => res.json())
        .then(data => {
           if (data && data.cart && data.cart.length > 0) {
             setCartItems(data.cart);
             localStorage.setItem(`camera_bn_cart_${parsedUser.username}`, JSON.stringify(data.cart));
           } else {
             // Nếu DB trống, tìm rổ riêng lưu trên máy của tài khoản này
             const savedCart = localStorage.getItem(`camera_bn_cart_${parsedUser.username}`);
             if (savedCart) {
               const localItems = JSON.parse(savedCart);
               setCartItems(localItems);
               if (localItems && localItems.length > 0) {
                 fetch('/api/cart', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ username: parsedUser.username, cart: localItems })
                 }).catch(() => {});
               }
             }
           }
           setIsLoaded(true);
        })
        .catch(() => {
           const savedCart = localStorage.getItem(`camera_bn_cart_${parsedUser.username}`);
           if (savedCart) setCartItems(JSON.parse(savedCart));
           setIsLoaded(true);
        });
    } else {
      setUser(null);
      setCartItems([]);
      setIsLoaded(true);
    }
  }, []);

  // Tự động kiểm tra và đồng bộ khi người dùng quay lại tab/trình duyệt
  useEffect(() => {
    const handleSync = () => {
      refreshCart();
    };

    window.addEventListener('focus', handleSync);
    window.addEventListener('storage', handleSync);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') handleSync();
    });

    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [refreshCart]);

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
    if (qty < 1) return;
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

  const removePurchasedItems = (purchasedIds: string[]) => {
    const idSet = new Set(purchasedIds.map(String));
    setCartItems(prev => {
      const remaining = prev.filter(item => !idSet.has(String(item._id || item.id)));
      if (user) {
        localStorage.setItem(`camera_bn_cart_${user.username}`, JSON.stringify(remaining));
      }
      return remaining;
    });
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.cartQty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, toggleCheck, toggleAllCheck, totalItems, clearCart, refreshCart, removePurchasedItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
