'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, RotateCw, Check, Upload } from 'lucide-react';
import { Button } from "@/components/ui/Button";

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
}

export default function CameraCapture({ isOpen, onClose, onCapture, title = "Take Photo" }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access was denied. Please allow camera access and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera device found. Please ensure you have a camera connected.');
        } else {
          setError('Failed to access camera. Please check your camera permissions.');
        }
      } else {
        setError('An unknown error occurred while accessing the camera.');
      }
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    startCamera();
  }, [capturedImage, startCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    onClose();
  }, [stopCamera, onClose]);

  const confirmPhoto = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        handleClose();
      }
    }, 'image/jpeg', 0.8);
  }, [capturedImage, onCapture, handleClose]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onCapture(file);
      handleClose();
    }
  }, [onCapture, handleClose]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Start camera when modal opens
  React.useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    return () => {
      if (!isOpen) {
        stopCamera();
      }
    };
  }, [isOpen, capturedImage, startCamera, stopCamera]);

  // Restart camera when facing mode changes
  React.useEffect(() => {
    if (isOpen && isStreaming && !capturedImage) {
      startCamera();
    }
  }, [facingMode, isOpen, isStreaming, capturedImage, startCamera]);

  if (!isOpen) {
    console.log('CameraCapture: isOpen is false');
    return null;
  }
  
  console.log('CameraCapture: Modal is open, rendering...');

return (
  <div
    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[70]"
    onClick={(e) => e.target === e.currentTarget && handleClose()}
  >
    <div className="bg-white rounded-xl w-full max-w-full sm:max-w-md shadow-lg border border-gray-100 overflow-hidden max-h-[95vh] flex flex-col animate-fadeIn">
      
      {/* Header Fixed */}
      <div className="flex justify-between items-center p-4 sm:p-5 bg-blue-950 sticky top-0 z-10">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
          <Camera className="w-5 h-5" />
          {title}
        </h3>
        <Button
          onClick={handleClose}
          className="text-white hover:text-gray-200 transition"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Body Scrollable */}
      <div className="p-3 sm:p-6 overflow-y-auto flex-1 space-y-4">
        {error ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            </div>
            <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
            <div className="space-y-2">
              <Button
                onClick={startCamera}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Try Again
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-md hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload from Gallery
              </Button>
            </div>
          </div>
        ) : capturedImage ? (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-auto sm:h-64 object-cover rounded-lg"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={retakePhoto}
                className="flex-1 px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-md hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Retake
              </Button>
              <Button
                onClick={confirmPhoto}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Use Photo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-auto sm:h-64 bg-black rounded-lg object-cover"
                autoPlay
                playsInline
                muted
              />

              {isStreaming && (
                <div className="absolute top-2 right-2">
                  <Button
                    onClick={switchCamera}
                    className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                    title="Switch camera"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-md hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>
              <Button
                onClick={capturePhoto}
                disabled={!isStreaming}
                className="flex-1 px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-md transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  </div>
);
}