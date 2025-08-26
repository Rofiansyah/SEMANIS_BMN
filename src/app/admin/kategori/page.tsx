'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { TambahKategoriModal, EditKategoriModal } from '@/components/modals';
import { kategoriApi } from '@/lib/api';
import type { Kategori } from '@/types/api';
import logoSemantis from './logo_semantis.png';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag,
  Search,
  AlertCircle,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';


export default function AdminKategoriPage() {
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadKategori();
  }, []);

  const loadKategori = async () => {
    try {
      const response = await kategoriApi.getAll();
      if (response.success) {
        setKategoriList(response.data);
      }
    } catch (error) {
      console.error('Failed to load kategori:', error);
      toast.error('Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleTambahKategoriSuccess = () => {
    loadKategori();
  };

  const handleCreateKategori = async (data: { nama: string }) => {
    setActionLoading(true);
    try {
      const response = await kategoriApi.create(data);
      if (response.success) {
        toast.success('Kategori berhasil ditambahkan! 🎉');
        loadKategori();
      }
    } catch (error) {
      console.error('Failed to create kategori:', error);
      toast.error('Gagal menambahkan kategori');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateKategori = async (id: string, data: { nama: string }) => {
    setActionLoading(true);
    try {
      const response = await kategoriApi.update(id, data);
      if (response.success) {
        toast.success('Kategori berhasil diupdate! ✅');
        loadKategori();
      }
    } catch (error) {
      console.error('Failed to update kategori:', error);
      toast.error('Gagal mengupdate kategori');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteKategori = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    
    try {
      const response = await kategoriApi.delete(id);
      if (response.success) {
        toast.success('Kategori berhasil dihapus! 🗑️');
        loadKategori();
      }
    } catch (error) {
      console.error('Failed to delete kategori:', error);
      toast.error('Gagal menghapus kategori. Mungkin kategori masih digunakan oleh barang.');
    }
  };

  const openCreateModal = () => {
    setIsTambahModalOpen(true);
  };

  const openEditModal = (kategori: Kategori) => {
    setSelectedKategori(kategori);
    setIsEditModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsTambahModalOpen(false);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedKategori(null);
  };

  const filteredKategori = kategoriList.filter(kategori =>
    kategori.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

return (
  <DashboardLayout title="Kelola Kategori">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Kategori</h1>
          <p className="text-gray-600 mt-1">Tambah, edit, dan hapus kategori barang</p>
        </div>
        <Button variant="primary" onClick={openCreateModal} className="w-full sm:w-auto bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Cari kategori..."
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
              <p className="text-sm text-gray-600">Total Kategori</p>
              <p className="text-2xl font-bold text-gray-900">{kategoriList.length}</p>
            </div>
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Kategori List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Kategori</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center space-x-2">
<div className="flex flex-col justify-center items-center h-screen px-4">
  {/* Logo */}
  <img
    src={typeof logoSemantis === "string" ? logoSemantis : logoSemantis.src}
    alt="SEMANTIS BMN Logo"
    className="w-24 sm:w-32 md:w-40 lg:w-48 h-auto mx-auto mb-6 animate-pulse"
  />

  {/* Ikon animasi responsif */}
  <div className="relative w-12 sm:w-16 md:w-20 lg:w-24 h-12 sm:h-16 md:h-20 lg:h-24 mb-4 flex items-center justify-center">
    {/* Efek ping responsif */}
    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>

    {/* Ikon responsif dengan bounce */}
    <Package className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 text-blue-600 animate-bounce drop-shadow-lg" />
  </div>

  {/* Teks animasi */}
  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-700 animate-pulse text-center">
    Memuat list kategori...
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
            </div>
          </div>
        ) : filteredKategori.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery ? 'Tidak ada kategori yang sesuai dengan pencarian' : 'Belum ada kategori'}
            </p>
          </div>
        ) : (
<div className="overflow-x-auto">
  <table className="w-full border border-gray-300 text-sm text-gray-900">
    <thead className="bg-gray-100">
      <tr>
        <th className="text-center py-3 px-4 border border-gray-300 font-semibold">
          Nama Kategori
        </th>
        <th className="text-center py-3 px-4 border border-gray-300 font-semibold">
          Tanggal Dibuat
        </th>
        <th className="text-center py-3 px-4 border border-gray-300 font-semibold">
          Aksi
        </th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-200">
      {filteredKategori.map((kategori) => (
        <tr
          key={kategori.id}
          className="border transition-all duration-200"
        >
{/* Nama Kategori */}
<td className="py-4 px-4 border border-gray-300 text-left">
  <div className="flex items-center justify-start space-x-3">
    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center shadow-sm">
      <Tag className="w-4 h-4 text-pink-600" />
    </div>
    <span className="font-medium text-gray-900">{kategori.nama}</span>
  </div>
</td>

          {/* Tanggal Dibuat */}
          <td className="py-4 px-4 border border-gray-300 text-center text-gray-600">
            {new Date(kategori.createdAt).toLocaleDateString("id-ID")}
          </td>

          {/* Aksi */}
          <td className="py-4 px-4 border border-gray-300 text-center min-w-[200px]">
            <div className="flex flex-col items-center gap-2">
              {/* Baris Tombol */}
              <div className="flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteKategori(kategori.id)}
                  className="flex items-center"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Hapus
                </Button>
                <Button
                  size="sm"
                  onClick={() => openEditModal(kategori)}
                  variant="outline"
                  className="flex items-center bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200"
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
    <TambahKategoriModal
      isOpen={isTambahModalOpen}
      onClose={() => setIsTambahModalOpen(false)}
      onSuccess={handleTambahKategoriSuccess}
      loading={actionLoading}
    />
    
    <EditKategoriModal
      isOpen={isEditModalOpen}
      onClose={closeEditModal}
      onSubmit={handleUpdateKategori}
      kategori={selectedKategori}
      loading={actionLoading}
    />
  </DashboardLayout>
);

}