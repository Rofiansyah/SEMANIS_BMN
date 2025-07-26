'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { peminjamanApi } from '@/lib/api';
import type { PeminjamanReport, Peminjaman } from '@/types/api';
import { exportPeminjamanStatisticsPDF } from '@/utils/pdfExport';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  Calendar,
  RefreshCw,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function AdminBorrowingReportsPage() {
  const router = useRouter();
  const [report, setReport] = useState<PeminjamanReport | null>(null);
  const [allRequests, setAllRequests] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // days

  useEffect(() => {
    loadReports();
    loadAllRequests();
  }, []);

  const loadReports = async () => {
    try {
      const response = await peminjamanApi.getReports();
      console.log('Reports response:', response); // Debug log
      // Handle the actual API response structure
      if (response.status === 'success') {
        setReport(response.data);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const loadAllRequests = async () => {
    try {
      const response = await peminjamanApi.getReports();
      console.log('All requests response:', response); // Debug log
      // Handle the actual API response structure
      if (response.status === 'success') {
        // Combine all status arrays to get all requests
        const allData = [
          ...response.data.pending,
          ...response.data.dipinjam,
          ...response.data.dikembalikan
        ];
        setAllRequests(allData);
      }
    } catch (error) {
      console.error('Failed to load all requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    Promise.all([loadReports(), loadAllRequests()]).finally(() => {
      setLoading(false);
    });
  };

  // Calculate period-based stats
  const getFilteredRequests = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return allRequests.filter(req => new Date(req.tanggalPengajuan) >= cutoffDate);
  };

  const periodRequests = getFilteredRequests(parseInt(selectedPeriod));

  const handleExportPDF = () => {
    if (!report) return;
    
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const currentMonth = monthNames[new Date().getMonth()];
    const periodText = selectedPeriod === '30' ? currentMonth : 
                      selectedPeriod === '7' ? '7 Hari Terakhir' :
                      selectedPeriod === '90' ? '3 Bulan Terakhir' : 'Semua Periode';
    
    const transaksiDetail = allRequests.slice(0, 10).map(req => ({
      tanggal: new Date(req.tanggalPengajuan).toLocaleDateString('id-ID'),
      namaBarang: req.barang.nama,
      peminjam: req.user.nama,
      status: req.status === 'PENDING' ? 'Menunggu' :
              req.status === 'DIPINJAM' ? 'Sedang Dipinjam' :
              req.status === 'DIKEMBALIKAN' ? 'Dikembalikan' : 'Ditolak'
    }));
    
    exportPeminjamanStatisticsPDF({
      bulan: periodText,
      totalPeminjaman: report.summary.totalPending + report.summary.totalDipinjam + report.summary.totalDikembalikan,
      totalPengembalian: report.summary.totalDikembalikan,
      transaksiDetail
    });
  };

  const getStatusCount = (status: string, requests: Peminjaman[] = allRequests) => {
    return requests.filter(req => req.status === status).length;
  };

  const getApprovalRate = (requests: Peminjaman[] = allRequests) => {
    const totalProcessed = requests.filter(req => req.status !== 'PENDING').length;
    const approved = getStatusCount('DIPINJAM', requests) + getStatusCount('DIKEMBALIKAN', requests);
    return totalProcessed > 0 ? Math.round((approved / totalProcessed) * 100) : 0;
  };

  const getAverageProcessingTime = (requests: Peminjaman[] = allRequests) => {
    const processedRequests = requests.filter(req => req.status !== 'PENDING');
    if (processedRequests.length === 0) return 0;

    const totalDays = processedRequests.reduce((sum, req) => {
      const created = new Date(req.tanggalPengajuan);
      const approved = req.tanggalDisetujui ? new Date(req.tanggalDisetujui) : new Date(req.updatedAt);
      const diffTime = Math.abs(approved.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    return Math.round(totalDays / processedRequests.length);
  };

  if (loading) {
    return (
      <DashboardLayout title="Laporan Peminjaman">
        <div className="flex items-center justify-center h-64">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <span className="text-gray-600">Memuat laporan...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Laporan Peminjaman">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Peminjaman</h1>
            <p className="text-gray-600 mt-1">Analisis dan statistik peminjaman barang</p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
              <option value="90">90 Hari Terakhir</option>
              <option value="365">1 Tahun Terakhir</option>
            </select>
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={handleExportPDF} disabled={!report}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Permintaan</p>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{allRequests.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              {periodRequests.length} dalam {selectedPeriod} hari terakhir
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Tingkat Persetujuan</p>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-600">{getApprovalRate()}%</p>
            <p className="text-sm text-gray-500 mt-1">
              {getApprovalRate(periodRequests)}% periode ini
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Waktu Proses Rata-rata</p>
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{getAverageProcessingTime()}</p>
            <p className="text-sm text-gray-500 mt-1">
              hari ({getAverageProcessingTime(periodRequests)} hari periode ini)
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Sedang Dipinjam</p>
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {getStatusCount('DIPINJAM')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              barang sedang dipinjam
            </p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Permintaan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Menunggu</span>
              </div>
              <span className="text-lg font-bold text-yellow-700">
                {report?.summary?.totalPending || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Sedang Dipinjam</span>
              </div>
              <span className="text-lg font-bold text-green-700">
                {report?.summary?.totalDipinjam || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Dikembalikan</span>
              </div>
              <span className="text-lg font-bold text-blue-700">
                {report?.summary?.totalDikembalikan || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {allRequests.slice(0, 10).map((request) => (
              <div key={request.id} className="p-6 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                   onClick={() => router.push(`/admin/peminjaman/${request.id}`)}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {request.user.nama} - {request.barang.nama}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(request.tanggalPengajuan).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'DIPINJAM' ? 'bg-green-100 text-green-800' :
                  request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {request.status === 'PENDING' ? 'Menunggu' :
                   request.status === 'DIPINJAM' ? 'Sedang Dipinjam' :
                   request.status === 'REJECTED' ? 'Ditolak' :
                   'Dikembalikan'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}