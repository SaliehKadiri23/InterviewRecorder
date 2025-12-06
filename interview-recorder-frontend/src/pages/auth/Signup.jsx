import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { User, Lock, UserCheck, Mail, AlertCircle } from 'lucide-react';

// Define validation schema
const signupSchema = z.object({
  matricNumber: z.string()
    .min(1, 'Matric number is required')
    .regex(/^[A-Z0-9]+\/[A-Z0-9\/]+\/[A-Z0-9]+$/, 'Invalid matric number format (e.g., CSC/2020/001)'),
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must not exceed 100 characters'),
  groupCode: z.string()
    .min(1, 'Group code is required')
    .max(20, 'Group code cannot exceed 20 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Group code can only contain letters, numbers, underscores, and hyphens'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase, one uppercase, and one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
});

// Custom validation to check if passwords match
const signupWithPasswordMatch = signupSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    resolver: zodResolver(signupWithPasswordMatch),
    defaultValues: {
      matricNumber: '',
      fullName: '',
      groupCode: '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const response = await authService.signup({
        matricNumber: data.matricNumber,
        fullName: data.fullName,
        groupCode: data.groupCode,
        password: data.password
      });
      
      if (response.success) {
        authService.setToken(response.token);
        navigate('/dashboard');
      } else {
        setError(response.error || 'Signup failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during signup');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">Interview Recorder</h1>
          <p className="text-blue-100">CSC4301 Requirements Gathering Tool</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Your Account</h2>
          
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="matricNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Matric Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="matricNumber"
                  type="text"
                  placeholder="e.g., CSC/2020/001"
                  className={`w-full pl-10 pr-3 py-3 border ${
                    errors.matricNumber ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  {...register('matricNumber')}
                />
              </div>
              {errors.matricNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.matricNumber.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-3 py-3 border ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="groupCode" className="block text-sm font-medium text-gray-700 mb-2">
                Group Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="groupCode"
                  type="text"
                  placeholder="e.g., GROUP1"
                  className={`w-full pl-10 pr-3 py-3 border ${
                    errors.groupCode ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  {...register('groupCode')}
                />
              </div>
              {errors.groupCode && (
                <p className="mt-1 text-sm text-red-600">{errors.groupCode.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-3 py-3 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-3 py-3 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              <p>Password must contain at least one lowercase letter, one uppercase letter, and one number.</p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export { Signup };