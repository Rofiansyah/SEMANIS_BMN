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
  Check
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
  onSubmit: (penanggungJawab: string, catatan: string, foto?: File, lokasiId?: string) => Promise<void>;
  peminjaman?: Peminjaman | null;
  loading?: boolean;
  lokasiList: Lokasi[]; // ✅ tambahan
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
  loading,
  lokasiList
}: EnhancedReturnModalProps) {
  const [step, setStep] = useState<'scan' | 'form'>('scan');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [catatan, setCatatan] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [lokasiId, setLokasiId] = useState(''); // ✅ state lokasi
  
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
      setFoto(null);
      setFotoPreview(null);
      setValidationResult(null);
      setScanLoading(false);
      setLokasiId(''); // ✅ reset lokasi
    } else if (peminjaman) {
      setLokasiId(peminjaman.barang.lokasi.id); // ✅ default lokasi saat barang dipinjam
    }
  }, [isOpen, peminjaman]);

  const validateScannedItem = (scannedItem: Barang, expectedItem: Barang): ValidationResult => {
    const nameMatch = scannedItem.nama.toLowerCase() === expectedItem.nama.toLowerCase();
    const merekMatch = scannedItem.merek.nama.toLowerCase() === expectedItem.merek.nama.toLowerCase();
    const lokasiMatch = scannedItem.lokasi.nama.toLowerCase() === expectedItem.lokasi.nama.toLowerCase();

    if (nameMatch && merekMatch && lokasiMatch) {
      return {
        isValid: true,
        scannedItem,
        message: 'QR Code berhasil divalidasi! Barang sesuai dengan yang dipinjam.'
      };
    } else {
      const errors = [];
      if (!nameMatch) errors.push(`Nama barang tidak sesuai`);
      if (!merekMatch) errors.push(`Merek tidak sesuai`);
      if (!lokasiMatch) errors.push(`Lokasi tidak sesuai`);
      
      return {
        isValid: false,
        scannedItem,
        message: `QR Code tidak valid: ${errors.join(', ')}`
      };
    }
  };

  const handleQRScan = async (qrData: string) => {
    if (!peminjaman) return;
    setScanLoading(true);
    try {
      const response = await barangApi.getByQRCode(qrData);
      if (response.success) {
        const validation = validateScannedItem(response.data, peminjaman.barang);
        setValidationResult(validation);
        if (validation.isValid) {
          setTimeout(() => {
            setStep('form');
          }, 2000);
        }
      } else {
        setValidationResult({
          isValid: false,
          message: 'Barang tidak ditemukan dalam sistem'
        });
      }
    } catch (error) {
      console.error('QR scan error:', error);
      setValidationResult({
        isValid: false,
        message: 'Gagal memvalidasi QR Code. Pastikan QR Code valid.'
      });
    } finally {
      setScanLoading(false);
      setIsQRScannerOpen(false);
    }
  };

  const handleCameraCapture = (file: File) => {
    setFoto(file);
    const previewUrl = URL.createObjectURL(file);
    setFotoPreview(previewUrl);
    setIsCameraCaptureOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!penanggungJawab.trim()) {
      toast.error('Nama penanggung jawab harus diisi');
      return;
    }
    if (!catatan.trim()) {
      toast.error('Catatan pengembalian harus diisi');
      return;
    }
    if (!lokasiId) {
      toast.error('Lokasi harus dipilih');
      return;
    }
    await onSubmit(penanggungJawab.trim(), catatan.trim(), foto || undefined, lokasiId);
  };

  const handleSkipScan = () => {
    setStep('form');
    setValidationResult({
      isValid: true,
      message: 'Validasi QR Code dilewati'
    });
  };

  if (!isOpen || !peminjaman) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[60]">
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950"
                  required
                />
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <select
                  value={lokasiId}
                  onChange={(e) => setLokasiId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950"
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
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950"
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
