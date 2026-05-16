import { useState } from 'react';
import { MediaLibrary } from '../components/MediaLibrary';
import { SeriesList } from '../components/SeriesList';
import { CategoryDashboard } from '../components/CategoryDashboard';
import { CreatorList } from '../components/CreatorList';
import { ArrowLeft } from 'lucide-react';

export function Podcasts() {
  const [view, setView] = useState<'dashboard' | 'creators' | 'series' | 'items'>('dashboard');

  if (view === 'dashboard') {
    return (
      <CategoryDashboard 
        type="podcast"
        title="Podcasts Management"
        subtitle="The central hub for all your podcast shows, hosts, and episodes."
        onNavigate={setView}
      />
    );
  }

  return (
    <div className="space-y-6">
      {view === 'creators' && (
        <CreatorList 
          type="host"
          title="Podcast Hosts"
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'series' && (
        <div className="space-y-6">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-[#A3A3A3] hover:text-[#F1F1F1] transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <SeriesList 
            type="podcast"
            title="Podcast Series"
            subtitle="Manage your podcast shows and collections"
            endpoint="/podcast-series/"
          />
        </div>
      )}

      {view === 'items' && (
        <div className="space-y-6">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-[#A3A3A3] hover:text-[#F1F1F1] transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <MediaLibrary 
            category="Podcast" 
            title="Podcast Episodes" 
            subtitle="Upload and manage show episodes" 
            modalType="podcast"
            customEndpoint="/podcasts/"
          />
        </div>
      )}
    </div>
  );
}
