'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { barangApi } from '@/lib/api';
import type { Barang, Kategori, Merek, Lokasi, UpdateBarangRequest } from '@/types/api';
import { Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditBarangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  barang: Barang | null;
  kategoriList: Kategori[];
  merekList: Merek[];
  lokasiList: Lokasi[];
}

interface BarangFormData {
  nama: string;
  deskripsi: string;
  kategoriId: string;
  merekId: string;
  lokasiId: string;
  kondisi: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
  foto?: File;
}

export function EditBarangModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  barang,
  kategoriList, 
  merekList, 
  lokasiList 
}: EditBarangModalProps) {
  const [formData, setFormData] = useState<BarangFormData>({
    nama: '',
    deskripsi: '',
    kategoriId: '',
    merekId: '',
    lokasiId: '',
    kondisi: 'BAIK'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && barang) {
      setFormData({
        nama: barang.nama,
        deskripsi: barang.deskripsi || '',
        kategoriId: barang.kategori.id,
        merekId: barang.merek.id,
        lokasiId: barang.lokasi.id,
        kondisi: barang.kondisi
      });
    }
  }, [isOpen, barang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barang) return;

    if (!formData.nama.trim()) {
      toast.error('Nama barang harus diisi');
      return;
    }
    if (!formData.kategoriId) {
      toast.error('Kategori harus dipilih');
      return;
    }
    if (!formData.merekId) {
      toast.error('Merek harus dipilih');
      return;
    }
    if (!formData.lokasiId) {
      toast.error('Lokasi harus dipilih');
      return;
    }

    setLoading(true);
    try {
      const updateData: UpdateBarangRequest = {
        nama: formData.nama.trim(),
        deskripsi: formData.deskripsi.trim(),
        kategoriId: formData.kategoriId,
        merekId: formData.merekId,
        lokasiId: formData.lokasiId,
        kondisi: formData.kondisi
      };

      if (formData.foto) {
        updateData.foto = formData.foto;
      }

      const response = await barangApi.update(barang.id, updateData);
      if (response.success) {
        toast.success('Barang berhasil diperbarui! ✨');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to update barang:', error);
      toast.error('Gagal memperbarui barang. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BarangFormData, value: string | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen || !barang) return null;

  return (
    <div 
      className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-[60]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Barang</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Barang"
            value={formData.nama}
            onChange={(e) => handleInputChange('nama', e.target.value)}
            placeholder="Masukkan nama barang"
            disabled={loading}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => handleInputChange('deskripsi', e.target.value)}
              placeholder="Masukkan deskripsi barang"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              value={formData.kategoriId}
              onChange={(e) => handleInputChange('kategoriId', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={loading}
            >
              <option value="" className="bg-white text-gray-900">Pilih Kategori</option>
              {kategoriList.map((kategori) => (
                <option key={kategori.id} value={kategori.id} className="bg-white text-gray-900">
                  {kategori.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merek *
            </label>
            <select
              value={formData.merekId}
              onChange={(e) => handleInputChange('merekId', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={loading}
            >
              <option value="" className="bg-white text-gray-900">Pilih Merek</option>
              {merekList.map((merek) => (
                <option key={merek.id} value={merek.id} className="bg-white text-gray-900">
                  {merek.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi *
            </label>
            <select
              value={formData.lokasiId}
              onChange={(e) => handleInputChange('lokasiId', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={loading}
            >
              <option value="" className="bg-white text-gray-900">Pilih Lokasi</option>
              {lokasiList.map((lokasi) => (
                <option key={lokasi.id} value={lokasi.id} className="bg-white text-gray-900">
                  {lokasi.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kondisi *
            </label>
            <select
              value={formData.kondisi}
              onChange={(e) => handleInputChange('kondisi', e.target.value as 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT')}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={loading}
            >
              <option value="BAIK" className="bg-white text-gray-900">Baik</option>
              <option value="RUSAK_RINGAN" className="bg-white text-gray-900">Rusak Ringan</option>
              <option value="RUSAK_BERAT" className="bg-white text-gray-900">Rusak Berat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto (Opsional)
            </label>
            <div className="space-y-2">
              {barang.foto && (
                <div className="relative">
                  <img 
                    src={barang.foto} 
                    alt={barang.nama}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <p className="text-xs text-gray-500 mt-1">Foto saat ini</p>
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange('foto', e.target.files?.[0] as File)}
                  className="hidden"
                  id="foto-upload-edit"
                  disabled={loading}
                />
                <label htmlFor="foto-upload-edit" className={`cursor-pointer flex flex-col items-center ${loading ? 'cursor-not-allowed opacity-50' : ''}`}>
                  <Camera className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {formData.foto ? formData.foto.name : 'Klik untuk upload foto baru'}
                  </span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
              loading={loading}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}