'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Tag, 
  Bookmark, 
  Calendar, 
  Send, 
  CheckCircle,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import api from '@/lib/api';
import { Barang, CreatePeminjamanRequest, Peminjaman } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState<Barang | null>(null);
  const [borrowHistory, setBorrowHistory] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [borrowNote, setBorrowNote] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchItemDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/barang/${params.id}`);
      setItem(response.data.data);
    } catch (error) {
      console.error('Error fetching item detail:', error);
      toast.error('Gagal memuat detail barang');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchBorrowHistory = useCallback(async () => {
    try {
      const response = await api.get('/peminjaman/my-history');
      const data = response.data.data || [];
      
      // Filter history for this specific item
      const itemHistory = data.filter((peminjaman: { barangId: string }) => 
        peminjaman.barangId === params.id
      );
      
      setBorrowHistory(itemHistory);
    } catch (error) {
      console.error('Error fetching borrow history:', error);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchItemDetail();
      fetchBorrowHistory();
    }
  }, [params.id, fetchItemDetail, fetchBorrowHistory]);

  const handleBorrowRequest = async () => {
    if (!item || !user) return;

    try {
      setBorrowing(true);
      const borrowData: CreatePeminjamanRequest = {
        barangId: item.id,
        catatan: borrowNote
      };

      await api.post('/peminjaman/request', borrowData);
      setSuccess(true);
      setShowBorrowForm(false);
      setBorrowNote('');
      
      toast.success('Permintaan peminjaman berhasil dikirim!');
      
      // Show success message for 3 seconds then redirect
      setTimeout(() => {
        router.push('/user/status');
      }, 3000);
    } catch (error) {
      console.error('Error creating borrow request:', error);
      toast.error('Gagal membuat permintaan peminjaman. Silakan coba lagi.');
    } finally {
      setBorrowing(false);
    }
  };

  const getStatusBadge = (kondisi: string) => {
    const statusMap = {
      'BAIK': 'bg-green-100 text-green-800',
      'RUSAK_RINGAN': 'bg-yellow-100 text-yellow-800',
      'RUSAK_BERAT': 'bg-red-100 text-red-800'
    };
    
    const statusText = {
      'BAIK': 'Baik',
      'RUSAK_RINGAN': 'Rusak Ringan',
      'RUSAK_BERAT': 'Rusak Berat'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusMap[kondisi as keyof typeof statusMap] || 'bg-gray-100 text-gray-800'}`}>
        {statusText[kondisi as keyof typeof statusText] || kondisi}
      </span>
    );
  };

  const canBorrow = item?.status !== 'DIPINJAM';

  if (loading) {
    return (
      <DashboardLayout title="Detail Barang">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout title="Detail Barang">
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Barang tidak ditemukan
          </h3>
          <Button 
            variant="secondary" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Kembali
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout title="Permintaan Berhasil">
        <div className="max-w-md mx-auto text-center py-12">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Permintaan Peminjaman Berhasil!
          </h3>
          <p className="text-gray-600 mb-6">
            Permintaan Anda telah dikirim dan menunggu persetujuan admin.
            Anda akan diarahkan ke halaman status...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Detail Barang">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{item.nama}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              {item.fotoUrl ? (
                <img
                  src={item.fotoUrl}
                  alt={item.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package size={96} className="text-gray-400" />
                </div>
              )}
            </div>

          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.nama}
                  </h2>
                  <p className="text-sm text-gray-500 font-mono">
                    Kode: {item.kodeBarang}
                  </p>
                </div>
                {getStatusBadge(item.kondisi)}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <Tag size={16} className="mr-3" />
                  <span className="font-medium mr-2">Kategori:</span>
                  <span>{item.kategori?.nama}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Bookmark size={16} className="mr-3" />
                  <span className="font-medium mr-2">Merek:</span>
                  <span>{item.merek?.nama}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-3" />
                  <span className="font-medium mr-2">Lokasi:</span>
                  <span>{item.lokasi?.nama}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-3" />
                  <span className="font-medium mr-2">Ditambahkan:</span>
                  <span>{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Deskripsi</h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.deskripsi}
                </p>
              </div>

              {/* Borrow Action */}
              <div className="border-t pt-6">
                {canBorrow ? (
                  <div>
                    {!showBorrowForm ? (
                      <Button 
                        onClick={() => setShowBorrowForm(true)}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Send size={16} />
                        Ajukan Peminjaman
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Catatan Peminjaman
                          </label>
                          <textarea
                            value={borrowNote}
                            onChange={(e) => setBorrowNote(e.target.value)}
                            placeholder="Jelaskan tujuan peminjaman barang ini..."
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={4}
                            required
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={handleBorrowRequest}
                            disabled={borrowing || !borrowNote.trim()}
                            className="flex-1 flex items-center justify-center gap-2"
                          >
                            {borrowing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Mengirim...
                              </>
                            ) : (
                              <>
                                <Send size={16} />
                                Kirim Permintaan
                              </>
                            )}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setShowBorrowForm(false);
                              setBorrowNote('');
                            }}
                            disabled={borrowing}
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle size={20} className="mx-auto text-yellow-500 mb-2" />
                    <p className="text-sm text-gray-600">
                      Barang sedang dipinjam
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Borrowing History Photos */}
        {borrowHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon size={20} />
              Riwayat Peminjaman Anda untuk Item Ini
            </h3>
            
            <div className="space-y-6">
              {borrowHistory.map((history, index) => (
                <div key={history.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Peminjaman #{borrowHistory.length - index}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(history.tanggalPengajuan).toLocaleDateString('id-ID')} - {' '}
                        {history.tanggalDikembalikan 
                          ? new Date(history.tanggalDikembalikan).toLocaleDateString('id-ID')
                          : 'Belum dikembalikan'
                        }
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      history.status === 'DIKEMBALIKAN' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {history.status === 'DIKEMBALIKAN' ? 'Dikembalikan' : 'Ditolak'}
                    </span>
                  </div>

                  {(history.fotoPinjam || history.fotoKembali) && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-3">Dokumentasi</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {history.fotoPinjam && (
                          <div>
                            <h6 className="text-sm font-medium text-gray-600 mb-2">
                              Foto Saat Dipinjam
                            </h6>
                            <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={history.fotoPinjam}
                                alt="Foto saat dipinjam"
                                className="w-full h-48 object-cover cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => history.fotoPinjam && window.open(history.fotoPinjam, '_blank')}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Klik untuk memperbesar</p>
                            {history.penanggungJawab && (
                              <p className="text-xs text-gray-600 mt-1">
                                Penanggung jawab: {history.penanggungJawab}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {history.fotoKembali && (
                          <div>
                            <h6 className="text-sm font-medium text-gray-600 mb-2">
                              Foto Saat Dikembalikan
                            </h6>
                            <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={history.fotoKembali}
                                alt="Foto saat dikembalikan"
                                className="w-full h-48 object-cover cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => history.fotoKembali && window.open(history.fotoKembali, '_blank')}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Klik untuk memperbesar</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {history.catatan && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h6 className="text-sm font-medium text-gray-700 mb-1">Catatan</h6>
                      <p className="text-sm text-gray-600">{history.catatan}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {borrowHistory.length === 0 && (
              <div className="text-center py-8">
                <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Anda belum pernah meminjam item ini sebelumnya
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}