'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { TambahKategoriModal, EditKategoriModal } from '@/components/modals';
import { kategoriApi } from '@/lib/api';
import type { Kategori } from '@/types/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag,
  Search,
  AlertCircle
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
          <Button variant="primary" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kategori
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Kategori</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                <span className="text-gray-600">Memuat data...</span>
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
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Nama Kategori</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Tanggal Dibuat</th>
                    <th className="text-center py-3 px-6 font-medium text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredKategori.map((kategori) => (
                    <tr key={kategori.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Tag className="w-4 h-4 text-yellow-600" />
                          </div>
                          <span className="font-medium text-gray-900">{kategori.nama}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(kategori.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(kategori)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteKategori(kategori.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Hapus
                          </Button>
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