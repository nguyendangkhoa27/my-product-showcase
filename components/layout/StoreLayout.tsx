// src/components/layout/StoreLayout.tsx
import CategoryTabBar from './CategoryTabar';
import MobileTabBar from './MobileTabar';
import { Suspense } from 'react';

interface StoreLayoutProps {
  children: React.ReactNode;
}
// Khung chờ (Fallback) hiển thị trong lúc URL params đang được xử lý
function CategoryTabBarSkeleton() {
  return (
    <div className="h-12 border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}
// Khung chờ Skeleton cho MobileTabBar
function MobileTabBarSkeleton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-slate-200 bg-white md:hidden" />
  );
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* 1. Header / Top Toolbar
      <Header /> */}

      {/* 2. Top Tabbar điều hướng danh mục */}
      <Suspense fallback={<CategoryTabBarSkeleton />}>
        <CategoryTabBar />
      </Suspense>

      {/* 3. Vùng nội dung chính */}
      <main className="flex-1 pb-20 md:pb-12">
        {children}
      </main>

      {/* 4. Bottom Tabbar (Hiển thị riêng trên Mobile) */}
      <Suspense fallback={<MobileTabBarSkeleton />}>
<MobileTabBar />
      </Suspense>
      
    </div>
  );
}