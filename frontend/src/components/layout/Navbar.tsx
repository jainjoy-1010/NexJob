import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Bookmark, User, LogOut, PlusCircle, LayoutDashboard, FileText, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <span>NexJob</span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link to="/" className="hover:text-slate-900 transition-colors">
                Explore Jobs
              </Link>
              {isAuthenticated && user?.role === 'CANDIDATE' && (
                <>
                  <Link to="/candidate/saved" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4" />
                    Saved
                  </Link>
                  <Link to="/candidate/applications" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Applied
                  </Link>
                </>
              )}
              {isAuthenticated && user?.role === 'RECRUITER' && (
                <Link to="/recruiter/dashboard" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.role === 'RECRUITER' && (
                  <Link to="/recruiter/jobs/new" className="wellfound-btn-primary py-2 text-xs">
                    <PlusCircle className="w-4 h-4" />
                    Post Job
                  </Link>
                )}
                {user?.role === 'CANDIDATE' && (
                  <Link to="/candidate/profile" className="wellfound-btn-secondary py-2 text-xs">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                )}
                <div className="h-4 w-px bg-slate-200 mx-1"></div>
                <div className="text-xs text-right">
                  <p className="font-semibold text-slate-900 leading-none">{user?.fullName}</p>
                  <p className="text-slate-400 capitalize">{user?.role.toLowerCase()}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2">
                  Log in
                </Link>
                <Link to="/register" className="wellfound-btn-primary text-xs py-2">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">
            Explore Jobs
          </Link>
          {isAuthenticated ? (
            <>
              {user?.role === 'CANDIDATE' && (
                <>
                  <Link to="/candidate/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">
                    Profile & Resumes
                  </Link>
                  <Link to="/candidate/saved" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">
                    Saved Jobs
                  </Link>
                  <Link to="/candidate/applications" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">
                    Applied Jobs
                  </Link>
                </>
              )}
              {user?.role === 'RECRUITER' && (
                <>
                  <Link to="/recruiter/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">
                    Recruiter Dashboard
                  </Link>
                  <Link to="/recruiter/jobs/new" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">
                    + Post New Job
                  </Link>
                </>
              )}
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left py-2 text-rose-600 font-medium">
                Log out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="wellfound-btn-secondary justify-center">
                Log in
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="wellfound-btn-primary justify-center">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
