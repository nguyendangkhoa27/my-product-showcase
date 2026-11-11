// src/components/layout/MobileTabBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingBag, Heart, User } from 'lucide-react';

interface MobileTabBarProps {
  cartCount?: number;
}

export default function MobileTabBar({ cartCount = 3 }: MobileTabBarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Trang chủ', href: '/shop/products', icon: Home },
    { label: 'Danh mục', href: '/shop/products?category=all', icon: Grid },
    { label: 'Giỏ hàng', href: '/cart', icon: ShoppingBag, badge: cartCount },
    { label: 'Yêu thích', href: '/wishlist', icon: Heart },
    { label: 'Tài khoản', href: '/account/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md md:hidden">
      <div className="flex w-full items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 py-1 text-xs transition-colors ${
                isActive ? 'font-semibold text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}