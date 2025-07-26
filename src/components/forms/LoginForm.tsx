'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
  title?: string;
  emailPlaceholder?: string;
  passwordPlaceholder?: string;
}

interface FormData {
  email: string;
  password: string;
}

export function LoginForm({ 
  onSubmit, 
  loading = false, 
  error = '', 
  title = 'Login Admin',
  emailPlaceholder = 'Enter your email',
  passwordPlaceholder = 'minimum 8 characters'
}: LoginFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData.email, formData.password);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      {/* Form Title */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
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
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder={emailPlaceholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password*
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            placeholder={passwordPlaceholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-md transition-colors duration-200"
          loading={loading}
          disabled={!formData.email || !formData.password}
        >
          {loading ? 'Login...' : 'Login'}
        </Button>
      </form>
    </>
  );
}