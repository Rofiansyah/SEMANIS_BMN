'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { barangApi } from '@/lib/api';
import type { Kategori, Merek, Lokasi } from '@/types/api';
import { Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TambahBarangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export function TambahBarangModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  kategoriList, 
  merekList, 
  lokasiList 
}: TambahBarangModalProps) {
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
    if (isOpen) {
      setFormData({
        nama: '',
        deskripsi: '',
        kategoriId: '',
        merekId: '',
        lokasiId: '',
        kondisi: 'BAIK'
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const response = await barangApi.create(formData);
      if (response.success) {
        toast.success('Barang berhasil ditambahkan! 🎉');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to create barang:', error);
      toast.error('Gagal menambahkan barang. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BarangFormData, value: string | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-[60]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Tambah Barang</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 placeholder-gray-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              value={formData.kategoriId}
              onChange={(e) => handleInputChange('kategoriId', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
              required
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
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
              required
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
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
              required
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
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
              required
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleInputChange('foto', e.target.files?.[0] as File)}
                className="hidden"
                id="foto-upload"
              />
              <label htmlFor="foto-upload" className="cursor-pointer flex flex-col items-center">
                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {formData.foto ? formData.foto.name : 'Klik untuk upload foto'}
                </span>
              </label>
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
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}