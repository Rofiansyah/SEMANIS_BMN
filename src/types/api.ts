export interface User {
  id: string;
  email: string;
  nama: string;
  nomorhp: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  nama: string;
  nomorhp: string;
  password: string;
  role?: 'ADMIN' | 'USER';
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    role: 'ADMIN' | 'USER';
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface Kategori {
  id: string;
  nama: string;
  createdAt: string;
  updatedAt: string;
}

export interface Merek {
  id: string;
  nama: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lokasi {
  id: string;
  nama: string;
  createdAt: string;
  updatedAt: string;
}

export interface Barang {
  id: string;
  kodeBarang: string;
  nama: string;
  deskripsi: string;
  kondisi: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
  foto?: string;
  fotoUrl?: string | null;
  qrCodeUrl?: string | null;
  status?: string;
  kategoriId: string;
  merekId: string;
  lokasiId: string;
  kategori: Kategori;
  merek: Merek;
  lokasi: Lokasi;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBarangRequest {
  nama: string;
  deskripsi: string;
  kategoriId: string;
  merekId: string;
  lokasiId: string;
  kondisi: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
  foto?: File;
}

export interface UpdateBarangRequest {
  nama?: string;
  deskripsi?: string;
  kategoriId?: string;
  merekId?: string;
  lokasiId?: string;
  kondisi?: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
  foto?: File;
}

export interface CreateKategoriRequest {
  nama: string;
}

export interface UpdateKategoriRequest {
  nama: string;
}

export interface CreateMerekRequest {
  nama: string;
}

export interface UpdateMerekRequest {
  nama: string;
}

export interface CreateLokasiRequest {
  nama: string;
}

export interface UpdateLokasiRequest {
  nama: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Borrowing/Peminjaman interfaces
export interface Peminjaman {
  id: string;
  userId: string;
  barangId: string;
  status: 'PENDING' | 'DIPINJAM' | 'REJECTED' | 'RETURNED' | 'DIKEMBALIKAN';
  tanggalPengajuan: string;
  tanggalDisetujui: string | null;
  tanggalDipinjam: string | null;
  tanggalDikembalikan: string | null;
  penanggungJawab: string | null;
  fotoPinjam: string | null;
  fotoKembali: string | null;
  catatan: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    nama: string;
    email: string;
    nomorhp: string;
  };
  barang: {
    id: string;
    kodeBarang: string;
    nama: string;
    deskripsi: string;
    kondisi: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
    status: string;
    fotoUrl: string | null;
    qrCodeUrl: string | null;
    kategoriId: string;
    merekId: string;
    lokasiId: string;
    createdAt: string;
    updatedAt: string;
    kategori: Kategori;
    merek: Merek;
    lokasi: Lokasi;
  };
  approvedByUser: {
    id: string;
    nama: string;
    email: string;
  } | null;
}

export interface CreatePeminjamanRequest {
  barangId: string;
  catatan: string;
}

export interface ApprovePeminjamanRequest {
  penanggungJawab: string;
  fotoPinjam?: File;
}

export interface RejectPeminjamanRequest {
  catatan: string;
}

export interface ReturnPeminjamanRequest {
  penanggungJawab: string;
  catatan: string;
  fotoKembali?: File;
}

export interface PeminjamanReport {
  pending: Peminjaman[];
  dipinjam: Peminjaman[];
  dikembalikan: Peminjaman[];
  summary: {
    totalPending: number;
    totalDipinjam: number;
    totalDikembalikan: number;
  };
}

// API Response wrapper for peminjaman
export interface PeminjamanResponse {
  status: 'success' | 'error';
  data: Peminjaman[];
}

// API Response wrapper for single peminjaman
export interface PeminjamanDetailResponse {
  status: 'success' | 'error';
  data: Peminjaman;
}

// Statistics interface
export interface Statistics {
  totalBarang: number;
  totalUserRoleUsers: number;
  barangRusak: number;
  barangBaik: number;
}

export interface StatisticsResponse {
  success: boolean;
  message: string;
  data: Statistics;
}