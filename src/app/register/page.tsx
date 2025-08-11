'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import logoSemantis from './logo_semantis.png';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.agreeTerms) {
      setError('Anda harus menyetujui syarat dan ketentuan');
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.register({
        email: formData.email,
        nama: `${formData.firstName} ${formData.lastName}`,
        nomorhp: formData.phone,
        password: formData.password,
      });

      if (response.success) {
        setSuccess('Registrasi berhasil! Silakan login dengan akun Anda.');
        setTimeout(() => {
          router.push('/login/user');
        }, 2000);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registrasi gagal'
        : 'Registrasi gagal';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Illustration
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="w-64 h-64 bg-white bg-opacity-20 rounded-lg mb-8 flex items-center justify-center">
            <img
              src={typeof logoSemantis === 'string' ? logoSemantis : logoSemantis.src}
              alt="SEMANTIS BMN Logo"
              style={{ width: '200px', height: 'auto', maxHeight: '200px' }}
              className="object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold mb-4">Bergabung dengan SEMANTIS BMN</h2>
          <p className="text-lg opacity-90">
            Kelola inventaris dengan mudah dan efisien
          </p>
        </div>
      </div> */}

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
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

            {/* Register Title */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900">Register</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your name"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="minimum 8 characters"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone no.
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="minimum 8 characters"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
                  I agree to all terms, privacy policies, and fees
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-md">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white"
                loading={loading}
                disabled={!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.phone || !formData.agreeTerms}
              >
                {loading ? 'Sign up...' : 'Sign up'}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login/user" className="text-blue-600 hover:text-blue-800 underline font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>© 2025 SEMANIS BMN. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}