import { useState } from 'react';
import { MediaLibrary } from '../components/MediaLibrary';
import { SeriesList } from '../components/SeriesList';
import { CategoryDashboard } from '../components/CategoryDashboard';
import { CreatorList } from '../components/CreatorList';
import { ArrowLeft } from 'lucide-react';

export function AudioPlays() {
  const [view, setView] = useState<'dashboard' | 'creators' | 'series' | 'items'>('dashboard');

  if (view === 'dashboard') {
    return (
      <CategoryDashboard 
        type="audioplay"
        title="Audio Plays Management"
        subtitle="The central hub for all your plays, directors, and acts."
        onNavigate={setView}
      />
    );
  }

  return (
    <div className="space-y-6">
      {view === 'creators' && (
        <CreatorList 
          type="director"
          title="Directors"
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'series' && (
        <div className="space-y-6">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-[#A3A3A3] hover:text-[#F1F1F1] transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <SeriesList 
            type="audioplay"
            title="Audio Plays"
            subtitle="Manage your plays and directors"
            endpoint="/audioplay-series/"
          />
        </div>
      )}

      {view === 'items' && (
        <div className="space-y-6">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-[#A3A3A3] hover:text-[#F1F1F1] transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <MediaLibrary 
            category="Audio Plays" 
            title="Play Acts" 
            subtitle="Manage acts and performances" 
            modalType="audioplay"
            customEndpoint="/audioplays/"
          />
        </div>
      )}
    </div>
  );
}
