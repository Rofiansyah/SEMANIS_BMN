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
  X,
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
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-lg border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Fixed */}
        <div className="flex justify-between items-center p-5 bg-blue-950 sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-white">Setujui Permintaan</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Scrollable */}
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

            {/* Nama Penanggung Jawab */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Penanggung Jawab <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={penanggungJawab}
                onChange={(e) => setPenanggungJawab(e.target.value)}
                placeholder="Nama lengkap penanggung jawab"
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
                required
                disabled={loading}
              />
            </div>

            {/* Upload Foto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Dokumentasi (Opsional)
              </label>
              {fotoPreview ? (
                <div className="space-y-3">
                  <img
                    src={fotoPreview}
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCameraCaptureOpen(true)}
                      className="flex-1"
                    >
                      <Camera className="w-4 h-4 mr-1" /> Ambil Ulang
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="flex-1"
                    >
                      Hapus Foto
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Ambil foto atau upload dari galeri
                  </p>
                  <div className="flex space-x-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCameraCaptureOpen(true)}
                    >
                      <Camera className="w-4 h-4 mr-1" /> Kamera
                    </Button>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                        <Upload className="w-4 h-4 mr-1" /> Upload
                      </div>
                    </label>
                  </div>
                </div>
              )}
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
                {loading ? 'Memproses...' : 'Setujui'}
              </Button>
            </div>
          </form>
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