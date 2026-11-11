// src/components/modules/product/ProductDetailsClient.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { Product, ProductVariant } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import { useCart } from '../../../app/context/CartContext';
import { CartItem } from '@/types/cart';
import { useRouter } from 'next/navigation';
interface ProductDetailsClientProps {
  product: Product;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  // Quản lý ảnh đang xem
  const [activeImage, setActiveImage] = useState<string>(product.thumbnail || product.images[0]);
  
  // Quản lý biến thể được chọn
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length > 0 ? product.variants[0] : null
  );

  // Quản lý số lượng mua
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);
  const router = useRouter();
  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const updated = prev + delta;
      if (updated < 1) return 1;
      if (updated > product.stock) return product.stock;
      return updated;
    });
  };
 
  // quản lý thêm vào giỏ hàng
  const { addToCart } = useCart();
  // 1. Action: Thêm vào giỏ hàng
  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  // 2. Action: Mua ngay (Thêm vào giỏ và chuyển thẳng tới trang /cart)
  // Xử lý sự kiện "Mua ngay"
  const handleBuyNow = () => {
    // 1. Tạo 1 CartItem tạm thời
    const buyNowItem: CartItem = {
      id: `${product.id}-${selectedVariant ? selectedVariant.id : 'default'}`,
      product,
      variant: selectedVariant,
      quantity,
    };

    // 2. Lưu vào sessionStorage riêng biệt (không ảnh hưởng tới giỏ hàng chính)
    sessionStorage.setItem('buy_now_item', JSON.stringify(buyNowItem));

    // 3. Chuyển hướng thẳng tới checkout kèm tham số nhận diện ?buyNow=true
    router.push('/shop/checkout?buyNow=true');
  };


  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      {/* CỘT TRÁI: ALBUM HÌNH ẢNH */}
      <div className="flex flex-col gap-4">
        {/* Ảnh chính lớn */}
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
              {product.badge}
            </span>
          )}
        </div>

        {/* Thumbnail các ảnh góc cạnh */}
        {product.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  activeImage === img ? 'border-blue-600 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Image src={img} alt={`Ảnh ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CỘT PHẢI: THÔNG TIN VÀ NÚT MUA HÀNG */}
      <div className="flex flex-col">
        {/* Thương hiệu & Tên sản phẩm */}
        <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          {product.brand}
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {product.name}
        </h1>

        {/* Đánh giá & Kho hàng */}
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center text-amber-400">
            <Star className="h-4 w-4 fill-amber-400" />
            <span className="ml-1 text-sm font-bold text-slate-800">{product.rating}</span>
            <span className="ml-1 text-xs text-slate-400">({product.reviewCount} đánh giá)</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className={`text-xs font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : 'Hết hàng'}
          </span>
        </div>

        {/* Giá bán */}
        <div className="mt-6 flex items-baseline gap-3 rounded-2xl bg-slate-100/70 p-4">
          <span className="text-3xl font-extrabold text-slate-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-base text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="rounded-lg bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-600">
                Tiết kiệm {product.discountPercentage}%
              </span>
            </>
          )}
        </div>

        {/* Mô tả ngắn */}
        <p className="mt-6 text-sm leading-relaxed text-slate-600">
          {product.shortDescription}
        </p>

        {/* Chọn biến thể (nếu có) */}
        {product.variants.length > 0 && (
          <div className="mt-6">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {product.variants[0].name}: <span className="font-medium text-slate-500">{selectedVariant?.value}</span>
            </label>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {v.colorHex && (
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: v.colorHex }}
                      />
                    )}
                    <span>{v.value}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bộ chọn số lượng */}
        <div className="mt-6 flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Số lượng:</span>
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Giảm số lượng"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-slate-800">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Tăng số lượng"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Nút Kêu gọi hành động (Call To Action) */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-3.5 text-sm font-bold transition-all active:scale-[0.98] ${
              isAdded
                ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                : 'border-blue-600 bg-white text-blue-600 hover:bg-blue-50'
            } ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
            {isAdded ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                Đã thêm vào giỏ!
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                Thêm vào giỏ
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            Mua ngay
          </button>
        </div>

        {/* Chính sách bán hàng & Cam kết */}
        <div className="mt-8 grid grid-cols-1 gap-3 border-t border-slate-200/80 pt-6 sm:grid-cols-3">
          <div className="flex items-center gap-2.5 text-slate-600">
            <Truck className="h-5 w-5 text-blue-600" />
            <span className="text-xs">Giao hàng hỏa tốc 2H</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <span className="text-xs">Bảo hành chính hãng 12T</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <span className="text-xs">Đổi mới trong 7 ngày</span>
          </div>
        </div>
      </div>
    </div>
  );
}