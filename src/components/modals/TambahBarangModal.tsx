'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { barangApi } from '@/lib/api';
import type { Kategori, Merek, Lokasi } from '@/types/api';
import { Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';
import CameraCapture from '@/components/camera/CameraCapture';

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

  // Foto states
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);

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
      setFotoPreview(null);
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

  const handleInputChange = (field: keyof BarangFormData, value: string | File | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCameraCapture = (file: File) => {
    handleInputChange('foto', file);
    setFotoPreview(URL.createObjectURL(file));
    setIsCameraCaptureOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange('foto', file);
      setFotoPreview(URL.createObjectURL(file));
    }
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
          {/* Nama Barang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Barang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => handleInputChange('nama', e.target.value)}
              placeholder="Masukkan nama barang"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
              required
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => handleInputChange('deskripsi', e.target.value)}
              placeholder="Masukkan deskripsi barang"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
              rows={3}
            />
          </div>

          {/* Grid untuk select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kategoriId}
                onChange={(e) => handleInputChange('kategoriId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Merek <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.merekId}
                onChange={(e) => handleInputChange('merekId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.lokasiId}
                onChange={(e) => handleInputChange('lokasiId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kondisi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kondisi}
                onChange={(e) =>
                  handleInputChange('kondisi', e.target.value as BarangFormData['kondisi'])
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900"
                required
              >
                <option value="BAIK">Baik</option>
                <option value="RUSAK_RINGAN">Rusak Ringan</option>
                <option value="RUSAK_BERAT">Rusak Berat</option>
              </select>
            </div>
          </div>

          {/* Foto Barang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto Barang (Opsional)
            </label>
            {fotoPreview ? (
              <div className="space-y-3">
                <img
                  src={fotoPreview}
                  alt="Preview"
                  className="w-full h-28 sm:h-32 object-cover rounded-lg border"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCameraCaptureOpen(true)}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Ambil Ulang
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleInputChange('foto', undefined);
                      setFotoPreview(null);
                    }}
                    className="flex-1"
                  >
                    Hapus Foto
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-950 transition"
                onClick={() => setIsCameraCaptureOpen(true)}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                  <p className="text-xs sm:text-sm text-gray-600 text-center">
                    Klik di sini untuk ambil foto barang
                  </p>
                </div>
              </div>
            )}
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

    {/* Camera Capture Modal */}
    <CameraCapture
      isOpen={isCameraCaptureOpen}
      onClose={() => setIsCameraCaptureOpen(false)}
      onCapture={handleCameraCapture}
      title="Foto Barang"
    />
  </div>
);
}
