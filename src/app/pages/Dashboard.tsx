import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { api } from '../api/client';
import { 
  Users, Music2, BarChart3, Mic2, TrendingUp, TrendingDown, 
  Play, Heart, Upload, AlertCircle, Loader2, Plus, UserPlus, 
  Disc3, BookOpen, Theater, Feather, ArrowRight, Zap, Target, Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '../components/ui/skeleton';

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

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;

  // Derived insight: High performing category
  const topCategory = stats.top_tracks?.[0]?.category || 'N/A';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-8 pb-20"
    >
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-[#A3A3A3] mt-2 text-lg">System status: <span className="text-[#00D1C1] font-bold">All services operational</span></p>
        </div>
        <div className="flex items-center gap-4 p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-500 animate-pulse" />
            </div>
            <div>
                <p className="text-xs font-bold text-[#A3A3A3] uppercase tracking-widest">Real-time Pulse</p>
                <p className="text-sm font-bold text-white">{stats.total_streams.toLocaleString()} total streams</p>
            </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Platform Users" value={stats.total_users} icon={Users} color="cyan" />
        <KPICard title="Media Assets" value={stats.total_tracks} icon={Music2} color="purple" />
        <KPICard title="Stream Volume" value={stats.total_streams} icon={BarChart3} color="emerald" />
        <KPICard title="Active Talent" value={stats.active_artists} icon={Mic2} color="orange" />
      </div>

      {/* Quick Access Grid */}
      <div className="bg-[#1A1A1A] rounded-3xl border border-[#2A2A2A] p-8">
        <h2 className="text-xl font-bold text-white mb-6">Content Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <QuickLink to="/tracks" icon={Music2} label="Music" color="cyan" />
          <QuickLink to="/podcasts" icon={Mic2} label="Podcasts" color="emerald" />
          <QuickLink to="/audio-books" icon={BookOpen} label="Books" color="pink" />
          <QuickLink to="/audio-plays" icon={Theater} label="Plays" color="rose" />
          <QuickLink to="/poems" icon={Feather} label="Poems" color="purple" />
          <QuickLink to="/artists" icon={UserPlus} label="Creators" color="indigo" />
          <QuickLink to="/albums" icon={Disc3} label="Albums" color="orange" />
          <QuickLink to="/users" icon={Users} label="Users" color="blue" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity List */}
        <div className="lg:col-span-2 bg-[#1A1A1A] rounded-3xl border border-[#2A2A2A] p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Live Activity Feed</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-[#A3A3A3] uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-[#00D1C1] animate-ping" />
                Live Updates
            </div>
          </div>
          <div className="space-y-4">
            {(stats?.recent_activity || []).map((activity: any, i:number) => (
              <motion.div 
                key={activity.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#0A0A0A] border border-transparent hover:border-[#2A2A2A] transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0 group-hover:border-[#00D1C1]/30 transition-colors">
                  <span className="text-lg font-black text-[#00D1C1]">{activity.user.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F1F1F1] text-sm leading-relaxed">
                    <span className="font-black text-white">{activity.user}</span>
                    <span className="text-[#A3A3A3] mx-1.5">{activity.action}</span>
                    <span className="font-bold text-[#00D1C1]">{activity.track}</span>
                  </p>
                  <p className="text-[#525252] text-xs mt-1 font-bold uppercase tracking-wider">{activity.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#404040]">{new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </motion.div>
            ))}
            {(stats?.recent_activity || []).length === 0 && (
                <p className="text-center py-10 text-[#404040]">No recent activity found.</p>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-[#1A1A1A] rounded-3xl border border-[#2A2A2A] p-8">
          <h2 className="text-xl font-bold text-white mb-8">Asset Rankings</h2>
          <div className="space-y-6">
            {(stats?.top_tracks || []).map((track: any, index: number) => (
              <div key={track.id} className="flex items-center gap-4 group">
                <div className="w-6 text-xs font-black text-[#404040] group-hover:text-[#00D1C1] transition-colors">{index + 1}</div>
                <div className="relative shrink-0">
                    <img src={track.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100'} className="w-14 h-14 rounded-2xl object-cover bg-[#0A0A0A] shadow-xl transition-transform group-hover:scale-110" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00D1C1] rounded-full border-4 border-[#1A1A1A] flex items-center justify-center">
                        <Play className="w-2 h-2 text-black fill-black" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate group-hover:text-[#00D1C1] transition-colors">{track.title}</p>
                  <p className="text-xs font-bold text-[#A3A3A3] truncate mt-0.5">{track.artist_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-white">{track.plays.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-[#404040] uppercase tracking-tighter">Hits</p>
                </div>
              </div>
            ))}
            {(stats?.top_tracks || []).length === 0 && (
                <p className="text-center py-10 text-[#404040]">No track data available.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function KPICard({ title, value, icon: Icon, color }: any) {
  const colorThemes: any = {
    cyan: 'from-[#00D1C1] to-[#00B8A9] shadow-[#00D1C1]/20',
    purple: 'from-[#8B5CF6] to-[#7C3AED] shadow-[#8B5CF6]/20',
    emerald: 'from-[#10B981] to-[#059669] shadow-[#10B981]/20',
    orange: 'from-[#F59E0B] to-[#D97706] shadow-[#F59E0B]/20',
    blue: 'from-[#3B82F6] to-[#2563EB] shadow-[#3B82F6]/20',
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-[#1A1A1A] rounded-3xl border border-[#2A2A2A] p-8 hover:border-[#00D1C1]/30 transition-all shadow-2xl relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorThemes[color]} flex items-center justify-center shadow-lg text-black`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
      <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
      <p className="text-xs font-bold text-[#A3A3A3] uppercase tracking-widest">{title}</p>
    </motion.div>
  );
}

function QuickLink({ to, icon: Icon, label, color }: any) {
    const colors:any = {
        cyan: 'text-[#00D1C1] bg-[#00D1C1]/10 border-[#00D1C1]/20',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        pink: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
        rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    };
    return (
        <Link to={to} className="flex flex-col items-center gap-3 p-5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl hover:border-white/20 transition-all group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${colors[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
        </Link>
    );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="space-y-3">
          <Skeleton className="h-12 w-64 rounded-2xl" />
          <Skeleton className="h-6 w-96 rounded-2xl" />
        </div>
        <Skeleton className="h-20 w-64 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-44 w-full rounded-3xl" />)}
      </div>
      <div className="h-[400px] w-full rounded-3xl bg-[#1A1A1A]" />
    </div>
  );
}

function DashboardError({ error }: { error: string }) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-4xl font-black text-white mb-4">Command Center Offline</h2>
        <p className="text-[#A3A3A3] max-w-md mx-auto mb-10 text-lg leading-relaxed">We were unable to establish a secure connection to the primary node. {error}</p>
        <button onClick={() => window.location.reload()} className="px-12 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10">
          Retry Sync
        </button>
      </div>
    );
}
