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
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { Peminjaman } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

const statusLabels: Record<'ALL' | 'PENDING' | 'DISETUJUI' | 'DIPINJAM' | 'DITOLAK' | 'DIKEMBALIKAN', string> = {
  ALL: "Semua",
  PENDING: "Menunggu",
  DISETUJUI: "Disetujui",
  DIPINJAM: "Dipinjam",
  DITOLAK: "Ditolak",
  DIKEMBALIKAN: 'Dikembalikan'
};

export default function UserStatusPage() {
  const { user } = useAuth();
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'DISETUJUI' | 'DIPINJAM' | 'DITOLAK' | 'DIKEMBALIKAN'>('ALL');

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

  // ✅ fungsi exportHistory dipindahkan ke sini
  const exportHistory = () => {
    try {
      console.log('Export data sample:', filteredPeminjaman[0]);
      
      const headers = [
        "Nama Barang",
        "Kode Barang",
        "Kategori",
        "Merek",
        "Lokasi",
        "Status",
        "Tanggal Pengajuan",
        "Tanggal Selesai",
      ];

      const csvData = filteredPeminjaman.map((item) => {
        const row = [
          item.barang.nama,
          item.barang.kodeBarang,
          item.barang.kategori?.nama || "",
          item.barang.merek?.nama || "",
          item.barang.lokasi?.nama || "",
          item.status === "DIKEMBALIKAN"
            ? "Dikembalikan"
            : item.status === "DITOLAK"
              ? "Ditolak"
              : item.status,
          new Date(item.tanggalPengajuan).toLocaleDateString("id-ID"),
          item.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString("id-ID")
            : "",
        ];
        return row;
      });

      const csvContent = [headers, ...csvData]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `riwayat-peminjaman-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
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
      'DISETUJUI': {
        icon: <CheckCircle size={16} />,
        text: 'Disetujui',
        color: 'bg-green-100 text-green-800',
        bgColor: 'bg-green-50'
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
  const approvedCount = peminjaman.filter(item => item.status === 'DISETUJUI').length;
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
    <DashboardLayout title="Status Peminjaman">
      <div className="space-y-6">
        {/* ...stat cards tetap sama... */}

        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'ALL'
                ? 'Semua Peminjaman'
                : `Peminjaman ${statusLabels[activeTab]}`}
            </h2>

            {/* ✅ tombol Export CSV sekarang sudah bisa akses exportHistory */}
            <Button
              onClick={exportHistory}
              className="bg-blue-950 hover:bg-blue-900 text-white"
            >
              Export CSV
            </Button>
          </div>
          {/* ...lanjutan list tetap sama... */}
        </div>
      </div>
    </DashboardLayout>
  );
}
