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
import Cookies from "js-cookie";
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
import { exportBarangStatisticsPDF } from "@/utils/pdfExport";

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
        ].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
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

  if (!user) return <div className="text-center py-10">Loading...</div>;
  if (!isAdmin) return <div className="text-center py-10">Access denied</div>;

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Selamat datang, Admin {user.nama}</h2>
            <p className="text-gray-500 text-sm">
              Panel kontrol untuk mengelola seluruh sistem inventaris
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExportStatistics}
            disabled={loadingStats || !statistics}
            className="flex items-center gap-2"
          >
            <FileText size={16} /> Export PDF Statistik
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: <Package className="h-6 w-6 text-blue-600" />,
              bg: "bg-blue-100",
              label: "Total Barang",
              value: statistics?.totalBarang || 0,
            },
            {
              icon: <Users className="h-6 w-6 text-green-600" />,
              bg: "bg-green-100",
              label: "Total Users",
              value: statistics?.totalUserRoleUsers || 0,
            },
            {
              icon: <TrendingUp className="h-6 w-6 text-green-600" />,
              bg: "bg-green-100",
              label: "Barang Baik",
              value: statistics?.barangBaik || 0,
            },
            {
              icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
              bg: "bg-orange-100",
              label: "Barang Rusak",
              value: statistics?.barangRusak || 0,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
            >
              <div className={`p-3 rounded-lg ${item.bg}`}>{item.icon}</div>
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-lg font-semibold">{loadingStats ? "..." : item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <Settings size={20} /> <span className="font-medium">Manajemen Master Data</span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button onClick={() => setIsBarangModalOpen(true)}>
              <Package size={20} /> Tambah Barang
            </Button>
            <Button onClick={() => router.push("/admin/kategori")}>
              <Tag size={20} /> Kelola Kategori
            </Button>
            <Button variant="secondary" onClick={() => setIsLokasiModalOpen(true)}>
              <Building size={20} /> Tambah Lokasi
            </Button>
            <Button variant="secondary" onClick={() => setIsMerekModalOpen(true)}>
              <Package size={20} /> Tambah Merek
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Aktivitas Terbaru</h3>
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/peminjaman/reports")}>
              Lihat Semua
            </Button>
          </div>
          {loadingActivity ? (
            <div className="p-6 text-center text-gray-500">Memuat aktivitas...</div>
          ) : recentActivity.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Belum ada aktivitas</div>
          ) : (
            <div className="divide-y">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 flex justify-between items-center hover:bg-gray-50 transition"
                  onClick={() => router.push(`/admin/peminjaman/${activity.id}`)}
                >
                  <div>
                    <p className="font-medium">{activity.user.nama} - {activity.barang.nama}</p>
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
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activity.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : activity.status === "DIPINJAM"
                      ? "bg-green-100 text-green-800"
                      : activity.status === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
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
