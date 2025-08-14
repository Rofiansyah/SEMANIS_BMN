'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import logoSemantis from './logo_semantis.png';

export default function UserLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting user login with:', { email: formData.email });
      const loginResult = await login(formData.email, formData.password);
      console.log('Login successful, result:', loginResult);
      
      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Redirect based on role
      if (loginResult.role === 'ADMIN') {
        console.log('Redirecting to admin dashboard');
        window.location.href = '/admin/dashboard';
      } else {
        console.log('Redirecting to user dashboard');
        window.location.href = '/dashboard';
      }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _setDemoCredentials = () => {
    setFormData({
      email: 'user@example.com',
      password: 'password123',
    });
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
          className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm transition-colors duration-200"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke pilihan akun
        </Link>
      </div>

      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img
          src={typeof logoSemantis === 'string' ? logoSemantis : logoSemantis.src}
          alt="SEMANTIS BMN Logo"
          className="w-100 sm:w-104 h-auto max-h-28 object-contain"
        />
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Login User</h3>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="Enter your email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            placeholder="Enter your password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-900 hover:text-blue-950 underline"
          >
            Lupa password?
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200"
          loading={loading}
          disabled={!formData.email || !formData.password}
        >
          {loading ? 'Login...' : 'Login'}
        </Button>
      </form>

      {/* Register Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="text-blue-900 hover:text-blue-950 underline font-medium"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>

    {/* Footer */}
    <div className="text-center text-xs sm:text-sm text-gray-500">
      © 2025 SEMANIS BMN. All rights reserved.
    </div>
  </div>
</div>
  );
}