// src/components/modules/product/ProductCard.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingBag } from 'lucide-react';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import { useCart } from '../../../app/context/CartContext';
interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { addToCart } = useCart();
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Ngăn click nhầm vào thẻ Link chuyển trang
    addToCart(product, 1, null);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300">
      {/* Badge khuyến mãi / nổi bật */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        {product.badge && (
          <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            {product.badge}
          </span>
        )}
        {product.discountPercentage > 0 && (
          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
            -{product.discountPercentage}%
          </span>
        )}
      </div>

      {/* Ảnh sản phẩm */}
      <Link href={`/shop/products/${product.slug}`} className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <Image
          src={product.thumbnail}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Nội dung thông tin */}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {product.brand}
        </span>

        <h3 className="mt-1 line-clamp-2 text-base font-bold text-slate-800 transition-colors group-hover:text-blue-600">
          <Link href={`/shop/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

        {/* Đánh giá sao */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center text-amber-400">
            <Star className="h-4 w-4 fill-amber-400" />
            <span className="ml-1 text-xs font-semibold text-slate-700">{product.rating}</span>
          </div>
          <span className="text-xs text-slate-400">({product.reviewCount})</span>
        </div>

        {/* Khối giá & Nút mua hàng */}
        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
          <div>
            <div className="text-lg font-bold text-slate-900">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice > product.price && (
              <div className="text-xs text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          <button
           onClick={handleAddToCart}
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all hover:bg-blue-600 hover:text-white active:scale-95"
            aria-label="Thêm vào giỏ hàng"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}