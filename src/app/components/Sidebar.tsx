import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Users, 
  Mic2, 
  Disc3, 
  Music2, 
  ListMusic, 
  BarChart3, 
  Settings,
  Radio,
  LogOut
} from 'lucide-react';
import { api } from '../api/client';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/artists', label: 'Artists', icon: Mic2 },
  { path: '/albums', label: 'Albums', icon: Disc3 },
  { path: '/tracks', label: 'Tracks', icon: Music2 },
  { path: '/tracks?category=Podcast', label: 'Podcasts', icon: Radio },
  { path: '/playlists', label: 'Playlists', icon: ListMusic },
  { path: '/analytics', label: 'Analytics & Streams', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-[#0A0A0A] border-r border-[#2A2A2A] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#2A2A2A]">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#00D1C1] rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Radio className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#F1F1F1]">Nowplay Admin</h1>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group
                    ${isActive 
                      ? 'bg-[#00D1C1] text-black shadow-lg shadow-teal-500/20' 
                      : 'text-[#A3A3A3] hover:bg-[#1A1A1A] hover:text-[#F1F1F1]'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#2A2A2A]">
        <button 
          onClick={() => api.logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#EF4444] hover:bg-red-500/10 transition-all font-medium mb-4"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
        <div className="text-xs text-[#A3A3A3] text-center">
          <p>NowPlay Admin v1.0</p>
          <p className="mt-1">© 2026 All rights reserved</p>
        </div>
      </div>
    </aside>
  );
}
