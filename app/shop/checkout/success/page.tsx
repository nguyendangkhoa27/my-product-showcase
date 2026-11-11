// src/app/shop/checkout/success/page.tsx
'use client';

import { Suspense, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import {
  CheckCircle2,
  Copy,
  Check,
  ShoppingBag,
  ArrowRight,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  User,
} from 'lucide-react';

interface OrderItem {
  id: string;
  product: {
    name: string;
    thumbnail: string;
    price: number;
  };
  variant?: {
    value: string;
  } | null;
  quantity: number;
}

interface OrderDetails {
  orderId: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
    city: string;
    district: string;
    address: string;
    note: string;
    paymentMethod: 'COD' | 'VIETQR';
  };
  items: OrderItem[];
  totalPrice: number;
  shippingFee: number;
  discount: number;
  finalPrice: number;
  createdAt: string;
}

const BANK_CONFIG = {
  BANK_ID: 'MB',
  ACCOUNT_NO: '0987654321',
  ACCOUNT_NAME: 'CONG TY TECHSTORE VIET NAM',
};

// 1. Hàm đăng ký listener cho sessionStorage
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

// 2. Đọc Client-side
function getSnapshot(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('latest_order') || '';
}

// 3. Đọc Server-side
function getServerSnapshot(): string {
  return '';
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get('orderId') || 'TS-849201';

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Đọc dữ liệu từ sessionStorage an toàn không gây cascading render
  const rawOrder = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  let order: OrderDetails | null = null;
  if (rawOrder) {
    try {
      order = JSON.parse(rawOrder);
    } catch {
      order = null;
    }
  }

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const finalAmount = order ? order.finalPrice : 0;
  const paymentMethod = order?.customer.paymentMethod || 'COD';

  const transferContent = `TECHSTORE ${orderIdFromUrl}`;
  const qrCodeUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Khối chúc mừng */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-sm ring-8 ring-emerald-50/50">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Đặt hàng thành công!
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Cảm ơn bạn đã mua sắm tại TechStore. Mã đơn hàng của bạn là{' '}
            <span className="font-bold text-blue-600">#{orderIdFromUrl}</span>.
          </p>
          <p className="text-xs text-slate-400">
            Thông tin chi tiết và cập nhật hành trình đã được lưu vào hệ thống.
          </p>
        </div>

        {/* Khối hướng dẫn Thanh toán VietQR (nếu khách chọn VIETQR) */}
        {paymentMethod === 'VIETQR' && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
              <h2 className="text-base font-bold">Thanh toán chuyển khoản qua VietQR 24/7</h2>
              <p className="text-xs text-blue-100">
                Mở ứng dụng ngân hàng bất kỳ để quét mã QR thanh toán nhanh
              </p>
            </div>

            <div className="grid grid-cols-1 items-center gap-6 p-6 sm:grid-cols-12 sm:p-8">
              <div className="flex flex-col items-center justify-center sm:col-span-5">
                <div className="relative aspect-square w-56 max-w-full overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-2 shadow-sm">
                  <Image
                    src={qrCodeUrl}
                    alt="Mã VietQR thanh toán"
                    width={224}
                    height={224}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                </div>
                <span className="mt-2 text-[11px] text-slate-400">
                  Quét bằng Vietcombank, MB, Techcombank, Momo...
                </span>
              </div>

              <div className="space-y-3 sm:col-span-7">
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400 uppercase">Ngân hàng</span>
                  <p className="text-sm font-bold text-slate-800">
                    MBBank (Ngân hàng Quân Đội)
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase">Số tài khoản</span>
                    <p className="font-mono text-base font-bold text-slate-900">
                      {BANK_CONFIG.ACCOUNT_NO}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(BANK_CONFIG.ACCOUNT_NO, 'accountNo')}
                    className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50"
                  >
                    {copiedField === 'accountNo' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" /> Đã chép
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-500" /> Sao chép
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase">Số tiền</span>
                    <p className="text-base font-extrabold text-blue-600">
                      {formatPrice(finalAmount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(finalAmount), 'amount')}
                    className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50"
                  >
                    {copiedField === 'amount' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" /> Đã chép
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-500" /> Sao chép
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-amber-50/70 p-3.5 border border-amber-200/60">
                  <div>
                    <span className="text-[11px] font-medium text-amber-700 uppercase">
                      Nội dung chuyển khoản
                    </span>
                    <p className="font-mono text-sm font-bold text-amber-900">
                      {transferContent}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(transferContent, 'content')}
                    className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50"
                  >
                    {copiedField === 'content' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" /> Đã chép
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-500" /> Sao chép
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thông tin đơn hàng */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700">
              <Truck className="h-4 w-4 text-blue-600" />
              Thông tin nhận hàng
            </h3>
            <div className="mt-4 space-y-2.5 text-sm text-slate-600">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <User className="h-4 w-4 text-slate-400" />
                <span>{order?.customer.fullName || 'Khách hàng'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{order?.customer.phone || '09xx xxx xxx'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>
                  {order?.customer.address
                    ? `${order.customer.address}, ${order.customer.district}, ${order.customer.city}`
                    : 'Địa chỉ nhận hàng tiêu chuẩn'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700">
              <CreditCard className="h-4 w-4 text-blue-600" />
              Hình thức thanh toán
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 font-semibold text-slate-800">
                {paymentMethod === 'VIETQR'
                  ? 'Chuyển khoản VietQR 24/7'
                  : 'Thanh toán tiền mặt khi nhận hàng (COD)'}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {paymentMethod === 'VIETQR'
                  ? 'Hệ thống sẽ tự động xác nhận đơn hàng ngay khi nhận được biến động số dư chuyển khoản.'
                  : 'Nhân viên giao hàng sẽ liên hệ với bạn trước khi phát hàng. Vui lòng chuẩn bị đúng số tiền mặt.'}
              </p>
            </div>
          </div>
        </div>

        {/* Danh sách các mặt hàng đã mua */}
        {order && order.items && order.items.length > 0 && (
          <div className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
              Mặt hàng đã đặt ({order.items.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      <Image
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                        {item.product.name}
                      </p>
                      {item.variant && (
                        <p className="text-[11px] text-slate-400">
                          Phân loại: {item.variant.value}
                        </p>
                      )}
                      <span className="text-[11px] text-slate-500">
                        SL: x{item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>
                  {order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-extrabold text-slate-900">
                <span>Tổng cộng</span>
                <span className="text-blue-600">{formatPrice(order.finalPrice)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Nút hành động chân trang */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/shop/products"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 sm:w-auto"
          >
            <ShoppingBag className="h-4 w-4" />
            Tiếp tục mua sắm
          </Link>
          <Link
            href="/shop/products"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            Về trang sản phẩm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function OrderSuccessFallback() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessFallback />}>
      <OrderSuccessContent />
    </Suspense>
  );
}