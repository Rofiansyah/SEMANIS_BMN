'use client';

import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Package, Building, Tag, Search, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalBarang: 0,
    totalKategori: 0,
    totalLokasi: 0,
    myPeminjaman: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isAdmin) {
      router.push('/admin/dashboard');
    } else if (user && !isAdmin) {
      fetchUserStats();
    }
  }, [user, isAdmin, router]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const [barangRes, kategoriRes, lokasiRes, peminjamanRes] = await Promise.all([
        api.get('/barang'),
        api.get('/kategori'),
        api.get('/lokasi'),
        api.get('/peminjaman/my-requests').catch(() => ({ data: { data: [] } }))
      ]);

      const barangData = barangRes.data.data.items || barangRes.data.data || [];
      const kategoriData = kategoriRes.data.data.items || kategoriRes.data.data || [];
      const lokasiData = lokasiRes.data.data.items || lokasiRes.data.data || [];
      const peminjamanData = peminjamanRes.data.data || peminjamanRes.data || [];

      setStats({
        totalBarang: barangData.length,
        totalKategori: kategoriData.length,
        totalLokasi: lokasiData.length,
        myPeminjaman: peminjamanData.filter((p: { status: string }) => p.status === 'DIPINJAM').length
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast.error('Gagal memuat statistik dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (isAdmin) {
    return <div>Redirecting to admin dashboard...</div>;
  }

  return (
    <DashboardLayout title="Dashboard User">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selamat datang, {user.nama}
          </h2>
          <p className="text-gray-600">
            Akses informasi inventaris dan kelola data barang
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Barang</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '-' : stats.totalBarang}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Tag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kategori Tersedia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '-' : stats.totalKategori}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lokasi Tersedia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '-' : stats.totalLokasi}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <History className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Peminjaman Aktif</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '-' : stats.myPeminjaman}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Menu Utama
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                onClick={() => router.push('/user/search')}
                className="flex items-center justify-center gap-2 h-24"
              >
                <Search size={20} />
                <span>Cari Barang</span>
              </Button>
              
              <Button 
                onClick={() => router.push('/user/status')}
                variant="secondary" 
                className="flex items-center justify-center gap-2 h-24"
              >
                <Package size={20} />
                <span>Status Peminjaman</span>
              </Button>
              
              <Button 
                onClick={() => router.push('/user/history')}
                variant="secondary" 
                className="flex items-center justify-center gap-2 h-24"
              >
                <History size={20} />
                <span>Riwayat Peminjaman</span>
              </Button>
            </div>
          </div>
        </div>
        
      </div>
    </DashboardLayout>
  );
}