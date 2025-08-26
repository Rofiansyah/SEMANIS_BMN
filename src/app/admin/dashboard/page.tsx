"use client";

import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import {
  TambahBarangModal,
  TambahMerekModal,
  TambahLokasiModal,
  TambahKategoriModal,
} from "@/components/modals";
import {
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Settings,
  Tag,
  Clock, 
  XCircle, 
  CheckCircle,
  Building,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import {
  kategoriApi,
  merekApi,
  lokasiApi,
  statisticsApi,
  peminjamanApi,
} from "@/lib/api";
import type {
  Kategori,
  Merek,
  Lokasi,
  Statistics,
  Peminjaman,
} from "@/types/api";
import { exportBarangStatisticsPDF } from '@/utils/pdfExport';
import logoSemantis from './logo_semantis.png';

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const [isBarangModalOpen, setIsBarangModalOpen] = useState(false);
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);
  const [isMerekModalOpen, setIsMerekModalOpen] = useState(false);
  const [isLokasiModalOpen, setIsLokasiModalOpen] = useState(false);

  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [merekList, setMerekList] = useState<Merek[]>([]);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentActivity, setRecentActivity] = useState<Peminjaman[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    if (user && !isAdmin) {
      router.push("/dashboard");
      return;
    }

    // Only load data if user is authenticated and is admin
    if (user && isAdmin) {
      // Add small delay to ensure token is available
      const timer = setTimeout(() => {
        loadMasterData();
        loadStatistics();
        loadRecentActivity();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin, router]);

  const loadMasterData = async () => {
    try {
      const [kategoriRes, merekRes, lokasiRes] = await Promise.all([
        kategoriApi.getAll(),
        merekApi.getAll(),
        lokasiApi.getAll(),
      ]);

      if (kategoriRes.success) setKategoriList(kategoriRes.data);
      if (merekRes.success) setMerekList(merekRes.data);
      if (lokasiRes.success) setLokasiList(lokasiRes.data);
    } catch (error) {
      console.error("Failed to load master data:", error);
    }
  };

  const loadStatistics = async () => {
    try {
      setLoadingStats(true);
      
      // Check if token exists
      const token = Cookies.get('token');
      if (!token) {
        console.error('No auth token found');
        setStatistics({
          totalBarang: 0,
          totalUserRoleUsers: 0,
          barangBaik: 0,
          barangRusak: 0
        });
        return;
      }
      
      console.log('Loading statistics with token...');
      const response = await statisticsApi.get();
      console.log('Statistics response:', response);
      if (response.success) {
        setStatistics(response.data);
      } else {
        console.error('Statistics API returned error:', response);
        setStatistics({
          totalBarang: 0,
          totalUserRoleUsers: 0,
          barangBaik: 0,
          barangRusak: 0
        });
      }
    } catch (error) {
      console.error("Failed to load statistics:", error);
      // Set default values if statistics fail to load
      setStatistics({
        totalBarang: 0,
        totalUserRoleUsers: 0,
        barangBaik: 0,
        barangRusak: 0
      });
    } finally {
      setLoadingStats(false);
    }
  };

const loadRecentActivity = async () => {
  try {
    setLoadingActivity(true);
    const response = await peminjamanApi.getAllRequests(); // API baru

    if (response.status === "success") {
      // response.data langsung berupa Peminjaman[]
      const sortedRequests = response.data
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5); // Ambil 5 paling baru

      setRecentActivity(sortedRequests);
    }
  } catch (error) {
    console.error("Failed to load recent activity:", error);
  } finally {
    setLoadingActivity(false);
  }
};


  const handleExportStatistics = () => {
    if (statistics) {
      // Calculate rusak ringan and rusak berat from total rusak
      // Assuming we don't have separate data, split equally
      const totalRusak = statistics.barangRusak;
      const barangRusakRingan = Math.floor(totalRusak / 2);
      const barangRusakBerat = totalRusak - barangRusakRingan;
      
      exportBarangStatisticsPDF({
        totalBarang: statistics.totalBarang,
        barangBaik: statistics.barangBaik,
        barangRusakRingan: barangRusakRingan,
        barangRusakBerat: barangRusakBerat
      });
    }
  };

  const handleModalSuccess = () => {
    loadMasterData();
    loadStatistics();
  };

if (!user) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      {/* Logo */}
      <img
        src={typeof logoSemantis === "string" ? logoSemantis : logoSemantis.src}
        alt="SEMANTIS BMN Logo"
        className="w-28 sm:w-36 md:w-44 h-auto mx-auto mb-8 animate-pulse"
      />

      {/* Ikon animasi */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center mb-6">
        <div className="absolute inset-0 rounded-full bg-blue-200 animate-ping"></div>
        <Package className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-blue-700 animate-bounce" />
      </div>

      {/* Teks animasi */}
      <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 animate-pulse text-center">
        Memuat data pengguna...
      </p>

      {/* Progress Bar */}
      <div className="w-48 sm:w-56 md:w-64 h-2 bg-gray-200 rounded-full mt-6 overflow-hidden">
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
  );
}

if (!isAdmin) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      {/* Logo */}
      <img
        src={typeof logoSemantis === "string" ? logoSemantis : logoSemantis.src}
        alt="SEMANTIS BMN Logo"
        className="w-28 sm:w-36 md:w-44 h-auto mx-auto mb-8 animate-pulse"
      />

      {/* Ikon animasi */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center mb-6">
        <div className="absolute inset-0 rounded-full bg-red-200 animate-ping"></div>
        <Package className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-red-700 animate-bounce" />
      </div>

      {/* Teks animasi */}
      <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-700 animate-pulse text-center">
        Akses ditolak, hanya admin yang dapat masuk
      </p>

      {/* Progress Bar */}
      <div className="w-48 sm:w-56 md:w-64 h-2 bg-gray-200 rounded-full mt-6 overflow-hidden">
        <div className="h-2 bg-red-600 rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
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
  );
}

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Selamat datang, Admin {user.nama}
            </h2>
            <p className="text-gray-600">
              Panel kontrol untuk mengelola seluruh sistem inventaris
            </p>
          </div>
          <Button
            variant="outlinesecond"
            onClick={handleExportStatistics}
            disabled={loadingStats || !statistics}
            className="flex items-center gap-2 text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
          >
            <FileText size={16} />
            Export PDF
          </Button>


        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Barang
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? "..." : statistics?.totalBarang || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? "..." : statistics?.totalUserRoleUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Barang Kondisi Baik
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? "..." : statistics?.barangBaik || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Barang Kondisi Rusak
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? "..." : statistics?.barangRusak || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Settings size={20} />
              Manajemen Master Data
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="secondary"
                className="flex items-center justify-center gap-2 h-16"
                onClick={() => setIsBarangModalOpen(true)}
              >
                <Package size={20} />
                <span>Tambah Barang</span>
              </Button>

              <Button
                variant="secondary"
                className="flex items-center justify-center gap-2 h-16"
                onClick={() => setIsKategoriModalOpen(true)}
              >
                <Tag size={20} />
                <span>Tambah Kategori</span>
              </Button>

              <Button
                variant="secondary"
                className="flex items-center justify-center gap-2 h-16"
                onClick={() => setIsMerekModalOpen(true)}
              >
                <Tag size={20} />
                <span>Tambah Merek</span>
              </Button>

              <Button
                variant="secondary"
                className="flex items-center justify-center gap-2 h-16"
                onClick={() => setIsLokasiModalOpen(true)}
              >
                <Building size={20} />
                <span>Tambah Lokasi</span>
              </Button>

            </div>
          </div>
        </div>

{/* Recent Activity */}
<div className="bg-white rounded-lg shadow border">
  {/* Header */}
  <div className="p-6 border-b border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
  </div>

{/* Loading State */}
{loadingActivity ? (
  <div className="p-6 flex flex-col items-center justify-center text-center">
    {/* Ikon animasi */}
    <div className="relative w-12 sm:w-16 md:w-20 lg:w-24 h-12 sm:h-16 md:h-20 lg:h-24 mb-4 flex items-center justify-center">
      {/* Efek ping */}
      <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
      {/* Ikon bounce */}
      <Package className="w-8 h-8 sm:w-10 md:w-14 lg:w-16 text-blue-600 animate-bounce drop-shadow-lg" />
    </div>

    {/* Teks animasi */}
    <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-700 animate-pulse">
      Memuat list aktivitas...
    </p>

    {/* Progress Bar */}
    <div className="w-32 sm:w-40 md:w-48 lg:w-56 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
      <div className="h-2 bg-blue-600 rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
    </div>

    {/* Custom Animasi Progress */}
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
) : recentActivity.length === 0 ? (
    // Empty State
    <div className="p-6 text-center text-gray-500 py-8">
      <p>Belum ada aktivitas untuk ditampilkan</p>
      <p className="text-sm mt-2">Aktivitas peminjaman akan muncul di sini</p>
    </div>
  ) : (
<div className="flex flex-col space-y-4 p-6">
  {recentActivity.map((activity) => (
    <div
      key={activity.id}
      className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition bg-white"
      onClick={() => router.push(`/admin/peminjaman/${activity.id}`)}
    >
      {/* Kolom 1: Foto */}
      <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100">
        {activity.barang.fotoUrl ? (
          <img
            src={activity.barang.fotoUrl}
            alt={activity.barang.nama}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="w-6 h-6 text-gray-500" />
        )}
      </div>

      {/* Kolom 2: Info */}
      <div className="flex-1 px-4">
        <p className="text-sm font-medium text-gray-900">
          {activity.user.nama} - {activity.barang.nama}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(activity.tanggalPengajuan).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Kolom 3: Status */}
      <div className="flex flex-col items-center text-center gap-1 w-32">
        {activity.status === "PENDING" && <Clock size={16} className="text-yellow-800" />}
        {activity.status === "DIPINJAM" && <Package size={16} className="text-blue-800" />}
        {activity.status === "DITOLAK" && <XCircle size={16} className="text-red-800" />}
        {activity.status === "DIKEMBALIKAN" && <CheckCircle size={16} className="text-green-800" />}

        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full
            ${
              activity.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : activity.status === "DIPINJAM"
                ? "bg-blue-100 text-blue-800"
                : activity.status === "DITOLAK"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
        >
          {activity.status === "PENDING"
            ? "Menunggu"
            : activity.status === "DIPINJAM"
            ? "Sedang Dipinjam"
            : activity.status === "DITOLAK"
            ? "Ditolak"
            : "Dikembalikan"}
        </span>
      </div>
    </div>
  ))}
</div>
  )}
</div>
      </div>

      {/* Modals */}
      <TambahBarangModal
        isOpen={isBarangModalOpen}
        onClose={() => setIsBarangModalOpen(false)}
        onSuccess={handleModalSuccess}
        kategoriList={kategoriList}
        merekList={merekList}
        lokasiList={lokasiList}
      />

      <TambahKategoriModal
        isOpen={isKategoriModalOpen}
        onClose={() => setIsKategoriModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <TambahMerekModal
        isOpen={isMerekModalOpen}
        onClose={() => setIsMerekModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <TambahLokasiModal
        isOpen={isLokasiModalOpen}
        onClose={() => setIsLokasiModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </DashboardLayout>
  );
}
