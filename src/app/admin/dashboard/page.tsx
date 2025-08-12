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
  Building,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  kategoriApi,
  merekApi,
  lokasiApi,
  statisticsApi,
  peminjamanApi,
} from "@/lib/api";
import type { Kategori, Merek, Lokasi, Statistics, Peminjaman } from "@/types/api";
import { exportBarangStatisticsPDF } from "@/utils/pdfExport";

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

    if (user && isAdmin) {
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
      const token = Cookies.get("token");
      if (!token) {
        setStatistics({
          totalBarang: 0,
          totalUserRoleUsers: 0,
          barangBaik: 0,
          barangRusak: 0,
        });
        return;
      }
      const response = await statisticsApi.get();
      if (response.success) {
        setStatistics(response.data);
      } else {
        setStatistics({
          totalBarang: 0,
          totalUserRoleUsers: 0,
          barangBaik: 0,
          barangRusak: 0,
        });
      }
    } catch (error) {
      console.error("Failed to load statistics:", error);
      setStatistics({
        totalBarang: 0,
        totalUserRoleUsers: 0,
        barangBaik: 0,
        barangRusak: 0,
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
        const allRequests = [
          ...response.data.pending,
          ...response.data.dipinjam,
          ...response.data.dikembalikan,
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentActivity(allRequests.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to load recent activity:", error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleExportStatistics = () => {
    if (statistics) {
      const totalRusak = statistics.barangRusak;
      const barangRusakRingan = Math.floor(totalRusak / 2);
      const barangRusakBerat = totalRusak - barangRusakRingan;
      exportBarangStatisticsPDF({
        totalBarang: statistics.totalBarang,
        barangBaik: statistics.barangBaik,
        barangRusakRingan,
        barangRusakBerat,
      });
    }
  };

  const handleModalSuccess = () => {
    loadMasterData();
    loadStatistics();
  };

  if (!user) return <div>Loading...</div>;
  if (!isAdmin) return <div>Access denied</div>;

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Selamat datang, Admin {user.nama}</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Panel kontrol untuk mengelola seluruh sistem inventaris
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExportStatistics}
            disabled={loadingStats || !statistics}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <FileText size={16} />
            Export PDF Statistik
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Barang", value: statistics?.totalBarang || 0, icon: Package, color: "blue" },
            { label: "Total Users", value: statistics?.totalUserRoleUsers || 0, icon: Users, color: "green" },
            { label: "Barang Kondisi Baik", value: statistics?.barangBaik || 0, icon: TrendingUp, color: "green" },
            { label: "Barang Kondisi Rusak", value: statistics?.barangRusak || 0, icon: AlertTriangle, color: "orange" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 flex items-center">
              <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold">{loadingStats ? "..." : stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Master Data Management */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <Settings size={18} />
            <h3 className="text-sm font-semibold">Manajemen Master Data</h3>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="secondary" className="w-full h-14 text-sm font-medium flex items-center gap-2 justify-center" onClick={() => setIsBarangModalOpen(true)}>
              <Package size={18} /> Tambah Barang
            </Button>
            <Button variant="secondary" className="w-full h-14 text-sm font-medium flex items-center gap-2 justify-center" onClick={() => setIsKategoriModalOpen(true)}>
              <Tag size={18} /> Tambah Kategori
            </Button>
            <Button variant="secondary" className="w-full h-14 text-sm font-medium flex items-center gap-2 justify-center" onClick={() => setIsMerekModalOpen(true)}>
              <Tag size={18} /> Tambah Merek
            </Button>
            <Button variant="secondary" className="w-full h-14 text-sm font-medium flex items-center gap-2 justify-center" onClick={() => setIsLokasiModalOpen(true)}>
              <Building size={18} /> Tambah Lokasi
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold">Aktivitas Terbaru</h3>
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/peminjaman/reports")}>
              Lihat Semua
            </Button>
          </div>
          <div className="divide-y divide-gray-100">
            {loadingActivity ? (
              <div className="p-4 text-center text-gray-500">Memuat aktivitas...</div>
            ) : recentActivity.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Belum ada aktivitas</div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/peminjaman/${activity.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.user.nama} - {activity.barang.nama}</p>
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
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TambahBarangModal isOpen={isBarangModalOpen} onClose={() => setIsBarangModalOpen(false)} onSuccess={handleModalSuccess} kategoriList={kategoriList} merekList={merekList} lokasiList={lokasiList} />
      <TambahKategoriModal isOpen={isKategoriModalOpen} onClose={() => setIsKategoriModalOpen(false)} onSuccess={handleModalSuccess} />
      <TambahMerekModal isOpen={isMerekModalOpen} onClose={() => setIsMerekModalOpen(false)} onSuccess={handleModalSuccess} />
      <TambahLokasiModal isOpen={isLokasiModalOpen} onClose={() => setIsLokasiModalOpen(false)} onSuccess={handleModalSuccess} />
    </DashboardLayout>
  );
}
