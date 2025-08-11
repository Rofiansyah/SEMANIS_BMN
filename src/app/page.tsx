'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import logoSemantis from './logo_semantis.png';



export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div className="w-full max-w-md space-y-8">
    {/* Card Container */}
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="relative flex flex-col items-center">
          <img
            src={typeof logoSemantis === 'string' ? logoSemantis : logoSemantis.src}
            alt="Semantis BMN Logo"
            className="w-64 sm:w-68 h-auto mx-auto"
            onLoad={() => console.log('Logo berhasil dimuat')}
            onError={(e) => {
              console.error('Logo gagal dimuat');
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          {/* Fallback Logo */}
          <div
            className="hidden w-28 sm:w-32 h-16 bg-blue-900 text-white text-sm font-bold rounded-lg items-center justify-center"
          >
            SEMANIS BMN
          </div>
        </div>
      </div>

      {/* Pilih Akun */}
      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Pilih Akun
        </h3>
        <p className="text-gray-600 text-sm sm:text-base">
          Login sebagai siapa?
        </p>
      </div>

      {/* Buttons */}
      <div className="mt-6 space-y-3">
        <Button
          variant="outline"
          className="w-full h-12 text-gray-700 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
          onClick={() => router.push('/login/admin')}
        >
          Admin
        </Button>

        <Button
          className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white transition-colors duration-200"
          onClick={() => router.push('/login/user')}
        >
          User
        </Button>
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