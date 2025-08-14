'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { TambahBarangModal, EditBarangModal } from '@/components/modals';
import { barangApi, kategoriApi, merekApi, lokasiApi } from '@/lib/api';
import type { Barang, Kategori, Merek, Lokasi } from '@/types/api';
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
  BAIK: 'bg-green-100 text-green-800',
  RUSAK_RINGAN: 'bg-yellow-100 text-yellow-800',
  RUSAK_BERAT: 'bg-red-100 text-red-800'
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
    barang.merek.nama.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Button variant="outline" onClick={handleExportPDF} disabled={loading || barangList.length === 0}>
              <FileText className="w-full sm:w-auto text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200" />
              Export PDF
            </Button>
            <Button variant="primary" onClick={openCreateModal}>
              <Plus className="w-full sm:w-auto bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200" />
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
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
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Barang</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                <span className="text-gray-600">Memuat data...</span>
              </div>
            </div>
          ) : filteredBarang.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery ? 'Tidak ada barang yang sesuai dengan pencarian' : 'Belum ada barang'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Barang</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Kategori</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Merek</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Lokasi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Kondisi</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBarang.map((barang) => (
                    <tr key={barang.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            {barang.foto ? (
                              <img 
                                src={barang.foto} 
                                alt={barang.nama}
                                className="w-10 h-10 object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{barang.nama}</p>
                            <p className="text-sm text-gray-500">{barang.kodeBarang}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{barang.kategori.nama}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{barang.merek.nama}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{barang.lokasi.nama}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          kondisiColors[barang.kondisi]
                        }`}>
                          {kondisiLabels[barang.kondisi]}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/barang/${barang.id}`)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Detail
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(barang)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteBarang(barang.id)}
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