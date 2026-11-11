// src/app/shop/layout.tsx
import StoreLayout from '@/components/layout/StoreLayout';
import { CartProvider } from '../../app/context/CartContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <StoreLayout>
    <CartProvider>{children}</CartProvider>
    </StoreLayout>;
}