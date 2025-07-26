import jsPDF from 'jspdf';

interface BarangItem {
  kodeBarang: string;
  nama: string;
  kategori: { nama: string };
  merek: { nama: string };
  lokasi: { nama: string };
  kondisi: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
  createdAt: string;
}

export interface BarangStatistics {
  totalBarang: number;
  barangBaik: number;
  barangRusakRingan: number;
  barangRusakBerat: number;
}

export interface PeminjamanStatistics {
  bulan?: string;
  totalPeminjaman: number;
  totalPengembalian: number;
  transaksiDetail?: Array<{
    tanggal: string;
    namaBarang: string;
    peminjam: string;
    status: string;
  }>;
}

export const exportBarangStatisticsPDF = (data: BarangStatistics) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN STATISTIK BARANG', 105, 30, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('SEMANTIS BMN - Sistem Inventaris', 105, 40, { align: 'center' });
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 105, 50, { align: 'center' });
  
  // Line separator
  doc.line(20, 60, 190, 60);
  
  // Statistics Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN STATISTIK', 20, 80);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const yStart = 100;
  const lineHeight = 15;
  
  // Create statistics table
  doc.text('Total Barang', 30, yStart);
  doc.text(': ' + data.totalBarang.toString(), 120, yStart);
  
  doc.text('Barang Kondisi Baik', 30, yStart + lineHeight);
  doc.text(': ' + data.barangBaik.toString(), 120, yStart + lineHeight);
  
  doc.text('Barang Rusak Ringan', 30, yStart + lineHeight * 2);
  doc.text(': ' + data.barangRusakRingan.toString(), 120, yStart + lineHeight * 2);
  
  doc.text('Barang Rusak Berat', 30, yStart + lineHeight * 3);
  doc.text(': ' + data.barangRusakBerat.toString(), 120, yStart + lineHeight * 3);
  
  // Add percentage
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PERSENTASE KONDISI BARANG', 20, yStart + lineHeight * 5);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const totalForPercent = data.totalBarang || 1; // Avoid division by zero
  const percentBaik = ((data.barangBaik / totalForPercent) * 100).toFixed(1);
  const percentRusakRingan = ((data.barangRusakRingan / totalForPercent) * 100).toFixed(1);
  const percentRusakBerat = ((data.barangRusakBerat / totalForPercent) * 100).toFixed(1);
  
  doc.text('Kondisi Baik', 30, yStart + lineHeight * 6);
  doc.text(`: ${percentBaik}%`, 120, yStart + lineHeight * 6);
  
  doc.text('Rusak Ringan', 30, yStart + lineHeight * 7);
  doc.text(`: ${percentRusakRingan}%`, 120, yStart + lineHeight * 7);
  
  doc.text('Rusak Berat', 30, yStart + lineHeight * 8);
  doc.text(`: ${percentRusakBerat}%`, 120, yStart + lineHeight * 8);
  
  // Footer
  doc.setFontSize(10);
  doc.text('Digenerate otomatis oleh SEMANTIS BMN', 105, 280, { align: 'center' });
  
  // Save the PDF
  doc.save(`Laporan-Statistik-Barang-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportPeminjamanStatisticsPDF = (data: PeminjamanStatistics) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN TRANSAKSI PEMINJAMAN', 105, 30, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('SEMANTIS BMN - Sistem Inventaris', 105, 40, { align: 'center' });
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 105, 50, { align: 'center' });
  
  if (data.bulan) {
    doc.text(`Periode: ${data.bulan}`, 105, 60, { align: 'center' });
  } else {
    doc.text('Periode: Semua Bulan', 105, 60, { align: 'center' });
  }
  
  // Line separator
  doc.line(20, 70, 190, 70);
  
  // Statistics Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN TRANSAKSI', 20, 90);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const yStart = 110;
  const lineHeight = 15;
  
  // Create statistics table
  doc.text('Total Peminjaman', 30, yStart);
  doc.text(': ' + data.totalPeminjaman.toString(), 120, yStart);
  
  doc.text('Total Pengembalian', 30, yStart + lineHeight);
  doc.text(': ' + data.totalPengembalian.toString(), 120, yStart + lineHeight);
  
  doc.text('Belum Dikembalikan', 30, yStart + lineHeight * 2);
  doc.text(': ' + (data.totalPeminjaman - data.totalPengembalian).toString(), 120, yStart + lineHeight * 2);
  
  // Add percentage
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TINGKAT PENGEMBALIAN', 20, yStart + lineHeight * 4);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const returnRate = data.totalPeminjaman > 0 
    ? ((data.totalPengembalian / data.totalPeminjaman) * 100).toFixed(1)
    : '0.0';
  
  doc.text('Tingkat Pengembalian', 30, yStart + lineHeight * 5);
  doc.text(`: ${returnRate}%`, 120, yStart + lineHeight * 5);
  
  // Transaction details if available
  if (data.transaksiDetail && data.transaksiDetail.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAIL TRANSAKSI (10 TERBARU)', 20, yStart + lineHeight * 7);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let detailY = yStart + lineHeight * 8.5;
    
    // Table headers
    doc.setFont('helvetica', 'bold');
    doc.text('Tanggal', 25, detailY);
    doc.text('Barang', 60, detailY);
    doc.text('Peminjam', 110, detailY);
    doc.text('Status', 160, detailY);
    
    doc.line(20, detailY + 2, 190, detailY + 2);
    
    doc.setFont('helvetica', 'normal');
    detailY += 8;
    
    data.transaksiDetail.slice(0, 10).forEach((transaction) => {
      doc.text(transaction.tanggal, 25, detailY);
      doc.text(transaction.namaBarang.substring(0, 20), 60, detailY);
      doc.text(transaction.peminjam.substring(0, 20), 110, detailY);
      doc.text(transaction.status, 160, detailY);
      detailY += 6;
    });
  }
  
  // Footer
  doc.setFontSize(10);
  doc.text('Digenerate otomatis oleh SEMANTIS BMN', 105, 280, { align: 'center' });
  
  // Save the PDF
  const filename = data.bulan 
    ? `Laporan-Peminjaman-${data.bulan}-${new Date().toISOString().split('T')[0]}.pdf`
    : `Laporan-Peminjaman-Semua-${new Date().toISOString().split('T')[0]}.pdf`;
    
  doc.save(filename);
};

export const exportBarangListPDF = (barangList: BarangItem[], statistics: BarangStatistics) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DAFTAR INVENTARIS BARANG', 105, 30, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('SEMANTIS BMN - Sistem Inventaris', 105, 40, { align: 'center' });
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 105, 50, { align: 'center' });
  doc.text(`Total Barang: ${barangList.length}`, 105, 60, { align: 'center' });
  
  // Line separator
  doc.line(20, 70, 190, 70);
  
  // Statistics Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN', 20, 85);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total: ${statistics.totalBarang} | Baik: ${statistics.barangBaik} | Rusak Ringan: ${statistics.barangRusakRingan} | Rusak Berat: ${statistics.barangRusakBerat}`, 20, 95);
  
  // Table headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  const startY = 110;
  let currentY = startY;
  
  // Table header
  doc.text('Kode', 20, currentY);
  doc.text('Nama Barang', 45, currentY);
  doc.text('Kategori', 85, currentY);
  doc.text('Merek', 115, currentY);
  doc.text('Lokasi', 140, currentY);
  doc.text('Kondisi', 170, currentY);
  
  // Header line
  doc.line(15, currentY + 2, 195, currentY + 2);
  
  currentY += 8;
  
  // Table content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  barangList.slice(0, 30).forEach((barang) => {
    // Check if we need a new page
    if (currentY > 270) {
      doc.addPage();
      currentY = 30;
      
      // Repeat header on new page
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Kode', 20, currentY);
      doc.text('Nama Barang', 45, currentY);
      doc.text('Kategori', 85, currentY);
      doc.text('Merek', 115, currentY);
      doc.text('Lokasi', 140, currentY);
      doc.text('Kondisi', 170, currentY);
      doc.line(15, currentY + 2, 195, currentY + 2);
      currentY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }
    
    // Truncate long text to fit columns
    const kode = barang.kodeBarang.substring(0, 10);
    const nama = barang.nama.substring(0, 20);
    const kategori = barang.kategori.nama.substring(0, 15);
    const merek = barang.merek.nama.substring(0, 12);
    const lokasi = barang.lokasi.nama.substring(0, 15);
    
    const kondisiText = barang.kondisi === 'BAIK' ? 'Baik' : 
                       barang.kondisi === 'RUSAK_RINGAN' ? 'R.Ringan' : 'R.Berat';
    
    doc.text(kode, 20, currentY);
    doc.text(nama, 45, currentY);
    doc.text(kategori, 85, currentY);
    doc.text(merek, 115, currentY);
    doc.text(lokasi, 140, currentY);
    doc.text(kondisiText, 170, currentY);
    
    currentY += 6;
  });
  
  // If there are more than 30 items, add note
  if (barangList.length > 30) {
    currentY += 10;
    doc.setFont('helvetica', 'italic');
    doc.text(`Menampilkan 30 dari ${barangList.length} total barang. Export Excel untuk data lengkap.`, 20, currentY);
  }
  
  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Halaman ${i} dari ${pageCount}`, 105, 285, { align: 'center' });
    doc.text('Digenerate otomatis oleh SEMANTIS BMN', 105, 295, { align: 'center' });
  }
  
  // Save the PDF
  doc.save(`Daftar-Inventaris-Barang-${new Date().toISOString().split('T')[0]}.pdf`);
};