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

  const [stats, setStats] = useState({
    totalBarang: 0,
    totalKategori: 0,
    totalLokasi: 0,
    myPeminjaman: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

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
          api.get("/peminjaman/my-requests").catch(() => ({ data: { data: [] } })),
        ]);

      const barangData = barangRes.data.data.items || barangRes.data.data || [];
      const kategoriData = kategoriRes.data.data.items || kategoriRes.data.data || [];
      const lokasiData = lokasiRes.data.data.items || lokasiRes.data.data || [];
      const peminjamanData = peminjamanRes.data.data || peminjamanRes.data || [];

      setStats({
        totalBarang: barangData.length,
        totalKategori: kategoriData.length,
        totalLokasi: lokasiData.length,
        myPeminjaman: peminjamanData.filter((p: { status: string }) => p.status === "DIPINJAM").length,
      });
    } catch {
      toast.error("Gagal memuat statistik dashboard");
    } finally {
      setLoadingStats(false);
    }
  };

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
    } catch {
      toast.error("Gagal memuat data barang");
    } finally {
      setLoadingBarang(false);
    }
  };

  const filterAndSortBarang = useCallback(() => {
    let filtered = [...barang];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.nama.toLowerCase().includes(lower) ||
          item.deskripsi.toLowerCase().includes(lower) ||
          item.kodeBarang.toLowerCase().includes(lower)
      );
    }

    if (selectedCategory) filtered = filtered.filter((item) => item.kategoriId === selectedCategory);
    if (selectedBrand) filtered = filtered.filter((item) => item.merekId === selectedBrand);
    if (selectedLocation) filtered = filtered.filter((item) => item.lokasiId === selectedLocation);

    filtered.sort((a, b) => {
      if (sortBy === "nama") return a.nama.localeCompare(b.nama);
      if (sortBy === "kodeBarang") return a.kodeBarang.localeCompare(b.kodeBarang);
      if (sortBy === "createdAt") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    setFilteredBarang(filtered);
  }, [barang, searchTerm, selectedCategory, selectedBrand, selectedLocation, sortBy]);

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
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[kondisi as keyof typeof statusMap] || "bg-gray-100 text-gray-800"}`}>
        {statusText[kondisi as keyof typeof statusText] || kondisi}
      </span>
    );
  };

  if (!user) return <div className="p-6 text-center">Loading...</div>;
  if (isAdmin) return <div className="p-6 text-center">Redirecting...</div>;

  return (
    <DashboardLayout title="Dashboard User">
      <div className="space-y-6">
        
        {/* Welcome */}
        <header>
          <h2 className="text-2xl font-bold text-gray-900">Selamat datang, {user.nama}</h2>
          <p className="text-gray-600 mt-1">Akses informasi inventaris dan kelola data barang</p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Barang", value: stats.totalBarang, icon: <Package className="h-6 w-6 text-blue-600" />, bg: "bg-blue-50" },
            { label: "Kategori", value: stats.totalKategori, icon: <Tag className="h-6 w-6 text-green-600" />, bg: "bg-green-50" },
            { label: "Lokasi", value: stats.totalLokasi, icon: <Building className="h-6 w-6 text-purple-600" />, bg: "bg-purple-50" },
            { label: "Dipinjam", value: stats.myPeminjaman, icon: <History className="h-6 w-6 text-orange-600" />, bg: "bg-orange-50" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-lg font-bold">{loadingStats ? "-" : stat.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Search & Filter */}
        <section className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari nama, deskripsi, atau kode barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter size={16} />
              Filter & Sort
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[{
                  label: "Kategori", value: selectedCategory, setter: setSelectedCategory, options: categories
                },{
                  label: "Merek", value: selectedBrand, setter: setSelectedBrand, options: brands
                },{
                  label: "Lokasi", value: selectedLocation, setter: setSelectedLocation, options: locations
                }].map(({label,value,setter,options},i)=>(
                  <div key={i}>
                    <label className="text-sm font-medium">{label}</label>
                    <select value={value} onChange={(e)=>setter(e.target.value)} className="w-full rounded-md border-gray-300 mt-1">
                      <option value="">Semua {label}</option>
                      {options.map((o) => (
                        <option key={o.id} value={o.id}>{o.nama}</option>
                      ))}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium">Urutkan</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded-md border-gray-300 mt-1">
                    <option value="nama">Nama A-Z</option>
                    <option value="kodeBarang">Kode Barang</option>
                    <option value="createdAt">Terbaru</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Menampilkan {filteredBarang.length} dari {barang.length} barang</span>
                <Button variant="secondary" size="sm" onClick={clearFilters}>Reset Filter</Button>
              </div>
            </div>
          )}
        </section>

        {/* Results */}
        <section>
          {loadingBarang ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredBarang.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBarang.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {item.fotoUrl ? (
                      <img src={item.fotoUrl} alt={item.nama} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={40} className="text-gray-300" />
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold truncate">{item.nama}</h3>
                      {getStatusBadge(item.kondisi)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.deskripsi}</p>
                    <div className="space-y-1 text-xs text-gray-500 flex-1">
                      <div className="flex items-center gap-1"><Tag size={12} /> {item.kategori?.nama}</div>
                      <div className="flex items-center gap-1"><Bookmark size={12} /> {item.merek?.nama}</div>
                      <div className="flex items-center gap-1"><MapPin size={12} /> {item.lokasi?.nama}</div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs font-mono text-gray-500">{item.kodeBarang}</span>
                      <Link href={`/user/items/${item.id}`}>
                        <Button size="sm" className="gap-1">
                          <Eye size={14} /> Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Package size={48} className="mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Tidak ada barang</h3>
              <p className="text-gray-600 text-sm mb-4">Coba ubah pencarian atau filter</p>
              <Button variant="secondary" onClick={clearFilters}>Reset</Button>
            </div>
          )}
        </section>

      </div>
    </DashboardLayout>
  );
}
