import { Search, Bell, User } from 'lucide-react';

export function Navbar() {
  return (
    <header className="h-16 bg-[#0A0A0A] border-b border-[#2A2A2A] flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <input
            type="text"
            placeholder="Search users, artists, tracks..."
            className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[#F1F1F1] placeholder:text-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4 ml-6">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-[#A3A3A3]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22C55E] rounded-full border-2 border-[#0A0A0A]"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#2A2A2A]">
          <div className="text-right">
            <p className="text-sm font-medium text-[#F1F1F1]">Admin User</p>
            <p className="text-xs text-[#A3A3A3]">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-purple-500/20">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
