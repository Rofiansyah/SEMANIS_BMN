'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { TambahBarangModal, EditBarangModal } from '@/components/modals';
import { barangApi, kategoriApi, merekApi, lokasiApi } from '@/lib/api';
import type { Barang, Kategori, Merek, Lokasi } from '@/types/api';
import logoSemantis from './logo_semantis.png';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  Search,
  AlertCircle,
  Tag,
  Building,
  MapPin,
  Eye,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { exportBarangListPDF } from '@/utils/pdfExport';


const kondisiColors = {
  BAIK: 'bg-green-100 text-green-800 text-center',
  RUSAK_RINGAN: 'bg-yellow-100 text-yellow-800 text-center',
  RUSAK_BERAT: 'bg-red-100 text-red-800 text-center'
};

const kondisiLabels = {
  BAIK: 'Baik',
  RUSAK_RINGAN: 'Rusak Ringan',
  RUSAK_BERAT: 'Rusak Berat'
};

export default function AdminBarangPage() {
  const router = useRouter();
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [merekList, setMerekList] = useState<Merek[]>([]);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [barangRes, kategoriRes, merekRes, lokasiRes] = await Promise.all([
        barangApi.getAll(),
        kategoriApi.getAll(),
        merekApi.getAll(),
        lokasiApi.getAll()
      ]);

      if (barangRes.success) setBarangList(barangRes.data);
      if (kategoriRes.success) setKategoriList(kategoriRes.data);
      if (merekRes.success) setMerekList(merekRes.data);
      if (lokasiRes.success) setLokasiList(lokasiRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleTambahBarangSuccess = () => {
    loadAllData();
  };

  // Function removed - not currently used in the UI

  const handleDeleteBarang = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus barang ini?')) return;
    
    try {
      const response = await barangApi.delete(id);
      if (response.success) {
        toast.success('Barang berhasil dihapus');
        loadAllData();
      }
    } catch (error) {
      console.error('Failed to delete barang:', error);
      toast.error('Gagal menghapus barang. Mungkin barang masih sedang dipinjam.');
    }
  };

  const openCreateModal = () => {
    setIsTambahModalOpen(true);
  };

  const openEditModal = (barang: Barang) => {
    setSelectedBarang(barang);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedBarang(null);
  };

  const handleEditBarangSuccess = () => {
    loadAllData();
    closeEditModal();
  };

  const handleExportPDF = () => {
    const statistics = {
      totalBarang: barangList.length,
      barangBaik: barangList.filter(b => b.kondisi === 'BAIK').length,
      barangRusakRingan: barangList.filter(b => b.kondisi === 'RUSAK_RINGAN').length,
      barangRusakBerat: barangList.filter(b => b.kondisi === 'RUSAK_BERAT').length
    };
    
    exportBarangListPDF(filteredBarang, statistics);
  };

  const filteredBarang = barangList.filter(barang =>
    barang.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    barang.kodeBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
    barang.kategori.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    barang.merek.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    barang.lokasi.nama.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  return (
    <DashboardLayout title="Kelola Barang">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Barang</h1>
            <p className="text-gray-600 mt-1">Tambah, edit, dan hapus barang inventaris</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outlinesecond" onClick={handleExportPDF} disabled={loading || barangList.length === 0} className="w-full sm:w-auto text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200">
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="primary" onClick={openCreateModal} className="w-full sm:w-auto bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Barang
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Barang</p>
                <p className="text-2xl font-bold text-gray-900">{barangList.length}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Kondisi Baik</p>
                <p className="text-2xl font-bold text-green-800">
                  {barangList.filter(b => b.kondisi === 'BAIK').length}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Rusak Ringan</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {barangList.filter(b => b.kondisi === 'RUSAK_RINGAN').length}
                </p>
              </div>
              <Package className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Rusak Berat</p>
                <p className="text-2xl font-bold text-red-800">
                  {barangList.filter(b => b.kondisi === 'RUSAK_BERAT').length}
                </p>
              </div>
              <Package className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

{/* Barang List */}
<div className="bg-white rounded-lg shadow border">
  {/* Header */}
  <div className="p-6 border-b border-gray-200">
    <h2 className="text-lg font-semibold text-gray-900">Daftar Barang</h2>
  </div>

{/* Loading State */}
{loading ? (
  <div className="p-8 flex flex-col items-center justify-center text-center">
    {/* Ikon animasi */}
    <div className="relative w-12 sm:w-16 md:w-20 lg:w-24 h-12 sm:h-16 md:h-20 lg:h-24 mb-4 flex items-center justify-center">
      {/* Efek ping */}
      <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
      {/* Ikon bounce */}
      <Package className="w-8 h-8 sm:w-10 md:w-14 lg:w-16 text-blue-600 animate-bounce drop-shadow-lg" />
    </div>

    {/* Teks animasi */}
    <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-700 animate-pulse">
      Memuat list barang...
    </p>

    {/* Progress Bar */}
    <div className="w-32 sm:w-40 md:w-48 lg:w-56 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
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
) : filteredBarang.length === 0 ? (
  // Empty State
  <div className="p-8 text-center">
    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-600">
      {searchQuery
        ? "Tidak ada barang yang sesuai dengan pencarian"
        : "Belum ada barang"}
    </p>
  </div>
) : (
  
<div className="overflow-x-auto">
  <table className="w-full border border-gray-300 text-sm text-gray-900">
    <thead className="bg-gray-100">
      <tr>
        <th className="text-center py-3 px-4 border border-gray-300 font-semibold w-12">No</th>
        <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Barang</th>
        <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Kategori</th>
        <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Merek</th>
        <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Lokasi</th>
        <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Kondisi</th>
        <th className="text-center py-3 px-4 border border-gray-300 font-semibold">Aksi</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-200">
      {filteredBarang.map((barang, index) => (
        <tr
          key={barang.id}
          className="border transition-all duration-200 hover:bg-gray-50"
        >
          {/* Nomor Urut */}
          <td className="py-4 px-4 border border-gray-300 text-center">
            {index + 1}
          </td>

          {/* Foto + Nama Barang */}
          <td className="py-4 px-4 border border-gray-300">
            <div className="flex items-start space-x-5">
              {/* Foto */}
              <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                {barang.fotoUrl ? (
                  <img
                    src={barang.fotoUrl}
                    alt={barang.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </div>

              {/* Nama + Kode Barang */}
              <div className="flex flex-col">
                <p className="font-medium text-gray-900">{barang.nama}</p>
                <p className="text-xs text-gray-500">{barang.kodeBarang}</p>
              </div>
            </div>
          </td>

          {/* Kategori */}
          <td className="py-4 px-4 border border-gray-300 text-center">
            <span className="text-sm text-gray-600">{barang.kategori.nama}</span>
          </td>

          {/* Merek */}
          <td className="py-4 px-4 border border-gray-300 text-center">
            <span className="text-sm text-gray-600">{barang.merek.nama}</span>
          </td>

          {/* Lokasi */}
          <td className="py-4 px-4 border border-gray-300 text-center">
            <span className="text-sm text-gray-600">{barang.lokasi.nama}</span>
          </td>

          {/* Kondisi */}
          <td className="py-4 px-4 border border-gray-300 text-center">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center justify-center ${kondisiColors[barang.kondisi]}`}
            >
              {kondisiLabels[barang.kondisi]}
            </span>
          </td>

          {/* Aksi */}
          <td className="py-4 px-4 border border-gray-300 text-center min-w-[240px]">
            <div className="flex flex-col items-center gap-2">
              {/* Baris 1 */}
              <div className="flex justify-center">
                <Button
                  size="sm"
                  variant="outlinesecond"
                  className="flex items-center text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
                  onClick={() => router.push(`/admin/barang/${barang.id}`)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Detail
                </Button>
              </div>

              {/* Baris 2 */}
              <div className="flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  className="flex items-center"
                  onClick={() => handleDeleteBarang(barang.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Hapus
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200"
                  onClick={() => openEditModal(barang)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  )}
</div>
      </div>

      {/* Modals */}
      <TambahBarangModal
        isOpen={isTambahModalOpen}
        onClose={() => setIsTambahModalOpen(false)}
        onSuccess={handleTambahBarangSuccess}
        kategoriList={kategoriList}
        merekList={merekList}
        lokasiList={lokasiList}
      />
      
      <EditBarangModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSuccess={handleEditBarangSuccess}
        barang={selectedBarang}
        kategoriList={kategoriList}
        merekList={merekList}
        lokasiList={lokasiList}
      />
    </DashboardLayout>
  );
}