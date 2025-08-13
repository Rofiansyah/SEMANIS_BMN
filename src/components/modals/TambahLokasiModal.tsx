'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { lokasiApi } from '@/lib/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TambahLokasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface LokasiFormData {
  nama: string;
}

export function TambahLokasiModal({ isOpen, onClose, onSuccess }: TambahLokasiModalProps) {
  const [formData, setFormData] = useState<LokasiFormData>({ nama: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ nama: '' });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      toast.error('Nama lokasi harus diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await lokasiApi.create(formData);
      if (response.success) {
        toast.success('Lokasi berhasil ditambahkan! 🎉');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to create lokasi:', error);
      toast.error('Gagal menambahkan lokasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LokasiFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg border border-gray-100 animate-fadeIn"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-800">Tambah Lokasi</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lokasi <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.nama}
              onChange={(e) => handleInputChange('nama', e.target.value)}
              placeholder="Masukkan nama lokasi"
              required
              className="placeholder-gray-400"
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
  );
}
