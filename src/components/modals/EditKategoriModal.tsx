'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/Input';
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
    <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Edit Kategori
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <Input
              label="Nama Kategori"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama kategori"
              error={error}
              disabled={loading}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
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