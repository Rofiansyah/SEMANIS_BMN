'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { X, Camera, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
  title?: string;
}

export default function QRScanner({ isOpen, onClose, onScan, title = "Scan QR Code" }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Check camera permission first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment' // Use back camera if available
          } 
        });
        setHasPermission(true);
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (permissionError) {
        console.error('Camera permission error:', permissionError);
        setHasPermission(false);
        if (permissionError instanceof Error) {
          if (permissionError.name === 'NotAllowedError') {
            setError('Camera access was denied. Please allow camera access and try again.');
          } else if (permissionError.name === 'NotFoundError') {
            setError('No camera device found. Please ensure you have a camera connected.');
          } else {
            setError('Failed to access camera. Please check your camera permissions.');
          }
        } else {
          setError('An unknown error occurred while accessing the camera.');
        }
        setIsScanning(false);
        return;
      }

      // Initialize ZXing reader
      readerRef.current = new BrowserMultiFormatReader();

      // Start scanning - ZXing will handle camera access
      if (videoRef.current) {
        await readerRef.current.decodeFromVideoDevice(
          null, // Use default video device
          videoRef.current,
          (result, error) => {
            if (result) {
              onScan(result.getText());
              stopScanning();
            }
            if (error && !(error.name === 'NotFoundException')) {
              console.error('Scanning error:', error);
            }
          }
        );
      }
    } catch (err) {
      console.error('ZXing scanner error:', err);
      if (err instanceof Error) {
        setError(`Scanner initialization failed: ${err.message}`);
      } else {
        setError('Scanner initialization failed. Please try again.');
      }
      setIsScanning(false);
    }
  }, [onScan]);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, startScanning]);

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {title}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={startScanning}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : hasPermission === false ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Camera permission is required to scan QR codes.</p>
            <button
              onClick={startScanning}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Grant Permission
            </button>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 bg-black rounded-lg object-cover"
              playsInline
              muted
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              </div>
            </div>

            {isScanning && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-sm text-white bg-black bg-opacity-50 px-3 py-1 rounded-full inline-block">
                  Scanning for QR code...
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Position the QR code within the scanning area
          </p>
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}