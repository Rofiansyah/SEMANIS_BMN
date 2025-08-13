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

    if (!formData.nama.trim()) return toast.error('Nama barang harus diisi');
    if (!formData.kategoriId) return toast.error('Kategori harus dipilih');
    if (!formData.merekId) return toast.error('Merek harus dipilih');
    if (!formData.lokasiId) return toast.error('Lokasi harus dipilih');

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
    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white rounded-xl max-w-2xl w-full shadow-lg border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
      {/* Header Fixed */}
      <div className="flex justify-between items-center p-5 bg-blue-950 sticky top-0 z-10">
        <h3 className="text-lg font-semibold text-white">Tambah Barang</h3>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Scrollable */}
      <div className="p-6 overflow-y-auto flex-1">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nama Barang *"
            value={formData.nama}
            onChange={(e) => handleInputChange('nama', e.target.value)}
            placeholder="Masukkan nama barang"
            required
            className="focus:ring-2 focus:ring-blue-950 focus:border-blue-950"
          />

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => handleInputChange('deskripsi', e.target.value)}
              placeholder="Masukkan deskripsi barang"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-blue-950 bg-white"
              rows={3}
            />
          </div>

          {/* Grid untuk select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
              <select
                value={formData.kategoriId}
                onChange={(e) => handleInputChange('kategoriId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-blue-950 bg-white"
                required
              >
                <option value="">Pilih Kategori</option>
                {kategoriList.map((kategori) => (
                  <option key={kategori.id} value={kategori.id}>
                    {kategori.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Merek */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Merek *</label>
              <select
                value={formData.merekId}
                onChange={(e) => handleInputChange('merekId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-blue-950 bg-white"
                required
              >
                <option value="">Pilih Merek</option>
                {merekList.map((merek) => (
                  <option key={merek.id} value={merek.id}>
                    {merek.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi *</label>
              <select
                value={formData.lokasiId}
                onChange={(e) => handleInputChange('lokasiId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-blue-950 bg-white"
                required
              >
                <option value="">Pilih Lokasi</option>
                {lokasiList.map((lokasi) => (
                  <option key={lokasi.id} value={lokasi.id}>
                    {lokasi.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Kondisi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi *</label>
              <select
                value={formData.kondisi}
                onChange={(e) =>
                  handleInputChange('kondisi', e.target.value as BarangFormData['kondisi'])
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-blue-950 bg-white"
                required
              >
                <option value="BAIK">Baik</option>
                <option value="RUSAK_RINGAN">Rusak Ringan</option>
                <option value="RUSAK_BERAT">Rusak Berat</option>
              </select>
            </div>
          </div>

          {/* Upload Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto (Opsional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-950 transition">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleInputChange('foto', e.target.files?.[0] as File)}
                className="hidden"
                id="foto-upload"
              />
              <label htmlFor="foto-upload" className="flex flex-col items-center gap-2">
                {formData.foto ? (
                  <>
                    <img
                      src={URL.createObjectURL(formData.foto)}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-md border"
                    />
                    <span className="text-sm text-gray-600">{formData.foto.name}</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Klik untuk upload foto</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

}
