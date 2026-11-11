// src/context/AuthContext.tsx
'use client'; // Đánh dấu Client Component vì sử dụng Context, hooks và localStorage

import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { UserProfile, StoredUserAccount } from '@/types/auth';

// Định nghĩa giao diện TypeScript cho các hàm và dữ liệu Context cung cấp
interface AuthContextType {
  currentUser: UserProfile | null; // Thông tin người dùng đang đăng nhập (hoặc null nếu là khách vãng lai)
  register: (name: string, email: string, password: string, phone?: string) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

// Khởi tạo React Context với giá trị ban đầu là undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 1. CÁC HÀM PHỤC VỤ useSyncExternalStore ---

// Lắng nghe sự kiện 'storage' của trình duyệt
// Mục đích: Khi người dùng mở 2 tab, nếu đăng nhập/đăng xuất ở tab 1 thì tab 2 tự động cập nhật theo ngay lập tức
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

// Hàm đọc dữ liệu Client-side: Lấy chuỗi JSON người dùng hiện tại từ localStorage
function getCurrentUserSnapshot(): string {
  if (typeof window === 'undefined') return ''; // Đảm bảo an toàn khi chạy trên môi trường Node.js (Build time)
  return localStorage.getItem('techstore_current_user') || '';
}

// Hàm đọc dữ liệu Server-side: Trả về rỗng khi Server thực hiện Server-Side Rendering (SSR)
function getServerSnapshot(): string {
  return '';
}

// --- 2. COMPONENT PROVIDER CHÍNH ---

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Đọc snapshot an toàn: Đồng bộ dữ liệu mà không cần gọi setState trong useEffect (tránh cascading render)
  const rawCurrentUser = useSyncExternalStore(subscribe, getCurrentUserSnapshot, getServerSnapshot);

  // Parse chuỗi JSON thành object UserProfile
  let currentUser: UserProfile | null = null;
  if (rawCurrentUser) {
    try {
      currentUser = JSON.parse(rawCurrentUser);
    } catch {
      currentUser = null;
    }
  }

  // Hàm tiện ích: Đọc danh sách tất cả các tài khoản đã đăng ký trong máy
  const getStoredAccounts = (): StoredUserAccount[] => {
    try {
      return JSON.parse(localStorage.getItem('techstore_accounts') || '[]');
    } catch {
      return [];
    }
  };

  // Hàm xử lý Đăng ký tài khoản mới
  const register = (name: string, email: string, password: string, phone?: string) => {
    const accounts = getStoredAccounts();
    const cleanEmail = email.trim().toLowerCase();

    // Kiểm tra xem email đã tồn tại trong danh sách tài khoản chưa
    if (accounts.some((acc) => acc.email === cleanEmail)) {
      return { success: false, error: 'Email này đã được sử dụng.' };
    }

    // Tạo đối tượng tài khoản mới kèm mật khẩu
    const newUser: StoredUserAccount = {
      id: `usr_${Date.now()}`, // Tạo ID duy nhất theo mốc thời gian
      fullName: name.trim(),
      email: cleanEmail,
      phone: phone?.trim(),
      passwordHash: password, // Mật khẩu mô phỏng lưu client
      createdAt: new Date().toISOString(),
    };

    // Lưu tài khoản mới vào mảng danh sách tài khoản
    const updatedAccounts = [...accounts, newUser];
    localStorage.setItem('techstore_accounts', JSON.stringify(updatedAccounts));

    // Sau khi đăng ký thành công, tự động đăng nhập luôn
    // Bóc tách bỏ trường passwordHash trước khi lưu vào currentUser để bảo mật
    const { passwordHash: _, ...safeUser } = newUser;
    localStorage.setItem('techstore_current_user', JSON.stringify(safeUser));

    // Bắn sự kiện storage để giao diện toàn trang lập tức nhận diện trạng thái mới
    window.dispatchEvent(new Event('storage'));

    return { success: true };
  };

  // Hàm xử lý Đăng nhập
  const login = (email: string, password: string) => {
    const accounts = getStoredAccounts();
    const cleanEmail = email.trim().toLowerCase();

    // Tìm kiếm tài khoản khớp đúng cả email và mật khẩu
    const account = accounts.find((acc) => acc.email === cleanEmail);
    if (!account || account.passwordHash !== password) {
      return { success: false, error: 'Email hoặc mật khẩu không chính xác.' };
    }

    // Đăng nhập thành công: Lưu user (đã lược bỏ mật khẩu) vào key techstore_current_user
    const { passwordHash: _, ...safeUser } = account;
    localStorage.setItem('techstore_current_user', JSON.stringify(safeUser));
    window.dispatchEvent(new Event('storage'));

    return { success: true };
  };

  // Hàm Đăng xuất: Xóa session tài khoản hiện tại và bắn sự kiện cập nhật
  const logout = () => {
    localStorage.removeItem('techstore_current_user');
    window.dispatchEvent(new Event('storage'));
  };

  // Hàm Cập nhật thông tin hồ sơ (Tên, SĐT, Địa chỉ...)
  const updateProfile = (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    localStorage.setItem('techstore_current_user', JSON.stringify(updated));

    // Đồng bộ lại thông tin mới vào mảng danh sách accounts
    const accounts = getStoredAccounts();
    const updatedAccounts = accounts.map((acc) =>
      acc.id === currentUser?.id ? { ...acc, ...data } : acc
    );
    localStorage.setItem('techstore_accounts', JSON.stringify(updatedAccounts));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    // Truyền dữ liệu và các hàm thao tác xuống các component con
    <AuthContext.Provider value={{ currentUser, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook tùy biến giúp các component con lấy dữ liệu Auth một cách tiện lợi và an toàn
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}