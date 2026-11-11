// src/types/auth.ts
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: string;
}

export interface StoredUserAccount extends UserProfile {
  passwordHash: string; // Mật khẩu mô phỏng lưu client
}