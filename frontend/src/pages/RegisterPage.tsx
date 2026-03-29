import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
 const navigate = useNavigate();
 const login = useAuthStore((state) => state.login);
 
 const [name, setName] = useState('');
 const [email, setEmail] = useState('');
 const [phone, setPhone] = useState('');
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);

 const handleRegister = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 try {
 const response = await api.post('/auth/register', { 
 name, 
 email, 
 phone, 
 password 
 });
 
 const userData = response.data?.data;
 if (userData?.token && userData?.user) {
 login(userData.user, userData.token);
 toast.success('Account created successfully!');
 if (userData.user.role === 'authority' || userData.user.role === 'admin') {
   navigate('/authority/home');
 } else {
   navigate('/home');
 }
 } else {
 toast.success('Account created! Please log in.');
 navigate('/login');
 }
 } catch (error: any) {
 toast.error(error.response?.data?.message || 'Failed to register account');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
 <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
 <div>
 <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 font-['Manrope']">
 Join Jan Seva
 </h2>
 <p className="mt-2 text-center text-sm text-slate-600">
 Already have an account?{' '}
 <Link to="/login"className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
 Sign in here
 </Link>
 </p>
 </div>
 <form className="mt-8 space-y-6"onSubmit={handleRegister}>
 <div className="rounded-md shadow-sm space-y-4">
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1"htmlFor="name">Full Name</label>
 <input
 id="name"
 name="name"
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
 placeholder="Ravi Kumar"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1"htmlFor="email-address">Email address</label>
 <input
 id="email-address"
 name="email"
 type="email"
 autoComplete="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
 placeholder="citizen@example.com"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1"htmlFor="phone">Phone Number</label>
 <input
 id="phone"
 name="phone"
 type="tel"
 required
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
 placeholder="+91 9876543210"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1"htmlFor="password">Password</label>
 <input
 id="password"
 name="password"
 type="password"
 autoComplete="new-password"
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
 placeholder="••••••••"
 />
 </div>
 </div>

 <div>
 <button
 type="submit"
 disabled={loading}
 className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 :bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
>
 {loading ? 'Creating account...' : 'Create Account'}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};
