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
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { Peminjaman } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UserStatusPage() {
  const { user } = useAuth();
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'DIPINJAM'>('PENDING');

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
      
      // Filter only PENDING and DIPINJAM status
      const activePeminjaman = data.filter((item: Peminjaman) => 
        item.status === 'PENDING' || item.status === 'DIPINJAM'
      );
      
      setPeminjaman(activePeminjaman);
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

  const filteredPeminjaman = peminjaman.filter(item => item.status === activeTab);

  const pendingCount = peminjaman.filter(item => item.status === 'PENDING').length;
  const borrowedCount = peminjaman.filter(item => item.status === 'DIPINJAM').length;

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menunggu Persetujuan</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sedang Dipinjam</p>
                <p className="text-2xl font-bold text-gray-900">{borrowedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'PENDING'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Menunggu Persetujuan ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('DIPINJAM')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'DIPINJAM'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sedang Dipinjam ({borrowedCount})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {filteredPeminjaman.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'PENDING' 
                    ? 'Tidak ada permintaan pending'
                    : 'Tidak ada barang yang sedang dipinjam'
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'PENDING'
                    ? 'Semua permintaan peminjaman Anda sudah diproses'
                    : 'Anda belum meminjam barang apapun saat ini'
                  }
                </p>
                <Link href="/dashboard">
                  <Button>Cari Barang untuk Dipinjam</Button>
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