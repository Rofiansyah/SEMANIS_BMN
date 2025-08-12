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
    } catch {
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
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
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

  if (!user) return <div>Loading...</div>;
  if (!isAdmin) return <div>Access denied</div>;

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Selamat datang, Admin {user.nama}
            </h2>
            <p className="text-gray-500">
              Panel kontrol untuk mengelola seluruh sistem inventaris
            </p>
          </div>
          <Button
            onClick={handleExportStatistics}
            disabled={loadingStats || !statistics}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-5 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={18} />
            Export PDF Statistik
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Barang",
              value: statistics?.totalBarang || 0,
              icon: <Package className="h-6 w-6 text-blue-600" />,
              bg: "bg-blue-100",
            },
            {
              label: "Total Users",
              value: statistics?.totalUserRoleUsers || 0,
              icon: <Users className="h-6 w-6 text-green-600" />,
              bg: "bg-green-100",
            },
            {
              label: "Barang Kondisi Baik",
              value: statistics?.barangBaik || 0,
              icon: <TrendingUp className="h-6 w-6 text-green-600" />,
              bg: "bg-green-100",
            },
            {
              label: "Barang Kondisi Rusak",
              value: statistics?.barangRusak || 0,
              icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
              bg: "bg-orange-100",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition"
            >
              <div className={`${stat.bg} p-3 rounded-lg`}>{stat.icon}</div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingStats ? "..." : stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings size={20} /> Manajemen Master Data
            </h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              variant="secondary"
              className="flex items-center justify-center gap-2 h-14"
              onClick={() => setIsBarangModalOpen(true)}
            >
              <Package size={20} />
              Tambah Barang
            </Button>
            <Button
              variant="secondary"
              className="flex items-center justify-center gap-2 h-14"
              onClick={() => router.push("/admin/kategori")}
            >
              <Tag size={20} />
              Kelola Kategori
            </Button>
            <Button
              variant="secondary"
              className="flex items-center justify-center gap-2 h-14"
              onClick={() => setIsMerekModalOpen(true)}
            >
              <Tag size={20} />
              Tambah Merek
            </Button>
            <Button
              variant="secondary"
              className="flex items-center justify-center gap-2 h-14"
              onClick={() => setIsLokasiModalOpen(true)}
            >
              <Building size={20} />
              Tambah Lokasi
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Aktivitas Terbaru</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/peminjaman/reports")}
            >
              Lihat Semua
            </Button>
          </div>
          {loadingActivity ? (
            <div className="p-6 text-center text-gray-500">Memuat aktivitas...</div>
          ) : recentActivity.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Belum ada aktivitas untuk ditampilkan
            </div>
          ) : (
            <div className="divide-y">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-6 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition"
                  onClick={() =>
                    router.push(`/admin/peminjaman/${activity.id}`)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user.nama} - {activity.barang.nama}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          activity.tanggalPengajuan
                        ).toLocaleDateString("id-ID", {
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
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
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
