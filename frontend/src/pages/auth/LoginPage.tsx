import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import { InputField } from '../../components/common/FormFields';
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';
import { getErrorMessage } from '../../utils/helpers';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error: notify } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const res = await authService.login(data);
      login(res.token, res.user);
      success(`Welcome back, ${res.user.fullName}!`);
      // Route by role
      if (res.user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate(from === '/login' || from === '/register' ? '/candidate/dashboard' : from, { replace: true });
      }
    } catch (err) {
      notify(getErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <Briefcase className="w-4.5 h-4.5 text-white" />
            </div>
            NexJob
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-5 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to continue to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <InputField
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <InputField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mt-2 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? 'Hide' : 'Show'} password
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={isLoading} className="wellfound-btn-primary w-full py-3">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-slate-900 hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
