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
import type { Peminjaman, Barang } from '@/types/api';

interface EnhancedReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (penanggungJawab: string, catatan: string, foto?: File) => Promise<void>;
  peminjaman?: Peminjaman | null;
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
  loading 
}: EnhancedReturnModalProps) {
  const [step, setStep] = useState<'scan' | 'form'>('scan');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [catatan, setCatatan] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  
  // Scanner states
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  
  // Debug log for camera state changes
  useEffect(() => {
    console.log('EnhancedReturnModal: isCameraCaptureOpen changed to:', isCameraCaptureOpen);
  }, [isCameraCaptureOpen]);
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
    }
  }, [isOpen]);

  const validateScannedItem = (scannedItem: Barang, expectedItem: Barang): ValidationResult => {
    // Compare nama, merek, and lokasi as requested
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
      if (!nameMatch) errors.push(`Nama barang tidak sesuai (scan: ${scannedItem.nama}, expected: ${expectedItem.nama})`);
      if (!merekMatch) errors.push(`Merek tidak sesuai (scan: ${scannedItem.merek.nama}, expected: ${expectedItem.merek.nama})`);
      if (!lokasiMatch) errors.push(`Lokasi tidak sesuai (scan: ${scannedItem.lokasi.nama}, expected: ${expectedItem.lokasi.nama})`);
      
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
          // Auto-advance to form step after successful validation
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const previewUrl = URL.createObjectURL(file);
      setFotoPreview(previewUrl);
    }
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

    await onSubmit(penanggungJawab.trim(), catatan.trim(), foto || undefined);
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
  <div
    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[60]"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white rounded-xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl shadow-lg border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col animate-fadeIn">
      {/* Header Fixed */}
      <div className="flex justify-between items-center p-4 sm:p-5 bg-blue-950 sticky top-0 z-10">
        <h3 className="text-base sm:text-lg font-semibold text-white">
          Proses Pengembalian
        </h3>
        <button onClick={onClose} className="text-white hover:text-gray-200 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Scrollable */}
      <div className="p-4 sm:p-6 overflow-y-auto flex-1">
        {/* Progress indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <div
            className={`flex items-center ${
              step === "scan"
                ? "text-blue-600"
                : validationResult?.isValid
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                step === "scan"
                  ? "bg-blue-100"
                  : validationResult?.isValid
                  ? "bg-green-100"
                  : "bg-gray-100"
              }`}
            >
              {validationResult?.isValid ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <span className="ml-2 text-xs sm:text-sm font-medium">Scan QR Code</span>
          </div>
          <div className="flex-1 h-px bg-gray-300 sm:mx-4 hidden sm:block"></div>
          <div
            className={`flex items-center ${
              step === "form" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                step === "form" ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              2
            </div>
            <span className="ml-2 text-xs sm:text-sm font-medium">Form Pengembalian</span>
          </div>
        </div>

        {/* Request Info */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
            <User className="w-4 h-4 text-gray-700" />
            <span className="text-sm text-gray-700">{peminjaman.user.nama}</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
            <Package className="w-4 h-4 text-gray-700" />
            <span className="text-sm text-gray-700">{peminjaman.barang.nama}</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Calendar className="w-4 h-4 text-gray-700" />
            <span className="text-sm text-gray-700">
              Dipinjam:{" "}
              {peminjaman.tanggalDipinjam
                ? new Date(peminjaman.tanggalDipinjam).toLocaleDateString("id-ID")
                : "-"}
            </span>
          </div>
        </div>

        {step === "scan" ? (
          // QR Scanning Step
          <div className="space-y-4">
            <div className="text-center py-4 sm:py-6">
              <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Scan QR Code Barang
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Scan QR Code pada barang untuk memverifikasi bahwa barang yang dikembalikan sesuai
              </p>

              {/* Validation Result */}
              {validationResult && (
                <div
                  className={`p-3 sm:p-4 rounded-lg mb-4 ${
                    validationResult.isValid
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    {validationResult.isValid ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <p
                    className={`text-xs sm:text-sm ${
                      validationResult.isValid ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {validationResult.message}
                  </p>
                </div>
              )}

              {scanLoading && (
                <div className="flex items-center justify-center mb-4">
                  <div className="inline-flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-500"></div>
                    <span className="text-xs sm:text-sm text-gray-600">
                      Memvalidasi QR Code...
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                variant="primary"
                onClick={() => setIsQRScannerOpen(true)}
                className="w-full sm:w-auto bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200"
                disabled={scanLoading}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Buka Scanner QR
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"  
                onClick={handleSkipScan}
                disabled={scanLoading}
              >
                Lewati Scan (Manual)
              </Button>
            </div>
          </div>
        ) : (
          // Form Step
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

            {/* Catatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan Pengembalian <span className="text-red-500">*</span>
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Kondisi barang saat dikembalikan, catatan khusus, dll..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
                rows={3}
                required
              />
            </div>

{/* Foto Dokumentasi */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Foto Dokumentasi (Opsional)
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
      className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition"
      onClick={() => setIsCameraCaptureOpen(true)}
    >
      <div className="flex flex-col items-center space-y-2">
        <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
        <p className="text-xs sm:text-sm text-gray-600 text-center">
          Klik di sini untuk ambil foto dokumentasi
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
                onClick={() => setStep("scan")}
                className="flex-1 text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
                disabled={loading}
              >
                Kembali
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1 bg-blue-950 hover:bg-blue-900 text-white transition-colors duration-200"
              >
                {loading ? "Memproses..." : "Proses Pengembalian"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>

    {/* QR Scanner Modal */}
    <QRScanner
      isOpen={isQRScannerOpen}
      onClose={() => setIsQRScannerOpen(false)}
      onScan={handleQRScan}
      title="Scan QR Code Barang"
    />

    {/* Camera Capture Modal */}
    <CameraCapture
      isOpen={isCameraCaptureOpen}
      onClose={() => setIsCameraCaptureOpen(false)}
      onCapture={handleCameraCapture}
      title="Foto Dokumentasi Pengembalian"
    />
  </div>
);
}