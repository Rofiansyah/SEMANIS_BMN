// 'use client';

// import { useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Input';
// import { Mail, Lock, User, Settings } from 'lucide-react';

// export default function LoginPage() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [loginType, setLoginType] = useState<'admin' | 'user'>('user');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const { login } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       console.log('Attempting login with:', { email: formData.email });
//       const loginResult = await login(formData.email, formData.password);
//       console.log('Login successful, result:', loginResult);
      
//       // Small delay to ensure state is updated
//       await new Promise(resolve => setTimeout(resolve, 200));
      
//       // Redirect based on user role using window.location for more reliable redirect
//       if (loginResult.role === 'ADMIN') {
//         console.log('Redirecting to admin dashboard');
//         window.location.href = '/admin/dashboard';
//       } else {
//         console.log('Redirecting to user dashboard');
//         window.location.href = '/dashboard';
//       }
//     } catch (error: unknown) {
//       console.error('Login error:', error);
      
//       let errorMessage = 'Login failed';
//       if (error && typeof error === 'object') {
//         if ('response' in error) {
//           const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
//           errorMessage = axiosError.response?.data?.message || axiosError.message || 'Login failed';
//         } else if ('message' in error) {
//           errorMessage = (error as Error).message;
//         }
//       }
      
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const _setDemoCredentials = () => {
//     if (loginType === 'admin') {
//       setFormData({
//         email: 'admin@inventaris.com',
//         password: 'admin123',
//       });
//     } else {
//       setFormData({
//         email: 'user@example.com',
//         password: 'password123',
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="max-w-md w-full space-y-8">
//         <div className="bg-white rounded-lg shadow-xl p-8">
//           <div className="text-center">
//             <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
//               Sistem Inventaris
//             </h2>
//             <p className="text-gray-600 mb-8">
//               Masuk ke akun Anda
//             </p>
//           </div>

//           {/* Login Type Selection */}
//           <div className="mb-6">
//             <div className="flex rounded-lg bg-gray-100 p-1">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setLoginType('user');
//                   setFormData({ email: '', password: '' });
//                 }}
//                 className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
//                   loginType === 'user'
//                     ? 'bg-white text-blue-600 shadow-sm'
//                     : 'text-gray-600 hover:text-gray-800'
//                 }`}
//               >
//                 <User size={16} />
//                 User
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setLoginType('admin');
//                   setFormData({ email: '', password: '' });
//                 }}
//                 className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
//                   loginType === 'admin'
//                     ? 'bg-white text-blue-600 shadow-sm'
//                     : 'text-gray-600 hover:text-gray-800'
//                 }`}
//               >
//                 <Settings size={16} />
//                 Admin
//               </button>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <Input
//               id="email"
//               name="email"
//               type="email"
//               label="Email"
//               value={formData.email}
//               onChange={handleInputChange}
//               icon={<Mail />}
//               required
//               placeholder="Masukkan email Anda"
//             />

//             <Input
//               id="password"
//               name="password"
//               type="password"
//               label="Password"
//               value={formData.password}
//               onChange={handleInputChange}
//               icon={<Lock />}
//               required
//               placeholder="Masukkan password Anda"
//             />

//             {error && (
//               <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
//                 {error}
//               </div>
//             )}

//             <Button
//               type="submit"
//               className="w-full"
//               loading={loading}
//               disabled={!formData.email || !formData.password}
//             >
//               {loading ? 'Masuk...' : 'Masuk'}
//             </Button>

//           </form>

//           <div className="mt-6 text-center text-sm text-gray-600">
//             <p>
//               Belum punya akun?{' '}
//               <a href="/register" className="text-blue-600 hover:text-blue-800 underline">
//                 Daftar di sini
//               </a>
//             </p>
//           </div>
//         </div>

//         <div className="text-center text-sm text-gray-500">
//           <p>© 2025 SEMANIS BMN. All rights reserved.</p>
//         </div>
//       </div>
//     </div>
//   );
// }