import React, { useState } from 'react';
import { MessageCircle, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import AuthImagePattern from '../components/AuthImagePattern';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullname.trim()) return toast.error('Full name is required');
    if (!formData.email.trim()) return toast.error('Email is required');
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error('Invalid email format');
    if (!formData.password) return toast.error('Password is required');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters long');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid === true) {
      await signup(formData);
    }
  };

  return (
    <div className='min-h-screen grid lg:grid-cols-2 bg-base-100'>
      {/* Left - Signup Form */}
      <div className='flex flex-col justify-center items-center p-6 sm:p-12'>
        <div className='w-full max-w-md space-y-8'>
          {/* Logo */}
          <div className='text-center mb-8'>
            <div className='flex flex-col items-center gap-2 group'>
              <div className='size-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors'>
                <MessageCircle className='size-6 text-blue-600' />
              </div>
              <h1 className='text-2xl font-bold mt-2'>Create Account</h1>
              <p className='text-gray-500'>Get started with chatX</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Full Name */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Full Name</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <User className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  className='input input-bordered w-full pl-10'
                  placeholder='Enter your name'
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Email</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <Mail className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type='email'
                  className='input input-bordered w-full pl-10'
                  placeholder='you@example.com'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Password</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <Lock className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className='input input-bordered w-full pl-10 pr-10'
                  placeholder='••••••••'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <div
                  className='absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='w-5 h-5 text-gray-400' />
                  ) : (
                    <Eye className='w-5 h-5 text-gray-400' />
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              className='btn btn-primary w-full'
              disabled={isSigningUp}
            >
              {isSigningUp ? 'Signing up...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              Already have an account?{' '}
              <Link
                to='/login'
                style={{ color: 'oklch(0.59 0.15 266.03)' }}
                className='hover:underline font-medium'
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right - Community Image & Info */}
      <AuthImagePattern
        title='Join our community'
        description='Join us to start your journey with chatX. Connect, share, and grow with our vibrant community.'
      />
    </div>
  );
};

export default SignUpPage;
