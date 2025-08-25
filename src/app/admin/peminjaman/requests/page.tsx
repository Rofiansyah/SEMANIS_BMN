'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import CameraCapture from '@/components/camera/CameraCapture';
import { peminjamanApi } from '@/lib/api';
import type { Peminjaman } from '@/types/api';
import { 
  CheckCircle, 
  XCircle,
  User,
  Package,
  Calendar,
  AlertCircle,
  Camera,
  MessageSquare,
  Eye,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ApprovalModalProps {
  request: Peminjaman | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, penanggungJawab: string, foto?: File) => Promise<void>;
  onReject: (id: string, catatan: string) => Promise<void>;
}

function ApprovalModal({ request, isOpen, onClose, onApprove, onReject }: ApprovalModalProps) {
  const [mode, setMode] = useState<'approve' | 'reject'>('approve');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [catatan, setCatatan] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);

  const handleSubmit = async () => {
    if (!request) return;
    
    setLoading(true);
    try {
      if (mode === 'approve') {
        if (!penanggungJawab.trim()) {
          toast.error('Nama penanggung jawab harus diisi');
          return;
        }
        await onApprove(request.id, penanggungJawab, foto || undefined);
      } else {
        if (!catatan.trim()) {
          toast.error('Alasan penolakan harus diisi');
          return;
        }
        await onReject(request.id, catatan);
      }
      
      // Reset form
      setPenanggungJawab('');
      setCatatan('');
      setFoto(null);
      setFotoPreview(null);
      onClose();
    } catch (error) {
      console.error('Failed to process request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = (file: File) => {
    setFoto(file);
    const previewUrl = URL.createObjectURL(file);
    setFotoPreview(previewUrl);
    setIsCameraCaptureOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const previewUrl = URL.createObjectURL(file);
      setFotoPreview(previewUrl);
    }
  };

  const handleRemovePhoto = () => {
    if (fotoPreview) {
      URL.revokeObjectURL(fotoPreview);
    }
    setFoto(null);
    setFotoPreview(null);
  };

  if (!isOpen || !request) return null;

  return (
    <div 
      className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-[60]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border-0">
        <h3 className="text-lg font-semibold mb-4">
          {mode === 'approve' ? 'Setujui Permintaan' : 'Tolak Permintaan'}
        </h3>
        
        {/* Request Info */}
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

        {/* Mode Selection */}
        <div className="flex space-x-2 mb-4">
          <Button
            size="sm"
            variant={mode === 'approve' ? 'primary' : 'outline'}
            onClick={() => setMode('approve')}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Setujui
          </Button>
          <Button
            size="sm"
            variant={mode === 'reject' ? 'danger' : 'outline'}
            onClick={() => setMode('reject')}
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Tolak
          </Button>
        </div>

        {/* Form Fields */}
        {mode === 'approve' ? (
          <div className="space-y-4">
            <Input
              label="Nama Penanggung Jawab *"
              value={penanggungJawab}
              onChange={(e) => setPenanggungJawab(e.target.value)}
              placeholder="Nama lengkap penanggung jawab"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Dokumentasi (Opsional)
              </label>
              
              {fotoPreview ? (
                <div className="space-y-3">
                  <img
                    src={fotoPreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <div className="flex space-x-2">
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
                      onClick={handleRemovePhoto}
                      className="flex-1"
                    >
                      Hapus Foto
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Camera className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-600 text-center">
                      Ambil foto atau upload dari galeri
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCameraCaptureOpen(true)}
                      >
                        <Camera className="w-4 h-4 mr-1" />
                        Kamera
                      </Button>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                          <Upload className="w-4 h-4 mr-1" />
                          Upload
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Penolakan *
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Jelaskan alasan penolakan..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              rows={3}
              required
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            variant={mode === 'approve' ? 'primary' : 'danger'}
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Memproses...' : mode === 'approve' ? 'Setujui' : 'Tolak'}
          </Button>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={isCameraCaptureOpen}
        onClose={() => setIsCameraCaptureOpen(false)}
        onCapture={handleCameraCapture}
        title="Foto Dokumentasi Peminjaman"
      />
    </div>
  );
}

export default function AdminApproveRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Peminjaman | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      const response = await peminjamanApi.getAllRequests();
      if (response.status === 'success') {
        // Filter only pending requests
        setRequests(response.data.filter(req => req.status === 'PENDING'));
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (request: Peminjaman) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setIsModalOpen(false);
  };

  const handleApprove = async (id: string, penanggungJawab: string, foto?: File) => {
    const response = await peminjamanApi.approve(id, { penanggungJawab, fotoPinjam: foto });
    if (response.status === 'success') {
      toast.success('Permintaan berhasil disetujui! ✅');
      loadPendingRequests();
    }
  };

  const handleReject = async (id: string, catatan: string) => {
    const response = await peminjamanApi.reject(id, { catatan });
    if (response.status === 'success') {
      toast.success('Permintaan berhasil ditolak! ❌');
      loadPendingRequests();
    }
  };

  return (
    <DashboardLayout title="Setujui/Tolak Permintaan">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Setujui/Tolak Permintaan</h1>
          <p className="text-gray-600 mt-1">Proses permintaan peminjaman yang masuk</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Menunggu Persetujuan</p>
                <p className="text-2xl font-bold text-yellow-800">{requests.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Permintaan Menunggu Persetujuan</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                <span className="text-gray-600">Memuat data...</span>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada permintaan yang menunggu persetujuan</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{request.user.nama}</h3>
                          <p className="text-sm text-gray-500">{request.user.email}</p>
                        </div>
                      </div>
                      
                      <div className="ml-14 space-y-2">
                        <div className="flex items-center space-x-3">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{request.barang.nama}</span>
                          <span className="text-sm text-gray-500">({request.barang.kodeBarang})</span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Diminta pada {new Date(request.tanggalPengajuan).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-600">{request.catatan}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/peminjaman/${request.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detail
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenModal(request)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Proses
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </DashboardLayout>
  );
}