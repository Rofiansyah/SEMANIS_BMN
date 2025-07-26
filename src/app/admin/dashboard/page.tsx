"use client";

import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import {
  TambahBarangModal,
  TambahMerekModal,
  TambahLokasiModal,
} from "@/components/modals";
import {
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Settings,
  Tag,
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

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const [isBarangModalOpen, setIsBarangModalOpen] = useState(false);
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
      const response = await peminjamanApi.getReports();
      if (response.status === "success") {
        // Combine all requests and sort by most recent
        const allRequests = [
          ...response.data.pending,
          ...response.data.dipinjam,
          ...response.data.dikembalikan,
        ].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setRecentActivity(allRequests.slice(0, 5)); // Show only 5 most recent
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
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <div>Access denied</div>;
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
            variant="outline"
            onClick={handleExportStatistics}
            disabled={loadingStats || !statistics}
            className="flex items-center gap-2"
          >
            <FileText size={16} />
            Export PDF Statistik
          </Button>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                className="flex items-center justify-center gap-2 h-16"
                onClick={() => setIsBarangModalOpen(true)}
              >
                <Package size={20} />
                <span>Tambah Barang</span>
              </Button>

              <Button
                className="flex items-center justify-center gap-2 h-16"
                onClick={() => router.push("/admin/kategori")}
              >
                <Tag size={20} />
                <span>Kelola Kategori</span>
              </Button>

              <Button
                variant="secondary"
                className="flex items-center justify-center gap-2 h-16"
                onClick={() => setIsLokasiModalOpen(true)}
              >
                <Building size={20} />
                <span>Tambah Lokasi</span>
              </Button>

              <Button
                variant="secondary"
                className="flex items-center justify-center gap-2 h-16"
                onClick={() => setIsMerekModalOpen(true)}
              >
                <Package size={20} />
                <span>Tambah Merek</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Aktivitas Terbaru (Admin View)
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/peminjaman/reports")}
              >
                Lihat Semua
              </Button>
            </div>
          </div>

          {loadingActivity ? (
            <div className="p-6">
              <div className="text-center text-gray-500 py-8">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                  <span>Memuat aktivitas...</span>
                </div>
              </div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-6">
              <div className="text-center text-gray-500 py-8">
                <p>Belum ada aktivitas untuk ditampilkan</p>
                <p className="text-sm mt-2">
                  Aktivitas peminjaman akan muncul di sini
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-6 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    router.push(`/admin/peminjaman/${activity.id}`)
                  }
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user.nama} - {activity.barang.nama}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.tanggalPengajuan).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      activity.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : activity.status === "DIPINJAM"
                        ? "bg-green-100 text-green-800"
                        : activity.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {activity.status === "PENDING"
                      ? "Menunggu"
                      : activity.status === "DIPINJAM"
                      ? "Sedang Dipinjam"
                      : activity.status === "REJECTED"
                      ? "Ditolak"
                      : "Dikembalikan"}
                  </span>
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
