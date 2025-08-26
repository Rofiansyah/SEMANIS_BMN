'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  X,
  User,
  Package,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Peminjaman } from '@/types/api';

interface RejectModalProps {
  request: Peminjaman | null;
  isOpen: boolean;
  onClose: () => void;
  onReject: (id: string, catatan: string) => Promise<void>;
}

export default function RejectModal({ request, isOpen, onClose, onReject }: RejectModalProps) {
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!request) return;
    if (!catatan.trim()) {
      toast.error('Alasan penolakan harus diisi');
      return;
    }

    setLoading(true);
    try {
      await onReject(request.id, catatan);
      setCatatan('');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-lg border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 bg-blue-950 sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-white">Tolak Permintaan</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Info Request */}
            <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg shadow-sm">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Informasi Permintaan</h4>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Pemohon</p>
                    <p className="text-base font-medium text-gray-900">{request.user.nama}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Barang</p>
                    <p className="text-base font-medium text-gray-900">{request.barang.nama}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Catatan</p>
                    <p className="text-sm text-gray-800">{request.catatan || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alasan Penolakan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Jelaskan alasan penolakan..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={3}
                required
                disabled={loading}
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
                variant="danger"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Memproses...' : 'Tolak'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
