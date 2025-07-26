'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            {/* Logo */}
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <img
                  src={typeof logoSemantis === 'string' ? logoSemantis : logoSemantis.src}
                  alt="SEMANTIS BMN Logo"
                  style={{ width: '160px', height: 'auto', maxHeight: '120px' }}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Terkirim!</h3>
                <p className="text-gray-600 text-sm">
                  Kami telah mengirimkan instruksi reset password ke email <strong>{email}</strong>
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Periksa inbox dan folder spam Anda.
                </p>
              </div>

              <div className="space-y-3">
                <Link href="/login/user">
                  <Button className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white">
                    Kembali ke Login
                  </Button>
                </Link>
                
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Kirim ulang email
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>© 2025 SEMANIS BMN. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
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
            <div className="flex justify-center mb-4">
              <img
                src={typeof logoSemantis === 'string' ? logoSemantis : logoSemantis.src}
                alt="SEMANTIS BMN Logo"
                style={{ width: '160px', height: 'auto', maxHeight: '120px' }}
                className="object-contain"
              />
            </div>
          </div>

          {/* Forgot Password Form */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lupa Password</h3>
              <p className="text-gray-600 text-sm">
                Masukkan email Anda dan kami akan mengirimkan instruksi untuk reset password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email*
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full"
                  icon={<Mail />}
                />
              </div>

              

              <Button
                type="submit"
                className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white"
                loading={loading}
                disabled={!email}
              >
                {loading ? 'Mengirim...' : 'Kirim Instruksi Reset'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Ingat password Anda?{' '}
                <Link href="/login/user" className="text-blue-600 hover:text-blue-800 underline">
                  Kembali ke login
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>© 2025 SEMANIS BMN. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}