# Sistem Inventaris - Frontend

Frontend aplikasi sistem inventaris barang menggunakan Next.js 15 dengan TypeScript.

## Fitur

- **Authentication**: Login untuk Admin dan User dengan role-based access
- **Dashboard**: Overview sistem inventaris
- **Manajemen Barang**: CRUD operasi untuk barang dengan foto
- **Manajemen Kategori**: CRUD operasi untuk kategori barang
- **Manajemen Merek**: CRUD operasi untuk merek barang
- **Manajemen Lokasi**: CRUD operasi untuk lokasi penyimpanan
- **Responsive Design**: UI yang responsive dengan Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form dengan Zod validation
- **Icons**: Lucide React
- **State Management**: React Context untuk authentication

## Struktur Folder

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── register/         # Register page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects)
├── components/           # Reusable components
│   └── ui/              # UI components (Button, Input)
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── lib/                 # Utilities and API client
│   ├── api.ts           # API client dan endpoints
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions
    └── api.ts           # API response types
```

## Instalasi

1. Clone repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
4. Update `.env.local` dengan API URL yang sesuai
5. Jalankan development server:
   ```bash
   npm run dev
   ```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://inventaris-be.vercel.app
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build untuk production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

Aplikasi terintegrasi dengan REST API yang memiliki endpoint:

### Authentication
- `POST /auth/login` - Login user/admin
- `POST /auth/register` - Register user baru
- `POST /auth/admin/register` - Admin register user (admin only)
- `GET /auth/profile` - Get user profile

### Kategori
- `GET /kategori` - Get semua kategori
- `POST /kategori` - Create kategori baru
- `PUT /kategori/:id` - Update kategori
- `DELETE /kategori/:id` - Delete kategori

### Merek
- `GET /merek` - Get semua merek
- `POST /merek` - Create merek baru
- `PUT /merek/:id` - Update merek
- `DELETE /merek/:id` - Delete merek

### Lokasi
- `GET /lokasi` - Get semua lokasi
- `POST /lokasi` - Create lokasi baru
- `PUT /lokasi/:id` - Update lokasi
- `DELETE /lokasi/:id` - Delete lokasi

### Barang
- `GET /barang` - Get semua barang
- `GET /barang/:id` - Get barang by ID
- `GET /barang/kode/:kode` - Get barang by kode
- `POST /barang` - Create barang baru (with/without photo)
- `PUT /barang/:id` - Update barang (with/without photo)
- `DELETE /barang/:id` - Delete barang

## Demo Credentials

### Admin
- Email: `admin@inventaris.com`
- Password: `admin123`

### User
- Email: `user@example.com`
- Password: `password123`

## Features Roadmap

- [ ] Halaman manajemen barang
- [ ] Halaman manajemen kategori
- [ ] Halaman manajemen merek
- [ ] Halaman manajemen lokasi
- [ ] Halaman manajemen user (admin only)
- [ ] Search dan filter functionality
- [ ] Export data ke Excel/PDF
- [ ] Audit log dan activity tracking
- [ ] Notifications system

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push ke branch
5. Create Pull Request
