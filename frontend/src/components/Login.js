import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-30">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                TL
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                TalentLink
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-gray-200 hover:text-white hover:underline transition-colors">Home</Link>
            <Link to="/login" className="text-sm font-medium text-white transition-colors">Log In</Link>
            <Link to="/register" className="text-sm font-medium bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition shadow-sm hover:shadow-md">
              Sign Up
            </Link>
          </div>
        </nav>
      </div>

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
            alt="Office Background" 
            className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 overflow-hidden">
            {/* Header */}
            <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
                Welcome Back
            </h2>
            <p className="text-blue-100 opacity-80 text-sm">
                Please login to your account
            </p>
            </div>
            
            {error && (
            <div className="bg-red-500/20 border border-red-500/50 p-4 text-red-100 rounded-lg mb-6 backdrop-blur-sm">
                <p className="font-medium text-sm text-center">{error}</p>
            </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
                <div>
                <label htmlFor="username" className="block text-sm font-medium text-blue-50 mb-1 ml-1">Username or Email</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                    </div>
                    <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-white/20 border border-white/10 rounded-lg placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm backdrop-blur-sm"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    />
                </div>
                </div>

                <div>
                <label htmlFor="password" className="block text-sm font-medium text-blue-50 mb-1 ml-1">Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                    </div>
                    <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-white/20 border border-white/10 rounded-lg placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm backdrop-blur-sm"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    />
                </div>
                </div>
            </div>

            <div className="flex items-center justify-end">
                <button type="button" className="text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors">
                    Forgot Password?
                </button>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transform transition-all active:scale-[0.98]"
            >
                {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : 'Login'}
            </button>
            </form>

            <div className="text-center mt-8">
            <p className="text-sm text-blue-100 opacity-80">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-white hover:text-blue-200 transition-colors underline">
                Register here
                </Link>
            </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
