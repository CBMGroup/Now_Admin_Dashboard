import { useState } from 'react';
import { MediaLibrary } from '../components/MediaLibrary';
import { SeriesList } from '../components/SeriesList';
import { CategoryDashboard } from '../components/CategoryDashboard';
import { CreatorList } from '../components/CreatorList';
import { ArrowLeft } from 'lucide-react';

export function AudioBooks() {
  const [view, setView] = useState<'dashboard' | 'creators' | 'series' | 'items'>('dashboard');

  if (view === 'dashboard') {
    return (
      <CategoryDashboard 
        type="audiobook"
        title="Audiobooks Management"
        subtitle="Manage your book collections, authors, and narrations."
        onNavigate={setView}
      />
    );
  }

  return (
    <div className="space-y-6">
      {view === 'creators' && (
        <CreatorList 
          type="author"
          title="Authors"
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'series' && (
        <div className="space-y-6">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-[#A3A3A3] hover:text-[#F1F1F1] transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <SeriesList 
            type="audiobook"
            title="Audiobook Series"
            subtitle="Manage your book collections and authors"
            endpoint="/audiobook-series/"
          />
        </div>
      )}

      {view === 'items' && (
        <div className="space-y-6">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-[#A3A3A3] hover:text-[#F1F1F1] transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <MediaLibrary 
            category="Audiobooks" 
            title="Audiobook Chapters" 
            subtitle="Upload and manage individual chapters" 
            modalType="audiobook"
            customEndpoint="/audiobooks/"
          />
        </div>
      )}
    </div>
  );
}
