'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { CreateKategoriRequest } from '@/types/api';

interface TambahKategoriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateKategoriRequest) => Promise<void>;
  loading?: boolean;
}

export default function TambahKategoriModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: TambahKategoriModalProps) {
  const [nama, setNama] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nama.trim()) {
      setError('Nama kategori wajib diisi');
      return;
    }

    try {
      await onSubmit({ nama: nama.trim() });
      setNama('');
      onClose();
    } catch {
      setError('Gagal menambahkan kategori');
    }
  };

  const handleClose = () => {
    setNama('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Tambah Kategori
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
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}