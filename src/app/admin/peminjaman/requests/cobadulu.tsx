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
  
  const filteredRequests =
    activeTab === 'ALL'
      ? requests
      : requests.filter(item => item.status === activeTab);

  const allCount = requests.length;
  const pendingCount = requests.filter(item => item.status === 'PENDING').length;
  const approvedCount = requests.filter(item => item.status === 'DISETUJUI').length;
  const borrowedCount = requests.filter(item => item.status === 'DIPINJAM').length;
  const rejectedCount = requests.filter(item => item.status === 'DITOLAK').length;
  const returnedCount = requests.filter(item => item.status === 'DIKEMBALIKAN').length;
  
  if (loading) {
    return (
      <DashboardLayout title="Kelola Peminjaman">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total */}
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

          {/* Pending */}
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

          {/* Dipinjam */}
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

          {/* Ditolak */}
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              activeTab === 'DITOLAK'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
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
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              activeTab === 'DIKEMBALIKAN'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
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

<div className="bg-white rounded-xl shadow border">
  {/* Header */}
  <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <h2 className="text-lg font-semibold text-gray-900">
      {activeTab === "ALL"
        ? "Semua Peminjaman"
        : `Peminjaman ${statusLabels[activeTab]}`}
    </h2>
  </div>

  {/* Loading / Empty */}
  <div className="space-y-9">
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
      <>
        {/* TABLE VIEW (desktop) */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full border-collapse text-sm text-gray-900">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {[
                  "Peminjam",
                  "Barang",
                  "Tgl Pengajuan",
                  "Tgl Dipinjam",
                  "Status",
                  "Lama",
                  "PJ",
                  "Catatan",
                  "Aksi",
                ].map((head) => (
                  <th
                    key={head}
                    className="text-center py-3 px-4 border-b font-semibold text-gray-700"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.map((request) => {
                const statusInfo = getStatusInfo(request.status);
                const borrowDate = request.tanggalDipinjam
                  ? new Date(request.tanggalDipinjam)
                  : new Date(request.tanggalDisetujui || request.tanggalPengajuan);
                const daysBorrowed = Math.floor(
                  (Date.now() - borrowDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Peminjam */}
                    <td className="py-3 px-4 text-left">
                      <div className="flex items-start space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{request.user.nama}</p>
                          <p className="text-xs text-gray-500">{request.user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Barang */}
                    <td className="py-3 px-4 text-left">
                      <p className="font-medium">{request.barang.nama}</p>
                      <p className="text-xs text-gray-500">{request.barang.kodeBarang}</p>
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-4 text-center">
                      {new Date(request.tanggalPengajuan).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {request.tanggalDipinjam
                        ? new Date(request.tanggalDipinjam).toLocaleDateString("id-ID")
                        : "-"}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center justify-center gap-1 ${statusInfo.color}`}
                      >
                        {statusInfo.icon}
                        {statusInfo.text}
                      </span>
                    </td>

                    {/* Lama */}
                    <td className="py-3 px-4 text-center">
                      {request.status === "DIPINJAM" ? `${daysBorrowed} hari` : "-"}
                    </td>

                    {/* PJ */}
                    <td className="py-3 px-4 text-center">
                      {request.penanggungJawab || "-"}
                    </td>

                    {/* Catatan */}
                    <td className="py-3 px-4 text-left">
                      {request.catatan || "-"}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-center min-w-[180px]">
                      {/* ...button logic sama dengan kode kamu */}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CARD VIEW (mobile) */}
        <div className="md:hidden space-y-4">
          {filteredRequests.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            const borrowDate = request.tanggalDipinjam
              ? new Date(request.tanggalDipinjam)
              : new Date(request.tanggalDisetujui || request.tanggalPengajuan);
            const daysBorrowed = Math.floor(
              (Date.now() - borrowDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={request.id}
                className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{request.user.nama}</p>
                    <p className="text-xs text-gray-500">{request.user.email}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}
                  >
                    {statusInfo.icon}
                    {statusInfo.text}
                  </span>
                </div>

                {/* Body */}
                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  <p><span className="font-semibold">Barang:</span> {request.barang.nama}</p>
                  <p><span className="font-semibold">Kode:</span> {request.barang.kodeBarang}</p>
                  <p><span className="font-semibold">Pengajuan:</span> {new Date(request.tanggalPengajuan).toLocaleDateString("id-ID")}</p>
                  <p><span className="font-semibold">Dipinjam:</span> {request.tanggalDipinjam ? new Date(request.tanggalDipinjam).toLocaleDateString("id-ID") : "-"}</p>
                  <p><span className="font-semibold">Lama:</span> {request.status === "DIPINJAM" ? `${daysBorrowed} hari` : "-"}</p>
                  <p><span className="font-semibold">PJ:</span> {request.penanggungJawab || "-"}</p>
                  <p><span className="font-semibold">Catatan:</span> {request.catatan || "-"}</p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {/* ...button logic sama */}
                </div>
              </div>
            );
          })}
        </div>
      </>
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