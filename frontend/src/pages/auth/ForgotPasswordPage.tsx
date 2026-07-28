import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, ArrowLeft } from 'lucide-react';
import { InputField } from '../../components/common/FormFields';

export const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            NexJob
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-5 mb-1">Reset your password</h1>
          <p className="text-sm text-slate-500">We'll send you a link to reset your password</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Check your inbox</h3>
              <p className="text-sm text-slate-500 mb-5">If that email exists, we've sent password reset instructions.</p>
              <Link to="/login" className="wellfound-btn-primary py-2 text-xs">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
              <InputField label="Email Address" type="email" placeholder="you@example.com" required />
              <button type="submit" className="wellfound-btn-primary w-full py-3">Send Reset Link</button>
            </form>
          )}
          {!submitted && (
            <Link to="/login" className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mt-5 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
