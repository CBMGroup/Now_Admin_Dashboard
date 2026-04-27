import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, User, Music2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-[#1A1A1A] p-8 rounded-2xl border border-[#2A2A2A] shadow-2xl relative overflow-hidden">
        {/* Background Gradient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>

        <div className="text-center relative z-10">
          <div className="mx-auto h-16 w-16 bg-[#00D1C1] rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 mb-6">
            <Music2 className="h-10 w-10 text-black -rotate-12" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Nowplay Admin</h2>
          <p className="mt-2 text-sm text-[#A3A3A3]">Management Secure Login</p>
        </div>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 animate-shake">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#525252] group-focus-within:text-purple-500 transition-colors">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-[#00D1C1]/50 focus:border-[#00D1C1] transition-all"
                placeholder="Username"
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#525252] group-focus-within:text-purple-500 transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-[#00D1C1]/50 focus:border-[#00D1C1] transition-all"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-black bg-[#00D1C1] hover:bg-[#00B8A9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00D1C1] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Sign in to Dashboard'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#525252]">
          &copy; 2024 NowPlay Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
