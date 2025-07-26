'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import EnhancedReturnModal from '@/components/modals/EnhancedReturnModal';
import { peminjamanApi } from '@/lib/api';
import type { Peminjaman } from '@/types/api';
import { 
  CheckCircle, 
  Eye,
  Calendar,
  User,
  Package,
  Clock,
  AlertCircle,
  RotateCcw,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';


export default function AdminApprovedRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedPeminjamanForReturn, setSelectedPeminjamanForReturn] = useState<Peminjaman | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    loadApprovedRequests();
  }, []);

  const loadApprovedRequests = async () => {
    try {
      const response = await peminjamanApi.getAllRequests();
      if (response.status === 'success') {
        // Filter only borrowed items (DIPINJAM status)
        setRequests(response.data.filter(req => req.status === 'DIPINJAM'));
      }
    } catch (error) {
      console.error('Failed to load approved requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReturnModal = (peminjaman: Peminjaman) => {
    setSelectedPeminjamanForReturn(peminjaman);
    setIsReturnModalOpen(true);
  };

  const handleCloseReturnModal = () => {
    setSelectedPeminjamanForReturn(null);
    setIsReturnModalOpen(false);
  };

  const handleProcessReturn = async (penanggungJawab: string, catatan: string, foto?: File) => {
    if (!selectedPeminjamanForReturn) return;
    
    setReturnLoading(true);
    try {
      const response = await peminjamanApi.processReturn(selectedPeminjamanForReturn.id, {
        penanggungJawab,
        catatan,
        fotoKembali: foto
      });

      if (response.status === 'success') {
        toast.success('Pengembalian berhasil diproses! 📦');
        handleCloseReturnModal();
        loadApprovedRequests();
      }
    } catch (error) {
      console.error('Failed to process return:', error);
      toast.error('Gagal memproses pengembalian');
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <DashboardLayout title="Barang Sedang Dipinjam">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Barang Sedang Dipinjam</h1>
            <p className="text-gray-600 mt-1">Riwayat barang yang sedang dipinjam dan dapat dikembalikan</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Sedang Dipinjam</p>
                <p className="text-2xl font-bold text-green-800">{requests.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Perlu Dikembalikan</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {requests.filter(req => {
                    const borrowDate = new Date(req.tanggalDipinjam || req.tanggalDisetujui || req.createdAt);
                    const daysBorrowed = Math.floor((Date.now() - borrowDate.getTime()) / (1000 * 60 * 60 * 24));
                    return daysBorrowed > 7;
                  }).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Rata-rata Hari Pinjam</p>
                <p className="text-2xl font-bold text-blue-800">
                  {requests.length > 0 ? Math.round(
                    requests.reduce((sum, req) => {
                      const borrowDate = new Date(req.tanggalDipinjam || req.tanggalDisetujui || req.createdAt);
                      const daysBorrowed = Math.floor((Date.now() - borrowDate.getTime()) / (1000 * 60 * 60 * 24));
                      return sum + daysBorrowed;
                    }, 0) / requests.length
                  ) : 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Borrowed Items Table */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Barang Yang Sedang Dipinjam
              </h2>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Status: DIPINJAM</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                <span className="text-gray-600">Memuat data...</span>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada barang yang sedang dipinjam</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Peminjam</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Barang</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Tanggal Dipinjam</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Lama Pinjam</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Penanggung Jawab</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => {
                    const borrowDate = new Date(request.tanggalDipinjam || request.tanggalDisetujui || request.createdAt);
                    const daysBorrowed = Math.floor((Date.now() - borrowDate.getTime()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysBorrowed > 7;
                    
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{request.user.nama}</p>
                              <p className="text-sm text-gray-500">{request.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <Package className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{request.barang.nama}</p>
                              <p className="text-sm text-gray-500">{request.barang.kodeBarang}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {borrowDate.toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {daysBorrowed} hari {isOverdue ? '(Terlambat)' : ''}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{request.penanggungJawab || '-'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpenReturnModal(request)}
                              className="text-xs bg-blue-600 hover:bg-blue-700"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Proses Pengembalian
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => router.push(`/admin/peminjaman/${request.id}`)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Detail
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Return Modal */}
      <EnhancedReturnModal
        isOpen={isReturnModalOpen}
        onClose={handleCloseReturnModal}
        onSubmit={handleProcessReturn}
        peminjaman={selectedPeminjamanForReturn}
        loading={returnLoading}
      />
    </DashboardLayout>
  );
}