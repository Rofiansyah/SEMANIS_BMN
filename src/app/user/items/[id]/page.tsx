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
  Image as ImageIcon,
  XCircle,
  Clock,
  Eye
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

  // mapping status untuk riwayat peminjaman
  const statusMap: Record<
    string,
    { icon: React.ReactNode; text: string; color: string; bgColor: string }
  > = {
    DIKEMBALIKAN: {
      icon: <CheckCircle size={16} />,
      text: 'Dikembalikan',
      color: 'bg-green-100 text-green-800',
      bgColor: 'bg-green-50',
    },
    DITOLAK: {
      icon: <XCircle size={16} />,
      text: 'Ditolak',
      color: 'bg-red-100 text-red-800',
      bgColor: 'bg-red-50',
    },
    MENUNGGU: {
      icon: <Clock size={16} />,
      text: 'Menunggu Persetujuan',
      color: 'bg-yellow-100 text-yellow-800',
      bgColor: 'bg-yellow-50',
    },
    DISETUJUI: {
      icon: <CheckCircle size={16} />,
      text: 'Disetujui',
      color: 'bg-blue-100 text-blue-800',
      bgColor: 'bg-blue-50',
    },
    DIPINJAM: {
      icon: <Eye size={16} />,
      text: 'Sedang Dipinjam',
      color: 'bg-purple-100 text-purple-800',
      bgColor: 'bg-purple-50',
    },
  };

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
      
      // Filter history untuk barang ini
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
      <span className={`px-3 py-1 flex justify-center items-center rounded-full text-sm font-medium ${statusMap[kondisi as keyof typeof statusMap] || 'bg-gray-100 text-gray-800'}`}>
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
            size="sm"
            variant="outlinesecond" 
            onClick={() => router.back()}
            className="flex items-center text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
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
    <div className="max-w-6xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button
          size="sm"
          variant="outlinesecond" 
          onClick={() => router.back()}
          className="flex items-center text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
        >
          <ArrowLeft size={16} />
          Kembali
        </Button>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          {item.nama}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden">
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
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
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
                <span>{new Date(item.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Deskripsi</h3>
              <p className="text-gray-600 leading-relaxed">
                {item.deskripsi || "Tidak ada deskripsi"}
              </p>
            </div>

            {/* Borrow Action */}
            <div className="border-t pt-6">
              {canBorrow ? (
                <div>
                  {!showBorrowForm ? (
                    <Button
                      onClick={() => setShowBorrowForm(true)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-950 hover:bg-blue-900 text-white rounded-lg py-2 transition"
                    >
                      <Send size={16} />
                      Ajukan Peminjaman
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Catatan Peminjaman <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={borrowNote}
                          onChange={(e) => setBorrowNote(e.target.value)}
                          placeholder="Jelaskan tujuan peminjaman barang ini..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-950 bg-white text-gray-900 placeholder-gray-500"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outlinesecond" 
                          onClick={() => {
                            setShowBorrowForm(false);
                            setBorrowNote("");
                          }}
                          disabled={borrowing}
                          className="flex-1 flex items-center justify-center gap-2 text-gray-700 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 transition-colors duration-200"
                        >
                          Batal
                        </Button>
                        <Button
                          onClick={handleBorrowRequest}
                          disabled={borrowing || !borrowNote.trim()}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-950 hover:bg-blue-900 text-white rounded-lg py-2 transition"
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
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 bg-blue-100">
                  <Package
                    size={20}
                    className="mx-auto text-blue-800 mb-2"
                  />
                  <p className="text-sm text-blue-800">
                    Barang sedang dipinjam
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Borrowing History */}
      {borrowHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon size={20} />
            Riwayat Peminjaman Anda
          </h3>

          <div className="space-y-6">
            {borrowHistory.map((history, index) => {
              const statusInfo = statusMap[history.status] || {
                icon: null,
                text: history.status,
                color: 'bg-gray-100 text-gray-800',
                bgColor: 'bg-gray-50',
              };

              return (
                <div
                  key={history.id}
                  className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition ${statusInfo.bgColor}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Peminjaman #{borrowHistory.length - index}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(history.tanggalPengajuan).toLocaleDateString("id-ID")} -{" "}
                        {history.tanggalDikembalikan
                          ? new Date(history.tanggalDikembalikan).toLocaleDateString("id-ID")
                          : "Peminjaman ditolak"}
                      </p>
                    </div>
                    <span
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                    >
                      {statusInfo.icon}
                      {statusInfo.text}
                    </span>
                  </div>

                  {(history.fotoPinjam || history.fotoKembali) && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-3">
                        Dokumentasi
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {history.fotoPinjam && (
                          <div>
                            <h6 className="text-sm font-medium text-gray-600 mb-2">
                              Foto Saat Dipinjam
                            </h6>
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={history.fotoPinjam}
                                alt="Foto saat dipinjam"
                                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
                                onClick={() =>
                                  history.fotoPinjam &&
                                  window.open(history.fotoPinjam, "_blank")
                                }
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Klik untuk memperbesar
                            </p>
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
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={history.fotoKembali}
                                alt="Foto saat dikembalikan"
                                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
                                onClick={() =>
                                  history.fotoKembali &&
                                  window.open(history.fotoKembali, "_blank")
                                }
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Klik untuk memperbesar
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {history.catatan && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h6 className="text-sm font-medium text-gray-700 mb-1">
                        Catatan
                      </h6>
                      <p className="text-sm text-gray-600">{history.catatan}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  </DashboardLayout>
);
}
