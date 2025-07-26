'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { barangApi } from '@/lib/api';
import type { Barang } from '@/types/api';
import { 
  ArrowLeft,
  Package,
  Tag,
  Building,
  MapPin,
  Calendar,
  QrCode,
  Image as ImageIcon,
  Edit,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
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

  useEffect(() => {
    loadBarangDetail();
  }, [loadBarangDetail]);

  const handleBack = () => {
    router.push('/admin/barang');
  };

  const handleEdit = () => {
    // Navigate to edit mode (you can implement this later)
    if (paramsId) {
      router.push(`/admin/barang/${paramsId}/edit`);
    }
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
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{barang.nama}</h1>
              <p className="text-gray-600 mt-1">Detail lengkap barang inventaris</p>
            </div>
          </div>
          <Button variant="primary" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Barang
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
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
                <h2 className="text-lg font-semibold text-gray-900">Riwayat</h2>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Photo */}
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
                      className="w-full h-64 object-cover rounded-lg border"
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
                    <Button variant="outline" size="sm" onClick={handleDownloadQRCode}>
                      <QrCode className="w-4 h-4 mr-2" />
                      Download QR Code
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Aksi Cepat</h2>
              </div>
              <div className="p-6 space-y-3">
                <Button variant="primary" className="w-full" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Barang
                </Button>
                <Button variant="outline" className="w-full">
                  <Package className="w-4 h-4 mr-2" />
                  Lihat Riwayat Peminjaman
                </Button>
                {barang.qrCodeUrl && (
                  <Button variant="outline" className="w-full" onClick={handleDownloadQRCode}>
                    <QrCode className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}