// src/components/layout/SearchAutocomplete.tsx
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { mockProducts } from '@/data/mockProducts';
import { formatPrice, removeVietnameseTones } from '@/lib/utils';

export default function SearchAutocomplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentUrlSearch = searchParams.get('productName') || '';

  const [keyword, setKeyword] = useState(currentUrlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(currentUrlSearch);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Đồng bộ ô input khi URL thay đổi (Back/Forward hoặc reset lọc)
  // Thực hiện trực tiếp trong render thay vì gọi qua useEffect để tránh cascading render
  if (prevUrlSearch !== currentUrlSearch) {
    setPrevUrlSearch(currentUrlSearch);
    setKeyword(currentUrlSearch);
  }

  // 1. Debounce từ khóa phục vụ hiển thị popup gợi ý tức thì
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [keyword]);

  // 2. Click outside để đóng popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Tính toán kết quả gợi ý dropdown bằng useMemo (Derived State)
  const results = useMemo(() => {
    const cleanKeyword = removeVietnameseTones(debouncedKeyword);
    if (!cleanKeyword) return [];

    return mockProducts
      .filter((product) => {
        const matchName = removeVietnameseTones(product.name).includes(cleanKeyword);
        const matchBrand = removeVietnameseTones(product.brand).includes(cleanKeyword);
        const matchCategory = removeVietnameseTones(product.categoryName).includes(cleanKeyword);
        return matchName || matchBrand || matchCategory;
      })
      .slice(0, 5);
  }, [debouncedKeyword]);

  // 4. Submit form tìm kiếm
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setIsOpen(false);
    inputRef.current?.blur();

    const params = new URLSearchParams(searchParams.toString());
    params.set('productName', trimmed);
    params.delete('page'); // Reset về trang 1
    router.push(`/shop/products?${params.toString()}`);
  };

  // 5. Nút xóa nhanh (X): Xóa sạch state và xóa param trên URL để quay về tất cả sản phẩm
  const handleClear = () => {
    setKeyword('');
    setDebouncedKeyword('');
    setIsOpen(false);
    inputRef.current?.focus();

    if (searchParams.has('productName')) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('productName');
      params.delete('page');

      const queryString = params.toString();
      const targetUrl = queryString ? `/shop/products?${queryString}` : '/shop/products';
      router.push(targetUrl, { scroll: false });
    }
  };

  // 6. Xử lý khi gõ phím hoặc xóa thủ công bằng phím Backspace
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    if (!isOpen) setIsOpen(true);

    // Nếu người dùng xóa hết chữ về rỗng khi đang ở trang danh sách sản phẩm
    if (val === '' && searchParams.has('productName') && pathname.includes('/shop/products')) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('productName');
      params.delete('page');
      const queryString = params.toString();
      const targetUrl = queryString ? `/shop/products?${queryString}` : '/shop/products';
      router.push(targetUrl, { scroll: false });
    }
  };

  const showDropdown = isOpen && debouncedKeyword.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Form ô tìm kiếm */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={handleInputChange}
          onFocus={() => {
            if (debouncedKeyword) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
          placeholder="Tìm tai nghe Sony, Apple Watch, sạc Anker..."
          className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 py-2.5 pl-10 pr-9 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />

        {/* Icon kính lúp */}
        <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />

        {/* Nút X xóa nhanh từ khóa */}
        {keyword && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
            aria-label="Xóa từ khóa tìm kiếm"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {/* Dropdown gợi ý */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-blue-600" />
              Gợi ý sản phẩm ({results.length})
            </span>
            <span className="text-[10px] text-slate-400">Nhấn ESC để đóng</span>
          </div>

          {results.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/products/${product.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 transition-colors hover:bg-blue-50/50 group"
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {product.badge && (
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 flex-shrink-0">
                      {product.badge}
                    </span>
                  )}
                </Link>
              ))}

              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="flex w-full items-center justify-center gap-1.5 bg-slate-50 py-3 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50"
              >
                <span>Xem tất cả kết quả cho &quot;{debouncedKeyword}&quot;</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-xs font-medium text-slate-600">
                Không tìm thấy sản phẩm nào khớp với &quot;{debouncedKeyword}&quot;
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Hãy thử kiểm tra lại chính tả hoặc tìm theo thương hiệu (Apple, Sony, Anker...).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}