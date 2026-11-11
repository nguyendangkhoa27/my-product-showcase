// src/app/shop/products/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { mockProducts } from '@/data/mockProducts';
import ProductCard from '@/components/modules/product/ProductCard';
import { Product } from '@/types/product';
import { removeVietnameseTones } from '@/lib/utils';
import ProductSortSelect from '@/components/modules/product/ProductSortSelecte';
import ProductFilterSidebar from '@/components/modules/product/ProductFilterSideBar';
import ScrollToTopOnFilter from '@/components/modules/product/ScrollToToOnFilter';
import Pagination from '@/components/common/Pagination';

export const metadata: Metadata = {
  title: 'Danh sách sản phẩm | Cửa hàng công nghệ',
  description: 'Khám phá tất cả các thiết bị công nghệ chính hãng.',
};
const ITEMS_PER_PAGE = 9; // 6 sản phẩm mỗi trang (với 24 sản phẩm sẽ có 4 trang)
interface ProductsPageProps {
  searchParams: Promise<{
    productName? :string;
    category?: string;
    sort?: string;
    minPrice: string;
    maxPrice: string;
    rating: string;
    page: number;
  }>;
}

// 1. Component con: Chịu trách nhiệm AWAIT searchParams bên trong Suspense
async function ProductList({ searchParams }: ProductsPageProps) {
  // Await searchParams an toàn tại đây vì component này đã được Suspense bảo vệ
  const resolvedParams = await searchParams;
  const currentProductName = resolvedParams.productName || "";
  const currentCategory = resolvedParams.category || 'all';
  const currentSort = resolvedParams.sort || 'featured';
  const minPrice = resolvedParams.minPrice ? Number(resolvedParams.minPrice) : null;
  const maxPrice = resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : null;
  const searchKeyword = removeVietnameseTones(currentProductName.toLowerCase());
  const ratingThreshold = resolvedParams.rating ? Number(resolvedParams.rating) : null;
  // Xử lý trang hiện tại
  const currentPage = Math.max(1, Number(resolvedParams.page) || 1);
  const filteredProducts: Product[] = mockProducts.filter((product) => {
      // 1. Kiểm tra danh mục (nếu là 'all' hoặc rỗng thì luôn thỏa mãn)
      const matchesCategory =
        !currentCategory || currentCategory === 'all' || product.category === currentCategory;
      // 2. Kiểm tra từ khóa tìm kiếm (nếu không nhập thì luôn thỏa mãn)
      const cleanProductName = removeVietnameseTones(product.name.toLowerCase());
      const matchesSearch =
        !searchKeyword ? true :  cleanProductName.includes(searchKeyword);
      // 3. Kiểm tra theo khoảng giá
      const matchesMinPrice = minPrice === null || product.price >= minPrice;
        const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;
      // 4. Lọc theo số sao
        const matchesRating = ratingThreshold === null || product.rating >= ratingThreshold;
        // Sản phẩm phải thỏa mãn CẢ HAI điều kiện
      return (
        matchesCategory && 
        matchesSearch && 
        matchesMinPrice && 
        matchesMaxPrice && 
        matchesRating);
    });

    if (currentSort === 'price-asc') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'rating') {
      filteredProducts.sort((a, b) => b.rating - a.rating);
    }
    // 3. Tính toán phân trang
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  return (
    <>
      {/* Thanh hiển thị kết quả và bộ chọn sắp xếp */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Tìm thấy <span className="font-semibold text-slate-900">{filteredProducts.length}</span> sản phẩm phù hợp
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sắp xếp theo:</span>
          <ProductSortSelect currentSort={currentSort} />
        </div>
      </div>

      {/* Lưới hiển thị thẻ sản phẩm */}
      {paginatedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Thanh phân trang */}
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-lg font-medium text-slate-700">Không có sản phẩm nào phù hợp</p>
          <p className="mt-1 text-sm text-slate-400">
            Hãy thử điều chỉnh lại mức giá hoặc xóa các bộ lọc hiện tại.
          </p>
          <Link
            href="/shop/products"
            className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Xóa tất cả bộ lọc
          </Link>
        </div>
      )}
    </>
  );
}

// 2. Khung Skeleton tải trang tạm thời
function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
      ))}
    </div>
  );
}

// 3. Component Page chính: BỎ 'async', KHÔNG await ở đây
export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      {/* Component lắng nghe thay đổi searchParams và tự cuộn */}
      <Suspense fallback={null}>
        <ScrollToTopOnFilter targetId="product-list-container" />
      </Suspense>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* BỐ CỤC 2 CỘT: TRÁI LÀ FILTER, PHẢI LÀ SẢN PHẨM */}
        <div className="flex flex-col gap-8 md:flex-row items-start">
          {/* CỘT TRÁI: Left Tabbar / Filter Sidebar (Ghim cố định khi cuộn) */}
          <div className="w-full md:w-64 md:sticky md:top-20 flex-shrink-0">
            <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200" />}>
              <ProductFilterSidebar />
            </Suspense>
          </div>

          {/* CỘT PHẢI: Danh sách sản phẩm */}
          <div className="flex-1 w-full">
            <Suspense fallback={<ProductListSkeleton />}>
              <ProductList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}