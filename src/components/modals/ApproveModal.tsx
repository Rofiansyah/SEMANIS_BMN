'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  CheckCircle, 
  Camera,
  User,
  Package,
  X,
  MessageSquare,
  MapPin
} from 'lucide-react';
import CameraCapture from '@/components/camera/CameraCapture';
import toast from 'react-hot-toast';
import type { Peminjaman, Lokasi } from '@/types/api';
import { barangApi } from '@/lib/api';

interface ApproveModalProps {
  request: Peminjaman | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, penanggungJawab: string, foto?: File, lokasiId?: string) => Promise<void>;
  lokasiList: Lokasi[];
}

export default function ApproveModal({ request, isOpen, onClose, onApprove, lokasiList }: ApproveModalProps) {
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);

  const [lokasiId, setLokasiId] = useState('');

  useEffect(() => {
    if (isOpen && request) {
      setLokasiId(request.barang.lokasi?.id || '');
    }
  }, [isOpen, request]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!request) return;
    if (!penanggungJawab.trim()) {
      toast.error('Nama penanggung jawab harus diisi');
      return;
    }
    if (!lokasiId) {
      toast.error('Lokasi harus dipilih');
      return;
    }

    setLoading(true);
    try {
      await onApprove(request.id, penanggungJawab, foto || undefined, lokasiId);
      // reset
      setPenanggungJawab('');
      setFoto(null);
      setFotoPreview(null);
      setLokasiId('');
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

            {/* Edit Lokasi (Update Barang) */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Lokasi Barang <span className="text-red-500">*</span>
  </label>
  <div className="flex items-center gap-2">
    <MapPin className="w-5 h-5 text-gray-600" />
    <select
      value={lokasiId}
      onChange={async (e) => {
        const newLokasiId = e.target.value;
        setLokasiId(newLokasiId);

        if (!request?.barang) return;
        try {
          // update barang lokasi langsung ke API
          await barangApi.update(request.barang.id, {
            nama: request.barang.nama,
            deskripsi: request.barang.deskripsi || '',
            kategoriId: request.barang.kategori.id,
            merekId: request.barang.merek.id,
            lokasiId: newLokasiId,
            kondisi: request.barang.kondisi,
          });
          toast.success('Lokasi barang berhasil diperbarui ✅');
        } catch (error) {
          console.error(error);
          toast.error('Gagal memperbarui lokasi barang');
        }
      }}
      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900"
      required
      disabled={loading}
    >
      <option value="">Pilih Lokasi</option>
      {lokasiList.map((lokasi) => (
        <option key={lokasi.id} value={lokasi.id}>
          {lokasi.nama}
        </option>
      ))}
    </select>
  </div>
</div>


            {/* Foto Dokumentasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto Barang (Opsional)
              </label>
              {fotoPreview ? (
                <div className="space-y-3">
                  <img
                    src={fotoPreview}
                    alt="Preview"
                    className="w-full h-28 sm:h-32 object-cover rounded-lg border"
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCameraCaptureOpen(true)}
                      className="flex-1"
                    >
                      <Camera className="w-4 h-4 mr-1" />
                      Ambil Ulang
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFoto(null);
                        setFotoPreview(null);
                      }}
                      className="flex-1"
                    >
                      Hapus Foto
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-950 transition"
                  onClick={() => setIsCameraCaptureOpen(true)}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                    <p className="text-xs sm:text-sm text-gray-600 text-center">
                      Klik di sini untuk ambil foto barang
                    </p>
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
