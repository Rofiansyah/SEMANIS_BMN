"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

export default function DashboardUserPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  // Stats state
  const [stats, setStats] = useState({
    totalBarang: 0,
    totalKategori: 0,
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
      const [barangRes, kategoriRes, lokasiRes, peminjamanRes] =
        await Promise.all([
          api.get("/barang"),
          api.get("/kategori"),
          api.get("/lokasi"),
          api
            .get("/peminjaman/my-requests")
            .catch(() => ({ data: { data: [] } })),
        ]);

      const barangData =
        barangRes.data.data.items || barangRes.data.data || [];
      const kategoriData =
        kategoriRes.data.data.items || kategoriRes.data.data || [];
      const lokasiData =
        lokasiRes.data.data.items || lokasiRes.data.data || [];
      const peminjamanData =
        peminjamanRes.data.data || peminjamanRes.data || [];

      setStats({
        totalBarang: barangData.length,
        totalKategori: kategoriData.length,
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
    return <div>Loading...</div>;
  }
  if (isAdmin) {
    return <div>Redirecting to admin dashboard...</div>;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              icon: <Tag className="h-6 w-6 text-green-600" />,
              bg: "bg-green-100",
            },
            {
              label: "Lokasi Tersedia",
              value: stats.totalLokasi,
              icon: <Building className="h-6 w-6 text-purple-600" />,
              bg: "bg-purple-100",
            },
            {
              label: "Peminjaman Aktif",
              value: stats.myPeminjaman,
              icon: <History className="h-6 w-6 text-orange-600" />,
              bg: "bg-orange-100",
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

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari berdasarkan nama, deskripsi, atau kode barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Filter & Sort
            </Button>
          </div>

          {showFilters && (
            <div className="border-t pt-4">
              {/* Filter dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kategori
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-md border-gray-300"
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
                <div>
                  <label className="block text-sm font-medium mb-1">Merek</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full rounded-md border-gray-300"
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
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Lokasi
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full rounded-md border-gray-300"
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
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Urutkan
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  >
                    <option value="nama">Nama A-Z</option>
                    <option value="kodeBarang">Kode Barang</option>
                    <option value="createdAt">Terbaru</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Menampilkan {filteredBarang.length} dari {barang.length} barang
                </p>
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Hapus Filter
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loadingBarang ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBarang.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBarang.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg overflow-hidden">
                  {item.fotoUrl ? (
                    <img
                      src={item.fotoUrl}
                      alt={item.nama}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                      <Package size={48} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold truncate flex-1">
                      {item.nama}
                    </h3>
                    {getStatusBadge(item.kondisi)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
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
                      <Button size="sm" className="flex items-center gap-1">
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
          <div className="bg-white rounded-lg shadow p-12 text-center">
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
    </DashboardLayout>
  );
}
