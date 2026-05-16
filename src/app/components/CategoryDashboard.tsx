import { useState, useEffect } from 'react';
import { Plus, UserPlus, Mic2, Disc3, Music2, ArrowRight, Play, TrendingUp, Users, Radio, BookOpen, Theater, Feather } from 'lucide-react';
import { api, resolveMediaUrl } from '../api/client';
import { Skeleton } from './ui/skeleton';

interface CategoryDashboardProps {
  type: 'podcast' | 'audiobook' | 'audioplay' | 'poem';
  title: string;
  subtitle: string;
  onNavigate: (view: 'creators' | 'series' | 'items') => void;
}

export function CategoryDashboard({ type, title, subtitle, onNavigate }: CategoryDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const config = {
    podcast: { creator: 'Host', collection: 'Series', item: 'Episode', icon: Radio, color: 'emerald' },
    audiobook: { creator: 'Author', collection: 'Book', item: 'Chapter', icon: BookOpen, color: 'pink' },
    audioplay: { creator: 'Director', collection: 'Play', item: 'Act', icon: Theater, color: 'rose' },
    poem: { creator: 'Poet', collection: null, item: 'Poem', icon: Feather, color: 'purple' },
  }[type];

  useEffect(() => {
    // In a real app, we would fetch category-specific stats here
    setTimeout(() => setIsLoading(false), 500);
  }, [type]);

  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-2xl" />;

  const Icon = config.icon;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] p-8 md:p-12`}>
        <div className="relative z-10 max-w-2xl">
          <div className={`w-16 h-16 rounded-2xl bg-${config.color}-500/20 flex items-center justify-center mb-6 border border-${config.color}-500/30`}>
            <Icon className={`w-8 h-8 text-${config.color}-400`} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#F1F1F1] tracking-tight">{title}</h1>
          <p className="text-[#A3A3A3] mt-4 text-lg leading-relaxed">{subtitle}</p>
        </div>
        
        {/* Decorative background element */}
        <div className={`absolute top-0 right-0 w-96 h-96 bg-${config.color}-500/10 blur-[100px] -mr-32 -mt-32 rounded-full`}></div>
      </div>

      {/* Main Flow Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Creators */}
        <ActionCard 
          title={`Manage ${config.creator}s`}
          description={`Add and manage the ${config.creator.toLowerCase()}s who create your content.`}
          icon={UserPlus}
          color="blue"
          onClick={() => onNavigate('creators')}
        />

        {/* Step 2: Collections (Optional for Poems) */}
        {config.collection && (
          <ActionCard 
            title={`Manage ${config.collection}s`}
            description={`Organize your audio into ${config.collection.toLowerCase()} collections.`}
            icon={Disc3}
            color={config.color}
            onClick={() => onNavigate('series')}
          />
        )}

        {/* Step 3: Items */}
        <ActionCard 
          title={`Manage ${config.item}s`}
          description={`Upload and manage the individual audio files and narrations.`}
          icon={Music2}
          color="indigo"
          onClick={() => onNavigate('items')}
          className={!config.collection ? 'md:col-span-2' : ''}
        />
      </div>

      {/* category specific info - Placeholder for real metrics */}
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-8">
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#F1F1F1]">System Overview</h2>
            <div className="flex items-center gap-2 text-sm font-medium text-[#A3A3A3]">
                <Plus className="w-4 h-4" />
                <span>Live Data Coming Soon</span>
            </div>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem label={`Active ${config.item}s`} value="---" />
            <StatItem label={`Total ${config.creator}s`} value="---" />
            {config.collection && <StatItem label={`Total ${config.collection}s`} value="---" />}
            <StatItem label="Total Streams" value="---" />
         </div>
      </div>
    </div>
  );
}

function ActionCard({ title, description, icon: Icon, color, onClick, className = '' }: any) {
  const colors: any = {
    blue: 'from-blue-500/20 to-blue-600/5',
    emerald: 'from-emerald-500/20 to-emerald-600/5',
    pink: 'from-pink-500/20 to-pink-600/5',
    rose: 'from-rose-500/20 to-rose-600/5',
    indigo: 'from-indigo-500/20 to-indigo-600/5',
    purple: 'from-purple-500/20 to-purple-600/5',
  };

  const iconColors: any = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    pink: 'text-pink-400',
    rose: 'text-rose-400',
    indigo: 'text-indigo-400',
    purple: 'text-purple-400',
  };

  return (
    <button 
      onClick={onClick}
      className={`group relative p-8 bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl text-left transition-all hover:border-[#F1F1F1]/20 hover:shadow-2xl hover:shadow-black/50 overflow-hidden ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[color]} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="p-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl group-hover:scale-110 transition-transform">
            <Icon className={`w-8 h-8 ${iconColors[color]}`} />
          </div>
          <ArrowRight className="w-6 h-6 text-[#A3A3A3] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
        <h3 className="text-xl font-bold text-[#F1F1F1] mb-2">{title}</h3>
        <p className="text-[#A3A3A3] text-sm leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

function StatItem({ label, value }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-[#F1F1F1]">{value}</p>
    </div>
  );
}
