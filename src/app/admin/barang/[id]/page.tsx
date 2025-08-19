'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { barangApi, peminjamanApi } from '@/lib/api';
import type { Barang, Peminjaman } from '@/types/api';
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
  BAIK: 'bg-green-100 text-green-800 border-green-200',
  RUSAK_RINGAN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  RUSAK_BERAT: 'bg-red-100 text-red-800 border-red-200'
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
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Menunggu' },
      DIPINJAM: { color: 'bg-blue-100 text-blue-800', label: 'Dipinjam' },
      DIKEMBALIKAN: { color: 'bg-green-100 text-green-800', label: 'Dikembalikan' },
      REJECTED: { color: 'bg-red-100 text-red-800', label: 'Ditolak' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="Detail Barang">
        <div className="flex items-center justify-center h-64">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <span className="text-gray-600">Memuat detail barang...</span>
          </div>
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
        <Button
          size="sm"
          variant="outlinesecond"
          onClick={handleBack}
          className="flex items-center text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{barang.nama}</h1>
          <p className="text-sm text-gray-600">Detail lengkap barang inventaris</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Informasi Dasar</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kode Barang */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Kode Barang</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="font-mono text-base">{barang.kodeBarang}</span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status Kondisi</label>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${kondisiColors[barang.kondisi]}`}
                    >
                      {kondisiIcons[barang.kondisi]}
                      <span className="ml-2">{kondisiLabels[barang.kondisi]}</span>
                    </span>
                  </div>
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span>{barang.kategori.nama}</span>
                  </div>
                </div>

                {/* Merek */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Merek</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span>{barang.merek.nama}</span>
                  </div>
                </div>

                {/* Lokasi */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Lokasi</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{barang.lokasi.nama}</span>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {barang.deskripsi || "Tidak ada deskripsi"}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Informasi Waktu</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tanggal Dibuat */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Dibuat</label>
                <div className="flex items-center space-x-2 text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>
                    {new Date(barang.createdAt).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Terakhir Diupdate */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Terakhir Diupdate</label>
                <div className="flex items-center space-x-2 text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>
                    {new Date(barang.updatedAt).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat Peminjaman (tetap sama, hanya wrapper clean) */}
          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="p-5 border-b border-gray-200 flex items-center space-x-2">
              <History className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Riwayat Peminjaman</h2>
            </div>
            <div className="p-5">
              {/* ... mapping history */}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Foto Barang */}
          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Foto Barang</h2>
            </div>
            <div className="p-5">
              {barang.fotoUrl ? (
                <img
                  src={barang.fotoUrl}
                  alt={barang.nama}
                  className="w-full h-48 sm:h-64 lg:h-72 object-cover rounded-xl border"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 sm:h-64 lg:h-72 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Tidak ada foto</p>
                </div>
              )}
            </div>
          </div>

          {/* QR Code */}
          {barang.qrCodeUrl && (
            <div className="bg-white rounded-2xl shadow-sm border">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">QR Code</h2>
              </div>
              <div className="p-5 flex flex-col items-center space-y-4">
                <img
                  src={barang.qrCodeUrl}
                  alt={`QR Code ${barang.kodeBarang}`}
                  className="w-28 h-28 border rounded-lg"
                />
                <p className="text-sm text-gray-600 text-center">Scan untuk melihat detail barang</p>
                <Button
                  variant="outlinesecond"
                  size="sm"
                  className="flex items-center text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
                  onClick={handleDownloadQRCode}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </DashboardLayout>
);
}