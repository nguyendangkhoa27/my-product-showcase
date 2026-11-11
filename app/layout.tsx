// src/app/layout.tsx
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

export const metadata = {
  title: 'TechStore - Thiết bị công nghệ & Phụ kiện chính hãng',
  description: 'Trải nghiệm mua sắm thiết bị âm thanh, smartwatch và phụ kiện đỉnh cao 2026.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
        <CartProvider>
          {/* Header luôn cố định ở trên cùng mọi trang */}
          <Header />

          {/* Phần nội dung trang chủ (src/app/page.tsx) hoặc các trang con */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer chân trang */}
          <Footer />
        </CartProvider>
        </AuthProvider>
       
      </body>
    </html>
  );
}