// src/components/modules/product/ProductFilterSidebar.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mockCategories } from '@/data/mockProducts';
import { Filter, RotateCcw, Star, ChevronDown, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

// Các mốc giá định sẵn phổ biến
const PRICE_RANGES = [
  { label: 'Dưới 500.000₫', min: '0', max: '500000' },
  { label: '500.000₫ - 1.500.000₫', min: '500000', max: '1500000' },
  { label: '1.500.000₫ - 3.000.000₫', min: '1500000', max: '3000000' },
  { label: 'Trên 3.000.000₫', min: '3000000', max: '' },
];

export default function ProductFilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Đọc params hiện tại trên URL
  const currentCategory = searchParams.get('category') || 'all';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentRating = searchParams.get('rating') || '';

  // State nhập giá tùy biến
  const [customMin, setCustomMin] = useState(currentMinPrice);
  const [customMax, setCustomMax] = useState(currentMaxPrice);

  // Hàm cập nhật nhiều params đồng thời và đẩy lên URL
  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
// Xóa tham số page khi điều kiện lọc thay đổi
  params.delete('page');
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || (key === 'category' && value === 'all')) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`/shop/products?${params.toString()}`, { scroll: false });
  };

  // Áp dụng khoảng giá tự nhập
  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: customMin || null,
      maxPrice: customMax || null,
    });
  };

  // Xóa toàn bộ bộ lọc
  const handleResetFilters = () => {
    setCustomMin('');
    setCustomMax('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('rating');
    params.delete('page')
    router.push(`/shop/products?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters = Boolean(
    (currentCategory && currentCategory !== 'all') ||
    currentMinPrice ||
    currentMaxPrice ||
    currentRating
  );

  return (
    <aside className="w-full space-y-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Tiêu đề & Nút Reset */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Filter className="h-4 w-4 text-blue-600" />
          <span>Bộ lọc tìm kiếm</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Đặt lại
          </button>
        )}
      </div>

      {/* 1. Lọc theo Danh mục */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Danh mục sản phẩm
        </h3>
        <div className="space-y-1">
          {mockCategories.map((cat) => {
            const isSelected = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateFilters({ category: cat.id })}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{cat.name}</span>
                {isSelected && <Check className="h-4 w-4 text-blue-600" />}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* 2. Lọc theo Khoảng giá */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Khoảng giá
        </h3>
        {/* Các mốc giá gợi ý */}
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range, idx) => {
            const isSelected =
              currentMinPrice === range.min && currentMaxPrice === range.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  updateFilters({
                    minPrice: isSelected ? null : range.min,
                    maxPrice: isSelected ? null : range.max,
                  })
                }
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{range.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Tự điền giá */}
        <form onSubmit={handleApplyCustomPrice} className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customMin}
              onChange={(e) => setCustomMin(e.target.value)}
              placeholder="Từ ₫"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              value={customMax}
              onChange={(e) => setCustomMax(e.target.value)}
              placeholder="Đến ₫"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Áp dụng giá
          </button>
        </form>
      </div>

      <hr className="border-slate-100" />

      {/* 3. Lọc theo Đánh giá sao */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Đánh giá
        </h3>
        <div className="space-y-1">
          {[4, 3].map((star) => {
            const isSelected = currentRating === String(star);
            return (
              <button
                key={star}
                type="button"
                onClick={() =>
                  updateFilters({ rating: isSelected ? null : String(star) })
                }
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-50 text-amber-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < star ? 'fill-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span>Từ {star} sao</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}