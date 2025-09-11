'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  User, 
  Package, 
  Calendar, 
  Camera, 
  QrCode, 
  X, 
  AlertCircle,
  Check,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import QRScanner from '@/components/scanner/QRScanner';
import CameraCapture from '@/components/camera/CameraCapture';
import { barangApi } from '@/lib/api';
import type { Peminjaman, Barang, Lokasi } from '@/types/api';

interface EnhancedReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    penanggungJawab: string, 
    catatan: string, 
    lokasiId: string,        // 🔥 tambahkan lokasi ke submit
    foto?: File
  ) => Promise<void>;
  peminjaman?: Peminjaman | null;
  lokasiList: Lokasi[];       // 🔥 tambah list lokasi
  loading?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  scannedItem?: Barang;
  message: string;
}

export default function EnhancedReturnModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  peminjaman, 
  lokasiList,       // 🔥 ambil lokasiList
  loading 
}: EnhancedReturnModalProps) {
  const [step, setStep] = useState<'scan' | 'form'>('scan');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [catatan, setCatatan] = useState('');
  const [lokasiId, setLokasiId] = useState('');   // 🔥 state lokasi
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  
  // Scanner states
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [scanLoading, setScanLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset all states when modal closes
      setStep('scan');
      setPenanggungJawab('');
      setCatatan('');
      setLokasiId('');   // 🔥 reset lokasi
      setFoto(null);
      setFotoPreview(null);
      setValidationResult(null);
      setScanLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!penanggungJawab.trim()) {
      toast.error('Nama penanggung jawab harus diisi');
      return;
    }
    if (!lokasiId) {   // 🔥 validasi lokasi
      toast.error('Lokasi harus dipilih');
      return;
    }
    if (!catatan.trim()) {
      toast.error('Catatan pengembalian harus diisi');
      return;
    }

    await onSubmit(penanggungJawab.trim(), catatan.trim(), lokasiId, foto || undefined);
  };

  if (!isOpen || !peminjaman) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[60]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl shadow-lg border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 bg-blue-950 sticky top-0 z-10">
          <h3 className="text-base sm:text-lg font-semibold text-white">
            Proses Pengembalian
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                />
              </div>

              {/* 🔥 Lokasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <select
                  value={lokasiId}
                  onChange={(e) => setLokasiId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900"
                  required
                >
                  <option value="">Pilih Lokasi</option>
                  {lokasiList.map((lokasi) => (
                    <option key={lokasi.id} value={lokasi.id}>
                      {lokasi.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan Pengembalian <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Kondisi barang saat dikembalikan..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
                  rows={3}
                  required
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
