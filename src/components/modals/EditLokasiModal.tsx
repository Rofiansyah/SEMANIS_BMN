'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { UpdateLokasiRequest, Lokasi } from '@/types/api';

interface EditLokasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateLokasiRequest) => Promise<void>;
  lokasi: Lokasi | null;
  loading?: boolean;
}

export default function EditLokasiModal({
  isOpen,
  onClose,
  onSubmit,
  lokasi,
  loading = false,
}: EditLokasiModalProps) {
  const [nama, setNama] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && lokasi) {
      setNama(lokasi.nama);
      setError('');
    }
  }, [isOpen, lokasi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!lokasi) return;

    if (!nama.trim()) {
      setError('Nama lokasi wajib diisi');
      return;
    }

    try {
      await onSubmit(lokasi.id, { nama: nama.trim() });
      onClose();
    } catch {
      setError('Gagal memperbarui lokasi');
    }
  };

  const handleClose = () => {
    setNama('');
    setError('');
    onClose();
  };

  if (!isOpen || !lokasi) return null;

return (
  <div
    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
    onClick={(e) => e.target === e.currentTarget && handleClose()}
  >
    <div className="bg-white rounded-xl max-w-md w-full shadow-lg border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col animate-fadeIn">
      {/* Header Fixed */}
      <div className="flex justify-between items-center p-5 bg-blue-950 sticky top-0 z-10">
        <h3 className="text-lg font-semibold text-white">Edit Lokasi</h3>
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
          {/* Nama Lokasi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lokasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama lokasi"
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