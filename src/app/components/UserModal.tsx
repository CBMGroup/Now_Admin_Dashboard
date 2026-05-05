import { X, Upload, Loader2, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client';

export type UserType = {
  id: string;
  name: string;
  email: string;
  role: 'Free' | 'Premium' | 'Student' | 'Admin';
  status: boolean;
  avatar?: string;
};

interface UserModalProps {
  user: UserType | null;
  onClose: () => void;
  onSave: (userData: any) => Promise<void>;
}

export function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.name || '',
    email: user?.email || '',
    role: user?.role?.toLowerCase() || 'free',
    is_active: user?.status ?? true,
    password: '', // Only for new users
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="text-2xl font-bold text-[#F1F1F1]">
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-[#A3A3A3]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <p className="text-xs text-[#A3A3A3]">Avatar is auto-generated or managed by user</p>
          </div>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">
                Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] placeholder:text-[#404040] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all"
                placeholder="johndoe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] placeholder:text-[#404040] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all"
                placeholder="john@example.com"
              />
            </div>

            {/* Password (only for new users) */}
            {!user && (
              <div>
                <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] placeholder:text-[#404040] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">
                Subscription Role
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] appearance-none"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl">
              <div className="flex-1">
                <p className="text-sm font-bold text-[#F1F1F1]">Account Status</p>
                <p className="text-[10px] text-[#A3A3A3]">Active users can log in and use the platform</p>
              </div>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-[#2A2A2A] bg-[#1A1A1A] text-[#22C55E] focus:ring-[#22C55E]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t border-[#2A2A2A]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-3 bg-[#2A2A2A] hover:bg-[#333333] text-[#F1F1F1] rounded-xl font-bold transition-all flex-1 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] text-white rounded-xl font-bold transition-all shadow-xl shadow-purple-500/20 flex-1 flex justify-center items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                user ? 'Update User' : 'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
