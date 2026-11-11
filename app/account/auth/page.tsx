// src/app/account/auth/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Đọc đường dẫn chuyển tiếp (mặc định về trang chủ '/')
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login, register, currentUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ ĐƯA VÀO useEffect: Chỉ điều hướng SAU KHI component đã render xong
  useEffect(() => {
    if (currentUser) {
      router.push(redirectUrl);
    }
  }, [currentUser, redirectUrl, router]);

  // Nếu đã đăng nhập, render trạng thái loading nhẹ trong khi đợi router chuyển trang
  if (currentUser) {
    return (
      <div className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span>Đang chuyển hướng...</span>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!formData.email.trim() || !formData.password) {
        setError('Vui lòng điền đầy đủ email và mật khẩu.');
        return;
      }
      setIsLoading(true);
      const res = login(formData.email, formData.password);
      setIsLoading(false);

      if (!res.success) {
        setError(res.error || 'Đăng nhập không thành công.');
      } else {
        router.push(redirectUrl);
      }
    } else {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
        setError('Vui lòng nhập họ tên, email và mật khẩu.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Mật khẩu cần ít nhất 6 ký tự.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp.');
        return;
      }

      setIsLoading(true);
      const res = register(formData.fullName, formData.email, formData.password, formData.phone);
      setIsLoading(false);

      if (!res.success) {
        setError(res.error || 'Đăng ký thất bại.');
      } else {
        router.push(redirectUrl);
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
        
        {/* Thanh chuyển đổi tab */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`rounded-xl py-2.5 transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`rounded-xl py-2.5 transition-all ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Tiêu đề & mô tả */}
        <div className="mt-6 text-center">
          <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
            {mode === 'login' ? 'Chào mừng bạn quay lại!' : 'Tạo tài khoản mới'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {mode === 'login'
              ? 'Đăng nhập để xem lịch sử mua sắm và ưu đãi cá nhân.'
              : 'Trải nghiệm hệ thống mua sắm thiết bị công nghệ hiện đại.'}
          </p>
        </div>

        {/* Báo lỗi nếu có */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Biểu mẫu */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Họ và tên
              </label>
              <div className="relative mt-1.5 flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Địa chỉ Email
            </label>
            <div className="relative mt-1.5 flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Số điện thoại
              </label>
              <div className="relative mt-1.5 flex items-center">
                <Phone className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912 345 678"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Mật khẩu
            </label>
            <div className="relative mt-1.5 flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Xác nhận mật khẩu
              </label>
              <div className="relative mt-1.5 flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            <span>{mode === 'login' ? 'Đăng nhập ngay' : 'Đăng ký tài khoản'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Bảo mật thông tin người dùng 100%</span>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-20 text-center text-xs">Đang tải...</div>}>
      <AuthContent />
    </Suspense>
  );
}