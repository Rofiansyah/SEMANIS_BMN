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
  Eye,
  Download,
  ClipboardList,
  Tag,
  Building,
  MapPin,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { Peminjaman } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

const statusLabels: Record<'ALL' | 'PENDING' | 'DIPINJAM' | 'DITOLAK' | 'DIKEMBALIKAN', string> = {
  ALL: "Semua",
  PENDING: "Menunggu",
  DIPINJAM: "Dipinjam",
  DITOLAK: "Ditolak",
  DIKEMBALIKAN: 'Dikembalikan'
};

export default function UserStatusPage() {
  const { user } = useAuth();
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'DIPINJAM' | 'DITOLAK' | 'DIKEMBALIKAN'>('ALL');

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
      setPeminjaman(data);
    } catch (error) {
      console.error('Error fetching peminjaman:', error);
      toast.error('Gagal memuat status peminjaman');
    } finally {
      setLoading(false);
    }
  };

// Fungsi export history ke CSV
const exportHistory = () => {
  try {
    if (!filteredPeminjaman || filteredPeminjaman.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    // Header CSV
    const headers = [
      "Nama Barang",
      "Deskripsi",
      "Kode Barang",
      "Kategori",
      "Merek",
      "Lokasi",
      "Status",
      "Tanggal Pengajuan",
      "Tanggal Selesai",
    ];

    // Format tanggal (DD/MM/YYYY)
    const formatDate = (dateString?: string) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Isi CSV
    const csvData = filteredPeminjaman.map((item) => [
      item.barang?.nama || "",
      item.barang?.deskripsi || "",
      item.barang?.kodeBarang || "",
      item.barang?.kategori?.nama || "",
      item.barang?.merek?.nama || "",
      item.barang?.lokasi?.nama || "",
      item.status === "DIKEMBALIKAN"
        ? "Dikembalikan"
        : item.status === "DITOLAK"
        ? "Ditolak"
        : item.status || "",
      formatDate(item.tanggalPengajuan),
      formatDate(item.updatedAt),
    ]);

    // Gabung header + data
    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    // Generate file CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Buat link download
    const link = document.createElement("a");
    link.href = url;
    link.download = `riwayat-peminjaman-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Data riwayat berhasil diexport");
  } catch (error) {
    console.error("Error exporting history:", error);
    toast.error("Gagal mengexport data riwayat");
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

  const filteredPeminjaman =
    activeTab === 'ALL'
      ? peminjaman
      : peminjaman.filter(item => item.status === activeTab);

  const allCount = peminjaman.length;
  const pendingCount = peminjaman.filter(item => item.status === 'PENDING').length;
  const borrowedCount = peminjaman.filter(item => item.status === 'DIPINJAM').length;
  const rejectedCount = peminjaman.filter(item => item.status === 'DITOLAK').length;
  const returnedCount = peminjaman.filter(item => item.status === 'DIKEMBALIKAN').length;

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
    <DashboardLayout title="Peminjaman Barang">
      <div className="space-y-6">
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
                <p className="text-sm text-gray-600">DITOLAK</p>
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
                <p className="text-sm text-gray-600">DIKEMBALIKAN</p>
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
          {activeTab === 'ALL'
            ? 'Semua Peminjaman'
            : `Peminjaman ${statusLabels[activeTab]}`}
        </h2>

        {/* Tombol Export */}
        <Button
          variant="primary"
          onClick={exportHistory}
          className="w-full sm:w-auto bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {filteredPeminjaman.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'PENDING' 
                ? 'Tidak ada permintaan pending'
                : activeTab === 'DIPINJAM'
                  ? 'Tidak ada barang yang sedang dipinjam'
                  : activeTab === 'DIKEMBALIKAN'
                    ? 'Belum ada barang yang dikembalikan'
                    : activeTab === 'DITOLAK'
                      ? 'Tidak ada permintaan yang ditolak'
                      : 'Belum ada permintaan peminjaman'}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              {activeTab === 'PENDING'
                ? 'Semua permintaan peminjaman Anda sudah diproses'
                : activeTab === 'DIPINJAM'
                  ? 'Anda belum meminjam barang apapun saat ini'
                  : activeTab === 'DITOLAK'
                    ? 'Belum ada riwayat barang yang telah Anda kembalikan'
                    : activeTab === 'DIKEMBALIKAN'
                      ? 'Tidak ada riwayat permintaan peminjaman yang ditolak'
                      : 'Silakan ajukan peminjaman barang terlebih dahulu'}
            </p>
            <Link href="/dashboard">
              <Button className="bg-blue-950 hover:bg-blue-900 text-white">
                Cari Barang untuk Dipinjam
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPeminjaman.map((item) => {
              const statusInfo = getStatusInfo(item.status);

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${statusInfo.bgColor}`}
                >
                  {/* Header Card */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Foto */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.barang.fotoUrl ? (
                          <img
                            src={item.barang.fotoUrl}
                            alt={item.barang.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {item.barang.nama}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.barang?.deskripsi}
                        </p>
                      </div>
                    </div>

                    <Link href={`/user/items/${item.barang.id}`}>
                      <Button size="sm" variant="outline" className="flex items-center text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200">
                        <Eye className="w-3 h-3 mr-1"/>
                        Lihat
                      </Button>
                    </Link>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span>Kode: {item.barang.kodeBarang}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span>{item.barang.kategori?.nama}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span>{item.barang.merek?.nama}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{item.barang.lokasi?.nama}</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                    <div className="space-y-1.5 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>Diajukan : {new Date(item.tanggalPengajuan).toLocaleDateString('id-ID')}</span>
                      </div>
                      {item.tanggalDisetujui && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>Disetujui : {new Date(item.tanggalDisetujui).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                      {item.tanggalDipinjam && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>Dipinjam : {new Date(item.tanggalDipinjam).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                      {item.tanggalDikembalikan && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>Dikembalikan : {new Date(item.tanggalDikembalikan).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dokumentasi */}
                  {(item.fotoPinjam || item.fotoKembali) && (
                    <div className="mb-4 border-b border-gray-200 pb-3">
                      <h4 className="font-medium text-gray-900 mb-2">Dokumentasi</h4>
                      <ul className="list-disc pl-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {item.fotoPinjam && (
                          <li>
                            <p className="text-sm text-gray-700 font-medium mb-1">Foto Saat Dipinjam</p>
                            <img
                              src={item.fotoPinjam}
                              alt="Foto saat dipinjam"
                              className="w-full h-full object-cover rounded-lg cursor-pointer"
                              onClick={() => window.open(item.fotoPinjam!, "_blank")}
                            />
                          </li>
                        )}
                        {item.fotoKembali && (
                          <li>
                            <p className="text-sm text-gray-700 font-medium mb-1">Foto Saat Dikembalikan</p>
                            <img
                              src={item.fotoKembali}
                              alt="Foto saat dikembalikan"
                              className="w-full h-full object-cover rounded-lg cursor-pointer"
                              onClick={() => window.open(item.fotoKembali!, "_blank")}
                            />
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Catatan */}
                  {item.catatan && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-1">Catatan</h4>
                      <p className="text-sm text-gray-700">{item.catatan}</p>
                    </div>
                  )}

                  {/* Penanggung Jawab */}
                  {(item.penanggungJawab || item.approvedByUser) && (
                    <div className="pt-3 border-t border-gray-200 text-sm text-gray-700">
                      {item.penanggungJawab && (
                        <p><span className="font-medium">Penanggung Jawab :</span> {item.penanggungJawab}</p>
                      )}
                      {item.approvedByUser && (
                        <p><span className="font-medium">Diproses oleh  :</span> {item.approvedByUser.nama}</p>
                      )}
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
