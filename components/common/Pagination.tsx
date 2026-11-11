// src/components/common/Pagination.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;

    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', String(newPage));
    }

    router.push(`/shop/products?${params.toString()}`, { scroll: false });
  };

  // Thuật toán hiển thị các số trang: [1, ..., 3, 4, 5, ..., 10]
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      aria-label="Phân trang sản phẩm"
      className="mt-10 flex items-center justify-center gap-1.5 sm:gap-2"
    >
      {/* Nút lùi trang */}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Danh sách các nút số trang */}
      {getPageNumbers().map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-10 w-10 items-center justify-center text-slate-400"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => handlePageChange(page)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/20'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Nút sang trang */}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Trang tiếp theo"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}