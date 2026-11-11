// src/types/product.ts

export type ProductBadge = 'Bán chạy' | 'Mới ra mắt' | 'Giảm sâu' | 'Khuyên dùng' | null;

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  colorHex?: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryName: string;
  brand: string;
  badge: string;
  featured: boolean;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  stock: number;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  description: string;
  thumbnail: string;
  images: string[];
  variants: ProductVariant[];
  specifications: Record<string, string>;
}

// src/types/product.ts

export interface Category {
  id: string;               // Mã định danh dùng cho URL query (?category=audio)
  name: string;             // Tên hiển thị tiếng Việt
  slug: string;             // Đường dẫn URL thân thiện
  description?: string;     // Mô tả ngắn cho danh mục
  iconName: string;         // Tên icon đại diện từ thư viện lucide-react
  image?: string;           // Ảnh banner/thumbnail của danh mục
  itemCount: number;        // Số lượng sản phẩm hiện có
  isFeatured?: boolean;     // Hiển thị ở mục nổi bật trang chủ
}