'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { UpdateKategoriRequest, Kategori } from '@/types/api';

interface EditKategoriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateKategoriRequest) => Promise<void>;
  kategori: Kategori | null;
  loading?: boolean;
}

export default function EditKategoriModal({
  isOpen,
  onClose,
  onSubmit,
  kategori,
  loading = false,
}: EditKategoriModalProps) {
  const [nama, setNama] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && kategori) {
      setNama(kategori.nama);
      setError('');
    }
  }, [isOpen, kategori]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!kategori) return;

    if (!nama.trim()) {
      setError('Nama kategori wajib diisi');
      return;
    }

    try {
      await onSubmit(kategori.id, { nama: nama.trim() });
      onClose();
    } catch {
      setError('Gagal memperbarui kategori');
    }
  };

  const handleClose = () => {
    setNama('');
    setError('');
    onClose();
  };

  if (!isOpen || !kategori) return null;

return (
  <div
    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
    onClick={(e) => e.target === e.currentTarget && handleClose()}
  >
    <div className="bg-white rounded-xl max-w-md w-full shadow-lg border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col animate-fadeIn">
      {/* Header Fixed */}
      <div className="flex justify-between items-center p-5 bg-blue-950 sticky top-0 z-10">
        <h3 className="text-lg font-semibold text-white">Edit Kategori</h3>
        <button
          onClick={handleClose}
          className="text-white hover:text-gray-200 transition"
          disabled={loading}
        >
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
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama kategori"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
              required
              disabled={loading}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
}