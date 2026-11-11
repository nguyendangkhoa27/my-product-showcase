// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { mockProducts, mockCategories } from '@/data/mockProducts';
import ProductCard from '@/components/modules/product/ProductCard';
import { formatPrice } from '@/lib/utils';
import {
  Flame,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Sparkles,
  ChevronRight,
  Clock,
} from 'lucide-react';

export default function HomePage() {
  // 1. Đồng hồ đếm ngược Flash Sale (Mặc định 8 giờ đếm lùi)
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Lọc sản phẩm nổi bật & Flash sale từ mock data
  const flashSaleProducts = mockProducts.filter((p) => p.discountPercentage >= 15).slice(0, 4);
  const bestSellerProducts = mockProducts.slice(0, 8);
  const heroProduct = mockProducts[0] || null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 3. KHỐI FLASH SALE VỚI COUNTDOWN TIMER */}
      {flashSaleProducts.length > 0 && (
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-500/10 via-white to-amber-500/10 p-6 sm:p-8">
              {/* Header của Flash Sale */}
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-rose-200/50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-500/30">
                    <Flame className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                      GIÁ SỐC HÔM NAY
                    </h2>
                    <p className="text-xs text-slate-500">Số lượng có hạn, kết thúc sau:</p>
                  </div>
                </div>

                {/* Bộ đếm ngược Countdown Box */}
                <div className="flex items-center gap-2">
                  <div className="flex h-11 min-w-[44px] items-center justify-center rounded-xl bg-slate-900 font-mono text-base font-extrabold text-white shadow-sm px-2">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <span className="font-bold text-slate-800">:</span>
                  <div className="flex h-11 min-w-[44px] items-center justify-center rounded-xl bg-slate-900 font-mono text-base font-extrabold text-white shadow-sm px-2">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <span className="font-bold text-slate-800">:</span>
                  <div className="flex h-11 min-w-[44px] items-center justify-center rounded-xl bg-rose-600 font-mono text-base font-extrabold text-white shadow-sm px-2">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Lưới sản phẩm Flash Sale */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {flashSaleProducts.map((product) => (
                  <div key={product.id} className="relative flex flex-col">
                    <ProductCard product={product} />
                    
                    {/* Thanh trạng thái tiến độ bán hàng */}
                    <div className="mt-2 px-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-rose-600">Đã bán {Math.floor(product.reviewCount * 1.8)}</span>
                        <span className="text-slate-400">Còn lại {product.stock}</span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500"
                          style={{
                            width: `${Math.min(
                              100,
                              ((product.reviewCount * 1.8) / (product.reviewCount * 1.8 + product.stock)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. DANH MỤC NỔI BẬT (FEATURED CATEGORIES) */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Danh mục nổi bật
              </h2>
              <p className="text-xs text-slate-500">Khám phá theo nhu cầu sử dụng</p>
            </div>
            <Link
              href="/shop/products"
              className="group flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Xem tất cả
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {mockCategories
              .filter((cat) => cat.id !== 'all')
              .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop/products?category=${cat.id}`}
                  className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-5 text-center transition-all hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                    <Headphones className="h-7 w-7" />
                  </div>
                  <h3 className="mt-3 text-xs font-bold text-slate-800 group-hover:text-blue-600">
                    {cat.name}
                  </h3>
                  <span className="mt-0.5 text-[10px] text-slate-400">
                    {mockProducts.filter((p) => p.category === cat.id).length} sản phẩm
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* 5. GỢI Ý DÀNH CHO BẠN (BEST SELLERS) */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Sản phẩm bán chạy nhất
              </h2>
              <p className="text-xs text-slate-500">Được khách hàng đánh giá cao nhất</p>
            </div>
            <Link
              href="/shop/products?sort=rating"
              className="group flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Xem thêm
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/shop/products"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-95"
            >
              Xem toàn bộ danh mục sản phẩm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}