'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import logoSemantis from './logo_semantis.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
      toast.success('Email reset password berhasil dikirim!');
    } catch (error: unknown) {
      console.error('Failed to send reset email:', error);
      const errorMessage = (error as {response?: {data?: {message?: string}}})?.response?.data?.message || 'Gagal mengirim email reset password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div className="w-full max-w-md space-y-8">
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
      {/* Logo */}
      <div className="mb-6">
        <img
          src={typeof logoSemantis === 'string' ? logoSemantis : logoSemantis.src}
          alt="SEMANTIS BMN Logo"
          className="mx-auto w-40 sm:w-48 h-auto object-contain"
        />
      </div>

      {/* Success Icon */}
      <div className="flex justify-center mb-4">
        <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-green-500 animate-bounce" />
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">Email Terkirim!</h3>
        <p className="text-gray-600 text-sm sm:text-base">
          Kami telah mengirimkan instruksi reset password ke email{" "}
          <strong>{email}</strong>
        </p>
        <p className="text-gray-500 text-xs sm:text-sm">
          Periksa inbox dan folder spam Anda.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <Link href="/login/user">
          <Button className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white text-base font-medium">
            Kembali ke Login
          </Button>
        </Link>
        <button
          onClick={() => {
            setSuccess(false);
            setEmail('');
          }}
          className="w-full text-sm sm:text-base text-gray-600 hover:text-gray-800 underline"
        >
          Kirim ulang email
        </button>
      </div>
    </div>

    {/* Footer */}
    <div className="text-center text-xs sm:text-sm text-gray-500">
      <p>© 2025 SEMANIS BMN. All rights reserved.</p>
    </div>
  </div>
</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div className="w-full max-w-md space-y-8">
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          href="/login/user" 
          className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke login
        </Link>
      </div>

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center">
          <img
            src={typeof logoSemantis === 'string' ? logoSemantis : logoSemantis.src}
            alt="SEMANTIS BMN Logo"
            className="object-contain w-100 max-h-104"
          />
        </div>
      </div>

      {/* Forgot Password */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Lupa Password
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Masukkan email Anda dan kami akan mengirimkan instruksi untuk reset password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-950 hover:bg-blue-900 text-white rounded-lg"
            loading={loading}
            disabled={!email}
          >
            {loading ? 'Mengirim...' : 'Kirim Instruksi Reset'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Ingat password Anda?{' '}
            <Link href="/login/user" className="text-blue-900 hover:text-blue-950 underline">
              Kembali ke login
            </Link>
          </p>
        </div>
      </div>
    </div>

    <div className="text-center text-xs text-gray-500">
      <p>© 2025 SEMANIS BMN. All rights reserved.</p>
    </div>
  </div>
</div>

  );
}