'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { peminjamanApi } from '@/lib/api';
import type { Peminjaman } from '@/types/api';
import { 
  ArrowLeft,
  User,
  Package,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Camera,
  Download,
  Phone,
  Mail,
  MapPin,
  Tag,
  Building,
  RotateCcw
} from 'lucide-react';

interface PeminjamanDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DIPINJAM: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  RETURNED: 'bg-blue-100 text-blue-800 border-blue-200',
  DIKEMBALIKAN: 'bg-blue-100 text-blue-800 border-blue-200'
};

const statusIcons = {
  PENDING: <Clock className="w-4 h-4" />,
  DIPINJAM: <CheckCircle className="w-4 h-4" />,
  REJECTED: <XCircle className="w-4 h-4" />,
  RETURNED: <RotateCcw className="w-4 h-4" />,
  DIKEMBALIKAN: <RotateCcw className="w-4 h-4" />
};

const statusLabels = {
  PENDING: 'Menunggu Persetujuan',
  DIPINJAM: 'Sedang Dipinjam',
  REJECTED: 'Ditolak',
  RETURNED: 'Dikembalikan',
  DIKEMBALIKAN: 'Dikembalikan'
};

export default function PeminjamanDetailPage({ params }: PeminjamanDetailPageProps) {
  const router = useRouter();
  const [peminjaman, setPeminjaman] = useState<Peminjaman | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paramsId, setParamsId] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setParamsId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const loadPeminjamanDetail = useCallback(async () => {
    if (!paramsId) return;
    
    try {
      const response = await peminjamanApi.getById(paramsId);
      console.log('API Response:', response); // Debug log
      
      if (response.status === 'success' && response.data) {
        setPeminjaman(response.data);
      } else {
        setError('Peminjaman tidak ditemukan');
      }
    } catch (error) {
      console.error('Failed to load peminjaman detail:', error);
      setError('Gagal memuat detail peminjaman');
    } finally {
      setLoading(false);
    }
  }, [paramsId]);

  useEffect(() => {
    loadPeminjamanDetail();
  }, [loadPeminjamanDetail]);

  const handleBack = () => {
    router.push('/admin/peminjaman/requests');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Belum tersedia';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysBetween = (startDate: string, endDate?: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <DashboardLayout title="Detail Peminjaman">
        <div className="flex items-center justify-center h-64">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <span className="text-gray-600">Memuat detail peminjaman...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !peminjaman) {
    return (
      <DashboardLayout title="Detail Peminjaman">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Peminjaman Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleBack} variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Peminjaman
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Detail Peminjaman - ${peminjaman.barang.nama}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detail Peminjaman</h1>
              <p className="text-gray-600 mt-1">Informasi lengkap peminjaman barang</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full border ${
              statusColors[peminjaman.status]
            }`}>
              {statusIcons[peminjaman.status]}
              <span className="ml-2">{statusLabels[peminjaman.status]}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Timeline Peminjaman</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Request */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Permintaan Dibuat</p>
                      <p className="text-sm text-gray-500">{formatDate(peminjaman.tanggalPengajuan)}</p>
                      <p className="text-sm text-gray-600 mt-1">{peminjaman.catatan}</p>
                    </div>
                  </div>

                  {/* Approval */}
                  {peminjaman.tanggalDisetujui && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Disetujui</p>
                        <p className="text-sm text-gray-500">{formatDate(peminjaman.tanggalDisetujui)}</p>
                        {peminjaman.penanggungJawab && (
                          <p className="text-sm text-gray-600 mt-1">PJ: {peminjaman.penanggungJawab}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Borrowed */}
                  {peminjaman.tanggalDipinjam && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Barang Dipinjam</p>
                        <p className="text-sm text-gray-500">{formatDate(peminjaman.tanggalDipinjam)}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Durasi: {getDaysBetween(peminjaman.tanggalDipinjam, peminjaman.tanggalDikembalikan)} hari
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Returned */}
                  {peminjaman.tanggalDikembalikan && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <RotateCcw className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Barang Dikembalikan</p>
                        <p className="text-sm text-gray-500">{formatDate(peminjaman.tanggalDikembalikan)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Item Details */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Detail Barang</h2>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {peminjaman.barang.fotoUrl ? (
                      <img 
                        src={peminjaman.barang.fotoUrl} 
                        alt={peminjaman.barang.nama}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-medium text-gray-900">{peminjaman.barang.nama}</h3>
                    <p className="text-sm text-gray-600">{peminjaman.barang.deskripsi}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Kode: {peminjaman.barang.kodeBarang}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{peminjaman.barang.kategori.nama}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{peminjaman.barang.merek.nama}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{peminjaman.barang.lokasi.nama}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Photos */}
            {(peminjaman.fotoPinjam || peminjaman.fotoKembali) && (
              <div className="bg-white rounded-lg shadow border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Dokumentasi Foto</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {peminjaman.fotoPinjam && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Foto Peminjaman</h4>
                        <div className="relative">
                          <img
                            src={peminjaman.fotoPinjam}
                            alt="Foto Peminjaman"
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2"
                            onClick={() => window.open(peminjaman.fotoPinjam!, '_blank')}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {peminjaman.fotoKembali && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Foto Pengembalian</h4>
                        <div className="relative">
                          <img
                            src={peminjaman.fotoKembali}
                            alt="Foto Pengembalian"
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2"
                            onClick={() => window.open(peminjaman.fotoKembali!, '_blank')}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Peminjam</h2>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-medium text-gray-900">{peminjaman.user.nama}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{peminjaman.user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{peminjaman.user.nomorhp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Statistik</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tanggal Pengajuan</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(peminjaman.tanggalPengajuan).toLocaleDateString('id-ID')}
                  </span>
                </div>
                
                {peminjaman.tanggalDisetujui && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Waktu Persetujuan</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getDaysBetween(peminjaman.tanggalPengajuan, peminjaman.tanggalDisetujui)} hari
                    </span>
                  </div>
                )}

                {peminjaman.status === 'DIPINJAM' && peminjaman.tanggalDipinjam && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lama Dipinjam</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getDaysBetween(peminjaman.tanggalDipinjam)} hari
                    </span>
                  </div>
                )}

                {peminjaman.tanggalDikembalikan && peminjaman.tanggalDipinjam && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Durasi</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getDaysBetween(peminjaman.tanggalDipinjam, peminjaman.tanggalDikembalikan)} hari
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Aksi</h2>
              </div>
              <div className="p-6 space-y-3">
                <Button variant="outline" className="w-full" onClick={() => router.push(`/admin/barang/${peminjaman.barang.id}`)}>
                  <Package className="w-4 h-4 mr-2" />
                  Lihat Detail Barang
                </Button>
                
                {(peminjaman.fotoPinjam || peminjaman.fotoKembali) && (
                  <Button variant="outline" className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Download Semua Foto
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}