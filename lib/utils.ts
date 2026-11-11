// src/lib/utils.ts

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Loại bỏ toàn bộ dấu tiếng Việt và chuyển về chữ thường
 * Ví dụ: "Đồng Hồ Thông Minh" -> "dong ho thong minh"
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';

  return str
    .normalize('NFD') // Tách các ký tự có dấu thành ký tự gốc + dấu rời
    .replace(/[\u0300-\u036f]/g, '') // Xóa toàn bộ các ký tự dấu rời
    .replace(/[đĐ]/g, (char) => (char === 'đ' ? 'd' : 'D')) // Xử lý riêng chữ đ/Đ
    .toLowerCase()
    .trim();
}