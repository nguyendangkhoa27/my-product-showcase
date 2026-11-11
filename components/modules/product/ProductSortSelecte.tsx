// src/components/modules/product/ProductSortSelect.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface ProductSortSelectProps {
  currentSort: string;
}

export default function ProductSortSelect({ currentSort }: ProductSortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (newSort && newSort !== 'featured') {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }

    // Đẩy param sort mới lên URL nhưng giữ nguyên các param khác (category, productName...)
    router.push(`/shop/products?${params.toString()}`, { scroll: false });
  };

  return (
    <select
      value={currentSort}
      onChange={handleSortChange}
      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    >
      <option value="featured">Nổi bật nhất</option>
      <option value="price-asc">Giá: Thấp đến Cao</option>
      <option value="price-desc">Giá: Cao đến Thấp</option>
      <option value="rating">Đánh giá cao nhất</option>
    </select>
  );
}