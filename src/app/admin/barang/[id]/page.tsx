'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { barangApi, peminjamanApi } from '@/lib/api';
import type { Barang, Peminjaman } from '@/types/api';
import logoSemantis from './logo_semantis.png';
import { 
  ArrowLeft,
  Package,
  Tag,
  Building,
  MapPin,
  Calendar,
  QrCode,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  History,
  User,
  FileText
} from 'lucide-react';

interface BarangDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const kondisiColors = {
  BAIK: 'bg-green-100 text-green-800 border-green-200 text-center',
  RUSAK_RINGAN: 'bg-yellow-100 text-yellow-800 border-yellow-200 text-center',
  RUSAK_BERAT: 'bg-red-100 text-red-800 border-red-200 text-center'
};

const kondisiIcons = {
  BAIK: <CheckCircle className="w-4 h-4" />,
  RUSAK_RINGAN: <Clock className="w-4 h-4" />,
  RUSAK_BERAT: <XCircle className="w-4 h-4" />
};

const kondisiLabels = {
  BAIK: 'Baik',
  RUSAK_RINGAN: 'Rusak Ringan',
  RUSAK_BERAT: 'Rusak Berat'
};

// ✅ Status Config Lengkap
const statusConfig = {
  PENDING: { 
    icon: <Clock size={16} />, 
    text: 'Menunggu', 
    color: 'bg-yellow-100 text-yellow-800', 
    bgColor: 'bg-yellow-50' 
  },
  DIPINJAM: { 
    icon: <Package size={16} />, 
    text: 'Sedang Dipinjam', 
    color: 'bg-blue-100 text-blue-800', 
    bgColor: 'bg-blue-50' 
  },
  DIKEMBALIKAN: { 
    icon: <CheckCircle size={16} />, 
    text: 'Dikembalikan', 
    color: 'bg-green-100 text-green-800', 
    bgColor: 'bg-green-50' 
  },
  DITOLAK: { 
    icon: <XCircle size={16} />, 
    text: 'Ditolak', 
    color: 'bg-red-100 text-red-800', 
    bgColor: 'bg-red-50' 
  }
};

export default function BarangDetailPage({ params }: BarangDetailPageProps) {
  const router = useRouter();
  const [barang, setBarang] = useState<Barang | null>(null);
  const [history, setHistory] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paramsId, setParamsId] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setParamsId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const loadBarangDetail = useCallback(async () => {
    if (!paramsId) return;
    
    try {
      const response = await barangApi.getById(paramsId);
      if (response.success) {
        setBarang(response.data);
      } else {
        setError('Barang tidak ditemukan');
      }
    } catch (error) {
      console.error('Failed to load barang detail:', error);
      setError('Gagal memuat detail barang');
    } finally {
      setLoading(false);
    }
  }, [paramsId]);

  const loadHistory = useCallback(async () => {
    if (!paramsId) return;
    
    setHistoryLoading(true);
    try {
      const response = await peminjamanApi.getHistoryByBarangId(paramsId);
      if (response.status === 'success') {
        setHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, [paramsId]);

  useEffect(() => {
    loadBarangDetail();
    loadHistory();
  }, [loadBarangDetail, loadHistory]);

  const handleBack = () => {
    router.push('/admin/barang');
  };

  const handleDownloadQRCode = async () => {
    if (!barang?.qrCodeUrl) return;
    
    try {
      const response = await fetch(barang.qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-${barang.kodeBarang}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { icon: null, text: status, color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon && <span className="mr-1">{config.icon}</span>}
        {config.text}
      </span>
    );
  };

  if (loading) {
return (
  <DashboardLayout title="Detail Barang">
    <div className="relative flex flex-col items-center justify-center min-h-[16rem] sm:min-h-[20rem] md:min-h-[24rem] px-4 bg-gray-50 rounded-xl">
      {/* Logo */}
      <img
        src={typeof logoSemantis === "string" ? logoSemantis : logoSemantis.src}
        alt="SEMANTIS BMN Logo"
        className="w-32 sm:w-40 md:w-48 h-auto mx-auto mb-6 animate-pulse"
      />
      {/* Kotak animasi responsif */}
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-4">
        <div className="absolute inset-0 bg-blue-600 rounded-lg animate-bounce shadow-lg"></div>
        <div className="absolute inset-0 bg-blue-400 rounded-lg animate-ping opacity-30"></div>
      </div>

      {/* Teks animasi responsif */}
      <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 animate-pulse text-center">
        Memuat Detail Barang...
      </p>

      {/* Progress Bar animasi responsif */}
      <div className="w-40 sm:w-48 md:w-56 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
        <div className="h-2 bg-blue-600 rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  </DashboardLayout>
);

  }

  if (error || !barang) {
    return (
      <DashboardLayout title="Detail Barang">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Barang Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleBack} variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Barang
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Detail - ${barang.nama}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Button
              size="sm"
              variant="outlinesecond"
              onClick={handleBack}
              className="flex items-center text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2 " />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{barang.nama}</h1>
              <p className="text-gray-600 mt-1">Detail lengkap barang inventaris</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Foto + QR (Kiri di desktop, atas di mobile) */}
          <div className="space-y-6 order-1 lg:order-1">
            {/* Foto Barang */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Foto Barang</h2>
              </div>
              <div className="p-6">
                {barang.fotoUrl ? (
                  <div className="relative">
                    <img
                      src={barang.fotoUrl}
                      alt={barang.nama}
                      className="w-full h-full object-cover rounded-lg cursor-pointer"
                      onClick={() => window.open(barang.fotoUrl!, "_blank")}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Tidak ada foto</p>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code */}
            {barang.qrCodeUrl && (
              <div className="bg-white rounded-lg shadow border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">QR Code</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <img
                      src={barang.qrCodeUrl}
                      alt={`QR Code ${barang.kodeBarang}`}
                      className="w-32 h-32 border rounded-lg"
                    />
                    <p className="text-sm text-gray-600 text-center">
                      Scan untuk melihat detail barang
                    </p>
                    <Button 
                      variant="outlinesecond" 
                      size="sm" 
                      className="flex items-center text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
                      onClick={handleDownloadQRCode}>
                      <QrCode className="w-4 h-4 mr-2" />
                      Download QR Code
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detail Barang + Riwayat */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-2">
            
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Informasi Dasar</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kode Barang
                    </label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="font-mono text-lg">{barang.kodeBarang}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status Kondisi
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${
                        kondisiColors[barang.kondisi]
                      }`}>
                        {kondisiIcons[barang.kondisi]}
                        <span className="ml-2">{kondisiLabels[barang.kondisi]}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori
                    </label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span>{barang.kategori.nama}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Merek
                    </label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span>{barang.merek.nama}</span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lokasi
                    </label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{barang.lokasi.nama}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {barang.deskripsi || 'Tidak ada deskripsi'}
                  </p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Informasi Waktu</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Dibuat
                    </label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(barang.createdAt).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Terakhir Diupdate
                    </label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(barang.updatedAt).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat Peminjaman */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Riwayat Peminjaman</h2>
                </div>
              </div>
              <div className="p-6">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="inline-flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                      <span className="text-gray-600">Memuat riwayat...</span>
                    </div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Belum ada riwayat peminjaman</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => {
                      const config = statusConfig[item.status as keyof typeof statusConfig] || 
                                    { color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50' };

return (
  <div
    key={item.id}
    className={`rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${config.bgColor}`}
  >
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <User className="w-10 h-10 text-gray-500 bg-gray-100 rounded-full p-2" />
        </div>
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-gray-900">
            {item.user.nama}
          </h4>
          <p className="text-sm text-gray-600">{item.user.email}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{getStatusBadge(item.status)}</div>
    </div>

    {/* Info Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-gray-500">Tanggal Pengajuan:</span>
        <p className="font-medium text-gray-900">
          {new Date(item.tanggalPengajuan).toLocaleDateString("id-ID")}
        </p>
      </div>
      {item.tanggalDisetujui && (
        <div>
          <span className="text-gray-500">Tanggal Disetujui:</span>
          <p className="font-medium text-gray-900">
            {new Date(item.tanggalDisetujui).toLocaleDateString("id-ID")}
          </p>
        </div>
      )}
      {item.tanggalDikembalikan && (
        <div>
          <span className="text-gray-500">Tanggal Dikembalikan:</span>
          <p className="font-medium text-gray-900">
            {new Date(item.tanggalDikembalikan).toLocaleDateString("id-ID")}
          </p>
        </div>
      )}
      {item.penanggungJawab && (
        <div>
          <span className="text-gray-500">Penanggung Jawab:</span>
          <p className="font-medium text-gray-900">{item.penanggungJawab}</p>
        </div>
      )}
    </div>

    {/* Catatan */}
    {item.catatan && (
      <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-3 mb-4 border-b border-gray-200">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <span className="text-sm text-gray-500">Catatan:</span>
            <p className="text-sm text-gray-900 mt-1 leading-relaxed">
              {item.catatan}
            </p>
          </div>
        </div>
      </div>
    )}

    {/* Approved By */}
    {item.approvedByUser && (
      <div className="mt-1 pt-1 border-t border-gray-100">
        <span className="text-sm text-gray-500">Disetujui oleh:</span>
        <p className="text-sm font-medium text-gray-900">
          {item.approvedByUser.nama}
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
        </div>
      </div>
    </DashboardLayout>
  );
}
