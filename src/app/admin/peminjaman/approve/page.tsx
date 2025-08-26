'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import CameraCapture from '@/components/camera/CameraCapture';
import EnhancedReturnModal from '@/components/modals/EnhancedReturnModal';
import ApproveModal from '@/components/modals/ApproveModal';
import RejectModal from '@/components/modals/RejectModal';
import { peminjamanApi } from '@/lib/api';
import type { Peminjaman } from '@/types/api';
import logoSemantis from './logo_semantis.png';
import { 
  Clock, 
  Package, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Eye,
  Download,
  ClipboardList,
  Tag,
  Building,
  MapPin,
  AlertCircle,
  Search,
  Filter,
  RotateCcw,
  Camera,
  User,
  MessageSquare,
  Upload
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { request } from 'http';

const statusLabels: Record<
  'ALL' | 'PENDING' | 'DIPINJAM' | 'DITOLAK' | 'DIKEMBALIKAN' | 'DISETUJUI',
  string
> = {
  ALL: "Semua",
  PENDING: "Menunggu",
  DIPINJAM: "Dipinjam",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
  DIKEMBALIKAN: 'Dikembalikan'
};

export default function AdminStatusPage(){
  const router = useRouter();
  const [requests, setRequests] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedPeminjamanForReturn, setSelectedPeminjamanForReturn] = useState<Peminjaman | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Peminjaman | null>(null);
  const [approveRequest, setApproveRequest] = useState<Peminjaman | null>(null);
  const [rejectRequest, setRejectRequest] = useState<Peminjaman | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // days
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'DIPINJAM' | 'DITOLAK' | 'DIKEMBALIKAN' | 'DISETUJUI'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await peminjamanApi.getAllRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching peminjaman:', error);
      toast.error('Gagal memuat kelola peminjaman');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (request: Peminjaman) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setIsModalOpen(false);
  };

  const handleApprove = async (id: string, penanggungJawab: string, foto?: File) => {
    const response = await peminjamanApi.approve(id, { penanggungJawab, fotoPinjam: foto });
    if (response.status === 'success') {
      toast.success('Permintaan berhasil disetujui! ✅');
      loadRequests();
    }
  };

  const handleReject = async (id: string, catatan: string) => {
    const response = await peminjamanApi.reject(id, { catatan });
    if (response.status === 'success') {
      toast.success('Permintaan berhasil ditolak! ❌');
      loadRequests();
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
  
  const getStatusInfo = (status: string) => {
    const statusMap = {
      'PENDING': {
        icon: <Clock size={16} />,
        text: 'Menunggu',
        color: 'bg-yellow-100 text-yellow-800',
        bgColor: 'bg-yellow-50'
      },
      'DISETUJUI': {
        icon: <CheckCircle size={16} />,
        text: 'Disetujui',
        color: 'bg-indigo-100 text-indigo-800',
        bgColor: 'bg-indigo-50'
      },
      'DIPINJAM': {
        icon: <Package size={16} />,
        text: 'Dipinjam',
        color: 'bg-blue-100 text-blue-800',
        bgColor: 'bg-blue-50'
      },
      'DIKEMBALIKAN': {
        icon: <CheckCircle size={16} />,
        text: 'Dikembalikan',
        color: 'bg-green-100 text-green-800',
        bgColor: 'bg-green-50'
      },
      'DITOLAK': {
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

  // Filtered Requests (gabungan Tab + Search)
  const filteredRequests = requests.filter((item) => {
    // Cek tab aktif
    const matchesTab = activeTab === "ALL" ? true : item.status === activeTab;
    // Cek search (nama peminjam, email, nama barang, kode barang)
    const matchesSearch =
      item.user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barang.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barang.kodeBarang.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Hitung jumlah untuk statistik (tidak ikut search)
  const allCount = requests.length;
  const pendingCount = requests.filter(item => item.status === 'PENDING').length;
  const approvedCount = requests.filter(item => item.status === 'DISETUJUI').length;
  const borrowedCount = requests.filter(item => item.status === 'DIPINJAM').length;
  const rejectedCount = requests.filter(item => item.status === 'DITOLAK').length;
  const returnedCount = requests.filter(item => item.status === 'DIKEMBALIKAN').length;

  
  if (loading) {
return (
  <DashboardLayout title="Kelola Peminjaman">
    <div className="relative flex flex-col items-center justify-center min-h-[16rem] sm:min-h-[20rem] px-4 bg-gray-50 rounded-xl">
      {/* Logo */}
      <img
        src={typeof logoSemantis === "string" ? logoSemantis : logoSemantis.src}
        alt="SEMANTIS BMN Logo"
        className="w-28 sm:w-36 md:w-40 h-auto mx-auto mb-6 animate-pulse"
      />

      {/* Ikon animasi responsif */}
      <div className="relative w-16 sm:w-20 md:w-24 lg:w-28 h-16 sm:h-20 md:h-24 lg:h-28 mb-4 flex items-center justify-center">
        {/* Efek ping responsif */}
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>

        {/* Ikon responsif dengan bounce */}
        <Package className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-blue-600 animate-bounce drop-shadow-lg" />
      </div>

      {/* Teks animasi responsif */}
      <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 animate-pulse text-center">
        Memuat Data Kelola Peminjaman...
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

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>        

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total */}
          <div
            className={`p-4 rounded-lg border-2 shadow-sm cursor-pointer transition-all transform hover:scale-[1.02] hover:shadow-md ${
              activeTab === 'ALL'
                ? 'border-gray-600 bg-gradient-to-br from-gray-100 to-gray-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
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

          {/* Pending */}
          <div
            className={`p-4 rounded-lg border-2 shadow-sm cursor-pointer transition-all transform hover:scale-[1.02] hover:shadow-md ${
              activeTab === 'PENDING'
                ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100'
                : 'border-gray-200 hover:border-gray-300 bg-white'
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

          {/* Dipinjam */}
          <div
            className={`p-4 rounded-lg border-2 shadow-sm cursor-pointer transition-all transform hover:scale-[1.02] hover:shadow-md ${
              activeTab === 'DIPINJAM'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100'
                : 'border-gray-200 hover:border-gray-300 bg-white'
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

          {/* Ditolak */}
          <div
            className={`p-4 rounded-lg border-2 shadow-sm cursor-pointer transition-all transform hover:scale-[1.02] hover:shadow-md ${
              activeTab === 'DITOLAK'
                ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            onClick={() => setActiveTab('DITOLAK')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ditolak</p>
                <p className="text-2xl font-bold text-red-800">{rejectedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>   

          {/* Dikembalikan */}
          <div
            className={`p-4 rounded-lg border-2 shadow-sm cursor-pointer transition-all transform hover:scale-[1.02] hover:shadow-md ${
              activeTab === 'DIKEMBALIKAN'
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            onClick={() => setActiveTab('DIKEMBALIKAN')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dikembalikan</p>
                <p className="text-2xl font-bold text-green-800">{returnedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>  
        </div>

        {/* Table & Card View */}
        <div className="bg-white rounded-xl shadow border">
          <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'ALL'
                ? 'Semua Peminjaman'
                : `Peminjaman ${statusLabels[activeTab]}`}
            </h2>
          </div>

          <div className="space-y-9">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center space-x-2">
<div className="flex flex-col justify-center items-center h-screen px-4">
  {/* Logo */}
  <img
    src={typeof logoSemantis === "string" ? logoSemantis : logoSemantis.src}
    alt="SEMANTIS BMN Logo"
    className="w-24 sm:w-32 md:w-40 lg:w-48 h-auto mx-auto mb-6 animate-pulse"
  />

  {/* Ikon animasi responsif */}
  <div className="relative w-12 sm:w-16 md:w-20 lg:w-24 h-12 sm:h-16 md:h-20 lg:h-24 mb-4 flex items-center justify-center">
    {/* Efek ping responsif */}
    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>

    {/* Ikon responsif dengan bounce */}
    <Package className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 text-blue-600 animate-bounce drop-shadow-lg" />
  </div>

  {/* Teks animasi */}
  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-700 animate-pulse text-center">
    Loading...
  </p>

  {/* Progress Bar */}
  <div className="w-32 sm:w-40 md:w-48 lg:w-56 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
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
                </div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Tidak ada permintaan ditemukan ||
                  {searchQuery ? 'Tidak ada merek yang sesuai dengan pencarian' : 'Belum ada merek'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm text-gray-900">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Peminjam</th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Barang</th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Tgl Pengajuan</th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Tgl Dipinjam</th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Status</th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Lama</th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Penanggung Jawab</th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Catatan</th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRequests.map((request) => {
                      const statusInfo = getStatusInfo(request.status);
                      const borrowDate = request.tanggalDipinjam 
                        ? new Date(request.tanggalDipinjam) 
                        : new Date(request.tanggalDisetujui || request.tanggalPengajuan);
                      const daysBorrowed = Math.floor((Date.now() - borrowDate.getTime()) / (1000 * 60 * 60 * 24));

                      return (
                        <tr
                          key={request.id}
                          className={`rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${statusInfo.bgColor}`}
                        >
                          {/* Peminjam (biar tetap kiri karena biasanya teks panjang) */}
                          <td className="py-4 px-4 border border-gray-300">
                            <div className="">
                              {/* Nama + Email (justify) */}
                              <div className="flex flex-col">
                                <p className="font-medium text-gray-900">{request.user.nama}</p>
                                <p className="text-xs text-gray-500">{request.user.email}</p>
                              </div>
                            </div>
                          </td>

      {/* Foto + Nama Barang */}
      <td className="py-4 px-4 border border-gray-300">
        <div className="flex items-start space-x-3">
                  {/* Foto */}
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    {request.barang.fotoUrl ? (
                      <img
                        src={request.barang.fotoUrl}
                        alt={request.barang.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                      
                      </div>
                    )}
                  </div>

          {/* Nama + Kode Barang */}
          <div className="flex flex-col">
            <p className="font-medium text-gray-900">{request.barang.nama}</p>
            <p className="text-xs text-gray-500">{request.barang.kodeBarang}</p>
          </div>
        </div>
      </td>
                          {/* Tanggal Pengajuan → center */}
                          <td className="py-4 px-4 border border-gray-300 text-center">
                            {new Date(request.tanggalPengajuan).toLocaleDateString('id-ID')}
                          </td>

                          {/* Tanggal Dipinjam → center */}
                          <td className="py-4 px-4 border border-gray-300 text-center">
                            {request.tanggalDipinjam
                              ? new Date(request.tanggalDipinjam).toLocaleDateString('id-ID')
                              : '-'}
                          </td>

                          {/* Status → center */}
                          <td className="py-4 px-4 border border-gray-300 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center justify-center gap-1 ${statusInfo.color}`}
                            >
                              {statusInfo.icon}
                              {statusInfo.text}
                            </span>
                          </td>

                          {/* Lama Pinjam → center */}
                          <td className="py-4 px-4 border border-gray-300 text-center">
                            {request.status === 'DIPINJAM' ? `${daysBorrowed} hari` : '-'}
                          </td>

                          {/* Penanggung Jawab → center */}
                          <td className="py-4 px-4 border border-gray-300 text-center">
                            {request.penanggungJawab || '-'}
                          </td>

                          {/* Catatan (biar tetap kiri, biasanya panjang) */}
                          <td className="py-4 px-4 border border-gray-300">
                            <p>
                              {request.catatan || '-'}
                            </p>
                          </td>

                          {/* Aksi → fixed width center */}
                          <td className="py-4 px-4 border border-gray-300 text-center min-w-[240px]">
                            {request.status === 'PENDING' && (
                              <div className="flex flex-col items-center gap-2">
                                {/* Baris 1 */}
                                <div className="flex justify-center">
                                  <Button
                                    size="sm"
                                    variant="outlinesecond"
                                    className="flex items-center text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
                                    onClick={() => router.push(`/admin/peminjaman/${request.id}`)}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    Detail
                                  </Button>
                                </div>

                                {/* Baris 2 */}
                                <div className="flex justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => setRejectRequest(request)}
                                    className="text-xs"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Tolak
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200"
                                    onClick={() => setApproveRequest(request)}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Setujui
                                  </Button>
                                </div>
                              </div>
                            )}

                            {request.status === 'DIPINJAM' && (
                              <div className="flex flex-col items-center gap-2">
                                {/* Baris 1 */}
                                <div className="flex justify-center">
                                  <Button
                                    size="sm"
                                    variant="outlinesecond"
                                    className="flex items-center text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
                                    onClick={() => router.push(`/admin/peminjaman/${request.id}`)}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    Detail
                                  </Button>
                                </div>

                                {/* Baris 2 */}
                                <div className="flex justify-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200"
                                    onClick={() => handleOpenReturnModal(request)}
                                  >
                                    <RotateCcw className="w-3 h-3 mr-1" />
                                    Pengembalian
                                  </Button>
                                </div>
                              </div>
                            )}

                            {(request.status === 'DIKEMBALIKAN' || request.status === 'DITOLAK') && (
                              <div className="flex justify-center">
                                <Button
                                  size="sm"
                                  variant="outlinesecond"
                                  className="flex items-center text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
                                  onClick={() => router.push(`/admin/peminjaman/${request.id}`)}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Detail
                                </Button>
                              </div>
                            )}
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
      </div>
      {/* Enhanced Return Modal */}
      <EnhancedReturnModal
        isOpen={isReturnModalOpen}
        onClose={handleCloseReturnModal}
        onSubmit={handleProcessReturn}
        peminjaman={selectedPeminjamanForReturn}
        loading={returnLoading}
      />
      <ApproveModal
        request={approveRequest}
        isOpen={!!approveRequest}
        onClose={() => setApproveRequest(null)}
        onApprove={handleApprove}
      />

      <RejectModal
        request={rejectRequest}
        isOpen={!!rejectRequest}
        onClose={() => setRejectRequest(null)}
        onReject={handleReject}
      />
    </DashboardLayout>
  );
}