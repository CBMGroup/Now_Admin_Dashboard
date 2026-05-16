import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, ScatterChart, Scatter, ZAxis 
} from 'recharts';
import { 
  TrendingUp, Users, Music2, Play, Download, AlertCircle, 
  Activity, Clock, Globe, Zap, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { motion } from 'motion/react';
import { Skeleton } from '../components/ui/skeleton';

const COLORS = ['#00D1C1', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#10B981'];

export function Analytics() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch analytics data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) return <AnalyticsSkeleton />;
  if (error) return <AnalyticsError error={error} />;

  // Mock relationship data if not provided by backend
  const relationshipData = data.relationship_data || [
    { x: 180, y: 400, name: 'Pop Hit' },
    { x: 300, y: 1200, name: 'Podcast Ep' },
    { x: 120, y: 200, name: 'Short Poem' },
    { x: 450, y: 800, name: 'Audio Book Ch' },
    { x: 60, y: 50, name: 'Intro' },
    { x: 240, y: 950, name: 'Drama Act' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      {/* Header & Quick Insights */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#F1F1F1] tracking-tight">Intelligence Hub</h1>
          <p className="text-[#A3A3A3] mt-1 text-lg">Real-time platform performance & behavioral insights.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#2A2A2A] text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-black/20">
            <Download className="w-5 h-5" />
            Generate PDF
          </button>
        </div>
      </div>

      {/* Decision Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InsightCard 
            title="Retention Rate" 
            value="68.4%" 
            change="+4.2%" 
            trend="up" 
            icon={Users} 
            description="Users returning weekly"
        />
        <InsightCard 
            title="Avg. Session" 
            value="42m" 
            change="+12%" 
            trend="up" 
            icon={Clock} 
            description="Time spent per user"
        />
        <InsightCard 
            title="Global Reach" 
            value="124" 
            change="+3" 
            trend="up" 
            icon={Globe} 
            description="Countries with active streams"
        />
        <InsightCard 
            title="Processing Load" 
            value="14ms" 
            change="-2ms" 
            trend="up" 
            icon={Zap} 
            description="API response latency"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Analysis: Line Chart */}
        <ChartContainer title="Streaming Trends" subtitle="Playback volume over the last 30 days">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.streams_over_time}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#404040" 
                tick={{ fontSize: 10, fill: '#A3A3A3' }}
                tickFormatter={(d) => new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#404040" tick={{ fontSize: 10, fill: '#A3A3A3' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="streams"
                stroke="#8B5CF6"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#FFF' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Comparison: Bar Chart */}
        <ChartContainer title="Category Performance" subtitle="Comparison of engagement across media types">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.category_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
              <XAxis dataKey="category" stroke="#404040" tick={{ fontSize: 10, fill: '#A3A3A3' }} />
              <YAxis stroke="#404040" tick={{ fontSize: 10, fill: '#A3A3A3' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.category_distribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Relationship: Scatter Plot */}
        <ChartContainer title="Duration vs Engagement" subtitle="Correlation between track length and total plays">
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis type="number" dataKey="x" name="Duration" unit="s" stroke="#404040" tick={{ fontSize: 10, fill: '#A3A3A3' }} />
              <YAxis type="number" dataKey="y" name="Plays" stroke="#404040" tick={{ fontSize: 10, fill: '#A3A3A3' }} />
              <ZAxis type="category" dataKey="name" name="Track" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Scatter name="Tracks" data={relationshipData} fill="#00D1C1" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Breakdown: Pie Chart */}
        <ChartContainer title="Content Composition" subtitle="Proportional distribution of the library">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data.category_distribution}
                cx="50%"
                cy="45%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={8}
                dataKey="count"
                nameKey="category"
                stroke="none"
              >
                {data.category_distribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </motion.div>
  );
}

function ChartContainer({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) {
  return (
    <div className="bg-[#1A1A1A] rounded-3xl border border-[#2A2A2A] p-8 shadow-2xl hover:border-[#404040] transition-all">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-[#F1F1F1]">{title}</h3>
        <p className="text-sm text-[#A3A3A3] mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function InsightCard({ title, value, change, trend, icon: Icon, description }: any) {
  return (
    <div className="bg-[#1A1A1A] rounded-3xl border border-[#2A2A2A] p-6 hover:border-[#00D1C1]/30 transition-all group overflow-hidden relative">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl group-hover:bg-[#00D1C1]/10 group-hover:border-[#00D1C1]/20 transition-all">
          <Icon className="w-6 h-6 text-[#A3A3A3] group-hover:text-[#00D1C1]" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${trend === 'up' ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#EF4444] bg-[#EF4444]/10'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <h4 className="text-3xl font-black text-[#F1F1F1] mb-1 tracking-tight">{value}</h4>
      <p className="text-sm font-bold text-[#A3A3A3] uppercase tracking-widest text-[10px] mb-2">{title}</p>
      <p className="text-xs text-[#525252] font-medium">{description}</p>
      {/* Decorative background element */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-[#00D1C1]/0 to-[#00D1C1]/5 rounded-full blur-2xl" />
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded-xl shadow-2xl backdrop-blur-md bg-opacity-80">
        <p className="text-xs font-bold text-[#A3A3A3] uppercase tracking-widest mb-2">
            {label || payload[0].payload.name || payload[0].payload.category || 'Data Point'}
        </p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
            <p className="text-lg font-black text-white">
                {p.value.toLocaleString()} 
                <span className="text-xs font-normal text-[#A3A3A3] ml-1">{p.unit || p.name}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-6 w-96 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[450px] w-full rounded-3xl" />)}
      </div>
    </div>
  );
}

function AnalyticsError({ error }: { error: string }) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Data Interrupted</h2>
        <p className="text-[#A3A3A3] max-w-md mx-auto mb-8">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform">
          Re-establish Connection
        </button>
      </div>
    );
}
