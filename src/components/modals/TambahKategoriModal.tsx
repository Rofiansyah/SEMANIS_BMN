'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { kategoriApi } from '@/lib/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TambahKategoriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loading?: boolean;
}

interface KategoriFormData {
  nama: string;
}

export function TambahKategoriModal({ isOpen, onClose, onSuccess }: TambahKategoriModalProps) {
  const [formData, setFormData] = useState<KategoriFormData>({ nama: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ nama: '' });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      toast.error('Nama kategori harus diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await kategoriApi.create(formData);
      if (response.success) {
        toast.success('Kategori berhasil ditambahkan! 🎉');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to create kategori:', error);
      toast.error('Gagal menambahkan kategori. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof KategoriFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl max-w-md w-full shadow-lg border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col animate-fadeIn">
        {/* Header Fixed */}
        <div className="flex justify-between items-center p-5 bg-blue-950 sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-white">Tambah Kategori</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => handleInputChange('nama', e.target.value)}
                placeholder="Masukkan nama kategori"
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
                required
              />
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
