// src/context/CartContext.tsx
'use client';

import React, { createContext, useContext, useSyncExternalStore, useCallback } from 'react';
import { CartItem, CartContextType } from '@/types/cart';
import { Product, ProductVariant } from '@/types/product';

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'techstore_cart_v1';

// Mảng rỗng giữ chỗ lúc Server Render để tránh lệch Hydration
const EMPTY_ITEMS: CartItem[] = [];

// 1. Hàm lắng nghe thay đổi storage giữa các tab
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('cart_updated', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('cart_updated', callback);
  };
}

// 2. Hàm đọc dữ liệu Client-side
function getSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  return localStorage.getItem(CART_STORAGE_KEY) || '[]';
}

// 3. Hàm đọc dữ liệu Server-side (SSR)
function getServerSnapshot(): string {
  return '[]';
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Đồng bộ với LocalStorage bằng hook chuẩn của React
  const rawCart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  let items: CartItem[] = EMPTY_ITEMS;
  try {
    items = JSON.parse(rawCart);
  } catch (e) {
    items = EMPTY_ITEMS;
  }

  // Hàm lưu dữ liệu vào localStorage và phát sự kiện cập nhật
  const saveItems = useCallback((newItems: CartItem[]) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      // Bắn sự kiện nội bộ để kích hoạt render lại ngay lập tức
      window.dispatchEvent(new Event('cart_updated'));
    } catch (error) {
      console.error('Không thể lưu giỏ hàng vào localStorage:', error);
    }
  }, []);

  // Thêm vào giỏ
  const addToCart = useCallback(
    (product: Product, quantity: number = 1, variant: ProductVariant | null = null) => {
      const cartItemId = `${product.id}-${variant ? variant.id : 'default'}`;
      const existingIndex = items.findIndex((item) => item.id === cartItemId);

      let updatedItems: CartItem[];
      if (existingIndex > -1) {
        updatedItems = [...items];
        const newQty = updatedItems[existingIndex].quantity + quantity;
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: Math.min(newQty, product.stock),
        };
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          product,
          variant,
          quantity: Math.min(quantity, product.stock),
        };
        updatedItems = [...items, newItem];
      }

      saveItems(updatedItems);
    },
    [items, saveItems]
  );

  // Xóa sản phẩm khỏi giỏ
  const removeFromCart = useCallback(
    (cartItemId: string) => {
      const updatedItems = items.filter((item) => item.id !== cartItemId);
      saveItems(updatedItems);
    },
    [items, saveItems]
  );

  // Cập nhật số lượng
  const updateQuantity = useCallback(
    (cartItemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(cartItemId);
        return;
      }

      const updatedItems = items.map((item) => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity: Math.min(quantity, item.product.stock),
          };
        }
        return item;
      });

      saveItems(updatedItems);
    },
    [items, removeFromCart, saveItems]
  );

  // Xóa sạch giỏ hàng
  const clearCart = useCallback(() => {
    saveItems([]);
  }, [saveItems]);

  // Tính tổng
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng bên trong <CartProvider>');
  }
  return context;
}