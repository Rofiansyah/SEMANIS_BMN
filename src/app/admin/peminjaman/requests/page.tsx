'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { peminjamanApi } from '@/lib/api';
import type { Peminjaman } from '@/types/api';
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  User,
  Package,
  Clock,
  AlertCircle,
  Filter,
  RotateCcw,
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DIPINJAM: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  RETURNED: 'bg-blue-100 text-blue-800 border-blue-200',
  DIKEMBALIKAN: 'bg-blue-100 text-blue-800 border-blue-200'
};

const statusLabels = {
  PENDING: 'Menunggu',
  DIPINJAM: 'Sedang Dipinjam',
  REJECTED: 'Ditolak',
  RETURNED: 'Dikembalikan',
  DIKEMBALIKAN: 'Dikembalikan'
};

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (penanggungJawab: string, catatan: string, foto?: File) => Promise<void>;
  peminjaman?: Peminjaman | null;
  loading?: boolean;
}

function ReturnModal({ isOpen, onClose, onSubmit, peminjaman, loading }: ReturnModalProps) {
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [catatan, setCatatan] = useState('');
  const [foto, setFoto] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPenanggungJawab('');
      setCatatan('');
      setFoto(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!penanggungJawab.trim()) {
      toast.error('Nama penanggung jawab harus diisi');
      return;
    }
    if (!catatan.trim()) {
      toast.error('Catatan pengembalian harus diisi');
      return;
    }

    await onSubmit(penanggungJawab.trim(), catatan.trim(), foto || undefined);
  };

  if (!isOpen || !peminjaman) return null;

  return (
    <div 
      className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-[60]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border-0">
        <h3 className="text-lg font-semibold mb-4">Proses Pengembalian</h3>
        
        {/* Request Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-center space-x-3 mb-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{peminjaman.user.nama}</span>
          </div>
          <div className="flex items-center space-x-3 mb-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{peminjaman.barang.nama}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Dipinjam: {peminjaman.tanggalDipinjam ? new Date(peminjaman.tanggalDipinjam).toLocaleDateString('id-ID') : '-'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Penanggung Jawab *
            </label>
            <input
              type="text"
              value={penanggungJawab}
              onChange={(e) => setPenanggungJawab(e.target.value)}
              placeholder="Nama lengkap penanggung jawab"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan Pengembalian *
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Kondisi barang saat dikembalikan, catatan khusus, dll..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Dokumentasi (Opsional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFoto(e.target.files?.[0] || null)}
                className="hidden"
                id="foto-return-upload"
              />
              <label htmlFor="foto-return-upload" className="cursor-pointer flex flex-col items-center">
                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {foto ? foto.name : 'Klik untuk upload foto'}
                </span>
              </label>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Memproses...' : 'Proses Pengembalian'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBorrowingRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedPeminjamanForReturn, setSelectedPeminjamanForReturn] = useState<Peminjaman | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await peminjamanApi.getAllRequests();
      if (response.status === 'success') {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Failed to load borrowing requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const penanggungJawab = prompt('Masukkan nama penanggung jawab:');
      if (!penanggungJawab) return;

      const response = await peminjamanApi.approve(id, { penanggungJawab });
      if (response.status === 'success') {
        toast.success('Permintaan berhasil disetujui! ✅');
        loadRequests();
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast.error('Gagal menyetujui permintaan');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const catatan = prompt('Masukkan alasan penolakan:');
      if (!catatan) return;

      const response = await peminjamanApi.reject(id, { catatan });
      if (response.status === 'success') {
        toast.success('Permintaan berhasil ditolak! ❌');
        loadRequests();
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast.error('Gagal menolak permintaan');
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
        loadRequests();
      }
    } catch (error) {
      console.error('Failed to process return:', error);
      toast.error('Gagal memproses pengembalian');
    } finally {
      setReturnLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => 
    selectedStatus === 'ALL' || request.status === selectedStatus
  );

  const getRequestCount = (status: string) => {
    if (status === 'ALL') return requests.length;
    return requests.filter(req => req.status === status).length;
  };

  return (
    <DashboardLayout title="Kelola Peminjaman">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Peminjaman</h1>
            <p className="text-gray-600 mt-1">Kelola semua peminjaman barang - dari pengajuan hingga pengembalian</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedStatus === 'ALL' ? 'border-gray-700 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedStatus('ALL')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Permintaan</p>
                <p className="text-2xl font-bold text-gray-900">{getRequestCount('ALL')}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedStatus === 'PENDING' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedStatus('PENDING')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menunggu</p>
                <p className="text-2xl font-bold text-yellow-600">{getRequestCount('PENDING')}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedStatus === 'DIPINJAM' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedStatus('DIPINJAM')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sedang Dipinjam</p>
                <p className="text-2xl font-bold text-green-600">{getRequestCount('DIPINJAM')}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedStatus === 'REJECTED' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedStatus('REJECTED')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ditolak</p>
                <p className="text-2xl font-bold text-red-600">{getRequestCount('REJECTED')}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedStatus === 'RETURNED' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedStatus('RETURNED')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dikembalikan</p>
                <p className="text-2xl font-bold text-blue-600">{getRequestCount('RETURNED')}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedStatus === 'ALL' ? 'Semua Peminjaman' : `Peminjaman ${statusLabels[selectedStatus as keyof typeof statusLabels]}`}
              </h2>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Filter: {selectedStatus}</span>
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
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada permintaan ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Peminjam</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Barang</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Tanggal Request</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Catatan</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
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
                            {new Date(request.tanggalPengajuan).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                          statusColors[request.status]
                        }`}>
                          {statusLabels[request.status]}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate" title={request.catatan}>
                          {request.catatan}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          {request.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleApprove(request.id)}
                                className="text-xs"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Setujui
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleReject(request.id)}
                                className="text-xs"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Tolak
                              </Button>
                            </>
                          )}
                          {request.status === 'DIPINJAM' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpenReturnModal(request)}
                              className="text-xs bg-blue-600 hover:bg-blue-700"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Proses Pengembalian
                            </Button>
                          )}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Return Modal */}
      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={handleCloseReturnModal}
        onSubmit={handleProcessReturn}
        peminjaman={selectedPeminjamanForReturn}
        loading={returnLoading}
      />
    </DashboardLayout>
  );
}