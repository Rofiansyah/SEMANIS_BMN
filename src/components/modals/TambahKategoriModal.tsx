'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { kategoriApi } from '@/lib/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TambahKategoriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-800">Tambah Kategori</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nama Kategori *"
            value={formData.nama}
            onChange={(e) => handleInputChange('nama', e.target.value)}
            placeholder="Masukkan nama kategori"
            required
          />

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
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
