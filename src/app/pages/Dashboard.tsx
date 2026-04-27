import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Users, Music2, BarChart3, Mic2, TrendingUp, TrendingDown, Play, Heart, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/stats/');
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to connect to backend.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-[#A3A3A3] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        <p className="text-lg font-medium animate-pulse">Fetching latest stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-red-500 space-y-4">
        <AlertCircle className="w-12 h-12" />
        <p className="text-xl font-bold">Connection Error</p>
        <p className="text-[#A3A3A3]">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg hover:border-red-500/50 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#F1F1F1]">Dashboard</h1>
        <p className="text-[#A3A3A3] mt-1">Welcome back! Here's what's happening with NowPlay today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Users"
          value={stats.total_users.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon={Users}
          color="purple"
        />
        <KPICard
          title="Total Tracks"
          value={stats.total_tracks.toLocaleString()}
          change="+8.2%"
          trend="up"
          icon={Music2}
          color="green"
        />
        <KPICard
          title="Streams (Total)"
          value={stats.total_streams.toLocaleString()}
          change="+23.1%"
          trend="up"
          icon={BarChart3}
          color="blue"
        />
        <KPICard
          title="Active Artists"
          value={stats.active_artists.toLocaleString()}
          change="-2.4%"
          trend="down"
          icon={Mic2}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <h2 className="text-xl font-bold text-[#F1F1F1] mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recent_activity.map((activity: any) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#0A0A0A] transition-colors group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D1C1] to-[#00B8A9] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-black">{activity.user.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F1F1F1] text-sm">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-[#A3A3A3] mx-1">{activity.action}</span>
                    <span className="font-medium">{activity.track}</span>
                  </p>
                  <p className="text-[#A3A3A3] text-xs mt-0.5">{activity.artist}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#A3A3A3]">{new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button className="p-1.5 rounded-lg bg-[#22C55E] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-3 h-3 text-white fill-white" />
                  </button>
                </div>
              </div>
            ))}
            {stats.recent_activity.length === 0 && (
              <p className="text-center py-8 text-[#A3A3A3]">No recent platform activity found.</p>
            )}
          </div>
        </div>

        {/* Top Tracks */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <h2 className="text-xl font-bold text-[#F1F1F1] mb-6">Top 5 Tracks</h2>
          <div className="space-y-4">
            {stats.top_tracks.map((track: any, index: number) => (
              <div key={track.id} className="flex items-center gap-3 group">
                <span className="text-sm font-bold text-[#A3A3A3] w-4">{index + 1}</span>
                <img
                  src={track.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100'}
                  alt={track.title}
                  className="w-12 h-12 rounded-lg object-cover bg-[#0A0A0A]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F1F1F1] truncate">{track.title}</p>
                  <p className="text-xs text-[#A3A3A3] truncate">{track.artist_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-[#F1F1F1]">{track.plays.toLocaleString()} plays</p>
                  <div className="w-16 h-1 bg-[#2A2A2A] rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#22C55E]"
                      style={{ width: `${(track.plays / stats.top_tracks[0].plays) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            {stats.top_tracks.length === 0 && (
              <p className="text-center py-8 text-[#A3A3A3]">No tracks available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Streams Chart Placeholder - Handled in Analytics page and Dashboard Overview */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
        <h2 className="text-xl font-bold text-[#F1F1F1] mb-2 text-center py-10 opacity-50">Analytical Charts Moved to "Analytics & Streams" Section</h2>
      </div>
    </div>
  );
}

function KPICard({ title, value, change, trend, icon: Icon, color }: any) {
  const colorClasses = {
    purple: 'from-[#8B5CF6] to-[#6D28D9]',
    green: 'from-[#22C55E] to-[#16A34A]',
    blue: 'from-[#3B82F6] to-[#2563EB]',
    orange: 'from-[#F59E0B] to-[#D97706]',
  };

  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6 hover:border-[#00D1C1]/50 transition-all hover:shadow-lg hover:shadow-teal-500/10">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {change}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-[#F1F1F1] mb-1">{value}</h3>
      <p className="text-sm text-[#A3A3A3]">{title}</p>
    </div>
  );
}
