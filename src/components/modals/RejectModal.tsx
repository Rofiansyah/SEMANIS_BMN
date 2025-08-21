'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  XCircle,
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

  const handleSubmit = async () => {
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
      className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-[60]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border-0">
        <h3 className="text-lg font-semibold mb-4">Tolak Permintaan</h3>

        {/* Info Request */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-center space-x-3 mb-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{request.user.nama}</span>
          </div>
          <div className="flex items-center space-x-3 mb-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{request.barang.nama}</span>
          </div>
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{request.catatan}</span>
          </div>
        </div>

        {/* Form */}
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alasan Penolakan *
        </label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Jelaskan alasan penolakan..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          rows={3}
          required
        />

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Batal</Button>
          <Button variant="danger" onClick={handleSubmit} className="flex-1" disabled={loading}>
            {loading ? 'Memproses...' : 'Tolak'}
          </Button>
        </div>
      </div>
    </div>
  );
}
