'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import logoSemantis from './logo_semantis.png';



export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src={typeof logoSemantis === 'string' ? logoSemantis : logoSemantis.src}
                  alt="Semantis BMN Logo"
                  style={{ width: '120px', height: 'auto', maxHeight: '64px' }}
                  className="mx-auto"
                  onLoad={() => console.log('Logo berhasil dimuat')}
                  onError={(e) => {
                    console.error('Logo gagal dimuat');
                    // Hide broken image and show fallback
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div 
                  style={{ 
                    display: 'none',
                    width: '120px', 
                    height: '64px',
                    background: '#1e40af',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  className="flex"
                >
                  SEMANTIS BMN
                </div>
              </div>
            </div>
          </div>

          {/* Pilih Akun Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pilih Akun</h3>
              <p className="text-gray-600 text-sm">Login sebagai siapa?</p>
            </div>

            <div className="space-y-3">
              {/* Admin Button */}
              <Button
                variant="outline"
                className="w-full h-12 text-gray-700 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                onClick={() => router.push('/login/admin')}
              >
                Admin
              </Button>

              {/* User Button */}
              <Button
                className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white"
                onClick={() => router.push('/login/user')}
              >
                User
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>© 2024 SEMANTIS BMN. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}