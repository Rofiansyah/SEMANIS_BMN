"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  Tag,
  Bookmark,
  Eye,
  Filter,
  Download,
} from "lucide-react";
import api from "@/lib/api";
import { Peminjaman } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

export default function UserHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<Peminjaman[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "DIKEMBALIKAN" | "REJECTED"
  >("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const filterHistory = useCallback(() => {
    let filtered = [...history];

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Filter by date (month/year)
    if (dateFilter) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.updatedAt);
        const filterDate = new Date(dateFilter);
        return (
          itemDate.getMonth() === filterDate.getMonth() &&
          itemDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }

    setFilteredHistory(filtered);
  }, [history, statusFilter, dateFilter]);

  useEffect(() => {
    filterHistory();
  }, [filterHistory]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/peminjaman/my-history");
      const data = response.data.data || [];

      // Sort by most recent first
      data.sort(
        (a: { updatedAt: string }, b: { updatedAt: string }) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Gagal memuat riwayat peminjaman");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      DIKEMBALIKAN: {
        icon: <CheckCircle size={16} />,
        text: "Dikembalikan",
        color: "bg-green-100 text-green-800",
        bgColor: "bg-green-50",
      },
      REJECTED: {
        icon: <XCircle size={16} />,
        text: "Ditolak",
        color: "bg-red-100 text-red-800",
        bgColor: "bg-red-50",
      },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        icon: <Package size={16} />,
        text: status,
        color: "bg-gray-100 text-gray-800",
        bgColor: "bg-gray-50",
      }
    );
  };

  const clearFilters = () => {
    setStatusFilter("ALL");
    setDateFilter("");
  };

  const exportHistory = () => {
    try {
      // Simple CSV export
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
      const csvData = filteredHistory.map((item) => [
        item.barang.nama,
        item.barang.kodeBarang,
        item.barang.kategori?.nama || "",
        item.barang.merek?.nama || "",
        item.barang.lokasi?.nama || "",
        "", // lokasi not available in API response
        item.status === "DIKEMBALIKAN" ? "Dikembalikan" : "Ditolak",
        new Date(item.tanggalPengajuan).toLocaleDateString("id-ID"),
        new Date(item.updatedAt).toLocaleDateString("id-ID"),
      ]);

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

  const returnedCount = history.filter(
    (item) => item.status === "DIKEMBALIKAN"
  ).length;
  const rejectedCount = history.filter(
    (item) => item.status === "REJECTED"
  ).length;

  if (loading) {
    return (
      <DashboardLayout title="Riwayat Peminjaman">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Riwayat Peminjaman">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Riwayat
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {history.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Dikembalikan
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {returnedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ditolak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rejectedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter size={16} />
                Filter
              </Button>
              {filteredHistory.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={exportHistory}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Export CSV
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Menampilkan {filteredHistory.length} dari {history.length} riwayat
            </p>
          </div>

          {showFilters && (
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as "ALL" | "DIKEMBALIKAN" | "REJECTED"
                      )
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="DIKEMBALIKAN">Dikembalikan</option>
                    <option value="REJECTED">Ditolak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-black">
                    Bulan
                  </label>
                  <input
                    type="month"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Hapus Filter
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {history.length === 0
                    ? "Belum ada riwayat peminjaman"
                    : "Tidak ada riwayat yang sesuai filter"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {history.length === 0
                    ? "Riwayat peminjaman Anda akan muncul di sini setelah proses peminjaman selesai"
                    : "Coba ubah kriteria filter yang Anda gunakan"}
                </p>
                {history.length === 0 ? (
                  <Link href="/user/search">
                    <Button>Mulai Pinjam Barang</Button>
                  </Link>
                ) : (
                  <Button variant="secondary" onClick={clearFilters}>
                    Hapus Semua Filter
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((item) => {
                  const statusInfo = getStatusInfo(item.status);

                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border-2 p-6 ${statusInfo.bgColor} border-gray-200`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Item Photo */}
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {item.barang.fotoUrl ? (
                              <img
                                src={item.barang.fotoUrl}
                                alt={item.barang.nama}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Package size={24} className="text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {item.barang.nama}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}
                              >
                                {statusInfo.icon}
                                {statusInfo.text}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 font-mono mb-2">
                              Kode: {item.barang.kodeBarang}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Link href={`/user/items/${item.barang.id}`}>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Eye size={14} />
                              Lihat
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Tag size={14} className="mr-2" />
                          <span>{item.barang.kategori?.nama}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Bookmark size={14} className="mr-2" />
                          <span>{item.barang.merek?.nama}</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Timeline
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar size={14} className="mr-2" />
                            <span>
                              Diajukan:{" "}
                              {new Date(
                                item.tanggalPengajuan
                              ).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                          {item.tanggalDisetujui && (
                            <div className="flex items-center text-gray-600">
                              <Calendar size={14} className="mr-2" />
                              <span>
                                Disetujui:{" "}
                                {new Date(
                                  item.tanggalDisetujui
                                ).toLocaleDateString("id-ID")}
                              </span>
                            </div>
                          )}
                          {item.tanggalDipinjam && (
                            <div className="flex items-center text-gray-600">
                              <Calendar size={14} className="mr-2" />
                              <span>
                                Dipinjam:{" "}
                                {new Date(
                                  item.tanggalDipinjam
                                ).toLocaleDateString("id-ID")}
                              </span>
                            </div>
                          )}
                          {item.tanggalDikembalikan && (
                            <div className="flex items-center text-gray-600">
                              <Calendar size={14} className="mr-2" />
                              <span>
                                Dikembalikan:{" "}
                                {new Date(
                                  item.tanggalDikembalikan
                                ).toLocaleDateString("id-ID")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Photos Section */}
                      {(item.fotoPinjam || item.fotoKembali) && (
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-gray-900 mb-4">
                            Dokumentasi
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {item.fotoPinjam && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                  Foto Saat Dipinjam
                                </h5>
                                <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={item.fotoPinjam}
                                    alt="Foto saat dipinjam"
                                    className="w-full h-48 object-cover cursor-pointer hover:opacity-75 transition-opacity"
                                    onClick={() =>
                                      item.fotoPinjam &&
                                      window.open(item.fotoPinjam, "_blank")
                                    }
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Klik untuk memperbesar
                                </p>
                              </div>
                            )}
                            {item.fotoKembali && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                  Foto Saat Dikembalikan
                                </h5>
                                <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={item.fotoKembali}
                                    alt="Foto saat dikembalikan"
                                    className="w-full h-48 object-cover cursor-pointer hover:opacity-75 transition-opacity"
                                    onClick={() =>
                                      item.fotoKembali &&
                                      window.open(item.fotoKembali, "_blank")
                                    }
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Klik untuk memperbesar
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {item.catatan && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Catatan
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.catatan}
                          </p>
                        </div>
                      )}

                      {(item.penanggungJawab || item.approvedByUser) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          {item.penanggungJawab && (
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">
                                Penanggung Jawab:
                              </span>{" "}
                              {item.penanggungJawab}
                            </p>
                          )}
                          {item.approvedByUser && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">
                                Diproses oleh:
                              </span>{" "}
                              {item.approvedByUser.nama}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
