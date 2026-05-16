import { useState } from 'react';
import { MediaLibrary } from '../components/MediaLibrary';
import { CategoryDashboard } from '../components/CategoryDashboard';
import { CreatorList } from '../components/CreatorList';
import { ArrowLeft } from 'lucide-react';

export function Poems() {
  const [view, setView] = useState<'dashboard' | 'creators' | 'items'>('dashboard');

  if (view === 'dashboard') {
    return (
      <CategoryDashboard 
        type="poem"
        title="Poems & Poetry"
        subtitle="Manage all spoken word and poetry tracks, and the poets who narrate them."
        onNavigate={(v) => setView(v === 'series' ? 'dashboard' : v)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {view === 'creators' && (
        <CreatorList 
          type="poet"
          title="Poets"
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'items' && (
        <div className="space-y-6">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-[#A3A3A3] hover:text-[#F1F1F1] transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <MediaLibrary 
            category="Poems" 
            title="Poems" 
            subtitle="Manage all poems and poetic narrations" 
            modalType="poem"
            customEndpoint="/poems/"
          />
        </div>
      )}
    </div>
  );
}
