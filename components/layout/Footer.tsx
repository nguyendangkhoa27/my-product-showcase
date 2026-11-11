// src/components/layout/Footer.tsx
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Cột thương hiệu */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-md shadow-blue-500/20">
                K
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Tech<span className="text-blue-600">Store</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-slate-500 leading-relaxed">
              Hệ sinh thái phụ kiện âm thanh, thiết bị đeo thông minh và đồ chơi công nghệ chính hãng hàng đầu Việt Nam.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                <span>123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Hotline: 1900 6868 (8:00 - 21:00)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Email: support@techstore.vn</span>
              </div>
            </div>
          </div>

          {/* Cột danh mục sản phẩm */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Danh mục
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/shop/products?category=audio" className="hover:text-blue-600 transition">
                  Tai nghe & Loa
                </Link>
              </li>
              <li>
                <Link href="/shop/products?category=smartwatch" className="hover:text-blue-600 transition">
                  Đồng hồ thông minh
                </Link>
              </li>
              <li>
                <Link href="/shop/products?category=accessories" className="hover:text-blue-600 transition">
                  Phụ kiện cáp sạc
                </Link>
              </li>
              <li>
                <Link href="/shop/products" className="hover:text-blue-600 transition">
                  Tất cả sản phẩm
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột chính sách */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Chính sách
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition">
                  Chính sách bảo hành 12T
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition">
                  Đổi trả trong 7 ngày
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition">
                  Vận chuyển & Giao nhận
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition">
                  Phương thức thanh toán
                </span>
              </li>
            </ul>
          </div>

          {/* Cột hỗ trợ khách hàng */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Hỗ trợ
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/cart" className="hover:text-blue-600 transition">
                  Kiểm tra giỏ hàng
                </Link>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition">
                  Tra cứu đơn hàng
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition">
                  Trung tâm trợ giúp
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© 2026 TechStore. Tất cả các quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Điều khoản dịch vụ</span>
            <span>•</span>
            <span className="hover:text-slate-600 cursor-pointer">Bảo mật thông tin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}