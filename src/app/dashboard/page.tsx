"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Filter,
  Eye,
  Package,
  MapPin,
  Tag,
  Bookmark,
  Building,
  History,
} from "lucide-react";
import api from "@/lib/api";
import { Barang, Kategori, Merek, Lokasi } from "@/types/api";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import logoSemantis from './logo_semantis.png';

export default function DashboardUserPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  // Stats state
  const [stats, setStats] = useState({
    totalBarang: 0,
    totalKategori: 0,
    totalMerek: 0,
    totalLokasi: 0,
    myPeminjaman: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Barang search state
  const [barang, setBarang] = useState<Barang[]>([]);
  const [filteredBarang, setFilteredBarang] = useState<Barang[]>([]);
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [brands, setBrands] = useState<Merek[]>([]);
  const [locations, setLocations] = useState<Lokasi[]>([]);
  const [loadingBarang, setLoadingBarang] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortBy, setSortBy] = useState("nama");
  const [showFilters, setShowFilters] = useState(false);

  // Redirect admin & fetch stats
  useEffect(() => {
    if (user && isAdmin) {
      router.push("/admin/dashboard");
    } else if (user && !isAdmin) {
      fetchUserStats();
      fetchData();
    }
  }, [user, isAdmin, router]);

  const fetchUserStats = async () => {
    try {
      setLoadingStats(true);
      const [barangRes, kategoriRes, merekRes, lokasiRes, peminjamanRes] =
        await Promise.all([
          api.get("/barang"),
          api.get("/kategori"),
          api.get("/merek"),
          api.get("/lokasi"),
          api
            .get("/peminjaman/my-requests")
            .catch(() => ({ data: { data: [] } })),
        ]);

      const barangData =
        barangRes.data.data.items || barangRes.data.data || [];
      const kategoriData =
        kategoriRes.data.data.items || kategoriRes.data.data || [];
      const merekData = 
        merekRes.data.data.items || merekRes.data.data || [];
      const lokasiData =
        lokasiRes.data.data.items || lokasiRes.data.data || [];
      const peminjamanData =
        peminjamanRes.data.data || peminjamanRes.data || [];

      setStats({
        totalBarang: barangData.length,
        totalKategori: kategoriData.length,
        totalMerek: merekData.length,
        totalLokasi: lokasiData.length,
        myPeminjaman: peminjamanData.filter(
          (p: { status: string }) => p.status === "DIPINJAM"
        ).length,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast.error("Gagal memuat statistik dashboard");
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch barang data
  const fetchData = async () => {
    try {
      setLoadingBarang(true);
      const [barangRes, kategoriRes, merekRes, lokasiRes] = await Promise.all([
        api.get("/barang"),
        api.get("/kategori"),
        api.get("/merek"),
        api.get("/lokasi"),
      ]);

      setBarang(barangRes.data.data.items || barangRes.data.data || []);
      setCategories(kategoriRes.data.data.items || kategoriRes.data.data || []);
      setBrands(merekRes.data.data.items || merekRes.data.data || []);
      setLocations(lokasiRes.data.data.items || lokasiRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data barang");
    } finally {
      setLoadingBarang(false);
    }
  };

  // Filtering
  const filterAndSortBarang = useCallback(() => {
    let filtered = [...barang];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.kodeBarang.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (item) => item.kategoriId === selectedCategory
      );
    }
    if (selectedBrand) {
      filtered = filtered.filter((item) => item.merekId === selectedBrand);
    }
    if (selectedLocation) {
      filtered = filtered.filter((item) => item.lokasiId === selectedLocation);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "nama":
          return a.nama.localeCompare(b.nama);
        case "kodeBarang":
          return a.kodeBarang.localeCompare(b.kodeBarang);
        case "createdAt":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredBarang(filtered);
  }, [
    barang,
    searchTerm,
    selectedCategory,
    selectedBrand,
    selectedLocation,
    sortBy,
  ]);

  useEffect(() => {
    filterAndSortBarang();
  }, [filterAndSortBarang]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedLocation("");
    setSortBy("nama");
  };

  const getStatusBadge = (kondisi: string) => {
    const statusMap = {
      BAIK: "bg-green-100 text-green-800",
      RUSAK_RINGAN: "bg-yellow-100 text-yellow-800",
      RUSAK_BERAT: "bg-red-100 text-red-800",
    };
    const statusText = {
      BAIK: "Baik",
      RUSAK_RINGAN: "Rusak Ringan",
      RUSAK_BERAT: "Rusak Berat",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusMap[kondisi as keyof typeof statusMap] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {statusText[kondisi as keyof typeof statusText] || kondisi}
      </span>
    );
  };

if (!user) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      {/* Logo */}
      <img
        src={typeof logoSemantis === "string" ? logoSemantis : logoSemantis.src}
        alt="SEMANTIS BMN Logo"
        className="w-32 sm:w-40 md:w-48 h-auto mx-auto mb-6 animate-pulse"
      />

      {/* Ikon animasi responsif */}
      <div className="relative w-16 sm:w-20 md:w-24 lg:w-28 h-16 sm:h-20 md:h-24 lg:h-28 mb-4 flex items-center justify-center">
        {/* Efek ping responsif */}
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>

        {/* Ikon responsif dengan bounce */}
        <Package className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-blue-600 animate-bounce drop-shadow-lg" />
      </div>

      {/* Teks animasi */}
      <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 animate-pulse text-center">
        Loading...
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
  );
}

if (isAdmin) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      {/* Logo */}
      <img
        src={typeof logoSemantis === "string" ? logoSemantis : logoSemantis.src}
        alt="SEMANTIS BMN Logo"
        className="w-32 sm:w-40 md:w-48 h-auto mx-auto mb-6 animate-pulse"
      />

      {/* Ikon animasi responsif */}
      <div className="relative w-16 sm:w-20 md:w-24 lg:w-28 h-16 sm:h-20 md:h-24 lg:h-28 mb-4 flex items-center justify-center">
        {/* Efek ping responsif */}
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>

        {/* Ikon responsif dengan bounce */}
        <Package className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-blue-600 animate-bounce drop-shadow-lg" />
      </div>

      {/* Teks animasi */}
      <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 animate-pulse text-center">
        Redirecting to admin dashboard...
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
  );
}

  return (
    <DashboardLayout title="Dashboard User">
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selamat datang, {user.nama}
          </h2>
          <p className="text-gray-600">
            Akses informasi inventaris dan kelola data barang
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              label: "Total Barang",
              value: stats.totalBarang,
              icon: <Package className="h-6 w-6 text-blue-600" />,
              bg: "bg-blue-100",
            },
            {
              label: "Kategori Tersedia",
              value: stats.totalKategori,
              icon: <Tag className="h-6 w-6 text-pink-600" />,
              bg: "bg-pink-100",
            },
            {
              label: "Merek Tersedia",
              value: stats.totalMerek,
              icon: <Bookmark className="h-6 w-6 text-purple-600" />,
              bg: "bg-purple-100",
            },
            {
              label: "Lokasi Tersedia",
              value: stats.totalLokasi,
              icon: <Building className="h-6 w-6 text-orange-600" />,
              bg: "bg-orange-100",
            },
            {
              label: "Peminjaman Aktif",
              value: stats.myPeminjaman,
              icon: <History className="h-6 w-6 text-green-600" />,
              bg: "bg-green-100",
            },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingStats ? "-" : stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

  <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
    {/* Search & Filter */}
    <div className="p-4 sm:p-6 border-b">
      {/* Search & Toggle Filter */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 mb-4">
        {/* Search Box */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, deskripsi, atau kode barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Filter Button */}
        <div className="flex lg:justify-end">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 w-full sm:w-auto bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filter & Sort</span>
            <span className="sm:hidden">Filter</span>
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="border-t pt-4 mt-2 space-y-4">
          {/* Filter dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Kategori */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-900 mb-1">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Merek */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-900 mb-1">Merek</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900"
              >
                <option value="">Semua Merek</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Lokasi */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-900 mb-1">Lokasi</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900"
              >
                <option value="">Semua Lokasi</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-900 mb-1">Urutkan</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900"
              >
                <option value="nama">Nama A-Z</option>
                <option value="kodeBarang">Kode Barang</option>
                <option value="createdAt">Terbaru</option>
              </select>
            </div>
          </div>

          {/* Footer filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <p className="text-sm text-gray-700">
              Menampilkan {filteredBarang.length} dari {barang.length} barang
            </p>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
              onClick={clearFilters}
            >
              Hapus Filter
            </Button>
          </div>
        </div>
      )}
    </div>

    {/* Results */}
    <div className="p-4 sm:p-6">
      {loadingBarang ? (
        <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
          {/* Logo */}
      <img
        src={typeof logoSemantis === "string" ? logoSemantis : logoSemantis.src}
        alt="SEMANTIS BMN Logo"
        className="w-32 sm:w-40 md:w-48 h-auto mx-auto mb-6 animate-pulse"
      />

      {/* Ikon animasi responsif */}
      <div className="relative w-16 sm:w-20 md:w-24 lg:w-28 h-16 sm:h-20 md:h-24 lg:h-28 mb-4 flex items-center justify-center">
        {/* Efek ping responsif */}
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>

        {/* Ikon responsif dengan bounce */}
        <Package className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-blue-600 animate-bounce drop-shadow-lg" />
      </div>

      {/* Teks animasi */}
      <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 animate-pulse text-center">
        Loading...
      </p>

      {/* Progress Bar */}
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
      ) : filteredBarang.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBarang.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 overflow-hidden">
                {item.fotoUrl ? (
                  <img
                    src={item.fotoUrl}
                    alt={item.nama}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                    <Package size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold truncate flex-1 text-gray-900">
                    {item.nama}
                  </h3>
                  {getStatusBadge(item.kondisi)}
                </div>
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                  {item.deskripsi}
                </p>
                <div className="space-y-1 mb-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Tag size={12} className="mr-1" />
                    <span>{item.kategori?.nama}</span>
                  </div>
                  <div className="flex items-center">
                    <Bookmark size={12} className="mr-1" />
                    <span>{item.merek?.nama}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={12} className="mr-1" />
                    <span>{item.lokasi?.nama}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono">
                    {item.kodeBarang}
                  </span>
                  <Link href={`/user/items/${item.id}`}>
                    <Button
                      size="sm"
                      className="flex items-center gap-1 bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200"
                    >
                      <Eye size={14} />
                      Detail
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada barang ditemukan
          </h3>
          <p className="text-gray-600 mb-4">
            Coba ubah kriteria pencarian atau filter yang digunakan
          </p>
          <Button variant="secondary" onClick={clearFilters}>
            Hapus Semua Filter
          </Button>
        </div>
      )}
    </div>
  </div>
</div>
    </DashboardLayout>
  );
}
