'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import CameraCapture from '@/components/camera/CameraCapture';
import { 
  CheckCircle, 
  Camera,
  Upload,
  User,
  Package,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Peminjaman } from '@/types/api';

interface ApproveModalProps {
  request: Peminjaman | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, penanggungJawab: string, foto?: File) => Promise<void>;
}

export default function ApproveModal({ request, isOpen, onClose, onApprove }: ApproveModalProps) {
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);

  const handleSubmit = async () => {
    if (!request) return;
    if (!penanggungJawab.trim()) {
      toast.error('Nama penanggung jawab harus diisi');
      return;
    }

    setLoading(true);
    try {
      await onApprove(request.id, penanggungJawab, foto || undefined);
      // reset
      setPenanggungJawab('');
      setFoto(null);
      setFotoPreview(null);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = (file: File) => {
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
    setIsCameraCaptureOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFoto(null);
    setFotoPreview(null);
  };

  if (!isOpen || !request) return null;

  return (
    <div 
      className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-[60]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border-0">
        <h3 className="text-lg font-semibold mb-4">Setujui Permintaan</h3>

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
        <Input
          label="Nama Penanggung Jawab *"
          value={penanggungJawab}
          onChange={(e) => setPenanggungJawab(e.target.value)}
          placeholder="Nama lengkap penanggung jawab"
          required
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto Dokumentasi (Opsional)
          </label>
          {fotoPreview ? (
            <div className="space-y-3">
              <img src={fotoPreview} className="w-full h-32 object-cover rounded-lg border" />
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setIsCameraCaptureOpen(true)} className="flex-1">
                  <Camera className="w-4 h-4 mr-1" /> Ambil Ulang
                </Button>
                <Button variant="outline" size="sm" onClick={handleRemovePhoto} className="flex-1">
                  Hapus Foto
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Ambil foto atau upload dari galeri</p>
              <div className="flex space-x-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => setIsCameraCaptureOpen(true)}>
                  <Camera className="w-4 h-4 mr-1" /> Kamera
                </Button>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <div className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                    <Upload className="w-4 h-4 mr-1" /> Upload
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Batal</Button>
          <Button variant="primary" onClick={handleSubmit} className="flex-1" disabled={loading}>
            {loading ? 'Memproses...' : 'Setujui'}
          </Button>
        </div>
      </div>

      {/* Camera Modal */}
      <CameraCapture
        isOpen={isCameraCaptureOpen}
        onClose={() => setIsCameraCaptureOpen(false)}
        onCapture={handleCameraCapture}
        title="Foto Dokumentasi Peminjaman"
      />
    </div>
  );
}