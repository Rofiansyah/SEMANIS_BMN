import axios from 'axios';
import Cookies from 'js-cookie';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ProfileResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ApiResponse,
  Kategori,
  Merek,
  Lokasi,
  Barang,
  CreateBarangRequest,
  UpdateBarangRequest,
  CreateKategoriRequest,
  CreateMerekRequest,
  CreateLokasiRequest,
  CreatePeminjamanRequest,
  ApprovePeminjamanRequest,
  RejectPeminjamanRequest,
  ReturnPeminjamanRequest,
  PeminjamanReport,
  PeminjamanResponse,
  PeminjamanDetailResponse,
  StatisticsResponse,
} from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://inventaris-be-fawn.vercel.app';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       Cookies.remove('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    console.log('API: Attempting login to:', `${BASE_URL}/auth/login`);
    console.log('API: Login data:', data);
    
    try {
      const response = await api.post('/auth/login', data);
      console.log('API: Login response status:', response.status);
      console.log('API: Login response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Login request failed:', error);
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  adminRegister: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post('/auth/admin/register', data);
    return response.data;
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },
};

export const kategoriApi = {
  getAll: async (): Promise<ApiResponse<Kategori[]>> => {
    const response = await api.get('/kategori');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Kategori>> => {
    const response = await api.get(`/kategori/${id}`);
    return response.data;
  },

  create: async (data: CreateKategoriRequest): Promise<ApiResponse<Kategori>> => {
    const response = await api.post('/kategori', data);
    return response.data;
  },

  update: async (id: string, data: CreateKategoriRequest): Promise<ApiResponse<Kategori>> => {
    const response = await api.put(`/kategori/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/kategori/${id}`);
    return response.data;
  },
};

export const merekApi = {
  getAll: async (): Promise<ApiResponse<Merek[]>> => {
    const response = await api.get('/merek');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Merek>> => {
    const response = await api.get(`/merek/${id}`);
    return response.data;
  },

  create: async (data: CreateMerekRequest): Promise<ApiResponse<Merek>> => {
    const response = await api.post('/merek', data);
    return response.data;
  },

  update: async (id: string, data: CreateMerekRequest): Promise<ApiResponse<Merek>> => {
    const response = await api.put(`/merek/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/merek/${id}`);
    return response.data;
  },
};

export const lokasiApi = {
  getAll: async (): Promise<ApiResponse<Lokasi[]>> => {
    const response = await api.get('/lokasi');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Lokasi>> => {
    const response = await api.get(`/lokasi/${id}`);
    return response.data;
  },

  create: async (data: CreateLokasiRequest): Promise<ApiResponse<Lokasi>> => {
    const response = await api.post('/lokasi', data);
    return response.data;
  },

  update: async (id: string, data: CreateLokasiRequest): Promise<ApiResponse<Lokasi>> => {
    const response = await api.put(`/lokasi/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/lokasi/${id}`);
    return response.data;
  },
};

export const barangApi = {
  getAll: async (): Promise<ApiResponse<Barang[]>> => {
    const response = await api.get('/barang');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Barang>> => {
    const response = await api.get(`/barang/${id}`);
    return response.data;
  },

  getByKode: async (kode: string): Promise<ApiResponse<Barang>> => {
    const response = await api.get(`/barang/kode/${kode}`);
    return response.data;
  },

  getByQRCode: async (qrData: string): Promise<ApiResponse<Barang>> => {
    try {
      const parsedData = JSON.parse(qrData);
      if (parsedData.kodeBarang) {
        return await barangApi.getByKode(parsedData.kodeBarang);
      } else if (parsedData.id) {
        return await barangApi.getById(parsedData.id);
      } else {
        throw new Error('Invalid QR code format');
      }
    } catch {
      throw new Error('Failed to parse QR code data');
    }
  },

  create: async (data: CreateBarangRequest): Promise<ApiResponse<Barang>> => {
    const formData = new FormData();
    formData.append('nama', data.nama);
    formData.append('deskripsi', data.deskripsi);
    formData.append('kategoriId', data.kategoriId);
    formData.append('merekId', data.merekId);
    formData.append('lokasiId', data.lokasiId);
    formData.append('kondisi', data.kondisi);
    
    if (data.foto) {
      formData.append('foto', data.foto);
    }

    const response = await api.post('/barang', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: UpdateBarangRequest): Promise<ApiResponse<Barang>> => {
    if (data.foto) {
      const formData = new FormData();
      if (data.nama) formData.append('nama', data.nama);
      if (data.deskripsi) formData.append('deskripsi', data.deskripsi);
      if (data.kondisi) formData.append('kondisi', data.kondisi);
      formData.append('foto', data.foto);

      const response = await api.put(`/barang/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await api.put(`/barang/${id}`, data);
      return response.data;
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/barang/${id}`);
    return response.data;
  },
};

export const peminjamanApi = {
  // User endpoints
  createRequest: async (data: CreatePeminjamanRequest): Promise<PeminjamanResponse> => {
    const response = await api.post('/peminjaman/request', data);
    return response.data;
  },

  getMyRequests: async (): Promise<PeminjamanResponse> => {
    const response = await api.get('/peminjaman/my-requests');
    return response.data;
  },

  getMyHistory: async (): Promise<PeminjamanResponse> => {
    const response = await api.get('/peminjaman/my-history');
    return response.data;
  },

  // Common endpoints
  getById: async (id: string): Promise<PeminjamanDetailResponse> => {
    const response = await api.get(`/peminjaman/${id}`);
    return response.data;
  },

  // Admin endpoints
  getAllRequests: async (): Promise<PeminjamanResponse> => {
    const response = await api.get('/peminjaman/admin/all');
    return response.data;
  },

  getReports: async (): Promise<{status: string; data: PeminjamanReport}> => {
    const response = await api.get('/peminjaman/admin/reports');
    return response.data;
  },

  approve: async (id: string, data: ApprovePeminjamanRequest): Promise<PeminjamanResponse> => {
    if (data.fotoPinjam) {
      const formData = new FormData();
      formData.append('penanggungJawab', data.penanggungJawab);
      formData.append('fotoPinjam', data.fotoPinjam);

      const response = await api.post(`/peminjaman/admin/${id}/approve`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await api.post(`/peminjaman/admin/${id}/approve`, {
        penanggungJawab: data.penanggungJawab
      });
      return response.data;
    }
  },

  reject: async (id: string, data: RejectPeminjamanRequest): Promise<PeminjamanResponse> => {
    const response = await api.post(`/peminjaman/admin/${id}/reject`, data);
    return response.data;
  },

  processReturn: async (id: string, data: ReturnPeminjamanRequest): Promise<PeminjamanResponse> => {
    if (data.fotoKembali) {
      const formData = new FormData();
      formData.append('penanggungJawab', data.penanggungJawab);
      formData.append('catatan', data.catatan);
      formData.append('fotoKembali', data.fotoKembali);

      const response = await api.post(`/peminjaman/admin/${id}/return`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await api.post(`/peminjaman/admin/${id}/return`, {
        penanggungJawab: data.penanggungJawab,
        catatan: data.catatan,
      });
      return response.data;
    }
  },
};

export const statisticsApi = {
  get: async (): Promise<StatisticsResponse> => {
    const response = await api.get('/statistics');
    return response.data;
  },
};

export const healthApi = {
  check: async (): Promise<unknown> => {
    console.log('API: Health check to:', `${BASE_URL}/`);
    try {
      const response = await api.get('/');
      console.log('API: Health check response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Health check failed:', error);
      throw error;
    }
  },
};

export default api;