import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import { InputField } from '../../components/common/FormFields';
import { Briefcase, Eye, EyeOff, User, Users, Loader2, CheckCircle2 } from 'lucide-react';
import { getErrorMessage } from '../../utils/helpers';
import { Role } from '../../types';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CANDIDATE', 'RECRUITER'], { required_error: 'Select your role' }),
  companyName: z.string().optional(),
  designation: z.string().optional(),
}).refine(
  (data) => data.role !== 'RECRUITER' || (data.companyName && data.companyName.length > 0),
  { message: 'Company name is required for recruiters', path: ['companyName'] }
);

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error: notify } = useNotification();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const role = watch('role');

  const handleRoleSelect = (r: Role) => {
    setSelectedRole(r);
    setValue('role', r, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const res = await authService.register(data);
      login(res.token, res.user);
      success(`Account created! Welcome, ${res.user.fullName}!`);
      if (res.user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    } catch (err) {
      notify(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-slate-50">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            NexJob
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-5 mb-1">Create your account</h1>
          <p className="text-sm text-slate-500">Join thousands of candidates & companies on NexJob</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Role Selection */}
            <div>
              <label className="wellfound-label">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {(['CANDIDATE', 'RECRUITER'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      selectedRole === r
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {selectedRole === r && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute top-3 right-3" />
                    )}
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-2">
                      {r === 'CANDIDATE' ? <User className="w-4 h-4 text-slate-600" /> : <Users className="w-4 h-4 text-slate-600" />}
                    </div>
                    <p className="text-sm font-bold text-slate-900 capitalize">{r.toLowerCase()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {r === 'CANDIDATE' ? 'Looking for jobs' : 'Hiring talent'}
                    </p>
                  </button>
                ))}
              </div>
              {errors.role && <p className="mt-1.5 text-xs text-rose-600">{errors.role.message}</p>}
              <input type="hidden" {...register('role')} />
            </div>

            <InputField
              label="Full Name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

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
                placeholder="Min 6 characters"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mt-2 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? 'Hide' : 'Show'} password
              </button>
            </div>

            {/* Recruiter-specific fields */}
            {role === 'RECRUITER' && (
              <>
                <InputField
                  label="Company Name"
                  type="text"
                  placeholder="e.g. Stripe, Vercel, Notion..."
                  error={errors.companyName?.message}
                  {...register('companyName')}
                />
                <InputField
                  label="Your Designation (optional)"
                  type="text"
                  placeholder="e.g. Talent Acquisition Manager"
                  error={errors.designation?.message}
                  {...register('designation')}
                />
              </>
            )}

            <button type="submit" disabled={isLoading} className="wellfound-btn-primary w-full py-3 mt-2">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-900 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
