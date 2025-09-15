'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { peminjamanApi } from '@/lib/api';
import type { Peminjaman } from '@/types/api';
import logoSemantis from './logo_semantis.png';
import { 
  ArrowLeft,
  User,
  Package,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
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
  DISETUJUI: 'bg-green-100 text-green-800 border-green-200',
  DIPINJAM: 'bg-blue-100 text-blue-800 border-blue-200',
  DITOLAK: 'bg-red-100 text-red-800 border-red-200',
  DIKEMBALIKAN: 'bg-green-100 text-green-800 border-green-200'
};

const statusIcons = {
  PENDING: <Clock className="w-4 h-4" />,
  DISETUJUI: <CheckCircle className="w-4 h-4" />,
  DIPINJAM: <Package className="w-4 h-4" />,
  DITOLAK: <XCircle className="w-4 h-4" />,
  DIKEMBALIKAN: <RotateCcw className="w-4 h-4" />
};

const statusLabels = {
  PENDING: 'Menunggu Persetujuan',
  DISETUJUI: 'Disetujui',
  DIPINJAM: 'Sedang Dipinjam',
  DITOLAK: 'Ditolak',
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
    router.push('/admin/peminjaman/approve');
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
        <div className="relative flex flex-col items-center justify-center min-h-[16rem] sm:min-h-[20rem] md:min-h-[24rem] px-4 bg-gray-50 rounded-xl">
          <div className="relative w-16 sm:w-20 md:w-24 lg:w-28 h-16 sm:h-20 md:h-24 lg:h-28 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
            <Package className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-blue-600 animate-bounce drop-shadow-lg" />
          </div>
          <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 animate-pulse text-center">
            Memuat Detail Peminjaman Barang...
          </p>
          <div className="w-40 sm:w-48 md:w-56 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
            <div className="h-2 bg-blue-600 rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !peminjaman) {
    return (
      <DashboardLayout title="Detail Peminjaman">
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Peminjaman Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <Button onClick={handleBack} variant="primary" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Peminjaman
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Detail Peminjaman - ${peminjaman.barang.nama}`}>
      <div className="space-y-6 px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <Button
              size="sm"
              variant="outlinesecond"
              className="flex items-center text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
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
          <span className={`inline-flex text-center items-center px-4 py-2 text-sm font-medium rounded-full border ${statusColors[peminjaman.status]} mt-2 sm:mt-0`}>
            {statusIcons[peminjaman.status]}
            <span className="ml-2">{statusLabels[peminjaman.status]}</span>
          </span>
        </div>

        {/* Grid Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Timeline Peminjaman</h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Permintaan Dibuat', date: peminjaman.tanggalPengajuan, icon: <MessageSquare className="w-4 h-4 text-blue-600" />, color: 'bg-blue-100', notes: peminjaman.catatan },
                  { label: 'Disetujui', date: peminjaman.tanggalDisetujui, icon: <CheckCircle className="w-4 h-4 text-green-600" />, color: 'bg-green-100', notes: peminjaman.penanggungJawab ? `PJ: ${peminjaman.penanggungJawab}` : null },
                  { label: 'Barang Dipinjam', date: peminjaman.tanggalDipinjam, icon: <Package className="w-4 h-4 text-yellow-600" />, color: 'bg-yellow-100', notes: peminjaman.tanggalDipinjam && peminjaman.tanggalDikembalikan ? `Durasi: ${getDaysBetween(peminjaman.tanggalDipinjam, peminjaman.tanggalDikembalikan)} hari` : null },
                  { label: 'Barang Dikembalikan', date: peminjaman.tanggalDikembalikan, icon: <RotateCcw className="w-4 h-4 text-blue-600" />, color: 'bg-blue-100', notes: null },
                ].map((step, idx) => step.date && (
                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 ${step.color} rounded-full flex items-center justify-center`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{step.label}</p>
                      <p className="text-sm text-gray-500">{formatDate(step.date)}</p>
                      {step.notes && <p className="text-sm text-gray-600 mt-1">{step.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail Barang */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Detail Barang</h2>
              </div>
              <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-shrink-0 w-full sm:w-24 h-48 sm:h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                  {peminjaman.barang.fotoUrl ? (
                    <img src={peminjaman.barang.fotoUrl} alt={peminjaman.barang.nama} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package className="w-10 h-10 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <h3 className="text-lg font-medium text-gray-900">{peminjaman.barang.nama}</h3>
                  <p className="text-sm text-gray-600">{peminjaman.barang.deskripsi}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
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

            {/* Dokumentasi */}
            {(peminjaman.fotoPinjam || peminjaman.fotoKembali) && (
              <div className="bg-white rounded-lg shadow border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Dokumentasi</h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {peminjaman.fotoPinjam && (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">Foto Saat Peminjaman</span>
                      <div className="relative w-full h-48 sm:h-64">
                        <img 
                        src={peminjaman.fotoPinjam} 
                        alt="Foto Peminjaman" 
                        className="w-full h-full object-cover rounded-xl cursor-pointer shadow-sm hover:shadow-md transition"
                        onClick={() => window.open(peminjaman.fotoPinjam!, "_blank")}
                         />
                      </div>
                    </div>
                  )}
                  {peminjaman.fotoKembali && (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">Foto Saat Pengembalian</span>
                      <div className="relative w-full h-48 sm:h-64">
                        <img 
                        src={peminjaman.fotoKembali} 
                        alt="Foto Pengembalian" 
                        className="w-full h-full object-cover rounded-xl cursor-pointer shadow-sm hover:shadow-md transition" 
                        onClick={() => window.open(peminjaman.fotoKembali!, "_blank")}
                        />
                      </div>
                    </div>
                  )}
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
              <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
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
        </div>
      </div>
    </DashboardLayout>
  );
}
