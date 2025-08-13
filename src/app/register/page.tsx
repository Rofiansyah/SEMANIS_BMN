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
<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div className="w-full max-w-md space-y-8">
    {/* Card */}
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/login/user"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm transition-colors duration-200"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke login
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
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Register</h3>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First name <span className="text-red-500">*</span>
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              placeholder="Enter your first name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last name <span className="text-red-500">*</span>
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              placeholder="Enter your last name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone no. <span className="text-red-500">*</span>
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="Enter your phone"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <Input
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

        {/* Terms Checkbox */}
        <div className="flex items-center">
          <input
            id="agreeTerms"
            name="agreeTerms"
            type="checkbox"
            checked={formData.agreeTerms}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-950 focus:ring-blue-800 border-gray-300 rounded"
          />
          <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
            I agree to all terms, privacy policies, and fees
          </label>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200"
          loading={loading}
          disabled={
            !formData.email ||
            !formData.password ||
            !formData.firstName ||
            !formData.lastName ||
            !formData.phone ||
            !formData.agreeTerms
          }
        >
          {loading ? 'Sign up...' : 'Sign up'}
        </Button>
      </form>

      {/* Login Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login/user"
            className="text-blue-900 hover:text-blue-950 underline font-medium"
          >
            Log in
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