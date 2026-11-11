// src/components/layout/CategoryTabBar.tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { mockCategories } from '@/data/mockProducts';

export default function CategoryTabBar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  return (
    <div className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-8 overflow-x-auto px-4 sm:px-6 lg:px-8 scrollbar-none">
        {mockCategories.map((cat) => {
          const isActive = currentCategory === cat.id;
          const href = cat.id === 'all' ? '/shop/products' : `/shop/products?category=${cat.id}`;

          return (
            <Link
              key={cat.id}
              href={href}
              className={`relative whitespace-nowrap py-3.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'font-semibold text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}