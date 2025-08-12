'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/forms';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import logoSemantis from './logo_semantis.png';

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleLoginSubmit = async (email: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('Attempting admin login with:', { email });
      const loginResult = await login(email, password);
      console.log('Login successful, result:', loginResult);
      
      // Pastikan hanya admin yang bisa login di halaman ini
      if (loginResult.role !== 'ADMIN') {
        setError('Akses ditolak. Hanya admin yang dapat login di halaman ini.');
        return;
      }
      
      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('Redirecting to admin dashboard');
      window.location.href = '/admin/dashboard';
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      if (error && typeof error === 'object') {
        if ('response' in error) {
          const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
          errorMessage = axiosError.response?.data?.message || axiosError.message || 'Login failed';
        } else if ('message' in error) {
          errorMessage = (error as Error).message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div className="w-full max-w-md space-y-8">
    {/* Card */}
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke pilihan akun
        </Link>
      </div>

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center">
          <img
            src={typeof logoSemantis === 'string' ? logoSemantis : logoSemantis.src}
            alt="SEMANTIS BMN Logo"
            className="w-100 sm:w-104 h-auto max-h-28 object-contain"
          />
        </div>
      </div>

      {/* Login Form */}
      <LoginForm
        onSubmit={handleLoginSubmit}
        loading={loading}
        error={error}
        title="Login Admin"
        emailPlaceholder="Enter your email"
        passwordPlaceholder="Enter your password"
      />
    </div>

    {/* Footer */}
    <div className="text-center text-xs sm:text-sm text-gray-500">
      © 2025 SEMANIS BMN. All rights reserved.
    </div>
  </div>
</div>

  );
}