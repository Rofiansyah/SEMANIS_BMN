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
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentActivity(allRequests.slice(0, 5));
      }
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
        barangRusakRingan: barangRusakRingan,
        barangRusakBerat: barangRusakBerat,
      });
    }
  };

  if (!user) return <div>Loading...</div>;
  if (!isAdmin) return <div>Access denied</div>;

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: number | string;
    icon: any;
    color: string;
  }) => (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 shadow-lg transition-transform hover:scale-[1.02]`}
    >
      <div className="absolute right-4 top-4 opacity-20">
        <Icon size={48} />
      </div>
      <h4 className="text-sm font-medium text-white">{title}</h4>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Selamat datang, {user.nama}
            </h2>
            <p className="text-gray-500">
              Panel kontrol untuk mengelola sistem inventaris
            </p>
          </div>
          <Button
            onClick={handleExportStatistics}
            disabled={loadingStats || !statistics}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2"
          >
            <FileText size={16} />
            <span>Export Statistik</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Barang"
            value={loadingStats ? "..." : statistics?.totalBarang || 0}
            icon={Package}
            color="from-blue-500 to-indigo-500"
          />
          <StatCard
            title="Total Users"
            value={loadingStats ? "..." : statistics?.totalUserRoleUsers || 0}
            icon={Users}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            title="Barang Baik"
            value={loadingStats ? "..." : statistics?.barangBaik || 0}
            icon={TrendingUp}
            color="from-teal-500 to-cyan-500"
          />
          <StatCard
            title="Barang Rusak"
            value={loadingStats ? "..." : statistics?.barangRusak || 0}
            icon={AlertTriangle}
            color="from-orange-500 to-red-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings size={20} /> Manajemen Master Data
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="secondary"
              className="rounded-xl h-16"
              onClick={() => setIsBarangModalOpen(true)}
            >
              <Package size={20} /> Tambah Barang
            </Button>
            <Button
              variant="secondary"
              className="rounded-xl h-16"
              onClick={() => setIsKategoriModalOpen(true)}
            >
              <Tag size={20} /> Tambah Kategori
            </Button>
            <Button
              variant="secondary"
              className="rounded-xl h-16"
              onClick={() => setIsMerekModalOpen(true)}
            >
              <Tag size={20} /> Tambah Merek
            </Button>
            <Button
              variant="secondary"
              className="rounded-xl h-16"
              onClick={() => setIsLokasiModalOpen(true)}
            >
              <Building size={20} /> Tambah Lokasi
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Aktivitas Terbaru</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/peminjaman/reports")}
              className="rounded-lg text-gray-600"
            >
              Lihat Semua
            </Button>
          </div>
          {loadingActivity ? (
            <div className="p-6 text-center text-gray-500">Memuat...</div>
          ) : recentActivity.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Tidak ada aktivitas
            </div>
          ) : (
            <div className="divide-y">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  onClick={() =>
                    router.push(`/admin/peminjaman/${activity.id}`)
                  }
                >
                  <div>
                    <p className="font-medium">
                      {activity.user.nama} - {activity.barang.nama}
                    </p>
                    <p className="text-sm text-gray-500">
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
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                      ? "Dipinjam"
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
        onSuccess={loadMasterData}
        kategoriList={kategoriList}
        merekList={merekList}
        lokasiList={lokasiList}
      />
      <TambahKategoriModal
        isOpen={isKategoriModalOpen}
        onClose={() => setIsKategoriModalOpen(false)}
        onSuccess={loadMasterData}
      />
      <TambahMerekModal
        isOpen={isMerekModalOpen}
        onClose={() => setIsMerekModalOpen(false)}
        onSuccess={loadMasterData}
      />
      <TambahLokasiModal
        isOpen={isLokasiModalOpen}
        onClose={() => setIsLokasiModalOpen(false)}
        onSuccess={loadMasterData}
      />
    </DashboardLayout>
  );
}
