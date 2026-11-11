// src/components/layout/Header.tsx
'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Bell, LogOut, PackageCheck, LogIn } from 'lucide-react';
import { useCart } from '../../app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import SearchAutocomplete from './SearchAutocomplete';

/**
 * Skeleton hiển thị tạm trong lúc ô tìm kiếm (SearchAutocomplete) đang tải.
 * Giữ kích thước cố định để layout không bị giật (layout shift).
 */
function SearchFallback() {
  return (
    <div className="h-10 w-full animate-pulse rounded-2xl bg-slate-100" />
  );
}

/**
 * Component hiển thị khu vực tài khoản:
 * - Khi chưa đăng nhập: Hiển thị nút "Đăng nhập" dẫn tới `/account/auth`.
 * - Khi đã đăng nhập: Hiển thị avatar chữ cái đầu + tên người dùng + popup menu xổ xuống (Đơn hàng, Đăng xuất).
 */
function UserMenu() {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Bắt sự kiện click ra bên ngoài để đóng menu dropdown
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // TRƯỜNG HỢP 1: Khách vãng lai chưa đăng nhập
  if (!currentUser) {
    return (
      <Link
        href="/account/auth"
        className="flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Đăng nhập</span>
      </Link>
    );
  }

  // TRƯỜNG HỢP 2: Khách đã có tài khoản và đang đăng nhập
  return (
    <div ref={menuRef} className="relative">
      {/* Nút bấm hiển thị Avatar chữ cái đầu và tên người dùng */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 p-1 pr-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white uppercase shadow-sm">
          {currentUser.fullName.charAt(0)}
        </div>
        <span className="hidden max-w-[110px] truncate sm:inline">
          {currentUser.fullName}
        </span>
      </button>

      {/* Menu dropdown xổ xuống khi click */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-150">
          {/* Thông tin hồ sơ tóm tắt */}
          <div className="border-b border-slate-100 px-4 py-2.5 bg-slate-50/50">
            <p className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
          </div>

          {/* Liên kết tới trang Quản lý đơn hàng */}
          <Link
            href="/account/orders"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
          >
            <PackageCheck className="h-4 w-4 text-slate-400" />
            Đơn hàng của tôi
          </Link>

          {/* Nút Đăng xuất */}
          <button
            type="button"
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition border-t border-slate-100"
          >
            <LogOut className="h-4 w-4 text-rose-500" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* 1. Logo thương hiệu dẫn về Trang chủ */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-md shadow-blue-500/20">
            K
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Tech<span className="text-blue-600">Store</span>
          </span>
        </Link>

        {/* 2. Thanh tìm kiếm Autocomplete nằm chính giữa (Desktop & Tablet) */}
        <div className="relative hidden flex-1 max-w-lg md:block">
          <Suspense fallback={<SearchFallback />}>
            <SearchAutocomplete />
          </Suspense>
        </div>

        {/* 3. Khu vực các nút chức năng (Thông báo, Giỏ hàng, Tài khoản) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Nút thông báo */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
            aria-label="Thông báo"
          >
            <Bell className="h-5 w-5" />
          </button>

          {/* Icon Giỏ hàng (Đếm số lượng món hàng theo thời gian thực) */}
          <Link
            href="/shop/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Khu vực trạng thái tài khoản người dùng */}
          <UserMenu />
        </div>
      </div>

      {/* 4. Thanh tìm kiếm dành riêng cho Mobile (Dưới breakpoint md) */}
      <div className="border-t border-slate-100 px-4 py-2.5 md:hidden bg-white">
        <Suspense fallback={<SearchFallback />}>
          <SearchAutocomplete />
        </Suspense>
      </div>
    </header>
  );
}