// src/app/cart/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../../app/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

  const shippingFee = totalPrice > 500000 || items.length === 0 ? 0 : 30000;
  const finalPrice = totalPrice + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">Giỏ hàng của bạn đang trống</h1>
          <p className="mt-2 text-sm text-slate-500">
            Hãy khám phá các thiết bị công nghệ mới nhất và thêm vào giỏ hàng nhé!
          </p>
          <Link
            href="/shop/products"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Giỏ Hàng <span className="text-lg font-normal text-slate-500">({totalItems} món)</span>
          </h1>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
          >
            Xóa tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM (8 CỘT) */}
          <div className="space-y-4 lg:col-span-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Ảnh + Tên + Phân loại */}
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
                    <Image
                      src={item.product.thumbnail}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <Link
                      href={`/shop/products/${item.product.slug}`}
                      className="font-semibold text-slate-800 transition hover:text-blue-600 line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="mt-1 text-xs text-slate-500">
                        Phân loại: <span className="font-medium text-slate-700">{item.variant.value}</span>
                      </p>
                    )}
                    <p className="mt-1 font-bold text-slate-900 sm:hidden">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>
                </div>

                {/* Đơn giá, Tăng giảm số lượng & Nút Xóa */}
                <div className="flex items-center justify-between gap-6 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-bold text-slate-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-slate-400">
                        {formatPrice(item.product.price)} / món
                      </p>
                    )}
                  </div>

                  {/* Bộ nút tăng giảm */}
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white transition"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white transition"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Nút xóa */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    aria-label="Xóa món này"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <Link
              href="/shop/products"
              className="inline-flex items-center gap-2 pt-2 text-sm font-medium text-blue-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Tiếp tục chọn thêm sản phẩm
            </Link>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & NÚT THANH TOÁN (4 CỘT) */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Tóm tắt đơn hàng</h2>

              <div className="mt-6 space-y-3 border-b border-slate-100 pb-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-slate-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee === 0 ? <span className="font-semibold text-emerald-600">Miễn phí</span> : formatPrice(shippingFee)}</span>
                </div>
                {shippingFee === 0 && (
                  <p className="text-[11px] text-emerald-600">✓ Đơn hàng trên 500.000₫ được Freeship</p>
                )}
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-bold text-slate-900">Tổng thanh toán</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-blue-600">{formatPrice(finalPrice)}</span>
                  <p className="text-[11px] text-slate-400">(Đã bao gồm VAT nếu có)</p>
                </div>
              </div>

              <Link
  href="/shop/checkout"
  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-[0.98]"
>
  Tiến hành Đặt hàng
  <ArrowRight className="h-4 w-4" />
</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}