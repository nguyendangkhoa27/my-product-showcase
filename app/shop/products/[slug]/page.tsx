// src/app/shop/products/[slug]/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, mockProducts } from '@/data/mockProducts';
import ProductDetailsClient from '@/components/modules/product/ProductDetailsClient';
import ProductCard from '@/components/modules/product/ProductCard';
interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Giúp Next.js build trước HTML tĩnh cho các sản phẩm đã biết
export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    slug: product.slug,
  }));
}

// 1. Tự động sinh SEO Metadata động theo từng sản phẩm
export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm | TechStore',
    };
  }

  return {
    title: `${product.name} - Giá tốt nhất | TechStore`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [
        {
          url: product.thumbnail,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

// 2. Component con: Chịu trách nhiệm AWAIT params bên trong Suspense
async function ProductDetailContent({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.thumbnail,
    description: product.shortDescription,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb điều hướng */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/shop/products" className="hover:text-blue-600 transition-colors">
          Cửa hàng
        </Link>
        <span>/</span>
        <Link
          href={`/shop/products?category=${product.category}`}
          className="hover:text-blue-600 transition-colors"
        >
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="line-clamp-1 text-slate-800">{product.name}</span>
      </nav>

      {/* Khối thông tin và mua hàng */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
        <ProductDetailsClient product={product} />
      </div>

      {/* Mô tả & Thông số */}
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">Chi tiết sản phẩm</h2>
          <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {product.description}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Thông số kỹ thuật</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between py-3 text-xs sm:text-sm">
                <span className="font-medium text-slate-500">{key}</span>
                <span className="text-right font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sản phẩm tương tự */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Sản phẩm tương tự
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// 3. Khung chờ Skeleton khi chuyển trang
function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-4 w-48 rounded bg-slate-200" />
      <div className="grid grid-cols-1 gap-12 rounded-3xl bg-white p-6 lg:grid-cols-2 sm:p-10">
        <div className="aspect-square rounded-2xl bg-slate-200" />
        <div className="flex flex-col gap-4">
          <div className="h-6 w-24 rounded bg-slate-200" />
          <div className="h-10 w-3/4 rounded bg-slate-200" />
          <div className="h-12 w-1/2 rounded bg-slate-200" />
          <div className="h-24 w-full rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

// 4. Component chính: Đồng bộ (không async), bọc ProductDetailContent trong Suspense
export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetailContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}