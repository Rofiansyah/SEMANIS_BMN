'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { 
  Clock, 
  Package, 
  CheckCircle, 
  XCircle, 
  Calendar,
  MapPin,
  Tag,
  Bookmark,
  Eye,
  Filter,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { Peminjaman } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

// ✅ Label untuk tab
const statusLabels: Record<'ALL' | 'PENDING' | 'DIPINJAM' | 'REJECTED' | 'RETURNED', string> = {
  ALL: "Semua",
  PENDING: "Pending",
  DIPINJAM: "Dipinjam",
  REJECTED: "Ditolak",
  RETURNED: 'Dikembalikan'
};

export default function UserStatusPage() {
  const { user } = useAuth();
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'DIPINJAM' | 'REJECTED' | 'RETURNED'>('ALL');

  useEffect(() => {
    if (user) {
      fetchPeminjaman();
    }
  }, [user]);

  const fetchPeminjaman = async () => {
    try {
      setLoading(true);
      const response = await api.get('/peminjaman/my-requests');
      const data = response.data.data || response.data || [];
      setPeminjaman(data);
    } catch (error) {
      console.error('Error fetching peminjaman:', error);
      toast.error('Gagal memuat status peminjaman');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'PENDING': {
        icon: <Clock size={16} />,
        text: 'Menunggu Persetujuan',
        color: 'bg-yellow-100 text-yellow-800',
        bgColor: 'bg-yellow-50'
      },
      'DIPINJAM': {
        icon: <Package size={16} />,
        text: 'Sedang Dipinjam',
        color: 'bg-blue-100 text-blue-800',
        bgColor: 'bg-blue-50'
      },
      'RETURNED': {
        icon: <CheckCircle size={16} />,
        text: 'Dikembalikan',
        color: 'bg-green-100 text-green-800',
        bgColor: 'bg-green-50'
      },
      'REJECTED': {
        icon: <XCircle size={16} />,
        text: 'Ditolak',
        color: 'bg-red-100 text-red-800',
        bgColor: 'bg-red-50'
      }
    };

    return statusMap[status as keyof typeof statusMap] || {
      icon: <AlertCircle size={16} />,
      text: status,
      color: 'bg-gray-100 text-gray-800',
      bgColor: 'bg-gray-50'
    };
  };

  // ✅ Filter logic
  const filteredPeminjaman =
    activeTab === 'ALL'
      ? peminjaman
      : peminjaman.filter(item => item.status === activeTab);

  // ✅ Count logic
  const allCount = peminjaman.length;
  const pendingCount = peminjaman.filter(item => item.status === 'PENDING').length;
  const borrowedCount = peminjaman.filter(item => item.status === 'DIPINJAM').length;
  const rejectedCount = peminjaman.filter(item => item.status === 'REJECTED').length;
  const returnedCount = peminjaman.filter(item => item.status === 'RETURNED').length;


  if (loading) {
    return (
      <DashboardLayout title="Status Peminjaman">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Status Peminjaman">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              activeTab === 'ALL'
                ? 'border-gray-500 bg-gray-100'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('ALL')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Permintaan</p>
                <p className="text-2xl font-bold text-gray-900">{allCount}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-gray-700" />
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              activeTab === 'PENDING'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('PENDING')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menunggu Persetujuan</p>
                <p className="text-2xl font-bold text-yellow-800">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              activeTab === 'DIPINJAM'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('DIPINJAM')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sedang Dipinjam</p>
                <p className="text-2xl font-bold text-blue-800">{borrowedCount}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              activeTab === 'REJECTED'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('REJECTED')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">DITOLAK</p>
                <p className="text-2xl font-bold text-red-800">{rejectedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>   

          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              activeTab === 'RETURNED'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('RETURNED')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">DITOLAK</p>
                <p className="text-2xl font-bold text-green-800">{returnedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>  

        </div>

        

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'ALL'
                  ? 'Semua Peminjaman'
                  : `Peminjaman ${statusLabels[activeTab]}`}
              </h2>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Filter: {activeTab}</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {filteredPeminjaman.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'PENDING' 
                    ? 'Tidak ada permintaan pending'
                    : activeTab === 'DIPINJAM'
                      ? 'Tidak ada barang yang sedang dipinjam'
                      : 'Belum ada permintaan peminjaman'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'PENDING'
                    ? 'Semua permintaan peminjaman Anda sudah diproses'
                    : activeTab === 'DIPINJAM'
                      ? 'Anda belum meminjam barang apapun saat ini'
                      : 'Silakan ajukan peminjaman barang terlebih dahulu'}
                </p>
                <Link href="/dashboard">
                  <Button 
                  className="bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200"
                  >Cari Barang untuk Dipinjam
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPeminjaman.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  
                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border-2 p-6 ${statusInfo.bgColor} border-gray-200`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {item.barang.nama}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                              {statusInfo.icon}
                              {statusInfo.text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 font-mono mb-2">
                            Kode: {item.barang.kodeBarang}
                          </p>
                        </div>
                        <div className="text-right">
                          <Link href={`/user/items/${item.barang.id}`}>
                            <Button size="sm" variant="secondary" className="flex items-center gap-1">
                              <Eye size={14} />
                              Lihat
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Tag size={14} className="mr-2" />
                          <span>{item.barang.kategori?.nama}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Bookmark size={14} className="mr-2" />
                          <span>{item.barang.merek?.nama}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin size={14} className="mr-2" />
                          <span>{item.barang.lokasi?.nama}</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar size={14} className="mr-2" />
                            <span>Diajukan: {new Date(item.tanggalPengajuan).toLocaleDateString('id-ID')}</span>
                          </div>
                          {item.tanggalDisetujui && (
                            <div className="flex items-center text-gray-600">
                              <Calendar size={14} className="mr-2" />
                              <span>Disetujui: {new Date(item.tanggalDisetujui).toLocaleDateString('id-ID')}</span>
                            </div>
                          )}
                          {item.tanggalDipinjam && (
                            <div className="flex items-center text-gray-600">
                              <Calendar size={14} className="mr-2" />
                              <span>Dipinjam: {new Date(item.tanggalDipinjam).toLocaleDateString('id-ID')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.catatan && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Catatan</h4>
                          <p className="text-sm text-gray-600">{item.catatan}</p>
                        </div>
                      )}

                      {item.penanggungJawab && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Penanggung Jawab:</span> {item.penanggungJawab}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
