// src/types/cart.ts
import { Product, ProductVariant } from './product';

export interface CartItem {
  id: string; // Khóa duy nhất kết hợp giữa productId và variantId: `${productId}-${variantId || 'default'}`
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant | null) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}