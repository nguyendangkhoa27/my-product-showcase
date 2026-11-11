// src/app/checkout/page.tsx
'use client';

import { Suspense, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { CartItem } from '@/types/cart';
import {
  ShieldCheck,
  Truck,
  Banknote,
  QrCode,
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  address: string;
  note: string;
  paymentMethod: 'COD' | 'VIETQR';
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getBuyNowSnapshot(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('buy_now_item') || '';
}

function getServerSnapshot(): string {
  return '';
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === 'true';

  // Lấy dữ liệu từ giỏ hàng chính
  const cart = useCart();

  // Đọc dữ liệu "Mua ngay" an toàn bằng useSyncExternalStore
  const rawBuyNow = useSyncExternalStore(subscribe, getBuyNowSnapshot, getServerSnapshot);
  
  let buyNowItem: CartItem | null = null;
  if (isBuyNow && rawBuyNow) {
    try {
      buyNowItem = JSON.parse(rawBuyNow);
    } catch {
      buyNowItem = null;
    }
  }

  // Quyết định danh sách món hàng đang thanh toán:
  // Nếu là Mua ngay -> dùng mảng [buyNowItem], ngược lại dùng cart.items
  const checkoutItems: CartItem[] = isBuyNow
    ? buyNowItem
      ? [buyNowItem]
      : []
    : cart.items;

  // Tính tổng số lượng và tiền
  const totalItems = checkoutItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = checkoutItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    email: '',
    city: 'Hồ Chí Minh',
    district: '',
    address: '',
    note: '',
    paymentMethod: 'COD',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  const shippingFee = totalPrice > 500000 || checkoutItems.length === 0 ? 0 : 30000;
  const finalPrice = Math.max(0, totalPrice + shippingFee - appliedDiscount);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof CheckoutFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'TECHSTORE50') {
      setAppliedDiscount(50000);
      setCouponSuccess('Đã áp dụng mã giảm 50.000₫');
    } else if (code === 'FREESHIP') {
      setAppliedDiscount(shippingFee);
      setCouponSuccess('Đã miễn phí vận chuyển');
    } else {
      setCouponError('Mã không hợp lệ');
    }
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof CheckoutFormData, string>> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/(0[3|5|7|8|9])+([0-9]{8})\b/.test(formData.phone.trim())) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.address.trim()) errors.address = 'Vui lòng nhập địa chỉ cụ thể';
    if (!formData.district.trim()) errors.district = 'Vui lòng nhập quận / huyện';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const randomOrderId = `TS-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderSummary = {
        orderId: randomOrderId,
        customer: formData,
        items: checkoutItems,
        totalPrice,
        shippingFee,
        discount: appliedDiscount,
        finalPrice,
        createdAt: new Date().toISOString(),
      };
      sessionStorage.setItem('latest_order', JSON.stringify(orderSummary));

      // XỬ LÝ PHÂN BIỆT KHI HOÀN TẤT:
      if (isBuyNow) {
        // Nếu là Mua ngay: chỉ xóa session buy_now, KHÔNG đụng đến giỏ hàng chính
        sessionStorage.removeItem('buy_now_item');
      } else {
        // Nếu là thanh toán từ giỏ hàng: xóa sạch giỏ hàng
        cart.clearCart();
      }

      router.push(`/shop/checkout/success?orderId=${randomOrderId}`);
    }, 1000);
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Truck className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">Không có món hàng nào để thanh toán</h1>
          <p className="mt-2 text-sm text-slate-500">
            Hãy quay lại cửa hàng để chọn sản phẩm nhé!
          </p>
          <Link
            href="/shop/products"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb điều hướng */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={isBuyNow ? '/shop/products' : '/cart'}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-4 w-4" /> {isBuyNow ? 'Quay lại cửa hàng' : 'Quay lại giỏ hàng'}
          </Link>
          {isBuyNow && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Thanh toán nhanh (Mua ngay)
            </span>
          )}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Thanh toán bảo mật 256-bit</span>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* Form người nhận & thanh toán (7 cột) */}
            <div className="space-y-6 lg:col-span-7">
              {/* 1. Thông tin giao hàng */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                    1
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Thông tin người nhận</h2>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Nguyễn Văn A"
                      className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                        formErrors.fullName
                          ? 'border-rose-500 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0912 345 678"
                      className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                        formErrors.phone
                          ? 'border-rose-500 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {formErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Tỉnh / Thành phố
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500"
                    >
                      <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Hà Nội">TP. Hà Nội</option>
                      <option value="Đà Nẵng">TP. Đà Nẵng</option>
                      <option value="Cần Thơ">TP. Cần Thơ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Quận / Huyện <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Quận 1, Bình Thạnh..."
                      className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                        formErrors.district
                          ? 'border-rose-500 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Địa chỉ cụ thể <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Số nhà, tên đường, phường..."
                      className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                        formErrors.address
                          ? 'border-rose-500 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Ghi chú giao hàng
                    </label>
                    <textarea
                      name="note"
                      rows={2}
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Giao giờ hành chính, gọi trước khi đến..."
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Phương thức thanh toán */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                    2
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Phương thức thanh toán</h2>
                </div>

                <div className="mt-6 space-y-3">
                  <label
                    className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all ${
                      formData.paymentMethod === 'COD'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={() => setFormData((prev) => ({ ...prev, paymentMethod: 'COD' }))}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-emerald-600" />
                        <span className="font-semibold text-slate-900">
                          Thanh toán khi nhận hàng (COD)
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Thanh toán tiền mặt cho bưu tá khi nhận kiện hàng.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all ${
                      formData.paymentMethod === 'VIETQR'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="VIETQR"
                      checked={formData.paymentMethod === 'VIETQR'}
                      onChange={() => setFormData((prev) => ({ ...prev, paymentMethod: 'VIETQR' }))}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-slate-900">
                          Chuyển khoản VietQR 24/7
                        </span>
                        <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                          Khuyên dùng
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Quét mã QR chuyển khoản tự động qua mọi app ngân hàng.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Cột tóm tắt đơn hàng (5 cột) */}
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">Đơn hàng thanh toán</h2>
                  <span className="text-xs font-semibold text-slate-500">
                    {totalItems} sản phẩm
                  </span>
                </div>

                <div className="mt-4 max-h-72 divide-y divide-slate-100 overflow-y-auto pr-1">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3">
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                        <Image
                          src={item.product.thumbnail}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-700 px-1 text-[9px] font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {item.product.name}
                        </p>
                        {item.variant && (
                          <p className="text-[11px] text-slate-400">
                            Loại: {item.variant.value}
                          </p>
                        )}
                        <p className="text-xs font-bold text-slate-700">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mã giảm giá */}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Mã giảm giá (thử: TECHSTORE50)"
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs uppercase outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {couponError && <p className="mt-1.5 text-xs text-rose-500">{couponError}</p>}
                  {couponSuccess && (
                    <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {couponSuccess}
                    </p>
                  )}
                </div>

                {/* Tiền thanh toán */}
                <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-slate-900">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển</span>
                    <span>{shippingFee === 0 ? <span className="font-semibold text-emerald-600">Miễn phí</span> : formatPrice(shippingFee)}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(appliedDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-3 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-slate-900">Tổng thanh toán</span>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-blue-600">
                        {formatPrice(finalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-75"
                >
                  {isSubmitting ? 'Đang tạo đơn hàng...' : 'Xác nhận Đặt hàng ngay'}
                </button>

                <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Cam kết chính hãng 100%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">Đang tải trang thanh toán...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}