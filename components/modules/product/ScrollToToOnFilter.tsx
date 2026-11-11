// src/components/modules/product/ScrollToTopOnFilter.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

interface ScrollToTopOnFilterProps {
  /** ID của phần tử muốn cuộn tới (mặc định: 'product-list-container') */
  targetId?: string;
}

export default function ScrollToTopOnFilter({
  targetId = 'product-list-container',
}: ScrollToTopOnFilterProps) {
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Bỏ qua lần render đầu tiên khi mới tải trang
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Cuộn tới vị trí danh sách sản phẩm
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      // Cách 1: Cuộn tới vùng danh sách sản phẩm, chừa khoảng cách cho Header cố định (offset 80px)
      const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - 80;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    } else {
      // Cách 2: Nếu không tìm thấy target, cuộn hẳn lên đỉnh trang
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [searchParams, targetId]);

  return null; // Component chức năng, không hiển thị giao diện
}